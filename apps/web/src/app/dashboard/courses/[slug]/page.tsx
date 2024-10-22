import { redirect } from "next/navigation";

const CourseSlugPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  return redirect(`/dashboard/courses/${params.slug}/basic`);
  return null;
};

export default CourseSlugPage;
