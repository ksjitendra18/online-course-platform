import React from "react";
import BasicInformation from "../../components/basic-info-form";

const CreateNewCourse = () => {
  return (
    <section className="p-6 w-full">
      <h1 className="text-2xl font-bold my-3">Create New Course</h1>

      <div className="flex my-5 gap-1 items-center justify-between">
        <a
          className="flex-1 py-3 rounded-l-md bg-blue-500 text-white w-full flex items-center justify-center"
          href="#"
        >
          Step 1: Basic Information
        </a>
        <a
          className="flex-1 py-3 bg-slate-300 w-full flex items-center justify-center"
          href="#"
        >
          Step 2: Course Modules
        </a>
        <a
          className="flex-1 py-3 rounded-r-md bg-slate-300 w-full flex items-center justify-center"
          href="#"
        >
          Step 3: Other Information
        </a>
      </div>

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
