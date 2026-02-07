'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log all Core Web Vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(1)}`);
    }

    // Send to analytics endpoint if configured
    const analyticsUrl = process.env['NEXT_PUBLIC_ANALYTICS_URL'];
    if (analyticsUrl) {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      });

      // Use sendBeacon for reliability during page unload
      if (typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(analyticsUrl, body);
      } else {
        void fetch(analyticsUrl, { body, method: 'POST', keepalive: true });
      }
    }
  });

  return null;
}
