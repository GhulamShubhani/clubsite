"use client";

import { useEffect, useState } from "react";

type Plan = {
  key: string;
  name: string;
  pageLimit: number;
  storageMbLimit: number;
  price: number;
};

type Subscription = {
  status: string;
  planKey: string;
  trialEndsAt: string;
  pageLimit: number;
  storageMbLimit: number;
};

type Trial = {
  status: string;
  planKey: string;
  trialEndsAt: string;
  isExpired: boolean;
  blocksPublishing: boolean;
  remainingMs: number;
};

export default function AdminSubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/subscription");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load subscription");
      return;
    }
    setPlans(data.plans ?? []);
    setSubscription(data.subscription ?? data.current);
    setTrial(data.trial);
  }

  useEffect(() => {
    void load();
  }, []);

  async function switchPlan(planKey: string) {
    setBusy(planKey);
    setError(null);
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upgrade failed");
      setSubscription(data.subscription);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setBusy(null);
    }
  }

  const expired =
    trial?.isExpired ||
    trial?.blocksPublishing ||
    subscription?.status === "EXPIRED";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Subscription</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {subscription && (
        <section className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          <p>
            Current plan:{" "}
            <span className="font-medium text-zinc-900">
              {subscription.planKey}
            </span>{" "}
            · {subscription.status}
          </p>
          <p>
            Limits: {subscription.pageLimit} pages ·{" "}
            {subscription.storageMbLimit} MB storage
          </p>
          {trial && (
            <p className="mt-1">
              Trial ends {new Date(trial.trialEndsAt).toLocaleString()} (
              {Math.max(0, Math.round(trial.remainingMs / 60_000))} min left)
            </p>
          )}
        </section>
      )}

      {expired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Your trial has expired</p>
          <p className="mt-1">
            Publishing is blocked until you upgrade. Choose a plan below.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const current = subscription?.planKey === plan.key;
          return (
            <div
              key={plan.key}
              className={`rounded-lg border bg-white p-5 ${
                current ? "border-zinc-900" : "border-zinc-200"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-zinc-900">
                  {plan.name}
                </h2>
                <p className="text-zinc-900">
                  {plan.price === 0 ? (
                    <span className="text-sm font-medium">Free</span>
                  ) : (
                    <>
                      <span className="text-2xl font-semibold">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-zinc-500">/mo</span>
                    </>
                  )}
                </p>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                <li>{plan.pageLimit.toLocaleString()} pages</li>
                <li>
                  {(plan.storageMbLimit / 1000 >= 1
                    ? `${plan.storageMbLimit / 1000} GB`
                    : `${plan.storageMbLimit} MB`
                  )}{" "}
                  storage
                </li>
              </ul>
              <button
                type="button"
                disabled={current || busy !== null}
                onClick={() => void switchPlan(plan.key)}
                className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {current
                  ? "Current plan"
                  : busy === plan.key
                    ? "Switching…"
                    : plan.price === 0
                      ? "Switch to trial"
                      : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500">
        MVP: plan changes apply immediately with no payment gateway.
      </p>
    </div>
  );
}
