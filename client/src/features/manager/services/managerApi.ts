import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export const managerApi = {
  // --- Dashboard & Analytics ---
  getDashboard: async () => {
    const res = await api.get('/manager/dashboard');
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get('/manager/analytics');
    return res.data;
  },
  getVehicleAnalytics: async (id: string) => {
    const res = await api.get(`/manager/analytics/vehicle/${id}`);
    return res.data;
  },

  // --- Vehicles ---
  getVehicles: async () => {
    const res = await api.get('/vehicles');
    return res.data.data;
  },
  createVehicle: async (data: any) => {
    const res = await api.post('/vehicles', data);
    return res.data.data;
  },
  updateVehicle: async (id: string, data: any) => {
    const res = await api.patch(`/vehicles/${id}`, data);
    return res.data.data;
  },
  retireVehicle: async (id: string) => {
    const res = await api.patch(`/vehicles/${id}/retire`);
    return res.data.data;
  },

  // --- Drivers ---
  getDrivers: async () => {
    const res = await api.get('/users/drivers');
    return res.data.data;
  },
  createDriver: async (data: any) => {
    const res = await api.post('/users/drivers', data);
    return res.data.data;
  },
  updateDriver: async (id: string, data: any) => {
    const res = await api.patch(`/users/drivers/${id}`, data);
    return res.data.data;
  },

  // --- Maintenance ---
  getMaintenance: async () => {
    const res = await api.get('/maintenance');
    return res.data.data;
  },
  createMaintenance: async (data: any) => {
    const res = await api.post('/maintenance', data);
    return res.data.data;
  },
  completeMaintenance: async (id: string) => {
    const res = await api.patch(`/maintenance/${id}/complete`);
    return res.data.data;
  },

  // --- Trips ---
  getTrips: async () => {
    const res = await api.get('/trips');
    return res.data.data;
  },
  cancelTrip: async (id: string) => {
    const res = await api.patch(`/trips/${id}/cancel`);
    return res.data.data;
  },
};
