import { Link } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ roleTitle }) {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (role) => {
    if (roleTitle) return roleTitle;
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "OFFICER":
        return "Field Officer";
      case "CITIZEN":
      default:
        return "Citizen";
    }
  };

  const getHomePath = (role) => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "OFFICER":
        return "/officer";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <Link to={getHomePath(user?.role)} className="brand">
          <div className="brand-icon">
            <Shield size={18} strokeWidth={2.4} />
          </div>
          <span className="brand-name">CivicFlow</span>
        </Link>
        {user?.role && (
          <span className="brand-role-pill">
            {getRoleDisplayName(user?.role)}
          </span>
        )}
      </div>

      <div className="user-section">
        <div className="user-info-group">
          <div className="user-avatar" title={user?.name || "User"}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="user-meta">
            <strong className="user-name">{user?.name || "Civic User"}</strong>
            <span className="user-role-label">{getRoleDisplayName(user?.role)}</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
          title="Sign out of CivicFlow"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
