import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { KeyRound, CheckCircle, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.newPassword || !form.confirmPassword) {
      return setMsg({ type: "error", text: "All fields are required" });
    }
    if (form.newPassword.length < 6) {
      return setMsg({ type: "error", text: "Password must be at least 6 characters" });
    }
    if (form.newPassword !== form.confirmPassword) {
      return setMsg({ type: "error", text: "Passwords do not match" });
    }

    setLoading(true);
    setMsg(null);
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Reset failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Icon */}
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound size={28} className="text-orange-500" />
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset!</h2>
            <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Set New Password</h1>
            <p className="text-sm text-gray-500 text-center mb-6">Enter your new password below.</p>

            {msg && (
              <div className={`text-sm p-3 rounded-lg mb-4 ${
                msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {msg.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">New Password</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;