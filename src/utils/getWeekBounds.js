const weekEndInZone = endOfWeek(zonedDate, { weekStartsOn: 1 });
import { startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
/**
 * Розраховує початок та кінець тижня для заданої дати з урахуванням часової зони.
 * @param {Date} date - Вхідна дата (об'єкт Date, що представляє момент в UTC).
 * @param {string} tz - Часова зона (наприклад, 'Europe/Kyiv').
 * @returns {{weekStart: Date, weekEnd: Date}} - Об'єкт з початком та кінцем тижня у форматі UTC Date.
 */
export function getWeekBounds(date, tz) {
  // 1. Інтерпретуємо UTC дату в контексті часової зони користувача.
  const zonedDate = toZonedTime(date, tz);

  // 2. Знаходимо початок та кінець тижня в цій часовій зоні (понеділок - перший день).
  const weekStartInZone = startOfWeek(zonedDate, { weekStartsOn: 1 });
  return {
    // 3. Конвертуємо результат назад в UTC для запитів до БД.
    weekStart: fromZonedTime(weekStartInZone, tz),
    weekEnd: fromZonedTime(weekEndInZone, tz),
  };
}
