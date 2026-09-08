import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import DealFormModal from "../components/DealFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Handshake, User, IndianRupee, Tag, Pencil, Trash2 } from "lucide-react";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      const res = await api.get("/deals", { params });
      setDeals(res.data.deals);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleFormSubmit = async (formData) => {
    if (editingItem) await api.put(`/deals/${editingItem._id}`, formData);
    else await api.post("/deals", formData);
    fetchDeals();
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/deals/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchDeals();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
      setDeleteTarget(null);
    }
  };

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
        <button
          onClick={() => { setEditingItem(null); setModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-fit"
        >
          + Add Deal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-sm text-gray-600">
          Total on this page: <span className="font-semibold">₹{totalValue.toLocaleString("en-IN")}</span>
        </p>
      </div>

      {error && <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : deals.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No deals found.</div>
      ) : (
        <>
          {/* ── MOBILE CARDS ── */}
          <div className="flex flex-col space-y-3 sm:hidden">
            {deals.map((d) => (
              <div key={d._id} className="bg-white rounded-lg shadow p-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Handshake size={20} className="text-purple-500" />
                    </div>
                    <span className="font-semibold text-gray-800">{d.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[d.status]}`}>
                    {d.status}
                  </span>
                </div>

                {/* Details */}
                <div className="py-3 space-y-3 border-b border-gray-100">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Lead</p>
                      <p className="text-sm font-semibold text-gray-800">{d.lead?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IndianRupee size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Value</p>
                      <p className="text-sm font-semibold text-gray-800">₹{d.value?.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Assigned To</p>
                      <p className="text-sm font-semibold text-gray-800">{d.assignedTo?.name || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-center divide-x divide-gray-200">
                  <button
                    onClick={() => { setEditingItem(d); setModalOpen(true); }}
                    className="flex items-center gap-1.5 text-sm text-blue-600 font-medium px-3"
                  >
                    <Pencil size={15} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(d)}
                    className="flex items-center gap-1.5 text-sm text-red-600 font-medium px-3"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3">Deal Name</th>
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deals.map((d) => (
                    <tr key={d._id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                      <td className="px-4 py-3 text-gray-600">{d.lead?.name}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">₹{d.value?.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-600">{d.assignedTo?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[d.status]}`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => { setEditingItem(d); setModalOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => setDeleteTarget(d)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50">Next</button>
        </div>
      )}

      <DealFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingItem} />
      <ConfirmDialog open={!!deleteTarget} title="Delete Deal" message="Are you sure you want to delete this deal?" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default Deals;