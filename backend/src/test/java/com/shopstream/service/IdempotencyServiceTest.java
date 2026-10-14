package com.shopstream.service;

import com.shopstream.entity.IdempotencyRecord;
import com.shopstream.exception.DuplicateRequestException;
import com.shopstream.repository.IdempotencyRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class IdempotencyServiceTest {

    private IdempotencyRecordRepository repository;
    private IdempotencyService idempotencyService;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(IdempotencyRecordRepository.class);
        idempotencyService = new IdempotencyService(repository);
    }

    @Test
    void testAcquireLockNewKey() {
        when(repository.findByIdempotencyKey("key-123")).thenReturn(Optional.empty());

        boolean acquired = idempotencyService.acquireLock("key-123", "PAYMENT", Duration.ofMinutes(5));
        assertTrue(acquired);
        verify(repository, times(1)).save(any(IdempotencyRecord.class));
    }

    @Test
    void testAcquireLockAlreadyCompleted() {
        IdempotencyRecord completed = new IdempotencyRecord("key-completed", "PAYMENT", OffsetDateTime.now().plusHours(1));
        completed.setStatus("COMPLETED");
        when(repository.findByIdempotencyKey("key-completed")).thenReturn(Optional.of(completed));

        boolean acquired = idempotencyService.acquireLock("key-completed", "PAYMENT", Duration.ofMinutes(5));
        assertFalse(acquired, "Should return false to signal that the key was already completed");
    }

    @Test
    void testAcquireLockConcurrentProcessingThrowsDuplicateException() {
        IdempotencyRecord processing = new IdempotencyRecord("key-processing", "PAYMENT", OffsetDateTime.now().plusMinutes(5));
        processing.setStatus("PROCESSING");
        when(repository.findByIdempotencyKey("key-processing")).thenReturn(Optional.of(processing));

        assertThrows(DuplicateRequestException.class, () -> {
            idempotencyService.acquireLock("key-processing", "PAYMENT", Duration.ofMinutes(5));
        });
    }
}
