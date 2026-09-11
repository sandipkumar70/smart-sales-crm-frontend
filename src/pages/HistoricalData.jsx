import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  TrendingUp, Users, Trophy, XCircle, Briefcase, IndianRupee, Percent, Calendar,
} from "lucide-react";

const KPI_CONFIG = [
  { key: "totalLeads",     label: "Total Leads",      icon: Users,       bg: "bg-purple-500",  light: "bg-purple-50",  text: "text-purple-700" },
  { key: "wonLeads",       label: "Won Leads",        icon: Trophy,      bg: "bg-green-500",   light: "bg-green-50",   text: "text-green-700" },
  { key: "lostLeads",      label: "Lost Leads",       icon: XCircle,     bg: "bg-red-500",     light: "bg-red-50",     text: "text-red-700" },
  { key: "totalDeals",     label: "Total Deals",      icon: Briefcase,   bg: "bg-indigo-500",  light: "bg-indigo-50",  text: "text-indigo-700" },
  { key: "wonDeals",       label: "Won Deals",        icon: Trophy,      bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700" },
  { key: "totalRevenue",   label: "Total Revenue",    icon: IndianRupee, bg: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700",  format: true },
  { key: "conversionRate", label: "Conversion Rate",  icon: Percent,     bg: "bg-teal-500",    light: "bg-teal-50",    text: "text-teal-700",  suffix: "%" },
];

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const HistoricalData = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("6months");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reports/historical", { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load historical data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ range: "6months" });
  }, []);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    if (newRange !== "custom") {
      fetchData({ range: newRange });
    }
  };

  const handleCustomApply = () => {
    if (!startDate || !endDate) return;
    fetchData({ startDate, endDate });
  };

  const formatKpi = (cfg) => {
    const val = data?.kpi?.[cfg.key] ?? 0;
    if (cfg.format) return `₹${Number(val).toLocaleString("en-IN")}`;
    if (cfg.suffix) return `${val}${cfg.suffix}`;
    return val;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Historical Data</h1>
        <p className="text-gray-500 text-sm mt-1">Analyze past sales performance</p>
      </div>

      {/* ── Date Range Filter ── */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {["6months", "1year", "custom"].map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                range === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "6months" ? "Last 6 Months" : r === "1year" ? "Last 1 Year" : "Custom Range"}
            </button>
          ))}
        </div>

        {range === "custom" && (
          <div className="flex flex-wrap gap-3 items-end mt-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">{error}</div>}

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow">Loading historical data...</div>
      ) : (
        <>
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
                    <p className={`text-xl font-bold ${cfg.text}`}>{formatKpi(cfg)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Revenue History ── */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue History</h2>
            {data?.revenueHistory?.every((d) => d.revenue === 0) ? (
              <p className="text-sm text-gray-400 text-center py-10">No revenue data for selected period</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Lead History ── */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Lead History</h2>
            {data?.leadHistory?.every((d) => d.new === 0 && d.won === 0 && d.lost === 0) ? (
              <p className="text-sm text-gray-400 text-center py-10">No lead data for selected period</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.leadHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" name="New" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="won" name="Won" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lost" name="Lost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Conversion Rate History ── */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Conversion Rate History</h2>
            {data?.conversionHistory?.every((d) => d.rate === 0) ? (
              <p className="text-sm text-gray-400 text-center py-10">No conversion data for selected period</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.conversionHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => [`${v}%`, "Conversion Rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Deal History Table ── */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 pb-2">
              <h2 className="text-sm font-semibold text-gray-700">Deal History</h2>
            </div>

            {!data?.dealHistory?.length ? (
              <p className="text-sm text-gray-400 text-center py-8">No deals for selected period</p>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="sm:hidden p-4 pt-2 space-y-3">
                  {data.dealHistory.map((deal) => (
                    <div key={deal._id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800 text-sm">{deal.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[deal.status]}`}>
                          {deal.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                        <div><span className="text-gray-400">Lead: </span>{deal.lead?.name || "—"}</div>
                        <div><span className="text-gray-400">Value: </span>₹{deal.value?.toLocaleString("en-IN")}</div>
                        <div><span className="text-gray-400">Agent: </span>{deal.assignedTo?.name || "—"}</div>
                        <div><span className="text-gray-400">Date: </span>{new Date(deal.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-left">
                      <tr>
                        <th className="px-4 py-3">Deal</th>
                        <th className="px-4 py-3">Lead</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.dealHistory.map((deal) => (
                        <tr key={deal._id}>
                          <td className="px-4 py-3 font-medium text-gray-800">{deal.name}</td>
                          <td className="px-4 py-3 text-gray-600">{deal.lead?.name || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">₹{deal.value?.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[deal.status]}`}>
                              {deal.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{deal.assignedTo?.name || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(deal.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* ── Agent Performance (admin/manager only) ── */}
          {data?.agentPerformance && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 pb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                <h2 className="text-sm font-semibold text-gray-700">Agent Historical Performance</h2>
              </div>

              {data.agentPerformance.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No agent data available</p>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="sm:hidden p-4 pt-2 space-y-3">
                    {data.agentPerformance.map((agent, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4">
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
                          <div><p className="text-xs text-gray-400">Leads</p><p className="font-semibold text-gray-800">{agent.leads}</p></div>
                          <div><p className="text-xs text-gray-400">Won Deals</p><p className="font-semibold text-gray-800">{agent.wonDeals}</p></div>
                          <div><p className="text-xs text-gray-400">Lost Deals</p><p className="font-semibold text-gray-800">{agent.lostDeals}</p></div>
                          <div><p className="text-xs text-gray-400">Revenue</p><p className="font-semibold text-gray-800">₹{agent.revenue.toLocaleString("en-IN")}</p></div>
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
                          <th className="px-4 py-3">Lost Deals</th>
                          <th className="px-4 py-3">Revenue</th>
                          <th className="px-4 py-3">Conversion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.agentPerformance.map((agent, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{agent.name}</p>
                              <p className="text-xs text-gray-400 capitalize">{agent.role.replace("_", " ")}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{agent.leads}</td>
                            <td className="px-4 py-3 text-gray-600">{agent.wonDeals}</td>
                            <td className="px-4 py-3 text-gray-600">{agent.lostDeals}</td>
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
        </>
      )}
    </div>
  );
};

export default HistoricalData;