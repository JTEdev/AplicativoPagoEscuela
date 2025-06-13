
import { useLocale } from '../contexts/LocaleContext';

// This hook is a simple wrapper around useLocale to directly expose the 't' function.
// It's mostly for semantic convenience if preferred over directly using useLocale().t.
export const useTranslation = () => {
  const { t, language, setLanguage } = useLocale();
  return { t, language, setLanguage }; // Expose setLanguage as well if needed directly
};
