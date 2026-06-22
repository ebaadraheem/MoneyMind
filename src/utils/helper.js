import { format } from "date-fns";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
const getMonthName = (monthIndex) => {
  const date = new Date(0, monthIndex);
  return format(date, "MMM");
};
export { formatCurrency, getMonthName };
