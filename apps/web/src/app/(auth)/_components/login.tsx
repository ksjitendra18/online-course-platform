"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import EmailSchema from "@/validations/email";

import LoginForm from "./login-form";

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
    <div className="mx-auto my-10 mt-14 flex max-w-lg flex-col items-center justify-center rounded-md border-2 bg-white px-8">
      <h1 className="my-4 text-3xl font-bold">Log in</h1>
      <div className="flex w-full flex-col items-center justify-center">
        <Button
          asChild
          onClick={() => {
            handleLinkClick();
          }}
          variant="outline"
          disabled={loading}
          className="mt-5 w-full py-6"
        >
          <Link
            href={loading ? "#" : "/api/auth/google"}
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

        <div className="mb-3 mt-5 flex w-full items-center justify-center px-2">
          <div className="before-or mr-2 h-[2px] w-[100%] bg-gray-300"></div>
          <p className="or text-gray-500">OR</p>
          <div className="after-or ml-2 h-[2px] w-[100%] bg-gray-300"></div>
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
                    "mt-4 w-full rounded-md border-2 px-3 py-2"
                  )}
                />
                <Button
                  disabled={loading}
                  variant="app"
                  className="w-full"
                  type="submit"
                >
                  {loading ? (
                    <Loader2 className="mx-auto animate-spin" />
                  ) : (
                    "Send Magic Link"
                  )}
                </Button>
              </form>
              {success && (
                <p className="rounded-md bg-green-700 px-2 py-1 text-white">
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
      <p className="my-5 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-700">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
