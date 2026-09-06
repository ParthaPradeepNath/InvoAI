import { Link } from "react-router-dom";
import { FileText, Sparkles, Download, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const features = [
  {
    icon: <Sparkles size={22} />,
    title: "AI-powered",
    description:
      "Generate professional item descriptions and draft complete invoices from natural language with Gemini.",
  },
  {
    icon: <Download size={22} />,
    title: "PDF export",
    description: "Download clean, branded PDF invoices for any client in one click.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Secure & private",
    description:
      "Your data is protected with JWT authentication and stored safely in a managed database.",
  },
];

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="bg-[#fcfbfc]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <FileText size={20} />
          </div>
          <span className="text-lg font-bold">InvoAI</span>
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles size={14} /> AI-powered invoice generator
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Create beautiful invoices <span className="text-primary">in seconds</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-500">
            InvoAI helps freelancers and small businesses generate professional invoices, powered by
            AI. Describe what you did — we&apos;ll craft the details, you get paid faster.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Start creating free <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Live demo
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-gray-400 md:flex-row">
          <span>© {new Date().getFullYear()} InvoAI. All rights reserved.</span>
          <span>Built with React, Express & Gemini</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
