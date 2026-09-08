import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import ActivityFormModal from "../components/ActivityFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

const TYPE_ICONS = { call: "📞", email: "✉️", meeting: "🤝", note: "📝" };

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (type) params.type = type;
      const res = await api.get("/activities", { params });
      setActivities(res.data.activities);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleFormSubmit = async (formData) => {
    if (editingItem) await api.put(`/activities/${editingItem._id}`, formData);
    else await api.post("/activities", formData);
    fetchActivities();
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/activities/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchActivities();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Activities</h1>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-fit">
          + Add Activity
        </button>
      </div>

      <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="border border-gray-300 rounded px-3 py-2 text-sm mb-4">
        <option value="">All Types</option>
        {Object.keys(TYPE_ICONS).map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      {error && <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">No activities found.</div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a._id} className="bg-white rounded-lg shadow p-4 flex items-start gap-3">
              <span className="text-xl">{TYPE_ICONS[a.type]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800 capitalize">{a.type}{a.lead ? ` — ${a.lead.name}` : ""}</p>
                  <span className="text-xs text-gray-400">{new Date(a.activityDate).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                <p className="text-xs text-gray-400 mt-1">by {a.user?.name}</p>
              </div>
              <div className="space-x-2 text-sm">
                <button onClick={() => { setEditingItem(a); setModalOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteTarget(a)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50">Next</button>
        </div>
      )}

      <ActivityFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingItem} />
      <ConfirmDialog open={!!deleteTarget} title="Delete Activity" message="Are you sure you want to delete this activity?" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default Activities;