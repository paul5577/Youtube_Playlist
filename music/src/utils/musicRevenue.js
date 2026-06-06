import { MUSIC_CPM_BY_COUNTRY, GENRE_REVENUE_PROFILE } from '../data/musicData';

export function calcRevenue(views, genre, country) {
  const c = MUSIC_CPM_BY_COUNTRY[country] || MUSIC_CPM_BY_COUNTRY['US'];
  const g = GENRE_REVENUE_PROFILE[genre] || { cpmMult: 1.0 };
  const cpm = c.cpm * g.cpmMult;
  return Math.round((views / 1000) * cpm * 0.55);
}

export function calcStreamingRevenue(monthlyListeners, country) {
  const c = MUSIC_CPM_BY_COUNTRY[country] || MUSIC_CPM_BY_COUNTRY['US'];
  return Math.round(monthlyListeners * c.streamingRate);
}

export function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

export function usd(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

export function krw(usdAmount) {
  const k = Math.round(usdAmount * 1350);
  if (k >= 1e8) return '₩' + (k / 1e8).toFixed(1) + '억';
  if (k >= 1e4) return '₩' + Math.round(k / 1e4) + '만';
  return '₩' + k.toLocaleString();
}

export function exportCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = String(r[h] ?? '').replace(/"/g, '""');
      return v.includes(',') || v.includes('\n') ? `"${v}"` : v;
    }).join(','))
  ].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
