export function computePricing(input: {
  entryAt: Date;
  exitAt: Date;
  graceMinutes: number;
  maxDaily?: number | null;
  couponCode?: string | null;
  partnerValidationCode?: string | null;
  manualDiscount?: number;
  firstHourValue?: number;
  nextHourValue?: number;
}) {
  const diffMs = Math.max(0, input.exitAt.getTime() - input.entryAt.getTime());
  const stayMinutes = Math.ceil(diffMs / 60000);

  if (stayMinutes <= input.graceMinutes) {
    return {
      stayMinutes,
      originalAmount: 0,
      discountAmount: input.manualDiscount ?? 0,
      extraAmount: 0,
      finalAmount: 0,
      appliedRules: ["tolerancia inicial"]
    };
  }

  const billableMinutes = stayMinutes - input.graceMinutes;
  const billableHours = Math.ceil(billableMinutes / 60);
  const firstHour = input.firstHourValue ?? 12;
  const nextHours = Math.max(0, billableHours - 1) * (input.nextHourValue ?? 6);
  let originalAmount = firstHour + nextHours;

  if (input.maxDaily) {
    originalAmount = Math.min(originalAmount, input.maxDaily);
  }

  const automaticDiscount = input.manualDiscount ?? (input.couponCode || input.partnerValidationCode ? 4 : 0);
  const finalAmount = Math.max(0, originalAmount - automaticDiscount);

  return {
    stayMinutes,
    originalAmount,
    discountAmount: automaticDiscount,
    extraAmount: 0,
    finalAmount,
    appliedRules: [
      "1a hora",
      billableHours > 1 ? `${billableHours - 1} fracoes adicionais` : "sem fracoes adicionais",
      automaticDiscount > 0 ? "desconto aplicado" : "sem desconto"
    ]
  };
}

