import { FormatCurrency } from "$lib/utils/currency.util";
import { FormatDate } from "$lib/utils/date.util";

export const DefaultFormatters = {
  currency: (v: number) => FormatCurrency(v),
  date: (v: string) => FormatDate(v)
};
