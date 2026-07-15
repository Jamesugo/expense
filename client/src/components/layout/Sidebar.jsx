import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, ListOrdered, BarChart2, Settings, LogOut, Wallet, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar',  icon: Calendar,         label: 'Calendar'  },
  { path: '/expenses',  icon: ListOrdered,       label: 'Expenses'  },
  { path: '/analytics', icon: BarChart2,         label: 'Analytics' },
  { path: '/settings',  icon: Settings,          label: 'Settings'  },
];

function NavItem({ path, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      onClick={onClick}
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-700/50">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
          <Wallet size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">ExpenseTracker</p>
          <p className="text-xs text-slate-400">Personal Finance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} {...item} onClick={onMobileClose} />
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
          ) : (
            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white dark:bg-[#1e2130] border-r border-slate-100 dark:border-slate-700/50 fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 w-64 h-full bg-white dark:bg-[#1e2130] z-50 shadow-2xl"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
