import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Login from "@/components/login";
import Chart from "@/components/chart";
import Logout from "@/components/logout";

export default async function Home() {
  const session = await getServerSession(authOptions);
  // console.log(session);
  return (
    <>
      <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#141521]">
        {session?.user ? (
          <div className="flex h-full w-full flex-col items-center justify-center py-10">
            <div className="flex py-6 text-center text-2xl text-zinc-300">
              Welcome{" "}
              <p className="ml-1 text-yellow-400">{session.user.name}</p>
              <p className="ml-2 flex items-center justify-center rounded-xl bg-red-500 px-2 py-1 text-sm text-white">
                <Logout />
              </p>
            </div>
            <Chart />
          </div>
        ) : (
          <div className="text-4xl text-zinc-300">
            Please <Login /> to continue
          </div>
        )}
      </section>
    </>
  );
}
