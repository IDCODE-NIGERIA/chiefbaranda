'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { formatNairaExact, conditionLabels } from '@/lib/carData';
import { OrderStatusBadge, orderStatusLabel } from '@/components/OrderStatusBadge';
import CarForm from '@/components/admin/CarForm';
import type { Car } from '@/lib/models/Car';
import type { Order, OrderStatus } from '@/lib/models/Order';
import type { Notification } from '@/lib/models/Notification';
import type { SellerApplication, StockAlert } from '@/lib/models/SellerApplication';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  role: string;
  verified: boolean;
  city: string | null;
  state: string | null;
  createdAt: string | Date;
  _count: { orders: number };
}

interface Overview {
  stats: {
    collected: number;
    outstanding: number;
    paidOrders: number;
    pendingOrders: number;
    unreadNotifications: number;
    sellerApplications: number;
    totalUsers: number;
    totalCars: number;
    carsAvailable: number;
    carsReserved: number;
    carsSold: number;
    preOrderSlots: number;
    slotsRemaining: number;
    stockAlerts: number;
    imageCount: number;
    imageBytes: number;
  };
  orders: Order[];
  notifications: Notification[];
  applications: SellerApplication[];
  cars: Car[];
  users: AdminUser[];
  stockAlerts: StockAlert[];
}

type Tab = 'orders' | 'inventory' | 'users' | 'alerts' | 'sellers';

const nextStatuses: OrderStatus[] = ['paid', 'in-transit', 'ready', 'completed', 'cancelled'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('orders');
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // null = form closed; {} = creating; { car } = editing that one.
  const [editing, setEditing] = useState<{ car?: Car } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/overview', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Could not load the dashboard.');
        return;
      }
      setData(json.data);
      setError(null);
    } catch {
      setError('Could not reach the server.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // Payments arrive by webhook, so poll rather than leaving stale figures up.
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, [load]);

  async function updateOrder(reference: string, status: OrderStatus) {
    setBusy(reference);
    await fetch(`/api/admin/orders/${reference}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    await load();
    setBusy(null);
  }

  async function reviewApplication(id: string, status: 'approved' | 'rejected') {
    setBusy(id);
    await fetch(`/api/admin/sellers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    await load();
    setBusy(null);
  }

  async function deleteCar(car: Car) {
    if (!confirm(`Remove "${car.title}" from the marketplace?`)) return;

    setBusy(car.id);
    setNotice(null);
    const res = await fetch(`/api/admin/cars/${car.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    // A car with orders against it is archived rather than deleted — say so.
    setNotice(json.message ?? null);
    await load();
    setBusy(null);
  }

  async function markAllRead() {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ all: true }),
    });
    await load();
  }

  if (error) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Dashboard unavailable</h1>
          <p className="text-neutral-600">{error}</p>
          <button onClick={load} className="mt-6 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white min-h-[60vh] grid place-items-center">
        <span className="h-6 w-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
      </div>
    );
  }

  const { stats } = data;

  if (editing) {
    return (
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
          <button
            onClick={() => setEditing(null)}
            className="mb-6 text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Back to dashboard
          </button>
          <CarForm
            car={editing.car}
            onCancel={() => setEditing(null)}
            onDone={async () => {
              const wasEditing = Boolean(editing.car);
              setEditing(null);
              setNotice(
                wasEditing
                  ? 'Listing updated.'
                  : 'Listing published — it is live on the site now.'
              );
              await load();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
          Morning, {adminName}.
        </h1>
        <p className="mt-3 text-neutral-600">
          Everything on the platform — money, inventory, people and alerts.
        </p>

        {notice && (
          <p className="mt-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            {notice}
          </p>
        )}

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Collected" value={formatNairaExact(stats.collected)} tone="green" />
          <Stat label="Outstanding" value={formatNairaExact(stats.outstanding)} />
          <Stat label="Awaiting payment" value={String(stats.pendingOrders)} />
          <Stat label="Paid orders" value={String(stats.paidOrders)} />
          <Stat label="Registered users" value={String(stats.totalUsers)} />
          <Stat label="Cars listed" value={`${stats.carsAvailable} live · ${stats.carsSold} sold`} />
          <Stat
            label="Pre-order slots"
            value={`${stats.slotsRemaining} left across ${stats.preOrderSlots} models`}
          />
          <Stat label="Photo storage" value={`${stats.imageCount} · ${formatBytes(stats.imageBytes)}`} />
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>Orders ({data.orders.length})</TabButton>
          <TabButton active={tab === 'inventory'} onClick={() => setTab('inventory')}>Inventory ({data.cars.length})</TabButton>
          <TabButton active={tab === 'users'} onClick={() => setTab('users')}>Users ({data.users.length})</TabButton>
          <TabButton active={tab === 'alerts'} onClick={() => setTab('alerts')}>
            Notifications
            {stats.unreadNotifications > 0 && (
              <span className="ml-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">
                {stats.unreadNotifications}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === 'sellers'} onClick={() => setTab('sellers')}>
            Sellers ({stats.sellerApplications} pending)
          </TabButton>
        </div>

        {tab === 'orders' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full text-sm min-w-205">
              <thead className="bg-neutral-50 text-left">
                <tr className="text-[11px] uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Buyer</th>
                  <th className="px-5 py-3 font-medium">Car</th>
                  <th className="px-5 py-3 font-medium text-right">Due now</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Move to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.orders.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-neutral-500">No orders yet.</td></tr>
                )}
                {data.orders.map((order) => (
                  <tr key={order.reference} className="hover:bg-neutral-50/60">
                    <td className="px-5 py-4 font-mono text-xs text-neutral-900 whitespace-nowrap">
                      <Link href={`/orders/${order.reference}`} className="hover:underline">{order.reference}</Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-900">{order.buyerName}</p>
                      <p className="text-xs text-neutral-500">{order.buyerPhone}</p>
                      <p className="text-xs text-neutral-500">{order.buyerCity}, {order.buyerState}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-neutral-900">{order.listingTitle}</p>
                      <p className="text-xs text-neutral-500 capitalize">{order.kind} · {order.plan}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                      {formatNairaExact(order.amountDueNow)}
                    </td>
                    <td className="px-5 py-4 text-right text-neutral-600 whitespace-nowrap">
                      {formatNairaExact(order.balance)}
                    </td>
                    <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-4">
                      <select
                        aria-label={`Change status for ${order.reference}`}
                        value=""
                        disabled={busy === order.reference}
                        onChange={(e) => e.target.value && updateOrder(order.reference, e.target.value as OrderStatus)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Change…</option>
                        {nextStatuses.filter((s) => s !== order.status).map((s) => (
                          <option key={s} value={s}>{orderStatusLabel(s)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-neutral-600">
                {stats.carsAvailable} available · {stats.carsReserved} reserved · {stats.carsSold} sold
              </p>
              <button
                onClick={() => setEditing({})}
                className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                + Add a car
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full text-sm min-w-205">
                <thead className="bg-neutral-50 text-left">
                  <tr className="text-[11px] uppercase tracking-wider text-neutral-500">
                    <th className="px-5 py-3 font-medium">Car</th>
                    <th className="px-5 py-3 font-medium">Condition</th>
                    <th className="px-5 py-3 font-medium text-right">Price</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Listed</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.cars.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-neutral-500">
                      No cars yet. Add your first listing above.
                    </td></tr>
                  )}
                  {data.cars.map((car) => (
                    <tr key={car.id} className="hover:bg-neutral-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={car.images[0] || '/logo.png'}
                            alt=""
                            className="h-12 w-16 rounded-lg object-cover bg-neutral-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link href={`/cars/${car.slug}`} className="font-medium text-neutral-900 hover:underline">
                              {car.title}
                            </Link>
                            <p className="text-xs text-neutral-500">
                              {car.location || '—'}
                              {car.featured && <span className="ml-2 text-green-700">Featured</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-neutral-600">{conditionLabels[car.condition]}</td>
                      <td className="px-5 py-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                        {formatNairaExact(car.price)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                          car.status === 'available' ? 'bg-green-50 text-green-800 border-green-200'
                            : car.status === 'reserved' ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-500 whitespace-nowrap">
                        {formatDate(car.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button onClick={() => setEditing({ car })} className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCar(car)}
                          disabled={busy === car.id}
                          className="ml-4 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full text-sm min-w-205">
              <thead className="bg-neutral-50 text-left">
                <tr className="text-[11px] uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium text-right">Orders</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.users.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-neutral-500">No users yet.</td></tr>
                )}
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/60">
                    <td className="px-5 py-4 font-medium text-neutral-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-neutral-700">{u.email}</p>
                      <p className="text-xs text-neutral-500">{u.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      {[u.city, u.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize text-neutral-700">{u.userType}</span>
                      {u.role === 'admin' && <span className="ml-2 text-xs text-green-700">admin</span>}
                      {u.verified && <span className="ml-2 text-xs text-neutral-500">verified</span>}
                    </td>
                    <td className="px-5 py-4 text-right text-neutral-900">{u._count.orders}</td>
                    <td className="px-5 py-4 text-xs text-neutral-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'alerts' && (
          <div className="mt-6 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Notifications</h2>
                {stats.unreadNotifications > 0 && (
                  <button onClick={markAllRead} className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                    Mark all as read
                  </button>
                )}
              </div>
              <ul className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {data.notifications.length === 0 && (
                  <li className="px-5 py-10 text-center text-neutral-500">Nothing yet.</li>
                )}
                {data.notifications.map((n) => (
                  <li key={n.id} className={`px-5 py-4 flex gap-4 ${n.read ? '' : 'bg-green-50/40'}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-neutral-300' : 'bg-green-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900">{n.title}</p>
                      <p className="text-sm text-neutral-600 mt-0.5">{n.body}</p>
                      <p className="text-xs text-neutral-400 mt-1.5">
                        {new Date(n.createdAt).toLocaleString('en-NG', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                        {n.smsSent === false && (
                          <span className="ml-2 text-amber-700">SMS not delivered{n.smsError ? ` — ${n.smsError}` : ''}</span>
                        )}
                        {n.smsSent === true && <span className="ml-2 text-green-700">SMS sent</span>}
                      </p>
                    </div>
                    {n.href && (
                      <Link href={n.href} className="shrink-0 self-center text-sm font-medium text-green-700 hover:underline">
                        Open
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-1">
                Waiting on stock
              </h2>
              <p className="text-sm text-neutral-500 mb-4">
                People who asked to be told when a car lands. Call them first when it does.
              </p>
              <ul className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {data.stockAlerts.length === 0 && (
                  <li className="px-5 py-10 text-center text-neutral-500">Nobody waiting yet.</li>
                )}
                {data.stockAlerts.map((a) => (
                  <li key={a.id} className="px-5 py-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-60">
                      <p className="font-medium text-neutral-900">{a.listingTitle}</p>
                      <p className="text-sm text-neutral-600">{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>
                    </div>
                    <span className="text-xs text-neutral-400">{formatDate(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'sellers' && (
          <ul className="mt-6 rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            {data.applications.length === 0 && (
              <li className="px-5 py-10 text-center text-neutral-500">No applications yet.</li>
            )}
            {data.applications.map((app) => (
              <li key={app.id} className="px-5 py-5 flex flex-wrap gap-4 items-start">
                <div className="flex-1 min-w-60">
                  <p className="font-medium text-neutral-900">
                    {app.shopName}
                    <span className="ml-2 text-sm font-normal text-neutral-500">
                      {app.firstName} {app.lastName}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {app.businessType} · {app.carsPerMonth || 'unspecified'} cars/month · {app.city}, {app.state}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">{app.email} · {app.phone}</p>
                  {app.about && <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{app.about}</p>}
                </div>

                {app.status === 'pending' ? (
                  <div className="flex gap-2 shrink-0">
                    <button disabled={busy === app.id} onClick={() => reviewApplication(app.id, 'approved')}
                      className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                      Approve
                    </button>
                    <button disabled={busy === app.id} onClick={() => reviewApplication(app.id, 'rejected')}
                      className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                    app.status === 'approved'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}>
                    {app.status}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <p className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className={`mt-2 text-lg font-semibold tracking-tight ${tone === 'green' ? 'text-green-700' : 'text-neutral-900'}`}>
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full px-5 py-2 text-sm font-medium transition-colors',
        active ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
