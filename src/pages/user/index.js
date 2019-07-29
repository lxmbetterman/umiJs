import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { router } from 'utils'
import { connect } from 'dva'
import { Row, Col, Button, Popconfirm } from 'antd'
import { withI18n } from '@lingui/react'
import { Page } from 'components'
import { stringify } from 'qs'
import List from './components/List'
import Filter from './components/Filter'
import Modal from './components/Modal'

@withI18n()
@connect(({ user, loading }) => ({ user, loading }))
class User extends PureComponent {
  // 翻页/删除 都要刷新页面
  handleRefresh = newQuery => {
    const { location } = this.props
    const { query, pathname } = location
    router.push({ // 这个方法已经处理了 lang perfix 前缀了，而且相同的路由会触发 subscriptions的history.listen的路由钩子
      pathname,
      search: stringify( // 把{a:'a',b:'b'} 序列化成 'a=a&b=b'的形式
        {
          ...query,
          ...newQuery,
        },
        { arrayFormat: 'repeat' } // 允许重复
      ),
    })
  }

  handleDeleteItems = () => {
    const { dispatch, user } = this.props
    const { list, pagination, selectedRowKeys } = user

    dispatch({
      type: 'user/multiDelete',
      payload: {
        ids: selectedRowKeys,
      },
    }).then(() => {
      this.handleRefresh({ /// 删除后存在一个 currentPage 是多少的问题
        page: list.length === selectedRowKeys.length && pagination.current > 1
            ? pagination.current - 1
            : pagination.current,
      })
    })
  }

  get modalProps() { // dialog弹窗相关数据
    const { dispatch, user, loading, i18n } = this.props
    const { currentItem, modalVisible, modalType } = user

    return {
      item: modalType === 'create' ? {} : currentItem,
      visible: modalVisible,
      destroyOnClose: true,
      maskClosable: false,
      confirmLoading: loading.effects[`user/${modalType}`],
      title: `${
        modalType === 'create' ? i18n.t`Create User` : i18n.t`Update User`
      }`,
      centered: true,
      onOk: data => {
        dispatch({
          type: `user/${modalType}`,
          payload: data,
        }).then(() => {
          this.handleRefresh()
        })
      },
      onCancel() {
        dispatch({
          type: 'user/hideModal',
        })
      },
    }
  }

  get listProps() { // 表格相关数据
    const { dispatch, user, loading } = this.props
    const { list, pagination, selectedRowKeys } = user // state中取数据

    return {
      dataSource: list,
      loading: loading.effects['user/query'],
      pagination,
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: page.pageSize,
        })
      },
      onDeleteItem: id => {
        dispatch({
          type: 'user/delete',
          payload: id,
        }).then(() => {
          this.handleRefresh({ /// 删除后存在一个 currentPage 是多少的问题
            page: list.length === 1 && pagination.current > 1
                ? pagination.current - 1
                : pagination.current,
          })
        })
      },
      onEditItem(item) {
        dispatch({
          type: 'user/showModal',
          payload: {
            modalType: 'update',
            currentItem: item,
          },
        })
      },
      rowSelection: {
        selectedRowKeys,
        onChange: keys => {
          dispatch({
            type: 'user/updateState',
            payload: {
              selectedRowKeys: keys,
            },
          })
        },
      },
    }
  }

  get filterProps() { // 搜索栏相关数据...
    const { location, dispatch } = this.props
    const { query } = location

    return {
      filter: {
        ...query,
      },
      onFilterChange: value => {
        this.handleRefresh({
          ...value,
        })
      },
      onAdd() {
        dispatch({
          type: 'user/showModal',
          payload: {
            modalType: 'create',
          },
        })
      },
    }
  }

  render() {
    const { user } = this.props
    const { selectedRowKeys } = user

    return (
      <Page inner>
        <Filter {...this.filterProps} />
        {selectedRowKeys.length > 0 && (
          <Row style={{ marginBottom: 24, textAlign: 'right', fontSize: 13 }}>
            <Col>
              {`Selected ${selectedRowKeys.length} items `}
              <Popconfirm
                title="Are you sure delete these items?"
                placement="left"
                onConfirm={this.handleDeleteItems}
              >
                <Button type="primary" style={{ marginLeft: 8 }}>
                  Remove
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        )}
        <List {...this.listProps} />
        <Modal {...this.modalProps} />
      </Page>
    )
  }
}

User.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default User
