'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { formatNairaExact } from '@/lib/carData';
import { OrderStatusBadge, orderStatusLabel } from '@/components/OrderStatusBadge';
import type { Order, OrderStatus } from '@/lib/models/Order';
import type { Notification } from '@/lib/models/Notification';
import type { SellerApplication } from '@/lib/models/SellerApplication';

interface Overview {
  stats: {
    collected: number;
    outstanding: number;
    paidOrders: number;
    pendingOrders: number;
    unreadNotifications: number;
    sellerApplications: number;
  };
  orders: Order[];
  notifications: Notification[];
  applications: SellerApplication[];
}

type Tab = 'orders' | 'alerts' | 'sellers';

const nextStatuses: OrderStatus[] = ['paid', 'in-transit', 'ready', 'completed', 'cancelled'];

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('orders');
  const [busy, setBusy] = useState<string | null>(null);

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
          <button
            onClick={load}
            className="mt-6 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
          >
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

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
          Admin
        </p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
          Morning, {adminName}.
        </h1>
        <p className="mt-3 text-neutral-600">
          Every payment request, order and seller application in one place.
        </p>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Collected" value={formatNairaExact(stats.collected)} tone="green" />
          <Stat label="Outstanding" value={formatNairaExact(stats.outstanding)} />
          <Stat label="Awaiting payment" value={String(stats.pendingOrders)} />
          <Stat label="Paid orders" value={String(stats.paidOrders)} />
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>
            Orders ({data.orders.length})
          </TabButton>
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
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-neutral-500">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {data.orders.map((order) => (
                  <tr key={order.reference} className="hover:bg-neutral-50/60">
                    <td className="px-5 py-4 font-mono text-xs text-neutral-900 whitespace-nowrap">
                      <Link href={`/orders/${order.reference}`} className="hover:underline">
                        {order.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-900">{order.buyerName}</p>
                      <p className="text-xs text-neutral-500">{order.buyerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-neutral-900">{order.listingTitle}</p>
                      <p className="text-xs text-neutral-500 capitalize">{order.kind}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                      {formatNairaExact(order.amountDueNow)}
                    </td>
                    <td className="px-5 py-4 text-right text-neutral-600 whitespace-nowrap">
                      {formatNairaExact(order.balance)}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        aria-label={`Change status for ${order.reference}`}
                        value=""
                        disabled={busy === order.reference}
                        onChange={(e) =>
                          e.target.value && updateOrder(order.reference, e.target.value as OrderStatus)
                        }
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Change…</option>
                        {nextStatuses
                          .filter((s) => s !== order.status)
                          .map((s) => (
                            <option key={s} value={s}>
                              {orderStatusLabel(s)}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'alerts' && (
          <div className="mt-6">
            {stats.unreadNotifications > 0 && (
              <button
                onClick={markAllRead}
                className="mb-4 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Mark all as read
              </button>
            )}
            <ul className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
              {data.notifications.length === 0 && (
                <li className="px-5 py-10 text-center text-neutral-500">Nothing yet.</li>
              )}
              {data.notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-5 py-4 flex gap-4 ${n.read ? '' : 'bg-green-50/40'}`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? 'bg-neutral-300' : 'bg-green-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900">{n.title}</p>
                    <p className="text-sm text-neutral-600 mt-0.5">{n.body}</p>
                    <p className="text-xs text-neutral-400 mt-1.5">
                      {new Date(n.createdAt).toLocaleString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {n.smsSent === false && (
                        <span className="ml-2 text-amber-700">
                          SMS not delivered{n.smsError ? ` — ${n.smsError}` : ''}
                        </span>
                      )}
                      {n.smsSent === true && <span className="ml-2 text-green-700">SMS sent</span>}
                    </p>
                  </div>
                  {n.href && (
                    <Link
                      href={n.href}
                      className="shrink-0 self-center text-sm font-medium text-green-700 hover:underline"
                    >
                      Open
                    </Link>
                  )}
                </li>
              ))}
            </ul>
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
                    {app.businessType} · {app.carsPerMonth || 'unspecified'} cars/month ·{' '}
                    {app.city}, {app.state}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {app.email} · {app.phone}
                  </p>
                  {app.about && (
                    <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{app.about}</p>
                  )}
                </div>

                {app.status === 'pending' ? (
                  <div className="flex gap-2 shrink-0">
                    <button
                      disabled={busy === app.id}
                      onClick={() => reviewApplication(app.id, 'approved')}
                      className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busy === app.id}
                      onClick={() => reviewApplication(app.id, 'rejected')}
                      className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                      app.status === 'approved'
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'green';
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <p className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p
        className={`mt-2 text-xl font-semibold tracking-tight ${
          tone === 'green' ? 'text-green-700' : 'text-neutral-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full px-5 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-neutral-900 text-white'
          : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
