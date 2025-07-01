import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Echarts from 'vue-echarts'
import * as echarts from 'echarts'


const app = createApp(App);


app.component('e-charts',Echarts)
app.config.globalProperties.$echarts=echarts
app.use(router);

app.mount('#app'); 