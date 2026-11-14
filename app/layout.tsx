import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Muhammad Hateem Hussain — Software Engineer & Co-Founder, CodeBettle",
  description:
    "Muhammad Hateem Hussain — Software Engineer, Co-Founder & COO of CodeBettle, Python Trainer (1,500+ students), B.Sc. Software Engineering UAF, CGPA 3.21. Building products, not assignments.",
  metadataBase: new URL("https://github.com/Hateem-Hussain-01"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${geist.variable} ${jetbrainsMono.variable} bg-midnight-deep text-cream antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
