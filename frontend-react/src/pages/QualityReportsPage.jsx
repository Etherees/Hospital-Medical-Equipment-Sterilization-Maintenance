import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Download, ShieldCheck, CheckCircle2, AlertTriangle, 
  FileText, Activity, RefreshCw, Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { sterilApi } from '../services/api';

export default function QualityReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await sterilApi.getSummaryReport();
        setReportData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  // Pareto chart data for quality deviation causes
  const failurePareto = [
    { cause: 'Wet Pack Detected', count: 1, percent: '50%' },
    { cause: 'Bio-Burden Residue', count: 1, percent: '50%' },
    { cause: 'Pressure Drop Alarm', count: 0, percent: '0%' },
    { cause: 'Pouch Seal Tear', count: 0, percent: '0%' },
  ];

  const utilizationData = [
    { name: 'AC-01 (Siemens 660-X)', rate: 84, fill: '#20F59A' },
    { name: 'AC-02 (Getinge GSS)', rate: 62, fill: '#83F7C2' },
    { name: 'AC-03 (Plasma 45°C)', rate: 45, fill: '#929A96' },
  ];

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `STERILFLOW_ISO13485_AUDIT_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    let csv = "RequestID,Department,EquipmentID,Status,StartedAt,CleaningPassed,ChemIndicatorPassed\n";
    (reportData?.requests || []).forEach(r => {
      csv += `"${r.requestId}","${r.department}","${r.equipmentId}","${r.status}","${r.startedAt}","${r.cleaningPassed}","${r.chemicalIndicatorPassed}"\n`;
    });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `STERILFLOW_TRACEABILITY_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-steril-mint uppercase">
              Quality Assurance, Traceability & Regulatory Audit
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            ISO 13485 Sterilization Compliance & Audit Analytics
          </h1>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-steril-surface border border-steril-border hover:border-steril-green text-xs font-mono text-steril-text transition-all"
          >
            <Download className="w-3.5 h-3.5 text-steril-green" />
            <span>Export Traceability (CSV)</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-steril-green text-steril-black font-semibold text-xs hover:bg-steril-mint transition-all shadow-glow-green-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Regulatory Audit (JSON)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border">
          <span className="text-[10px] font-mono text-steril-muted uppercase">STERILIZATION SUCCESS</span>
          <p className="text-2xl font-bold font-mono text-steril-green mt-1">{reportData?.sterilizationComplianceRate || '99.2%'}</p>
          <p className="text-[10px] text-steril-muted mt-1">EN 285 / ISO 17665 Compliant</p>
        </div>
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border">
          <span className="text-[10px] font-mono text-steril-muted uppercase">SPORE NEGATIVE RATE</span>
          <p className="text-2xl font-bold font-mono text-steril-mint mt-1">{reportData?.biologicalIndicatorNegativeRate || '100.0%'}</p>
          <p className="text-[10px] text-steril-muted mt-1">Geobacillus Spore Clear</p>
        </div>
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border">
          <span className="text-[10px] font-mono text-steril-muted uppercase">BATCHES PROCESSED</span>
          <p className="text-2xl font-bold font-mono text-steril-text mt-1">{reportData?.totalBatchesProcessed || 18}</p>
          <p className="text-[10px] text-steril-muted mt-1">Complete Process History</p>
        </div>
        <div className="p-4 rounded-xl bg-steril-charcoal border border-steril-border">
          <span className="text-[10px] font-mono text-steril-muted uppercase">CALIBRATION CERTS</span>
          <p className="text-2xl font-bold font-mono text-steril-mint mt-1">{reportData?.calibrationCertificatesCount || 6}</p>
          <p className="text-[10px] text-steril-muted mt-1">ISO 17025 Traceable</p>
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Autoclave Utilization Rates */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-steril-border/60">
            <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
              Autoclave Fleet Utilization Rates (%)
            </h2>
            <span className="text-xs font-mono text-steril-mint">Target: &gt;70%</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} stroke="#929A96" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#929A96" fontSize={10} width={130} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B100E', borderColor: '#20F59A', borderRadius: '8px', color: '#F5F7F6' }}
                  itemStyle={{ color: '#20F59A', fontWeight: 'bold' }}
                  formatter={(value) => [`${value}%`, 'Utilization Rate']}
                />
                <Bar dataKey="rate" fill="#20F59A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Pareto Analysis */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-steril-border/60">
            <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
              Sterilization Deviation Pareto Breakdown
            </h2>
            <span className="text-xs font-mono text-steril-red">Corrective Actions Triggered</span>
          </div>

          <div className="space-y-3 pt-2">
            {failurePareto.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-steril-text">{item.cause}</span>
                  <span className="text-steril-mint font-bold">{item.count} incident(s) ({item.percent})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-steril-surface overflow-hidden border border-steril-border">
                  <div 
                    className="h-full bg-steril-amber"
                    style={{ width: `${item.count > 0 ? 50 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-steril-surface border border-steril-border text-xs font-mono text-steril-muted">
            Zero bio-contamination incidents escaped quarantine; 100% of non-conforming cycles resolved via enzymatic ultrasonic re-cleaning and 18-minute extended autoclave protocol.
          </div>
        </div>
      </div>

      {/* Historical Batch Traceability Log Table */}
      <div className="p-5 rounded-2xl bg-steril-charcoal border border-steril-border space-y-4">
        <h2 className="text-sm font-bold font-mono text-steril-text uppercase tracking-wider">
          Complete Batch & Instrument Traceability Audit Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] text-steril-muted border-b border-steril-border">
              <tr>
                <th className="pb-2">REQUEST ID</th>
                <th className="pb-2">ZEEBE PROCESS ID</th>
                <th className="pb-2">DEPARTMENT</th>
                <th className="pb-2">EQUIPMENT TARGET</th>
                <th className="pb-2">CLEANING CHECK</th>
                <th className="pb-2">CLASS 5 STRIP</th>
                <th className="pb-2">FINAL RELEASE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steril-border/40">
              {(reportData?.requests || []).map((r) => (
                <tr key={r.requestId} className="hover:bg-steril-surface/50 transition-colors">
                  <td className="py-2.5 font-bold text-steril-green">{r.requestId}</td>
                  <td className="py-2.5 text-steril-mint truncate max-w-[120px]">{r.processInstanceId}</td>
                  <td className="py-2.5 text-steril-text">{r.department}</td>
                  <td className="py-2.5 text-steril-muted">{r.equipmentId}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.cleaningPassed ? 'bg-steril-green/20 text-steril-green' : 'bg-steril-red/20 text-steril-red'
                    }`}>
                      {r.cleaningPassed ? 'PASSED' : 'REWORK'}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.chemicalIndicatorPassed ? 'bg-steril-green/20 text-steril-green' : 'bg-steril-red/20 text-steril-red'
                    }`}>
                      {r.chemicalIndicatorPassed ? 'VERIFIED' : 'FAILED'}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'COMPLETED' ? 'bg-steril-green/20 text-steril-green' : 'bg-steril-amber/20 text-steril-amber'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
