import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Shield, Users, Truck, PackageSearch } from 'lucide-react';

const RoleSwitcher: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppContext();

  if (!currentUser) return null;

  const roles = [
    { id: 'admin', label: 'Administrator', icon: Shield },
    { id: 'logistics_specialist', label: 'Logistics Manager', icon: Users },
    { id: 'driver', label: 'Delivery Driver', icon: Truck },
    { id: 'warehouse_worker', label: 'Warehouse Staff', icon: PackageSearch }
  ] as const;

  const handleRoleChange = (roleId: typeof roles[number]['id']) => {
    setCurrentUser(currentUser ? { ...currentUser, role: roleId } : null);
  };

  return (
    <div className="px-4 py-3 border-t border-blue-800">
      <div className="flex items-center mb-3">
        <Shield size={16} className="text-blue-300 mr-2" />
        <span className="text-sm font-medium text-blue-300 lg:hidden">Switch Role</span>
      </div>
      <div className="space-y-1.5">
        {roles.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleRoleChange(id)}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
              currentUser.role === id
                ? 'bg-blue-700 text-white font-medium'
                : 'text-blue-100 hover:bg-blue-800/50'
            }`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="ml-2.5 truncate lg:hidden">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSwitcher;