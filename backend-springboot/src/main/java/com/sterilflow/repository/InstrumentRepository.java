package com.sterilflow.repository;

import com.sterilflow.model.entity.Instrument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InstrumentRepository extends JpaRepository<Instrument, Long> {
    Optional<Instrument> findByInstrumentCode(String code);
    List<Instrument> findBySterilizationStatus(String status);
    List<Instrument> findByType(String type);
}