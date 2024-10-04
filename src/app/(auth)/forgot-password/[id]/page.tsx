import { Metadata } from "next";

import SetNewPassword from "../../_components/set-new-password";

export const metadata: Metadata = {
  title: "Verify Email",
};

const ResetPass = ({ params }: { params: { id: string } }) => {
  return <SetNewPassword id={params.id} />;
};

export default ResetPass;
