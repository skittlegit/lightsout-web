import Link from "next/link";

export const metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <main className="flex-1 w-full">
      <section className="section-y">
        <div className="container-max">
          <span className="kicker">Off track · 404</span>
          <h1 className="headline h-detail mt-4">
            Lost the <em>racing line</em>
          </h1>
          <p className="mt-6 text-sm text-muted max-w-md leading-relaxed">
            That driver, team, or round isn&apos;t on this season&apos;s entry
            list. Rejoin the racing line from the start.
          </p>
          <Link
            href="/"
            className="mt-8 btn btn-primary"
          >
            ← Back to the grid
          </Link>
        </div>
      </section>
    </main>
  );
}
