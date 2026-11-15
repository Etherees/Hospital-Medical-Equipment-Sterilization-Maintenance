import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Wrench, CheckCircle2, AlertTriangle, Plus, 
  RefreshCw, FileText, Calendar, User, ArrowRight, Zap
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function MaintenanceCalibrationPage() {
  const [activeTab, setActiveTab] = useState('calibration'); // calibration, maintenance
  const [calibrations, setCalibrations] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [showCalibModal, setShowCalibModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calibration Form
  const [calibForm, setCalibForm] = useState({
    equipmentId: 'EQ-IMG-002',
    engineerName: 'Marcus Vance, Lead Biomedical Engineer',
    standardUsed: 'Fluke 754 NIST Documenting Process Calibrator',
    accuracyDriftPercent: 0.04,
    tolerancePassed: true,
    notes: 'Transducer linearity verified within ±0.05% tolerance. Laser crosshair verified 0.2mm optical precision.',
  });

  // Maintenance Form
  const [maintForm, setMaintForm] = useState({
    equipmentId: 'EQ-STER-001',
    maintenanceType: 'PREVENTIVE',
    description: 'Quarterly HEPA air filter replacement and chamber silicone gasket lubrication.',
    assignedEngineer: 'Elena Rostova, Biomed Tech',
    priority: 'MEDIUM',
    costUsd: 180.0,
  });

  const loadData = async () => {
    try {
      const [calibData, maintData, equipData] = await Promise.all([
        sterilApi.getCalibrationRecords(),
        sterilApi.getMaintenanceTickets(),
        sterilApi.getAllEquipment(),
      ]);
      setCalibrations(calibData);
      setMaintenanceTickets(maintData);
      setEquipmentList(equipData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePerformCalibration = async (e) => {
    e.preventDefault();
    try {
      await sterilApi.performCalibration(calibForm);
      setShowCalibModal(false);
      loadData();
    } catch (err) {
      console.error('Calibration failed', err);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    try {
      const selectedEq = equipmentList.find(eq => eq.equipmentId === maintForm.equipmentId);
      await sterilApi.createMaintenanceTicket({
        ...maintForm,
        equipmentName: selectedEq ? selectedEq.name : maintForm.equipmentId,
        status: 'OPEN',
      });
      setShowMaintModal(false);
      loadData();
    } catch (err) {
      console.error('Maintenance ticket failed', err);
    }
  };

  const handleResolveTicket = async (ticketNum) => {
    try {
      await sterilApi.resolveMaintenanceTicket(ticketNum, 'Component serviced, leak test passed, returned to service.');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-steril-mint uppercase">
              Biomedical Engineering Suite • Call Activity Integration
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            Maintenance, Calibration & ISO 13485 Compliance Management
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCalibModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-steril-green text-steril-black font-semibold text-xs hover:bg-steril-mint transition-all shadow-glow-green-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Execute Calibration (Call Activity)</span>
          </button>
          <button
            onClick={() => setShowMaintModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-steril-surface border border-steril-border hover:border-steril-green text-xs font-mono text-steril-text transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-steril-green" />
            <span>Log Maintenance Ticket</span>
          </button>
        </div>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="flex items-center space-x-2 p-2 rounded-xl bg-steril-charcoal border border-steril-border">
        <button
          onClick={() => setActiveTab('calibration')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'calibration'
              ? 'bg-steril-surface text-steril-green border border-steril-green/40 shadow-glow-green-sm'
              : 'text-steril-muted hover:text-steril-text'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Biomedical Calibration Records ({calibrations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'maintenance'
              ? 'bg-steril-surface text-steril-green border border-steril-green/40 shadow-glow-green-sm'
              : 'text-steril-muted hover:text-steril-text'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Maintenance & Servicing Tickets ({maintenanceTickets.length})</span>
        </button>
      </div>

      {/* Calibration Tab Content */}
      {activeTab === 'calibration' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border">
              <span className="text-[10px] font-mono text-steril-muted uppercase">CALIBRATION PROTOCOL</span>
              <p className="text-sm font-bold font-mono text-steril-text mt-1">ISO 13485 / ISO 17025</p>
              <p className="text-xs text-steril-muted mt-1">NIST-Traceable Multi-Point Sensor Verification</p>
            </div>
            <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border">
              <span className="text-[10px] font-mono text-steril-muted uppercase">MAX ALLOWABLE DRIFT</span>
              <p className="text-sm font-bold font-mono text-steril-green mt-1">±0.50% Full-Scale</p>
              <p className="text-xs text-steril-muted mt-1">Automated Decommission Threshold</p>
            </div>
            <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border">
              <span className="text-[10px] font-mono text-steril-muted uppercase">CALL ACTIVITY STATUS</span>
              <p className="text-sm font-bold font-mono text-steril-mint mt-1">BPMN Subprocess Active</p>
              <p className="text-xs text-steril-muted mt-1">biomedical-engineer-calibration</p>
            </div>
          </div>

          {/* Calibrations Table */}
          <div className="p-5 rounded-2xl bg-steril-charcoal border border-steril-border">
            <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider mb-4">
              NIST-Traceable Calibration Certificates Log
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[11px] text-steril-muted border-b border-steril-border">
                  <tr>
                    <th className="pb-2">CERTIFICATE NO.</th>
                    <th className="pb-2">EQUIPMENT TARGET</th>
                    <th className="pb-2">BIOMED ENGINEER</th>
                    <th className="pb-2">STANDARD USED</th>
                    <th className="pb-2">SENSOR DRIFT</th>
                    <th className="pb-2">STATUS</th>
                    <th className="pb-2">VALID UNTIL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steril-border/40">
                  {calibrations.map((cal) => (
                    <tr key={cal.certificateNumber} className="hover:bg-steril-surface/50 transition-colors">
                      <td className="py-3 font-bold text-steril-green">{cal.certificateNumber}</td>
                      <td className="py-3">
                        <span className="font-bold text-steril-text block">{cal.equipmentId}</span>
                        <span className="text-[10px] text-steril-muted truncate block max-w-xs">{cal.equipmentName}</span>
                      </td>
                      <td className="py-3 text-steril-text">{cal.engineerName}</td>
                      <td className="py-3 text-steril-mint truncate max-w-[160px]">{cal.standardUsed}</td>
                      <td className="py-3 text-steril-green font-bold">{cal.accuracyDriftPercent}%</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cal.status === 'CERTIFIED' ? 'bg-steril-green/20 text-steril-green' : 'bg-steril-red/20 text-steril-red'
                        }`}>
                          {cal.status}
                        </span>
                      </td>
                      <td className="py-3 text-steril-muted">
                        {cal.validUntil ? cal.validUntil.split('T')[0] : '2026-12-31'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab Content */}
      {activeTab === 'maintenance' && (
        <div className="p-5 rounded-2xl bg-steril-charcoal border border-steril-border">
          <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider mb-4">
            Preventive & Corrective Maintenance Work Orders
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-steril-muted border-b border-steril-border">
                <tr>
                  <th className="pb-2">TICKET NO.</th>
                  <th className="pb-2">EQUIPMENT</th>
                  <th className="pb-2">TYPE</th>
                  <th className="pb-2">DESCRIPTION</th>
                  <th className="pb-2">PRIORITY</th>
                  <th className="pb-2">STATUS</th>
                  <th className="pb-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steril-border/40">
                {maintenanceTickets.map((t) => (
                  <tr key={t.ticketNumber} className="hover:bg-steril-surface/50 transition-colors">
                    <td className="py-3 font-bold text-steril-text">{t.ticketNumber}</td>
                    <td className="py-3">
                      <span className="font-bold text-steril-mint block">{t.equipmentId}</span>
                      <span className="text-[10px] text-steril-muted truncate block max-w-xs">{t.equipmentName}</span>
                    </td>
                    <td className="py-3 text-steril-muted">{t.maintenanceType}</td>
                    <td className="py-3 text-steril-text max-w-sm leading-relaxed">{t.description}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'CRITICAL' || t.priority === 'HIGH'
                          ? 'bg-steril-red/20 text-steril-red'
                          : 'bg-steril-amber/20 text-steril-amber'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'RESOLVED' ? 'bg-steril-green/20 text-steril-green' : 'bg-steril-surface text-steril-muted'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {t.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolveTicket(t.ticketNumber)}
                          className="px-2.5 py-1 rounded bg-steril-surface border border-steril-green text-steril-green text-[11px] hover:bg-steril-green hover:text-steril-black transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Perform Calibration Modal */}
      {showCalibModal && (
        <div className="fixed inset-0 z-50 bg-steril-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-steril-charcoal border border-steril-green shadow-glow-green space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-steril-border">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-steril-green" />
                <h3 className="font-bold font-mono text-sm text-steril-text">
                  Execute Calibration (BPMN Call Activity)
                </h3>
              </div>
              <button onClick={() => setShowCalibModal(false)} className="text-steril-muted hover:text-steril-text">✕</button>
            </div>

            <form onSubmit={handlePerformCalibration} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-steril-muted block mb-1">Equipment Target</label>
                <select
                  value={calibForm.equipmentId}
                  onChange={(e) => setCalibForm({ ...calibForm, equipmentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
                >
                  {equipmentList.map(eq => (
                    <option key={eq.equipmentId} value={eq.equipmentId}>
                      {eq.equipmentId} - {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-steril-muted block mb-1">Biomedical Engineer</label>
                <input
                  type="text"
                  value={calibForm.engineerName}
                  onChange={(e) => setCalibForm({ ...calibForm, engineerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text"
                  required
                />
              </div>

              <div>
                <label className="text-steril-muted block mb-1">Calibration Standard Used</label>
                <select
                  value={calibForm.standardUsed}
                  onChange={(e) => setCalibForm({ ...calibForm, standardUsed: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text"
                >
                  <option value="Fluke 754 NIST Documenting Process Calibrator">Fluke 754 NIST Documenting Process Calibrator</option>
                  <option value="Omega CL3512A High-Precision RTD Simulator">Omega CL3512A High-Precision RTD Simulator</option>
                  <option value="Druck DPI 610 Precision Pneumatic Calibrator">Druck DPI 610 Precision Pneumatic Calibrator</option>
                </select>
              </div>

              <div>
                <label className="text-steril-muted block mb-1">Measured Accuracy Drift (%) - Limit ±0.5%</label>
                <input
                  type="number"
                  step="0.01"
                  value={calibForm.accuracyDriftPercent}
                  onChange={(e) => setCalibForm({ ...calibForm, accuracyDriftPercent: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text"
                  required
                />
              </div>

              <div>
                <label className="text-steril-muted block mb-1">Observations & Verification Notes</label>
                <textarea
                  rows={2}
                  value={calibForm.notes}
                  onChange={(e) => setCalibForm({ ...calibForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCalibModal(false)}
                  className="px-4 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-muted hover:text-steril-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-steril-green text-steril-black font-bold shadow-glow-green-sm hover:bg-steril-mint"
                >
                  Issue NIST Certificate & Sign Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 bg-steril-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-steril-charcoal border border-steril-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-steril-border">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-steril-mint" />
                <h3 className="font-bold font-mono text-sm text-steril-text">
                  Log Equipment Maintenance Work Order
                </h3>
              </div>
              <button onClick={() => setShowMaintModal(false)} className="text-steril-muted hover:text-steril-text">✕</button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-steril-muted block mb-1">Equipment Target</label>
                <select
                  value={maintForm.equipmentId}
                  onChange={(e) => setMaintForm({ ...maintForm, equipmentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
                >
                  {equipmentList.map(eq => (
                    <option key={eq.equipmentId} value={eq.equipmentId}>
                      {eq.equipmentId} - {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-steril-muted block mb-1">Maintenance Type</label>
                  <select
                    value={maintForm.maintenanceType}
                    onChange={(e) => setMaintForm({ ...maintForm, maintenanceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text"
                  >
                    <option value="PREVENTIVE">Preventive Maintenance</option>
                    <option value="CORRECTIVE">Corrective Repair</option>
                    <option value="EMERGENCY">Emergency Breakdown</option>
                  </select>
                </div>
                <div>
                  <label className="text-steril-muted block mb-1">Priority</label>
                  <select
                    value={maintForm.priority}
                    onChange={(e) => setMaintForm({ ...maintForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-steril-muted block mb-1">Assigned Engineer / Tech</label>
                <input
                  type="text"
                  value={maintForm.assignedEngineer}
                  onChange={(e) => setMaintForm({ ...maintForm, assignedEngineer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text"
                  required
                />
              </div>

              <div>
                <label className="text-steril-muted block mb-1">Issue Description & Defect Details</label>
                <textarea
                  rows={2}
                  value={maintForm.description}
                  onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="px-4 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-muted hover:text-steril-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-steril-mint text-steril-black font-bold hover:bg-steril-green"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
