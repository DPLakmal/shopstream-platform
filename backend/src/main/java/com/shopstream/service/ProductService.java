package com.shopstream.service;

import com.shopstream.dto.CategoryDto;
import com.shopstream.dto.ProductDto;
import com.shopstream.dto.ProductImageDto;
import com.shopstream.entity.Category;
import com.shopstream.entity.Product;
import com.shopstream.entity.ProductImage;
import com.shopstream.exception.ResourceNotFoundException;
import com.shopstream.repository.CategoryRepository;
import com.shopstream.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<ProductDto> getActiveProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable).map(this::toDto);
    }

    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return toDto(product);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toDto(product);
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
    }

    public CategoryDto toCategoryDto(Category category) {
        if (category == null) return null;
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIconName()
        );
    }

    public ProductDto toDto(Product p) {
        if (p == null) return null;
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setSku(p.getSku());
        dto.setTitle(p.getTitle());
        dto.setSlug(p.getSlug());
        dto.setDescription(p.getDescription());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
            dto.setCategorySlug(p.getCategory().getSlug());
        }
        dto.setBrand(p.getBrand());
        dto.setBasePrice(p.getBasePrice());
        dto.setSalePrice(p.getSalePrice());
        dto.setEffectivePrice(p.getEffectivePrice());
        dto.setStockQuantity(p.getStockQuantity());
        dto.setRating(p.getRating());
        dto.setReviewCount(p.getReviewCount());
        dto.setIsActive(p.getIsActive());
        dto.setIsFeatured(p.getIsFeatured());
        dto.setAttributes(p.getAttributes());

        if (p.getTags() != null && !p.getTags().isBlank()) {
            dto.setTags(Arrays.stream(p.getTags().replace("{", "").replace("}", "").split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList()));
        }

        if (p.getImages() != null && !p.getImages().isEmpty()) {
            List<ProductImageDto> imageDtos = p.getImages().stream()
                    .map(this::toImageDto)
                    .collect(Collectors.toList());
            dto.setImages(imageDtos);
            dto.setPrimaryImageUrl(imageDtos.get(0).getImageUrl());
        }

        return dto;
    }

    public ProductImageDto toImageDto(ProductImage img) {
        if (img == null) return null;
        return new ProductImageDto(
                img.getId(),
                img.getImageUrl(),
                img.getAltText(),
                img.getIsPrimary(),
                img.getSortOrder()
        );
    }
}
