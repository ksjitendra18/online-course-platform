import { db } from "@/db";
import { user } from "@/db/schema";
import { create2FASession, createLoginLog, createSession } from "@/lib/auth";
import redis from "@/lib/redis";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import VerifyMagicLink from "../../_components/verify-magic-link";

const MagicLinkVerification = async ({
  params,
}: {
  params: { id: string };
}) => {
  return <VerifyMagicLink id={params.id} />;
};

export default MagicLinkVerification;
