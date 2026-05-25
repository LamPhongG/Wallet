"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Wallet, RefreshCw, Sparkles, ChevronRight, Calendar,
  DollarSign, Users, BarChart3, Newspaper, X, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const spendingData = [
  { month: "T1", income: 12000000, expense: 8500000 },
  { month: "T2", income: 15000000, expense: 10200000 },
  { month: "T3", income: 11000000, expense: 7800000 },
  { month: "T4", income: 18000000, expense: 12000000 },
  { month: "T5", income: 14000000, expense: 9600000 },
  { month: "T6", income: 16500000, expense: 11000000 },
];

const categoryData = [
  { name: "Ăn uống", value: 35, color: "#e11d48" },
  { name: "Di chuyển", value: 20, color: "#f59e0b" },
  { name: "Mua sắm", value: 25, color: "#3b82f6" },
  { name: "Giải trí", value: 12, color: "#8b5cf6" },
  { name: "Khác", value: 8, color: "#22c55e" },
];

const recentTx = [
  { id: 1, type: "receive", name: "Nguyễn Văn A", amount: 500000, time: "10:32", date: "Hôm nay", status: "success" },
  { id: 2, type: "send", name: "Trần Thị B", amount: -200000, time: "09:15", date: "Hôm nay", status: "success" },
  { id: 3, type: "receive", name: "Lê Văn C", amount: 1500000, time: "18:45", date: "Hôm qua", status: "success" },
  { id: 4, type: "send", name: "Phạm Thị D", amount: -750000, time: "14:20", date: "Hôm qua", status: "pending" },
];

const newsData = [
  { id: 1, title: "Ngân hàng Nhà nước điều chỉnh lãi suất tiết kiệm", time: "2 giờ trước", tag: "Kinh tế" },
  { id: 2, title: "Thanh toán không tiền mặt tăng 40% trong năm 2025", time: "5 giờ trước", tag: "Fintech" },
  { id: 3, title: "AI tài chính: xu hướng quản lý chi tiêu thông minh", time: "1 ngày trước", tag: "Công nghệ" },
];

const fmtCurrency = (n) => {
  const abs = Math.abs(n);
  return (n < 0 ? "-" : "+") + abs.toLocaleString("vi-VN") + " ₫";
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "12px 16px" }}>
      <p style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 8 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {(p.value / 1000000).toFixed(1)}M ₫
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("6m");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Chào bạn! Tôi là trợ lý tài chính Blackred AI. Bạn cần tôi tư vấn gì về quản lý chi tiêu hay tối ưu hóa dòng tiền hôm nay?" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || aiTyping) return;
    const userText = chatInput.trim();
    setChatInput("");
    
    const newMsgList = [...chatMessages, { role: "user", text: userText }];
    setChatMessages(newMsgList);
    setAiTyping(true);

    try {
      const prompt = `Bạn là trợ lý tư vấn tài chính cá nhân của ví điện tử Blackred Wallet. Bạn tên là Blackred AI. Hãy tư vấn cho người dùng thật chuyên nghiệp, lịch sự, ngắn gọn và hữu ích về các mẹo tiết kiệm tiền, tối ưu hóa ngân sách, quản lý chi tiêu. Số dư hiện tại của người dùng là 24.350.000 đ. Chi tiêu tháng này là 11.000.000 đ cho các khoản: Ăn uống (35%), Di chuyển (20%), Mua sắm (25%), Giải trí (12%), Khác (8%). Trả lời thân thiện, ngắn gọn bằng tiếng Việt.\n\nLịch sử trò chuyện:\n${newMsgList.map(m => `${m.role === 'user' ? 'Người dùng' : 'Blackred AI'}: ${m.text}`).join('\n')}\nBlackred AI:`;

      const attempts = [
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-pro", version: "v1beta" },
        { model: "gemini-2.5-flash", version: "v1beta" },
        { model: "gemini-1.5-pro", version: "v1beta" }
      ];
      let replyText = "";
      let lastErrorMessage = "";
      
      for (const att of attempts) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/${att.version}/models/${att.model}:generateContent?key=AIzaSyBrMYCeCUwgAoZrGzuB984ouoGgkHGk8XA`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          
          if (res.status === 200) {
            const data = await res.json();
            replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (replyText) break;
          } else {
            const errData = await res.json().catch(() => ({}));
            lastErrorMessage = errData?.error?.message || `HTTP ${res.status}`;
          }
        } catch (e) {
          lastErrorMessage = e.message || "Network Error";
        }
      }

      const reply = replyText || `Xin lỗi, trợ lý gặp lỗi phản hồi từ Google: "${lastErrorMessage}". Vui lòng kiểm tra lại trạng thái API Key của bạn.`;
      setChatMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "ai", text: "Xin lỗi, hiện tại tôi đang gặp khó khăn kết nối với máy chủ AI. Bạn vui lòng thử lại sau nhé!" }]);
    } finally {
      setAiTyping(false);
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("bw_user");
    if (u) setUser(JSON.parse(u));
    
    // Load financial news posts
    const saved = localStorage.getItem("bw_posts");
    if (saved) {
      setPosts(JSON.parse(saved).filter(p => p.active !== false));
    } else {
      const defaults = [
        { id: 1, title: "Ngân hàng Nhà nước điều chỉnh lãi suất tiết kiệm", time: "2 giờ trước", tag: "Kinh tế", active: true },
        { id: 2, title: "Thanh toán không tiền mặt tăng 40% trong năm 2025", time: "5 giờ trước", tag: "Fintech", active: true },
        { id: 3, title: "AI tài chính: xu hướng quản lý chi tiêu thông minh", time: "1 ngày trước", tag: "Công nghệ", active: true },
      ];
      localStorage.setItem("bw_posts", JSON.stringify(defaults));
      setPosts(defaults);
    }

    setTimeout(() => setLoading(false), 1200);
  }, []);

  const stats = [
    { label: "Số dư ví", value: "24,350,000 ₫", change: "+12.5%", up: true, icon: Wallet, color: "#e11d48" },
    { label: "Thu nhập tháng", value: "16,500,000 ₫", change: "+8.2%", up: true, icon: TrendingUp, color: "#22c55e" },
    { label: "Chi tiêu tháng", value: "11,000,000 ₫", change: "-3.1%", up: false, icon: TrendingDown, color: "#f59e0b" },
    { label: "Giao dịch", value: "47 GD", change: "+5", up: true, icon: BarChart3, color: "#3b82f6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1400 }}>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          Xin chào, {user?.name || "bạn"} 👋
        </h1>
        <p style={{ color: "#71717a", fontSize: 14 }}>
          Đây là tổng quan tài chính của bạn hôm nay, {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{
              background: "#111", border: "1px solid #1f1f1f",
              borderRadius: 16, padding: 20, position: "relative", overflow: "hidden"
            }}
          >
            {loading ? (
              <div>
                <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 24, width: "80%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: "40%" }} />
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#71717a" }}>{s.label}</p>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{s.value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {s.up ? <TrendingUp size={12} style={{ color: "#22c55e" }} /> : <TrendingDown size={12} style={{ color: "#ef4444" }} />}
                  <span style={{ fontSize: 12, color: s.up ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{s.change}</span>
                  <span style={{ fontSize: 12, color: "#52525b" }}>so với tháng trước</span>
                </div>
                {/* background accent */}
                <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}08` }} />
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Thu chi theo tháng</h3>
              <p style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>Tổng quan dòng tiền</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["3m", "6m", "1y"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  background: filter === f ? "rgba(225,29,72,0.15)" : "#1a1a1a",
                  border: `1px solid ${filter === f ? "rgba(225,29,72,0.3)" : "#2a2a2a"}`,
                  color: filter === f ? "#e11d48" : "#71717a", cursor: "pointer"
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000000}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Thu nhập" stroke="#22c55e" strokeWidth={2} fill="url(#income)" />
                <Area type="monotone" dataKey="expense" name="Chi tiêu" stroke="#e11d48" strokeWidth={2} fill="url(#expense)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Chi tiêu theo danh mục</h3>
          <p style={{ fontSize: 12, color: "#71717a", marginBottom: 20 }}>Tháng này</p>
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryData.map((c, i) => (
                      <Cell key={i} fill={c.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {categoryData.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                      <span style={{ fontSize: 12, color: "#a1a1aa" }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* AI Tips + News + Recent Tx */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* AI Chatbot widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "linear-gradient(135deg, #0d0612 0%, #120810 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", height: 380
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={16} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>AI Tư vấn chi tiêu</h3>
              <p style={{ fontSize: 11, color: "#6d28d9" }}>Powered by AI (Gemini Pro)</p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50 }} />)}
            </div>
          ) : (
            <>
              {/* Message scroll container */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, paddingRight: 6 }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    fontSize: 12,
                    lineHeight: 1.5,
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    background: msg.role === "user" ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${msg.role === "user" ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                    color: msg.role === "user" ? "#e9d5ff" : "#d1d5db"
                  }}>
                    {msg.text}
                  </div>
                ))}
                {aiTyping && (
                  <div style={{
                    alignSelf: "flex-start",
                    padding: "8px 12px",
                    borderRadius: "14px 14px 14px 2px",
                    fontSize: 11,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(139,92,246,0.3)",
                    color: "#a78bfa",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
                    AI đang phân tích chi tiêu của bạn...
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyDown={e => { if (e.key === "Enter") handleSendChatMessage(); }}
                  placeholder="Hỏi trợ lý AI về quản lý chi tiêu..."
                  style={{
                    flex: 1,
                    background: "#161616",
                    border: "1px solid rgba(139,92,246,0.15)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: "white",
                    fontSize: 12,
                    outline: "none"
                  }}
                />
                <button 
                  onClick={handleSendChatMessage} 
                  disabled={aiTyping}
                  style={{
                    background: aiTyping ? "#1f1f1f" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                    border: "none",
                    borderRadius: 8,
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: aiTyping ? "not-allowed" : "pointer",
                    color: "white",
                    transition: "opacity 0.2s"
                  }}
                  onMouseEnter={e => { if(!aiTyping) e.currentTarget.style.opacity = 0.9; }}
                  onMouseLeave={e => { if(!aiTyping) e.currentTarget.style.opacity = 1; }}
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Newspaper size={18} style={{ color: "#e11d48" }} />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Tin tức tài chính</h3>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.map((n, i) => (
                <div key={n.id} 
                  onClick={() => {
                    if (n.link) {
                      window.open(n.link, "_blank");
                    } else {
                      setSelectedNews(n);
                    }
                  }}
                  style={{ padding: "12px 0", borderBottom: i < posts.length-1 ? "1px solid #1a1a1a" : "none", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 72, height: 50, borderRadius: 8, background: "#161616", overflow: "hidden", border: "1px solid #1f1f1f", flexShrink: 0 }}>
                      {n.image ? (
                        <img src={n.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Newspaper size={14} style={{ color: "#222" }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 9, background: "rgba(225,29,72,0.15)", color: "#e11d48", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{n.tag}</span>
                      <p style={{ fontSize: 13, fontWeight: 500, marginTop: 4, lineHeight: 1.4, color: "#e4e4e7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</p>
                      <p style={{ fontSize: 11, color: "#52525b", marginTop: 4 }}>{n.time}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: "#3f3f46", flexShrink: 0 }} />
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#52525b", fontSize: 13 }}>Chưa có tin tức tài chính mới</div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Giao dịch gần đây</h3>
          <a href="/dashboard/wallets" style={{ fontSize: 13, color: "#e11d48", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            Xem tất cả <ChevronRight size={14} />
          </a>
        </div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentTx.map((tx) => (
              <div key={tx.id} style={{
                display: "flex", alignItems: "center", padding: "12px 14px", borderRadius: 10,
                cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: tx.type === "receive" ? "rgba(34,197,94,0.12)" : "rgba(225,29,72,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginRight: 14
                }}>
                  {tx.type === "receive" ? <ArrowDownLeft size={18} style={{ color: "#22c55e" }} /> : <ArrowUpRight size={18} style={{ color: "#e11d48" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{tx.name}</p>
                  <p style={{ fontSize: 12, color: "#52525b" }}>{tx.date} • {tx.time}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === "receive" ? "#22c55e" : "#e11d48" }}>
                    {fmtCurrency(tx.amount)}
                  </p>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 600,
                    background: tx.status === "success" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                    color: tx.status === "success" ? "#22c55e" : "#f59e0b"
                  }}>
                    {tx.status === "success" ? "Thành công" : "Chờ xử lý"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNews(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={e => e.stopPropagation()}
              style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: 24, width: "100%", maxWidth: 550, overflow: "hidden", position: "relative" }}>
              
              {/* Cover Image banner */}
              <div style={{ height: 220, position: "relative", background: "#161616", borderBottom: "1px solid #1a1a1a" }}>
                {selectedNews.image ? (
                  <img src={selectedNews.image} alt={selectedNews.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Newspaper size={48} style={{ color: "#222" }} />
                  </div>
                )}
                <span style={{ position: "absolute", top: 18, left: 18, fontSize: 11, background: "rgba(225,29,72,0.9)", color: "white", padding: "4px 12px", borderRadius: 8, fontWeight: 700 }}>
                  {selectedNews.tag}
                </span>
                
                {/* Floating close button */}
                <button onClick={() => setSelectedNews(null)} 
                  style={{ position: "absolute", top: 18, right: 18, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.8)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.5)"}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Text body container */}
              <div style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#71717a", fontSize: 12, marginBottom: 12 }}>
                  <Calendar size={13} />
                  <span>Đăng {selectedNews.time}</span>
                  <span>•</span>
                  <span>Tin tức Blackred</span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", lineHeight: 1.4, marginBottom: 16 }}>
                  {selectedNews.title}
                </h3>

                <div style={{ maxHeight: 200, overflowY: "auto", color: "#a1a1aa", fontSize: 13, lineHeight: 1.7, paddingRight: 6 }}>
                  {selectedNews.content ? (
                    selectedNews.content.split("\n").map((p, idx) => (
                      <p key={idx} style={{ marginBottom: 14 }}>{p}</p>
                    ))
                  ) : (
                    <p>Không có nội dung chi tiết bài viết.</p>
                  )}
                </div>

                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setSelectedNews(null)} 
                    style={{ background: "linear-gradient(135deg,#e11d48,#9f1239)", color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    Đóng bài viết
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
