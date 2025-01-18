import { Table } from '../types';

export const validateTableData = (data: any[][]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false;
  const columnCount = data[0].length;
  return data.every(row => Array.isArray(row) && row.length === columnCount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('cs-CZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const downloadCsv = (table: Table): void => {
  const csvContent = table.data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${table.name}.csv`;
  link.click();
};
