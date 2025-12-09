import React from 'react';
import type { MarginStatus } from '../types';

interface MarginStatusBadgeProps {
  status: MarginStatus;
}

const MarginStatusBadge: React.FC<MarginStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'OK':
        return {
          label: 'Conforme à l\'objectif',
          className: 'bg-green-50 text-green-700 border border-green-200',
        };
      case 'WARNING':
        return {
          label: 'Sous l\'objectif (≥ min)',
          className: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      case 'KO':
        return {
          label: 'Sous le minimum',
          className: 'bg-red-50 text-red-700 border border-red-200',
        };
      default:
        return {
          label: 'Inconnu',
          className: 'bg-gray-50 text-gray-700 border border-gray-200',
        };
    }
  };

  const { label, className } = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
};

export default MarginStatusBadge;
