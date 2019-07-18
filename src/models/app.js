/* global window */

import { router } from 'utils'
import { stringify } from 'qs'
import store from 'store'
import { ROLE_TYPE } from 'utils/constant'
import { queryLayout, pathMatchRegexp } from 'utils'
import { CANCEL_REQUEST_MESSAGE } from 'utils/constant'
import api from 'api'
import config from 'config'

const { queryRouteList, logoutUser, queryUserInfo } = api

export default {
  namespace: 'app',
  state: {
    routeList: [
      {
        id: '1',
        icon: 'laptop',
        name: 'Dashboard',
        zhName: '仪表盘',
        router: '/dashboard',
      },
    ],
    locationPathname: '',
    locationQuery: {},
    theme: store.get('theme') || 'light',
    collapsed: store.get('collapsed') || false,
    notifications: [
      {
        title: 'New User is registered.',
        date: new Date(Date.now() - 10000000),
      },
      {
        title: 'Application has been approved.',
        date: new Date(Date.now() - 50000000),
      },
    ],
  },
  subscriptions: {  //创建的时候，就会依次执行内部的方法
    setup({ dispatch }) {
      dispatch({ type: 'query' })
    },
    setupHistory({ dispatch, history }) { // 保存每一次的当前路由相关参数到state
      history.listen(location => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: location.query,
          },
        })
      })
    },

    setupRequestCancel({ history }) {
      history.listen(() => {
        const { cancelRequest = new Map() } = window
        cancelRequest.forEach((value, key) => {
          console.log(value,key)
          if (value.pathname !== window.location.pathname) {
            value.cancel(CANCEL_REQUEST_MESSAGE)
            cancelRequest.delete(key)
          }
        })
      })
    }
  },
  effects: {
    // 登录操作，请求用户登录信息;如果已经登录，则会跳出不执行。
    // 而登陆成功之后的数据会通过store存储,这样刷新页面可以保存数据状态
    *query({ payload }, { call, put, select }) {
      // store isInit to prevent query trigger by refresh //登陆成功后isInit===true,为了防止刷新页面时触发 query
      const isInit = store.get('isInit')
      if (isInit) return
      const { locationPathname } = yield select(_ => _.app)
      
      const { success, user } = yield call(queryUserInfo, payload) // 登录获取用户信息（角色等信息）
      // 登录和获取用户信息是两个接口 两个步骤
      if (success && user) { 
        // 获取用户信息成功后，再拉去所有的路由数据数组 
        const { list } = yield call(queryRouteList)
        const { permissions } = user // 包含 role 等属性数据
        let routeList = list
        // 根据用户角色 过滤路由数据
        if ( // 如果是管理员角色,则放入全部的路由id到permission.visit数组中
          permissions.role === ROLE_TYPE.ADMIN ||
          permissions.role === ROLE_TYPE.DEVELOPER
        ) {
          permissions.visit = list.map(item => item.id)
        } else {
          routeList = list.filter(item => {
            // bpid: string, 面包屑导航的父id
            // mpid: string, 菜单的父id, 缺省时为一级菜单, 为 - 1时在菜单中不显示
            const cases = [
              permissions.visit.includes(item.id), // 当前id有权限
              item.mpid ? permissions.visit.includes(item.mpid) || item.mpid === '-1' : true, // mpid缺省 或者 mpid有权限||mpid==='-1'
              item.bpid ? permissions.visit.includes(item.bpid) : true, // bpid缺省 或者 bpid有权限
            ]
            return cases.every(_ => _) // 都满足时 返回当前路由项到菜单中显示
          })
        }

        // 保存在本地localStorage
        store.set('routeList', routeList)
        store.set('permissions', permissions) // [id1,id2,...] 后端返回
        store.set('user', user)
        // 登录成功后设置 isInit 为 true 
        store.set('isInit', true)
        if (pathMatchRegexp(['/', '/login'], window.location.pathname)) { // 参数二匹配参数一的anyone,return true。
          router.push({
            pathname: '/dashboard',
          })
        }
      } else if (queryLayout(config.layouts, locationPathname) !== 'public') {
        router.push({
          pathname: '/login',
          search: stringify({
            from: locationPathname,
          }),
        })
      }
    },

    *signOut({ payload }, { call, put }) {
      const data = yield call(logoutUser)
      if (data.success) {
        store.set('routeList', [])
        store.set('permissions', { visit: [] })
        store.set('user', {})
        store.set('isInit', false)
        yield put({ type: 'query' })
      } else {
        throw data
      }
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },

    handleThemeChange(state, { payload }) {
      store.set('theme', payload)
      state.theme = payload
    },

    handleCollapseChange(state, { payload }) {
      store.set('collapsed', payload)
      state.collapsed = payload
    },

    allNotificationsRead(state) {
      state.notifications = []
    },
  },
}
