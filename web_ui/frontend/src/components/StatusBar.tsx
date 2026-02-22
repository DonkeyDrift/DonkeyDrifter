import React from 'react';
import { useStore } from '../store/useStore';

export const StatusBar: React.FC = () => {
  const { config, configPath, tubPath, totalRecords, fields } = useStore();

  const hasConfig = !!config;
  const hasTub = totalRecords > 0;

  let message = '';

  if (!hasConfig && !hasTub) {
    message = 'No data loaded';
  } else {
    const parts: string[] = [];

    if (hasConfig) {
      parts.push(`Config loaded: ${configPath}`);
    } else {
      parts.push('No config loaded');
    }

    if (hasTub) {
      const recordText = `${totalRecords} records`;
      const fieldText = `${fields.length} fields`;
      parts.push(`Tub loaded: ${tubPath} (${recordText}, ${fieldText})`);
    } else {
      parts.push('No tub loaded');
    }

    message = parts.join(' | ');
  }

  return (
    <div
      aria-label="Status bar"
      className="mt-6 rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-300"
    >
      <span className="font-semibold mr-2">Status bar:</span>
      <span>{message}</span>
    </div>
  );
};

