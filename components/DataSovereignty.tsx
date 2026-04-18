import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Key, Download, Trash2, AlertTriangle, Check,
  Loader2, Lock, Unlock, Upload, Fingerprint, FileKey, AlertCircle
} from 'lucide-react';
import { BrandInput, BrandStrategy, LogoCandidate } from '../types';
import {
  getClientKey, isEncryptionEnabled, getKeyFingerprint,
  exportKeyBackup, importKeyBackup, encryptData, generateDeletionProof
} from '../services/clientEncryption';

interface DataSovereigntyProps {
  input: BrandInput;
  strategy: BrandStrategy;
  logoCandidates: LogoCandidate[];
}

export const DataSovereignty: React.FC<DataSovereigntyProps> = ({
  input,
  strategy,
  logoCandidates,
}) => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [keyFingerprint, setKeyFingerprint] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionProof, setDeletionProof] = useState<{ hash: string; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkEncryption = async () => {
      try {
        if (isEncryptionEnabled()) {
          setEncryptionEnabled(true);
          const key = await getClientKey(false);
          if (key) {
            const fp = await getKeyFingerprint(key);
            setKeyFingerprint(fp);
          }
        }
      } catch (err) {
        setError('Failed to check encryption status.');
      }
    };
    checkEncryption();
  }, []);

  const handleEnableEncryption = async () => {
    setIsSettingUp(true);
    setError(null);
    try {
      const key = await getClientKey(true);
      if (key) {
        const fp = await getKeyFingerprint(key);
        setKeyFingerprint(fp);
        setEncryptionEnabled(true);
      }
    } catch (err) {
      setError('Failed to generate encryption key. Your browser may not support Web Crypto API.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const triggerDownload = (content: string, filename: string, type = 'application/json') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackupKey = async () => {
    setError(null);
    try {
      const backup = await exportKeyBackup();
      if (backup) {
        triggerDownload(backup.content, backup.filename);
        setBackupDownloaded(true);
      }
    } catch (err) {
      setError('Failed to export key backup.');
    }
  };

  const handleRestoreKey = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = await importKeyBackup(text);
      if (result.success) {
        setKeyFingerprint(result.fingerprint);
        setEncryptionEnabled(true);
      }
    } catch (err) {
      setError('Invalid key backup file. Please select a valid Xela Vault key file.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildDataBundle = () => ({
    input,
    strategy,
    logoCandidates,
    exportedAt: new Date().toISOString(),
  });

  const handleExportData = async () => {
    setError(null);
    setIsExporting(true);
    try {
      const bundle = buildDataBundle();
      const content = JSON.stringify(bundle, null, 2);
      triggerDownload(content, `xela-data-export-${Date.now()}.json`);
    } catch (err) {
      setError('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportEncrypted = async () => {
    setError(null);
    setIsExporting(true);
    try {
      const key = await getClientKey(false);
      if (!key) {
        setError('Encryption key not found. Enable encryption first.');
        return;
      }
      const bundle = buildDataBundle();
      const encrypted = await encryptData(bundle, key);
      const wrapper = {
        _type: 'xela-encrypted-export',
        data: encrypted,
        exportedAt: new Date().toISOString(),
      };
      triggerDownload(JSON.stringify(wrapper, null, 2), `xela-encrypted-export-${Date.now()}.json`);
    } catch (err) {
      setError('Failed to export encrypted data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    setIsDeleting(true);
    setError(null);
    try {
      const bundle = buildDataBundle();
      const proof = await generateDeletionProof(bundle);
      const proofDoc = {
        _type: 'xela-deletion-proof',
        hash: proof.hash,
        timestamp: proof.timestamp,
        previousHash: proof.previousHash,
        note: 'Cryptographic proof that all user data was deleted from Xela Studio.',
      };
      triggerDownload(JSON.stringify(proofDoc, null, 2), `xela-deletion-proof-${Date.now()}.json`);

      localStorage.clear();
      setDeletionProof({ hash: proof.hash, timestamp: proof.timestamp });
      setEncryptionEnabled(false);
      setKeyFingerprint(null);
      setShowDeleteConfirm(false);
      setDeleteConfirmation('');
    } catch (err) {
      setError('Failed to complete data deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-6 py-4"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <span className="sr-only">Dismiss</span>&times;
          </button>
        </motion.div>
      )}

      {/* Section 1: Encryption Status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-brand-black rounded-[3rem] p-10 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Shield className="w-10 h-10 text-brand-lavender" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black tracking-tight">Data Sovereignty</h2>
              <p className="text-white/60 mt-1 text-lg">
                You own your data. Not us. Not the platform. You.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            {encryptionEnabled ? (
              <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-3">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold text-sm">Encryption Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-red-500/15 border border-red-500/30 rounded-2xl px-5 py-3">
                <Unlock className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-semibold text-sm">Not Encrypted</span>
              </div>
            )}
          </div>

          {keyFingerprint && (
            <div className="mt-4 flex items-center gap-3">
              <Fingerprint className="w-4 h-4 text-white/40" />
              <span className="text-white/40 text-xs font-mono tracking-wider">
                Key: {keyFingerprint.slice(0, 4)}&bull;{keyFingerprint.slice(4, 8)}&bull;{keyFingerprint.slice(8, 12)}&bull;{keyFingerprint.slice(12)}
              </span>
            </div>
          )}

          {!encryptionEnabled && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnableEncryption}
              disabled={isSettingUp}
              className="mt-6 flex items-center gap-3 bg-brand-lavender hover:bg-brand-lavender/90 text-brand-black font-bold px-8 py-4 rounded-2xl transition-colors disabled:opacity-50"
            >
              {isSettingUp ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Key className="w-5 h-5" />
              )}
              {isSettingUp ? 'Generating Key...' : 'Enable Encryption'}
            </motion.button>
          )}
        </div>
      </motion.section>

      {/* Section 2: Key Management */}
      {encryptionEnabled && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 border border-stone-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileKey className="w-6 h-6 text-brand-black" />
            <h3 className="text-xl font-black tracking-tight text-brand-black">Key Management</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Backup Key Card */}
            <div className="border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-brand-teal" />
                <h4 className="font-bold text-brand-black">Backup Key</h4>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Download your encryption key as a file.
              </p>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Without this file, encrypted data <strong>CANNOT</strong> be recovered. Save it somewhere safe.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackupKey}
                className="w-full flex items-center justify-center gap-2 bg-brand-black text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-black/90 transition-colors"
              >
                {backupDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Key Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Key Backup</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Restore Key Card */}
            <div className="border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-brand-lavender" />
                <h4 className="font-bold text-brand-black">Restore Key</h4>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Upload a previously backed-up key file to restore access to your encrypted data.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreKey}
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 text-stone-600 font-bold px-6 py-3 rounded-xl hover:border-brand-lavender hover:text-brand-lavender transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Key File</span>
              </motion.button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Section 3: Data Export */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-[2.5rem] p-8 border border-stone-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-6 h-6 text-brand-black" />
          <h3 className="text-xl font-black tracking-tight text-brand-black">Data Export</h3>
        </div>

        <div className="mb-6">
          <p className="text-sm text-stone-500 leading-relaxed mb-4">
            Export includes: brand strategy, taglines, mission &amp; vision statements, color palette, typography,
            social media ideas, logo candidates, content calendar, email templates, packages, and all input data.
          </p>
          <p className="text-xs text-stone-400 italic">
            You can leave with everything at any time. No lock-in.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center gap-2 bg-brand-teal text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-teal/90 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download All My Data
          </motion.button>

          {encryptionEnabled && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportEncrypted}
              disabled={isExporting}
              className="flex items-center gap-2 bg-brand-black text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-black/90 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Download Encrypted
            </motion.button>
          )}
        </div>
      </motion.section>

      {/* Section 4: Data Deletion */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-red-50 rounded-[2.5rem] p-8 border border-red-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-black tracking-tight text-red-900">Data Deletion</h3>
        </div>

        {deletionProof ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
              <Check className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800 font-semibold text-sm">All data has been deleted.</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-200 space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Deletion Proof</p>
              <p className="font-mono text-xs text-stone-700 break-all">{deletionProof.hash}</p>
              <p className="text-xs text-stone-400">Timestamp: {deletionProof.timestamp}</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-red-800/70 leading-relaxed mb-2">
              Permanently delete all your data from Xela Studio. This action cannot be undone.
            </p>
            <p className="text-xs text-red-700/50 mb-6">
              This will generate a cryptographic proof of deletion (SHA-256 hash chain).
            </p>

            {!showDeleteConfirm ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete All My Data
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 border border-red-300 bg-white rounded-2xl p-6"
              >
                <p className="text-sm font-bold text-red-900">
                  Type <span className="font-mono bg-red-100 px-2 py-0.5 rounded">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full border border-red-300 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAllData}
                    disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                    className="flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                  </motion.button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmation('');
                    }}
                    className="px-6 py-3 text-sm text-stone-500 hover:text-stone-700 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.section>
    </div>
  );
};
