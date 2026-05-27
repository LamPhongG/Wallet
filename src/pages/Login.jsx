import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wallet, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

const ADMIN_ACCOUNTS = [
  { email: "admin@smartwallet.com",   password: "Admin@123",  name: "Super Admin",  role: "superadmin" },
  { email: "manager@smartwallet.com", password: "Manager@123", name: "Manager",      role: "manager" },
];

const getUserBaseBalance = (email) => {
  if (!email) return 0;
  const lower = email.toLowerCase();
  if (lower === "nva@email.com") return 12500000;
  if (lower === "ttb@email.com") return 3200000;
  if (lower === "lvc@email.com") return 0;
  if (lower === "ptd@email.com") return 8750000;
  if (lower === "hme@email.com") return 1000000;
  return 0;
};

const getMockUserEmailByName = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes("nguyễn văn a")) return "nva@email.com";
  if (lower.includes("trần thị b")) return "ttb@email.com";
  if (lower.includes("lê văn c")) return "lvc@email.com";
  if (lower.includes("phạm thị d")) return "ptd@email.com";
  if (lower.includes("hoàng minh e")) return "hme@email.com";
  return null;
};

export default function LoginPage() {
  const navigate = useNavigate();
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
        navigate("/admin");
      } else {
        // Tài khoản User thông thường
        localStorage.removeItem("bw_admin_token");
        localStorage.removeItem("bw_admin");
        localStorage.setItem("bw_token", "demo_token_123");

        // ↳ Tìm user trong danh sách đã lưu để phục hồi trạng thái KYC và data cũ
        const storedUsers = localStorage.getItem("bw_users");
        let userRecord = null;
        if (storedUsers) {
          const userList = JSON.parse(storedUsers);
          userRecord = userList.find(u => u.email === email.toLowerCase());
        }

        let sessionUser;
        if (userRecord) {
          // User đã tồn tại: khôi phục đầy đủ data
          sessionUser = {
            email: userRecord.email,
            name: userRecord.name || "Người dùng",
            kyc: userRecord.kyc === "verified" ? true : false,
            kycStatus: userRecord.kyc === "pending" ? "pending" : (userRecord.kyc === "verified" ? "verified" : undefined),
            cccd: userRecord.cccd || undefined,
            dob: userRecord.dob || undefined,
            gender: userRecord.gender || undefined,
            address: userRecord.address || undefined,
            phone: userRecord.phone || undefined,
          };
          // Xóa các field undefined
          Object.keys(sessionUser).forEach(k => sessionUser[k] === undefined && delete sessionUser[k]);
        } else {
          // User mới: tạo mới và thêm vào danh sách
          sessionUser = {
            email: email.toLowerCase(),
            name: "Người dùng",
            kyc: false
          };
          // Thêm vào bw_users nếu chưa có
          const currentList = storedUsers ? JSON.parse(storedUsers) : [];
          currentList.push({
            id: "U" + Date.now(),
            name: sessionUser.name,
            email: sessionUser.email,
            phone: "Chưa cập nhật",
            kyc: "none",
            status: "active",
            balance: "0 ₫",
            joined: new Date().toLocaleDateString("vi-VN"),
            cccd: null, dob: null, gender: null, address: null
          });
          localStorage.setItem("bw_users", JSON.stringify(currentList));
        }

        localStorage.setItem("bw_user", JSON.stringify(sessionUser));

        // Sync bw_transactions_{email} và balance vào bw_users ngay khi login
        // Đảm bảo admin luôn tìm được user qua key này
        try {
          const txRaw = localStorage.getItem("bw_transactions");
          const emailKey = `bw_transactions_${sessionUser.email}`;
          
          let userTxs = [];
          const storedUserTxs = localStorage.getItem(emailKey);
          if (storedUserTxs) {
            userTxs = JSON.parse(storedUserTxs);
          } else {
            // Chưa có key riêng → khởi tạo bằng cách lọc từ pool chung
            if (txRaw) {
              const allTxs = JSON.parse(txRaw);
              userTxs = allTxs.filter(tx => {
                if (tx.userEmail) return tx.userEmail === sessionUser.email;
                const mockEmail = getMockUserEmailByName(tx.name);
                return mockEmail === sessionUser.email;
              });
            }
            localStorage.setItem(emailKey, JSON.stringify(userTxs));
          }

          // Tính balance thực và cập nhật bw_users
          const base = getUserBaseBalance(sessionUser.email);
          const newBalance = Math.max(0, userTxs.reduce((acc, tx) => {
            if (tx.status !== "success") return acc;
            if (tx.type === "receive") return acc + tx.amount;
            if (tx.type === "send") return acc - tx.amount;
            return acc;
          }, base));
          const balanceStr = newBalance.toLocaleString("vi-VN") + " ₫";

          const bwUsersRaw = localStorage.getItem("bw_users");
          if (bwUsersRaw) {
            const bwUsersList = JSON.parse(bwUsersRaw);
            const idx = bwUsersList.findIndex(u => u.email === sessionUser.email);
            if (idx !== -1) {
              bwUsersList[idx].balance = balanceStr;
              localStorage.setItem("bw_users", JSON.stringify(bwUsersList));
            }
          }
        } catch(e) { /* silent */ }

        navigate("/dashboard");
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
          backgroundImage: "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        
        {/* Red glow */}
        <div style={{
          position: "absolute", top: "30%", left: "20%",
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Wallet size={22} color="white" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
            Black<span style={{ color: "#2563eb" }}>red</span>
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
            <span style={{ color: "#2563eb" }}>thông minh hơn.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color: "#71717a", fontSize: 16, lineHeight: 1.7, maxWidth: 400 }}
          >
            Ví điện tử SmartWallet giúp bạn theo dõi chi tiêu, chuyển tiền tức thì, 
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
          © 2025 SmartWallet Wallet. All rights reserved.
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
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Wallet size={20} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800 }}>
              Black<span style={{ color: "#2563eb" }}>red</span>
            </span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Đăng nhập</h2>
          <p style={{ color: "#71717a", marginBottom: 32, fontSize: 14 }}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
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
                  onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)"; }}
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
                  onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)"; }}
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
              <Link to="#" style={{ color: "#2563eb", fontSize: 13, textDecoration: "none" }}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#3f3f46" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white", border: "none", borderRadius: 10,
                padding: "14px 24px", fontWeight: 700, fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.3s", marginTop: 4
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.boxShadow = "0 8px 25px rgba(37,99,235,0.4)"; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = "none"; }}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <>Đăng nhập <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 32, padding: "16px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={16} style={{ color: "#2563eb", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}>
              Dữ liệu của bạn được mã hóa và bảo mật bởi tiêu chuẩn ngân hàng SSL/TLS 256-bit.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
