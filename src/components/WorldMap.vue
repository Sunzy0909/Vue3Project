<template>
<div class="map-container">
  <div class="year-selector">
    <select v-model="selectedYear" @change="updateAllCharts">
      <option value="">Select an Olympic year</option>
      <option v-for="year in olympicYears" :key="year" :value="year">{{ year }}</option>
    </select>
  </div>
  <div ref="mapChart" class="map-chart"></div>
  

  <div class="chart-row">
    <div ref="athletesChart" class="medal-chart"></div>
    <div ref="continentChart" class="medal-chart"></div>
    <div ref="goldRatioChart" class="medal-chart"></div>
  </div>
  <div class="chart-row">
    <div ref="wordCloudChart" class="medal-chart"></div>
  </div>
  <div class="chart-row">
    <div ref="genderChart" class="medal-chart"></div>
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
import 'echarts-wordcloud';

// 奥运会数据
const OLYMPIC_DATA = {
  "1996": {
    medals: [
      { country: "United States", gold: 44 },
      { country: "Russia", gold: 26 },
      { country: "Germany", gold: 20 },
      { country: "China", gold: 16 },
      { country: "France", gold: 15 },
      { country: "Italy", gold: 13 },
      { country: "Australia", gold: 9 },
      { country: "Cuba", gold: 9 },
      { country: "Ukraine", gold: 9 },
      { country: "Korea", gold: 7 }
    ],
    athletes: [
      { country: "United States", athletes: 750 }, 
      { country: "Russia", athletes: 390 },
      { country: "Germany", athletes: 465 },
      { country: "China", athletes: 294 },
      { country: "France", athletes: 299 },
      { country: "Italy", athletes: 346 },
      { country: "Australia", athletes: 424 },
      { country: "Cuba", athletes: 164 },
      { country: "Ukraine", athletes: 231 },
      { country: "Korea", athletes: 300 }
    ]
  },
  "2000": {
    medals: [
      { country: "United States", gold: 40 },
      { country: "Russia", gold: 32 },
      { country: "China", gold: 28 },
      { country: "Australia", gold: 16 },
      { country: "Germany", gold: 14 },
      { country: "France", gold: 13 },
      { country: "Italy", gold: 13 },
      { country: "Netherlands", gold: 12 },
      { country: "Cuba", gold: 11 },
      { country: "United Kingdom", gold: 11 }
    ],
    athletes: [
      { country: "United States", athletes: 586 },
      { country: "Russia", athletes: 435 },
      { country: "China", athletes: 311 },
      { country: "Australia", athletes: 632 },  
      { country: "Germany", athletes: 422 },
      { country: "France", athletes: 336 },
      { country: "Italy", athletes: 361 },
      { country: "Netherlands", athletes: 243 },
      { country: "Cuba", athletes: 229 },
      { country: "United Kingdom", athletes: 310 }
    ]
  },
  "2004": {
    medals: [
      { country: "United States", gold: 35 },
      { country: "China", gold: 32 },
      { country: "Russia", gold: 27 },
      { country: "Australia", gold: 17 },
      { country: "Japan", gold: 16 },
      { country: "Germany", gold: 14 },
      { country: "France", gold: 11 },
      { country: "Italy", gold: 10 },
      { country: "Korea", gold: 9 },
      { country: "United Kingdom", gold: 9 }
    ],
    athletes: [
      { country: "United States", athletes: 533 },
      { country: "China", athletes: 384 },
      { country: "Russia", athletes: 446 },
      { country: "Australia", athletes: 482 },
      { country: "Japan", athletes: 306 },
      { country: "Germany", athletes: 452 },
      { country: "France", athletes: 308 },
      { country: "Italy", athletes: 364 },
      { country: "Korea", athletes: 264 },
      { country: "United Kingdom", athletes: 264 }
    ]
  },
  "2008": {
    medals: [
      { country: "China", gold: 51 }, 
      { country: "United States", gold: 36 },
      { country: "Russia", gold: 24 },
      { country: "United Kingdom", gold: 19 },
      { country: "Germany", gold: 16 },
      { country: "Australia", gold: 14 },
      { country: "Korea", gold: 13 },
      { country: "Japan", gold: 9 },
      { country: "Italy", gold: 8 },
      { country: "France", gold: 7 }
    ],
    athletes: [
      { country: "China", athletes: 639 },  
      { country: "United States", athletes: 596 },
      { country: "Russia", athletes: 455 },
      { country: "United Kingdom", athletes: 313 },
      { country: "Germany", athletes: 439 },
      { country: "Australia", athletes: 433 },
      { country: "Korea", athletes: 267 },
      { country: "Japan", athletes: 332 },
      { country: "Italy", athletes: 344 },
      { country: "France", athletes: 323 }
    ]
  },
  "2012": {
    medals: [
      { country: "United States", gold: 46 },
      { country: "China", gold: 38 },
      { country: "United Kingdom", gold: 29 },
      { country: "Russia", gold: 24 },
      { country: "Korea", gold: 13 },
      { country: "Germany", gold: 11 },
      { country: "France", gold: 11 },
      { country: "Italy", gold: 8 },
      { country: "Hungary", gold: 8 },
      { country: "Australia", gold: 7 }
    ],
    athletes: [
      { country: "United States", athletes: 530 },
      { country: "China", athletes: 396 },
      { country: "United Kingdom", athletes: 541 }, 
      { country: "Russia", athletes: 436 },
      { country: "Korea", athletes: 248 },
      { country: "Germany", athletes: 392 },
      { country: "France", athletes: 330 },
      { country: "Italy", athletes: 284 },
      { country: "Hungary", athletes: 157 },
      { country: "Australia", athletes: 410 }
    ]
  },
  "2016": {
    medals: [
      { country: "United States", gold: 46 },
      { country: "United Kingdom", gold: 27 },
      { country: "China", gold: 26 },
      { country: "Russia", gold: 19 },
      { country: "Germany", gold: 17 },
      { country: "France", gold: 10 },
      { country: "Japan", gold: 12 },
      { country: "Australia", gold: 8 },
      { country: "Italy", gold: 8 },
      { country: "Canada", gold: 4 }
    ],
    athletes: [
      { country: "United States", athletes: 554 },
      { country: "United Kingdom", athletes: 366 },
      { country: "China", athletes: 413 },
      { country: "Russia", athletes: 271 }, 
      { country: "Germany", athletes: 425 },
      { country: "France", athletes: 399 },
      { country: "Japan", athletes: 338 },
      { country: "Australia", athletes: 421 },
      { country: "Italy", athletes: 309 },
      { country: "Canada", athletes: 314 }
    ]
  },
  "2020": {
    medals: [
      { country: "United States", gold: 39 },
      { country: "China", gold: 38 },
      { country: "Japan", gold: 27 },
      { country: "United Kingdom", gold: 22 },
      { country: "Russia", gold: 20 },
      { country: "Australia", gold: 17 },
      { country: "Netherlands", gold: 10 },
      { country: "France", gold: 10 },
      { country: "Germany", gold: 10 },
      { country: "Italy", gold: 10 }
    ],
    athletes: [
      { country: "United States", athletes: 613 },
      { country: "China", athletes: 406 },
      { country: "Japan", athletes: 582 },  
      { country: "United Kingdom", athletes: 376 },
      { country: "Russia", athletes: 335 },  
      { country: "Australia", athletes: 478 },
      { country: "Netherlands", athletes: 278 },
      { country: "France", athletes: 398 },
      { country: "Germany", athletes: 425 },
      { country: "Italy", athletes: 372 }
    ]
  },
  "2024": {
    medals: [
      { country: "United States", gold: 40 },
      { country: "China", gold: 35 },
      { country: "United Kingdom", gold: 25 },
      { country: "France", gold: 20 },
      { country: "Germany", gold: 18 },
      { country: "Japan", gold: 15 },
      { country: "Australia", gold: 12 },
      { country: "Italy", gold: 10 },
      { country: "Netherlands", gold: 9 },
      { country: "Canada", gold: 8 }
    ],
    athletes: [
      { country: "United States", athletes: 592 }, 
      { country: "China", athletes: 405 },        
      { country: "France", athletes: 570 },        
      { country: "Germany", athletes: 405 },
      { country: "Japan", athletes: 410 },
      { country: "Australia", athletes: 460 },
      { country: "United Kingdom", athletes: 376 },
      { country: "Italy", athletes: 381 },
      { country: "Netherlands", athletes: 250 },
      { country: "Canada", athletes: 300 }
    ]
  }
};

// 各届奥运会运动项目数据
const OLYMPIC_SPORTS = {
"2024": [
{ name: "3x3 Basketball", value: 3 },
{ name: "Archery", value: 9 },
{ name: "Artistic Gymnastics", value: 15 },
{ name: "Artistic Swimming", value: 2 },
{ name: "Athletics", value: 59 },
{ name: "Badminton", value: 7 },
{ name: "Beach Volleyball", value: 2 },
{ name: "Boxing", value: 12 },
{ name: "Breaking", value: 2 },
{ name: "Canoe Slalom", value: 9 },
{ name: "Canoe Sprint", value: 16 },
{ name: "Cycling BMX Freestyle", value: 1 },
{ name: "Cycling BMX Racing", value: 1 },
{ name: "Cycling Road", value: 2 },
{ name: "Cycling Track", value: 26 },
{ name: "Diving", value: 8 },
{ name: "Equestrian", value: 12 },
{ name: "Fencing", value: 19 },
{ name: "Football", value: 2 },
{ name: "Golf", value: 4 },
{ name: "Handball", value: 2 },
{ name: "Hockey", value: 4 },
{ name: "Judo", value: 28 },
{ name: "Marathon Swimming", value: 2 },
{ name: "Modern Pentathlon", value: 4 },
{ name: "Rhythmic Gymnastics", value: 4 },
{ name: "Rowing", value: 30 },
{ name: "Rugby Sevens", value: 1 },
{ name: "Sailing", value: 15 },
{ name: "Shooting", value: 19 },
{ name: "Skateboarding", value: 5 },
{ name: "Sport Climbing", value: 5 },
{ name: "Swimming", value: 21 },
{ name: "Table Tennis", value: 4 },
{ name: "Taekwondo", value: 11 },
{ name: "Tennis", value: 3 },
{ name: "Trampoline Gymnastics", value: 1 },
{ name: "Triathlon", value: 3 },
{ name: "Volleyball", value: 2 },
{ name: "Water Polo", value: 1 },
{ name: "Weightlifting", value: 5 },
{ name: "Wrestling", value: 30 }
],
"2020": [
{ name: "3x3 Basketball", value: 1 },
{ name: "Archery", value: 7 },
{ name: "Artistic Gymnastics", value: 11 },
{ name: "Athletics", value: 67 },
{ name: "Badminton", value: 5 },
{ name: "Baseball/Softball", value: 2 },
{ name: "Basketball", value: 1 },
{ name: "Beach Volleyball", value: 2 },
{ name: "Boxing", value: 21 },
{ name: "Canoe Slalom", value: 5 },
{ name: "Canoe Sprint", value: 18 },
{ name: "Cycling BMX Freestyle", value: 2 },
{ name: "Cycling BMX Racing", value: 4 },
{ name: "Cycling Mountain Bike", value: 1 },
{ name: "Cycling Road", value: 5 },
{ name: "Cycling Track", value: 22 },
{ name: "Diving", value: 6 },
{ name: "Equestrian", value: 10 },
{ name: "Fencing", value: 10 },
{ name: "Football", value: 1 },
{ name: "Golf", value: 2 },
{ name: "Handball", value: 1 },
{ name: "Hockey", value: 3 },
{ name: "Judo", value: 28 },
{ name: "Karate", value: 11 },
{ name: "Marathon Swimming", value: 4 },
{ name: "Modern Pentathlon", value: 4 },
{ name: "Rhythmic Gymnastics", value: 2 },
{ name: "Rowing", value: 22 },
{ name: "Rugby Sevens", value: 2 },
{ name: "Sailing", value: 16 },
{ name: "Shooting", value: 4 },
{ name: "Skateboarding", value: 6 },
{ name: "Sport Climbing", value: 2 },
{ name: "Surfing", value: 2 },
{ name: "Swimming", value: 25 },
{ name: "Table Tennis", value: 7 },
{ name: "Taekwondo", value: 8 },
{ name: "Tennis", value: 2 },
{ name: "Trampoline Gymnastics", value: 2 },
{ name: "Triathlon", value: 5 },
{ name: "Water Polo", value: 3 },
{ name: "Weightlifting", value: 16 },
{ name: "Wrestling", value: 26 }
],
"2016": [
{ name: "Archery", value: 1 },
{ name: "Athletics", value: 50 },
{ name: "Badminton", value: 8 },
{ name: "Beach Volleyball", value: 3 },
{ name: "Boxing", value: 13 },
{ name: "Canoeing", value: 21 },
{ name: "Cycling", value: 26 },
{ name: "Diving", value: 8 },
{ name: "Equestrianism", value: 9 },
{ name: "Fencing", value: 8 },
{ name: "Football", value: 3 },
{ name: "Golf", value: 2 },
{ name: "Gymnastics", value: 14 },
{ name: "Handball", value: 2 },
{ name: "Hockey", value: 4 },
{ name: "Judo", value: 24 },
{ name: "Modern Pentathlon", value: 2 },
{ name: "Rowing", value: 23 },
{ name: "Rugby Sevens", value: 2 },
{ name: "Sailing", value: 12 },
{ name: "Shooting", value: 19 },
{ name: "Swimming", value: 28 },
{ name: "Synchronized Swimming", value: 2 },
{ name: "Table Tennis", value: 6 },
{ name: "Taekwondo", value: 7 },
{ name: "Tennis", value: 4 },
{ name: "Trampolining", value: 1 },
{ name: "Triathlon", value: 3 },
{ name: "Volleyball", value: 1 },
{ name: "Water Polo", value: 2 },
{ name: "Weightlifting", value: 17 },
{ name: "Wrestling", value: 20 }
],
"2012": [
{ name: "Archery", value: 5 },
{ name: "Athletics", value: 46 },
{ name: "Badminton", value: 3 },
{ name: "Beach Volleyball", value: 2 },
{ name: "Boxing", value: 22 },
{ name: "Canoeing", value: 24 },
{ name: "Cycling", value: 29 },
{ name: "Diving", value: 5 },
{ name: "Equestrianism", value: 15 },
{ name: "Fencing", value: 12 },
{ name: "Football", value: 2 },
{ name: "Gymnastics", value: 13 },
{ name: "Handball", value: 2 },
{ name: "Hockey", value: 4 },
{ name: "Judo", value: 22 },
{ name: "Modern Pentathlon", value: 3 },
{ name: "Rhythmic Gymnastics", value: 1 },
{ name: "Rowing", value: 21 },
{ name: "Sailing", value: 12 },
{ name: "Shooting", value: 11 },
{ name: "Swimming", value: 24 },
{ name: "Table Tennis", value: 3 },
{ name: "Taekwondo", value: 7 },
{ name: "Tennis", value: 2 },
{ name: "Triathlon", value: 2 },
{ name: "Volleyball", value: 2 },
{ name: "Water Polo", value: 1 },
{ name: "Weightlifting", value: 19 },
{ name: "Wrestling", value: 25 }
],
"2008": [
{ name: "Archery", value: 1 },
{ name: "Athletics", value: 47 },
{ name: "Badminton", value: 4 },
{ name: "Boxing", value: 16 },
{ name: "Canoeing", value: 11 },
{ name: "Cycling", value: 21 },
{ name: "Diving", value: 1 },
{ name: "Equestrianism", value: 4 },
{ name: "Fencing", value: 10 },
{ name: "Football", value: 1 },
{ name: "Gymnastics", value: 5 },
{ name: "Handball", value: 2 },
{ name: "Hockey", value: 1 },
{ name: "Judo", value: 18 },
{ name: "Modern Pentathlon", value: 3 },
{ name: "Rowing", value: 16 },
{ name: "Sailing", value: 14 },
{ name: "Shooting", value: 6 },
{ name: "Softball", value: 1 },
{ name: "Swimming", value: 20 },
{ name: "Synchronized Swimming", value: 1 },
{ name: "Taekwondo", value: 9 },
{ name: "Triathlon", value: 2 },
{ name: "Water Polo", value: 2 },
{ name: "Weightlifting", value: 10 },
{ name: "Wrestling", value: 19 }
],
"2004": [
{ name: "Archery", value: 3 },
{ name: "Athletics", value: 42 },
{ name: "Badminton", value: 5 },
{ name: "Baseball", value: 1 },
{ name: "Basketball", value: 1 },
{ name: "Boxing", value: 6 },
{ name: "Canoeing", value: 16 },
{ name: "Cycling", value: 14 },
{ name: "Diving", value: 2 },
{ name: "Equestrianism", value: 4 },
{ name: "Fencing", value: 11 },
{ name: "Football", value: 2 },
{ name: "Gymnastics", value: 8 },
{ name: "Hockey", value: 2 },
{ name: "Judo", value: 19 },
{ name: "Modern Pentathlon", value: 4 },
{ name: "Rhythmic Gymnastics", value: 1 },
{ name: "Rowing", value: 14 },
{ name: "Sailing", value: 12 },
{ name: "Shooting", value: 6 },
{ name: "Softball", value: 1 },
{ name: "Swimming", value: 24 },
{ name: "Synchronized Swimming", value: 2 },
{ name: "Table Tennis", value: 2 },
{ name: "Taekwondo", value: 6 },
{ name: "Triathlon", value: 2 },
{ name: "Volleyball", value: 1 },
{ name: "Water Polo", value: 3 },
{ name: "Weightlifting", value: 8 },
{ name: "Wrestling", value: 14 }
],
"2000": [
{ name: "Archery", value: 2 },
{ name: "Athletics", value: 54 },
{ name: "Badminton", value: 4 },
{ name: "Basketball", value: 1 },
{ name: "Beach Volleyball", value: 1 },
{ name: "Boxing", value: 11 },
{ name: "Canoeing", value: 19 },
{ name: "Cycling", value: 13 },
{ name: "Diving", value: 1 },
{ name: "Equestrianism", value: 6 },
{ name: "Fencing", value: 7 },
{ name: "Football", value: 1 },
{ name: "Gymnastics", value: 4 },
{ name: "Handball", value: 2 },
{ name: "Hockey", value: 2 },
{ name: "Judo", value: 18 },
{ name: "Modern Pentathlon", value: 3 },
{ name: "Rhythmic Gymnastics", value: 1 },
{ name: "Rowing", value: 14 },
{ name: "Sailing", value: 11 },
{ name: "Shooting", value: 10 },
{ name: "Softball", value: 1 },
{ name: "Swimming", value: 19 },
{ name: "Synchronized Swimming", value: 2 },
{ name: "Taekwondo", value: 5 },
{ name: "Tennis", value: 1 },
{ name: "Volleyball", value: 1 },
{ name: "Water Polo", value: 1 },
{ name: "Weightlifting", value: 18 },
{ name: "Wrestling", value: 7 }
],
"1996": [
{ name: "Archery", value: 2 },
{ name: "Athletics", value: 43 },
{ name: "Badminton", value: 6 },
{ name: "Baseball", value: 1 },
{ name: "Basketball", value: 1 },
{ name: "Boxing", value: 10 },
{ name: "Canoeing", value: 19 },
{ name: "Cycling", value: 11 },
{ name: "Equestrianism", value: 6 },
{ name: "Fencing", value: 13 },
{ name: "Football", value: 2 },
{ name: "Gymnastics", value: 12 },
{ name: "Handball", value: 1 },
{ name: "Hockey", value: 2 },
{ name: "Judo", value: 17 },
{ name: "Modern Pentathlon", value: 2 },
{ name: "Rowing", value: 9 },
{ name: "Sailing", value: 13 },
{ name: "Shooting", value: 11 },
{ name: "Swimming", value: 17 },
{ name: "Synchronized Swimming", value: 1 },
{ name: "Tennis", value: 2 },
{ name: "Volleyball", value: 2 },
{ name: "Water Polo", value: 1 },
{ name: "Weightlifting", value: 11 },
{ name: "Wrestling", value: 14 }
]
};

// 各届奥运会金牌榜前十名国家的男女运动员比例
const GENDER_RATIO = {
  "1996": [
    { "country": "United States", "male": 62, "female": 38 },
    { "country": "Russia", "male": 65, "female": 35 },
    { "country": "Germany", "male": 63, "female": 37 },
    { "country": "China", "male": 36, "female": 64 },
    { "country": "France", "male": 60, "female": 40 },
    { "country": "Italy", "male": 67, "female": 33 },
    { "country": "Australia", "male": 59, "female": 41 },
    { "country": "Cuba", "male": 71, "female": 29 },
    { "country": "Ukraine", "male": 63, "female": 37 },
    { "country": "Korea", "male": 65, "female": 35 }
  ],
  "2000": [
    { "country": "United States", "male": 60, "female": 40 },
    { "country": "Russia", "male": 63, "female": 37 },
    { "country": "Germany", "male": 61, "female": 39 },
    { "country": "China", "male": 34, "female": 66 },
    { "country": "France", "male": 58, "female": 42 },
    { "country": "Italy", "male": 65, "female": 35 },
    { "country": "Australia", "male": 57, "female": 43 },
    { "country": "Cuba", "male": 70, "female": 30 },
    { "country": "Ukraine", "male": 62, "female": 38 },
    { "country": "Korea", "male": 63, "female": 37 }
  ],
  "2004": [
    { "country": "United States", "male": 58, "female": 42 },
    { "country": "Russia", "male": 61, "female": 39 },
    { "country": "Germany", "male": 59, "female": 41 },
    { "country": "China", "male": 34, "female": 66 },
    { "country": "France", "male": 56, "female": 44 },
    { "country": "Italy", "male": 63, "female": 37 },
    { "country": "Australia", "male": 55, "female": 45 },
    { "country": "Cuba", "male": 68, "female": 32 },
    { "country": "Ukraine", "male": 60, "female": 40 },
    { "country": "Korea", "male": 61, "female": 39 }
  ],
  "2008": [
    { "country": "United States", "male": 54, "female": 46 },
    { "country": "Russia", "male": 58, "female": 42 },
    { "country": "Germany", "male": 56, "female": 44 },
    { "country": "China", "male": 51, "female": 49 },
    { "country": "France", "male": 53, "female": 47 },
    { "country": "Italy", "male": 60, "female": 40 },
    { "country": "Australia", "male": 52, "female": 48 },
    { "country": "Cuba", "male": 65, "female": 35 },
    { "country": "Ukraine", "male": 57, "female": 43 },
    { "country": "Korea", "male": 58, "female": 42 }
  ],
  "2012": [
    { "country": "United States", "male": 52, "female": 48 },
    { "country": "Russia", "male": 55, "female": 45 },
    { "country": "Germany", "male": 53, "female": 47 },
    { "country": "China", "male": 43, "female": 57 },
    { "country": "France", "male": 51, "female": 49 },
    { "country": "Italy", "male": 57, "female": 43 },
    { "country": "Australia", "male": 50, "female": 50 },
    { "country": "Cuba", "male": 62, "female": 38 },
    { "country": "Ukraine", "male": 54, "female": 46 },
    { "country": "Korea", "male": 55, "female": 45 }
  ],
  "2016": [
    { "country": "United States", "male": 49, "female": 51 },
    { "country": "Russia", "male": 53, "female": 47 },
    { "country": "Germany", "male": 51, "female": 49 },
    { "country": "China", "male": 38, "female": 62 },
    { "country": "France", "male": 49, "female": 51 },
    { "country": "Italy", "male": 55, "female": 45 },
    { "country": "Australia", "male": 48, "female": 52 },
    { "country": "Cuba", "male": 60, "female": 40 },
    { "country": "Ukraine", "male": 52, "female": 48 },
    { "country": "Korea", "male": 53, "female": 47 }
  ],
  "2020": [
    { "country": "United States", "male": 47, "female": 53 },
    { "country": "China", "male": 31, "female": 69 },
    { "country": "Japan", "male": 49, "female": 51 },
    { "country": "United Kingdom", "male": 48, "female": 52 },
    { "country": "Russia", "male": 50, "female": 50 },
    { "country": "Australia", "male": 46, "female": 54 },
    { "country": "Netherlands", "male": 48, "female": 52 },
    { "country": "France", "male": 49, "female": 51 },
    { "country": "Germany", "male": 48, "female": 52 },
    { "country": "Italy", "male": 50, "female": 50 }
  ],
  "2024": [
    { "country": "United States", "male": 47, "female": 53 },
    { "country": "China", "male": 34, "female": 66 },
    { "country": "United Kingdom", "male": 48, "female": 52 },
    { "country": "France", "male": 49, "female": 51 },
    { "country": "Germany", "male": 48, "female": 52 },
    { "country": "Japan", "male": 49, "female": 51 },
    { "country": "Australia", "male": 47, "female": 53 },
    { "country": "Italy", "male": 50, "female": 50 },
    { "country": "Netherlands", "male": 48, "female": 52 },
    { "country": "Canada", "male": 49, "female": 51 }
  ]
};
// 名称映射表
const COUNTRY_NAME_MAPPING = {
  'ROC': 'Russian Federation',
  'South Korea': 'Korea, Republic of',
  'Korea, Republic of': 'Korea, Republic of',
  'Czech Republic': 'Czechia',
  'Iran': 'Iran, Islamic Republic of',
  'Vietnam': 'Viet Nam',
  'Bolivia': 'Bolivia, Plurinational State of',
  'Brunei': 'Brunei Darussalam',
  'Congo, Republic of the': 'Congo',
  'Congo, Democratic Republic of the': 'Democratic Republic of the Congo',
  'Ivory Coast': "Côte d'Ivoire",
  'Laos': "Lao People's Democratic Republic",
  'Moldova': 'Moldova, Republic of',
  'Syria': 'Syrian Arab Republic',
  'Tanzania': 'Tanzania, United Republic of',
  'Venezuela': 'Venezuela, Bolivarian Republic of',
  'Palestine': 'Palestine, State of'
};

// 反向映射，用于显示原始名称
const REVERSE_COUNTRY_MAPPING = {
  'Korea, Republic of': 'South Korea',
  'Czechia': 'Czech Republic',
  'Iran, Islamic Republic of': 'Iran',
  'Viet Nam': 'Vietnam',
  'Bolivia, Plurinational State of': 'Bolivia',
  'Brunei Darussalam': 'Brunei',
  'Congo': 'Congo, Republic of the',
  'Democratic Republic of the Congo': 'Congo, Democratic Republic of the',
  "Côte d'Ivoire": 'Ivory Coast',
  "Lao People's Democratic Republic": 'Laos',
  'Moldova, Republic of': 'Moldova',
  'Syrian Arab Republic': 'Syria',
  'Tanzania, United Republic of': 'Tanzania',
  'Venezuela, Bolivarian Republic of': 'Venezuela',
  'Palestine, State of': 'Palestine'
};

const CONTINENT_DATA = {
  "Asia": ["China", "Japan", "Korea", "Iran", "Kazakhstan", "Uzbekistan", "India", "Indonesia", "Thailand", "Malaysia"],
  "Europe": ["Russia", "Germany", "France", "Italy", "United Kingdom", "Netherlands", "Hungary", "Spain", "Sweden", "Norway"],
  "Americas": ["United States", "Cuba", "Canada", "Brazil", "Argentina", "Mexico", "Colombia", "Jamaica", "Dominican Republic", "Venezuela"],
  "Oceania": ["Australia", "New Zealand", "Fiji"],
  "Africa": ["South Africa", "Kenya", "Ethiopia", "Nigeria", "Egypt", "Algeria", "Morocco", "Tunisia"]
};

const CONTINENT_COLORS = {
  "Asia": "#800080",    // 深紫色
  "Europe": "#9B59B6",  // 紫水晶色
  "Americas": "#8A2BE2", // 紫罗兰色
  "Oceania": "#9932CC",  // 暗紫色
  "Africa": "#6A0DAD",   // 葡萄紫色
  "Other": "#800080"     // 深紫色
};


const TOTAL_GOLD_MEDALS = {
  "1996": 271,
  "2000": 300,
  "2004": 301,
  "2008": 302,
  "2012": 302,
  "2016": 307,
  "2020": 339,
  "2024": 329
};

export default {
  setup() {
    const mapChart = ref(null);
    const athletesChart = ref(null); // 修改：将goldMedalChart改为athletesChart
    const goldRatioChart = ref(null);
    const continentChart = ref(null);
    const error = ref(null);
    const selectedYear = ref("");
    const olympicYears = ref([]);
    const olympicData = ref({});
    let mapInstance = null;
    let athletesInstance = null; 
    let goldRatioInstance = null;
    let continentInstance = null; 
    const genderChart = ref(null);
    const wordCloudChart = ref(null);
    let genderInstance = null;
    let wordCloudInstance = null;

    // 初始化奥运数据
    const initOlympicData = () => {
      try {
        olympicData.value = OLYMPIC_DATA;
        olympicYears.value = Object.keys(olympicData.value).sort();
      } catch (err) {
        console.error('初始化奥运数据失败:', err);
        error.value = '初始化奥运数据失败';
      }
    };

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

    // 根据排名获取颜色
    const getColorByRank = (rank) => {
     const colors = [
    '#00008B', // 深蓝色 - 第一名
    '#0000CD', // 中蓝色 - 第二名
    '#4169E1', // 皇家蓝 - 第三名
    '#1E90FF', // 遇见蓝 - 第四名
    '#4682B4', // 钢蓝色 - 第五名
    '#5F9EA0', // 蓝绿色 - 第六名
    '#6495ED', // 矢车菊蓝 - 第七名
    '#87CEEB', // 天空蓝 - 第八名
    '#ADD8E6', // 浅蓝色 - 第九名
    '#B0E0E6'  // 粉蓝色 - 第十名
];

      return rank >= 1 && rank <= 10 ? colors[rank - 1] : '#E0E0E0';
    };

    // 处理国家名称映射
    const getMappedName = (name) => {
      return COUNTRY_NAME_MAPPING[name] || name;
    };

    // 获取原始国家名称
    const getOriginalName = (name) => {
      return REVERSE_COUNTRY_MAPPING[name] || name;
    };

    // 更新地图
    const updateMap = async () => {
      try {
        const worldJson = await loadWorldData();
        echarts.registerMap('world', worldJson);

        const currentYearData = selectedYear.value ? olympicData.value[selectedYear.value]?.medals || [] : [];

        const countryDataMap = new Map();
        currentYearData.forEach((item, index) => {
          const rank = index + 1;
          const mappedName = getMappedName(item.country);
          countryDataMap.set(mappedName, {
            rank,
            gold: item.gold,
            originalName: item.country
          });
        });

        const allCountriesData = worldJson.features.map(feature => {
          const countryName = feature.properties.name;
          const countryData = countryDataMap.get(countryName);
          
          if (countryData) {
            return {
              name: countryName,
              value: countryData.rank,
              rank: countryData.rank,
              gold: countryData.gold,
              originalName: countryData.originalName,
              itemStyle: {
                color: getColorByRank(countryData.rank),
                borderColor: '#FFFFFF',
                borderWidth: 1
              },
              label: {
                show: true,
                position: 'inside',
                formatter: `No.${countryData.rank}`,
                color: '#000000',
                fontSize: 10
              }
            };
          } else {
            return {
              name: countryName,
              value: 0,
              itemStyle: {
                color: '#E0E0E0',
                borderColor: '#FFFFFF',
                borderWidth: 0.5
              },
              label: {
                show: false
              }
            };
          }
        });

        const option = {
          backgroundColor: '#FFFFFF',
          title: {
            text: selectedYear.value ? `Top 10 countries in the gold medal table of the ${selectedYear.value} Olympic Games` : ' ',
            left: 'center',
            top: 10,
            textStyle: {
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          visualMap: {
            show: true,
            type: 'piecewise',
            pieces: [
              { min: 1, max: 1, label: '1st place', color: getColorByRank(1) },
              { min: 2, max: 2, label: '2nd place', color: getColorByRank(2) },
              { min: 3, max: 3, label: '3rd place', color: getColorByRank(3) },
              { min: 4, max: 4, label: '4th place', color: getColorByRank(4) },
              { min: 5, max: 5, label: '5th place', color: getColorByRank(5) },
              { min: 6, max: 6, label: '6th place', color: getColorByRank(6) },
              { min: 7, max: 7, label: '7th place', color: getColorByRank(7) },
              { min: 8, max: 8, label: '8th place', color: getColorByRank(8) },
              { min: 9, max: 9, label: '9th place', color: getColorByRank(9) },
              { min: 10, max: 10, label: '10th place', color: getColorByRank(10) },
              { value: 0, label: 'Not in the top 10', color: '#E0E0E0' }
            ],
            orient: 'vertical',
            left: '10',
            top: 'center',
            textStyle: {
              fontSize: 12
            }
          },
          series: [{
            type: 'map',
            map: 'world',
            zoom: 1.0,
            data: allCountriesData,
            emphasis: {
              label: {
                show: true
              },
              itemStyle: {
                borderWidth: 2,
                borderColor: '#000000',
              }
            },
            label: {
              show: false,
              color: '#000000'
            }
          }],
          tooltip: {
            trigger: 'item',
            formatter: params => {
              if (!selectedYear.value) return params.name;
              
              if (params.data && params.data.rank) {
                return `
                  <div style="font-weight:bold;">${params.data.originalName}</div>
                  <div>${selectedYear.value}Olympic Ranking: No.${params.data.rank}</div>
                  <div>Number of gold medals: ${params.data.gold}</div>
                `;
              } else {
                return `${getOriginalName(params.name)}<br/>Not in the top 10`;
              }
            }
          }
        };

        if (mapInstance) {
          mapInstance.setOption(option, true);
        } else {
          mapInstance = echarts.init(mapChart.value);
          mapInstance.setOption(option);
        }

        error.value = null;
      } catch (err) {
        error.value = `更新地图失败: ${err.message}`;
        console.error('更新地图失败:', err);
      }
    };

    // 更新运动员数图表
    const updateAthletesChart = () => {
      if (!selectedYear.value) return;
      
      const currentYearData = olympicData.value[selectedYear.value]?.athletes || [];
      const sortedData = [...currentYearData].sort((a, b) => b.athletes - a.athletes);
      
      const option = {
        title: {
          text: `Number of athletes`,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}'
        },
        series: [{
          name: 'Number of athletes',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {c}'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: sortedData.map(item => ({
            value: item.athletes,
            name: item.country,
            itemStyle: {
              color: getColorByRank(currentYearData.findIndex(d => d.country === item.country) + 1)
            }
          }))
        }]
      };

      if (!athletesInstance) {
        athletesInstance = echarts.init(athletesChart.value);
      }
      athletesInstance.setOption(option);
    };

    // 更新金牌比例图表
    const updateGoldRatioChart = () => {
      if (!selectedYear.value) return;
      
      const currentYearData = olympicData.value[selectedYear.value]?.medals || [];
      const totalGold = TOTAL_GOLD_MEDALS[selectedYear.value] || 1;
      const sortedData = [...currentYearData].sort((a, b) => b.gold - a.gold);
      
      const top10Gold = sortedData.reduce((sum, item) => sum + item.gold, 0);
      const otherGold = totalGold - top10Gold;
      
      const data = [
        ...sortedData.map(item => ({
          value: item.gold,
          name: item.country,
          itemStyle: {
            color: getColorByRank(currentYearData.findIndex(d => d.country === item.country) + 1)
          }
        })),
        {
          value: otherGold,
          name: 'Other countries',
          itemStyle: {
            color: '#E0E0E0'
          }
        }
      ];

      const option = {
        title: {
          text: `Gold medal percentage in ${selectedYear.value}`,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            const percent = ((params.value / totalGold) * 100).toFixed(1);
            return `${params.name}: ${params.value}枚 (${percent}%)`;
          }
        },
        series: [{
          name: 'Gold medal percentage',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: params => {
              const percent = ((params.value / totalGold) * 100).toFixed(1);
              return params.dataIndex < 10 ? `${params.name}: ${percent}%` : '';
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: data
        }]
      };

      if (!goldRatioInstance) {
        goldRatioInstance = echarts.init(goldRatioChart.value);
      }
      goldRatioInstance.setOption(option);
    };

    const updateContinentChart = () => {
      if (!selectedYear.value) return;
      
      const currentYearData = olympicData.value[selectedYear.value]?.medals || [];
      
      const continentMap = new Map();
      
      Object.keys(CONTINENT_DATA).forEach(continent => {
        continentMap.set(continent, {
          name: continent,
          value: 0,
          itemStyle: { color: CONTINENT_COLORS[continent] },
          children: []
        });
      });
      
      continentMap.set("Other", {
        name: "Other",
        value: 0,
        itemStyle: { color: CONTINENT_COLORS["Other"] },
        children: []
      });
      
      currentYearData.forEach(countryData => {
        let foundContinent = null;
        
        for (const [continent, countries] of Object.entries(CONTINENT_DATA)) {
          if (countries.includes(countryData.country)) {
            foundContinent = continent;
            break;
          }
        }
        
        if (!foundContinent) {
          foundContinent = "Other";
        }
        
        const continentData = continentMap.get(foundContinent);
        continentData.value += countryData.gold;
        
        continentData.children.push({
          name: countryData.country,
          value: countryData.gold,
          itemStyle: { color: getColorByRank(currentYearData.findIndex(d => d.country === countryData.country) + 1) }
        });
      });
      
      const sunburstData = {
        name: "金牌分布",
        children: Array.from(continentMap.values())
      };
      
      const option = {
        title: {
          text: `Gold Medal Distribution by Continent in ${selectedYear.value} (Top 10 Countries)`,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            const path = params.treePathInfo.map(p => p.name).join(' > ');
            return `${path}<br/>Number of gold medals: ${params.value}`;
          }
        },
        series: {
          type: 'sunburst',
          data: sunburstData.children,
          radius: [0, '70%'],
          label: {
            rotate: 'radial',
            fontSize: 10,
            formatter: function(params) {
              return params.treePathInfo.length > 1 ? params.name : '';
            }
          },
          levels: [
            { 
              r0: '0%',
              r: '10%',
              label: {
                show: false 
              }
            },
            { 
              r0: '10%',
              r: '60%',
              label: {
                show: false 
              }
            }
          ]
        }
      };

      if (!continentInstance) {
        continentInstance = echarts.init(continentChart.value);
      }
      continentInstance.setOption(option);
    };


    //更新男女比例柱状图
    const updateGenderChart = () => {
      if (!selectedYear.value) return;
      
      const genderData = GENDER_RATIO[selectedYear.value] || [];
      
      const option = {
        title: {
          text: `Proportion of male and female athletes in the top 10 countries in the ${selectedYear.value} gold medal list`,
          left: 'center',
          top: 10,
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
            const male = params[0].value;
            const female = params[1].value;
            const total = male + female;
            return `
              ${params[0].name}<br/>
              Male: ${((male / total) * 100).toFixed(1)}%<br/>
              Female: ${((female / total) * 100).toFixed(1)}%
            `;
          }
        },
        legend: {
          data: ['Male', 'Female'],
          top: 40
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
          top: 80
        },
        xAxis: {
          type: 'category',
          data: genderData.map(item => item.country)
        },
        yAxis: {
          type: 'value',
          name: 'Number of athletes'
        },
        series: [
          {
            name: 'Male',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: genderData.map(item => item.male),
            itemStyle: {
              color: '#4169E1'
            }
          },
          {
            name: 'Female',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: genderData.map(item => item.female),
            itemStyle: {
              color: '#B0E0E6'
            }
          }
        ]
      };

      if (!genderInstance) {
        genderInstance = echarts.init(genderChart.value);
      }
      genderInstance.setOption(option);
    };

    //更新运动项目词云图
    const updateWordCloudChart = () => {
      if (!selectedYear.value) return;
      
      const sportsData = OLYMPIC_SPORTS[selectedYear.value] || [];
      
      const option = {
        title: {
          text: `Distribution of gold medals in sports at the ${selectedYear.value} Olympic Games`,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          show: true,
          formatter: params => {
            return `${params.name}: ${params.value}gold medals`;
          }
        },
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          right: null,
          bottom: null,
          sizeRange: [12, 60],
          rotationRange: [-90, 90],
          rotationStep: 45,
          gridSize: 8,
          drawOutOfBound: false,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: function () {
              return 'rgb(' + [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160)
              ].join(',') + ')';
            }
          },
          emphasis: {
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: sportsData
        }]
      };

      if (!wordCloudInstance) {
        wordCloudInstance = echarts.init(wordCloudChart.value);
      }
      wordCloudInstance.setOption(option);
    };

    const updateAllCharts = async () => {
      await updateMap();
      updateAthletesChart();
      updateGoldRatioChart();
      updateContinentChart();
      updateGenderChart(); 
      updateWordCloudChart(); 
    };

    // 初始化所有图表
    const initAllCharts = async (isRetry = false) => {
      try {
        if (mapInstance) mapInstance.dispose();
        if (athletesInstance) athletesInstance.dispose();
        if (goldRatioInstance) goldRatioInstance.dispose();
        if (continentInstance) continentInstance.dispose();
        if (genderInstance) genderInstance.dispose();
        if (wordCloudInstance) wordCloudInstance.dispose();
        mapInstance = null;
        athletesInstance = null;
        goldRatioInstance = null;
        continentInstance = null;
        genderInstance = null;
        wordCloudInstance = null;

        await new Promise(resolve => setTimeout(resolve, isRetry ? 1000 : 200));

        if (!mapChart.value || !athletesChart.value || !goldRatioChart.value || 
            !continentChart.value || !genderChart.value || !wordCloudChart.value) {
          throw new Error('图表容器未找到');
        }

        initOlympicData();
        mapInstance = echarts.init(mapChart.value);
        athletesInstance = echarts.init(athletesChart.value);
        goldRatioInstance = echarts.init(goldRatioChart.value);
        continentInstance = echarts.init(continentChart.value);
        genderInstance = echarts.init(genderChart.value); // 新增
        wordCloudInstance = echarts.init(wordCloudChart.value); // 新增
        
        await updateAllCharts();
        error.value = null;
      } catch (err) {
        error.value = `初始化失败: ${err.message}`;
        console.error('初始化失败:', err);
      }
    };

    // 组件挂载后初始化
    onMounted(async () => {
      try {
        await initAllCharts();
        
        window.addEventListener('resize', () => {
          mapInstance?.resize();
          athletesInstance?.resize();
          goldRatioInstance?.resize();
          continentInstance?.resize();
          genderInstance?.resize(); // 新增
          wordCloudInstance?.resize(); // 新增
        });
      } catch (err) {
        error.value = `初始化失败: ${err.message}`;
      }
    });
    const forceRetry = () => {
      error.value = null;
      initAllCharts(true);
    };
    return { 
      mapChart, 
      athletesChart, 
      goldRatioChart,
      continentChart,
      error, 
      forceRetry,
      selectedYear,
      olympicYears,
      updateAllCharts,
      genderChart,
      wordCloudChart
    };
  }
};
</script>

<style scoped>
.map-container {
  margin-top: 100px;
  position: relative;
  width: 100%;
  height: 220vh; 
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.map-chart {
  width: 100%;
  height: 60%;
}

.chart-row {
  display: flex;
  width: 100%;
  height: 20%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.medal-chart {
  flex: 1;
  height: 100%;
  padding: 0 10px;
}

.error-overlay {
  position: absolute;
  top: 60px;
  left: 20px;
  right: 20px;
  padding: 15px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
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
  margin-left: 10px;
}

.year-selector {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 60;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.year-selector select {
  padding: 8px 12px;
  font-size: 14px;
  min-width: 180px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.year-selector select:focus {
  border-color: #1890ff;
}
</style>