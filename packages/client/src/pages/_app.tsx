import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Worker } from '@react-pdf-viewer/core';
import React from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

import 'tiptap/fix-match-nodes';
import 'tiptap/core/styles/index.scss';
import { preloadTiptapResources } from 'tiptap/preload';

import { isMobile } from 'helpers/env';
import { DocumentVersionControl } from 'hooks/use-document-version';
import { IsOnMobile } from 'hooks/use-on-mobile';
import { IRuntimeConfig, RuntimeConfig } from 'hooks/use-runtime-config';
import { Theme } from 'hooks/use-theme';
import App from 'next/app';
import Head from 'next/head';

import 'viewerjs/dist/viewer.css';
import 'styles/globals.scss';
import 'thirtypart/array-prototype-at';

class MyApp extends App<{ isMobile: boolean; runtimeConfig: IRuntimeConfig }> {
  state = {
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: true,
          refetchOnWindowFocus: true,
          retry: false,
          staleTime: 10 * 1000, // 默认 10s 数据过期
        },
      },
    }),
  };

  static getInitialProps = async ({ Component, ctx }) => {
    const request = ctx?.req;
    const getPagePropsPromise = Component.getInitialProps ? Component.getInitialProps(ctx) : Promise.resolve({});
    const [pageProps, runtimeConfig] = await Promise.all([
      getPagePropsPromise,
      fetch(`${process.env.SITE_URL}/api/config`).then((res) => {
        return res.json();
      }),
    ]).catch((err) => {
      return [{}, {}];
    });

    return {
      pageProps,
      isMobile: isMobile(request?.headers['user-agent']),
      runtimeConfig,
    };
  };

  componentDidMount() {
    Promise.all([
      import('resize-observer-polyfill'),
      // @ts-ignore
      import('requestidlecallback-polyfill'),
    ]).then(() => {
      preloadTiptapResources();
    });
  }

  render() {
    const { Component, pageProps, isMobile, runtimeConfig } = this.props;
    const { queryClient } = this.state;

    return (
      <>
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
          />
          <meta charSet="utf-8" />
          <meta name="description" content={runtimeConfig.appDescription} />
          <meta name="keywords" content={runtimeConfig.appKeywords}></meta>
          <meta name="application-name" content={runtimeConfig.appName} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={runtimeConfig.appName} />
          <meta name="description" content={runtimeConfig.appDescription} />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#ffffff" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={runtimeConfig.appName} />
          <meta property="og:description" content={runtimeConfig.appDescription} />
          <meta property="og:site_name" content={runtimeConfig.appName} />
          <link rel="manifest" href="/manifest.json" />
          {((process.env.DNS_PREFETCH || []) as string[]).map((url) => (
            <link key={url} rel="dns-prefetch" href={url} />
          ))}
        </Head>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.1.81/build/pdf.worker.js">
          <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
              <Theme.Provider>
                <RuntimeConfig.Provider initialState={runtimeConfig}>
                  <IsOnMobile.Provider initialState={isMobile}>
                    <DocumentVersionControl.Provider initialState={false}>
                      <Component {...pageProps} />
                    </DocumentVersionControl.Provider>
                  </IsOnMobile.Provider>
                </RuntimeConfig.Provider>
              </Theme.Provider>
            </Hydrate>
          </QueryClientProvider>
        </Worker>
      </>
    );
  }
}

export default MyApp;
