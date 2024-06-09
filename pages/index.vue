<template>
    <div>
        <div class="fixed left-0 top-0 overflow-hidden w-full max-h-screen max-w-screen h-screen z-[-1]">
            <Babylon :skip-character="true" />
        </div>
        <div class="p-6">
            <div class="max-w-xl">
                <h1 class="text-5xl font-bold mb-6">
                    XIV FIGHTSIM
                </h1>
                <div class="rounded bg-base-200 my-4 p-2 px-4 prose text-left">
                    <p>
                        A tool that attempts to simulate fights &amp; raid encounters
                        from the critically acclaimed, hit MMO Final Fantasy XIV.
                    </p>

                    <p>
                        Learn encounters &amp; mechanics in a way that feels like the real thing,
                        and without the stress of PF.
                    </p>
                </div>
            </div>

            <ul class="menu bg-base-200 menu-horizontal rounded-box my-2 mt-0">
                <li>
                    <NuxtLink to="/">
                        <Icon name="solar:home-2-broken" />
                        Home
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/updates">
                        <Icon name="solar:pen-broken" />
                        Updates
                    </NuxtLink>
                </li>
            </ul>

            <hr class="opacity-50 m-2 mx-4">


            <div class="flex justify-center">
                <div class="p-2 xl:w-2/3">
                    <h2 class="text-2xl my-2 text-base-300 font-thin">Available Encounters</h2>
                    <p class="text-base-300 font-thin my-2 mb-4">
                        Sorry, there's only the one right now. More to come!
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-wrap justify-center">
                        <div class="card bg-base-100/50 glass">
                            <div class="card-body">
                                <h2 class="card-title">E12S Primal Unions</h2>
                                <p>Positioning for the primal combination AOEs in Eden's Promise: Eternity (E12 / E12S)</p>
                                <div class="card-actions justify-end">
                                    <NuxtLink to="/raids/e12s/primal-combinations" class="btn min-w-20">Play
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>
