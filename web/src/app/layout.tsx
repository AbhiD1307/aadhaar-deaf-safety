import type { Metadata } from "next";
import "./globals.css";
import { AlertProvider } from "@/lib/AlertContext";
import Sidebar from "@/components/Sidebar";
import EmergencyBanner from "@/components/EmergencyBanner";

export const metadata: Metadata = {
  title: "Aadhar — Emergency Awareness System",
  description: "AI-powered real-time emergency alerts for 430 million deaf and hard-of-hearing people. Built by Abhishek Deshmukh · UW Hackathon Winner.",
  authors: [{ name: "Abhishek Deshmukh", url: "mailto:deshmukh.abhishek152@gmail.com" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex overflow-hidden" style={{ background: "var(--bg)" }}>
        <AlertProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto flex flex-col">
            <EmergencyBanner />
            {children}
          </main>
        </AlertProvider>
      </body>
    </html>
  );
}
