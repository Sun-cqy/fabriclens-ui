<template>
  <div class="search-results-page">
    <!-- 顶部导航栏 -->
    <app-header @login="showLoginModal" />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="results-container">
        <!-- 结果头部 -->
        <div class="results-header">
          <div class="header-left">
            <h2>搜索结果 <span class="result-count" v-if="!loading">({{ filteredResults.length }})</span></h2>
          </div>
          <div class="header-center">
            <!-- 中间空区域 -->
          </div>
          <div class="header-actions">
            <a-button @click="saveToFavorites" v-if="isLoggedIn && filteredResults.length && !loading" type="primary"
              class="save-all-btn">
              <template #icon><save-outlined /></template>
              收藏全部
            </a-button>
            <div class="search-image-mini" v-if="currentImage?.url && !loading">
              <div class="mini-img-container" @click="toggleImageExpand">
                <img :src="currentImage.url" alt="搜索图片" />
                <span class="mini-count">{{ filteredResults.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 原始图像弹窗 -->
        <a-modal v-model:visible="showExpandedImage" :footer="null" :closable="true" :width="500" centered
          :destroyOnClose="true" :maskClosable="true" @cancel="showExpandedImage = false">
          <div class="image-detail-modal">
            <div class="modal-header">
              <span class="modal-title">搜索图片详情</span>
            </div>
            <div class="modal-image">
              <img :src="currentImage?.url" alt="原始图像" />
            </div>
            <div class="modal-info">
              <div class="search-stats">
                <p>共找到 <span class="highlight">{{ filteredResults.length }}</span> 个相似面料</p>
                <p class="similarity-tip">结果按相似度排序</p>
              </div>
              <div class="modal-buttons">
                <a-button type="primary" size="middle" @click="goToSearch" class="reupload-btn">
                  <template #icon><reload-outlined /></template>
                  重新上传图片
                </a-button>
              </div>
            </div>
          </div>
        </a-modal>

        <!-- 搜索结果加载动画 -->
        <div class="loading-container" v-if="loading">
          <h2 class="loading-title">处理您的图像搜索中...</h2>

          <div class="loading-stages">
            <div v-for="(loadingStage, index) in loadingStages" :key="index" class="loading-stage"
              :class="{ active: currentStage.id === loadingStage.id, completed: isStageCompleted(loadingStage.id) }">
              <div class="stage-icon">
                <span class="stage-number">{{ index + 1 }}</span>
                <span class="stage-icon-svg">
                  <component :is="loadingStage.icon" />
                  <check-circle-outlined v-if="isStageCompleted(loadingStage.id)" class="stage-complete-icon" />
                </span>
              </div>
              <div class="stage-content">
                <div class="stage-header">
                  <div class="stage-title">{{ loadingStage.title }}</div>
                  <div class="stage-description">{{ loadingStage.description }}</div>
                </div>
                <div class="progress-container">
                  <div class="progress-line">
                    <div class="progress-fill" :style="{ width: getStageProgress(loadingStage.id) }"></div>
                  </div>
                  <div class="progress-text">{{ getStageProgress(loadingStage.id) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="current-operation" v-if="currentStage && currentOperation">
            <sync-outlined spin class="operation-icon" />
            <span class="operation-text">{{ currentOperation }}</span>
          </div>

          <div class="loading-tips">
            <exclamation-circle-outlined class="tip-icon" />
            <span class="tip-text">正在处理您的请求，这可能需要几秒钟时间...</span>
          </div>
        </div>

        <!-- 过滤区域和结果区域 -->
        <div class="main-layout fade-in" v-if="!loading && filteredResults.length">
          <!-- 过滤选项 -->
          <div class="filter-sidebar">
            <div class="filter-card">
              <div class="filter-header">
                <filter-outlined />
                <span>搜索筛选</span>
              </div>

              <div class="filter-section">
                <div class="section-title">最低相似度: {{ similarityThreshold }}%</div>
                <div class="similarity-slider">
                  <a-slider v-model:value="similarityThreshold" :min="0" :max="100"
                    @change="updateSimilarityThreshold" />
                </div>
              </div>

              <div class="filter-section" v-if="availableColors.length">
                <div class="section-title">按颜色筛选:</div>
                <div class="color-filters">
                  <a-tag v-for="color in availableColors" :key="color" class="color-tag"
                    :class="{ active: isColorSelected(color) }" @click="toggleColorFilter(color)">
                    <span class="color-dot" :style="{ backgroundColor: getColorCode(color) }"></span>
                    {{ color }}
                  </a-tag>
                </div>
              </div>

              <div class="filter-section" v-if="availableStyles.length">
                <div class="section-title">按风格筛选:</div>
                <div class="style-filters">
                  <a-tag v-for="style in availableStyles" :key="style"
                    :class="['filter-tag', { active: selectedStyles.includes(style) }]"
                    @click="toggleStyleFilter(style)">
                    {{ style }}
                  </a-tag>
                </div>
              </div>

              <div class="filter-section" v-if="availableMaterials.length">
                <div class="section-title">按材质筛选:</div>
                <div class="material-filters">
                  <a-tag v-for="material in availableMaterials" :key="material"
                    :class="['filter-tag', { active: selectedMaterials.includes(material) }]"
                    @click="toggleMaterialFilter(material)">
                    {{ material }}
                  </a-tag>
                </div>
              </div>

              <div class="filter-section" v-if="availablePatterns.length">
                <div class="section-title">按图案筛选:</div>
                <div class="pattern-filters">
                  <a-tag v-for="pattern in availablePatterns" :key="pattern"
                    :class="['filter-tag pattern-tag', { active: selectedPatterns.includes(pattern) }]"
                    @click="togglePatternFilter(pattern)">
                    <template v-if="getPatternIcon(pattern)">
                      <span class="pattern-icon">{{ getPatternIcon(pattern) }}</span>
                    </template>
                    {{ pattern }}
                  </a-tag>
                </div>
              </div>

              <div class="filter-section" v-if="availableTextileTypes.length">
                <div class="section-title">按家纺类型筛选:</div>
                <div class="textile-filters">
                  <a-tag v-for="textileType in availableTextileTypes" :key="textileType"
                    :class="['filter-tag textile-tag', { active: selectedTextileTypes.includes(textileType) }]"
                    @click="toggleTextileTypeFilter(textileType)">
                    <template v-if="getTextileTypeIcon(textileType)">
                      <span class="textile-icon">{{ getTextileTypeIcon(textileType) }}</span>
                    </template>
                    {{ textileType }}
                  </a-tag>
                </div>
              </div>

              <div class="filter-section favorite-filter">
                <a-checkbox v-model:checked="onlyFavorites" class="favorite-checkbox">只显示收藏</a-checkbox>
              </div>

              <div class="filter-actions">
                <a-button @click="resetFilters" class="reset-btn">重置筛选</a-button>
              </div>
            </div>
          </div>

          <!-- 搜索结果列表 -->
          <div class="results-content">
            <search-result-list :results="mappedResults" :loading="loading" :totalResults="filteredResults.length"
              @select-item="viewDetail" @toggle-favorite="toggleFavorite" @page-change="handlePageChange" />
          </div>
        </div>

        <!-- 页脚前添加分页组件 -->
        <div class="pagination-container fade-in" v-if="!loading && filteredResults.length">
          <div class="pagination">
            <div class="pagination-left"></div>
            <div class="pagination-center">
              <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" :total="filteredResults.length"
                :pageSizeOptions="['12', '24', '36', '48']" show-size-changer @change="handlePageChange"
                show-quick-jumper />
            </div>
            <div class="pagination-right">
              <div class="results-count">
                共 <span class="results-highlight">{{ filteredResults.length }}</span> 个结果
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer-container">
      <app-footer />
    </div>

    <!-- 登录模态框 -->
    <login-modal :visible="loginModalVisible" @update:visible="loginModalVisible = $event"
      @login-success="onLoginSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  FilterOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  ClusterOutlined,
  AppstoreOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import { useSearchStore, type SearchResult } from '../stores/search'
import { useUserStore } from '../stores/user'
import AppFooter from '../components/layout/AppFooter.vue'
import LoginModal from '../components/layout/LoginModal.vue'
import { SearchResultList } from '../components/SearchResults'
import AppHeader from '../components/layout/AppHeader.vue'

const router = useRouter()
const searchStore = useSearchStore()
const userStore = useUserStore()

// 用户状态
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 状态
const loading = ref(false)
const currentImage = computed(() => searchStore.currentSearchImage)
const searchResults = computed(() => searchStore.searchResults)
const stage = ref(0) // 用于显示搜索进度阶段
const hasSearched = ref(false) // 添加标记，记录是否已经进行过搜索

// 筛选相关
const similarityThreshold = ref(70)
const selectedColors = ref<string[]>([])
const selectedStyles = ref<string[]>([])
const selectedMaterials = ref<string[]>([])
const selectedPatterns = ref<string[]>([])
const onlyFavorites = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(24)

// 可用筛选选项（从结果中提取）
const availableColors = computed(() => {
  const colors = new Set<string>()
  searchResults.value.forEach(item => {
    item.colors.forEach(color => colors.add(color))
  })
  return Array.from(colors)
})

const availableStyles = computed(() => {
  const styles = new Set<string>()
  searchResults.value.forEach(item => {
    item.styles.forEach(style => styles.add(style))
  })
  return Array.from(styles)
})

const availableMaterials = computed(() => {
  const materials = new Set<string>()
  searchResults.value.forEach(item => {
    item.materials.forEach(material => materials.add(material))
  })
  return Array.from(materials)
})

const availablePatterns = computed(() => {
  const patterns = new Set<string>()
  searchResults.value.forEach(item => {
    if (item.patterns && item.patterns.length) {
      item.patterns.forEach(pattern => patterns.add(pattern))
    }
  })
  return Array.from(patterns)
})

// 添加家纺类型筛选相关数据
const selectedTextileTypes = ref<string[]>([])

// 可用的家纺类型列表（从结果中提取）
const availableTextileTypes = computed(() => {
  const textileTypes = new Set<string>()
  searchResults.value.forEach(item => {
    if (item.textileTypes && item.textileTypes.length) {
      item.textileTypes.forEach(type => textileTypes.add(type))
    }
  })
  return Array.from(textileTypes)
})

// 过滤后的结果
const filteredResults = computed(() => {
  return searchResults.value.filter(item => {
    // 相似度过滤
    if (item.similarity < similarityThreshold.value) return false

    // 颜色过滤
    if (selectedColors.value.length > 0 &&
      !selectedColors.value.some(color => item.colors.includes(color))) {
      return false
    }

    // 风格过滤
    if (selectedStyles.value.length > 0 &&
      !selectedStyles.value.some(style => item.styles.includes(style))) {
      return false
    }

    // 材质过滤
    if (selectedMaterials.value.length > 0 &&
      !selectedMaterials.value.some(material => item.materials.includes(material))) {
      return false
    }

    // 图案过滤
    if (selectedPatterns.value.length > 0 &&
      (!item.patterns || !selectedPatterns.value.some(pattern => item.patterns.includes(pattern)))) {
      return false
    }

    // 家纺类型过滤
    if (selectedTextileTypes.value.length > 0 &&
      (!item.textileTypes || !selectedTextileTypes.value.some(type => item.textileTypes.includes(type)))) {
      return false
    }

    // 收藏过滤
    if (onlyFavorites.value && !item.isFavorite) return false

    return true
  })
})

// 将SearchResult转换为FabricImage (适配SearchResultList组件的数据格式)
const mappedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  const paginatedResults = filteredResults.value.slice(start, end)

  return paginatedResults.map(item => ({
    id: String(item.id),
    name: item.name,
    imageUrl: item.url,
    thumbnailUrl: item.url,
    similarity: item.similarity / 100,
    tags: item.tags,
    isFavorite: item.isFavorite,
    colors: item.colors,
    styles: item.styles,
    materials: item.materials,
    patterns: item.patterns || [],
    textileTypes: item.textileTypes || []
  }))
})

// 检查颜色是否已选择
const isColorSelected = (color: string) => {
  return selectedColors.value.includes(color)
}

// 切换颜色筛选
const toggleColorFilter = (color: string) => {
  const index = selectedColors.value.indexOf(color)
  if (index === -1) {
    selectedColors.value.push(color)
  } else {
    selectedColors.value.splice(index, 1)
  }
  // 重置页码，确保从第一页显示筛选后的结果
  currentPage.value = 1
}

// 更新相似度阈值
const updateSimilarityThreshold = (value: number) => {
  similarityThreshold.value = value
  // 重置页码
  currentPage.value = 1
}

// 查看详情
const viewDetail = (item: SearchResult) => {
  try {
    if (typeof item.id === 'undefined') {
      message.error('图像ID不存在，无法查看详情');
      return;
    }
    router.push(`/comparison/${item.id}`);
  } catch (error) {
    message.error('导航到比较页面失败');
  }
}

// 处理图片详情点击
// @ts-expect-error: 暂时未使用但保留此函数以供未来使用
const _handleImageClicked = (item: SearchResult) => {
  try {
    viewDetail(item);
  } catch (error) {
    message.error('处理跳转时出错');
  }
}

// 添加到收藏
const addToFavorite = async (item: SearchResult) => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    showLoginModal()
    return
  }

  try {
    message.loading({ content: '正在添加到收藏...', key: 'addFavorite' })

    // 调用API添加收藏
    await userStore.addFavoriteWithApi(item.id)

    // 更新结果中的收藏状态
    searchStore.updateFavoriteStatus(item.id, true)

    message.success({ content: '已添加到收藏', key: 'addFavorite' })
  } catch (error) {
    console.error('添加收藏失败:', error)
    message.error({ content: '添加收藏失败，请重试', key: 'addFavorite' })
  }
}

// 从收藏中移除
const removeFromFavorite = async (item: SearchResult) => {
  try {
    message.loading({ content: '正在移除收藏...', key: 'removeFavorite' })

    // 调用API移除收藏
    await userStore.removeFavoriteWithApi(item.id)

    // 更新结果中的收藏状态
    searchStore.updateFavoriteStatus(item.id, false)

    message.success({ content: '已从收藏中移除', key: 'removeFavorite' })
  } catch (error) {
    console.error('移除收藏失败:', error)
    message.error({ content: '移除收藏失败，请重试', key: 'removeFavorite' })
  }
}

// 保存到收藏夹
const saveToFavorites = async () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    showLoginModal()
    return
  }

  try {
    message.loading({ content: '正在保存所有结果...', key: 'saveAll' })

    // 获取当前筛选的结果
    const itemsToSave = filteredResults.value.filter(item => !item.isFavorite)

    if (itemsToSave.length === 0) {
      message.info({ content: '所有结果已经在收藏夹中', key: 'saveAll' })
      return
    }

    // 添加所有筛选后结果到收藏夹
    let successCount = 0
    for (const item of itemsToSave) {
      try {
        await userStore.addFavoriteWithApi(item.id)
        // 更新收藏状态
        searchStore.updateFavoriteStatus(item.id, true)
        successCount++
      } catch (error) {
        console.error(`添加ID为${item.id}的图片到收藏失败:`, error)
      }
    }

    if (successCount > 0) {
      message.success({ content: `成功添加${successCount}个结果到收藏夹`, key: 'saveAll' })
    } else {
      message.error({ content: '保存失败，请重试', key: 'saveAll' })
    }
  } catch (error) {
    console.error('批量添加收藏失败:', error)
    message.error({ content: '保存失败，请重试', key: 'saveAll' })
  }
}

// 用户状态和导航

// 登录相关
const loginModalVisible = ref(false)

// 显示登录模态框
const showLoginModal = () => {
  loginModalVisible.value = true
}

// 登录成功回调
const onLoginSuccess = () => {
  // 可以执行登录成功后的特定逻辑
}

// 前往首页
const goToSearch = () => {
  router.push('/')
}

// 组件挂载时的操作
onMounted(() => {
  // 检查是否已有搜索结果
  if (searchResults.value && searchResults.value.length > 0) {
    // 已有结果，直接显示结果，不显示加载动画
    hasSearched.value = true
    loading.value = false
    return
  }

  // 如果没有搜索图片也没有搜索结果，返回首页
  if (!currentImage.value && (!searchResults.value || searchResults.value.length === 0)) {
    message.warning('请先选择图片')
    router.push('/')
    return
  }

  // 第一次搜索，显示加载动画
  loading.value = true

  // 使用更真实的搜索进度模拟
  const progressSimulation = () => {
    // 第一阶段：分析图像特征 (2-3秒)
    setTimeout(() => {
      stage.value = 1
    }, 1000)

    // 第二阶段：搜索相似面料 (3-5秒)
    setTimeout(() => {
      stage.value = 2
    }, 4000)

    // 第三阶段：提取面料属性 (2-3秒)
    setTimeout(() => {
      stage.value = 3
    }, 7500)

    // 第四阶段：整理搜索结果 (1-2秒)
    setTimeout(() => {
      stage.value = 4
      hasSearched.value = true
      // 模拟完整搜索流程需要约10秒
      // 实际应用中，这里应该与后端API调用结合，根据真实进度更新
    }, 9500)
  }

  // 开始进度模拟
  if (loading.value) {
    progressSimulation()
    startLoading()
  }
})

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 切换收藏状态
const toggleFavorite = (item: SearchResult) => {
  if (item.isFavorite) {
    removeFromFavorite(item)
  } else {
    addToFavorite(item)
  }
}

// 重置筛选条件
const resetFilters = () => {
  similarityThreshold.value = 70;
  selectedColors.value = [];
  selectedStyles.value = [];
  selectedMaterials.value = [];
  selectedPatterns.value = [];
  selectedTextileTypes.value = [];
  onlyFavorites.value = false;
}

// 根据颜色名称返回对应的颜色代码
const getColorCode = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    '红色': '#f5222d',
    '橙色': '#fa8c16',
    '黄色': '#fadb14',
    '绿色': '#52c41a',
    '蓝色': '#1890ff',
    '紫色': '#722ed1',
    '粉色': '#eb2f96',
    '黑色': '#000000',
    '白色': '#ffffff',
    '灰色': '#8c8c8c',
    '米色': '#f5f5dc',
    '棕色': '#8B4513',
    '金色': '#FFD700',
    '银色': '#C0C0C0'
  };

  return colorMap[colorName] || '#1890ff';
}

// 根据图案名称返回对应的图标
const getPatternIcon = (patternName: string): string => {
  const patternMap: Record<string, string> = {
    '条纹': '↔️',
    '格子': '🔲',
    '波点': '🔵',
    '花卉': '🌸',
    '几何': '🔷',
    '迷彩': '🎽',
    '动物纹': '🐆',
    '抽象': '🎨',
    '素色': '⬛',
    '刺绣': '🧵'
  };

  return patternMap[patternName] || '';
}

// 切换风格筛选
const toggleStyleFilter = (style: string) => {
  if (selectedStyles.value.includes(style)) {
    selectedStyles.value = selectedStyles.value.filter(s => s !== style)
  } else {
    selectedStyles.value.push(style)
  }
  // 重置页码，确保从第一页显示筛选后的结果
  currentPage.value = 1
}

// 切换材质筛选
const toggleMaterialFilter = (material: string) => {
  if (selectedMaterials.value.includes(material)) {
    selectedMaterials.value = selectedMaterials.value.filter(m => m !== material)
  } else {
    selectedMaterials.value.push(material)
  }
  // 重置页码，确保从第一页显示筛选后的结果
  currentPage.value = 1
}

// 切换图案筛选
const togglePatternFilter = (pattern: string) => {
  if (selectedPatterns.value.includes(pattern)) {
    selectedPatterns.value = selectedPatterns.value.filter(p => p !== pattern)
  } else {
    selectedPatterns.value.push(pattern)
  }
  // 重置页码，确保从第一页显示筛选后的结果
  currentPage.value = 1
}

// 切换家纺类型筛选
const toggleTextileTypeFilter = (textileType: string) => {
  if (selectedTextileTypes.value.includes(textileType)) {
    selectedTextileTypes.value = selectedTextileTypes.value.filter(t => t !== textileType)
  } else {
    selectedTextileTypes.value.push(textileType)
  }
  // 重置页码，确保从第一页显示筛选后的结果
  currentPage.value = 1
}

// 根据家纺类型返回对应的图标
const getTextileTypeIcon = (textileType: string): string => {
  const textileTypeMap: Record<string, string> = {
    '床品': '🛏️',
    '窗帘': '🪟',
    '沙发布': '🛋️',
    '桌布': '🏮',
    '靠垫': '🧶',
    '地毯': '🧩',
    '浴室用品': '🚿',
    '厨房纺织品': '🍳',
    '装饰织物': '🎀',
    '服装面料': '👔'
  };

  return textileTypeMap[textileType] || '';
}

// 控制图片详情展开/收起
const showExpandedImage = ref(false);

// 切换图片详情展开状态
const toggleImageExpand = () => {
  showExpandedImage.value = !showExpandedImage.value;
}

// 加载阶段定义
const loadingStages = [
  {
    id: 'uploading',
    title: '图像上传',
    description: '处理您上传的图像',
    icon: UploadOutlined,
  },
  {
    id: 'extracting',
    title: '特征提取',
    description: '分析图像特征以进行匹配',
    icon: ThunderboltOutlined,
  },
  {
    id: 'matching',
    title: '图像匹配',
    description: '在数据库中查找相似图像',
    icon: ClusterOutlined,
  },
  {
    id: 'organizing',
    title: '结果整理',
    description: '准备展示搜索结果',
    icon: AppstoreOutlined,
  }
]

// 当前阶段与操作
const currentStage = ref(loadingStages[0])
const currentOperation = ref('')
const matchCount = ref(0)
const stageProgress = reactive({
  uploading: 0,
  extracting: 0,
  matching: 0,
  organizing: 0
})
const completedStages = ref<string[]>([])

// 操作文本列表
const uploadingOperations = [
  '读取图像数据...',
  '验证图像格式...',
  '调整图像大小...',
  '准备上传...'
]
const extractingOperations = [
  '分析图像纹理...',
  '提取颜色特征...',
  '检测图案类型...',
  '构建特征向量...'
]
const matchingOperations = [
  '搜索相似面料...',
  '计算相似度分数...',
  '对比面料特征...',
  '识别相似属性...'
]
const organizingOperations = [
  '过滤搜索结果...',
  '排序匹配项...',
  '生成结果摘要...',
  '准备展示界面...'
]

// 获取阶段进度
const getStageProgress = (stageId: string): string => {
  return `${stageProgress[stageId as keyof typeof stageProgress]}%`
}

// 检查阶段是否完成
const isStageCompleted = (stageId: string): boolean => {
  return completedStages.value.includes(stageId)
}

// 设置阶段为完成
const completeStage = (stageId: string) => {
  if (!completedStages.value.includes(stageId)) {
    completedStages.value.push(stageId)
  }
}

// 进度动画控制器
let progressIntervals: number[] = []
let operationIntervals: number[] = []

// 处理时间
const processTime = ref('')
const startTime = ref(0)

// 计算处理时间
const startLoading = () => {
  // 记录开始时间
  startTime.value = Date.now()

  // 清理之前可能存在的定时器
  progressIntervals.forEach(id => window.clearInterval(id))
  operationIntervals.forEach(id => window.clearInterval(id))
  progressIntervals = []
  operationIntervals = []

  // 重置状态
  currentStage.value = loadingStages[0]
  Object.keys(stageProgress).forEach(key => {
    stageProgress[key as keyof typeof stageProgress] = 0
  })
  completedStages.value = []
  matchCount.value = 0

  // 上传阶段
  let uploadOpIndex = 0
  currentOperation.value = uploadingOperations[0]

  const uploadOpInterval = window.setInterval(() => {
    uploadOpIndex = (uploadOpIndex + 1) % uploadingOperations.length
    currentOperation.value = uploadingOperations[uploadOpIndex]
  }, 400)
  operationIntervals.push(uploadOpInterval)

  const uploadInterval = window.setInterval(() => {
    if (stageProgress.uploading < 100) {
      stageProgress.uploading += Math.floor(Math.random() * 8) + 5
      if (stageProgress.uploading >= 100) {
        stageProgress.uploading = 100
        window.clearInterval(uploadInterval)
        window.clearInterval(uploadOpInterval)
        completeStage('uploading')

        setTimeout(() => {
          currentStage.value = loadingStages[1]
          startExtractingStage()
        }, 200)
      }
    }
  }, 60)
  progressIntervals.push(uploadInterval)
}

const startExtractingStage = () => {
  let extractOpIndex = 0
  currentOperation.value = extractingOperations[0]

  const extractOpInterval = window.setInterval(() => {
    extractOpIndex = (extractOpIndex + 1) % extractingOperations.length
    currentOperation.value = extractingOperations[extractOpIndex]
  }, 1000)
  operationIntervals.push(extractOpInterval)

  const extractInterval = window.setInterval(() => {
    if (stageProgress.extracting < 100) {
      stageProgress.extracting += Math.floor(Math.random() * 6) + 3
      if (stageProgress.extracting >= 100) {
        stageProgress.extracting = 100
        window.clearInterval(extractInterval)
        window.clearInterval(extractOpInterval)
        completeStage('extracting')

        setTimeout(() => {
          currentStage.value = loadingStages[2]
          startMatchingStage()
        }, 200)
      }
    }
  }, 80)
  progressIntervals.push(extractInterval)
}

const startMatchingStage = () => {
  let matchOpIndex = 0
  currentOperation.value = matchingOperations[0]

  const matchOpInterval = window.setInterval(() => {
    matchOpIndex = (matchOpIndex + 1) % matchingOperations.length
    currentOperation.value = matchingOperations[matchOpIndex]
  }, 1200)
  operationIntervals.push(matchOpInterval)

  // 匹配计数增加器
  const countInterval = window.setInterval(() => {
    // 模拟找到更多匹配项
    if (stageProgress.matching > 20 && stageProgress.matching < 90) {
      matchCount.value += Math.floor(Math.random() * 3) + 1
    }
  }, 600)
  operationIntervals.push(countInterval)

  const matchInterval = window.setInterval(() => {
    if (stageProgress.matching < 100) {
      stageProgress.matching += Math.floor(Math.random() * 4) + 3
      if (stageProgress.matching >= 100) {
        stageProgress.matching = 100
        window.clearInterval(matchInterval)
        window.clearInterval(matchOpInterval)
        window.clearInterval(countInterval)
        completeStage('matching')

        setTimeout(() => {
          currentStage.value = loadingStages[3]
          startOrganizingStage()
        }, 200)
      }
    }
  }, 90)
  progressIntervals.push(matchInterval)
}

const startOrganizingStage = () => {
  let organizeOpIndex = 0
  currentOperation.value = organizingOperations[0]

  const organizeOpInterval = window.setInterval(() => {
    organizeOpIndex = (organizeOpIndex + 1) % organizingOperations.length
    currentOperation.value = organizingOperations[organizeOpIndex]
  }, 1000)
  operationIntervals.push(organizeOpInterval)

  const organizeInterval = window.setInterval(() => {
    if (stageProgress.organizing < 100) {
      stageProgress.organizing += Math.floor(Math.random() * 8) + 5
      if (stageProgress.organizing >= 100) {
        stageProgress.organizing = 100
        window.clearInterval(organizeInterval)
        window.clearInterval(organizeOpInterval)
        completeStage('organizing')

        // 计算总处理时间
        const endTime = Date.now()
        processTime.value = ((endTime - startTime.value) / 1000).toFixed(1)

        setTimeout(() => {
          loading.value = false
        }, 300)
      }
    }
  }, 70)
  progressIntervals.push(organizeInterval)
}

onMounted(() => {
  // 模拟加载过程
  if (loading.value) {
    startLoading()
  }
})

onBeforeUnmount(() => {
  // 清理定时器
  progressIntervals.forEach(id => window.clearInterval(id))
  operationIntervals.forEach(id => window.clearInterval(id))
})
</script>

<style lang="scss" scoped>
@import '../assets/styles/search-results.css';

.search-results-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

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
}

.right-menu {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-btn {
  background-color: transparent;
  border: 1px solid #1890ff;
  color: #1890ff;
}

/* 主内容区域 - 修改为占满窗口宽度 */
.main-content {
  flex: 1;
  padding: 16px 24px;
  /* 减小垂直内边距 */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding-bottom: 40px;
  /* 为固定页脚留出空间 */
}

/* 结果容器 - 确保占满可用空间 */
.results-container {
  width: 100%;
  max-width: 100%;
}

/* 结果头部 - 三栏布局 */
.results-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 56px;
  transition: all 0.3s ease;
}

.header-left,
.header-center,
.header-actions {
  display: flex;
  align-items: center;
  height: 100%;
}

.header-left {
  justify-content: flex-start;
}

.header-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-actions {
  justify-content: flex-end;
  gap: 12px;
  display: flex;
  align-items: center;
}

/* 标题样式 */
.header-left h2 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  height: 100%;
}

/* 确保标题中的计数器也垂直居中 */
.result-count {
  color: #1890ff;
  font-weight: normal;
  font-size: 14px;
  margin-left: 8px;
  animation: fadeIn 0.6s ease-in-out;
}

/* 调整主布局区域，使其充分利用宽度 */
.main-layout {
  display: flex;
  width: 100%;
  gap: 16px;
}

/* 调整侧边栏宽度，保持合理比例 */
.filter-sidebar {
  width: 230px;
  flex-shrink: 0;
}

/* 确保结果内容区域占据所有可用空间 */
.results-content {
  flex: 1;
  min-width: 0;
  /* 防止内容溢出 */
}

.filter-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 12px;
  position: sticky;
  top: 80px;
}

.filter-header {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
  font-size: 13px;
}

.color-filters,
.style-filters,
.material-filters,
.pattern-filters,
.textile-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.color-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 2px 6px;
  background-color: white;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
  font-size: 12px;
  height: 24px;
  line-height: 22px;
}

.color-tag.active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.filter-tag {
  margin: 0;
  transition: all 0.3s;
  cursor: pointer;
  font-size: 12px;
  height: 24px;
  line-height: 22px;
  padding: 0 6px;
}

.filter-tag:hover {
  transform: translateY(-2px);
}

.filter-tag.active {
  background-color: #1890ff;
  color: white;
}

.similarity-slider {
  padding: 0 5px;
  margin-top: 6px;
}

/* 修改滑块样式，使其更紧凑 */
:deep(.ant-slider) {
  margin: 6px 0;
}

.favorite-filter {
  margin-top: 12px;
}

.favorite-checkbox {
  font-size: 13px;
}

.filter-actions {
  margin-top: 16px;
  text-align: center;
}

.reset-btn {
  width: 100%;
  height: 30px;
  font-size: 13px;
}

.pattern-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  background-color: #f9f0ff;
  color: #722ed1;
  border: none;
  transition: all 0.3s;
  font-size: 12px;
  height: 24px;
  line-height: 22px;
}

.pattern-tag:hover {
  transform: translateY(-2px);
  background-color: #efdbff;
}

.pattern-tag.active {
  background-color: #722ed1;
  color: white;
}

.pattern-icon {
  font-size: 13px;
  line-height: 1;
}

.textile-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  background-color: #e6f7ff;
  color: #1890ff;
  border: none;
  transition: all 0.3s;
  font-size: 12px;
  height: 24px;
  line-height: 22px;
}

.textile-tag:hover {
  transform: translateY(-2px);
  background-color: #bae7ff;
}

.textile-tag.active {
  background-color: #1890ff;
  color: white;
}

.textile-icon {
  font-size: 14px;
  line-height: 1;
}

.results-highlight {
  color: #1890ff;
  font-weight: 600;
}

/* 页脚固定在底部 */
.footer-container {
  width: 100%;
  margin-top: auto;
}

@media (max-width: 992px) {
  .main-layout {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .results-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    height: auto;
    padding: 16px;
  }

  .header-left,
  .header-center,
  .header-actions {
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }

  .search-progress {
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }

  .progress-stage {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    gap: 16px;
  }
}

/* 分页组件样式 */
.pagination-container {
  width: 100%;
  padding: 16px 24px;
  background-color: white;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  /* 原来是 position: sticky */
  border-top: 1px solid #f0f0f0;
  margin-top: 20px;
  /* 添加了上边距 */
}

.pagination {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* .pagination-left 用于在左侧留空，平衡布局 */

.pagination-center {
  display: flex;
  justify-content: center;
}

.pagination-right {
  display: flex;
  justify-content: flex-end;
}

.results-count {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  margin-bottom: 0;
}

/* 搜索图片迷你显示 */
.search-image-mini {
  height: 100%;
  display: flex;
  align-items: center;
}

.mini-img-container {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.mini-img-container:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.mini-img-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}

.mini-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-count {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 8px;
  z-index: 1;
}

/* 模态框样式 */
.image-detail-modal {
  padding: 0;
}

.modal-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-image {
  text-align: center;
  margin-bottom: 20px;
}

.modal-image img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-info {
  padding: 0 10px;
}

.search-stats {
  margin-bottom: 20px;
}

.reupload-btn {
  display: block;
  width: 100%;
}

/* 加载状态样式 */
.loading-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .loading-title {
    margin-bottom: 2rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    text-align: center;
    background: linear-gradient(45deg, #1890ff, #722ed1);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .loading-stages {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .loading-stage {
    display: flex;
    padding: 1.2rem;
    border-radius: 8px;
    border-left: 3px solid #f0f0f0;
    background-color: #fafafa;
    transition: all 0.3s ease;
    opacity: 0.7;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

    &.active {
      background-color: #f0f7ff;
      border-left: 3px solid #1890ff;
      opacity: 1;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);

      .stage-icon {
        background-color: #1890ff;
        color: white;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);

        .stage-number {
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid white;
        }

        .stage-icon-svg {
          color: white;
          animation: pulse 1.5s infinite;
        }
      }

      .stage-title {
        color: #1890ff;
        font-weight: 600;
      }

      .progress-fill {
        background: linear-gradient(to right, #1890ff, #52c41a);
        background-size: 200% 100%;
        animation: gradient-move 1s ease infinite;
      }
    }

    &.completed {
      .stage-icon {
        background-color: #52c41a;

        .stage-complete-icon {
          position: absolute;
          color: white;
          font-size: 18px;
          animation: fadeIn 0.5s;
        }
      }

      .progress-fill {
        background-color: #52c41a;
      }

      .progress-text {
        color: #52c41a;
      }
    }

    .stage-icon {
      position: relative;
      width: 52px;
      height: 52px;
      margin-right: 1.2rem;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;

      .stage-number {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #d9d9d9;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.3s ease;
      }

      .stage-icon-svg {
        font-size: 22px;
        color: #999;
        transition: all 0.3s ease;
      }
    }

    .stage-content {
      flex: 1;

      .stage-header {
        margin-bottom: 0.8rem;

        .stage-title {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          transition: all 0.3s ease;
        }

        .stage-description {
          font-size: 0.85rem;
          color: #666;
        }
      }

      .stage-extra-info {
        margin-top: 0.6rem;

        .match-count-badge {
          display: inline-block;
          background-color: rgba(24, 144, 255, 0.1);
          color: #1890ff;
          font-size: 0.8rem;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid rgba(24, 144, 255, 0.2);
          animation: pulse 2s infinite;
        }
      }
    }
  }

  .progress-container {
    display: flex;
    align-items: center;

    .progress-line {
      flex: 1;
      height: 6px;
      background-color: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
      margin-right: 10px;

      .progress-fill {
        height: 100%;
        background-color: #1890ff;
        transition: width 0.3s ease;
      }
    }

    .progress-text {
      font-size: 0.8rem;
      color: #1890ff;
      width: 40px;
      text-align: right;
      font-weight: 500;
    }
  }

  .current-operation {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    display: flex;
    align-items: center;
    border-left: 3px solid #1890ff;

    .operation-icon {
      color: #1890ff;
      font-size: 18px;
      margin-right: 12px;
    }

    .operation-text {
      font-size: 0.95rem;
      color: #555;
    }
  }

  .loading-tips {
    margin-top: 2rem;
    padding: 1rem;
    background-color: #fffbe6;
    border-left: 3px solid #faad14;
    border-radius: 4px;
    display: flex;
    align-items: center;

    .tip-icon {
      color: #faad14;
      font-size: 16px;
      margin-right: 10px;
    }

    .tip-text {
      color: #8c6c13;
      font-size: 0.9rem;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 确保视图切换器容器不受影响 */
.view-switcher-container {
  display: flex;
  align-items: center;
}

/* 调整动画效果 */
.loading-stage.active .progress-fill {
  animation: gradient-move 1s ease infinite;
}

/* 添加到结果头部的样式 */
.results-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 56px;
  transition: all 0.3s ease;
}

.result-count,
.search-image-mini,
.save-all-btn {
  animation: fadeIn 0.6s ease-in-out;
}

/* 渐入动画 */
.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 搜索结果摘要 */
.results-summary {
  max-width: 800px;
  margin: 0 auto 2rem;
}

.summary-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  border-top: 3px solid #52c41a;
}

.summary-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #f0f0f0;
}

.summary-icon {
  color: #52c41a;
  font-size: 1.5rem;
  margin-right: 0.8rem;
}

.summary-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.summary-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.summary-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-stats {
  flex: 1;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px dashed #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #1890ff;
}

/* 家纺类型标签样式 */
.textile-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.textile-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  background-color: #e6f7ff;
  color: #1890ff;
  border: none;
  transition: all 0.3s;
  font-size: 12px;
  height: 24px;
  line-height: 22px;
  background-clip: padding-box;
  -webkit-background-clip: padding-box;
}

.textile-tag:hover {
  transform: translateY(-2px);
  background-color: #bae7ff;
}

.textile-tag.active {
  background-color: #1890ff;
  color: white;
}

.textile-icon {
  font-size: 14px;
  line-height: 1;
}
</style>