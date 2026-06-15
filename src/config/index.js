import { getEnvVar } from '../utils/getEnvVar.js';

export const config = {
  defaultTimeZone: getEnvVar('DEFAULT_TIMEZONE', 'Europe/Kyiv'),
  timeZoneEnabled: getEnvVar(ENABLE_TIMEZONE_AWARE) === 'true',
};
