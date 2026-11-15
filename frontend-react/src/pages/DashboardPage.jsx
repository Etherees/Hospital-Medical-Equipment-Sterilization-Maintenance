import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ShieldCheck, AlertTriangle, Layers, Clock, CheckCircle2, 
  XCircle, Wrench, RefreshCw, ArrowUpRight, Zap, Play, Eye
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { sterilApi } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [simulatedOverdue, setSimulatedOverdue] = useState(false);
  const [activeDonutIndex, setActiveDonutIndex] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await sterilApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    setRefreshing(true);
    try {
      await fetchStats();
    } finally {
      // Keep smooth 360-degree rotation visible for 750ms
      setTimeout(() => {
        setIsSyncing(false);
        setRefreshing(false);
      }, 750);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-steril-black p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-steril-green font-mono text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>INITIALIZING COMMAND CENTRE TELEMETRY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-steril-mint uppercase">
              Operations Command Centre • Tier-1 Hospital CSSD
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-steril-text mt-1">
            Sterilization & Maintenance Telemetry Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualRefresh}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-steril-charcoal border border-steril-border hover:border-steril-green/50 active:scale-95 text-xs font-mono text-steril-text transition-all group disabled:opacity-70"
            title="Click to sync live telemetry data (animates rotation)"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-700 ${isSyncing ? 'animate-spin text-steril-green' : 'text-steril-muted group-hover:text-steril-green'}`} />
            <span>SYNC DATA</span>
          </button>
          <Link
            to="/initiate"
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-steril-green text-steril-black font-semibold text-xs hover:bg-steril-mint transition-all shadow-glow-green-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Sterilization Batch</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border relative overflow-hidden group hover:border-steril-green/50 transition-all">
          <span className="absolute top-2 right-2 text-steril-muted/30 text-xs font-mono">+</span>
          <p className="text-[11px] font-mono text-steril-muted uppercase tracking-wider">Registered Assets</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold font-mono text-steril-text">{stats?.totalEquipmentRegistered || 48}</p>
            <span className="text-xs font-mono text-steril-green">ACTIVE</span>
          </div>
          <p className="text-[10px] text-steril-muted mt-1">Full RFID & DIN Traceability</p>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border relative overflow-hidden group hover:border-steril-amber/50 transition-all">
          <span className="absolute top-2 right-2 text-steril-muted/30 text-xs font-mono">+</span>
          <p className="text-[11px] font-mono text-steril-muted uppercase tracking-wider">Awaiting Sterilization</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold font-mono text-steril-amber">{stats?.equipmentAwaitingSterilization || 6}</p>
            <span className="text-xs font-mono text-steril-amber">QUEUE</span>
          </div>
          <p className="text-[10px] text-steril-muted mt-1">Decontamination Intake Bay</p>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border relative overflow-hidden group hover:border-steril-green/50 transition-all">
          <span className="absolute top-2 right-2 text-steril-muted/30 text-xs font-mono">+</span>
          <p className="text-[11px] font-mono text-steril-muted uppercase tracking-wider">Cycles In Progress</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold font-mono text-steril-green">{stats?.sterilizationCyclesInProgress || 2}</p>
            <span className="text-xs font-mono text-steril-green animate-pulse">RUNNING</span>
          </div>
          <p className="text-[10px] text-steril-muted mt-1">134°C Porous Steam Hold</p>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border relative overflow-hidden group hover:border-steril-mint/50 transition-all">
          <span className="absolute top-2 right-2 text-steril-muted/30 text-xs font-mono">+</span>
          <p className="text-[11px] font-mono text-steril-muted uppercase tracking-wider">Sterilized & Released</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold font-mono text-steril-mint">{stats?.successfullySterilizedTrays || 134}</p>
            <span className="text-xs font-mono text-steril-mint">{stats?.sterilizationSuccessRate || 99.2}%</span>
          </div>
          <p className="text-[10px] text-steril-muted mt-1">Sterile Barrier Packaged</p>
        </div>
      </div>

      {/* Secondary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-xl bg-steril-surface border border-steril-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-steril-muted">FAILED CYCLES</p>
            <p className="text-lg font-bold font-mono text-steril-red">{stats?.failedSterilizationCycles || 0}</p>
          </div>
          <XCircle className="w-5 h-5 text-steril-red" />
        </div>
        <div className="p-3 rounded-xl bg-steril-surface border border-steril-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-steril-muted">CALIBRATION REQUIRED</p>
            <p className="text-lg font-bold font-mono text-steril-amber">{stats?.equipmentRequiringCalibration || 3}</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-steril-amber" />
        </div>
        <div className="p-3 rounded-xl bg-steril-surface border border-steril-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-steril-muted">UNDER MAINTENANCE</p>
            <p className="text-lg font-bold font-mono text-steril-muted">{stats?.equipmentUnderMaintenance || 2}</p>
          </div>
          <Wrench className="w-5 h-5 text-steril-muted" />
        </div>
        {(() => {
          const overdueCount = simulatedOverdue 
            ? ((stats?.overdueMaintenanceAlerts || 0) > 0 ? stats.overdueMaintenanceAlerts : 1) 
            : (stats?.overdueMaintenanceAlerts || 0);
          const hasAlert = overdueCount > 0;

          return (
            <div 
              onClick={() => setSimulatedOverdue(prev => !prev)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                hasAlert 
                  ? 'bg-red-950/30 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.35)]' 
                  : 'bg-steril-surface border-steril-border hover:border-steril-red/50'
              }`}
              title="Click to toggle/test realistic medical alarm strobe blink"
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-[10px] font-mono text-steril-muted">OVERDUE ALERTS</p>
                  {hasAlert && (
                    <span className="w-1.5 h-1.5 rounded-full bg-steril-red animate-ping" />
                  )}
                </div>
                <p className={`text-lg font-bold font-mono ${hasAlert ? 'text-steril-red animate-pulse' : 'text-steril-red'}`}>
                  {overdueCount}
                </p>
              </div>
              <AlertTriangle className={`w-5 h-5 ${hasAlert ? 'text-steril-red animate-alarm-blink' : 'text-steril-red opacity-60'}`} />
            </div>
          );
        })()}
      </div>

      {/* Analytics Visualizations: Chart & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-steril-charcoal border border-steril-border relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
                Sterilization Throughput & Thermal Stability Trend
              </h2>
              <p className="text-xs text-steril-muted">Weekly batch volumes and 134°C peak exposure compliance</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-steril-green">
                <span className="w-2 h-2 rounded-full bg-steril-green"></span>
                <span>Sterilized Trays</span>
              </span>
              <span className="flex items-center space-x-1 text-steril-amber">
                <span className="w-2 h-2 rounded-full bg-steril-amber"></span>
                <span>Reworked</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.sterilizationPerformanceChart || []}>
                <defs>
                  <linearGradient id="colorSteril" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20F59A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#20F59A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRework" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#929A96" fontSize={11} tickLine={false} />
                <YAxis stroke="#929A96" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B100E', borderColor: '#252C28', borderRadius: '8px', color: '#F5F7F6' }}
                  itemStyle={{ color: '#20F59A' }}
                />
                <Area type="monotone" dataKey="sterilized" stroke="#20F59A" strokeWidth={2} fillOpacity={1} fill="url(#colorSteril)" />
                <Area type="monotone" dataKey="reworked" stroke="#F59E0B" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRework)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Equipment Distribution */}
        {(() => {
          const distributionData = stats?.equipmentStatusDistribution || [];
          const totalAssets = distributionData.reduce((acc, curr) => acc + (curr.value || 0), 0);
          const activeSegment = activeDonutIndex !== null && distributionData[activeDonutIndex]
            ? distributionData[activeDonutIndex]
            : null;

          return (
            <div className="lg:col-span-4 p-5 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider mb-1">
                  Asset Status Distribution
                </h2>
                <p className="text-xs text-steril-muted">Fleet availability across hospital inventory</p>
              </div>

              {/* Donut Chart Container with Center Data Readout */}
              <div className="relative h-52 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                      onMouseLeave={() => setActiveDonutIndex(null)}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke={activeDonutIndex === index ? '#F5F7F6' : '#0B100E'}
                          strokeWidth={activeDonutIndex === index ? 2 : 1}
                          style={{ outline: 'none', cursor: 'pointer' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percent = totalAssets > 0 ? ((data.value / totalAssets) * 100).toFixed(0) : 0;
                          return (
                            <div className="px-2 py-0.5 rounded-md bg-[#0B100E]/95 border border-steril-green/80 shadow-[0_0_8px_rgba(32,245,154,0.3)] pointer-events-none select-none text-center whitespace-nowrap">
                              <span className="text-[11px] font-mono font-bold text-steril-green">
                                {data.value} Units
                              </span>
                              <span className="text-[10px] font-mono text-steril-mint ml-1">
                                ({percent}%)
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Data Readout Inside the Donut Hole (The Blank Area) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
                  <span 
                    className="text-3xl font-extrabold font-mono tracking-tight transition-all duration-200 drop-shadow-md"
                    style={{ color: activeSegment ? activeSegment.color : '#20F59A' }}
                  >
                    {activeSegment ? activeSegment.value : totalAssets}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-steril-muted uppercase tracking-wider max-w-[95px] truncate px-1">
                    {activeSegment ? activeSegment.name.split('/')[0].trim() : 'TOTAL FLEET'}
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-steril-mint mt-0.5">
                    {activeSegment 
                      ? `${((activeSegment.value / (totalAssets || 1)) * 100).toFixed(1)}%` 
                      : '100% ONLINE'}
                  </span>
                </div>
              </div>

              {/* Interactive Legend List */}
              <div className="space-y-1.5 pt-2 border-t border-steril-border/60">
                {distributionData.map((item, idx) => (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setActiveDonutIndex(idx)}
                    onMouseLeave={() => setActiveDonutIndex(null)}
                    className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeDonutIndex === idx 
                        ? 'bg-steril-surface border border-steril-border shadow-sm' 
                        : 'hover:bg-steril-surface/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className={activeDonutIndex === idx ? 'text-steril-text font-bold' : 'text-steril-muted'}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-steril-text">{item.value}</span>
                      <span className="text-[10px] font-mono text-steril-muted">
                        ({totalAssets > 0 ? ((item.value / totalAssets) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bottom Grid: Recent Workflows & Live Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Workflows */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-steril-charcoal border border-steril-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-steril-green" />
              <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
                Recent Camunda 8 Workflow Executions
              </h2>
            </div>
            <Link to="/workflows" className="text-xs font-mono text-steril-mint hover:underline flex items-center space-x-1">
              <span>View All Instances</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono text-steril-muted border-b border-steril-border">
                <tr>
                  <th className="pb-2">REQUEST ID</th>
                  <th className="pb-2">DEPARTMENT</th>
                  <th className="pb-2">EQUIPMENT</th>
                  <th className="pb-2">CURRENT STAGE</th>
                  <th className="pb-2">STATUS</th>
                  <th className="pb-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steril-border/40 font-mono">
                {(stats?.recentWorkflowExecutions || []).map((item) => (
                  <tr key={item.requestId} className="hover:bg-steril-surface/50 transition-colors">
                    <td className="py-2.5 font-bold text-steril-text">{item.requestId}</td>
                    <td className="py-2.5 text-steril-muted">{item.department}</td>
                    <td className="py-2.5 text-steril-mint">{item.equipmentId}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-steril-surface border border-steril-border text-[10px] text-steril-green font-semibold">
                        {item.stage}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'COMPLETED' ? 'bg-steril-green/20 text-steril-green' : 'bg-steril-amber/20 text-steril-amber'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        to={`/workflows/${item.processInstanceId}`}
                        className="inline-flex items-center space-x-1 text-steril-mint hover:text-steril-green"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Track</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Timeline */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-steril-charcoal border border-steril-border">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-4 h-4 text-steril-green" />
            <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
              Live CSSD Audit Log
            </h2>
          </div>

          <div className="space-y-4">
            {(stats?.liveActivityTimeline || []).map((t, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs">
                <span className="font-mono text-steril-muted text-[11px] whitespace-nowrap mt-0.5">
                  {t.time}
                </span>
                <div className="flex-1 space-y-0.5 border-l border-steril-border pl-3">
                  <p className="font-semibold text-steril-text">{t.title}</p>
                  <p className="text-steril-muted text-[11px]">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
