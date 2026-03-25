<template>
    <div class="search-results">
        <div v-if="loading" class="loading-container">
            <a-spin size="large" />
            <p>{{ $t('searchResults.loading') }}</p>
        </div>

        <div v-else-if="!results.length" class="no-results">
            <a-empty :description="$t('searchResults.noResults')" />
        </div>

        <template v-else>
            <!-- 网格视图 -->
            <div v-if="viewType === 'grid'" class="results-grid">
                <a-row :gutter="[24, 24]">
                    <a-col v-for="item in results" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" :xxl="4">
                        <div class="card-wrapper" :data-id="item.id">
                            <FabricCard :image="item" @click="selectImage(item)" @favorite="toggleFavorite" />
                        </div>
                    </a-col>
                </a-row>
            </div>

            <!-- 列表视图 -->
            <div v-else-if="viewType === 'list'" class="results-list">
                <a-list item-layout="horizontal" :data-source="results">
                    <template #renderItem="{ item }">
                        <a-list-item class="list-item-card" @click="selectImage(item)">
                            <a-list-item-meta>
                                <template #avatar>
                                    <div class="list-img-container">
                                        <img class="list-thumbnail"
                                            :src="ensureFullUrl(item.url || item.thumbnailUrl || item.imageUrl)"
                                            :alt="item.name" @error="handleImageError" />
                                        <div class="list-similarity" v-if="item.similarity !== undefined">
                                            {{ Math.round(item.similarity * 100) }}%
                                        </div>
                                    </div>
                                </template>
                                <template #title>
                                    <div class="item-title">{{ item.name }}</div>
                                </template>
                                <template #description>
                                    <div class="item-description">
                                        <div class="tags" v-if="item.tags && item.tags.length">
                                            <a-tag v-for="tag in item.tags.slice(0, 3)" :key="tag" class="fabric-tag">{{
                                                tag }}</a-tag>
                                            <a-tag v-if="item.tags.length > 3" class="fabric-tag more-tag">+{{
                                                item.tags.length - 3 }}</a-tag>
                                        </div>
                                    </div>
                                </template>
                            </a-list-item-meta>
                            <template #actions>
                                <a-button shape="circle"
                                    :class="['favorite-button', { 'is-favorite': item.isFavorite }]"
                                    @click.stop="toggleFavorite(item)">
                                    <template #icon>
                                        <heart-filled v-if="item.isFavorite" />
                                        <heart-outlined v-else />
                                    </template>
                                </a-button>
                            </template>
                        </a-list-item>
                    </template>
                </a-list>
            </div>

            <!-- 详情视图 -->
            <div v-else-if="viewType === 'detail'" class="results-detail">
                <a-list item-layout="vertical" size="large" :data-source="results">
                    <template #renderItem="{ item }">
                        <a-list-item class="detail-item-card" @click="selectImage(item)">
                            <a-row :gutter="24" class="detail-row">
                                <a-col :xs="24" :sm="8" :md="6">
                                    <div class="detail-img-container">
                                        <img class="detail-thumbnail"
                                            :src="ensureFullUrl(item.url || item.thumbnailUrl || item.imageUrl)"
                                            :alt="item.name" @error="handleImageError" />
                                        <div class="detail-similarity" v-if="item.similarity !== undefined">
                                            <a-progress :percent="Math.round(item.similarity * 100)" size="small"
                                                :strokeColor="getSimilarityColor(item.similarity * 100)"
                                                :showInfo="false" />
                                            <span class="similarity-text">{{ Math.round(item.similarity * 100) }}%
                                                相似度</span>
                                        </div>
                                    </div>
                                </a-col>
                                <a-col :xs="24" :sm="16" :md="18">
                                    <div class="detail-content">
                                        <div class="detail-header">
                                            <h3 class="detail-title">{{ item.name }}</h3>
                                            <a-button shape="circle"
                                                :class="['favorite-button', { 'is-favorite': item.isFavorite }]"
                                                @click.stop="toggleFavorite(item)">
                                                <template #icon>
                                                    <heart-filled v-if="item.isFavorite" />
                                                    <heart-outlined v-else />
                                                </template>
                                            </a-button>
                                        </div>
                                        <div class="detail-item-properties">
                                            <!-- 颜色标签 -->
                                            <div class="property-section" v-if="item.colors && item.colors.length">
                                                <span class="property-label">颜色:</span>
                                                <div class="property-content">
                                                    <a-tag v-for="color in item.colors" :key="color" class="color-tag">
                                                        <span class="color-dot"
                                                            :style="{ backgroundColor: getColorCode(color) }"></span>
                                                        {{ color }}
                                                    </a-tag>
                                                </div>
                                            </div>

                                            <!-- 风格标签 -->
                                            <div class="property-section" v-if="item.styles && item.styles.length">
                                                <span class="property-label">风格:</span>
                                                <div class="property-content">
                                                    <a-tag v-for="style in item.styles" :key="style" class="style-tag">
                                                        {{ style }}
                                                    </a-tag>
                                                </div>
                                            </div>

                                            <!-- 材质标签 -->
                                            <div class="property-section"
                                                v-if="item.materials && item.materials.length">
                                                <span class="property-label">材质:</span>
                                                <div class="property-content">
                                                    <a-tag v-for="material in item.materials" :key="material"
                                                        class="material-tag">
                                                        {{ material }}
                                                    </a-tag>
                                                </div>
                                            </div>

                                            <!-- 图案标签 -->
                                            <div class="property-section" v-if="item.patterns && item.patterns.length">
                                                <span class="property-label">图案:</span>
                                                <div class="property-content">
                                                    <a-tag v-for="pattern in item.patterns" :key="pattern"
                                                        class="pattern-tag">
                                                        {{ pattern }}
                                                    </a-tag>
                                                </div>
                                            </div>

                                            <!-- 家纺类型标签 -->
                                            <div class="property-section"
                                                v-if="item.textileTypes && item.textileTypes.length">
                                                <span class="property-label">适用于:</span>
                                                <div class="property-content">
                                                    <a-tag v-for="type in item.textileTypes" :key="type"
                                                        class="textile-tag">
                                                        {{ type }}
                                                    </a-tag>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="detail-footer">
                                            <a-button type="primary" @click.stop="selectImage(item)">查看详情</a-button>
                                        </div>
                                    </div>
                                </a-col>
                            </a-row>
                        </a-list-item>
                    </template>
                </a-list>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, watch } from 'vue'
import { HeartOutlined, HeartFilled } from '@ant-design/icons-vue'
import FabricCard from './FabricCard.vue'
import type { ViewType } from './ViewSwitcher.vue'
import { fixImageUrl, getFallbackImageUrl } from '../../services/api'

// 定义图片类型
interface FabricImage {
    id: string
    name: string
    imageUrl: string
    thumbnailUrl: string
    similarity?: number
    tags?: string[]
    isFavorite?: boolean
    colors?: string[]
    styles?: string[]
    materials?: string[]
    patterns?: string[]
    textileTypes?: string[]
}

const props = defineProps({
    results: {
        type: Array as () => FabricImage[],
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    totalResults: {
        type: Number,
        default: 0
    },
    viewType: {
        type: String as () => ViewType,
        default: 'grid'
    }
})

const emit = defineEmits([
    'select-item',
    'toggle-favorite',
    'page-change',
    'page-size-change'
])

// 处理图片选择
const selectImage = (image: FabricImage) => {
    emit('select-item', image)
}

// 处理收藏切换
const toggleFavorite = (image: FabricImage) => {
    emit('toggle-favorite', image)
}

// 当传入结果清空时，重置页码
watch(() => props.results, (newResults) => {
    if (!newResults || newResults.length === 0) {
        // 通知父组件重置页码
        emit('page-change', 1)
    }
})

// 确保 URL 是完整的 URL
const ensureFullUrl = (url: string): string => {
    return fixImageUrl(url);
}

// 处理图像加载错误
const handleImageError = (e: Event) => {
    const target = e.target as HTMLImageElement;
    console.error(`图像加载失败: ${target.src}`);

    // 提取图片ID或名称
    const urlParts = target.src.split('/');
    const imageId = urlParts[urlParts.length - 1].split('?')[0];

    // 尝试获取备用URL
    const fallbackUrl = getFallbackImageUrl(imageId);

    // 避免循环 - 检查是否已经尝试过备用URL
    if (!target.dataset.fallbackAttempted) {
        console.log(`替换为备用图像: ${fallbackUrl}`);
        target.src = fallbackUrl;
        target.dataset.fallbackAttempted = 'true';
    } else {
        console.warn(`无法加载备用图像，使用内联数据URL`);
        // 使用内联的base64数据URL作为最终备选
        target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAEbUlEQVR4Xu2dW0scQRCF8yNCQEEkQgQxxiCagHj//wdyEQRFDIqKF1QMKsYgUYgQkWBV2OXhIXF3Z7qqu2d7ah/Xml2+U/V1TdU5gQ8+rknAWUtIhIHgiMAABIQjAiMIRwQGQiAfEcj6QaZOns2tH0S3bZfk/aBb9kxAiBICQkCIEgIikA0hIQTkXEOEukFUgLCGaAgj4wxJyIZwiIERAkeZpQQEjjJLCQgcZZYSEDjKLCUgcJRZSkDgKLOUgMBRZikBgaPMUgICR5mlBASOMksJCBxllhIQOMosJSBwlFlKQOAos5SAwFGmuBT1xPjjT8edF6x7rKc5aHp6qzr5u9Ur2Pnz+4+of3a5pfHNLzbrPttrOPrwQTQ+OSHf3t5bF1++9hrnxPHU/X5jdm68O21rYsIQqVT+/PwqXl9frftXrpzThoQ4OPnIhAkgp05dAwirppgCEoOmGAPSbJqyhG+dE4OmyPj7Fc362tLZGiLOkkpF5aqSNfQzxcNpb1b5g0QDpGeD3rqRnCPWWZYiHRdKU1IJJFCKCyDt3pq4Gn7q6ZM1IFrpGQrImyKlMdaAaGqKFSCtzXoPe1bUDUhT6rwDUsj0JUktrC4A0UzPnQBpvD2NwvGlLPVuBgXkf1HIDJCGqhQyaWFrN0BMS6IzQOQs64dYc2B3CQgxhDUkl2lKO5CyUjQiEF/JjVm0QOaX5v5TDQvtGGDz4V6jZyc2X35qIKWvxZWtlRtnQFIW7lyCYYEkqqgzDkRGm3dXm5+/UACyvLQinp6eGwDRbDCqtDtJfk4ApeiXTUKw7sWNu8fbdYqS0XMbxbsXIN2mbJGBxEpVSiEfoCz0zWY9DZBAr7UVkF8/fohf3/MBkp2GxA4pCxBmWUnUMKuWlYHhGTFDIGwdDcs0lYGZAqF/gYKz/ql1QxtLM04BydlOphoUCZCsWpYEkg2QnMd5HVSTnAoxTlILrZBnkuzeILfCZRJDJFUJCGvIh+aPZ8ZZlvUGj5E8fEp9Yg/ptHQo1UJDMpOHJ0VXW7FaBjNEAkGfaKzz5W8lhnwYVZdB53QHlH9LpPNSSvUTDxHfD6lnazrPXpFWGo0DQQBpU1Rmo6yzrMafFx5bnzADRJvfmxdIJyfqzAKpT08m+yGfbVlhpQwByb2HqGrBMQHE142TsbbQzQKxyBcCAugQagSC+BUkAoL6JTGLEcJiKZWCAIkVi2QxdCNR9F9uLzFpFVeRjfLGPh8tz8JjXchNr7AoRvnQXRj3NaWc3C1rHw4qw0lsLQttBY6AICCpJLRLW2pAQDWEgBAQooSACGRDSAgBIUpSA8Iacp5lcYgBp3BMWUIc0i5gygISghpLGzREvxICQkCIEgIikA0hIQTkXEOEukFUgLCGaAgj4wxJyIZwiIERAkeZpQQEjjJLCQgcZZYSEDjKLCUgcJRZSkDgKLOUgMBRZikBgaPMUgICR5mlBASOMksJCBxllhIQOMosJSBwlFlKQOAos5SAwFFm6V9KWYJCp9KIpQAAAABJRU5ErkJggg==';
    }
};

// 根据相似度返回不同的颜色
const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 90) return '#52c41a'; // 高相似度为绿色
    if (similarity >= 70) return '#1890ff'; // 中高相似度为蓝色
    if (similarity >= 50) return '#faad14'; // 中相似度为黄色
    return '#e67e22'; // 低相似度为深橙色，替代红色
};

// 根据颜色名称返回颜色代码
const getColorCode = (colorName: string): string => {
    const colorMap: Record<string, string> = {
        '红色': '#e67e22', // 将红色改为深橙色
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
};
</script>

<style scoped>
.search-results {
    width: 100%;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    background-color: #fafafa;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-container p {
    margin-top: 16px;
    color: #666;
    font-size: 16px;
}

.no-results {
    padding: 60px 0;
    text-align: center;
    background-color: #fafafa;
    border-radius: 8px;
    margin: 20px 0;
}

.results-grid {
    margin-bottom: 20px;
}

.card-wrapper {
    transition: transform 0.2s;
}

/* 列表视图样式 */
.results-list {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 20px;
}

.list-item-card {
    padding: 16px;
    transition: all 0.3s;
    cursor: pointer;
}

.list-item-card:hover {
    background-color: #f8f8f8;
}

.list-img-container {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.list-item-card:hover .list-thumbnail {
    transform: scale(1.05);
}

.list-similarity {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 10px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
}

.item-title {
    font-weight: 600;
    font-size: 16px;
    color: #333;
}

.item-description {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
}

.fabric-tag {
    margin-right: 6px;
    border-radius: 4px;
    font-size: 12px;
    background-color: #f0f7ff;
    color: #1890ff;
    border: none;
}

.more-tag {
    background-color: #f5f5f5;
    color: #666;
}

.favorite-button {
    transition: transform 0.2s;
}

.favorite-button:hover {
    transform: scale(1.1);
}

/* 添加红色爱心样式 */
.favorite-button :deep(.anticon-heart-filled) {
    color: #ff4d4f !important;
}

/* 当按钮被收藏时的样式 */
.favorite-button.is-favorite {
    border-color: #ff4d4f !important;
}

.favorite-button.is-favorite:hover,
.favorite-button.is-favorite:focus {
    background-color: #fff0f0 !important;
    border-color: #ff7875 !important;
}

/* 详情视图样式 */
.results-detail {
    margin-bottom: 20px;
}

.detail-item-card {
    padding: 16px;
    margin-bottom: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    cursor: pointer;
}

.detail-item-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.detail-row {
    width: 100%;
}

.detail-img-container {
    position: relative;
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
}

.detail-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.detail-item-card:hover .detail-thumbnail {
    transform: scale(1.05);
}

.detail-similarity {
    padding: 8px 12px;
    margin-top: 8px;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.similarity-text {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #666;
    text-align: center;
}

.detail-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.detail-title {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.detail-item-properties {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.property-section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
}

.property-label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
    width: 60px;
}

.property-content {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.color-tag {
    border: none;
    background-color: #f9f9f9;
    padding: 0 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
}

.style-tag {
    border: none;
    background-color: #e6f7ff;
    color: #1890ff;
}

.material-tag {
    border: none;
    background-color: #f6ffed;
    color: #52c41a;
}

.pattern-tag {
    border: none;
    background-color: #fff7e6;
    color: #fa8c16;
}

.textile-tag {
    border: none;
    background-color: #fff0f6;
    color: #eb2f96;
}

.detail-footer {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
}

@media (max-width: 576px) {
    .list-img-container {
        width: 80px;
        height: 80px;
    }

    .item-title {
        font-size: 14px;
    }

    .detail-img-container {
        height: 160px;
    }

    .property-section {
        flex-direction: column;
        gap: 4px;
    }

    .property-label {
        width: 100%;
    }
}
</style>