import { useState, useEffect, useCallback } from 'react';
import { authClient } from '@/lib/authClient';
import { adminClient } from '@/lib/adminClient';

export interface ModerationStats {
  activeUsers: number;
  totalProjects: number;
  agentRuns: number;
  successRate: number;
  flaggedContent: number;
  reportsToday: number;
  actionsTaken: number;
  systemHealth: string;
}

export interface TrafficData {
  time: string;
  signups: number;
  logins: number;
  actions: number;
  projectsCount?: number;
  projectNames?: string[];
  signupNames?: string[];
}


export interface ModerationEvent {
  id: string;
  timestamp: string;
  user: string;
  type: string;
  status: 'Pending' | 'Resolved' | 'Dismissed' | 'Failed' | 'Banned';
  details?: string;
}

export interface DashboardExtendedData {
  activeUsers: number;
  totalProjects: number;
  agentRuns: number;
  projectsStatus: Record<string, number>;
  totalRevenue: number;
  subscriptionDistribution: Record<string, number>;
  recentPayments: Array<{
    id: string;
    userId: string;
    amountEGP: number;
    paymentProvider: string;
    paymentIntentId: string;
    status: 'pending' | 'paid' | 'failed';
    metadata: any;
    createdAt: string;
    creator: { name: string; email: string } | null;
  }>;
  flaggedContent: number;
  observability: {
    totalTokens: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalRuns: number;
    successfulRuns: number;
    successRate: number;
    averageLatencyMs: number;
  };
  settings: {
    defaultModel: string;
    aiTemperature: number;
    maxTokensPerRun: number;
    freeCredits: number;
    maxProjects: number;
    lockdown: boolean;
    maintenance: boolean;
    flagAlerts: boolean;
    weeklyReports: boolean;
  };
}

export function useModerationDashboard() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [feed, setFeed] = useState<ModerationEvent[]>([]);
  const [offset, setOffset] = useState(0);
  const [extendedData, setExtendedData] = useState<DashboardExtendedData | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsData, trafficData, feedData, extended] = await Promise.all([
        adminClient.get<ModerationStats>('/stats'),
        adminClient.get<TrafficData[]>(`/traffic?offset=${offset}`),
        adminClient.get<any[]>('/feed'),
        adminClient.get<DashboardExtendedData>('/dashboard-extended'),
      ]);

      setStats(statsData);
      setTraffic(trafficData);
      setExtendedData(extended);

      const mappedFeed = feedData.map(e => ({
        ...e,
        timestamp: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setFeed(mappedFeed);

    } catch (e) {
      console.error('Failed to fetch admin dashboard data:', e);
    }
  }, [offset]);

  useEffect(() => {
    fetchDashboardData();
    // Poll real-time backend every 15 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleAction = async (id: string, action: 'Approve' | 'Reject' | 'Ban') => {
    try {
      if (action === 'Ban') {
        // Find the user ID from the feed event
        const event = feed.find(e => e.id === id);
        if (event) {
          await adminClient.post(`/users/${event.user}/ban`, { ban: true });
        }
      } else if (action === 'Approve') {
        // Unflag the project
        await adminClient.post(`/projects/${id}/flag`, { flag: false });
      }
      // Re-fetch data immediately
      await fetchDashboardData();
    } catch (e) {
      console.error('Action failed:', e);
    }
  };

  return { 
    stats: stats || { activeUsers: 0, totalProjects: 0, agentRuns: 0, successRate: 100, flaggedContent: 0, reportsToday: 0, actionsTaken: 0, systemHealth: 'Loading...' }, 
    traffic, 
    feed, 
    handleAction, 
    offset, 
    setOffset,
    extendedData
  };
}
