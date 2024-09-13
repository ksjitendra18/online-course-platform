"use client";

import { FormEvent, FormEventHandler, useState } from "react";

import Link from "next/link";

import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import LoginForm from "./login-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import EmailSchema from "@/validations/email";
import { useRouter } from "next/navigation";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const handleLinkClick = () => {
    if (loading) {
      toast.error(
        "Login already in progress.You can't perform this function right now."
      );
    } else {
      setLoading(true);
    }
  };

  const router = useRouter();
  const handleMagicLinkLogin = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email");

      const validEmail = EmailSchema.safeParse(email);

      if (!validEmail.success) {
        setError("Invalid email");
        toast.error("Invalid email");
        return;
      }
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({ email: email }),
      });

      const resData = await res.json();

      if (res.status === 200) {
        setSuccess(true);
      } else {
        setError(resData.error.message);
        toast.error(resData.error.message);
      }
    } catch (error) {
      setError("Error while login. Please try again later");
      toast.error("Error while login. Please try again later");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex mt-14 bg-white max-w-lg mx-auto my-10  px-8 border-2 rounded-md items-center justify-center flex-col">
      <h1 className="text-3xl font-bold my-4">Log in</h1>
      <div className="flex w-full flex-col items-center justify-center">
        <Button
          asChild
          onClick={() => {
            handleLinkClick();
          }}
          variant="outline"
          disabled={loading}
          className="w-full  mt-5 py-6"
        >
          <Link
            href={loading ? `#` : "/api/auth/google"}
            onClick={() => {
              handleLinkClick();
            }}
          >
            <span className="mr-2">
              {loading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <FcGoogle className="size-6" />
              )}
            </span>
            Log in with Google
          </Link>
        </Button>

        <div className="mt-5 mb-3 w-full px-2 flex items-center justify-center">
          <div className="before-or w-[100%] h-[2px] bg-gray-300 mr-2"></div>
          <p className="text-gray-500 or">OR</p>
          <div className="after-or w-[100%] h-[2px] bg-gray-300 ml-2"></div>
        </div>
        <Tabs defaultValue="magic-link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="magic-link">
            <div className="space-y-4">
              <form onSubmit={handleMagicLinkLogin} className="space-y-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  required
                  className={cn(
                    error ? "border-red-600" : "border-slate-600",
                    "px-3 w-full mt-4 py-2 rounded-md border-2"
                  )}
                />
                <Button
                  disabled={loading}
                  variant="app"
                  className="w-full"
                  type="submit"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Send Magic Link"
                  )}
                </Button>
              </form>
              {success && (
                <p className="bg-green-700 text-white px-2 py-1 rounded-md">
                  Magic Link Sent
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="password">
            <LoginForm loading={loading} setLoading={setLoading} />
          </TabsContent>
        </Tabs>
      </div>
      <p className="text-center my-5">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-700">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
