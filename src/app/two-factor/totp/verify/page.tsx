import React from "react";

import VerifyTotpForm from "../_components/verify-totp";

export const metadata = {
  title: "Verify Two Factor ",
};
const VerifyTotp = () => {
  return (
    <div>
      <VerifyTotpForm />
    </div>
  );
};

export default VerifyTotp;
