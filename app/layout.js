import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Mini POS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <header>
          <h1>Mini POS</h1>
          <nav>
            <Link href="/">หน้าแรก</Link>
            <Link href="/sell">ขายสินค้า</Link>
            <Link href="/history">ประวัติการขาย</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
