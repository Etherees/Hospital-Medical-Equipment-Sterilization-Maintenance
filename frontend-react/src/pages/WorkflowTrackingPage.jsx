import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  GitBranch, CheckCircle2, Clock, AlertTriangle, PlayCircle, 
  Layers, ShieldCheck, RefreshCw, ArrowRight, Eye, AlertOctagon, Terminal,
  ZoomIn, ZoomOut, Maximize2, ExternalLink
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function WorkflowTrackingPage() {
  const { id } = useParams();
  const [instances, setInstances] = useState([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState(id || '');
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

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

        {/* Instance Selector Dropdown */}
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
            return (
              <div
                key={stage.stepNumber}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                  isActive
                    ? 'bg-steril-surface border-steril-green shadow-glow-green-sm'
                    : isCompleted
                    ? 'bg-steril-charcoal border-steril-green/40 text-steril-text'
                    : 'bg-steril-black/40 border-steril-border text-steril-muted opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`font-bold ${isActive ? 'text-steril-green' : isCompleted ? 'text-steril-mint' : 'text-steril-muted'}`}>
                    STEP 0{stage.stepNumber}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-steril-green" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-steril-green animate-ping"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-steril-border"></span>
                  )}
                </div>

                <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-steril-green' : isCompleted ? 'text-steril-text' : 'text-steril-muted'}`}>
                  {stage.name}
                </p>

                <span className="text-[9px] font-mono text-steril-muted uppercase">
                  {stage.state}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full BPMN 2.0 Process Architecture Visualizer */}
      <div className="p-6 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-steril-border/60 gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-steril-text uppercase tracking-wider">
              BPMN 2.0 Sequence Flow Architecture (Siemens Healthineers / Camunda 8)
            </span>
            <span className="text-[11px] font-mono text-steril-green bg-steril-surface px-2.5 py-0.5 rounded border border-steril-border">
              TOKEN POSITION: {req?.currentStage || 'INITIAL_INSPECTION'}
            </span>
          </div>

          {/* Interactive Zoom & Viewer Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
              className="p-1.5 rounded-lg bg-steril-surface border border-steril-border hover:border-steril-green text-steril-muted hover:text-steril-text transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-steril-mint px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.25))}
              className="p-1.5 rounded-lg bg-steril-surface border border-steril-border hover:border-steril-green text-steril-muted hover:text-steril-text transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-[11px] font-mono rounded-lg bg-steril-surface border border-steril-border hover:border-steril-green text-steril-muted hover:text-steril-text transition-all"
            >
              Reset
            </button>
            <a
              href="/sterilflow-main-process.svg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-mono rounded-lg bg-steril-surface border border-steril-green/60 hover:bg-steril-green/10 text-steril-green transition-all"
              title="Open full vector SVG in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Tab</span>
            </a>
          </div>
        </div>

        {/* High-Resolution SVG Canvas Viewport */}
        <div className="w-full bg-[#050706] rounded-xl border border-steril-border/60 overflow-x-auto overflow-y-auto p-4 transition-all">
          <div 
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'top left',
              width: `${zoomLevel * 100}%`,
              transition: 'transform 0.15s ease-out'
            }}
            className="min-w-[1100px]"
          >
            <img 
              src="/sterilflow-main-process.svg" 
              alt="STERILFLOW 2.0 BPMN Process Architecture" 
              className="w-full h-auto select-none rounded-lg"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-steril-border/60 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-steril-muted gap-2">
          <span>Collaboration Pool: OR Staff | CSSD Sterilization | Quality Assurance</span>
          <span className="text-steril-green flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-steril-green animate-pulse"></span>
            <span>CAMUNDA 8 ZEEBE ACTIVE SESSION</span>
          </span>
        </div>
      </div>

      {/* Process Variables & Live Telemetry Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Process Variables Inspector */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-steril-border/60">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-steril-mint" />
              <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
                Live Zeebe Process Variables (Data Contract &amp; Scoping)
              </h2>
            </div>
            <span className="text-xs font-mono text-steril-muted">
              {Object.keys(variables).length} Variables Scoped
            </span>
          </div>

          <p className="text-xs text-steril-muted">
            Scoped Zeebe variables propagated between parent process and multi-instance child activities:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {Object.entries(variables).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-lg bg-steril-surface border border-steril-border flex items-center justify-between text-xs font-mono">
                <span className="text-steril-muted text-[11px] truncate max-w-[160px]">{key}</span>
                <span className="text-steril-mint font-bold truncate max-w-[140px] text-right">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Navigation Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 pb-2 border-b border-steril-border/60">
              <ShieldCheck className="w-4 h-4 text-steril-green" />
              <h3 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
                Operator Action
              </h3>
            </div>
            <p className="text-xs text-steril-muted mt-3 leading-relaxed">
              Active process tokens wait for user task completion in the Camunda Tasklist or background Zeebe JobWorker execution.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-steril-border/60">
            <Link
              to="/tasklist"
              className="w-full py-2.5 rounded-xl bg-steril-green text-steril-black font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 hover:bg-steril-mint shadow-glow-green-sm"
            >
              <span>Open Tasklist Inbox</span>
              <ArrowRight className="w-4 h-4 text-steril-black" />
            </Link>
            <Link
              to="/monitoring"
              className="w-full py-2 rounded-xl bg-steril-surface border border-steril-border hover:border-steril-green text-steril-text font-medium text-xs transition-all flex items-center justify-center space-x-1.5"
            >
              <span>View Autoclave Telemetry</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
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
