"use client";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Flame, TrendingUp, Users, MapPin, Search, AlertTriangle } from "lucide-react";

/**
 * Drop this entire file into: app/page.tsx
 * Then run: npm install recharts lucide-react
 * Start dev server: npm run dev
 *
 * Notes:
 * - All data is mocked for now. Replace with your sheet/API later.
 * - Clean, NYT-ish layout with big type, spacing, and muted colors.
 */

// ---------------------- Mock Data ----------------------
const MOCK_ACTIVITY = [
  { date: "2025-10-13", events: 8 },
  { date: "2025-10-20", events: 11 },
  { date: "2025-10-27", events: 7 },
  { date: "2025-11-03", events: 15 },
  { date: "2025-11-10", events: 18 },
];

const MOCK_TOPICS = [
  { topic: "Immigration", mentions: 42 },
  { topic: "Abortion", mentions: 28 },
  { topic: "Education", mentions: 21 },
  { topic: "China", mentions: 19 },
  { topic: "LGBTQ+", mentions: 17 },
];

const MOCK_PEOPLE = [
  {
    id: "trump",
    name: "Donald Trump",
    role: "Politician",
    headshot: "https://placehold.co/96x96",
    recent: 9,
  },
  {
    id: "carlson",
    name: "Tucker Carlson",
    role: "Media figure",
    headshot: "https://placehold.co/96x96",
    recent: 6,
  },
  {
    id: "fuentes",
    name: "Nick Fuentes",
    role: "Activist",
    headshot: "https://placehold.co/96x96",
    recent: 5,
  },
  {
    id: "sweeney",
    name: "Sydney Sweeney",
    role: "Cultural figure",
    headshot: "https://placehold.co/96x96",
    recent: 3,
  },
];

// Democratic backsliding indicators with trends and incidents
const INDICATORS = [
  {
    key: "democratic_norms",
    category: "Democratic Norms",
    score: 72,
    trend: "up",
    incidents: 23,
  },
  {
    key: "press_freedom",
    category: "Press Freedom",
    score: 58,
    trend: "up",
    incidents: 18,
  },
  {
    key: "election_integrity",
    category: "Election Integrity",
    score: 81,
    trend: "up",
    incidents: 31,
  },
  {
    key: "minority_rights",
    category: "Minority Rights",
    score: 69,
    trend: "up",
    incidents: 27,
  },
  {
    key: "rule_of_law",
    category: "Rule of Law",
    score: 64,
    trend: "stable",
    incidents: 19,
  },
];

function classNames(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

function Section({ title, kicker, children }: { title: string; kicker?: string; children: any }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {kicker && (
        <p className="uppercase tracking-widest text-xs text-neutral-500 mb-2">{kicker}</p>
      )}
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-6">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Nav({ current, onSet }: { current: string; onSet: (s: string) => void }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
    { key: "hot", label: "Hot / Trending", icon: <Flame className="h-4 w-4" /> },
    { key: "topics", label: "Topics" },
    { key: "trump", label: "Trump" },
    { key: "people", label: "People" },
    { key: "states", label: "By State" },
  ];
  return (
    <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-4 py-3">
        <div className="flex-1">
          <h1 className="font-semibold tracking-tight text-lg sm:text-xl">American Right Wing Tracker</h1>
          <p className="text-xs text-neutral-500">Visual timeline of ideas, people, elections, and culture on the US right.</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onSet(it.key)}
              className={classNames(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition",
                current === it.key
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
              )}
            >
              {it.icon}
              <span>{it.label}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              placeholder="Search people, topics, states"
              className="outline-none placeholder:text-neutral-400 w-40 md:w-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

function ActivityChart() {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm font-medium mb-2">Activity over time</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MOCK_ACTIVITY} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="events" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopicsBarChart() {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm font-medium mb-2">Topic frequency (last 30 days)</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_TOPICS} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="mentions" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FascismIndicator() {
  const compositeScore = useMemo(() => {
    const avg = INDICATORS.reduce((a, b) => a + b.score, 0) / INDICATORS.length;
    return Math.round(avg);
  }, []);

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-600 p-6 rounded">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-600 h-7 w-7" />
            Democratic Backsliding Indicators
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tracking threats to democratic institutions and norms
          </p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-red-600">{compositeScore}</div>
          <div className="text-xs text-gray-600 uppercase">Composite Score</div>
          <div className="text-xs text-red-600 flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> +12% from last month
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {INDICATORS.map((indicator) => (
          <div key={indicator.key} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-semibold text-gray-900">{indicator.category}</span>
                <span className="ml-3 text-xs text-gray-500">{indicator.incidents} incidents tracked</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-red-600">{indicator.score}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
            </div>
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={classNames(
                  "absolute h-full rounded-full transition-all",
                  indicator.score > 70
                    ? "bg-red-600"
                    : indicator.score > 50
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                )}
                style={{ width: `${indicator.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 italic">
        Note: Higher scores indicate greater threats to democratic institutions. 
        Methodology based on tracking statements, policies, and actions against established democratic norms.
      </p>
    </div>
  );
}

function PeopleStrip() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {MOCK_PEOPLE.map((p) => (
        <div key={p.id} className="rounded-2xl border p-4 hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            {/* Replace with real photos later */}
            <img src={p.headshot} alt={p.name} className="h-14 w-14 rounded-xl object-cover" />
            <div>
              <p className="font-medium leading-tight">{p.name}</p>
              <p className="text-xs text-neutral-500">{p.role}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-neutral-500">30‑day activity</p>
              <p className="text-lg font-semibold">{p.recent}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatesTeaser() {
  const states = [
    { state: "AZ", items: 6 },
    { state: "FL", items: 12 },
    { state: "OH", items: 8 },
    { state: "TX", items: 15 },
    { state: "WI", items: 5 },
  ];
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm font-medium mb-2 flex items-center gap-2"><MapPin className="h-4 w-4"/>By state (last 30 days)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {states.map((s) => (
          <div key={s.state} className="rounded-xl border px-3 py-2">
            <p className="text-sm font-medium">{s.state}</p>
            <p className="text-xs text-neutral-500">{s.items} items</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState("dashboard");

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Nav current={tab} onSet={setTab} />

      {tab === "dashboard" && (
        <>
          <Section kicker="Today" title="What’s happening on the American right">
            <div className="grid md:grid-cols-4 gap-4">
              <MiniStat label="New developments" value="18" sub="past 7 days" />
              <MiniStat label="People tracked" value="13" />
              <MiniStat label="Topics tracked" value="32" />
              <MiniStat label="States with activity" value="27" />
            </div>
          </Section>

          <Section title="Trends and velocity">
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3">
                <ActivityChart />
              </div>
              <div className="lg:col-span-2">
                <TopicsBarChart />
              </div>
            </div>
          </Section>

          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
            <FascismIndicator />
          </div>

          <Section title="Most active people">
            <PeopleStrip />
          </Section>

          <Section title="Geography">
            <StatesTeaser />
          </Section>
        </>
      )}

      {tab === "hot" && (
        <Section kicker="Now" title="Hot / Trending">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium mb-1">Project 2025 rhetoric spikes</p>
                <p className="text-sm text-neutral-600">Mentions up 37% week‑over‑week; concentrated among media figures and state AGs.</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium mb-1">State-level election bills surge</p>
                <p className="text-sm text-neutral-600">TX, AZ, and WI see coordinated pushes on election administration changes.</p>
              </div>
            </div>
            <div className="space-y-4">
              <TopicsBarChart />
            </div>
          </div>
        </Section>
      )}

      {tab === "topics" && (
        <Section kicker="Browse" title="All topics">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_TOPICS.map((t) => (
              <div key={t.topic} className="rounded-2xl border p-4 hover:shadow-sm transition">
                <p className="font-medium">{t.topic}</p>
                <p className="text-sm text-neutral-500">{t.mentions} mentions in last 30 days.</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === "trump" && (
        <Section kicker="Profile" title="Donald Trump">
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium mb-2">Trajectory</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_ACTIVITY}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="events" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium mb-2">Recent statements</p>
                <ul className="space-y-3 text-sm">
                  <li className="border-l-2 pl-3">Nov 9 – Rally remarks on immigration escalation in TX (link)</li>
                  <li className="border-l-2 pl-3">Nov 6 – Post on judiciary overreach; calls for reforms (link)</li>
                  <li className="border-l-2 pl-3">Nov 4 – Signals support for state-level election bills (link)</li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium">Key positions</p>
                <ul className="mt-2 text-sm list-disc ml-5 space-y-1">
                  <li>Hard-line immigration enforcement</li>
                  <li>Aggressive executive power expansion</li>
                  <li>Purges in federal bureaucracy</li>
                </ul>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium">Network</p>
                <p className="text-sm text-neutral-600">Visual map coming soon. Shows media allies, donors, key state actors.</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === "people" && (
        <Section kicker="Directory" title="People">
          <PeopleStrip />
        </Section>
      )}

      {tab === "states" && (
        <Section kicker="Geography" title="By State">
          <StatesTeaser />
          <p className="text-xs text-neutral-500 mt-3">Interactive US map coming soon (hover to see counts; click to filter timeline).</p>
        </Section>
      )}

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-xs text-neutral-500">
        <p>
          © {new Date().getFullYear()} American Right Wing Tracker · Sources linked in entries · Methodology
          draft. This is a prototype.
        </p>
      </footer>
    </main>
  );
}
