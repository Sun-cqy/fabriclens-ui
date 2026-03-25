<template>
    <div class="view-switcher">
        <a-button-group>
            <a-tooltip :title="$t('searchResults.gridView')">
                <a-button :type="viewType === 'grid' ? 'primary' : 'default'" @click="setViewType('grid')">
                    <template #icon>
                        <AppstoreOutlined />
                    </template>
                </a-button>
            </a-tooltip>
            <a-tooltip :title="$t('searchResults.listView')">
                <a-button :type="viewType === 'list' ? 'primary' : 'default'" @click="setViewType('list')">
                    <template #icon>
                        <UnorderedListOutlined />
                    </template>
                </a-button>
            </a-tooltip>
            <a-tooltip :title="$t('searchResults.detailView')">
                <a-button :type="viewType === 'detail' ? 'primary' : 'default'" @click="setViewType('detail')">
                    <template #icon>
                        <BarsOutlined />
                    </template>
                </a-button>
            </a-tooltip>
        </a-button-group>
    </div>
</template>

<script lang="ts" setup>
import { defineEmits } from 'vue'
import { AppstoreOutlined, UnorderedListOutlined, BarsOutlined } from '@ant-design/icons-vue'

// 定义视图类型
export type ViewType = 'grid' | 'list' | 'detail'

// 组件属性
defineProps({
    viewType: {
        type: String as () => ViewType,
        default: 'grid'
    }
})

// 事件
const emit = defineEmits(['update:viewType'])

const setViewType = (type: ViewType) => {
    emit('update:viewType', type)
}
</script>

<style scoped>
.view-switcher {
    display: flex;
    gap: 8px;
    /* 移除margin: auto以防止自动居中 */
}

.switch-btn {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    color: #666;
    opacity: 0.6;
    transition: all 0.2s;
}

.switch-btn.active {
    color: #1890ff;
    background-color: #e6f7ff;
    opacity: 1;
}

.switch-btn:hover {
    opacity: 1;
    background-color: #f0f0f0;
}
</style>