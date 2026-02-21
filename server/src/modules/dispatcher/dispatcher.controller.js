const Trip = require('../trips/trip.model');
const Vehicle = require('../vehicles/vehicle.model');
const User = require('../users/user.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      activeTripsCount,
      draftTripsCount,
      availableVehiclesCount,
      availableDriversCount,
      tripStatusAggregation,
      vehicleStatusAggregation
    ] = await Promise.all([
      // Count active (dispatched) trips
      Trip.countDocuments({ status: 'dispatched' }),
      
      // Count draft trips
      Trip.countDocuments({ status: 'draft' }),
      
      // Count available vehicles
      Vehicle.countDocuments({ status: 'available' }),
      
      // Count available drivers (users who are 'offDuty' and typically role 'dispatcher' or regular user without suspended status)
      User.countDocuments({ 
        status: 'offDuty',
        role: { $in: ['dispatcher', 'manager'] } // Adjusting generic driver assignment rules 
      }),
      
      // Aggregation for Trip Status Breakdown Pie Chart
      Trip.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Aggregation for Vehicle Availability Bar Chart
      Vehicle.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format aggregations for the frontend
    const tripStatusBreakdown = tripStatusAggregation.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1), // e.g. "draft" -> "Draft"
      value: item.count
    }));

    const vehicleAvailabilityBreakdown = vehicleStatusAggregation.map(item => ({
      status: item._id === 'onTrip' ? 'On Trip' : 
              item._id === 'inShop' ? 'Maintenance' : 
              item._id.charAt(0).toUpperCase() + item._id.slice(1),
      count: item.count
    }));

    res.json({
      message: 'Dispatcher dashboard stats fetched successfully',
      data: {
        activeTrips: activeTripsCount,
        draftTrips: draftTripsCount,
        availableVehicles: availableVehiclesCount,
        availableDrivers: availableDriversCount,
        tripStatusBreakdown,
        vehicleAvailabilityBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching dispatcher dashboard stats', 
      error: error.message 
    });
  }
};
