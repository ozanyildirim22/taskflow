import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider, BoardProvider } from "./context";
import DnDPolyfill from "./components/DnDPolyfill";

export const metadata: Metadata = {
  title: "TaskFlow — Kanban Project Management",
  description: "A powerful Kanban board for managing your projects and tasks with drag-and-drop simplicity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <DnDPolyfill />
        <AuthProvider>
          <BoardProvider>
            {children}
          </BoardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
