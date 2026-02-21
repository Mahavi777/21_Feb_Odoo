import { useState, useCallback, useEffect } from 'react';
import { managerApi } from '../services/managerApi';

export const useManagerData = () => {
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [dash, glob, vehs, drvs, maints, trps] = await Promise.all([
        managerApi.getDashboard(),
        managerApi.getAnalytics(),
        managerApi.getVehicles(),
        managerApi.getDrivers(),
        managerApi.getMaintenance(),
        managerApi.getTrips()
      ]);
      setDashboardMetrics(dash);
      setAnalytics(glob);
      setVehicles(vehs);
      setDrivers(drvs);
      setMaintenance(maints);
      setTrips(trps);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch manager data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Provide abstracted refetch methods for realtime cascading
  const refetch = async () => {
    await fetchDashboard();
  };

  // Wrap mutations to automatically refetch data
  const createVehicle = async (data: any) => {
    await managerApi.createVehicle(data);
    await refetch();
  };

  const updateVehicle = async (id: string, data: any) => {
    await managerApi.updateVehicle(id, data);
    await refetch();
  };

  const retireVehicle = async (id: string) => {
    await managerApi.retireVehicle(id);
    await refetch();
  };

  const createDriver = async (data: any) => {
    await managerApi.createDriver(data);
    await refetch();
  };

  const updateDriver = async (id: string, data: any) => {
    await managerApi.updateDriver(id, data);
    await refetch();
  };

  const createMaintenance = async (data: any) => {
    await managerApi.createMaintenance(data);
    await refetch();
  };

  const completeMaintenance = async (id: string) => {
    await managerApi.completeMaintenance(id);
    await refetch();
  };

  const cancelTrip = async (id: string) => {
    await managerApi.cancelTrip(id);
    await refetch();
  };

  return {
    dashboardMetrics,
    analytics,
    vehicles,
    drivers,
    maintenance,
    trips,
    isLoading,
    error,
    refetch,
    // Mutations
    createVehicle,
    updateVehicle,
    retireVehicle,
    createDriver,
    updateDriver,
    createMaintenance,
    completeMaintenance,
    cancelTrip
  };
};
