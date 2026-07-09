import {
  getOrCreateClientId,
  getOrCreateSessionId,
  getOrGenerateName,
} from "#/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();
  const handleNewRoom = async () => {
    try {
      const res = await fetch(`http://localhost:3001/create-room`);
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      getOrGenerateName();
      getOrCreateClientId();
      getOrCreateSessionId();
      await navigate({ to: `/watch/${data.id}` });
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
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="flex items-center justify-center h-120">
        <button
          onClick={handleNewRoom}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
        >
          <Plus size={16} /> New Room
        </button>
      </div>
    </main>
  );
}
