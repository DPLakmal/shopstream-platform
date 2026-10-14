package com.shopstream.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

import java.time.Duration;

@Configuration
@EnableElasticsearchRepositories(basePackages = "com.shopstream.search")
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    private static final Logger log = LoggerFactory.getLogger(ElasticsearchConfig.class);

    @Value("${spring.data.elasticsearch.uris:http://localhost:9200}")
    private String elasticsearchUris;

    @Override
    public ClientConfiguration clientConfiguration() {
        String hostAndPort = elasticsearchUris.replace("http://", "").replace("https://", "");
        log.info("Configuring Elasticsearch client with host: {}", hostAndPort);

        return ClientConfiguration.builder()
                .connectedTo(hostAndPort)
                .withConnectTimeout(Duration.ofMillis(2000))
                .withSocketTimeout(Duration.ofMillis(3000))
                .build();
    }
}
