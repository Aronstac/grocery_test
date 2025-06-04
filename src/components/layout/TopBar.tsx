import React from 'react';
import { Bell, Search, Menu, User, Globe2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const { currentUser } = useAppContext();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'uk' : 'en';
    i18n.changeLanguage(newLang);
  };

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
            placeholder={t('common.search')}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex items-center ml-auto space-x-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center text-gray-500 hover:text-gray-700"
          title={i18n.language === 'en' ? 'Switch to Ukrainian' : 'Перейти на англійську'}
        >
          <Globe2 size={20} />
          <span className="ml-1 text-sm font-medium hidden sm:inline">
            {i18n.language === 'en' ? 'UK' : 'EN'}
          </span>
        </button>

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
              {currentUser?.email}
            </p>
            <p className="text-xs text-gray-500">
              {t(`roles.${currentUser?.role}`)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;