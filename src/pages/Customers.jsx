import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CustomerFormModal from "../components/CustomerFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { User, Mail, Phone, Building2, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";

const Customers = () => {
  const { user } = useAuth();
  const canDelete = user?.role === "admin" || user?.role === "sales_manager";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await api.get("/customers", { params });
      setCustomers(res.data.customers);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddClick = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingCustomer) {
      await api.put(`/customers/${editingCustomer._id}`, formData);
    } else {
      await api.post("/customers", formData);
    }
    fetchCustomers();
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete customer");
      setDeleteTarget(null);
    }
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-fit"
        >
          + Add Customer
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, company..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No customers found.</div>
      ) : (
        <>
          {/* ── MOBILE CARDS (hidden on sm+) ── */}
          <div className="flex flex-col space-y-3 sm:hidden">
            {customers.map((customer) => (
              <div key={customer._id} className="bg-white rounded-lg shadow p-4">
                {/* Header: avatar + name + status */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {getInitials(customer.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{customer.name}</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
                        customer.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{customer.company || "—"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(customer)}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => setDeleteTarget(customer)}
                      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium ml-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP TABLE (hidden on mobile) ── */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
                      <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                      <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{customer.company || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleEditClick(customer)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(customer)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCustomer}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Customers;