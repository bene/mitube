import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const { password } = data;

    console.log(password);

    router.push("/");
  };

  return (
    <>
      <Head>
        <title>Login | MiTube</title>
      </Head>
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <form onSubmit={onSubmit} className="w-full max-w-3xl px-4">
          <div className="text-center">
            <p className="text-4xl sm:text-8xl font-bold mb-12">
              Enter password.
            </p>
            <input
              name="password"
              type="password"
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="text-center text-3xl sm:text-6xl w-full px-9 py-6 border-2 border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
              required
            />
          </div>
        </form>
      </div>
    </>
  );
}
