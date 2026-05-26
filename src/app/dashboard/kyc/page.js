"use client";
import { useState, useEffect } from "react";
import { Upload, CheckCircle, Clock, AlertCircle, FileText, User, Image, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { id:1, title:"Thông tin cá nhân", desc:"CCCD/CMND & họ tên" },
  { id:2, title:"Tải ảnh giấy tờ", desc:"Mặt trước & sau CCCD" },
  { id:3, title:"Chờ xác minh", desc:"1-3 ngày làm việc" },
];

export default function KycPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullname:"", cccd:"", dob:"", frontImg:null, backImg:null });
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const u = localStorage.getItem("bw_user");
      if (u) setUser(JSON.parse(u));
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("kyc_updated", loadUser);
    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("kyc_updated", loadUser);
    };
  }, []);

  const handleFile = (key, e) => {
    const file = e.target.files[0];
    if (file) setForm(f => ({ ...f, [key]:URL.createObjectURL(file) }));
  };

  const handleSubmit = () => {
    if (step < 2) { setStep(s => s + 1); return; }
    
    // 1. Cập nhật bw_user hiện tại với trạng thái pending
    const u = localStorage.getItem("bw_user");
    let updatedUser = null;
    if (u) {
      const parsed = JSON.parse(u);
      parsed.kyc = false;
      parsed.kycStatus = "pending";
      parsed.cccd = form.cccd;
      parsed.name = form.fullname || parsed.name;
      parsed.dob = form.dob;
      parsed.gender = parsed.gender || "Nam";
      parsed.address = parsed.address || "Chưa cập nhật";
      
      localStorage.setItem("bw_user", JSON.stringify(parsed));
      setUser(parsed);
      updatedUser = parsed;
    }
    
    // 2. Đồng bộ vào bw_users (UPSERT: thêm mới nếu chưa có, cập nhật nếu đã có)
    if (updatedUser) {
      const stored = localStorage.getItem("bw_users");
      let list = stored ? JSON.parse(stored) : [];
      const foundIdx = list.findIndex(item => item.email === updatedUser.email);
      
      const kycEntry = {
        kyc: "pending",
        kycStatus: "pending",
        cccd: form.cccd,
        name: form.fullname || updatedUser.name,
        dob: form.dob,
        gender: updatedUser.gender || "Nam",
        address: updatedUser.address || "Chưa cập nhật",
      };

      if (foundIdx !== -1) {
        // Cập nhật user đã tồn tại
        list[foundIdx] = { ...list[foundIdx], ...kycEntry };
      } else {
        // Thêm mới user vào danh sách admin
        list.push({
          id: "U" + Date.now(),
          email: updatedUser.email,
          phone: updatedUser.phone || "Chưa cập nhật",
          status: "active",
          balance: "0 ₫",
          joined: new Date().toLocaleDateString("vi-VN"),
          ...kycEntry,
        });
      }
      localStorage.setItem("bw_users", JSON.stringify(list));
    }
    
    // 3. Dispatch event để layout cập nhật ngay lập tức
    window.dispatchEvent(new Event("kyc_updated"));
    setSubmitted(true);
  };

  if (user && user.kyc) {
    return (
      <div style={{ maxWidth:500, margin:"0 auto", textAlign:"center", paddingTop:40 }}>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring", damping:15}}
          style={{ width:80, height:80, background:"rgba(34,197,94,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <CheckCircle size={36} style={{ color:"#22c55e" }} />
        </motion.div>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8, color:"#22c55e" }}>Tài khoản đã xác minh</h2>
        <p style={{ color:"#71717a", fontSize:14, lineHeight:1.6 }}>
          Chúc mừng! Tài khoản Blackred Wallet của bạn đã được hoàn tất xác thực danh tính (KYC).<br />
          Hạn mức giao dịch của bạn đã được nâng cấp lên tối đa và mở khóa đầy đủ tính năng nạp/rút tiền.
        </p>
      </div>
    );
  }

  if (submitted || (user && user.kycStatus === "pending")) {
    return (
      <div style={{ maxWidth:500, margin:"0 auto", textAlign:"center", paddingTop:40 }}>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring", damping:15}}
          style={{ width:80, height:80, background:"rgba(245,158,11,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <Clock size={36} style={{ color:"#f59e0b" }} />
        </motion.div>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Đang xem xét hồ sơ</h2>
        <p style={{ color:"#71717a", fontSize:14, lineHeight:1.6 }}>
          Chúng tôi đã nhận được hồ sơ KYC của bạn.<br />
          Kết quả đang được ban quản trị xem xét. Vui lòng chờ phản hồi trong thời gian sớm nhất!
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:560 }}>
      <h1 style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Xác thực danh tính (KYC)</h1>
      <p style={{ color:"#71717a", fontSize:14, marginBottom:28 }}>Xác thực để tăng hạn mức giao dịch và sử dụng đầy đủ tính năng</p>

      {/* Stepper */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
        {steps.map((s, i) => (
          <div key={s.id} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13,
                background: step > s.id ? "#22c55e" : step === s.id ? "#e11d48" : "#1a1a1a",
                border: `2px solid ${step > s.id ? "#22c55e" : step === s.id ? "#e11d48" : "#2a2a2a"}`,
                color: step >= s.id ? "white" : "#52525b", transition:"all 0.3s"
              }}>
                {step > s.id ? <CheckCircle size={16} /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p style={{ fontSize:12, fontWeight:600, color: step >= s.id ? "#f4f4f5" : "#52525b" }}>{s.title}</p>
                <p style={{ fontSize:10, color:"#52525b" }}>{s.desc}</p>
              </div>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:2, margin:"0 12px", background: step > s.id ? "#22c55e" : "#1f1f1f", transition:"all 0.3s" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
          style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:16, padding:28 }}>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>Thông tin cá nhân</h3>
          {[
            { label:"Họ và tên (theo CCCD)", key:"fullname", placeholder:"Nguyễn Văn A" },
            { label:"Số CCCD / CMND", key:"cccd", placeholder:"012345678901" },
            { label:"Ngày sinh", key:"dob", placeholder:"", type:"date" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))}
                type={f.type||"text"} placeholder={f.placeholder}
                style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none" }}
                onFocus={e => { e.target.style.borderColor="#e11d48"; }}
                onBlur={e => { e.target.style.borderColor="#2a2a2a"; }}
              />
            </div>
          ))}
          <button onClick={handleSubmit} style={{ width:"100%", background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:8 }}>
            Tiếp theo <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
          style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:16, padding:28 }}>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>Tải ảnh giấy tờ tùy thân</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            {[
              { label:"Mặt trước CCCD", key:"frontImg" },
              { label:"Mặt sau CCCD", key:"backImg" },
            ].map(f => (
              <div key={f.key}>
                <p style={{ fontSize:13, color:"#a1a1aa", marginBottom:8 }}>{f.label}</p>
                <label style={{
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  height:140, border:`2px dashed ${form[f.key] ? "#22c55e" : "#2a2a2a"}`,
                  borderRadius:12, cursor:"pointer", background: form[f.key] ? "rgba(34,197,94,0.05)" : "#1a1a1a",
                  overflow:"hidden", transition:"all 0.2s", position:"relative"
                }}>
                  {form[f.key]
                    ? <img src={form[f.key]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <>
                        <Upload size={24} style={{ color:"#52525b", marginBottom:8 }} />
                        <span style={{ fontSize:12, color:"#52525b" }}>Chọn ảnh</span>
                      </>
                  }
                  <input type="file" accept="image/*" onChange={e => handleFile(f.key, e)} style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer" }} />
                </label>
              </div>
            ))}
          </div>
          <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, padding:"12px 14px", marginBottom:20, display:"flex", gap:8 }}>
            <AlertCircle size={15} style={{ color:"#f59e0b", flexShrink:0, marginTop:2 }} />
            <p style={{ fontSize:12, color:"#a16207", lineHeight:1.5 }}>Ảnh phải rõ ràng, không bị mờ, che khuất. Định dạng JPG/PNG, tối đa 5MB.</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setStep(1)} style={{ flex:1, background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#a1a1aa", borderRadius:10, padding:"12px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
              Quay lại
            </button>
            <button onClick={handleSubmit} style={{ flex:2, background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
              Gửi xác minh
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
