import Link from "next/link";
import Footer from "./components/Footer";

export const metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <main className="flex-1 w-full">
      <section className="section-y">
        <div className="container-max">
          <span className="eyebrow-red block">Off Track</span>
          <h1 className="headline h-detail mt-4">
            404 <em>— Not Found</em>
          </h1>
          <p className="mt-6 text-sm text-muted max-w-md leading-relaxed">
            That driver, team, or round isn&apos;t on this season&apos;s entry
            list. Rejoin the racing line from the start.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:text-f1 transition-colors border-b border-rule hover:border-f1 pb-1"
          >
            ← Back to LightsOut
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
