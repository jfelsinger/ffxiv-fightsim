<script setup lang="ts">
const {
    hits,
    currentStreak,
    longestStreak,
    isHit,
    resetRecord,
} = useHits();
</script>

<template>
    <div class="dropdown dropdown-hover">
        <div tabindex="0" role="button">
            Hits:
            <span class="countdown font-mono">
                <span :style="{ '--value': hits }"></span>
            </span>
        </div>
        <ul class="dropdown-content menu bg-base-100 rounded-box p-2 min-w-max">
            <li>
                <p>
                    Current Streak:
                    <span class="countdown font-mono min-w-12 text-right">
                        <span :style="{ '--value': currentStreak }"></span>
                    </span>
                </p>
            </li>
            <li>
                <p>
                    Longest Streak:
                    <span class="countdown font-mono">
                        <span :style="{ '--value': longestStreak }"></span>
                    </span>
                </p>
            </li>
            <li>
                <a href="#" @click="resetRecord">
                    Reset Streaks
                </a>
            </li>
        </ul>
    </div>

</template>
