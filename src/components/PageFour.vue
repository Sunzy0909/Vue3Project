<template>
  <div class="olympic-youth-container">
    <img src="/assets/olympic-background.png" class="background-image" alt="奥运背景">
    
    <div class="olympic-rings">
      <div class="ring blue"></div>
      <div class="ring yellow"></div>
      <div class="ring black"></div>
      <div class="ring green"></div>
      <div class="ring red"></div>
    </div>

    <!-- 毛玻璃块 -->
    <div class="glass-overlay">
      <h1 class="site-title">Olympic Data Visualization Website</h1>
    </div>
  </div>
</template>

<style scoped>
.olympic-youth-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(1.1) saturate(1.1);
  transition: all 0.5s ease;
}

.olympic-rings {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  z-index: 1;
  opacity: 1;
}

.ring {
  width: 80px;
  height: 80px;
  border: 8px solid;
  border-radius: 50%;
  position: relative;
  margin: 0 -16px;
}

.blue { 
  border-color: rgb(0, 133, 199);
  z-index: 1;
}

.yellow { 
  border-color: rgb(244, 195, 0);
  z-index: 2;
  transform: translateY(50%);
}

.black { 
  border-color: rgb(0, 0, 0); 
  z-index: 5;
}

.green { 
  border-color: rgb(0, 159, 61); 
  z-index: 3;
  transform: translateY(50%);
}

.red { 
  border-color: rgb(223, 0, 36);
  z-index: 4;
}

.glass-overlay {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0); /* 半透明背景 */
  border-radius: 10px;
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.site-title {
  font-size: 40px;
  color: white;
  font-weight: bold;
  text-align: center;
}

@media (max-width: 768px) {
  .ring {
    width: 48px; 
    height: 48px; 
    border-width: 5px;
    margin: 0 -10px; 
  }
  
  .olympic-rings {
    bottom: 70px;
  }

  .glass-overlay {
    padding: 15px 30px;
  }

  .site-title {
    font-size: 24px;
  }
}
</style>
