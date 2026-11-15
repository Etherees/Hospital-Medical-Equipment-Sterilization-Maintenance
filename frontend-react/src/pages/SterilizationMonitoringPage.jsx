import React, { useState, useEffect } from 'react';
import { 
  Activity, Thermometer, Gauge, Clock, ShieldCheck, AlertOctagon, 
  RefreshCw, CheckCircle2, AlertTriangle, Zap, Play, Pause, ChevronRight
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function SterilizationMonitoringPage() {
  const [machines, setMachines] = useState([]);
  const [selectedMachineCode, setSelectedMachineCode] = useState('AC-01');
  const [telemetry, setTelemetry] = useState(null);
  const [simulatingFailure, setSimulatingFailure] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cycle phases for sterilization
  const cyclePhases = [
    { name: 'STANDBY', label: 'Standby / Load' },
    { name: 'VACUUM_PURGE', label: 'Pulsed Vacuum Purge' },
    { name: 'STEAM_INJECTION', label: 'Steam Injection' },
    { name: 'STERILIZATION_HOLD', label: '134°C Exposure Hold' },
    { name: 'FAST_EXHAUST', label: 'Exhaust & Depressurize' },
    { name: 'VACUUM_DRYING', label: 'Heated Vacuum Dry' },
    { name: 'AERATION', label: 'Sterile Air Purge' },
  ];

  const fetchMachinesAndTelemetry = async () => {
    try {
      const list = await sterilApi.getAllAutoclaves();
      setMachines(list);
      const tele = await sterilApi.getAutoclaveTelemetry(selectedMachineCode);
      setTelemetry(tele);
    } catch (err) {
      console.error('Failed to fetch autoclave telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinesAndTelemetry();
    const interval = setInterval(fetchMachinesAndTelemetry, 2500);
    return () => clearInterval(interval);
  }, [selectedMachineCode]);

  const toggleFailureSimulation = async () => {
    const nextState = !simulatingFailure;
    setSimulatingFailure(nextState);
    await sterilApi.simulateAutoclaveFailure(selectedMachineCode, nextState);
    fetchMachinesAndTelemetry();
  };

  const isAlarm = telemetry?.chamberStatus?.includes('ALARM') || simulatingFailure;

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isAlarm ? 'bg-steril-red animate-ping' : 'bg-steril-green animate-pulse'}`}></span>
            <span className={`text-xs font-mono font-semibold tracking-wider uppercase ${isAlarm ? 'text-steril-red' : 'text-steril-mint'}`}>
              {isAlarm ? 'CRITICAL TELEMETRY ALARM: PRESSURE TRANSDUCER FAULT' : 'IoT Telemetry REST Connector Feed • Active Stream'}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            Autoclave Sterilization & Thermal Chamber Live Monitor
          </h1>
        </div>

        {/* Machine Switcher & Simulation Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center rounded-lg bg-steril-charcoal border border-steril-border p-1">
            {['AC-01', 'AC-02', 'AC-03'].map((code) => (
              <button
                key={code}
                onClick={() => setSelectedMachineCode(code)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  selectedMachineCode === code
                    ? 'bg-steril-surface text-steril-green border border-steril-green/40 shadow-glow-green-sm'
                    : 'text-steril-muted hover:text-steril-text'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            onClick={toggleFailureSimulation}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              simulatingFailure
                ? 'bg-steril-red text-white shadow-glow-red'
                : 'bg-steril-surface border border-steril-border hover:border-steril-red/50 text-steril-muted hover:text-steril-red'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{simulatingFailure ? 'Clear Failure Simulation' : 'Simulate Autoclave Failure'}</span>
          </button>
        </div>
      </div>

      {/* Main Monitoring Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[540px]">
        
        {/* Left Telemetry Gauges & Indicators */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-steril-muted uppercase">ACTIVE UNIT</span>
                <h2 className="text-lg font-bold text-steril-text font-mono">
                  {telemetry?.model || 'Siemens SteriGuard 660-X'}
                </h2>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                isAlarm ? 'bg-steril-red/20 text-steril-red border border-steril-red/50' : 'bg-steril-green/20 text-steril-green border border-steril-green/50'
              }`}>
                {telemetry?.chamberStatus || 'STERILIZING'}
              </span>
            </div>

            {/* Gauges Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Temperature Gauge */}
              <div className={`p-4 rounded-xl border relative overflow-hidden ${
                isAlarm ? 'bg-red-950/30 border-steril-red/60' : 'bg-steril-surface border-steril-border'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono text-steril-muted mb-1">
                  <span>CHAMBER TEMP</span>
                  <Thermometer className={`w-4 h-4 ${isAlarm ? 'text-steril-red' : 'text-steril-green'}`} />
                </div>
                <p className={`text-3xl font-bold font-mono tracking-tight ${isAlarm ? 'text-steril-red' : 'text-steril-green'}`}>
                  {telemetry?.currentTemperature?.toFixed(1) || '134.2'} °C
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t border-steril-border/60">
                  <span className="text-steril-muted">Target: 134.0°C</span>
                  <span className={isAlarm ? 'text-steril-red' : 'text-steril-mint'}>
                    {isAlarm ? 'UNDER TEMP' : '±0.2°C TOL'}
                  </span>
                </div>
              </div>

              {/* Pressure Gauge */}
              <div className={`p-4 rounded-xl border relative overflow-hidden ${
                isAlarm ? 'bg-red-950/30 border-steril-red/60' : 'bg-steril-surface border-steril-border'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono text-steril-muted mb-1">
                  <span>PRESSURE</span>
                  <Gauge className={`w-4 h-4 ${isAlarm ? 'text-steril-red' : 'text-steril-mint'}`} />
                </div>
                <p className={`text-3xl font-bold font-mono tracking-tight ${isAlarm ? 'text-steril-red' : 'text-steril-mint'}`}>
                  {telemetry?.currentPressure?.toFixed(2) || '2.22'} BAR
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t border-steril-border/60">
                  <span className="text-steril-muted">Target: 2.20 BAR</span>
                  <span className={isAlarm ? 'text-steril-red' : 'text-steril-green'}>
                    {isAlarm ? 'LOSS OF STEAM' : 'SATURATED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cycle Progress Bar */}
            <div className="p-3.5 rounded-xl bg-steril-surface border border-steril-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-steril-muted">CYCLE PROGRESS ({telemetry?.currentPhase || 'STERILIZATION_HOLD'}):</span>
                <span className="text-steril-green font-bold">{telemetry?.cycleProgressPercent || 78}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-steril-black overflow-hidden border border-steril-border">
                <div
                  className={`h-full transition-all duration-500 ${
                    isAlarm ? 'bg-steril-red' : 'bg-steril-green shadow-glow-green-sm'
                  }`}
                  style={{ width: `${telemetry?.cycleProgressPercent || 78}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-steril-muted">
                <span>Hold Time Remaining: 04:12 min</span>
                <span>Total Cycle: 18:00 min</span>
              </div>
            </div>

            {/* Chemical & Biological Indicators Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Chemical Indicator Strip */}
              <div className="p-3 rounded-xl bg-steril-surface border border-steril-border space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-steril-muted">CLASS 5 CHEMICAL STRIP</span>
                  <span className={`font-bold ${isAlarm ? 'text-steril-red' : 'text-steril-green'}`}>
                    {isAlarm ? 'FAIL (YELLOW)' : 'PASS (PURPLE)'}
                  </span>
                </div>
                {/* Visual strip representation */}
                <div className="flex items-center space-x-1.5 p-1 rounded bg-steril-black border border-steril-border">
                  <div className={`flex-1 h-4 rounded transition-all ${
                    isAlarm ? 'bg-amber-400' : 'bg-purple-800'
                  }`}></div>
                  <span className="text-[9px] font-mono text-steril-muted px-1">STEAM DYE</span>
                </div>
              </div>

              {/* Biological Indicator */}
              <div className="p-3 rounded-xl bg-steril-surface border border-steril-border space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-steril-muted">BIO-SPORE INCUBATION</span>
                  <span className={`font-bold ${isAlarm ? 'text-steril-red' : 'text-steril-mint'}`}>
                    {isAlarm ? 'CONTAMINATED' : 'NEGATIVE (CLEAR)'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-steril-muted">
                  <span className={`w-2 h-2 rounded-full ${isAlarm ? 'bg-steril-red' : 'bg-steril-green'}`}></span>
                  <span>G. stearothermophilus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Outbound REST Connector Status */}
          <div className="pt-3 border-t border-steril-border/60 flex items-center justify-between text-xs font-mono text-steril-muted">
            <span>REST URI: /api/autoclaves/{selectedMachineCode}/telemetry</span>
            <span className="text-steril-green">HTTP 200 OK</span>
          </div>
        </div>

        {/* Central Workspace: 2D Autoclave Machine Technical Schematic */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-steril-charcoal border border-steril-border relative flex flex-col justify-between overflow-hidden">
          {/* Coordinate Crosshairs */}
          <span className="absolute top-3 left-3 text-steril-muted/30 font-mono text-xs">+ SIEMENS-STERIGUARD-660X</span>
          <span className="absolute top-3 right-3 text-steril-muted/30 font-mono text-xs">+ 2D PRESSURE VESSEL</span>
          <span className="absolute bottom-3 left-3 text-steril-muted/30 font-mono text-xs">+ EN-285 COMPLIANT</span>
          <span className="absolute bottom-3 right-3 text-steril-muted/30 font-mono text-xs">+ REAL-TIME TELEMETRY</span>

          <div className="flex items-center justify-between z-10 mb-2">
            <div>
              <span className="text-[10px] font-mono text-steril-green tracking-widest uppercase">AUTOCLAVE MACHINE SCHEMATIC</span>
              <h3 className="text-lg font-bold text-steril-text font-mono">
                Autoclave Chamber Internal Architecture
              </h3>
            </div>
            <span className={`text-xs font-mono px-2.5 py-1 rounded border ${
              isAlarm ? 'bg-red-950 text-red-400 border-red-700' : 'bg-steril-surface text-steril-mint border-steril-border'
            }`}>
              {isAlarm ? 'ALARM: PRESSURE LOSS' : 'CHAMBER PRESSURE SEALED'}
            </span>
          </div>

          {/* 2D Autoclave SVG Cross-Section Illustration */}
          <div className="my-auto py-4 flex items-center justify-center">
            <svg viewBox="0 0 340 240" className="w-full h-80">
              {/* Outer Pressure Shell */}
              <rect x="20" y="20" width="300" height="200" rx="16" fill="#0B100E" stroke={isAlarm ? '#EF4444' : '#252C28'} strokeWidth="2.5" />
              
              {/* Thermal Jacket Heating Coils */}
              <rect x="34" y="34" width="272" height="172" rx="12" fill="#050706" stroke={isAlarm ? '#EF4444' : '#20F59A'} strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Radial Door Locking Lugs (Left) */}
              <rect x="14" y="45" width="10" height="18" rx="2" fill={isAlarm ? '#EF4444' : '#20F59A'} />
              <rect x="14" y="110" width="10" height="18" rx="2" fill={isAlarm ? '#EF4444' : '#20F59A'} />
              <rect x="14" y="175" width="10" height="18" rx="2" fill={isAlarm ? '#EF4444' : '#20F59A'} />

              {/* Internal Chamber Loading Trays (2 Tiers) */}
              <g transform="translate(50, 75)">
                {/* Upper Tray Mesh */}
                <rect x="0" y="0" width="230" height="30" rx="4" fill="#111815" stroke={isAlarm ? '#EF4444' : '#83F7C2'} strokeWidth="1.5" />
                <line x1="10" y1="15" x2="220" y2="15" stroke="#20F59A" strokeWidth="1" strokeDasharray="3 2" />
                <text x="115" y="19" fill="#F5F7F6" fontSize="9" textAnchor="middle" fontFamily="monospace">SURGICAL TRAY #1 (ORTHO JOINT)</text>
              </g>

              <g transform="translate(50, 130)">
                {/* Lower Tray Mesh */}
                <rect x="0" y="0" width="230" height="30" rx="4" fill="#111815" stroke={isAlarm ? '#EF4444' : '#83F7C2'} strokeWidth="1.5" />
                <line x1="10" y1="15" x2="220" y2="15" stroke="#20F59A" strokeWidth="1" strokeDasharray="3 2" />
                <text x="115" y="19" fill="#F5F7F6" fontSize="9" textAnchor="middle" fontFamily="monospace">SURGICAL TRAY #2 (CARDIOVASCULAR)</text>
              </g>

              {/* PT100 Resistance Temperature Detector Sensor Probe */}
              <g transform="translate(165, 20)">
                <line x1="0" y1="0" x2="0" y2="50" stroke={isAlarm ? '#EF4444' : '#20F59A'} strokeWidth="2.5" />
                <circle cx="0" cy="52" r="4" fill={isAlarm ? '#EF4444' : '#20F59A'} className={isAlarm ? 'animate-ping' : ''} />
                <text x="10" y="45" fill={isAlarm ? '#EF4444' : '#20F59A'} fontSize="8" fontFamily="monospace">PT100 PROBE: {telemetry?.currentTemperature?.toFixed(1) || '134.2'}°C</text>
              </g>

              {/* Steam Injection Manifold (Bottom) */}
              <g transform="translate(50, 175)">
                <line x1="20" y1="15" x2="210" y2="15" stroke="#20F59A" strokeWidth="2" />
                <circle cx="50" cy="15" r="3" fill="#20F59A" />
                <circle cx="115" cy="15" r="3" fill="#20F59A" />
                <circle cx="180" cy="15" r="3" fill="#20F59A" />
                {/* Steam plumes */}
                {!isAlarm && (
                  <>
                    <path d="M50 12 Q55 0 60 12" stroke="#20F59A" strokeWidth="1" opacity="0.6" fill="none" />
                    <path d="M115 12 Q120 0 125 12" stroke="#20F59A" strokeWidth="1" opacity="0.6" fill="none" />
                    <path d="M180 12 Q185 0 190 12" stroke="#20F59A" strokeWidth="1" opacity="0.6" fill="none" />
                  </>
                )}
              </g>

              {/* Vacuum Exhaust Port (Right) */}
              <g transform="translate(290, 105)">
                <rect x="0" y="0" width="25" height="15" rx="3" fill="#0B100E" stroke="#929A96" strokeWidth="1.5" />
                <path d="M5 8 L18 8 M14 4 L18 8 L14 12" stroke="#20F59A" strokeWidth="1.5" />
              </g>
            </svg>
          </div>

          {/* Sterilization Stage Stepper Bar */}
          <div className="pt-3 border-t border-steril-border/60">
            <span className="text-[10px] font-mono text-steril-muted uppercase mb-2 block">Cycle Sequence Stages:</span>
            <div className="flex items-center justify-between text-[10px] font-mono">
              {cyclePhases.map((phase, idx) => {
                const isCurrent = telemetry?.currentPhase === phase.name;
                return (
                  <div key={phase.name} className="flex flex-col items-center space-y-1">
                    <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      isCurrent 
                        ? 'bg-steril-green text-steril-black ring-2 ring-steril-green' 
                        : 'bg-steril-surface text-steril-muted border border-steril-border'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`text-[9px] truncate max-w-[65px] text-center ${
                      isCurrent ? 'text-steril-green font-bold' : 'text-steril-muted'
                    }`}>
                      {phase.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
