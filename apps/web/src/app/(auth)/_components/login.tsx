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
  const [oauthLoading, setOauthLoading] = useState(false);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  // const [loading, setLoading] = useState(false);

  const isLoading = oauthLoading || credentialsLoading || magicLinkLoading;
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const handleLinkClick = () => {
    if (isLoading) {
      toast.error(
        "Login already in progress.You can't perform this function right now."
      );
    } else {
      setOauthLoading(true);
    }
  };

  const handleMagicLinkLogin = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setMagicLinkLoading(true);
      setError("");
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email");

      const validEmail = EmailSchema.safeParse(email);

      if (!validEmail.success) {
        setError("Invalid email");
        toast.error("Invalid email");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
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
      setMagicLinkLoading(false);
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
          disabled={isLoading}
          className="mt-5 w-full py-6"
        >
          <Link
            href={isLoading ? "#" : "/api/auth/google"}
            onClick={() => {
              handleLinkClick();
            }}
          >
            <span className="mr-2">
              {oauthLoading ? (
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
            <TabsTrigger disabled={isLoading} value="password">
              Password
            </TabsTrigger>
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
                  disabled={isLoading}
                  variant="app"
                  className="w-full"
                  type="submit"
                >
                  {magicLinkLoading ? (
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

              {error && (
                <p className="rounded-md bg-red-600 px-2 py-1 text-white">
                  {error}
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="password">
            <LoginForm
              loading={credentialsLoading}
              setLoading={setCredentialsLoading}
            />
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
