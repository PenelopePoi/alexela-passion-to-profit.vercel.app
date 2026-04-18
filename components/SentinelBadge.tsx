import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { getSentinelHealth } from '../services/guardianSentinel';

export const SentinelBadge: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [health, setHealth] = useState(getSentinelHealth());

  useEffect(() => {
    const interval = setInterval(() => setHealth(getSentinelHealth()), 5000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  const icons = { green: Shield, amber: ShieldAlert, red: ShieldOff };
  const Icon = icons[health.status];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${colors[health.status]} transition-all`}
    >
      <Icon size={14} />
      {health.status === 'red' && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-2 h-2 bg-red-500 rounded-full"
        />
      )}
      <span className="text-[9px] font-black uppercase tracking-widest">{health.message}</span>
    </motion.button>
  );
};
