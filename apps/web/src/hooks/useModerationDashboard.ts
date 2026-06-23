import { useState, useEffect, useCallback } from 'react';
import { authClient } from '@/lib/authClient';

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
  logins: number;
  actions: number;
}


export interface ModerationEvent {
  id: string;
  timestamp: string;
  user: string;
  type: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
}

export function useModerationDashboard() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [feed, setFeed] = useState<ModerationEvent[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsData, trafficData, projectsData] = await Promise.all([
        authClient.get<ModerationStats>('/admin/stats'),
        authClient.get<TrafficData[]>('/admin/traffic'),
        authClient.get<any[]>('/admin/projects'),
      ]);

      setStats(statsData);
      setTraffic(trafficData.reverse()); // Ensure chronological order

      // Map projects to the generic event feed (tracking project creations and flags)
      const mappedFeed = projectsData.slice(0, 15).map(p => ({
        id: p.id,
        timestamp: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: p.userId,
        type: p.isFlagged ? 'Flagged Project' : 'New Project',
        status: p.isFlagged ? 'Pending' : 'Resolved'
      }));
      setFeed(mappedFeed as ModerationEvent[]);

    } catch (e) {
      console.error('Failed to fetch admin dashboard data:', e);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Poll real-time backend every 5 seconds
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleAction = async (id: string, action: 'Approve' | 'Reject' | 'Ban') => {
    try {
      if (action === 'Ban') {
        // Find the user ID from the feed event
        const event = feed.find(e => e.id === id);
        if (event) {
          await authClient.post(`/admin/users/${event.user}/ban`, { ban: true });
        }
      } else if (action === 'Approve') {
        // Unflag the project
        await authClient.post(`/admin/projects/${id}/flag`, { flag: false });
      }
      // Re-fetch data immediately
      await fetchDashboardData();
    } catch (e) {
      console.error('Action failed:', e);
    }
  };

  return { stats: stats || { activeUsers: 0, totalProjects: 0, agentRuns: 0, successRate: 100, flaggedContent: 0, reportsToday: 0, actionsTaken: 0, systemHealth: 'Loading...' }, traffic, feed, handleAction };
}
