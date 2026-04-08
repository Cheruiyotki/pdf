export type PlanTier = "free" | "premium";

export type PlanLimit = {
  tier: PlanTier;
  dailyConversions: number | null;
  maxFileSizeMb: number;
  maxBatchFiles: number;
  queuePriority: number;
  fastMode: boolean;
  label: string;
};

export const planLimits: Record<PlanTier, PlanLimit> = {
  free: {
    tier: "free",
    dailyConversions: 3,
    maxFileSizeMb: 10,
    maxBatchFiles: 3,
    queuePriority: 1,
    fastMode: false,
    label: "Free"
  },
  premium: {
    tier: "premium",
    dailyConversions: null,
    maxFileSizeMb: 200,
    maxBatchFiles: 20,
    queuePriority: 10,
    fastMode: true,
    label: "Premium"
  }
};

export const autoDeleteMinutes = 30;
