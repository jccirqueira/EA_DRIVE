
import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
  role: 'Admin' | 'User';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onLogout, role }) => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-chart-line' },
    { path: '/proposals', label: 'Propostas', icon: 'fa-file-invoice' },
    { path: '/kanban', label: 'Fluxo', icon: 'fa-table-columns' },
    { path: '/reports', label: 'Relatórios', icon: 'fa-file-export' },
    { path: '/settings', label: 'Configurações', icon: 'fa-cog' },
    { path: '/help', label: 'Ajuda', icon: 'fa-question-circle' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#85a839] text-white rounded-md md:hidden"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#252525] text-white transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col
      `}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#85a839] rounded flex items-center justify-center font-bold text-white">EA</div>
          <span className="text-xl font-bold text-[#85a839]">DRIVE</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-md transition-all
                ${isActive ? 'bg-[#85a839] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
              onClick={() => {
                if (window.innerWidth < 768) setIsOpen(false);
              }}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
               <i className="fas fa-user text-gray-300"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold truncate">Engenheiro EA</span>
              <span className="text-xs text-gray-400">{role}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-md transition-all"
          >
            <i className="fas fa-sign-out-alt w-5 text-center"></i>
            <span className="font-semibold">Sair</span>
          </button>

          <div className="px-4 pb-2 text-center text-[9px] text-gray-500 leading-tight">
            <p>© 2026 • Todos os direitos reservados</p>
            <p>Powered by Cacir Soluções Tecnológicas</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
