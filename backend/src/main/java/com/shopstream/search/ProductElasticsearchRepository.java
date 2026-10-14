package com.shopstream.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductElasticsearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    List<ProductDocument> findByTitleContainingIgnoreCase(String title);
    List<ProductDocument> findByCategoryIgnoreCase(String category);
}
