package com.shopstream.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SearchResponse {
    private List<ProductDto> products = new ArrayList<>();
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private long searchLatencyMs;
    private ParsedFilterDto appliedFilters;
    private Map<String, Long> categoryFacets = new HashMap<>();
    private Map<String, Long> brandFacets = new HashMap<>();
    private BigDecimal minCatalogPrice;
    private BigDecimal maxCatalogPrice;

    public SearchResponse() {}

    public List<ProductDto> getProducts() { return products; }
    public void setProducts(List<ProductDto> products) { this.products = products; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    public long getSearchLatencyMs() { return searchLatencyMs; }
    public void setSearchLatencyMs(long searchLatencyMs) { this.searchLatencyMs = searchLatencyMs; }
    public ParsedFilterDto getAppliedFilters() { return appliedFilters; }
    public void setAppliedFilters(ParsedFilterDto appliedFilters) { this.appliedFilters = appliedFilters; }
    public Map<String, Long> getCategoryFacets() { return categoryFacets; }
    public void setCategoryFacets(Map<String, Long> categoryFacets) { this.categoryFacets = categoryFacets; }
    public Map<String, Long> getBrandFacets() { return brandFacets; }
    public void setBrandFacets(Map<String, Long> brandFacets) { this.brandFacets = brandFacets; }
    public BigDecimal getMinCatalogPrice() { return minCatalogPrice; }
    public void setMinCatalogPrice(BigDecimal minCatalogPrice) { this.minCatalogPrice = minCatalogPrice; }
    public BigDecimal getMaxCatalogPrice() { return maxCatalogPrice; }
    public void setMaxCatalogPrice(BigDecimal maxCatalogPrice) { this.maxCatalogPrice = maxCatalogPrice; }
}
