package com.shopstream.service;

import com.shopstream.entity.IdempotencyRecord;
import com.shopstream.exception.DuplicateRequestException;
import com.shopstream.repository.IdempotencyRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);

    private final IdempotencyRecordRepository repository;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // Resilient local lock map if Redis is not running in sandbox
    private final ConcurrentHashMap<String, String> localLocks = new ConcurrentHashMap<>();

    public IdempotencyService(IdempotencyRecordRepository repository) {
        this.repository = repository;
    }

    /**
     * Attempts to acquire an idempotency lock for the specified key.
     * Throws DuplicateRequestException if the key is actively being processed or completed.
     */
    @Transactional
    public boolean acquireLock(String idempotencyKey, String resourceType, Duration ttl) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return true; // No key provided, bypass
        }

        String lockKey = "idemp:" + idempotencyKey;

        // 1. Try Redis distributed lock if available
        if (redisTemplate != null) {
            try {
                Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "PROCESSING", ttl);
                if (Boolean.FALSE.equals(acquired)) {
                    log.warn("Redis idempotency lock rejected for key: {}", idempotencyKey);
                    throw new DuplicateRequestException("Duplicate request in progress for key: " + idempotencyKey);
                }
            } catch (DuplicateRequestException e) {
                throw e;
            } catch (Exception ex) {
                log.warn("Redis unavailable for idempotency lock, falling back to database: {}", ex.getMessage());
            }
        }

        // 2. Check Database record
        Optional<IdempotencyRecord> recordOpt = repository.findByIdempotencyKey(idempotencyKey);
        if (recordOpt.isPresent()) {
            IdempotencyRecord record = recordOpt.get();
            if ("COMPLETED".equals(record.getStatus())) {
                log.info("Idempotency key already completed: {}", idempotencyKey);
                return false; // Already executed successfully
            }
            if ("PROCESSING".equals(record.getStatus()) && record.getExpiresAt().isAfter(OffsetDateTime.now())) {
                throw new DuplicateRequestException("Request currently processing for key: " + idempotencyKey);
            }
        }

        // 3. Fallback memory check
        if (localLocks.putIfAbsent(idempotencyKey, "PROCESSING") != null) {
            throw new DuplicateRequestException("Concurrent request blocked for key: " + idempotencyKey);
        }

        // Save processing record in DB
        IdempotencyRecord newRecord = recordOpt.orElseGet(() ->
                new IdempotencyRecord(idempotencyKey, resourceType, OffsetDateTime.now().plus(ttl)));
        newRecord.setStatus("PROCESSING");
        newRecord.setExpiresAt(OffsetDateTime.now().plus(ttl));
        repository.save(newRecord);

        return true;
    }

    @Transactional
    public void markSuccess(String idempotencyKey, int responseCode, String responseBody) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) return;

        localLocks.remove(idempotencyKey);

        Optional<IdempotencyRecord> recordOpt = repository.findByIdempotencyKey(idempotencyKey);
        if (recordOpt.isPresent()) {
            IdempotencyRecord record = recordOpt.get();
            record.setStatus("COMPLETED");
            record.setResponseCode(responseCode);
            record.setResponseBody(responseBody);
            repository.save(record);
        }

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set("idemp:" + idempotencyKey, "COMPLETED", Duration.ofHours(24));
            } catch (Exception ignored) {}
        }
    }

    @Transactional
    public void releaseLock(String idempotencyKey) {
        if (idempotencyKey == null) return;
        localLocks.remove(idempotencyKey);
        if (redisTemplate != null) {
            try {
                redisTemplate.delete("idemp:" + idempotencyKey);
            } catch (Exception ignored) {}
        }
        repository.findByIdempotencyKey(idempotencyKey).ifPresent(r -> {
            if ("PROCESSING".equals(r.getStatus())) {
                repository.delete(r);
            }
        });
    }

    @Transactional(readOnly = true)
    public Optional<IdempotencyRecord> getRecord(String idempotencyKey) {
        if (idempotencyKey == null) return Optional.empty();
        return repository.findByIdempotencyKey(idempotencyKey);
    }
}
