import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SearchImage, SearchResult } from './search'
import { imageService } from '../services/api'

export interface ImageAnalysisResult {
    colors: string[];
    styles: string[];
    materials: string[];
    patterns: string[];
    colorPercentages: number[];
}

export const useComparisonStore = defineStore('comparison', () => {
    // 状态
    const selectedImage = ref<SearchResult | null>(null)
    const currentSearchImage = ref<SearchImage | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const loadingSimilar = ref(false)
    const similarImages = ref<SearchResult[]>([])
    const forceRerender = ref(0)
    // 添加持久化控制标志
    const shouldPersist = ref(true)

    // 初始化函数：从localStorage恢复状态
    function initializeState() {
        try {
            // 如果之前清除过状态，则不恢复
            const wasClearedFlag = localStorage.getItem('fabricLens_comparison_cleared')
            if (wasClearedFlag === 'true') {
                shouldPersist.value = false
                return
            }

            // 恢复选中的图像
            const savedSelectedImage = localStorage.getItem('fabricLens_comparison_selected')
            if (savedSelectedImage) {
                selectedImage.value = JSON.parse(savedSelectedImage)
            }

            // 恢复当前搜索图像
            const savedSearchImage = localStorage.getItem('fabricLens_comparison_current')
            if (savedSearchImage) {
                currentSearchImage.value = JSON.parse(savedSearchImage)
            }

            // 恢复相似图像列表
            const savedSimilarImages = localStorage.getItem('fabricLens_comparison_similar')
            if (savedSimilarImages) {
                similarImages.value = JSON.parse(savedSimilarImages)
            }
        } catch (error) {
            console.error('恢复对比状态失败:', error)
            clearState()
        }
    }

    // 清除状态函数
    function clearState() {
        localStorage.removeItem('fabricLens_comparison_selected')
        localStorage.removeItem('fabricLens_comparison_current')
        localStorage.removeItem('fabricLens_comparison_similar')
        // 设置清除标志
        localStorage.setItem('fabricLens_comparison_cleared', 'true')
        // 禁用持久化
        shouldPersist.value = false

        selectedImage.value = null
        currentSearchImage.value = null
        similarImages.value = []
        isLoading.value = false
        loadingSimilar.value = false
        error.value = null
    }

    // 保存状态函数
    function saveState() {
        // 如果不应该持久化，直接返回
        if (!shouldPersist.value) {
            return
        }

        try {
            if (selectedImage.value) {
                localStorage.setItem('fabricLens_comparison_selected', JSON.stringify(selectedImage.value))
            }
            if (currentSearchImage.value) {
                localStorage.setItem('fabricLens_comparison_current', JSON.stringify(currentSearchImage.value))
            }
            if (similarImages.value.length) {
                localStorage.setItem('fabricLens_comparison_similar', JSON.stringify(similarImages.value))
            }
            // 清除清除标志
            localStorage.removeItem('fabricLens_comparison_cleared')
        } catch (error) {
            console.error('保存对比状态失败:', error)
        }
    }

    // Actions
    function setSelectedImage(image: SearchResult | null) {
        selectedImage.value = image
        saveState()
    }

    function setCurrentSearchImage(image: SearchImage | null) {
        currentSearchImage.value = image
        saveState()
    }

    function setLoading(value: boolean) {
        isLoading.value = value
    }

    function setLoadingSimilar(value: boolean) {
        loadingSimilar.value = value
    }

    function setSimilarImages(images: SearchResult[]) {
        similarImages.value = images
        saveState()
    }

    function setError(message: string | null) {
        error.value = message
    }

    function incrementForceRerender() {
        forceRerender.value += 1
    }

    // 分析图像特征
    async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult | null> {
        try {
            return await imageService.analyzeImage(imageUrl) as ImageAnalysisResult
        } catch (error) {
            console.error('分析图像失败:', error)
            return null
        }
    }

    // 初始化状态
    initializeState()

    return {
        // 状态
        selectedImage,
        currentSearchImage,
        isLoading,
        loadingSimilar,
        similarImages,
        forceRerender,
        error,

        // Actions
        setSelectedImage,
        setCurrentSearchImage,
        setLoading,
        setLoadingSimilar,
        setSimilarImages,
        setError,
        incrementForceRerender,
        analyzeImage,
        clearState
    }
}) 