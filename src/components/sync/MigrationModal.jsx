import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSync } from '../../context/SyncContext';
import { useFinance } from '../../context/FinanceContext';
import { CloudUpload, Database, ArrowRight, ShieldCheck, HardDrive } from 'lucide-react';

export const MigrationModal = () => {
  const { isMigrationModalOpen, closeMigrationModal, performMigration, dismissMigration } = useSync();
  const { transactions, budgets } = useFinance();

  if (!isMigrationModalOpen) return null;

  const txCount = transactions?.length || 0;
  const bgtCount = budgets?.length || 0;

  return (
    <Modal
      isOpen={isMigrationModalOpen}
      onClose={closeMigrationModal}
      title="Sync Existing Data to Cloud"
    >
      <div className="space-y-5">
        {/* Banner */}
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-brand-500/20 text-brand-400 shrink-0">
            <CloudUpload className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              New Account Detected
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              We found existing financial records saved locally on this browser. Would you like to upload them to your new cloud account so they sync across your phone and other devices?
            </p>
          </div>
        </div>

        {/* Local Data Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Local Transactions</p>
              <p className="text-lg font-bold text-slate-100">{txCount}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Local Budgets</p>
              <p className="text-lg font-bold text-slate-100">{bgtCount}</p>
            </div>
          </div>
        </div>

        {/* Reassurance note */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your local records remain safe on this device in all cases.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            variant="primary"
            className="flex-1 justify-center py-2.5"
            onClick={performMigration}
          >
            <CloudUpload className="w-4 h-4 mr-2" />
            Upload & Sync to Cloud
          </Button>

          <Button
            variant="ghost"
            className="flex-1 justify-center py-2.5 text-slate-400 hover:text-slate-200"
            onClick={dismissMigration}
          >
            Keep Local Only
          </Button>
        </div>
      </div>
    </Modal>
  );
};
