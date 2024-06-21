import { Metadata } from "next";
import OrganizationSignup from "../../_components/organization-signup";

export const metadata: Metadata = {
  title: "Organization Signup",
};

const OrganizationSignupPage = () => {
  return <OrganizationSignup />;
};

export default OrganizationSignupPage;
