import { createRouter, createWebHistory } from 'vue-router';
import PageOne from '../components/PageOne.vue';
import PageTwo from '../components/PageTwo.vue';
import PageThree from '../components/PageThree.vue';
import PageFour from '../components/PageFour.vue';
import MainPage from '../components/MainPage.vue';

const routes = [
  {
    path: '/main',
    component: MainPage
  },
  {
    path: '/page1',
    component: PageOne
  },
  {
    path: '/page2',
    component: PageTwo
  },
  {
    path: '/',
    component: PageFour
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;