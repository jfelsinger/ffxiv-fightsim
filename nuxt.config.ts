import glsl from 'vite-plugin-glsl';
import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },

    runtimeConfig: {
        public: {
            posthogPublicKey: 'phc_ciwvnZ8zRN5wAplUtGB2Z9h4QYYICwdxOjeKcCMDO5O',
            posthogHost: 'https://ph.xivfightsim.com',
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
            'utils',
            'utils/arenas',
            'utils/effects',
        ],
        presets: [
            {
                from: '@babylonjs/core',
                imports: [
                    'Vector2',
                    'Vector3',
                    'Vector4',
                    'Color3',
                    { name: '*', as: 'Bab' },
                ],
            },
            {
                from: 'eventemitter3',
                imports: ['EventEmitter'],
            },
            {
                from: 'debug',
                imports: [{ name: 'default', as: 'Debug' }],
            },
        ],
    },

    vite: {
        plugins: [
            glsl(),
            tailwindcss()
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData:
                        `
@use 'sass:math';
@use 'sass:color';
`,
                },
            },
        },
    },

    dayjs: {
        plugins: ['duration', 'calendar'],
    },

    modules: [
        // '@nuxtjs/tailwindcss',
        // [
        //     '@pinia/nuxt',
        //     {
        //         storesDirs: ['./stores/**'],
        //         autoImports: ['usePinia', 'defineStore', 'acceptHMRUpdate'],
        //     }
        // ],
        // '@pinia-plugin-persistedstate/nuxt',
        '@vueuse/nuxt',
        [
            '@nuxt/icon',
            {
                class: 'nx-icon',
                // customCollections: [
                //     {
                //         prefix: 'role',
                //         dir: './public/images/roles',
                //     },
                //     {
                //         prefix: 'role2',
                //         dir: './images/roles',
                //     },
                //     {
                //         prefix: 'role3',
                //         dir: '/images/roles',
                //     },
                //     {
                //         prefix: 'field',
                //         dir: 'public/images/field-icons',
                //     },
                // ],
            },
        ],
        'dayjs-nuxt',
        [
            '@nuxt/content',
            {
                markdown: {
                    anchorLinks: false
                },
            },
        ],
        '@nuxt/image',
    ],

    compatibilityDate: '2024-08-01',
})
