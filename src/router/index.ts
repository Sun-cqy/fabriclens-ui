import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/HomePage.vue')
    },
    {
        path: '/search-results',
        name: 'SearchResults',
        component: () => import('../views/SearchResultsPage.vue')
    },
    {
        path: '/comparison/:id',
        name: 'Comparison',
        component: () => import('../views/ComparisonPage.vue'),
        props: true
    },
    {
        path: '/user-center',
        name: 'UserCenter',
        component: () => import('../views/UserCenterPage.vue'),
        props: (route) => ({ tab: route.query.tab })
    },
    // 404路由
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router 