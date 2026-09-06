import prisma from "../utils/prisma.js";

export function calculateTotals(items, taxRate = 0, discount = 0, shipping = 0) {
  const subtotal = (items || []).reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = discount > 0 ? Math.min(discount, subtotal) : 0;
  const total = subtotal + taxAmount - discountAmount + shipping;
  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    discountAmount: round2(discountAmount),
    total: round2(total),
  };
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function generateInvoiceNumber(userId) {
  const count = await prisma.invoice.count({ where: { userId } });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const STATUSES = ["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"];
