import { useState, useEffect, useCallback } from "react";
import { dispatcherApi, Trip, Vehicle, Driver, DashboardStats } from "../services/dispatcherApi";

export function useDispatcher() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [t, v, d, s] = await Promise.all([
        dispatcherApi.getTrips(), // Could pass status filters here but dashboard gives stats, we just need trips for the table
        dispatcherApi.getVehicles('available'),
        dispatcherApi.getDrivers('offDuty'),
        dispatcherApi.getDashboard()
      ]);
      setTrips(t);
      setVehicles(v);
      setDrivers(d);
      setStats(s);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch dispatcher data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTrip = async (payload: Omit<Trip, "id" | "_id" | "status" | "createdAt" | "updatedAt">) => {
    try {
      const newTrip = await dispatcherApi.createTrip(payload);
      await fetchData(); // Refresh data to sync UI
      return newTrip;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to create trip");
    }
  };

  const dispatchTrip = async (tripId: string) => {
    try {
      const updatedTrip = await dispatcherApi.dispatchTrip(tripId);
      await fetchData();
      return updatedTrip;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to dispatch trip");
    }
  };

  const completeTrip = async (tripId: string, endOdometer: number) => {
    try {
      const completedTrip = await dispatcherApi.completeTrip(tripId, endOdometer);
      await fetchData();
      return completedTrip;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to complete trip");
    }
  };

  const cancelTrip = async (tripId: string) => {
    try {
      const cancelledTrip = await dispatcherApi.cancelTrip(tripId);
      await fetchData();
      return cancelledTrip;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to cancel trip");
    }
  };

  return {
    trips,
    vehicles,
    drivers,
    stats,
    isLoading,
    error,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    refreshData: fetchData
  };
}
