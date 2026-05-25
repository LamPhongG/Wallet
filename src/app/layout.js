import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blackred Wallet - Ví Điện Tử Hiện Đại",
  description: "Quản lý tài chính thông minh với Blackred Wallet. Nạp, rút, chuyển tiền an toàn và nhanh chóng.",
  keywords: "ví điện tử, blackred wallet, chuyển tiền, thanh toán online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
