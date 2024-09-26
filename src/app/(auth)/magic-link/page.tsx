import React from "react";

import MagicLinkForm from "../_components/magic-link-form";

const MagicLinkPage = () => {
  return (
    <div className="mx-auto my-10 mt-14 flex max-w-lg flex-col items-center justify-center rounded-md border-2 bg-white px-8">
      <h1 className="my-4 text-3xl font-bold">Log in</h1>

      <MagicLinkForm />
    </div>
  );
};

export default MagicLinkPage;
