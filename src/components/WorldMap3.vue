<template>
  <div class="map-container">
    <div class="controls">
      <button @click="startAnimation" :disabled="isAnimating">Start</button>
      <button @click="stopAnimation" :disabled="!isAnimating">Pause</button>
      <button @click="playAllCities" :disabled="isAnimating">Quick play</button>
      <span class="current-city">{{ currentCity }}</span>
    </div>
    <div ref="mapChart" class="map-chart"></div>
    
    <div class="chart-row-one">
      <div ref="riverChart" class="chart-item"></div>
    </div>
    <div class="chart-row">
      <div ref="genderChart" class="chart-item"></div>
    </div><div class="chart-row">
      <div ref="topCountriesChart" class="chart-item"></div>
    </div>
    <div v-if="error" class="error-overlay">
      {{ error }}
      <button @click="forceRetry" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

// 奥运会举办城市数据 
const OLYMPIC_HOST_CITIES = [
  { year: 1896, city: "Athens", country: "Greece", coords: [23.7166, 37.9838] },
  { year: 1900, city: "Paris", country: "France", coords: [2.3522, 48.8566] },
  { year: 1904, city: "St. Louis", country: "United States", coords: [-90.1994, 38.6270] },
  { year: 1908, city: "London", country: "United Kingdom", coords: [-0.1276, 51.5074] },
  { year: 1912, city: "Stockholm", country: "Sweden", coords: [18.0686, 59.3293] },
  { year: 1916, city: "Berlin", country: "Germany", coords: [13.4050, 52.5200] }, 
  { year: 1920, city: "Antwerp", country: "Belgium", coords: [4.4025, 51.2211] },
  { year: 1924, city: "Paris", country: "France", coords: [2.3522, 48.8566] },
  { year: 1928, city: "Amsterdam", country: "Netherlands", coords: [4.8952, 52.3702] },
  { year: 1932, city: "Los Angeles", country: "United States", coords: [-118.2437, 34.0522] },
  { year: 1936, city: "Berlin", country: "Germany", coords: [13.4050, 52.5200] },
  { year: 1940, city: "Tokyo", country: "Japan", coords: [139.6917, 35.6895] }, 
  { year: 1944, city: "London", country: "United Kingdom", coords: [-0.1276, 51.5074] }, 
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

// 新增数据 - 各项目金牌数变化 (1896-2024)
const SPORTS_MEDAL_DATA = [
{ year: 2020, sports: [
{ name: "Wrestling", medals: 18 },
{ name: "Weightlifting", medals: 14 },
{ name: "Water Polo", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Trampoline Gymnastics", medals: 2 },
{ name: "Taekwondo", medals: 8 },
{ name: "Surfing", medals: 2 },
{ name: "Sport Climbing", medals: 2 },
{ name: "Tennis", medals: 5 },
{ name: "Skateboarding", medals: 4 },
{ name: "Shooting", medals: 15 },
{ name: "Sailing", medals: 10 },
{ name: "Table Tennis", medals: 5 },
{ name: "Rugby Sevens", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Canoe Sprint", medals: 12 },
{ name: "Cycling BMX Freestyle", medals: 2 },
{ name: "Canoe Slalom", medals: 4 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Athletics", medals: 49 },
{ name: "Triathlon", medals: 3 },
{ name: "Artistic Swimming", medals: 2 },
{ name: "Baseball/Softball", medals: 2 },
{ name: "Basketball", medals: 2 },
{ name: "Artistic Gymnastics", medals: 14 },
{ name: "Equestrian", medals: 6 },
{ name: "Boxing", medals: 13 },
{ name: "Cycling Road", medals: 4 },
{ name: "3x3 Basketball", medals: 2 },
{ name: "Cycling Track", medals: 12 },
{ name: "Cycling Mountain Bike", medals: 2 },
{ name: "Cycling BMX Racing", medals: 2 },
{ name: "Diving", medals: 8 },
{ name: "Badminton", medals: 5 },
{ name: "Fencing", medals: 12 },
{ name: "Football", medals: 2 },
{ name: "Golf", medals: 2 },
{ name: "Archery", medals: 5 },
{ name: "Judo", medals: 15 },
{ name: "Handball", medals: 2 },
{ name: "Swimming", medals: 35 },
{ name: "Hockey", medals: 2 },
{ name: "Karate", medals: 8 },
{ name: "Marathon Swimming", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 2 }
]},
{ year: 1936, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Wrestling", medals: 14 },
{ name: "Swimming", medals: 11 },
{ name: "Sailing", medals: 4 },
{ name: "Modern Pentathlon", medals: 1 },
{ name: "Hockey", medals: 1 },
{ name: "Handball", medals: 1 },
{ name: "Art Competitions", medals: 9 },
{ name: "Boxing", medals: 8 },
{ name: "Athletics", medals: 29 },
{ name: "Rowing", medals: 7 },
{ name: "Football", medals: 1 },
{ name: "Alpinism", medals: 1 },
{ name: "Basketball", medals: 1 },
{ name: "Polo", medals: 1 },
{ name: "Canoeing", medals: 9 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 3 },
{ name: "Aeronautics", medals: 1 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 6 },
{ name: "Fencing", medals: 7 },
{ name: "Gymnastics", medals: 9 }
]},
{ year: 1928, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Art Competitions", medals: 9 },
{ name: "Boxing", medals: 8 },
{ name: "Athletics", medals: 27 },
{ name: "Cycling", medals: 6 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 6 },
{ name: "Fencing", medals: 7 },
{ name: "Hockey", medals: 1 },
{ name: "Wrestling", medals: 13 },
{ name: "Swimming", medals: 11 },
{ name: "Sailing", medals: 3 },
{ name: "Gymnastics", medals: 8 },
{ name: "Modern Pentathlon", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 7 }
]},
{ year: 1924, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Wrestling", medals: 13 },
{ name: "Swimming", medals: 11 },
{ name: "Sailing", medals: 3 },
{ name: "Art Competitions", medals: 3 },
{ name: "Boxing", medals: 8 },
{ name: "Athletics", medals: 27 },
{ name: "Polo", medals: 1 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 10 },
{ name: "Diving", medals: 5 },
{ name: "Equestrianism", medals: 5 },
{ name: "Tennis", medals: 5 },
{ name: "Rugby", medals: 1 },
{ name: "Weightlifting", medals: 5 },
{ name: "Fencing", medals: 7 },
{ name: "Gymnastics", medals: 9 },
{ name: "Modern Pentathlon", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 7 }
]},
{ year: 1920, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Tug-Of-War", medals: 1 },
{ name: "Wrestling", medals: 10 },
{ name: "Swimming", medals: 10 },
{ name: "Sailing", medals: 13 },
{ name: "Tennis", medals: 5 },
{ name: "Rugby", medals: 1 },
{ name: "Polo", medals: 1 },
{ name: "Modern Pentathlon", medals: 1 },
{ name: "Archery", medals: 10 },
{ name: "Art Competitions", medals: 3 },
{ name: "Boxing", medals: 8 },
{ name: "Athletics", medals: 29 },
{ name: "Rowing", medals: 5 },
{ name: "Football", medals: 1 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 21 },
{ name: "Diving", medals: 5 },
{ name: "Equestrianism", medals: 7 },
{ name: "Weightlifting", medals: 5 },
{ name: "Fencing", medals: 6 },
{ name: "Figure Skating", medals: 3 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 4 },
{ name: "Ice Hockey", medals: 1 }
]},
{ year: 1912, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Tug-Of-War", medals: 1 },
{ name: "Tennis", medals: 8 },
{ name: "Art Competitions", medals: 5 },
{ name: "Athletics", medals: 32 },
{ name: "Cycling", medals: 2 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 5 },
{ name: "Shooting", medals: 18 },
{ name: "Fencing", medals: 5 },
{ name: "Wrestling", medals: 4 },
{ name: "Swimming", medals: 9 },
{ name: "Sailing", medals: 4 },
{ name: "Gymnastics", medals: 4 },
{ name: "Modern Pentathlon", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 4 }
]},
{ year: 1908, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Tug-Of-War", medals: 1 },
{ name: "Wrestling", medals: 9 },
{ name: "Swimming", medals: 6 },
{ name: "Sailing", medals: 4 },
{ name: "Tennis", medals: 6 },
{ name: "Rugby", medals: 1 },
{ name: "Polo", medals: 1 },
{ name: "Archery", medals: 3 },
{ name: "Boxing", medals: 5 },
{ name: "Athletics", medals: 26 },
{ name: "Shooting", medals: 15 },
{ name: "Diving", medals: 2 },
{ name: "Rowing", medals: 4 },
{ name: "Football", medals: 1 },
{ name: "Cycling", medals: 6 },
{ name: "Fencing", medals: 4 },
{ name: "Racquets", medals: 2 },
{ name: "Figure Skating", medals: 4 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 2 },
{ name: "Jeu De Paume", medals: 1 },
{ name: "Lacrosse", medals: 1 },
{ name: "Motorboating", medals: 3 }
]},
{ year: 1932, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Alpinism", medals: 1 },
{ name: "Art Competitions", medals: 8 },
{ name: "Boxing", medals: 8 },
{ name: "Athletics", medals: 29 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 2 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 5 },
{ name: "Weightlifting", medals: 5 },
{ name: "Fencing", medals: 7 },
{ name: "Hockey", medals: 1 },
{ name: "Wrestling", medals: 14 },
{ name: "Swimming", medals: 11 },
{ name: "Sailing", medals: 4 },
{ name: "Gymnastics", medals: 11 },
{ name: "Modern Pentathlon", medals: 1 },
{ name: "Rowing", medals: 7 }
]},
{ year: 2024, sports: [
{ name: "Wrestling", medals: 18 },
{ name: "Weightlifting", medals: 10 },
{ name: "Water Polo", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Trampoline Gymnastics", medals: 2 },
{ name: "Taekwondo", medals: 8 },
{ name: "Surfing", medals: 2 },
{ name: "Sport Climbing", medals: 4 },
{ name: "Tennis", medals: 5 },
{ name: "Skateboarding", medals: 4 },
{ name: "Shooting", medals: 15 },
{ name: "Sailing", medals: 10 },
{ name: "Table Tennis", medals: 5 },
{ name: "Rugby Sevens", medals: 2 },
{ name: "Canoe Sprint", medals: 10 },
{ name: "Breaking", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 2 },
{ name: "Cycling BMX Freestyle", medals: 2 },
{ name: "Canoe Slalom", medals: 6 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Athletics", medals: 48 },
{ name: "Triathlon", medals: 2 },
{ name: "Artistic Swimming", medals: 2 },
{ name: "Basketball", medals: 2 },
{ name: "Artistic Gymnastics", medals: 14 },
{ name: "Equestrian", medals: 6 },
{ name: "Boxing", medals: 13 },
{ name: "Cycling Road", medals: 3 },
{ name: "3x3 Basketball", medals: 2 },
{ name: "Cycling Track", medals: 12 },
{ name: "Cycling Mountain Bike", medals: 1 },
{ name: "Cycling BMX Racing", medals: 2 },
{ name: "Diving", medals: 8 },
{ name: "Badminton", medals: 5 },
{ name: "Fencing", medals: 12 },
{ name: "Football", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Golf", medals: 2 },
{ name: "Archery", medals: 5 },
{ name: "Judo", medals: 15 },
{ name: "Handball", medals: 2 },
{ name: "Swimming", medals: 34 },
{ name: "Hockey", medals: 2 },
{ name: "Marathon Swimming", medals: 2 }
]},
{ year: 1906, sports: [
{ name: "Wrestling", medals: 4 },
{ name: "Weightlifting", medals: 2 },
{ name: "Tennis", medals: 4 },
{ name: "Rowing", medals: 6 },
{ name: "Gymnastics", medals: 4 },
{ name: "Tug-Of-War", medals: 1 },
{ name: "Fencing", medals: 8 },
{ name: "Shooting", medals: 12 },
{ name: "Cycling", medals: 6 },
{ name: "Swimming", medals: 4 },
{ name: "Football", medals: 1 },
{ name: "Diving", medals: 1 },
{ name: "Athletics", medals: 21 }
]},
{ year: 1964, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Volleyball", medals: 2 },
{ name: "Wrestling", medals: 16 },
{ name: "Swimming", medals: 18 },
{ name: "Sailing", medals: 5 },
{ name: "Athletics", medals: 36 },
{ name: "Rowing", medals: 7 },
{ name: "Football", medals: 1 },
{ name: "Basketball", medals: 1 },
{ name: "Boxing", medals: 10 },
{ name: "Canoeing", medals: 7 },
{ name: "Cycling", medals: 7 },
{ name: "Weightlifting", medals: 7 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 14 },
{ name: "Shooting", medals: 6 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Judo", medals: 4 },
{ name: "Modern Pentathlon", medals: 2 }
]},
{ year: 1904, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Tug-Of-War", medals: 1 },
{ name: "Tennis", medals: 2 },
{ name: "Archery", medals: 6 },
{ name: "Athletics", medals: 24 },
{ name: "Diving", medals: 1 },
{ name: "Wrestling", medals: 7 },
{ name: "Swimming", medals: 10 },
{ name: "Cycling", medals: 7 },
{ name: "Weightlifting", medals: 2 },
{ name: "Fencing", medals: 6 },
{ name: "Golf", medals: 2 },
{ name: "Gymnastics", medals: 12 },
{ name: "Lacrosse", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 5 },
{ name: "Boxing", medals: 7 },
{ name: "Roque", medals: 1 }
]},
{ year: 1952, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Wrestling", medals: 16 },
{ name: "Swimming", medals: 11 },
{ name: "Sailing", medals: 5 },
{ name: "Athletics", medals: 33 },
{ name: "Basketball", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 7 },
{ name: "Boxing", medals: 10 },
{ name: "Canoeing", medals: 9 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 7 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 7 },
{ name: "Fencing", medals: 7 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 15 },
{ name: "Modern Pentathlon", medals: 2 }
]},
{ year: 1900, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Tug-Of-War", medals: 1 },
{ name: "Swimming", medals: 7 },
{ name: "Sailing", medals: 12 },
{ name: "Tennis", medals: 4 },
{ name: "Rugby", medals: 1 },
{ name: "Archery", medals: 7 },
{ name: "Athletics", medals: 23 },
{ name: "Polo", medals: 1 },
{ name: "Cycling", medals: 3 },
{ name: "Shooting", medals: 8 },
{ name: "Basque Pelota", medals: 1 },
{ name: "Equestrianism", medals: 6 },
{ name: "Cricket", medals: 1 },
{ name: "Croquet", medals: 3 },
{ name: "Golf", medals: 2 },
{ name: "Fencing", medals: 7 },
{ name: "Gymnastics", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 5 }
]},
{ year: 2016, sports: [
{ name: "Wrestling", medals: 18 },
{ name: "Weightlifting", medals: 15 },
{ name: "Water Polo", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Triathlon", medals: 2 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Golf", medals: 2 },
{ name: "Trampolining", medals: 2 },
{ name: "Basketball", medals: 2 },
{ name: "Equestrianism", medals: 6 },
{ name: "Diving", medals: 8 },
{ name: "Shooting", medals: 15 },
{ name: "Cycling", medals: 18 },
{ name: "Canoeing", medals: 16 },
{ name: "Fencing", medals: 10 },
{ name: "Badminton", medals: 5 },
{ name: "Athletics", medals: 47 },
{ name: "Football", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Boxing", medals: 13 },
{ name: "Handball", medals: 2 },
{ name: "Judo", medals: 14 },
{ name: "Archery", medals: 4 },
{ name: "Gymnastics", medals: 14 },
{ name: "Rugby Sevens", medals: 2 },
{ name: "Table Tennis", medals: 4 },
{ name: "Rhythmic Gymnastics", medals: 2 },
{ name: "Sailing", medals: 10 },
{ name: "Hockey", medals: 2 },
{ name: "Swimming", medals: 35 },
{ name: "Synchronized Swimming", medals: 2 },
{ name: "Taekwondo", medals: 8 },
{ name: "Tennis", medals: 5 }
]},
{ year: 1948, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Wrestling", medals: 16 },
{ name: "Swimming", medals: 11 },
{ name: "Sailing", medals: 5 },
{ name: "Art Competitions", medals: 8 },
{ name: "Boxing", medals: 8 },
{ name: "Athletics", medals: 33 },
{ name: "Rowing", medals: 7 },
{ name: "Football", medals: 1 },
{ name: "Basketball", medals: 1 },
{ name: "Canoeing", medals: 9 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 4 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 6 },
{ name: "Fencing", medals: 7 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 9 },
{ name: "Modern Pentathlon", medals: 1 }
]},
{ year: 1896, sports: [
{ name: "Wrestling", medals: 1 },
{ name: "Weightlifting", medals: 2 },
{ name: "Tennis", medals: 2 },
{ name: "Gymnastics", medals: 8 },
{ name: "Fencing", medals: 3 },
{ name: "Shooting", medals: 5 },
{ name: "Cycling", medals: 6 },
{ name: "Swimming", medals: 4 },
{ name: "Athletics", medals: 12 }
]},
{ year: 2012, sports: [
{ name: "Wrestling", medals: 18 },
{ name: "Weightlifting", medals: 15 },
{ name: "Water Polo", medals: 2 },
{ name: "Gymnastics", medals: 14 },
{ name: "Table Tennis", medals: 4 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Trampolining", medals: 2 },
{ name: "Basketball", medals: 2 },
{ name: "Equestrianism", medals: 6 },
{ name: "Diving", medals: 8 },
{ name: "Shooting", medals: 15 },
{ name: "Cycling", medals: 18 },
{ name: "Canoeing", medals: 16 },
{ name: "Fencing", medals: 10 },
{ name: "Badminton", medals: 5 },
{ name: "Athletics", medals: 47 },
{ name: "Football", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Boxing", medals: 13 },
{ name: "Judo", medals: 14 },
{ name: "Archery", medals: 4 },
{ name: "Handball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Sailing", medals: 10 },
{ name: "Hockey", medals: 2 },
{ name: "Swimming", medals: 34 },
{ name: "Synchronized Swimming", medals: 2 },
{ name: "Taekwondo", medals: 8 },
{ name: "Tennis", medals: 5 },
{ name: "Triathlon", medals: 2 }
]},
{ year: 1956, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Wrestling", medals: 16 },
{ name: "Swimming", medals: 13 },
{ name: "Sailing", medals: 5 },
{ name: "Athletics", medals: 33 },
{ name: "Basketball", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 7 },
{ name: "Boxing", medals: 10 },
{ name: "Canoeing", medals: 9 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 7 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 7 },
{ name: "Fencing", medals: 7 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 17 },
{ name: "Modern Pentathlon", medals: 2 }
]},
{ year: 1960, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Wrestling", medals: 16 },
{ name: "Swimming", medals: 15 },
{ name: "Sailing", medals: 5 },
{ name: "Athletics", medals: 34 },
{ name: "Basketball", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 7 },
{ name: "Boxing", medals: 10 },
{ name: "Canoeing", medals: 7 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 6 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 5 },
{ name: "Weightlifting", medals: 7 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 16 },
{ name: "Modern Pentathlon", medals: 2 }
]},
{ year: 1968, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Volleyball", medals: 2 },
{ name: "Wrestling", medals: 16 },
{ name: "Swimming", medals: 29 },
{ name: "Sailing", medals: 5 },
{ name: "Athletics", medals: 36 },
{ name: "Basketball", medals: 1 },
{ name: "Football", medals: 1 },
{ name: "Rowing", medals: 7 },
{ name: "Boxing", medals: 11 },
{ name: "Canoeing", medals: 7 },
{ name: "Cycling", medals: 7 },
{ name: "Shooting", medals: 7 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 7 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 16 },
{ name: "Modern Pentathlon", medals: 2 }
]},
{ year: 1972, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Volleyball", medals: 2 },
{ name: "Wrestling", medals: 20 },
{ name: "Swimming", medals: 29 },
{ name: "Sailing", medals: 6 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Archery", medals: 2 },
{ name: "Boxing", medals: 11 },
{ name: "Athletics", medals: 38 },
{ name: "Rowing", medals: 7 },
{ name: "Football", medals: 1 },
{ name: "Basketball", medals: 1 },
{ name: "Canoeing", medals: 11 },
{ name: "Cycling", medals: 7 },
{ name: "Shooting", medals: 8 },
{ name: "Judo", medals: 6 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 9 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 14 },
{ name: "Handball", medals: 1 }
]},
{ year: 1976, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Volleyball", medals: 2 },
{ name: "Wrestling", medals: 20 },
{ name: "Swimming", medals: 26 },
{ name: "Sailing", medals: 6 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Archery", medals: 2 },
{ name: "Boxing", medals: 11 },
{ name: "Athletics", medals: 37 },
{ name: "Rowing", medals: 14 },
{ name: "Football", medals: 1 },
{ name: "Basketball", medals: 2 },
{ name: "Canoeing", medals: 11 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 7 },
{ name: "Judo", medals: 6 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 9 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 1 },
{ name: "Gymnastics", medals: 14 },
{ name: "Handball", medals: 2 }
]},
{ year: 1980, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Volleyball", medals: 2 },
{ name: "Wrestling", medals: 20 },
{ name: "Swimming", medals: 26 },
{ name: "Sailing", medals: 6 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Archery", medals: 2 },
{ name: "Boxing", medals: 11 },
{ name: "Athletics", medals: 38 },
{ name: "Rowing", medals: 14 },
{ name: "Football", medals: 1 },
{ name: "Basketball", medals: 2 },
{ name: "Canoeing", medals: 11 },
{ name: "Cycling", medals: 6 },
{ name: "Shooting", medals: 7 },
{ name: "Judo", medals: 8 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 10 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 2 },
{ name: "Gymnastics", medals: 15 },
{ name: "Handball", medals: 2 }
]},
{ year: 1984, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Synchronized Swimming", medals: 2 },
{ name: "Wrestling", medals: 20 },
{ name: "Swimming", medals: 29 },
{ name: "Sailing", medals: 7 },
{ name: "Volleyball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 1 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Archery", medals: 2 },
{ name: "Boxing", medals: 12 },
{ name: "Athletics", medals: 41 },
{ name: "Rowing", medals: 14 },
{ name: "Football", medals: 1 },
{ name: "Basketball", medals: 2 },
{ name: "Canoeing", medals: 12 },
{ name: "Cycling", medals: 8 },
{ name: "Shooting", medals: 11 },
{ name: "Judo", medals: 8 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 10 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 2 },
{ name: "Gymnastics", medals: 17 },
{ name: "Handball", medals: 2 }
]},
{ year: 1988, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Tennis", medals: 4 },
{ name: "Synchronized Swimming", medals: 2 },
{ name: "Wrestling", medals: 20 },
{ name: "Swimming", medals: 31 },
{ name: "Sailing", medals: 8 },
{ name: "Volleyball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 1 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Archery", medals: 4 },
{ name: "Boxing", medals: 12 },
{ name: "Athletics", medals: 42 },
{ name: "Rowing", medals: 14 },
{ name: "Football", medals: 1 },
{ name: "Basketball", medals: 2 },
{ name: "Canoeing", medals: 12 },
{ name: "Cycling", medals: 9 },
{ name: "Shooting", medals: 13 },
{ name: "Judo", medals: 7 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Weightlifting", medals: 10 },
{ name: "Fencing", medals: 8 },
{ name: "Hockey", medals: 2 },
{ name: "Table Tennis", medals: 4 },
{ name: "Gymnastics", medals: 17 },
{ name: "Handball", medals: 2 }
]},
{ year: 1992, sports: [
{ name: "Water Polo", medals: 1 },
{ name: "Synchronized Swimming", medals: 3 },
{ name: "Wrestling", medals: 20 },
{ name: "Swimming", medals: 31 },
{ name: "Sailing", medals: 10 },
{ name: "Volleyball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 1 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Hockey", medals: 2 },
{ name: "Handball", medals: 2 },
{ name: "Archery", medals: 4 },
{ name: "Boxing", medals: 12 },
{ name: "Rowing", medals: 14 },
{ name: "Football", medals: 1 },
{ name: "Athletics", medals: 43 },
{ name: "Badminton", medals: 4 },
{ name: "Canoeing", medals: 16 },
{ name: "Cycling", medals: 10 },
{ name: "Shooting", medals: 13 },
{ name: "Judo", medals: 14 },
{ name: "Diving", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Tennis", medals: 4 },
{ name: "Baseball", medals: 1 },
{ name: "Basketball", medals: 2 },
{ name: "Weightlifting", medals: 10 },
{ name: "Fencing", medals: 8 },
{ name: "Table Tennis", medals: 4 },
{ name: "Gymnastics", medals: 16 }
]},
{ year: 1996, sports: [
{ name: "Wrestling", medals: 20 },
{ name: "Weightlifting", medals: 10 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 1 },
{ name: "Basketball", medals: 2 },
{ name: "Baseball", medals: 1 },
{ name: "Tennis", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Diving", medals: 4 },
{ name: "Shooting", medals: 15 },
{ name: "Cycling", medals: 14 },
{ name: "Canoeing", medals: 16 },
{ name: "Fencing", medals: 10 },
{ name: "Badminton", medals: 5 },
{ name: "Athletics", medals: 44 },
{ name: "Football", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Boxing", medals: 12 },
{ name: "Gymnastics", medals: 14 },
{ name: "Table Tennis", medals: 4 },
{ name: "Judo", medals: 14 },
{ name: "Archery", medals: 4 },
{ name: "Handball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Sailing", medals: 10 },
{ name: "Hockey", medals: 2 },
{ name: "Swimming", medals: 32 },
{ name: "Softball", medals: 1 },
{ name: "Synchronized Swimming", medals: 1 },
{ name: "Water Polo", medals: 1 }
]},
{ year: 2000, sports: [
{ name: "Wrestling", medals: 16 },
{ name: "Weightlifting", medals: 15 },
{ name: "Water Polo", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Triathlon", medals: 2 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Trampolining", medals: 2 },
{ name: "Basketball", medals: 2 },
{ name: "Baseball", medals: 1 },
{ name: "Tennis", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Diving", medals: 8 },
{ name: "Shooting", medals: 17 },
{ name: "Cycling", medals: 18 },
{ name: "Canoeing", medals: 16 },
{ name: "Fencing", medals: 10 },
{ name: "Badminton", medals: 5 },
{ name: "Athletics", medals: 45 },
{ name: "Football", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Boxing", medals: 12 },
{ name: "Gymnastics", medals: 14 },
{ name: "Table Tennis", medals: 4 },
{ name: "Judo", medals: 14 },
{ name: "Archery", medals: 4 },
{ name: "Handball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 2 },
{ name: "Sailing", medals: 11 },
{ name: "Hockey", medals: 2 },
{ name: "Swimming", medals: 32 },
{ name: "Softball", medals: 1 },
{ name: "Synchronized Swimming", medals: 2 },
{ name: "Taekwondo", medals: 8 }
]},
{ year: 2004, sports: [
{ name: "Wrestling", medals: 18 },
{ name: "Weightlifting", medals: 15 },
{ name: "Water Polo", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Triathlon", medals: 2 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Trampolining", medals: 2 },
{ name: "Basketball", medals: 2 },
{ name: "Baseball", medals: 1 },
{ name: "Tennis", medals: 4 },
{ name: "Equestrianism", medals: 6 },
{ name: "Diving", medals: 8 },
{ name: "Shooting", medals: 17 },
{ name: "Cycling", medals: 18 },
{ name: "Canoeing", medals: 16 },
{ name: "Fencing", medals: 10 },
{ name: "Badminton", medals: 5 },
{ name: "Athletics", medals: 46 },
{ name: "Football", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Boxing", medals: 11 },
{ name: "Gymnastics", medals: 14 },
{ name: "Table Tennis", medals: 4 },
{ name: "Judo", medals: 14 },
{ name: "Archery", medals: 4 },
{ name: "Handball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 2 },
{ name: "Sailing", medals: 11 },
{ name: "Hockey", medals: 2 },
{ name: "Swimming", medals: 32 },
{ name: "Softball", medals: 1 },
{ name: "Synchronized Swimming", medals: 2 },
{ name: "Taekwondo", medals: 8 }
]},
{ year: 2008, sports: [
{ name: "Wrestling", medals: 18 },
{ name: "Weightlifting", medals: 15 },
{ name: "Water Polo", medals: 2 },
{ name: "Volleyball", medals: 2 },
{ name: "Triathlon", medals: 2 },
{ name: "Beach Volleyball", medals: 2 },
{ name: "Modern Pentathlon", medals: 2 },
{ name: "Trampolining", medals: 2 },
{ name: "Basketball", medals: 2 },
{ name: "Baseball", medals: 1 },
{ name: "Tennis", medals: 4 },
{ name: "Equestrianism", medals: 8 },
{ name: "Diving", medals: 8 },
{ name: "Shooting", medals: 15 },
{ name: "Cycling", medals: 18 },
{ name: "Canoeing", medals: 16 },
{ name: "Fencing", medals: 10 },
{ name: "Badminton", medals: 5 },
{ name: "Athletics", medals: 47 },
{ name: "Football", medals: 2 },
{ name: "Rowing", medals: 14 },
{ name: "Boxing", medals: 11 },
{ name: "Gymnastics", medals: 14 },
{ name: "Table Tennis", medals: 4 },
{ name: "Judo", medals: 14 },
{ name: "Archery", medals: 4 },
{ name: "Handball", medals: 2 },
{ name: "Rhythmic Gymnastics", medals: 2 },
{ name: "Sailing", medals: 11 },
{ name: "Hockey", medals: 2 },
{ name: "Swimming", medals: 34 },
{ name: "Softball", medals: 1 },
{ name: "Synchronized Swimming", medals: 2 },
{ name: "Taekwondo", medals: 8 }
]}
];

// 男女运动员比例 (1896-2024)
const GENDER_RATIO_DATA = [
  { year: 1896, male: 100, female: 0 },
  { year: 1900, male: 97.8, female: 2.2 },
  { year: 1904, male: 99.1, female: 0.9 },
  { year: 1908, male: 98.2, female: 1.8 },
  { year: 1912, male: 98, female: 2 },
  { year: 1920, male: 97.6, female: 2.4 },
  { year: 1924, male: 95.6, female: 4.4 },
  { year: 1928, male: 90.4, female: 9.6 },
  { year: 1932, male: 91, female: 9 },
  { year: 1936, male: 91.7, female: 8.3 },
  { year: 1948, male: 90.5, female: 9.5 },
  { year: 1952, male: 89.5, female: 10.5 },
  { year: 1956, male: 86.7, female: 13.3 },
  { year: 1960, male: 88.6, female: 11.4 },
  { year: 1964, male: 86.8, female: 13.2 },
  { year: 1968, male: 85.8, female: 14.2 },
  { year: 1972, male: 85.4, female: 14.6 },
  { year: 1976, male: 79.3, female: 20.7 },
  { year: 1980, male: 78.5, female: 21.5 },
  { year: 1984, male: 77, female: 23 },
  { year: 1988, male: 73.9, female: 26.1 },
  { year: 1992, male: 71.2, female: 28.8 },
  { year: 1996, male: 66, female: 34 },
  { year: 2000, male: 61.8, female: 38.2 },
  { year: 2004, male: 59.3, female: 40.7 },
  { year: 2008, male: 57.6, female: 42.4 },
  { year: 2012, male: 55.8, female: 44.2 },
  { year: 2016, male: 55, female: 45 },
  { year: 2020, male: 51.2, female: 48.8 },
  { year: 2024, male: 50, female: 50 }
];

// 金牌榜前三名国家统计
const TOP_COUNTRIES_DATA = [
  { country: "United States", goldMedals: 1021, top3Count: 28 },
  { country: "Soviet Union", goldMedals: 473, top3Count: 9 },
  { country: "Germany", goldMedals: 428, top3Count: 12 },
  { country: "Great Britain", goldMedals: 263, top3Count: 8 },
  { country: "China", goldMedals: 224, top3Count: 7 },
  { country: "France", goldMedals: 212, top3Count: 6 },
  { country: "Italy", goldMedals: 206, top3Count: 5 },
  { country: "Sweden", goldMedals: 145, top3Count: 5 },
  { country: "Hungary", goldMedals: 175, top3Count: 4 },
  { country: "Russia", goldMedals: 148, top3Count: 3 }
];

export default {
  setup() {
    const mapChart = ref(null);
    const error = ref(null);
    const isAnimating = ref(false);
    const currentCity = ref("");
    const animationInterval = ref(null);
    let mapInstance = null;
    let currentIndex = 0;
    const riverChart = ref(null);
    const genderChart = ref(null);
    const topCountriesChart = ref(null);
    let riverInstance = null;
    let genderInstance = null;
    let topCountriesInstance = null;
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

    // 初始化堆叠面积图
const initStackedAreaChart = () => {
  if (!riverChart.value) return;
  
  const allSports = [...new Set(SPORTS_MEDAL_DATA.flatMap(d => d.sports.map(s => s.name)))];
  
  // 按年份排序
  const years = [...new Set(SPORTS_MEDAL_DATA.map(d => d.year))].sort((a, b) => a - b);
  
  // 准备系列数据（使用所有项目）
  const series = allSports.map(sport => {
    return {
      name: sport,
      type: 'line',
      stack: 'total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: years.map(year => {
        const yearData = SPORTS_MEDAL_DATA.find(d => d.year === year);
        if (!yearData) return 0;
        const sportData = yearData.sports.find(s => s.name === sport);
        return sportData ? sportData.medals : 0;
      })
    };
  });

  // 颜色调色板
  const colorPalette = [
   
"#4E79A7","#A0CBE8","#76B7B2","#59A14F","#8CD17D","#B6992D","#F1CE63","#499894","#86BCB6","#E15759","#FF9D9A","#79706E","#D37295","#B07AA1","#9D7660","#F48B71","#F2C94C","#4A90E2","#50C878","#E55353","#7D7D7D","#9575CD","#F06543","#26C6DA","#3B5998","#1A73E8","#0F9D58","#DB4437","#F4B400","#4285F4","#FF5733","#33FF57","#3333FF","#FF3399","#9933FF","#3366FF","#FF6633","#66FF33","#6633FF","#FF9933","#33FF99","#99FF33","#33CCFF","#FF33CC","#CC33FF","#FFCC33","#33FFCC","#CCFF33","#6666FF","#FF6666","#66FF66","#9999FF","#FF9999","#99FF99","#CCCCFF","#FFCCCC","#CCFFCC","#0066CC","#CC0066","#66CC00","#0099FF","#FF0099","#99FF00","#00CCFF","#FF00CC","#CCFF00","#003366","#660033","#336600","#006699","#990066","#669900","#0099CC","#CC0099","#99CC00","#00CC99","#9900CC","#CC9900","#336699","#993366","#669933","#3399CC","#CC3399","#99CC33","#33CC99","#9933CC","#CC9933","#4477AA","#AA4477","#77AA44","#44AACC","#CC44AA","#AACC44","#44CCAA","#AA44CC","#CCAA44","#5588BB","#BB5588","#88BB55","#55BBCC","#CC55BB","#BBCC55","#55CCBB","#BB55CC","#CCBB55"
  ];
  // 只显示前十个项目
  const selectedLegend = allSports.reduce((acc, sport, index) => {
    acc[sport] = index < 10; 
    return acc;
  }, {});

  const option = {
    title: {
      text: 'Changes in the number of gold medals in Olympic events (1896-2024)',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        let result = `Year: ${years[params[0].dataIndex]}<br/>`;
        params.forEach(param => {
          result += `${param.seriesName}: ${param.value}<br/>`;
        });
        result += `Total: ${params.reduce((sum, param) => sum + param.value, 0)}`;
        return result;
      }
    },
    legend: {
      data: allSports, // 使用所有项目名称
      selected: selectedLegend, // 只显示前十个项目
      top: 30,
      type: 'scroll', // 开启滚动条适应更多图例
      pageIconColor: '#4E79A7',
      pageTextStyle: {
        color: '#333'
      }
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
      data: years,
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Number of gold medals',
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: series,
    color: colorPalette,
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ]
  };

  riverInstance = echarts.init(riverChart.value);
  riverInstance.setOption(option);
};

    // 初始化性别比例折线图
    const initGenderChart = () => {
      if (!genderChart.value) return;
      
      const option = {
        title: {
          text: 'Changes in the Gender Ratio of Olympic Athletes(1896-2024)',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const data = params[0].data;
            return `Year: ${data.year}`;
          }
        },
        legend: {
          data: ['Male', 'Female'],
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
          data: GENDER_RATIO_DATA.map(d => d.year)
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: 'Male',
            type: 'line',
            stack: 'total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: GENDER_RATIO_DATA.map(d => ({
              value: d.male,
              year: d.year
            })),
            itemStyle: {
              color: '#5470C6'
            }
          },
          {
            name: 'Female',
            type: 'line',
            stack: 'total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: GENDER_RATIO_DATA.map(d => ({
              value: d.female,
              year: d.year
            })),
            itemStyle: {
              color: '#EE6666'
            }
          }
        ]
      };

      genderInstance = echarts.init(genderChart.value);
      genderInstance.setOption(option);
    };

    // 初始化金牌国家柱状图
    const initTopCountriesChart = () => {
      if (!topCountriesChart.value) return;
      
      const data = TOP_COUNTRIES_DATA.sort((a, b) => b.top3Count - a.top3Count);
      
      const option = {
        title: {
          text: 'The country with the most top three gold medals in the Olympic Games',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            const data = params[0].data;
            return `${data.country}<br/>
                    Number: ${data.goldMedals}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: 'Number of times in the top three',
          axisLabel: {
            formatter: '{value} times'
          }
        },
        yAxis: {
          type: 'category',
          data: data.map(d => d.country),
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        series: [
          {
            name: '前三名次数',
            type: 'bar',
            data: data.map(d => ({
              value: d.top3Count,
              country: d.country,
              goldMedals: d.goldMedals
            })),
            itemStyle: {
              color: params => {
                // 根据排名设置不同颜色
                const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                return params.dataIndex < 3 ? colors[params.dataIndex] : '#5470C6';
              }
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{@[1]} times'
            }
          }
        ]
      };

      topCountriesInstance = echarts.init(topCountriesChart.value);
      topCountriesInstance.setOption(option);
    };

    onMounted(async () => {
      try {
        await initMapChart();
        initStackedAreaChart(); 
        initGenderChart();
        initTopCountriesChart();
        
        window.addEventListener('resize', () => {
          mapInstance?.resize();
          riverInstance?.resize();
          genderInstance?.resize();
          topCountriesInstance?.resize();
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
      forceRetry,
      riverChart,
      genderChart,
      topCountriesChart
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
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
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
.chart-row-one {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 800px; 
  margin-top: 20px;
}
.chart-row {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 300px; 
  margin-top: 20px;
}

.chart-item {
  flex: 1;
  min-width: 300px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .chart-row {
    height: 1800px;
    flex-direction: column;
  }
  
  .chart-item {
    height: 600px;
  }
}
</style>