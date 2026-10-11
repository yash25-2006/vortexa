/**
 * Unified Indian Languages Registry & Configuration
 * Sourced from consolidated JSON registry.
 */

import INDIAN_LANGUAGES from '../data/indianLanguagesRegistry.json';

export { INDIAN_LANGUAGES };

export const getActiveLanguages = () => INDIAN_LANGUAGES.filter(l => l.status === 'active');
export const getPendingLanguages = () => INDIAN_LANGUAGES.filter(l => l.status === 'pending_cloud');
export const isLanguageActive = (code) => {
  const lang = INDIAN_LANGUAGES.find(l => l.code === code);
  return lang ? lang.status === 'active' : false;
};
