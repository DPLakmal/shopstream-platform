package com.shopstream.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopstream.dto.ParsedFilterDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class AISearchQueryServiceTest {

    private AISearchQueryService aiSearchQueryService;

    @BeforeEach
    void setUp() {
        aiSearchQueryService = new AISearchQueryService(new ObjectMapper());
    }

    @Test
    void testParsePriceUnderAndCategory() {
        String query = "noise cancelling headphones under $150";
        ParsedFilterDto result = aiSearchQueryService.parseNaturalLanguageQuery(query);

        assertNotNull(result);
        assertEquals(new BigDecimal("150"), result.getMaxPrice());
        assertEquals("Audio & Sound", result.getCategory());
        assertTrue(result.getTags().contains("noise-cancelling") || result.getTags().contains("wireless") || result.getSearchTerm().contains("noise"));
    }

    @Test
    void testParsePriceBetweenAndBrand() {
        String query = "SoundFlow earbuds between $50 and $100 in stock";
        ParsedFilterDto result = aiSearchQueryService.parseNaturalLanguageQuery(query);

        assertNotNull(result);
        assertEquals(new BigDecimal("50"), result.getMinPrice());
        assertEquals(new BigDecimal("100"), result.getMaxPrice());
        assertEquals("SoundFlow", result.getBrand());
        assertEquals("Audio & Sound", result.getCategory());
        assertTrue(Boolean.TRUE.equals(result.getInStockOnly()));
    }

    @Test
    void testParseTopRatedAndCheapSort() {
        String query = "cheapest top rated waterproof running shoes";
        ParsedFilterDto result = aiSearchQueryService.parseNaturalLanguageQuery(query);

        assertNotNull(result);
        assertEquals("PRICE_ASC", result.getSortBy());
        assertEquals(new BigDecimal("4.5"), result.getMinRating());
        assertEquals("Apparel & Footwear", result.getCategory());
        assertTrue(result.getTags().contains("waterproof"));
    }
}
