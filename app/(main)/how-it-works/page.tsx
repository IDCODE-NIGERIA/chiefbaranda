import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How it works · ChiefBaranda',
  description:
    'How buying, selling and pre-ordering a car on ChiefBaranda actually works. Verified sellers, escrow-protected payments and no agents taking a cut in the middle.',
};

const buyerSteps = [
  {
    n: '01',
    title: 'Find the car',
    body: 'Search by brand, body type or budget. Every listing shows the real condition brand new, foreign-used or Nigerian-used with photos the seller actually took, not stock images pulled off Google.',
  },
  {
    n: '02',
    title: 'Check it before you commit',
    body: 'Run the VIN on the home page to confirm the year, make and spec match what the seller wrote. Message the seller, ask questions, and book a physical inspection at one of our yards in Lagos, Abuja or Port Harcourt.',
  },
  {
    n: '03',
    title: 'Pay into escrow',
    body: 'When you are ready, your money goes into an escrow account with our partner bank not straight to the seller. The seller only gets paid after you have seen the car and confirmed it is what you agreed on.',
  },
  {
    n: '04',
    title: 'Collect your keys',
    body: 'Inspect the car one last time at handover. If everything checks out, we release the funds and the car is yours. If something is off, you walk away and your money comes back.',
  },
];

const sellerSteps = [
  {
    n: '01',
    title: 'List in minutes',
    body: 'Create a seller account, upload clear photos and set your price. Be honest about the condition buyers trust listings that match reality, and those are the ones that sell fast.',
  },
  {
    n: '02',
    title: 'Get verified',
    body: 'We confirm your identity and vehicle papers once. That verified badge tells buyers you are a real seller with a real car, which means fewer time-wasters and more serious offers.',
  },
  {
    n: '03',
    title: 'Talk to real buyers',
    body: 'Serious buyers message you directly through the platform. No agents calling to "help" you sell while quietly adding their own cut on top of your price.',
  },
  {
    n: '04',
    title: 'Get paid safely',
    body: 'The buyer funds escrow before they collect. Once the handover is done and confirmed, the money lands in your account usually within 24 hours.',
  },
];

const faqs = [
  {
    q: 'What does ChiefBaranda charge?',
    a: 'Listing a car is free. We take a small, flat service fee on completed sales shown upfront before anyone pays. No percentage games, no surprise deductions at the end.',
  },
  {
    q: 'How does escrow protect me?',
    a: 'Your payment sits with our partner bank, not the seller. The seller cannot touch it until you have inspected the car and signed off. If the deal falls through during inspection, the money comes straight back to you.',
  },
  {
    q: 'What does "verified seller" actually mean?',
    a: 'It means we have confirmed the seller is a real person and that the vehicle documents check out. It is not a guarantee on the car itself that is what the inspection and VIN check are for but it filters out the obvious scams.',
  },
  {
    q: 'Can I buy a car that is not in Nigeria yet?',
    a: 'Yes. That is what pre-orders are for. You reserve a unit with a small deposit, track the shipment from port to port, and only pay the balance after you have inspected it on the ground here.',
  },
  {
    q: 'What if I find a problem after I have paid?',
    a: 'The inspection at handover is your safety net say something then and the deal pauses before money moves. For pre-orders, your deposit is refundable in full if the car arrives outside the grade you agreed to.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative border-b border-neutral-100 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, #16a34a 0%, transparent 50%), radial-gradient(circle at 85% 75%, #0a0a0a 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-12 lg:pt-20 lg:pb-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
              How ChiefBaranda works
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
              Buy or sell a car
              <br />
              without the <span className="text-green-600">drama.</span>
            </h1>
            <p className="mt-5 text-lg text-neutral-600 max-w-2xl">
              We built ChiefBaranda for one simple reason: buying a car in Nigeria
              should not feel like a gamble. No agents inflating prices, no paying a
              stranger and hoping for the best. Just verified sellers, protected
              payments, and you in control the whole way through.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#for-buyers"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                If you are buying
                <Arrow />
              </a>
              <a
                href="#for-sellers"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
              >
                If you are selling
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* For buyers */}
      <section id="for-buyers" className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20 scroll-mt-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
              For buyers
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
              Four steps from browsing to driving.
            </h2>
            <p className="mt-4 text-neutral-600">
              Take your time at every stage. Nothing moves until you say so, and your
              money is protected right up to the moment you take the keys.
            </p>
          </div>

          <ol className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
            {buyerSteps.map((s) => (
              <li
                key={s.n}
                className="rounded-xl border border-neutral-200 p-6 hover:border-neutral-900 transition-colors"
              >
                <p className="font-mono text-xs text-green-700 mb-3">{s.n}</p>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* For sellers */}
      <section id="for-sellers" className="border-y border-neutral-100 bg-neutral-50/60 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
                For sellers
              </p>
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
                List once. Sell to real buyers.
              </h2>
              <p className="mt-4 text-neutral-600">
                You keep your price. We just connect you to people who actually want to
                buy and make sure you get paid without stress.
              </p>
              <Link
                href="/become-seller"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                Become a seller
                <Arrow />
              </Link>
            </div>

            <ol className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {sellerSteps.map((s) => (
                <li
                  key={s.n}
                  className="rounded-xl border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-colors"
                >
                  <p className="font-mono text-xs text-green-700 mb-3">{s.n}</p>
                  <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-900">
            Why people trust us with it
          </h2>
          <p className="mt-4 text-neutral-600">
            Three things sit behind every deal on the platform. They are the reason
            buyers relax and sellers get paid.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Pillar
            title="Verified sellers"
            body="Every seller is identity-checked and their papers confirmed before they can take payment. The badge does the vetting so you do not have to."
            icon={
              <path d="M20 6L9 17l-5-5" />
            }
          />
          <Pillar
            title="Escrow on every sale"
            body="Money is held by our partner bank until you confirm the car at handover. Nobody gets paid for a car you have not seen and accepted."
            icon={
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </>
            }
          />
          <Pillar
            title="No middleman markup"
            body="You deal directly with the seller. There is no agent quietly adding two or three million on top before the price ever reaches you."
            icon={
              <>
                <path d="M12 1v22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </>
            }
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-neutral-100 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              The questions everyone asks.
            </h2>
            <p className="mt-3 text-neutral-600">
              Still not clear on something? Send us a WhatsApp on{' '}
              <a
                href="https://wa.me/2348000000000"
                className="text-neutral-900 underline underline-offset-2 hover:text-green-700"
              >
                +234 800 0000 000
              </a>{' '}
              and a real person will answer.
            </p>
          </div>

          <div className="lg:col-span-8 divide-y divide-neutral-200">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-neutral-900 pr-4">{f.q}</h3>
                  <span className="mt-1 grid place-items-center h-7 w-7 rounded-full border border-neutral-300 text-neutral-600 group-open:bg-neutral-900 group-open:text-white group-open:border-neutral-900 transition-colors shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-45 transition-transform">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600 leading-relaxed pr-12">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="rounded-2xl bg-neutral-950 text-white px-8 py-10 lg:px-14 lg:py-14 flex flex-col lg:flex-row lg:items-center gap-8 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
          />
          <div className="flex-1 relative">
            <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight max-w-xl">
              Ready when you are.
            </h3>
            <p className="mt-3 text-neutral-300 max-w-xl">
              Start browsing the lot or list the car sitting in your compound. Either
              way, you are covered from the first message to the final handshake.
            </p>
          </div>
          <div className="flex gap-3 relative">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Browse cars
              <Arrow />
            </Link>
            <Link
              href="/become-seller"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sell a car
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Pillar({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-900 transition-colors">
      <span className="grid place-items-center h-12 w-12 rounded-full bg-green-100 text-green-700">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{body}</p>
    </div>
  );
}

function Arrow({ small = false }: { small?: boolean }) {
  const s = small ? 14 : 16;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
