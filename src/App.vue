<template>
  <header>
    <div class="nav-container">
    
      <div class="nav-links">
        <router-link to="/main" class="nav-item">Olympic World</router-link>
        <router-link to="/page1" class="nav-item">Top Olympic Performers</router-link>
        <router-link to="/page2" class="nav-item">Olympic Games Archive</router-link>
        <router-link to="/" class="nav-item">Home page</router-link>
      </div>
    </div>
  </header>

  <div class="content-container">
    <!-- 使用自定义的过渡动画 -->
    <transition name="slide-fade">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  console.log('App mounted');
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
  overflow-x: hidden;
}


html {
  overflow-y: scroll; 
}

header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw; 
  z-index: 100;
  background: #314f4f;
  padding: 1rem 0; 
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem; 
  display: flex;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.site-title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 7rem;
}

.nav-item {
  color: #ffffff;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: #f6f5f4;
  transition: width 0.3s ease;
}

.nav-item:hover::after {
  width: 100%;
}

.nav-item.router-link-active {
  background: rgba(34, 85, 102, 0.2);
  box-shadow: 0 0 15px rgba(240, 240, 238, 0.3);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

</style>