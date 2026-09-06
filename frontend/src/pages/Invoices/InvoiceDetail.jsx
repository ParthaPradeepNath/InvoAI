import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Loader2, Mail, MapPin, User } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatMoney, formatDate, invoiceStatusStyles } from "../../utils/helper";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"];

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(API_PATHS.invoices.get(id))
      .then((res) => setInvoice(res.data.invoice))
      .catch(() => toast.error("Invoice not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.invoices.pdf(id), {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await axiosInstance.put(API_PATHS.invoices.update(id), { status });
      setInvoice(res.data.invoice);
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this invoice? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.invoices.delete(id));
      toast.success("Invoice deleted");
      navigate("/invoices");
    } catch {
      toast.error("Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
        Loading invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
        <p className="font-medium text-gray-700">Invoice not found</p>
        <Link to="/invoices" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50"
            aria-label="Back to invoices"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  invoiceStatusStyles[invoice.status]
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">Created {formatDate(invoice.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            aria-label="Delete invoice"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">From</p>
                <p className="font-semibold">{invoice.user?.name || "You"}</p>
                {invoice.user?.company && (
                  <p className="text-sm text-gray-600">{invoice.user.company}</p>
                )}
                {invoice.user?.address && (
                  <p className="text-sm text-gray-500">{invoice.user.address}</p>
                )}
              </div>
              <div className="text-right">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Bill to</p>
                <p className="font-semibold">{invoice.clientName}</p>
                <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
                {invoice.clientAddress && (
                  <p className="text-sm text-gray-500">{invoice.clientAddress}</p>
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-400">Issue date</p>
                <p className="text-sm font-medium">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Due date</p>
                <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Currency</p>
                <p className="text-sm font-medium">{invoice.currency}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-2.5 font-medium">Description</th>
                    <th className="px-4 py-2.5 font-medium">Qty</th>
                    <th className="px-4 py-2.5 text-right font-medium">Rate</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatMoney(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatMoney(item.amount, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {invoice.notes && (
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Notes</p>
                <p className="whitespace-pre-wrap text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatMoney(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span>-{formatMoney(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
                <span>{formatMoney(invoice.taxAmount, invoice.currency)}</span>
              </div>
              {invoice.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{formatMoney(invoice.shipping, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
                <span>Total</span>
                <span>{formatMoney(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Contact</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                {invoice.user?.name || "You"}
              </div>
              {invoice.user?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {invoice.user.email}
                </div>
              )}
              {invoice.user?.phone && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {invoice.user.phone}
                </div>
              )}
              {invoice.user?.address && (
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 text-gray-400" />
                  {invoice.user.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;
