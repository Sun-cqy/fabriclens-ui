import { message } from 'ant-design-vue'

/**
 * 全局错误处理器
 * 处理前端应用刷新时可能出现的HTTP 500错误
 */
export function setupErrorHandlers() {
    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise拒绝:', event.reason)

        // 检查是否为HTTP 500错误（服务器错误）
        if (event.reason && event.reason.response && event.reason.response.status === 500) {
            console.error('检测到HTTP 500错误，可能是由页面刷新导致')
            message.error('页面加载错误，正在返回主页...')

            // 延迟2秒后重定向到主页
            setTimeout(() => {
                window.location.href = '/'
            }, 2000)
        }
    })

    // 处理全局错误
    window.addEventListener('error', (event) => {
        console.error('全局错误:', event.error)

        // 检查是否为网络相关错误
        if (event.error && (
            event.error.message.includes('NetworkError') ||
            event.error.message.includes('Failed to fetch') ||
            event.error.message.includes('Network request failed')
        )) {
            console.error('检测到网络错误，可能是由API请求失败导致')
            message.error('网络请求错误，请检查您的网络连接')
        }
    })

    console.log('全局错误处理器已设置')
} 