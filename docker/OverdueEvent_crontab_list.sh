####################过期活动的定时####################

# 京享值PK 活动时间：6.22-7.21
11 0,6,11,16,21 5-21 7 * node /scripts/jd_jxzpk.js >> /scripts/logs/jd_jxzpk.log 2>&1

# 明星小店(星店长)
0 1,21 * * * node /scripts/jd_star_shop.js >> /scripts/logs/jd_star_shop.log 2>&1

# crazyJoy自动每日任务
30 7,23 * * * node /scripts/jd_crazy_joy.js >> /scripts/logs/jd_crazy_joy.log 2>&1

#监控crazyJoy分红
10 12 * * * node /scripts/jd_crazy_joy_bonus.js >> /scripts/logs/jd_crazy_joy_bonus.log 2>&1

# 欧洲狂欢杯 活动时间：###
0 5,10,11 * * * node /scripts/jd_europeancup.js >> /scripts/logs/jd_europeancup.log 2>&1

# 跳跳乐瓜分京豆(已结束)
#15 0-23/2 * * * node /scripts/jd_jump.js >> /scripts/logs/jd_jump.log 2>&1

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

# 特物Z|万物皆可国创 活动时间：###
3 0,13 * * * node /scripts/jd_superBrand.js >> /scripts/logs/jd_superBrand.log 2>&1

# 燃动夏季 活动时间：7.8-8.8
10 0,6-23/2 * 7-8 * node /scripts/jd_summer_movement.js >> /scripts/logs/jd_summer_movement.log 2>&1

# 燃动夏季百元守卫战_助力 活动时间：7.8-8.8
14,41 7-14 * 7-8 * node /scripts/jd_summer_movement_help.js >> /scripts/logs/jd_summer_movement_help.log 2>&1

# 跳跳乐瓜分京豆(7.20-7.27)
15 */2 20-27 7 * node /scripts/jd_jump.js >> /scripts/logs/jd_jump.log 2>&1

# 京喜牧场 new
#15 0,7,13 * * * node /scripts/jd_jxmc_new.js >> /scripts/logs/jd_jxmc_new.log 2>&1

# 送豆得豆
16 2,14 * * * node /scripts/jd_sendBeans.js >> /scripts/logs/jd_sendBeans.log 2>&1

# 大富翁ChinaJoy (没找到入口)
0 12 * * * node /scripts/jd_chinajoy.js >> /scripts/logs/jd_chinajoy.log 2>&1

# 沃尔玛畅玩88(7.15-8.8)
0 0,12,18 1-8 8 * node /scripts/jd_walmart.js >> /scripts/logs/jd_walmart.log 2>&1
