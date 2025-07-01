<template>
  <div class="page-three-container">
    <div class="category-filter">
      <button v-for="category in categories" 
              :key="category"
              :class="{ active: selectedCategory === category }"
              @click="selectCategory(category)">
        {{ category }}
      </button>
    </div>
    <div class="sports-grid">
      <div v-for="sport in filteredSports" 
           :key="sport.name"
           class="sport-card"
           @click="selectSport(sport)">
        <div class="sport-icon">{{ sport.icon }}</div>
        <h3>{{ sport.name }}</h3>
        <p>金牌：{{ sport.medals }}</p>
        <div class="sport-details" v-if="selectedSport === sport">
          <div class="champions-list">
            <h4>历届冠军</h4>
            <ul>
              <li v-for="champion in sport.champions" :key="champion.name">
                {{ champion.name }} ({{ champion.year }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const categories = ['全部', '田径', '游泳', '体操', '球类'];
const selectedCategory = ref('全部');
const selectedSport = ref(null);

const sports = ref([
  {
    name: '乒乓球',
    icon: '🏓',
    medals: 32,
    category: '球类',
    champions: [
      { name: '邓亚萍', year: '1992-1996' },
      { name: '马龙', year: '2016-2020' }
    ]
  },
  {
    name: '体操',
    icon: '🤸',
    medals: 40,
    category: '体操',
    champions: [
      { name: '李宁', year: '1984' },
      { name: '邹凯', year: '2008' }
    ]
  },
  {
    name: '田径',
    icon: '🏃',
    medals: 35,
    category: '田径',
    champions: [
      { name: '刘翔', year: '2004' },
      { name: '苏炳添', year: '2020' }
    ]
  },
  {
    name: '跳水',
    icon: '🤿',
    medals: 40,
    category: '游泳',
    champions: [
      { name: '郭晶晶', year: '2004-2008' },
      { name: '陈若琳', year: '2008-2012' }
    ]
  },
  {
    name: '羽毛球',
    icon: '🏸',
    medals: 20,
    category: '球类',
    champions: [
      { name: '林丹', year: '2008-2012' },
      { name: '李宗伟', year: '2016' }
    ]
  },
  {
    name: '游泳',
    icon: '🏊',
    medals: 15,
    category: '游泳',
    champions: [
      { name: '孙杨', year: '2012-2016' },
      { name: '叶诗文', year: '2012' }
    ]
  },
  {
    name: '举重',
    icon: '🏋️',
    medals: 25,
    category: '体操',
    champions: [
      { name: '陈艳青', year: '2008' },
      { name: '吕小军', year: '2020' }
    ]
  },
  {
    name: '排球',
    icon: '🏐',
    medals: 10,
    category: '球类',
    champions: [
      { name: '郎平', year: '1984' },
      { name: '朱婷', year: '2016' }
    ]
  }
]);

const filteredSports = computed(() => {
  if (selectedCategory.value === '全部') return sports.value;
  return sports.value.filter(sport => sport.category === selectedCategory.value);
});

const selectCategory = (category) => {
  selectedCategory.value = category;
  selectedSport.value = null;
};

const selectSport = (sport) => {
  selectedSport.value = selectedSport.value === sport ? null : sport;
};
</script>

<style scoped>
.page-three-container {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/assets/olym.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.category-filter {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.category-filter button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  padding: 1rem 2rem;
  color: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.category-filter button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
}

.category-filter button.active {
  background: #ffd700;
  color: #000;
  font-weight: bold;
  border: 2px solid #fff;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.sports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  width: 100%;
  padding: 0 1rem;
}

.sport-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 2.5rem;
  text-align: center;
  transition: all 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: popIn 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.sport-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sport-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.3);
}

.sport-card:hover::before {
  opacity: 1;
}

.sport-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  transform: scale(1);
  transition: transform 0.3s ease;
}

.sport-card:hover .sport-icon {
  transform: scale(1.1);
}

.sport-card h3 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.sport-card p {
  color: #ffd700;
  font-size: 1.3rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.sport-details {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(255, 215, 0, 0.3);
  animation: slideDown 0.4s ease-out;
}

.champions-list {
  text-align: left;
}

.champions-list h4 {
  color: #ffd700;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.champions-list ul {
  list-style: none;
  padding: 0;
}

.champions-list li {
  margin: 0.8rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  padding-left: 1.5rem;
  position: relative;
}

.champions-list li::before {
  content: '🏅';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes popIn {
  0% { 
    opacity: 0; 
    transform: scale(0.8) translateY(50px); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}

@keyframes slideDown {
  0% { 
    opacity: 0; 
    transform: translateY(-20px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@media (max-width: 768px) {
  .sports-grid {
    grid-template-columns: 1fr;
    padding: 0 0.5rem;
  }
  
  .category-filter button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
  
  .sport-card {
    padding: 2rem;
  }
  
  .sport-icon {
    font-size: 4rem;
  }
  
  .sport-card h3 {
    font-size: 1.8rem;
  }
}
</style>