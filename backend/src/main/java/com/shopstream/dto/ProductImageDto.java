package com.shopstream.dto;

public class ProductImageDto {
    private Long id;
    private String imageUrl;
    private String altText;
    private Boolean isPrimary;
    private Integer sortOrder;

    public ProductImageDto() {}

    public ProductImageDto(Long id, String imageUrl, String altText, Boolean isPrimary, Integer sortOrder) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.isPrimary = isPrimary;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
