import { useQuery } from '@tanstack/react-query';

export const useFinance = (fromDate?: string, toDate?: string) => {
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    return params.toString() ? `?${params.toString()}` : '';
  };

  const fetchFinanceAuth = async (path: string) => {
    const qs = buildQuery();
    const res = await fetch(`http://localhost:5000${path}${qs}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('fleetflow_token')}` }
    });
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    const payload = await res.json();
    return payload.data;
  };

  const dashboardQuery = useQuery({ 
    queryKey: ['finance', 'dashboard', fromDate, toDate], 
    queryFn: () => fetchFinanceAuth('/api/finance/dashboard') 
  });
  
  const trendsQuery = useQuery({ 
    queryKey: ['finance', 'trends', fromDate, toDate], 
    queryFn: () => fetchFinanceAuth('/api/finance/trends') 
  });
  
  const fuelLogsQuery = useQuery({ 
    queryKey: ['finance', 'fuel', fromDate, toDate], 
    queryFn: () => fetchFinanceAuth('/api/finance/fuel') 
  });
  
  const maintenanceLogsQuery = useQuery({ 
    queryKey: ['finance', 'maintenance', fromDate, toDate], 
    queryFn: () => fetchFinanceAuth('/api/finance/maintenance') 
  });
  
  const roiQuery = useQuery({ 
    queryKey: ['finance', 'roi', fromDate, toDate], 
    queryFn: () => fetchFinanceAuth('/api/finance/roi') 
  });

  const isLoading = 
    dashboardQuery.isLoading || 
    trendsQuery.isLoading || 
    fuelLogsQuery.isLoading || 
    maintenanceLogsQuery.isLoading || 
    roiQuery.isLoading;

  return {
    dashboard: dashboardQuery.data,
    trends: trendsQuery.data,
    fuelLogs: fuelLogsQuery.data,
    maintenanceLogs: maintenanceLogsQuery.data,
    roiData: roiQuery.data,
    isLoading
  };
};
