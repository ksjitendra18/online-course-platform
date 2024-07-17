import React from "react";
import BasicInformation from "../../../components/basic-info-form";
import Link from "next/link";

const CreateNewCourse = () => {
  return (
    <section className="p-6 w-full">
      <h1 className="text-2xl font-bold my-3">Create New Course</h1>

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
