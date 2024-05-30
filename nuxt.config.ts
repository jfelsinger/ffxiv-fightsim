import glsl from 'vite-plugin-glsl';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },

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
        '@nuxt/content',
        '@nuxt/image',
    ]
})
