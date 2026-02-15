import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARCADE ARENA — Đấu Trường E-Sports',
  description: 'Đánh giá, phân tích và chấm điểm tuyển thủ E-sports hàng đầu Việt Nam.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
