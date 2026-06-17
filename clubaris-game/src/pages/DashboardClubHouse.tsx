import { Link } from "react-router-dom";
import { useGameStore } from "../store/gameStore";

export default function DashboardClubHouse() {
  const { teamName, morale, fitness } = useGameStore();

  return (
    <main className="mt-20 mb-8 px-4 lg:px-8 grid grid-cols-12 gap-2 max-w-screen-2xl mx-auto">
      {/* Column 1: Match & Squad */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
        {/* Next Match Preview */}
        <section className="bg-surface-container border-2 border-on-background retro-border overflow-hidden">
          <div className="bg-primary-container px-3 py-2 border-b-2 border-on-background">
            <h2 className="text-[12px] font-bold tracking-[1px] text-on-primary-container flex items-center gap-2">
              <span className="material-symbols-outlined">event</span> NEXT
              FIXTURE
            </h2>
          </div>
          <div className="p-6 flex flex-col items-center gap-6 relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGxw-pYndU-rd9iMmZNRwX1WTxyLRZUDE1rxP-ixbjeR9OoushH-BfLb5t9RDWf29o2ID2EmewVwSd0MnYDs_6PX0DTq7bFrQsrU52gkJaoRsmoAdYubrfpJX4WGzHmzCcl9pjH-rJhAJCt9hRKhFCF-XnwTa_XuNd64h5v7TXEtlmlXy-ibeWD-1usvF9Qv8dvVvodxbmflTCsbukjJCOnVEFHNqYmQu29BHD78A4HheQKZ4jI7U9C8FTBSz3U0_e2Wbsa8prQST1"
                alt="Stadium background"
              />
            </div>
            <div className="flex justify-between items-center w-full relative z-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    shield
                  </span>
                </div>
                <p className="text-[12px] font-bold tracking-[1px] uppercase">
                  {teamName || "LGD CLUB"}
                </p>
              </div>
              <div className="text-center">
                <span className="text-[24px] font-bold tracking-[-1px] text-primary">
                  VS
                </span>
                <p className="text-xs font-bold tracking-[1px] text-on-surface-variant mt-2">
                  SUN 18:00
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-4xl text-error">
                    swords
                  </span>
                </div>
                <p className="text-[12px] font-bold tracking-[1px]">
                  TITANS FC
                </p>
              </div>
            </div>
            <Link
              to="/partida"
              className="block text-center w-full bg-secondary-container text-on-secondary-container border-2 border-on-background py-3 text-[12px] font-bold tracking-[1px] retro-btn-press retro-border relative z-10"
            >
              MATCH CENTER
            </Link>
          </div>
        </section>
        {/* Squad Status Widgets */}
        <div className="grid grid-cols-2 gap-2">
          {/* Morale */}
          <div className="bg-surface-container border-2 border-on-background retro-border">
            <div className="bg-surface-variant px-3 py-1 border-b-2 border-on-background flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[1px]">
                MORALE
              </span>
              <span className="material-symbols-outlined text-sm">
                sentiment_very_satisfied
              </span>
            </div>
            <div className="p-4">
              <div className="h-4 bg-background border-2 border-on-background p-0.5">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${morale}%` }}
                ></div>
              </div>
              <p className="text-[18px] font-bold mt-2 text-primary">
                {morale}%
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold tracking-[1px]">
                EXCELLENT
              </p>
            </div>
          </div>
          {/* Fitness */}
          <div className="bg-surface-container border-2 border-on-background retro-border">
            <div className="bg-surface-variant px-3 py-1 border-b-2 border-on-background flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[1px]">
                FITNESS
              </span>
              <span className="material-symbols-outlined text-sm">bolt</span>
            </div>
            <div className="p-4">
              <div className="h-4 bg-background border-2 border-on-background p-0.5">
                <div
                  className="h-full bg-secondary-container"
                  style={{ width: `${fitness}%` }}
                ></div>
              </div>
              <p className="text-[18px] font-bold mt-2 text-secondary-container">
                {fitness}%
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold tracking-[1px]">
                STABLE
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Column 2: League Table */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
        <section className="bg-surface-container border-2 border-on-background retro-border h-full">
          <div className="bg-primary-container px-3 py-2 border-b-2 border-on-background flex justify-between items-center">
            <h2 className="text-[12px] font-bold tracking-[1px] text-on-primary-container flex items-center gap-2">
              <span className="material-symbols-outlined">table_chart</span>{" "}
              LEAGUE STANDINGS
            </h2>
            <span className="text-[10px] font-bold tracking-[1px] bg-on-primary-container text-primary-container px-2">
              WEEK 24 / 38
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] font-bold tracking-[1px]">
              <thead className="bg-surface-variant border-b-2 border-on-background">
                <tr>
                  <th className="p-2 border-r-2 border-on-background">POS</th>
                  <th className="p-2 border-r-2 border-on-background">CLUB</th>
                  <th className="p-2 border-r-2 border-on-background">P</th>
                  <th className="p-2 border-r-2 border-on-background">GD</th>
                  <th className="p-2">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-on-background/20">
                <tr className="bg-primary-container/20">
                  <td className="p-2 border-r-2 border-on-background text-[18px]">
                    01
                  </td>
                  <td className="p-2 border-r-2 border-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      stars
                    </span>{" "}
                    METRO UNITED
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center">
                    24
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center text-primary">
                    +32
                  </td>
                  <td className="p-2 text-[18px] text-primary">58</td>
                </tr>
                <tr className="bg-primary-container/10">
                  <td className="p-2 border-r-2 border-on-background text-[18px]">
                    02
                  </td>
                  <td className="p-2 border-r-2 border-on-background">
                    SHADOW ATHLETIC
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center">
                    24
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center text-primary">
                    +28
                  </td>
                  <td className="p-2 text-[18px] text-primary">55</td>
                </tr>
                <tr className="bg-secondary-container text-on-secondary-container">
                  <td className="p-2 border-r-2 border-on-background text-[18px]">
                    03
                  </td>
                  <td className="p-2 border-r-2 border-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      play_arrow
                    </span>{" "}
                    <span className="uppercase">
                      {teamName || "LEGENDARY CLUB"}
                    </span>
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center">
                    23
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center">
                    +25
                  </td>
                  <td className="p-2 text-[18px]">52</td>
                </tr>
                <tr className="bg-primary-container/5">
                  <td className="p-2 border-r-2 border-on-background text-[18px]">
                    04
                  </td>
                  <td className="p-2 border-r-2 border-on-background">
                    VALOR FC
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center">
                    24
                  </td>
                  <td className="p-2 border-r-2 border-on-background text-center text-primary">
                    +18
                  </td>
                  <td className="p-2 text-[18px] text-primary">49</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {/* Column 3: News */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
        <section className="bg-surface-container border-2 border-on-background retro-border flex-grow">
          <div className="bg-surface-variant px-3 py-2 border-b-2 border-on-background flex justify-between items-center">
            <h2 className="text-[12px] font-bold tracking-[1px] flex items-center gap-2">
              <span className="material-symbols-outlined">newspaper</span> NEWS
              WIRE
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="group cursor-pointer">
              <p className="text-[10px] text-primary font-bold tracking-[1px]">
                INJURY UPDATE
              </p>
              <h3 className="text-sm font-bold group-hover:underline">
                STRIKER "BULL" SMITH OUT FOR 3 WEEKS
              </h3>
            </div>
            <div className="group cursor-pointer border-t-2 border-on-background/10 pt-4">
              <p className="text-[10px] text-secondary-container font-bold tracking-[1px]">
                TRANSFER RUMOR
              </p>
              <h3 className="text-sm font-bold group-hover:underline">
                CLUB LINKED WITH WINGER "ZIPPY"
              </h3>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
