module.exports = {
  base: '/Joho-blog/',
  title: 'VuePress 文档',
  description: 'VuePress + Github 30分钟搭建属于自己的博客网站',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'Joho的博客',
        items: [
            {text: 'GitHub', link: 'https://github.sheincorp.cn/'},
            {text: 'CSDN', link: 'https://blog.csdn.net/weixin_41105242'},
            {text: '掘金', link: 'https://juejin.cn/'}
        ]
      }
    ],
    sidebar: [
      {
          title: "目录",
          path: '/blog',
          collapsable: false, // 不折叠
          children: [
            {
              title: "智律星",
              path: '/blog/智律星'
            },
            {
              title: "webpack",
              path: '/blog/webpack
            }
          ]
      }
    ]
  }
}