import BrandStripes from "./BrandStripes";

export default function Hero({ coverUrl }: { coverUrl: string }) {
  return (
    <section className="relative isolate">
      {/* Real photo cover */}
      <img src={coverUrl} alt="Featured build" className="h-[56vh] w-full object-cover" />
      {/* Dark overlay for readable text */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Watermark badge in the background */}
      <img
        src="/vintage-badge.png"
        alt="VINtage Garage badge"
        className="pointer-events-none select-none absolute right-8 bottom-6 w-40 opacity-40 mix-blend-overlay hidden md:block"
      />

      {/* Copy + CTAs */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Trust every mile.</h1>
          <p className="mt-3 text-white/90 max-w-xl">
            A living logbook for every VIN. Share it. Transfer it. Preserve it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/register" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold">Create VIN profile</a>
            <a href="/signin" className="px-4 py-2 rounded-lg border border-white/80 text-white">Sign up / Sign in</a>
          </div>
          <div className="mt-6"><BrandStripes/></div>
        </div>
      </div>
    </section>
  );
}