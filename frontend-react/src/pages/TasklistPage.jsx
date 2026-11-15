import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Clock, UserCheck, AlertTriangle, Search, Filter, 
  CheckCircle2, RefreshCw, XCircle, ArrowRight, ShieldCheck, FileText
} from 'lucide-react';
import { sterilApi } from '../services/api';

export default function TasklistPage() {
  const [activeTab, setActiveTab] = useState('all'); // all, my, unassigned, completed, overdue
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Form State for completing task
  const [formData, setFormData] = useState({});

  const fetchTasks = async () => {
    try {
      let data = [];
      if (activeTab === 'my') {
        data = await sterilApi.getMyTasks('cssd-technician');
      } else if (activeTab === 'unassigned') {
        data = await sterilApi.getUnassignedTasks();
      } else if (activeTab === 'completed') {
        data = await sterilApi.getCompletedTasks();
      } else if (activeTab === 'overdue') {
        data = await sterilApi.getOverdueTasks();
      } else {
        data = await sterilApi.getAllTasks();
      }
      setTasks(data);
      if (data.length > 0 && !selectedTask) {
        setSelectedTask(data[0]);
        initializeTaskForm(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const initializeTaskForm = (task) => {
    if (!task) return;
    if (task.taskName.includes('Initial Inspection')) {
      setFormData({
        bioBurdenPassed: true,
        damageCheckPassed: true,
        initialInspectionPassed: 'true',
        intakeNotes: 'Gross visual inspection clear. Hinges articulated freely.',
      });
    } else if (task.taskName.includes('Cleaning Rework')) {
      setFormData({
        reworkMethod: 'ultrasonic_enzyme',
        proteinSwabPassed: 'true',
        cleaningPassed: true,
      });
    } else if (task.taskName.includes('Final Quality')) {
      setFormData({
        chemicalIndicatorPassed: true,
        barrierIntegrityPassed: true,
        drynessCheckPassed: 'true',
        finalApprovalPassed: 'true',
        qaNotes: 'Authorized for surgical release. All sterile barriers continuous.',
      });
    } else if (task.taskName.includes('Quality Inspection')) {
      setFormData({
        approved: 'true',
        visualPassed: true,
        notes: 'Chamber cycle 134°C verified. Autoclave log signed off.',
      });
    } else {
      setFormData({
        approved: 'true',
        engineerName: 'Marcus Vance, CBET',
        tolerancePassed: 'true',
        accuracyDriftPercent: 0.04,
      });
    }
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    initializeTaskForm(task);
  };

  const handleClaimTask = async (taskId) => {
    try {
      const updated = await sterilApi.claimTask(taskId, 'cssd_technician_01');
      setSelectedTask(updated);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    setCompleting(true);
    try {
      await sterilApi.completeTask(selectedTask.taskId, 'cssd_technician_01', formData);
      await fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to complete task', err);
    } finally {
      setCompleting(false);
    }
  };

  // Filter tasks by search and priority
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.requestId && t.requestId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-steril-black p-6 space-y-6 bg-tech-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-steril-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-steril-green animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-steril-mint uppercase">
              Camunda 8 User Task Execution Inbox
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-steril-text mt-0.5">
            Custom Hospital Tasklist & Quality Sign-Off Inbox
          </h1>
        </div>

        <button
          onClick={fetchTasks}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-steril-charcoal border border-steril-border hover:border-steril-green/50 text-xs font-mono text-steril-text transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-steril-green" />
          <span>REFRESH TASKS</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-steril-charcoal border border-steril-border">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'my', label: 'My Tasks' },
            { id: 'unassigned', label: 'Unassigned' },
            { id: 'completed', label: 'Completed' },
            { id: 'overdue', label: 'Overdue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-steril-surface text-steril-green border border-steril-green/40 shadow-glow-green-sm'
                  : 'text-steril-muted hover:text-steril-text hover:bg-steril-surface/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Priority */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-steril-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-steril-surface border border-steril-border text-xs font-mono text-steril-text placeholder-steril-muted focus:border-steril-green focus:outline-none w-44"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-steril-surface border border-steril-border text-xs font-mono text-steril-text focus:border-steril-green focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Main Task List & Form Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
        
        {/* Left Task List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-steril-charcoal border border-steril-border space-y-2">
              <CheckCircle2 className="w-8 h-8 text-steril-green mx-auto" />
              <p className="text-sm font-bold font-mono text-steril-text">Inbox Clear</p>
              <p className="text-xs text-steril-muted">No pending user tasks in this category.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTask?.taskId === task.taskId;
              return (
                <div
                  key={task.taskId}
                  onClick={() => handleSelectTask(task)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-steril-surface border-steril-green shadow-glow-green-sm'
                      : 'bg-steril-charcoal border-steril-border hover:border-steril-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-steril-green font-bold">{task.taskId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      task.priority === 'HIGH' || task.priority === 'URGENT'
                        ? 'bg-steril-red/20 text-steril-red border border-steril-red/40'
                        : 'bg-steril-surface text-steril-muted border border-steril-border'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-steril-text">{task.taskName}</h3>
                    <p className="text-xs font-mono text-steril-mint mt-0.5">
                      Batch #{task.requestId || 'REQ-GENERAL'} {task.trayId ? `• Tray ${task.trayId}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-steril-muted pt-1 border-t border-steril-border/60">
                    <span>Group: {task.candidateGroup}</span>
                    <span>{task.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Task Execution & Form Drawer */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-steril-charcoal border border-steril-border flex flex-col justify-between">
          {selectedTask ? (
            <div className="space-y-5">
              {/* Task Header */}
              <div className="flex items-center justify-between pb-3 border-b border-steril-border/60">
                <div>
                  <span className="text-[10px] font-mono text-steril-mint uppercase">
                    CAMUNDA USER TASK • {selectedTask.taskId}
                  </span>
                  <h2 className="text-xl font-bold text-steril-text">
                    {selectedTask.taskName}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  {!selectedTask.assignee && (
                    <button
                      type="button"
                      onClick={() => handleClaimTask(selectedTask.taskId)}
                      className="px-3 py-1.5 rounded-lg bg-steril-surface border border-steril-border hover:border-steril-green text-xs font-mono text-steril-green transition-all"
                    >
                      Claim Task
                    </button>
                  )}
                  <span className="px-2.5 py-1 rounded bg-steril-surface border border-steril-border text-xs font-mono text-steril-mint">
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              {/* Dynamic Task Form Content */}
              <div className="space-y-4">
                {selectedTask.taskName.includes('Initial Inspection') && (
                  <div className="space-y-4 text-xs font-mono">
                    <p className="text-steril-muted leading-relaxed">
                      CSSD Intake verification. Inspect instruments for gross organic residue, bone debris, and mechanical alignment prior to automated ultrasonic wash.
                    </p>

                    <div className="space-y-2 p-3 rounded-xl bg-steril-surface border border-steril-border">
                      <label className="flex items-center space-x-2.5 text-steril-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.bioBurdenPassed || false}
                          onChange={(e) => setFormData({ ...formData, bioBurdenPassed: e.target.checked })}
                          className="rounded bg-steril-black border-steril-border text-steril-green focus:ring-0"
                        />
                        <span>Gross Bio-Burden Check (Free of gross blood, bone tissue, and saline crusting)</span>
                      </label>
                      <label className="flex items-center space-x-2.5 text-steril-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.damageCheckPassed || false}
                          onChange={(e) => setFormData({ ...formData, damageCheckPassed: e.target.checked })}
                          className="rounded bg-steril-black border-steril-border text-steril-green focus:ring-0"
                        />
                        <span>Mechanical Damage & Joint Lubrication (No bent tips or loose hinge pins)</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-steril-muted">Inspection Outcome *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, initialInspectionPassed: 'true' })}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            formData.initialInspectionPassed === 'true'
                              ? 'bg-steril-green/20 border-steril-green text-steril-green font-bold'
                              : 'bg-steril-surface border-steril-border text-steril-muted'
                          }`}
                        >
                          ✓ Passed (Proceed to Washer)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, initialInspectionPassed: 'false' })}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            formData.initialInspectionPassed === 'false'
                              ? 'bg-steril-red/20 border-steril-red text-steril-red font-bold'
                              : 'bg-steril-surface border-steril-border text-steril-muted'
                          }`}
                        >
                          ✗ Failed (Tag for Rework)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-steril-muted">Technician Observations</label>
                      <textarea
                        rows={2}
                        value={formData.intakeNotes || ''}
                        onChange={(e) => setFormData({ ...formData, intakeNotes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text resize-none"
                      />
                    </div>
                  </div>
                )}

                {selectedTask.taskName.includes('Final Quality') && (
                  <div className="space-y-4 text-xs font-mono">
                    <p className="text-steril-muted leading-relaxed">
                      Final QA sign-off prior to releasing sterile barrier packaging to surgical theaters.
                    </p>

                    <div className="space-y-2 p-3 rounded-xl bg-steril-surface border border-steril-border">
                      <label className="flex items-center space-x-2.5 text-steril-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.chemicalIndicatorPassed || false}
                          onChange={(e) => setFormData({ ...formData, chemicalIndicatorPassed: e.target.checked })}
                          className="rounded bg-steril-black border-steril-border text-steril-green focus:ring-0"
                        />
                        <span>Chemical Indicator Class 5 (Uniform dark purple color change confirmed)</span>
                      </label>
                      <label className="flex items-center space-x-2.5 text-steril-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.barrierIntegrityPassed || false}
                          onChange={(e) => setFormData({ ...formData, barrierIntegrityPassed: e.target.checked })}
                          className="rounded bg-steril-black border-steril-border text-steril-green focus:ring-0"
                        />
                        <span>Packaging Sterile Barrier (Heat seals continuous, no perforations or dampness)</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-steril-muted">Authorization Decision *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, finalApprovalPassed: 'true' })}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            formData.finalApprovalPassed === 'true'
                              ? 'bg-steril-green/20 border-steril-green text-steril-green font-bold'
                              : 'bg-steril-surface border-steril-border text-steril-muted'
                          }`}
                        >
                          ✓ Approved for Surgical Release
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, finalApprovalPassed: 'false' })}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            formData.finalApprovalPassed === 'false'
                              ? 'bg-steril-red/20 border-steril-red text-steril-red font-bold'
                              : 'bg-steril-surface border-steril-border text-steril-muted'
                          }`}
                        >
                          ✗ Reject & Quarantine
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-steril-muted">QA Manager Release Signature & Stamp</label>
                      <textarea
                        rows={2}
                        value={formData.qaNotes || ''}
                        onChange={(e) => setFormData({ ...formData, qaNotes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Generic / Other Task Form */}
                {!selectedTask.taskName.includes('Initial Inspection') && !selectedTask.taskName.includes('Final Quality') && (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-steril-surface border border-steril-border">
                      <span className="text-steril-muted block mb-1">TASK PAYLOAD DATA:</span>
                      <pre className="text-[11px] text-steril-mint font-mono overflow-x-auto">
                        {selectedTask.formPayloadJson}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <label className="text-steril-muted">Sign-Off Notes</label>
                      <input
                        type="text"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-steril-surface border border-steril-border text-steril-text"
                        placeholder="Enter sign-off verification notes..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Task Submit Button */}
              {selectedTask.status !== 'COMPLETED' && (
                <div className="pt-4 border-t border-steril-border/60">
                  <button
                    type="button"
                    disabled={completing}
                    onClick={handleCompleteTask}
                    className="w-full py-3 rounded-xl bg-steril-green text-steril-black font-bold text-sm hover:bg-steril-mint transition-all shadow-glow-green flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {completing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>SUBMITTING USER TASK ACTION...</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Complete Task & Advance Workflow Engine</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center space-y-2 p-12">
              <FileText className="w-8 h-8 text-steril-muted mx-auto" />
              <p className="text-sm font-mono text-steril-text font-bold">Select a Task to Inspect</p>
              <p className="text-xs text-steril-muted">Click any task from the inbox on the left to review forms and complete decisions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
