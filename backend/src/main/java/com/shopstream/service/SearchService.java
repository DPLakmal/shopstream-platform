package com.shopstream.service;

import com.shopstream.dto.ParsedFilterDto;
import com.shopstream.dto.ProductDto;
import com.shopstream.dto.SearchResponse;
import com.shopstream.entity.Product;
import com.shopstream.repository.ProductRepository;
import com.shopstream.search.ProductDocument;
import com.shopstream.search.ProductElasticsearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final ProductRepository productRepository;
    private final AISearchQueryService aiSearchQueryService;
    private final ProductService productService;

    @Autowired(required = false)
    private ProductElasticsearchRepository elasticsearchRepository;

    public SearchService(ProductRepository productRepository,
                         AISearchQueryService aiSearchQueryService,
                         ProductService productService) {
        this.productRepository = productRepository;
        this.aiSearchQueryService = aiSearchQueryService;
        this.productService = productService;
    }

    public SearchResponse search(String query,
                                 String category,
                                 String brand,
                                 BigDecimal minPrice,
                                 BigDecimal maxPrice,
                                 BigDecimal minRating,
                                 Boolean inStock,
                                 String sortBy,
                                 boolean aiMode,
                                 int page,
                                 int size) {
        long startTime = System.currentTimeMillis();
        ParsedFilterDto appliedFilter = null;

        // If AI search mode is toggled, decompose query using AI / NLP parser
        if (aiMode && query != null && !query.trim().isEmpty()) {
            appliedFilter = aiSearchQueryService.parseNaturalLanguageQuery(query);
            if (category == null && appliedFilter.getCategory() != null) {
                category = appliedFilter.getCategory();
            }
            if (brand == null && appliedFilter.getBrand() != null) {
                brand = appliedFilter.getBrand();
            }
            if (maxPrice == null && appliedFilter.getMaxPrice() != null) {
                maxPrice = appliedFilter.getMaxPrice();
            }
            if (minPrice == null && appliedFilter.getMinPrice() != null) {
                minPrice = appliedFilter.getMinPrice();
            }
            if (minRating == null && appliedFilter.getMinRating() != null) {
                minRating = appliedFilter.getMinRating();
            }
            if (inStock == null && appliedFilter.getInStockOnly() != null) {
                inStock = appliedFilter.getInStockOnly();
            }
            if (sortBy == null || sortBy.equals("RELEVANCE")) {
                sortBy = appliedFilter.getSortBy();
            }
            if (appliedFilter.getSearchTerm() != null && !appliedFilter.getSearchTerm().isBlank()) {
                query = appliedFilter.getSearchTerm();
            }
        }

        // Determine sorting
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("PRICE_ASC".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "basePrice");
        } else if ("PRICE_DESC".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "basePrice");
        } else if ("RATING_DESC".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "rating");
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // Execute search with fallback resilience
        List<ProductDto> results;
        long totalCount;
        int totalPages;

        try {
            // Attempt Elasticsearch if available
            if (elasticsearchRepository != null) {
                // Here we would run Elasticsearch queries; if ES repository fails or is offline, fallback cleanly
            }
            // Fallback / Standard robust repository query
            Page<Product> productPage = queryCatalog(query, category, brand, minPrice, maxPrice, minRating, inStock, pageable);
            results = productPage.getContent().stream()
                    .map(productService::toDto)
                    .collect(Collectors.toList());
            totalCount = productPage.getTotalElements();
            totalPages = productPage.getTotalPages();
        } catch (Exception ex) {
            log.warn("Search execution encountered exception, falling back to all active products: {}", ex.getMessage());
            Page<Product> fallbackPage = productRepository.findByIsActiveTrue(pageable);
            results = fallbackPage.getContent().stream().map(productService::toDto).collect(Collectors.toList());
            totalCount = fallbackPage.getTotalElements();
            totalPages = fallbackPage.getTotalPages();
        }

        long latency = System.currentTimeMillis() - startTime;

        SearchResponse response = new SearchResponse();
        response.setProducts(results);
        response.setTotalElements(totalCount);
        response.setTotalPages(totalPages);
        response.setCurrentPage(page);
        response.setPageSize(size);
        response.setSearchLatencyMs(latency);
        response.setAppliedFilters(appliedFilter);

        // Compute Facets dynamically across catalog
        populateFacets(response);

        return response;
    }

    private Page<Product> queryCatalog(String query, String category, String brand,
                                       BigDecimal minPrice, BigDecimal maxPrice,
                                       BigDecimal minRating, Boolean inStock, Pageable pageable) {
        List<Product> all = productRepository.findAll();
        List<Product> filtered = all.stream()
                .filter(Product::getIsActive)
                .filter(p -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.toLowerCase();
                    boolean matchTitle = p.getTitle() != null && p.getTitle().toLowerCase().contains(q);
                    boolean matchDesc = p.getDescription() != null && p.getDescription().toLowerCase().contains(q);
                    boolean matchBrand = p.getBrand() != null && p.getBrand().toLowerCase().contains(q);
                    boolean matchTags = p.getTags() != null && p.getTags().toLowerCase().contains(q);
                    return matchTitle || matchDesc || matchBrand || matchTags;
                })
                .filter(p -> category == null || (p.getCategory() != null && (
                        p.getCategory().getName().equalsIgnoreCase(category) ||
                        p.getCategory().getSlug().equalsIgnoreCase(category))))
                .filter(p -> brand == null || (p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand)))
                .filter(p -> minPrice == null || p.getEffectivePrice().compareTo(minPrice) >= 0)
                .filter(p -> maxPrice == null || p.getEffectivePrice().compareTo(maxPrice) <= 0)
                .filter(p -> minRating == null || p.getRating().compareTo(minRating) >= 0)
                .filter(p -> inStock == null || !inStock || p.getStockQuantity() > 0)
                .collect(Collectors.toList());

        // Apply sorting
        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            if (order.getProperty().equalsIgnoreCase("basePrice")) {
                filtered.sort(Comparator.comparing(Product::getEffectivePrice));
                if (order.isDescending()) Collections.reverse(filtered);
            } else if (order.getProperty().equalsIgnoreCase("rating")) {
                filtered.sort(Comparator.comparing(Product::getRating).reversed());
            }
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<Product> pageContent = (start <= end && start < filtered.size()) ? filtered.subList(start, end) : Collections.emptyList();

        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());
    }

    private void populateFacets(SearchResponse response) {
        List<Product> allActive = productRepository.findAll().stream().filter(Product::getIsActive).toList();
        Map<String, Long> catFacets = new HashMap<>();
        Map<String, Long> brandFacets = new HashMap<>();
        BigDecimal min = BigDecimal.valueOf(Double.MAX_VALUE);
        BigDecimal max = BigDecimal.ZERO;

        for (Product p : allActive) {
            if (p.getCategory() != null) {
                catFacets.put(p.getCategory().getName(), catFacets.getOrDefault(p.getCategory().getName(), 0L) + 1);
            }
            if (p.getBrand() != null) {
                brandFacets.put(p.getBrand(), brandFacets.getOrDefault(p.getBrand(), 0L) + 1);
            }
            if (p.getEffectivePrice().compareTo(min) < 0) min = p.getEffectivePrice();
            if (p.getEffectivePrice().compareTo(max) > 0) max = p.getEffectivePrice();
        }

        response.setCategoryFacets(catFacets);
        response.setBrandFacets(brandFacets);
        response.setMinCatalogPrice(min.compareTo(BigDecimal.valueOf(Double.MAX_VALUE)) == 0 ? BigDecimal.ZERO : min);
        response.setMaxCatalogPrice(max);
    }

    public int reindexAll() {
        List<Product> products = productRepository.findAll();
        int indexedCount = 0;
        if (elasticsearchRepository != null) {
            try {
                for (Product p : products) {
                    ProductDocument doc = new ProductDocument();
                    doc.setId(String.valueOf(p.getId()));
                    doc.setTitle(p.getTitle());
                    doc.setSlug(p.getSlug());
                    doc.setDescription(p.getDescription());
                    doc.setBrand(p.getBrand());
                    if (p.getCategory() != null) {
                        doc.setCategory(p.getCategory().getName());
                        doc.setCategorySlug(p.getCategory().getSlug());
                    }
                    doc.setBasePrice(p.getBasePrice().doubleValue());
                    doc.setSalePrice(p.getSalePrice() != null ? p.getSalePrice().doubleValue() : null);
                    doc.setEffectivePrice(p.getEffectivePrice().doubleValue());
                    doc.setStockQuantity(p.getStockQuantity());
                    doc.setRating(p.getRating().doubleValue());
                    doc.setReviewCount(p.getReviewCount());
                    doc.setIsActive(p.getIsActive());
                    doc.setIsFeatured(p.getIsFeatured());
                    if (p.getImages() != null && !p.getImages().isEmpty()) {
                        doc.setPrimaryImageUrl(p.getImages().get(0).getImageUrl());
                    }
                    elasticsearchRepository.save(doc);
                    indexedCount++;
                }
            } catch (Exception e) {
                log.warn("Elasticsearch indexing partial failure: {}", e.getMessage());
            }
        }
        return indexedCount;
    }
}
