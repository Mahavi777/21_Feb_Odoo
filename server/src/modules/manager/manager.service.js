const mongoose = require("mongoose");
const Trip = require("../trips/trip.model");
const Vehicle = require("../vehicles/vehicle.model");
const Maintenance = require("../maintenance/maintenance.model");
const Fuel = require("../fuel/fuel.model");

class ManagerService {
  static async getDashboardMetrics() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [vehicles, tripsThisMonth, maintenanceCosts, fuelCosts] =
      await Promise.all([
        Vehicle.aggregate([
          {
            $group: {
              _id: null,
              totalFleet: { $sum: 1 },
              activeFleet: {
                $sum: {
                  $cond: [{ $in: ["$status", ["available", "onTrip"]] }, 1, 0],
                },
              },
              vehiclesInShop: {
                $sum: { $cond: [{ $eq: ["$status", "inShop"] }, 1, 0] },
              },
              retiredVehicles: {
                $sum: { $cond: [{ $eq: ["$status", "retired"] }, 1, 0] },
              },
              totalOdometer: { $sum: "$odometer" },
            },
          },
        ]),
        Trip.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
        Maintenance.aggregate([
          { $group: { _id: null, total: { $sum: "$cost" } } },
        ]),
        Fuel.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]),
      ]);

    const vStats = vehicles[0] || {
      totalFleet: 0,
      activeFleet: 0,
      vehiclesInShop: 0,
      retiredVehicles: 0,
      totalOdometer: 0,
    };
    const totalMaintenanceCost = maintenanceCosts[0]?.total || 0;
    const totalFuelCost = fuelCosts[0]?.total || 0;
    const totalOperationalCost = totalMaintenanceCost + totalFuelCost;

    const utilizationRate =
      vStats.totalFleet > 0
        ? ((vStats.activeFleet / vStats.totalFleet) * 100).toFixed(1)
        : 0;

    const averageCostPerKM =
      vStats.totalOdometer > 0
        ? (totalOperationalCost / vStats.totalOdometer).toFixed(2)
        : 0;

    return {
      totalFleet: vStats.totalFleet,
      activeFleet: vStats.activeFleet,
      vehiclesInShop: vStats.vehiclesInShop,
      retiredVehicles: vStats.retiredVehicles,
      utilizationRate: Number(utilizationRate),
      totalTripsThisMonth: tripsThisMonth,
      totalMaintenanceCost,
      totalFuelCost,
      totalOperationalCost,
      averageCostPerKM: Number(averageCostPerKM),
    };
  }

  static async getGlobalAnalytics() {
    const metrics = await this.getDashboardMetrics();

    const [
      maintenanceTrend,
      fuelTrend,
      revenueTrend,
      fleetAcq,
      fleetTrips,
      allFuel,
    ] = await Promise.all([
      // Maintenance trends by month
      Maintenance.aggregate([
        { $group: { _id: { $month: "$date" }, cost: { $sum: "$cost" } } },
        { $sort: { _id: 1 } },
      ]),
      // Fuel trends by month
      Fuel.aggregate([
        {
          $group: {
            _id: { $month: "$date" },
            cost: { $sum: "$cost" },
            liters: { $sum: "$liters" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Revenue trends by month
      Trip.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$revenue" },
            distance: {
              $sum: { $subtract: ["$endOdometer", "$startOdometer"] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Global ROI Acq Cost
      Vehicle.aggregate([
        { $group: { _id: null, totalCost: { $sum: "$acquisitionCost" } } },
      ]),
      // Global Trips/Revenue
      Trip.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$revenue" },
            totalDistance: {
              $sum: { $subtract: ["$endOdometer", "$startOdometer"] },
            },
          },
        },
      ]),
      // Total Fuel
      Fuel.aggregate([
        {
          $group: {
            _id: null,
            totalLiters: { $sum: "$liters" },
            totalCost: { $sum: "$cost" },
          },
        },
      ]),
    ]);

    const totalRevenue = fleetTrips[0]?.totalRevenue || 0;
    const totalDistance = fleetTrips[0]?.totalDistance || 0;
    const totalFuelUsed = allFuel[0]?.totalLiters || 0;
    const totalAcquisitionCost = fleetAcq[0]?.totalCost || 1;

    const globalROI =
      ((totalRevenue - metrics.totalOperationalCost) / totalAcquisitionCost) *
      100;
    const fleetFuelEfficiency =
      totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;

    // Merge Trends
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyCostTrend = months
      .map((m) => {
        const maint = maintenanceTrend.find((x) => x._id === m)?.cost || 0;
        const fuel = fuelTrend.find((x) => x._id === m)?.cost || 0;
        return { month: m, cost: maint + fuel };
      })
      .filter((m) => m.cost > 0 || m.month <= new Date().getMonth() + 1);

    const monthlyRevenueTrend = months
      .map((m) => ({
        month: m,
        revenue: revenueTrend.find((x) => x._id === m)?.revenue || 0,
      }))
      .filter((m) => m.revenue > 0 || m.month <= new Date().getMonth() + 1);

    // Vehicle ROI List
    const vehicles = await Vehicle.find();
    const vehicleROIList = await Promise.all(
      vehicles.map(async (v) => {
        const vMetrics = await this.getVehicleAnalytics(v._id);
        return {
          name: vMetrics.vehicleName,
          licensePlate: v.licensePlate,
          roi: vMetrics.roi,
          revenue: vMetrics.totalRevenue,
          cost: vMetrics.totalOperationalCost,
        };
      }),
    );

    return {
      globalROI: Number(globalROI.toFixed(1)),
      totalRevenue,
      totalOperationalCost: metrics.totalOperationalCost,
      totalMaintenanceCost: metrics.totalMaintenanceCost,
      totalFuelUsed,
      fleetFuelEfficiency: Number(fleetFuelEfficiency.toFixed(2)),
      averageCostPerKM: metrics.averageCostPerKM,
      monthlyCostTrend,
      monthlyRevenueTrend,
      vehicleROIList: vehicleROIList.sort((a, b) => b.roi - a.roi),
    };
  }

  static async getVehicleAnalytics(vehicleId) {
    const vId = new mongoose.Types.ObjectId(vehicleId);

    const [vehicle, trips, maintenance, fuel] = await Promise.all([
      Vehicle.findById(vehicleId),
      Trip.aggregate([
        { $match: { vehicleId: vId } },
        {
          $group: {
            _id: null,
            tripCount: { $sum: 1 },
            totalRevenue: { $sum: "$revenue" },
          },
        },
      ]),
      Maintenance.aggregate([
        { $match: { vehicleId: vId } },
        { $group: { _id: null, totalMaintenanceCost: { $sum: "$cost" } } },
      ]),
      Fuel.aggregate([
        { $match: { vehicleId: vId } },
        { $group: { _id: null, totalFuelCost: { $sum: "$cost" } } },
      ]),
    ]);

    if (!vehicle) throw new Error("Vehicle not found");

    const tripStats = trips[0] || { tripCount: 0, totalRevenue: 0 };
    const maintCost = maintenance[0]?.totalMaintenanceCost || 0;
    const fuelCost = fuel[0]?.totalFuelCost || 0;

    const totalOperationalCost = maintCost + fuelCost;

    let roi = 0;
    if (vehicle.acquisitionCost > 0) {
      roi =
        ((tripStats.totalRevenue - totalOperationalCost) /
          vehicle.acquisitionCost) *
        100;
    }

    const costPerKm =
      vehicle.odometer > 0 ? totalOperationalCost / vehicle.odometer : 0;

    return {
      vehicleName: vehicle.name,
      tripCount: tripStats.tripCount,
      totalRevenue: tripStats.totalRevenue,
      totalMaintenanceCost: maintCost,
      totalFuelCost: fuelCost,
      totalOperationalCost,
      roi: Number(roi.toFixed(1)),
      costPerKm: Number(costPerKm.toFixed(2)),
    };
  }
}

module.exports = ManagerService;
