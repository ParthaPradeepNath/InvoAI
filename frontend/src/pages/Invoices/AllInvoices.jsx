import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, ReceiptText, Trash2, Search } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatMoney, formatDate, invoiceStatusStyles } from "../../utils/helper";
import toast from "react-hot-toast";

const statusFilters = ["ALL", "DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"];

function AllInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.invoices.all, {
        params: filter !== "ALL" ? { status: filter } : {},
      });
      setInvoices(res.data.invoices || []);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(API_PATHS.invoices.delete(id));
      toast.success("Invoice deleted");
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-gray-500">Manage all your invoices in one place.</p>
        </div>
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <PlusCircle size={18} /> New invoice
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === s ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-56 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Loading invoices...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <ReceiptText size={40} className="mb-3 text-gray-300" />
          <p className="font-medium text-gray-700">No invoices found</p>
          <p className="mb-5 text-sm text-gray-400">
            {invoices.length === 0
              ? "Create your first invoice to get started."
              : "Try a different search or filter."}
          </p>
          {invoices.length === 0 && (
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <PlusCircle size={18} /> Create invoice
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Issue date</th>
                <th className="px-5 py-3 font-medium">Due date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-5 py-3 font-medium">
                    <Link to={`/invoices/${inv.id}`} className="hover:text-primary">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{inv.clientName}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-3 font-semibold">
                    {formatMoney(inv.total, inv.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${invoiceStatusStyles[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(inv.id)}
                      disabled={deletingId === inv.id}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      aria-label={`Delete ${inv.invoiceNumber}`}
                    >
                      {deletingId === inv.id ? "..." : <Trash2 size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AllInvoices;
