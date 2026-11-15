import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentExplorerPage from './pages/EquipmentExplorerPage';
import InstrumentTrayPage from './pages/InstrumentTrayPage';
import WorkflowInitiationPage from './pages/WorkflowInitiationPage';
import SterilizationMonitoringPage from './pages/SterilizationMonitoringPage';
import TasklistPage from './pages/TasklistPage';
import WorkflowTrackingPage from './pages/WorkflowTrackingPage';
import MaintenanceCalibrationPage from './pages/MaintenanceCalibrationPage';
import QualityReportsPage from './pages/QualityReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-steril-black text-steril-text flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/equipment" element={<EquipmentExplorerPage />} />
            <Route path="/trays" element={<InstrumentTrayPage />} />
            <Route path="/initiate" element={<WorkflowInitiationPage />} />
            <Route path="/monitoring" element={<SterilizationMonitoringPage />} />
            <Route path="/tasks" element={<TasklistPage />} />
            <Route path="/workflows" element={<WorkflowTrackingPage />} />
            <Route path="/workflows/:id" element={<WorkflowTrackingPage />} />
            <Route path="/calibration" element={<MaintenanceCalibrationPage />} />
            <Route path="/maintenance" element={<MaintenanceCalibrationPage />} />
            <Route path="/reports" element={<QualityReportsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
