import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import App from './App.vue'
import router from './router'
import i18n from './locales'
import './assets/styles/global.css'
import { setupErrorHandlers } from './utils/errorHandler'

// 设置全局错误处理
setupErrorHandlers()

// 创建Pinia
const pinia = createPinia()

// 创建应用
const app = createApp(App)

// 使用插件
app.use(router)
app.use(pinia)
app.use(i18n)
app.use(Antd)

// 挂载应用
app.mount('#app')
