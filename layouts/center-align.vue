<template>
  <NavigationNavbar />
  <main>
    <slot />
  </main>
</template>

<style lang="scss" scoped>
  main {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
</style>

<script setup lang="ts">

import '~/assets/scss/main.scss';
</script>