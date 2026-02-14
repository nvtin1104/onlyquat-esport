import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "@/app/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: { default: "OnlyQuat eSport", template: "%s | OnlyQuat eSport" },
    description:
      locale === "vi"
        ? "Nền tảng giải đấu eSport — giải đấu, đội tuyển, tin tức, minigame"
        : "eSport tournament platform — tournaments, teams, news, minigames",
    openGraph: {
      type: "website",
      siteName: "OnlyQuat eSport",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-image.svg"],
    },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "vi" | "en")) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-body min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <Header />
            <PageTransitionWrapper>
              <main className="pt-16">{children}</main>
            </PageTransitionWrapper>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
