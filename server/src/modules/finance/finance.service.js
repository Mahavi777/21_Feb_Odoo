const Trip = require('../trips/trip.model');
const Maintenance = require('../maintenance/maintenance.model');
const Fuel = require('../fuel/fuel.model');
const Vehicle = require('../vehicles/vehicle.model');

/**
 * Get Finance Dashboard Summary
 * Returns: totalRevenue, totalFuelCost, totalMaintenanceCost, totalOperationalCost, netProfit, fleetROI, utilizationRate
 */
exports.getDashboardSummary = async () => {
  try {
    // Get all trips with revenue
    const trips = await Trip.find({ status: 'completed' });
    const totalRevenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

    // Get all fuel costs
    const fuelRecords = await Fuel.find();
    const totalFuelCost = fuelRecords.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

    // Get all maintenance costs
    const maintenanceRecords = await Maintenance.find();
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, maint) => sum + (maint.cost || 0), 0);

    // Calculate Total Operational Cost
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

    // Calculate Net Profit
    const netProfit = totalRevenue - totalOperationalCost;

    // Get all vehicles and sum their acquisition cost
    const vehicles = await Vehicle.find();
    const totalAcquisitionCost = vehicles.reduce((sum, vehicle) => sum + (vehicle.acquisitionCost || 0), 0);

    // Calculate Fleet ROI
    const fleetROI = totalAcquisitionCost > 0 ? ((netProfit / totalAcquisitionCost) * 100).toFixed(2) : 0;

    // Calculate Utilization Rate (trips completed / total vehicles)
    const utilizationRate = vehicles.length > 0 ? ((trips.length / vehicles.length) * 100).toFixed(2) : 0;

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
      totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      fleetROI: parseFloat(fleetROI),
      utilizationRate: parseFloat(utilizationRate),
    };
  } catch (error) {
    throw new Error(`Error fetching dashboard summary: ${error.message}`);
  }
};

/**
 * Get Vehicle Financial Breakdown
 * Returns: vehicleName, totalRevenue, totalFuelCost, totalMaintenanceCost, costPerKm, roi
 */
exports.getVehicleFinancialBreakdown = async (vehicleId) => {
  try {
    // Get vehicle details
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Get all trips for the vehicle
    const trips = await Trip.find({ vehicleId, status: 'completed' });
    const totalRevenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

    // Calculate total distance
    let totalDistance = 0;
    trips.forEach(trip => {
      if (trip.startOdometer && trip.endOdometer) {
        totalDistance += trip.endOdometer - trip.startOdometer;
      }
    });

    // Get fuel costs for this vehicle
    const fuelRecords = await Fuel.find({ vehicleId });
    const totalFuelCost = fuelRecords.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

    // Get maintenance costs for this vehicle
    const maintenanceRecords = await Maintenance.find({ vehicleId });
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, maint) => sum + (maint.cost || 0), 0);

    // Calculate Cost Per Km
    const costPerKm = totalDistance > 0 ? ((totalFuelCost + totalMaintenanceCost) / totalDistance).toFixed(2) : 0;

    // Calculate ROI
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const roi = vehicle.acquisitionCost > 0
      ? (((totalRevenue - totalOperationalCost) / vehicle.acquisitionCost) * 100).toFixed(2)
      : 0;

    return {
      vehicleId,
      vehicleName: vehicle.name,
      licensePlate: vehicle.licensePlate,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
      totalDistance,
      costPerKm: parseFloat(costPerKm),
      roi: parseFloat(roi),
      acquisitionCost: vehicle.acquisitionCost,
    };
  } catch (error) {
    throw new Error(`Error fetching vehicle financial breakdown: ${error.message}`);
  }
};

/**
 * Get Monthly Financial Report
 * Returns: month, revenue, fuelCost, maintenanceCost, netProfit
 */
exports.getMonthlyReport = async (month, year) => {
  try {
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get trips for the month
    const trips = await Trip.find({
      status: 'completed',
      updatedAt: { $gte: startDate, $lte: endDate },
    });
    const revenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

    // Get fuel costs for the month
    const fuelRecords = await Fuel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const fuelCost = fuelRecords.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

    // Get maintenance costs for the month
    const maintenanceRecords = await Maintenance.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const maintenanceCost = maintenanceRecords.reduce((sum, maint) => sum + (maint.cost || 0), 0);

    // Calculate Net Profit
    const totalOperationalCost = fuelCost + maintenanceCost;
    const netProfit = revenue - totalOperationalCost;

    return {
      month: new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
      revenue: parseFloat(revenue.toFixed(2)),
      fuelCost: parseFloat(fuelCost.toFixed(2)),
      maintenanceCost: parseFloat(maintenanceCost.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
    };
  } catch (error) {
    throw new Error(`Error fetching monthly report: ${error.message}`);
  }
};

/**
 * Get Top 5 Costliest Vehicles
 * Returns array of vehicles sorted by highest operational cost
 */
exports.getTopCostliestVehicles = async (limit = 5) => {
  try {
    const vehicles = await Vehicle.find();

    const vehicleCosts = await Promise.all(
      vehicles.map(async (vehicle) => {
        const fuelRecords = await Fuel.find({ vehicleId: vehicle._id });
        const totalFuelCost = fuelRecords.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

        const maintenanceRecords = await Maintenance.find({ vehicleId: vehicle._id });
        const totalMaintenanceCost = maintenanceRecords.reduce((sum, maint) => sum + (maint.cost || 0), 0);

        const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

        return {
          vehicleId: vehicle._id,
          vehicleName: vehicle.name,
          licensePlate: vehicle.licensePlate,
          totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
          totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
          totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
        };
      })
    );

    // Sort by total operational cost and return top N
    return vehicleCosts.sort((a, b) => b.totalOperationalCost - a.totalOperationalCost).slice(0, limit);
  } catch (error) {
    throw new Error(`Error fetching top costliest vehicles: ${error.message}`);
  }
};

/**
 * Get All Vehicles Financial Data (for export)
 */
exports.getAllVehiclesFinancialData = async () => {
  try {
    const vehicles = await Vehicle.find();

    const vehicleData = await Promise.all(
      vehicles.map(async (vehicle) => {
        const trips = await Trip.find({ vehicleId: vehicle._id, status: 'completed' });
        const totalRevenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

        const fuelRecords = await Fuel.find({ vehicleId: vehicle._id });
        const totalFuelCost = fuelRecords.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

        const maintenanceRecords = await Maintenance.find({ vehicleId: vehicle._id });
        const totalMaintenanceCost = maintenanceRecords.reduce((sum, maint) => sum + (maint.cost || 0), 0);

        const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
        const netProfit = totalRevenue - totalOperationalCost;

        return {
          vehicleName: vehicle.name,
          licensePlate: vehicle.licensePlate,
          vehicleType: vehicle.vehicleType,
          acquisitionCost: vehicle.acquisitionCost,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
          totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
          totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
          netProfit: parseFloat(netProfit.toFixed(2)),
          roi: vehicle.acquisitionCost > 0 ? ((netProfit / vehicle.acquisitionCost) * 100).toFixed(2) : 0,
        };
      })
    );

    return vehicleData;
  } catch (error) {
    throw new Error(`Error fetching vehicle financial data: ${error.message}`);
  }
};

/**
 * Get Monthly Summary Data (for export)
 */
exports.getMonthlySummaryData = async () => {
  try {
    const summaryData = [];

    // Get data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const report = await this.getMonthlyReport(month, year);
      summaryData.push(report);
    }

    return summaryData;
  } catch (error) {
    throw new Error(`Error fetching monthly summary data: ${error.message}`);
  }
};
