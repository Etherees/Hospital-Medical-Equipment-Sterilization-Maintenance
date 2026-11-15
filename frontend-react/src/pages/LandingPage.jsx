import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ShieldCheck, Cpu, ArrowRight, CheckCircle2, 
  Layers, Clock, AlertTriangle, Play, Sparkles, Thermometer, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-steril-black overflow-hidden bg-tech-grid">
      {/* Decorative technical coordinate crosshairs */}
      <div className="absolute top-6 left-6 text-steril-muted/30 font-mono text-xs select-none">+ 00° 00' 00" N</div>
      <div className="absolute top-6 right-6 text-steril-muted/30 font-mono text-xs select-none">+ CSSD-GRID-A1</div>
      <div className="absolute bottom-6 left-6 text-steril-muted/30 font-mono text-xs select-none">+ ISO-13485-2026</div>
      <div className="absolute bottom-6 right-6 text-steril-muted/30 font-mono text-xs select-none">+ CAMUNDA-ZEEBE-V8</div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-steril-charcoal border border-steril-green/30 text-xs font-mono text-steril-mint">
              <span className="w-1.5 h-1.5 rounded-full bg-steril-green animate-pulse"></span>
              <span>Siemens Healthineers Inspired Precision Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-steril-text leading-[1.1]">
              Every Instrument Has a <span className="text-steril-green">Second Life</span>. Every Cycle Has a <span className="text-steril-mint">Purpose</span>.
            </h1>

            <p className="text-base sm:text-lg text-steril-muted leading-relaxed max-w-2xl">
              STERILFLOW is an enterprise medical equipment sterilization and lifecycle maintenance management system. Engineered for high-acuity surgical theaters, powering end-to-end traceability, IoT autoclave telemetry, and Camunda 8 BPMN 2.0 orchestration.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-steril-green text-steril-black font-semibold text-sm hover:bg-steril-mint transition-all shadow-glow-green"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/workflows"
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-steril-charcoal border border-steril-border hover:border-steril-green/50 text-steril-text font-medium text-sm transition-all"
              >
                <Activity className="w-4 h-4 text-steril-green" />
                <span>Explore the Process</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-steril-border/60">
              <div>
                <p className="text-2xl font-bold font-mono text-steril-green">99.8%</p>
                <p className="text-xs text-steril-muted uppercase tracking-wider font-mono">Sterility Assurance</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-steril-text">134.0°C</p>
                <p className="text-xs text-steril-muted uppercase tracking-wider font-mono">EN 285 Steam Hold</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-steril-mint">100%</p>
                <p className="text-xs text-steril-muted uppercase tracking-wider font-mono">Audit Traceability</p>
              </div>
            </div>
          </div>

          {/* Right: Animated 2D Technical Sterilization Diagram */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-steril-charcoal/90 border border-steril-border p-6 shadow-2xl backdrop-blur-sm overflow-hidden">
              {/* Corner crosshairs */}
              <span className="absolute top-2 left-2 text-steril-muted/30 text-xs font-mono">+</span>
              <span className="absolute top-2 right-2 text-steril-muted/30 text-xs font-mono">+</span>
              <span className="absolute bottom-2 left-2 text-steril-muted/30 text-xs font-mono">+</span>
              <span className="absolute bottom-2 right-2 text-steril-muted/30 text-xs font-mono">+</span>

              <div className="flex items-center justify-between pb-4 border-b border-steril-border/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-steril-green animate-pulse"></div>
                  <span className="text-xs font-mono font-semibold text-steril-text uppercase tracking-wider">Live Cycle Simulation</span>
                </div>
                <span className="text-[11px] font-mono text-steril-mint bg-steril-surface px-2 py-0.5 rounded border border-steril-border">
                  AUTOCLAVE AC-01
                </span>
              </div>

              {/* 2D Autoclave SVG Schematic */}
              <div className="py-6 flex justify-center">
                <svg viewBox="0 0 320 220" className="w-full h-48">
                  {/* Outer Pressure Vessel Walls */}
                  <rect x="20" y="20" width="280" height="180" rx="14" fill="#0B100E" stroke="#252C28" strokeWidth="2" />
                  <rect x="35" y="35" width="250" height="150" rx="8" fill="#050706" stroke="#20F59A" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Radial door lugs */}
                  <circle cx="20" cy="50" r="4" fill="#20F59A" />
                  <circle cx="20" cy="110" r="4" fill="#20F59A" />
                  <circle cx="20" cy="170" r="4" fill="#20F59A" />

                  {/* Chamber Trays (Mesh) */}
                  <line x1="55" y1="90" x2="265" y2="90" stroke="#83F7C2" strokeWidth="2" strokeDasharray="4 2" />
                  <line x1="55" y1="140" x2="265" y2="140" stroke="#83F7C2" strokeWidth="2" strokeDasharray="4 2" />

                  {/* Top Surgical Instruments (2D wireframe silhouettes) */}
                  <path d="M75 82 L110 82 M100 78 L115 82 L100 86" stroke="#F5F7F6" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M135 84 L175 84 M135 80 L145 84 L135 88" stroke="#F5F7F6" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M200 81 L245 81" stroke="#20F59A" strokeWidth="2" strokeLinecap="round" />

                  {/* Bottom Tray Instruments */}
                  <path d="M75 132 L120 132" stroke="#F5F7F6" strokeWidth="1.5" />
                  <path d="M140 132 L190 132" stroke="#20F59A" strokeWidth="1.8" />
                  <path d="M210 132 L250 132" stroke="#F5F7F6" strokeWidth="1.5" />

                  {/* Temperature Sensor Probe */}
                  <line x1="160" y1="20" x2="160" y2="60" stroke="#20F59A" strokeWidth="2" />
                  <circle cx="160" cy="62" r="3" fill="#20F59A" className="animate-ping" />

                  {/* Steam injection lines */}
                  <path d="M50 165 Q60 155 70 165 T90 165" stroke="#20F59A" strokeWidth="1" opacity="0.6" fill="none" />
                  <path d="M110 165 Q120 155 130 165 T150 165" stroke="#20F59A" strokeWidth="1" opacity="0.6" fill="none" />
                  <path d="M170 165 Q180 155 190 165 T210 165" stroke="#20F59A" strokeWidth="1" opacity="0.6" fill="none" />
                  <path d="M230 165 Q240 155 250 165 T270 165" stroke="#20F59A" strokeWidth="1" opacity="0.6" fill="none" />
                </svg>
              </div>

              {/* Real-time status cards */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-steril-border/60">
                <div className="p-2.5 rounded-lg bg-steril-surface border border-steril-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-steril-muted">CHAMBER TEMP</p>
                    <p className="text-sm font-mono font-bold text-steril-green">134.2 °C</p>
                  </div>
                  <Thermometer className="w-4 h-4 text-steril-green" />
                </div>
                <div className="p-2.5 rounded-lg bg-steril-surface border border-steril-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-steril-muted">PRESSURE</p>
                    <p className="text-sm font-mono font-bold text-steril-mint">2.22 BAR</p>
                  </div>
                  <Gauge className="w-4 h-4 text-steril-mint" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-mono uppercase tracking-widest text-steril-green mb-2">Architectural Modules</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-steril-text">
            Engineered for Uncompromising Clinical Compliance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Link to="/equipment" className="group p-6 rounded-2xl bg-steril-charcoal/80 border border-steril-border hover:border-steril-green/50 transition-all hover:shadow-glow-green-sm">
            <div className="w-12 h-12 rounded-xl bg-steril-surface border border-steril-border flex items-center justify-center text-steril-green group-hover:border-steril-green transition-all mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-steril-text group-hover:text-steril-green transition-colors">
              Equipment Explorer
            </h3>
            <p className="text-xs text-steril-muted mt-2 leading-relaxed">
              Circuitloop-inspired 2D technical exploded wireframe diagrams for surgical trays, C-Arms, and 4K laparoscopic towers with component-level inspection.
            </p>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono text-steril-mint group-hover:translate-x-1 transition-transform">
              <span>Inspect devices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link to="/trays" className="group p-6 rounded-2xl bg-steril-charcoal/80 border border-steril-border hover:border-steril-green/50 transition-all hover:shadow-glow-green-sm">
            <div className="w-12 h-12 rounded-xl bg-steril-surface border border-steril-border flex items-center justify-center text-steril-mint group-hover:border-steril-mint transition-all mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-steril-text group-hover:text-steril-mint transition-colors">
              Instrument Tray Explorer
            </h3>
            <p className="text-xs text-steril-muted mt-2 leading-relaxed">
              Interactive 2D top-down surgical instrument tray. Select Mayo scissors, tissue forceps, needle holders, and clamps to review DIN metallurgy and bio-burden.
            </p>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono text-steril-mint group-hover:translate-x-1 transition-transform">
              <span>View tray layout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/workflows" className="group p-6 rounded-2xl bg-steril-charcoal/80 border border-steril-border hover:border-steril-green/50 transition-all hover:shadow-glow-green-sm">
            <div className="w-12 h-12 rounded-xl bg-steril-surface border border-steril-border flex items-center justify-center text-steril-green group-hover:border-steril-green transition-all mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-steril-text group-hover:text-steril-green transition-colors">
              Camunda 8 Workflow Core
            </h3>
            <p className="text-xs text-steril-muted mt-2 leading-relaxed">
              Executable BPMN 2.0 with parallel Multi-Instance tray processing, Bio-Contamination Quarantine Sub-Process, and Biomedical Engineer Calibration Call Activity.
            </p>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono text-steril-mint group-hover:translate-x-1 transition-transform">
              <span>Track live instances</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
