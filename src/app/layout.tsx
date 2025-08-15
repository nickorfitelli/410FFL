import './globals.css';
import NavBar from '@/components/NavBar'; // ✅ this must match your file path
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar /> {/* ✅ Make sure this is here */}
        <main className="p-0">{children}</main>
      </body>
    </html>
  );
}