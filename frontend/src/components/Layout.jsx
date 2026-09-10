import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ReceiptText, PlusCircle, UserCircle2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-[#fcfbfc]">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 md:flex">
          <div>
            <div className="mb-6 flex items-center gap-2 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <Logo size={18} />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">InvoAI</p>
                <p className="text-xs text-gray-400">Generator</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
              <NavLink to="/invoices" className={navLinkClass}>
                <ReceiptText size={18} /> Invoices
              </NavLink>
              <NavLink to="/invoices/new" className={navLinkClass}>
                <PlusCircle size={18} /> New Invoice
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                <UserCircle2 size={18} /> Profile
              </NavLink>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} /> Log out
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <Logo size={18} />
              </div>
              <p className="text-sm font-bold">InvoAI</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500" aria-label="Log out">
              <LogOut size={20} />
            </button>
          </header>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-gray-400">{user?.email}</p>
            </div>
            <nav className="ml-auto flex gap-1 md:hidden">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-lg p-2 ${isActive ? "text-primary" : "text-gray-400"}`
                }
              >
                <LayoutDashboard size={20} />
              </NavLink>
              <NavLink
                to="/invoices"
                className={({ isActive }) =>
                  `rounded-lg p-2 ${isActive ? "text-primary" : "text-gray-400"}`
                }
              >
                <ReceiptText size={20} />
              </NavLink>
              <NavLink
                to="/invoices/new"
                className={({ isActive }) =>
                  `rounded-lg p-2 ${isActive ? "text-primary" : "text-gray-400"}`
                }
              >
                <PlusCircle size={20} />
              </NavLink>
            </nav>
          </div>

          <div className="mt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
