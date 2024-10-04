import { Metadata } from "next";

import Signup from "../_components/signup";

export const metadata: Metadata = {
  title: "Sign up",
};
const SignupPage = () => {
  return <Signup />;
};

export default SignupPage;
