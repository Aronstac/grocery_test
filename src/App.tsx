import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import Inventory from './pages/Inventory';
import Deliveries from './pages/Deliveries';
import Management from './pages/Management';
import RouteMap from './pages/driver/RouteMap';
import GasCard from './pages/driver/GasCard';
import ReportProblem from './pages/driver/ReportProblem';
import Scanner from './pages/warehouse/Scanner';
import Tasks from './pages/warehouse/Tasks';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './components/auth/AuthProvider';

function App() {
  return (
    <Router>
      <AppProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<RoleBasedDashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="management" element={<Management />} />
              
              {/* Driver Routes */}
              <Route path="route" element={<RouteMap />} />
              <Route path="gas-card" element={<GasCard />} />
              <Route path="report-problem" element={<ReportProblem />} />
              
              {/* Warehouse Worker Routes */}
              <Route path="scanner" element={<Scanner />} />
              <Route path="tasks" element={<Tasks />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </AppProvider>
    </Router>
  );
}

export default App;