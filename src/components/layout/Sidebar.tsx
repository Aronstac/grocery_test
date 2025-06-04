import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package, 
  Truck, 
  Users, 
  BarChart2, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Map,
  CreditCard,
  AlertCircle,
  Scan,
  ClipboardList,
  Boxes
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../auth/AuthProvider';
import RoleSwitcher from '../auth/RoleSwitcher';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { currentUser } = useAppContext();
  const { signOut } = useAuth();

  const getNavItems = () => {
    const commonItems = [
      { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ];

    const roleSpecificItems = {
      admin: [
        { path: '/inventory', icon: <Boxes size={20} />, label: 'Inventory' },
        { path: '/deliveries', icon: <Truck size={20} />, label: 'Deliveries' },
        { path: '/management', icon: <Users size={20} />, label: 'Staff' },
        { path: '/reports', icon: <BarChart2 size={20} />, label: 'Analytics' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
      ],
      logistics_specialist: [
        { path: '/inventory', icon: <Package size={20} />, label: 'Stock Management' },
        { path: '/deliveries', icon: <Truck size={20} />, label: 'Delivery Tracking' },
        { path: '/reports', icon: <BarChart2 size={20} />, label: 'Reports' },
      ],
      driver: [
        { path: '/route', icon: <Map size={20} />, label: 'Navigation' },
        { path: '/gas-card', icon: <CreditCard size={20} />, label: 'Fuel Card' },
        { path: '/report-problem', icon: <AlertCircle size={20} />, label: 'Report Issue' },
      ],
      warehouse_worker: [
        { path: '/scanner', icon: <Scan size={20} />, label: 'Scan Items' },
        { path: '/tasks', icon: <ClipboardList size={20} />, label: 'Work Orders' },
        { path: '/report-problem', icon: <AlertCircle size={20} />, label: 'Report Issue' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[currentUser?.role || 'logistics_specialist'] || [])];
  };

  const navItems = getNavItems();

  return (
    <aside 
      className={`fixed top-0 left-0 h-full bg-blue-900 text-white transition-all duration-300 ease-in-out z-30
        ${isOpen ? 'w-64' : 'w-20'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        <div className={`flex items-center ${!isOpen && 'justify-center w-full'}`}>
          <Boxes className="text-blue-300 flex-shrink-0" size={28} />
          <h1 className={`ml-2 font-bold text-xl transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0 hidden lg:hidden'
          }`}>
            GroceryOps
          </h1>
        </div>
        <button 
          onClick={toggleSidebar} 
          className={`text-blue-300 hover:text-white transition-all p-1 rounded lg:block hidden ${
            !isOpen && 'absolute -right-3 top-6 bg-blue-900 shadow-md'
          }`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-6 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-2.5 px-4 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                  } ${!isOpen && 'lg:justify-center lg:px-2'}`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={`ml-3 font-medium transition-opacity duration-150 truncate ${
                  isOpen ? 'opacity-100' : 'opacity-0 hidden lg:hidden'
                }`}>
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {currentUser?.role === 'admin' && <RoleSwitcher />}

      <div className={`mt-auto border-t border-blue-800 p-4 ${!isOpen && 'lg:flex lg:justify-center'}`}>
        <button 
          onClick={signOut}
          className={`flex items-center text-blue-200 hover:text-white transition-colors ${
            !isOpen && 'lg:justify-center'
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`ml-2 transition-opacity duration-150 ${
            isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
          }`}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;