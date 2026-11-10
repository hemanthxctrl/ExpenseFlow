import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  // Modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup' | 'forgot'

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Initialize auth listener
  useEffect(() => {
    const client = getSupabase();
    setIsConfigured(isSupabaseConfigured());

    if (!client) {
      setLoading(false);
      return;
    }

    // Get current session
    client.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.warn('ExpenseFlow Auth session retrieval:', error.message);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.warn('ExpenseFlow Auth getSession error:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        showToast(`Welcome back, ${newSession.user.user_metadata?.display_name || newSession.user.email}!`, 'success');
      } else if (event === 'SIGNED_OUT') {
        showToast('Signed out of cloud account', 'info');
      } else if (event === 'PASSWORD_RECOVERY') {
        openAuthModal('reset');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [showToast, openAuthModal]);

  // Auth Operations
  const signIn = async (email, password) => {
    const client = getSupabase();
    if (!client) {
      showToast('Supabase is not configured. See Settings to connect your project.', 'error');
      return { error: new Error('Supabase not configured') };
    }

    try {
      setLoading(true);
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;
      closeAuthModal();
      return { data, error: null };
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    const client = getSupabase();
    if (!client) {
      showToast('Supabase is not configured. See Settings to connect your project.', 'error');
      return { error: new Error('Supabase not configured') };
    }

    try {
      setLoading(true);
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim()
          }
        }
      });

      if (error) throw error;

      if (data?.session) {
        showToast('Account created successfully!', 'success');
        closeAuthModal();
      } else {
        showToast('Account created! Please check your email to confirm registration.', 'info', 6000);
        closeAuthModal();
      }

      return { data, error: null };
    } catch (err) {
      showToast(err.message || 'Signup failed', 'error');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const client = getSupabase();
    if (!client) return;

    try {
      setLoading(true);
      await client.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
      showToast('Error during sign out', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    const client = getSupabase();
    if (!client) {
      showToast('Supabase is not configured', 'error');
      return { error: new Error('Supabase not configured') };
    }

    try {
      setLoading(true);
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/settings?action=reset-password`
      });

      if (error) throw error;
      showToast('Password reset email sent! Check your inbox.', 'success');
      setAuthModalMode('login');
      return { error: null };
    } catch (err) {
      showToast(err.message || 'Failed to send reset email', 'error');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    const client = getSupabase();
    if (!client) return { error: new Error('Supabase not configured') };

    try {
      setLoading(true);
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast('Password updated successfully!', 'success');
      closeAuthModal();
      return { error: null };
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: Boolean(user),
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

