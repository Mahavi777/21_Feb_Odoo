const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const AnalyticsService = require("../analytics/analytics.service");

exports.exportCsv = async (req, res) => {
  try {
    // Collect ROI data points
    const vehicles = await AnalyticsService.getVehicleAnalytics();

    // Collect Monthly trend summaries
    const monthlyTrends = await AnalyticsService.getMonthlyTrends();

    const combinedData = [
      ...vehicles.map((v) => ({
        Type: "Vehicle Asset",
        Name: v.vehicleName,
        Cost: v.totalCost,
        Revenue: v.totalRevenue,
        Detail: `${v.ROI}% ROI | ${v.costPerKM}/km`,
      })),
      ...monthlyTrends.map((m) => ({
        Type: "Monthly Summary",
        Name: m.month,
        Cost: m.totalCost,
        Revenue: m.revenue,
        Detail: `Fuel: ${m.fuelCost} | Maint: ${m.maintenanceCost}`,
      })),
    ];

    const fields = ["Type", "Name", "Cost", "Revenue", "Detail"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(combinedData);

    res.header("Content-Type", "text/csv");
    res.attachment("fleetflow-analytics.csv");
    return res.send(csv);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating CSV", error: error.message });
  }
};

exports.exportPdf = async (req, res) => {
  try {
    const fleetKPI = await AnalyticsService.getFleetKPIs();
    const vehicleAnalytics = await AnalyticsService.getVehicleAnalytics();

    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        "Content-Length": Buffer.byteLength(pdfData),
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment;filename=fleetflow-report.pdf",
      });
      res.end(pdfData);
    });

    // Header Structure
    doc
      .fontSize(22)
      .fillColor("#10b981")
      .text("FleetFlow", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(16)
      .fillColor("#111827")
      .text("Executive Financial & Analytics Report", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: "center",
      });
    doc.moveDown(2);

    // KPI Summary Section
    doc
      .fontSize(14)
      .fillColor("#111827")
      .text("Fleet-Wide Performance Indicators");
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .fillColor("#374151")
      .text(`Total Revenue: $${fleetKPI.totalRevenue.toLocaleString()}`)
      .text(
        `Total Operational Cost: $${fleetKPI.totalOperationalCost.toLocaleString()}`,
      )
      .text(`Total Active Vehicles: ${fleetKPI.activeVehicles}`)
      .text(`Fleet Fuel Efficiency: ${fleetKPI.fleetFuelEfficiency} km/L`)
      .text(`Average Cost Per KM: $${fleetKPI.averageCostPerKM}`);

    doc.moveDown(2);

    // Vehicle ROI Section
    doc
      .fontSize(14)
      .fillColor("#111827")
      .text("Top Asset Performance (by ROI)");
    doc.moveDown(0.5);

    // Draw simple table rows for ROI
    vehicleAnalytics.slice(0, 5).forEach((v, idx) => {
      doc
        .fontSize(11)
        .fillColor("#374151")
        .text(
          `${idx + 1}. ${v.vehicleName} -> ${v.ROI}% ROI, Cost: $${v.totalCost}, Rev: $${v.totalRevenue}`,
        );
      doc.moveDown(0.3);
    });

    doc.moveDown(4);

    // Footer
    doc
      .fontSize(10)
      .fillColor("#9ca3af")
      .text("Confidential - Internal Enterprise Use Only", { align: "center" });

    doc.end();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating PDF", error: error.message });
  }
};
