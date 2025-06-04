import React from 'react';
import { useAppContext } from '../context/AppContext';
import AdminDashboard from './admin/Dashboard';
import DriverDashboard from './driver/Dashboard';
import WarehouseDashboard from './warehouse/Dashboard';

const RoleBasedDashboard: React.FC = () => {
  const { currentUser } = useAppContext();

  switch (currentUser?.role) {
    case 'driver':
      return <DriverDashboard />;
    case 'warehouse_worker':
      return <WarehouseDashboard />;
    case 'admin':
    case 'logistics_specialist':
    default:
      return <AdminDashboard />;
  }
};

export default RoleBasedDashboard;