// pages/_document.jsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* You can add custom fonts, meta tags, etc. here */}
        <meta name="description" content="Batch-Tracking Application" />
        <link rel="icon" href="/favicon.ico" /> {/* Make sure you have a favicon.ico in public/ */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}