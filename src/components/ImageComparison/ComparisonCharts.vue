<template>
    <div class="similarity-radar-chart">
        <div ref="similarityChart" class="radar-container"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { SearchResult, SearchImage } from '../../stores/search'

// 组件属性
const props = defineProps({
    similarImage: {
        type: Object as () => SearchResult,
        required: true
    },
    currentSearchImage: {
        type: Object as () => SearchImage | null,
        default: null
    }
})

// 图表引用
const similarityChart = ref<HTMLElement | null>(null)

// 图表实例
let similarityChartInstance: echarts.ECharts | null = null

// 初始化图表
onMounted(() => {
    initSimilarityChart()

    // 窗口大小变化时重绘图表
    window.addEventListener('resize', handleResize)
})

// 清理图表实例
onUnmounted(() => {
    if (similarityChartInstance) {
        similarityChartInstance.dispose()
    }
    window.removeEventListener('resize', handleResize)
})

// 监听属性变化，更新图表
watch(() => props.similarImage, () => {
    initSimilarityChart()
}, { deep: true })

// 重新调整大小
const handleResize = () => {
    if (similarityChartInstance) {
        similarityChartInstance.resize()
    }
}

// 初始化相似度雷达图
const initSimilarityChart = () => {
    if (!similarityChart.value) return

    // 销毁旧实例
    if (similarityChartInstance) {
        similarityChartInstance.dispose()
    }

    // 创建新实例
    similarityChartInstance = echarts.init(similarityChart.value)

    // 准备数据
    const similarity = props.similarImage.similarity || 0
    const colorSimilarity = props.similarImage.colorSimilarity || Math.round(similarity * 0.9)
    const patternSimilarity = props.similarImage.patternSimilarity || Math.round(similarity * 0.8)

    // 计算风格和材质匹配度
    const styleSimilarity = calculateStyleSimilarity()
    const materialSimilarity = calculateMaterialSimilarity()

    // 绘制雷达图
    const option = {
        tooltip: {
            trigger: 'item'
        },
        radar: {
            indicator: [
                { name: '整体相似度', max: 100 },
                { name: '颜色匹配', max: 100 },
                { name: '风格匹配', max: 100 },
                { name: '图案匹配', max: 100 },
                { name: '材质匹配', max: 100 }
            ],
            radius: '50%',
            center: ['50%', '50%'],
            shape: 'polygon',
            splitNumber: 5,
            nameGap: 18,
            splitArea: {
                areaStyle: {
                    color: ['rgba(255, 255, 255, 0.8)']
                }
            },
            axisName: {
                formatter: (name: string) => {
                    return name;
                },
                fontSize: 12,
                color: '#333',
                padding: [3, 5],
                backgroundColor: 'rgba(255, 255, 255, 0.7)'
            }
        },
        grid: {
            top: 10,
            left: 10,
            right: 10,
            bottom: 10
        },
        series: [
            {
                name: '相似度分析',
                type: 'radar',
                data: [
                    {
                        value: [similarity, colorSimilarity, styleSimilarity, patternSimilarity, materialSimilarity],
                        name: '相似度分析',
                        areaStyle: {
                            color: 'rgba(24, 144, 255, 0.3)'
                        },
                        lineStyle: {
                            color: '#1890ff',
                            width: 2
                        },
                        itemStyle: {
                            color: '#1890ff'
                        }
                    }
                ]
            }
        ]
    }

    similarityChartInstance.setOption(option)
}

// 计算风格匹配度
const calculateStyleSimilarity = () => {
    const sourceStyles = props.similarImage.styles || []
    const targetStyles = props.currentSearchImage?.styles || ['现代', '简约']

    if (!sourceStyles.length || !targetStyles.length) return props.similarImage.similarity * 0.85

    const matchCount = sourceStyles.filter(style => targetStyles.includes(style)).length
    const totalStyles = Math.max(sourceStyles.length, targetStyles.length)
    return Math.round((matchCount / totalStyles) * 100)
}

// 计算材质匹配度
const calculateMaterialSimilarity = () => {
    const sourceMaterials = props.similarImage.materials || []
    const targetMaterials = props.currentSearchImage?.materials || ['棉']

    if (!sourceMaterials.length || !targetMaterials.length) return props.similarImage.similarity * 0.75

    const matchCount = sourceMaterials.filter(material => targetMaterials.includes(material)).length
    const totalMaterials = Math.max(sourceMaterials.length, targetMaterials.length)
    return Math.round((matchCount / totalMaterials) * 100)
}
</script>

<style scoped>
.similarity-radar-chart {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.radar-container {
    width: 100%;
    height: 300px;
    max-width: 320px;
    margin: 0 auto;
    padding: 20px;
}
</style>