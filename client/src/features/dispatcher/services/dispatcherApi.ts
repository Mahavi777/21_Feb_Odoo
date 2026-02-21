import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  status: string;
  maxCapacity: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  status: string;
  safetyScore: number;
}

export interface Trip {
  id: string;
  vehicleId: any;
  driverId: any;
  status: string;
  startOdometer?: number;
  endOdometer?: number;
  cargoWeight?: number;
  revenue?: number;
  createdAt: string;
}

export interface DashboardStats {
  activeTrips: number;
  draftTrips: number;
  availableVehicles: number;
  availableDrivers: number;
  tripStatusBreakdown: any[];
  vehicleAvailabilityBreakdown: any[];
}

export const dispatcherApi = {
  getDrivers: async (status?: string): Promise<Driver[]> => {
    const res = await api.get('/api/dispatch/drivers/available');
    return res.data.data.map((item: any) => ({ ...item, id: item._id }));
  },

  getVehicles: async (status?: string): Promise<Vehicle[]> => {
    const res = await api.get('/api/dispatch/vehicles/available');
    return res.data.data.map((item: any) => ({ ...item, id: item._id }));
  },

  getTrips: async (): Promise<Trip[]> => {
    const res = await api.get('/api/trips');
    return res.data.data.map((item: any) => ({ ...item, id: item._id }));
  },

  getDashboard: async (): Promise<DashboardStats> => {
    const res = await api.get('/api/dispatcher/dashboard');
    return res.data.data;
  },

  createTrip: async (data: any): Promise<Trip> => {
    const res = await api.post('/api/trips', data);
    const item = res.data.data;
    return { ...item, id: item._id };
  },

  dispatchTrip: async (id: string): Promise<Trip> => {
    const res = await api.patch(`/api/trips/${id}/dispatch`);
    const item = res.data.data;
    return { ...item, id: item._id };
  },

  completeTrip: async (id: string, endOdometer: number): Promise<Trip> => {
    const res = await api.patch(`/api/trips/${id}/complete`, { endOdometer });
    const item = res.data.data;
    return { ...item, id: item._id };
  },

  cancelTrip: async (id: string): Promise<Trip> => {
    const res = await api.patch(`/api/trips/${id}/cancel`);
    const item = res.data.data;
    return { ...item, id: item._id };
  }
};
