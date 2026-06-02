'use client';

import { useState } from 'react';
import Link from 'next/link';

type SellerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shopName: string;
  shopAddress: string;
  city: string;
  state: string;
  businessType: string;
  carsPerMonth: string;
  about: string;
  termsAccepted: boolean;
};

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const initialForm: SellerForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  shopName: '',
  shopAddress: '',
  city: '',
  state: '',
  businessType: '',
  carsPerMonth: '',
  about: '',
  termsAccepted: false,
};

export default function BecomeSellerPage() {
  const [form, setForm] = useState<SellerForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof SellerForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission. In production this would POST to /api/sellers/apply
    await new Promise((r) => setTimeout(r, 1500));

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Application received</h1>
          <p className="text-neutral-600 leading-relaxed">
            We got your details. Someone from our team will reach out within 24
            hours to verify your shop and get you set up. Keep an eye on your
            email and WhatsApp.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-8 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-6 pt-14 pb-10 lg:pt-20 lg:pb-14">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            Sell on ChiefBaranda
          </h1>
          <p className="mt-4 text-lg text-neutral-600 max-w-xl">
            Whether you run a full car lot or you just have one car to sell, we
            will get you in front of serious buyers. Fill out the form below and
            our team will verify your details within a day.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Personal Info */}
          <fieldset>
            <legend className="text-lg font-semibold text-neutral-900 mb-1">Personal information</legend>
            <p className="text-sm text-neutral-500 mb-6">This is how we reach you. We will not share your details publicly.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  placeholder="Chidi"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  placeholder="Okonkwo"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="chidi@example.com"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </fieldset>

          <hr className="border-neutral-100" />

          {/* Business Info */}
          <fieldset>
            <legend className="text-lg font-semibold text-neutral-900 mb-1">Business details</legend>
            <p className="text-sm text-neutral-500 mb-6">Tell us about your car business so we can match you with the right buyers.</p>

            <div className="space-y-5">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Shop or business name
                </label>
                <input
                  id="shopName"
                  type="text"
                  required
                  value={form.shopName}
                  onChange={(e) => update('shopName', e.target.value)}
                  placeholder="e.g. Chidi Autos, Prestige Motors"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  What type of seller are you?
                </label>
                <select
                  id="businessType"
                  required
                  value={form.businessType}
                  onChange={(e) => update('businessType', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                >
                  <option value="" disabled>Select one</option>
                  <option value="dealer">Registered car dealer</option>
                  <option value="importer">Car importer</option>
                  <option value="private">Private seller (selling my own car)</option>
                  <option value="fleet">Fleet or company disposal</option>
                </select>
              </div>

              <div>
                <label htmlFor="shopAddress" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Shop address
                </label>
                <input
                  id="shopAddress"
                  type="text"
                  required
                  value={form.shopAddress}
                  onChange={(e) => update('shopAddress', e.target.value)}
                  placeholder="e.g. 15 Berger Auto Market, Ojodu"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="e.g. Lagos, Abuja, Port Harcourt"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    State
                  </label>
                  <select
                    id="state"
                    required
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="" disabled>Select state</option>
                    {nigerianStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="carsPerMonth" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  How many cars do you sell per month?
                </label>
                <select
                  id="carsPerMonth"
                  value={form.carsPerMonth}
                  onChange={(e) => update('carsPerMonth', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                >
                  <option value="" disabled>Select range</option>
                  <option value="1-3">1 to 3 cars</option>
                  <option value="4-10">4 to 10 cars</option>
                  <option value="11-30">11 to 30 cars</option>
                  <option value="30+">More than 30 cars</option>
                  <option value="just-one">I just have one car to sell</option>
                </select>
              </div>

              <div>
                <label htmlFor="about" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Tell us a bit about yourself <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="about"
                  rows={3}
                  value={form.about}
                  onChange={(e) => update('about', e.target.value)}
                  placeholder="e.g. I have been selling Tokunbo cars for 8 years at Berger. Mostly Toyota and Honda."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </fieldset>

          <hr className="border-neutral-100" />

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              required
              checked={form.termsAccepted}
              onChange={(e) => update('termsAccepted', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-neutral-600 leading-relaxed cursor-pointer">
              I confirm that the information above is accurate. I agree to the{' '}
              <Link href="/terms" className="text-neutral-900 underline underline-offset-2 hover:text-green-700">
                terms and conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-neutral-900 underline underline-offset-2 hover:text-green-700">
                privacy policy
              </Link>
              . I understand my shop will be verified before listings go live.
            </label>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit application'
              )}
            </button>
            <p className="text-xs text-neutral-400">
              Usually takes less than 24 hours to get verified
            </p>
          </div>
        </form>
      </section>

      {/* Bottom info */}
      <section className="border-t border-neutral-100 bg-neutral-50/60">
        <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Why sell on ChiefBaranda?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-lg">
                📍
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">Reach real buyers</h3>
              <p className="text-sm text-neutral-600">
                Thousands of verified buyers in Lagos, Abuja, PH and across the
                country looking for exactly what you sell.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-lg">
                🔒
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">Escrow protection</h3>
              <p className="text-sm text-neutral-600">
                Payments are held securely until the buyer confirms delivery.
                No more stories of bounced transfers.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-lg">
                ⚡
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">Free to list</h3>
              <p className="text-sm text-neutral-600">
                No upfront fees. You only pay a small commission when you
                actually sell a car through the platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
