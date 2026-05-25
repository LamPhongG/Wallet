"use client";
import { useState } from "react";
import { Gift, Tag, Clock, ChevronRight, Flame, Star } from "lucide-react";
import { motion } from "framer-motion";

const vouchers = [
  { id:1, title:"Giảm 50K phí chuyển tiền", desc:"Áp dụng cho giao dịch từ 500K", exp:"31/12/2025", tag:"Chuyển tiền", hot:true, discount:"50K" },
  { id:2, title:"Hoàn tiền 2% mua sắm", desc:"Tối đa 200K/tháng", exp:"30/06/2025", tag:"Mua sắm", hot:false, discount:"2%" },
  { id:3, title:"Miễn phí rút tiền lần đầu", desc:"Áp dụng tài khoản mới", exp:"15/07/2025", tag:"Rút tiền", hot:true, discount:"FREE" },
  { id:4, title:"Tặng 100K khi giới thiệu bạn", desc:"Khi bạn bè hoàn thành KYC", exp:"31/12/2025", tag:"Referral", hot:false, discount:"100K" },
  { id:5, title:"Ưu đãi nạp tiền cuối tuần", desc:"Nạp từ 1 triệu, nhận thêm 20K", exp:"Hàng tuần", tag:"Nạp tiền", hot:true, discount:"20K" },
  { id:6, title:"Giảm 30K bill điện nước", desc:"Thanh toán hóa đơn qua ví", exp:"30/06/2025", tag:"Hóa đơn", hot:false, discount:"30K" },
];

const tagColors = {
  "Chuyển tiền":"#e11d48","Mua sắm":"#3b82f6","Rút tiền":"#22c55e",
  "Referral":"#8b5cf6","Nạp tiền":"#f59e0b","Hóa đơn":"#ec4899"
};

export default function OffersPage() {
  const [activeTag, setActiveTag] = useState("Tất cả");
  const tags = ["Tất cả", ...Object.keys(tagColors)];
  const filtered = activeTag === "Tất cả" ? vouchers : vouchers.filter(v => v.tag === activeTag);

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>🎁 Ưu đãi & Voucher</h1>
        <p style={{ color:"#71717a", fontSize:14 }}>Các ưu đãi độc quyền dành riêng cho thành viên Blackred</p>
      </div>

      {/* Tags filter */}
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {tags.map(t => (
          <button key={t} onClick={() => setActiveTag(t)} style={{
            padding:"6px 14px", borderRadius:20, fontSize:13, fontWeight:500,
            background: activeTag===t ? "rgba(225,29,72,0.15)" : "#1a1a1a",
            border:`1px solid ${activeTag===t ? "rgba(225,29,72,0.4)" : "#2a2a2a"}`,
            color: activeTag===t ? "#e11d48" : "#71717a", cursor:"pointer", transition:"all 0.2s"
          }}>{t}</button>
        ))}
      </div>

      {/* Voucher grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
        {filtered.map((v, i) => (
          <motion.div key={v.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
            style={{
              background:"#111", border:`1px solid ${v.hot ? "rgba(225,29,72,0.25)" : "#1f1f1f"}`,
              borderRadius:16, overflow:"hidden", cursor:"pointer", transition:"all 0.25s", position:"relative"
            }}
            whileHover={{ y:-4, boxShadow:"0 12px 32px rgba(0,0,0,0.4)" }}
          >
            {v.hot && (
              <div style={{ position:"absolute", top:12, right:12, display:"flex", alignItems:"center", gap:4, background:"rgba(225,29,72,0.15)", border:"1px solid rgba(225,29,72,0.3)", borderRadius:6, padding:"3px 8px" }}>
                <Flame size={11} style={{ color:"#e11d48" }} />
                <span style={{ fontSize:10, fontWeight:700, color:"#e11d48" }}>HOT</span>
              </div>
            )}
            {/* Discount badge */}
            <div style={{ background:`linear-gradient(135deg, ${tagColors[v.tag]}22, ${tagColors[v.tag]}0a)`, padding:"20px 20px 16px", borderBottom:"1px dashed #2a2a2a" }}>
              <div style={{ fontSize:32, fontWeight:900, color: tagColors[v.tag] }}>{v.discount}</div>
              <p style={{ fontSize:15, fontWeight:700, marginTop:4, color:"#f4f4f5" }}>{v.title}</p>
            </div>
            <div style={{ padding:"14px 20px" }}>
              <p style={{ fontSize:12, color:"#71717a", marginBottom:12 }}>{v.desc}</p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:`${tagColors[v.tag]}18`, color:tagColors[v.tag], fontWeight:600 }}>{v.tag}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:4, color:"#52525b" }}>
                    <Clock size={11} />
                    <span style={{ fontSize:11 }}>HSD: {v.exp}</span>
                  </div>
                </div>
                <button style={{ background:"none", border:"none", cursor:"pointer", color: tagColors[v.tag], display:"flex", alignItems:"center", gap:2, fontSize:12, fontWeight:600 }}>
                  Dùng <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
