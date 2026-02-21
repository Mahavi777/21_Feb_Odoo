const Trip = require("../trips/trip.model");
const Vehicle = require("../vehicles/vehicle.model");
const Fuel = require("../fuel/fuel.model");
const Maintenance = require("../maintenance/maintenance.model");

class FinanceService {
  /**
   * Helper function to build the MongoDB date filter object
   */
  _buildDateFilter(field, fromDate, toDate) {
    const filter = {};
    if (fromDate || toDate) filter[field] = {};
    if (fromDate) filter[field].$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filter[field].$lte = end;
    }
    return Object.keys(filter).length > 0 ? filter : null;
  }

  /**
   * 1️⃣ TOP KPI STRIP (Financial Overview)
   */
  async getDashboardKPIs(fromDate, toDate) {
    const tripFilter =
      this._buildDateFilter("createdAt", fromDate, toDate) || {};
    const tripMatch = { status: "completed", ...tripFilter };

    const tripAgg = await Trip.aggregate([
      { $match: tripMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
          totalDistance: {
            $sum: { $subtract: ["$endOdometer", "$startOdometer"] },
          },
        },
      },
    ]);

    const fuelFilter = this._buildDateFilter("date", fromDate, toDate) || {};
    const fuelAgg = await Fuel.aggregate([
      { $match: fuelFilter },
      {
        $group: {
          _id: null,
          totalFuelCost: { $sum: { $multiply: ["$liters", "$costPerLiter"] } },
        },
      },
    ]);

    const maintFilter = this._buildDateFilter("date", fromDate, toDate) || {};
    const maintMatch = { status: "completed", ...maintFilter };
    const maintAgg = await Maintenance.aggregate([
      { $match: maintMatch },
      {
        $group: {
          _id: null,
          totalMaintenanceCost: { $sum: "$cost" },
        },
      },
    ]);

    const rev = tripAgg[0]?.totalRevenue || 0;
    const dist = tripAgg[0]?.totalDistance || 0;
    const fCost = fuelAgg[0]?.totalFuelCost || 0;
    const mCost = maintAgg[0]?.totalMaintenanceCost || 0;

    const totalOpsCost = fCost + mCost;
    const netProfit = rev - totalOpsCost;
    const costPerKM = dist > 0 ? Number((totalOpsCost / dist).toFixed(2)) : 0;

    return {
      totalRevenue: rev,
      totalFuelCost: fCost,
      totalMaintenanceCost: mCost,
      totalOperationalCost: totalOpsCost,
      netProfit,
      costPerKM,
    };
  }

  /**
   * 2️⃣ REVENUE VS COST TREND CHART (Monthly)
   */
  async getMonthlyTrends(fromDate, toDate) {
    const tripFilter =
      this._buildDateFilter("createdAt", fromDate, toDate) || {};
    const fuelFilter = this._buildDateFilter("date", fromDate, toDate) || {};
    const maintFilter = this._buildDateFilter("date", fromDate, toDate) || {};

    const tripAgg = await Trip.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $ne: null },
          ...tripFilter,
        },
      },
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

    const fuelAgg = await Fuel.aggregate([
      { $match: { date: { $ne: null }, ...fuelFilter } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          fuelCost: { $sum: { $multiply: ["$liters", "$costPerLiter"] } },
        },
      },
    ]);

    const maintAgg = await Maintenance.aggregate([
      { $match: { status: "completed", date: { $ne: null }, ...maintFilter } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          maintCost: { $sum: "$cost" },
        },
      },
    ]);

    const map = {};
    const addE = (d, f, v) => {
      if (!d || !d.year || !d.month) return;
      const k = `${d.year}-${String(d.month).padStart(2, "0")}`;
      if (!map[k])
        map[k] = { month: k, revenue: 0, fuelCost: 0, maintenanceCost: 0 };
      map[k][f] += v;
    };

    tripAgg.forEach((t) => addE(t._id, "revenue", t.revenue));
    fuelAgg.forEach((f) => addE(f._id, "fuelCost", f.fuelCost));
    maintAgg.forEach((m) => addE(m._id, "maintenanceCost", m.maintCost));

    const trends = Object.values(map).map((m) => {
      m.totalCost = m.fuelCost + m.maintenanceCost;
      m.netProfit = m.revenue - m.totalCost;
      return m;
    });

    trends.sort((a, b) => a.month.localeCompare(b.month));
    return trends;
  }

  /**
   * 3️⃣ FUEL MANAGEMENT PANEL
   */
  async getFuelLogs(fromDate, toDate) {
    const fuelFilter = this._buildDateFilter("date", fromDate, toDate) || {};

    const logs = await Fuel.aggregate([
      { $match: fuelFilter },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $lookup: {
          from: "trips",
          localField: "tripId",
          foreignField: "_id",
          as: "trip",
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$trip", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          totalCost: {
            $round: [{ $multiply: ["$liters", "$costPerLiter"] }, 2],
          },
          tripDistance: {
            $cond: [
              {
                $and: [
                  { $ne: ["$trip", null] },
                  { $ne: ["$trip.endOdometer", null] },
                ],
              },
              { $subtract: ["$trip.endOdometer", "$trip.startOdometer"] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          tripId: "$trip._id",
          vehicleName: {
            $concat: [
              "$vehicle.make",
              " ",
              "$vehicle.model",
              " (",
              "$vehicle.licensePlate",
              ")",
            ],
          },
          liters: 1,
          cost: "$totalCost",
          date: 1,
          tripDistance: 1,
          costPerKM: {
            $cond: [
              { $gt: ["$tripDistance", 0] },
              { $round: [{ $divide: ["$totalCost", "$tripDistance"] }, 2] },
              0,
            ],
          },
        },
      },
      { $sort: { date: -1 } },
    ]);

    return logs;
  }

  /**
   * 4️⃣ MAINTENANCE EXPENSE PANEL
   */
  async getMaintenanceLogs(fromDate, toDate) {
    const filter = this._buildDateFilter("date", fromDate, toDate) || {};

    // Group totals by vehicle inline to attach to logs
    const maintMap = await Maintenance.aggregate([
      { $match: { ...filter } },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          vehicleId: "$vehicleId",
          vehicleName: {
            $concat: [
              "$vehicle.make",
              " ",
              "$vehicle.model",
              " (",
              "$vehicle.licensePlate",
              ")",
            ],
          },
          description: 1,
          type: 1,
          cost: 1,
          date: 1,
          status: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    return maintMap;
  }

  /**
   * 5️⃣ VEHICLE FINANCIAL PERFORMANCE (ROI TABLE) & 6️⃣ PROFITABILITY INSIGHTS
   */
  async getVehicleROI(fromDate, toDate) {
    const tripFilter =
      this._buildDateFilter("createdAt", fromDate, toDate) || {};
    const tripMatch = { status: "completed", ...tripFilter };

    const fuelFilter = this._buildDateFilter("date", fromDate, toDate) || {};
    const maintFilter = this._buildDateFilter("date", fromDate, toDate) || {};
    const maintMatch = { status: "completed", ...maintFilter };

    const vehicles = await Vehicle.aggregate([
      { $match: { status: { $ne: "retired" } } },
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "vehicleId",
          pipeline: [{ $match: tripMatch }],
          as: "trips",
        },
      },
      {
        $lookup: {
          from: "fuels",
          localField: "_id",
          foreignField: "vehicleId",
          pipeline: [{ $match: fuelFilter }],
          as: "fuelLogs",
        },
      },
      {
        $lookup: {
          from: "maintenances",
          localField: "_id",
          foreignField: "vehicleId",
          pipeline: [{ $match: maintMatch }],
          as: "maintenanceLogs",
        },
      },
      {
        $addFields: {
          totalRevenue: { $sum: "$trips.revenue" },
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
          netProfit: {
            $subtract: [
              "$totalRevenue",
              { $add: ["$totalFuelCost", "$totalMaintenanceCost"] },
            ],
          },
        },
      },
      {
        $project: {
          vehicleName: {
            $concat: ["$make", " ", "$model", " (", "$licensePlate", ")"],
          },
          acquisitionCost: 1,
          totalRevenue: 1,
          totalFuelCost: 1,
          totalMaintenanceCost: 1,
          totalCost: 1,
          netProfit: 1,
          totalDistance: 1,
          costPerKM: {
            $cond: [
              { $gt: ["$totalDistance", 0] },
              { $round: [{ $divide: ["$totalCost", "$totalDistance"] }, 2] },
              0,
            ],
          },
          ROI: {
            // ROI = (Net Profit / AcquisitionCost) * 100
            $cond: [
              { $gt: ["$acquisitionCost", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$netProfit", "$acquisitionCost"] },
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

    // Construct Profitability Insights from the array cleanly
    let mostProfitable = null;
    let highestFuel = null;
    let highestMaint = null;
    let lowestROI = null;

    if (vehicles.length > 0) {
      mostProfitable = vehicles.reduce((prev, current) =>
        prev.netProfit > current.netProfit ? prev : current,
      );
      highestFuel = vehicles.reduce((prev, current) =>
        prev.totalFuelCost > current.totalFuelCost ? prev : current,
      );
      highestMaint = vehicles.reduce((prev, current) =>
        prev.totalMaintenanceCost > current.totalMaintenanceCost
          ? prev
          : current,
      );
      lowestROI = vehicles.reduce((prev, current) =>
        prev.ROI < current.ROI ? prev : current,
      );
    }

    return {
      vehicles,
      insights: {
        mostProfitable: mostProfitable
          ? { name: mostProfitable.vehicleName, val: mostProfitable.netProfit }
          : null,
        highestFuelConsumer: highestFuel
          ? { name: highestFuel.vehicleName, val: highestFuel.totalFuelCost }
          : null,
        highestMaintenance: highestMaint
          ? {
              name: highestMaint.vehicleName,
              val: highestMaint.totalMaintenanceCost,
            }
          : null,
        lowestROI: lowestROI
          ? { name: lowestROI.vehicleName, val: lowestROI.ROI }
          : null,
      },
    };
  }
}

module.exports = new FinanceService();
