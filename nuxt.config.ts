import glsl from 'vite-plugin-glsl';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },

    runtimeConfig: {
        public: {
            posthogPublicKey: 'phc_ciwvnZ8zRN5wAplUtGB2Z9h4QYYICwdxOjeKcCMDO5O',
            posthogHost: 'https://us.i.posthog.com',
            sentryDsn: 'https://d24fcbfa8584af0cdf53e285f7916b93@o4507425505542144.ingest.us.sentry.io/4507425533460480',
            sentryOrg: 'fightsim',
            sentryProjectId: 4507425533460480,
        },
    },

    app: {
        head: {
            title: 'XIV FIGHTSIM',
        },
    },

    nitro: {
        preset: 'bun',
        storage: {
        },
        experimental: {
            websocket: true,
            tasks: true,
        },
    },

    experimental: {
        sharedPrerenderData: true,
        componentIslands: true,
        asyncContext: true,
        asyncEntry: true,
        payloadExtraction: true,
    },

    imports: {
        dirs: [
            'stores',
            'materials',
            'glsl',
        ],
    },

    vite: {
        plugins: [
            glsl(),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData:
                        `
                        @use 'sass:math';
                        @use 'sass:color';
                        @import '~/assets/styles/vars.scss';
                        `,
                },
            },
        },
    },


    modules: [
        '@nuxtjs/tailwindcss',
        [
            '@pinia/nuxt', {
                autoImports: ['defineStore', 'acceptHMRUpdate'],
            }
        ],
        '@pinia-plugin-persistedstate/nuxt',
        '@vueuse/nuxt',
        [
            'nuxt-icon',
            { class: 'nx-icon', },
        ],
        [
            'dayjs-nuxt',
            {
                plugins: ['duration'],
            }
        ],
        [
            '@nuxt/content',
            {
                markdown: {
                    anchorLinks: false
                },
            },
        ],
        '@nuxt/image',
    ]
})
