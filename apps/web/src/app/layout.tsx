import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "react-hot-toast";

import Navbar from "@/components/navbar";
import ToasterTopLoader from "@/components/toaster-toploader";
import { getUserSessionRedis } from "@/db/queries/auth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learning Platform",
  description: "Cloud Native Way of course platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSession = await getUserSessionRedis();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        <ToasterTopLoader />
        <Navbar currentUser={userSession} />

        {/* <main className="h-full w-full">{children}</main> */}
        <main>{children}</main>
      </body>
    </html>
  );
}
