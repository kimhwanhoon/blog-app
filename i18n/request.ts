import { getRequestConfig } from "next-intl/server";

export const defaultLocale = "en" as const;

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
