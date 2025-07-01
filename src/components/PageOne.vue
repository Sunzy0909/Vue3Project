<template>
  <div class="page-one-container">
    <WorldMap />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import WorldMap from './WorldMap.vue';
</script>

<style scoped>
.page-one-container {
  background-image: url('/assets/olympic-background.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgb(10, 10, 10);
}

.page-title {
  color: #fff;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}


</style>

