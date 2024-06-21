import Link from "next/link";

export default function Home() {
  return (
    <main className="h-full">
      <section
        style={{ height: "calc(100vh - 80px)" }}
        className=" relative  bg-black"
      >
        <video muted autoPlay loop className="h-full w-full object-cover ">
          <source
            src="https://course-img-jsx.b-cdn.net/videos/2023-10-29%2021-37-32.mp4"
            type="video/mp4"
          />
        </video>
        <div className="h-full w-full z-10 bg-black/50 absolute top-0 left-0 " />
        <div className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-white z-50">
          <h2 className="text-6xl text-center font-bold">
            Learn Valueable skills
          </h2>
          <div className="flex items-center justify-center w-full h-full">
            <Link
              href="/courses"
              className="px-12 my-5 hover:bg-blue-600 bg-blue-700 py-3 text-xl rounded-full"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
