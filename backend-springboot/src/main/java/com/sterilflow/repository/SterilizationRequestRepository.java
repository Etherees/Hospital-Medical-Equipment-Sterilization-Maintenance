package com.sterilflow.repository;

import com.sterilflow.model.entity.SterilizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SterilizationRequestRepository extends JpaRepository<SterilizationRequest, Long> {
    Optional<SterilizationRequest> findByRequestId(String requestId);
    Optional<SterilizationRequest> findByProcessInstanceId(String processInstanceId);
    List<SterilizationRequest> findByStatusOrderByStartedAtDesc(String status);
    List<SterilizationRequest> findAllByOrderByStartedAtDesc();
    
    @Query("SELECT COUNT(r) FROM SterilizationRequest r WHERE r.status = 'IN_PROGRESS'")
    long countInProgress();

    @Query("SELECT COUNT(r) FROM SterilizationRequest r WHERE r.status IN ('FAILED', 'QUARANTINED')")
    long countFailedOrQuarantined();
}