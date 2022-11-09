import { createApp } from 'vue';
import App from './App.vue';
import './samples/node-api';
import pinia from './store/init';
createApp(App)
  .use(pinia)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
