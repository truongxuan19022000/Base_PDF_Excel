import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import jp from './locales/jp'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      jp,
    },
    fallbackLng: 'jp',
    lng: 'jp',

    interpolation: {
      escapeValue: false,
    },

    react: {
      wait: true,
    },
  })

export default i18n
