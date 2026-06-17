import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { Link } from "react-router-dom";

export default function SimulacaoPartida() {
  const { teamName } = useGameStore();
  const [matchTime, setMatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [events, setEvents] = useState<
    { time: number; text: string; type: "info" | "goal" | "card" }[]
  >([]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && matchTime < 90) {
      interval = window.setInterval(() => {
        setMatchTime((prev) => {
          const newTime = prev + 1;

          // Random event generator for demo
          if (Math.random() < 0.05) {
            const isGoal = Math.random() < 0.3;
            if (isGoal) {
              const isHome = Math.random() < 0.5;
              setScore((s) => ({
                home: s.home + (isHome ? 1 : 0),
                away: s.away + (!isHome ? 1 : 0),
              }));
              setEvents((e) => [
                {
                  time: newTime,
                  text: `GOAL for ${
                    isHome ? teamName || "LEGENDARY CLUB" : "TITANS FC"
                  }!`,
                  type: "goal",
                },
                ...e,
              ]);
            } else {
              setEvents((e) => [
                {
                  time: newTime,
                  text: "Great save by the goalkeeper!",
                  type: "info",
                },
                ...e,
              ]);
            }
          }

          if (newTime >= 90) setIsPlaying(false);
          return newTime;
        });
      }, 200); // 200ms real time = 1 minute game time
    }
    return () => clearInterval(interval);
  }, [isPlaying, matchTime, teamName]);

  return (
    <main className="mt-20 pb-20 px-4 max-w-2xl mx-auto flex flex-col gap-4">
      {/* Match Header */}
      <section className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="bg-primary-container px-3 py-2 border-b-2 border-on-background flex justify-between items-center">
          <h2 className="text-[12px] font-bold tracking-[1px] text-on-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">
              sports_soccer
            </span>{" "}
            MATCHDAY
          </h2>
          <span className="text-[12px] font-bold tracking-[1px] text-primary-fixed">
            {matchTime}'
          </span>
        </div>

        <div className="p-6 relative bg-surface-container-lowest">
          {/* Pitch background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          <div className="relative z-10 flex justify-between items-center">
            {/* Home */}
            <div className="flex flex-col items-center gap-2 w-1/3">
              <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                <span className="material-symbols-outlined text-4xl text-primary">
                  shield
                </span>
              </div>
              <span className="text-[12px] font-bold tracking-[1px] text-center uppercase">
                {teamName || "LEGENDARY CLUB"}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 bg-background border-2 border-on-background px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                <span className="text-[32px] font-bold text-primary">
                  {score.home}
                </span>
                <span className="text-[20px] font-bold text-on-surface-variant">
                  -
                </span>
                <span className="text-[32px] font-bold text-error">
                  {score.away}
                </span>
              </div>
              <span
                className={`mt-2 text-[10px] font-bold tracking-[1px] px-2 py-1 border-2 border-on-background ${
                  isPlaying
                    ? "bg-secondary-container text-on-secondary-container animate-pulse"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {matchTime === 0
                  ? "NOT STARTED"
                  : matchTime >= 90
                  ? "FULL TIME"
                  : "LIVE"}
              </span>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-2 w-1/3">
              <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                <span className="material-symbols-outlined text-4xl text-error">
                  swords
                </span>
              </div>
              <span className="text-[12px] font-bold tracking-[1px] text-center">
                TITANS FC
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-surface-container-high p-2 flex gap-2 border-t-2 border-on-background">
          {!isPlaying && matchTime < 90 && (
            <button
              onClick={() => setIsPlaying(true)}
              className="flex-1 bg-primary-container text-on-primary-container py-2 text-[12px] font-bold tracking-[1px] border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">
                play_arrow
              </span>{" "}
              {matchTime === 0 ? "KICK OFF" : "RESUME"}
            </button>
          )}
          {isPlaying && (
            <button
              onClick={() => setIsPlaying(false)}
              className="flex-1 bg-error-container text-on-error-container py-2 text-[12px] font-bold tracking-[1px] border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">
                pause
              </span>{" "}
              PAUSE
            </button>
          )}
          {matchTime >= 90 && (
            <Link
              to="/dashboard"
              className="flex-1 bg-secondary-container text-on-secondary-container py-2 text-[12px] font-bold tracking-[1px] border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 text-center"
            >
              FINISH MATCH
            </Link>
          )}
        </div>
      </section>

      {/* Match Events */}
      <section className="flex flex-col gap-1 flex-1">
        <h3 className="bg-surface-variant text-on-surface-variant px-2 py-1 text-[10px] font-bold tracking-[1px] border-2 border-on-background inline-block self-start">
          MATCH LOG
        </h3>
        <div className="bg-surface-container border-2 border-on-background p-2 h-[300px] overflow-y-auto flex flex-col gap-2 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.5)]">
          {events.length === 0 ? (
            <div className="text-center text-on-surface-variant text-[12px] font-bold tracking-[1px] mt-4 opacity-50">
              Awaiting kickoff...
            </div>
          ) : (
            events.map((ev, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 border-2 border-on-background ${
                  ev.type === "goal"
                    ? "bg-primary-container/20 border-primary"
                    : "bg-surface-container-high border-on-background/20"
                }`}
              >
                <span
                  className={`text-[12px] font-bold ${
                    ev.type === "goal"
                      ? "text-primary"
                      : "text-on-surface-variant"
                  }`}
                >
                  {ev.time}'
                </span>
                <span
                  className={`text-[12px] font-bold tracking-[1px] ${
                    ev.type === "goal"
                      ? "text-primary-fixed"
                      : "text-on-surface"
                  }`}
                >
                  {ev.text}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
