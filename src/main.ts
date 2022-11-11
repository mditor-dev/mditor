import { createApp } from 'vue';
import App from './App.vue';
import './samples/node-api';
import pinia from './store/init';
import './assets/index.scss';
createApp(App)
  .use(pinia)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
