import Script from "next/script";
import {
  isValidGoogleAnalyticsId,
  normalizeAnalyticsId,
} from "@/lib/analytics-id";

export function GoogleAnalytics({
  measurementId,
}: {
  measurementId?: string | null;
}) {
  const id = normalizeAnalyticsId(measurementId);
  if (!id || !isValidGoogleAnalyticsId(id)) return null;

  const isGtm = id.toUpperCase().startsWith("GTM-");

  if (isGtm) {
    return (
      <Script id={`gtm-${id}`} strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}
      </Script>
    );
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="afterInteractive"
      />
      <Script id={`ga-${id}`} strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
