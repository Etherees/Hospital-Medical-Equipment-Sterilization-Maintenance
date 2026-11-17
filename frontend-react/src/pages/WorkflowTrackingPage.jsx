import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  GitBranch, CheckCircle2, Clock, AlertTriangle, PlayCircle, 
  Layers, ShieldCheck, RefreshCw, ArrowRight, Eye, AlertOctagon, Terminal
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function WorkflowTrackingPage() {
  const { id } = useParams();
  const [instances, setInstances] = useState([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState(id || '');
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load instances
  const fetchInstances = async () => {
    try {
      const list = await sterilApi.getAllWorkflowInstances();
      setInstances(list);
      const targetId = selectedInstanceId || (list.length > 0 ? list[0].processInstanceId : '');
      if (targetId) {
        setSelectedInstanceId(targetId);
        const details = await sterilApi.getWorkflowDetails(targetId);
        setWorkflowData(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 4000);
    return () => clearInterval(interval);
  }, [selectedInstanceId]);

  const handleSelectInstance = async (instId) => {
    setSelectedInstanceId(instId);
    setLoading(true);
    try {
      const details = await sterilApi.getWorkflowDetails(instId);
      setWorkflowData(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const req = workflowData?.request;
  const stages = workflowData?.stages || [];
  const activeIdx = workflowData?.activeStageIndex || 0;
  const variables = workflowData?.variables || {};

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-steril-mint uppercase">
              Camunda 8 Process Instance Tracker
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            BPMN 2.0 Live Execution & Multi-Stage Token Visualizer
          </h1>
        </div>

        {/* Instance Selector Dropdown & Camunda Operate Link */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedInstanceId}
            onChange={(e) => handleSelectInstance(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-steril-charcoal border border-steril-border text-xs font-mono text-steril-text focus:border-steril-green focus:outline-none"
          >
            {instances.map(inst => (
              <option key={inst.processInstanceId} value={inst.processInstanceId}>
                {inst.processInstanceId} ({inst.requestId} - {inst.department})
              </option>
            ))}
          </select>
          {selectedInstanceId && (
            <a
              href={`http://localhost:8080/operate/processes/${selectedInstanceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/50 hover:bg-orange-600/30 transition-all text-xs font-mono font-semibold shadow-sm"
              title="Open this instance live in Camunda Operate"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View in Camunda Operate</span>
            </a>
          )}
          <button
            onClick={fetchInstances}
            className="p-1.5 rounded-lg bg-steril-charcoal border border-steril-border hover:border-steril-green text-steril-green"
            title="Refresh Process State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instance Summary Bar */}
      {req && (
        <div className="p-4 rounded-2xl bg-steril-charcoal border border-steril-border grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div>
            <span className="text-steril-muted text-[10px] block">INSTANCE ID</span>
            <span className="text-steril-green font-bold truncate block">{req.processInstanceId}</span>
          </div>
          <div>
            <span className="text-steril-muted text-[10px] block">REQUEST BATCH</span>
            <span className="text-steril-text font-bold block">{req.requestId}</span>
          </div>
          <div>
            <span className="text-steril-muted text-[10px] block">DEPARTMENT / OR</span>
            <span className="text-steril-mint truncate block">{req.department} ({req.operatingTheatre})</span>
          </div>
          <div>
            <span className="text-steril-muted text-[10px] block">EQUIPMENT TARGET</span>
            <span className="text-steril-text truncate block">{req.equipmentId}</span>
          </div>
          <div>
            <span className="text-steril-muted text-[10px] block">PARALLEL TRAYS</span>
            <span className="text-steril-green font-bold block">{req.trayCount} Tray Instances</span>
          </div>
          <div>
            <span className="text-steril-muted text-[10px] block">OVERALL STATUS</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
              req.status === 'COMPLETED' ? 'bg-steril-green/20 text-steril-green' :
              req.status === 'QUARANTINED' ? 'bg-red-950/90 text-red-300 border border-red-500 animate-quarantine-blink shadow-[0_0_10px_rgba(239,68,68,0.6)]' :
              'bg-steril-amber/20 text-steril-amber'
            }`}>
              {req.status}
            </span>
          </div>
        </div>
      )}

      {/* 10-Stage Execution Timeline (Mandatory Requirement) */}
      <div className="p-6 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-steril-border/60">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-steril-green" />
            <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
              10-Stage Hospital Sterilization & Maintenance Lifecycle Timeline
            </h2>
          </div>
          <span className="text-xs font-mono text-steril-muted">
            Stage {activeIdx + 1} of 10 Active
          </span>
        </div>

        {/* Horizontal Timeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-2">
          {stages.map((stage, idx) => {
            const isCompleted = stage.state === 'COMPLETED';
            const isActive = stage.state === 'ACTIVE';
            const isFailed = stage.state === 'FAILED';
            const isQuarantined = stage.state === 'QUARANTINED';
            return (
              <div
                key={stage.stepNumber}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                  isFailed || isQuarantined
                    ? 'bg-red-950/40 border-red-500/70 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : isActive
                    ? 'bg-steril-surface border-steril-green shadow-glow-green-sm'
                    : isCompleted
                    ? 'bg-steril-charcoal border-steril-green/40 text-steril-text'
                    : 'bg-steril-black/40 border-steril-border text-steril-muted opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`font-bold ${
                    isFailed || isQuarantined
                      ? 'text-red-400'
                      : isActive 
                      ? 'text-steril-green' 
                      : isCompleted 
                      ? 'text-steril-mint' 
                      : 'text-steril-muted'
                  }`}>
                    STEP 0{stage.stepNumber}
                  </span>
                  {isFailed || isQuarantined ? (
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-steril-green" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-steril-green animate-ping"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-steril-border"></span>
                  )}
                </div>

                <p className={`text-[11px] font-bold leading-tight ${
                  isFailed || isQuarantined
                    ? 'text-red-300'
                    : isActive 
                    ? 'text-steril-green' 
                    : isCompleted 
                    ? 'text-steril-text' 
                    : 'text-steril-muted'
                }`}>
                  {stage.name}
                </p>

                <span className={`text-[9px] font-mono uppercase ${isFailed || isQuarantined ? 'text-red-400 font-bold' : 'text-steril-muted'}`}>
                  {stage.state}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BPMN Process Architecture Visualizer & Process Variables Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2D BPMN Execution Flow Diagram */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-steril-border/60">
            <span className="text-xs font-mono font-bold text-steril-text uppercase tracking-wider">
              BPMN 2.0 Sequence Flow Architecture
            </span>
            <span className="text-[11px] font-mono text-steril-green bg-steril-surface px-2 py-0.5 rounded border border-steril-border">
              TOKEN POSITION: {req?.currentStage || 'INSPECTION'}
            </span>
          </div>

          {/* 2D BPMN Architecture SVG Flow */}
          <div className="py-4 overflow-x-auto">
            <svg viewBox="0 0 760 200" className="w-full min-w-[650px] h-48">
              {/* Start Event */}
              <circle cx="35" cy="80" r="15" fill="#0B100E" stroke="#20F59A" strokeWidth="2.5" />
              <polygon points="32,74 42,80 32,86" fill="#20F59A" />
              <text x="35" y="112" fill="#929A96" fontSize="8" textAnchor="middle" fontFamily="monospace">START</text>

              <line x1="50" y1="80" x2="80" y2="80" stroke="#20F59A" strokeWidth="1.5" />

              {/* Service Task: Register */}
              <rect x="80" y="55" width="85" height="50" rx="6" fill="#111815" stroke={activeIdx >= 0 ? '#20F59A' : '#252C28'} strokeWidth="1.5" />
              <text x="122" y="77" fill="#F5F7F6" fontSize="8" textAnchor="middle" fontFamily="monospace">Register</text>
              <text x="122" y="90" fill="#20F59A" fontSize="7" textAnchor="middle" fontFamily="monospace">Equipment</text>

              <line x1="165" y1="80" x2="195" y2="80" stroke="#20F59A" strokeWidth="1.5" />

              {/* User Task: Initial Inspection */}
              <rect x="195" y="55" width="85" height="50" rx="6" fill="#111815" stroke={activeIdx >= 1 ? '#20F59A' : '#252C28'} strokeWidth="1.8" className={activeIdx === 1 ? 'tech-glow' : ''} />
              <text x="237" y="77" fill="#F5F7F6" fontSize="8" textAnchor="middle" fontFamily="monospace">Initial</text>
              <text x="237" y="90" fill="#83F7C2" fontSize="7" textAnchor="middle" fontFamily="monospace">Inspection</text>

              <line x1="280" y1="80" x2="310" y2="80" stroke="#20F59A" strokeWidth="1.5" />

              {/* Multi-Instance Subprocess: Parallel Trays */}
              <rect x="310" y="40" width="145" height="80" rx="8" fill="#0B100E" stroke={activeIdx >= 3 ? '#20F59A' : '#252C28'} strokeWidth="2" strokeDasharray="3 3" />
              <text x="382" y="58" fill="#20F59A" fontSize="8" textAnchor="middle" fontFamily="monospace">Parallel Trays (MI)</text>
              {/* MI parallel bars marker ||| */}
              <line x1="375" y1="110" x2="375" y2="116" stroke="#20F59A" strokeWidth="2" />
              <line x1="382" y1="110" x2="382" y2="116" stroke="#20F59A" strokeWidth="2" />
              <line x1="389" y1="110" x2="389" y2="116" stroke="#20F59A" strokeWidth="2" />

              {/* Inside MI: Autoclave & Chem Check */}
              <rect x="325" y="68" width="55" height="32" rx="4" fill="#151D19" stroke="#83F7C2" strokeWidth="1" />
              <text x="352" y="86" fill="#F5F7F6" fontSize="7" textAnchor="middle" fontFamily="monospace">134°C Steam</text>

              <rect x="390" y="68" width="55" height="32" rx="4" fill="#151D19" stroke="#83F7C2" strokeWidth="1" />
              <text x="417" y="86" fill="#F5F7F6" fontSize="7" textAnchor="middle" fontFamily="monospace">Chem Check</text>

              <line x1="455" y1="80" x2="485" y2="80" stroke="#20F59A" strokeWidth="1.5" />

              {/* Call Activity: Calibration */}
              <rect x="485" y="55" width="95" height="50" rx="6" fill="#111815" stroke={activeIdx >= 7 ? '#20F59A' : '#252C28'} strokeWidth="2" />
              {/* Call activity thick border / plus */}
              <text x="532" y="77" fill="#F5F7F6" fontSize="8" textAnchor="middle" fontFamily="monospace">Call Activity</text>
              <text x="532" y="90" fill="#20F59A" fontSize="7" textAnchor="middle" fontFamily="monospace">Calibration</text>

              <line x1="580" y1="80" x2="610" y2="80" stroke="#20F59A" strokeWidth="1.5" />

              {/* User Task: Final Signoff */}
              <rect x="610" y="55" width="85" height="50" rx="6" fill="#111815" stroke={activeIdx >= 8 ? '#20F59A' : '#252C28'} strokeWidth="1.8" className={activeIdx === 8 ? 'tech-glow' : ''} />
              <text x="652" y="77" fill="#F5F7F6" fontSize="8" textAnchor="middle" fontFamily="monospace">Final Quality</text>
              <text x="652" y="90" fill="#83F7C2" fontSize="7" textAnchor="middle" fontFamily="monospace">Sign-Off</text>

              <line x1="695" y1="80" x2="725" y2="80" stroke="#20F59A" strokeWidth="1.5" />

              {/* End Event */}
              <circle cx="735" cy="80" r="15" fill="#0B100E" stroke="#20F59A" strokeWidth="3.5" />
              <text x="735" y="112" fill="#20F59A" fontSize="8" textAnchor="middle" fontFamily="monospace">RELEASE</text>
            </svg>
          </div>

          <div className="pt-2 border-t border-steril-border/60 flex items-center justify-between text-xs font-mono text-steril-muted">
            <span>Orchestrated via Camunda 8 Zeebe Engine & strongly-typed @JobWorkers</span>
            <span className="text-steril-green">ACTIVE SESSION</span>
          </div>
        </div>

        {/* Process Variables Inspector */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-steril-border/60">
            <Terminal className="w-4 h-4 text-steril-mint" />
            <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
              Live Process Variables
            </h2>
          </div>

          <p className="text-xs text-steril-muted">
            Scoped Zeebe variables propagated between parent process and multi-instance child activities:
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {Object.entries(variables).map(([key, val]) => (
              <div key={key} className="p-2 rounded bg-steril-surface border border-steril-border flex items-center justify-between text-xs font-mono">
                <span className="text-steril-muted text-[11px] truncate max-w-[130px]">{key}</span>
                <span className="text-steril-mint font-bold">{String(val)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-steril-border/60">
            <Link
              to="/tasks"
              className="w-full py-2 rounded-xl bg-steril-surface border border-steril-border hover:border-steril-green/50 text-steril-text font-medium text-xs transition-all flex items-center justify-center space-x-1.5"
            >
              <span>View Assigned Tasks in Inbox</span>
              <ArrowRight className="w-3.5 h-3.5 text-steril-green" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
