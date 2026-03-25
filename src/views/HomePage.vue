<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <app-header @login="showLoginModal" />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="brand-logo">
          <img src="@/assets/icons/logo.svg" alt="FabricLens Logo" class="main-logo" />
        </div>
      </div>

      <!-- 主要功能区 -->
      <div class="feature-sections">
        <!-- 上传区域 -->
        <div class="upload-section">
          <div class="section-header">
            <h2 class="section-title">相似图片搜索</h2>
          </div>

          <div class="upload-container">
            <image-uploader @search="handleImageSearch" />
          </div>
        </div>

        <!-- 功能导航区域 -->
        <div class="nav-section">
          <div class="section-header">
            <h2 class="section-title">快捷导航</h2>
          </div>

          <div class="nav-container">
            <div class="nav-grid">
              <div class="nav-item" @click="navigateTo('/user-center?tab=favorites')">
                <heart-outlined class="nav-icon" />
                <span class="nav-text">我的收藏</span>
              </div>

              <div class="nav-item" @click="navigateTo('/user-center?tab=history')">
                <history-outlined class="nav-icon" />
                <span class="nav-text">搜索历史</span>
              </div>

              <div class="nav-item" @click="navigateTo('/user-center?tab=settings')">
                <setting-outlined class="nav-icon" />
                <span class="nav-text">个人设置</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <app-footer />

    <!-- 登录模态框 -->
    <login-modal v-model="loginModalVisible" @login-success="onLoginSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  HeartOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useSearchStore, type SearchImage } from '../stores/search'
import { useUserStore } from '../stores/user'
import AppFooter from '../components/layout/AppFooter.vue'
import LoginModal from '../components/layout/LoginModal.vue'
import ImageUploader from '../components/ImageUploader'
import AppHeader from '../components/layout/AppHeader.vue'

const router = useRouter()
const searchStore = useSearchStore()
const userStore = useUserStore()

// 登录相关
const loginModalVisible = ref(false)

// 初始化
onMounted(() => {
  // 初始化用户信息
  userStore.initUser()
})

// 处理图片搜索
const handleImageSearch = (searchImage: SearchImage) => {
  try {
    // 使用store进行搜索
    searchStore.searchByImage(searchImage)
    // 跳转到搜索结果页
    router.push('/search-results')
  } catch (error) {
    message.error('图片处理失败')
  }
}

// 导航到指定路由
const navigateTo = (route: string) => {
  if (route !== '#') {
    if (route.includes('/user-center') && !userStore.isLoggedIn) {
      // 如果未登录且尝试访问用户中心，则显示登录模态框
      showLoginModal()
      return
    }
    router.push(route)
  }
}

// 显示登录模态框
const showLoginModal = () => {
  loginModalVisible.value = true
}

// 登录成功回调
const onLoginSuccess = async () => {
  // 刷新用户信息
  try {
    // 重新初始化用户状态，这会同步用户信息和收藏列表
    await userStore.initUser()

    // 显示欢迎消息 - 修改为使用 userInfo
    if (userStore.userInfo) {
      message.success('欢迎回来，' + userStore.userInfo.username)
    }
  } catch (error) {
    console.error('刷新用户信息失败:', error)
  }
}
</script>

<style scoped>
@import '../assets/styles/home.css';

.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #333;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

/* Logo区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.brand-logo {
  margin-bottom: 28px;
  text-align: center;
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-logo {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
}

.main-logo:hover {
  transform: rotate(5deg);
}

/* 主要功能区 */
.feature-sections {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  animation: fadeIn 0.8s ease 0.5s both;
}

.upload-section,
.nav-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.upload-section:hover,
.nav-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #1890ff;
  margin-right: 10px;
  border-radius: 2px;
}

/* 上传区域 */
.upload-container {
  padding: 0;
  flex: 1;
  display: flex;
}

.full-width-upload,
.full-width-upload :deep(.ant-upload) {
  width: 100%;
  height: 100%;
}

.upload-area {
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px dashed #e8e8e8;
  margin: 1px;
}

.upload-area:hover {
  background-color: #f0f7ff;
  border-color: #91caff;
}

.upload-inner {
  padding: 30px;
}

.upload-icon {
  font-size: 42px;
  color: #1890ff;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.upload-area:hover .upload-icon {
  transform: scale(1.1);
}

.upload-text {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.upload-hint {
  font-size: 13px;
  color: #999;
}

.preview-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  min-height: 280px;
}

.preview-image {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.02);
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.preview-actions .ant-btn {
  transition: all 0.2s;
}

.preview-actions .ant-btn:hover {
  transform: translateY(-2px);
}

/* 导航区域 */
.nav-container {
  padding: 16px;
  flex: 1;
  display: flex;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
  background-color: #f8fbff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  height: 100%;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background-color: #1890ff;
  transition: width 0.3s ease;
}

.nav-item:hover {
  background-color: #f0f7ff;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(24, 144, 255, 0.15);
}

.nav-item:hover::after {
  width: 100%;
}

.nav-icon {
  font-size: 32px;
  color: #1890ff;
  margin-bottom: 14px;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.15);
  color: #096dd9;
}

.nav-text {
  font-size: 15px;
  color: #262626;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 30px 16px;
  }

  .feature-sections {
    flex-direction: column;
  }

  .main-logo {
    width: 70px;
    height: 70px;
  }

  .nav-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .nav-item {
    padding: 20px 12px;
  }

  .nav-icon {
    font-size: 28px;
    margin-bottom: 10px;
  }
}

@media (max-width: 576px) {
  .nav-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .nav-item {
    padding: 16px 10px;
  }

  .nav-icon {
    font-size: 24px;
  }

  .nav-text {
    font-size: 14px;
  }
}

/* 登录模态框 */
.login-footer {
  text-align: center;
  margin-top: 16px;
}
</style>