import { useNavigate } from "react-router-dom";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "../components/AppShell";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import VerifyOtp from "../pages/VerifyOtp";
import AdminSignup from "../pages/AdminSignup";

import UserDashboard from "../pages/UserDashboard";
import SubmitComplaint from "../pages/SubmitComplaint";
import MyComplaints from "../pages/MyComplaints";
import ComplaintDetails from "../pages/ComplaintDetails";

import AdminDashboard from "../pages/AdminDashboard";
import Users from "../pages/Users";
import Profile from "../pages/Profile";

import { useAuth } from "../context/AuthContext";
import useMyComplaints from "../hooks/useMyComplaints";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  );
}

function ProtectedRoute({ children, userOnly = false }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (userOnly && currentUser.role !== "USER") {
    return <Navigate to={currentUser.role === "ADMIN" ? "/admin" : "/"} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (currentUser.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AuthPage({ children }) {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          currentUser?.role === "ADMIN"
            ? "/admin"
            : "/dashboard"
        }
        replace
      />
    );
  }

  return children;
}

function UserLayout({ children }) {
  const { currentUser, logout } = useAuth();

  return (
    <AppShell
      user={currentUser}
      onLogout={logout}
    >
      {children}
    </AppShell>
  );
}

function UserDashboardPage({ onNewComplaint, onViewComplaint }) {
  const { complaints, loading, error } = useMyComplaints();

  return (
    <UserDashboard
      complaints={complaints}
      loading={loading}
      error={error}
      onNewComplaint={onNewComplaint}
      onViewComplaint={onViewComplaint}
    />
  );
}

function MyComplaintsPage({ onViewComplaint }) {
  const { complaints, loading, error } = useMyComplaints();

  return (
    <MyComplaints
      complaints={complaints}
      loading={loading}
      error={error}
      onViewComplaint={onViewComplaint}
    />
  );
}

export default function AppRoutes() {
  const navigate = useNavigate();

  const {
    currentUser,
    login,
    register,
    registerAdmin,
  } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />

      <Route
        path="/signin"
        element={
          <AuthPage>
            <Login onLogin={login} />
          </AuthPage>
        }
      />

      <Route
        path="/login"
        element={
          <AuthPage>
            <Login onLogin={login} />
          </AuthPage>
        }
      />

      <Route
        path="/register"
        element={
          <AuthPage>
            <Register onRegister={register} />
          </AuthPage>
        }
      />

      <Route
        path="/verify-otp"
        element={
          <AuthPage>
            <VerifyOtp />
          </AuthPage>
        }
      />

      <Route
        path="/admin-signup"
        element={
          <AuthPage>
            <AdminSignup onAdminRegister={registerAdmin} />
          </AuthPage>
        }
      />

      {/* User */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute userOnly>
            <UserLayout>
              <UserDashboardPage
                onNewComplaint={() =>
                  navigate("/complaints/new")
                }
                onViewComplaint={(complaint) =>
                  navigate(
                    `/complaints/${encodeURIComponent(
                      complaint.complaintId
                    )}`
                  )
                }
              />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/new"
        element={
          <ProtectedRoute userOnly>
            <UserLayout>
              <SubmitComplaint />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints"
        element={
          <ProtectedRoute userOnly>
            <UserLayout>
              <MyComplaintsPage
                onViewComplaint={(complaint) =>
                  navigate(
                    `/complaints/${encodeURIComponent(
                      complaint.complaintId
                    )}`
                  )
                }
              />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute userOnly>
            <UserLayout>
              <ComplaintDetails user={currentUser} />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserLayout>
              <Profile user={currentUser} />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <UserLayout>
              <AdminDashboard />
            </UserLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserLayout>
              <Users />
            </UserLayout>
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
