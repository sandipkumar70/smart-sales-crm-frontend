import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-gray-700 text-2xl leading-none"
      >
        ☰
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;