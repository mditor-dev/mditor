import { createApp } from 'vue';
import App from './App.vue';
import './samples/node-api';
import { store } from './store/index';
createApp(App)
  .use(store)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
