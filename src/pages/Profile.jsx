import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Pencil, KeyRound, CheckCircle, XCircle } from "lucide-react";

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700",
  sales_manager: "bg-blue-100 text-blue-700",
  sales_agent: "bg-green-100 text-green-700",
};

const Profile = () => {
  const { user: authUser, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState(null); // { type: "success"|"error", text }

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setProfile(res.data.user);
        setNameInput(res.data.user.name);
      } catch {
        // silently fail — authUser fallback
        setProfile(authUser);
        setNameInput(authUser?.name || "");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleNameSave = async () => {
    setNameLoading(true);
    setNameMsg(null);
    try {
      const res = await api.put("/users/profile", { name: nameInput });
      setProfile(res.data.user);
      setEditingName(false);
      setNameMsg({ type: "success", text: "Name updated successfully!" });
    } catch (err) {
      setNameMsg({ type: "error", text: err.response?.data?.message || "Failed to update name" });
    } finally {
      setNameLoading(false);
      setTimeout(() => setNameMsg(null), 3000);
    }
  };

  const handlePasswordChange = async () => {
    setPwMsg(null);
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      return setPwMsg({ type: "error", text: "All fields are required" });
    }
    if (pwForm.newPassword.length < 6) {
      return setPwMsg({ type: "error", text: "New password must be at least 6 characters" });
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwMsg({ type: "error", text: "New passwords do not match" });
    }

    setPwLoading(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(null), 4000);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-500">Loading profile...</div>
  );

  const initials = profile?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const roleLabel = profile?.role?.replace("_", " ") || "";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-xl shadow p-6">
        {/* Avatar + basic info */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile?.name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[profile?.role] || "bg-gray-100 text-gray-600"}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-4">
          {/* Name row */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Full Name</p>
              {editingName ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autoFocus
                  />
                  <button
                    onClick={handleNameSave}
                    disabled={nameLoading}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {nameLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameInput(profile?.name); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{profile?.name}</p>
                  <button
                    onClick={() => setEditingName(true)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email row */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Email Address</p>
              <p className="text-sm font-medium text-gray-800">{profile?.email}</p>
            </div>
          </div>

          {/* Role row */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Role</p>
              <p className="text-sm font-medium text-gray-800 capitalize">{roleLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5">Role cannot be changed by the user</p>
            </div>
          </div>
        </div>

        {/* Name update message */}
        {nameMsg && (
          <div className={`mt-4 flex items-center gap-2 text-sm p-3 rounded-lg ${
            nameMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {nameMsg.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {nameMsg.text}
          </div>
        )}
      </div>

      {/* ── Change Password Card ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <KeyRound size={16} className="text-orange-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Current Password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">New Password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Re-enter new password"
            />
          </div>

          {pwMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
              pwMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {pwMsg.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {pwMsg.text}
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={pwLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;