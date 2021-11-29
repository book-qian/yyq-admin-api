const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const models = require('../db/models')

app.use(express.json())
// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// 1.登录
// 参数：用户名、密码
// 返回：用户名，登录态（token）
// 2.查询任务的列表 （状态/页码）查询
// 3.新增任务 （名称/截止日期/内容）
// 4.编辑任务 （对已存在的进行编辑，名称/截止日期/内容/id）
// 5.删除任务（id）
// 6.修改任务的状态(id/status) 待办/完成

// 登录
app.post('/login', async (req, res, next) => {
  try {
    const { userName, passWord } = req.body
    const user = await models.User.findOne({
      where: { userName }
    })
    if (userName && user) {
      res.json({ message: '登录成功', userName, passWord, token: '12dsajfhs' })
    } else {
      res.status(500).json({
        message: '没有这个用户'
      })
    }
  } catch (error) {
    next(error)
  }
})

// 获取菜单
app.post('/getMenu', async (req, res, next) => {
  const menuList = [
    {
      key: '/home',
      title: '首页',
      icon: 'HomeOutlined'
    },
    {
      title: '通用',
      key: '/public',
      icon: 'AlignCenterOutlined',
      subs: [
        { title: '按钮', key: '/public/button', icon: '' },
        { title: '图标', key: '/public/icon', icon: '' },
        { title: '任务', key: '/public/task', icon: '' }
      ]
    },
    {
      title: '导航',
      key: '/nav',
      icon: 'CalculatorOutlined',
      subs: [
        { title: '下拉菜单', key: '/nav/dropdown', icon: '' },
        { title: '导航菜单', key: '/nav/menu', icon: '' },
        { title: '步骤条', key: '/nav/steps', icon: '' }
      ]
    },
    {
      title: '表单',
      key: '/form',
      icon: 'FormOutlined',
      subs: [
        { title: '基础表单', key: '/form/base-form', icon: '' },
        { title: '步骤表单', key: '/form/step-form', icon: '' }
      ]
    },
    {
      title: '展示',
      key: '/show',
      icon: 'AreaChartOutlined',
      subs: [
        { title: '表格', key: '/show/table', icon: '' },
        { title: '折叠面板', key: '/show/collapse', icon: '' },
        { title: '树形控件', key: '/show/tree', icon: '' },
        { title: '标签页', key: '/show/tabs', icon: '' }
      ]
    },
    {
      title: '其它',
      key: '/others',
      icon: 'PaperClipOutlined',
      subs: [
        { title: '进度条', key: '/other/progress', icon: '' },
        { title: '动画', key: '/other/animation', icon: '' },
        { title: '上传', key: '/other/upload', icon: '' },
        { title: '404', key: '/404', icon: '' },
        { title: '500', key: '/500', icon: '' }
      ]
    },
    {
      title: '多级导航',
      key: '/one',
      icon: 'FileDoneOutlined',
      subs: [
        {
          title: '二级',
          key: '/one/two',
          icon: '',
          subs: [{ title: '三级', key: '/one/two/three', icon: '' }]
        }
      ]
    },
    {
      title: '关于',
      key: '/about',
      icon: 'UserAddOutlined'
    }
  ]
  try {
    const { userName } = req.body
    if (userName) {
      res.json({
        menuList
      })
    } else {
      res.status(500).json({
        message: '缺少参数'
      })
    }
  } catch (error) {
    next(error)
  }
})

// 新增用户
app.post('/user/add', async (req, res, next) => {
  try {
    const { userName } = req.body
    const user = await models.User.create({
      userName
    })
    res.json({ user })
  } catch (error) {
    next(error)
  }
})

// 获取任务
app.post('/todo/list', async (req, res, next) => {
  try {
    const { name, des, current, pageSize, status } = req.body
    if (!current && !pageSize) {
      res.json({ tasklist: { rows: [], count: 0 }, message: '缺少分页参数' })
    } else {
      const query = {}
      if (name) query.name = name
      if (des) query.des = des
      if (status) query.status = status
      const tasklist = await models.Todo.findAndCountAll({
        where: {
          ...query
        },
        limit: pageSize, // 分页大小
        offset: (current - 1) * pageSize // 第几页
      })
      res.json({ tasklist, message: '列表查询成功' })
    }
  } catch (error) {
    next(error)
  }
})

// 新增任务
app.post('/todo/add', async (req, res, next) => {
  try {
    const { name, dealline, des } = req.body
    const todo = await models.Todo.create({
      name,
      dealline,
      des
    })
    res.json({
      todo
    })
  } catch (error) {
    next(error)
  }
})

// 修改任务
app.post('/todo/edit', async (req, res, next) => {
  try {
    const { name, dealline, des, id } = req.body
    if (!id) res.status(500).json({ message: '缺少数据id' })
    const curTodo = await models.Todo.findOne({
      where: {
        id
      }
    })
    if (curTodo) {
      const todo = await curTodo.update({
        name,
        dealline,
        des,
        id
      })
      res.json({
        todo
      })
    } else {
      res.status(500).json({
        message: '没有这个任务'
      })
    }
  } catch (error) {
    next(error)
  }
})

// 修改任务状态
app.post('/todo/status', async (req, res) => {
  // 1待办 2完成 3删除
  try {
    const { status, id } = req.body
    const curTodo = await models.Todo.findOne({
      where: {
        id
      }
    })
    if (curTodo) {
      const todo = await curTodo.update({
        status,
        id
      })
      res.json({
        todo
      })
    } else {
      res.status(500).json({
        message: '没有这个任务'
      })
    }
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).json({
      message: err.message
    })
  }
})

app.listen('3000', () => {
  console.log('服务连接成功')
})
