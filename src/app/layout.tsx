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

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSession = await getUserSessionRedis();

  console.log("layout mounting", userSession);
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader color="#1d4ed8" />
        <Toaster />

        <Navbar currentUser={userSession} />
        {/* {userSession?.userId ? (
          <>
          <Navbar currentUser={userSession} />
          </>
        ) : (
          <>
            <Navbar currentUser={userSession} />
          </>
        )} */}
        {/* <p>Name:{userSession?.name}</p> */}
        <main>{children}</main>
      </body>
    </html>
  );
}
