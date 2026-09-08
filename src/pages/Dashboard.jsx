// import { useState, useEffect } from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
// import api from "../services/api";
// import { useAuth } from "../context/AuthContext";

// const DEAL_COLORS = { open: "#3b82f6", won: "#22c55e", lost: "#ef4444" };

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [pipelineChartData, setPipelineChartData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const [statsRes, pipelineRes] = await Promise.all([
//           api.get("/dashboard/stats"),
//           api.get("/leads/pipeline"),
//         ]);

//         setStats(statsRes.data.stats);

//         const counts = pipelineRes.data.counts;
//         setPipelineChartData([
//           { stage: "New", count: counts.new },
//           { stage: "Contacted", count: counts.contacted },
//           { stage: "Interested", count: counts.interested },
//           { stage: "Negotiation", count: counts.negotiation },
//           { stage: "Won", count: counts.won },
//           { stage: "Lost", count: counts.lost },
//         ]);
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading dashboard...</div>;
//   }

//   if (error) {
//     return <div className="bg-red-100 text-red-700 text-sm p-3 rounded">{error}</div>;
//   }

//   const cards = [
//     { label: "Total Customers", value: stats.totalCustomers, color: "bg-blue-50 text-blue-700" },
//     { label: "Total Leads", value: stats.totalLeads, color: "bg-purple-50 text-purple-700" },
//     { label: "Total Deals", value: stats.totalDeals, color: "bg-indigo-50 text-indigo-700" },
//     { label: "Open Deals", value: stats.openDeals, color: "bg-yellow-50 text-yellow-700" },
//     { label: "Won Deals", value: stats.wonDeals, color: "bg-green-50 text-green-700" },
//     { label: "Lost Deals", value: stats.lostDeals, color: "bg-red-50 text-red-700" },
//     { label: "Revenue (Won)", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, color: "bg-emerald-50 text-emerald-700" },
//     { label: "Conversion Rate", value: `${stats.conversionRate}%`, color: "bg-teal-50 text-teal-700" },
//   ];

//   const dealStatusData = [
//     { name: "Open", value: stats.openDeals },
//     { name: "Won", value: stats.wonDeals },
//     { name: "Lost", value: stats.lostDeals },
//   ].filter((d) => d.value > 0);

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome, {user?.name}</h1>
//       <p className="text-gray-500 mb-6 capitalize">{user?.role?.replace("_", " ")}</p>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         {cards.map((card) => (
//           <div key={card.label} className={`rounded-lg shadow p-4 ${card.color}`}>
//             <p className="text-xs font-medium opacity-80">{card.label}</p>
//             <p className="text-2xl font-bold mt-1">{card.value}</p>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow p-4">
//           <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads by Pipeline Stage</h2>
//           <ResponsiveContainer width="100%" height={260}>
//             <BarChart data={pipelineChartData}>
//               <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
//               <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
//               <Tooltip />
//               <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white rounded-lg shadow p-4">
//           <h2 className="text-sm font-semibold text-gray-700 mb-4">Deal Status Distribution</h2>
//           {dealStatusData.length === 0 ? (
//             <p className="text-sm text-gray-400 text-center py-16">No deals yet</p>
//           ) : (
//             <ResponsiveContainer width="100%" height={260}>
//               <PieChart>
//                 <Pie data={dealStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
//                   {dealStatusData.map((entry) => (
//                     <Cell key={entry.name} fill={DEAL_COLORS[entry.name.toLowerCase()]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>

//       {/* Agent performance table — only present in the API response for admin/sales_manager */}
//       {stats.agentPerformance && (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <h2 className="text-sm font-semibold text-gray-700 p-4 pb-0">Agent Performance</h2>
//           <div className="overflow-x-auto mt-2">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 text-gray-600 text-left">
//                 <tr>
//                   <th className="px-4 py-3">Agent</th>
//                   <th className="px-4 py-3">Leads Assigned</th>
//                   <th className="px-4 py-3">Won Deals</th>
//                   <th className="px-4 py-3">Revenue</th>
//                   <th className="px-4 py-3">Conversion Rate</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {stats.agentPerformance.map((agent) => (
//                   <tr key={agent.agentId}>
//                     <td className="px-4 py-3 font-medium text-gray-800">{agent.name}</td>
//                     <td className="px-4 py-3 text-gray-600">{agent.leadsAssigned}</td>
//                     <td className="px-4 py-3 text-gray-600">{agent.wonDeals}</td>
//                     <td className="px-4 py-3 text-gray-600">₹{agent.revenue.toLocaleString("en-IN")}</td>
//                     <td className="px-4 py-3 text-gray-600">{agent.conversionRate}%</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;



import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Users, TrendingUp, Briefcase, FolderOpen,
  Trophy, XCircle, IndianRupee, Percent,
  Calendar, UserPlus,
} from "lucide-react";

const DEAL_COLORS = { open: "#3b82f6", won: "#22c55e", lost: "#ef4444" };

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  interested: "bg-yellow-100 text-yellow-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const KPI_CONFIG = [
  { key: "totalCustomers",  label: "Total Customers", icon: Users,        bg: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700" },
  { key: "totalLeads",      label: "Total Leads",     icon: UserPlus,     bg: "bg-purple-500",  light: "bg-purple-50",  text: "text-purple-700" },
  { key: "totalDeals",      label: "Total Deals",     icon: Briefcase,    bg: "bg-indigo-500",  light: "bg-indigo-50",  text: "text-indigo-700" },
  { key: "openDeals",       label: "Open Deals",      icon: FolderOpen,   bg: "bg-yellow-500",  light: "bg-yellow-50",  text: "text-yellow-700" },
  { key: "wonDeals",        label: "Won Deals",       icon: Trophy,       bg: "bg-green-500",   light: "bg-green-50",   text: "text-green-700" },
  { key: "lostDeals",       label: "Lost Deals",      icon: XCircle,      bg: "bg-red-500",     light: "bg-red-50",     text: "text-red-700" },
  { key: "totalRevenue",    label: "Revenue (Won)",   icon: IndianRupee,  bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", prefix: "₹", format: true },
  { key: "conversionRate",  label: "Conversion Rate", icon: Percent,      bg: "bg-teal-500",    light: "bg-teal-50",    text: "text-teal-700",   suffix: "%" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pipelineChartData, setPipelineChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsRes, pipelineRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/leads/pipeline"),
        ]);

        setStats(statsRes.data.stats);

        const counts = pipelineRes.data.counts;
        setPipelineChartData([
          { stage: "New",         count: counts.new },
          { stage: "Contacted",   count: counts.contacted },
          { stage: "Interested",  count: counts.interested },
          { stage: "Negotiation", count: counts.negotiation },
          { stage: "Won",         count: counts.won },
          { stage: "Lost",        count: counts.lost },
        ]);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading dashboard...</div>
  );

  if (error) return (
    <div className="bg-red-100 text-red-700 text-sm p-3 rounded">{error}</div>
  );

  const dealStatusData = [
    { name: "Open", value: stats.openDeals },
    { name: "Won",  value: stats.wonDeals },
    { name: "Lost", value: stats.lostDeals },
  ].filter((d) => d.value > 0);

  const formatKpiValue = (cfg) => {
    const raw = stats[cfg.key];
    if (cfg.format) return `₹${Number(raw).toLocaleString("en-IN")}`;
    if (cfg.suffix) return `${raw}${cfg.suffix}`;
    return raw;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
        <p className="text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_CONFIG.map((cfg) => {
          const Icon = cfg.icon;
          return (
            <div key={cfg.key} className={`rounded-xl shadow p-4 ${cfg.light} flex items-center gap-3`}>
              <div className={`${cfg.bg} rounded-xl p-2.5 flex-shrink-0`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{cfg.label}</p>
                <p className={`text-xl font-bold ${cfg.text}`}>{formatKpiValue(cfg)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row 1: Pipeline + Deal Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads by Pipeline Stage</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineChartData}>
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Deal Status Distribution</h2>
          {dealStatusData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">No deals yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={dealStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  {dealStatusData.map((entry) => (
                    <Cell key={entry.name} fill={DEAL_COLORS[entry.name.toLowerCase()]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Revenue Trend ── */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend (Last 6 Months)</h2>
        {stats.revenueTrend?.every((d) => d.revenue === 0) ? (
          <p className="text-sm text-gray-400 text-center py-10">No revenue data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Upcoming Follow-ups + Recent Leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-700">Upcoming Follow-ups (Next 7 Days)</h2>
          </div>
          {stats.upcomingFollowUps?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No upcoming follow-ups</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingFollowUps.map((f) => (
                <div key={f._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.lead?.name || "—"}</p>
                    <p className="text-xs text-gray-500 capitalize">{f.type} · {f.assignedTo?.name || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue-600">
                      {new Date(f.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">pending</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={16} className="text-purple-500" />
            <h2 className="text-sm font-semibold text-gray-700">Recent Leads</h2>
          </div>
          {stats.recentLeads?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.company || "—"} · {lead.assignedTo?.name || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[lead.priority]}`}>
                      {lead.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* ── Agent Performance ── */}
      {stats.agentPerformance && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 pb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-700">Agent Performance</h2>
          </div>

          {stats.agentPerformance.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No sales performance data available.</p>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="sm:hidden p-4 pt-2 space-y-3">
                {stats.agentPerformance.map((agent) => (
                  <div key={agent.agentId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">{agent.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{agent.role.replace("_", " ")}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.conversionRate >= 50 ? "bg-green-100 text-green-700" :
                        agent.conversionRate >= 25 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {agent.conversionRate}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Leads</p>
                        <p className="font-semibold text-gray-800">{agent.leadsAssigned}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Won Deals</p>
                        <p className="font-semibold text-gray-800">{agent.wonDeals}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Revenue</p>
                        <p className="font-semibold text-gray-800">₹{agent.revenue.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Conversion</p>
                        <p className="font-semibold text-gray-800">{agent.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto mt-1">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="px-4 py-3">Agent</th>
                      <th className="px-4 py-3">Leads</th>
                      <th className="px-4 py-3">Won Deals</th>
                      <th className="px-4 py-3">Revenue</th>
                      <th className="px-4 py-3">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.agentPerformance.map((agent) => (
                      <tr key={agent.agentId}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{agent.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{agent.role.replace("_", " ")}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{agent.leadsAssigned}</td>
                        <td className="px-4 py-3 text-gray-600">{agent.wonDeals}</td>
                        <td className="px-4 py-3 text-gray-600">₹{agent.revenue.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.conversionRate >= 50 ? "bg-green-100 text-green-700" :
                            agent.conversionRate >= 25 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {agent.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

