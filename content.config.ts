import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
    collections: {
        content: defineCollection({
            type: 'page',
            source: '**/*.md',
            schema: z.object({
                title: z.string(),
                category: z.string().optional(),
                description: z.string(),
                datetime: z.date(),
                step: z.number().optional(),
            }),
        }),
        updates: defineCollection({
            type: 'page',
            source: 'updates/**/*.md',
            schema: z.object({
                title: z.string(),
                category: z.string().optional(),
                description: z.string(),
                datetime: z.date(),
                step: z.number().optional(),
            }),
        }),
        data: defineCollection({
            type: 'page',
            source: '**/*.yaml',
            schema: z.object({
                name: z.string(),
                title: z.any().optional(),
                description: z.any().optional(),

                arena: z.record(z.string(), z.any()).optional(),
                arenaType: z.any().optional(),
                scheduling: z.any().optional(),
                sections: z.array(z.any()).optional(),
                waymarks: z.any().optional(),
                waymarksPositionType: z.any().optional(),
                waymarkPositionType: z.any().optional(),
                startPosition: z.any().optional(),
                startPositionType: z.any().optional(),
            }),
        }),
        info: defineCollection({
            type: 'page',
            source: '**/*.info.md',
            schema: z.object({
                title: z.string(),
                category: z.string(),
                description: z.string().optional(),
                datetime: z.date().optional(),
                step: z.number().optional(),
            }),
        }),
    },
});
