// layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RootProvider from '@/providers/RootProvider'
import "./globals.css";
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ComuniDAO",
  description: "La plataforma descentralizada para la gobernanza y mejora de tu barrio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
     <html lang="es" suppressHydrationWarning>
       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
         <RootProvider>
           {children}
         </RootProvider>
         <Toaster />
       </body>
     </html>
   );
 }
