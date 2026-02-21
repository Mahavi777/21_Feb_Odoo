const Trip = require("../trips/trip.model");
const Vehicle = require("../vehicles/vehicle.model");
const Fuel = require("../fuel/fuel.model");
const Maintenance = require("../maintenance/maintenance.model");

class AnalyticsService {
  /**
   * STEP 4: FLEET-LEVEL KPI CALCULATIONS
   * Aggregates sum data from distinct collections reliably handling mathematical integrity.
   */
  async getFleetKPIs() {
    // 1. Gather Trip financial boundaries
    const tripAgg = await Trip.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
          totalDistance: {
            $sum: { $subtract: ["$endOdometer", "$startOdometer"] },
          },
          totalTrips: { $sum: 1 },
        },
      },
    ]);

    // 2. Gather Fuel cost & Liters
    const fuelAgg = await Fuel.aggregate([
      {
        $group: {
          _id: null,
          totalFuelCost: { $sum: { $multiply: ["$liters", "$costPerLiter"] } },
          totalFuelLiters: { $sum: "$liters" },
        },
      },
    ]);

    // 3. Gather Maintenance costs
    const maintAgg = await Maintenance.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalMaintenanceCost: { $sum: "$cost" },
        },
      },
    ]);

    // 4. Count Active Vehicles
    const activeVehicles = await Vehicle.countDocuments({
      status: { $ne: "retired" },
    });

    // Extrapolate constants
    const tData = tripAgg[0] || {
      totalRevenue: 0,
      totalDistance: 0,
      totalTrips: 0,
    };
    const fData = fuelAgg[0] || { totalFuelCost: 0, totalFuelLiters: 0 };
    const mData = maintAgg[0] || { totalMaintenanceCost: 0 };

    const totalOperationalCost =
      fData.totalFuelCost + mData.totalMaintenanceCost;

    // Safely execute divisions guarding against 0-div
    const fleetFuelEfficiency =
      fData.totalFuelLiters > 0
        ? Number((tData.totalDistance / fData.totalFuelLiters).toFixed(2))
        : 0;

    const averageCostPerKM =
      tData.totalDistance > 0
        ? Number((totalOperationalCost / tData.totalDistance).toFixed(2))
        : 0;

    return {
      totalRevenue: tData.totalRevenue,
      totalFuelCost: fData.totalFuelCost,
      totalMaintenanceCost: mData.totalMaintenanceCost,
      totalOperationalCost,
      fleetFuelEfficiency,
      averageCostPerKM,
      totalTrips: tData.totalTrips,
      activeVehicles,
    };
  }

  /**
   * STEP 5: VEHICLE PERFORMANCE ANALYTICS (ROI)
   * Detailed breakdown across Vehicles merging distinct collection data via lookup/groups
   */
  async getVehicleAnalytics() {
    const vehicles = await Vehicle.aggregate([
      // We only assess valid fleet
      { $match: { status: { $ne: "retired" } } },

      // Lookup Trips for Distance & Revenue
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "vehicleId",
          pipeline: [{ $match: { status: "completed" } }],
          as: "trips",
        },
      },
      // Lookup Fuel for Costs
      {
        $lookup: {
          from: "fuels",
          localField: "_id",
          foreignField: "vehicleId",
          as: "fuelLogs",
        },
      },
      // Lookup Maintenance for Costs
      {
        $lookup: {
          from: "maintenances",
          localField: "_id",
          foreignField: "vehicleId",
          pipeline: [{ $match: { status: "completed" } }],
          as: "maintenanceLogs",
        },
      },

      // Mathematically map the array sets into single calculated vars for projection
      {
        $addFields: {
          totalRevenue: { $sum: "$trips.revenue" },
          totalTrips: { $size: "$trips" },
          totalDistance: {
            $sum: {
              $map: {
                input: "$trips",
                as: "t",
                in: { $subtract: ["$$t.endOdometer", "$$t.startOdometer"] },
              },
            },
          },
          totalFuelCost: {
            $sum: {
              $map: {
                input: "$fuelLogs",
                as: "f",
                in: { $multiply: ["$$f.liters", "$$f.costPerLiter"] },
              },
            },
          },
          totalMaintenanceCost: { $sum: "$maintenanceLogs.cost" },
        },
      },

      {
        $addFields: {
          totalCost: { $add: ["$totalFuelCost", "$totalMaintenanceCost"] },
          profit: {
            $subtract: [
              "$totalRevenue",
              { $add: ["$totalFuelCost", "$totalMaintenanceCost"] },
            ],
          },
        },
      },

      // Final Output mapping & ROI
      {
        $project: {
          vehicleName: {
            $concat: ["$make", " ", "$model", " (", "$licensePlate", ")"],
          },
          totalTrips: 1,
          totalRevenue: 1,
          totalFuelCost: 1,
          totalMaintenanceCost: 1,
          totalDistance: 1,
          costPerKM: {
            $cond: [
              { $gt: ["$totalDistance", 0] },
              { $round: [{ $divide: ["$totalCost", "$totalDistance"] }, 2] },
              0,
            ],
          },
          ROI: {
            $cond: [
              { $gt: ["$acquisitionCost", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$profit", "$acquisitionCost"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { ROI: -1 } },
    ]);

    return vehicles;
  }

  /**
   * STEP 6: MONTHLY TREND ANALYTICS
   * Groups revenue and costs across the chronological calendar structure
   */
  async getMonthlyTrends() {
    // A. Group Trip Revenues by Year-Month
    const tripMonthly = await Trip.aggregate([
      { $match: { status: "completed", createdAt: { $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$revenue" },
        },
      },
    ]);

    // B. Group Fuel Costs by Year-Month
    const fuelMonthly = await Fuel.aggregate([
      { $match: { date: { $ne: null } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          fuelCost: { $sum: { $multiply: ["$liters", "$costPerLiter"] } },
        },
      },
    ]);

    // C. Group Maintenance Costs by Year-Month
    const maintenanceMonthly = await Maintenance.aggregate([
      { $match: { status: "completed", date: { $ne: null } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          maintenanceCost: { $sum: "$cost" },
        },
      },
    ]);

    // Combine the disparate timelines into a uniform normalized object map
    const aggregateMap = {};

    const addEntry = (dateObj, field, value) => {
      if (!dateObj || !dateObj.year || !dateObj.month) return;
      const key = `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}`;
      if (!aggregateMap[key]) {
        aggregateMap[key] = {
          month: key,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          totalCost: 0,
        };
      }
      aggregateMap[key][field] += value;
    };

    tripMonthly.forEach((t) => addEntry(t._id, "revenue", t.revenue));
    fuelMonthly.forEach((f) => addEntry(f._id, "fuelCost", f.fuelCost));
    maintenanceMonthly.forEach((m) =>
      addEntry(m._id, "maintenanceCost", m.maintenanceCost),
    );

    // Calculate Totals and Flatten array
    const trends = Object.values(aggregateMap).map((m) => {
      m.totalCost = m.fuelCost + m.maintenanceCost;
      return m;
    });

    // Sort chronologically ascending
    trends.sort((a, b) => a.month.localeCompare(b.month));

    return trends;
  }
}

module.exports = new AnalyticsService();
