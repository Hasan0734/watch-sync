import {
  API_URL,
  getOrCreateClientId,
  getOrCreateSessionId,
  getOrGenerateName,
} from "#/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();
  const handleNewRoom = async () => {
    try {
      const res = await fetch(`${API_URL}/create-room`);
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      getOrGenerateName();
      getOrCreateClientId();
      getOrCreateSessionId();
      await navigate({ to: `/watch/${data.roomId}` });
      return data;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getOrCreateClientId();
    getOrCreateSessionId();
  }, []);

  return (
    <main className="">
      <div className="relative min-h-[85vh] w-full bg-background text-white overflow-hidden flex items-center">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-125 h-125 bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-background border border-slate-800 rounded-full px-4 py-1.5 text-sm text-red-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Real-Time Video Synchronization
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
              <span className=" bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Watch Together</span>, <br />
              <span className="text-red-600">Perfect Sync.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Stream your favorite YouTube videos with friends globally. Zero
              lag, instant text chat, and synchronized playback controls. One
              pauses, everyone pauses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleNewRoom}
                className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
              >
                <svg
                  xmlns="http://w3.org"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white group-hover:scale-110 transition-transform"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Room
              </button>

              <button className="w-full sm:w-auto px-8 py-4 bg-primary dark:bg-card  border border-slate-800 hover:bg-slate-800/80 font-semibold rounded-xl text-slate-300 transition-colors">
                How it works
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-800" />
                  <span className="w-3 h-3 rounded-full bg-slate-800" />
                  <span className="w-3 h-3 rounded-full bg-slate-800" />
                </div>
                <div className="bg-slate-950 px-3 py-1 rounded-md text-xs text-slate-500 font-mono select-none">
                  sync-party.tv/room/x9f2_v
                </div>
                <div className="w-4" />
              </div>

              <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden group border border-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-tr from-slate-900 via-purple-950/20 to-red-950/20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-600/30 blur-xl animate-pulse" />
                </div>

                <div className="relative z-10 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40">
                  <svg
                    xmlns="http://w3.org"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white ml-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black via-black/80 to-transparent flex items-center justify-between text-xs text-slate-400">
                  <div className="gap-3 w-full space-y-1">
                    <div className="text-red-500 font-bold block">LIVE</div>
                    <div className="flex items-center gap-3">
                      <div className="relative  h-1.5 bg-slate-700 w-full rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 bg-red-600  w-2/3" />
                        <div className="absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="w-10">
                        <span className="font-mono text-[10px]">14:22</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 bg-slate-950/60 border border-emerald-500/20 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Alex
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />{" "}
                    In Sync
                  </div>
                </div>
                <div className="p-2 bg-slate-950/60 border border-emerald-500/20 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Sarah
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />{" "}
                    In Sync
                  </div>
                </div>
                <div className="p-2 bg-slate-950/60 border border-indigo-500/30 bg-indigo-950/10 rounded-lg relative overflow-hidden">
                  <div className="text-[11px] text-indigo-300 font-medium">
                    You
                  </div>
                  <div className="text-xs text-indigo-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />{" "}
                    Host
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
