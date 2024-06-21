import { redirect } from "next/navigation";

const CourseSlugPage = ({ params }: { params: { slug: string } }) => {
  return redirect(`/dashboard/courses/${params.slug}/basic`);
  return null;
};

export default CourseSlugPage;
