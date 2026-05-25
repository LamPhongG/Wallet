"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Wallet, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

const ADMIN_ACCOUNTS = [
  { email: "admin@blackred.com",   password: "Admin@123",  name: "Super Admin",  role: "superadmin" },
  { email: "manager@blackred.com", password: "Manager@123", name: "Manager",      role: "manager" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      // Kiểm tra xem có phải tài khoản admin hay không
      const admin = ADMIN_ACCOUNTS.find(
        (a) => a.email === email.toLowerCase() && a.password === password
      );

      if (admin) {
        // Lưu token admin riêng biệt, xóa token user cũ nếu có
        localStorage.removeItem("bw_token");
        localStorage.removeItem("bw_user");
        localStorage.setItem("bw_admin_token", `admin_token_${Date.now()}`);
        localStorage.setItem("bw_admin", JSON.stringify({
          email: admin.email,
          name: admin.name,
          role: admin.role,
        }));
        router.push("/admin");
      } else {
        // Tài khoản User thông thường
        localStorage.removeItem("bw_admin_token");
        localStorage.removeItem("bw_admin");
        localStorage.setItem("bw_token", "demo_token_123");
        localStorage.setItem("bw_user", JSON.stringify({ 
          email: email.toLowerCase(), 
          name: "Người dùng", 
          kyc: false 
        }));
        router.push("/dashboard");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0a" }}>
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0208 50%, #0a0a0a 100%)" }}
      >
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "linear-gradient(#e11d48 1px, transparent 1px), linear-gradient(90deg, #e11d48 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        
        {/* Red glow */}
        <div style={{
          position: "absolute", top: "30%", left: "20%",
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #e11d48, #9f1239)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Wallet size={22} color="white" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
            Black<span style={{ color: "#e11d48" }}>red</span>
          </span>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}
          >
            Quản lý tài chính
            <br />
            <span style={{ color: "#e11d48" }}>thông minh hơn.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color: "#71717a", fontSize: 16, lineHeight: 1.7, maxWidth: 400 }}
          >
            Ví điện tử Blackred giúp bạn theo dõi chi tiêu, chuyển tiền tức thì, 
            và nhận gợi ý tài chính thông minh từ AI.
          </motion.p>

          {/* Features */}
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "🔒", text: "Bảo mật đa lớp với xác thực OTP" },
              { icon: "⚡", text: "Chuyển tiền tức thì, không giới hạn" },
              { icon: "🤖", text: "AI phân tích và tư vấn chi tiêu" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ color: "#a1a1aa", fontSize: 14 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10" style={{ color: "#3f3f46", fontSize: 13 }}>
          © 2025 Blackred Wallet. All rights reserved.
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#0d0d0d" }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #e11d48, #9f1239)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Wallet size={20} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800 }}>
              Black<span style={{ color: "#e11d48" }}>red</span>
            </span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Đăng nhập</h2>
          <p style={{ color: "#71717a", marginBottom: 32, fontSize: 14 }}>
            Chưa có tài khoản?{" "}
            <Link href="/register" style={{ color: "#e11d48", fontWeight: 600, textDecoration: "none" }}>
              Đăng ký ngay
            </Link>
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 20,
                color: "#ef4444", fontSize: 14
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#a1a1aa" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                    borderRadius: 10, padding: "12px 16px 12px 42px",
                    color: "white", fontSize: 14, outline: "none", transition: "all 0.3s"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#e11d48"; e.target.style.boxShadow = "0 0 0 3px rgba(225,29,72,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#a1a1aa" }}>
                Mật khẩu
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                    borderRadius: 10, padding: "12px 42px 12px 42px",
                    color: "white", fontSize: 14, outline: "none", transition: "all 0.3s"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#e11d48"; e.target.style.boxShadow = "0 0 0 3px rgba(225,29,72,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#52525b" }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link href="#" style={{ color: "#e11d48", fontSize: 13, textDecoration: "none" }}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#3f3f46" : "linear-gradient(135deg, #e11d48, #9f1239)",
                color: "white", border: "none", borderRadius: 10,
                padding: "14px 24px", fontWeight: 700, fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.3s", marginTop: 4
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.boxShadow = "0 8px 25px rgba(225,29,72,0.4)"; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = "none"; }}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <>Đăng nhập <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 32, padding: "16px", background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.15)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={16} style={{ color: "#e11d48", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}>
              Dữ liệu của bạn được mã hóa và bảo mật bởi tiêu chuẩn ngân hàng SSL/TLS 256-bit.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
