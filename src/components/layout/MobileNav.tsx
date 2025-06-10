import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard,
  Package, 
  Truck, 
  Users, 
  Store,
  CreditCard,
  AlertCircle,
  Bell
} from 'lucide-react';

const MobileNav: React.FC = () => {
  const { user } = useAuth();

  const getNavItems = () => {
    const commonItems = [
      { path: '/', icon: <LayoutDashboard size={20} />, label: 'Home' },
    ];

    const roleSpecificItems = {
      admin: [
        { path: '/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/deliveries', icon: <Truck size={20} />, label: 'Deliveries' },
        { path: '/employees', icon: <Users size={20} />, label: 'Staff' },
      ],
      logistics_specialist: [
        { path: '/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/deliveries', icon: <Truck size={20} />, label: 'Deliveries' },
      ],
      driver: [
        { path: '/deliveries', icon: <Truck size={20} />, label: 'Deliveries' },
        { path: '/gas-cards', icon: <CreditCard size={20} />, label: 'Gas' },
      ],
      warehouse_worker: [
        { path: '/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/reports', icon: <AlertCircle size={20} />, label: 'Report' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[user?.role || 'warehouse_worker'] || [])];
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