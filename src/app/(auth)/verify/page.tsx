import { Metadata } from "next";
import React from "react";
import VerifyEmailForm from "../_components/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
};

const Verify = () => {
  return (
    <>
      <VerifyEmailForm />
    </>
  );
};

export default Verify;
