export function formatPrice(price: number | string, decimals = 2): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "—";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return num.toFixed(decimals);
}

export function formatChange(change: number | string): string {
  const num = typeof change === "string" ? parseFloat(change) : change;
  if (isNaN(num)) return "—";
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}`;
}

export function getChangeColor(change: number | string): string {
  const num = typeof change === "string" ? parseFloat(change) : change;
  if (isNaN(num)) return "text-gray-400";
  return num >= 0 ? "text-green-400" : "text-red-400";
}

export function getChangeBg(change: number | string): string {
  const num = typeof change === "string" ? parseFloat(change) : change;
  if (isNaN(num)) return "bg-gray-400/10";
  return num >= 0 ? "bg-green-400/10" : "bg-red-400/10";
}
