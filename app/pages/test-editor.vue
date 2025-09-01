<script setup lang="ts">
import type { FightOptions } from '~/utils/fights';

const fightData = ref({
    title: 'Fight Title',
    name: 'fight-name',

    sections: [
        {
            item: {
                name: 'section-a',
                mechanics: [
                    {
                        item: {
                            name: 'mechanic-a',
                            effects: [
                                {
                                    item: {
                                        name: 'effect-a1',
                                    },
                                },
                                {
                                    item: {
                                        name: 'effect-a2',
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            item: {
                name: 'section-b',
                mechanics: [
                    {
                        item: {
                            name: 'mechanic-b1',
                            effects: [
                                {
                                    item: {
                                        name: 'effect-b1',
                                    },
                                },
                                {
                                    item: {
                                        name: 'effect-b2',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        item: {
                            name: 'mechanic-b2',
                            effects: [
                                {
                                    item: {
                                        name: 'effect-b3',
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            item: {
                name: 'section-c',
                mechanics: [
                    {
                        item: {
                            name: 'mechanic-c',
                            effects: [
                                {
                                    item: {
                                        name: 'effect-c',
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ]
} as FightOptions);
</script>

<template>
    <div class="p-4">
        <FightEditor v-model="fightData" />
    </div>
</template>
