import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function getIncidentColor(type: string): string {
  const colors: Record<string, string> = {
    medical: 'text-red-400',
    security: 'text-orange-400',
    fire: 'text-red-600',
    lost_child: 'text-purple-400',
    maintenance: 'text-yellow-400',
    other: 'text-gray-400',
  };
  return colors[type] || 'text-gray-400';
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[severity] || 'bg-gray-500/20 text-gray-400';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'bg-red-500/20 text-red-400',
    in_progress: 'bg-yellow-500/20 text-yellow-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-gray-500/20 text-gray-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
}

export function getDensityColor(level: string): string {
  const colors: Record<string, string> = {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  };
  return colors[level] || '#6b7280';
}

export function getDensityBg(level: string): string {
  const colors: Record<string, string> = {
    green: 'bg-green-500/20 text-green-400 border-green-500/40',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    red: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
  };
  return colors[level] || 'bg-gray-500/20';
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-purple-500/20 text-purple-300',
    security: 'bg-orange-500/20 text-orange-300',
    medical: 'bg-red-500/20 text-red-300',
    operations: 'bg-blue-500/20 text-blue-300',
    volunteer: 'bg-green-500/20 text-green-300',
  };
  return colors[role] || 'bg-gray-500/20 text-gray-300';
}
