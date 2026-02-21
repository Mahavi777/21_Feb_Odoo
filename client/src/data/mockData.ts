/** Mock data for FleetFlow */

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  maxCapacity: number;
  odometer: number;
  status: "available" | "on_trip" | "in_shop" | "retired";
  region: string;
  type: "truck" | "van" | "bike";
}

export interface Trip {
  id: string;
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  cargoWeight: number;
  origin: string;
  destination: string;
  status: "draft" | "dispatched" | "completed" | "cancelled";
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  description: string;
  cost: number;
  date: string;
  statusImpact: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseExpiry: string;
  safetyScore: number;
  status: "on_duty" | "off_duty" | "suspended";
}

export const VEHICLES: Vehicle[] = [
  { id: "v1", name: "Alpha Hauler", model: "Volvo FH16", licensePlate: "AB-1234", maxCapacity: 25000, odometer: 142300, status: "available", region: "North", type: "truck" },
  { id: "v2", name: "City Runner", model: "Mercedes Sprinter", licensePlate: "CD-5678", maxCapacity: 3500, odometer: 87600, status: "on_trip", region: "East", type: "van" },
  { id: "v3", name: "Quick Dash", model: "Honda CB500X", licensePlate: "EF-9012", maxCapacity: 50, odometer: 23400, status: "available", region: "South", type: "bike" },
  { id: "v4", name: "Heavy Lift", model: "Scania R500", licensePlate: "GH-3456", maxCapacity: 30000, odometer: 210000, status: "in_shop", region: "West", type: "truck" },
  { id: "v5", name: "Metro Van", model: "Ford Transit", licensePlate: "IJ-7890", maxCapacity: 4000, odometer: 56000, status: "available", region: "North", type: "van" },
  { id: "v6", name: "Old Faithful", model: "MAN TGX", licensePlate: "KL-2345", maxCapacity: 28000, odometer: 345000, status: "retired", region: "East", type: "truck" },
  { id: "v7", name: "Express Moto", model: "Yamaha MT-07", licensePlate: "MN-6789", maxCapacity: 40, odometer: 12000, status: "available", region: "South", type: "bike" },
  { id: "v8", name: "Cargo Star", model: "DAF XF", licensePlate: "OP-0123", maxCapacity: 26000, odometer: 178500, status: "on_trip", region: "West", type: "truck" },
];

export const TRIPS: Trip[] = [
  { id: "t1", vehicleId: "v2", vehicleName: "City Runner", driverName: "Sam Rivera", cargoWeight: 2800, origin: "Warehouse A", destination: "Client Hub B", status: "dispatched", createdAt: "2026-02-20" },
  { id: "t2", vehicleId: "v8", vehicleName: "Cargo Star", driverName: "Jordan Lee", cargoWeight: 18000, origin: "Port Terminal", destination: "Distribution Center", status: "dispatched", createdAt: "2026-02-19" },
  { id: "t3", vehicleId: "v1", vehicleName: "Alpha Hauler", driverName: "Alex Morgan", cargoWeight: 22000, origin: "Factory Floor", destination: "Retail Park", status: "completed", createdAt: "2026-02-15" },
  { id: "t4", vehicleId: "v5", vehicleName: "Metro Van", driverName: "Casey Kim", cargoWeight: 1200, origin: "Office HQ", destination: "Branch Office", status: "draft", createdAt: "2026-02-21" },
  { id: "t5", vehicleId: "v3", vehicleName: "Quick Dash", driverName: "Sam Rivera", cargoWeight: 30, origin: "Store A", destination: "Store B", status: "cancelled", createdAt: "2026-02-14" },
];

export const MAINTENANCE_LOGS: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v4", vehicleName: "Heavy Lift", description: "Engine overhaul", cost: 4500, date: "2026-02-18", statusImpact: "Vehicle marked In Shop" },
  { id: "m2", vehicleId: "v1", vehicleName: "Alpha Hauler", description: "Tire replacement (all axles)", cost: 1200, date: "2026-02-10", statusImpact: "Completed – back to Available" },
  { id: "m3", vehicleId: "v6", vehicleName: "Old Faithful", description: "Final inspection before retirement", cost: 300, date: "2026-01-28", statusImpact: "Vehicle marked Retired" },
  { id: "m4", vehicleId: "v2", vehicleName: "City Runner", description: "Brake pad replacement", cost: 650, date: "2026-02-05", statusImpact: "Completed – back to Available" },
];

export const DRIVERS: Driver[] = [
  { id: "d1", name: "Alex Morgan", licenseExpiry: "2027-06-15", safetyScore: 92, status: "on_duty" },
  { id: "d2", name: "Sam Rivera", licenseExpiry: "2026-09-01", safetyScore: 87, status: "on_duty" },
  { id: "d3", name: "Jordan Lee", licenseExpiry: "2026-04-20", safetyScore: 78, status: "off_duty" },
  { id: "d4", name: "Casey Kim", licenseExpiry: "2027-12-31", safetyScore: 95, status: "on_duty" },
  { id: "d5", name: "Taylor Swift", licenseExpiry: "2026-02-28", safetyScore: 42, status: "suspended" },
];

export const MONTHLY_COSTS = [
  { month: "Sep", cost: 12400 },
  { month: "Oct", cost: 15200 },
  { month: "Nov", cost: 11800 },
  { month: "Dec", cost: 18600 },
  { month: "Jan", cost: 14200 },
  { month: "Feb", cost: 16800 },
];

export const FUEL_EFFICIENCY = [
  { vehicle: "Alpha Hauler", efficiency: 6.2 },
  { vehicle: "City Runner", efficiency: 9.8 },
  { vehicle: "Heavy Lift", efficiency: 5.1 },
  { vehicle: "Metro Van", efficiency: 10.2 },
  { vehicle: "Cargo Star", efficiency: 5.8 },
];

export const VEHICLE_ROI = [
  { vehicle: "Alpha Hauler", roi: 18 },
  { vehicle: "City Runner", roi: 24 },
  { vehicle: "Heavy Lift", roi: 8 },
  { vehicle: "Metro Van", roi: 22 },
  { vehicle: "Cargo Star", roi: 15 },
];
