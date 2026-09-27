import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import OfficerDashboard from "./pages/OfficerDashboard";
import VerifyResolution from "./pages/VerifyResolution";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "OFFICER") {
      return <Navigate to="/officer" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route
        path="/"
        element={<Login />}
      />

      {/* Register */}
      <Route
        path="/register"
        element={<Register />}
      />

      {/* Citizen Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["CITIZEN"]}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Citizen Report */}
      <Route
        path="/report"
        element={
          <ProtectedRoute
            allowedRoles={["CITIZEN"]}
          >
            <ReportIssue />
          </ProtectedRoute>
        }
      />

      {/* Citizen Verification */}
      <Route
        path="/issues/:issueId/verify"
        element={
          <ProtectedRoute
            allowedRoles={["CITIZEN"]}
          >
            <VerifyResolution />
          </ProtectedRoute>
        }
      />

      {/* Officer */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute
            allowedRoles={["OFFICER"]}
          >
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN"]}
          >
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;