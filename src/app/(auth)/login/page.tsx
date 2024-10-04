import { Metadata } from "next";

import Login from "../_components/login";

export const metadata: Metadata = {
  title: "Log in",
};
const LoginPage = () => {
  return (
    <>
      <Login />
    </>
  );
};

export default LoginPage;
