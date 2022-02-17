# 每3天的23:50分清理一次日志(互助码不清理，proc_file.sh对该文件进行了去重)
50 23 */3 * * find /scripts/logs -name '*.log' | grep -v 'sharecodeCollection' | xargs rm -rf
# 收集助力码
*/15 * * * * sh +x /scripts/docker/auto_help.sh collect >> /scripts/logs/auto_help_collect.log 2>&1
# 互助码
3 0 * * * node /scripts/jd_get_share_code.js >> /scripts/logs/jd_get_share_code.log 2>&1
# Cookie检查
3 0,12 * * * node /scripts/jd_ckcheck.js >> /scripts/logs/jd_ckcheck.log 2>&1
##############短期活动##############
#白条抽奖
10 8,20 13-31,1-7 1,2 * node /scripts/jd_bt_sign.js >> /scripts/logs/jd_bt_sign.log 2>&1
#天天压岁钱
50 0,16 * * * node /scripts/jd_ttysq.js >> /scripts/logs/jd_ttysq.log 2>&1
# 京东特价 翻翻乐
33 0,6-23 * * * node /scripts/jd_jdtj_winner.js >> /scripts/logs/jd_jdtj_winner.log 2>&1
# 跳跳乐瓜分京豆(11.01-11.11)
15 */3 1-11 11 * node /scripts/jd_jump.js >> /scripts/logs/jd_jump.log 2>&1
# 发财大赢家之翻翻乐
13 * * * * node /scripts/jd_big_winner.js >> /scripts/logs/jd_big_winner.log 2>&1
#美妆馆选品官
23 8,9 * * * node /scripts/jd_selectionOfficer.js >> /scripts/logs/jd_selectionOfficer.log 2>&1
# 明星小店(星店长)9.18-10.9
5 19 1-9,19-30 9-10 * node /scripts/jd_star_shop.js >> /scripts/logs/jd_star_shop.log 2>&1
# 内容鉴赏官 (9.30 结束，10月继续开启)
11 8,18 * * * node /scripts/jd_connoisseur.js >> /scripts/logs/jd_connoisseur.log 2>&1
# 送豆得豆
15 2,14 * * * node /scripts/jd_sendBeans.js >> /scripts/logs/jd_sendBeans.log 2>&1
# 小鸽有礼 - 每日抽奖(活动时间：2021-05-01至2021-05-31)
13 1,22,23 * * * node /scripts/jd_daily_lottery.js >> /scripts/logs/jd_daily_lottery.log 2>&1
# 超级粉丝互动 活动时间：XXX结束
1 0,1 * * * node /scripts/jd_wxFans.js >> /scripts/logs/jd_wxFans.log 2>&1
# 女装盲盒 活动时间：2021-08-05到2021-10-31
35 1,22 * * * node /scripts/jd_nzmh.js >> /scripts/logs/jd_nzmh.log 2>&1
# 京东极速版红包(活动时间：2021-5-5至2021-8-31)
#21 0,16,21 * * * node /scripts/jd_speed_redpocke.js >> /scripts/logs/jd_speed_redpocke.log 2>&1
# 金榜创造营 活动时间：2021-05-21至2021-12-31
0 1,15,22 * * * node /scripts/jd_gold_creator.js >> /scripts/logs/jd_gold_creator.log 2>&1
# 5G超级盲盒(活动时间：2021-08-2到2021-10-29)
0 0,1-23/3 * * * node /scripts/jd_mohe.js >> /scripts/logs/jd_mohe.log 2>&1
# 芥么赚豪礼
22 1,13 * * * node /scripts/jd_genz.js >> /scripts/logs/jd_genz.log 2>&1
# 京东零食街 活动时间：年底
7 9,17 * * * node /scripts/jd_lsj.js >> /scripts/logs/jd_lsj.log 2>&1
# 京东金融-天天拼图
9 0,15 * * * node /scripts/jd_ttpt.js >> /scripts/logs/jd_ttpt.log 2>&1
# 特物Z 活动时间：
#5 15,20 * * * node /scripts/jd_superBrand.js >> /scripts/logs/jd_superBrand.log 2>&1
# 众筹许愿池 活动时间：2021-08-01到2021-12-31
17 5,21 * * * node /scripts/jd_wish.js >> /scripts/logs/jd_wish.log 2>&1
# 集魔方 (京东APP - 新品 - 集魔方)
19 09,21 * * * node /scripts/jd_mofang.js >> /scripts/logs/jd_mofang.log 2>&1
##############长期活动##############
# 签到
5 7,21 * * * cd /scripts && node jd_bean_sign.js >> /scripts/logs/jd_bean_sign.log 2>&1
# 领券中心签到
7 0,6,18 * * * node /scripts/jd_ccSign.js >> /scripts/logs/jd_ccSign.log 2>&1
# 翻牌签到
3 1,20 * * * node /scripts/jd_fanpai_sign.js >> /scripts/logs/jd_fanpai_sign.log 2>&1
# 愤怒的锦鲤
1 5,10 * * * node /scripts/jd_angryKoi.js >> /scripts/logs/jd_angryKoi.log 2>&1
# 积分换话费
13 6,19 * * * node /scripts/jd_dwapp.js >> /scripts/logs/jd_dwapp.log 2>&1
# 升级赚京豆
9 0,10 * * * node /scripts/jd_sjzjd.js >> /scripts/logs/jd_sjzjd.log 2>&1
# 京喜签到
#3 0,6,12 * * * node /scripts/jd_jxqd.js >> /scripts/logs/jd_jxqd.log 2>&1
# 京喜签到-喜豆
#10 5,11 * * * node /scripts/jx_sign_xd.js >> /scripts/logs/jx_sign_xd.log 2>&1
# 领京豆额外奖励(每日可获得3京豆)
23 1,9,21 * * * node /scripts/jd_bean_home.js >> /scripts/logs/jd_bean_home.log 2>&1
# 京东签到图形验证
31 6,21 * * * node /scripts/jd_sign_graphics.js >> /scripts/logs/jd_sign_graphics.log 2>&1
#京东极速版签到+赚现金任务
13 1,10,17 * * * node /scripts/jd_speed_sign.js >> /scripts/logs/jd_speed_sign.log 2>&1
# 幸运大转盘
10 10,23 * * * node /scripts/jd_market_lottery.js >> /scripts/logs/jd_market_lottery.log 2>&1
# 签到领现金
7 */2 * * * node /scripts/jd_cash.js >> /scripts/logs/jd_cash.log 2>&1
# 领金贴
3 0,18 * * * node /scripts/jd_jin_tie.js >> /scripts/logs/jd_jin_tie.log 2>&1
# 早起福利
30 6 * * * node /scripts/jd_zqfl.js >> /scripts/logs/jd_zqfl.log 2>&1
# 店铺签到
25 0,23 * * * node /scripts/jd_shop_sign.js >> /scripts/logs/jd_shop_sign.log 2>&1
# 摇京豆
6 0,12,23 * * * node /scripts/jd_club_lottery.js >> /scripts/logs/jd_club_lottery.log 2>&1
# 天天加速
3 9 * * * node /scripts/jd_speed.js >> /scripts/logs/jd_speed.log 2>&1
# 东东电竞经理
15 10,16 * * * node /scripts/jd_Elecsport.js >> /scripts/logs/jd_Elecsport.log 2>&1
# 京东日资产变动
30 22 * * *  node /scripts/jd_bean_change.js >> /scripts/logs/jd_bean_change.log 2>&1
# 京东月资产变动 在每个月最后一天
#45 22 28-31 * * [ "$(TZ=IST-32 date +%e)" -eq 1 ] && node /scripts/jd_all_bean_change.js >> /scripts/logs/jd_all_bean_change.log 2>&1
# 京东秒秒币
10 6,17 * * * node /scripts/jd_ms.js >> /scripts/logs/jd_ms.log 2>&1
# 京东全民开红包
#1 2,13,23 * * * node /scripts/jd_redPacket.js >> /scripts/logs/jd_redPacket.log 2>&1
# 进店领豆
0 0,12 * * * node /scripts/jd_shop.js >> /scripts/logs/jd_shop.log 2>&1
# 京东排行榜
11 0,12 * * * node /scripts/jd_rankingList.js >> /scripts/logs/jd_rankingList.log 2>&1
# 京东快递签到
32 7 * * * node /scripts/jd_kd.js >> /scripts/logs/jd_kd.log 2>&1
# 京东汽车(签到满500赛点可兑换500京豆)
41 7 * * * node /scripts/jd_car.js >> /scripts/logs/jd_car.log 2>&1
# 京东汽车旅程赛点兑换金豆
59 23 * * * sleep 58 && node /scripts/jd_car_exchange.js >> /scripts/logs/jd_car_exchange.log 2>&1
# 京东赚赚(微信小程序)
6 0-4/1,11,12 * * * node /scripts/jd_jdzz.js >> /scripts/logs/jd_jdzz.log 2>&1
# 赚京豆(微信小程序)
23 1,9,18,23 * * * node /scripts/jd_syj.js >> /scripts/logs/jd_syj.log 2>&1
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
8 6,15 * * * node /scripts/jd_ddnc_farmpark.js >> /scripts/logs/jd_ddnc_farmpark.log 2>&1
# 东东农场(水果)
15 6,19 * * * node /scripts/jd_fruit.js >> /scripts/logs/jd_fruit.log 2>&1
# 东东萌宠
10 6,12,18 * * * node /scripts/jd_pet.js >> /scripts/logs/jd_pet.log 2>&1
# 东东超市
#31 0,1-23/2 * * * node /scripts/jd_superMarket.js >> /scripts/logs/jd_superMarket.log 2>&1
# 东东超市兑换奖品
#0,1 0 * * * node /scripts/jd_blueCoin.js >> /scripts/logs/jd_blueCoin.log 2>&1
# 东东小窝
#16 0,10 * * * node /scripts/jd_small_home.js >> /scripts/logs/jd_small_home.log 2>&1
# 东东工厂
25 * * * * node /scripts/jd_jdfactory.js >> /scripts/logs/jd_jdfactory.log 2>&1
# 京东种豆得豆
8 6-23/1 * * * node /scripts/jd_plantBean.js >> /scripts/logs/jd_plantBean.log 2>&1

# 京喜工厂
13 * * * * node /scripts/jd_dreamFactory.js >> /scripts/logs/jd_dreamFactory.log 2>&1
# 京喜牧场
1 0-23/3 * * * node /scripts/jd_jxmc.js >> /scripts/logs/jd_jxmc.log 2>&1
# 京喜财富岛
17 0,6-23/2 * * * node /scripts/jd_cfd.js >> /scripts/logs/jd_cfd.log 2>&1
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
19 7,20 * * * node /scripts/jd_joy_park_task.js >> /scripts/logs/jd_joy_park_task.log 2>&1

#美丽研究院
15 6,11,20 * * * node /scripts/jd_beauty.js >> /scripts/logs/jd_beauty.log 2>&1

###################### 敏感操作 ######################
# 过期京豆兑换喜豆
25 22 * * * node /scripts/jd_exchangejxbeans.js >> /scripts/logs/jd_exchangejxbeans.log 2>&1
# 取关主播
15 22 * * * node /scripts/jd_unsubscriLive.js >> /scripts/logs/jd_unsubscriLive.log 2>&1
# 取关京东店铺商品
5 23 * * * node /scripts/jd_unsubscribe.js >> /scripts/logs/jd_unsubscribe.log 2>&1
# 京东试用
03 16 * * * node /scripts/jd_try.js >> /scripts/logs/jd_try.log 2>&1
# 删除优惠券(默认注释，如需要自己开启，如有误删，已删除的券可以在回收站中还原，慎用)
#20 9 * * 6 node /scripts/jd_delCoupon.js >> /scripts/logs/jd_delCoupon.log 2>&1
#家庭号(易黑号，默认注释)
#10 6,7 * * * node /scripts/jd_family.js >> /scripts/logs/jd_family.log 2>&1
