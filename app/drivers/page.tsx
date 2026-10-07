import { PageHeader } from "@/app/components/SectionTitle";
import DriverCard from "@/app/components/DriverCard";
import { getDriverStandings, SEASON } from "@/lib/api";
import { getDrivers } from "@/lib/jolpica";

export const revalidate = 600;
export const metadata = {
  title: "Drivers",
  description: "Every driver on the Formula 1 grid with championship position and points.",
};

export default async function DriversPage() {
  const [standings, profiles] = await Promise.all([getDriverStandings(), getDrivers()]);
  const byCode = new Map(profiles.filter((p) => p.code).map((p) => [p.code!.toUpperCase(), p]));

  return (
    <main className="flex-1 w-full">
      <PageHeader
        kicker={`${SEASON} grid`}
        title="Drivers"
        description={`${standings.length} drivers this season, ordered by championship position.`}
      />
      <div className="container-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {standings.map((d) => (
          <DriverCard key={d.driver_code} standing={d} profile={byCode.get(d.driver_code)} />
        ))}
      </div>
    </main>
  );
}
