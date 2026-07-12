import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Palette, Lock, AlertTriangle, Globe, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { updateProfile, updateCurrency, updatePassword, deleteAccount } from '../api/index.js';
import { CURRENCIES } from '../utils/formatCurrency.js';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import toast from 'react-hot-toast';

function Section({ icon: Icon, title, children, delay = 0 }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
          <Icon size={17} className="text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Profile Form ─────────────────────────────────────────────────────────────
  const profileForm = useForm({ defaultValues: { name: user?.name || '', avatar: user?.avatar || '' } });
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const { data: res } = await updateProfile(data);
      updateUser(res.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Currency ──────────────────────────────────────────────────────────────────
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'USD');
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const handleCurrencyChange = async (code) => {
    setSelectedCurrency(code);
    setCurrencyLoading(true);
    try {
      await updateCurrency(code);
      updateUser({ currency: code });
      toast.success(`Currency changed to ${code}`);
    } catch {
      toast.error('Failed to update currency');
    } finally {
      setCurrencyLoading(false);
    }
  };

  // ── Password Form ─────────────────────────────────────────────────────────────
  const passwordForm = useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated!');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Delete Account ────────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      toast.success('Account deleted');
      logout();
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Section icon={User} title="Profile" delay={0}>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
              ) : (
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">Your email cannot be changed</p>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="settings-name">Display Name</label>
              <input
                id="settings-name"
                className="input"
                placeholder="Your name"
                {...profileForm.register('name', { required: true })}
              />
            </div>
            <div>
              <label className="label" htmlFor="settings-avatar">Avatar URL (optional)</label>
              <input
                id="settings-avatar"
                className="input"
                placeholder="https://example.com/avatar.jpg"
                {...profileForm.register('avatar')}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" delay={0.05}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</p>
              <p className="text-xs text-slate-400 mt-0.5">Switch between light and dark mode</p>
            </div>
            <div className="flex gap-2">
              {['light', 'dark'].map((t) => (
                <button
                  key={t}
                  onClick={() => theme !== t && toggleTheme()}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 capitalize
                    ${theme === t
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Currency */}
        <Section icon={Globe} title="Currency" delay={0.1}>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Select your preferred currency for displaying expense amounts.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CURRENCIES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleCurrencyChange(code)}
                  disabled={currencyLoading}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border transition-all duration-150
                    ${selectedCurrency === code
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 font-medium'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  <span>{label}</span>
                  {selectedCurrency === code && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Password */}
        {!user?.googleId && (
          <Section icon={Lock} title="Change Password" delay={0.15}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <label className="label" htmlFor="current-password">Current Password</label>
                <input id="current-password" type="password" className="input" {...passwordForm.register('currentPassword', { required: true })} />
              </div>
              <div>
                <label className="label" htmlFor="new-password">New Password</label>
                <input id="new-password" type="password" className="input" {...passwordForm.register('newPassword', { required: true, minLength: 6 })} />
              </div>
              <div>
                <label className="label" htmlFor="confirm-password">Confirm New Password</label>
                <input id="confirm-password" type="password" className="input" {...passwordForm.register('confirmPassword', { required: true })} />
              </div>
              <button type="submit" className="btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </Section>
        )}

        {/* Danger Zone */}
        <Section icon={AlertTriangle} title="Danger Zone" delay={0.2}>
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-red-400 dark:text-red-500 mt-0.5">
                Permanently delete your account and all expense data
              </p>
            </div>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger py-2 text-sm flex-shrink-0">
              Delete Account
            </button>
          </div>
        </Section>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This will permanently delete your account and ALL your expense data. This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
        loading={deleteLoading}
      />
    </div>
  );
}
