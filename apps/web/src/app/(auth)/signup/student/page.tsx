import { Metadata } from "next";

import StudentSignup from "../../_components/student-signup";

export const metadata: Metadata = {
  title: "Student Signup",
};

const StudentSignupPage = () => {
  return <StudentSignup />;
};

export default StudentSignupPage;
