export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(1);
};

export const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return 'N/A';
  return '$' + formatNumber(num);
};
