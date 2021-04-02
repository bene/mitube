import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { videoId } = router.query;

  const [video, setVideo] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!!videoId) {
      fetch(`/api/video/${videoId}`)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setVideo(data);
        })
        .catch((err) => {})
        .finally(() => setLoading(false));
    }
  }, [videoId]);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <>
      <Head>
        <title>{video.title} | MiTube</title>
      </Head>
      <div className="bg-gray-800 pb-96">
        <header className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white flex flex-row justify-between items-center">
              {video.title}
              <Link href="/">
                <a className="rounded-full p-2 bg-gray-500">
                  <svg
                    className="h-8 w-8"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </a>
              </Link>
            </h1>
          </div>
        </header>
      </div>

      <main className="-mt-96">
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="shadow rounded-2xl bg-white dark:bg-gray-700 dark:text-gray-300">
              <video
                controls
                className="w-full rounded-t-2xl"
                poster={`/data/thumbnails/${video.id}.${video.thumbnailType}`}
              >
                <source
                  src={`/data/videos/${videoId}.${video.videoType}`}
                  type="video/mp4"
                />
              </video>
              <div className="px-5 py-6 sm:px-6">
                <p className="text-2xl font-bold mb-2">{video.title}</p>

                {video.description &&
                  video.description.split("\n").map((p) => (
                    <p
                      key={Math.random()}
                      className="text-lg text-gray-500 dark:text-gray-400"
                    >
                      {p}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
