const financeService = require('./finance.service');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

/**
 * GET /finance/dashboard
 * Get finance dashboard summary with all KPIs
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const summary = await financeService.getDashboardSummary();
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message,
    });
  }
};

/**
 * GET /finance/vehicle/:vehicleId
 * Get financial breakdown for a specific vehicle
 */
exports.getVehicleFinancial = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const breakdown = await financeService.getVehicleFinancialBreakdown(vehicleId);
    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle financial data',
      error: error.message,
    });
  }
};

/**
 * GET /finance/report
 * Get monthly financial report
 */
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
    }

    const report = await financeService.getMonthlyReport(parseInt(month), parseInt(year));
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly report',
      error: error.message,
    });
  }
};

/**
 * GET /finance/top-costly
 * Get top 5 costliest vehicles by operational cost
 */
exports.getTopCostliestVehicles = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const vehicles = await financeService.getTopCostliestVehicles(parseInt(limit));
    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching costliest vehicles',
      error: error.message,
    });
  }
};

/**
 * GET /finance/export
 * Export financial data in CSV or PDF format
 */
exports.exportFinancialData = async (req, res) => {
  try {
    const { format } = req.query;

    if (!format || !['csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format is required and must be "csv" or "pdf"',
      });
    }

    if (format === 'csv') {
      return exports.exportCSV(req, res);
    } else if (format === 'pdf') {
      return exports.exportPDF(req, res);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting financial data',
      error: error.message,
    });
  }
};

/**
 * Export financial data as CSV
 */
exports.exportCSV = async (req, res) => {
  try {
    const vehicleData = await financeService.getAllVehiclesFinancialData();
    const monthlySummary = await financeService.getMonthlySummaryData();

    // Create CSV for vehicle financial breakdown
    const vehicleFields = [
      'vehicleName',
      'licensePlate',
      'vehicleType',
      'acquisitionCost',
      'totalRevenue',
      'totalFuelCost',
      'totalMaintenanceCost',
      'totalOperationalCost',
      'netProfit',
      'roi',
    ];

    const vehicleParser = new Parser({ fields: vehicleFields });
    const vehicleCSV = vehicleParser.parse(vehicleData);

    // Create CSV for monthly summary
    const monthlyFields = ['month', 'revenue', 'fuelCost', 'maintenanceCost', 'netProfit'];
    const monthlyParser = new Parser({ fields: monthlyFields });
    const monthlyCSV = monthlyParser.parse(monthlySummary);

    // Combine CSVs
    const finalCSV = `FLEET FINANCIAL REPORT\n=========================\n\nVEHICLE FINANCIAL BREAKDOWN\n${vehicleCSV}\n\nMONTHLY SUMMARY\n${monthlyCSV}`;

    // Send CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fleetflow-financial-report.csv"');
    res.send(finalCSV);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting CSV',
      error: error.message,
    });
  }
};

/**
 * Export financial data as PDF
 */
exports.exportPDF = async (req, res) => {
  try {
    const summary = await financeService.getDashboardSummary();
    const vehicleData = await financeService.getAllVehiclesFinancialData();
    const topCostly = await financeService.getTopCostliestVehicles(5);

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="fleetflow-financial-report.pdf"');

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(24).font('Helvetica-Bold').text('FleetFlow Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Dashboard Summary Section
    doc.fontSize(14).font('Helvetica-Bold').text('Dashboard Summary', { underline: true });
    doc.moveDown(0.5);

    const summaryData = [
      ['Total Revenue', `$${summary.totalRevenue.toFixed(2)}`],
      ['Total Fuel Cost', `$${summary.totalFuelCost.toFixed(2)}`],
      ['Total Maintenance Cost', `$${summary.totalMaintenanceCost.toFixed(2)}`],
      ['Total Operational Cost', `$${summary.totalOperationalCost.toFixed(2)}`],
      ['Net Profit', `$${summary.netProfit.toFixed(2)}`],
      ['Fleet ROI', `${summary.fleetROI.toFixed(2)}%`],
      ['Utilization Rate', `${summary.utilizationRate.toFixed(2)}%`],
    ];

    doc.fontSize(10).font('Helvetica');
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
      doc.moveDown(0.3);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Vehicle Financial Breakdown Section
    doc.fontSize(14).font('Helvetica-Bold').text('Top 5 Costliest Vehicles', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Vehicle', 50, doc.y);
    doc.text('License Plate', 150, doc.y);
    doc.text('Fuel Cost', 250, doc.y);
    doc.text('Maintenance', 350, doc.y);
    doc.text('Op. Cost', 450, doc.y);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica');
    topCostly.forEach((vehicle) => {
      doc.fontSize(8);
      doc.text(vehicle.vehicleName.substring(0, 18), 50, doc.y);
      doc.text(vehicle.licensePlate, 150, doc.y);
      doc.text(`$${vehicle.totalFuelCost}`, 250, doc.y);
      doc.text(`$${vehicle.totalMaintenanceCost}`, 350, doc.y);
      doc.text(`$${vehicle.totalOperationalCost}`, 450, doc.y);
      doc.moveDown(0.5);
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting PDF',
      error: error.message,
    });
  }
};
