import posthog from 'posthog-js';
import * as Sentry from '@sentry/vue';

export default defineNuxtPlugin((nuxtApp) => {
    const runtimeConfig = useRuntimeConfig();
    const posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey as string, {
        api_host: (runtimeConfig.public.posthogHost || 'https://us.i.posthog.com') as string,
        person_profiles: 'identified_only',
        capture_pageview: false, // we add manual pageview capturing below
        loaded: (posthog) => {
            if (import.meta.env.MODE === 'development') posthog.debug();
        }
    })

    Sentry.init({
        app: nuxtApp.vueApp,
        dsn: runtimeConfig.public.sentryDsn as string,
        integrations: [
            posthog.sentryIntegration({
                organization: runtimeConfig.public.sentryOrg as string,
                projectId: runtimeConfig.public.sentryProjectId as number,
                severityAllowList: ['error', 'info'],
            }),
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],

        // tracesSampleRate: 1.0,
        // tracePropagationTargets: ['localhost', /* /uhh.io/i */],
        // replaysSessionSampleRate: 0.1,
        // replaysOnErrorSampleRate: 1.0,
    });

    // Make sure that pageviews are captured with each route change
    const router = useRouter();
    router.afterEach((to) => {
        nextTick(() => {
            posthog.capture('$pageview', {
                current_url: to.fullPath
            });
        });
    });

    return {
        provide: {
            posthog: () => posthogClient
        }
    }
});
