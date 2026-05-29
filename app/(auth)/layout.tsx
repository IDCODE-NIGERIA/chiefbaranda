import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white grid lg:grid-cols-5">
      <aside className="hidden lg:flex lg:col-span-2 relative overflow-hidden bg-neutral-950 text-white p-10 flex-col justify-between">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 0%, #16a34a 0%, transparent 45%), radial-gradient(circle at 100% 100%, #0ea5e9 0%, transparent 40%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-auto" />
          <Link href="/" className="text-lg font-semibold tracking-tight">
            ChiefBaranda<span className="text-green-400">.ng</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-green-400/90 mb-4">
              The honest way to buy a car in Nigeria
            </p>
            <h2 className="text-3xl xl:text-4xl font-semibold leading-[1.15] tracking-tight">
              No agents. No detours.
              <br />
              Just you and the keys.
            </h2>
            <p className="mt-5 text-neutral-300 leading-relaxed max-w-sm">
              Pre-order direct, inspect before you pay, and pick up in Lagos, Abuja
              or Port Harcourt. Thousands of Nigerians have skipped the wahala.
            </p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div>
              <p className="text-2xl font-semibold">12k+</p>
              <p className="text-xs text-neutral-400 mt-1">verified members</p>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <p className="text-2xl font-semibold">₦4.2b</p>
              <p className="text-xs text-neutral-400 mt-1">in cars moved</p>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <p className="text-2xl font-semibold">4.9★</p>
              <p className="text-xs text-neutral-400 mt-1">buyer rating</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-neutral-500">
          © 2026 ChiefBaranda Technologies Ltd. — RC 1893420
        </p>
      </aside>

      <main className="lg:col-span-3 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 sm:px-10 pt-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-auto" />
            <span className="font-semibold text-neutral-900">ChiefBaranda</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Back to home
          </Link>
        </div>

        <div className="hidden lg:flex justify-end px-10 pt-6">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-14">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <footer className="px-6 sm:px-10 py-5 text-xs text-neutral-400 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span>Protected by reCAPTCHA</span>
          <Link href="/terms" className="hover:text-neutral-700">Terms</Link>
          <Link href="/privacy" className="hover:text-neutral-700">Privacy</Link>
          <Link href="/help" className="hover:text-neutral-700">Help</Link>
        </footer>
      </main>
    </div>
  );
}
