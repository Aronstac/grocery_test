import React from 'react';
import { Bell, Search, Menu, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 flex items-center h-16 px-4 md:px-6 sticky top-0 z-10">
      <button 
        onClick={toggleSidebar}
        className="text-gray-500 hover:text-gray-700 mr-4"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex items-center ml-auto space-x-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
            3
          </span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 rounded-full p-2 text-blue-600">
            <User size={20} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;