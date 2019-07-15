import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Helmet } from 'react-helmet'
import { Loader } from 'components'
import { queryLayout } from 'utils'
import NProgress from 'nprogress'
import config from 'utils/config'
import withRouter from 'umi/withRouter'

import PublicLayout from './PublicLayout'
import PrimaryLayout from './PrimaryLayout'
import './BaseLayout.less'

const LayoutMap = {
  primary: PrimaryLayout,
  public: PublicLayout,
}

@withRouter
@connect(({ loading }) => ({ loading })) 
// connect > loaidng之后才会有loading对象 dva 有一个管理 effects 执行的 hook，并基于此封装了 dva-loading 插件
class BaseLayout extends PureComponent {
  previousPath = ''

  render() {
    // 
    const { loading, children, location } = this.props
    // console.log(queryLayout(config.layouts, location.pathname),'queryLayout(config.layouts, location.pathname)')
    // 根据路由 分配不同的layout
    // PrimaryLayout（顶部header 左侧menu的 右侧page） 
    // PublicLayout (空白模板)
    const Container = LayoutMap[queryLayout(config.layouts, location.pathname)]

    const currentPath = location.pathname + location.search
    // console.log(currentPath,'检测路由变化')
    if (currentPath !== this.previousPath) {
      NProgress.start()
    }
    // console.log(loading.global,'loading.global状态')
    // props变化时 会重新渲染逐渐
    if (!loading.global) {
      NProgress.done()
      this.previousPath = currentPath
    }

    return (
      <Fragment>
        {/* Helmet 管理对文档头的所有更改 */}
        <Helmet>
          <title>{config.siteName}</title>
        </Helmet>
        {/* 全屏加载遮罩层 */}
        <Loader fullScreen spinning={loading.effects['app/query']} />
        {/* Container is PrimaryLayout or PublicLayout */}
        <Container>{children}</Container>
      </Fragment>
    )
  }
}

BaseLayout.propTypes = {
  loading: PropTypes.object,
}

export default BaseLayout
