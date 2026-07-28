export type ModuleProgressSummary = {
  completedModules: number;
  totalModules: number;
  completionPercent: number;
  statValue: string;
  summaryLabel: string;
};

type BuildModuleProgressSummaryInput = {
  completedModules: number;
  totalModules: number;
};

export function buildModuleProgressSummary({
  completedModules,
  totalModules,
}: BuildModuleProgressSummaryInput): ModuleProgressSummary | null {
  if (totalModules <= 0) return null;

  const safeCompleted = Math.max(0, Math.min(completedModules, totalModules));
  const completionPercent = Math.round((safeCompleted / totalModules) * 100);

  return {
    completedModules: safeCompleted,
    totalModules,
    completionPercent,
    statValue: `${safeCompleted}/${totalModules}`,
    summaryLabel:
      safeCompleted === totalModules
        ? `All ${totalModules} modules complete`
        : `${safeCompleted} of ${totalModules} modules complete`,
  };
}
