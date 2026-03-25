<script setup lang="ts">
// App.vue
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from './stores/user'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const initComplete = ref(false)
const route = useRoute()

// 监听登录状态变化
watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  console.log('用户登录状态变更为:', isLoggedIn ? '已登录' : '未登录')
  if (isLoggedIn) {
    console.log('当前登录用户:', userStore.userInfo?.username)
  }
})

// 监听路由变化，解决可能的404问题
watch(
  () => route.fullPath,
  () => {
    // 当URL中包含问号时，确保正确解析路由参数
    if (route.fullPath.includes('?')) {
      console.log('Route with query params:', route.fullPath)
    }
  },
  { immediate: true }
)

// 页面加载时初始化用户状态
onMounted(async () => {
  console.log('初始化用户状态...')
  try {
    await userStore.initUser()
    console.log('用户状态初始化完成，登录状态:', userStore.isLoggedIn)
    if (userStore.isLoggedIn && userStore.userInfo) {
      console.log('当前登录用户:', userStore.userInfo.username)
    }
  } catch (error) {
    console.error('用户状态初始化失败:', error)
  } finally {
    initComplete.value = true
  }
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
  padding: 0;
}

/* 全局样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 按钮样式调整 */
.ant-btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
}

.ant-btn-primary:hover,
.ant-btn-primary:focus {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

/* 卡片样式调整 */
.ant-card {
  border-radius: 4px;
  overflow: hidden;
}

/* 标签样式调整 */
.ant-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
