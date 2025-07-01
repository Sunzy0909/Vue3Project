<template>
  <div class="map-container">
    <div ref="mapChart" class="map-chart"></div>
    <div v-if="error" class="error-overlay">
      {{ error }} 
      <button @click="forceRetry" class="retry-btn">强制重试</button>
    </div>
    <!-- 国家信息和奖牌图表容器 -->
    <div v-if="selectedCountry" class="country-info-container">
      <div class="country-info">
        Currently selected: <strong>{{ selectedCountry }}</strong>
        <span v-if="!hasMedalData" class="no-data-hint">(No medal data)</span>
      </div>
      <div ref="medalChart" class="medal-chart"></div>
      <div ref="lineChart" class="line-chart"></div>
      <div ref="boxplotChart" class="boxplot-chart"></div>
      <div ref="predictChart" class="predict-chart"></div>
      <div ref="sankeyChart" class="sankey-chart"></div> 
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

export default {
  setup() {
    //世界地图，响应式变量
    const mapChart = ref(null);
    const error = ref(null);
    const selectedCountry = ref(null);
    //奖牌数图表，响应式变量
    const medalChart = ref(null);
    const lineChart = ref(null);
    const boxplotChart = ref(null);
    const predictChart = ref(null);
    const hasMedalData = ref(false);
    const olympicMedalData = ref({});
    const olympicPredictData = ref({});
    //用以存储echarts实例
    let mapInstance = null;
    let medalInstance = null;
    let lineInstance = null;
    let boxplotInstance = null;
    let predictInstance = null;
    // 桑基图响应式变量
    const sankeyChart = ref(null);
    const olympicEventsData = ref({});
    let sankeyInstance = null;

    const loadMedalData = async () => {
      try {
        const response = await fetch('/data/olympic-medals.js');
        const predictResponse = await fetch('/data/olympic-predict.js');
        const eventsResponse = await fetch('/data/olympic-events.js');
        
        const dataText = await response.text();
        const predictText = await predictResponse.text();
        const eventsText = await eventsResponse.text();
        
        const module = { exports: {} };
        const predictModule = { exports: {} };
        const eventsModule = { exports: {} };
        
        new Function('module', dataText)(module);
        new Function('module', predictText)(predictModule);
        new Function('module', eventsText)(eventsModule);
        
        olympicMedalData.value = module.exports || {};
        olympicPredictData.value = predictModule.exports || {};
        olympicEventsData.value = eventsModule.exports || {};
        
        console.log('事件数据加载完成:', olympicEventsData.value);
      } catch (err) {
        console.error('加载数据失败:', err);
        error.value = '加载数据失败';
      }
    };



    //加载世界地图数据
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
        return fallbackData;
      }
    };

    const initMapChart = async (isRetry = false) => {
      try {
        if (mapInstance) {
          mapInstance.dispose();
          mapInstance = null;
        }

        await new Promise(resolve => setTimeout(resolve, isRetry ? 1000 : 200));

        if (!mapChart.value?.offsetParent) {
          throw new Error('地图容器未正确挂载');
        }

        mapInstance = echarts.init(mapChart.value, null, {
          renderer: 'canvas',
          useDirtyRect: false
        });

        const worldJson = await loadWorldData();
        
        echarts.registerMap('world', worldJson);

        const option = {
          backgroundColor: '#ffffff',
          series: [{
            type: 'map',
            map: 'world',
            roam: false,
            selectedMode: 'single',
            itemStyle: {
              color: '#3E7BFA',
              borderColor: '#ffffff',
              borderWidth: 1,
              areaColor: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#e1e1e1'
                }, {
                  offset: 1, color: '#c0c0c0'
                }]
              }
            },
            emphasis: {
              label: { 
                show: true,
                color: '#000000'
              },
              itemStyle: {
                areaColor: '#b2c582'
              }
            },
            select: {
              label: {
                show: true,
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 'bold'
              },
              itemStyle: {
                areaColor: '#688e4e'
              }
            }
          }]
        };

        mapInstance.setOption(option, true);
        
        mapInstance.on('click', (params) => {
          if (params.name) {
            selectedCountry.value = params.name;
          }
        });

        error.value = null;
      } catch (err) {
        error.value = `初始化失败: ${err.message}`;
        console.error('完整错误:', err);
      }
    };

    const initMedalChart = () => {
      if (!medalChart.value || !medalChart.value.offsetParent) {
        setTimeout(initMedalChart, 100);
        return;
      }
      
      if (medalInstance) {
        medalInstance.dispose();
      }
      
      medalInstance = echarts.init(medalChart.value);
      updateMedalChart();
    };

    const initLineChart = () => {
      if (!lineChart.value || !lineChart.value.offsetParent) {
        setTimeout(initLineChart, 100);
        return;
      }
      
      if (lineInstance) {
        lineInstance.dispose();
      }
      
      lineInstance = echarts.init(lineChart.value);
      updateLineChart();
    };

    const initBoxplotChart = () => {
      if (!boxplotChart.value || !boxplotChart.value.offsetParent) {
        setTimeout(initBoxplotChart, 100);
        return;
      }
      
      if (boxplotInstance) {
        boxplotInstance.dispose();
      }
      
      boxplotInstance = echarts.init(boxplotChart.value);
      updateBoxplotChart();
    };

    const initPredictChart = () => {
      if (!predictChart.value || !predictChart.value.offsetParent) {
        setTimeout(initPredictChart, 100);
        return;
      }
      
      if (predictInstance) {
        predictInstance.dispose();
      }
      
      predictInstance = echarts.init(predictChart.value);
      updatePredictChart();
    };

    const updateMedalChart = () => {
      if (!medalInstance || !selectedCountry.value) return;
      
      const dataKey = selectedCountry.value;
      const countryData = olympicMedalData.value[dataKey] || [];
      
      hasMedalData.value = countryData.length > 0;
      
      if (!hasMedalData.value) {
        console.warn(`没有 ${selectedCountry.value} 的奖牌数据 (尝试的键: ${dataKey})`);
        medalInstance.clear();
        return;
      }

      const option = {
        title: {
          text: `Number of medals in previous Olympic Games of the ${selectedCountry.value}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Gold', 'Silver', 'Bronze'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: countryData.map(item => item.year)
        },
        yAxis: {
          type: 'value',
          name: 'Number of medals'
        },
        series: [
          {
            name: 'Gold',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: countryData.map(item => item.gold),
            itemStyle: {
              color: '#182727' // 金色
            }
          },
          {
            name: 'Silver',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: countryData.map(item => item.silver),
            itemStyle: {
              color: '#688e4e' // 银色
            }
          },
          {
            name: 'Bronze',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: countryData.map(item => item.bronze),
            itemStyle: {
              color: '#b2c582' // 铜色
            }
          }
        ]
      };
      
      medalInstance.setOption(option);
    };

    const updateLineChart = () => {
      if (!lineInstance || !selectedCountry.value) return;
      
      const dataKey = selectedCountry.value;
      const countryData = olympicMedalData.value[dataKey] || [];
      
      if (countryData.length === 0) {
        lineInstance.clear();
        return;
      }

      const option = {
        title: {
          text: `Trend of Olympic medal counts for the ${selectedCountry.value}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Gold', 'Silver', 'Bronze'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: countryData.map(item => item.year)
        },
        yAxis: {
          type: 'value',
          name: 'Number of medals'
        },
        series: [
          {
            name: 'Gold',
            type: 'line',
            data: countryData.map(item => item.gold),
            itemStyle: {
              color: '#182727' // 金色
            },
            lineStyle: {
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8
          },
          {
            name: 'Silver',
            type: 'line',
            data: countryData.map(item => item.silver),
            itemStyle: {
              color: '#688e4e' // 银色
            },
            lineStyle: {
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8
          },
          {
            name: 'Bronze',
            type: 'line',
            data: countryData.map(item => item.bronze),
            itemStyle: {
              color: '#b2c582' // 铜色
            },
            lineStyle: {
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8
          }
        ]
      };
      
      lineInstance.setOption(option);
    };

    const updateBoxplotChart = () => {
      if (!boxplotInstance || !selectedCountry.value) return;
      
      const dataKey = selectedCountry.value;
      const countryData = olympicMedalData.value[dataKey] || [];
      
      if (countryData.length === 0) {
        boxplotInstance.clear();
        return;
      }

      // 准备箱线图数据
      const prepareBoxplotData = (type) => {
        const values = countryData.map(item => item[type]);
        values.sort((a, b) => a - b);
        
        const q1 = values[Math.floor(values.length * 0.25)];
        const median = values[Math.floor(values.length * 0.5)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const min = values[0];
        const max = values[values.length - 1];
        
        return [min, q1, median, q3, max];
      };

      const goldData = prepareBoxplotData('gold');
      const silverData = prepareBoxplotData('silver');
      const bronzeData = prepareBoxplotData('bronze');

      const option = {
        title: {
          text: `Distribution of the number of ${selectedCountry.value} Olympic medals`,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Gold', 'Silver', 'Bronze'],
          top: 30
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%'
        },
        yAxis: {
          type: 'category',
          data: ['Distribution of medal counts'],
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: false
          },
          axisLabel: {
            formatter: 'Distribution of medal counts'
          },
          splitLine: {
            show: false
          }
        },
        xAxis: {
          type: 'value',
          name: 'Number of medals',
          min: 0,
          splitArea: {
            show: true
          }
        },
        series: [
          {
            name: 'Gold',
            type: 'boxplot',
            data: [goldData],
            itemStyle: {
              color: '#182727',
              borderColor: '#182727'
            },
            emphasis: {
              itemStyle: {
                color: '#FFECB3',
                borderColor: '#FFD700'
              }
            }
          },
          {
            name: 'Silver',
            type: 'boxplot',
            data: [silverData],
            itemStyle: {
              color: '#688e4e',
              borderColor: '#688e4e'
            },
            emphasis: {
              itemStyle: {
                color: '#C0C0C0',
                borderColor: '#C0C0C0'
              }
            }
          },
          {
            name: 'Bronze',
            type: 'boxplot',
            data: [bronzeData],
            itemStyle: {
              color: '#b2c582',
              borderColor: '#b2c582'
            },
            emphasis: {
              itemStyle: {
                color: '#E6C19C',
                borderColor: '#CD7F32'
              }
            }
          },
          {
            name: '异常值',
            type: 'scatter',
            data: []
          }
        ]
      };
      
      boxplotInstance.setOption(option);
    };

    const updatePredictChart = () => {
      if (!predictInstance || !selectedCountry.value) return;
      
      const dataKey = selectedCountry.value;
      const predictData = olympicPredictData.value[dataKey] || [];
      
      if (predictData.length === 0) {
        predictInstance.clear();
        return;
      }

      const option = {
        title: {
          text: `Prediction for ${selectedCountry.value}'s Medal Count in the 2028 Olympics`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Gold', 'Silver', 'Bronze'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: 'Number of medals'
        },
        yAxis: {
          type: 'category',
          data: ['Forecast for 2028'],
          axisLabel: {
            interval: 0
          }
        },
        series: [
          {
            name: 'Gold',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [predictData[0].gold],
            itemStyle: {
              color: '#182727' // 金色
            },
            label: {
              show: true,
              position: 'inside'
            }
          },
          {
            name: 'Silver',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [predictData[0].silver],
            itemStyle: {
              color: '#688e4e' // 银色
            },
            label: {
              show: true,
              position: 'inside'
            }
          },
          {
            name: 'Bronze',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [predictData[0].bronze],
            itemStyle: {
              color: '#b2c582' // 铜色
            },
            label: {
              show: true,
              position: 'inside'
            }
          }
        ]
      };
      
      predictInstance.setOption(option);
    };

    const forceRetry = () => {
      error.value = '正在重试...';
      setTimeout(() => initMapChart(true), 300);
    };



    watch(selectedCountry, () => {
      updateMedalChart();
      updateLineChart();
      updateBoxplotChart();
      updatePredictChart();
    });

    // 桑基图初始化函数
    const initSankeyChart = () => {
      if (!sankeyChart.value || !sankeyChart.value.offsetParent) {
        setTimeout(initSankeyChart, 100);
        return;
      }
      
      if (sankeyInstance) {
        sankeyInstance.dispose();
      }
      
      sankeyInstance = echarts.init(sankeyChart.value);
      updateSankeyChart();
    };

    // 桑基图更新函数
 const updateSankeyChart = () => {
  if (!sankeyInstance || !selectedCountry.value) return;
  
  const dataKey = selectedCountry.value;
  const countryEvents = olympicEventsData.value[dataKey] || [];
  
  if (countryEvents.length === 0) {
    sankeyInstance.clear();
    return;
  }

  // 准备桑基图数据
  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  // 定义颜色方案
  const colorPalette = {
   years: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5'],
    sports: ['#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],

    medals: {
      Gold: '#FFD700',  // 金色
      Silver: '#C0C0C0', // 银色
      Bronze: '#CD7F32'  // 铜色
    }
  };

  //添加年份节点（每个年份不同颜色）
  const years = [...new Set(countryEvents.map(event => event.year))];
  years.forEach((year, index) => {
    const nodeId = `year-${year}`;
    nodeMap.set(nodeId, nodes.length);
    nodes.push({
      name: `Year:${year}`,
      itemStyle: { 
        color: colorPalette.years[index % colorPalette.years.length] 
      }
    });
  });

  //添加项目节点（每个项目不同颜色）
  const sports = [...new Set(countryEvents.map(event => event.sport))];
  sports.forEach((sport, index) => {
    const nodeId = `sport-${sport}`;
    nodeMap.set(nodeId, nodes.length);
    nodes.push({
      name: sport,
      itemStyle: { 
        color: colorPalette.sports[index % colorPalette.sports.length] 
      }
    });
  });

  //添加奖牌类型节点（固定颜色）
  const medalTypes = ['Gold', 'Silver', 'Bronze'];
  medalTypes.forEach(medal => {
    const nodeId = `medal-${medal}`;
    nodeMap.set(nodeId, nodes.length);
    nodes.push({
      name: medal === 'Gold' ? 'Gold' : medal === 'Silver' ? 'Silver' : 'Bronze',
      itemStyle: { 
        color: colorPalette.medals[medal] 
      }
    });
  });

  // 构建链接关系
  const yearSportCount = {};
  const sportMedalCount = {};

  countryEvents.forEach(event => {
    const yearSportKey = `${event.year}-${event.sport}`;
    yearSportCount[yearSportKey] = (yearSportCount[yearSportKey] || 0) + 1;
    
    const sportMedalKey = `${event.sport}-${event.medal}`;
    sportMedalCount[sportMedalKey] = (sportMedalCount[sportMedalKey] || 0) + 1;
  });

  //添加年份到项目的链接（使用源节点颜色）
  Object.keys(yearSportCount).forEach(key => {
    const [year, sport] = key.split('-');
    links.push({
      source: nodeMap.get(`year-${year}`),
      target: nodeMap.get(`sport-${sport}`),
      value: yearSportCount[key],
      lineStyle: {
        color: 'source', // 使用源节点颜色
        opacity: 0.6,
        curveness: 0.2
      }
    });
  });

  //添加到奖牌类型的链接（使用源节点颜色）
  Object.keys(sportMedalCount).forEach(key => {
    const [sport, medal] = key.split('-');
    links.push({
      source: nodeMap.get(`sport-${sport}`),
      target: nodeMap.get(`medal-${medal}`),
      value: sportMedalCount[key],
      lineStyle: {
        color: 'source', // 使用源节点颜色
        opacity: 0.6,
        curveness: 0.2
      }
    });
  });

  //设置桑基图选项
  const option = {
    title: {
      text: `The source of ${selectedCountry.value}'s Olympic medals                                                      `,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: params => {
        if (params.dataType === 'node') {
          return params.name;
        } else {
          return `${nodes[params.data.source].name} → ${nodes[params.data.target].name}<br/>Number: ${params.data.value}`;
        }
      }
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      data: nodes,
      links: links,
      emphasis: {
        focus: 'adjacency'
      },
      levels: [
        {
          depth: 0, // 年份层
          itemStyle: {
            color: 'source' // 使用节点定义的颜色
          }
        },
        {
          depth: 1, // 项目层
          itemStyle: {
            color: 'source' // 使用节点定义的颜色
          }
        },
        {
          depth: 2, // 奖牌层
          itemStyle: {
            color: 'source' // 使用节点定义的颜色
          }
        }
      ],
      lineStyle: {
        color: 'source', // 链接线使用源节点颜色
        curveness: 0.5,
        opacity: 0.6
      },
      label: {
        color: '#333',
        fontSize: 12,
        position: 'right' // 标签显示在节点右侧
      },
      nodeAlign: 'left' // 节点左对齐
    }]
  };

  sankeyInstance.setOption(option);
};

    // 在onMounted中添加桑基图初始化
    onMounted(async () => {
      try {
        await loadMedalData();
        await initMapChart();
        initMedalChart();
        initLineChart();
        initBoxplotChart();
        initPredictChart();
        initSankeyChart(); 
        
        window.addEventListener('resize', () => {
          mapInstance?.resize();
          medalInstance?.resize();
          lineInstance?.resize();
          boxplotInstance?.resize();
          predictInstance?.resize();
          sankeyInstance?.resize();
        });
      } catch (err) {
        error.value = `初始化失败: ${err.message}`;
      }
    });

    // 在watch中添加桑基图更新
    watch(selectedCountry, () => {
      updateMedalChart();
      updateLineChart();
      updateBoxplotChart();
      updatePredictChart();
      updateSankeyChart(); 
    });

    return { 
      mapChart, 
      medalChart,
      lineChart,
      boxplotChart,
      predictChart,
      error, 
      forceRetry, 
      selectedCountry,
      hasMedalData,
      sankeyChart
    };
  }
};
</script>

<style scoped>
.map-container {
  background-image: url('../assets/olympic-background.jpg');
  width: 100%;
  height: calc(100vh - 50px);
  position: relative;
}

.map-chart {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.error-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  padding: 15px;
  background: rgba(255, 0, 0, 0.8);
  color: rgb(8, 8, 8);
  border-radius: 4px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-btn {
  padding: 5px 10px;
  background: white;
  color: rgb(223, 35, 35);
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.country-info-container {
  height: 200%;
  width: 100%;
  background: rgb(255, 255, 255);
  border-top: 2px solid #427e31;
  color: rgb(4, 4, 4);
  display: flex;
  flex-direction: column;
}

.country-info {
  padding: 10px;
  text-align: center;
  font-size: 18px;
  border-bottom: 2px solid #427e31;
}

.no-data-hint {
  color: #ff6b6b;
  font-size: 14px;
  margin-left: 10px;
}

.medal-chart {
  width: 100%;
  height: 20%;
}

.line-chart {
  width: 100%;
  height: 20%;
  border-top: 1px dashed #ccc;
}

.boxplot-chart {
  width: 100%;
  height: 20%;
  border-top: 1px dashed #ccc;
}

.predict-chart {
  width: 100%;
  height: 20%;
  border-top: 1px dashed #ccc;
}

.sankey-chart {
  width: 120%;
  height: 60%;
  border-top: 1px dashed #ccc;
}
</style>