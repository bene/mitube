import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

import { DownloadStatus, UpdateMetaData } from "../logic/types";
import { io } from "socket.io-client";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/updates`).finally(() => {
      const socket = io();

      socket.on(UpdateMetaData, (payload) => {
        setVideos((prev) => {
          const idx = prev.findIndex((v) => v.id === payload.id);

          return idx === -1
            ? [...prev, payload]
            : [
                ...prev.slice(0, idx),
                {
                  ...prev[idx],
                  ...payload,
                },
                ...prev.slice(idx + 1),
              ];
        });
      });
    });
  }, [setVideos]);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setVideos(
          Object.keys(data).map((id) => ({
            id,
            ...data[id],
          }))
        );
      })
      .catch((err) => {})
      .finally(() => setLoading(false));
  }, []);

  const videosView = videos.map((video) => (
    <Link key={video.id} href={`/video/${video.id}`}>
      <a>
        <div className="shadow rounded-2xl bg-white dark:bg-gray-700 dark:text-gray-300 transition duration-300 ease-in-out transform hover:scale-105">
          <div className="relative overflow-hidden rounded-t-2xl">
            <img
              src={`/api/video/${video.id}/thumbnail`}
              className={`w-full rounded-t-2xl${
                video.DownloadStatus !== DownloadStatus.Complete &&
                " filter-blur transform scale-105"
              }`}
            />
            <p className="absolute right-2 bottom-2 rounded-3xl text-sm bg-gray-700 text-white dark:bg-gray-500 dark:text-gray-200 px-3 py-1">
              {video.duration}
            </p>
            {video.DownloadStatus === DownloadStatus.Downloading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <svg
                  className="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>
          {video.DownloadStatus === DownloadStatus.Downloading &&
            !!video.progress && (
              <div className="w-full h-2 bg-white">
                <div
                  className={`w-${Math.ceil(
                    (video.progress / 100) * 12
                  )}/12 h-full bg-red-500 transition-all duration-150 ease-linear`}
                />
              </div>
            )}
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
      <span className="w-1/12 w-2/12 w-3/12 w-4/12 w-5/12 w-6/12 w-7/12 w-8/12 w-9/12 w-10/12 w-11/12 w-12/12" />
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
