import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4 border border-brand-500/20 shadow-glow-violet">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
        404
      </h1>
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        The financial page you are looking for does not exist or has been moved.
      </p>
      <Button
        variant="primary"
        size="md"
        icon={Home}
        onClick={() => navigate('/')}
      >
        Return to Dashboard
      </Button>
    </div>
  );
};

