import { WechatyBuilder, ScanStatus, Message, Contact } from 'wechaty'

import qrTerm from 'qrcode-terminal'
// import { getNews } from './api/index.js'
import { FileBox } from 'file-box'

// const puppet = new PuppetPadlocal({ token: 'puppet_padlocal_xxx' })
/**
 *
 * 1. Declare your Bot!
 *
 */
const options = {
  name: 'ding-dong-bot'

  /**
   * You can specify different puppet for different IM protocols.
   * Learn more from https://wechaty.js.org/docs/puppet-providers/
   */
  // puppet: 'wechaty-puppet-whatsapp'

  /**
   * You can use wechaty puppet provider 'wechaty-puppet-service'
   *   which can connect to Wechaty Puppet Services
   *   for using more powerful protocol.
   * Learn more about services (and TOKEN)from https://wechaty.js.org/docs/puppet-services/
   */
  // puppet: 'wechaty-puppet-service'
  // puppetOptions: {
  //   token: 'xxx',
  // }
}

const bot = WechatyBuilder.build(options)

/**
 *
 * 2. Register event handlers for Bot
 *
 */

bot
  .on('logout', onLogout)
  .on('login', onLogin)
  .on('scan', onScan)
  .on('error', onError)
  .on('message', onMessage)
  /**
   *
   * 3. Start the bot!
   *
   */
  .start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await bot.stop()
    process.exit(-1)
  })

/**
 *
 * 4. You are all set. ;-]
 *
 */

/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrTerm.generate(qrcode)

    const qrcodeImageUrl = ['https://wechaty.js.org/qrcode/', encodeURIComponent(qrcode)].join('')

    console.info('onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  } else {
    console.info('onScan: %s(%s)', ScanStatus[status], status)
  }

  // console.info(`[${ScanStatus[status]}(${status})] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
}

function onLogin(user: Contact) {
  console.info(`${user.name()} login`)
}

function onLogout(user: Contact) {
  console.info(`${user.name()} logged out`)
}

function onError(e: Error) {
  console.error('Bot error:', e)
  /*
  if (bot.isLoggedIn) {
    bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
  */
}

/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
const fs = require('fs')
const mainOrders = require('./mainOrders.json')
const { mainFunc, baike } = require('./Func')

async function onMessage(msg: Message) {
  var userOrders = require('./userOrders.json')

  console.info(msg.toString())

  if (msg.self()) {
    console.info('Message discarded because its outgoing')
    // return
  }

  if (msg.age() > 2 * 60) {
    console.info('Message discarded because its TOO OLD(than 2 minutes)')
    return
  }

  if (msg.text() == '欢迎欢迎') {
    await msg.say('👴🏻来')
    return
  }
  if (msg.text().charAt(0) == '$') {
    var text = msg.text().slice(1)
    var res = false

    var textArr = text.split(' ')
    if (textArr[0] == '添加命令') {
      userOrders[textArr[1]] = textArr.slice(2).join(' ')

      fs.writeFile('./userOrders.json', JSON.stringify(userOrders), () => {})
      await msg.say('添加成功喵~')
      return
    }
    if (textArr[0] == '百科') {
      var k = textArr.slice(1).join(' ')
      baike(msg, k)
      return
    }

    for (let k in mainOrders) {
      if (text == k) {
        if (mainOrders[k].type == 'reply') {
          await msg.say(mainOrders[k].val)
        } else if (mainOrders[k].type == 'func') {
          await mainFunc(mainOrders[k].val, msg)
        } else if (mainOrders[k].type == 'pic') {
          await msg.say('CL祈祷中~')
          var length = mainOrders[k].val.length
          var index = Math.floor(Math.random() * length)
          const fileBox = FileBox.fromUrl(mainOrders[k].val[index])
          await msg.say(fileBox)
        }

        res = true
        break
      }
    }

    for (let k in userOrders) {
      if (text == k) {
        var isUrl = userOrders[k].indexOf('http')
        if (isUrl != -1) {
          const fileBox = FileBox.fromUrl(userOrders[k])
          await msg.say(fileBox)
        } else await msg.say(userOrders[k])
        res = true
        break
      }
    }
    if (!res) await msg.say('查询无果捏~')
  }
}
//set WECHATY_PUPPET=wechaty-puppet-padlocal
//set WECHATY_PUPPET_PADLOCAL_TOKEN=puppet_padlocal_fdff2942fdb84c1f922d04b346f13d1e
