// routes/print.js
import express from "express";
import ThermalPrinter from "node-thermal-printer";
import { PrinterTypes } from "node-thermal-printer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { bill } = req.body;

    const printer = new ThermalPrinter.printer({
      type: PrinterTypes.EPSON, // or STAR if your printer is Star Micronics
      interface: "usb",          // try 'usb', 'tcp://<IP>', or 'printer:Star_TSP100'
      options: {
        timeout: 1000,
      },
    });

    printer.alignCenter();
    printer.bold(true);
    printer.println("SANGHAMITRA");
    printer.bold(false);
    printer.println("Business Incubator");
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Date: ${new Date(bill.date).toLocaleString("en-IN")}`);
    printer.println(`Customer: ${bill.customerName}`);
    printer.drawLine();

    printer.tableCustom([
      { text: "ITEM", align: "LEFT", width: 0.5, bold: true },
      { text: "QTY", align: "CENTER", width: 0.2, bold: true },
      { text: "AMT", align: "RIGHT", width: 0.3, bold: true },
    ]);

    bill.products.forEach((p) => {
      printer.tableCustom([
        { text: p.product.slice(0, 18), align: "LEFT", width: 0.5 },
        { text: String(p.quantity), align: "CENTER", width: 0.2 },
        { text: `₹${p.total.toFixed(2)}`, align: "RIGHT", width: 0.3 },
      ]);
    });

    printer.drawLine();
    printer.bold(true);
    printer.println(`Total Items: ${bill.products.length}`);
    printer.println(`Total Qty: ${bill.products.reduce((s, p) => s + p.quantity, 0)}`);
    printer.println(`TOTAL: ₹${bill.totalAmount.toFixed(2)}`);
    printer.bold(false);
    printer.drawLine();
    printer.println("Thank you for your business!");
    printer.println("sanghamitra.store");

    const isConnected = await printer.isPrinterConnected();
    if (isConnected) {
      await printer.execute();
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Printer not connected" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Print failed" });
  }
});

export default router;
