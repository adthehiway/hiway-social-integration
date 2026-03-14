import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h1 className="text-3xl font-bold">Hiway Social Integration</h1>
      <p className="text-text-secondary">Select a page from the sidebar to get started</p>
      <Link href="/clips" className="px-6 py-3 bg-accent text-accent-fg rounded-lg font-semibold hover:opacity-90 transition">
        Go to My Clips
      </Link>
    </div>
  );
}
