import { startOfWeek, endOfWeek } from 'date-fns';

export function getWeekBounds(date) {
  return {
    weekStart: startOfWeek(date, { weekStartsOn: 1 }),
    weekEnd: endOfWeek(date, { weekStartsOn: 1 }),
  };
}
