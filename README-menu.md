module.exports = [
{
    id: '1',
    icon: 'laptop',
    name: 'Dashboard',
    route: '/dashboard',
  },
  {
    id: '1',
    bpid: '1',
    name: 'Test Navigation',
    icon: 'setting',
  },
  {
    id: '61',
    bpid: '6',
    mpid: '6',
    name: 'Test Navigation1',
    route: '/navigation/navigation1',
  },

]

属性说明
id: string, 唯一id
bpid: string, 面包屑导航的父id
mpid: string, 菜单的父id,缺省时为一级菜单,为-1时在菜单中不显示
name: 显示名称
route: 匹配路由,缺省时不做跳转
icon: 在名称前显示的图标