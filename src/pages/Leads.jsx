import { useState, useEffect, useCallback } from "react";
import { Building2, Star, IndianRupee, User, Bot, Pencil, Trash2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LeadFormModal from "../components/LeadFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import AIInsightsModal from "../components/AIInsightsModal";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  interested: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const Leads = () => {
  const { user } = useAuth();
  const canDelete = user?.role === "admin" || user?.role === "sales_manager";

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [aiLead, setAiLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const res = await api.get("/leads", { params });
      setLeads(res.data.leads);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleAddClick = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingLead) {
      await api.put(`/leads/${editingLead._id}`, formData);
    } else {
      await api.post("/leads", formData);
    }
    fetchLeads();
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/leads/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead");
      setDeleteTarget(null);
    }
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-fit"
        >
          + Add Lead
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, company..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Priorities</option>
          {Object.keys(PRIORITY_COLORS).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}

      <div className="sm:bg-white sm:rounded-lg sm:shadow sm:overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No leads found.</div>
        ) : (
          <>
            {/* Mobile: rich stacked cards (below sm breakpoint) */}
            <div className="sm:hidden space-y-3">
                {leads.map((lead) => (
                  <div key={lead._id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
                        {getInitials(lead.name)}
                      </div>
                      <p className="font-semibold text-gray-800">{lead.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Building2 size={18} className="text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Company</p>
                        <p className="text-sm text-gray-800">{lead.company || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3">
                      <Star size={18} className="text-yellow-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Priority</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[lead.priority]}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3">
                      <IndianRupee size={18} className="text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Value</p>
                        <p className="text-sm text-gray-800">₹{lead.expectedValue?.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3">
                      <User size={18} className="text-indigo-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Assigned To</p>
                        <p className="text-sm text-gray-800">{lead.assignedTo?.name || "Unassigned"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => setAiLead(lead)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-purple-600 font-medium text-sm"
                    >
                      <Bot size={16} /> AI
                    </button>
                    <div className="w-px bg-gray-100" />
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 font-medium text-sm"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    {canDelete && (
                      <>
                        <div className="w-px bg-gray-100" />
                        <button
                          onClick={() => setDeleteTarget(lead)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 font-medium text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: normal table (sm and above) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.company || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[lead.priority]}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">₹{lead.expectedValue?.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.assignedTo?.name || "Unassigned"}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => setAiLead(lead)} className="text-purple-600 hover:underline">
                          AI
                        </button>
                        <button onClick={() => handleEditClick(lead)} className="text-blue-600 hover:underline">
                          Edit
                        </button>
                        {canDelete && (
                          <button onClick={() => setDeleteTarget(lead)} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <LeadFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingLead}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <AIInsightsModal open={!!aiLead} onClose={() => setAiLead(null)} lead={aiLead} />
    </div>
  );
};

export default Leads;