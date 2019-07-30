import React, { PureComponent } from 'react'
import Redirect from 'umi/redirect'
import { withI18n } from '@lingui/react'

@withI18n() // 貌似没用
class Index extends PureComponent {
  render() {
    const { i18n } = this.props
    return <Redirect to={i18n.t`/dashboard`} />
  }
}

export default Index
