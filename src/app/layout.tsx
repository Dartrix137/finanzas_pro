import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FinanzasPro - Dashboard Financiero",
  description: "Dashboard financiero para gestionar proyectos, cartera y metas anuales. Powered by La Filial.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#004fff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isDark = cookieStore.get('dark_mode')?.value === 'true';

  return (
    <html lang="es" suppressHydrationWarning className={isDark ? 'dark' : ''}>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

