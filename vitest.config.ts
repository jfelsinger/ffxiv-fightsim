import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
    test: {
        projects: [
            await defineVitestProject({
                test: {
                    name: 'nuxt',
                    include: [
                        'app/**/*\.{test,spec}.ts',
                        'test/{e2e,unit}/*\.{test,spec}.ts'
                    ],
                    environment: 'nuxt',
                },
            }),
        ],
    },
})
