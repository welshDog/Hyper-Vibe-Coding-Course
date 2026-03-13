export function setupErrorTracking() {
  // Option A: Sentry (free tier = 5k events/month)
  /*
  import * as Sentry from "@sentry/react";
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
  */
  
  // Option B: Simple console + DB logging placeholder
  window.addEventListener("error", (event) => {
    console.error("Unhandled error:", event.error);
    // TODO: Log to Supabase table: error_logs
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}
