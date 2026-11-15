package com.sterilflow.repository;

import com.sterilflow.model.entity.SterilizationCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SterilizationCycleRepository extends JpaRepository<SterilizationCycle, Long> {
    Optional<SterilizationCycle> findByCycleNumber(String cycleNumber);
    List<SterilizationCycle> findByAutoclaveIdOrderByStartedAtDesc(String autoclaveId);
    List<SterilizationCycle> findAllByOrderByStartedAtDesc();
    
    @Query("SELECT COUNT(c) FROM SterilizationCycle c WHERE c.status = 'COMPLETED'")
    long countCompletedCycles();

    @Query("SELECT COUNT(c) FROM SterilizationCycle c WHERE c.status = 'FAILED'")
    long countFailedCycles();
}