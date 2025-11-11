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
import { useStats } from "@/src/hooks/useStats";
import { usePeople } from "@/src/hooks/usePeople";
import { useTopics } from "@/src/hooks/useTopics";
import { useStatements } from "@/src/hooks/useStatements";

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

// Mock activity data (to be replaced with real data from statements)
const MOCK_ACTIVITY = [
  { date: "2025-10-13", events: 8 },
  { date: "2025-10-20", events: 11 },
  { date: "2025-10-27", events: 7 },
  { date: "2025-11-03", events: 15 },
  { date: "2025-11-10", events: 18 },
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

function MiniStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

function DashboardStats() {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border p-4 animate-pulse">
            <div className="h-16 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <MiniStat label="New developments" value={stats?.recentStatements || 0} sub="past 30 days" />
      <MiniStat label="People tracked" value={stats?.people || 0} />
      <MiniStat label="Topics tracked" value={stats?.topics || 0} />
      <MiniStat label="Statements" value={stats?.statements || 0} />
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
  const { stats, loading } = useStats();
  
  const chartData = useMemo(() => {
    if (!stats?.topTopics || stats.topTopics.length === 0) {
      return [];
    }
    return stats.topTopics.slice(0, 5).map((t) => ({
      topic: t.topic,
      mentions: t.count,
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="rounded-2xl border p-4">
        <p className="text-sm font-medium mb-2">Topic frequency (last 30 days)</p>
        <div className="h-56 flex items-center justify-center">
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border p-4">
        <p className="text-sm font-medium mb-2">Topic frequency (last 30 days)</p>
        <div className="h-56 flex items-center justify-center">
          <p className="text-sm text-neutral-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm font-medium mb-2">Topic frequency (last 30 days)</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
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
  const { people, loading } = usePeople();
  const { statements } = useStatements({ limit: 1000 });

  // Count statements per person in last 30 days
  const peopleWithCounts = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const statementCounts: Record<string, number> = {};
    statements?.forEach((stmt) => {
      if (stmt.date >= dateStr && stmt.actor_id) {
        statementCounts[stmt.actor_id] = (statementCounts[stmt.actor_id] || 0) + 1;
      }
    });

    return people
      .map((p) => ({
        ...p,
        recent: statementCounts[p.id] || 0,
      }))
      .sort((a, b) => b.recent - a.recent)
      .slice(0, 8);
  }, [people, statements]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border p-4 animate-pulse">
            <div className="h-20 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {peopleWithCounts.map((p) => (
        <div key={p.id} className="rounded-2xl border p-4 hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-neutral-200 flex items-center justify-center">
              <span className="text-xl font-semibold text-neutral-400">
                {p.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-tight truncate">{p.name}</p>
              <p className="text-xs text-neutral-500 truncate">{p.role || 'Unknown'}</p>
            </div>
            <div className="text-right flex-shrink-0">
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

function TopicsList() {
  const { topics, loading } = useTopics();
  const { stats } = useStats();

  const topicsWithCounts = useMemo(() => {
    const topicCountMap = new Map(stats?.topTopics?.map((t) => [t.topic, t.count]) || []);
    return topics.map((topic) => ({
      ...topic,
      count: topicCountMap.get(topic.id) || 0,
    })).sort((a, b) => b.count - a.count);
  }, [topics, stats]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border p-4 animate-pulse">
            <div className="h-16 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topicsWithCounts.map((t) => (
        <div key={t.id} className="rounded-2xl border p-4 hover:shadow-sm transition">
          <p className="font-medium">{t.label}</p>
          <p className="text-sm text-neutral-500 mt-1">{t.count} mentions in last 30 days</p>
          {t.definition && (
            <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{t.definition}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function TrumpProfile() {
  const { statements, loading } = useStatements({ actorId: 'person:trump-donald', limit: 10 });
  const { people } = usePeople();
  const trump = people.find((p) => p.id === 'person:trump-donald');

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-2xl border p-4">
          <p className="text-sm font-medium mb-2">Recent statements</p>
          <ul className="space-y-3 text-sm">
            {statements.length === 0 ? (
              <li className="text-neutral-500">No statements found</li>
            ) : (
              statements.map((stmt) => (
                <li key={stmt.id} className="border-l-2 pl-3">
                  <span className="font-medium">{new Date(stmt.date).toLocaleDateString()}</span> – {stmt.short_quote || stmt.notes}
                  {stmt.sources?.url && (
                    <a
                      href={stmt.sources.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      (source)
                    </a>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        {trump && (
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-medium mb-2">Profile</p>
            <p className="text-sm text-neutral-600">{trump.role || 'Politician'}</p>
            {trump.jurisdiction && (
              <p className="text-sm text-neutral-600 mt-1">Jurisdiction: {trump.jurisdiction}</p>
            )}
            {trump.notes && (
              <p className="text-sm text-neutral-500 mt-2">{trump.notes}</p>
            )}
          </div>
        )}
        <div className="rounded-2xl border p-4">
          <p className="text-sm font-medium">Network</p>
          <p className="text-sm text-neutral-600">Visual map coming soon. Shows media allies, donors, key state actors.</p>
        </div>
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
          <Section kicker="Today" title="What's happening on the American right">
            <DashboardStats />
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
          <TopicsList />
        </Section>
      )}

      {tab === "trump" && (
        <Section kicker="Profile" title="Donald Trump">
          <TrumpProfile />
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
