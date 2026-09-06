import prisma from "../utils/prisma.js";
import { calculateTotals, generateInvoiceNumber, STATUSES } from "../services/invoice.service.js";

export async function getInvoices(req, res) {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status && STATUSES.includes(status)) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return res.json({ success: true, invoices });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch invoices" });
  }
}

export async function getInvoice(req, res) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true },
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    return res.json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch invoice" });
  }
}

export async function createInvoice(req, res) {
  try {
    const {
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      dueDate,
      currency = "USD",
      notes,
      taxRate = 0,
      discount = 0,
      shipping = 0,
      status = "PENDING",
      items = [],
    } = req.body || {};

    if (!clientName || !clientEmail || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: "Client info and at least one item are required" });
    }
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const safeItems = items.map((it) => ({
      description: it.description,
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.unitPrice) || 0,
      amount: round(Number(it.quantity) * Number(it.unitPrice)),
    }));

    const totals = calculateTotals(safeItems, Number(taxRate), Number(discount), Number(shipping));
    const invoiceNumber = await generateInvoiceNumber(req.user.id);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientName,
        clientEmail,
        clientAddress,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        currency,
        notes,
        taxRate: Number(taxRate),
        discount: Number(discount),
        shipping: Number(shipping),
        status,
        ...totals,
        userId: req.user.id,
        items: { create: safeItems },
      },
      include: { items: true },
    });

    return res.status(201).json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create invoice" });
  }
}

export async function updateInvoice(req, res) {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const {
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      dueDate,
      currency,
      notes,
      taxRate,
      discount,
      shipping,
      status,
      items,
    } = req.body || {};

    const data = {};
    if (clientName !== undefined) data.clientName = clientName;
    if (clientEmail !== undefined) data.clientEmail = clientEmail;
    if (clientAddress !== undefined) data.clientAddress = clientAddress;
    if (issueDate) data.issueDate = new Date(issueDate);
    if (dueDate) data.dueDate = new Date(dueDate);
    if (currency !== undefined) data.currency = currency;
    if (notes !== undefined) data.notes = notes;

    const txRate = taxRate !== undefined ? Number(taxRate) : existing.taxRate;
    const disc = discount !== undefined ? Number(discount) : existing.discount;
    const ship = shipping !== undefined ? Number(shipping) : existing.shipping;

    if (taxRate !== undefined) data.taxRate = txRate;
    if (discount !== undefined) data.discount = disc;
    if (shipping !== undefined) data.shipping = ship;
    if (status !== undefined) {
      if (!STATUSES.includes(status))
        return res.status(400).json({ success: false, message: "Invalid status" });
      data.status = status;
    }

    let safeItems = items;
    if (Array.isArray(items)) {
      safeItems = items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        amount: round(Number(it.quantity) * Number(it.unitPrice)),
      }));
    }

    const totalsItems = Array.isArray(safeItems) ? safeItems : existing.items;
    const totals = calculateTotals(totalsItems, txRate, disc, ship);
    data.subtotal = totals.subtotal;
    data.taxAmount = totals.taxAmount;
    data.discountAmount = totals.discountAmount;
    data.total = totals.total;

    const invoice = await prisma.$transaction(async (tx) => {
      if (Array.isArray(safeItems)) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: existing.id } });
      }
      return tx.invoice.update({
        where: { id: existing.id },
        data: {
          ...data,
          ...(Array.isArray(safeItems) ? { items: { create: safeItems } } : {}),
        },
        include: { items: true },
      });
    });

    return res.json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to update invoice" });
  }
}

export async function deleteInvoice(req, res) {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    await prisma.invoice.delete({ where: { id: existing.id } });
    return res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete invoice" });
  }
}

function round(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
