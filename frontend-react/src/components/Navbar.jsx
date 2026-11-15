import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, ShieldCheck, Layers, PlayCircle, Eye, 
  CheckSquare, GitBranch, Cpu, Wrench, BarChart2 
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Equipment Explorer', path: '/equipment', icon: Cpu },
    { name: 'Instrument Trays', path: '/trays', icon: Layers },
    { name: 'Initiate Workflow', path: '/initiate', icon: PlayCircle },
    { name: 'Sterilization Monitoring', path: '/monitoring', icon: Eye },
    { name: 'Tasklist Inbox', path: '/tasks', icon: CheckSquare },
    { name: 'Workflow Tracking', path: '/workflows', icon: GitBranch },
    { name: 'Calibration', path: '/calibration', icon: ShieldCheck },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Quality Reports', path: '/reports', icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-steril-black/90 backdrop-blur-md border-b border-steril-border">
      {/* Top telemetry & status banner */}
      <div className="px-6 py-1.5 bg-steril-charcoal border-b border-steril-border/50 flex items-center justify-between text-xs text-steril-muted">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-steril-green font-mono font-medium tracking-wide">SYSTEM ONLINE</span>
          </div>
          <span className="text-steril-border">|</span>
          <span className="font-mono">CHAMBER: 134.2°C • 2.22 BAR</span>
          <span className="text-steril-border">|</span>
          <span className="font-mono">ZEEBE CAMUNDA 8: CONNECTED</span>
        </div>
        <div className="flex items-center space-x-4 font-mono">
          <span>HOSPITAL CSSD CONTROL PLATFORM</span>
          <span className="text-steril-border">|</span>
          <span className="text-steril-green">ISO 13485 / EN 285</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-steril-charcoal border border-steril-green/40 flex items-center justify-center group-hover:border-steril-green group-hover:shadow-glow-green transition-all">
            <Activity className="w-5 h-5 text-steril-green" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-wider font-mono text-steril-text">STERIL<span className="text-steril-green">FLOW</span></span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-steril-border text-steril-mint font-semibold">2.0</span>
            </div>
            <p className="text-[10px] text-steril-muted tracking-tight">SIEMENS HEALTHINEERS INSPIRED MEDICAL SUITE</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-steril-surface text-steril-green border border-steril-green/30 shadow-glow-green-sm'
                    : 'text-steril-muted hover:text-steril-text hover:bg-steril-charcoal/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-steril-green' : 'text-steril-muted'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <Link
            to="/initiate"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-steril-green text-steril-black font-semibold text-xs hover:bg-steril-mint transition-all shadow-glow-green-sm"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>New Cycle</span>
          </Link>
        </div>
      </div>

      {/* Mobile nav scrollable bar */}
      <div className="xl:hidden px-4 py-2 border-t border-steril-border/50 flex space-x-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                isActive ? 'bg-steril-green text-steril-black font-semibold' : 'text-steril-muted hover:text-steril-text'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
