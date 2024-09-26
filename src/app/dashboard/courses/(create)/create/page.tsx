import Link from "next/link";
import React from "react";

import BasicInformation from "../../../components/basic-info-form";

const CreateNewCourse = () => {
  return (
    <section className="w-full p-6">
      <h1 className="my-3 text-2xl font-bold">Create New Course</h1>

      <BasicInformation
        courseDescription=""
        courseId=""
        courseName=""
        courseSlug={undefined}
        isFree={false}
        update={false}
      />
    </section>
  );
};

export default CreateNewCourse;
