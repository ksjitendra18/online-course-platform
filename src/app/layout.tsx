import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/navbar";
import getUserSession from "@/actions/getUserSession";
import { cookies } from "next/headers";
import { getUserSessionRedis } from "@/actions/getUserSessionRedis";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TheCoursePlatform",
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
        <NextTopLoader color="#1d4ed8" />
        <Toaster />
        <Navbar currentUser={userSession} />
        <main>{children}</main>
      </body>
    </html>
  );
}
