<script setup lang="ts">
useHead({
    title: 'Updates | XIV FIGHTSIM',
    meta: [
        { name: 'description', content: 'Recent announcements, changelogs, and other updates about XIV FIGHTSIM', },
    ],
});

const { data: list } = await useAsyncData(() => {
    return queryCollection('content').where('path', 'LIKE', '/updates/%')
        .order('datetime', 'DESC')
        .select('title', 'description', 'path', 'datetime')
        .all();
});
</script>

<template>
    <div>
        <div class="fixed left-0 top-0 overflow-hidden w-full max-h-screen max-w-screen h-screen z-[-1]">
            <Babylon :skip-character="true" />
        </div>
        <div class="p-6 relative min-h-[100vh]">
            <h1 class="text-5xl font-bold mb-6 absolute z-[-1]">
                XIV FIGHTSIM
            </h1>
            <NavBar />

            <div class="flex justify-center">
                <div class="p-2 md:w-2/3">
                    <h1 class="text-3xl my-2 text-base-300 ">Updates</h1>
                    <p class="text-base-300 font-thin my-2 mb-4">
                        Recent announcements, changelogs, and other updates for
                        this thing.
                    </p>

                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-wrap justify-center">
                        <div v-for="article in list" class="card bg-base-100/50 glass" :key="article.path">
                            <div class="card-body">
                                <h2 class="card-title">
                                    <NuxtLink :to="article.path">
                                        {{ article.title }}
                                    </NuxtLink>
                                </h2>
                                <p>{{ article.description }}</p>
                                <div class="card-actions justify-end items-end">
                                    <p class="text-xs opacity-65">{{ $dayjs(article.datetime).calendar() }}</p>
                                    <NuxtLink :to="article.path" class="btn min-w-20">
                                        Read
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <Footer />
    </div>
</template>
