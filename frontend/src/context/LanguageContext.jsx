import { createContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../utils/constants';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === LANGUAGES.FR ? LANGUAGES.EN : LANGUAGES.FR;
    changeLanguage(newLang);
  };

  const value = {
    language: i18n.language,
    changeLanguage,
    toggleLanguage,
    t,
    isFrench: i18n.language === LANGUAGES.FR,
    isEnglish: i18n.language === LANGUAGES.EN,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
