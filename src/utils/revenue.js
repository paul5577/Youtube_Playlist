import { CPM_BY_COUNTRY, CPM_BY_CATEGORY } from '../data/mockData';

export function estimateRevenue(views, category, country) {
  const countryCPM = CPM_BY_COUNTRY[country] || CPM_BY_COUNTRY['US'];
  const categoryMultiplier = CPM_BY_CATEGORY[category] || 1.0;
  const baseCPM = countryCPM.avg * categoryMultiplier;
  const revenue = (views / 1000) * baseCPM * 0.55; // YouTube 55% share
  return Math.round(revenue);
}

export function formatNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatCurrency(amount, currency = 'USD') {
  if (currency === 'USD') {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(1) + 'K';
    return '$' + amount.toLocaleString();
  }
  return '$' + amount.toLocaleString();
}

export function formatKRW(usdAmount) {
  const krw = Math.round(usdAmount * 1350);
  if (krw >= 100000000) return '₩' + (krw / 100000000).toFixed(1) + '억';
  if (krw >= 10000) return '₩' + Math.round(krw / 10000) + '만';
  return '₩' + krw.toLocaleString();
}
