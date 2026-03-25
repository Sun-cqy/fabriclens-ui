<template>
  <div class="comparison-page">
    <!-- 顶部导航栏 -->
    <app-header @login="showLoginModal" />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-animation">
          <a-spin size="large" />
          <p class="loading-text">正在加载对比数据...</p>
        </div>
      </div>

      <!-- 内容区域 -->
      <div v-else class="content-container">
        <div class="comparison-layout">
          <!-- 左侧边栏：图像对比区域 -->
          <div class="sidebar">
            <!-- 侧边栏头部 -->
            <div class="sidebar-header">
              <div class="header-with-back">
                <a-button type="text" class="back-btn" @click="goToSearch">
                  <arrow-left-outlined />
                </a-button>
                <h2>图像对比分析</h2>
              </div>
            </div>

            <!-- 侧边栏内容 -->
            <div class="sidebar-content">
              <!-- 原始搜索图像 -->
              <div class="sidebar-section">
                <div class="section-header">
                  <span class="icon-wrapper"><search-outlined /></span>
                  已上传
                </div>
                <div class="original-image-container">
                  <template v-if="currentSearchImage">
                    <img :src="currentSearchImage.url" alt="原始搜索图像" class="original-image" />
                  </template>
                  <a-empty v-else description="暂无搜索图像" />
                </div>
                <div v-if="currentSearchImage" class="image-filters">
                  <div class="filter-title">图像详细信息</div>
                  <div class="filter-group">
                    <div class="filter-item">
                      <span class="filter-label">主要颜色</span>
                      <div class="filter-tags">
                        <a-tag v-for="color in currentSearchImage.colors" :key="color" color="blue">{{ color }}</a-tag>
                        <span v-if="!currentSearchImage.colors.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="filter-item">
                      <span class="filter-label">风格特征</span>
                      <div class="filter-tags">
                        <a-tag v-for="style in currentSearchImage.styles" :key="style" color="green">{{ style }}</a-tag>
                        <span v-if="!currentSearchImage.styles.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="filter-item">
                      <span class="filter-label">材质类型</span>
                      <div class="filter-tags">
                        <a-tag v-for="material in currentSearchImage.materials" :key="material" color="orange">{{
                          material }}</a-tag>
                        <span v-if="!currentSearchImage.materials.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="filter-item">
                      <span class="filter-label">图案特征</span>
                      <div class="filter-tags">
                        <a-tag v-for="pattern in currentSearchImage.patterns" :key="pattern" color="purple">{{ pattern
                          }}</a-tag>
                        <span v-if="!currentSearchImage.patterns.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="divider"></div>
                  </div>
                </div>
              </div>

              <!-- 搜索结果图像 -->
              <div class="sidebar-section">
                <div class="section-header">
                  <span class="icon-wrapper"><picture-outlined /></span>
                  {{ selectedImage ? selectedImage.name : '搜索结果图像' }}
                </div>
                <div class="result-image-container">
                  <template v-if="selectedImage">
                    <img :src="selectedImage.url" :alt="selectedImage.name" class="result-image" />
                  </template>
                  <a-empty v-else description="请选择一个搜索结果图像" />
                </div>
                <div v-if="selectedImage" class="image-attributes">
                  <div class="attribute-title">图像详细信息</div>
                  <div class="attribute-group">
                    <div class="attribute-item">
                      <span class="attribute-label">主要颜色</span>
                      <div class="attribute-tags">
                        <a-tag v-for="color in selectedImage.colors" :key="color" color="blue">{{ color }}</a-tag>
                        <span v-if="!selectedImage.colors.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="attribute-item">
                      <span class="attribute-label">风格特征</span>
                      <div class="attribute-tags">
                        <a-tag v-for="style in selectedImage.styles" :key="style" color="green">{{ style }}</a-tag>
                        <span v-if="!selectedImage.styles.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="attribute-item">
                      <span class="attribute-label">材质类型</span>
                      <div class="attribute-tags">
                        <a-tag v-for="material in selectedImage.materials" :key="material" color="orange">{{ material
                          }}</a-tag>
                        <span v-if="!selectedImage.materials.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="attribute-item">
                      <span class="attribute-label">图案特征</span>
                      <div class="attribute-tags">
                        <a-tag v-for="pattern in selectedImage.patterns" :key="pattern" color="purple">{{ pattern
                          }}</a-tag>
                        <span v-if="!selectedImage.patterns.length" class="no-filter">未识别</span>
                      </div>
                    </div>
                    <div class="divider"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧主区域：数据分析 -->
          <div class="main-analysis">
            <!-- 数据分析区域 -->
            <div class="analysis-header">
              <h3><bar-chart-outlined /> 数据分析结果</h3>
              <div class="header-actions">
                <a-button v-if="isLoggedIn && selectedImage" type="primary" @click="addToFavorites"
                  class="favorite-button">
                  <star-outlined /> 收藏
                </a-button>
              </div>
            </div>

            <div class="analysis-content">
              <template v-if="selectedImage">
                <div class="analysis-intro">
                  <div class="similarity-summary">
                    <span class="summary-label">综合相似度:</span>
                    <span class="summary-value" :style="{ color: getSimilarityColor(selectedImage.similarity) }">
                      {{ selectedImage.similarity }}%
                    </span>
                    <a-progress :percent="selectedImage.similarity"
                      :stroke-color="getSimilarityColor(selectedImage.similarity)" size="small" />
                  </div>
                </div>

                <a-divider style="margin: 16px 0" />

                <div class="analysis-details">
                  <div class="analysis-item">
                    <h4>
                      <span class="dot style-dot"></span>
                      特征匹配度
                    </h4>
                    <div class="comparison-section">
                      <div class="style-analysis">
                        <div class="style-metrics">
                          <div class="metric-item">
                            <span class="metric-label">颜色相似度</span>
                            <a-progress :percent="selectedImage?.colorSimilarity || 0"
                              :stroke-color="getSimilarityColor(selectedImage?.colorSimilarity)" size="small" />
                          </div>
                          <div class="metric-item">
                            <span class="metric-label">图案相似度</span>
                            <a-progress :percent="selectedImage?.patternSimilarity || 0"
                              :stroke-color="getSimilarityColor(selectedImage?.patternSimilarity)" size="small" />
                          </div>
                          <div class="metric-item">
                            <span class="metric-label">风格匹配度</span>
                            <a-progress
                              :percent="getStyleMatchPercentage(currentSearchImage?.styles, selectedImage?.styles)"
                              :stroke-color="getSimilarityColor(getStyleMatchPercentage(currentSearchImage?.styles, selectedImage?.styles))"
                              size="small" />
                          </div>
                          <div class="metric-item">
                            <span class="metric-label">材质匹配度</span>
                            <a-progress
                              :percent="getMaterialMatchPercentage(currentSearchImage?.materials, selectedImage?.materials)"
                              :stroke-color="getSimilarityColor(getMaterialMatchPercentage(currentSearchImage?.materials, selectedImage?.materials))"
                              size="small" />
                          </div>
                        </div>
                      </div>
                      <div class="radar-chart">
                        <ComparisonCharts :similar-image="selectedImage" :current-search-image="currentSearchImage" />
                      </div>
                    </div>
                  </div>

                  <div class="analysis-item">
                    <h4>
                      <span class="dot feature-dot"></span>
                      特征详细对比
                    </h4>
                    <!-- 详细特征对比 -->
                    <div class="features-comparison-grid">
                      <!-- 颜色对比 -->
                      <div class="feature-grid-item">
                        <h5 class="feature-title">
                          <span class="feature-icon color-icon"></span>
                          颜色对比
                        </h5>
                        <div class="feature-comparison-row">
                          <div class="feature-column">
                            <div class="feature-header">已上传图像</div>
                            <div class="feature-content">
                              <div class="color-ring-container">
                                <div class="color-ring">
                                  <a-progress type="circle" :width="90" :percent="100"
                                    :stroke-color="getColorGradient(currentSearchImage?.colors, currentSearchImage?.colorPercentages)"
                                    :format="() => ''" :strokeWidth="12" />
                                  <div class="color-percent">{{ currentSearchImage?.colorPercentages?.[0] || 0 }}%</div>
                                </div>
                                <div class="color-details">
                                  <template v-if="currentSearchImage?.colors">
                                    <div v-for="color in currentSearchImage.colors.slice(0, 3)" :key="color"
                                      class="color-item">
                                      <span class="color-box" :style="{ backgroundColor: getMainColor(color) }"></span>
                                      <span class="color-name">{{ color }}</span>
                                      <span class="color-percentage">
                                        {{
                                          currentSearchImage.colorPercentages?.[currentSearchImage.colors.indexOf(color)]
                                          || 0 }}%
                                      </span>
                                    </div>
                                  </template>
                                </div>
                              </div>
                              <div v-if="!currentSearchImage?.colors.length" class="feature-empty">未检测到颜色</div>
                            </div>
                          </div>
                          <div class="feature-divider"></div>
                          <div class="feature-column">
                            <div class="feature-header">{{ selectedImage?.name || '搜索结果图像' }}</div>
                            <div class="feature-content">
                              <div class="color-ring-container">
                                <div class="color-ring">
                                  <a-progress type="circle" :width="90" :percent="100"
                                    :stroke-color="getColorGradient(selectedImage?.colors, selectedImage?.colorPercentages)"
                                    :format="() => ''" :strokeWidth="12" />
                                  <div class="color-percent">{{ selectedImage?.colorPercentages?.[0] || 0 }}%</div>
                                </div>
                                <div class="color-details">
                                  <template v-if="selectedImage?.colors">
                                    <div v-for="color in selectedImage.colors.slice(0, 3)" :key="color"
                                      class="color-item">
                                      <span class="color-box" :style="{ backgroundColor: getMainColor(color) }"></span>
                                      <span class="color-name">{{ color }}</span>
                                      <span class="color-percentage">
                                        {{ selectedImage.colorPercentages?.[selectedImage.colors.indexOf(color)] || 0
                                        }}%
                                      </span>
                                    </div>
                                  </template>
                                </div>
                              </div>
                              <div v-if="!selectedImage?.colors.length" class="feature-empty">未检测到颜色</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 风格对比 -->
                      <div class="feature-grid-item">
                        <h5 class="feature-title">
                          <span class="feature-icon style-icon"></span>
                          风格对比
                        </h5>
                        <div class="feature-comparison-row">
                          <div class="feature-column">
                            <div class="feature-header">已上传图像</div>
                            <div class="feature-content compact">
                              <div v-if="currentSearchImage?.styles.length" class="qq-tags">
                                <div v-for="(style, index) in currentSearchImage.styles" :key="style"
                                  class="qq-tag style-tag"
                                  :style="{ '--tag-index': index, '--rotation-dir': index % 2 === 0 ? 1 : -1 }">
                                  {{ style }}
                                </div>
                              </div>
                              <div v-else class="feature-empty">未检测到风格</div>
                            </div>
                          </div>
                          <div class="feature-divider"></div>
                          <div class="feature-column">
                            <div class="feature-header">{{ selectedImage?.name || '搜索结果图像' }}</div>
                            <div class="feature-content compact">
                              <div v-if="selectedImage?.styles.length" class="qq-tags">
                                <div v-for="(style, index) in selectedImage.styles" :key="style"
                                  class="qq-tag style-tag"
                                  :class="{ matched: currentSearchImage?.styles.includes(style) }"
                                  :style="{ '--tag-index': index, '--rotation-dir': index % 2 === 0 ? 1 : -1 }">
                                  {{ style }}
                                  <span v-if="currentSearchImage?.styles.includes(style)" class="match-badge"></span>
                                </div>
                              </div>
                              <div v-else class="feature-empty">未检测到风格</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 材质对比 -->
                      <div class="feature-grid-item">
                        <h5 class="feature-title">
                          <span class="feature-icon material-icon"></span>
                          材质对比
                        </h5>
                        <div class="feature-comparison-row">
                          <div class="feature-column">
                            <div class="feature-header">已上传图像</div>
                            <div class="feature-content compact">
                              <div v-if="currentSearchImage?.materials.length" class="qq-tags">
                                <div v-for="(material, index) in currentSearchImage.materials" :key="material"
                                  class="qq-tag material-tag"
                                  :style="{ '--tag-index': index, '--rotation-dir': index % 2 === 0 ? 1 : -1 }">
                                  {{ material }}
                                </div>
                              </div>
                              <div v-else class="feature-empty">未检测到材质</div>
                            </div>
                          </div>
                          <div class="feature-divider"></div>
                          <div class="feature-column">
                            <div class="feature-header">{{ selectedImage?.name || '搜索结果图像' }}</div>
                            <div class="feature-content compact">
                              <div v-if="selectedImage?.materials.length" class="qq-tags">
                                <div v-for="(material, index) in selectedImage.materials" :key="material"
                                  class="qq-tag material-tag"
                                  :class="{ matched: currentSearchImage?.materials.includes(material) }"
                                  :style="{ '--tag-index': index, '--rotation-dir': index % 2 === 0 ? 1 : -1 }">
                                  {{ material }}
                                  <span v-if="currentSearchImage?.materials.includes(material)"
                                    class="match-badge"></span>
                                </div>
                              </div>
                              <div v-else class="feature-empty">未检测到材质</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 图案对比 -->
                      <div class="feature-grid-item">
                        <h5 class="feature-title">
                          <span class="feature-icon pattern-icon"></span>
                          图案对比
                        </h5>
                        <div class="feature-comparison-row">
                          <div class="feature-column">
                            <div class="feature-header">已上传图像</div>
                            <div class="feature-content compact">
                              <div v-if="currentSearchImage?.patterns.length" class="qq-tags">
                                <div v-for="(pattern, index) in currentSearchImage.patterns" :key="pattern"
                                  class="qq-tag pattern-tag"
                                  :style="{ '--tag-index': index, '--rotation-dir': index % 2 === 0 ? 1 : -1 }">
                                  {{ pattern }}
                                </div>
                              </div>
                              <div v-else class="feature-empty">未检测到图案</div>
                            </div>
                          </div>
                          <div class="feature-divider"></div>
                          <div class="feature-column">
                            <div class="feature-header">{{ selectedImage?.name || '搜索结果图像' }}</div>
                            <div class="feature-content compact">
                              <div v-if="selectedImage?.patterns.length" class="qq-tags">
                                <div v-for="(pattern, index) in selectedImage.patterns" :key="pattern"
                                  class="qq-tag pattern-tag"
                                  :class="{ matched: currentSearchImage?.patterns.includes(pattern) }"
                                  :style="{ '--tag-index': index, '--rotation-dir': index % 2 === 0 ? 1 : -1 }">
                                  {{ pattern }}
                                  <span v-if="currentSearchImage?.patterns.includes(pattern)"
                                    class="match-badge"></span>
                                </div>
                              </div>
                              <div v-else class="feature-empty">未检测到图案</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 雷达图已移至属性匹配度右侧 -->
              </template>
              <div v-if="!selectedImage" class="no-data-chart">
                <file-outlined class="empty-icon" />
                请选择一个相似图像进行分析
              </div>

              <!-- 其他相似图像列表 -->
              <div v-if="selectedImage" class="similar-images-section">
                <div class="similar-images-header">
                  <h4>
                    <span class="dot similar-dot"></span>
                    其他相似图像
                  </h4>
                  <a-button type="primary" shape="circle" class="refresh-button" @click="refreshSimilarImages"
                    :loading="loadingSimilar">
                    <reload-outlined />
                  </a-button>
                </div>
                <div class="similar-images-scroll">
                  <!-- 当没有图片且正在加载时显示加载状态 -->
                  <div v-if="loadingSimilar && similarImages.length === 0" class="similar-loading">
                    <a-spin size="small" />
                    <span>加载中...</span>
                  </div>
                  <!-- 当没有图片且不在加载时显示空状态 -->
                  <div v-else-if="similarImages.length === 0" class="similar-empty">
                    <inbox-outlined />
                    <span>暂无更多相似图像</span>
                  </div>
                  <!-- 图片列表 -->
                  <div v-else :key="forceRerender" class="similar-images-list"
                    :class="{ 'loading-overlay': loadingSimilar, 'few-items': similarImages.length <= 3 }"
                    :style="{ justifyContent: similarImages.length <= 3 ? 'space-around' : 'flex-start' }">
                    <div v-for="image in similarImages" :key="image.id" class="similar-image-item"
                      @click="viewImageDetails(image)" :style="getImageItemStyle(similarImages.length)">
                      <div class="image-wrapper">
                        <img :src="image.url" :alt="image.name" />
                        <div v-if="image.isFavorite" class="favorite-indicator">
                          <heart-filled style="color: #ff4d4f;" />
                        </div>
                      </div>
                      <div class="similar-image-info">
                        <div class="similar-image-name">{{ image.name }}</div>
                        <div class="similar-image-similarity" :class="{ 'favorite-boosted': image.isFavorite }">
                          相似度: {{ image.similarity }}%
                          <span v-if="image.isFavorite" class="boost-indicator">已提升</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <app-footer />

    <!-- 登录模态框 -->
    <login-modal :visible="loginModalVisible" @update:visible="loginModalVisible = $event"
      @login-success="onLoginSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  StarOutlined,
  SearchOutlined,
  BarChartOutlined,
  FileOutlined,
  PictureOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  InboxOutlined,
  HeartFilled
} from '@ant-design/icons-vue'
import ComparisonCharts from '../components/ImageComparison/ComparisonCharts.vue'
import { useSearchStore } from '../stores/search'
import { useUserStore } from '../stores/user'
import type { SearchResult } from '../stores/search'
import AppFooter from '../components/layout/AppFooter.vue'
import LoginModal from '../components/layout/LoginModal.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import { imageService } from '../services/api'

// 定义图像分析结果类型
interface ImageAnalysisResult {
  colors: string[];
  styles: string[];
  materials: string[];
  patterns: string[];
  colorPercentages: number[];
}

// Store 和 路由
const router = useRouter()
const route = useRoute()
const searchStore = useSearchStore()
const authStore = useUserStore()

// 当前状态
const isLoading = ref(false)
const selectedImage = ref<SearchResult | null>(null)
const loginModalVisible = ref(false)
const loadingSimilar = ref(false)
const similarImages = ref<SearchResult[]>([])
const forceRerender = ref(0)

// 计算属性
const currentSearchImage = computed(() => searchStore.currentSearchImage)
const searchResults = computed(() => searchStore.searchResults)
const isLoggedIn = computed(() => authStore.isLoggedIn)

// 根据相似度获取颜色
const getSimilarityColor = (similarity: number) => {
  if (similarity >= 80) return '#67c23a'
  if (similarity >= 60) return '#409eff'
  if (similarity >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 计算风格匹配百分比
const getStyleMatchPercentage = (sourceStyles?: string[], targetStyles?: string[]) => {
  if (!sourceStyles?.length || !targetStyles?.length) return 0
  const matchCount = sourceStyles.filter(style => targetStyles.includes(style)).length
  const totalStyles = Math.max(sourceStyles.length, targetStyles.length)
  return Math.round((matchCount / totalStyles) * 100)
}

// 计算材质匹配百分比
const getMaterialMatchPercentage = (sourceMaterials?: string[], targetMaterials?: string[]) => {
  if (!sourceMaterials?.length || !targetMaterials?.length) return 0
  const matchCount = sourceMaterials.filter(material => targetMaterials.includes(material)).length
  const totalMaterials = Math.max(sourceMaterials.length, targetMaterials.length)
  return Math.round((matchCount / totalMaterials) * 100)
}

// 获取颜色的十六进制值
const getMainColor = (colorName?: string) => {
  const colorMap: Record<string, string> = {
    '红色': '#f5222d',
    '蓝色': '#1890ff',
    '绿色': '#52c41a',
    '黄色': '#fadb14',
    '紫色': '#722ed1',
    '粉色': '#eb2f96',
    '橙色': '#fa8c16',
    '棕色': '#8B4513',
    '灰色': '#8c8c8c',
    '白色': '#ffffff',
    '黑色': '#000000',
    '米色': '#F5DEB3',
    '金色': '#FFD700'
  }
  return colorMap[colorName || ''] || '#d9d9d9'
}

// 获取颜色渐变
const getColorGradient = (colors?: string[], percentages?: number[]) => {
  if (!colors || !colors.length || !percentages || !percentages.length) {
    return '#d9d9d9';
  }

  // 只取前三种主要颜色
  const topColors = colors.slice(0, 3);

  // 创建颜色渐变
  if (topColors.length === 1) {
    return getMainColor(topColors[0]);
  }

  return {
    '0%': getMainColor(topColors[0]),
    '100%': topColors.length > 1 ? getMainColor(topColors[1]) : getMainColor(topColors[0])
  };
}

// 在计算相似度的函数前添加颜色优化逻辑
// 颜色分析优化
const optimizeColorAnalysis = (colors?: string[], percentages?: number[]) => {
  if (!colors?.length || !percentages?.length) {
    return { colors: [], percentages: [] };
  }

  // 创建副本以避免修改原始数据
  const optimizedColors = [...colors];
  const optimizedPercentages = [...percentages];

  // 1. 过滤掉占比过低的颜色（低于2%）
  const significantColors: string[] = [];
  const significantPercentages: number[] = [];

  let totalSignificantPercentage = 0;

  optimizedColors.forEach((color, index) => {
    if (optimizedPercentages[index] >= 2) {
      significantColors.push(color);
      significantPercentages.push(optimizedPercentages[index]);
      totalSignificantPercentage += optimizedPercentages[index];
    }
  });

  // 2. 如果存在显著颜色，重新标准化百分比使其总和为100
  if (significantColors.length > 0 && totalSignificantPercentage > 0) {
    for (let i = 0; i < significantPercentages.length; i++) {
      significantPercentages[i] = (significantPercentages[i] / totalSignificantPercentage) * 100;
      // 四舍五入到整数
      significantPercentages[i] = Math.round(significantPercentages[i]);
    }

    // 调整以确保总和为100%
    let currentSum = significantPercentages.reduce((sum, percent) => sum + percent, 0);
    const diff = 100 - currentSum;

    if (diff !== 0) {
      // 将差值添加到最大的百分比上
      const maxIndex = significantPercentages.indexOf(Math.max(...significantPercentages));
      significantPercentages[maxIndex] += diff;
    }

    return {
      colors: significantColors,
      percentages: significantPercentages
    };
  }

  return { colors, percentages };
};

// 计算颜色相似度，考虑颜色占比
const calculateColorSimilarity = (sourceColors?: string[], sourcePercentages?: number[], targetColors?: string[], targetPercentages?: number[]) => {
  if (!sourceColors?.length || !targetColors?.length || !sourcePercentages?.length || !targetPercentages?.length) {
    return 0;
  }

  // 优化颜色数据
  const optimizedSource = optimizeColorAnalysis(sourceColors, sourcePercentages);
  const optimizedTarget = optimizeColorAnalysis(targetColors, targetPercentages);

  sourceColors = optimizedSource.colors;
  sourcePercentages = optimizedSource.percentages;
  targetColors = optimizedTarget.colors;
  targetPercentages = optimizedTarget.percentages;

  // 如果优化后无有效颜色，返回0
  if (!sourceColors.length || !targetColors.length) {
    return 0;
  }

  // 创建颜色占比映射
  const sourceColorMap = new Map<string, number>();
  sourceColors.forEach((color, index) => {
    sourceColorMap.set(color, sourcePercentages[index] || 0);
  });

  const targetColorMap = new Map<string, number>();
  targetColors.forEach((color, index) => {
    targetColorMap.set(color, targetPercentages[index] || 0);
  });

  // 获取所有不同的颜色
  const allColors = new Set([...sourceColors, ...targetColors]);

  // 计算颜色分布差异
  let similaritySum = 0;
  let totalWeight = 0;
  let maxPercentageDiff = 0;
  let totalPercentageDiff = 0;
  let matchedColors = 0;

  allColors.forEach(color => {
    const sourcePercent = sourceColorMap.get(color) || 0;
    const targetPercent = targetColorMap.get(color) || 0;

    // 计算百分比差异，并记录最大差异
    const percentageDiff = Math.abs(sourcePercent - targetPercent);
    maxPercentageDiff = Math.max(maxPercentageDiff, percentageDiff);
    totalPercentageDiff += percentageDiff;

    // 如果颜色在两边都存在且差异不大，计数为匹配颜色
    if (sourcePercent > 0 && targetPercent > 0 && percentageDiff < 50) { // 提高容错阈值
      matchedColors++;
    }

    // 使用更温和的指数函数增加百分比差异的影响
    const percentagePenalty = Math.pow(percentageDiff / 10, 1.2); // 降低惩罚指数

    // 对主要颜色（占比超过20%）的差异给予适度惩罚
    const isMainColor = sourcePercent > 20 || targetPercent > 20;
    const mainColorMultiplier = isMainColor ? 1.1 : 1; // 降低主要颜色的惩罚系数

    // 计算这种颜色的相似度（考虑百分比差异的惩罚）
    const colorSimilarity = Math.max(0, 100 - (percentagePenalty * 6 * mainColorMultiplier)); // 降低基础惩罚系数

    // 计算这种颜色的权重（考虑颜色重要性）
    const colorWeight = Math.pow((sourcePercent + targetPercent) / 2, 1.05); // 降低权重影响

    // 累加加权相似度
    similaritySum += colorSimilarity * colorWeight;
    totalWeight += colorWeight;
  });

  // 计算总相似度（加权平均）
  let finalSimilarity = totalWeight > 0 ? (similaritySum / totalWeight) : 0;

  // 根据最大百分比差异进行额外的相似度调整
  const maxPercentagePenalty = Math.pow(maxPercentageDiff / 12, 2); // 降低最大差异的惩罚指数
  finalSimilarity = Math.max(0, finalSimilarity - (maxPercentagePenalty * 15)); // 降低惩罚系数

  // 根据总体百分比差异进行调整
  const avgPercentageDiff = totalPercentageDiff / allColors.size;
  const avgDiffPenalty = Math.pow(avgPercentageDiff / 12, 1.5); // 降低平均差异的惩罚指数
  finalSimilarity = Math.max(0, finalSimilarity - (avgDiffPenalty * 8)); // 降低惩罚系数

  // 如果颜色数量差异过大，适度降低相似度
  const colorCountDiff = Math.abs(sourceColors.length - targetColors.length);
  if (colorCountDiff > 0) {
    const countPenalty = Math.pow(colorCountDiff, 1.2) * 3; // 降低数量差异的惩罚
    finalSimilarity = Math.max(0, finalSimilarity - countPenalty);
  }

  // 根据匹配颜色数量调整相似度
  const colorMatchRatio = matchedColors / Math.max(sourceColors.length, targetColors.length);
  if (colorMatchRatio < 0.4) { // 降低匹配率阈值
    finalSimilarity *= colorMatchRatio * 1.8; // 增加容错系数
  }

  // 确保相似度不超过99.9%（除非是完全相同的图片）
  if (finalSimilarity > 99.9) {
    const sourceUrl = currentSearchImage.value?.url;
    const targetUrl = selectedImage.value?.url;
    finalSimilarity = sourceUrl === targetUrl ? 100 : 99.9;
  }

  // 对最终相似度进行非线性调整，使得中等相似度的差异更明显
  finalSimilarity = Math.pow(finalSimilarity / 100, 1.1) * 100;

  // 设置最低相似度阈值
  finalSimilarity = Math.max(20, finalSimilarity); // 提高最低相似度阈值

  return Math.round(finalSimilarity * 10) / 10; // 保留一位小数
};

// 添加手动颜色调整功能
const adjustedColors = ref<string[]>([]);
const adjustedPercentages = ref<number[]>([]);

// 初始化调整后的颜色数据
const initAdjustedColors = () => {
  if (currentSearchImage.value?.colors) {
    adjustedColors.value = [...currentSearchImage.value.colors];
    adjustedPercentages.value = currentSearchImage.value.colorPercentages ?
      [...currentSearchImage.value.colorPercentages] :
      adjustedColors.value.map(() => 100 / adjustedColors.value.length);
  }
};

// 在适当的地方初始化调整后的颜色数据
onMounted(async () => {
  isLoading.value = true

  try {
    // 获取图像ID参数
    const imageId = route.params.id as string

    if (imageId && searchResults.value) {
      // 查找并选择图像
      const image = searchResults.value.find(img => img.id.toString() === imageId)
      if (image) {
        selectedImage.value = image

        // 分析当前搜索图像（如果有）并补充缺失的特征数据
        if (currentSearchImage.value && currentSearchImage.value.url) {
          // 检查是否已有完整的特征数据
          const needsAnalysis = !currentSearchImage.value.colors?.length ||
            !currentSearchImage.value.styles?.length ||
            !currentSearchImage.value.materials?.length ||
            !currentSearchImage.value.patterns?.length ||
            !currentSearchImage.value.colorPercentages?.length;

          if (needsAnalysis) {
            try {
              console.log('当前搜索图像缺少特征数据，开始分析:', currentSearchImage.value.url)
              const analysisResult = await imageService.analyzeImage(currentSearchImage.value.url) as ImageAnalysisResult
              console.log('获取搜索图像分析结果:', analysisResult)

              // 将分析结果合并到当前搜索图像，保留原有数据
              if (analysisResult) {
                Object.assign(currentSearchImage.value, {
                  colors: currentSearchImage.value.colors?.length ? currentSearchImage.value.colors : analysisResult.colors || [],
                  styles: currentSearchImage.value.styles?.length ? currentSearchImage.value.styles : analysisResult.styles || [],
                  materials: currentSearchImage.value.materials?.length ? currentSearchImage.value.materials : analysisResult.materials || [],
                  patterns: currentSearchImage.value.patterns?.length ? currentSearchImage.value.patterns : analysisResult.patterns || [],
                  colorPercentages: currentSearchImage.value.colorPercentages?.length ? currentSearchImage.value.colorPercentages : analysisResult.colorPercentages || [100]
                })
              }
            } catch (error) {
              console.error('分析当前搜索图像失败:', error)
            }
          } else {
            console.log('当前搜索图像已有完整特征数据，跳过分析')
          }
        }

        // 补充选定图像缺失的特征数据
        if (selectedImage.value && selectedImage.value.url) {
          // 检查是否已有完整的特征数据
          const needsAnalysis = !selectedImage.value.colors?.length ||
            !selectedImage.value.styles?.length ||
            !selectedImage.value.materials?.length ||
            !selectedImage.value.patterns?.length ||
            !selectedImage.value.colorPercentages?.length;

          if (needsAnalysis) {
            try {
              console.log('选定图像缺少特征数据，开始分析:', selectedImage.value.url)
              const analysisResult = await imageService.analyzeImage(selectedImage.value.url) as ImageAnalysisResult
              console.log('获取选定图像分析结果:', analysisResult)

              // 将分析结果合并到选定图像，保留原有数据
              if (analysisResult) {
                Object.assign(selectedImage.value, {
                  colors: selectedImage.value.colors?.length ? selectedImage.value.colors : analysisResult.colors || [],
                  styles: selectedImage.value.styles?.length ? selectedImage.value.styles : analysisResult.styles || [],
                  materials: selectedImage.value.materials?.length ? selectedImage.value.materials : analysisResult.materials || [],
                  patterns: selectedImage.value.patterns?.length ? selectedImage.value.patterns : analysisResult.patterns || [],
                  colorPercentages: selectedImage.value.colorPercentages?.length ? selectedImage.value.colorPercentages : analysisResult.colorPercentages || [100]
                })
              }
            } catch (error) {
              console.error('分析选定图像失败:', error)
            }
          } else {
            console.log('选定图像已有完整特征数据，跳过分析')
          }
        }

        // 初始化加载相似图像
        refreshSimilarImages()
      } else {
        // 如果没有找到，显示错误消息
        message.error('未找到指定图像，请返回搜索结果页面重新选择')
      }
    } else if (!imageId) {
      message.error('未指定图像ID，请返回搜索结果页面')
    } else if (!searchResults.value || searchResults.value.length === 0) {
      message.error('没有可用的搜索结果，请返回首页重新搜索')
    }
  } catch (error) {
    message.error('加载对比数据失败，请稍后重试')
  } finally {
    isLoading.value = false
  }

  // 初始化调整后的颜色数据
  if (currentSearchImage.value?.colors) {
    initAdjustedColors();
  }
})

// 刷新相似图像列表
const refreshSimilarImages = async () => {
  console.log('开始刷新相似图像')
  if (!selectedImage.value) {
    console.warn('没有选中图像，无法刷新')
    return
  }

  // 设置加载状态
  loadingSimilar.value = true
  // 清除之前的数据以确保完全刷新
  similarImages.value = []

  try {
    // 直接从API获取相似图像
    console.log(`请求相似图像，图像ID: ${selectedImage.value.id}`)
    const data = await imageService.getSimilarImages(selectedImage.value.id) as SearchResult[]
    console.log('获取相似图像成功:', data)

    // 对每个图片重新计算相似度
    if (data.length > 0) {
      data.forEach(image => {
        image.similarity = recalculateSimilarity(image)
      })

      // 按相似度降序排序
      data.sort((a, b) => b.similarity - a.similarity)
    }

    // 对相似图像进行分析，但只处理缺少特征数据的图像
    if (data.length > 0) {
      try {
        console.log(`检查 ${data.length} 张相似图像的特征数据`)

        // 找出需要分析的图像
        const imagesToAnalyze = data.filter(image =>
          !image.colors?.length ||
          !image.styles?.length ||
          !image.materials?.length ||
          !image.patterns?.length ||
          !image.colorPercentages?.length
        ).slice(0, 3); // 最多处理前3张

        if (imagesToAnalyze.length > 0) {
          console.log(`有 ${imagesToAnalyze.length} 张图像需要分析`)
          const analyzePromises = imagesToAnalyze.map(async (image) => {
            try {
              console.log(`分析图像 ID: ${image.id}, URL: ${image.url}`)
              const analysisResult = await imageService.analyzeImage(image.url) as ImageAnalysisResult

              // 更新图像特征，保留原有数据
              if (analysisResult) {
                Object.assign(image, {
                  colors: image.colors?.length ? image.colors : analysisResult.colors || [],
                  styles: image.styles?.length ? image.styles : analysisResult.styles || [],
                  materials: image.materials?.length ? image.materials : analysisResult.materials || [],
                  patterns: image.patterns?.length ? image.patterns : analysisResult.patterns || [],
                  colorPercentages: image.colorPercentages?.length ? image.colorPercentages : analysisResult.colorPercentages || [100]
                })
                console.log(`图像 ${image.id} 分析完成:`, analysisResult)

                // 重新计算相似度
                image.similarity = recalculateSimilarity(image)
              }
              return image
            } catch (err) {
              console.error(`分析图像 ${image.id} 失败:`, err)
              return image
            }
          })

          // 等待所有分析完成
          await Promise.all(analyzePromises)
          console.log('相似图像分析完成')

          // 重新按相似度排序
          data.sort((a, b) => b.similarity - a.similarity)
        } else {
          console.log('所有相似图像已有特征数据，无需分析')
        }
      } catch (analysisError) {
        console.error('分析相似图像时出错:', analysisError)
      }
    }

    // 立即更新数据，不使用延时
    similarImages.value = data
    // 强制组件重新渲染
    forceRerender.value += 1

    loadingSimilar.value = false
    message.success('刷新成功')
  } catch (error) {
    console.error('获取相似图像失败', error)
    loadingSimilar.value = false
    message.error('刷新失败，请稍后重试')
  }
}

// 查看图像详情
const viewImageDetails = async (image: SearchResult) => {
  // 切换到选中的相似图像
  selectedImage.value = image
  // 更新URL
  router.replace(`/comparison/${image.id}`)

  // 重新计算相似度并更新
  if (selectedImage.value) {
    selectedImage.value.similarity = recalculateSimilarity(selectedImage.value)
  }

  // 检查图像是否需要分析
  if (selectedImage.value && selectedImage.value.url) {
    // 检查是否已有完整的特征数据
    const needsAnalysis = !selectedImage.value.colors?.length ||
      !selectedImage.value.styles?.length ||
      !selectedImage.value.materials?.length ||
      !selectedImage.value.patterns?.length ||
      !selectedImage.value.colorPercentages?.length;

    if (needsAnalysis) {
      try {
        console.log('新选定图像缺少特征数据，开始分析:', selectedImage.value.url)
        const analysisResult = await imageService.analyzeImage(selectedImage.value.url) as ImageAnalysisResult
        console.log('获取新选定图像分析结果:', analysisResult)

        // 将分析结果合并到选定图像
        if (analysisResult) {
          Object.assign(selectedImage.value, {
            colors: selectedImage.value.colors?.length ? selectedImage.value.colors : analysisResult.colors || [],
            styles: selectedImage.value.styles?.length ? selectedImage.value.styles : analysisResult.styles || [],
            materials: selectedImage.value.materials?.length ? selectedImage.value.materials : analysisResult.materials || [],
            patterns: selectedImage.value.patterns?.length ? selectedImage.value.patterns : analysisResult.patterns || [],
            colorPercentages: selectedImage.value.colorPercentages?.length ? selectedImage.value.colorPercentages : analysisResult.colorPercentages || [100]
          })

          // 重新计算相似度
          selectedImage.value.similarity = recalculateSimilarity(selectedImage.value)
        }
      } catch (error) {
        console.error('分析新选定图像失败:', error)
      }
    } else {
      console.log('新选定图像已有完整特征数据，跳过分析')
    }
  }

  // 刷新相似图像列表
  refreshSimilarImages()
}

// 添加到收藏
const addToFavorites = async () => {
  if (!selectedImage.value) {
    message.warning('请先选择一个图像')
    return
  }

  if (!isLoggedIn.value) {
    message.warning('请先登录')
    showLoginModal()
    return
  }

  try {
    message.loading({ content: '正在添加到收藏...', key: 'addFavorite' })

    // 调用API添加收藏
    await authStore.addFavoriteWithApi(selectedImage.value.id)

    // 更新当前图像的收藏状态
    if (selectedImage.value) {
      selectedImage.value.isFavorite = true
    }

    message.success({ content: '已添加到收藏', key: 'addFavorite' })
  } catch (error) {
    console.error('添加收藏失败:', error)
    message.error({ content: '添加收藏失败，请重试', key: 'addFavorite' })
  }
}

// 获取图像项样式，根据图像数量调整宽度
const getImageItemStyle = (count: number) => {
  // 如果图像少于4个，增加宽度让它们更好地填充空间
  if (count <= 3) {
    return {
      width: '140px',
      margin: '0 10px'
    }
  }
  // 图像数量适中(4-8)
  else if (count <= 8) {
    return {
      width: '130px',
      margin: '0 8px 16px'
    }
  }
  // 数量多时保持紧凑布局
  return {
    width: '120px',
    margin: '0 8px 16px'
  }
}

// 添加函数计算更精确的相似度
const recalculateSimilarity = (image: SearchResult): number => {
  if (!image || !currentSearchImage.value) return 0;

  // 如果是同一张图片（URL完全相同），则相似度为100%
  if (image.url === currentSearchImage.value.url) {
    return 100;
  }

  // 计算颜色相似度
  let colorSimilarity = 0;
  if (image.colors && currentSearchImage.value?.colors &&
    image.colors.length && currentSearchImage.value.colors.length) {
    colorSimilarity = calculateColorSimilarity(
      currentSearchImage.value.colors,
      currentSearchImage.value.colorPercentages,
      image.colors,
      image.colorPercentages
    );
  }

  // 计算图案相似度
  let patternSimilarity = 0;
  if (image.patterns && currentSearchImage.value?.patterns) {
    // 获取匹配的图案数量
    const matchedPatterns = image.patterns.filter(pattern =>
      currentSearchImage.value?.patterns?.includes(pattern) || false);

    // 计算总图案数量
    const totalPatterns = Math.max(
      image.patterns.length,
      currentSearchImage.value.patterns.length
    );

    // 基础相似度计算
    const basePatternSimilarity = totalPatterns > 0 ? (matchedPatterns.length / totalPatterns) * 100 : 0;

    // 如果没有匹配的图案，相似度直接为0
    if (matchedPatterns.length === 0) {
      patternSimilarity = 0;
    } else {
      // 根据匹配程度调整相似度
      patternSimilarity = Math.pow(basePatternSimilarity / 100, 1.8) * 100; // 增加指数，使相似度更严格

      // 如果图案数量不同，显著降低相似度
      if (image.patterns.length !== currentSearchImage.value.patterns.length) {
        patternSimilarity *= 0.6; // 增加惩罚力度
      }

      // 特殊图案类型的处理
      const conflictingPatterns = hasConflictingPatterns(image.patterns, currentSearchImage.value.patterns);
      if (conflictingPatterns) {
        patternSimilarity *= 0.3; // 显著增加互斥图案的惩罚力度
      }

      // 确保最高相似度不超过95%（除非完全相同的图案）
      if (patternSimilarity > 95 && !arePatternsSame(image.patterns, currentSearchImage.value.patterns)) {
        patternSimilarity = 95;
      }
    }
  }

  // 添加完全相同图案的判断函数
  function arePatternsSame(patterns1: string[], patterns2: string[]): boolean {
    if (patterns1.length !== patterns2.length) return false;
    return patterns1.every(pattern => patterns2.includes(pattern)) &&
      patterns2.every(pattern => patterns1.includes(pattern));
  }

  // 修改图案冲突检查函数，增加更多互斥类型
  function hasConflictingPatterns(patterns1: string[], patterns2: string[]) {
    // 定义更详细的互斥图案类型
    const conflictGroups = [
      ['条纹', '格子', '波点', '花卉'], // 基础图案互斥
      ['花卉', '几何', '抽象'], // 风格图案互斥
      ['纯色', '渐变', '印花'], // 色彩图案互斥
      ['动物纹', '植物纹', '几何'], // 主题图案互斥
      ['大花', '小花', '格子', '条纹'], // 尺寸相关互斥
      ['传统纹样', '现代图案'] // 风格相关互斥
    ];

    // 检查是否存在互斥的图案类型
    for (const group of conflictGroups) {
      const patterns1InGroup = patterns1.filter(p => group.includes(p));
      const patterns2InGroup = patterns2.filter(p => group.includes(p));

      if (patterns1InGroup.length > 0 && patterns2InGroup.length > 0 &&
        !patterns1InGroup.every(p => patterns2InGroup.includes(p))) {
        return true; // 发现互斥的图案类型
      }
    }
    return false;
  }

  // 计算风格相似度
  let styleSimilarity = 0;
  if (image.styles && currentSearchImage.value?.styles) {
    const matchedStyles = image.styles.filter(style =>
      currentSearchImage.value?.styles?.includes(style) || false);
    const totalStyles = Math.max(
      image.styles.length,
      currentSearchImage.value.styles.length
    );
    styleSimilarity = totalStyles > 0 ? (matchedStyles.length / totalStyles) * 100 : 0;
  }

  // 计算材质相似度
  let materialSimilarity = 0;
  if (image.materials && currentSearchImage.value?.materials) {
    const matchedMaterials = image.materials.filter(material =>
      currentSearchImage.value?.materials?.includes(material) || false);
    const totalMaterials = Math.max(
      image.materials.length,
      currentSearchImage.value.materials.length
    );
    materialSimilarity = totalMaterials > 0 ? (matchedMaterials.length / totalMaterials) * 100 : 0;
  }

  // 保存各项相似度到图像对象中（用于显示）
  image.colorSimilarity = Math.round(colorSimilarity * 10) / 10;
  image.patternSimilarity = Math.round(patternSimilarity * 10) / 10;

  // 定义各特征的权重
  const weights = {
    color: 0.42,     // 颜色权重42%（原38%）
    pattern: 0.32,   // 图案权重32%（原28%）
    style: 0.15,     // 风格权重15%（原20%）
    material: 0.11   // 材质权重11%（原14%）
  };

  // 计算加权平均相似度
  let weightedSimilarity = (
    colorSimilarity * weights.color +
    patternSimilarity * weights.pattern +
    styleSimilarity * weights.style +
    materialSimilarity * weights.material
  );

  // 应用非线性调整，使中等相似度的差异更明显
  weightedSimilarity = Math.pow(weightedSimilarity / 100, 1.35) * 100; // 增加幂指数，使曲线更陡峭

  // 如果所有特征都完全匹配，则保持100%相似度
  if (colorSimilarity === 100 && patternSimilarity === 100 &&
    styleSimilarity === 100 && materialSimilarity === 100) {
    return 100;
  }

  // 特殊情况处理
  // 1. 颜色相似度过低时的处理
  if (colorSimilarity < 30) { // 提高阈值
    const colorPenalty = Math.pow((30 - colorSimilarity) / 30, 1.4); // 增加惩罚曲线的陡峭度
    weightedSimilarity *= (1 - colorPenalty * 0.4); // 增加惩罚力度
  }

  // 2. 图案相似度过低时的处理
  if (patternSimilarity < 20) { // 提高阈值
    const patternPenalty = Math.pow((20 - patternSimilarity) / 20, 1.3);
    weightedSimilarity *= (1 - patternPenalty * 0.3); // 增加惩罚力度
  }

  // 3. 风格和材质的协同效应
  if (styleSimilarity > 85 && materialSimilarity > 85) { // 提高阈值
    weightedSimilarity *= 1.05; // 降低奖励系数
    weightedSimilarity = Math.min(99.9, weightedSimilarity);
  }

  // 4. 颜色和图案的协同效应
  if (colorSimilarity > 90 && patternSimilarity > 90) { // 提高阈值
    weightedSimilarity *= 1.08; // 降低奖励系数
    weightedSimilarity = Math.min(99.9, weightedSimilarity);
  }

  // 确保相似度不超过99.9%（除非是完全相同的图片）
  if (weightedSimilarity > 99.9 && image.url !== currentSearchImage.value.url) {
    weightedSimilarity = 99.9;
  }

  // 确保最低相似度
  weightedSimilarity = Math.max(15, weightedSimilarity);

  // 对最终结果进行平滑处理
  return Math.round(weightedSimilarity * 10) / 10;
};

// 显示登录模态框
const showLoginModal = () => {
  loginModalVisible.value = true
}

// 导航到搜索结果页面
const goToSearch = () => {
  router.push('/search-results')
}

// 登录成功回调
const onLoginSuccess = () => {
  // 可以执行登录成功后的特定逻辑
}
</script>

<style scoped>
.comparison-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.main-content {
  padding: 0;
  max-width: 100%;
  width: 100%;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-top: 0;
  /* 更改顶部间距，因为我们使用的是sticky定位的header */
}

.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
  margin: 24px;
  height: calc(100vh - 160px);
}

.loading-animation {
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  color: #606266;
  font-size: 16px;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

/* 新的布局结构 */
.comparison-layout {
  display: flex;
  min-height: calc(100vh - 150px);
  flex: 1;
  gap: 20px;
  margin-bottom: 24px;
}

/* 左侧边栏样式 */
.sidebar {
  width: 360px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s;
}

.sidebar-header {
  padding: 16px 20px;
  background: linear-gradient(90deg, #f5f7fa 0%, #eef2f5 100%);
  border-bottom: 1px solid #ebeef5;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #606266;
}

.sidebar-content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.sidebar-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
  display: flex;
  align-items: center;
}

.icon-wrapper {
  margin-right: 8px;
  display: inline-flex;
  color: #1890ff;
}

.original-image-container {
  height: 220px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.original-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.original-image-container:hover .original-image {
  transform: scale(1.05);
}

.image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 10px;
  font-size: 12px;
  text-align: center;
}

.detail-card {
  background-color: #f9fafc;
  border-radius: 6px;
  padding: 16px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.03);
}

.comparison-details {
  margin-top: 12px;
}

.detail-row {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.main-analysis {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.analysis-header {
  padding: 16px 20px;
  background: linear-gradient(90deg, #f5f7fa 0%, #eef2f5 100%);
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 8px;
}

.favorite-button {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
  padding: 0 16px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.3s;
}

.favorite-button:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.analysis-content {
  padding: 24px;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 数据分析部分 */
.analysis-intro {
  margin-bottom: 8px;
  background-color: #f9fafc;
  border-radius: 6px;
  padding: 16px;
}

.similarity-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.summary-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  margin: 0 4px;
}

.analysis-details {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.analysis-item {
  margin-bottom: 20px;
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.analysis-item:last-child {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.analysis-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.analysis-item:first-child {
  padding-bottom: 10px;
}

.analysis-item h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.analysis-description {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  padding-left: 18px;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.color-dot {
  background-color: #1890ff;
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.5);
}

.style-dot {
  background-color: #722ed1;
}

.color-analysis {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.color-rings {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  gap: 24px;
}

.color-ring-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 6px 0;
}

.color-ring {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-percent {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 180px;
  margin-top: 8px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 4px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.02);
}

.color-box {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.color-name {
  flex: 1;
  color: #606266;
}

.color-percentage {
  font-weight: 600;
  color: #303133;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 10px;
}

.style-analysis {
  flex: 1;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.style-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
  width: 100%;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-label {
  min-width: 80px;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.feature-dot {
  background-color: #52c41a;
  box-shadow: 0 0 6px rgba(82, 196, 26, 0.5);
}

.similar-dot {
  background-color: #1890ff;
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.5);
}

.no-data-chart {
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f9fafc;
  border-radius: 8px;
  font-size: 15px;
  gap: 12px;
}

.empty-icon {
  font-size: 32px;
  color: #c0c4cc;
}

.result-image-container {
  height: 220px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.result-image-container:hover .result-image {
  transform: scale(1.05);
}

.similarity-badge {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.image-list {
  margin-top: 16px;
}

.image-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #606266;
}

.result-count {
  font-size: 12px;
  color: #909399;
}

.image-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.image-thumbnails::-webkit-scrollbar {
  width: 4px;
}

.image-thumbnails::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 2px;
}

.image-thumbnail {
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.image-thumbnail.active {
  border-color: #1890ff;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 16px 4px 4px;
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.thumbnail-name {
  color: white;
  font-size: 11px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

.similarity-tag {
  font-size: 11px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 2px;
}

.image-filters,
.image-attributes {
  margin-top: 16px;
  padding: 12px;
  background-color: #f9fafc;
  border-radius: 6px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.03);
}

.filter-title,
.attribute-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.filter-group,
.attribute-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-item,
.attribute-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label,
.attribute-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.filter-tags,
.attribute-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.no-filter {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.threshold-value {
  font-size: 14px;
  color: #409eff;
  font-weight: 600;
}

.attribute-value.similarity {
  font-size: 16px;
  font-weight: 600;
}

.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 8px 0;
}

.search-conditions,
.match-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.condition-item,
.match-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.condition-label,
.match-label {
  font-size: 12px;
  color: #606266;
  min-width: 70px;
}

.condition-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.similarity-value {
  font-size: 14px;
  font-weight: 600;
}

.color-compare-wrapper {
  margin-top: 8px;
  padding-left: 18px;
}

.color-compare {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 12px;
}

.color-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #606266;
}

.color-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 200px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.color-name {
  flex: 1;
  color: #606266;
}

.color-percentage {
  font-weight: 600;
  color: #303133;
}

.comparison-section {
  display: flex;
  gap: 20px;
  width: 100%;
  align-items: center;
}

.radar-chart {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  min-height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 992px) {
  .color-compare {
    flex-direction: column;
    gap: 24px;
  }

  .comparison-section {
    flex-direction: column;
    gap: 16px;
  }

  .radar-chart {
    min-height: 250px;
  }

  .style-analysis {
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .content-container {
    padding: 8px;
  }

  .comparison-layout {
    gap: 12px;
  }
}

.features-comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  margin-top: 8px;
  width: 100%;
  height: 100%;
  min-height: 400px;
  flex: 1;
}

.feature-grid-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.feature-grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.feature-grid-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, rgba(24, 144, 255, 0.5), rgba(24, 144, 255, 0.3));
  opacity: 0.7;
}

.feature-grid-item:nth-child(1)::before {
  background: linear-gradient(to bottom, rgba(24, 144, 255, 0.6), rgba(24, 144, 255, 0.3));
}

.feature-grid-item:nth-child(2)::before {
  background: linear-gradient(to bottom, rgba(114, 46, 209, 0.6), rgba(114, 46, 209, 0.3));
}

.feature-grid-item:nth-child(3)::before {
  background: linear-gradient(to bottom, rgba(250, 140, 22, 0.6), rgba(250, 140, 22, 0.3));
}

.feature-grid-item:nth-child(4)::before {
  background: linear-gradient(to bottom, rgba(82, 196, 26, 0.6), rgba(82, 196, 26, 0.3));
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
  display: flex;
  align-items: center;
}

.feature-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
}

.color-icon {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
}

.style-icon {
  background: linear-gradient(135deg, #722ed1, #9254de);
}

.material-icon {
  background: linear-gradient(135deg, #fa8c16, #ffa940);
}

.pattern-icon {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.feature-comparison-row {
  display: flex;
  gap: 16px;
  flex: 1;
  width: 100%;
  height: 100%;
}

.feature-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
}

.feature-divider {
  width: 1px;
  background-color: #f0f0f0;
}

.feature-header {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  padding: 4px 0;
  text-align: center;
  background-color: #f9fafc;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.feature-content {
  min-height: 60px;
  padding: 12px;
  background-color: #fafbfc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #f0f2f5;
  height: 100%;
}

.feature-content.compact {
  min-height: 120px;
  padding: 8px 10px;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 18px;
  font-size: 14px;
  background-image: linear-gradient(to right, var(--start-color), var(--end-color));
  color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  max-width: fit-content;
  margin: 6px;
  transform-origin: center center;
  animation: tagFloat 3s infinite alternate ease-in-out;
  animation-delay: calc(var(--tag-index, 0) * 0.2s);
  cursor: pointer;
  min-width: 70px;
  text-align: center;
}

@keyframes tagFloat {
  0% {
    transform: translateY(0) rotate(calc(var(--rotation-dir, 1) * 1deg));
  }

  100% {
    transform: translateY(-3px) rotate(calc(var(--rotation-dir, 1) * -1deg));
  }
}

.feature-tag:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  animation-play-state: paused;
}

.matched-tag {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
}

.match-indicator {
  font-size: 10px;
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  padding: 1px 4px;
  border-radius: 8px;
}

.color-tags .feature-tag {
  background-color: #f0f8ff;
  border-color: #d6e9ff;
}

.style-tags .feature-tag {
  background-color: #f6f0ff;
  border-color: #e8d6ff;
}

.material-tags .feature-tag {
  background-color: #fff7e6;
  border-color: #ffe7ba;
}

.pattern-tags .feature-tag {
  background-color: #f6ffed;
  border-color: #d9f7be;
}

.feature-empty {
  font-size: 12px;
  color: #909399;
  font-style: italic;
  padding: 8px 0;
  text-align: center;
}

.color-ring-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 6px 0;
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 180px;
  margin-top: 8px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 4px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.02);
}

.color-box {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.color-name {
  flex: 1;
  color: #606266;
}

.color-percentage {
  font-weight: 600;
  color: #303133;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 10px;
}

@media (max-width: 768px) {
  .features-comparison-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
  }
}

/* 添加QQ标签风格的CSS样式 */
.qq-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  width: 100%;
  height: 100%;
}

.qq-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 18px;
  font-size: 14px;
  background-image: linear-gradient(to right, var(--start-color), var(--end-color));
  color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  max-width: fit-content;
  margin: 6px;
  transform-origin: center center;
  animation: tagFloat 3s infinite alternate ease-in-out;
  animation-delay: calc(var(--tag-index, 0) * 0.2s);
  cursor: pointer;
  min-width: 70px;
  text-align: center;
}

@keyframes tagFloat {
  0% {
    transform: translateY(0) rotate(calc(var(--rotation-dir, 1) * 1deg));
  }

  100% {
    transform: translateY(-3px) rotate(calc(var(--rotation-dir, 1) * -1deg));
  }
}

.qq-tag:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  animation-play-state: paused;
}

.qq-tag.style-tag {
  --start-color: #722ed1;
  --end-color: #9254de;
}

.qq-tag.material-tag {
  --start-color: #fa8c16;
  --end-color: #ffa940;
}

.qq-tag.pattern-tag {
  --start-color: #52c41a;
  --end-color: #73d13d;
}

.qq-tag.matched {
  box-shadow: 0 2px 7px rgba(24, 144, 255, 0.3);
  animation: pulse 2s infinite;
}

.match-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.5);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(24, 144, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  background-color: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
  transition: all 0.3s;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.header-with-back {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  color: #1890ff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  margin-right: 4px;
}

.back-btn:hover {
  color: #40a9ff;
  transform: scale(1.1);
}

.similar-images-section {
  margin-top: 24px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 260px;
  /* 确保最小高度 */
}

.similar-images-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.similar-images-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.refresh-button {
  background-color: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
  transition: all 0.3s;
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-button:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  transform: rotate(30deg);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.similar-images-scroll {
  overflow-x: auto;
  padding: 10px 0;
  height: auto;
  flex: 1;
  min-height: 210px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.similar-loading,
.similar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 190px;
  width: 100%;
  transition: opacity 0.3s ease;
  flex: 1;
}

.similar-empty {
  flex-direction: column;
  color: #909399;
  gap: 10px;
}

.similar-images-list {
  display: flex;
  gap: 16px;
  padding: 5px;
  height: 100%;
  min-height: 190px;
  transition: opacity 0.3s ease;
  position: relative;
  flex-wrap: wrap;
  /* 允许在需要时换行 */
  align-content: flex-start;
  justify-content: flex-start;
}

.similar-images-list.few-items {
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
}

/* 加载状态下的蒙层效果 */
.loading-overlay {
  opacity: 0.6;
  pointer-events: none;
}

.loading-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 5;
}

.similar-image-item {
  flex: 0 0 auto;
  width: 120px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  height: 190px;
  margin-bottom: 16px;
  /* 添加底部间距，适应换行布局 */
}

.similar-image-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(24, 144, 255, 0.2);
}

.similar-image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  min-height: 120px;
  background-color: #f5f7fa;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.similar-image-info {
  padding: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  height: 70px;
  overflow: visible;
}

.similar-image-name {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
  line-height: 1.2;
  max-height: 30px;
}

.similar-image-similarity {
  font-size: 11px;
  color: #1890ff;
  background-color: #e6f7ff;
  border-radius: 10px;
  padding: 1px 6px;
  display: block;
  margin: 0 auto;
  width: fit-content;
  max-width: 90px;
  min-width: 60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  box-shadow: 0 1px 2px rgba(24, 144, 255, 0.2);
  position: relative;
  z-index: 1;
}

.favorite-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  padding: 2px;
}

.boost-indicator {
  font-size: 10px;
  color: #ff4d4f;
}

.favorite-boosted {
  background-color: #fff1f0 !important;
  color: #ff4d4f !important;
  border: 1px solid #ffccc7;
}

.color-adjust-controls {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-adjustment-panel {
  flex: 1;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.adjustment-tip {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.adjustment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.adjustment-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.adjust-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.adjust-color-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.adjust-percentage {
  font-size: 12px;
  color: #606266;
}

.add-color-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.add-color-btn {
  background-color: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
  transition: all 0.3s;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
}

.add-color-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.adjust-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.remove-color-btn {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  box-shadow: 0 2px 6px rgba(255, 77, 79, 0.2);
  transition: all 0.3s;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
}

.remove-color-btn:hover {
  background-color: #ff7b7d;
  border-color: #ff7b7d;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
}

.color-picker-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.color-option-name {
  font-size: 12px;
  color: #606266;
  margin-top: 8px;
}
</style>