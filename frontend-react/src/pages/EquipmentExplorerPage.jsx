import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, Layers, Wrench, ShieldCheck, PlayCircle, Eye, 
  ChevronRight, CheckCircle2, AlertTriangle, XCircle, ArrowRight
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function EquipmentExplorerPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Surgical instrument trays',
    'Diagnostic imaging equipment',
    'Endoscopy equipment',
    'Surgical tools',
    'Monitoring equipment',
    'Laboratory diagnostic devices'
  ];

  // Device technical line diagrams data & parts
  const deviceDiagrams = {
    'EQ-IMG-002': {
      title: 'Siemens Cios Alpha Mobile C-Arm',
      parts: [
        { id: 'p1', name: 'CMOS Flat Detector 30x30cm', type: 'Active Sensor', status: 'Optimal', coords: { cx: 240, cy: 70 } },
        { id: 'p2', name: 'High-Power Anode X-Ray Tube 25kW', type: 'Radiation Source', status: 'Inspected', coords: { cx: 70, cy: 190 } },
        { id: 'p3', name: 'Motorized Orbital C-Arm Arc (148°)', type: 'Kinematic Frame', status: 'Calibrated', coords: { cx: 160, cy: 110 } },
        { id: 'p4', name: 'Dual Laser Crosshair Aimer', type: 'Optical Alignment', status: 'Active', coords: { cx: 100, cy: 160 } },
        { id: 'p5', name: 'Heavy-Duty Mobile Counterbalanced Base', type: 'Chassis', status: 'Secured', coords: { cx: 230, cy: 220 } },
      ],
      svg: (activePart, exploded) => (
        <svg viewBox="0 0 320 280" className="w-full h-80">
          {/* Mobile Base */}
          <rect x={exploded ? "190" : "180"} y="200" width="110" height="50" rx="8" fill="#0B100E" stroke={activePart === 'p5' ? '#20F59A' : '#929A96'} strokeWidth="1.5" />
          <circle cx={exploded ? "205" : "195"} cy="250" r="10" fill="#050706" stroke="#929A96" strokeWidth="1.5" />
          <circle cx={exploded ? "285" : "275"} cy="250" r="10" fill="#050706" stroke="#929A96" strokeWidth="1.5" />

          {/* Vertical Column */}
          <line x1={exploded ? "245" : "235"} y1="200" x2={exploded ? "245" : "235"} y2="120" stroke="#929A96" strokeWidth="3" />
          <line x1={exploded ? "245" : "235"} y1="120" x2={exploded ? "180" : "165"} y2="120" stroke="#929A96" strokeWidth="2.5" />

          {/* Orbital C-Arm Arc */}
          <path
            d={exploded ? "M 240 50 A 130 130 0 0 0 60 210" : "M 240 70 A 110 110 0 0 0 70 190"}
            fill="none"
            stroke={activePart === 'p3' ? '#20F59A' : '#F5F7F6'}
            strokeWidth="3.5"
            strokeLinecap="round"
            className={activePart === 'p3' ? 'tech-glow' : ''}
          />

          {/* CMOS Flat Panel Detector (Top) */}
          <g transform={exploded ? "translate(220, 20)" : "translate(215, 45)"}>
            <rect x="0" y="0" width="50" height="40" rx="4" fill="#0B100E" stroke={activePart === 'p1' ? '#20F59A' : '#83F7C2'} strokeWidth={activePart === 'p1' ? "2.5" : "1.8"} className={activePart === 'p1' ? 'tech-glow' : ''} />
            <line x1="8" y1="12" x2="42" y2="12" stroke="#20F59A" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="8" y1="20" x2="42" y2="20" stroke="#20F59A" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="8" y1="28" x2="42" y2="28" stroke="#20F59A" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          {/* X-Ray Tube Assembly (Bottom) */}
          <g transform={exploded ? "translate(30, 190)" : "translate(50, 170)"}>
            <rect x="0" y="0" width="55" height="45" rx="6" fill="#0B100E" stroke={activePart === 'p2' ? '#20F59A' : '#929A96'} strokeWidth={activePart === 'p2' ? "2.5" : "1.8"} className={activePart === 'p2' ? 'tech-glow' : ''} />
            <circle cx="27" cy="22" r="12" fill="#050706" stroke="#20F59A" strokeWidth="1.2" />
            <path d="M22 22 L32 22 M27 17 L27 27" stroke="#20F59A" strokeWidth="1.5" />
          </g>

          {/* Laser Crosshair Beam */}
          <line x1="240" y1="85" x2="77" y2="190" stroke="#20F59A" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
        </svg>
      )
    },
    'EQ-TRAY-001': {
      title: 'Aesculap Orthopedic Major Joint Tray',
      parts: [
        { id: 't1', name: 'Perforated Stainless Mesh Basket', type: 'Sterilization Carrier', status: 'Cleaned', coords: { cx: 160, cy: 160 } },
        { id: 't2', name: 'Silicone Cushioned Instrument Racks', type: 'Fixation Brackets', status: 'Aligned', coords: { cx: 160, cy: 120 } },
        { id: 't3', name: 'Micro-Biological Sterile Filter Lid', type: 'Barrier Protection', status: 'Intact', coords: { cx: 160, cy: 50 } },
        { id: 't4', name: 'Safety Cam-Action Latches (x4)', type: 'Locking Mechanism', status: 'Engaged', coords: { cx: 40, cy: 150 } },
      ],
      svg: (activePart, exploded) => (
        <svg viewBox="0 0 320 280" className="w-full h-80">
          {/* Filter Lid */}
          <g transform={exploded ? "translate(30, 20)" : "translate(40, 60)"}>
            <rect x="0" y="0" width="240" height="45" rx="6" fill="#0B100E" stroke={activePart === 't3' ? '#20F59A' : '#83F7C2'} strokeWidth="1.8" className={activePart === 't3' ? 'tech-glow' : ''} />
            <circle cx="120" cy="22" r="12" fill="#050706" stroke="#20F59A" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="120" cy="22" r="6" fill="#20F59A" opacity="0.7" />
          </g>

          {/* Silicone Rack (Internal) */}
          <g transform={exploded ? "translate(50, 105)" : "translate(50, 115)"}>
            <rect x="0" y="0" width="220" height="30" rx="3" fill="#151D19" stroke={activePart === 't2' ? '#20F59A' : '#252C28'} strokeWidth="1.5" />
            <line x1="20" y1="0" x2="20" y2="30" stroke="#20F59A" strokeWidth="2" />
            <line x1="60" y1="0" x2="60" y2="30" stroke="#20F59A" strokeWidth="2" />
            <line x1="100" y1="0" x2="100" y2="30" stroke="#20F59A" strokeWidth="2" />
            <line x1="140" y1="0" x2="140" y2="30" stroke="#20F59A" strokeWidth="2" />
            <line x1="180" y1="0" x2="180" y2="30" stroke="#20F59A" strokeWidth="2" />
          </g>

          {/* Mesh Base Tray */}
          <g transform={exploded ? "translate(30, 165)" : "translate(35, 145)"}>
            <rect x="0" y="0" width="250" height="70" rx="8" fill="#0B100E" stroke={activePart === 't1' ? '#20F59A' : '#F5F7F6'} strokeWidth="2" className={activePart === 't1' ? 'tech-glow' : ''} />
            {/* Mesh pattern */}
            <line x1="20" y1="15" x2="230" y2="15" stroke="#929A96" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="20" y1="35" x2="230" y2="35" stroke="#929A96" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="20" y1="55" x2="230" y2="55" stroke="#929A96" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* Side Latches */}
          <rect x={exploded ? "18" : "25"} y={exploded ? "180" : "155"} width="10" height="25" rx="3" fill="#20F59A" />
          <rect x={exploded ? "282" : "285"} y={exploded ? "180" : "155"} width="10" height="25" rx="3" fill="#20F59A" />
        </svg>
      )
    },
    'EQ-ENDO-003': {
      title: 'Karl Storz Image1 S 4K Tower',
      parts: [
        { id: 'e1', name: '4K Ultra-HD Surgical Display 32"', type: 'Visual Output', status: 'Calibrated', coords: { cx: 160, cy: 50 } },
        { id: 'e2', name: 'Image1 S Rubina Camera Control Unit', type: 'Image Processor', status: 'Connected', coords: { cx: 160, cy: 110 } },
        { id: 'e3', name: 'Cold LED Light Source 300W', type: 'Illumination', status: 'Ready', coords: { cx: 160, cy: 150 } },
        { id: 'e4', name: 'Automated CO2 Laparo-Insufflator 50L', type: 'Pneumatics', status: 'Standby', coords: { cx: 160, cy: 195 } },
      ],
      svg: (activePart, exploded) => (
        <svg viewBox="0 0 320 280" className="w-full h-80">
          {/* Cart Frame */}
          <rect x="90" y="25" width="140" height="235" rx="6" fill="#0B100E" stroke="#252C28" strokeWidth="1.5" />
          <circle cx="105" cy="265" r="7" fill="#050706" stroke="#929A96" strokeWidth="1.5" />
          <circle cx="215" cy="265" r="7" fill="#050706" stroke="#929A96" strokeWidth="1.5" />

          {/* 4K Display (Top) */}
          <g transform={exploded ? "translate(70, 15)" : "translate(80, 35)"}>
            <rect x="0" y="0" width="160" height="60" rx="4" fill="#050706" stroke={activePart === 'e1' ? '#20F59A' : '#83F7C2'} strokeWidth="2" className={activePart === 'e1' ? 'tech-glow' : ''} />
            <circle cx="80" cy="30" r="14" fill="#111815" stroke="#20F59A" strokeWidth="1.2" />
            <text x="80" y="34" fill="#20F59A" fontSize="9" textAnchor="middle" fontFamily="monospace">4K UHD</text>
          </g>

          {/* Camera CCU */}
          <g transform={exploded ? "translate(85, 95)" : "translate(95, 105)"}>
            <rect x="0" y="0" width="130" height="35" rx="3" fill="#151D19" stroke={activePart === 'e2' ? '#20F59A' : '#929A96'} strokeWidth="1.5" />
            <circle cx="20" cy="17" r="4" fill="#20F59A" />
            <line x1="35" y1="17" x2="110" y2="17" stroke="#252C28" strokeWidth="2" />
          </g>

          {/* LED Light Source */}
          <g transform={exploded ? "translate(85, 145)" : "translate(95, 145)"}>
            <rect x="0" y="0" width="130" height="35" rx="3" fill="#151D19" stroke={activePart === 'e3' ? '#20F59A' : '#929A96'} strokeWidth="1.5" />
            <circle cx="25" cy="17" r="6" fill="#83F7C2" />
            <text x="75" y="21" fill="#83F7C2" fontSize="9" textAnchor="middle" fontFamily="monospace">LED 300W</text>
          </g>

          {/* CO2 Insufflator */}
          <g transform={exploded ? "translate(85, 195)" : "translate(95, 185)"}>
            <rect x="0" y="0" width="130" height="40" rx="3" fill="#151D19" stroke={activePart === 'e4' ? '#20F59A' : '#929A96'} strokeWidth="1.5" />
            <rect x="15" y="10" width="45" height="18" rx="2" fill="#050706" stroke="#20F59A" strokeWidth="1" />
            <text x="37" y="23" fill="#20F59A" fontSize="8" textAnchor="middle" fontFamily="monospace">50 L/M</text>
          </g>
        </svg>
      )
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const list = await sterilApi.getAllEquipment();
        setEquipmentList(list);
        if (list.length > 0) {
          // Default to C-Arm or first item
          const defaultItem = list.find(e => e.equipmentId === 'EQ-IMG-002') || list[0];
          setSelectedEquipment(defaultItem);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEquipment = selectedCategory === 'All'
    ? equipmentList
    : equipmentList.filter(e => e.category === selectedCategory);

  const currentDiagram = selectedEquipment && deviceDiagrams[selectedEquipment.equipmentId] 
    ? deviceDiagrams[selectedEquipment.equipmentId]
    : deviceDiagrams['EQ-IMG-002'];

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-steril-mint uppercase">
              Circuitloop-Inspired 2D Asset Explorer
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            Hospital Medical Asset Explorer & Technical Schematic Inspector
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
              isExploded
                ? 'bg-steril-green text-steril-black shadow-glow-green-sm'
                : 'bg-steril-charcoal border border-steril-border text-steril-text hover:border-steril-green/50'
            }`}
          >
            <span>{isExploded ? 'Assemble View' : 'Explode View'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Left Contextual Drawer + Central Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
        
        {/* Left Information Panel (Circuitloop style) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-steril-muted">
                {selectedEquipment?.category || 'Medical Technology'}
              </span>
              <h2 className="text-xl font-bold text-steril-text">
                {selectedEquipment?.name || 'High-Precision Device'}
              </h2>
            </div>

            <p className="text-xs text-steril-muted leading-relaxed">
              Medical grade capital device subject to DIN/EN autoclave compliance, scheduled bio-calibration, and multi-parameter traceability.
            </p>

            {/* Technical Attributes Table */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-steril-border/60 text-xs font-mono">
              <div className="p-2 rounded bg-steril-surface border border-steril-border">
                <span className="text-steril-muted text-[10px] block">ASSET ID</span>
                <span className="text-steril-green font-bold">{selectedEquipment?.equipmentId || 'EQ-000'}</span>
              </div>
              <div className="p-2 rounded bg-steril-surface border border-steril-border">
                <span className="text-steril-muted text-[10px] block">LOCATION</span>
                <span className="text-steril-text truncate block">{selectedEquipment?.location || 'Central CSSD'}</span>
              </div>
              <div className="p-2 rounded bg-steril-surface border border-steril-border">
                <span className="text-steril-muted text-[10px] block">MANUFACTURER</span>
                <span className="text-steril-mint truncate block">{selectedEquipment?.manufacturer || 'Siemens'}</span>
              </div>
              <div className="p-2 rounded bg-steril-surface border border-steril-border">
                <span className="text-steril-muted text-[10px] block">SERIAL NUMBER</span>
                <span className="text-steril-text truncate block">{selectedEquipment?.serialNumber || 'SN-8821'}</span>
              </div>
            </div>

            {/* Status Pills */}
            <div className="pt-2 border-t border-steril-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-steril-muted">Operational State:</span>
                <span className="px-2 py-0.5 rounded bg-steril-green/20 text-steril-green font-mono font-bold text-[11px]">
                  {selectedEquipment?.currentStatus || 'AVAILABLE'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-steril-muted">Calibration Status:</span>
                <span className="px-2 py-0.5 rounded bg-steril-mint/20 text-steril-mint font-mono font-bold text-[11px]">
                  {selectedEquipment?.calibrationStatus || 'VALID'}
                </span>
              </div>
            </div>

            {/* Selected Component Inspection Sub-Card */}
            {selectedPart && (
              <div className="p-3 rounded-xl bg-steril-surface border border-steril-green/40 shadow-glow-green-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-steril-green font-bold uppercase">{selectedPart.name}</span>
                  <span className="text-steril-mint text-[10px]">{selectedPart.status}</span>
                </div>
                <p className="text-[11px] text-steril-muted">Classification: {selectedPart.type}</p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-4 border-t border-steril-border/60">
            <button
              onClick={() => setIsExploded(!isExploded)}
              className="w-full py-2.5 rounded-xl bg-steril-green text-steril-black font-semibold text-xs hover:bg-steril-mint transition-all shadow-glow-green-sm flex items-center justify-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{isExploded ? 'Re-assemble Components' : 'Take It Apart (Explode View)'}</span>
            </button>
            <Link
              to="/initiate"
              className="w-full py-2 rounded-xl bg-steril-surface border border-steril-border hover:border-steril-green/50 text-steril-text font-medium text-xs transition-all flex items-center justify-center space-x-2"
            >
              <PlayCircle className="w-3.5 h-3.5 text-steril-green" />
              <span>Initiate Sterilization for Asset</span>
            </Link>
          </div>
        </div>

        {/* Central Workspace: 2D Interactive SVG Line-Art Canvas */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-steril-charcoal border border-steril-border relative flex flex-col justify-between overflow-hidden">
          {/* Corner crosshairs */}
          <span className="absolute top-3 left-3 text-steril-muted/30 font-mono text-xs">+</span>
          <span className="absolute top-3 right-3 text-steril-muted/30 font-mono text-xs">+</span>
          <span className="absolute bottom-3 left-3 text-steril-muted/30 font-mono text-xs">+</span>
          <span className="absolute bottom-3 right-3 text-steril-muted/30 font-mono text-xs">+</span>

          {/* Diagram Title & Explode state label */}
          <div className="flex items-center justify-between z-10">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-steril-green tracking-widest uppercase">TECHNICAL 2D WIREFRAME</span>
              <h3 className="text-lg font-bold text-steril-text font-mono">
                {currentDiagram.title}
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-steril-surface border border-steril-border text-steril-mint">
              {isExploded ? 'STATE: EXPLODED VIEW' : 'STATE: ASSEMBLED'}
            </span>
          </div>

          {/* Render 2D SVG Line Illustration */}
          <div className="my-auto py-4 relative flex items-center justify-center">
            {currentDiagram.svg(selectedPart?.id, isExploded)}

            {/* Clickable Hotspot Callout Markers */}
            {currentDiagram.parts.map((part) => (
              <button
                key={part.id}
                onClick={() => setSelectedPart(part)}
                style={{ left: `${(part.coords.cx / 320) * 100}%`, top: `${(part.coords.cy / 280) * 100}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20`}
              >
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  selectedPart?.id === part.id 
                    ? 'bg-steril-green shadow-glow-green scale-125' 
                    : 'bg-steril-black border border-steril-green/60 hover:bg-steril-green'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-steril-black"></span>
                </div>
                {/* Tooltip callout */}
                <div className="hidden group-hover:block absolute left-5 top-0 bg-steril-black/95 border border-steril-green px-2.5 py-1 rounded text-[11px] font-mono text-steril-text whitespace-nowrap shadow-glow-green-sm z-30">
                  {part.name}
                </div>
              </button>
            ))}
          </div>

          {/* Parts list strip below diagram */}
          <div className="pt-3 border-t border-steril-border/60 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-steril-muted uppercase whitespace-nowrap">Interactive Parts:</span>
            {currentDiagram.parts.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPart(p)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all whitespace-nowrap ${
                  selectedPart?.id === p.id
                    ? 'bg-steril-green text-steril-black font-bold'
                    : 'bg-steril-surface text-steril-muted hover:text-steril-text hover:bg-steril-border'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Category Selector Bar (Matching Circuitloop device tabs) */}
      <div className="p-3 rounded-2xl bg-steril-charcoal border border-steril-border flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-mono text-steril-muted uppercase px-2 whitespace-nowrap">Asset Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-steril-surface text-steril-green border border-steril-green/50 shadow-glow-green-sm'
                : 'text-steril-muted hover:text-steril-text hover:bg-steril-surface/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {filteredEquipment.map((eq) => {
          const isSelected = selectedEquipment?.equipmentId === eq.equipmentId;
          return (
            <div
              key={eq.equipmentId}
              onClick={() => {
                setSelectedEquipment(eq);
                setSelectedPart(null);
              }}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-steril-surface border-steril-green shadow-glow-green-sm'
                  : 'bg-steril-charcoal border-steril-border hover:border-steril-muted/50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-steril-mint font-semibold">{eq.equipmentId}</span>
                <span className={`w-2 h-2 rounded-full ${
                  eq.currentStatus === 'AVAILABLE' ? 'bg-steril-green' : 'bg-steril-amber'
                }`}></span>
              </div>
              <p className="text-xs font-bold text-steril-text mt-1 truncate">{eq.name}</p>
              <p className="text-[10px] text-steril-muted truncate">{eq.category}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
