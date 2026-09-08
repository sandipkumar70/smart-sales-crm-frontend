import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const COLUMNS = [
  { key: "new", label: "New", color: "border-blue-400" },
  { key: "contacted", label: "Contacted", color: "border-yellow-400" },
  { key: "interested", label: "Interested", color: "border-purple-400" },
  { key: "negotiation", label: "Negotiation", color: "border-orange-400" },
  { key: "won", label: "Won", color: "border-green-400" },
  { key: "lost", label: "Lost", color: "border-red-400" },
];

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const Pipeline = () => {
  const [pipeline, setPipeline] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movingId, setMovingId] = useState(null);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/leads/pipeline");
      setPipeline(res.data.pipeline);
      setCounts(res.data.counts);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleStatusChange = async (leadId, newStatus) => {
    setMovingId(leadId);
    setError("");
    try {
      await api.put(`/leads/${leadId}`, { status: newStatus });
      fetchPipeline();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading pipeline...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Sales Pipeline</h1>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="flex-shrink-0 w-full md:w-72">
            <div className={`bg-white rounded-t-lg border-t-4 ${col.color} shadow p-3 flex justify-between items-center`}>
              <h2 className="font-semibold text-gray-800">{col.label}</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {counts?.[col.key] ?? 0}
              </span>
            </div>

            <div className="bg-gray-50 rounded-b-lg shadow p-2 space-y-2 min-h-[200px]">
              {pipeline?.[col.key]?.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No leads</p>
              )}

              {pipeline?.[col.key]?.map((lead) => (
                <div key={lead._id} className="bg-white rounded shadow-sm p-3 border border-gray-100">
                  <p className="font-medium text-gray-800 text-sm">{lead.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{lead.company || "—"}</p>

                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[lead.priority]}`}>
                      {lead.priority}
                    </span>
                    <span className="text-xs text-gray-600">
                      ₹{lead.expectedValue?.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {lead.assignedTo?.name || "Unassigned"}
                  </p>

                  <select
                    value={lead.status}
                    disabled={movingId === lead._id}
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;