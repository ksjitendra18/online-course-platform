import Link from "next/link";

export default function Home() {
  return (
    <main className="h-full">
      <section
        style={{ height: "calc(100vh - 65px)" }}
        className="relative bg-black"
      >
        <video muted autoPlay loop className="h-full w-full object-cover">
          <source
            src="https://course-img-jsx.b-cdn.net/videos/2023-10-29%2021-37-32.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute left-0 top-0 z-10 h-full w-full bg-black/50" />
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 text-white">
          <h2 className="text-center text-6xl font-bold">
            Learn Valueable skills
          </h2>
          <div className="flex h-full w-full items-center justify-center">
            <Link
              href="/courses"
              className="my-5 rounded-full bg-blue-700 px-12 py-3 text-xl hover:bg-blue-600"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
