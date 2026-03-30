import { ArrowRight, CheckCircle2, FolderKanban, LayoutDashboard, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

const features = [
  {
    icon: <LayoutDashboard className="h-5 w-5 text-teal-700" />,
    title: "See the full picture",
    description: "Track progress, overdue work, and daily priorities from one calm dashboard."
  },
  {
    icon: <FolderKanban className="h-5 w-5 text-amber-600" />,
    title: "Move work fast",
    description: "Organize tasks across custom workflow stages with a visual kanban flow."
  },
  {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    title: "Stay aligned",
    description: "Use analytics, deadlines, and shared project structure to keep momentum."
  }
]

export default function Welcome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5efe4] text-slate-900 [font-family:Space_Grotesk,Manrope,ui-sans-serif,system-ui,sans-serif]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_26%),linear-gradient(135deg,_#f5efe4_0%,_#fffaf1_48%,_#edf6f2_100%)]" />
      <div className="absolute left-[-6rem] top-12 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="absolute right-[-4rem] bottom-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Taskflow</p>
              <p className="text-sm font-semibold text-slate-900">Project workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign up
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Welcome to Taskflow
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[0.95] text-slate-950 sm:text-6xl">
              Work feels lighter
              <span className="block text-teal-700">when everything has a place.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Taskflow helps teams organize projects, focus on what matters today, and keep progress moving without the clutter.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
              >
                Log in
              </Link>
            </div>
          </section>

          <section className="grid gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.75rem] border border-white/75 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/5">
                  {feature.icon}
                </div>
                <h2 className="text-lg font-semibold text-slate-950">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}
