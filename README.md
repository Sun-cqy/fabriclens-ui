# FabricLens 前端 (Vue 3 + Vite)

本项目是 FabricLens 图像相似性搜索应用的前端界面，基于 Vue 3 和 Vite 构建。

## 主要技术栈

- **框架**: [Vue 3](https://vuejs.org/) (使用SFC `<script setup>` 语法)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI组件库**: [Ant Design Vue](https://www.antdv.com/docs/vue/introduce-cn/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: [Vue Router](https://router.vuejs.org/)
- **HTTP请求**: 基于 `axios` (封装在 `src/services/api.ts`)
- **国际化**: [Vue I18n](https://vue-i18n.intlify.dev/) (支持中文 `zh-CN` 和英文 `en-US`)
- **语言**: [TypeScript](https://www.typescriptlang.org/)

## 项目结构概览

```
fabriclens-ui/
├── public/                # 静态资源，会被直接复制到dist目录
├── src/
│   ├── assets/            # 静态资源 (图片, 字体, 全局样式等)
│   │   ├── icons/
│   │   ├── images/
│   │   └── styles/        # 例如 global.css
│   ├── components/        # 可复用的UI组件
│   │   ├── ImageComparison/
│   │   ├── ImageUploader/
│   │   ├── layout/
│   │   └── SearchResults/
│   ├── locales/           # 国际化语言包 (en-US.ts, zh-CN.ts)
│   ├── router/            # Vue Router配置 (index.ts)
│   ├── services/          # API服务封装 (api.ts)
│   ├── stores/            # Pinia状态管理模块 (user.ts, search.ts, comparison.ts)
│   ├── utils/             # 工具函数 (errorHandler.ts, imageProcessing.ts)
│   ├── views/             # 页面级组件 (HomePage.vue, SearchResultsPage.vue, etc.)
│   ├── workers/           # Web Worker脚本 (imageProcessingWorker.ts)
│   ├── App.vue            # 根Vue组件
│   ├── main.ts            # 应用入口文件
│   └── style.css          # 主要的全局样式 (可能被assets/styles/global.css替代或补充)
│   └── ...                # 其他配置文件和类型声明文件
├── index.html             # Vite项目的入口HTML
├── package.json           # 项目依赖和脚本
├── vite.config.ts         # Vite配置文件
└── README.md              # 本文件
```

## 主要功能模块

- **用户认证**: 登录、注册等 (通过 `user` store 和 `api.ts` 与后端交互)。
- **图像搜索**:
  - 图像上传搜索。
  - 搜索结果展示 (`SearchResultsPage.vue` 和 `SearchResults/` 组件)。
  - 搜索状态管理 (通过 `search` store)。
- **图像对比**:
  - 展示和比较图像的详细信息 (`ComparisonPage.vue` 和 `ImageComparison/` 组件)。
  - 对比状态管理 (通过 `comparison` store)。
- **用户中心**:
  - 查看和管理用户信息、收藏夹等 (`UserCenterPage.vue`)。
- **图像处理**:
  - 前端图像处理任务可能通过 `imageProcessing.ts` 和 Web Worker (`imageProcessingWorker.ts`) 执行，以提升性能。
- **国际化**: 支持中英文切换。

## 开发

### 环境要求

- [Node.js](https://nodejs.org/) (版本建议 >= 16.x)
- [pnpm](https://pnpm.io/) (推荐) 或 npm/yarn

### 安装依赖

```bash
# 使用 pnpm
pnpm install

# 或者使用 npm
npm install

# 或者使用 yarn
yarn install
```

### 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或者使用 npm
npm run dev

# 或者使用 yarn
yarn dev
```

开发服务器通常会运行在 `http://localhost:5173` (具体端口请查看Vite启动日志)。

### 构建生产版本

```bash
# 使用 pnpm
pnpm build

# 或者使用 npm
npm run build

# 或者使用 yarn
yarn build
```

构建产物会输出到 `dist/` 目录。

### Linting和格式化

项目中可能配置了ESLint和Prettier，请遵循相关配置。
通常可以通过以下命令检查和修复：

```bash
# (根据package.json中的脚本调整)
pnpm lint
pnpm format
```

## 了解更多

- [Vue 3 文档](https://v3.vuejs.org/guide/introduction.html)
- [Vite 文档](https://vitejs.dev/guide/)
- [Pinia 文档](https://pinia.vuejs.org/introduction.html)
- [Vue Router 文档](https://router.vuejs.org/introduction.html)
- [Ant Design Vue 文档](https://www.antdv.com/components/overview-cn/)
- [Vue I18n 文档](https://vue-i18n.intlify.dev/guide/)

## 项目详解 (辅助毕业设计论文)

本章节旨在详细阐述 FabricLens 前端项目的设计与实现细节，以辅助毕业设计论文中相关章节的撰写。

### 4.1 系统总体架构设计

#### (1) 模块划分

FabricLens 前端项目遵循模块化的设计原则，主要功能模块根据职责清晰划分，体现在 `src/` 目录结构中：

- **`assets/`**: 存放应用的静态资源，如图片、字体、全局样式等。
  - `icons/`: 项目中使用的图标。
  - `images/`: 项目中使用的图片资源。
  - `styles/`: 全局 CSS 样式文件，例如 `global.css`。
- **`components/`**: 存放可复用的UI组件。这些组件是构成页面的基本单元，例如：
  - `ImageComparison/`: 用于展示和比较图像详细信息的组件。
  - `ImageUploader/`: 实现图像上传功能的组件。
  - `layout/`: 包含应用的整体布局组件，如页眉、页脚、侧边栏等。
  - `SearchResults/`: 展示搜索结果列表的组件。
- **`locales/`**: 国际化语言包，目前支持中文 (`zh-CN.ts`) 和英文 (`en-US.ts`)，通过 Vue I18n 实现多语言切换。
- **`router/`**: Vue Router 配置 (`index.ts`)，负责定义应用的路由规则，实现页面间的导航。
- **`services/`**: API 服务封装 (`api.ts`)，基于 `axios` 库，统一管理与后端服务的 HTTP 请求，包括请求拦截、响应处理等。
- **`stores/`**: Pinia 状态管理模块。将全局状态按照功能划分为不同的 store，例如：
  - `user.ts`: 管理用户认证信息和用户状态。
  - `search.ts`: 管理图像搜索相关的状态，如搜索参数、搜索结果等。
  - `comparison.ts`: 管理图像对比页面的状态。
- **`utils/`**: 工具函数模块，提供项目全局可用的辅助函数，例如：
  - `errorHandler.ts`: 统一的错误处理机制。
  - `imageProcessing.ts`: 前端图像处理相关的工具函数。
- **`views/`**: 页面级组件，代表应用的不同视图，由多个基础组件组合而成。例如：
  - `HomePage.vue`: 应用首页。
  - `SearchResultsPage.vue`: 搜索结果展示页面。
  - `ComparisonPage.vue`: 图像对比详情页面。
  - `UserCenterPage.vue`: 用户个人中心页面。
- **`workers/`**: Web Worker 脚本 (`imageProcessingWorker.ts`)，用于将计算密集型的图像处理任务放到后台线程执行，避免阻塞主线程，提升用户体验。
- **`App.vue`**: Vue 应用的根组件，承载整个应用的视图结构。
- **`main.ts`**: 应用的入口文件，负责初始化 Vue 实例、插件（如 Pinia, Vue Router, Vue I18n）并挂载根组件。

#### (2) 技术选型

前端项目的技术选型旨在确保开发效率、应用性能和用户体验：

- **核心框架**: [Vue 3](https://vuejs.org/)，采用其最新的 `<script setup>` SFC 语法，提升了组件开发的便捷性和代码可读性。Vue 3 的响应式系统和组合式 API 为构建复杂交互界面提供了强大支持。
- **构建工具**: [Vite](https://vitejs.dev/)，提供了极速的冷启动和热模块替换 (HMR) 功能，显著提升了开发体验。其基于原生 ES模块的构建方式也使得生产环境的打包更加高效。
- **UI组件库**: [Ant Design Vue](https://www.antdv.com/docs/vue/introduce-cn/)，提供了丰富、高质量的预设组件，加速了界面的开发，并保证了视觉风格的统一性。
- **状态管理**: [Pinia](https://pinia.vuejs.org/)，作为 Vue 官方推荐的状态管理库，其设计简洁、类型安全，并且对 TypeScript 有良好的支持，使得全局状态的管理更加直观和高效。
- **路由管理**: [Vue Router](https://router.vuejs.org/)，Vue.js 官方的路由管理器，用于构建单页应用 (SPA)，实现不同视图间的无缝切换。
- **HTTP客户端**: [axios](https://axios-http.com/)，一个流行的基于 Promise 的 HTTP 客户端，用于与后端 API 进行数据交互。项目中在 `src/services/api.ts` 中对其进行了封装，以便统一处理请求和响应。
- **国际化方案**: [Vue I18n](https://vue-i18n.intlify.dev/)，为应用提供了多语言支持，方便扩展到不同语种的用户。
- **编程语言**: [TypeScript](https://www.typescriptlang.org/)，为 JavaScript 添加了静态类型检查，增强了代码的健壮性、可维护性，并提升了大型项目的开发体验。

### 4.5 前端用户界面设计与实现

#### 4.5.1 主要功能模块界面

前端用户界面围绕家纺图像的相似性搜索核心功能展开，主要包括以下模块界面：

1. **首页 (`HomePage.vue`)**:
   * 应用入口，提供图像上传入口。
   * 可能包含应用的简要介绍、特色功能展示等。
2. **图像上传与搜索界面 (集成于首页或独立，通过 `ImageUploader/` 组件实现)**:
   * 用户可以通过拖拽或点击选择本地家纺图像文件进行上传。
   * 上传后触发图像相似性搜索。
3. **搜索结果展示页面 (`SearchResultsPage.vue`)**:
   * 以列表或网格形式展示与查询图像相似的家纺图像。
   * 每个结果项通常包含缩略图、关键信息（如相似度、编号等）。
   * 提供分页、排序、筛选等功能，方便用户浏览和定位结果。
   * 调用 `SearchResults/` 下的组件进行渲染。
4. **图像对比详情页面 (`ComparisonPage.vue`)**:
   * 当用户点击搜索结果中的某一项时，进入此页面。
   * 此页面通常展示被点击的搜索结果图像与原始查询图像的对比，或仅展示该搜索结果的详细信息。
   * 并排或分栏展示图像的详细信息，突出其差异和相似之处（如果进行了对比）。
   * 可能包含图像的元数据、特征提取结果的可视化等。
   * 使用 `ImageComparison/` 组件来构建对比视图。
5. **用户中心页面 (`UserCenterPage.vue`)**:
   * （如果涉及用户系统）提供用户登录、注册功能。
   * 登录后用户可以查看个人信息、管理历史搜索记录、收藏夹等。
6. **通用布局组件 (`layout/`)**:
   * 包括应用的页眉（Header）、导航菜单（Navigation）、页脚（Footer）等，确保应用整体视觉风格和操作体验的一致性。

#### 4.5.2 关键交互流程

1. **以图搜图流程**:
   * 用户在首页点击"上传图像"按钮或拖拽图像文件到指定区域 (`ImageUploader/` 组件)。
   * 前端预览用户选择的图像，并将其上传至后端。
   * 后端接收图像，提取特征并执行相似性搜索。
   * 返回相似图像数据。
   * 前端跳转至 `SearchResultsPage.vue` 展示搜索结果。
2. **查看图像详情与对比流程**:
   * 用户在 `SearchResultsPage.vue` 点击任一搜索结果。
   * 前端导航至 `ComparisonPage.vue`，并传递所选图像的ID或信息。
   * `ComparisonPage.vue` 从后端获取该图像的详细信息，并可能展示其与原始查询图像的对比信息。
3. **用户登录/注册流程** (如果适用):
   * 用户点击导航栏的"登录/注册"链接。
   * 在弹出的表单中输入用户名、密码等信息。
   * 前端将信息发送至后端API进行验证或创建账户。
   * 成功后，前端更新用户状态 (通过 `user` store)，并可能重定向到用户中心或首页。

#### 4.5.3 与后端API的交互

前端与后端API的交互是实现系统功能的核心环节。所有API请求逻辑均封装在 `src/services/api.ts` 文件中，其主要特点和实现方式如下：

* **HTTP客户端与配置**:

  * 使用 [axios](https://axios-http.com/) 作为HTTP客户端库。
  * 创建了一个全局的 `axios` 实例 (`api`)，配置了基础URL (`API_BASE_URL`，通过环境变量 `VITE_API_BASE_URL` 设置，默认为 `http://localhost:8080`)、超时时间 (例如图像搜索接口的超时时间设置为120秒，添加到数据库的超时时间为60秒)以及 `withCredentials: true` 以支持跨域凭证。
  * 默认请求头设置为 `Content-Type: application/json` 和 `Accept: application/json`。对于文件上传等操作，`Content-Type` 会在具体请求中设置为 `multipart/form-data`。
* **请求拦截器**:

  * 在每个请求发送前，拦截器会自动从 `localStorage` (键名 `fabricLens_token`) 读取认证Token。
  * 如果Token存在，会将其添加到请求的 `Authorization` Header 中 (格式为 `Bearer <token>`)。
  * 请求发出时会在控制台打印日志，记录请求的方法和URL，便于调试。
* **响应拦截器**:

  * 对响应进行统一处理。其中一个特定的错误处理逻辑是：当捕获到网络错误 (被 `isNetworkError` 或 `isCorsError` 函数识别，或者 `error.message` 包含 'Network Error') 时，会尝试使用一个指向 `http://localhost:8080` 的备用 `axios` 实例重试失败的原始请求。这主要用于处理开发过程中可能遇到的CORS问题或端口配置问题。
* **通用重试机制**:

  * 引入了一个名为 `withRetry` 的异步辅助函数，用于包装大部分API调用。
  * 该函数允许在API请求失败时自动重试，可以配置最大重试次数和重试间的延迟时间 (延迟时间会指数级增加)。这有助于应对临时的网络波动或服务器暂时不可用的情况。
  * 如果错误是由于客户端问题（如400, 401, 403, 422等状态码）或最后一次尝试失败，则不再重试并抛出最终错误。
* **API服务封装**:

  * API按功能模块组织成不同的服务对象，主要包括：
    * `imageService`: 负责所有与图像处理和搜索相关的操作。
      * `searchSimilar(image: File | SearchImage, topK: number = 10)`: 核心的以图搜图接口。它接收一个 `File` 对象或者一个包含 `url` 的 `SearchImage` 对象作为输入，并可以指定返回最相似结果的数量 (`topK`)。
        * 在上传前，如果图像文件体积超过2MB，会调用 `compressImage` 工具函数进行前端压缩，以减少上传数据量和提高效率。
        * 对于Base64编码的图像数据，如果长度过大，也会尝试转换为文件并压缩。
        * 使用 `FormData` 格式来封装图像文件和 `top_k` 参数进行上传。
        * 包含了详细的错误处理逻辑，例如在网络连接重置 (`ERR_NETWORK`, `ERR_CONNECTION_RESET`) 等严重错误情况下，为了保证用户体验，会返回预设的模拟数据 (`generateMockData` 和 `processSearchResults` 处理)。
      * `addToDatabase(image: File, metadata: object)`: 用于将新的家纺图像及其元数据（名称、标签、颜色等）添加到系统数据库中。此接口同样使用 `FormData` 上传图像，并有较长的超时设置。
      * `getImageDetails(id: string | number)`: 根据图像的唯一ID从后端获取其详细属性信息。
      * `getSimilarImages(id: string | number)`: 获取与数据库中指定ID的图像相似的其他图像列表。此方法包含一些容错逻辑，例如当直接请求失败或返回空时，会尝试使用 `searchSimilar` 作为备选方案。
      * `rebuildIndex(adminKey: string)`: (管理员功能) 调用后端接口重建搜索引擎的特征索引，通常在大量数据更新后执行。
    * `userService`: 负责处理用户认证和用户相关信息的管理。
      * `login(email: string, password: string)`: 处理用户登录请求，发送邮箱和密码。包含对CORS或网络错误的特定处理，会尝试备用端口。
      * `register(username: string, password: string, email: string)`: 处理新用户注册请求。
      * `getUserInfo()`: 获取当前已登录用户的详细信息，请求时需要有效的认证Token。
      * 还包括管理用户收藏夹 (`getFavorites`, `addFavorite`, `removeFavorite`)、刷新认证Token (`refreshToken`) 和检查邮箱是否已被注册 (`checkEmail`) 等辅助功能。
  * 这些服务函数内部都调用了先前配置好的全局 `axios` 实例 (`api`) 来执行实际的HTTP请求。
* **数据预处理与工具函数**:

  * `fixImageUrl(url: string)`: 一个工具函数，用于检查和修正图像URL。如果URL是相对路径，它会添加 `API_BASE_URL` 前缀；如果URL为空，则返回一个默认图像的URL。
  * `getFallbackImageUrl(imageId: string)`: 在某些情况下（如图像ID是UUID格式时）提供一个备用的测试图像URL。
  * `processSearchResults(results: any[])`: 对从后端API获取的搜索结果列表进行客户端预处理。这包括确保每个结果项的 `url` 字段是完整的绝对路径，将后端字段名 (如 `is_favorite`) 映射到前端期望的字段名 (`isFavorite`)，并为一些可选字段（如 `textileTypes`, `tags`）提供默认空数组值，以确保数据结构与前端的 `SearchResult` 接口一致。
  * `compressImage(image: File)`: (位于 `src/utils/imageProcessing.ts`) 用于在前端压缩图像，减小上传体积。
* **用户界面反馈**:

  * 在执行异步API调用期间（例如，开始上传、操作成功、发生错误时），代码中多处使用了 `ant-design-vue` 提供的 `message` 组件（如 `message.loading`, `message.success`, `message.error`）。这向用户提供了即时的、非阻塞式的视觉反馈，提升了用户体验。
* **错误处理与日志**:

  * 除了拦截器中的通用错误处理和 `withRetry` 机制外，每个具体的API服务函数内部通常都包含 `try...catch` 块来捕获和处理可能发生的异常。
  * 详细的错误信息，包括服务器响应的状态、数据等，会被记录到浏览器的开发者控制台 (`console.error`, `console.warn`, `console.log`)，便于开发和问题排查。
  * 对于用户可见的错误，会通过 `message.error` 显示友好的提示信息。在某些情况下，还会根据错误类型（如401未授权）提供更具体的 `displayMessage`。

通过这种分层和模块化的API交互设计，前端代码实现了与后端服务的有效通信，同时保证了代码的可维护性、健壮性和良好的用户体验。
