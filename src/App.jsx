import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

// Dashboard
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Wallets from "./pages/dashboard/Wallets";
import Kyc from "./pages/dashboard/Kyc";
import Offers from "./pages/dashboard/Offers";
import Profile from "./pages/dashboard/Profile";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminServices from "./pages/admin/AdminServices";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminSuspicious from "./pages/admin/AdminSuspicious";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Dashboard nested routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="wallets" element={<Wallets />} />
          <Route path="kyc" element={<Kyc />} />
          <Route path="offers" element={<Offers />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin nested routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="suspicious" element={<AdminSuspicious />} />
          <Route path="media" element={<AdminMedia />} />
        </Route>

        {/* Wildcard redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
