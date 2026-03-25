<template>
    <a-card class="fabric-card" :hoverable="true" @click="handleClick">
        <div class="image-container">
            <img :src="ensureFullUrl(image.url || image.thumbnailUrl || image.imageUrl)" :alt="image.name"
                @error="handleImageError" ref="imageRef" />
            <div class="image-overlay"></div>
            <div class="similarity-badge" v-if="image.similarity !== undefined">
                <div class="progress-circle" :style="{ background: getGradient(image.similarity * 100) }">
                    <span>{{ Math.round(image.similarity * 100) }}%</span>
                    <span v-if="image.isFavorite" class="boosted-tag">提升</span>
                </div>
            </div>
            <div class="favorite-btn">
                <a-button shape="circle" size="small" :class="['favorite-button', { 'is-favorite': image.isFavorite }]"
                    @click.stop="handleFavorite">
                    <template #icon>
                        <heart-filled v-if="image.isFavorite" />
                        <heart-outlined v-else />
                    </template>
                </a-button>
            </div>
        </div>
        <div class="card-content">
            <div class="fabric-name text-ellipsis">{{ image.name }}</div>

            <div class="card-info-grid">
                <!-- 颜色展示 -->
                <div class="info-row" v-if="image.colors && image.colors.length">
                    <div class="info-label">颜色:</div>
                    <div class="info-value">
                        <div class="color-dots">
                            <div v-for="color in image.colors.slice(0, 5)" :key="color" class="color-dot"
                                :style="{ backgroundColor: getColorCode(color) }" :title="color"></div>
                            <div v-if="image.colors.length > 5" class="more-colors">+{{ image.colors.length - 5 }}</div>
                        </div>
                    </div>
                </div>

                <!-- 风格展示 -->
                <div class="info-row" v-if="image.styles && image.styles.length">
                    <div class="info-label">风格:</div>
                    <div class="info-value">
                        <div class="property-text text-ellipsis">
                            {{ image.styles.join(', ') }}
                        </div>
                    </div>
                </div>

                <!-- 材质信息 -->
                <div class="info-row" v-if="image.materials && image.materials.length">
                    <div class="info-label">材质:</div>
                    <div class="info-value">
                        <div class="property-text text-ellipsis">
                            {{ image.materials.join(', ') }}
                        </div>
                    </div>
                </div>

                <!-- 图案信息 -->
                <div class="info-row" v-if="image.patterns && image.patterns.length">
                    <div class="info-label">图案:</div>
                    <div class="info-value">
                        <div class="property-text text-ellipsis">
                            {{ image.patterns.join(', ') }}
                        </div>
                    </div>
                </div>

                <!-- 家纺类型 -->
                <div class="info-row" v-if="image.textileTypes && image.textileTypes.length">
                    <div class="info-label">类型:</div>
                    <div class="info-value">
                        <div class="textile-types">
                            <a-tag v-for="type in image.textileTypes.slice(0, 2)" :key="type" class="textile-type-tag">
                                {{ type }}
                            </a-tag>
                            <a-tag v-if="image.textileTypes.length > 2" class="more-tag">
                                +{{ image.textileTypes.length - 2 }}
                            </a-tag>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref } from 'vue'
import { HeartOutlined, HeartFilled } from '@ant-design/icons-vue'
import { getFallbackImageUrl } from '../../services/api'

interface FabricImage {
    id: string
    name: string
    imageUrl: string
    thumbnailUrl: string
    url?: string
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
    image: {
        type: Object as () => FabricImage,
        required: true
    }
})

const emit = defineEmits(['click', 'favorite'])

const handleClick = () => {
    emit('click', props.image)
}

const handleFavorite = () => {
    emit('favorite', props.image)
}

const imageRef = ref<HTMLImageElement | null>(null);

// 根据相似度生成渐变颜色
const getGradient = (similarity: number) => {
    if (similarity >= 90) {
        return 'conic-gradient(#52c41a 0%, #52c41a ' + similarity + '%, #f5f5f5 ' + similarity + '%, #f5f5f5 100%)';
    } else if (similarity >= 70) {
        return 'conic-gradient(#1890ff 0%, #1890ff ' + similarity + '%, #f5f5f5 ' + similarity + '%, #f5f5f5 100%)';
    } else if (similarity >= 50) {
        return 'conic-gradient(#faad14 0%, #faad14 ' + similarity + '%, #f5f5f5 ' + similarity + '%, #f5f5f5 100%)';
    } else {
        return 'conic-gradient(#ff4d4f 0%, #ff4d4f ' + similarity + '%, #f5f5f5 ' + similarity + '%, #f5f5f5 100%)';
    }
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

// 确保 URL 是完整的 URL
const ensureFullUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
</script>

<style scoped>
.fabric-card {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: none;
    position: relative;
    background-color: #fff;
}

.fabric-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background-color: #f5f5f5;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.fabric-card:hover .image-container img {
    transform: scale(1.08);
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
    opacity: 0;
    transition: opacity 0.3s;
}

.fabric-card:hover .image-overlay {
    opacity: 1;
}

.similarity-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    z-index: 2;
}

.progress-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 13px;
    color: #fff;
    position: relative;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.progress-circle::before {
    content: '';
    position: absolute;
    inset: 2px;
    background: #111;
    border-radius: 50%;
    z-index: -1;
}

.progress-circle span {
    position: relative;
    z-index: 2;
    color: white;
    font-size: 12px;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
}

.favorite-button {
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s;
}

.favorite-button:hover {
    transform: scale(1.15);
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

.card-content {
    padding: 12px;
    background: linear-gradient(to bottom, #ffffff 0%, #f9fbff 100%);
    border-top: 1px solid rgba(0, 0, 0, 0.03);
}

.fabric-name {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 10px;
    color: #333;
    line-height: 1.3;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
    padding-bottom: 8px;
}

.card-info-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-row {
    display: grid;
    grid-template-columns: 42px 1fr;
    align-items: flex-start;
    min-height: 22px;
    margin-bottom: 3px;
}

.info-label {
    color: #666;
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    padding-top: 2px;
}

.info-value {
    font-size: 12px;
    line-height: 20px;
    padding-top: 2px;
}

.color-dots {
    display: flex;
    gap: 3px;
    align-items: center;
    padding-top: 3px;
}

.color-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
}

.color-dot:hover {
    transform: scale(1.2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.more-colors {
    font-size: 11px;
    color: #999;
    margin-left: 4px;
}

.property-text {
    color: #1890ff;
    font-weight: 500;
    display: block;
    width: 100%;
    line-height: 20px;
}

.textile-types {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-top: 1px;
}

.textile-type-tag {
    margin-right: 0;
    border-radius: 4px;
    font-size: 10px;
    padding: 0 5px;
    height: 18px;
    line-height: 18px;
    background-color: #e6f7ff;
    color: #1890ff;
    border: none;
    transition: all 0.2s;
}

.textile-type-tag:hover {
    background-color: #bae7ff;
    transform: translateY(-2px);
}

.more-tag {
    background-color: #f5f5f5;
    color: #666;
}

.text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.boosted-tag {
    display: block;
    font-size: 10px;
    background-color: #ff4d4f;
    border-radius: 8px;
    margin-top: 2px;
    padding: 0 4px;
    text-transform: uppercase;
}
</style>