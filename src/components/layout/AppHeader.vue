<template>
    <div class="header">
        <div class="header-content">
            <div class="logo" @click="goToSearch">FabricLens</div>
            <div class="right-menu">
                <!-- 用户头像 - 使用首字母作为默认头像，点击导航到个人中心 -->
                <a-avatar v-if="isLoggedIn && userStore.userInfo"
                    :style="{ backgroundColor: avatarColor, color: '#ffffff' }" :src="userStore.userInfo.avatar || null"
                    class="user-avatar" @click="goToUserCenter">
                    {{ !userStore.userInfo.avatar && userStore.userInfo.username ?
                        userStore.userInfo.username.charAt(0).toUpperCase() : '' }}
                </a-avatar>
                <a-button v-if="!isLoggedIn" @click="showLoginModal" type="primary" ghost>登录</a-button>
                <a-button v-else @click="logout" class="user-btn">退出</a-button>
                <a-button @click="goToUserCenter" class="user-btn">个人中心</a-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '../../stores/user'

// 事件
const emit = defineEmits(['login'])

const router = useRouter()
const userStore = useUserStore()

// 用户相关
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 生成固定的头像背景色，基于用户名，只使用蓝色系列
const avatarColor = computed(() => {
    if (!userStore.userInfo || !userStore.userInfo.username) return '#1890ff'

    // 使用蓝色系列作为头像背景色
    const colors = [
        '#1890ff', '#40a9ff', '#096dd9', '#0050b3',
        '#1e40af', '#3b82f6', '#60a5fa', '#2563eb'
    ]
    // 使用用户名的第一个字符的字符码作为索引，确保相同用户名总是获得相同颜色
    const charCode = userStore.userInfo.username.charCodeAt(0)
    return colors[charCode % colors.length]
})

// 导航功能
const goToSearch = () => {
    router.push('/')
}

const goToUserCenter = () => {
    router.push('/user-center')
}

// 登录相关
const showLoginModal = () => {
    emit('login')
}

// 登出功能
const logout = () => {
    userStore.logout()
    message.success('已退出登录')
    router.push('/')
}
</script>

<style scoped>
/* 顶部导航栏样式 */
.header {
    background-color: #001529;
    color: white;
    width: 100%;
    box-shadow: 0 2px 6px rgba(0, 21, 41, 0.15);
    position: sticky;
    top: 0;
    z-index: 10;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    color: #fff;
    letter-spacing: 0.5px;
    transition: transform 0.2s ease;
}

.logo:hover {
    transform: scale(1.05);
}

.right-menu {
    display: flex;
    gap: 12px;
    align-items: center;
}

.right-menu .ant-btn {
    transition: all 0.3s ease;
    color: white;
}

.user-avatar {
    cursor: pointer;
    transition: transform 0.2s;
    font-size: 14px;
    font-weight: bold;
}

.user-avatar:hover {
    transform: scale(1.1);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.user-btn {
    background-color: transparent;
    border: 1px solid #1890ff;
    color: #1890ff;
}

@media (max-width: 768px) {
    .user-btn {
        display: none;
    }
}
</style>