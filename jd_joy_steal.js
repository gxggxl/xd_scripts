/*
Last Modified time: 2021-6-6 10:22:37
活动入口：京东APP我的-更多工具-宠汪汪
最近经常出现给偷好友积分与狗粮失败的情况，故建议cron设置为多次
jd宠汪汪偷好友积分与狗粮,及给好友喂食
偷好友积分上限是20个好友(即获得100积分)，帮好友喂食上限是20个好友(即获得200积分)，偷好友狗粮上限也是20个好友(最多获得120g狗粮)
IOS用户支持京东双账号,NodeJs用户支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
如果开启了给好友喂食功能，建议先凌晨0点运行jd_joy.js脚本获取狗粮后，再运行此脚本(jd_joy_steal.js)可偷好友积分，6点运行可偷好友狗粮
==========Quantumult X==========
[task_local]
#宠汪汪偷好友积分与狗粮
10 0-21/3 * * * jd_joy_steal.js, tag=宠汪汪偷好友积分与狗粮, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdcww.png, enabled=true

=======Loon========
[Script]
cron "10 0-21/3 * * *" script-path=jd_joy_steal.js,tag=宠汪汪偷好友积分与狗粮

========Surge==========
宠汪汪偷好友积分与狗粮 = type=cron,cronexp="10 0-21/3 * * *",wake-system=1,timeout=3600,script-path=jd_joy_steal.js

=======小火箭=====
宠汪汪偷好友积分与狗粮 = type=cron,script-path=jd_joy_steal.js, cronexpr="10 0-21/3 * * *", timeout=3600, enable=true
*/
const $ = new Env('宠汪汪偷好友积分与狗粮');
const validator = require('./utils/JDJRValidator_Pure');
$.get = validator.injectToRequest($.get.bind($));
$.post = validator.injectToRequest($.post.bind($));
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
let message = '', subTitle = '';

let jdNotify = false;//是否开启静默运行，false关闭静默运行(即通知)，true打开静默运行(即不通知)
let jdJoyHelpFeed = true;//是否给好友喂食，false为不给喂食，true为给好友喂食，默认给好友喂食
let jdJoyStealCoin = true;//是否偷好友积分与狗粮，false为否，true为是，默认是偷
const JD_API_HOST = 'https://jdjoy.jd.com/pet';
//是否给好友喂食
let ctrTemp;
if ($.isNode() && process.env.JOY_HELP_FEED) {
  ctrTemp = `${process.env.JOY_HELP_FEED}` === 'true';
} else if ($.getdata('jdJoyHelpFeed')) {
  ctrTemp = $.getdata('jdJoyHelpFeed') === 'true';
} else {
  ctrTemp = `${jdJoyHelpFeed}` === 'true';
}
//是否偷好友狗粮
let jdJoyStealCoinTemp;
if ($.isNode() && process.env.jdJoyStealCoin) {
  jdJoyStealCoinTemp = `${process.env.jdJoyStealCoin}` === 'true';
} else if ($.getdata('jdJoyStealCoin')) {
  jdJoyStealCoinTemp = $.getdata('jdJoyStealCoin') === 'true';
} else {
  jdJoyStealCoinTemp = `${jdJoyStealCoin}` === 'true';
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      $.HelpFeedFlag = ctrTemp;
      if (!ctrTemp) $.HelpFeedFlag = true
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      $.validate = '';
      // const zooFaker = require('./utils/JDJRValidator_Pure');
      // $.validate = await zooFaker.injectToRequest()
      await jdJoySteal();
      await showMsg();
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdJoySteal() {
  try {
    $.helpFood = 0;
    $.stealFriendCoin = 0;
    $.stealFood = 0;
    $.stealStatus = null;
    $.helpFeedStatus = null;
    message += `【京东账号${$.index}】${$.nickName}\n`;
    await enterRoom()
    await getFriends();//查询是否有好友
    await getCoinChanges();//查询喂食好友和偷好友积分是否已达上限
    if ($.getFriendsData && $.getFriendsData.success) {
      if (!$.getFriendsData.datas) {
        console.log(`\n京东返回宠汪汪好友列表数据为空\n`)
        return
      }
      if ($.getFriendsData && $.getFriendsData.datas && $.getFriendsData.datas.length  > 0) {
        const { lastPage } = $.getFriendsData.page;
        // console.log('lastPage', lastPage)
        console.log(`\n共 ${lastPage * 20 - 1} 个好友\n`);
        $.allFriends = [];
        for (let i = 1; i <= new Array(lastPage).fill('').length; i++) {
          if ($.visit_friend >= 100 || $.stealFriendCoin * 1 >= 100) {
            console.log('偷好友积分已达上限(已获得100积分) 跳出\n')
            $.stealFriendCoin = `已达上限(已获得100积分)`;
            break
          }
          console.log(`偷好友积分 开始查询第${i}页好友\n`);
          await getFriends(i);
          $.allFriends = $.getFriendsData.datas;
          if ($.allFriends) await stealFriendCoinFun();
        }
        for (let i = 1; i <= new Array(lastPage).fill('').length; i++) {
          if ($.stealStatus === 'chance_full') {
            console.log('偷好友狗粮已达上限 跳出\n')
            if (!$.stealFood) {
              $.stealFood = `已达上限`;
            }
            break
          }
          if (nowTimes.getHours() < 6 && nowTimes.getHours() >= 0) {
            $.log('未到早餐时间, 暂不能偷好友狗粮\n')
            break
          }
          if (nowTimes.getHours() === 10 ? (nowTimes.getMinutes() > 30) : (nowTimes.getHours() === 11 && nowTimes.getMinutes() < 30)) {
            $.log('未到中餐时间, 暂不能偷好友狗粮\n')
            break
          }
          if ((nowTimes.getHours() >= 15 && nowTimes.getMinutes() > 0) && (nowTimes.getHours() < 17 && nowTimes.getMinutes() <= 59)) {
            $.log('未到晚餐时间, 暂不能偷好友狗粮\n')
            break
          }
          if (nowTimes.getHours() >= 21 && nowTimes.getMinutes() > 0 && nowTimes.getHours() <= 23 && nowTimes.getMinutes() <= 59) {
            $.log('已过晚餐时间, 暂不能偷好友狗粮\n')
            break
          }
          console.log(`偷好友狗粮 开始查询第${i}页好友\n`);
          await getFriends(i);
          $.allFriends = $.getFriendsData.datas;
          if ($.allFriends) await stealFriendsFood();
        }
        for (let i = 1; i <= new Array(lastPage).fill('').length; i++) {
          if ($.help_feed >= 200 || ($.helpFeedStatus && $.helpFeedStatus === 'chance_full')) {
            console.log('帮好友喂食已达上限(已帮喂20个好友获得200积分) 跳出\n');
            $.helpFood = '已达上限(已帮喂20个好友获得200积分)'
            break
          }
          if ($.helpFeedStatus && $.helpFeedStatus === 'food_insufficient') {
            console.log('帮好友喂食失败，狗粮不足10g 跳出\n');
            break
          }
          if ($.help_feed >= 10) $.HelpFeedFlag = ctrTemp;//修复每次运行都会给好友喂食一次的bug
          if (!$.HelpFeedFlag) {
            console.log('您已设置不为好友喂食，现在跳过喂食，如需为好友喂食请在BoxJs打开喂食开关或者更改脚本 jdJoyHelpFeed 处');
            break
          }
          console.log(`帮好友喂食 开始查询第${i}页好友\n`);
          await getFriends(i);
          $.allFriends = $.getFriendsData.datas;
          if ($.allFriends) await helpFriendsFeed();
        }
      }
    } else {
      message += `${$.getFriendsData && $.getFriendsData.errorMessage}\n`;
    }
  } catch (e) {
    $.logErr(e)
  }
}
async function stealFriendsFood() {
  console.log(`开始偷好友狗粮`);
  for (let friends of $.allFriends) {
    const { friendPin, status, stealStatus } = friends;
    $.stealStatus = stealStatus;
    console.log(`stealFriendsFood---好友【${friendPin}】--偷食状态：${stealStatus}\n`);
    // console.log(`stealFriendsFood---好友【${friendPin}】--喂食状态：${status}\n`);
    if (stealStatus === 'can_steal') {
      //可偷狗粮
      //偷好友狗粮
      console.log(`发现好友【${friendPin}】可偷狗粮\n`)
      await enterFriendRoom(friendPin);
      await doubleRandomFood(friendPin);
      const getRandomFoodRes = await getRandomFood(friendPin);
      console.log(`偷好友狗粮结果：${JSON.stringify(getRandomFoodRes)}`)
      if (getRandomFoodRes && getRandomFoodRes.success) {
        if (getRandomFoodRes.errorCode === 'steal_ok') {
          $.stealFood += getRandomFoodRes.data;
        } else if (getRandomFoodRes.errorCode === 'chance_full') {
          console.log('偷好友狗粮已达上限，跳出循环');
          break;
        }
      }
    } else if (stealStatus === 'chance_full') {
      console.log('偷好友狗粮已达上限，跳出循环');
      break;
    }
  }
}
//偷好友积分
async function stealFriendCoinFun() {
  if (jdJoyStealCoinTemp) {
    if ($.visit_friend !== 100) {
      console.log('开始偷好友积分')
      for (let friends of $.allFriends) {
        const { friendPin } = friends;
        if (friendPin === $.UserName) continue
        await stealFriendCoin(friendPin);//领好友积分
        if ($.stealFriendCoin * 1 === 100) {
          console.log(`偷好友积分已达上限${$.stealFriendCoin}个，现跳出循环`)
          break
        }
      }
    } else {
      console.log('偷好友积分已达上限(已获得100积分)')
      $.stealFriendCoin = `已达上限(已获得100积分)`
    }
  }
}
//给好友喂食
async function helpFriendsFeed() {
  if ($.help_feed !== 200) {
    if ($.HelpFeedFlag) {
      console.log(`\n开始给好友喂食`);
      for (let friends of $.allFriends) {
        const { friendPin, status, stealStatus } = friends;
        console.log(`\nhelpFriendsFeed---好友【${friendPin}】--喂食状态：${status}`);
        if (status === 'not_feed') {
          const helpFeedRes = await helpFeed(friendPin);
          // console.log(`帮忙喂食结果--${JSON.stringify(helpFeedRes)}`)
          $.helpFeedStatus = helpFeedRes.errorCode;
          if (helpFeedRes && helpFeedRes.errorCode === 'help_ok' && helpFeedRes.success) {
            console.log(`帮好友[${friendPin}]喂食10g狗粮成功,你获得10积分\n`);
            if (!ctrTemp) {
              $.log('为完成为好友单独喂食一次的任务，故此处进行喂食一次')
              $.HelpFeedFlag = false;
              break
            }
            $.helpFood += 10;
          } else if (helpFeedRes && helpFeedRes.errorCode === 'chance_full') {
            console.log('喂食已达上限,不再喂食\n')
            break
          } else if (helpFeedRes && helpFeedRes.errorCode === 'food_insufficient') {
            console.log('帮好友喂食失败，您的狗粮不足10g\n')
            break
          } else {
            console.log(JSON.stringify(helpFeedRes))
          }
        } else if (status === 'time_error') {
          console.log(`帮好友喂食失败,好友[${friendPin}]的汪汪正在食用\n`)
        }
      }
    } else {
      console.log('您已设置不为好友喂食，现在跳过喂食，如需为好友喂食请在BoxJs打开喂食开关或者更改脚本 jdJoyHelpFeed 处')
    }
  } else {
    console.log('帮好友喂食已达上限(已帮喂20个好友获得200积分)')
    $.helpFood = '已达上限(已帮喂20个好友获得200积分)'
  }
}
function enterRoom() {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/enterRoom/h5?reqSource=weapp&invitePin=&openId=`;
    const host = `draw.jdfcloud.com`;
    const reqSource = 'weapp';
    let opt = {
      url: `//draw.jdfcloud.com/common/pet/enterRoom/h5?invitePin=&openId=&invokeKey=qRKHmL4sna8ZOP9F`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.post({...taskPostUrl(url.replace(/reqSource=h5/, 'reqSource=weapp'), host, reqSource),body:'{}'}, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('JSON.parse(data)', JSON.parse(data))
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function getFriends(currentPage = '1') {
  return new Promise(resolve => {
    let opt = {
      url: `//draw.jdfcloud.com//common/pet/api/getFriends?itemsPerPage=20&currentPage=${currentPage * 1}&invokeKey=qRKHmL4sna8ZOP9F`,
      // url: `//draw.jdfcloud.com/common/pet/getPetTaskConfig?reqSource=h5&invokeKey=qRKHmL4sna8ZOP9F`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    const options = {
      url: url.replace(/reqSource=h5/, 'reqSource=weapp'),
      headers: {
        'Cookie': cookie,
        // 'reqSource': 'h5',
        'Host': 'draw.jdfcloud.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Referer': 'https://jdjoy.jd.com/pet/index',
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      timeout: 10000
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
          throw new Error(err);
        } else {
          // console.log('JSON.parse(data)', JSON.parse(data))
          if (data) {
            $.getFriendsData = JSON.parse(data);
          } else {
            console.log(`京豆api返回数据为空，请检查自身原因`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

async function stealFriendCoin(friendPin) {
  // console.log(`进入好友 ${friendPin}的房间`)
  const enterFriendRoomRes = await enterFriendRoom(friendPin);
  if (enterFriendRoomRes) {
    const { friendHomeCoin } =  enterFriendRoomRes.data;
    if (friendHomeCoin > 0) {
      //领取好友积分
      console.log(`好友 ${friendPin}的房间可领取积分${friendHomeCoin}个\n`)
      const getFriendCoinRes = await getFriendCoin(friendPin);
      console.log(`偷好友积分结果：${JSON.stringify(getFriendCoinRes)}\n`)
      if (getFriendCoinRes && getFriendCoinRes.errorCode === 'coin_took_ok') {
        $.stealFriendCoin += getFriendCoinRes.data;
      }
    } else {
      console.log(`好友 ${friendPin}的房间暂无可领取积分\n`)
    }
  }
}
//进入好友房间
function enterFriendRoom(friendPin) {
  console.log(`\nfriendPin:: ${friendPin}\n`);
  return new Promise(async resolve => {
    $.get(taskUrl('enterFriendRoom', (friendPin)), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
          console.log(`\n${JSON.stringify(err)}`)
          console.log(`\n${err}\n`)
          throw new Error(err);
        } else {
          // console.log('进入好友房间', JSON.parse(data))
          if (data) {
            data = JSON.parse(data);
            console.log(`可偷狗粮：${data.data.stealFood}`)
            console.log(`可偷积分：${data.data.friendHomeCoin}`)
          } else {
            console.log(`京豆api返回数据为空，请检查自身原因`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//收集好友金币
function getFriendCoin(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('getFriendCoin', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
          throw new Error(err);
        } else {
          if (data) {
            data = JSON.parse(data);
          } else {
            console.log(`京豆api返回数据为空，请检查自身原因`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//帮好友喂食
function helpFeed(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('helpFeed', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
          throw new Error(err);
        } else {
          if (data) {
            data = JSON.parse(data);
          } else {
            console.log(`京豆api返回数据为空，请检查自身原因`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//收集好友狗粮,已实现分享可得双倍狗粮功能
//①分享
function doubleRandomFood(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('doubleRandomFood', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
          throw new Error(err);
        } else {
          // console.log('分享', JSON.parse(data))
          // $.appGetPetTaskConfigRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//②领取双倍狗粮
function getRandomFood(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('getRandomFood', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
          throw new Error(err);
        } else {
          if (data) {
            console.log(`领取双倍狗粮结果--${data}`)
            data = JSON.parse(data);
          } else {
            console.log(`京豆api返回数据为空，请检查自身原因`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function getCoinChanges() {
  return new Promise(resolve => {
    let opt = {
      url: `//jdjoy.jd.com/common/pet/getCoinChanges?changeDate=${Date.now()}&invokeKey=qRKHmL4sna8ZOP9F`,
      // url: "//draw.jdfcloud.com/common/pet/getPetTaskConfig?reqSource=h5",
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    const options = {
      url,
      headers: {
        'Cookie': cookie,
        // 'reqSource': 'h5',
        'Host': 'jdjoy.jd.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Referer': 'https://jdjoy.jd.com/pet/index',
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
          throw new Error(err);
        } else {
          // console.log('getCoinChanges', JSON.parse(data))
          if (data) {
            data = JSON.parse(data);
            if (data.datas && data.datas.length > 0) {
              $.help_feed = 0;
              $.visit_friend = 0;
              for (let item of data.datas) {
                if ($.time('yyyy-MM-dd') === timeFormat(item.createdDate) && item.changeEvent === 'help_feed'){
                  $.help_feed = item.changeCoin;
                }
                if ($.time('yyyy-MM-dd') === timeFormat(item.createdDate) && item.changeEvent === 'visit_friend') {
                  $.visit_friend = item.changeCoin;
                }
              }
              console.log(`$.help_feed给好友喂食获得积分：${$.help_feed}`);
              console.log(`$.visit_friend领取好友积分：${$.visit_friend}`);
            }
          } else {
            console.log(`京豆api返回数据为空，请检查自身原因`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function showMsg() {
  return new Promise(resolve => {
    $.stealFood = $.stealFood >= 0 ? `【偷好友狗粮】获取${$.stealFood}g狗粮\n` : `【偷好友狗粮】${$.stealFood}\n`;
    $.stealFriendCoin = $.stealFriendCoin >= 0 ? `【领取好友积分】获得${$.stealFriendCoin}个\n` : `【领取好友积分】${$.stealFriendCoin}\n`;
    $.helpFood = $.helpFood >= 0 ? `【给好友喂食】消耗${$.helpFood}g狗粮,获得积分${$.helpFood}个\n` : `【给好友喂食】${$.helpFood}\n`;
    message += $.stealFriendCoin;
    message += $.stealFood;
    message += $.helpFood;
    let flag;
    if ($.getdata('jdJoyStealNotify')) {
      flag = `${$.getdata('jdJoyStealNotify')}` === 'false';
    } else {
      flag = `${jdNotify}` === 'false';
    }
    if (flag) {
      $.msg($.name, '', message);
    } else {
      $.log(`\n${message}\n`);
    }
    resolve()
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function taskPostUrl(url, Host, reqSource) {
  return {
    url: url,
    headers: {
      'Cookie': cookie,
      // 'reqSource': reqSource,
      'Host': Host,
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'https://jdjoy.jd.com/pet/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function taskUrl(functionId, friendPin) {
  let opt = {
    url: `//jdjoy.jd.com/common/pet/${functionId}?friendPin=${encodeURI(friendPin)}&invokeKey=qRKHmL4sna8ZOP9F`,
    // url: `//draw.jdfcloud.com/common/pet/getPetTaskConfig?reqSource=h5`,
    method: "GET",
    data: {},
    credentials: "include",
    header: {"content-type": "application/json"}
  }
  const url = "https:"+ taroRequest(opt)['url'] + $.validate;
  return {
    url,
    headers: {
      'Cookie': cookie,
      // 'reqSource': 'h5',
      'Host': 'jdjoy.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'https://jdjoy.jd.com/pet/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time)
  } else {
    date = new Date();
  }
  return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxc489d=["\x69\x73\x4E\x6F\x64\x65","\x63\x72\x79\x70\x74\x6F\x2D\x6A\x73","\x39\x38\x63\x31\x34\x63\x39\x39\x37\x66\x64\x65\x35\x30\x63\x63\x31\x38\x62\x64\x65\x66\x65\x63\x66\x64\x34\x38\x63\x65\x62\x37","\x70\x61\x72\x73\x65","\x55\x74\x66\x38","\x65\x6E\x63","\x65\x61\x36\x35\x33\x66\x34\x66\x33\x63\x35\x65\x64\x61\x31\x32","\x63\x69\x70\x68\x65\x72\x74\x65\x78\x74","\x43\x42\x43","\x6D\x6F\x64\x65","\x50\x6B\x63\x73\x37","\x70\x61\x64","\x65\x6E\x63\x72\x79\x70\x74","\x41\x45\x53","\x48\x65\x78","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x42\x61\x73\x65\x36\x34","\x64\x65\x63\x72\x79\x70\x74","\x6C\x65\x6E\x67\x74\x68","\x6D\x61\x70","\x73\x6F\x72\x74","\x6B\x65\x79\x73","\x67\x69\x66\x74","\x70\x65\x74","\x69\x6E\x63\x6C\x75\x64\x65\x73","\x26","\x6A\x6F\x69\x6E","\x3D","\x3F","\x69\x6E\x64\x65\x78\x4F\x66","\x63\x6F\x6D\x6D\x6F\x6E\x2F","\x72\x65\x70\x6C\x61\x63\x65","\x68\x65\x61\x64\x65\x72","\x75\x72\x6C","\x72\x65\x71\x53\x6F\x75\x72\x63\x65\x3D\x68\x35","\x61\x73\x73\x69\x67\x6E","\x6D\x65\x74\x68\x6F\x64","\x47\x45\x54","\x64\x61\x74\x61","\x74\x6F\x4C\x6F\x77\x65\x72\x43\x61\x73\x65","\x6B\x65\x79\x43\x6F\x64\x65","\x63\x6F\x6E\x74\x65\x6E\x74\x2D\x74\x79\x70\x65","\x43\x6F\x6E\x74\x65\x6E\x74\x2D\x54\x79\x70\x65","","\x67\x65\x74","\x70\x6F\x73\x74","\x61\x70\x70\x6C\x69\x63\x61\x74\x69\x6F\x6E\x2F\x78\x2D\x77\x77\x77\x2D\x66\x6F\x72\x6D\x2D\x75\x72\x6C\x65\x6E\x63\x6F\x64\x65\x64","\x5F","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];function taroRequest(_0xe509x2){const _0xe509x3=$[__Oxc489d[0x0]]()?require(__Oxc489d[0x1]):CryptoJS;const _0xe509x4=__Oxc489d[0x2];const _0xe509x5=_0xe509x3[__Oxc489d[0x5]][__Oxc489d[0x4]][__Oxc489d[0x3]](_0xe509x4);const _0xe509x6=_0xe509x3[__Oxc489d[0x5]][__Oxc489d[0x4]][__Oxc489d[0x3]](__Oxc489d[0x6]);let _0xe509x7={"\x41\x65\x73\x45\x6E\x63\x72\x79\x70\x74":function _0xe509x8(_0xe509x2){var _0xe509x9=_0xe509x3[__Oxc489d[0x5]][__Oxc489d[0x4]][__Oxc489d[0x3]](_0xe509x2);return _0xe509x3[__Oxc489d[0xd]][__Oxc489d[0xc]](_0xe509x9,_0xe509x5,{"\x69\x76":_0xe509x6,"\x6D\x6F\x64\x65":_0xe509x3[__Oxc489d[0x9]][__Oxc489d[0x8]],"\x70\x61\x64\x64\x69\x6E\x67":_0xe509x3[__Oxc489d[0xb]][__Oxc489d[0xa]]})[__Oxc489d[0x7]].toString()},"\x41\x65\x73\x44\x65\x63\x72\x79\x70\x74":function _0xe509xa(_0xe509x2){var _0xe509x9=_0xe509x3[__Oxc489d[0x5]][__Oxc489d[0xe]][__Oxc489d[0x3]](_0xe509x2),_0xe509xb=_0xe509x3[__Oxc489d[0x5]][__Oxc489d[0x10]][__Oxc489d[0xf]](_0xe509x9);return _0xe509x3[__Oxc489d[0xd]][__Oxc489d[0x11]](_0xe509xb,_0xe509x5,{"\x69\x76":_0xe509x6,"\x6D\x6F\x64\x65":_0xe509x3[__Oxc489d[0x9]][__Oxc489d[0x8]],"\x70\x61\x64\x64\x69\x6E\x67":_0xe509x3[__Oxc489d[0xb]][__Oxc489d[0xa]]}).toString(_0xe509x3[__Oxc489d[0x5]].Utf8).toString()},"\x42\x61\x73\x65\x36\x34\x45\x6E\x63\x6F\x64\x65":function _0xe509xc(_0xe509x2){var _0xe509x9=_0xe509x3[__Oxc489d[0x5]][__Oxc489d[0x4]][__Oxc489d[0x3]](_0xe509x2);return _0xe509x3[__Oxc489d[0x5]][__Oxc489d[0x10]][__Oxc489d[0xf]](_0xe509x9)},"\x42\x61\x73\x65\x36\x34\x44\x65\x63\x6F\x64\x65":function _0xe509xd(_0xe509x2){return _0xe509x3[__Oxc489d[0x5]][__Oxc489d[0x10]][__Oxc489d[0x3]](_0xe509x2).toString(_0xe509x3[__Oxc489d[0x5]].Utf8)},"\x4D\x64\x35\x65\x6E\x63\x6F\x64\x65":function _0xe509xe(_0xe509x2){return _0xe509x3.MD5(_0xe509x2).toString()},"\x6B\x65\x79\x43\x6F\x64\x65":__Oxc489d[0x2]};const _0xe509xf=function _0xe509x10(_0xe509x2,_0xe509x9){if(_0xe509x2 instanceof  Array){_0xe509x9= _0xe509x9|| [];for(var _0xe509xb=0;_0xe509xb< _0xe509x2[__Oxc489d[0x12]];_0xe509xb++){_0xe509x9[_0xe509xb]= _0xe509x10(_0xe509x2[_0xe509xb],_0xe509x9[_0xe509xb])}}else {!(_0xe509x2 instanceof  Array)&& _0xe509x2 instanceof  Object?(_0xe509x9= _0xe509x9|| {},Object[__Oxc489d[0x15]](_0xe509x2)[__Oxc489d[0x14]]()[__Oxc489d[0x13]](function(_0xe509xb){_0xe509x9[_0xe509xb]= _0xe509x10(_0xe509x2[_0xe509xb],_0xe509x9[_0xe509xb])})):_0xe509x9= _0xe509x2};return _0xe509x9};const _0xe509x11=function _0xe509x12(_0xe509x2){for(var _0xe509x9=[__Oxc489d[0x16],__Oxc489d[0x17]],_0xe509xb=!1,_0xe509x3=0;_0xe509x3< _0xe509x9[__Oxc489d[0x12]];_0xe509x3++){var _0xe509x4=_0xe509x9[_0xe509x3];_0xe509x2[__Oxc489d[0x18]](_0xe509x4)&&  !_0xe509xb&& (_0xe509xb=  !0)};return _0xe509xb};const _0xe509x13=function _0xe509x14(_0xe509x2,_0xe509x9){if(_0xe509x9&& Object[__Oxc489d[0x15]](_0xe509x9)[__Oxc489d[0x12]]> 0){var _0xe509xb=Object[__Oxc489d[0x15]](_0xe509x9)[__Oxc489d[0x13]](function(_0xe509x2){return _0xe509x2+ __Oxc489d[0x1b]+ _0xe509x9[_0xe509x2]})[__Oxc489d[0x1a]](__Oxc489d[0x19]);return _0xe509x2[__Oxc489d[0x1d]](__Oxc489d[0x1c])>= 0?_0xe509x2+ __Oxc489d[0x19]+ _0xe509xb:_0xe509x2+ __Oxc489d[0x1c]+ _0xe509xb};return _0xe509x2};const _0xe509x15=function _0xe509x16(_0xe509x2){for(var _0xe509x9=_0xe509x6,_0xe509xb=0;_0xe509xb< _0xe509x9[__Oxc489d[0x12]];_0xe509xb++){var _0xe509x3=_0xe509x9[_0xe509xb];_0xe509x2[__Oxc489d[0x18]](_0xe509x3)&&  !_0xe509x2[__Oxc489d[0x18]](__Oxc489d[0x1e]+ _0xe509x3)&& (_0xe509x2= _0xe509x2[__Oxc489d[0x1f]](_0xe509x3,__Oxc489d[0x1e]+ _0xe509x3))};return _0xe509x2};var _0xe509x9=_0xe509x2,_0xe509xb=(_0xe509x9[__Oxc489d[0x20]],_0xe509x9[__Oxc489d[0x21]]);_0xe509xb+= (_0xe509xb[__Oxc489d[0x1d]](__Oxc489d[0x1c])>  -1?__Oxc489d[0x19]:__Oxc489d[0x1c])+ __Oxc489d[0x22];var _0xe509x17=function _0xe509x18(_0xe509x2){var _0xe509x9=_0xe509x2[__Oxc489d[0x21]],_0xe509xb=_0xe509x2[__Oxc489d[0x24]],_0xe509x3=void(0)=== _0xe509xb?__Oxc489d[0x25]:_0xe509xb,_0xe509x4=_0xe509x2[__Oxc489d[0x26]],_0xe509x6=_0xe509x2[__Oxc489d[0x20]],_0xe509x19=void(0)=== _0xe509x6?{}:_0xe509x6,_0xe509x1a=_0xe509x3[__Oxc489d[0x27]](),_0xe509x1b=_0xe509x7[__Oxc489d[0x28]],_0xe509x1c=_0xe509x19[__Oxc489d[0x29]]|| _0xe509x19[__Oxc489d[0x2a]]|| __Oxc489d[0x2b],_0xe509x1d=__Oxc489d[0x2b],_0xe509x1e=+ new Date();return _0xe509x1d= __Oxc489d[0x2c]!== _0xe509x1a&& (__Oxc489d[0x2d]!== _0xe509x1a|| __Oxc489d[0x2e]!== _0xe509x1c[__Oxc489d[0x27]]()&& _0xe509x4&& Object[__Oxc489d[0x15]](_0xe509x4)[__Oxc489d[0x12]])?_0xe509x7.Md5encode(_0xe509x7.Base64Encode(_0xe509x7.AesEncrypt(__Oxc489d[0x2b]+ JSON[__Oxc489d[0xf]](_0xe509xf(_0xe509x4))))+ __Oxc489d[0x2f]+ _0xe509x1b+ __Oxc489d[0x2f]+ _0xe509x1e):_0xe509x7.Md5encode(__Oxc489d[0x2f]+ _0xe509x1b+ __Oxc489d[0x2f]+ _0xe509x1e),_0xe509x11(_0xe509x9)&& (_0xe509x9= _0xe509x13(_0xe509x9,{"\x6C\x6B\x73":_0xe509x1d,"\x6C\x6B\x74":_0xe509x1e}),_0xe509x9= _0xe509x15(_0xe509x9)),Object[__Oxc489d[0x23]](_0xe509x2,{"\x75\x72\x6C":_0xe509x9})}(_0xe509x2= Object[__Oxc489d[0x23]](_0xe509x2,{"\x75\x72\x6C":_0xe509xb}));return _0xe509x17}(function(_0xe509x1f,_0xe509xf,_0xe509x20,_0xe509x21,_0xe509x1c,_0xe509x22){_0xe509x22= __Oxc489d[0x30];_0xe509x21= function(_0xe509x19){if( typeof alert!== _0xe509x22){alert(_0xe509x19)};if( typeof console!== _0xe509x22){console[__Oxc489d[0x31]](_0xe509x19)}};_0xe509x20= function(_0xe509x3,_0xe509x1f){return _0xe509x3+ _0xe509x1f};_0xe509x1c= _0xe509x20(__Oxc489d[0x32],_0xe509x20(_0xe509x20(__Oxc489d[0x33],__Oxc489d[0x34]),__Oxc489d[0x35]));try{_0xe509x1f= __encode;if(!( typeof _0xe509x1f!== _0xe509x22&& _0xe509x1f=== _0xe509x20(__Oxc489d[0x36],__Oxc489d[0x37]))){_0xe509x21(_0xe509x1c)}}catch(e){_0xe509x21(_0xe509x1c)}})({})
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
