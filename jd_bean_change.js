/**
 * cron "30 10,22 * * *" jd_bean_change.js, tag:资产变化强化版
 * 原版链接 https://raw.githubusercontent.com/shufflewzc/faker2/main/jd_bean_change.js
 * 支持环境变量控制每次发送的账号个数，默认为2
 * 环境变量为：JD_BEAN_CHANGE_SENDNUM | export JD_BEAN_CHANGE_SENDNUM=2
 */
const $ = new Env('京东日资产变动');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
let allMessage = '';
let ReturnMessage = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
$.sendNum = process.env.JD_BEAN_CHANGE_SENDNUM * 1 || 2;
$.sentNum = 0;

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    console.log('=====环境变量配置如下=====')
    console.log(`sendNum: ${typeof $.sendNum}, 每次发送的账号数量 ${$.sendNum}`)
    console.log('=======================')
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
            $.index = i + 1;
            $.beanCount = 0;
            $.incomeBean = 0;
            $.expenseBean = 0;
            $.todayIncomeBean = 0;
            $.todayOutcomeBean = 0;
            $.errorMsg = '';
            $.isLogin = true;
            $.nickName = '';
            $.message = '';
            $.balance = 0;
            $.expiredBalance = 0;
            $.JdzzNum=0;
            $.JdMsScore = 0;
            $.JdFarmProdName = '';
            $.JdtreeEnergy=0;
            $.JdtreeTotalEnergy=0;
            $.JdwaterTotalT = 0;
            $.JdwaterD = 0;
            $.JDwaterEveryDayT=0;
            $.JDtotalcash=0;
            $.JDEggcnt=0;
            $.Jxmctoken='';
            $.TotalMoney = 0;
            await TotalBean();
            await TotalBean2();
            console.log(`\n********开始【京东账号${$.index}】${$.nickName || $.UserName}******\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            await bean();
            await TotalMoney();//领现金
            await cash();
            await getJdZZ();
            await getMs();
            await jdfruitRequest('taskInitForFarm', {"version":14,"channel":1,"babelChannel":"120"});
            await getjdfruit();
            await requestAlgo();
            await JxmcGetRequest();
            await getJxFactory(); //惊喜工厂
            // await getDdFactoryInfo(); // 东东工厂
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

async function showMsg() {
    if ($.errorMsg) return
    //ReturnMessage=`📣=============账号${$.index}=============📣\n`

    ReturnMessage =`👤账号名称：${$.nickName || $.UserName} [账号${$.index}]\n`;

    if ($.levelName || $.JingXiang) ReturnMessage += `✉️账号信息：`;

    if ($.levelName) {
        if ($.levelName.length > 2) $.levelName = $.levelName.substring(0, 2);

        if ($.levelName == "注册")
            $.levelName = `😊普通`;
        else if ($.levelName == "金牌")
            $.levelName = `🥇金牌`;
        else if ($.levelName == "银牌")
            $.levelName = `🥈银牌`;
        else if ($.levelName == "铜牌")
            $.levelName = `🥉铜牌`;
        else if ($.levelName == "钻石")
            $.levelName = `💎钻石`;

        if ($.isPlusVip == 1)
            ReturnMessage += `${$.levelName}Plus,`;
        else
            ReturnMessage += `${$.levelName}会员,`;
    }

    if ($.JingXiang) ReturnMessage += ` ${$.JingXiang}\n`;

    ReturnMessage+=`🥔今日收支：${$.todayIncomeBean}京豆 🐶 - ${$.todayOutcomeBean}京豆\n`;
    ReturnMessage+=`🥔昨日收支：${$.incomeBean}京豆 🐶 - ${$.expenseBean}京豆\n`;
    ReturnMessage+=`🥔当前京豆：${$.beanCount}(今日将过期${$.expirejingdou})京豆\n`;
    ReturnMessage+=`🧧总计红包：${$.balance}(今日总过期${$.expiredBalance})元\n`
    ReturnMessage += `━╋━╋━\n`;

    if(typeof $.JDEggcnt !== "undefined"){
        ReturnMessage += `🥚京喜牧场：${$.JDEggcnt}枚鸡蛋\n`;
    }
    if ($.JdFarmProdName != "") {
      if ($.JdtreeEnergy != 0) {
        // ReturnMessage += `👨🏻‍🌾东东农场：${$.JdFarmProdName},进度${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(
        ReturnMessage += `👨🏻‍🌾东东农场：${$.JdFarmProdName}\n👨🏻‍🌾农场进度：${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(
          2
        )}%`;
        if ($.JdwaterD != "Infinity" && $.JdwaterD != "-Infinity") {
          ReturnMessage += `,${$.JdwaterD === 1 ? "明天" : $.JdwaterD === 2 ? "后天" : $.JdwaterD + "天后"}可兑\n`;
        } else {
          ReturnMessage += `\n`;
        }
      } else {
        ReturnMessage += `👨🏻‍🌾东东农场：${$.JdFarmProdName}\n`;
      }
    }

    const response = await PetRequest('energyCollect');
    const initPetTownRes = await PetRequest('initPetTown');
    if (initPetTownRes.code === '0' && initPetTownRes.resultCode === '0' && initPetTownRes.message === 'success') {
        $.petInfo = initPetTownRes.result;
        if (response.resultCode === '0') {
            ReturnMessage += `🐶东东萌宠：${$.petInfo.goodsInfo.goodsName},`;
            ReturnMessage += `\n🐶萌宠进度：勋章${response.result.medalNum}/${response.result.medalNum+response.result.needCollectMedalNum}块(${response.result.medalPercent}%)\n`;
            //ReturnMessage += `已有${response.result.medalNum}块勋章，还需${response.result.needCollectMedalNum}块\n`;
        }
    }

    if ($.jxFactoryInfo) {
      ReturnMessage += `👨🏻‍🔧京喜工厂：${$.jxFactoryInfo}\n`;
    }
    if ($.ddFactoryInfo) {
        ReturnMessage += `🏭东东工厂：${$.ddFactoryInfo}\n`;
    }
    ReturnMessage += `━╋━╋━\n`;
    if (typeof $.TotalMoney !== "undefined") {
        ReturnMessage += `💴签到现金：${$.TotalMoney}元\n`;
    }
    if($.JdMsScore !== 0){
        ReturnMessage += `💰京东秒杀：${$.JdMsScore}秒秒币(≈${$.JdMsScore / 1000}元)\n`;
    }
    if(typeof $.JdzzNum !== "undefined"){
        ReturnMessage += `💰京东赚赚：${$.JdzzNum}金币(≈${$.JdzzNum / 10000}元)\n`;
    }
    if(typeof $.JDtotalcash !== "undefined"){
        ReturnMessage += `💰极速金币：${$.JDtotalcash}金币(≈${$.JDtotalcash / 10000}元)\n`;
    }
    //ReturnMessage += `📣============红包明细============📣\n`;
    ReturnMessage += `━╋━╋━\n`;
    ReturnMessage += `🧧京东红包：${$.jdRed}(今日将过期${$.jdRedExpire.toFixed(2)})元\n`;
    ReturnMessage += `🧧京喜红包：${$.jxRed}(今日将过期${$.jxRedExpire.toFixed(2)})元\n`;
    ReturnMessage += `🧧极速红包：${$.jsRed}(今日将过期${$.jsRedExpire.toFixed(2)})元\n`;
    if ($.jdhRed != "0.00") ReturnMessage += `🧧健康红包：${$.jdhRed}(今日将过期${$.jdhRedExpire.toFixed(2)})元\n`;
    if($.sendNum > 1) {
        // ReturnMessage += `📣=============END ${$.index}=============📣\n\n`;
        ReturnMessage += `\n\n`;
    } else {
        // ReturnMessage += `📣=============END ${$.index}=============📣`;
    }
    allMessage += ReturnMessage;

    console.log(`[京东账号${$.index} ${$.UserName}] 结束\n`)
    $.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
    if( $.isNode() ){
        if($.index % $.sendNum === 0){
            $.sentNum++;
            console.log(`正在进行第 ${$.sentNum} 次发送通知，发送账号信息数量：${$.sendNum}`)
            await notify.sendNotify(`${$.name}`, `${allMessage}`, { url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean` })
            allMessage=""
        } else if((cookiesArr.length - ($.sentNum * $.sendNum)) < $.sendNum){
            console.log(`正在进行最后一次发送通知，发送账号信息数量：${(cookiesArr.length - ($.sentNum * $.sendNum))}`)
            await notify.sendNotify(`${$.name}`, `${allMessage}`, { url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean` })
            allMessage=""
        }
    }
}

async function bean() {
    // console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
    // console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
    // 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

    //前一天的0:0:0时间戳
    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
    // 今天0:0:0时间戳
    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
    let page = 1,
        t = 0,
        yesterdayArr = [],
        todayArr = [];
    do {
        let response = await getJingBeanBalanceDetail(page);
        // console.log(`第${page}页: ${JSON.stringify(response)}`);
        if (response && response.code === "0") {
            page++;
            let detailList = response.detailList;
            if (detailList && detailList.length > 0) {
                for (let item of detailList) {
                    const date = item.date.replace(/-/g, '/') + "+08:00";
                    if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes('扣赠'))) {
                        todayArr.push(item);
                    } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes('扣赠'))) {
                        //昨日的
                        yesterdayArr.push(item);
                    } else if (tm > new Date(date).getTime()) {
                        //前天的
                        t = 1;
                        break;
                    }
                }
            } else {
                $.errorMsg = `数据异常`;
                $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
                t = 1;
            }
        } else if (response && response.code === "3") {
            console.log(`cookie已过期，或者填写不规范，跳出`)
            t = 1;
        } else {
            console.log(`未知情况：${JSON.stringify(response)}`);
            console.log(`未知情况，跳出`)
            t = 1;
        }
    } while (t === 0);
    for (let item of yesterdayArr) {
        if (Number(item.amount) > 0) {
            $.incomeBean += Number(item.amount);
        } else if (Number(item.amount) < 0) {
            $.expenseBean += Number(item.amount);
        }
    }
    for (let item of todayArr) {
        if (Number(item.amount) > 0) {
            $.todayIncomeBean += Number(item.amount);
        } else if (Number(item.amount) < 0) {
            $.todayOutcomeBean += Number(item.amount);
        }
    }
    $.todayOutcomeBean = -$.todayOutcomeBean;
    $.expenseBean = -$.expenseBean;
    await queryexpirejingdou();//过期京豆
    $.todayOutcomeBean=$.todayOutcomeBean+$.expirejingdou;
    await redPacket(); //过期红包
    // console.log(`昨日收入：${$.incomeBean}个京豆 🐶`);
    // console.log(`昨日支出：${$.expenseBean}个京豆 🐶`)
}
//获取京豆数据
function getJingBeanBalanceDetail(page) {
    return new Promise(async resolve => {
        const options = {
            "url": `https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail`,
            "body": `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
            "headers": {
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Host': 'api.m.jd.com',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie,
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
                        // console.log(data)
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data);
            }
        })
    })
}

function queryexpirejingdou() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/activep3/singjd/queryexpirejingdou?_=${Date.now()}&g_login_type=1&sceneval=2`,
            "headers": {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Host": "wq.jd.com",
                "Referer": "https://wqs.jd.com/promote/201801/bean/mybean.html",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1"
            }
        }
        $.expirejingdou = 0;
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        // console.log(data)
                        data = JSON.parse(data.slice(23, -13));
                        // console.log(data)
                        if (data.ret === 0) {
                            data['expirejingdou'].map(item => {
                                console.log(`${timeFormat(item['time'] * 1000)}日过期京豆：${item['expireamount']}\n`);
                            })
                            $.expirejingdou = data['expirejingdou'][0]['expireamount'];
                            // if ($.expirejingdou > 0) {
                            //   $.message += `\n今日将过期：${$.expirejingdou}京豆 🐶`;
                            // }
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

function redPacket() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://m.jingxi.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=1&_=${+new Date()}&sceneval=2&g_login_type=1&g_ty=ls`,
            "headers": {
                'Host': 'm.jingxi.com',
                'Accept': '*/*',
                'Connection': 'keep-alive',
                'Accept-Language': 'zh-cn',
                'Referer': 'https://st.jingxi.com/my/redpacket.shtml?newPg=App&jxsid=16156262265849285961',
                'Accept-Encoding': 'gzip, deflate, br',
                "Cookie": cookie,
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data).data
                        $.jxRed = 0, $.jsRed = 0, $.jdRed = 0, $.jdhRed = 0, $.jxRedExpire = 0, $.jsRedExpire = 0, $.jdRedExpire = 0, $.jdhRedExpire = 0;
                        let t = new Date()
                        t.setDate(t.getDate() + 1)
                        t.setHours(0, 0, 0, 0)
                        t = parseInt((t - 1) / 1000)
                        for (let vo of data.useRedInfo.redList || []) {
                            if (vo.orgLimitStr && vo.orgLimitStr.includes("京喜")) {
                                $.jxRed += parseFloat(vo.balance)
                                if (vo['endTime'] === t) {
                                    $.jxRedExpire += parseFloat(vo.balance)
                                }
                            } else if (vo.activityName.includes("极速版")) {
                                $.jsRed += parseFloat(vo.balance)
                                if (vo['endTime'] === t) {
                                    $.jsRedExpire += parseFloat(vo.balance)
                                }
                            } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
                                $.jdhRed += parseFloat(vo.balance)
                                if (vo['endTime'] === t) {
                                    $.jdhRedExpire += parseFloat(vo.balance)
                                }
                            } else {
                                $.jdRed += parseFloat(vo.balance)
                                if (vo['endTime'] === t) {
                                    $.jdRedExpire += parseFloat(vo.balance)
                                }
                            }
                        }
                        $.jxRed = $.jxRed.toFixed(2)
                        $.jsRed = $.jsRed.toFixed(2)
                        $.jdRed = $.jdRed.toFixed(2)
                        $.jdhRed = $.jdhRed.toFixed(2)
                        $.balance = data.balance
                        $.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire).toFixed(2)
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function getJdZZ() {
    return new Promise(resolve => {
        $.get(taskJDZZUrl("interactTaskIndex"), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        $.JdzzNum = data.data.totalNum
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function taskJDZZUrl(functionId, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=9.1.0`,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
}

function getMs() {
    return new Promise(resolve => {
        $.post(taskMsPostUrl('homePageV2', {}, 'appid=SecKill2020'), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${err},${jsonParse(resp.body)['message']}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    // $.log(data)
                    if (safeGet(data)) {
                        data = JSON.parse(data)
                        if (data.code === 2041 || data.code === 2042) {
                            $.JdMsScore = data.result.assignment.assignmentPoints || 0
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function taskMsPostUrl(function_id, body = {}, extra = '', function_id2) {
    let url = `${JD_API_HOST}`;
    if (function_id2) {
        url += `?functionId=${function_id2}`;
    }
    return {
        url,
        body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&${extra}`,
        headers: {
            "Cookie": cookie,
            "origin": "https://h5.m.jd.com",
            "referer": "https://h5.m.jd.com/babelDiy/Zeus/2NUvze9e1uWf4amBhe1AV6ynmSuH/index.html",
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        }
    }
}

async function getjdfruit() {
    return new Promise(resolve => {
        const option =  {
            url: `${JD_API_HOST}?functionId=initForFarm`,
            body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
            headers: {
                "accept": "*/*",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "zh-CN,zh;q=0.9",
                "cache-control": "no-cache",
                "cookie": cookie,
                "origin": "https://home.m.jd.com",
                "pragma": "no-cache",
                "referer": "https://home.m.jd.com/myJd/newhome.action",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 10000,
        };
        $.post(option, (err, resp, data) => {
            try {
                if (err) {
                    console.log('\n东东农场: API查询请求失败 ‼️‼️');
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        $.farmInfo = JSON.parse(data)
                        if ($.farmInfo.farmUserPro) {
                            $.JdFarmProdName=$.farmInfo.farmUserPro.name;
                            $.JdtreeEnergy=$.farmInfo.farmUserPro.treeEnergy;
                            $.JdtreeTotalEnergy=$.farmInfo.farmUserPro.treeTotalEnergy;

                            let waterEveryDayT = $.JDwaterEveryDayT;
                            let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10;//一共还需浇多少次水
                            let waterD = Math.ceil(waterTotalT / waterEveryDayT);

                            $.JdwaterTotalT = waterTotalT;
                            $.JdwaterD = waterD;
                        }
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

function jdfruitRequest(function_id, body = {}, timeout = 1000){
    return new Promise(resolve => {
        setTimeout(() => {
            $.get(taskfruitUrl(function_id, body), (err, resp, data) => {
                try {
                    if (err) {
                        console.log('\n东东农场: API查询请求失败 ‼️‼️')
                        console.log(JSON.stringify(err));
                        console.log(`function_id:${function_id}`)
                        $.logErr(err);
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            $.JDwaterEveryDayT = data.totalWaterTaskInit.totalWaterTaskTimes;
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        }, timeout)
    })
}

async function PetRequest(function_id, body = {}) {
    await $.wait(3000);
    return new Promise((resolve) => {
        $.post(taskPetUrl(function_id, body), (err, resp, data) => {
            try {
                if (err) {
                    console.log('\n东东萌宠: API查询请求失败 ‼️‼️');
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data)
            }
        })
    })
}

function taskPetUrl(function_id, body = {}) {
    body["version"] = 2;
    body["channel"] = 'app';
    return {
        url: `${JD_API_HOST}?functionId=${function_id}`,
        body: `body=${escape(JSON.stringify(body))}&appid=wh5&loginWQBiz=pet-town&clientVersion=9.0.4`,
        headers: {
            'Cookie': cookie,
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Host': 'api.m.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };
}

function taskfruitUrl(function_id, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${function_id}&appid=wh5&body=${escape(JSON.stringify(body))}`,
        headers: {
            Cookie: cookie,
            UserAgent: $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        },
        timeout: 10000,
    }
}

function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}

//签到领现金
function TotalMoney() {
    return new Promise(resolve => {
        $.get({
            url: 'https://api.m.jd.com/client.action?functionId=cash_exchangePage&body=%7B%7D&build=167398&client=apple&clientVersion=9.1.9&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=762a8e894dea8cbfd91cce4dd5714bc5&st=1602179446935&sv=102',
            headers: {
                Cookie: cookie,
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code == 0 && data.data.bizCode == 0 && data.data.result) {
                            $.TotalMoney = data.data.result.totalMoney || 0
                            console.log(`京东-签到现金查询成功 ${$.TotalMoney}元\n`)
                        } else {
                            $.log(`京东-签到现金查询失败 ${data}\n`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function cash() {
    return new Promise(resolve => {
        $.get(taskcashUrl('MyAssetsService.execute',
            {"method": "userCashRecord", "data": {"channel": 1, "pageNum": 1, "pageSize": 20}}),
            async (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            $.JDtotalcash = data.data.goldBalance ;
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve(data);
                }
            })
    })
}

var __Oxb24bc = ["lite-android&", "stringify", "&android&3.1.0&", "&", "&846c4c32dae910ef", "12aea658f76e453faf803d15c40a72e0", "isNode", "crypto-js", "", "api?functionId=", "&body=", "&appid=lite-android&client=android&uuid=846c4c32dae910ef&clientVersion=3.1.0&t=", "&sign=", "api.m.jd.com", "*/*", "RN", "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)", "zh-Hans-CN;q=1, ja-CN;q=0.9", "undefined", "log", "", "", "", "", "jsjia", "mi.com"];

function taskcashUrl(_0x7683x2, _0x7683x3 = {}) {
    let _0x7683x4 = +new Date();
    let _0x7683x5 = `${__Oxb24bc[0x0]}${JSON[__Oxb24bc[0x1]](_0x7683x3)}${__Oxb24bc[0x2]}${_0x7683x2}${__Oxb24bc[0x3]}${_0x7683x4}${__Oxb24bc[0x4]}`;
    let _0x7683x6 = __Oxb24bc[0x5];
    const _0x7683x7 = $[__Oxb24bc[0x6]]() ? require(__Oxb24bc[0x7]) : CryptoJS;
    let _0x7683x8 = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
    return {
        url: `${__Oxb24bc[0x8]}${JD_API_HOST}${__Oxb24bc[0x9]}${_0x7683x2}${__Oxb24bc[0xa]}${escape(JSON[__Oxb24bc[0x1]](_0x7683x3))}${__Oxb24bc[0xb]}${_0x7683x4}${__Oxb24bc[0xc]}${_0x7683x8}${__Oxb24bc[0x8]}`,
        headers: {
            'Host': __Oxb24bc[0xd],
            'accept': __Oxb24bc[0xe],
            'kernelplatform': __Oxb24bc[0xf],
            'user-agent': __Oxb24bc[0x10],
            'accept-language': __Oxb24bc[0x11],
            'Cookie': cookie
        }
    }
}(function(_0x7683x9, _0x7683xa, _0x7683xb, _0x7683xc, _0x7683xd, _0x7683xe) {
    _0x7683xe = __Oxb24bc[0x12];
    _0x7683xc = function(_0x7683xf) {
        if (typeof alert !== _0x7683xe) {
            alert(_0x7683xf)
        };
        if (typeof console !== _0x7683xe) {
            console[__Oxb24bc[0x13]](_0x7683xf)
        }
    };
    _0x7683xb = function(_0x7683x7, _0x7683x9) {
        return _0x7683x7 + _0x7683x9
    };
    _0x7683xd = _0x7683xb(__Oxb24bc[0x14], _0x7683xb(_0x7683xb(__Oxb24bc[0x15], __Oxb24bc[0x16]), __Oxb24bc[0x17]));
    try {
        _0x7683x9 = __encode;
        if (!(typeof _0x7683x9 !== _0x7683xe && _0x7683x9 === _0x7683xb(__Oxb24bc[0x18], __Oxb24bc[0x19]))) {
            _0x7683xc(_0x7683xd)
        }
    } catch (e) {
        _0x7683xc(_0x7683xd)
    }
})({})

async function JxmcGetRequest() {
    let url = ``;
    let myRequest = ``;
    url = `https://m.jingxi.com/jxmc/queryservice/GetHomePageInfo?channel=7&sceneid=1001&activeid=null&activekey=null&isgift=1&isquerypicksite=1&_stk=channel%2Csceneid&_ste=1`;
    url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
    myRequest = getGetRequest(`GetHomePageInfo`, url);

    return new Promise(async resolve => {
        $.get(myRequest, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`API请求失败，请检查网路重试`)
                    $.runFlag = false;
                    console.log(`请求失败`)
                } else {
                    data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                    if (data.ret === 0) {
                        $.JDEggcnt=data.data.eggcnt;
                    }
                }
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
// 惊喜工厂信息查询
function getJxFactory() {
    return new Promise(async resolve => {
            let infoMsg = "";
            await $.get(jxTaskurl('userinfo/GetUserInfo', `pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=&source=`, '_time,materialTuanId,materialTuanPin,pin,sharePin,shareType,source,zone'), async (err, resp, data) => {
                try {
                    if (err) {
                        $.jxFactoryInfo = "查询失败!";
                        //console.log("jx工厂查询失败"  + err)
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            if (data['ret'] === 0) {
                                data = data['data'];
                                $.unActive = true;//标记是否开启了京喜活动或者选购了商品进行生产
                                if (data.factoryList && data.productionList) {
                                    const production = data.productionList[0];
                                    const factory = data.factoryList[0];
                                    //const productionStage = data.productionStage;
                                    $.commodityDimId = production.commodityDimId;
                                    // subTitle = data.user.pin;
                                    await GetCommodityDetails();//获取已选购的商品信息
                                    infoMsg = `${$.jxProductName} ,\n👨🏻‍🔧工厂进度：${((production.investedElectric / production.needElectric) * 100).toFixed(2)}%`;
                                    if (production.investedElectric >= production.needElectric) {
                                        if (production['exchangeStatus'] === 1) {
                                            infoMsg = `${$.jxProductName} ,\n👨🏻‍🔧工厂进度：已经可兑换，请手动兑换`;
                                        }
                                        if (production['exchangeStatus'] === 3) {
                                            if (new Date().getHours() === 9) {
                                                infoMsg = `${$.jxProductName} ,\n👨🏻‍🔧工厂进度：兑换已超时，请选择新商品进行制造`;
                                            }
                                        }
                                        // await exchangeProNotify()
                                    } else {
                                        infoMsg += ` ,预计:${((production.needElectric - production.investedElectric) / (1 * 60 * 60 * 24)).toFixed(2)}天可兑换`
                                    }
                                    if (production.status === 3) {
                                        infoMsg = `${$.jxProductName} ,已经超时失效, 请选择新商品进行制造`
                                    }
                                } else {
                                    $.unActive = false;//标记是否开启了京喜活动或者选购了商品进行生产
                                    if (!data.factoryList) {
                                        infoMsg = "当前未开始生产商品,请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动"
                                        // $.msg($.name, '【提示】', `京东账号${$.index}[${$.nickName}]京喜工厂活动未开始\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动`);
                                    } else if (data.factoryList && !data.productionList) {
                                        infoMsg = "当前未开始生产商品,请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动"
                                    }
                                }
                            }
                        } else {
                            console.log(`GetUserInfo异常：${JSON.stringify(data)}`)
                        }
                    }
                    $.jxFactoryInfo = infoMsg;
                    // console.log(infoMsg);
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve();
                }
            })
        }
    )
}

// 惊喜的Taskurl
function jxTaskurl(functionId, body = '', stk) {
    let url = `https://m.jingxi.com/dreamfactory/${functionId}?zone=dream_factory&${body}&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now() + 2}&_ste=1`
    url += `&h5st=${decrypt(Date.now(), stk, '', url)}`
    if (stk) {
        url += `&_stk=${encodeURIComponent(stk)}`;
    }
    return {
        url,
        headers: {
            'Cookie': cookie,
            'Host': 'm.jingxi.com',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'User-Agent': functionId === 'AssistFriend' ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36" : 'jdpingou',
            'Accept-Language': 'zh-cn',
            'Referer': 'https://wqsd.jd.com/pingou/dream_factory/index.html',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
}

//惊喜查询当前生产的商品名称
function GetCommodityDetails() {
    return new Promise(async resolve => {
        // const url = `/dreamfactory/diminfo/GetCommodityDetails?zone=dream_factory&sceneval=2&g_login_type=1&commodityId=${$.commodityDimId}`;
        $.get(jxTaskurl('diminfo/GetCommodityDetails', `commodityId=${$.commodityDimId}`, `_time,commodityId,zone`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data['ret'] === 0) {
                            data = data['data'];
                            $.jxProductName = data['commodityList'][0].name;
                        } else {
                            console.log(`GetCommodityDetails异常：${JSON.stringify(data)}`)
                        }
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

// 东东工厂信息查询
async function getDdFactoryInfo() {
    // 当心仪的商品存在，并且收集起来的电量满足当前商品所需，就投入
    let infoMsg = "";
    return new Promise(resolve => {
        $.post(ddFactoryTaskUrl('jdfactory_getHomeData'), async (err, resp, data) => {
            try {
                if (err) {
                    $.ddFactoryInfo = "获取失败!"
                    /*console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)*/
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.data.bizCode === 0) {
                            // $.newUser = data.data.result.newUser;
                            //let wantProduct = $.isNode() ? (process.env.FACTORAY_WANTPRODUCT_NAME ? process.env.FACTORAY_WANTPRODUCT_NAME : wantProduct) : ($.getdata('FACTORAY_WANTPRODUCT_NAME') ? $.getdata('FACTORAY_WANTPRODUCT_NAME') : wantProduct);
                            if (data.data.result.factoryInfo) {
                                let {
                                    totalScore,
                                    useScore,
                                    produceScore,
                                    remainScore,
                                    couponCount,
                                    name
                                } = data.data.result.factoryInfo;
                                infoMsg = `${name} 剩余${couponCount};电力投入情况 ${useScore}/${totalScore};当前总电力:${remainScore * 1 + useScore * 1} ;完成度:${((remainScore * 1 + useScore * 1) / (totalScore * 1)).toFixed(2) * 100}%`

                                if (((remainScore * 1 + useScore * 1) >= totalScore * 1 + 100000) && (couponCount * 1 > 0)) {
                                    // await jdfactory_addEnergy();
                                    infoMsg = `${name} ,目前数量:${couponCount},当前总电量为：${remainScore * 1 + useScore * 1},已经可以兑换此商品所需总电量：${totalScore},请🔥速去活动页面查看`
                                }

                            } else {
                                infoMsg = `当前未选择商品(或未开启活动) , 请到京东APP=>首页=>京东电器=>(底栏)东东工厂 选择商品!`
                            }
                        } else {
                            $.ddFactoryInfo = "获取失败!"
                            console.log(`异常：${JSON.stringify(data)}`)
                        }
                    }
                }
                $.ddFactoryInfo = infoMsg;
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function ddFactoryTaskUrl(function_id, body = {}, function_id2) {
    let url = `${JD_API_HOST}`;
    if (function_id2) {
        url += `?functionId=${function_id2}`;
    }
    return {
        url,
        body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.1.0`,
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": cookie,
            "Host": "api.m.jd.com",
            "Origin": "https://h5.m.jd.com",
            "Referer": "https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html",
            "User-Agent": "jdapp;iPhone;9.3.4;14.3;88732f840b77821b345bf07fd71f609e6ff12f43;network/4g;ADID/1C141FDD-C62F-425B-8033-9AAB7E4AE6A3;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,8;addressid/2005183373;supportBestPay/0;appBuild/167502;jdSupportDarkMode/0;pv/414.19;apprpd/Babel_Native;ref/TTTChannelViewContoller;psq/5;ads/;psn/88732f840b77821b345bf07fd71f609e6ff12f43|1701;jdv/0|iosapp|t_335139774|appshare|CopyURL|1610885480412|1610885486;adk/;app_device/IOS;pap/JA2015_311210|9.3.4|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        },
        timeout: 10000,
    }
}
function randomString(e) {
    e = e || 32;
    let t = "0123456789abcdef", a = t.length, n = "";
    for (let i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function getGetRequest(type, url) {
    UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`

    const method = `GET`;
    let headers = {
        'Origin': `https://st.jingxi.com`,
        'Cookie': cookie,
        'Connection': `keep-alive`,
        'Accept': `application/json`,
        'Referer': `https://st.jingxi.com/pingou/jxmc/index.html`,
        'Host': `m.jingxi.com`,
        'User-Agent': UA,
        'Accept-Encoding': `gzip, deflate, br`,
        'Accept-Language': `zh-cn`
    };
    return {url: url, method: method, headers: headers};
}

Date.prototype.Format = function (fmt) {
    var e,
        n = this, d = fmt, l = {
            "M+": n.getMonth() + 1,
            "d+": n.getDate(),
            "D+": n.getDate(),
            "h+": n.getHours(),
            "H+": n.getHours(),
            "m+": n.getMinutes(),
            "s+": n.getSeconds(),
            "w+": n.getDay(),
            "q+": Math.floor((n.getMonth() + 3) / 3),
            "S+": n.getMilliseconds()
        };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    for (var k in l) {
        if (new RegExp("(".concat(k, ")")).test(d)) {
            var t, a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
}

function decrypt(time, stk, type, url) {
    stk = stk || (url ? getJxmcUrlData(url, '_stk') : '')
    if (stk) {
        const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
        let hash1 = '';
        if ($.fingerprint && $.Jxmctoken && $.enCryptMethodJD) {
            hash1 = $.enCryptMethodJD($.Jxmctoken, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
        } else {
            const random = '5gkjB6SpmC9s';
            $.Jxmctoken = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
            $.fingerprint = 5287160221454703;
            const str = `${$.Jxmctoken}${$.fingerprint}${timestamp}${$.appId}${random}`;
            hash1 = $.CryptoJS.SHA512(str, $.Jxmctoken).toString($.CryptoJS.enc.Hex);
        }
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${getJxmcUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
        })
        const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
        return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.Jxmctoken), "".concat(hash2)].join(";"))
    } else {
        return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
    }
}

async function requestAlgo() {
    $.fingerprint = await generateFp();
    $.appId = 10028;
    const options = {
        "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
        "headers": {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'User-Agent':$.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            //'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Content-Type': 'application/json',
            'Origin': 'https://st.jingxi.com',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://st.jingxi.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "1.0",
            "fp": $.fingerprint,
            "appId": $.appId.toString(),
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        })
    }
    new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['status'] === 200) {
                            $.Jxmctoken = data.data.result.tk;
                            let enCryptMethodJDString = data.data.result.algo;
                            if (enCryptMethodJDString) $.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
                        } else {
                            console.log('request_algo 签名参数API请求失败:')
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

function generateFp() {
    let e = "0123456789";
    let a = 13;
    let i = '';
    for (; a--;)
        i += e[Math.random() * e.length | 0];
    return (i + Date.now()).slice(0, 16)
}

function getJxmcUrlData(url, name) {
    if (typeof URL !== "undefined") {
        let urls = new URL(url);
        let data = urls.searchParams.get(name);
        return data ? data : '';
    } else {
        const query = url.match(/\?.*/)[0].substring(1)
        const vars = query.split('&')
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=')
            if (pair[0] === name) {
                return vars[i].substr(vars[i].indexOf('=') + 1);
            }
        }
        return ''
    }
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
function timeFormat(time) {
    let date;
    if (time) {
        date = new Date(time)
    } else {
        date = new Date();
    }
    return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}

function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
            headers: {
                Host: "me-api.jd.com",
                Accept: "*/*",
                Connection: "keep-alive",
                Cookie: cookie,
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Accept-Language": "zh-cn",
                "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
                "Accept-Encoding": "gzip, deflate, br"
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err)
                } else {
                    if (data) {
                        data = JSON.parse(data);

                        if (data['retcode'] === "1001") {
                            $.isLogin = false; //cookie过期
                            return;
                        }
                        if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
                            $.nickName = data.data.userInfo.baseInfo.nickname;
                            $.levelName = data.data.userInfo.baseInfo.levelName;
                            $.isPlusVip = data.data.userInfo.isPlusVip;

                        }
                        if (data['retcode'] === '0' && data.data && data.data['assetInfo']) {
                            $.beanCount = data.data && data.data['assetInfo']['beanNum'];
                        } else {
                            $.errorMsg = `数据异常`;
                        }
                    } else {
                        $.log('京东服务器返回空数据,将无法获取等级及VIP信息');
                    }
                }
            } catch (e) {
                $.logErr(e)
            }
            finally {
                resolve();
            }
        })
    })
}
function TotalBean2() {
    return new Promise(async(resolve) => {
        const options = {
            url: `https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=${Date.now()}`,
            headers: {
                Cookie: cookie,
                'content-type': `application/x-www-form-urlencoded`,
                Connection: `keep-alive`,
                'Accept-Encoding': `gzip,compress,br,deflate`,
                Referer: `https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html`,
                Host: `wxapp.m.jd.com`,
                'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN`,
            },
        };
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err);
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (!data.user) {
                            $.isLogin = false; //cookie过期
                            return;
                        }
                        const userInfo = data.user;
                        if (userInfo) {
                            if (!$.nickName)
                                $.nickName = userInfo.unickName;
                            if ($.beanCount == 0) {
                                $.beanCount = userInfo.jingBean;
                                $.isPlusVip = 3;
                            }
                            $.JingXiang=userInfo.uclass;
                        }
                    } else {
                        $.log('京东服务器返回空数据');
                    }
                }
            } catch (e) {
                $.logErr(e);
            }
            finally {
                resolve();
            }
        });
    });
}

// prettier-ignore
function Env(name, opts) {
    class Http {
        constructor(env) {
            this.env = env
        }

        send(opts, method = 'GET') {
            opts = typeof opts === 'string' ? { url: opts } : opts
            let sender = this.get
            if (method === 'POST') {
                sender = this.post
            }
            return new Promise((resolve, reject) => {
                sender.call(this, opts, (err, resp, body) => {
                    if (err) reject(err)
                    else resolve(resp)
                })
            })
        }

        get(opts) {
            return this.send.call(this.env, opts)
        }

        post(opts) {
            return this.send.call(this.env, opts, 'POST')
        }
    }

    return new (class {
        constructor(name, opts) {
            this.name = name
            this.http = new Http(this)
            this.data = null
            this.dataFile = 'box.dat'
            this.logs = []
            this.isMute = false
            this.isNeedRewrite = false
            this.logSeparator = '\n'
            this.encoding = 'utf-8'
            this.startTime = new Date().getTime()
            Object.assign(this, opts)
            this.log('', `🔔${this.name}, 开始!`)
        }

        isNode() {
            return 'undefined' !== typeof module && !!module.exports
        }

        isQuanX() {
            return 'undefined' !== typeof $task
        }

        isSurge() {
            return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
        }

        isLoon() {
            return 'undefined' !== typeof $loon
        }

        isShadowrocket() {
            return 'undefined' !== typeof $rocket
        }

        toObj(str, defaultValue = null) {
            try {
                return JSON.parse(str)
            } catch {
                return defaultValue
            }
        }

        toStr(obj, defaultValue = null) {
            try {
                return JSON.stringify(obj)
            } catch {
                return defaultValue
            }
        }

        getjson(key, defaultValue) {
            let json = defaultValue
            const val = this.getdata(key)
            if (val) {
                try {
                    json = JSON.parse(this.getdata(key))
                } catch {}
            }
            return json
        }

        setjson(val, key) {
            try {
                return this.setdata(JSON.stringify(val), key)
            } catch {
                return false
            }
        }

        getScript(url) {
            return new Promise((resolve) => {
                this.get({ url }, (err, resp, body) => resolve(body))
            })
        }

        runScript(script, runOpts) {
            return new Promise((resolve) => {
                let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
                httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
                let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout')
                httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
                httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
                const [key, addr] = httpapi.split('@')
                const opts = {
                    url: `http://${addr}/v1/scripting/evaluate`,
                    body: { script_text: script, mock_type: 'cron', timeout: httpapi_timeout },
                    headers: { 'X-Key': key, 'Accept': '*/*' }
                }
                this.post(opts, (err, resp, body) => resolve(body))
            }).catch((e) => this.logErr(e))
        }

        loaddata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                if (isCurDirDataFile || isRootDirDataFile) {
                    const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
                    try {
                        return JSON.parse(this.fs.readFileSync(datPath))
                    } catch (e) {
                        return {}
                    }
                } else return {}
            } else return {}
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                const jsondata = JSON.stringify(this.data)
                if (isCurDirDataFile) {
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                } else if (isRootDirDataFile) {
                    this.fs.writeFileSync(rootDirDataFilePath, jsondata)
                } else {
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                }
            }
        }

        lodash_get(source, path, defaultValue = undefined) {
            const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
            let result = source
            for (const p of paths) {
                result = Object(result)[p]
                if (result === undefined) {
                    return defaultValue
                }
            }
            return result
        }

        lodash_set(obj, path, value) {
            if (Object(obj) !== obj) return obj
            if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
            path
                .slice(0, -1)
                .reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
                path[path.length - 1]
                ] = value
            return obj
        }

        getdata(key) {
            let val = this.getval(key)
            // 如果以 @
            if (/^@/.test(key)) {
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objval = objkey ? this.getval(objkey) : ''
                if (objval) {
                    try {
                        const objedval = JSON.parse(objval)
                        val = objedval ? this.lodash_get(objedval, paths, '') : val
                    } catch (e) {
                        val = ''
                    }
                }
            }
            return val
        }

        setdata(val, key) {
            let issuc = false
            if (/^@/.test(key)) {
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objdat = this.getval(objkey)
                const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
                try {
                    const objedval = JSON.parse(objval)
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                } catch (e) {
                    const objedval = {}
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                }
            } else {
                issuc = this.setval(val, key)
            }
            return issuc
        }

        getval(key) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.read(key)
            } else if (this.isQuanX()) {
                return $prefs.valueForKey(key)
            } else if (this.isNode()) {
                this.data = this.loaddata()
                return this.data[key]
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        setval(val, key) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.write(val, key)
            } else if (this.isQuanX()) {
                return $prefs.setValueForKey(val, key)
            } else if (this.isNode()) {
                this.data = this.loaddata()
                this.data[key] = val
                this.writedata()
                return true
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        initGotEnv(opts) {
            this.got = this.got ? this.got : require('got')
            this.cktough = this.cktough ? this.cktough : require('tough-cookie')
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
            if (opts) {
                opts.headers = opts.headers ? opts.headers : {}
                if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
                    opts.cookieJar = this.ckjar
                }
            }
        }

        get(opts, callback = () => {}) {
            if (opts.headers) {
                delete opts.headers['Content-Type']
                delete opts.headers['Content-Length']
            }
            if (this.isSurge() || this.isLoon()) {
                if (this.isSurge() && this.isNeedRewrite) {
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
                }
                $httpClient.get(opts, (err, resp, body) => {
                    if (!err && resp) {
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if (this.isQuanX()) {
                if (this.isNeedRewrite) {
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, { hints: false })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const { statusCode: status, statusCode, headers, body } = resp
                        callback(null, { status, statusCode, headers, body }, body)
                    },
                    (err) => callback(err)
                )
            } else if (this.isNode()) {
                let iconv = require('iconv-lite')
                this.initGotEnv(opts)
                this.got(opts)
                    .on('redirect', (resp, nextOpts) => {
                        try {
                            if (resp.headers['set-cookie']) {
                                const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
                                if (ck) {
                                    this.ckjar.setCookieSync(ck, null)
                                }
                                nextOpts.cookieJar = this.ckjar
                            }
                        } catch (e) {
                            this.logErr(e)
                        }
                        // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
                    })
                    .then(
                        (resp) => {
                            const { statusCode: status, statusCode, headers, rawBody } = resp
                            callback(null, { status, statusCode, headers, rawBody }, iconv.decode(rawBody, this.encoding))
                        },
                        (err) => {
                            const { message: error, response: resp } = err
                            callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
                        }
                    )
            }
        }

        post(opts, callback = () => {}) {
            const method = opts.method ? opts.method.toLocaleLowerCase() : 'post'
            // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
            if (opts.body && opts.headers && !opts.headers['Content-Type']) {
                opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
            if (opts.headers) delete opts.headers['Content-Length']
            if (this.isSurge() || this.isLoon()) {
                if (this.isSurge() && this.isNeedRewrite) {
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
                }
                $httpClient[method](opts, (err, resp, body) => {
                    if (!err && resp) {
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if (this.isQuanX()) {
                opts.method = method
                if (this.isNeedRewrite) {
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, { hints: false })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const { statusCode: status, statusCode, headers, body } = resp
                        callback(null, { status, statusCode, headers, body }, body)
                    },
                    (err) => callback(err)
                )
            } else if (this.isNode()) {
                let iconv = require('iconv-lite')
                this.initGotEnv(opts)
                const { url, ..._opts } = opts
                this.got[method](url, _opts).then(
                    (resp) => {
                        const { statusCode: status, statusCode, headers, rawBody } = resp
                        callback(null, { status, statusCode, headers, rawBody }, iconv.decode(rawBody, this.encoding))
                    },
                    (err) => {
                        const { message: error, response: resp } = err
                        callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
                    }
                )
            }
        }
        /**
         *
         * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
         *    :$.time('yyyyMMddHHmmssS')
         *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
         *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
         * @param {string} fmt 格式化参数
         * @param {number} 可选: 根据指定时间戳返回格式化日期
         *
         */
        time(fmt, ts = null) {
            const date = ts ? new Date(ts) : new Date()
            let o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'H+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds(),
                'q+': Math.floor((date.getMonth() + 3) / 3),
                'S': date.getMilliseconds()
            }
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
            for (let k in o)
                if (new RegExp('(' + k + ')').test(fmt))
                    fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
            return fmt
        }

        /**
         * 系统通知
         *
         * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
         *
         * 示例:
         * $.msg(title, subt, desc, 'twitter://')
         * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         *
         * @param {*} title 标题
         * @param {*} subt 副标题
         * @param {*} desc 通知详情
         * @param {*} opts 通知参数
         *
         */
        msg(title = name, subt = '', desc = '', opts) {
            const toEnvOpts = (rawopts) => {
                if (!rawopts) return rawopts
                if (typeof rawopts === 'string') {
                    if (this.isLoon()) return rawopts
                    else if (this.isQuanX()) return { 'open-url': rawopts }
                    else if (this.isSurge()) return { url: rawopts }
                    else return undefined
                } else if (typeof rawopts === 'object') {
                    if (this.isLoon()) {
                        let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
                        let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
                        return { openUrl, mediaUrl }
                    } else if (this.isQuanX()) {
                        let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
                        let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
                        return { 'open-url': openUrl, 'media-url': mediaUrl }
                    } else if (this.isSurge()) {
                        let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
                        return { url: openUrl }
                    }
                } else {
                    return undefined
                }
            }
            if (!this.isMute) {
                if (this.isSurge() || this.isLoon()) {
                    $notification.post(title, subt, desc, toEnvOpts(opts))
                } else if (this.isQuanX()) {
                    $notify(title, subt, desc, toEnvOpts(opts))
                }
            }
            if (!this.isMuteLog) {
                let logs = ['', '==============📣系统通知📣==============']
                logs.push(title)
                subt ? logs.push(subt) : ''
                desc ? logs.push(desc) : ''
                console.log(logs.join('\n'))
                this.logs = this.logs.concat(logs)
            }
        }

        log(...logs) {
            if (logs.length > 0) {
                this.logs = [...this.logs, ...logs]
            }
            console.log(logs.join(this.logSeparator))
        }

        logErr(err, msg) {
            const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
            if (!isPrintSack) {
                this.log('', `❗️${this.name}, 错误!`, err)
            } else {
                this.log('', `❗️${this.name}, 错误!`, err.stack)
            }
        }

        wait(time) {
            return new Promise((resolve) => setTimeout(resolve, time))
        }

        done(val = {}) {
            const endTime = new Date().getTime()
            const costTime = (endTime - this.startTime) / 1000
            this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
            this.log()
            if (this.isSurge() || this.isQuanX() || this.isLoon()) {
                $done(val)
            }
        }
    })(name, opts)
}
