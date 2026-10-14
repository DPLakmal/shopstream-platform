package com.shopstream.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ParsedFilterDto {
    private String originalQuery;
    private String searchTerm;
    private String category;
    private String brand;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minRating;
    private Boolean inStockOnly;
    private String sortBy = "RELEVANCE";
    private List<String> tags = new ArrayList<>();
    private String detectedIntent;
    private double confidence = 1.0;
    private String parserType = "HYBRID_NLP";

    public ParsedFilterDto() {}

    public String getOriginalQuery() { return originalQuery; }
    public void setOriginalQuery(String originalQuery) { this.originalQuery = originalQuery; }
    public String getSearchTerm() { return searchTerm; }
    public void setSearchTerm(String searchTerm) { this.searchTerm = searchTerm; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    public BigDecimal getMinRating() { return minRating; }
    public void setMinRating(BigDecimal minRating) { this.minRating = minRating; }
    public Boolean getInStockOnly() { return inStockOnly; }
    public void setInStockOnly(Boolean inStockOnly) { this.inStockOnly = inStockOnly; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getDetectedIntent() { return detectedIntent; }
    public void setDetectedIntent(String detectedIntent) { this.detectedIntent = detectedIntent; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public String getParserType() { return parserType; }
    public void setParserType(String parserType) { this.parserType = parserType; }
}
