"use client";
import { useState, useEffect } from "react";
import {
  ArrowDownLeft, ArrowUpRight, QrCode, Building2, Plus,
  X, CreditCard, Check, Clock, ChevronDown, Search, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas as QRCode } from "qrcode.react";

const BANKS = ["Vietcombank","Techcombank","BIDV","VietinBank","Agribank","MB Bank","VPBank","TPBank","ACB","Sacombank"];

const mockTx = [
  { id:"TX001", type:"receive", name:"Nguyễn Văn A", amount:500000, time:"10:32 25/05/2025", status:"success", note:"Trả tiền ăn" },
  { id:"TX002", type:"send",    name:"Trần Thị B",    amount:200000, time:"09:15 25/05/2025", status:"success", note:"Chuyển tiền" },
  { id:"TX003", type:"receive", name:"Lê Văn C",       amount:1500000,time:"18:45 24/05/2025", status:"success", note:"" },
  { id:"TX004", type:"send",    name:"Phạm Thị D",     amount:750000, time:"14:20 24/05/2025", status:"pending", note:"Chờ xác nhận" },
  { id:"TX005", type:"receive", name:"Hoàng Minh E",   amount:300000, time:"11:00 23/05/2025", status:"success", note:"" },
  { id:"TX006", type:"send",    name:"Đinh Thị F",     amount:1200000,time:"09:30 23/05/2025", status:"failed",  note:"Sai số tài khoản" },
];

const fmtCurrency = (n) => n.toLocaleString("vi-VN") + " ₫";

export default function WalletsPage() {
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null); // null | 'deposit' | 'withdraw' | 'transfer' | 'qr' | 'bank' | 'tx'
  const [selectedTx, setSelectedTx] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bankForm, setBankForm] = useState({ bank:"", account:"", owner:"" });
  const [txForm, setTxForm] = useState({ amount:"", target:"", note:"" });
  const [depositForm, setDepositForm] = useState({ amount:"" });
  const [step, setStep] = useState(1);

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  const balance = 24350000;
  const filtered = mockTx.filter(tx => {
    const matchTab = tab === "all" || tx.type === tab || (tab === "send" && tx.type === "send") || (tab === "receive" && tx.type === "receive");
    const matchSearch = !search || tx.name.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search);
    return matchTab && matchSearch;
  });

  const closeModal = () => { setModal(null); setStep(1); setTxForm({ amount:"", target:"", note:"" }); setDepositForm({ amount:"" }); };

  const btnStyle = (color="#e11d48") => ({
    display:"flex", flexDirection:"column", alignItems:"center", gap:8,
    background:"transparent", border:"none", cursor:"pointer", padding:"12px 16px",
    borderRadius:12, transition:"all 0.2s"
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:1000 }}>
      {/* Balance Card */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{
          background:"linear-gradient(135deg, #1a0508 0%, #0d0d0d 50%, #0a1020 100%)",
          border:"1px solid rgba(225,29,72,0.2)", borderRadius:20, padding:28, position:"relative", overflow:"hidden"
        }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, background:"radial-gradient(circle, rgba(225,29,72,0.12) 0%, transparent 70%)", borderRadius:"50%" }} />
        <p style={{ color:"#71717a", fontSize:13, marginBottom:8 }}>Số dư khả dụng</p>
        {loading
          ? <div className="skeleton" style={{ height:40, width:220, marginBottom:12 }} />
          : <h2 style={{ fontSize:36, fontWeight:900, letterSpacing:"-1px", marginBottom:12 }}>{fmtCurrency(balance)}</h2>
        }
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e" }} />
          <span style={{ fontSize:12, color:"#52525b" }}>Tài khoản đã xác thực</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display:"flex", gap:4, marginTop:24, flexWrap:"wrap" }}>
          {[
            { label:"Nạp tiền", icon:ArrowDownLeft, color:"#22c55e", modal:"deposit" },
            { label:"Rút tiền", icon:ArrowUpRight,  color:"#f59e0b", modal:"withdraw" },
            { label:"Chuyển tiền", icon:CreditCard, color:"#3b82f6", modal:"transfer" },
            { label:"Mã QR", icon:QrCode,           color:"#e11d48", modal:"qr" },
          ].map(({ label, icon:Icon, color, modal:m }) => (
            <button key={m} onClick={() => setModal(m)} style={btnStyle(color)}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${color}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width:44, height:44, borderRadius:12, background:`${color}20`, border:`1px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={20} style={{ color }} />
              </div>
              <span style={{ fontSize:12, fontWeight:500, color:"#a1a1aa" }}>{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Link Bank */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}}
        style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:16, padding:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"rgba(59,130,246,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Building2 size={18} style={{ color:"#3b82f6" }} />
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:600 }}>Liên kết ngân hàng</p>
            <p style={{ fontSize:12, color:"#52525b" }}>Kết nối tài khoản ngân hàng để nạp/rút nhanh</p>
          </div>
        </div>
        <button onClick={() => setModal("bank")} style={{
          display:"flex", alignItems:"center", gap:6, background:"rgba(59,130,246,0.1)",
          border:"1px solid rgba(59,130,246,0.2)", borderRadius:8, padding:"8px 14px",
          color:"#3b82f6", cursor:"pointer", fontSize:13, fontWeight:600
        }}>
          <Plus size={14} /> Thêm ngân hàng
        </button>
      </motion.div>

      {/* Transactions */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}
        style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:16, padding:24 }}>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Lịch sử giao dịch</h3>

        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:160 }}>
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#52525b" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm giao dịch..." style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"8px 12px 8px 34px", color:"white", fontSize:13, outline:"none" }} />
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[{v:"all",l:"Tất cả"},{v:"receive",l:"Nhận"},{v:"send",l:"Chuyển"}].map(t => (
              <button key={t.v} onClick={() => setTab(t.v)} style={{
                padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:500,
                background: tab===t.v ? "rgba(225,29,72,0.15)" : "#1a1a1a",
                border:`1px solid ${tab===t.v ? "rgba(225,29,72,0.3)" : "#2a2a2a"}`,
                color: tab===t.v ? "#e11d48" : "#71717a", cursor:"pointer"
              }}>{t.l}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:60, marginBottom:4 }} />)
            : filtered.map(tx => (
              <div key={tx.id} onClick={() => { setSelectedTx(tx); setModal("tx"); }}
                style={{ display:"flex", alignItems:"center", padding:"12px 14px", borderRadius:10, cursor:"pointer", transition:"background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background: tx.type==="receive" ? "rgba(34,197,94,0.12)" : "rgba(225,29,72,0.12)", display:"flex", alignItems:"center", justifyContent:"center", marginRight:14 }}>
                  {tx.type==="receive" ? <ArrowDownLeft size={18} style={{ color:"#22c55e" }} /> : <ArrowUpRight size={18} style={{ color:"#e11d48" }} />}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600 }}>{tx.name}</p>
                  <p style={{ fontSize:11, color:"#52525b" }}>{tx.id} • {tx.time}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:14, fontWeight:700, color: tx.type==="receive" ? "#22c55e" : "#e11d48" }}>
                    {tx.type==="receive" ? "+" : "-"}{fmtCurrency(tx.amount)}
                  </p>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:6, fontWeight:600,
                    background: tx.status==="success" ? "rgba(34,197,94,0.12)" : tx.status==="pending" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                    color: tx.status==="success" ? "#22c55e" : tx.status==="pending" ? "#f59e0b" : "#ef4444"
                  }}>
                    {tx.status==="success" ? "Thành công" : tx.status==="pending" ? "Chờ xử lý" : "Thất bại"}
                  </span>
                </div>
              </div>
            ))
          }
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:40, color:"#52525b" }}>
              <p style={{ fontSize:14 }}>Không có giao dịch nào</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ============ MODALS ============ */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={closeModal}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              onClick={(e) => e.stopPropagation()}
              style={{ background:"#111", border:"1px solid #2a2a2a", borderRadius:20, padding:28, width:"100%", maxWidth:440, position:"relative" }}>
              <button onClick={closeModal} style={{ position:"absolute", top:16, right:16, background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#71717a" }}>
                <X size={16} />
              </button>

              {/* DEPOSIT */}
              {(modal==="deposit" || modal==="withdraw") && (
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{modal==="deposit" ? "💳 Nạp tiền" : "🏦 Rút tiền"}</h3>
                  <p style={{ color:"#52525b", fontSize:13, marginBottom:24 }}>
                    {modal==="deposit" ? "Nạp tiền vào ví Blackred" : "Rút tiền về tài khoản ngân hàng"}
                  </p>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:8 }}>Số tiền (₫)</label>
                    <input value={depositForm.amount} onChange={e => setDepositForm({amount:e.target.value})} placeholder="0" type="number" style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"12px 16px", color:"white", fontSize:18, fontWeight:700, outline:"none" }} />
                    <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                      {[100000,200000,500000,1000000].map(v => (
                        <button key={v} onClick={() => setDepositForm({amount:String(v)})} style={{ fontSize:12, padding:"6px 12px", borderRadius:8, background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#a1a1aa", cursor:"pointer" }}>
                          +{fmtCurrency(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button style={{ width:"100%", background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    Xác nhận {modal==="deposit" ? "nạp" : "rút"} {depositForm.amount ? fmtCurrency(Number(depositForm.amount)) : ""}
                  </button>
                </div>
              )}

              {/* TRANSFER */}
              {modal==="transfer" && (
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>💸 Chuyển tiền</h3>
                  {[
                    { label:"Số điện thoại / Email người nhận", key:"target", placeholder:"Nhập số điện thoại hoặc email" },
                    { label:"Số tiền (₫)", key:"amount", placeholder:"0", type:"number" },
                    { label:"Ghi chú (tuỳ chọn)", key:"note", placeholder:"Nội dung chuyển tiền" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom:14 }}>
                      <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>{f.label}</label>
                      <input value={txForm[f.key]} onChange={e => setTxForm({...txForm,[f.key]:e.target.value})}
                        placeholder={f.placeholder} type={f.type||"text"}
                        style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none" }} />
                    </div>
                  ))}
                  <button style={{ width:"100%", background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", marginTop:8 }}>
                    Chuyển tiền
                  </button>
                </div>
              )}

              {/* QR */}
              {modal==="qr" && (
                <div style={{ textAlign:"center" }}>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>📱 Mã QR của tôi</h3>
                  <p style={{ color:"#52525b", fontSize:13, marginBottom:24 }}>Cho người khác quét để chuyển tiền cho bạn</p>
                  <div style={{ display:"inline-block", background:"white", borderRadius:16, padding:16, marginBottom:20 }}>
                    <QRCode value="blackred://user/demo_user_123" size={180} level="H" />
                  </div>
                  <p style={{ fontSize:13, color:"#a1a1aa", marginBottom:4 }}>ID: <strong style={{ color:"#e11d48" }}>BRW-DEMO-123</strong></p>
                  <button style={{ marginTop:12, background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"10px 24px", color:"#a1a1aa", cursor:"pointer", fontSize:13 }}>
                    Tải ảnh QR
                  </button>
                </div>
              )}

              {/* BANK */}
              {modal==="bank" && (
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>🏦 Liên kết ngân hàng</h3>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>Tên ngân hàng</label>
                    <select value={bankForm.bank} onChange={e => setBankForm({...bankForm,bank:e.target.value})}
                      style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color: bankForm.bank ? "white" : "#52525b", fontSize:14, outline:"none" }}>
                      <option value="">-- Chọn ngân hàng --</option>
                      {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  {[
                    { label:"Số tài khoản", key:"account", placeholder:"Nhập số tài khoản" },
                    { label:"Tên chủ tài khoản", key:"owner", placeholder:"Nhập họ và tên" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom:14 }}>
                      <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>{f.label}</label>
                      <input value={bankForm[f.key]} onChange={e => setBankForm({...bankForm,[f.key]:e.target.value})}
                        placeholder={f.placeholder}
                        style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none" }} />
                    </div>
                  ))}
                  <button style={{ width:"100%", background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", marginTop:8 }}>
                    Liên kết ngân hàng
                  </button>
                </div>
              )}

              {/* TX DETAIL */}
              {modal==="tx" && selectedTx && (
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Chi tiết giao dịch</h3>
                  <div style={{ background:"#1a1a1a", borderRadius:12, padding:20, marginBottom:20, textAlign:"center" }}>
                    <p style={{ fontSize:32, fontWeight:900, color: selectedTx.type==="receive" ? "#22c55e" : "#e11d48" }}>
                      {selectedTx.type==="receive" ? "+" : "-"}{fmtCurrency(selectedTx.amount)}
                    </p>
                    <span style={{ fontSize:12, padding:"4px 12px", borderRadius:8, fontWeight:600,
                      background: selectedTx.status==="success" ? "rgba(34,197,94,0.12)" : selectedTx.status==="pending" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                      color: selectedTx.status==="success" ? "#22c55e" : selectedTx.status==="pending" ? "#f59e0b" : "#ef4444"
                    }}>
                      {selectedTx.status==="success" ? "Thành công" : selectedTx.status==="pending" ? "Chờ xử lý" : "Thất bại"}
                    </span>
                  </div>
                  {[
                    { label:"Mã giao dịch", value:selectedTx.id },
                    { label:"Loại", value: selectedTx.type==="receive" ? "Nhận tiền" : "Chuyển tiền" },
                    { label:selectedTx.type==="receive" ? "Người gửi" : "Người nhận", value:selectedTx.name },
                    { label:"Thời gian", value:selectedTx.time },
                    { label:"Ghi chú", value:selectedTx.note || "—" },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1f1f1f" }}>
                      <span style={{ fontSize:13, color:"#71717a" }}>{r.label}</span>
                      <span style={{ fontSize:13, fontWeight:600 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
