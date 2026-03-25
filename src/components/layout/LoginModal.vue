<template>
  <a-modal v-model:visible="visible" :title="modalTitle" :footer="null" @cancel="handleCancel">
    <!-- 登录表单 -->
    <a-form v-if="mode === 'login'" :model="loginForm" layout="vertical">
      <a-form-item label="邮箱" name="email">
        <a-input v-model:value="loginForm.email" placeholder="请输入注册邮箱" />
      </a-form-item>

      <a-form-item label="密码" name="password">
        <a-input-password v-model:value="loginForm.password" placeholder="请输入密码" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" block @click="handleLogin" :loading="loading">
          {{ $t('common.login') }}
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <span>{{ $t('userCenter.login.noAccount') }}</span>
        <a @click="mode = 'register'">{{ $t('userCenter.login.clickToRegister') }}</a>
      </div>
    </a-form>

    <!-- 注册表单 -->
    <a-form v-else :model="registerForm" layout="vertical">
      <a-form-item label="用户名" name="username">
        <a-input v-model:value="registerForm.username" placeholder="请设置用户名" @change="validateUsername" />
      </a-form-item>

      <a-form-item label="邮箱" name="email" :help="emailHelp" :validate-status="emailStatus">
        <a-input v-model:value="registerForm.email" placeholder="请输入邮箱" @change="validateEmail" />
      </a-form-item>

      <a-form-item label="密码" name="password">
        <a-input-password v-model:value="registerForm.password" placeholder="请设置密码" @change="validatePassword" />
      </a-form-item>

      <a-form-item label="确认密码" name="confirmPassword" :help="confirmPasswordHelp"
        :validate-status="confirmPasswordStatus">
        <a-input-password v-model:value="registerForm.confirmPassword" placeholder="请确认密码"
          @change="validateConfirmPassword" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" block @click="handleRegister" :loading="loading" :disabled="!isFormValid">
          {{ $t('common.register') }}
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <span>已有账号？</span>
        <a @click="mode = 'login'">直接登录</a>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '../../stores/user'
import { userService } from '../../services/api'

// 组件属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// 事件
const emit = defineEmits(['update:modelValue', 'login-success', 'register-success'])

const userStore = useUserStore()

// 模态框可见状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 模式：登录或注册
const mode = ref('login')

// 加载状态
const loading = ref(false)

// 表单数据
const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证状态
const emailStatus = ref<'' | 'success' | 'warning' | 'error' | 'validating'>('')
const emailHelp = ref('')
const confirmPasswordStatus = ref<'' | 'success' | 'warning' | 'error'>('')
const confirmPasswordHelp = ref('')
const isFormValid = ref(false)

// 防抖函数
const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout | null = null
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(null, args)
    }, delay)
  }
}

// 验证邮箱
const validateEmail = debounce(async () => {
  const email = registerForm.value.email
  if (!email) {
    emailStatus.value = 'error'
    emailHelp.value = '请输入邮箱'
    return
  }

  // 验证邮箱格式
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    emailStatus.value = 'error'
    emailHelp.value = '请输入有效的邮箱格式'
    return
  }

  // 先设置成功状态，即使是CORS错误也允许用户继续
  emailStatus.value = 'success'
  emailHelp.value = ''

  // 验证邮箱是否已注册
  try {
    const response = await userService.checkEmail(email)
    // 只有当确实存在时才设置错误
    if (response.data && response.data.exists) {
      emailStatus.value = 'error'
      emailHelp.value = '该邮箱已被注册'
    }
  } catch (error) {
    console.error('验证邮箱失败:', error)
    // CORS错误不阻止用户继续注册
  }
}, 500)

// 验证用户名
const validateUsername = () => {
  const username = registerForm.value.username
  if (!username) {
    return false
  }
  if (username.length < 3 || username.length > 20) {
    return false
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return false
  }
  return true
}

// 验证密码
const validatePassword = () => {
  const password = registerForm.value.password
  if (!password) {
    return false
  }
  if (password.length < 6 || password.length > 20) {
    return false
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
    return false
  }
  validateConfirmPassword()
  return true
}

// 验证确认密码
const validateConfirmPassword = () => {
  const password = registerForm.value.password
  const confirmPassword = registerForm.value.confirmPassword

  if (!confirmPassword) {
    confirmPasswordStatus.value = 'error'
    confirmPasswordHelp.value = '请确认密码'
    return false
  }

  if (password !== confirmPassword) {
    confirmPasswordStatus.value = 'error'
    confirmPasswordHelp.value = '两次输入的密码不一致'
    return false
  }

  confirmPasswordStatus.value = 'success'
  confirmPasswordHelp.value = ''
  return true
}

// 验证整个表单
const validateForm = () => {
  isFormValid.value = validateUsername() &&
    emailStatus.value === 'success' &&
    validatePassword() &&
    validateConfirmPassword()
}

// 监听表单变化
watch([
  () => registerForm.value.username,
  () => registerForm.value.password,
  () => registerForm.value.confirmPassword
], () => {
  validateForm()
})

watch(() => registerForm.value.email, validateEmail)

// 模态框标题
const modalTitle = computed(() => {
  return mode.value === 'login' ? '用户登录' : '用户注册'
})

// 监听模式变化，重置表单
watch(mode, () => {
  loading.value = false
  loginForm.value = { email: '', password: '' }
  registerForm.value = { username: '', email: '', password: '', confirmPassword: '' }
})

// 取消操作
const handleCancel = () => {
  visible.value = false
  mode.value = 'login' // 重置为登录模式
}

// 登录操作
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    return message.warning('请输入邮箱和密码')
  }

  // 简单的邮箱格式前端验证 (可选，后端已有)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(loginForm.value.email)) {
    return message.warning('请输入有效的邮箱格式')
  }

  loading.value = true

  try {
    await userStore.login(loginForm.value.email, loginForm.value.password)
    message.success('登录成功')
    emit('login-success')
    visible.value = false

    // 确保刷新用户信息
    try {
      await userStore.syncFavoritesFromApi()
    } catch (error) {
      console.error('同步收藏夹失败:', error)
    }
  } catch (error) {
    message.error('登录失败，请检查邮箱和密码')
  } finally {
    loading.value = false
  }
}

// 注册操作
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.value.username) {
    return message.warning('请输入用户名')
  }

  if (registerForm.value.username.length < 3 || registerForm.value.username.length > 20) {
    return message.warning('用户名长度必须在3到20个字符之间')
  }

  // 用户名只能包含字母、数字和下划线
  if (!/^[a-zA-Z0-9_]+$/.test(registerForm.value.username)) {
    return message.warning('用户名只能包含字母、数字和下划线')
  }

  if (!registerForm.value.email) {
    return message.warning('请输入邮箱')
  }

  // 更严格的邮箱格式验证
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(registerForm.value.email)) {
    return message.warning('请输入有效的邮箱格式')
  }

  if (!registerForm.value.password) {
    return message.warning('请设置密码')
  }

  if (registerForm.value.password.length < 6 || registerForm.value.password.length > 20) {
    return message.warning('密码长度必须在6到20个字符之间')
  }

  // 密码复杂度验证：必须包含字母和数字
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(registerForm.value.password)) {
    return message.warning('密码必须包含字母和数字')
  }

  if (!registerForm.value.confirmPassword) {
    return message.warning('请确认密码')
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    return message.warning('两次输入的密码不一致')
  }

  loading.value = true
  console.log('开始注册，表单数据:', {
    username: registerForm.value.username,
    email: registerForm.value.email,
    password: '***' // 不记录密码内容
  })

  try {
    // 调用store的注册方法
    await userStore.register(
      registerForm.value.username,
      registerForm.value.password,
      registerForm.value.email
    )

    message.success('注册成功')
    console.log('注册成功')
    emit('register-success')

    // 自动关闭模态框，触发登录成功回调
    visible.value = false
    emit('login-success')

    // 确保刷新用户信息
    try {
      await userStore.syncFavoritesFromApi()
    } catch (error) {
      console.error('同步收藏夹失败:', error)
    }
  } catch (error: any) {
    const errorMsg = error.message || '未知错误'
    message.error(`注册失败: ${errorMsg}`)
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-footer {
  text-align: center;
  margin-top: 16px;
}

.form-footer a {
  margin-left: 8px;
  color: #1890ff;
}
</style>