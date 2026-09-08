import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", lead: "", value: 0, expectedClosingDate: "", status: "open", notes: "", assignedTo: "" };
const STATUSES = ["open", "won", "lost"];

const DealFormModal = ({ open, onClose, onSubmit, initialData }) => {
  const { user } = useAuth();
  const canAssign = user?.role === "admin" || user?.role === "sales_manager";

  const [form, setForm] = useState(emptyForm);
  const [leads, setLeads] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        lead: initialData.lead?._id || "",
        assignedTo: initialData.assignedTo?._id || "",
        expectedClosingDate: initialData.expectedClosingDate ? initialData.expectedClosingDate.slice(0, 10) : "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [initialData, open]);

  useEffect(() => {
    if (open) {
      api.get("/leads", { params: { limit: 100 } }).then((res) => setLeads(res.data.leads)).catch(() => {});
      if (canAssign) {
        api.get("/users").then((res) => setSalesUsers(res.data.users)).catch(() => {});
      }
    }
  }, [open, canAssign]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "value" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.lead || form.value === undefined) {
      setError("Name, lead and value are required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {initialData ? "Edit Deal" : "Add Deal"}
        </h3>
        {error && <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead *</label>
            <select name="lead" value={form.lead} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Select a lead</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>{l.name} {l.company ? `(${l.company})` : ""}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value (₹) *</label>
              <input type="number" min="0" name="value" value={form.value} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
              <input type="date" name="expectedClosingDate" value={form.expectedClosingDate} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {canAssign && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">Myself</option>
                {salesUsers.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealFormModal;