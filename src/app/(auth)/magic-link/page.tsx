import React from "react";
import MagicLinkForm from "../_components/magic-link-form";

const MagicLinkPage = () => {
  return (
    <div className="flex mt-14 bg-white max-w-lg mx-auto my-10  px-8 border-2 rounded-md items-center justify-center flex-col">
      <h1 className="text-3xl font-bold my-4">Log in</h1>

      <MagicLinkForm />
    </div>
  );
};

export default MagicLinkPage;
