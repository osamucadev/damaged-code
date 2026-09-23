import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";

import { Providers } from "./providers";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");

  return {
    metadataBase: new URL("https://zrp.samuelcaetite.dev"),
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
      siteName: t("title"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
