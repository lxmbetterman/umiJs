import React, { Component } from 'react'
import withRouter from 'umi/withRouter'
import { LocaleProvider } from 'antd'
import { I18nProvider } from '@lingui/react'
import { langFromPath, defaultLanguage } from 'utils'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import en_US from 'antd/lib/locale-provider/en_US'
import pt_BR from 'antd/lib/locale-provider/pt_BR'

import BaseLayout from './BaseLayout'

const languages = {
  zh: zh_CN,
  en: en_US,
  'pt-br': pt_BR,
}

@withRouter
class Layout extends Component {
  state = {
    catalogs: {},
  }

  language = defaultLanguage

  componentDidMount() {
    const language = langFromPath(this.props.location.pathname)
    this.language = language
    this.loadCatalog(language)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const language = langFromPath(nextProps.location.pathname)
    const preLanguage = this.language
    const { catalogs } = nextState

    if (preLanguage !== language && !catalogs[language]) {
      this.loadCatalog(language)
      this.language = language
      return false
    }
    this.language = language

    return true
  }

  loadCatalog = async language => {
    const catalog = await import(
      /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
      `@lingui/loader!../locales/${language}/messages.json`
    )

    this.setState(state => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalog,
      },
    }))
  }

  render() {
    const { location, children } = this.props
    const { catalogs } = this.state

    let language = langFromPath(location.pathname) // 获取路由参数中的语言标志
    // console.log(location.pathname, language)
    // If the language pack is not loaded or is loading, use the default language
    if (!catalogs[language]) language = defaultLanguage

    return (
      <LocaleProvider locale={languages[language]}>
        <I18nProvider language={language} catalogs={catalogs}>
          {/*  约定 src/layouts/index.js 为全局路由，返回一个 React 组件，通过 props.children 渲染子组件 */}
          <BaseLayout>{children}</BaseLayout>
        </I18nProvider>
      </LocaleProvider>
    )
  }
}

export default Layout
