import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async () => {
    if (!email) return setMsg({ type: "error", text: "Email is required" });

    setLoading(true);
    setMsg(null);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg({ type: "success", text: res.data.message });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Icon */}
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Forgot Password?</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your registered email — we'll send you a reset link.
        </p>

        {msg && (
          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg mb-4 ${
            msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {msg.type === "success" && <CheckCircle size={16} />}
            {msg.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;