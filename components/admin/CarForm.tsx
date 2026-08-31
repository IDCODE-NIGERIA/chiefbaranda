'use client';

import { useRef, useState } from 'react';

import { brands, conditionLabels } from '@/lib/carData';
import {
  BODY_TYPES,
  CAR_STATUSES,
  CONDITIONS,
  FUELS,
  TRANSMISSIONS,
} from '@/lib/carValidation';
import type { Car } from '@/lib/models/Car';

/** Longest edge we keep for a listing photo. */
const MAX_EDGE = 1600;

/**
 * Downscale in the browser before upload. A modern phone photo is 4–8MB and
 * 4000px wide; nothing on the site renders above ~1600px, so shipping the
 * original would just fill the database.
 */
function downscale(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('That file is not an image'));
      image.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('Your browser could not process that image'));

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Could not process that image'))),
          'image/jpeg',
          0.85
        );
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const emptyForm = {
  title: '',
  brand: '',
  condition: 'foreign-used',
  type: 'sedan',
  price: '',
  description: '',
  sellerName: 'ChiefBaranda',
  sellerVerified: true,
  featured: false,
  status: 'available',
  location: '',
  vin: '',
  mileage: '',
  year: '',
  color: '',
  transmission: '',
  fuel: '',
};

export default function CarForm({
  car,
  onDone,
  onCancel,
}: {
  /** Present when editing; absent when creating. */
  car?: Car;
  onDone: () => void;
  onCancel: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(
    car
      ? {
          title: car.title,
          brand: car.brand,
          condition: car.condition,
          type: car.type,
          price: String(car.price),
          description: car.description,
          sellerName: car.sellerName,
          sellerVerified: car.sellerVerified,
          featured: car.featured,
          status: car.status,
          location: car.location ?? '',
          vin: car.vin ?? '',
          mileage: car.mileage != null ? String(car.mileage) : '',
          year: car.year != null ? String(car.year) : '',
          color: car.color ?? '',
          transmission: car.transmission ?? '',
          fuel: car.fuel ?? '',
        }
      : emptyForm
  );

  const [images, setImages] = useState<string[]>(car?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setFormError(null);

    try {
      for (const file of files) {
        const blob = await downscale(file);
        const body = new FormData();
        body.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));

        const res = await fetch('/api/admin/images', {
          method: 'POST',
          credentials: 'include',
          body,
        });
        const json = await res.json();

        if (!res.ok) {
          setFormError(json.error || 'One of those photos failed to upload');
          break;
        }
        setImages((prev) => [...prev, json.data.url]);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not upload those photos');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setErrors({});

    const payload = {
      ...form,
      images,
      price: form.price === '' ? null : Number(form.price),
      mileage: form.mileage === '' ? null : Number(form.mileage),
      year: form.year === '' ? null : Number(form.year),
    };

    try {
      const res = await fetch(car ? `/api/admin/cars/${car.id}` : '/api/admin/cars', {
        method: car ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        setFormError(json.error || 'Could not save that listing');
        setSaving(false);
        return;
      }

      onDone();
    } catch {
      setFormError('Network problem. Try again.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
          {car ? `Edit ${car.title}` : 'Add a car'}
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          {car
            ? 'Changes go live on the site as soon as you save.'
            : 'This listing appears on the marketplace immediately after you publish.'}
        </p>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Photos</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative group">
              {/* Uploaded photos are served from our own API route. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="h-24 w-32 rounded-xl object-cover border border-neutral-200"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded-full bg-neutral-900/85 px-2 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -top-2 -right-2 grid place-items-center h-6 w-6 rounded-full bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="h-24 w-32 rounded-xl border-2 border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-neutral-500 hover:text-neutral-700 disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : '+ Add photos'}
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        {errors.images && <p className={errorClass}>{errors.images}</p>}
        <p className="mt-2 text-xs text-neutral-500">
          The first photo is the cover shown on cards. Large images are shrunk automatically.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field className="sm:col-span-2" label="Title" value={form.title} onChange={(v) => set('title', v)} error={errors.title} placeholder="Toyota Camry 2020" />

        <Select label="Brand" value={form.brand} onChange={(v) => set('brand', v)} error={errors.brand}
          options={[{ value: '', label: 'Select a brand' }, ...brands.map((b) => ({ value: b.slug, label: b.name }))]} />

        <Select label="Body type" value={form.type} onChange={(v) => set('type', v)} error={errors.type}
          options={BODY_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))} />

        <Select label="Condition" value={form.condition} onChange={(v) => set('condition', v)} error={errors.condition}
          options={CONDITIONS.map((c) => ({ value: c, label: conditionLabels[c] }))} />

        <Field label="Price (₦)" type="number" value={form.price} onChange={(v) => set('price', v)} error={errors.price} placeholder="17000000" />

        <Field label="Year" type="number" value={form.year} onChange={(v) => set('year', v)} error={errors.year} placeholder="2020" />
        <Field label="Mileage (km)" type="number" value={form.mileage} onChange={(v) => set('mileage', v)} error={errors.mileage} placeholder="48000" />

        <Select label="Transmission" value={form.transmission} onChange={(v) => set('transmission', v)} error={errors.transmission}
          options={[{ value: '', label: 'Not specified' }, ...TRANSMISSIONS.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))]} />

        <Select label="Fuel" value={form.fuel} onChange={(v) => set('fuel', v)} error={errors.fuel}
          options={[{ value: '', label: 'Not specified' }, ...FUELS.map((f) => ({ value: f, label: f[0].toUpperCase() + f.slice(1) }))]} />

        <Field label="Colour" value={form.color} onChange={(v) => set('color', v)} error={errors.color} placeholder="Silver" />
        <Field label="Location" value={form.location} onChange={(v) => set('location', v)} error={errors.location} placeholder="Lagos" />

        <Field className="sm:col-span-2" label="Chassis number (VIN)" value={form.vin} onChange={(v) => set('vin', v.toUpperCase())} error={errors.vin} placeholder="17 characters — lets buyers verify the car" />

        <Field label="Seller name" value={form.sellerName} onChange={(v) => set('sellerName', v)} error={errors.sellerName} />

        <Select label="Status" value={form.status} onChange={(v) => set('status', v)} error={errors.status}
          options={CAR_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} />

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Condition, service history, what's included, anything a buyer should know."
            className={inputClass(Boolean(errors.description))}
          />
          {errors.description && <p className={errorClass}>{errors.description}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <Checkbox label="Verified seller" checked={form.sellerVerified} onChange={(v) => set('sellerVerified', v)} />
        <Checkbox label="Feature on the home page" checked={form.featured} onChange={(v) => set('featured', v)} />
      </div>

      {formError && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : car ? 'Save changes' : 'Publish listing'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const errorClass = 'mt-1.5 text-sm text-red-600';

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
    hasError ? 'border-red-300' : 'border-neutral-200 hover:border-neutral-400',
  ].join(' ');
}

function Field({
  label, value, onChange, error, type = 'text', placeholder, className = '',
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  type?: string; placeholder?: string; className?: string;
}) {
  const id = `car-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className={inputClass(Boolean(error))} />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function Select({
  label, value, onChange, error, options,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  options: { value: string; label: string }[];
}) {
  const id = `car-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass(Boolean(error))}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function Checkbox({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300 accent-green-600" />
      {label}
    </label>
  );
}
