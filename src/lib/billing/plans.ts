export type PlanKey = "trial" | "starter" | "pro" | "business";

export type PlanDefinition = {
  name: string;
  pageLimit: number;
  storageMbLimit: number;
  price: number;
};

export const PLANS: Record<PlanKey, PlanDefinition> = {
  trial: { name: "Free Trial", pageLimit: 20, storageMbLimit: 500, price: 0 },
  starter: { name: "Starter", pageLimit: 50, storageMbLimit: 2000, price: 19 },
  pro: { name: "Pro", pageLimit: 200, storageMbLimit: 10000, price: 49 },
  business: {
    name: "Business",
    pageLimit: 1000,
    storageMbLimit: 50000,
    price: 99,
  },
};

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export function isPlanKey(key: string): key is PlanKey {
  return key in PLANS;
}

export function getPlan(key: string): PlanDefinition {
  return PLANS[isPlanKey(key) ? key : "trial"];
}
