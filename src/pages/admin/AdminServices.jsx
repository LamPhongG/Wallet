import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Tag, Percent, FolderOpen, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "bw_admin_vouchers";

const DEFAULT_VOUCHERS = [
  { id:1, code:"CHUYENTIEN50", title:"Giảm 50K phí chuyển tiền", desc:"Áp dụng cho giao dịch từ 500K", discount:"50K", type:"Chuyển tiền", exp:"31/12/2025", hot:true,  active:true  },
  { id:2, code:"CASHBACK2",    title:"Hoàn tiền 2% mua sắm",     desc:"Tối đa 200K/tháng",            discount:"2%",  type:"Mua sắm",    exp:"30/06/2025", hot:false, active:true  },
  { id:3, code:"FREEDRAW1",    title:"Miễn phí rút tiền lần đầu",desc:"Áp dụng tài khoản mới",        discount:"FREE",type:"Rút tiền",   exp:"15/07/2025", hot:true,  active:true  },
  { id:4, code:"REF100K",      title:"Tặng 100K khi giới thiệu bạn", desc:"Khi bạn bè hoàn thành KYC", discount:"100K",type:"Referral",  exp:"31/12/2025", hot:false, active:true  },
  { id:5, code:"NAP20K",       title:"Ưu đãi nạp tiền cuối tuần", desc:"Nạp từ 1 triệu, nhận thêm 20K", discount:"20K",type:"Nạp tiền", exp:"Hàng tuần",  hot:true,  active:true  },
  { id:6, code:"BILL30",       title:"Giảm 30K bill điện nước",   desc:"Thanh toán hóa đơn qua ví",    discount:"30K", type:"Hóa đơn",   exp:"30/06/2025", hot:false, active:true  },
];

const fees = [
  { id:1, name:"Phí chuyển tiền nội bộ", value:"0 ₫",     note:"Miễn phí giữa các ví BRW" },
  { id:2, name:"Phí chuyển ngân hàng",   value:"5,000 ₫", note:"Áp dụng mỗi giao dịch" },
  { id:3, name:"Phí rút tiền",           value:"10,000 ₫",note:"Tối thiểu rút 50,000 ₫" },
];

const categories = ["Ăn uống","Di chuyển","Mua sắm","Giải trí","Hóa đơn","Du lịch","Giáo dục","Sức khỏe"];

const emptyForm = { code:"", title:"", desc:"", discount:"", type:"Chuyển tiền", exp:"", hot:false };

export default function AdminServices() {
  const [tab, setTab] = useState("voucher");
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newCat, setNewCat] = useState("");
  const [catList, setCatList] = useState(categories);

  // Load vouchers từ localStorage lần đầu (seed defaults nếu chưa có)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setVouchers(JSON.parse(saved));
    } else {
      setVouchers(DEFAULT_VOUCHERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VOUCHERS));
    }
  }, []);

  // Helper: save & dispatch event để user page cập nhật ngay
  const persist = (updated) => {
    setVouchers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("bw_vouchers_updated"));
  };

  const openAdd  = () => { setEditItem(null); setForm({ ...emptyForm, type:"Chuyển tiền" }); setShowModal(true); };
  const openEdit = (v) => { setEditItem(v); setForm({ code:v.code, title:v.title, desc:v.desc, discount:v.discount, type:v.type, exp:v.exp, hot:v.hot }); setShowModal(true); };

  const handleSave = () => {
    if (!form.code.trim() || !form.title.trim() || !form.discount.trim()) {
      alert("Vui lòng nhập đầy đủ: Mã code, Tiêu đề, Giá trị giảm!"); return;
    }
    let updated;
    if (editItem) {
      updated = vouchers.map(v => v.id === editItem.id ? { ...v, ...form } : v);
    } else {
      const newV = { id: Date.now(), ...form, active: true };
      updated = [...vouchers, newV];
    }
    persist(updated);
    setShowModal(false);
  };

  const handleDelete   = (id) => persist(vouchers.filter(v => v.id !== id));
  const toggleActive   = (id) => persist(vouchers.map(v => v.id === id ? { ...v, active: !v.active } : v));

  const tabs = [{ v:"voucher", l:"Voucher", icon:Tag }, { v:"fee", l:"Phí giao dịch", icon:Percent }, { v:"category", l:"Danh mục", icon:FolderOpen }];
  const tagColors = { "Chuyển tiền":"#e11d48","Mua sắm":"#3b82f6","Rút tiền":"#22c55e","Referral":"#8b5cf6","Nạp tiền":"#f59e0b","Hóa đơn":"#ec4899" };

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:800, marginBottom:2 }}>Quản lý dịch vụ</h1>
          <p style={{ color:"#71717a", fontSize:13 }}>Voucher, phí giao dịch và danh mục chi tiêu</p>
        </div>
        {tab === "voucher" && (
          <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:8, padding:"9px 16px", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            <Plus size={14} /> Thêm voucher
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {tabs.map(t => (
          <button key={t.v} onClick={() => setTab(t.v)} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:500,
            background: tab===t.v ? "rgba(225,29,72,0.15)" : "#1a1a1a",
            border:`1px solid ${tab===t.v ? "rgba(225,29,72,0.3)" : "#2a2a2a"}`,
            color: tab===t.v ? "#e11d48" : "#71717a", cursor:"pointer"
          }}>
            <t.icon size={14} />{t.l}
          </button>
        ))}
      </div>

      {/* VOUCHER TAB */}
      {tab === "voucher" && (
        <div style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:14, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 110px 100px 80px 80px", padding:"11px 16px", borderBottom:"1px solid #1f1f1f", background:"#0d0d0d" }}>
            {["Mã code","Giảm giá","Loại","HSD","Tiêu đề","Trạng thái",""].map(h => (
              <span key={h} style={{ fontSize:11, fontWeight:700, color:"#52525b", textTransform:"uppercase" }}>{h}</span>
            ))}
          </div>
          {vouchers.map((v, i) => (
            <motion.div key={v.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.05}}
              style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 110px 100px 80px 80px", padding:"13px 16px", borderBottom:"1px solid #1a1a1a", alignItems:"center", gap:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:14, fontWeight:700, fontFamily:"monospace", color:"#e11d48" }}>{v.code}</span>
                {v.hot && <Flame size={12} style={{ color:"#e11d48" }} />}
              </div>
              <span style={{ fontSize:13, fontWeight:600 }}>{v.discount}</span>
              <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:`${tagColors[v.type] || "#3f3f46"}18`, color:tagColors[v.type] || "#a1a1aa", fontWeight:600, whiteSpace:"nowrap" }}>{v.type}</span>
              <span style={{ fontSize:12, color:"#71717a" }}>{v.exp}</span>
              <span style={{ fontSize:11, color:"#a1a1aa", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.title}</span>
              <button onClick={() => toggleActive(v.id)} style={{
                fontSize:11, padding:"3px 8px", borderRadius:6, fontWeight:600, cursor:"pointer", border:"none",
                background: v.active ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.12)",
                color: v.active ? "#22c55e" : "#94a3b8"
              }}>
                {v.active ? "Bật" : "Tắt"}
              </button>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => openEdit(v)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:6, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#71717a" }}>
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDelete(v.id)} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:6, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#ef4444" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
          {vouchers.length === 0 && (
            <div style={{ padding:32, textAlign:"center", color:"#52525b", fontSize:13 }}>Chưa có voucher nào. Nhấn "+ Thêm voucher" để bắt đầu.</div>
          )}
        </div>
      )}

      {/* FEE TAB */}
      {tab === "fee" && (
        <div style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:14, overflow:"hidden" }}>
          {fees.map((f, i) => (
            <div key={f.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom: i < fees.length-1 ? "1px solid #1a1a1a" : "none" }}>
              <div>
                <p style={{ fontSize:14, fontWeight:600 }}>{f.name}</p>
                <p style={{ fontSize:12, color:"#52525b", marginTop:2 }}>{f.note}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:16, fontWeight:800, color:"#e11d48" }}>{f.value}</span>
                <button style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:6, padding:"6px 10px", color:"#a1a1aa", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
                  <Pencil size={12} /> Sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY TAB */}
      {tab === "category" && (
        <div>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Tên danh mục mới..."
              style={{ flex:1, background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 14px", color:"white", fontSize:14, outline:"none" }} />
            <button onClick={() => { if (newCat.trim()) { setCatList(c => [...c, newCat.trim()]); setNewCat(""); }}} style={{ background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:8, padding:"10px 16px", fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Plus size={14} /> Thêm
            </button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {catList.map((c, i) => (
              <motion.div key={c} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:i*0.03}}
                style={{ display:"flex", alignItems:"center", gap:8, background:"#111", border:"1px solid #1f1f1f", borderRadius:10, padding:"8px 14px" }}>
                <span style={{ fontSize:13, fontWeight:500 }}>{c}</span>
                <button onClick={() => setCatList(l => l.filter(x => x !== c))} style={{ background:"none", border:"none", cursor:"pointer", color:"#52525b", display:"flex", padding:0 }}>
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal add/edit voucher */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowModal(false)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}} onClick={e => e.stopPropagation()}
              style={{ background:"#111", border:"1px solid #2a2a2a", borderRadius:18, padding:26, width:"100%", maxWidth:400, maxHeight:"90vh", overflowY:"auto" }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>{editItem ? "Sửa Voucher" : "Thêm Voucher"}</h3>

              {/* Code */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:"#a1a1aa", display:"block", marginBottom:6 }}>Mã code <span style={{ color:"#e11d48" }}>*</span></label>
                <input value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))} placeholder="VD: BLACKRED50"
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 12px", color:"white", fontSize:13, outline:"none", fontFamily:"monospace", letterSpacing:1 }} />
              </div>

              {/* Title */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:"#a1a1aa", display:"block", marginBottom:6 }}>Tiêu đề hiển thị <span style={{ color:"#e11d48" }}>*</span></label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))} placeholder="VD: Giảm 50K phí chuyển tiền"
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 12px", color:"white", fontSize:13, outline:"none" }} />
              </div>

              {/* Desc */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:"#a1a1aa", display:"block", marginBottom:6 }}>Mô tả ngắn</label>
                <input value={form.desc} onChange={e => setForm(p => ({...p, desc:e.target.value}))} placeholder="VD: Áp dụng cho giao dịch từ 500K"
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 12px", color:"white", fontSize:13, outline:"none" }} />
              </div>

              {/* Discount */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:"#a1a1aa", display:"block", marginBottom:6 }}>Giá trị giảm <span style={{ color:"#e11d48" }}>*</span></label>
                <input value={form.discount} onChange={e => setForm(p => ({...p, discount:e.target.value}))} placeholder="VD: 50K  hoặc  2%  hoặc  FREE"
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 12px", color:"white", fontSize:13, outline:"none" }} />
              </div>

              {/* Exp */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:"#a1a1aa", display:"block", marginBottom:6 }}>Ngày hết hạn</label>
                <input value={form.exp} onChange={e => setForm(p => ({...p, exp:e.target.value}))} placeholder="DD/MM/YYYY hoặc Hàng tuần"
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 12px", color:"white", fontSize:13, outline:"none" }} />
              </div>

              {/* Type */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:"#a1a1aa", display:"block", marginBottom:6 }}>Loại voucher</label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type:e.target.value}))}
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 12px", color:"white", fontSize:13, outline:"none" }}>
                  {["Chuyển tiền","Rút tiền","Nạp tiền","Mua sắm","Referral","Hóa đơn"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Hot toggle */}
              <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
                <button
                  onClick={() => setForm(p => ({...p, hot:!p.hot}))}
                  style={{
                    display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none",
                    background: form.hot ? "rgba(225,29,72,0.15)" : "#1a1a1a",
                    color: form.hot ? "#e11d48" : "#71717a",
                    outline:`1px solid ${form.hot ? "rgba(225,29,72,0.35)" : "#2a2a2a"}`
                  }}>
                  <Flame size={13} /> {form.hot ? "HOT (đang bật)" : "Đánh dấu HOT"}
                </button>
                <span style={{ fontSize:11, color:"#52525b" }}>Hiển thị badge 🔥 trên card</span>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setShowModal(false)} style={{ flex:1, background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#a1a1aa", borderRadius:8, padding:"11px", fontWeight:600, fontSize:13, cursor:"pointer" }}>Huỷ</button>
                <button onClick={handleSave} style={{ flex:2, background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:8, padding:"11px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  {editItem ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
