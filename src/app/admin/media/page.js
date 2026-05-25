"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Newspaper, Tag, Calendar, Eye, EyeOff, Link as LinkIcon, Upload, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const defaultPosts = [
  { 
    id: 1, 
    title: "Ngân hàng Nhà nước điều chỉnh lãi suất tiết kiệm", 
    time: "2 giờ trước", 
    tag: "Kinh tế", 
    content: "Ngân hàng Nhà nước vừa công bố điều chỉnh khung lãi suất tiền gửi tiết kiệm áp dụng cho các tổ chức tín dụng. Động thái này nhằm định hướng dòng vốn hiệu quả vào sản xuất kinh doanh, đồng thời kiểm soát lạm phát ổn định trong nước.", 
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=60", 
    link: "", 
    active: true 
  },
  { 
    id: 2, 
    title: "Thanh toán không tiền mặt tăng 40% trong năm 2025", 
    time: "5 giờ trước", 
    tag: "Fintech", 
    content: "Báo cáo mới nhất của cơ quan quản lý tài chính cho thấy làn sóng chuyển đổi số đang bùng nổ mạnh mẽ tại Việt Nam. Khối lượng giao dịch không dùng tiền mặt qua ví điện tử và chuyển khoản ngân hàng ghi nhận mức tăng trưởng kỷ lục.", 
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60", 
    link: "", 
    active: true 
  },
  { 
    id: 3, 
    title: "AI tài chính: xu hướng quản lý chi tiêu thông minh", 
    time: "1 ngày trước", 
    tag: "Công nghệ", 
    content: "Các chuyên gia Fintech đánh giá trợ lý trí tuệ nhân tạo (AI) đang định hình lại thói quen tích lũy tài sản và theo dõi ngân sách cá nhân của thế hệ trẻ. Công nghệ phân tích dự báo giúp tối ưu hóa chi phí hàng tháng tối đa.", 
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60", 
    link: "", 
    active: true 
  },
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Expanded form state
  const [form, setForm] = useState({ 
    title: "", 
    tag: "Kinh tế", 
    time: "Vừa xong", 
    content: "", 
    image: "", 
    link: "", 
    active: true 
  });

  useEffect(() => {
    const saved = localStorage.getItem("bw_posts");
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      localStorage.setItem("bw_posts", JSON.stringify(defaultPosts));
      setPosts(defaultPosts);
    }
  }, []);

  const saveToStorage = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem("bw_posts", JSON.stringify(newPosts));
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ 
      title: "", 
      tag: "Kinh tế", 
      time: "Vừa xong", 
      content: "", 
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60", 
      link: "", 
      active: true 
    });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({ 
      title: p.title, 
      tag: p.tag, 
      time: p.time, 
      content: p.content || "", 
      image: p.image || "", 
      link: p.link || "", 
      active: p.active 
    });
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    let updated;
    if (editItem) {
      updated = posts.map(p => p.id === editItem.id ? { ...p, ...form } : p);
    } else {
      updated = [{ id: Date.now(), ...form }, ...posts];
    }
    saveToStorage(updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const updated = posts.filter(p => p.id !== id);
    saveToStorage(updated);
  };

  const toggleActive = (id) => {
    const updated = posts.map(p => p.id === id ? { ...p, active: !p.active } : p);
    saveToStorage(updated);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>Quản lý Bài viết</h1>
          <p style={{ color: "#71717a", fontSize: 13 }}>{posts.length} bài viết tin tức tài chính đang hoạt động</p>
        </div>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#e11d48,#9f1239)", color: "white", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          <Plus size={14} /> Viết bài mới
        </button>
      </div>

      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 130px 110px 100px 90px", padding: "12px 18px", borderBottom: "1px solid #1f1f1f", background: "#0d0d0d", alignItems: "center" }}>
          {["Ảnh bìa", "Tiêu đề bài viết", "Chuyên mục", "Thời gian", "Hiển thị", ""].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#52525b", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#52525b" }}>Không có bài viết nào</div>
        ) : (
          posts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 130px 110px 100px 90px", padding: "14px 18px", borderBottom: "1px solid #1a1a1a", alignItems: "center" }}>
              <div style={{ width: 50, height: 34, borderRadius: 6, background: "#1f1f1f", overflow: "hidden", border: "1px solid #2a2a2a" }}>
                {p.image ? (
                  <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Newspaper size={12} style={{ color: "#52525b" }} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingRight: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{p.title}</span>
                {p.link && (
                  <span style={{ fontSize: 10, color: "#e11d48", display: "flex", alignItems: "center", gap: 3 }}>
                    <LinkIcon size={8} /> Chuyển hướng: {p.link}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, background: "rgba(225,29,72,0.12)", color: "#e11d48", padding: "3px 8px", borderRadius: 6, fontWeight: 600, display: "inline-block", width: "fit-content" }}>
                {p.tag}
              </span>
              <span style={{ fontSize: 12, color: "#71717a" }}>{p.time}</span>
              <button onClick={() => toggleActive(p.id)} style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600, cursor: "pointer", border: "none", width: "fit-content",
                background: p.active ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.12)",
                color: p.active ? "#22c55e" : "#94a3b8"
              }}>
                {p.active ? "Hiển thị" : "Ẩn"}
              </button>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => openEdit(p)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#71717a" }}>
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDelete(p.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Expanded Write/Edit Post Modal with side-by-side Live Preview */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}
              style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: 20, padding: 28, width: "100%", maxWidth: 840, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
              
              {/* Left Column: Form Editor */}
              <div style={{ borderRight: "1px solid #1a1a1a", paddingRight: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: "white" }}>
                  {editItem ? "Sửa bài viết" : "Viết bài tin tức mới"}
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#a1a1aa", display: "block", marginBottom: 6 }}>Tiêu đề bài viết</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Nhập tiêu đề tin tức..."
                      style={{ width: "100%", background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 13, outline: "none" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#a1a1aa", display: "block", marginBottom: 6 }}>Chuyên mục</label>
                      <select value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
                        style={{ width: "100%", background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 13, outline: "none" }}>
                        {["Kinh tế", "Fintech", "Công nghệ", "Đầu tư", "Thị trường"].map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#a1a1aa", display: "block", marginBottom: 6 }}>Thời gian hiển thị</label>
                      <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="VD: Vừa xong"
                        style={{ width: "100%", background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 13, outline: "none" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "#a1a1aa", display: "block", marginBottom: 6 }}>Hình ảnh bài viết</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="URL hình ảnh (picsum, unsplash...)"
                        style={{ flex: 1, background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 13, outline: "none" }} />
                      <label style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 14px", color: "#a1a1aa", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                        <Upload size={14} /> Upload
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "#a1a1aa", display: "block", marginBottom: 6 }}>Đường link chuyển tiếp (Không bắt buộc)</label>
                    <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="VD: https://vnexpress.net/... (khi click sẽ chuyển tới link này)"
                      style={{ width: "100%", background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 13, outline: "none" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "#a1a1aa", display: "block", marginBottom: 6 }}>Nội dung chi tiết bài viết</label>
                    <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Viết nội dung bài viết chi tiết ở đây..." rows={4}
                      style={{ width: "100%", background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 13, outline: "none", resize: "none", lineHeight: 1.5 }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#a1a1aa", borderRadius: 8, padding: "11px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Huỷ</button>
                  <button onClick={handleSave} style={{ flex: 2, background: "linear-gradient(135deg,#e11d48,#9f1239)", color: "white", border: "none", borderRadius: 8, padding: "11px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {editItem ? "Cập nhật" : "Đăng bài viết"}
                  </button>
                </div>
              </div>

              {/* Right Column: Real-time Live Preview */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.5px" }}>XEM TRƯỚC BÀI VIẾT (LIVE PREVIEW)</h3>
                  </div>

                  {/* Dynamic user news card simulation */}
                  <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                    {/* Simulated image header */}
                    <div style={{ height: 140, background: "#1a1a1a", position: "relative", overflow: "hidden" }}>
                      {form.image ? (
                        <img src={form.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Newspaper size={32} style={{ color: "#2a2a2a" }} />
                        </div>
                      )}
                      <span style={{ position: "absolute", top: 12, left: 12, fontSize: 10, background: "rgba(225,29,72,0.85)", backdropFilter: "blur(4px)", color: "white", padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>
                        {form.tag}
                      </span>
                    </div>

                    {/* Simulated card content */}
                    <div style={{ padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.4, margin: 0 }}>
                          {form.title || "Tiêu đề bài viết mẫu sẽ hiển thị tại đây"}
                        </h4>
                        <ChevronRight size={16} style={{ color: "#3f3f46", flexShrink: 0, marginTop: 2 }} />
                      </div>
                      <p style={{ fontSize: 11, color: "#52525b", marginTop: 6 }}>{form.time}</p>
                      
                      {/* Short simulated body copy */}
                      <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {form.content || "Nội dung chi tiết bài viết do admin soạn thảo sẽ tự động xuất hiện tại phần xem chi tiết của người dùng khi nhấp chọn bài viết..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 10, padding: 14 }}>
                  <p style={{ fontSize: 11, color: "#71717a", lineHeight: 1.5 }}>
                    📝 <strong style={{ color: "#a1a1aa" }}>Gợi ý:</strong> Kiểm tra kỹ tiêu đề và nội dung hiển thị bên trên. Đối với bài viết có gắn link chuyển tiếp, khi user click vào thẻ tin tức sẽ tự động mở trang mới thay vì hiển thị nội dung đọc.
                  </p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
