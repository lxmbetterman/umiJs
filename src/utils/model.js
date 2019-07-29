import modelExtend from 'dva-model-extend'


// 思考为什么会有 updateState 和 querySuccess 两个 reducer
// updateState 是所有需要更新state的地方都可以用,更新那些state取决于传入的参数
// 而querySuccess 是更新当前的model的states 也就是pageModel中 table相关的state,也就是请求表格的接口成功的回调处理
export const model = {
  reducers: {
    updateState(state, { payload }) {  // 会更新 包括extend model的所有state
      return {
        ...state,
        ...payload,
      }
    },
  },
}

export const pageModel = modelExtend(model, {
  state: {
    list: [],  // 列表数据
    pagination: {  // 分页数据
      showSizeChanger: true, // 是否可以改变pageSize
      showQuickJumper: true, // 跳转到
      current: 1, // 当前页
      total: 0, // 总数
      pageSize: 10, // 每页数据条数
    },
  },

  reducers: {  // reducer 是更新state的.
    querySuccess(state, { payload }) { // 主要是更新 当前的model的states
      const { list, pagination } = payload
      return {
        ...state,
        list,
        pagination: {
          ...state.pagination,
          ...pagination,
        },
      }
    },
  },
})
