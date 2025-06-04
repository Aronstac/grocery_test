import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  LayoutDashboard,
  Package, 
  Truck, 
  Users, 
  Map,
  CreditCard,
  AlertCircle,
  Scan,
  ClipboardList,
  Boxes
} from 'lucide-react';

const MobileNav: React.FC = () => {
  const { currentUser } = useAppContext();

  const getNavItems = () => {
    const commonItems = [
      { path: '/', icon: <LayoutDashboard size={20} />, label: 'Home' },
    ];

    const roleSpecificItems = {
      admin: [
        { path: '/inventory', icon: <Boxes size={20} />, label: 'Stock' },
        { path: '/deliveries', icon: <Truck size={20} />, label: 'Deliveries' },
        { path: '/management', icon: <Users size={20} />, label: 'Staff' },
      ],
      logistics_specialist: [
        { path: '/inventory', icon: <Package size={20} />, label: 'Stock' },
        { path: '/deliveries', icon: <Truck size={20} />, label: 'Deliveries' },
      ],
      driver: [
        { path: '/route', icon: <Map size={20} />, label: 'Route' },
        { path: '/gas-card', icon: <CreditCard size={20} />, label: 'Gas' },
        { path: '/report-problem', icon: <AlertCircle size={20} />, label: 'Report' },
      ],
      warehouse_worker: [
        { path: '/scanner', icon: <Scan size={20} />, label: 'Scan' },
        { path: '/tasks', icon: <ClipboardList size={20} />, label: 'Tasks' },
        { path: '/report-problem', icon: <AlertCircle size={20} />, label: 'Report' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[currentUser?.role || 'logistics_specialist'] || [])];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 text-xs ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`
            }
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;