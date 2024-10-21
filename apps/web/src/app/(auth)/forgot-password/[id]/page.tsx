import { Metadata } from "next";

import SetNewPassword from "../../_components/set-new-password";

export const metadata: Metadata = {
  title: "Verify Email",
};

const ResetPass = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  return <SetNewPassword id={params.id} />;
};

export default ResetPass;
