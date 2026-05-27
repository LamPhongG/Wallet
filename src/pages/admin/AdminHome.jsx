import { Users, CreditCard, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { label:"Tổng Users", value:"1,248", change:"+24 tuần này", icon:Users, color:"#e11d48" },
  { label:"Giao dịch hôm nay", value:"342", change:"+12%", icon:Activity, color:"#22c55e" },
  { label:"Doanh thu tháng", value:"48.5M ₫", change:"+8.3%", icon:TrendingUp, color:"#3b82f6" },
  { label:"Ví đang hoạt động", value:"986", change:"78.9%", icon:CreditCard, color:"#f59e0b" },
];

const txData = [
  { day:"T2", count:45 }, { day:"T3", count:62 }, { day:"T4", count:38 },
  { day:"T5", count:80 }, { day:"T6", count:95 }, { day:"T7", count:56 }, { day:"CN", count:30 },
];

export default function AdminPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:1100 }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Tổng quan hệ thống</h1>
        <p style={{ color:"#71717a", fontSize:13 }}>Blackred Wallet Admin Dashboard</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:14 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
            style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:14, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#71717a" }}>{s.label}</p>
              <div style={{ width:32, height:32, borderRadius:8, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <s.icon size={15} style={{ color:s.color }} />
              </div>
            </div>
            <p style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>{s.value}</p>
            <p style={{ fontSize:11, color:"#52525b" }}>{s.change}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
        style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:14, padding:22 }}>
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:20 }}>Giao dịch 7 ngày qua</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={txData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis dataKey="day" tick={{ fill:"#71717a", fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#71717a", fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, color:"white" }} />
            <Bar dataKey="count" name="Giao dịch" fill="#e11d48" radius={[6,6,0,0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
