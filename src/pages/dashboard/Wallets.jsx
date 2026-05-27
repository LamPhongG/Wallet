import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowDownLeft, ArrowUpRight, QrCode, Building2, Plus,
  X, CreditCard, Check, Search,
  Wallet, Upload, Smartphone, AlertCircle, Gift, Tag, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas as QRCode } from "qrcode.react";

const BANKS = ["Vietcombank","Techcombank","BIDV","VietinBank","Agribank","MB Bank","VPBank","TPBank","ACB","Sacombank"];

const VOUCHERS_FALLBACK = [
  { id:1, code:"CHUYENTIEN50", title:"Giảm 50K phí chuyển tiền", desc:"Áp dụng cho giao dịch từ 500K", exp:"31/12/2025", tag:"Chuyển tiền", hot:true, discount:"50K", value: 50000, minAmount: 500000 },
  { id:2, code:"MUASAM2", title:"Hoàn tiền 2% mua sắm", desc:"Tối đa 200K/tháng", exp:"30/06/2025", tag:"Mua sắm", hot:false, discount:"2%", value: 0.02, isPercent: true },
  { id:3, code:"FREERUT", title:"Miễn phí rút tiền lần đầu", desc:"Áp dụng tài khoản mới", exp:"15/07/2025", tag:"Rút tiền", hot:true, discount:"FREE", value: 10000 },
  { id:4, code:"REF100K", title:"Tặng 100K khi giới thiệu bạn", desc:"Khi bạn bè hoàn thành KYC", exp:"31/12/2025", tag:"Referral", hot:false, discount:"100K", value: 100000 },
  { id:5, code:"NAP20K", title:"Ưu đãi nạp tiền cuối tuần", desc:"Nạp từ 1 triệu, nhận thêm 20K", exp:"Hàng tuần", tag:"Nạp tiền", hot:true, discount:"20K", value: 20000, minAmount: 1000000 },
  { id:6, code:"BILL30", title:"Giảm 30K bill điện nước", desc:"Thanh toán hóa đơn qua ví", exp:"30/06/2025", tag:"Hóa đơn", hot:false, discount:"30K", value: 30000 },
];

const tagColors = {
  "Chuyển tiền":"#e11d48","Mua sắm":"#3b82f6","Rút tiền":"#22c55e",
  "Referral":"#8b5cf6","Nạp tiền":"#f59e0b","Hóa đơn":"#ec4899"
};

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

const mockTx = [
  { id:"TX001", type:"receive", name:"Nguyễn Văn A", amount:500000, time:"10:32 25/05/2025", status:"success", note:"Trả tiền ăn", userEmail: "nva@email.com" },
  { id:"TX002", type:"send",    name:"Trần Thị B",    amount:200000, time:"09:15 25/05/2025", status:"success", note:"Chuyển tiền", userEmail: "ttb@email.com" },
  { id:"TX003", type:"receive", name:"Lê Văn C",       amount:1500000,time:"18:45 24/05/2025", status:"success", note:"", userEmail: "lvc@email.com" },
  { id:"TX004", type:"send",    name:"Phạm Thị D",     amount:750000, time:"14:20 24/05/2025", status:"pending", note:"Chờ xác nhận", userEmail: "ptd@email.com" },
  { id:"TX005", type:"receive", name:"Hoàng Minh E",   amount:300000, time:"11:00 23/05/2025", status:"success", note:"", userEmail: "hme@email.com" },
  { id:"TX006", type:"send",    name:"Đinh Thị F",     amount:1200000,time:"09:30 23/05/2025", status:"failed",  note:"Sai số tài khoản", userEmail: "nva@email.com" },
];

const fmtCurrency = (n) => n.toLocaleString("vi-VN") + " ₫";

// Lưu transactions: global pool (bw_transactions) + per-user key (chỉ GD của user đó)
const saveTx = (list) => {
  try {
    const bwUser = localStorage.getItem("bw_user");
    if (bwUser) {
      const u = JSON.parse(bwUser);
      if (u.email) {
        // 1. Chỉ lưu GD của user hiện tại vào key per-user
        localStorage.setItem(`bw_transactions_${u.email}`, JSON.stringify(list));

        // 2. Gộp vào global pool mà không xoá GD của user khác
        const savedGlobal = localStorage.getItem("bw_transactions");
        let globalList = [];
        if (savedGlobal) {
          const parsedGlobal = JSON.parse(savedGlobal);
          const otherTxs = parsedGlobal.filter(tx => {
            if (tx.userEmail) return tx.userEmail !== u.email;
            const mockEmail = getMockUserEmailByName(tx.name);
            return mockEmail !== u.email;
          });
          globalList = [...list, ...otherTxs];
        } else {
          globalList = list;
        }
        localStorage.setItem("bw_transactions", JSON.stringify(globalList));

        // 3. Tính balance chỉ từ GD của user này
        const base = getUserBaseBalance(u.email);
        const newBalance = Math.max(0, list.reduce((acc, tx) => {
          if (tx.status !== "success") return acc;
          if (tx.type === "receive") return acc + tx.amount;
          if (tx.type === "send") return acc - tx.amount;
          return acc;
        }, base));
        const balanceStr = newBalance.toLocaleString("vi-VN") + " ₫";

        // 4. Sync vào bw_users
        const stored = localStorage.getItem("bw_users");
        if (stored) {
          const users = JSON.parse(stored);
          const idx = users.findIndex(usr => usr.email === u.email);
          if (idx !== -1) {
            users[idx].balance = balanceStr;
            localStorage.setItem("bw_users", JSON.stringify(users));
          }
        }
        // 5. Sync vào bw_user session
        u.balance = balanceStr;
        localStorage.setItem("bw_user", JSON.stringify(u));
        
        window.dispatchEvent(new CustomEvent("balance_updated", { detail: {} }));
      }
    }
  } catch(e) { /* silent fail */ }
};

const parseTxTime = (timeStr) => {
  if (!timeStr) return new Date();
  try {
    const parts = timeStr.trim().split(" ");
    if (parts.length === 2 && parts[1].includes("/")) {
      const [hour, minute] = parts[0].split(":");
      const [day, month, year] = parts[1].split("/");
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour || 0),
        Number(minute || 0)
      );
    }
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch (e) {
    return new Date();
  }
};

export default function WalletsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("all");
  const [userEmail, setUserEmail] = useState("");
  const [modal, setModal] = useState(null); // null | 'deposit' | 'withdraw' | 'transfer' | 'qr' | 'bank' | 'tx'
  const [selectedTx, setSelectedTx] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bankForm, setBankForm] = useState({ bank:"", account:"", owner:"" });
  const [txForm, setTxForm] = useState({ amount:"", target:"", note:"", category:"" });
  const [depositForm, setDepositForm] = useState({ amount:"", note:"" });
  const [activeDepositTx, setActiveDepositTx] = useState(null);
  const [step, setStep] = useState(1);
  const [txList, setTxList] = useState([]);
  const [linkedBanks, setLinkedBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [toast, setToast] = useState(null);
  const [transferMethod, setTransferMethod] = useState("blackred"); // 'blackred' | 'bank'
  const [bankTransferForm, setBankTransferForm] = useState({ bank: "", account: "", ownerName: "" });
  const [qrUploadFile, setQrUploadFile] = useState(null);
  const [qrUploadPreview, setQrUploadPreview] = useState(null);
  const qrInputRef = useRef(null);

  // Promo / Voucher states
  const [promoCode, setPromoCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [showPromoSelector, setShowPromoSelector] = useState(false);
  const [activePromoTab, setActivePromoTab] = useState("Tất cả");
  const [voucherList, setVoucherList] = useState(VOUCHERS_FALLBACK);

  const loadVouchers = () => {
    try {
      const saved = localStorage.getItem("bw_admin_vouchers");
      if (saved) {
        const all = JSON.parse(saved);
        const active = all.filter(v => v.active !== false).map(v => ({
          ...v,
          tag: v.type || v.tag || "Khác"
        }));
        setVoucherList(active.length > 0 ? active : VOUCHERS_FALLBACK);
      }
    } catch { /* fallback */ }
  };

  const calculateDiscount = (amountVal, v) => {
    if (!v) return 0;
    const amt = Number(amountVal) || 0;
    if (v.code === "CHUYENTIEN50") {
      if (amt < 500000) return 0;
      return 50000;
    }
    if (v.code === "MUASAM2") {
      return Math.round(amt * 0.02);
    }
    if (v.code === "FREERUT") {
      return 10000;
    }
    if (v.code === "REF100K") {
      return 100000;
    }
    if (v.code === "NAP20K") {
      if (amt < 1000000) return 0;
      return 20000;
    }
    if (v.code === "BILL30") {
      return 30000;
    }
    return 0;
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      showToast("Vui lòng nhập mã ưu đãi!", "error");
      return;
    }
    const v = voucherList.find(x => x.code.toUpperCase() === promoCode.trim().toUpperCase());
    if (!v) {
      showToast("Mã ưu đãi không hợp lệ hoặc đã hết hạn!", "error");
      return;
    }
    if (v.minAmount && (Number(txForm.amount) || 0) < v.minAmount) {
      showToast(`Mã này chỉ áp dụng cho giao dịch từ ${fmtCurrency(v.minAmount)} trở lên!`, "error");
      return;
    }
    setAppliedVoucher(v);
    setPromoCode(v.code);
    showToast(`Áp dụng thành công mã: ${v.code}!`);
  };

  const handleSelectVoucher = (v) => {
    if (v.minAmount && (Number(txForm.amount) || 0) < v.minAmount) {
      showToast(`Mã này chỉ áp dụng cho giao dịch từ ${fmtCurrency(v.minAmount)} trở lên!`, "error");
      return;
    }
    setAppliedVoucher(v);
    setPromoCode(v.code);
    setShowPromoSelector(false);
    showToast(`Áp dụng thành công mã: ${v.code}!`);
  };

  const syncBalanceToAdmin = (txs, userEmail) => {
    try {
      if (!userEmail) return;
      const myTxs = txs.filter(tx => {
        if (tx.userEmail) return tx.userEmail === userEmail;
        const mockEmail = getMockUserEmailByName(tx.name);
        return mockEmail === userEmail;
      });
      localStorage.setItem(`bw_transactions_${userEmail}`, JSON.stringify(myTxs));
      const base = getUserBaseBalance(userEmail);
      const newBalance = Math.max(0, myTxs.reduce((acc, tx) => {
        if (tx.status !== "success") return acc;
        if (tx.type === "receive") return acc + tx.amount;
        if (tx.type === "send") return acc - tx.amount;
        return acc;
      }, base));
      const balanceStr = newBalance.toLocaleString("vi-VN") + " ₫";
      const storedUsers = localStorage.getItem("bw_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const idx = users.findIndex(usr => usr.email === userEmail);
        if (idx !== -1) {
          users[idx].balance = balanceStr;
          localStorage.setItem("bw_users", JSON.stringify(users));
        }
      }
      const bwUser = localStorage.getItem("bw_user");
      if (bwUser) {
        const u = JSON.parse(bwUser);
        if (u.email === userEmail) {
          u.balance = balanceStr;
          localStorage.setItem("bw_user", JSON.stringify(u));
        }
      }
      window.dispatchEvent(new CustomEvent("balance_updated", { detail: {} }));
    } catch(e) { /* silent */ }
  };

  useEffect(() => {
    loadVouchers();
    window.addEventListener("bw_vouchers_updated", loadVouchers);
    const storageHandler = (e) => { if (e.key === "bw_admin_vouchers") loadVouchers(); };
    window.addEventListener("storage", storageHandler);

    const bwUser = localStorage.getItem("bw_user");
    const currentEmail = bwUser ? JSON.parse(bwUser).email : null;
    if (currentEmail) setUserEmail(currentEmail);

    const saved = localStorage.getItem("bw_transactions");
    let txs;
    if (saved) {
      const allTxs = JSON.parse(saved);
      txs = currentEmail
        ? allTxs.filter(tx => {
            if (tx.userEmail) return tx.userEmail === currentEmail;
            const mockEmail = getMockUserEmailByName(tx.name);
            return mockEmail === currentEmail;
          })
        : allTxs;
      setTxList(txs);
    } else {
      txs = mockTx;
      localStorage.setItem("bw_transactions", JSON.stringify(txs));
      const filteredTxs = currentEmail
        ? txs.filter(tx => {
            if (tx.userEmail) return tx.userEmail === currentEmail;
            const mockEmail = getMockUserEmailByName(tx.name);
            return mockEmail === currentEmail;
          })
        : txs;
      setTxList(filteredTxs);
    }

    if (currentEmail) syncBalanceToAdmin(txs, currentEmail);

    const bankKey = currentEmail ? `bw_linked_banks_${currentEmail}` : "bw_linked_banks";
    const savedBanks = localStorage.getItem(bankKey);
    if (savedBanks) {
      const parsedBanks = JSON.parse(savedBanks);
      setLinkedBanks(parsedBanks);
      if (parsedBanks.length > 0) {
        setSelectedBankId(parsedBanks[0].id);
      }
    }

    // Parse URL params for promo code & modal trigger using react-router-dom searchParams
    const promo = searchParams.get("promo");
    const modalParam = searchParams.get("modal");

    if (modalParam) {
      setModal(modalParam);
      if (promo) {
        const savedVouchers = (() => {
          try {
            const s = localStorage.getItem("bw_admin_vouchers");
            return s ? JSON.parse(s).filter(v => v.active !== false) : VOUCHERS_FALLBACK;
          } catch { return VOUCHERS_FALLBACK; }
        })();
        const v = savedVouchers.find(x => x.code.toUpperCase() === promo.toUpperCase());
        if (v) {
          setPromoCode(v.code);
          setAppliedVoucher(v);
          setTimeout(() => { showToast(`Tự động áp dụng ưu đãi: ${v.code}!`); }, 900);
        }
      }
      // Clear searchParams to prevent opening modal on refresh
      setSearchParams({}, { replace: true });
    }

    setTimeout(() => setLoading(false), 800);

    return () => {
      window.removeEventListener("bw_vouchers_updated", loadVouchers);
      window.removeEventListener("storage", storageHandler);
    };
  }, [searchParams]);

  const handleConfirmDeposit = () => {
    if (!depositForm.amount || Number(depositForm.amount) <= 0) return;
    
    const txId = "TX" + Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    const timeStr = date.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) + " " + date.toLocaleDateString("vi-VN");
    
    const bwUserRaw = localStorage.getItem("bw_user");
    const currentEmail = bwUserRaw ? JSON.parse(bwUserRaw).email : null;

    const newTx = {
      id: txId,
      type: "receive",
      name: "Nạp tiền vào ví",
      amount: Number(depositForm.amount),
      time: timeStr,
      status: "pending",
      note: depositForm.note || "Nạp tiền ví Blackred",
      userEmail: currentEmail
    };

    const updatedList = [newTx, ...txList];
    setTxList(updatedList);
    saveTx(updatedList);

    setActiveDepositTx(newTx);
    setStep(2);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const MAX_BANKS = 3;

  const handleLinkBank = () => {
    if (linkedBanks.length >= MAX_BANKS) {
      showToast(`Bạn chỉ được liên kết tối đa ${MAX_BANKS} ngân hàng!`, "error");
      return;
    }
    if (!bankForm.bank || !bankForm.account || !bankForm.owner) {
      showToast("Vui lòng nhập đầy đủ thông tin ngân hàng!", "error");
      return;
    }
    const newBank = {
      id: "BANK-" + Date.now(),
      bank: bankForm.bank,
      account: bankForm.account,
      owner: bankForm.owner
    };
    const updatedBanks = [...linkedBanks, newBank];
    setLinkedBanks(updatedBanks);
    const bankKey = userEmail ? `bw_linked_banks_${userEmail}` : "bw_linked_banks";
    localStorage.setItem(bankKey, JSON.stringify(updatedBanks));
    setSelectedBankId(newBank.id);
    setBankForm({ bank:"", account:"", owner:"" });
    showToast("Liên kết ngân hàng thành công!");
    closeModal();
  };

  const handleConfirmWithdraw = () => {
    if (!depositForm.amount || Number(depositForm.amount) <= 0) {
      showToast("Vui lòng nhập số tiền hợp lệ để rút!", "error");
      return;
    }
    if (Number(depositForm.amount) > balance) {
      showToast("Số dư không đủ để thực hiện giao dịch đó", "error");
      return;
    }
    if (!selectedBankId) {
      showToast("Vui lòng chọn tài khoản ngân hàng để rút tiền!", "error");
      return;
    }

    const selectedBank = linkedBanks.find(b => b.id === selectedBankId);
    if (!selectedBank) {
      showToast("Tài khoản ngân hàng không hợp lệ!", "error");
      return;
    }

    const txId = "TX" + Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    const timeStr = date.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) + " " + date.toLocaleDateString("vi-VN");

    const bwUserRaw2 = localStorage.getItem("bw_user");
    const currentEmail2 = bwUserRaw2 ? JSON.parse(bwUserRaw2).email : null;

    const newTx = {
      id: txId,
      type: "send",
      name: `Rút tiền về ${selectedBank.bank}`,
      amount: Number(depositForm.amount),
      time: timeStr,
      status: "pending",
      note: `Rút về TK ${selectedBank.account} - ${selectedBank.owner}`,
      userEmail: currentEmail2
    };

    const updatedList = [newTx, ...txList];
    setTxList(updatedList);
    saveTx(updatedList);
    showToast("Đã tạo yêu cầu rút tiền thành công!");
    closeModal();
  };

  const baseBalance = getUserBaseBalance(userEmail);
  const balance = Math.max(0, txList.reduce((acc, tx) => {
    if (tx.status !== "success") return acc;
    if (tx.type === "receive") return acc + tx.amount;
    if (tx.type === "send") return acc - tx.amount;
    return acc;
  }, baseBalance));

  const filtered = txList.filter(tx => {
    const matchTab = tab === "all" || tx.type === tab || (tab === "send" && tx.type === "send") || (tab === "receive" && tx.type === "receive");
    const matchSearch = !search || tx.name.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search);
    return matchTab && matchSearch;
  }).sort((a, b) => parseTxTime(b.time) - parseTxTime(a.time));

  const closeModal = () => { 
    setModal(null); 
    setStep(1); 
    setTxForm({ amount:"", target:"", note:"", category:"" }); 
    setDepositForm({ amount:"", note:"" }); 
    setActiveDepositTx(null);
    setTransferMethod("blackred");
    setBankTransferForm({ bank: "", account: "", ownerName: "" });
    setQrUploadFile(null);
    setQrUploadPreview(null);
    setPromoCode("");
    setAppliedVoucher(null);
    setShowPromoSelector(false);
  };

  const handleQrFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrUploadFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setQrUploadPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleConfirmTransfer = () => {
    if (!txForm.category) {
      showToast("Vui lòng chọn danh mục chuyển tiền!", "error");
      return;
    }
    if (transferMethod === "blackred") {
      if (!txForm.target) { showToast("Vui lòng nhập SĐT hoặc email người nhận!", "error"); return; }
      if (!txForm.amount || Number(txForm.amount) <= 0) { showToast("Vui lòng nhập số tiền hợp lệ!", "error"); return; }
      
      if (appliedVoucher && appliedVoucher.minAmount && Number(txForm.amount) < appliedVoucher.minAmount) {
        showToast(`Mã ưu đãi ${appliedVoucher.code} yêu cầu số tiền tối thiểu ${fmtCurrency(appliedVoucher.minAmount)}!`, "error");
        return;
      }
      
      const discount = appliedVoucher ? calculateDiscount(txForm.amount, appliedVoucher) : 0;
      const finalAmt = Math.max(0, Number(txForm.amount) - discount);
      if (finalAmt > balance) { showToast("Số dư không đủ để thực hiện giao dịch đó", "error"); return; }
    } else {
      if (!bankTransferForm.bank) { showToast("Vui lòng chọn ngân hàng người nhận!", "error"); return; }
      if (!bankTransferForm.account) { showToast("Vui lòng nhập số tài khoản người nhận!", "error"); return; }
      if (!txForm.amount || Number(txForm.amount) <= 0) { showToast("Vui lòng nhập số tiền hợp lệ!", "error"); return; }
      
      if (appliedVoucher && appliedVoucher.minAmount && Number(txForm.amount) < appliedVoucher.minAmount) {
        showToast(`Mã ưu đãi ${appliedVoucher.code} yêu cầu số tiền tối thiểu ${fmtCurrency(appliedVoucher.minAmount)}!`, "error");
        return;
      }
      
      const discount = appliedVoucher ? calculateDiscount(txForm.amount, appliedVoucher) : 0;
      const finalAmt = Math.max(0, Number(txForm.amount) - discount);
      if (finalAmt > balance) { showToast("Số dư không đủ để thực hiện giao dịch đó", "error"); return; }
    }

    const txId = "TX" + Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    const timeStr = date.toLocaleTimeString("vi-VN", {hour: "2-digit", minute:"2-digit"}) + " " + date.toLocaleDateString("vi-VN");

    const bwUserRaw3 = localStorage.getItem("bw_user");
    const currentEmail3 = bwUserRaw3 ? JSON.parse(bwUserRaw3).email : null;

    const discount = appliedVoucher ? calculateDiscount(txForm.amount, appliedVoucher) : 0;
    const finalAmount = Math.max(0, Number(txForm.amount) - discount);

    const newTx = {
      id: txId,
      type: "send",
      name: transferMethod === "blackred" ? `Chuyển tới ${txForm.target}` : `Chuyển tới ${bankTransferForm.bank}`,
      amount: finalAmount,
      time: timeStr,
      status: "pending",
      note: txForm.note || (transferMethod === "blackred" 
        ? `Chuyển ví Blackred tới ${txForm.target}${appliedVoucher ? ` (Áp dụng mã ${appliedVoucher.code} - Giảm ${fmtCurrency(discount)})` : ""}` 
        : `Chuyển khoản tới ${bankTransferForm.account} - ${bankTransferForm.bank}${appliedVoucher ? ` (Áp dụng mã ${appliedVoucher.code} - Giảm ${fmtCurrency(discount)})` : ""}`),
      userEmail: currentEmail3,
      category: txForm.category
    };

    const updatedList = [newTx, ...txList];
    setTxList(updatedList);
    saveTx(updatedList);
    showToast("Đã tạo lệnh chuyển tiền thành công!");
    closeModal();
  };

  const btnStyle = (color="#e11d48") => ({
    display:"flex", flexDirection:"column", alignItems:"center", gap:8,
    background:"transparent", border:"none", cursor:"pointer", padding:"12px 16px",
    borderRadius:12, transition:"all 0.2s"
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:1000 }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:-50 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-50 }}
            style={{
              position:"fixed", top:24, right:24, zIndex:300,
              background: toast.type === "success" ? "rgba(34,197,94,0.95)" : "rgba(239,68,68,0.95)",
              backdropFilter:"blur(10px)", color:"white",
              padding:"12px 24px", borderRadius:10, boxShadow:"0 10px 30px rgba(0,0,0,0.5)",
              display:"flex", alignItems:"center", gap:10, fontWeight:600, fontSize:14
            }}
          >
            {toast.type === "success" ? <Check size={18} /> : <X size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      
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
        style={{ background:"#111", border:"1px solid #1f1f1f", borderRadius:16, padding:20, display:"flex", alignItems:"center", justifyBetween:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"rgba(59,130,246,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Building2 size={18} style={{ color:"#3b82f6" }} />
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:600 }}>Liên kết ngân hàng</p>
            <p style={{ fontSize:12, color:"#52525b" }}>
              {linkedBanks.length}/3 tài khoản đã liên kết
            </p>
          </div>
        </div>
        <button
          onClick={() => linkedBanks.length < MAX_BANKS && setModal("bank")}
          disabled={linkedBanks.length >= MAX_BANKS}
          style={{
            display:"flex", alignItems:"center", gap:6,
            background: linkedBanks.length >= MAX_BANKS ? "rgba(63,63,70,0.3)" : "rgba(59,130,246,0.1)",
            border: `1px solid ${linkedBanks.length >= MAX_BANKS ? "rgba(63,63,70,0.3)" : "rgba(59,130,246,0.2)"}`,
            borderRadius:8, padding:"8px 14px",
            color: linkedBanks.length >= MAX_BANKS ? "#3f3f46" : "#3b82f6",
            cursor: linkedBanks.length >= MAX_BANKS ? "not-allowed" : "pointer",
            fontSize:13, fontWeight:600, transition:"all 0.2s"
          }}
        >
          {linkedBanks.length >= MAX_BANKS
            ? <><Check size={14} /> Đã đủ 3 ngân hàng</>
            : <><Plus size={14} /> Thêm ngân hàng</>}
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
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <p style={{ fontSize:13, fontWeight:600 }}>{tx.name}</p>
                    {tx.category && (
                      <span style={{ fontSize:9, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:4, padding:"0 4px", color:"#a1a1aa", fontWeight:500 }}>
                        {tx.category}
                      </span>
                    )}
                  </div>
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

              {/* DEPOSIT - STEP 1 */}
              {modal==="deposit" && step===1 && (
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>💳 Nạp tiền</h3>
                  <p style={{ color:"#52525b", fontSize:13, marginBottom:20 }}>
                    Nạp tiền vào ví Blackred
                  </p>
                  
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:8 }}>Số tiền (₫)</label>
                    <input value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount:e.target.value})} placeholder="0" type="number" style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"12px 16px", color:"white", fontSize:18, fontWeight:700, outline:"none" }} />
                    <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                      {[100000,200000,500000,1000000].map(v => (
                        <button key={v} onClick={() => setDepositForm({...depositForm, amount:String(v)})} style={{ fontSize:12, padding:"6px 12px", borderRadius:8, background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#a1a1aa", cursor:"pointer" }}>
                          +{fmtCurrency(v)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom:20 }}>
                    <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:8 }}>Ghi chú nạp tiền (Nội dung chuyển khoản)</label>
                    <input value={depositForm.note} onChange={e => setDepositForm({...depositForm, note:e.target.value})} placeholder="Nội dung nạp tiền" style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"12px 16px", color:"white", fontSize:14, outline:"none" }} />
                  </div>

                  <button onClick={handleConfirmDeposit} style={{ width:"100%", background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    Xác nhận nạp {depositForm.amount ? fmtCurrency(Number(depositForm.amount)) : ""}
                  </button>
                </div>
              )}

              {/* DEPOSIT - STEP 2 (QR CODE) */}
              {modal==="deposit" && step===2 && activeDepositTx && (
                <div style={{ textAlign:"center" }}>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>📱 Quét mã chuyển khoản</h3>
                  <p style={{ color:"#71717a", fontSize:13, marginBottom:20 }}>
                    Vui lòng quét mã QR bên dưới để thực hiện nạp tiền
                  </p>

                  <div style={{ display:"inline-block", background:"white", borderRadius:16, padding:16, marginBottom:20 }}>
                    <QRCode 
                      value={`blackred://deposit?amount=${activeDepositTx.amount}&note=${encodeURIComponent(activeDepositTx.note)}&txId=${activeDepositTx.id}`} 
                      size={180} 
                      level="H" 
                    />
                  </div>

                  <div style={{ background:"#161616", border:"1px solid #2a2a2a", borderRadius:12, padding:"14px 18px", marginBottom:20, textAlign:"left" }}>
                    {[
                      { label: "Số tiền", value: fmtCurrency(activeDepositTx.amount), color: "#22c55e" },
                      { label: "Nội dung ghi chú", value: activeDepositTx.note },
                      { label: "Mã giao dịch", value: activeDepositTx.id }
                    ].map(r => (
                      <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #222" }}>
                        <span style={{ fontSize:13, color:"#71717a" }}>{r.label}</span>
                        <span style={{ fontSize:13, fontWeight:600, color: r.color || "white" }}>{r.value}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={closeModal}
                    style={{ 
                      width: "100%", 
                      background: "linear-gradient(135deg, #22c55e, #15803d)", 
                      color: "white", 
                      border: "none", 
                      borderRadius: 10, 
                      padding: "13px", 
                      fontWeight: 700, 
                      fontSize: 14, 
                      cursor: "pointer" 
                    }}
                  >
                    Tôi đã chuyển tiền
                  </button>
                </div>
              )}

              {/* WITHDRAW */}
              {modal==="withdraw" && (
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>🏦 Rút tiền</h3>
                  <p style={{ color:"#52525b", fontSize:13, marginBottom:20 }}>
                    Rút tiền về tài khoản ngân hàng
                  </p>

                  {linkedBanks.length === 0 ? (
                    <div style={{
                      background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                      borderRadius: 12, padding: "18px 20px", marginBottom: 20, textAlign: "center"
                    }}>
                      <Building2 size={24} style={{ color: "#ef4444", marginBottom: 8, marginLeft: "auto", marginRight: "auto" }} />
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>Chưa có ngân hàng liên kết</h4>
                      <p style={{ fontSize: 12, color: "#71717a", marginBottom: 14, lineHeight: 1.5 }}>
                        Vui lòng liên kết tài khoản ngân hàng chính chủ của bạn để thực hiện rút tiền
                      </p>
                      <button
                        onClick={() => setModal("bank")}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                          borderRadius: 8, padding: "8px 16px", color: "#3b82f6",
                          fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        <Plus size={14} /> Liên kết ngân hàng ngay
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, color: "#a1a1aa", display: "block", marginBottom: 8 }}>Chọn tài khoản nhận tiền</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                          {linkedBanks.map(b => {
                            const isSelected = selectedBankId === b.id;
                            return (
                              <div
                                key={b.id}
                                onClick={() => setSelectedBankId(b.id)}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                                  background: isSelected ? "rgba(59,130,246,0.08)" : "#161616",
                                  border: `1px solid ${isSelected ? "#3b82f6" : "#2a2a2a"}`,
                                  transition: "all 0.2s"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Building2 size={15} style={{ color: "#3b82f6" }} />
                                  </div>
                                  <div style={{ textAlign: "left" }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{b.bank}</p>
                                    <p style={{ fontSize: 10, color: "#71717a" }}>{b.account.replace(/.(?=.{4})/g, "*")} • {b.owner}</p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Check size={9} color="white" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:8 }}>Số tiền muốn rút (₫)</label>
                        <input value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount:e.target.value})} placeholder="0" type="number" style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"12px 16px", color:"white", fontSize:18, fontWeight:700, outline:"none" }} />
                        <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                          {[100000,200000,500000,1000000].map(v => (
                            <button key={v} onClick={() => setDepositForm({...depositForm, amount:String(v)})} style={{ fontSize:12, padding:"6px 12px", borderRadius:8, background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#a1a1aa", cursor:"pointer" }}>
                              +{fmtCurrency(v)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button onClick={handleConfirmWithdraw} style={{ width:"100%", background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                        Xác nhận rút {depositForm.amount ? fmtCurrency(Number(depositForm.amount)) : ""}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* TRANSFER */}
              {modal==="transfer" && (
                <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: 2 }}>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>💸 Chuyển tiền</h3>
                  <p style={{ color:"#52525b", fontSize:13, marginBottom:20 }}>Chuyển tiền nhanh chóng và an toàn</p>

                  {/* Method Selector */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:10 }}>Phương thức chuyển tiền</label>
                    <div style={{ display:"flex", gap:10 }}>
                      {[
                        { id: "blackred", icon: Wallet, label: "Ví Blackred", desc: "Chuyển qua SĐT / Email", color: "#e11d48" },
                        { id: "bank",     icon: Building2, label: "Ngân hàng", desc: "Chuyển tới ngân hàng khác", color: "#3b82f6" },
                      ].map(m => {
                        const active = transferMethod === m.id;
                        return (
                          <button key={m.id} onClick={() => setTransferMethod(m.id)}
                            style={{
                              flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                              padding:"14px 10px", borderRadius:12, cursor:"pointer", transition:"all 0.2s",
                              background: active ? `${m.color}15` : "#161616",
                              border: `1.5px solid ${active ? m.color : "#2a2a2a"}`
                            }}
                          >
                            <div style={{ width:38, height:38, borderRadius:10, background: active ? `${m.color}25` : "#1f1f1f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <m.icon size={18} style={{ color: active ? m.color : "#52525b" }} />
                            </div>
                            <span style={{ fontSize:12, fontWeight:700, color: active ? m.color : "#71717a" }}>{m.label}</span>
                            <span style={{ fontSize:10, color:"#52525b", textAlign:"center" }}>{m.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ---- BLACKRED WALLET ---- */}
                  {transferMethod === "blackred" && (
                    <div>
                      <div style={{ background:"rgba(225,29,72,0.06)", border:"1px solid rgba(225,29,72,0.15)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                        <Smartphone size={14} style={{ color:"#e11d48", flexShrink:0 }} />
                        <p style={{ fontSize:12, color:"#a1a1aa", lineHeight:1.5 }}>Chuyển tiền trực tiếp tới tài khoản ví Blackred bằng số điện thoại hoặc email đăng ký.</p>
                      </div>
                      <div style={{ marginBottom:14 }}>
                        <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>SĐT / Email người nhận *</label>
                        <input value={txForm.target} onChange={e => setTxForm({...txForm, target:e.target.value})}
                          placeholder="Nhập số điện thoại hoặc email"
                          style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none" }} />
                      </div>
                    </div>
                  )}

                  {/* ---- BANK TRANSFER ---- */}
                  {transferMethod === "bank" && (
                    <div>
                      <div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                        <AlertCircle size={14} style={{ color:"#3b82f6", flexShrink:0 }} />
                        <p style={{ fontSize:12, color:"#a1a1aa", lineHeight:1.5 }}>Tải ảnh QR ngân hàng lên hoặc nhập thủ công số tài khoản và ngân hàng người nhận.</p>
                      </div>

                      {/* QR Upload */}
                      <div style={{ marginBottom:16 }}>
                        <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:8 }}>Tải ảnh mã QR ngân hàng (tuỳ chọn)</label>
                        <input ref={qrInputRef} type="file" accept="image/*" onChange={handleQrFileChange} style={{ display:"none" }} />
                        {qrUploadPreview ? (
                          <div style={{ position:"relative", display:"inline-block", width:"100%" }}>
                            <img src={qrUploadPreview} alt="QR preview"
                              style={{ width:"100%", maxHeight:180, objectFit:"contain", borderRadius:12, border:"1px solid #2a2a2a", background:"#161616" }} />
                            <button onClick={() => { setQrUploadFile(null); setQrUploadPreview(null); }}
                              style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.7)", border:"none", borderRadius:6, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                              <X size={14} />
                            </button>
                            <button onClick={() => qrInputRef.current?.click()}
                              style={{ marginTop:8, width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"7px", color:"#71717a", fontSize:12, cursor:"pointer" }}>
                              Đổi ảnh khác
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => qrInputRef.current?.click()}
                            style={{
                              width:"100%", background:"#161616", border:"2px dashed #2a2a2a",
                              borderRadius:12, padding:"22px 16px", display:"flex", flexDirection:"column",
                              alignItems:"center", gap:8, cursor:"pointer", transition:"all 0.2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor="#3b82f6"; e.currentTarget.style.background="rgba(59,130,246,0.05)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor="#2a2a2a"; e.currentTarget.style.background="#161616"; }}
                          >
                            <div style={{ width:44, height:44, borderRadius:12, background:"rgba(59,130,246,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Upload size={20} style={{ color:"#3b82f6" }} />
                            </div>
                            <span style={{ fontSize:13, fontWeight:600, color:"#71717a" }}>Nhấn để tải ảnh QR lên</span>
                            <span style={{ fontSize:11, color:"#3f3f46" }}>PNG, JPG, JPEG (tối đa 5MB)</span>
                          </button>
                        )}
                      </div>

                      {/* Divider */}
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                        <div style={{ flex:1, height:1, background:"#2a2a2a" }} />
                        <span style={{ fontSize:11, color:"#3f3f46", whiteSpace:"nowrap" }}>hoặc nhập thủ công</span>
                        <div style={{ flex:1, height:1, background:"#2a2a2a" }} />
                      </div>

                      {/* Bank selector */}
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>Ngân hàng người nhận *</label>
                        <select value={bankTransferForm.bank} onChange={e => setBankTransferForm({...bankTransferForm, bank:e.target.value})}
                          style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color: bankTransferForm.bank ? "white" : "#52525b", fontSize:14, outline:"none" }}>
                          <option value="">-- Chọn ngân hàng --</option>
                          {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>

                      {/* Account number */}
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>Số tài khoản người nhận *</label>
                        <input value={bankTransferForm.account} onChange={e => setBankTransferForm({...bankTransferForm, account:e.target.value})}
                          placeholder="Nhập số tài khoản"
                          style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none" }} />
                      </div>

                      {/* Owner name */}
                      <div style={{ marginBottom:4 }}>
                        <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>Tên chủ tài khoản (tuỳ chọn)</label>
                        <input value={bankTransferForm.ownerName} onChange={e => setBankTransferForm({...bankTransferForm, ownerName:e.target.value})}
                          placeholder="Họ và tên người nhận"
                          style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none" }} />
                      </div>
                    </div>
                  )}

                  {/* Category Selection */}
                  <div style={{ marginBottom: 16, textAlign: "left" }}>
                    <label style={{ fontSize: 13, color: "#a1a1aa", display: "block", marginBottom: 6 }}>Danh mục chuyển tiền *</label>
                    <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})}
                      style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "11px 14px", color: txForm.category ? "white" : "#52525b", fontSize: 14, outline: "none" }}>
                      <option value="">-- Chọn danh mục --</option>
                      <option value="Mua sắm">🛒 Mua sắm</option>
                      <option value="Ăn uống">🍔 Ăn uống</option>
                      <option value="Giải trí">🎬 Giải trí</option>
                      <option value="Di chuyển">🚗 Di chuyển</option>
                      <option value="Hóa đơn">🧾 Hóa đơn</option>
                      <option value="Khác">💡 Khác</option>
                    </select>
                  </div>

                  {/* Promo Code Selection */}
                  <div style={{ marginTop:16, marginBottom:16, border:"1px solid #2a2a2a", borderRadius:12, padding:14, background:"#161616", textAlign:"left" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                      <Gift size={16} style={{ color:"#3b82f6" }} />
                      <span style={{ fontSize:13, fontWeight:700, color:"white" }}>Mã ưu đãi & Quà tặng</span>
                    </div>
                    
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      <input 
                        value={promoCode} 
                        onChange={e => setPromoCode(e.target.value)} 
                        placeholder="Nhập mã ưu đãi (Ví dụ: CHUYENTIEN50)" 
                        style={{ flex:1, background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"8px 12px", color:"white", fontSize:12, outline:"none" }} 
                      />
                      <button 
                        onClick={handleApplyPromo}
                        style={{ background:"#3b82f6", color:"white", border:"none", borderRadius:8, padding:"0 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}
                      >
                        Áp dụng
                      </button>
                    </div>

                    <div style={{ display:"flex", justifyBetween:"space-between", alignItems:"center" }}>
                      <button 
                        onClick={() => setShowPromoSelector(true)}
                        style={{ background:"none", border:"none", color:"#3b82f6", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems: "center", gap: 4, padding: 0 }}
                      >
                        <Tag size={12} /> Chọn mã ưu đãi có sẵn
                      </button>
                      
                      {appliedVoucher && (
                        <button 
                          onClick={() => { setAppliedVoucher(null); setPromoCode(""); }}
                          style={{ background:"none", border:"none", color:"#ef4444", fontSize:11, cursor:"pointer" }}
                        >
                          Xoá mã
                        </button>
                      )}
                    </div>

                    {appliedVoucher && (() => {
                      const discount = calculateDiscount(txForm.amount, appliedVoucher);
                      return (
                        <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:8 }}>
                          <p style={{ fontSize:12, color:"#22c55e", fontWeight:700 }}>
                            ✓ Đã áp dụng: {appliedVoucher.code}
                          </p>
                          <p style={{ fontSize:11, color:"#a1a1aa", marginTop:2 }}>
                            {appliedVoucher.title}
                          </p>
                          {appliedVoucher.minAmount && (
                            <p style={{ fontSize:10, color:"#f59e0b", marginTop:2 }}>
                              * Giao dịch tối thiểu từ {fmtCurrency(appliedVoucher.minAmount)}
                            </p>
                          )}
                          {discount > 0 ? (
                            <p style={{ fontSize:12, color:"#22c55e", fontWeight:700, marginTop:4 }}>
                              Được giảm: -{fmtCurrency(discount)}
                            </p>
                          ) : (
                            <p style={{ fontSize:11, color:"#f59e0b", marginTop:4 }}>
                              Nhập số tiền chuyển hợp lệ để nhận ưu đãi!
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Common fields: Amount + Note */}
                  <div style={{ marginTop:16, marginBottom:14, textAlign:"left" }}>
                    <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>Số tiền (₫) *</label>
                    <input value={txForm.amount} onChange={e => setTxForm({...txForm, amount:e.target.value})}
                      placeholder="0" type="number"
                      style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"12px 16px", color:"white", fontSize:18, fontWeight:700, outline:"none" }} />
                    <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                      {[50000,100000,200000,500000].map(v => (
                        <button key={v} onClick={() => setTxForm({...txForm, amount:String(v)})}
                          style={{ fontSize:12, padding:"5px 10px", borderRadius:8, background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#a1a1aa", cursor:"pointer" }}>
                          +{fmtCurrency(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:20, textAlign:"left" }}>
                    <label style={{ fontSize:13, color:"#a1a1aa", display:"block", marginBottom:6 }}>Ghi chú (tuỳ chọn)</label>
                    <input value={txForm.note} onChange={e => setTxForm({...txForm, note:e.target.value})}
                      placeholder="Nội dung chuyển tiền"
                      style={{ width:"100%", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none" }} />
                  </div>

                  {/* Available balance display */}
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:"#161616", borderRadius:8, marginBottom:16 }}>
                    <span style={{ fontSize:12, color:"#71717a" }}>Số dư khả dụng</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#22c55e" }}>{fmtCurrency(balance)}</span>
                  </div>

                  {appliedVoucher ? (() => {
                    const discount = calculateDiscount(txForm.amount, appliedVoucher);
                    const finalAmt = Math.max(0, (Number(txForm.amount) || 0) - discount);
                    return (
                      <button onClick={handleConfirmTransfer}
                        style={{ width:"100%", background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                        💸 Xác nhận chuyển {fmtCurrency(finalAmt)} (Đã giảm)
                      </button>
                    );
                  })() : (
                    <button onClick={handleConfirmTransfer}
                      style={{ width:"100%", background:"linear-gradient(135deg,#e11d48,#9f1239)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                      💸 Xác nhận chuyển {txForm.amount ? fmtCurrency(Number(txForm.amount)) : "tiền"}
                    </button>
                  )}

                  {/* Voucher Picker Overlay Sheet */}
                  {showPromoSelector && (
                    <div style={{ position:"absolute", inset:0, background:"#111", borderRadius:20, padding:24, zIndex:210, display:"flex", flexDirection:"column" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                        <h4 style={{ fontSize:15, fontWeight:700, display:"flex", alignItems:"center", gap:6, color:"white" }}>
                          <Gift size={16} style={{ color:"#3b82f6" }} /> Chọn mã ưu đãi
                        </h4>
                        <button onClick={() => setShowPromoSelector(false)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#71717a" }}>
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:6 }}>
                        {["Tất cả", "Chuyển tiền", "Mua sắm", "Rút tiền", "Referral", "Nạp tiền", "Hóa đơn"].map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => setActivePromoTab(cat)} 
                            style={{
                              padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:500, whiteSpace:"nowrap",
                              background: activePromoTab===cat ? "rgba(59,130,246,0.15)" : "#1a1a1a",
                              border:`1px solid ${activePromoTab===cat ? "rgba(59,130,246,0.4)" : "#2a2a2a"}`,
                              color: activePromoTab===cat ? "#3b82f6" : "#71717a", cursor:"pointer"
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
                        {voucherList.filter(v => activePromoTab === "Tất cả" || v.tag === activePromoTab || v.type === activePromoTab).map(v => {
                          const isApplicable = !v.minAmount || (Number(txForm.amount) || 0) >= v.minAmount;
                          return (
                            <div 
                              key={v.id} 
                              onClick={() => isApplicable && handleSelectVoucher(v)}
                              style={{
                                padding:12, borderRadius:12, background:"#161616", border:"1px solid #2a2a2a",
                                cursor: isApplicable ? "pointer" : "not-allowed", opacity: isApplicable ? 1 : 0.6,
                                transition:"all 0.2s", textAlign:"left"
                              }}
                            >
                              <div style={{ display:"flex", justifyBetween:"space-between", alignItems:"start" }}>
                                <div style={{ textAlign:"left" }}>
                                  <span style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:`${tagColors[v.tag]}18`, color:tagColors[v.tag], fontWeight:600 }}>{v.tag}</span>
                                  <h5 style={{ fontSize:13, fontWeight:700, color:"white", marginTop:6 }}>{v.title}</h5>
                                  <p style={{ fontSize:11, color:"#71717a", marginTop:2 }}>{v.desc}</p>
                                  {v.minAmount && (
                                    <p style={{ fontSize:10, color:"#f59e0b", marginTop:2 }}>
                                      Min GD: {fmtCurrency(v.minAmount)}
                                    </p>
                                  )}
                                  <p style={{ fontSize:10, color:"#3f3f46", marginTop:4 }}>HSD: {v.exp}</p>
                                </div>
                                <div style={{ textAlign:"right" }}>
                                  <span style={{ fontSize:14, fontWeight:900, color:"#3b82f6" }}>{v.discount}</span>
                                  <div style={{ fontSize:10, fontWeight:700, color:"#52525b", marginTop:4 }}>Mã: {v.code}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                  <div style={{ display:"flex", alignItems:"center", justifyBetween:"space-between", marginBottom:20 }}>
                    <h3 style={{ fontSize:18, fontWeight:700 }}>🏦 Liên kết ngân hàng</h3>
                    <span style={{
                      fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:20,
                      background: linkedBanks.length >= MAX_BANKS ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
                      color: linkedBanks.length >= MAX_BANKS ? "#ef4444" : "#3b82f6",
                      border: `1px solid ${linkedBanks.length >= MAX_BANKS ? "rgba(239,68,68,0.25)" : "rgba(59,130,246,0.25)"}`
                    }}>
                      {linkedBanks.length}/{MAX_BANKS} ngân hàng
                    </span>
                  </div>

                  {linkedBanks.length >= MAX_BANKS ? (
                    <div style={{
                      background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)",
                      borderRadius:12, padding:"20px 16px", textAlign:"center"
                    }}>
                      <div style={{ fontSize:32, marginBottom:10 }}>🔒</div>
                      <p style={{ fontSize:14, fontWeight:700, color:"white", marginBottom:6 }}>
                        Đã đạt giới hạn liên kết
                      </p>
                      <p style={{ fontSize:13, color:"#71717a", lineHeight:1.6, marginBottom:16 }}>
                        Bạn đã liên kết tối đa <strong style={{ color:"#ef4444" }}>3 ngân hàng</strong>.<br/>
                        Vui lòng xoá bớt ngân hàng cũ trước khi thêm mới.
                      </p>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {linkedBanks.map(b => (
                          <div key={b.id} style={{
                            display:"flex", alignItems:"center", justifyBetween:"space-between",
                            background:"#161616", border:"1px solid #2a2a2a",
                            borderRadius:10, padding:"10px 14px"
                          }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <Building2 size={15} style={{ color:"#3b82f6" }} />
                              <div style={{ textAlign:"left" }}>
                                <p style={{ fontSize:12, fontWeight:700 }}>{b.bank}</p>
                                <p style={{ fontSize:11, color:"#71717a" }}>{b.account.replace(/.(?=.{4})/g,"*")} • {b.owner}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const updated = linkedBanks.filter(x => x.id !== b.id);
                                setLinkedBanks(updated);
                                const bankKey = userEmail ? `bw_linked_banks_${userEmail}` : "bw_linked_banks";
                                localStorage.setItem(bankKey, JSON.stringify(updated));
                                if (selectedBankId === b.id) setSelectedBankId(updated[0]?.id || "");
                                showToast("Đã xoá liên kết ngân hàng!");
                              }}
                              style={{
                                background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
                                borderRadius:6, padding:"4px 10px", color:"#ef4444",
                                fontSize:11, fontWeight:700, cursor:"pointer"
                              }}
                            >
                              Xoá
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom:16 }}>
                        <div style={{ display:"flex", justifyBetween:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:11, color:"#71717a" }}>Số ngân hàng đã liên kết</span>
                          <span style={{ fontSize:11, color:"#3b82f6", fontWeight:700 }}>{linkedBanks.length}/{MAX_BANKS}</span>
                        </div>
                        <div style={{ height:4, background:"#1f1f1f", borderRadius:4 }}>
                          <div style={{
                            height:"100%", borderRadius:4, transition:"width 0.4s",
                            width:`${(linkedBanks.length / MAX_BANKS) * 100}%`,
                            background: linkedBanks.length === 2 ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#3b82f6,#1d4ed8)"
                          }} />
                        </div>
                        {linkedBanks.length === 2 && (
                          <p style={{ fontSize:11, color:"#f59e0b", marginTop:6 }}>⚠️ Còn 1 slot cuối cùng!</p>
                        )}
                      </div>

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
                      <button onClick={handleLinkBank} style={{ width:"100%", background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", marginTop:8 }}>
                        Liên kết ngân hàng
                      </button>
                    </>
                  )}
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
                    ...(selectedTx.category ? [{ label:"Danh mục", value: selectedTx.category }] : []),
                    { label:selectedTx.type==="receive" ? "Người gửi" : "Người nhận", value:selectedTx.name },
                    { label:"Thời gian", value:selectedTx.time },
                    { label:"Ghi chú", value:selectedTx.note || "—" },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyBetween:"space-between", padding:"10px 0", borderBottom:"1px solid #1f1f1f" }}>
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
