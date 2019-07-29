import modelExtend from 'dva-model-extend'
import { pathMatchRegexp } from 'utils'
import api from 'api'
import { pageModel } from 'utils/model'

const {
  queryUserList, // 请求列表数据
  createUser, // 新建
  removeUser, // 删除一条数据
  updateUser, // 编辑
  removeUserList, // 删除多条数据
} = api  // user页面要用的所有的请求方法

export default modelExtend(pageModel, {
  namespace: 'user',  // user 页面 model的名称空间

  // 页面的数据管理。
  state: {
    currentItem: {},     // 弹窗的表单数据
    modalVisible: false, // 弹窗显示
    modalType: 'create', // 弹窗类型 编辑/添加
    selectedRowKeys: [], // 勾选项的 id 数组
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        // pathname 是http://localhost:7000/admin/en/user?page=1 中的 /en/user 部分
        // pathMatchRegexp('/user', location.pathname) 看location.pathname是否完全按匹配 /user 的路由;不符合返回null
        if (pathMatchRegexp('/user', location.pathname)) {
          const payload = location.query || { page: 1, pageSize: 10 } // 默认分页信息
          dispatch({
            type: 'query',
            payload,
          })
        }
      })
    }
  },

  effects: {
    // 用户列表的增删改成 各对应一个 disptch 请求相应接口。
    // dispatch 触发effects中的 actions. 
    // dispatch成功后回调 ,put 触发reducer中的 mutations
    
    *query({ payload = {} }, { call, put }) {
      const data = yield call(queryUserList, payload) // 请求表格数据 和 分页
      if (data) {
        // put reducer change state data // put 相当于vuex中的commit 触发mutation.
        // 请求用户列表数据后 更新相应state
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.data,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: data.total,
            },
          },
        })
      }
    },

    *delete({ payload }, { call, put, select }) {
      const data = yield call(removeUser, { id: payload })
      const { selectedRowKeys } = yield select(_ => _.user)
      if (data.success) {// 删除成功后更新state
        yield put({
          type: 'updateState',
          payload: {
            selectedRowKeys: selectedRowKeys.filter(_ => _ !== payload),
          },
        })
      } else {
        throw data
      }
    },

    *multiDelete({ payload }, { call, put }) {
      const data = yield call(removeUserList, payload) 
      if (data.success) {// 删除多条数据成功后 更新相应state
        yield put({ type: 'updateState', payload: { selectedRowKeys: [] } })
      } else {
        throw data
      }
    },

    *create({ payload }, { call, put }) {
      const data = yield call(createUser, payload)
      if (data.success) { // 
        yield put({ type: 'hideModal' })
      } else {
        throw data
      }
    },

    *update({ payload }, { select, call, put }) {
      const id = yield select(({ user }) => user.currentItem.id)
      const newUser = { ...payload, id }
      const data = yield call(updateUser, newUser)
      if (data.success) {
        yield put({ type: 'hideModal' })
      } else {
        throw data
      }
    },
  },

  reducers: {
    showModal(state, { payload }) {
      return { ...state, ...payload, modalVisible: true }
    },

    hideModal(state) {
      return { ...state, modalVisible: false }
    },
  },
})
