import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setVideos(data);
      })
      .catch((err) => {})
      .finally(() => setLoading(false));
  }, []);

  const videosView = Object.keys(videos)
    .map((id) => ({
      id,
      ...videos[id],
    }))
    .map((video) => (
      <Link key={video.id} href={`/video/${video.id}`}>
        <a>
          <div className="shadow rounded-2xl bg-white dark:bg-gray-700 dark:text-gray-300 transition duration-300 ease-in-out transform hover:scale-105">
            <div className="relative">
              <img
                src={`/api/video/${video.id}/thumbnail`}
                className="w-full rounded-t-2xl"
              />
              <p className="absolute right-2 bottom-2 rounded-3xl text-sm bg-gray-700 text-white dark:bg-gray-500 dark:text-gray-200 px-3 py-1">
                {video.duration}
              </p>
            </div>
            <div className="px-5 py-6 sm:px-6">
              <p className="text-xl font-bold mb-1">{video.title}</p>
              <p className="mb-2">
                {video.uploader} ·{" "}
                {!!video.uploadDate &&
                  new Date(
                    video.uploadDate.substring(0, 4),
                    video.uploadDate.substring(4, 6),
                    video.uploadDate.substring(6, 8)
                  ).toLocaleDateString()}
              </p>

              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {video.description.length > 203
                  ? video.description.substring(0, 200) + "..."
                  : video.description}
              </p>

              {video.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-3xl bg-gray-700 text-white dark:bg-gray-500 dark:text-gray-200 px-3 py-2 mr-2"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </a>
      </Link>
    ));

  return (
    <>
      <Head>
        <title>Library | MiTube</title>
      </Head>
      <div className="bg-gray-800 pb-32">
        <header className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">MiTube</h1>
          </div>
        </header>
      </div>

      <main className="-mt-32">
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {videosView}
          </div>
        </div>

        <div className="">
          <Link href="/download">
            <a className="rounded-full p-3 bg-gray-700 text-white fixed right-4 bottom-4 shadow">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </a>
          </Link>
        </div>
      </main>
    </>
  );
}
