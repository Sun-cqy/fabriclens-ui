<template>
  <div class="user-center-page">
    <!-- 顶部导航栏 -->
    <app-header @login="showLoginModal" />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="user-container">
        <a-row :gutter="24">
          <!-- 左侧用户信息和菜单 -->
          <a-col :span="6">
            <div class="user-sidebar">
              <!-- 用户信息卡片 -->
              <a-card v-if="isLoggedIn" class="user-card">
                <template #cover>
                  <div class="user-cover">
                    <a-avatar :style="{ backgroundColor: avatarColor, color: '#ffffff', border: '4px solid #fff' }"
                      :src="userInfo?.avatar || null" class="user-avatar">
                      {{ avatarInitial }}
                    </a-avatar>
                  </div>
                </template>
                <a-card-meta :title="userInfo?.username || '未命名用户'">
                  <template #description>
                    <div class="user-stats">
                      <div class="stat-item">
                        <div class="stat-value">{{ favoriteCount }}</div>
                        <div class="stat-label">收藏</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ historyCount }}</div>
                        <div class="stat-label">历史</div>
                      </div>
                    </div>
                  </template>
                </a-card-meta>
              </a-card>

              <!-- 未登录状态提示 -->
              <a-card v-else class="login-card">
                <div class="login-hint">
                  <UserOutlined style="font-size: 48px; margin-bottom: 16px;" />
                  <p>请登录以查看个人信息</p>
                  <a-button type="primary" @click="showLoginModal">
                    登录/注册
                  </a-button>
                </div>
              </a-card>

              <!-- 功能菜单 -->
              <a-menu mode="inline" :selectedKeys="[activeTab]" style="margin-top: 16px" @select="onMenuSelect">
                <a-menu-item key="favorites">
                  <template #icon>
                    <HeartOutlined />
                  </template>
                  收藏夹
                </a-menu-item>
                <a-menu-item key="history">
                  <template #icon>
                    <HistoryOutlined />
                  </template>
                  历史记录
                </a-menu-item>
                <a-menu-item key="settings">
                  <template #icon>
                    <SettingOutlined />
                  </template>
                  账户设置
                </a-menu-item>
              </a-menu>
            </div>
          </a-col>

          <!-- 右侧内容区域 -->
          <a-col :span="18">
            <div class="user-content">
              <!-- 收藏夹 -->
              <div v-if="activeTab === 'favorites'">
                <h2 class="simple-title">我的收藏</h2>

                <div v-if="!isLoggedIn" class="need-login-hint">
                  <a-empty description="登录后可查看收藏内容">
                    <a-button type="primary" @click="showLoginModal">
                      立即登录
                    </a-button>
                  </a-empty>
                </div>

                <div v-else-if="favorites.length === 0" class="empty-state">
                  <a-empty description="暂无收藏内容">
                    <a-button type="primary" @click="goToSearch">
                      开始探索
                    </a-button>
                  </a-empty>
                </div>

                <div v-else class="favorites-grid">
                  <div class="favorites-filter">
                    <span>{{ favorites.length }}个收藏</span>
                  </div>

                  <a-row :gutter="[12, 12]">
                    <a-col :xs="8" :sm="6" :md="4" :lg="4" v-for="item in favorites" :key="item.id">
                      <div class="favorite-card-wrapper">
                        <a-card hoverable class="favorite-card">
                          <template #cover>
                            <div class="favorite-img-wrapper" @click="viewDetail(item)">
                              <img :src="ensureImageUrl(item.imageUrl)" :alt="item.name" class="favorite-img"
                                @error="handleImageError" />
                            </div>
                          </template>
                          <template #actions>
                            <eye-outlined @click="viewDetail(item)" />
                            <delete-outlined @click="removeFromFavorite(item)" />
                          </template>
                          <a-card-meta :title="item.name"></a-card-meta>
                        </a-card>
                      </div>
                    </a-col>
                  </a-row>
                </div>
              </div>

              <!-- 历史记录 -->
              <div v-if="activeTab === 'history'">
                <h2>历史记录</h2>

                <div v-if="searchHistory.length === 0" class="empty-state">
                  <a-empty description="暂无历史记录">
                    <a-button type="primary" @click="goToSearch">
                      开始搜索
                    </a-button>
                  </a-empty>
                </div>

                <div v-else class="history-list">
                  <a-list :dataSource="searchHistory" :pagination="{ pageSize: 10 }">
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-list-item-meta>
                          <template #title>
                            <a @click="repeatSearch(item)">搜索于 {{ formatDate(item.timestamp) }}</a>
                          </template>
                          <template #avatar>
                            <a-avatar :src="item.image.url" shape="square" :size="64" />
                          </template>
                          <template #description>
                            <div>点击重新搜索</div>
                          </template>
                        </a-list-item-meta>
                        <template #actions>
                          <a key="repeat" @click="repeatSearch(item)">重新搜索</a>
                          <a key="delete" @click="removeFromHistory(item)">删除</a>
                        </template>
                      </a-list-item>
                    </template>
                  </a-list>
                </div>
              </div>

              <!-- 账户设置 -->
              <div v-if="activeTab === 'settings'">
                <h2>账户设置</h2>

                <div v-if="!isLoggedIn" class="need-login-hint">
                  <a-empty description="登录后可修改账户设置">
                    <a-button type="primary" @click="showLoginModal">
                      立即登录
                    </a-button>
                  </a-empty>
                </div>

                <div v-else class="settings-form">
                  <a-form :model="settingsForm" layout="vertical">
                    <!-- 头像设置 -->
                    <div class="avatar-settings-section">
                      <a-form-item>
                        <div class="avatar-uploader">
                          <input type="file" id="avatar-upload" accept="image/*" @change="handleDirectFileChange"
                            style="display: none;" />
                          <label for="avatar-upload">
                            <a-avatar :style="{ backgroundColor: avatarColor, color: '#ffffff', cursor: 'pointer' }"
                              :src="previewImage || settingsForm.avatar || null" class="settings-avatar">
                              {{ avatarInitial }}
                            </a-avatar>
                          </label>

                          <!-- 重置头像按钮 - 只在改变了头像时才显示 -->
                          <div v-if="previewImage" class="preview-actions" style="margin-top: 16px;">
                            <a-button style="margin-left: 8px;" @click="resetAvatarChange">取消修改</a-button>
                          </div>
                        </div>
                      </a-form-item>
                    </div>

                    <a-form-item label="用户名">
                      <a-input v-model:value="settingsForm.username" />
                    </a-form-item>

                    <a-form-item label="邮箱">
                      <a-input v-model:value="settingsForm.email" />
                    </a-form-item>

                    <a-form-item class="form-actions">
                      <a-button type="primary" @click="saveSettings">
                        保存设置
                      </a-button>
                      <a-button style="margin-left: 8px" class="logout-btn" @click="logout">
                        退出登录
                      </a-button>
                    </a-form-item>
                  </a-form>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 页脚 -->
    <app-footer />

    <!-- 登录模态框 -->
    <login-modal :visible="loginModalVisible" @update:visible="loginModalVisible = $event"
      @login-success="onLoginSuccess" />

    <!-- 图片详情模态框 -->
    <a-modal v-model:visible="imageDetailVisible" :title="selectedImage?.name || '图片详情'" :footer="null" width="750px"
      :destroyOnClose="true" :maskClosable="false" class="image-detail-modal">
      <div class="image-detail-container">
        <div class="image-detail-preview">
          <img :src="selectedImage?.imageUrl ? ensureImageUrl(selectedImage.imageUrl) : ''" alt="图片预览"
            class="detail-image" @error="handleImageError" />
        </div>
        <div class="image-detail-info">
          <h3 class="image-detail-title">{{ selectedImage?.name || '未命名图片' }}</h3>
          <div v-if="selectedImage?.description" class="image-detail-desc">{{ selectedImage.description }}</div>

          <!-- 添加特征信息展示 -->
          <div class="features-container">
            <div class="feature-row">
              <!-- 颜色展示 -->
              <div class="feature-section" v-if="selectedImage?.colors && selectedImage.colors.length > 0">
                <h4 class="feature-title">颜色</h4>
                <div class="color-tags">
                  <div class="color-tag" v-for="(color, index) in selectedImage.colors" :key="'color-' + index">
                    {{ color }}
                  </div>
                </div>
              </div>

              <!-- 风格展示 -->
              <div class="feature-section" v-if="selectedImage?.styles && selectedImage.styles.length > 0">
                <h4 class="feature-title">风格</h4>
                <div class="feature-tags">
                  <a-tag v-for="(style, index) in selectedImage.styles" :key="'style-' + index" color="cyan">
                    {{ style }}
                  </a-tag>
                </div>
              </div>
            </div>

            <div class="feature-row">
              <!-- 材质展示 -->
              <div class="feature-section" v-if="selectedImage?.materials && selectedImage.materials.length > 0">
                <h4 class="feature-title">材质</h4>
                <div class="feature-tags">
                  <a-tag v-for="(material, index) in selectedImage.materials" :key="'material-' + index" color="blue">
                    {{ material }}
                  </a-tag>
                </div>
              </div>

              <!-- 图案展示 -->
              <div class="feature-section" v-if="selectedImage?.patterns && selectedImage.patterns.length > 0">
                <h4 class="feature-title">图案</h4>
                <div class="feature-tags">
                  <a-tag v-for="(pattern, index) in selectedImage.patterns" :key="'pattern-' + index" color="green">
                    {{ pattern }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 如果有额外信息，展示出来 -->
          <div class="image-detail-meta" v-if="selectedImage?.meta">
            <div v-for="(value, key) in selectedImage.meta" :key="key" class="meta-item">
              <span class="meta-label">{{ formatMetaLabel(key) }}:</span>
              <span class="meta-value">{{ formatMetaValue(value) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="image-detail-actions">
            <a-button type="primary" @click="imageDetailVisible = false">关闭</a-button>
            <a-button danger @click="handleRemoveFromDetailView()" class="remove-btn">移出收藏</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  HeartOutlined,
  HistoryOutlined,
  SettingOutlined,
  UserOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { useUserStore, type User, type FavoriteItem } from '../stores/user'
import { useSearchStore, type HistoryItem } from '../stores/search'
import { imageService } from '../services/api'
import AppFooter from '../components/layout/AppFooter.vue'
import LoginModal from '../components/layout/LoginModal.vue'
import AppHeader from '../components/layout/AppHeader.vue'

const router = useRouter()
const route = useRoute()
const searchStore = useSearchStore()
const userStore = useUserStore()

// 用户状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed<User | null>(() => userStore.userInfo)
const favorites = computed<FavoriteItem[]>(() => userStore.favorites)
const searchHistory = computed<HistoryItem[]>(() => searchStore.searchHistory)

// 统计数据
const favoriteCount = computed(() => favorites.value.length)
const historyCount = computed(() => searchHistory.value.length)

// 计算属性，生成默认头像的背景色和文字
const avatarColor = computed(() => {
  // 确保 userInfo.value 存在
  if (!userInfo.value || !userInfo.value.username) return '#1890ff'
  const colors = ['#1890ff', '#40a9ff', '#096dd9']
  const charCode = userInfo.value.username.charCodeAt(0)
  return colors[charCode % colors.length]
})

const avatarInitial = computed(() => {
  // 确保 userInfo.value 存在
  if (!userInfo.value || !userInfo.value.username) return 'U'
  return userInfo.value.username.charAt(0).toUpperCase()
})

// 接收路由传递的props
const props = defineProps<{
  tab?: string
}>()

// 当前活动标签
const activeTab = ref('favorites')

// 模态框和表单
const loginModalVisible = ref(false)
const previewImage = ref('')
const settingsForm = ref({
  username: '',
  email: '',
  avatar: ''
})

// 图片详情模态框
const imageDetailVisible = ref(false)
const selectedImage = ref<(FavoriteItem & {
  meta?: Record<string, any>,
  description?: string,
  colors?: string[],
  styles?: string[],
  materials?: string[],
  patterns?: string[],
  colorPercentages?: number[]
}) | null>(null)

// 监听props中的tab变化
watch(() => props.tab, (newTab) => {
  if (newTab && ['favorites', 'history', 'settings'].includes(newTab)) {
    activeTab.value = newTab
  }
}, { immediate: true })

// 从URL参数初始化活动标签
onMounted(() => {
  const tabParam = route.query.tab as string || props.tab
  if (tabParam && ['favorites', 'history', 'settings'].includes(tabParam)) {
    activeTab.value = tabParam
  }

  // 如果已登录，初始化设置表单
  if (isLoggedIn.value && userInfo.value) {
    settingsForm.value.username = userInfo.value.username
    settingsForm.value.email = userInfo.value.email || ''
    settingsForm.value.avatar = userInfo.value.avatar || ''
  }

  // 初始化用户信息
  userStore.initUser()
})


// 重置头像变更
const resetAvatarChange = () => {
  previewImage.value = ''
  message.info('已取消头像修改')
}

// 菜单选择
const onMenuSelect = (e: any) => {
  activeTab.value = e.key as string
  router.push({
    path: '/user-center',
    query: { tab: e.key }
  })
}

// 从API获取图片详情
const fetchImageDetails = async (imageId: string | number) => {
  try {
    const response = await imageService.getImageDetails(imageId);
    console.log('原始API响应:', response);

    if (!response) {
      return null;
    }

    // 根据API响应结构获取数据
    let imageData;
    if (response.data && response.code === 200) {
      imageData = response.data;
    } else if (response.data) {
      imageData = response.data.data || response.data;
    } else {
      imageData = response;
    }

    console.log('提取后的图片数据:', imageData);

    // 构建特征数据对象
    const result = {
      colors: [],
      styles: [],
      materials: [],
      patterns: [],
      colorPercentages: [],
      description: ''
    };

    // 尝试从不同可能的数据结构中提取特征数据
    if (imageData) {
      result.colors = imageData.colors || [];
      result.styles = imageData.styles || [];
      result.materials = imageData.materials || [];
      result.patterns = imageData.patterns || [];
      result.colorPercentages = imageData.colorPercentages || [];
      result.description = imageData.description || '';
    }

    return result;
  } catch (error) {
    console.error('获取图片详情失败:', error);
    return {
      colors: [],
      styles: [],
      materials: [],
      patterns: [],
      colorPercentages: [],
      description: ''
    };
  }
};

// 收藏夹功能
const viewDetail = async (item: FavoriteItem) => {
  // 创建扩展对象，包含原始FavoriteItem
  const extendedItem = { ...item } as FavoriteItem & {
    meta?: Record<string, any>,
    colors?: string[],
    styles?: string[],
    materials?: string[],
    patterns?: string[],
    colorPercentages?: number[]
  };

  // 先显示模态框，但不显示加载状态
  selectedImage.value = extendedItem;
  imageDetailVisible.value = true;

  // 添加基本元数据
  if (item && typeof item === 'object') {
    const meta: Record<string, any> = {};
    if (item.addedAt) meta.addedAt = item.addedAt;
    if (item.id) meta.id = item.id;
    if (Object.keys(meta).length > 0) {
      extendedItem.meta = meta;
    }
  }

  // 从API获取详细信息
  try {
    const details = await fetchImageDetails(item.id);

    if (details) {
      // 更新扩展对象的特征数据
      extendedItem.colors = details.colors || [];
      extendedItem.styles = details.styles || [];
      extendedItem.materials = details.materials || [];
      extendedItem.patterns = details.patterns || [];
      extendedItem.colorPercentages = details.colorPercentages || [];
      extendedItem.description = details.description || '';

      // 确保数组属性是数组类型
      if (extendedItem.colors && !Array.isArray(extendedItem.colors)) {
        extendedItem.colors = [extendedItem.colors].filter(Boolean);
      }
      if (extendedItem.styles && !Array.isArray(extendedItem.styles)) {
        extendedItem.styles = [extendedItem.styles].filter(Boolean);
      }
      if (extendedItem.materials && !Array.isArray(extendedItem.materials)) {
        extendedItem.materials = [extendedItem.materials].filter(Boolean);
      }
      if (extendedItem.patterns && !Array.isArray(extendedItem.patterns)) {
        extendedItem.patterns = [extendedItem.patterns].filter(Boolean);
      }

      // 直接更新选中的图片，不使用延时
      selectedImage.value = { ...extendedItem };
    }
  } catch (error) {
    console.error('获取图片详情时出错:', error);
    message.warning('无法加载图片详细信息');
  }
}

const removeFromFavorite = async (item: FavoriteItem) => {
  try {
    message.loading({ content: '正在移除收藏...', key: 'removeFavorite' })

    // 调用后端API删除收藏
    await userStore.removeFavoriteWithApi(item.id)

    message.success({ content: '已从收藏中移除', key: 'removeFavorite' })
  } catch (error) {
    console.error('移除收藏失败:', error)
    message.error({ content: '移除收藏失败，请重试', key: 'removeFavorite' })
  }
}

// 历史记录功能
const repeatSearch = (item: HistoryItem) => {
  searchStore.searchByImage(item.image)
  router.push('/search-results')
}

const removeFromHistory = (item: HistoryItem) => {
  // 移除指定的历史记录条目
  const index = searchHistory.value.findIndex(i => i.id === item.id);
  if (index !== -1) {
    searchHistory.value.splice(index, 1);
    // 保存更新后的状态到localStorage
    searchStore.saveState();
  }
  message.success('已删除历史记录')
}

// 账户设置功能
const saveSettings = async () => {
  // 检查 userInfo.value 是否存在
  if (!userInfo.value) {
    message.error('用户未登录或信息加载失败');
    return;
  }

  // 简单的验证
  if (!settingsForm.value.username) {
    message.error('用户名不能为空')
    return
  }
  if (!settingsForm.value.email) {
    message.error('邮箱不能为空')
    return
  }

  try {
    let avatarData = settingsForm.value.avatar;

    // 如果有新上传的头像（previewImage中的base64数据）
    if (previewImage.value) {
      avatarData = previewImage.value; // 直接使用base64数据
    }

    // 构建要更新的用户数据
    const updatedUser: User = {
      ...userInfo.value,
      username: settingsForm.value.username,
      email: settingsForm.value.email,
      avatar: avatarData // 直接传递base64数据或原有的头像URL
    }

    // 调用store的更新方法
    const success = await userStore.updateUserInfo(updatedUser)
    if (success) {
      message.success('用户信息更新成功')
      // 更新成功后清除预览图片
      previewImage.value = ''
    } else {
      message.error('用户信息更新失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    message.error('更新用户信息失败')
  }
}

const logout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/')
}

// 登录功能
const showLoginModal = () => {
  loginModalVisible.value = true
}

const onLoginSuccess = () => {
  // 登录成功后的处理逻辑
  message.success('登录成功')
}

// 导航功能
const goToSearch = () => {
  router.push('/')
}

// 直接处理文件选择
const handleDirectFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    console.log('直接处理文件上传:', file.name, file.size);

    // 验证文件
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return;
    }

    // 读取文件
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        console.log('文件读取成功，设置预览');
        previewImage.value = event.target.result as string;
        console.log('预览设置完成');
      }
    };
    reader.onerror = (error) => {
      console.error('读取文件出错:', error);
      message.error('读取图片文件失败');
    };
    reader.readAsDataURL(file);
  }
};

// 日期格式化
const formatDate = (date: Date) => {
  if (!date) return ''

  // 确保date是Date对象
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 添加处理图片加载错误的函数
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  console.error('图片加载失败:', target.src);

  // 尝试修复路径
  const originalSrc = target.src;

  // 如果URL包含8081端口，直接替换为8080
  if (originalSrc.includes('localhost:8081')) {
    const newSrc = originalSrc.replace('localhost:8081', 'localhost:8080');
    target.src = newSrc;
    target.setAttribute('data-tried-fix', 'true');
    console.log('尝试修复图片路径(替换端口):', newSrc);
    return;
  }

  if (!target.getAttribute('data-tried-fix')) {
    // 尝试修复路径
    const imgId = originalSrc.split('/').pop()?.split('?')[0];
    if (imgId) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      target.src = `${baseUrl}/images/${imgId}`;
      target.setAttribute('data-tried-fix', 'true');
      console.log('尝试修复图片路径:', target.src);
      return;
    }
  }

  // 如果修复失败，使用默认图片
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjJmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZpbGw9IiM5OTkiPuWbvueJh+aLkuWxgjwvdGV4dD48L3N2Zz4=';
}

// 添加到脚本部分，确保图片URL正确
const ensureImageUrl = (url: string) => {
  if (!url) return '';

  // 基础URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  // 如果是完整URL，替换端口
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // 尝试替换8081端口为8080
    return url.replace('localhost:8081', 'localhost:8080');
  }

  // 添加API基础URL
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

// 格式化元数据标签
const formatMetaLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    'id': 'ID',
    'addedAt': '添加时间',
    // 可以添加更多映射
  };

  return labelMap[key] || key;
}

// 格式化元数据值
const formatMetaValue = (value: any): string => {
  // 如果是日期字符串，格式化日期
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return formatDate(new Date(value));
  }

  // 默认返回字符串表示
  return String(value);
}

// 添加新的移除函数，解决类型问题
const handleRemoveFromDetailView = () => {
  if (selectedImage.value && 'id' in selectedImage.value) {
    removeFromFavorite({
      id: selectedImage.value.id,
      imageUrl: selectedImage.value.imageUrl || '',
      name: selectedImage.value.name || '',
      addedAt: selectedImage.value.addedAt || new Date()
    });
    imageDetailVisible.value = false;
  }
};
</script>

<style scoped>
.user-center-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  margin-top: 20px;
}

.user-container {
  max-width: 1200px;
  margin: 0 auto;
}

.user-sidebar,
.user-content {
  background-color: white;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  min-height: 600px;
  margin-bottom: 20px;
}

.user-cover {
  height: 80px;
  background: linear-gradient(45deg, #1890ff, #40a9ff);
  position: relative;
  display: flex;
  justify-content: center;
}

.user-avatar {
  width: 80px !important;
  height: 80px !important;
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 30px;
  line-height: 80px;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-avatar:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.user-card {
  margin-bottom: 24px;
}

.user-card :deep(.ant-card-body) {
  padding-top: 40px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

.login-card {
  text-align: center;
  padding: 24px 0;
}

.login-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state,
.need-login-hint {
  padding: 48px 0;
  text-align: center;
}

.favorites-grid,
.history-list {
  margin-top: 24px;
}

.favorite-card-wrapper {
  margin-bottom: 10px;
}

.favorite-card {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.favorite-card :deep(.ant-card-body) {
  padding: 10px;
}

.favorite-card :deep(.ant-card-meta-title) {
  font-size: 14px;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-img-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  /* 固定高度，而不是使用padding-bottom */
  overflow: hidden;
}

.favorite-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings-form {
  max-width: 500px;
  margin: 24px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.avatar-settings-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.settings-avatar {
  width: 120px !important;
  height: 120px !important;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 42px;
  line-height: 120px;
  transition: transform 0.3s ease;
}

.settings-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.avatar-hint {
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
  margin-top: 8px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}

.form-actions {
  text-align: center;
  margin-top: 24px;
}

/* 头像预览相关样式 */
.avatar-preview {
  margin-top: 24px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.logout-btn {
  background-color: transparent;
  border: 1px solid #1890ff;
  color: #1890ff;
  transition: all 0.3s;
}

.logout-btn:hover {
  color: #fff;
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

h2 {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 24px;
  color: #1890ff;
  position: relative;
  padding-left: 12px;
}

.user-sidebar a-menu {
  border-right: none;
}

.user-sidebar :deep(.ant-menu-item-selected) {
  color: #1890ff;
  background-color: #e6f7ff;
}

.user-sidebar :deep(.ant-menu-item:hover) {
  color: #1890ff;
}

.user-sidebar :deep(.ant-menu-item-active) {
  color: #1890ff;
}

/* 头像上传相关样式 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.avatar-preview {
  width: 120px !important;
  height: 120px !important;
  font-size: 48px;
  line-height: 120px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-upload-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.simple-title {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

.favorites-grid {
  padding: 10px 0;
}

.favorites-filter {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

/* 图片详情模态框样式 */
.image-detail-container {
  display: flex;
  gap: 20px;
  align-items: center;
  min-height: 400px;
  height: 100%;
  /* 让容器填充整个可用空间 */
}

.image-detail-preview {
  flex: 0 0 45%;
  max-width: 45%;
  padding-top: 0;
  margin-top: -10px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 360px;
}

.detail-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  margin-top: 0;
}

.image-detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 0;
  height: 100%;
  /* 确保填充整个高度 */
}

.image-detail-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-top: 0;
}

.image-detail-desc {
  margin-bottom: 12px;
  min-height: 20px;
  /* 设置描述的最小高度 */
  color: #666;
  line-height: 1.5;
}

/* 特征信息展示样式 */
.features-container {
  margin: 12px 0;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-height: 240px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 增加行间距 */
}

.feature-row {
  display: flex;
  gap: 24px;
  /* 增加列间距 */
  min-height: 100px;
  /* 调整行高 */
  align-items: stretch;
  /* 让子元素拉伸填充 */
  flex: 1;
  /* 平均分配空间 */
}

.feature-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: white;
  /* 添加背景色 */
  padding: 12px;
  /* 添加内边距 */
  border-radius: 6px;
  /* 圆角 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* 轻微阴影 */
}

.feature-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  position: relative;
  padding-left: 10px;
  border-left: 3px solid #1890ff;
  margin-bottom: 12px;
  /* 增加标题下方间距 */
  flex-shrink: 0;
}

.feature-tags,
.color-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  align-items: center;
  /* 标签垂直居中 */
  justify-content: center;
  /* 标签水平居中 */
  padding: 4px;
  /* 添加内边距 */
}

.color-tag {
  padding: 4px 10px 4px 22px;
  background-color: white;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  border: 1px solid #e8e8e8;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.color-tag::before {
  content: "";
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 为颜色标签添加彩色指示器 */
.color-tag:nth-child(1)::before {
  background-color: #1890ff;
}

.color-tag:nth-child(2)::before {
  background-color: #f5222d;
}

.color-tag:nth-child(3)::before {
  background-color: #faad14;
}

.color-tag:nth-child(4)::before {
  background-color: #52c41a;
}

.color-tag:nth-child(5)::before {
  background-color: #722ed1;
}

.color-tag:nth-child(6)::before {
  background-color: #eb2f96;
}

.color-tag:nth-child(7)::before {
  background-color: #fa8c16;
}

.color-tag:nth-child(8)::before {
  background-color: #13c2c2;
}

.color-tag:nth-child(9)::before {
  background-color: #52c41a;
}

.color-tag:nth-child(10)::before {
  background-color: #2f54eb;
}

.color-tag:hover,
.feature-tags .ant-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-detail-meta {
  margin: 12px 0;
  padding: 10px;
  border-radius: 6px;
  background-color: #f5f7fa;
  font-size: 12px;
  min-height: 40px;
  /* 设置元数据区域的最小高度 */
}

.meta-item {
  margin-bottom: 6px;
  display: flex;
}

.meta-label {
  font-weight: 500;
  margin-right: 8px;
  color: #666;
  min-width: 70px;
}

.meta-value {
  color: #333;
}

.image-detail-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* 模态框样式覆盖 */
:deep(.ant-modal.image-detail-modal) {
  top: 45%;
  transform: translateY(-50%);
  padding-bottom: 0;
  height: 520px;
  /* 设置固定高度 */
}

:deep(.ant-modal.image-detail-modal .ant-modal-content) {
  border-radius: 10px;
  overflow: hidden;
  margin-top: -5vh;
  height: 100%;
  /* 让内容区域填充整个高度 */
}

:deep(.ant-modal.image-detail-modal .ant-modal-body) {
  padding: 16px;
  height: calc(100% - 55px);
  /* 减去header的高度 */
  display: flex;
  flex-direction: column;
}

/* 确保动画过渡平滑 */
:deep(.ant-modal.image-detail-modal.zoom-enter-active),
:deep(.ant-modal.image-detail-modal.zoom-leave-active) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-modal.image-detail-modal.zoom-enter-from),
:deep(.ant-modal.image-detail-modal.zoom-leave-to) {
  opacity: 0;
  transform: translateY(-50%) scale(0.95);
}

/* 添加加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 360px;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
}

/* 适配不同屏幕尺寸 */
@media (max-width: 650px) {
  .image-detail-container {
    flex-direction: column;
  }

  .image-detail-preview {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 16px;
  }

  .feature-row {
    flex-direction: column;
  }
}

/* 自定义标签样式 */
:deep(.feature-tags .ant-tag-cyan) {
  color: #006d75;
  background: #e6fffb;
  border-color: #87e8de;
}

:deep(.feature-tags .ant-tag-blue) {
  color: #0050b3;
  background: #e6f7ff;
  border-color: #91d5ff;
}

:deep(.feature-tags .ant-tag-green) {
  color: #237804;
  background: #f6ffed;
  border-color: #b7eb8f;
}

/* 删除按钮样式 */
.remove-btn {
  background-color: white;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.remove-btn:hover {
  background-color: #ff4d4f;
  color: white;
}

.feature-tags .ant-tag {
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.3s;
  white-space: nowrap;
  min-height: 24px;
  /* 确保标签高度一致 */
}

/* 模态框样式覆盖 */
:deep(.ant-modal.image-detail-modal .ant-modal-close) {
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-modal.image-detail-modal .ant-modal-close:hover) {
  color: rgba(0, 0, 0, 0.85);
}
</style>