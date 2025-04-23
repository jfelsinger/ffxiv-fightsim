<template>
    <div class="navbar bg-base-200/60 bg-blur shadow-xl rounded-box my-6">
        <div class="navbar-start">
            <div class="dropdown">
                <div class="dropdown">
                    <div tabindex="0" role="button" class="text-xl font-bold btn btn-ghost sm:hidden">
                        <Icon name="solar:hamburger-menu-broken" />
                    </div>
                    <ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
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
                </div>
            </div>
            <NuxtLink to="/" class="btn btn-ghost text-xl font-bold text-slate-800">
                XIV FIGHTSIM
            </NuxtLink>
        </div>
        <div class="navbar-center hidden sm:flex">

            <ul class="menu menu-horizontal px-1">
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

        </div>
        <div class="navbar-end px-2 pr-3">
            <Icon class="text-lg" name="solar:star-ring-line-duotone" />
        </div>
    </div>
</template>
