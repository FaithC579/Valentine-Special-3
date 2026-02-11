import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, Dancing_Script, Lora } from 'next/font/google';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "A Special Package for Fey Fey",
  description: "...",
};

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing',
});

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${dancingScript.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
