import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  iconColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel = 'from last month',
  trend = 'neutral',
  iconColor = 'bg-blue-100 text-blue-600'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          
          {change !== undefined && (
            <div className="mt-2 flex items-center">
              {trend === 'up' && (
                <span className="text-green-600 flex items-center text-sm font-medium">
                  <ArrowUpRight size={16} className="mr-1" />
                  {change}%
                </span>
              )}
              {trend === 'down' && (
                <span className="text-red-600 flex items-center text-sm font-medium">
                  <ArrowDownRight size={16} className="mr-1" />
                  {change}%
                </span>
              )}
              <span className="ml-1 text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>
        
        <div className={`rounded-full p-3 ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;