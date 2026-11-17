import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Layers, Cpu, Activity, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function WorkflowInitiationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    department: 'Orthopedics',
    operatingTheatre: 'OR-1 Orthopedic Arthroplasty',
    equipmentCategory: 'Surgical instrument trays',
    equipmentId: 'EQ-TRAY-001',
    contaminationLevel: 'MEDIUM',
    cleaningStatus: 'PENDING',
    sterilizationMethod: 'STEAM_AUTOCLAVE_134C',
    assignedTechnician: 'tech_sarah_connor',
    priority: 'HIGH',
    notes: 'Post-surgery orthopedic total joint reconstructive set. Requires 134°C Porous Load hold 18 min.',
  });

  // Dynamic Array Builder for Parallel Multi-Instance Surgical Trays
  const [trays, setTrays] = useState([
    { trayId: 'TRAY-ORTHO-01', trayName: 'Major Orthopedic Joint Replacement Tray', autoclaveId: 'AC-01', calibrationRequired: true },
    { trayId: 'TRAY-ORTHO-02', trayName: 'Orthopedic Bone Rasp & Reamer Tray', autoclaveId: 'AC-01', calibrationRequired: false },
  ]);

  const [equipmentList, setEquipmentList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    async function loadAssets() {
      try {
        const list = await sterilApi.getAllEquipment();
        setEquipmentList(list);
      } catch (err) {
        console.error(err);
      }
    }
    loadAssets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTray = () => {
    const nextIdx = trays.length + 1;
    setTrays(prev => [
      ...prev,
      {
        trayId: `TRAY-BATCH-${100 + nextIdx}`,
        trayName: `Supplemental Surgical Tray #${nextIdx}`,
        autoclaveId: 'AC-01',
        calibrationRequired: false,
      }
    ]);
  };

  const handleRemoveTray = (index) => {
    if (trays.length <= 1) return;
    setTrays(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleTrayChange = (index, field, value) => {
    setTrays(prev => prev.map((t, idx) => idx === index ? { ...t, [field]: value } : t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        trays,
      };

      const result = await sterilApi.initiateWorkflow(payload);
      setSuccessResult(result);

      // Auto redirect to tracking after 2 seconds or on button click
      setTimeout(() => {
        navigate(`/workflows/${result.processInstanceId}`);
      }, 2200);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to initiate workflow');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-steril-mint uppercase">
              Camunda 8 BPMN 2.0 Process Launcher
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            Initiate Sterilization & Multi-Tray Workflow Instance
          </h1>
        </div>
      </div>

      {/* Success banner if created */}
      {successResult && (
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-green shadow-glow-green space-y-3">
          <div className="flex items-center space-x-2 text-steril-green">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold font-mono text-sm">
              Camunda 8 Process Instance Active: {successResult.processInstanceId}
            </h3>
          </div>
          <p className="text-xs text-steril-muted font-mono">
            Request #{successResult.requestId} connected to Camunda 8 cluster with {successResult.trayCount} parallel Multi-Instance tray(s). Redirecting to workflow tracking...
          </p>
          <div className="flex items-center space-x-3 pt-1">
            <a
              href={`http://localhost:8080/operate/processes/${successResult.processInstanceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-orange-600/30 text-orange-400 border border-orange-500 hover:bg-orange-600/40 font-mono text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <span>View in Camunda Operate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => navigate(`/workflows/${successResult.processInstanceId}`)}
              className="px-3.5 py-1.5 rounded-lg bg-steril-green text-steril-black font-mono text-xs font-bold hover:bg-steril-mint transition-all"
            >
              Track in STERILFLOW Now
            </button>
          </div>
        </div>
      )}

      {/* Form Error */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-steril-red text-steril-red flex items-center space-x-3 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Initiation Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Clinical Metadata & Equipment Parameters */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-steril-border/60">
            <Activity className="w-4 h-4 text-steril-green" />
            <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
              Clinical Context & Intake Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Hospital Department */}
            <div className="space-y-1">
              <label className="text-steril-muted">Hospital Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
              >
                <option value="Orthopedics">Orthopedics</option>
                <option value="Cardiac Surgery">Cardiac Surgery</option>
                <option value="Neurosurgery">Neurosurgery</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                <option value="Trauma & Emergency">Trauma & Emergency</option>
              </select>
            </div>

            {/* Operating Theatre */}
            <div className="space-y-1">
              <label className="text-steril-muted">Operating Theatre *</label>
              <input
                type="text"
                name="operatingTheatre"
                value={formData.operatingTheatre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
                placeholder="e.g. OR-1 Orthopedic"
                required
              />
            </div>

            {/* Equipment Category */}
            <div className="space-y-1">
              <label className="text-steril-muted">Equipment Category *</label>
              <select
                name="equipmentCategory"
                value={formData.equipmentCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
              >
                <option value="Surgical instrument trays">Surgical instrument trays</option>
                <option value="Diagnostic imaging equipment">Diagnostic imaging equipment</option>
                <option value="Endoscopy equipment">Endoscopy equipment</option>
                <option value="Surgical tools">Surgical tools</option>
                <option value="Monitoring equipment">Monitoring equipment</option>
                <option value="Laboratory diagnostic devices">Laboratory diagnostic devices</option>
              </select>
            </div>

            {/* Equipment ID */}
            <div className="space-y-1">
              <label className="text-steril-muted">Asset Equipment ID *</label>
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
              >
                {equipmentList.map(eq => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>
                    {eq.equipmentId} - {eq.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contamination Level */}
            <div className="space-y-1">
              <label className="text-steril-muted">Bio-Contamination Level *</label>
              <select
                name="contaminationLevel"
                value={formData.contaminationLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
              >
                <option value="LOW">Low (Minimal bio-burden)</option>
                <option value="MEDIUM">Medium (Standard post-op)</option>
                <option value="HIGH">High (Blood & tissue residue)</option>
                <option value="BIOHAZARD">Biohazard (Requires Rework)</option>
              </select>
            </div>

            {/* Sterilization Method */}
            <div className="space-y-1">
              <label className="text-steril-muted">Sterilization Method *</label>
              <select
                name="sterilizationMethod"
                value={formData.sterilizationMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
              >
                <option value="STEAM_AUTOCLAVE_134C">Steam Autoclave 134°C (Porous Load)</option>
                <option value="STEAM_AUTOCLAVE_121C">Steam Autoclave 121°C (Delicate Hollow)</option>
                <option value="HYDROGEN_PEROXIDE_PLASMA">H2O2 Vapor Plasma 45°C (Laparoscopy)</option>
                <option value="ETO_GAS">Ethylene Oxide Gas (Electronics)</option>
              </select>
            </div>

            {/* Assigned Technician */}
            <div className="space-y-1">
              <label className="text-steril-muted">Assigned CSSD Technician</label>
              <input
                type="text"
                name="assignedTechnician"
                value={formData.assignedTechnician}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-steril-muted">Batch Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority (Urgent Turnaround)</option>
                <option value="EMERGENCY">Emergency / Immediate Surgery</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1 text-xs font-mono pt-2">
            <label className="text-steril-muted">Decontamination & Packaging Instructions</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text focus:border-steril-green focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Right Column: Dynamic Array Builder for Multi-Instance Process Trays */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-steril-border/60">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-steril-mint" />
                <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
                  Parallel Multi-Instance Trays Builder ({trays.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddTray}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-steril-surface border border-steril-mint/40 text-steril-mint text-xs font-mono hover:bg-steril-border transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tray</span>
              </button>
            </div>

            <p className="text-xs text-steril-muted leading-relaxed">
              Camunda 8 will fork concurrent parallel instances of the tray sterilization & quality inspection sub-process for each tray added below.
            </p>

            {/* Dynamic Trays List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {trays.map((tray, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-steril-surface border border-steril-border space-y-2.5 relative group">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-steril-green font-bold">TRAY #{idx + 1}</span>
                    {trays.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTray(idx)}
                        className="text-steril-muted hover:text-steril-red transition-colors"
                        title="Remove tray from batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <label className="text-[10px] text-steril-muted block">Tray ID</label>
                      <input
                        type="text"
                        value={tray.trayId}
                        onChange={(e) => handleTrayChange(idx, 'trayId', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-steril-black border border-steril-border text-steril-text"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-steril-muted block">Assigned Autoclave</label>
                      <select
                        value={tray.autoclaveId}
                        onChange={(e) => handleTrayChange(idx, 'autoclaveId', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-steril-black border border-steril-border text-steril-text"
                      >
                        <option value="AC-01">AC-01 (Siemens 660-X)</option>
                        <option value="AC-02">AC-02 (Getinge GSS)</option>
                        <option value="AC-03">AC-03 (Plasma 45°C)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs font-mono">
                    <label className="text-[10px] text-steril-muted block">Tray Description</label>
                    <input
                      type="text"
                      value={tray.trayName}
                      onChange={(e) => handleTrayChange(idx, 'trayName', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-steril-black border border-steril-border text-steril-text"
                      required
                    />
                  </div>

                  {/* Calibration checkbox (Triggers Call Activity) */}
                  <label className="flex items-center space-x-2 text-xs font-mono text-steril-mint cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={tray.calibrationRequired}
                      onChange={(e) => handleTrayChange(idx, 'calibrationRequired', e.target.checked)}
                      className="rounded bg-steril-black border-steril-border text-steril-green focus:ring-0"
                    />
                    <span>Invoke Biomedical Engineer Calibration Call Activity</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-steril-border/60">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-steril-green text-steril-black font-bold text-sm hover:bg-steril-mint transition-all shadow-glow-green flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>STARTING ZEEBE PROCESS INSTANCE...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Launch Sterilization Workflow ({trays.length} Trays)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
