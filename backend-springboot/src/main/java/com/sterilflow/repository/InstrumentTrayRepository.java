package com.sterilflow.repository;

import com.sterilflow.model.entity.InstrumentTray;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InstrumentTrayRepository extends JpaRepository<InstrumentTray, Long> {
    Optional<InstrumentTray> findByTrayId(String trayId);
    List<InstrumentTray> findByDepartment(String department);
    List<InstrumentTray> findByCurrentStatus(String currentStatus);
    
    @Query("SELECT COUNT(t) FROM InstrumentTray t WHERE t.currentStatus = 'STERILIZED'")
    long countSterilized();

    @Query("SELECT COUNT(t) FROM InstrumentTray t WHERE t.currentStatus = 'AWAITING_STERILIZATION'")
    long countAwaitingSterilization();

    @Query("SELECT COUNT(t) FROM InstrumentTray t WHERE t.currentStatus = 'IN_STERILIZATION'")
    long countInSterilization();
}
