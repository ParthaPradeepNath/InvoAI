import { Router } from "express";
import PDFDocument from "pdfkit";
import prisma from "../utils/prisma.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/:id", async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, user: true },
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const currencySymbols = { USD: "$", EUR: "€", GBP: "£", INR: "₹", CAD: "C$", AUD: "A$" };
    const symbol = currencySymbols[invoice.currency] || invoice.currency + " ";

    const money = (n) =>
      symbol + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const doc = new PDFDocument({ margin: 48, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    doc.pipe(res);

    doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "right" });
    doc.moveDown(0.2);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#888888")
      .text(`#${invoice.invoiceNumber}`, { align: "right" });

    doc.moveDown(2);
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#111111").text("FROM");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11);
    doc.text(invoice.user.name || invoice.user.email);
    if (invoice.user.company) doc.text(invoice.user.company);
    if (invoice.user.address) doc.text(invoice.user.address);
    if (invoice.user.phone) doc.text(invoice.user.phone);
    if (invoice.user.email) doc.text(invoice.user.email);

    doc.moveDown(1.4);
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#111111").text("BILLED TO");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11);
    doc.text(invoice.clientName);
    doc.text(invoice.clientEmail);
    if (invoice.clientAddress) doc.text(invoice.clientAddress);

    const rightX = doc.page.width - doc.page.margins.right;
    const titleY = doc.y;
    doc.fontSize(13).font("Helvetica-Bold").text("DETAILS", rightX, titleY, { align: "right" });
    doc.moveDown(0.3);
    const details = [
      [
        "Issue Date",
        new Date(invoice.issueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      ],
      [
        "Due Date",
        new Date(invoice.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      ],
      ["Status", invoice.status],
    ];
    details.forEach(([k, v]) => {
      doc.font("Helvetica").fontSize(11).text(`${k}: ${v}`, rightX, doc.y, { align: "right" });
    });

    doc.moveDown(2);
    const tableTop = doc.y;
    const colX = {
      desc: doc.page.margins.left,
      qty: 330,
      price: 440,
      amount: rightX,
    };

    const amountX = rightX - 80;

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#333333");
    doc.text("DESCRIPTION", colX.desc, tableTop);
    doc.text("QTY", colX.qty, tableTop, { width: 60 });
    doc.text("RATE", colX.price, tableTop, { width: 75, align: "right" });
    doc.text("AMOUNT", amountX, tableTop, { width: 80, align: "right" });

    doc
      .moveDown()
      .fillColor("#e0e0e0")
      .rect(colX.desc, doc.y, rightX - colX.desc, 1)
      .fill();

    let y = doc.y + 10;
    doc.font("Helvetica").fontSize(11).fillColor("#111111");
    invoice.items.forEach((it) => {
      doc.text(it.description, colX.desc, y);
      doc.text(String(it.quantity), colX.qty, y, { width: 60, lineBreak: false });
      doc.text(money(it.unitPrice), colX.price, y, { width: 75, align: "right", lineBreak: false });
      doc.text(money(it.amount), amountX, y, { width: 80, align: "right" });
      y = doc.y + 8;
    });

    doc.moveDown(2);
    doc.font("Helvetica").fontSize(11).fillColor("#555555");
    const summaryRows = [
      ["Subtotal", money(invoice.subtotal)],
      ...(invoice.discountAmount > 0 ? [["Discount", "- " + money(invoice.discountAmount)]] : []),
      [`Tax (${invoice.taxRate}%)`, money(invoice.taxAmount)],
      ...(invoice.shipping > 0 ? [["Shipping", money(invoice.shipping)]] : []),
    ];
    summaryRows.forEach(([k, v]) => {
      doc.text(k, colX.desc);
      doc.text(v, amountX, doc.y - 12, { width: 80, align: "right" });
      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#111111").text("Total", colX.desc);
    doc.text(money(invoice.total), amountX, doc.y - 14, { width: 80, align: "right" });

    if (invoice.notes) {
      doc.moveDown(2);
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#111111").text("NOTES");
      doc.moveDown(0.3);
      doc.font("Helvetica").fillColor("#555555").text(invoice.notes);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
  }
});

export default router;
