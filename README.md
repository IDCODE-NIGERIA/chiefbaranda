This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Configuration

Copy `.env.example` to `.env` and fill it in. Both Next.js and the Prisma CLI
read that file. The app needs `DATABASE_URL` and `JWT_SECRET`; payments and SMS
degrade gracefully without their keys (orders are still recorded, alerts are
logged instead of sent).

```bash
cp .env.example .env
```

## Database

Postgres via [Prisma](https://www.prisma.io/). The schema lives in
`prisma/schema.prisma` and the client is generated into `lib/generated/prisma`
(gitignored — `npm install` regenerates it via `postinstall`).

```bash
npm run db:migrate   # create + apply a migration in development
npm run db:deploy    # apply existing migrations (CI / production)
npm run db:seed      # load the starter car and pre-order catalogue
npm run db:studio    # browse the data
```

`DIRECT_URL` is the unpooled connection used for migrations; `DATABASE_URL` is
the pooled one the app uses at runtime. On Neon they differ only by `-pooler`
in the host.

Enum-like columns (`orders.status`, `orders.kind`, `cars.condition`, …) are
text rather than Postgres enums, because their values contain hyphens which
Prisma cannot express as enum member names. The TypeScript unions in
`lib/models/` are the source of truth, and CHECK constraints in
`prisma/migrations/*_order_value_constraints` enforce the same sets in the
database — along with guards that money is never negative and a deposit can
never exceed the price of the car.

Without `DATABASE_URL` the browsing pages fall back to the static catalogue in
`lib/seedCars.ts` and `lib/carData.ts` so the UI still runs, but ordering,
accounts and payments refuse rather than pretending to work.

### Payments (Paystack)

Deposits are collected through Paystack's hosted checkout:

1. Put your `sk_test_…` key in `PAYSTACK_SECRET_KEY`.
2. In the Paystack dashboard, set the webhook URL to
   `https://your-domain.com/api/payments/webhook`. Locally, tunnel it
   (`ngrok http 3000`) — without the webhook, payments are still confirmed
   when the buyer is redirected back, but only while their browser is open.

How much is taken upfront lives in `lib/config.ts` (`DEPOSIT_RATES`): **40%**
to buy a car already in Nigeria, **30%** to pre-order an import. Buyers can
also pay in full, or spread the balance over 3/6/12 months. Every amount is
recomputed server-side from the stored listing price — figures posted from the
browser are ignored.

### Admin

`ADMIN_EMAILS` (comma separated) controls who can reach `/admin`. A user can
also be made admin by setting `role: "admin"` on their document. Admins get an
in-dashboard notification plus a Termii SMS the moment a buyer requests a
payment, and again when the money is confirmed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
