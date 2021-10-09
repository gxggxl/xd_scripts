# 每3天的23:50分清理一次日志(互助码不清理，proc_file.sh对该文件进行了去重)
50 23 */3 * * find /scripts/logs -name '*.log' | grep -v 'sharecodeCollection' | xargs rm -rf
# 收集助力码
*/15 * * * * sh +x /scripts/docker/auto_help.sh collect >> /scripts/logs/auto_help_collect.log 2>&1
# 互助码
#1 0 * * * node /scripts/jd_get_share_code.js >> /scripts/logs/jd_get_share_code.log 2>&1
# Cookie检查
3 0,12 * * * node /scripts/jd_ckcheck.js >> /scripts/logs/jd_ckcheck.log 2>&1

##############短期活动##############
# 特物Z 活动时间：
7 8,9 * * * node /scripts/jd_superBrand.js >> /scripts/logs/jd_superBrand.log 2>&1
# 京东小魔方(9.29 24.00 结束)
13 1,10 * * * node /scripts/jd_mf.js >> /scripts/logs/jd_mf.log 2>&1
# 蚊子腿豆子 (9.21-10.16 10月16号应该可以参与瓜分)
3 6,18 1-16,21-30 9,10 * node /scripts/jd_decompression.js >> /scripts/logs/jd_decompression.log 2>&1
# 明星小店(星店长)9.18-10.9
5 19 1-9,19-30 9-10 * node /scripts/jd_star_shop.js >> /scripts/logs/jd_star_shop.log 2>&1

# 集魔方 (京东APP - 新品 - 集魔方)
16 5,13 * * * node /scripts/jd_mofang.js >> /scripts/logs/jd_mofang.log 2>&1

# 企有此礼(9.30 结束)
28 0 10-30 9 * node /scripts/jd_qycl.js >> /scripts/logs/jd_qycl.log 2>&1

# 内容鉴赏官 (9.30 结束，10月继续开启)
11 1,5 * * * node /scripts/jd_connoisseur.js >> /scripts/logs/jd_connoisseur.log 2>&1
# 心相印店铺活动  古蜀寻宝 (10.6 结束)
17 8,16 1-30 9-10 * node /scripts/jd_xinxiangyin.js >> /scripts/logs/jd_xinxiangyin.log 2>&1
# 送豆得豆
15 2,14 * * * node /scripts/jd_sendBeans.js >> /scripts/logs/jd_sendBeans.log 2>&1
# 众筹许愿池 活动时间：2021-08-01到2021-12-31
11 1,9 * * * node /scripts/jd_wish.js >> /scripts/logs/jd_wish.log 2>&1
# 小鸽有礼 - 每日抽奖(活动时间：2021-05-01至2021-05-31)
13 1,22,23 * * * node /scripts/jd_daily_lottery.js >> /scripts/logs/jd_daily_lottery.log 2>&1
# 超级粉丝互动 活动时间：XXX结束
1 0,1 * * * node /scripts/jd_wxFans.js >> /scripts/logs/jd_wxFans.log 2>&1
# 女装盲盒 活动时间：2021-08-05到2021-10-31
35 1,22 * * * node /scripts/jd_nzmh.js >> /scripts/logs/jd_nzmh.log 2>&1
# 京喜领88元红包(9.30结束)
0 0,12,21 * 7-10 * node /scripts/jd_jxlhb.js >> /scripts/logs/jd_jxlhb.log 2>&1
# 发财大赢家之翻翻乐 8.15结束
13,37 * * 7-10 * node /scripts/jd_big_winner.js >> /scripts/logs/jd_big_winner.log 2>&1
# 京东极速版红包(活动时间：2021-5-5至2021-8-31)
11 0,10,16 * * * node /scripts/jd_speed_redpocke.js >> /scripts/logs/jd_speed_redpocke.log 2>&1
# 金榜创造营 活动时间：2021-05-21至2021-12-31
0 1,22 * * * node /scripts/jd_gold_creator.js >> /scripts/logs/jd_gold_creator.log 2>&1
# 5G超级盲盒(活动时间：2021-08-2到2021-10-29)
0 0-23/3 * * * node /scripts/jd_mohe.js >> /scripts/logs/jd_mohe.log 2>&1
# 芥末小程序签到领现金 (12.31结束)
15 9,17 * * * node /scripts/jd_zsign.js >> /scripts/logs/jd_zsign.log 2>&1
# 芥么赚豪礼
22 1,13 * * * node /scripts/jd_genz.js >> /scripts/logs/jd_genz.log 2>&1
# 京东零食街 活动时间：年底
11 11,17 * * * node /scripts/jd_lsj.js >> /scripts/logs/jd_lsj.log 2>&1

##############长期活动##############
# 签到
5 0,21 * * * cd /scripts && node jd_bean_sign.js >> /scripts/logs/jd_bean_sign.log 2>&1
# 领券中心签到
7 0,6,18 * * * node /scripts/jd_ccSign.js >> /scripts/logs/jd_ccSign.log 2>&1
# 积分换话费
13 6,18 * * * node /scripts/jd_dwapp.js >> /scripts/logs/jd_dwapp.log 2>&1
# 升级赚京豆
9 0,10 * * * node /scripts/jd_sjzjd.js >> /scripts/logs/jd_sjzjd.log 2>&1
# 东东世界
13 1,9,15 * * * node /scripts/jd_ddworld.js >> /scripts/logs/jd_ddworld.log 2>&1
# 京喜签到
3 0,6,12 * * * node /scripts/jd_jxqd.js >> /scripts/logs/jd_jxqd.log 2>&1
# 领京豆额外奖励(每日可获得3京豆)
23 1,9,21 * * * node /scripts/jd_bean_home.js >> /scripts/logs/jd_bean_home.log 2>&1
# 京东签到图形验证
10 6,18 * * * node /scripts/jd_sign_graphics.js >> /scripts/logs/jd_sign_graphics.log 2>&1
#京东极速版签到+赚现金任务
13 1,10,13,17 * * * node /scripts/jd_speed_sign.js >> /scripts/logs/jd_speed_sign.log 2>&1
# 幸运大转盘
10 10,23 * * * node /scripts/jd_market_lottery.js >> /scripts/logs/jd_market_lottery.log 2>&1
# 签到领现金
5 */4 * * * node /scripts/jd_cash.js >> /scripts/logs/jd_cash.log 2>&1
# 领金贴
3 0,18 * * * node /scripts/jd_jin_tie.js >> /scripts/logs/jd_jin_tie.log 2>&1
# 早起福利
30 6 * * * node /scripts/jd_zqfl.js >> /scripts/logs/jd_zqfl.log 2>&1
# 店铺签到
45 0,23 * * * node /scripts/jd_shop_sign.js >> /scripts/logs/jd_shop_sign.log 2>&1
# 摇京豆
6 0,12,23 * * * node /scripts/jd_club_lottery.js >> /scripts/logs/jd_club_lottery.log 2>&1
# 天天加速
3 9 * * * node /scripts/jd_speed.js >> /scripts/logs/jd_speed.log 2>&1
# 东东电竞经理
15 10,16 * * * node /scripts/jd_Elecsport.js >> /scripts/logs/jd_Elecsport.log 2>&1
# 京东日资产变动通知
0 7,12,22 * * *  node /scripts/jd_bean_change.js >> /scripts/logs/jd_bean_change.log 2>&1
# 京东月资产变动通知 在每个月最后一天
45 22 28-31 * * [ "$(TZ=IST-32 date +%e)" -eq 1 ] && node /scripts/jd_all_bean_change.js >> /scripts/logs/jd_all_bean_change.log 2>&1
# 京东秒秒币
10 6,21 * * * node /scripts/jd_ms.js >> /scripts/logs/jd_ms.log 2>&1
# 京东全民开红包
1 1,2,13,23 * * * node /scripts/jd_redPacket.js >> /scripts/logs/jd_redPacket.log 2>&1
# 进店领豆
0 0,12 * * * node /scripts/jd_shop.js >> /scripts/logs/jd_shop.log 2>&1
# 京东抽奖机
0 0,12,23 * * * node /scripts/jd_lotteryMachine.js >> /scripts/logs/jd_lotteryMachine.log 2>&1
# 京东排行榜
11 0,12 * * * node /scripts/jd_rankingList.js >> /scripts/logs/jd_rankingList.log 2>&1
# 京东快递签到
32 7 * * * node /scripts/jd_kd.js >> /scripts/logs/jd_kd.log 2>&1
# 京东汽车(签到满500赛点可兑换500京豆)
41 7 * * * node /scripts/jd_car.js >> /scripts/logs/jd_car.log 2>&1
# 京东汽车旅程赛点兑换金豆
0 0 * * * node /scripts/jd_car_exchange.js >> /scripts/logs/jd_car_exchange.log 2>&1
# 京东赚赚(微信小程序)
6 0-4/1,11,12 * * * node /scripts/jd_jdzz.js >> /scripts/logs/jd_jdzz.log 2>&1
# 赚京豆(微信小程序)
25 0,9,18,23 * * * node /scripts/jd_syj.js >> /scripts/logs/jd_syj.log 2>&1
# 口袋书店
20 8,18 * * * node /scripts/jd_bookshop.js >> /scripts/logs/jd_bookshop.log 2>&1
# 闪购盲盒
43 8,22 * * * node /scripts/jd_sgmh.js >> /scripts/logs/jd_sgmh.log 2>&1
#京东直播（又回来了）
10-50/5 12,13,23 * * * node /scripts/jd_live.js >> /scripts/logs/jd_live.log 2>&1
#京东健康社区
13 1,6,22 * * * node /scripts/jd_health.js >> /scripts/logs/jd_health.log 2>&1
#京东健康社区收集健康能量
5-45/20 */4 * * * node /scripts/jd_health_collect.js >> /scripts/logs/jd_health_collect.log 2>&1

# 东东乐园
8 6,15,21 * * * node /scripts/jd_ddnc_farmpark.js >> /scripts/logs/jd_ddnc_farmpark.log 2>&1
# 东东农场(水果)
5 6,12,18,21 * * * node /scripts/jd_fruit.js >> /scripts/logs/jd_fruit.log 2>&1
# 东东萌宠
10 6,12,18,21 * * * node /scripts/jd_pet.js >> /scripts/logs/jd_pet.log 2>&1
# 东东超市
31 0,1-23/2 * * * node /scripts/jd_superMarket.js >> /scripts/logs/jd_superMarket.log 2>&1
# 东东超市兑换奖品
0,1 0 * * * node /scripts/jd_blueCoin.js >> /scripts/logs/jd_blueCoin.log 2>&1
# 东东小窝
16 0,10 * * * node /scripts/jd_small_home.js >> /scripts/logs/jd_small_home.log 2>&1
# 东东工厂
25 * * * * node /scripts/jd_jdfactory.js >> /scripts/logs/jd_jdfactory.log 2>&1
# 京东种豆得豆
8 6-23/1 * * * node /scripts/jd_plantBean.js >> /scripts/logs/jd_plantBean.log 2>&1
# 宠汪汪
7 */2 * * * node /scripts/jd_joy.js >> /scripts/logs/jd_joy.log 2>&1
# 宠汪汪喂食
*/20 0-23 * * * node /scripts/jd_joy_feedPets.js >> /scripts/logs/jd_joy_feedPets.log 2>&1
# 宠汪汪赛跑与邀请助力
1 9-19/3 * * * node /scripts/jd_joy_run.js >> /scripts/logs/jd_joy_run.log 2>&1
# 宠汪汪偷好友积分与狗粮
3 0-21/3 * * * node /scripts/jd_joy_steal.js >> /scripts/logs/jd_joy_steal.log 2>&1
# 宠汪汪积分兑换京豆
#0 8,16,0 * * * node /scripts/jd_joy_reward.js >> /scripts/logs/jd_joy_reward.log 2>&1

# 京喜工厂
13 * * * * node /scripts/jd_dreamFactory.js >> /scripts/logs/jd_dreamFactory.log 2>&1
# 京喜牧场
15 0,6-23/2 * * * node /scripts/jd_jxmc.js >> /scripts/logs/jd_jxmc.log 2>&1
# 京喜农场
#0 8,12,18 * * * node /scripts/jd_jxnc.js >> /scripts/logs/jd_jxnc.log 2>&1
# 京喜财富岛
3 * * * * node /scripts/jd_cfd.js >> /scripts/logs/jd_cfd.log 2>&1
# 京喜财富岛互助
9 0,1,9,14,18 * * * node /scripts/jd_cfd_help.js >> /scripts/logs/jd_cfd_help.log 2>&1

# 摇钱树
21 */4 * * * node /scripts/jd_moneyTree.js >> /scripts/logs/jd_moneyTree.log 2>&1
# 天天提鹅
30 2-23/3 * * * node /scripts/jd_daily_egg.js >> /scripts/logs/jd_daily_egg.log 2>&1
# 金融养猪
12 */6 * * * node /scripts/jd_pigPet.js >> /scripts/logs/jd_pigPet.log 2>&1

# 汪汪乐园养joy
6 */2 * * * node /scripts/jd_joy_park.js >> /scripts/logs/jd_joy_park.log 2>&1
# 汪汪乐园每日任务
19 7,9,17,20 * * * node /scripts/jd_joy_park_task.js >> /scripts/logs/jd_joy_park_task.log 2>&1

# 京东到家果园
08 0,3,8,11,17 * * * node /scripts/jd_dj_fruit.js >> /scripts/logs/jd_dj_fruit.log 2>&1
# 京东到家果园水车收水滴
3 * * * * node /scripts/jd_dj_fruit_collectWater.js >> /scripts/logs/jd_dj_fruit_collectWater.log 2>&1
# 京东到家鲜豆庄园
11 0 * * * node /scripts/jd_dj_plantBeans.js >> /scripts/logs/jd_dj_plantBeans.log 2>&1
# 京东到家鲜豆任务
11 0 * * * node /scripts/jd_dj_bean.js >> /scripts/logs/jd_dj_bean.log 2>&1
# 京东到家鲜豆庄园收水滴
3 * * * * node /scripts/jd_dj_getPoints.js >> /scripts/logs/jd_dj_getPoints.log 2>&1

#美丽研究院
#6 5,12,17 * * * node /scripts/jd_beauty.js >> /scripts/logs/jd_beauty.log 2>&1
#京东保价
3 15 * * * node /scripts/jd_price.js >> /scripts/logs/jd_price.log 2>&1

# 京喜购物返红包助力
1 */6 * * * node /scripts/jx_aid_cashback.js >> /scripts/logs/jx_aid_cashback.log 2>&1
# 宠汪汪跑验证码
#56 7,15,23 * * * rm -rf /scripts/jdvalidate.txt
58 7,15,23 * * * node /scripts/jd_work_validate.js >> /scripts/logs/jd_work_validate.log 2>&1
# 宠汪汪兑换
0 */8 * * * node /scripts/jd_exchange_joy.js >> /scripts/logs/jd_exchange_joy.log 2>&1

###################### 敏感操作 ######################
# 取关主播
30 23 * * * node /scripts/jd_unsubscriLive.js >> /scripts/logs/jd_unsubscriLive.log 2>&1
# 取关京东店铺商品
5 23 * * * node /scripts/jd_unsubscribe.js >> /scripts/logs/jd_unsubscribe.log 2>&1
# 京东试用
13 16 * * * node /scripts/jd_try.js >> /scripts/logs/jd_try.log 2>&1
# 删除优惠券(默认注释，如需要自己开启，如有误删，已删除的券可以在回收站中还原，慎用)
#20 9 * * 6 node /scripts/jd_delCoupon.js >> /scripts/logs/jd_delCoupon.log 2>&1
#家庭号(易黑号，默认注释)
#10 6,7 * * * node /scripts/jd_family.js >> /scripts/logs/jd_family.log 2>&1
