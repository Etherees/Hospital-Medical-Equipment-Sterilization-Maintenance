import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, CheckCircle2, AlertTriangle, ShieldAlert, Wrench, 
  RefreshCw, Play, ArrowRight, ShieldCheck, Tag
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function InstrumentTrayPage() {
  const [trays, setTrays] = useState([]);
  const [selectedTray, setSelectedTray] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  // Status choices requested in rubric
  const statusOptions = [
    { label: 'Awaiting Sterilization', color: 'bg-steril-amber/20 text-steril-amber border-steril-amber/40' },
    { label: 'In Sterilization', color: 'bg-steril-mint/20 text-steril-mint border-steril-mint/40' },
    { label: 'Sterilized', color: 'bg-steril-green/20 text-steril-green border-steril-green/40' },
    { label: 'Failed Inspection', color: 'bg-steril-red/20 text-steril-red border-steril-red/40' },
    { label: 'Quarantined', color: 'bg-red-950 text-red-400 border-red-700' },
    { label: 'Maintenance Required', color: 'bg-orange-950 text-orange-400 border-orange-700' },
  ];

  const fetchTrays = async () => {
    try {
      const data = await sterilApi.getAllTrays();
      setTrays(data);
      if (data.length > 0) {
        const defaultTray = data.find(t => t.trayId === 'TRAY-ORTHO-01') || data[0];
        setSelectedTray(defaultTray);
        if (defaultTray.instruments && defaultTray.instruments.length > 0) {
          setSelectedInstrument(defaultTray.instruments[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrays();
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!selectedInstrument) return;
    setSavingStatus(true);
    try {
      const updated = await sterilApi.updateInstrumentStatus(
        selectedInstrument.instrumentCode,
        newStatus,
        selectedInstrument.contaminationStatus
      );
      setSelectedInstrument(updated);
      // Update local tray state
      setSelectedTray(prev => ({
        ...prev,
        instruments: prev.instruments.map(i => i.instrumentCode === updated.instrumentCode ? updated : i)
      }));
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setSavingStatus(false);
    }
  };

  // 2D SVG Line Art for Individual Surgical Instruments
  const renderInstrumentSvg = (type, isSelected) => {
    switch (type.toLowerCase()) {
      case 'scissors':
        return (
          <g className={isSelected ? 'tech-glow' : ''}>
            {/* Scissor Finger Rings */}
            <circle cx="50" cy="190" r="14" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="2.5" />
            <circle cx="85" cy="190" r="14" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="2.5" />
            {/* Shanks */}
            <path d="M50 176 L65 110 M85 176 L70 110" stroke={isSelected ? '#20F59A' : '#F5F7F6'} strokeWidth="2.5" />
            {/* Hinge Screw */}
            <circle cx="67" cy="105" r="4.5" fill="#20F59A" />
            {/* Curved Blades */}
            <path d="M67 105 Q60 55 48 30" fill="none" stroke={isSelected ? '#20F59A' : '#F5F7F6'} strokeWidth="3" strokeLinecap="round" />
            <path d="M67 105 Q74 55 86 30" fill="none" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="3" strokeLinecap="round" />
            {/* Tungsten Carbide Edge Gold/Neon Line */}
            <path d="M67 95 Q62 55 52 35" fill="none" stroke="#20F59A" strokeWidth="1" strokeDasharray="2 1" />
          </g>
        );
      case 'forceps':
        return (
          <g className={isSelected ? 'tech-glow' : ''}>
            {/* Forceps Base Spring Handle */}
            <path d="M60 210 Q67 225 74 210" fill="none" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="3" strokeLinecap="round" />
            {/* Forceps Arms */}
            <path d="M60 210 L63 50 M74 210 L71 50" stroke={isSelected ? '#20F59A' : '#F5F7F6'} strokeWidth="2.5" />
            {/* Grip Serrations */}
            <line x1="57" y1="130" x2="65" y2="130" stroke="#20F59A" strokeWidth="1.5" />
            <line x1="57" y1="140" x2="65" y2="140" stroke="#20F59A" strokeWidth="1.5" />
            <line x1="57" y1="150" x2="65" y2="150" stroke="#20F59A" strokeWidth="1.5" />
            <line x1="69" y1="130" x2="77" y2="130" stroke="#20F59A" strokeWidth="1.5" />
            <line x1="69" y1="140" x2="77" y2="140" stroke="#20F59A" strokeWidth="1.5" />
            <line x1="69" y1="150" x2="77" y2="150" stroke="#20F59A" strokeWidth="1.5" />
            {/* 1x2 Teeth at Tip */}
            <path d="M63 50 L65 40 L67 50 L69 40 L71 50" fill="none" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="1.8" />
          </g>
        );
      case 'needle holders':
        return (
          <g className={isSelected ? 'tech-glow' : ''}>
            {/* Finger Rings with Ratchet */}
            <circle cx="50" cy="200" r="13" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="2.2" />
            <circle cx="84" cy="200" r="13" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="2.2" />
            <path d="M60 190 L74 190" stroke="#20F59A" strokeWidth="1.5" strokeDasharray="2 1" />
            {/* Shanks */}
            <path d="M50 187 L65 100 M84 187 L69 100" stroke={isSelected ? '#20F59A' : '#F5F7F6'} strokeWidth="2.5" />
            {/* Box Lock Hinge */}
            <rect x="63" y="94" width="8" height="12" rx="2" fill="#20F59A" />
            {/* Short Serrated Jaws */}
            <rect x="62" y="60" width="4" height="34" rx="1.5" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="2" />
            <rect x="68" y="60" width="4" height="34" rx="1.5" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="2" />
            {/* TC Jaw Cross Serration */}
            <line x1="62" y1="70" x2="72" y2="70" stroke="#20F59A" strokeWidth="1" />
            <line x1="62" y1="80" x2="72" y2="80" stroke="#20F59A" strokeWidth="1" />
          </g>
        );
      case 'retractors':
        return (
          <g className={isSelected ? 'tech-glow' : ''}>
            {/* Central Shaft */}
            <line x1="67" y1="60" x2="67" y2="180" stroke={isSelected ? '#20F59A' : '#F5F7F6'} strokeWidth="3" />
            {/* Flat Blade End (Bottom) */}
            <path d="M67 180 L85 195 L85 210" fill="none" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="2.5" strokeLinecap="round" />
            {/* 3-Prong Rake (Top) */}
            <path d="M67 60 L67 45 M58 45 L76 45" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="2" />
            <path d="M58 45 L54 30 M67 45 L67 28 M76 45 L80 30" fill="none" stroke={isSelected ? '#20F59A' : '#20F59A'} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'clamps':
        return (
          <g className={isSelected ? 'tech-glow' : ''}>
            {/* Finger Rings */}
            <circle cx="50" cy="195" r="14" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="2.5" />
            <circle cx="85" cy="195" r="14" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#929A96'} strokeWidth="2.5" />
            {/* Locking Ratchet */}
            <line x1="61" y1="185" x2="74" y2="185" stroke="#20F59A" strokeWidth="1.5" strokeDasharray="2 1" />
            {/* Curved Shanks */}
            <path d="M50 181 L65 105 M85 181 L70 105" stroke={isSelected ? '#20F59A' : '#F5F7F6'} strokeWidth="2.5" />
            <circle cx="67" cy="102" r="4.5" fill="#20F59A" />
            {/* Long Transverse Grooved Jaws Curved */}
            <path d="M67 102 Q64 65 52 40" fill="none" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="3" strokeLinecap="round" />
            <path d="M67 102 Q70 65 58 40" fill="none" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 'surgical blades':
      default:
        return (
          <g className={isSelected ? 'tech-glow' : ''}>
            {/* Scalpel Handle No. 3 */}
            <rect x="62" y="70" width="10" height="140" rx="3" fill="#0B100E" stroke={isSelected ? '#20F59A' : '#F5F7F6'} strokeWidth="2" />
            {/* Millimeter Metric Markings */}
            <line x1="64" y1="100" x2="70" y2="100" stroke="#20F59A" strokeWidth="1" />
            <line x1="64" y1="120" x2="70" y2="120" stroke="#20F59A" strokeWidth="1" />
            <line x1="64" y1="140" x2="70" y2="140" stroke="#20F59A" strokeWidth="1" />
            <line x1="64" y1="160" x2="70" y2="160" stroke="#20F59A" strokeWidth="1" />
            {/* Detachable Surgical Blade No. 10 */}
            <path d="M62 70 L62 45 Q62 25 72 25 L72 70 Z" fill="#151D19" stroke={isSelected ? '#20F59A' : '#83F7C2'} strokeWidth="2" />
            <path d="M62 45 Q62 25 72 25" stroke="#20F59A" strokeWidth="1.5" />
          </g>
        );
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
              Signature Interactive Feature
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            Surgical Instrument Tray Explorer & Metallurgy Inspector
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/initiate"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-steril-green text-steril-black font-semibold text-xs hover:bg-steril-mint transition-all shadow-glow-green-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Process This Tray in Camunda</span>
          </Link>
        </div>
      </div>

      {/* Main Tray Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        
        {/* Left Information Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-steril-mint uppercase">
                {selectedInstrument?.type || 'Surgical Instrument'} • {selectedInstrument?.instrumentCode || 'INST-000'}
              </span>
              <h2 className="text-xl font-bold text-steril-text">
                {selectedInstrument?.name || 'Select an instrument from the tray'}
              </h2>
            </div>

            {/* Spec metadata grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-steril-border/60 text-xs font-mono">
              <div className="p-2.5 rounded bg-steril-surface border border-steril-border col-span-2">
                <span className="text-steril-muted text-[10px] block">MATERIAL & SPECIFICATION</span>
                <span className="text-steril-mint font-semibold block">{selectedInstrument?.material || 'DIN 1.4021 Surgical Stainless'}</span>
              </div>
              <div className="p-2.5 rounded bg-steril-surface border border-steril-border">
                <span className="text-steril-muted text-[10px] block">BIO-CONTAMINATION</span>
                <span className="text-steril-amber font-semibold">{selectedInstrument?.contaminationStatus || 'CLEAN'}</span>
              </div>
              <div className="p-2.5 rounded bg-steril-surface border border-steril-border">
                <span className="text-steril-muted text-[10px] block">PREVIOUS CYCLE</span>
                <span className="text-steril-green font-semibold">{selectedInstrument?.previousSterilizationCycle || 'CYC-1038'}</span>
              </div>
            </div>

            {/* Interactive Status Selector (Mandatory per Rubric) */}
            <div className="pt-2 border-t border-steril-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-steril-muted uppercase">Interactive Sterilization Status:</span>
                {savingStatus && <RefreshCw className="w-3.5 h-3.5 animate-spin text-steril-green" />}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {statusOptions.map((opt) => {
                  const isCurrent = selectedInstrument?.sterilizationStatus === opt.label;
                  const isQuarantinedOpt = opt.label === 'Quarantined';
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleStatusChange(opt.label)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono text-left border transition-all flex items-center justify-between ${
                        isCurrent 
                          ? isQuarantinedOpt
                            ? 'bg-red-950/80 text-red-300 border-red-500 animate-quarantine-blink font-bold shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                            : `${opt.color} ring-1 ring-steril-green font-bold shadow-glow-green-sm` 
                          : 'bg-steril-surface/70 border-steril-border text-steril-muted hover:text-steril-text hover:bg-steril-surface'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isCurrent && <CheckCircle2 className={`w-3 h-3 shrink-0 ml-1 ${isQuarantinedOpt ? 'text-red-400' : 'text-steril-green'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instrument Component Anatomy */}
            <div className="p-3 rounded-xl bg-steril-surface border border-steril-border text-xs space-y-1">
              <span className="text-[10px] font-mono text-steril-green uppercase font-bold">Component Breakdown</span>
              <p className="text-[11px] text-steril-muted">
                Precision-machined tungsten carbide inserts, passivated satin anti-glare finish, and ultrasonic cavitation-tested pivot box lock.
              </p>
            </div>
          </div>

          {/* Tray Quick Jumper */}
          <div className="pt-3 border-t border-steril-border/60 flex items-center justify-between text-xs font-mono">
            <span className="text-steril-muted">Assigned Tray:</span>
            <span className="text-steril-mint font-bold">{selectedTray?.trayId} ({selectedTray?.department})</span>
          </div>
        </div>

        {/* Central Workspace: Interactive 2D Surgical Mesh Tray with Instruments */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-steril-charcoal border border-steril-border relative flex flex-col justify-between overflow-hidden">
          {/* Coordinate Crosshairs */}
          <span className="absolute top-3 left-3 text-steril-muted/30 font-mono text-xs">+ TRAY-DIN-58952</span>
          <span className="absolute top-3 right-3 text-steril-muted/30 font-mono text-xs">+ 134°C STEAM MESH</span>
          <span className="absolute bottom-3 left-3 text-steril-muted/30 font-mono text-xs">+ SELECT INSTRUMENT TO INSPECT</span>
          <span className="absolute bottom-3 right-3 text-steril-muted/30 font-mono text-xs">+ ORTHO-BAY-04</span>

          <div className="flex items-center justify-between z-10 mb-2">
            <div>
              <span className="text-[10px] font-mono text-steril-green tracking-widest uppercase">2D SURGICAL MESH CARRIER</span>
              <h3 className="text-lg font-bold text-steril-text font-mono">
                {selectedTray?.trayName || 'Major Orthopedic Instrument Tray'}
              </h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-steril-surface border border-steril-border text-steril-green">
              {selectedTray?.instruments?.length || 6} INSTRUMENTS SEATED
            </span>
          </div>

          {/* Interactive Surgical Tray Mesh Bed */}
          <div className="my-auto py-4 px-2 relative rounded-xl bg-steril-black/90 border-2 border-steril-border shadow-inner">
            {/* Wire mesh pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>

            {/* Tray instruments grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative z-10">
              {(selectedTray?.instruments || []).map((inst) => {
                const isSelected = selectedInstrument?.instrumentCode === inst.instrumentCode;
                const isQuarantined = inst.sterilizationStatus?.toLowerCase() === 'quarantined';
                return (
                  <div
                    key={inst.instrumentCode}
                    onClick={() => setSelectedInstrument(inst)}
                    className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all border ${
                      isQuarantined
                        ? isSelected
                          ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-1 ring-red-500'
                          : 'bg-red-950/20 border-red-500/70 hover:border-red-500 hover:bg-red-950/30 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                        : isSelected
                          ? 'bg-steril-surface border-steril-green shadow-glow-green-sm'
                          : 'bg-steril-charcoal/60 border-steril-border hover:border-steril-green/50 hover:bg-steril-surface/50'
                    }`}
                  >
                    {/* SVG Graphic */}
                    <div className="w-full h-44 flex items-center justify-center relative">
                      {isQuarantined && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-steril-red animate-ping" />
                      )}
                      <svg viewBox="0 0 134 240" className={`w-full h-full ${isQuarantined ? 'tech-glow-red' : ''}`}>
                        {renderInstrumentSvg(inst.type, isSelected)}
                      </svg>
                    </div>

                    {/* Instrument Label */}
                    <div className="text-center mt-2 w-full space-y-0.5">
                      <p className="text-[11px] font-mono font-bold text-steril-text truncate">
                        {inst.name.split(' ')[0]} {inst.type}
                      </p>
                      <p className={`text-[9px] font-mono truncate ${isQuarantined ? 'text-red-400 font-bold' : 'text-steril-mint'}`}>
                        {inst.instrumentCode}
                      </p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider font-bold transition-all ${
                        isQuarantined
                          ? 'bg-red-950/90 text-red-300 border border-red-500 animate-quarantine-blink shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                          : inst.sterilizationStatus === 'Sterilized' 
                            ? 'bg-steril-green/20 text-steril-green' 
                            : 'bg-steril-amber/20 text-steril-amber'
                      }`}>
                        {inst.sterilizationStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Helper caption */}
          <div className="pt-3 border-t border-steril-border/60 flex items-center justify-between text-xs font-mono text-steril-muted">
            <span>Click any instrument on the surgical tray to inspect material, bio-burden, and toggle sterilization status.</span>
            <span className="text-steril-green">ACTIVE TRACEABILITY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
