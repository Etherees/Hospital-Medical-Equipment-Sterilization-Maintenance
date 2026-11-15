package com.sterilflow.service;

import com.sterilflow.model.entity.Instrument;
import com.sterilflow.model.entity.InstrumentTray;
import com.sterilflow.repository.InstrumentRepository;
import com.sterilflow.repository.InstrumentTrayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InstrumentTrayService {

    @Autowired
    private InstrumentTrayRepository trayRepository;

    @Autowired
    private InstrumentRepository instrumentRepository;

    public List<InstrumentTray> getAllTrays() {
        return trayRepository.findAll();
    }

    public Optional<InstrumentTray> getTrayByCode(String trayId) {
        return trayRepository.findByTrayId(trayId);
    }

    public List<InstrumentTray> getTraysByDepartment(String department) {
        return trayRepository.findByDepartment(department);
    }

    @Transactional
    public Instrument updateInstrumentStatus(String instrumentCode, String sterilizationStatus, String contaminationStatus) {
        Instrument inst = instrumentRepository.findByInstrumentCode(instrumentCode)
                .orElseThrow(() -> new RuntimeException("Instrument not found: " + instrumentCode));
        if (sterilizationStatus != null) {
            inst.setSterilizationStatus(sterilizationStatus);
        }
        if (contaminationStatus != null) {
            inst.setContaminationStatus(contaminationStatus);
        }
        return instrumentRepository.save(inst);
    }

    @Transactional
    public InstrumentTray saveTray(InstrumentTray tray) {
        return trayRepository.save(tray);
    }
}