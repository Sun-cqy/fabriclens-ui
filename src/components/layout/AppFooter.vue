<template>
    <div class="footer">
        <p>© {{ new Date().getFullYear() }} FabricLens——>基于深度学习的家纺图像相似性搜索项目</p>
    </div>
</template>

<script setup lang="ts">
// 这是一个简单的页脚组件，可根据需要扩展
</script>

<style scoped>
.footer {
    background-color: #001529;
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    padding: 16px;
    margin-top: auto;
    font-size: 14px;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
}
</style>