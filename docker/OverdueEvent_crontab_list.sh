####################过期活动的定时####################

# 京享值PK 活动时间：6.22-7.21
11 0,6,11,16,21 5-21 7 * node /scripts/jd_jxzpk.js >> /scripts/logs/jd_jxzpk.log 2>&1

# crazyJoy自动每日任务
30 7,23 * * * node /scripts/jd_crazy_joy.js >> /scripts/logs/jd_crazy_joy.log 2>&1

#监控crazyJoy分红
10 12 * * * node /scripts/jd_crazy_joy_bonus.js >> /scripts/logs/jd_crazy_joy_bonus.log 2>&1

# 欧洲狂欢杯 活动时间：###
0 5,10,11 * * * node /scripts/jd_europeancup.js >> /scripts/logs/jd_europeancup.log 2>&1

# 宠汪汪强制为别人助力(旧版.不可用)
#15 10 * * * node /scripts/jd_joy_help.js >> /scripts/logs/jd_joy_help.log 2>&1

# 新潮品牌狂欢(已结束)
#20 1,21 * * * node /scripts/jd_mcxhd.js >> /scripts/logs/jd_mcxhd.log 2>&1

# 家电星推官(已结束)
#0 0 * * * node /scripts/jd_xtg.js >> /scripts/logs/jd_xtg.log 2>&1

# 家电星推官好友互助(已结束)
#0 0 * * * node /scripts/jd_xtg_help.js >> /scripts/logs/jd_xtg_help.log 2>&1

# 618动物联萌(已结束)
#36 0,6-23/2 * * * node /scripts/jd_zoo.js >> /scripts/logs/jd_zoo.log 2>&1

# 618动物联萌收金币(已结束)
#0-59/30 * * * * node /scripts/jd_zooCollect.js >> /scripts/logs/jd_zooCollect.log 2>&1

# 燃动夏季 活动时间：7.8-8.8
10 0,6-23/2 * 7-8 * node /scripts/jd_summer_movement.js >> /scripts/logs/jd_summer_movement.log 2>&1

# 燃动夏季百元守卫战_助力 活动时间：7.8-8.8
14,41 7-14 * 7-8 * node /scripts/jd_summer_movement_help.js >> /scripts/logs/jd_summer_movement_help.log 2>&1

# 京喜牧场 new
#15 0,7,13 * * * node /scripts/jd_jxmc_new.js >> /scripts/logs/jd_jxmc_new.log 2>&1

# 大富翁ChinaJoy (没找到入口)
0 12 * * * node /scripts/jd_chinajoy.js >> /scripts/logs/jd_chinajoy.log 2>&1

# 沃尔玛畅玩88(7.15-8.8)
0 0,12,18 1-8 8 * node /scripts/jd_walmart.js >> /scripts/logs/jd_walmart.log 2>&1

# 天天优惠大乐透
9 0,12 * * * node /scripts/jd_DrawEntrance.js >> /scripts/logs/jd_DrawEntrance.log 2>&1

# 金机奖投票
35 1,10 8-20 8 * node /scripts/jd_golden_machine.js >> /scripts/logs/jd_golden_machine.log 2>&1

# 京喜财富岛提现
59 11,12,23 * * * node /scripts/jd_cfdtx.js >> /scripts/logs/jd_cfdtx.log 2>&1

# 骁龙品牌日
11 6,20 13-25 8 * node /scripts/jd_xl.js >> /scripts/logs/jd_xl.log 2>&1

# 点点券修复
5 20 * * * node /scripts/jd_necklace.js >> /scripts/logs/jd_necklace.log 2>&1

# 京东手机狂欢城 助力
1 0,6 9-28 8 * node /scripts/jd_carnivalcity_help.js >> /scripts/logs/jd_carnivalcity_help.log 2>&1

# 京喜财富岛热气球挂机
13 12 * * * node /scripts/jd_cfd_loop.js >> /scripts/logs/jd_cfd_loop.log 2>&1

# 超级直播间红包雨(活动时间不定期，出现异常提示请忽略。红包雨期间会正常)
1,31 0-23/1 * * * node /scripts/jd_live_redrain.js >> /scripts/logs/jd_live_redrain.log 2>&1

# 跳跳乐瓜分京豆(9.13-9.19)
15 */2 20-27 9 * node /scripts/jd_jump.js >> /scripts/logs/jd_jump.log 2>&1

# 京小鸽吾悦寄 (9.30 结束)
9 1,13 1-30 9 * node /scripts/jd_jxg.js >> /scripts/logs/jd_jxg.log 2>&1

# 京东手机狂欢城 (10.1 结束)
6 0-18/6 1,16-30 9-10 * node /scripts/jd_carnivalcity.js >> /scripts/logs/jd_carnivalcity.log 2>&1
