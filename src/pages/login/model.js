import { router, pathMatchRegexp } from 'utils'
import api from 'api'
const { loginUser } = api

export default {
  namespace: 'login',

  state: {},

  effects: {
    *login({ payload }, { put, call, select }) {
      const data = yield call(loginUser, payload) // 这是登录
      // 成路成功后端应该存储cookie在客户端。之后的所有请求都会带上cookie信息
      // 前端不用手动去保存token相关的数据，后端在cookie中自己去保存和查找相关数据。
      const { locationQuery } = yield select(_ => {
        return _.app
      })
      if (data.success) { // 如果登录成功了
        const { from } = locationQuery
        yield put({ type: 'app/query' }) // 应用初始数据请求
        if (!pathMatchRegexp('/login', from)) {
          if (['', '/'].includes(from)) router.push('/dashboard')
          else router.push(from)
        } else {
          router.push('/dashboard')
        }
      } else {
        throw data
      }
    },
  },
}
