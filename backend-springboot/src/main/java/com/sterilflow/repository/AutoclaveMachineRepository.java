package com.sterilflow.repository;

import com.sterilflow.model.entity.AutoclaveMachine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AutoclaveMachineRepository extends JpaRepository<AutoclaveMachine, Long> {
    Optional<AutoclaveMachine> findByMachineCode(String machineCode);
    List<AutoclaveMachine> findByIsAvailableTrue();
}