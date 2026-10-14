package com.shopstream.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopstream.dto.ParsedFilterDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AISearchQueryService {

    private static final Logger log = LoggerFactory.getLogger(AISearchQueryService.class);
    private final ObjectMapper objectMapper;

    @Value("${shopstream.ai.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${shopstream.ai.model:gemini-1.5-flash}")
    private String aiModel;

    @Value("${shopstream.ai.fallback-enabled:true}")
    private boolean fallbackEnabled;

    // Known categories and brands for heuristic extraction
    private static final Map<String, String> CATEGORY_MAP = Map.of(
            "headphone", "Audio & Sound",
            "earbud", "Audio & Sound",
            "audio", "Audio & Sound",
            "speaker", "Audio & Sound",
            "laptop", "Electronics",
            "computer", "Electronics",
            "mouse", "Electronics",
            "keyboard", "Electronics",
            "watch", "Wearables & Smartwatches",
            "smartwatch", "Wearables & Smartwatches",
            "tracker", "Wearables & Smartwatches",
            "shoe", "Apparel & Footwear",
            "jacket", "Apparel & Footwear",
            "hoodie", "Apparel & Footwear",
            "espresso", "Home & Smart Living",
            "coffee", "Home & Smart Living",
            "air purifier", "Home & Smart Living"
    );

    private static final List<String> KNOWN_BRANDS = List.of(
            "SoundFlow", "PulseAudio", "ApexTech", "ForgeLabs", "Chronos", "PulseFit", "TerraGear", "BaristaCraft", "CleanAir"
    );

    public AISearchQueryService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ParsedFilterDto parseNaturalLanguageQuery(String naturalQuery) {
        if (naturalQuery == null || naturalQuery.trim().isEmpty()) {
            return new ParsedFilterDto();
        }

        String cleaned = naturalQuery.trim();

        // If Gemini API Key is configured, attempt LLM call
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                ParsedFilterDto llmResult = callGeminiParser(cleaned);
                if (llmResult != null) {
                    return llmResult;
                }
            } catch (Exception e) {
                log.warn("Gemini AI parse failed, falling back to local NLP parser: {}", e.getMessage());
            }
        }

        // Hybrid NLP heuristic parser
        return parseWithLocalNlp(cleaned);
    }

    private ParsedFilterDto parseWithLocalNlp(String query) {
        ParsedFilterDto parsed = new ParsedFilterDto();
        parsed.setOriginalQuery(query);
        parsed.setParserType("HYBRID_NLP");

        String workingQuery = query.toLowerCase();
        List<String> tags = new ArrayList<>();

        // 1. Price extraction: "between $50 and $150"
        Pattern betweenPattern = Pattern.compile("between\\s*\\$?([0-9]+(?:\\.[0-9]{1,2})?)\\s*(?:and|to|-)\\s*\\$?([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);
        Matcher betweenMatcher = betweenPattern.matcher(workingQuery);
        if (betweenMatcher.find()) {
            try {
                parsed.setMinPrice(new BigDecimal(betweenMatcher.group(1)));
                parsed.setMaxPrice(new BigDecimal(betweenMatcher.group(2)));
                workingQuery = betweenMatcher.replaceFirst(" ");
            } catch (Exception ignored) {}
        }

        // Price extraction: "under $150", "below 100", "less than $80", "cheaper than 50"
        Pattern underPattern = Pattern.compile("(?:under|below|less than|cheaper than|max|up to)\\s*\\$?([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);
        Matcher underMatcher = underPattern.matcher(workingQuery);
        if (underMatcher.find()) {
            try {
                parsed.setMaxPrice(new BigDecimal(underMatcher.group(1)));
                workingQuery = underMatcher.replaceFirst(" ");
            } catch (Exception ignored) {}
        }

        // Price extraction: "over $50", "above $100", "more than 200", "min 100"
        Pattern overPattern = Pattern.compile("(?:over|above|more than|at least|min)\\s*\\$?([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);
        Matcher overMatcher = overPattern.matcher(workingQuery);
        if (overMatcher.find()) {
            try {
                parsed.setMinPrice(new BigDecimal(overMatcher.group(1)));
                workingQuery = overMatcher.replaceFirst(" ");
            } catch (Exception ignored) {}
        }

        // 2. Rating extraction: "top rated", "best rated", "5 star", "high rating", "rating > 4"
        if (workingQuery.contains("top rated") || workingQuery.contains("best rated") || workingQuery.contains("highly rated")) {
            parsed.setMinRating(new BigDecimal("4.5"));
            workingQuery = workingQuery.replace("top rated", "").replace("best rated", "").replace("highly rated", "");
        } else if (workingQuery.contains("5 star") || workingQuery.contains("5-star")) {
            parsed.setMinRating(new BigDecimal("4.8"));
            workingQuery = workingQuery.replace("5 star", "").replace("5-star", "");
        } else if (workingQuery.contains("4 star") || workingQuery.contains("4-star")) {
            parsed.setMinRating(new BigDecimal("4.0"));
            workingQuery = workingQuery.replace("4 star", "").replace("4-star", "");
        }

        // 3. Sorting extraction
        if (workingQuery.contains("cheap") || workingQuery.contains("cheapest") || workingQuery.contains("low price") || workingQuery.contains("affordable")) {
            parsed.setSortBy("PRICE_ASC");
            workingQuery = workingQuery.replace("cheap", "").replace("cheapest", "").replace("low price", "").replace("affordable", "");
        } else if (workingQuery.contains("expensive") || workingQuery.contains("high price") || workingQuery.contains("premium")) {
            parsed.setSortBy("PRICE_DESC");
            tags.add("premium");
        } else if (workingQuery.contains("best") || workingQuery.contains("top")) {
            parsed.setSortBy("RATING_DESC");
        }

        // 4. Stock requirement
        if (workingQuery.contains("in stock") || workingQuery.contains("available now")) {
            parsed.setInStockOnly(true);
            workingQuery = workingQuery.replace("in stock", "").replace("available now", "");
        }

        // 5. Category detection
        for (Map.Entry<String, String> entry : CATEGORY_MAP.entrySet()) {
            if (workingQuery.contains(entry.getKey())) {
                parsed.setCategory(entry.getValue());
                break;
            }
        }

        // 6. Brand detection
        for (String brand : KNOWN_BRANDS) {
            if (workingQuery.contains(brand.toLowerCase())) {
                parsed.setBrand(brand);
                workingQuery = workingQuery.replace(brand.toLowerCase(), " ");
                break;
            }
        }

        // 7. Feature tags extraction (waterproof, wireless, bluetooth, running, gym, gaming, titanium)
        List<String> candidateTags = List.of("waterproof", "wireless", "bluetooth", "noise-cancelling", "gym", "running", "gaming", "titanium", "outdoor", "smart", "black", "white", "blue");
        for (String tag : candidateTags) {
            if (workingQuery.contains(tag)) {
                tags.add(tag);
            }
        }
        parsed.setTags(tags);

        // 8. Clean residual search keywords
        String cleanedKeywords = workingQuery
                .replaceAll("\\b(for|with|and|the|a|an|in|of|by|to|items|products|looking|find|show|me)\\b", " ")
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        parsed.setSearchTerm(cleanedKeywords.isEmpty() ? query : cleanedKeywords);

        // Build human-friendly explanation of detected intent
        StringBuilder intentDesc = new StringBuilder("Intent: ");
        if (parsed.getCategory() != null) intentDesc.append("Category [").append(parsed.getCategory()).append("] ");
        if (parsed.getBrand() != null) intentDesc.append("Brand [").append(parsed.getBrand()).append("] ");
        if (parsed.getMaxPrice() != null) intentDesc.append("Price <= $").append(parsed.getMaxPrice()).append(" ");
        if (parsed.getMinPrice() != null) intentDesc.append("Price >= $").append(parsed.getMinPrice()).append(" ");
        if (parsed.getMinRating() != null) intentDesc.append("Rating >= ").append(parsed.getMinRating()).append(" ");
        if (!tags.isEmpty()) intentDesc.append("Tags ").append(tags).append(" ");
        parsed.setDetectedIntent(intentDesc.toString().trim());

        return parsed;
    }

    private ParsedFilterDto callGeminiParser(String query) throws Exception {
        String prompt = "You are an e-commerce search parser. Convert this natural shopping query into JSON: \"" + query + "\". "
                + "Return JSON only with keys: searchTerm (string), category (string), brand (string), minPrice (number or null), "
                + "maxPrice (number or null), minRating (number or null), inStockOnly (boolean or null), sortBy (string: RELEVANCE, PRICE_ASC, PRICE_DESC, RATING_DESC), "
                + "tags (array of strings), detectedIntent (string). Do not wrap in markdown or backticks.";

        String urlString = "https://generativelanguage.googleapis.com/v1beta/models/" + aiModel + ":generateContent?key=" + geminiApiKey;
        URL url = URI.create(urlString).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(3000);
        conn.setReadTimeout(5000);

        String jsonPayload = objectMapper.writeValueAsString(Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        ));

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
        }

        if (conn.getResponseCode() == 200) {
            JsonNode root = objectMapper.readTree(conn.getInputStream());
            String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            responseText = responseText.replace("```json", "").replace("```", "").trim();
            ParsedFilterDto parsed = objectMapper.readValue(responseText, ParsedFilterDto.class);
            parsed.setOriginalQuery(query);
            parsed.setParserType("LLM");
            return parsed;
        }

        return null;
    }
}
