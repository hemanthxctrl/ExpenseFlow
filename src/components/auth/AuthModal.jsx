import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Cloud
} from 'lucide-react';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    loading
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (authModalMode === 'reset') {
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }
      const { error } = await updatePassword(password);
      if (error) setFormError(error.message);
      return;
    }

    if (authModalMode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setFormError('Please enter a valid email address');
        return;
      }
      const { error } = await resetPassword(email);
      if (error) setFormError(error.message);
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (authModalMode === 'signup') {
      if (!displayName.trim()) {
        setFormError('Please enter your full name');
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) setFormError(error.message);
    } else {
      const { error } = await signIn(email, password);
      if (error) setFormError(error.message);
    }
  };

  const getTitle = () => {
    switch (authModalMode) {
      case 'signup':
        return 'Create Cloud Account';
      case 'forgot':
        return 'Reset Password';
      case 'reset':
        return 'Set New Password';
      case 'login':
      default:
        return 'Sign in to ExpenseFlow';
    }
  };

  const getSubtitle = () => {
    switch (authModalMode) {
      case 'signup':
        return 'Sync expenses, budgets and analytics across Android and Laptop';
      case 'forgot':
        return 'Enter your email to receive a password recovery link';
      case 'reset':
        return 'Enter your new secure account password';
      case 'login':
      default:
        return 'Access your multi-device financial ledger and cloud backups';
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={getTitle()}
      subtitle={getSubtitle()}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Mode Selector Tabs (Login vs Sign Up) */}
        {(authModalMode === 'login' || authModalMode === 'signup') && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-750">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setFormError('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authModalMode === 'login'
                  ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('signup');
                setFormError('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authModalMode === 'signup'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Display Name Input (Only on Sign Up) */}
        {authModalMode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Arjun Sharma"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]"
              />
            </div>
          </div>
        )}

        {/* Email Input (All modes except 'reset') */}
        {authModalMode !== 'reset' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]"
              />
            </div>
          </div>
        )}

        {/* Password Input (Login, Signup, Reset) */}
        {authModalMode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {authModalMode === 'reset' ? 'New Password *' : 'Password *'}
              </label>
              {authModalMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('forgot');
                    setFormError('');
                  }}
                  className="text-xs text-brand-500 hover:text-brand-400 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            className="py-3 font-bold text-sm min-h-[44px]"
          >
            {loading ? (
              'Processing...'
            ) : authModalMode === 'signup' ? (
              'Sign Up & Enable Cloud Sync'
            ) : authModalMode === 'forgot' ? (
              'Send Password Reset Link'
            ) : authModalMode === 'reset' ? (
              'Update Password'
            ) : (
              'Sign In & Sync'
            )}
          </Button>

          {authModalMode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setFormError('');
              }}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Back to Sign In
            </button>
          )}

          {/* Continue as Guest option */}
          <div className="pt-2 border-t border-slate-100 dark:border-navy-750 text-center">
            <button
              type="button"
              onClick={closeAuthModal}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Continue using offline local mode
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
