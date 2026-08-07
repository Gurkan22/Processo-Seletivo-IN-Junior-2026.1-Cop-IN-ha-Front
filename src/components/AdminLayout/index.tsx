import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../AdminSidebar';
import { fetchLatestNews, fetchGroups, fetchAllTeams, fetchMatches, fetchStadiums } from '../../services/mockData';

export function AdminLayout() {
  const [counts, setCounts] = useState({ noticias: 0, grupos: 0, times: 0, jogos: 0, estadios: 0 });

  const refreshCounts = useCallback(async () => {
    const [news, groups, teams, matches, stadiums] = await Promise.all([
      fetchLatestNews(),
      fetchGroups(),
      fetchAllTeams(),
      fetchMatches(),
      fetchStadiums(),
    ]);
    setCounts({
      noticias: news.length,
      grupos: groups.length,
      times: teams.length,
      jogos: matches.length,
      estadios: stadiums.length,
    });
  }, []);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar counts={counts} />
      <Outlet context={{ refreshCounts }} />
    </div>
  );
}
