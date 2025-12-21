import { format, parseISO } from "date-fns";

export function FormatDate(dateString: string) {
  if (!dateString) return '';
  try {
    // parse string ke objek Date
    const date = parseISO(dateString);
    // format sesuai kebutuhan, contoh: 11 Aug 2025, 17:05
    return format(date, 'dd MMM yyyy, HH:mm');
  } catch (error) {
    console.error('Invalid date format:', dateString, error);
    return '';
  }
}