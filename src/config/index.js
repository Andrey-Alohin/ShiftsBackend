import { getEnvVar } from '../utils/getEnvVar.js';

export const config = {
  timeZoneEnabled: getEnvVar('ENABLE_TIMEZONE_AWARE', 'false') === 'true',
  defaultTimeZone: getEnvVar('DEFAULT_TIMEZONE', 'Europe/Kyiv'),
};
