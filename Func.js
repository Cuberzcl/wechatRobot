const axios = require('axios')

var newsTimeOut = false

exports.mainFunc = (val, msg) => {
  // msg.say('你好')
  // msg.say(val)
  var func = eval(val)
  func(msg)
}

// getNews = params => axios.get('http://news.topurl.cn/api?count', { params })
var getNews = async (msg, params) => {
  if (newsTimeOut) {
    return msg.say('有人刚刚调用过了，给👴🏻等个2分钟再来！')
  }

  msg.say('CL祈祷中~')
  setTimeout(() => {
    newsTimeOut = false
  }, 120000)

  let { data: res } = await axios
    .get('http://news.topurl.cn/api?count=8', { params })
    .catch(err => {
      return console.log(err)
    })
  if (res.code === 200) {
    var data = res.data
    var calendar = data.calendar
    var strs = []
    strs[0] = `CL简报：\n\n    今天是${calendar.cYear}年${calendar.cMonth}月${calendar.cDay}日${calendar.ncWeek}，农历${calendar.monthCn}${calendar.dayCn}。`

    var historyList = data.historyList
    strs[1] = `\n历史上的今天：\n\n    1、${historyList[0].event}\n\n    2、${historyList[1].event}\n\n    3、${historyList[2].event}`

    var newsList = data.newsList
    strs[2] = '\n时事新闻：\n\n'
    for (var i = 0; i < 8; i++) {
      strs[2] += `    ${i + 1}、${newsList[i].title}。\n\n`
    }

    var phrase = data.phrase
    var from = phrase.from != '' ? phrase.from : '暂无'
    var example = phrase.example != '' ? phrase.example : '暂无'
    strs[3] = `每日一词：\n\n${phrase.phrase}\n    解释：${phrase.explain}\n    出处：${from}\n    用例：${example}`

    var poem = data.poem
    strs[4] = `\n每日一诗：\n\n    ${poem.content.join('    ')}\n    ———${poem.author}《${
      poem.title
    }》`

    newsTimeOut = true
    msg.say(strs.join('\n'))
  }
}

exports.baike = async (msg, k) => {
  msg.say('CL祈祷中~')
  let { data: res } = await axios.get('http://baike.baidu.com/api/openapi/BaikeLemmaCardApi', {
    params: {
      scope: 103,
      format: 'json',
      appid: 379020,
      bk_key: k,
      bk_length: 600
    }
  })

  var str = "'" + k + "'" + '搜索结果：\n\n'
  str += `描述：\n\n    ${res.desc}\n\n`
  str += `简要：\n\n    ${res.abstract}\n\n`
  str += `    了解更多请访问 https://baike.baidu.com/item/${encodeURI(res.title)}`

  msg.say(str)
}
