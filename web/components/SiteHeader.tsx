import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-surface-border bg-surface-raised/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 md:px-6 md:py-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg outline-none ring-offset-2 ring-offset-zinc-950 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Image
            src="/logo.png"
            alt=""
            width={160}
            height={48}
            priority
            className="h-9 w-auto max-h-10 object-contain object-left md:h-10"
          />
          <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
            Research evaluation
          </h1>
        </Link>
      </div>
    </header>
  );
}
