import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/app/app/register-sw";
import ToastContainer from "@/app/components/Toast";
import PageTransition from "@/app/components/PageTransition";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { UserProvider } from "@/app/context/UserContext";
import { CycleProvider } from "@/app/context/CycleContext";
import OfflineIndicator from "@/app/components/OfflineIndicator";
import QuickPeriodTracker from "@/app/components/QuickPeriodTracker";
import TopBar from "@/app/components/TopBar";
import DesktopLayout from "@/app/components/DesktopLayout";

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
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-200..200" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <UserProvider>
            <CycleProvider>
              <OfflineIndicator />
              <QuickPeriodTracker />
              <TopBar />
              <DesktopLayout>
                <PageTransition>
                  {children}
                </PageTransition>
              </DesktopLayout>
              <ToastContainer />
              <RegisterSW />
            </CycleProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
