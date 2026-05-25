"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Wallet, LayoutDashboard, CreditCard, Gift, Settings,
  Bell, ChevronDown, User, Shield, LogOut, Menu, X,
  AlertTriangle, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/wallets", icon: CreditCard, label: "My Wallets" },
  { href: "/dashboard/offers", icon: Gift, label: "Ưu đãi" },
];

const mockNotifications = [
  { id: 1, title: "Nhận tiền thành công", desc: "+500,000 ₫ từ Nguyễn Văn A", time: "2 phút trước", read: false },
  { id: 2, title: "Bảo mật tài khoản", desc: "Cập nhật thông tin KYC để tăng hạn mức", time: "1 giờ trước", read: false },
  { id: 3, title: "Chuyển tiền thành công", desc: "-200,000 ₫ sang Trần Thị B", time: "Hôm qua", read: true },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem("bw_token");
    const userData = localStorage.getItem("bw_user");
    // Nếu không có token user nhưng có token admin, chuyển thẳng về admin panel
    if (!token && localStorage.getItem("bw_admin_token")) {
      router.replace("/admin");
      return;
    }
    if (!token) { router.replace("/login"); return; }
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("bw_token");
    localStorage.removeItem("bw_user");
    router.push("/login");
  };

  const Sidebar = ({ mobile = false }) => (
    <aside style={{
      width: mobile ? "100%" : 240,
      background: "#0d0d0d",
      borderRight: mobile ? "none" : "1px solid #1a1a1a",
      display: "flex", flexDirection: "column",
      height: "100%", padding: "24px 16px",
      position: "relative"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #e11d48, #9f1239)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Wallet size={18} color="white" />
        </div>
        <span style={{ fontSize: 18, fontWeight: 800 }}>Black<span style={{ color: "#e11d48" }}>red</span></span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, paddingLeft: 12 }}>Menu</p>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 12px", borderRadius: 10, marginBottom: 4,
                background: active ? "rgba(225,29,72,0.12)" : "transparent",
                border: active ? "1px solid rgba(225,29,72,0.2)" : "1px solid transparent",
                color: active ? "#e11d48" : "#71717a",
                transition: "all 0.2s", cursor: "pointer", fontWeight: active ? 600 : 400
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#a1a1aa"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; } }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 14 }}>{label}</span>
                {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#e11d48" }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div style={{ padding: "12px", background: "#1a1a1a", borderRadius: 12, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #e11d48, #9f1239)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={16} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontSize: 11, color: "#52525b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0a0a0a" }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex" style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40 }}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 260, zIndex: 50 }}
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Navbar */}
        <header style={{
          height: 64, background: "rgba(13,13,13,0.95)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center",
          padding: "0 24px", gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 30
        }}>
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: 4 }}>
            <Menu size={22} />
          </button>

          {/* Page title - dynamic */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
              {pathname === "/dashboard" ? "Dashboard" :
               pathname.includes("wallets") ? "My Wallets" :
               pathname.includes("offers") ? "Ưu đãi" : "Blackred Wallet"}
            </h2>
          </div>

          {/* KYC Alert */}
          {user && !user.kyc && (
            <button
              onClick={() => router.push("/dashboard/kyc")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 8, padding: "6px 12px", color: "#f59e0b",
                cursor: "pointer", fontSize: 12, fontWeight: 600
              }}
            >
              <AlertTriangle size={14} />
              <span className="hidden sm:inline">Xác thực danh tính</span>
              <span className="sm:hidden">KYC</span>
            </button>
          )}

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
              style={{
                width: 40, height: 40, borderRadius: 10, background: "#1a1a1a",
                border: "1px solid #2a2a2a", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", position: "relative"
              }}
            >
              <Bell size={18} style={{ color: "#a1a1aa" }} />
              {unreadCount > 0 && (
                <div style={{
                  position: "absolute", top: 6, right: 6, width: 8, height: 8,
                  background: "#e11d48", borderRadius: "50%",
                  animation: "pulse-red 2s infinite"
                }} />
              )}
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 320, background: "#111", border: "1px solid #2a2a2a",
                    borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100, overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>Thông báo</h3>
                    {unreadCount > 0 && <span style={{ fontSize: 11, background: "rgba(225,29,72,0.15)", color: "#e11d48", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{unreadCount} mới</span>}
                  </div>
                  {mockNotifications.map((n) => (
                    <div key={n.id} style={{
                      padding: "14px 20px", borderBottom: "1px solid #1a1a1a",
                      background: !n.read ? "rgba(225,29,72,0.04)" : "transparent",
                      cursor: "pointer", transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = !n.read ? "rgba(225,29,72,0.04)" : "transparent"; }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e11d48", marginTop: 6, flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.title}</p>
                          <p style={{ fontSize: 12, color: "#71717a" }}>{n.desc}</p>
                          <p style={{ fontSize: 11, color: "#3f3f46", marginTop: 4 }}>{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 10, padding: "6px 12px 6px 6px",
                cursor: "pointer"
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #e11d48, #9f1239)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={14} color="white" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#e4e4e7" }} className="hidden sm:inline">
                {user?.name || "User"}
              </span>
              <ChevronDown size={14} style={{ color: "#52525b" }} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 200, background: "#111", border: "1px solid #2a2a2a",
                    borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100, overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</p>
                    <p style={{ fontSize: 11, color: "#52525b" }}>{user?.email}</p>
                  </div>
                  {[
                    { icon: Shield, label: "Xác thực KYC", href: "/dashboard/kyc" },
                    { icon: User, label: "Thông tin cá nhân", href: "/dashboard/profile" },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link key={href} href={href} style={{ textDecoration: "none" }} onClick={() => setShowUserMenu(false)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", color: "#a1a1aa", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a1a1aa"; }}
                      >
                        <Icon size={15} /> {label}
                      </div>
                    </Link>
                  ))}
                  <div style={{ borderTop: "1px solid #1a1a1a" }}>
                    <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", color: "#ef4444", fontSize: 13, cursor: "pointer", background: "none", border: "none", width: "100%", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>

      {/* Close dropdowns on outside click */}
      {(showNotif || showUserMenu) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 25 }} onClick={() => { setShowNotif(false); setShowUserMenu(false); }} />
      )}
    </div>
  );
}
