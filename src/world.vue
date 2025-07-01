<template>
  <div class="map-container">
    <div class="controls">
      <button @click="startAnimation" :disabled="isAnimating">开始动画</button>
      <button @click="stopAnimation" :disabled="!isAnimating">停止动画</button>
      <button @click="playAllCities" :disabled="isAnimating">快速播放</button>
      <span class="current-city">{{ currentCity }}</span>
    </div>
    <div ref="mapChart" class="map-chart"></div>
    <div v-if="error" class="error-overlay">
      {{ error }}
      <button @click="forceRetry" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

// 奥运会举办城市数据 (1896-2024)
const OLYMPIC_HOST_CITIES = [
  { year: 1896, city: "Athens", country: "Greece", coords: [23.7166, 37.9838] },
  { year: 1900, city: "Paris", country: "France", coords: [2.3522, 48.8566] },
  { year: 1904, city: "St. Louis", country: "United States", coords: [-90.1994, 38.6270] },
  { year: 1908, city: "London", country: "United Kingdom", coords: [-0.1276, 51.5074] },
  { year: 1912, city: "Stockholm", country: "Sweden", coords: [18.0686, 59.3293] },
  { year: 1916, city: "Berlin", country: "Germany", coords: [13.4050, 52.5200] }, // 取消
  { year: 1920, city: "Antwerp", country: "Belgium", coords: [4.4025, 51.2211] },
  { year: 1924, city: "Paris", country: "France", coords: [2.3522, 48.8566] },
  { year: 1928, city: "Amsterdam", country: "Netherlands", coords: [4.8952, 52.3702] },
  { year: 1932, city: "Los Angeles", country: "United States", coords: [-118.2437, 34.0522] },
  { year: 1936, city: "Berlin", country: "Germany", coords: [13.4050, 52.5200] },
  { year: 1940, city: "Tokyo", country: "Japan", coords: [139.6917, 35.6895] }, // 取消
  { year: 1944, city: "London", country: "United Kingdom", coords: [-0.1276, 51.5074] }, // 取消
  { year: 1948, city: "London", country: "United Kingdom", coords: [-0.1276, 51.5074] },
  { year: 1952, city: "Helsinki", country: "Finland", coords: [24.9384, 60.1699] },
  { year: 1956, city: "Melbourne", country: "Australia", coords: [144.9631, -37.8136] },
  { year: 1960, city: "Rome", country: "Italy", coords: [12.4964, 41.9028] },
  { year: 1964, city: "Tokyo", country: "Japan", coords: [139.6917, 35.6895] },
  { year: 1968, city: "Mexico City", country: "Mexico", coords: [-99.1332, 19.4326] },
  { year: 1972, city: "Munich", country: "Germany", coords: [11.5820, 48.1351] },
  { year: 1976, city: "Montreal", country: "Canada", coords: [-73.5673, 45.5017] },
  { year: 1980, city: "Moscow", country: "Soviet Union", coords: [37.6173, 55.7558] },
  { year: 1984, city: "Los Angeles", country: "United States", coords: [-118.2437, 34.0522] },
  { year: 1988, city: "Seoul", country: "South Korea", coords: [126.9780, 37.5665] },
  { year: 1992, city: "Barcelona", country: "Spain", coords: [2.1734, 41.3851] },
  { year: 1996, city: "Atlanta", country: "United States", coords: [-84.3880, 33.7490] },
  { year: 2000, city: "Sydney", country: "Australia", coords: [151.2093, -33.8688] },
  { year: 2004, city: "Athens", country: "Greece", coords: [23.7166, 37.9838] },
  { year: 2008, city: "Beijing", country: "China", coords: [116.4074, 39.9042] },
  { year: 2012, city: "London", country: "United Kingdom", coords: [-0.1276, 51.5074] },
  { year: 2016, city: "Rio de Janeiro", country: "Brazil", coords: [-43.1729, -22.9068] },
  { year: 2020, city: "Tokyo", country: "Japan", coords: [139.6917, 35.6895] },
  { year: 2024, city: "Paris", country: "France", coords: [2.3522, 48.8566] }
].filter(city => ![1916, 1940, 1944].includes(city.year)); // 过滤掉被取消的奥运会

export default {
  setup() {
    const mapChart = ref(null);
    const error = ref(null);
    const isAnimating = ref(false);
    const currentCity = ref("");
    const animationInterval = ref(null);
    let mapInstance = null;
    let currentIndex = 0;

    // 加载世界地图数据
    const loadWorldData = async () => {
      const fallbackData = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { name: "China" },
          geometry: {
            type: "Polygon",
            coordinates: [[[116.4,39.9],[121.4,31.2],[113.5,22.2],[108.9,34.3],[116.4,39.9]]]
          }
        }]
      };

      try {
        const localRes = await fetch('/data/world.json');
        if (localRes.ok) {
          const data = await localRes.json();
          if (data.features) return data;
        }

        const cdnRes = await fetch('https://cdn.jsdelivr.net/npm/echarts@5.4.3/map/json/world.json');
        if (cdnRes.ok) return await cdnRes.json();

        return fallbackData;
      } catch (e) {
        console.error('加载地图数据失败:', e);
        return fallbackData;
      }
    };

    // 初始化地图
    const initMapChart = async (isRetry = false) => {
      try {
        if (mapInstance) {
          mapInstance.dispose();
          mapInstance = null;
        }

        await new Promise(resolve => setTimeout(resolve, isRetry ? 1000 : 200));

        if (!mapChart.value) {
          throw new Error('地图容器未找到');
        }

        const worldJson = await loadWorldData();
        echarts.registerMap('world', worldJson);

        const option = {
          backgroundColor: '#ffffff',
          title: {
            text: '奥运会举办城市 (1896-2024)',
            left: 'center',
            top: 10,
            textStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: params => {
              if (params.seriesType === 'scatter') {
                return `${params.data.city} (${params.data.year})<br/>${params.data.country}`;
              }
              return params.name;
            }
          },
          visualMap: {
            min: 1896,
            max: 2024,
            text: ['2024', '1896'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['#50a3ba', '#eac736', '#d94e5d']
            },
            left: 'right',
            top: 'bottom'
          },
          geo: {
            map: 'world',
            zoom: 1.0,
            center: [0, 30], // 初始中心点
            itemStyle: {
              areaColor: '#e0e0e0',
              borderColor: '#ffffff',
              borderWidth: 0.5
            },
            emphasis: {
              itemStyle: {
                areaColor: '#b2c582'
              }
            }
          },
          series: [
            {
              name: '奥运会城市',
              type: 'scatter',
              coordinateSystem: 'geo',
              data: [],
              symbolSize: 8,
              encode: {
                value: 2
              },
              label: {
                formatter: '{b}',
                position: 'right',
                show: false
              },
              emphasis: {
                label: {
                  show: true
                }
              },
              itemStyle: {
                color: '#d94e5d'
              }
            },
            {
              name: '当前城市',
              type: 'effectScatter',
              coordinateSystem: 'geo',
              data: [],
              symbolSize: 15,
              showEffectOn: 'render',
              rippleEffect: {
                brushType: 'stroke',
                scale: 5,
                period: 3
              },
              hoverAnimation: true,
              label: {
                formatter: '{b} ({c})',
                position: 'right',
                show: true,
                fontSize: 12,
                fontWeight: 'bold',
                color: '#333'
              },
              itemStyle: {
                color: '#ff0000',
                shadowBlur: 10,
                shadowColor: '#333'
              },
              zlevel: 1
            }
          ]
        };

        mapInstance = echarts.init(mapChart.value);
        mapInstance.setOption(option);
        error.value = null;
      } catch (err) {
        error.value = `初始化失败: ${err.message}`;
        console.error('初始化失败:', err);
      }
    };

    // 开始动画
    const startAnimation = () => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      currentIndex = 0;
      animateNextCity();
    };

    // 停止动画
    const stopAnimation = () => {
      isAnimating.value = false;
      if (animationInterval.value) {
        clearTimeout(animationInterval.value);
        animationInterval.value = null;
      }
      
      // 清除当前城市标记
      if (mapInstance) {
        const option = mapInstance.getOption();
        option.series[1].data = [];
        mapInstance.setOption(option);
      }
      
      currentCity.value = "";
    };

    // 一键播放所有城市
    const playAllCities = () => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      currentIndex = 0;
      
      // 快速显示所有城市
      const showAllCities = () => {
        if (currentIndex >= OLYMPIC_HOST_CITIES.length) {
          stopAnimation();
          return;
        }

        const cityData = OLYMPIC_HOST_CITIES[currentIndex];
        currentCity.value = `${cityData.year} ${cityData.city}, ${cityData.country}`;

        if (mapInstance) {
          const option = mapInstance.getOption();
          
          // 添加所有城市到散点图
          option.series[0].data = OLYMPIC_HOST_CITIES.slice(0, currentIndex + 1).map(c => ({
            name: c.city,
            city: c.city,
            country: c.country,
            year: c.year,
            value: [...c.coords, c.year]
          }));
          
          // 设置当前城市为动画点
          option.series[1].data = [{
            name: cityData.city,
            city: cityData.city,
            country: cityData.country,
            year: cityData.year,
            value: [...cityData.coords, cityData.year]
          }];
          
          // 移动地图到当前城市
          mapInstance.setOption({
            geo: {
              center: cityData.coords,
              zoom: 1.5
            }
          });
          
          mapInstance.setOption(option);
        }

        currentIndex++;
        animationInterval.value = setTimeout(showAllCities, 300); // 更短的间隔
      };
      
      showAllCities();
    };

    // 动画显示下一个城市
    const animateNextCity = () => {
      if (!isAnimating.value || currentIndex >= OLYMPIC_HOST_CITIES.length) {
        stopAnimation();
        return;
      }

      const cityData = OLYMPIC_HOST_CITIES[currentIndex];
      currentCity.value = `${cityData.year} ${cityData.city}, ${cityData.country}`;

      // 更新地图数据
      if (mapInstance) {
        const option = mapInstance.getOption();
        
        // 添加所有城市到散点图
        option.series[0].data = OLYMPIC_HOST_CITIES.slice(0, currentIndex + 1).map(c => ({
          name: c.city,
          city: c.city,
          country: c.country,
          year: c.year,
          value: [...c.coords, c.year]
        }));
        
        // 设置当前城市为动画点
        option.series[1].data = [{
          name: cityData.city,
          city: cityData.city,
          country: cityData.country,
          year: cityData.year,
          value: [...cityData.coords, cityData.year]
        }];
        
        // 使用roam和center来移动地图
        mapInstance.setOption({
          geo: {
            center: cityData.coords,
            zoom: 1.5,
            animation: true,
            animationDuration: 1500,
            animationEasing: 'cubicOut'
          }
        });
        
        mapInstance.setOption(option);
      }

      currentIndex++;
      animationInterval.value = setTimeout(animateNextCity, 1200); // 增加动画间隔
    };

    const forceRetry = () => {
      error.value = '正在重试...';
      setTimeout(() => initMapChart(true), 300);
    };

    // 组件挂载后初始化
    onMounted(async () => {
      try {
        await initMapChart();
        
        // 添加窗口大小变化监听
        window.addEventListener('resize', () => {
          mapInstance?.resize();
        });
      } catch (err) {
        error.value = `初始化失败: ${err.message}`;
      }
    });

    return { 
      mapChart, 
      error,
      isAnimating,
      currentCity,
      startAnimation,
      stopAnimation,
      playAllCities,
      forceRetry
    };
  }
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #ffffff;
}

.map-chart {
  width: 100%;
  height: 100%;
}

.controls {
  margin-top: 100px;
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.controls button {
  
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover {
  background: #f0f0f0;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-city {
  margin-left: 10px;
  font-weight: bold;
  color: #333;
  min-width: 250px;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  text-align: center;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.retry-btn {
  padding: 5px 10px;
  margin-left: 10px;
  background: white;
  color: #ff0000;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
</style>