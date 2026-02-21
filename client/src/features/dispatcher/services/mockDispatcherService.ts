export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  revenue?: number;
  startOdometer: number;
  endOdometer?: number;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  status: "available" | "onTrip" | "maintenance";
  maxCapacity: number;
  currentOdometer: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  status: "onDuty" | "offDuty" | "suspended";
  licenseExpiry: string;
  safetyScore: number;
}

// Initial mock data simulating DB state
let tripsDB: Trip[] = [
  {
    id: "TRP-1001",
    vehicleId: "V-101",
    driverId: "D-201",
    cargoWeight: 4500,
    startOdometer: 45200,
    status: "Dispatched",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "TRP-1002",
    vehicleId: "V-102",
    driverId: "D-202",
    cargoWeight: 8000,
    startOdometer: 112040,
    status: "Draft",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  }
];

let vehiclesDB: Vehicle[] = [
  { id: "V-101", make: "Volvo", model: "VNL 860", licensePlate: "XYZ-1234", status: "onTrip", maxCapacity: 10000, currentOdometer: 45200 },
  { id: "V-102", make: "Freightliner", model: "Cascadia", licensePlate: "ABC-9876", status: "available", maxCapacity: 12000, currentOdometer: 112040 },
  { id: "V-103", make: "Peterbilt", model: "579", licensePlate: "DEF-4567", status: "available", maxCapacity: 9000, currentOdometer: 89000 },
  { id: "V-104", make: "Kenworth", model: "T680", licensePlate: "LMN-3456", status: "maintenance", maxCapacity: 15000, currentOdometer: 205000 },
];

let driversDB: Driver[] = [
  { id: "D-201", name: "Marcus Johnson", email: "mjohnson@fleetflow.io", status: "onDuty", licenseExpiry: "2027-05-15", safetyScore: 92 },
  { id: "D-202", name: "Sarah Williams", email: "swilliams@fleetflow.io", status: "offDuty", licenseExpiry: "2028-11-20", safetyScore: 98 },
  { id: "D-203", name: "David Chen", email: "dchen@fleetflow.io", status: "offDuty", licenseExpiry: "2024-01-01", safetyScore: 85 }, // Expired
  { id: "D-204", name: "Robert Taylor", email: "rtaylor@fleetflow.io", status: "suspended", licenseExpiry: "2026-08-10", safetyScore: 45 },
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDispatcherService = {
  getTrips: async (): Promise<Trip[]> => {
    await delay(600);
    return [...tripsDB];
  },

  getVehicles: async (): Promise<Vehicle[]> => {
    await delay(400);
    return [...vehiclesDB];
  },

  getDrivers: async (): Promise<Driver[]> => {
    await delay(400);
    return [...driversDB];
  },

  createTrip: async (payload: Omit<Trip, "id" | "status" | "createdAt" | "updatedAt">): Promise<Trip> => {
    await delay(800);
    
    // Validation
    const vehicle = vehiclesDB.find(v => v.id === payload.vehicleId);
    const driver = driversDB.find(d => d.id === payload.driverId);
    
    if (!vehicle) throw new Error("Vehicle not found");
    if (!driver) throw new Error("Driver not found");
    
    if (vehicle.status !== "available") throw new Error("Vehicle is not available");
    if (driver.status !== "offDuty") throw new Error("Driver is not available (must be offDuty)");
    if (payload.cargoWeight > vehicle.maxCapacity) throw new Error(`Cargo exceeds vehicle capacity of ${vehicle.maxCapacity} lbs`);
    
    const isExpired = new Date(driver.licenseExpiry) < new Date();
    if (isExpired) throw new Error("Driver license is expired");

    const newTrip: Trip = {
      ...payload,
      id: `TRP-${1000 + tripsDB.length + 1}`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tripsDB = [newTrip, ...tripsDB];
    return newTrip;
  },

  dispatchTrip: async (tripId: string): Promise<Trip> => {
    await delay(700);
    const tripIndex = tripsDB.findIndex(t => t.id === tripId);
    if (tripIndex === -1) throw new Error("Trip not found");
    
    const trip = tripsDB[tripIndex];
    if (trip.status !== "Draft") throw new Error("Only Draft trips can be dispatched");

    // Update statuses
    tripsDB[tripIndex] = { ...trip, status: "Dispatched", updatedAt: new Date().toISOString() };
    
    vehiclesDB = vehiclesDB.map(v => v.id === trip.vehicleId ? { ...v, status: "onTrip" } : v);
    driversDB = driversDB.map(d => d.id === trip.driverId ? { ...d, status: "onDuty" } : d);

    return tripsDB[tripIndex];
  },

  completeTrip: async (tripId: string, endOdometer: number): Promise<Trip> => {
    await delay(800);
    const tripIndex = tripsDB.findIndex(t => t.id === tripId);
    if (tripIndex === -1) throw new Error("Trip not found");
    
    const trip = tripsDB[tripIndex];
    if (trip.status !== "Dispatched") throw new Error("Only Dispatched trips can be completed");
    if (endOdometer < trip.startOdometer) throw new Error("End odometer cannot be less than start odometer");

    // Update statuses
    tripsDB[tripIndex] = { ...trip, status: "Completed", endOdometer, updatedAt: new Date().toISOString() };
    
    vehiclesDB = vehiclesDB.map(v => 
      v.id === trip.vehicleId ? { ...v, status: "available", currentOdometer: endOdometer } : v
    );
    driversDB = driversDB.map(d => d.id === trip.driverId ? { ...d, status: "offDuty" } : d);

    return tripsDB[tripIndex];
  },

  cancelTrip: async (tripId: string): Promise<Trip> => {
    await delay(600);
    const tripIndex = tripsDB.findIndex(t => t.id === tripId);
    if (tripIndex === -1) throw new Error("Trip not found");
    
    const trip = tripsDB[tripIndex];
    if (trip.status !== "Draft" && trip.status !== "Dispatched") {
      throw new Error("Trip cannot be cancelled from current status");
    }

    // Free resources if it was dispatched
    if (trip.status === "Dispatched") {
      vehiclesDB = vehiclesDB.map(v => v.id === trip.vehicleId ? { ...v, status: "available" } : v);
      driversDB = driversDB.map(d => d.id === trip.driverId ? { ...d, status: "offDuty" } : d);
    }

    tripsDB[tripIndex] = { ...trip, status: "Cancelled", updatedAt: new Date().toISOString() };
    return tripsDB[tripIndex];
  }
};
