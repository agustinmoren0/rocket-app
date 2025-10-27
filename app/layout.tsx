import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RegisterSW from "./register-sw";
import ToastContainer from "./components/Toast";
import PageTransition from "./components/PageTransition";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import OfflineIndicator from "./components/OfflineIndicator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HABIKA - Tu progreso real",
  description: "Visualizá tu progreso sin tareas, sin culpa",
  manifest: "/manifest.json",
  themeColor: "#8b5cf6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HABIKA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <UserProvider>
            <OfflineIndicator />
            <PageTransition>
              {children}
            </PageTransition>
            <ToastContainer />
            <RegisterSW />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
