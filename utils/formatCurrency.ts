export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
