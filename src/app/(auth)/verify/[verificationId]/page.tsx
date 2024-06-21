import React from "react";
import VerifyEmailCode from "../../_components/verify-email-code";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
};

const EmailVerification = ({
  params,
}: {
  params: { verificationId: string };
}) => {
  return <VerifyEmailCode verificationId={params.verificationId} />;
};

export default EmailVerification;
