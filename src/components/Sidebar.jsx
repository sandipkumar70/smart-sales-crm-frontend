import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Customers", path: "/customers" },
  { name: "Leads", path: "/leads" },
  { name: "Pipeline", path: "/pipeline" },
  { name: "Follow-ups", path: "/followups" },
  { name: "Activities", path: "/activities" },
  { name: "Deals", path: "/deals" },
  { name: "Historical Data", path: "/historical" },
  { name: "Profile", path: "/profile" },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Dark overlay on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white z-30
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Smart Sales CRM
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition-colors ${
                  isActive ? "bg-blue-600" : "hover:bg-gray-800"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;