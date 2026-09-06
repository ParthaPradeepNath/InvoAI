import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, ReceiptText, DollarSign, Clock, TrendingUp } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatMoney, formatDate, invoiceStatusStyles } from "../../utils/helper";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(API_PATHS.invoices.all)
      .then((res) => {
        setInvoices(res.data.invoices || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalOutstanding = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.total, 0);
  const pendingCount = invoices.filter((i) => i.status === "PENDING").length;
  const recent = [...invoices].slice(0, 5);

  const stats = [
    {
      label: "Outstanding",
      value: formatMoney(totalOutstanding, user?.currency),
      icon: <DollarSign size={20} />,
      accent: "text-amber-600 bg-amber-50",
    },
    {
      label: "Paid",
      value: formatMoney(totalPaid, user?.currency),
      icon: <TrendingUp size={20} />,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: <Clock size={20} />,
      accent: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total invoices",
      value: invoices.length,
      icon: <ReceiptText size={20} />,
      accent: "text-primary bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500">Here&apos;s your invoicing overview.</p>
        </div>
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <PlusCircle size={18} /> New invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div
              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.accent}`}
            >
              {s.icon}
            </div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent invoices</h2>
          <Link to="/invoices" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
            Loading invoices...
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <ReceiptText size={40} className="mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No invoices yet</p>
            <p className="mb-5 text-sm text-gray-400">Create your first invoice to get started.</p>
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <PlusCircle size={18} /> Create invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
