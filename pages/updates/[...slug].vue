<template>
    <div>
        <div class="fixed left-0 top-0 overflow-hidden w-full max-h-screen max-w-screen h-screen z-[-1]">
            <Babylon :skip-character="true" />
        </div>
        <div class="p-6 relative">
            <h1 class="text-5xl font-bold mb-6 absolute z-[-1]">
                XIV FIGHTSIM
            </h1>
            <NavBar />

            <div class="flex justify-center items-center">
                <article class="p-2 md:w-2/3 flex flex-col justify-center">
                    <ContentDoc v-slot="{ doc }">
                        <h1 class="text-3xl my-2 text-base-300 ">{{ doc.title }}</h1>
                        <p class="text-base-300 font-thin my-2 mb-4">
                            {{ doc.description }}
                        </p>
                        <p class="text-base-300 font-thin m-1 text-right">
                            <NuxtLink to="/updates" class="opacity-65 hover:opacity-100">
                                Back to updates.
                            </NuxtLink>
                        </p>

                        <div class="min-w-full prose bg-base-200 rounded-box p-4 py-1">
                            <ContentRenderer :value="doc" />
                            <p class="text-sm m-4 text-right opacity-75">
                                posted: {{ doc.datetime }}
                            </p>
                        </div>
                    </ContentDoc>
                </article>
            </div>

        </div>
    </div>
</template>
