<template>
    <div class="image-uploader">
        <div class="sample-images" v-if="showSamples">
            <div class="sample-image" v-for="(sample, index) in sampleImages" :key="index">
                <img :src="sample.url" @click="selectSample(sample)" />
            </div>
        </div>

        <a-upload v-model:file-list="fileList" name="file" list-type="picture-card" class="uploader"
            :show-upload-list="false" :before-upload="beforeUpload" @change="handleChange"
            :customRequest="customRequest">
            <div v-if="!imageUrl" class="upload-area">
                <div class="upload-hint">
                    <upload-outlined />
                    <p>{{ $t('home.uploadHint') }}</p>
                </div>
            </div>
            <div v-else class="upload-preview" @click="uploadAgain">
                <img :src="imageUrl" alt="上传图片" class="preview-image" />
                <div class="preview-overlay">
                    <reload-outlined class="reload-icon" />
                    <p>重新上传</p>
                </div>
            </div>
        </a-upload>

        <div class="upload-options" v-if="imageUrl">
            <a-checkbox v-model:checked="addToDatabase">将此图片添加到家纺图像数据库</a-checkbox>
            <a-tooltip title="添加到数据库后，此图片将成为系统搜索和匹配的样本" placement="right">
                <question-circle-outlined class="help-icon" />
            </a-tooltip>

            <!-- 新增topK滑块 -->
            <div class="top-k-slider">
                <div class="slider-label">
                    返回结果数量: {{ topK }}
                    <a-tooltip title="调整显示的相似图片数量，更大的值可能包含相关性较低的结果" placement="right">
                        <question-circle-outlined class="help-icon" />
                    </a-tooltip>
                </div>
                <a-slider v-model:value="topK" :min="5" :max="50" :step="5" />
            </div>
        </div>

        <div class="upload-actions">
            <a-button type="primary" @click="startSearch" :disabled="!hasImage" size="large" block>
                <search-outlined />
                {{ $t('home.uploadButton') }}
            </a-button>

            <div class="url-input-container">
                <link-outlined class="url-icon" />
                <a-input :placeholder="$t('home.urlPlaceholder')" v-model:value="imageUrlInput"
                    @pressEnter="uploadByUrl" class="url-input" allow-clear size="large">
                    <template #suffix>
                        <enter-outlined class="enter-icon" title="按回车键确认" />
                    </template>
                </a-input>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { message, UploadChangeParam, UploadProps, Upload } from 'ant-design-vue'
import {
    UploadOutlined,
    SearchOutlined,
    ReloadOutlined,
    LinkOutlined,
    EnterOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons-vue'
import { preprocessImage } from '../../utils/imageProcessing'
import { imageService } from '../../services/api'
import { useSearchStore, type SearchImage } from '../../stores/search'

// 添加搜索store
const searchStore = useSearchStore()

// 组件属性
const { sampleImages = [], showSamples = true } = defineProps({
    sampleImages: {
        type: Array as () => SearchImage[],
        default: () => []
    },
    showSamples: {
        type: Boolean,
        default: true
    }
})

// 事件
const emit = defineEmits(['search', 'sample-selected'])

// 上传图片相关
const fileList = ref<any[]>([])
const imageUrl = ref<string>('')
const imageUrlInput = ref('')
const selectedSample = ref<SearchImage | null>(null)
const addToDatabase = ref(false) // 是否添加到数据库

// 添加topK参数
const topK = ref(searchStore.topK)

// 监听topK变化，同步到store
watch(topK, (newValue) => {
    searchStore.updateTopK(newValue)
})

// 计算是否有图像可上传
const hasImage = computed(() => {
    return !!imageUrl.value || !!selectedSample.value
})

// 选择样例图片
const selectSample = (sample: SearchImage) => {
    selectedSample.value = sample
    imageUrl.value = sample.url
    message.success('已选择样例图片')
    emit('sample-selected', sample)
}

// 上传前处理
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
        message.error('只能上传图片文件!')
    }

    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        message.error('图片必须小于2MB!')
    }

    return isImage && isLt2M ? true : Upload.LIST_IGNORE
}

// 处理上传变化
const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
        return
    }

    if (info.file.status === 'done') {
        // 获取并显示预览
        getBase64(info.file.originFileObj as File, (url: string) => {
            imageUrl.value = url
            selectedSample.value = null
            fileList.value = [info.file] // 确保fileList包含当前文件
        })
    } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
    }
}

// 通过URL上传图片
const uploadByUrl = () => {
    if (!imageUrlInput.value) {
        return message.warning('请输入图片URL')
    }

    // 验证URL是否是图片
    const img = new window.Image()
    img.onload = () => {
        imageUrl.value = imageUrlInput.value
        selectedSample.value = null
        message.success('图片URL加载成功')
    }
    img.onerror = () => {
        message.error('无效的图片URL')
    }
    img.src = imageUrlInput.value
}

// 开始搜索
const startSearch = async () => {
    if (!hasImage.value) {
        return message.warning('请先上传或选择图片')
    }

    // 在调用emit前确保topK设置正确
    searchStore.updateTopK(topK.value)

    let searchImage: SearchImage

    if (selectedSample.value) {
        searchImage = selectedSample.value
    } else {
        // 如果是本地上传的图片，需要处理文件
        const file = fileList.value[0]?.originFileObj
        if (file) {
            try {
                const processedImageUrl = await preprocessImage(file)
                // 先创建基础的搜索图像对象
                searchImage = {
                    id: Date.now(),
                    name: file.name.split('.')[0] || '未命名图片',
                    url: processedImageUrl,
                    colors: [],
                    styles: [],
                    materials: [],
                    patterns: [],
                    colorPercentages: []
                }

                // 发送图片到服务器进行分析
                try {
                    const analysisResult = await imageService.analyzeImage(processedImageUrl)
                    // 用分析结果更新搜索图像对象
                    searchImage = {
                        ...searchImage,
                        colors: analysisResult.colors || [],
                        styles: analysisResult.styles || [],
                        materials: analysisResult.materials || [],
                        patterns: analysisResult.patterns || [],
                        colorPercentages: analysisResult.colorPercentages || []
                    }

                    // 如果用户选择添加到数据库
                    if (addToDatabase.value && file) {
                        try {
                            await imageService.addToDatabase(file, {
                                name: file.name.split('.')[0] || '未命名图片',
                                colors: searchImage.colors,
                                styles: searchImage.styles,
                                materials: searchImage.materials,
                                patterns: searchImage.patterns
                            });
                            message.success('图片已成功添加到数据库');
                        } catch (error) {
                            message.error('添加图片到数据库失败，但不影响当前搜索')
                        }
                    }
                } catch (error) {
                    message.warning('图片特征分析未完成，可能影响搜索结果的准确性')
                }
            } catch (error) {
                return message.error('图片处理失败')
            }
        } else {
            // 使用URL输入的图片
            searchImage = {
                id: Date.now(),
                name: '从URL上传的图片',
                url: imageUrl.value,
                colors: [],
                styles: [],
                materials: [],
                patterns: [],
                colorPercentages: []
            }

            // 发送图片URL到服务器进行分析
            try {
                const analysisResult = await imageService.analyzeImage(imageUrl.value)
                // 用分析结果更新搜索图像对象
                searchImage = {
                    ...searchImage,
                    colors: analysisResult.colors || [],
                    styles: analysisResult.styles || [],
                    materials: analysisResult.materials || [],
                    patterns: analysisResult.patterns || [],
                    colorPercentages: analysisResult.colorPercentages || []
                }

                // 对于URL图片，如果需要添加到数据库，需要先下载
                // 这里不实现URL图片添加到数据库功能，因为需要后端支持
                if (addToDatabase.value) {
                    message.info('URL图片暂不支持添加到数据库功能');
                }
            } catch (error) {
                message.warning('图片特征分析未完成，可能影响搜索结果的准确性')
            }
        }
    }

    // 触发搜索事件
    emit('search', searchImage)
}

// 工具函数 - 将文件转为base64
const getBase64 = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result as string))
    reader.readAsDataURL(file)
}

// 重新上传
const uploadAgain = () => {
    imageUrl.value = ''
    fileList.value = []
    selectedSample.value = null
}

// 自定义上传请求处理 - 修复：移除未使用的file参数
const customRequest = ({ onSuccess }: any) => {
    // 模拟成功上传
    setTimeout(() => {
        onSuccess('ok', new XMLHttpRequest())
    }, 100)
}
</script>

<style scoped>
.image-uploader {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 15px;
    background-color: #fafafa;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.sample-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    width: 100%;
    padding: 5px;
    overflow-x: auto;
}

.sample-image {
    cursor: pointer;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.3s;
    height: 80px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.sample-image:hover {
    border-color: #1890ff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sample-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.uploader {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 500px;
}

.uploader :deep(.ant-upload.ant-upload-select-picture-card) {
    width: 100%;
    height: 150px;
    margin: 0;
    background-color: white;
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    transition: all 0.3s;
}

.uploader :deep(.ant-upload.ant-upload-select-picture-card:hover) {
    border-color: #1890ff;
    background-color: rgba(24, 144, 255, 0.04);
}

.upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

.upload-hint {
    text-align: center;
    color: #666;
}

.upload-hint :deep(.anticon) {
    font-size: 28px;
    margin-bottom: 8px;
    color: #1890ff;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 6px;
}

.upload-options {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 500px;
    margin-top: -5px;
    margin-bottom: 5px;
    padding: 0 5px;
}

/* 添加top-k滑块样式 */
.top-k-slider {
    margin-top: 16px;
    padding: 10px 0;
    border-top: 1px dashed #e8e8e8;
}

.slider-label {
    margin-bottom: 8px;
    color: #666;
    display: flex;
    align-items: center;
}

.help-icon {
    margin-left: 6px;
    color: #1890ff;
    font-size: 14px;
    cursor: pointer;
}

.help-icon:hover {
    color: #40a9ff;
}

.upload-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 500px;
}

.upload-actions :deep(.ant-btn-primary) {
    height: 44px;
    font-size: 15px;
    border-radius: 6px;
}

.url-input-container {
    position: relative;
    display: flex;
    width: 100%;
}

.url-icon {
    position: absolute;
    left: 12px;
    top: 14px;
    color: #bfbfbf;
    z-index: 1;
    font-size: 16px;
}

.url-input {
    width: 100%;
    padding-left: 40px;
}

.enter-icon {
    color: #bfbfbf;
    font-size: 16px;
    cursor: help;
}

.upload-preview {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    overflow: hidden;
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    color: white;
}

.upload-preview:hover .preview-overlay {
    opacity: 1;
}

.reload-icon {
    font-size: 24px;
    margin-bottom: 8px;
}

@media (max-width: 768px) {
    .sample-images {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
}

@media (max-width: 576px) {
    .sample-images {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }

    .sample-image {
        height: 60px;
    }

    .upload-actions {
        width: 100%;
    }

    .uploader :deep(.ant-upload.ant-upload-select-picture-card) {
        height: 120px;
    }
}
</style>