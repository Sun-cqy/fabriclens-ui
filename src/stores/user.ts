import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '../services/api'

// 检查是否使用模拟数据
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export interface User {
    id: string | number;
    username: string;
    avatar?: string;
    email?: string;
}

export interface FavoriteItem {
    id: string | number;
    imageUrl: string;
    name: string;
    addedAt: Date;
    description?: string;
    colors?: string[];
    styles?: string[];
    materials?: string[];
    patterns?: string[];
    colorPercentages?: number[];
}

export const useUserStore = defineStore('user', () => {
    // 状态
    const userInfo = ref<User | null>(null)
    const favorites = ref<FavoriteItem[]>([])
    const token = ref<string | null>(null)
    const isLoggedIn = computed(() => {
        const result = userInfo.value !== null && token.value !== null;
        console.log(`[Computed isLoggedIn] Status: ${result}, userInfo exists: ${!!userInfo.value}, token exists: ${!!token.value}`);
        return result;
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Actions
    async function login(email: string, password: string) {
        loading.value = true
        error.value = null
        try {
            console.log(`[Login Action] Attempting login for email: ${email}`);
            const response = await userService.login(email, password)
            console.log('[Login Action] API response received:', response);
            if (response.code === 200 && response.data && response.data.token && response.data.user) {
                console.log('[Login Action] Login API success. Updating store state...');
                token.value = response.data.token
                userInfo.value = response.data.user
                console.log(`[Login Action] State updated: token set=${!!token.value}, userInfo set=${!!userInfo.value}, username=${userInfo.value?.username}`);

                if (token.value) {
                    localStorage.setItem('fabricLens_token', token.value)
                    console.log('[Login Action] Token saved to localStorage.');
                }
                if (userInfo.value) {
                    localStorage.setItem('fabricLens_userInfo', JSON.stringify(userInfo.value))
                    console.log('[Login Action] UserInfo saved to localStorage.');
                }

                await syncFavoritesFromApi()
            } else {
                console.error('[Login Action] Login API failed or returned invalid data.', response);
                throw new Error(response.message || '登录失败或数据无效')
            }
        } catch (error: any) {
            console.error('[Login Action] Error during login:', error);
            error.value = error.message || '登录时发生未知错误'
            token.value = null
            userInfo.value = null
            localStorage.removeItem('fabricLens_token')
            localStorage.removeItem('fabricLens_userInfo')
            throw error;
        } finally {
            loading.value = false
            console.log('[Login Action] Finished.');
        }
    }

    // 注册新用户
    function register(username: string, password: string, email: string) {
        return new Promise<void>((resolve, reject) => {
            userService.register(username, password, email)
                .then((response: any) => {
                    if (response.code === 200) {
                        userInfo.value = response.data.user
                        token.value = response.data.token
                        if (userInfo.value) {
                            localStorage.setItem('fabricLens_userInfo', JSON.stringify(userInfo.value))
                        }
                        if (token.value) {
                            localStorage.setItem('fabricLens_token', token.value)
                        }
                        syncFavoritesFromApi().then(() => resolve())
                    } else {
                        reject(new Error(response.message || '注册失败'))
                    }
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }

    function logout() {
        console.log('[Logout Action] Logging out user...');
        userInfo.value = null
        token.value = null
        favorites.value = []
        localStorage.removeItem('fabricLens_userInfo')
        localStorage.removeItem('fabricLens_token')
        localStorage.removeItem('fabricLens_favorites')
        console.log('[Logout Action] User logged out and state cleared.');
    }

    function loadFavorites() {
        // 从本地存储加载收藏
        const storedFavorites = localStorage.getItem('fabricLens_favorites')
        if (storedFavorites) {
            favorites.value = JSON.parse(storedFavorites)
        }
    }

    function addToFavorites(item: FavoriteItem) {
        // 检查是否已存在
        const exists = favorites.value.some(fav => fav.id === item.id)
        if (!exists) {
            favorites.value.push({
                ...item,
                addedAt: new Date()
            })
            // 保存到本地存储
            localStorage.setItem('fabricLens_favorites', JSON.stringify(favorites.value))
        }
    }

    function removeFromFavorites(id: string | number) {
        favorites.value = favorites.value.filter(item => item.id !== id)
        // 保存到本地存储
        localStorage.setItem('fabricLens_favorites', JSON.stringify(favorites.value))
    }

    // 更新用户信息（同步方法）
    function updateUser(updatedUser: User) {
        try {
            userInfo.value = updatedUser
            // 保存到本地存储
            localStorage.setItem('fabricLens_userInfo', JSON.stringify(userInfo.value))
            console.log('更新用户信息成功:', updatedUser.username)
            return true
        } catch (error) {
            console.error('更新用户信息失败:', error)
            return false
        }
    }

    // 更新用户信息到数据库（异步方法）
    function updateUserInfo(updatedUser: User) {
        return new Promise<boolean>((resolve, reject) => {
            try {
                // 先更新本地存储
                userInfo.value = updatedUser
                localStorage.setItem('fabricLens_userInfo', JSON.stringify(userInfo.value))

                // 禁用模拟数据模式
                const useMockData = false;

                if (useMockData) {
                    // 模拟数据模式下，只更新本地存储
                    console.log('模拟数据模式：模拟将用户信息更新到后端')
                    setTimeout(() => {
                        resolve(true)
                    }, 300)
                    return
                }

                // 实际环境中，调用API更新用户信息到后端
                console.log('将用户信息更新到后端...', {
                    username: updatedUser.username,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar ? '包含头像数据' : '无'
                })

                // 直接使用axios发送请求，跳过api模块
                import('axios').then((axiosModule) => {
                    const axios = axiosModule.default;

                    // 直接访问后端API
                    axios.post('http://localhost:8080/user/update', {
                        username: updatedUser.username,
                        email: updatedUser.email,
                        avatar: updatedUser.avatar
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token.value}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000 // 增加超时时间
                    })
                        .then((response) => {
                            console.log('用户信息更新成功:', response.data)

                            // 如果服务器返回了更新后的用户信息，使用服务器的数据更新本地
                            if (response.data && response.data.code === 200 && response.data.data && response.data.data.user) {
                                userInfo.value = response.data.data.user
                                localStorage.setItem('fabricLens_userInfo', JSON.stringify(userInfo.value))
                            }

                            resolve(true)
                        })
                        .catch((error) => {
                            console.error('更新用户信息到后端失败:', error)
                            // 尽管API调用失败，仍然解析为true，因为本地存储已更新
                            resolve(true)
                        })
                }).catch(error => {
                    console.error('导入Axios模块失败:', error)
                    resolve(false)
                })
            } catch (error) {
                console.error('更新用户信息失败:', error)
                reject(error)
            }
        })
    }

    // 获取认证头
    function getAuthHeader() {
        return token.value ? { Authorization: `Bearer ${token.value}` } : {}
    }

    // 添加后端API收藏功能
    async function addFavoriteWithApi(id: string | number) {
        try {
            // 添加到本地状态
            addToFavorites({
                id,
                name: `图片 ${id}`,
                imageUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/images/${id}`,
                addedAt: new Date()
            })

            // 禁用模拟数据模式下不调用API
            if (USE_MOCK_DATA) {
                console.log('模拟数据模式：模拟添加收藏到后端', id)
                return true
            }

            // 调用后端API
            const response = await userService.addFavorite(id)
            console.log('添加收藏API响应:', response)
            return true
        } catch (error) {
            console.error('添加收藏失败:', error)
            // 失败时保持本地添加的状态，避免用户困惑
            return false
        }
    }

    async function removeFavoriteWithApi(id: string | number) {
        try {
            // 先从本地状态移除
            removeFromFavorites(id)

            // 禁用模拟数据模式下不调用API
            if (USE_MOCK_DATA) {
                console.log('模拟数据模式：模拟从后端移除收藏', id)
                return true
            }

            // 调用后端API
            const response = await userService.removeFavorite(id)
            console.log('移除收藏API响应:', response)
            return true
        } catch (error) {
            console.error('移除收藏失败:', error)
            // 失败后恢复本地状态，但这可能导致UI不一致
            // 考虑添加重试逻辑或将失败的操作加入队列
            return false
        }
    }

    // 从后端获取收藏列表并同步到本地
    async function syncFavoritesFromApi() {
        try {
            // 禁用模拟数据模式下不调用API
            if (USE_MOCK_DATA) {
                console.log('模拟数据模式：模拟从后端获取收藏列表')
                return
            }

            // 调用后端API
            const response = await userService.getFavorites()
            console.log('获取收藏列表API响应:', response)

            if (response && response.code === 200 && response.data && Array.isArray(response.data.favorites)) {
                // 将后端数据映射为本地格式
                const apiFavorites = response.data.favorites.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    imageUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/images/${item.id}`,
                    addedAt: new Date(item.added_at)
                }))

                // 更新本地收藏列表
                favorites.value = apiFavorites

                // 保存到本地存储
                localStorage.setItem('fabricLens_favorites', JSON.stringify(favorites.value))
            }
        } catch (error) {
            console.error('同步收藏列表失败:', error)
        }
    }

    // 修改initUser函数，添加获取收藏列表
    function initUser() {
        console.log('[InitUser Action] Starting initialization...');
        const storedUser = localStorage.getItem('fabricLens_userInfo')
        const storedToken = localStorage.getItem('fabricLens_token')
        console.log(`[InitUser Action] localStorage values: storedUser exists=${!!storedUser}, storedToken exists=${!!storedToken}`);

        return new Promise<void>((resolve) => {
            if (storedUser && storedToken) {
                console.log('[InitUser Action] Found stored session. Attempting to restore...');
                try {
                    userInfo.value = JSON.parse(storedUser);
                    token.value = storedToken;
                    console.log(`[InitUser Action] Restored state temporarily: username=${userInfo.value?.username}, token set=${!!token.value}`);
                    loadFavorites();
                } catch (e) {
                    console.error('[InitUser Action] Error parsing stored user info:', e);
                    logout(); // Parsing error, clear state
                    resolve();
                    return;
                }

                console.log('[InitUser Action] Validating token with API...');
                userService.getUserInfo()
                    .then((response: any) => {
                        console.log('[InitUser Action] Token validation API response:', response);
                        if (response.code === 200 && response.data && response.data.user) {
                            console.log('[InitUser Action] Token validation success. Updating user info from API.');
                            userInfo.value = response.data.user;
                            if (userInfo.value) { // Ensure userInfo is updated before saving
                                localStorage.setItem('fabricLens_userInfo', JSON.stringify(userInfo.value));
                                console.log('[InitUser Action] Updated userInfo saved to localStorage.');
                            }
                            syncFavoritesFromApi().then(() => resolve());
                        } else {
                            console.warn('[InitUser Action] Token validation failed or invalid response. Logging out.', response);
                            logout();
                            resolve();
                        }
                    })
                    .catch((err) => {
                        console.error('[InitUser Action] Error validating token with API. Logging out.', err);
                        logout();
                        resolve();
                    });
            } else {
                console.log('[InitUser Action] No stored session found. Initialization complete (User not logged in).');
                resolve();
            }
        });
    }

    return {
        userInfo,
        token,
        favorites,
        isLoggedIn,
        loading,
        error,
        login,
        register,
        logout,
        loadFavorites,
        addToFavorites,
        removeFromFavorites,
        updateUser,
        updateUserInfo,
        getAuthHeader,
        addFavoriteWithApi,
        removeFavoriteWithApi,
        syncFavoritesFromApi,
        initUser
    }
}) 