import './index.css'

import { createApp } from 'vue'
import { plugin, defaultConfig } from '@formkit/vue'
import App from './App.vue'

createApp(App).use(plugin, defaultConfig).mount('#app')
