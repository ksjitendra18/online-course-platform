import { Metadata } from "next";
import React from "react";

import VerifyEmailCode from "../../_components/verify-email-code";

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
