import { useState } from "react";
import { User, Camera, Phone, MapPin, Calendar, Save, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [form, setForm] = useState({ name:"Người dùng", email:"user@example.com", phone:"0901234567", dob:"1999-01-15", address:"Hà Nội, Việt Nam" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ maxWidth:600 }}>
      <h1 style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>Thông tin cá nhân</h1>

      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:16, padding:28 }}>
        {/* Avatar */}
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28, paddingBottom:24, borderBottom:"1px solid #1f1f1f" }}>
          <div style={{ position:"relative" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <User size={30} color="white" />
            </div>
            <button style={{ position:"absolute", bottom:0, right:0, width:24, height:24, borderRadius:"50%", background:"#2a2a2a", border:"2px solid #111", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Camera size={11} style={{ color:"#a1a1aa" }} />
            </button>
          </div>
          <div>
            <p style={{ fontSize:16, fontWeight:700 }}>{form.name}</p>
            <p style={{ fontSize:13, color:"#52525b" }}>{form.email}</p>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
              <Shield size={12} style={{ color:"#f59e0b" }} />
              <span style={{ fontSize:11, color:"#f59e0b", fontWeight:600 }}>Chưa xác thực KYC</span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {[
            { label:"Họ và tên", key:"name", icon:User, type:"text" },
            { label:"Số điện thoại", key:"phone", icon:Phone, type:"tel" },
            { label:"Ngày sinh", key:"dob", icon:Calendar, type:"date" },
            { label:"Địa chỉ", key:"address", icon:MapPin, type:"text" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>{f.label}</label>
              <div style={{ position:"relative" }}>
                <f.icon size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#52525b" }} />
                <input value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} type={f.type}
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px 11px 38px", color:"white", fontSize:14, outline:"none" }}
                  onFocus={e => { e.target.style.borderColor="#2563eb"; }}
                  onBlur={e => { e.target.style.borderColor="#2a2a2a"; }}
                />
              </div>
            </div>
          ))}
          <div>
            <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>Email</label>
            <input value={form.email} disabled style={{ width:"100%", background:"#141414", border:"1px solid #1f1f1f", borderRadius:10, padding:"11px 14px", color:"#52525b", fontSize:14, outline:"none", cursor:"not-allowed" }} />
          </div>

          <button onClick={handleSave} style={{
            marginTop:8, width:"100%", background: saved ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
            border: saved ? "1px solid rgba(34,197,94,0.4)" : "none",
            color: saved ? "#22c55e" : "white",
            borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.3s"
          }}>
            <Save size={16} />{saved ? "Đã lưu!" : "Lưu thay đổi"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
