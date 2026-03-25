import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { imageService } from '../services/api'

export interface SearchImage {
    id: string | number;
    name: string;
    url: string;
    preview?: string;
    colors: string[];
    styles: string[];
    materials: string[];
    patterns: string[];
    colorSimilarity?: number;
    patternSimilarity?: number;
    colorPercentages: number[];
}

export interface SearchResult extends SearchImage {
    similarity: number;
    colorSimilarity: number;
    patternSimilarity: number;
    styleSimilarity: number;
    materialSimilarity: number;
    textileTypes: string[];
    isFavorite: boolean;
    tags: string[];
}

export interface HistoryItem {
    id: number;
    image: SearchImage;
    timestamp: Date;
}

export interface SearchFilters {
    colors: string[];
    styles: string[];
    materials: string[];
    patterns: string[];
    favorite: boolean;
    similarityThreshold?: number;
    sortBy?: string;
}

export const useSearchStore = defineStore('search', () => {
    // 状态
    const searchHistory = ref<HistoryItem[]>([])
    const currentSearchImage = ref<SearchImage | null>(null)
    const searchResults = ref<SearchResult[]>([])
    const similarityThreshold = ref(70)
    const filters = ref<SearchFilters>({
        colors: [],
        styles: [],
        materials: [],
        patterns: [],
        favorite: false
    })
    const loading = ref(false)
    const error = ref<string | null>(null)
    // 添加topK状态
    const topK = ref(10)

    // 初始化函数：从localStorage恢复状态
    function initializeState() {
        try {
            // 恢复搜索历史
            const savedHistory = localStorage.getItem('fabricLens_history')
            if (savedHistory) {
                searchHistory.value = JSON.parse(savedHistory)
            }

            // 恢复当前搜索图片
            const savedSearchImage = localStorage.getItem('fabricLens_currentImage')
            if (savedSearchImage) {
                currentSearchImage.value = JSON.parse(savedSearchImage)
            }

            // 恢复搜索结果
            const savedResults = localStorage.getItem('fabricLens_searchResults')
            if (savedResults) {
                searchResults.value = JSON.parse(savedResults)
            }

            // 恢复筛选器设置
            const savedFilters = localStorage.getItem('fabricLens_filters')
            if (savedFilters) {
                filters.value = JSON.parse(savedFilters)
            }

            // 恢复相似度阈值
            const savedThreshold = localStorage.getItem('fabricLens_threshold')
            if (savedThreshold) {
                similarityThreshold.value = JSON.parse(savedThreshold)
            }
        } catch (error) {
            console.error('恢复搜索状态失败:', error)
            // 出错时清除所有状态
            clearState()
        }
    }

    // 清除状态函数
    function clearState() {
        localStorage.removeItem('fabricLens_history')
        localStorage.removeItem('fabricLens_currentImage')
        localStorage.removeItem('fabricLens_searchResults')
        localStorage.removeItem('fabricLens_filters')
        localStorage.removeItem('fabricLens_threshold')

        searchHistory.value = []
        currentSearchImage.value = null
        searchResults.value = []
        filters.value = {
            colors: [],
            styles: [],
            materials: [],
            patterns: [],
            favorite: false
        }
        similarityThreshold.value = 70
    }

    // 保存状态函数
    function saveState() {
        try {
            localStorage.setItem('fabricLens_history', JSON.stringify(searchHistory.value))
            localStorage.setItem('fabricLens_currentImage', JSON.stringify(currentSearchImage.value))
            localStorage.setItem('fabricLens_searchResults', JSON.stringify(searchResults.value))
            localStorage.setItem('fabricLens_filters', JSON.stringify(filters.value))
            localStorage.setItem('fabricLens_threshold', JSON.stringify(similarityThreshold.value))
        } catch (error) {
            console.error('保存搜索状态失败:', error)
        }
    }

    // Getters
    const filteredResults = computed(() => {
        return searchResults.value.filter(item =>
            item.similarity >= similarityThreshold.value &&
            (filters.value.colors.length === 0 || filters.value.colors.some(c => item.colors.includes(c))) &&
            (filters.value.styles.length === 0 || filters.value.styles.some(s => item.styles.includes(s))) &&
            (filters.value.materials.length === 0 || filters.value.materials.some(m => item.materials.includes(m))) &&
            (filters.value.patterns.length === 0 || filters.value.patterns.some(p => item.patterns.includes(p))) &&
            (!filters.value.favorite || item.isFavorite)
        )
    })

    // Actions
    function searchByImage(image: SearchImage) {
        loading.value = true
        error.value = null
        currentSearchImage.value = image

        // 使用实际API服务，传递topK参数
        imageService.searchSimilar(image, topK.value)
            .then(data => {
                searchResults.value = data
                addToHistory(image)
                // 保存状态
                saveState()
            })
            .catch(err => {
                error.value = err.message || '搜索失败，请稍后重试'
            })
            .finally(() => {
                loading.value = false
            })
    }

    function addToHistory(image: SearchImage) {
        const historyItem: HistoryItem = {
            id: Date.now(),
            image,
            timestamp: new Date()
        }

        searchHistory.value.unshift(historyItem)

        // 只保留最近10条记录
        if (searchHistory.value.length > 10) {
            searchHistory.value.pop()
        }

        // 保存到本地存储
        localStorage.setItem('fabricLens_history', JSON.stringify(searchHistory.value))
    }

    function updateFilters(newFilters: Partial<SearchFilters>) {
        filters.value = {
            ...filters.value,
            ...newFilters
        }
        saveState()
    }

    function updateSimilarityThreshold(value: number) {
        similarityThreshold.value = value
        saveState()
    }

    // 添加更新topK的方法
    function updateTopK(value: number) {
        topK.value = value
    }

    function updateFavoriteStatus(id: string | number, isFavorite: boolean) {
        const item = searchResults.value.find(item => item.id === id)
        if (item) {
            item.isFavorite = isFavorite
        }
    }

    // 初始化状态
    initializeState()

    return {
        // 状态
        searchHistory,
        currentSearchImage,
        searchResults,
        similarityThreshold,
        filters,
        loading,
        error,
        topK,

        // Getters
        filteredResults,

        // Actions
        searchByImage,
        addToHistory,
        updateFilters,
        updateSimilarityThreshold,
        updateFavoriteStatus,
        updateTopK,
        clearState,
        saveState
    }
})