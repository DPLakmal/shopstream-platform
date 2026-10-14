package com.shopstream.controller;

import com.shopstream.dto.ParsedFilterDto;
import com.shopstream.dto.SearchResponse;
import com.shopstream.service.AISearchQueryService;
import com.shopstream.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;
    private final AISearchQueryService aiSearchQueryService;

    public SearchController(SearchService searchService, AISearchQueryService aiSearchQueryService) {
        this.searchService = searchService;
        this.aiSearchQueryService = aiSearchQueryService;
    }

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "RELEVANCE") String sortBy,
            @RequestParam(defaultValue = "false") boolean aiMode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        SearchResponse response = searchService.search(
                q, category, brand, minPrice, maxPrice, minRating, inStock, sortBy, aiMode, page, size
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ai-parse")
    public ResponseEntity<ParsedFilterDto> parseQuery(@RequestBody Map<String, String> body) {
        String query = body.getOrDefault("query", "");
        ParsedFilterDto parsed = aiSearchQueryService.parseNaturalLanguageQuery(query);
        return ResponseEntity.ok(parsed);
    }

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> triggerReindex() {
        int count = searchService.reindexAll();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "indexedProducts", count,
                "message", "Elasticsearch catalog reindexed successfully"
        ));
    }
}
