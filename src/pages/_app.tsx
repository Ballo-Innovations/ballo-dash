// pages/_app.tsx
import "@assets/scss/custom.scss";
import "@assets/css/global.css";
// Page and component stylesheets. Next only allows global CSS here (Next 15).
import "@/assets/scss/loading.scss";
import "@/assets/scss/login.scss";
import "@/assets/scss/data-page.scss";
import "@/assets/scss/statistics-page.scss";
import "@/assets/scss/reports-page.scss";
import "@/assets/scss/platform-report.scss";
import "@/views/Home/Welcome Banner/style.scss";
import "@/views/Home/Home Content/style.scss";
import "@/views/Dashboard/style.scss";
import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import { Ubuntu } from "next/font/google";
import { Provider as ReduxProvider } from "react-redux";
import { RootState, wrapper } from "../toolkit/index";
import { SessionProvider } from "@/contexts/SessionContext";
import { AppProps } from "next/app";
import type { NextPage } from "next";
import { appWithTranslation } from "next-i18next";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import Loading from "@/components/PageLoading";
import AppInitializer from "@/Common/AppInitializer";
import ErrorBoundary from "@/components/ErrorBoundary";

// Self-hosted at build time: no request to Google at runtime.
const appFont = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: any;
};

const MyApp = ({
  Component,
  pageProps,
  ...rest
}: AppPropsWithLayout) => {
  const { store } = wrapper.useWrappedStore(rest);
  const getLayout = Component.getLayout || ((page) => page);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <>
      {/* Expose the self-hosted font to global.css as --font-app. */}
      <style jsx global>{`
        :root {
          --font-app: ${appFont.style.fontFamily};
        }
      `}</style>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Ballo Dashboard</title>
      </Head>
      <SessionProvider>
        <ReduxProvider store={store}>
          <ErrorBoundary>
            <AppProvider>
              <Toaster position="top-center" />
              {loading && <Loading />}
              <AppInitializer />
              {getLayout(<Component {...pageProps} />)}
            </AppProvider>
          </ErrorBoundary>
        </ReduxProvider>
      </SessionProvider>
    </>
  );
};

export default appWithTranslation(MyApp);
