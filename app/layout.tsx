import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartTeammates by Skyline",
  description: "Configurable AI teammate mod simulator with adaptive combat behaviours."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
