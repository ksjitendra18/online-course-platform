import { Metadata } from "next";
import React from "react";
import ForgotPasswordForm from "../_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

const ForgotPassword = () => {
  return (
    <>
      <ForgotPasswordForm />
    </>
  );
};

export default ForgotPassword;
