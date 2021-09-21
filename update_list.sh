#!/usr/bin/env bash
###
 # @Author       : gxggxl
 # @Date         : 2021-08-25 08:20:37
 # @LastEditTime : 2021-08-27 22:53:03
 # @FilePath     : /xd_scripts/update_list.sh
 # @Description  : 生成脚本列表
### 
## Author: https://github.com/nevinee
## Modified： 2021-03-18
## Version： v1.0.5

## 网址、路径、文件、标记信息以及表头
WorkDir=$(cd "$(dirname "$0")" && pwd)

# shellcheck disable=SC2207
# shellcheck disable=SC2010
JsList=($(cd "$WorkDir" && ls -- *.js | grep -E "j[drx]_" | grep -v jd_cash_ddo.js | perl -ne "{print unless /\.bak/}"))
FileReadme=$WorkDir/list_README.md
UrlRaw=https://github.com/gxggxl/xd_scripts/raw/master/
#SheetHead="# 脚本列表\n\n| 序号 | 文件 | 名称 | 活动入口 |\n| :---: | --- | --- | --- |"
SheetHead="# 脚本列表\n\n| 文件 | 名称 | 活动入口 |\n| --- | --- | --- |"

## 生成新的表格并写入Readme
cd "$WorkDir" || exit
Sheet=$SheetHead
# 循环 Array
for jsFileName in "${JsList[@]}" ; do
  Name=$(grep -E "new Env|Env" "$jsFileName" | awk -F "['\"]" '{print $2}' | sed 's/\|/\&/g' | head -1)
  Entry=$(grep -E "^ *活动入口" "$jsFileName" | awk -F "：|: " '{print $2}' | head -1)
  [[ -z $Entry ]] || [[ $Entry == 暂无 ]] && Entry=$(grep -E "^ *活动地址" "$jsFileName" | awk -F "：|: " '{print $2}' | head -1)
  [[ $Entry == http* ]] && Entry="[活动地址]($Entry)"
  Raw="$UrlRaw$jsFileName"
#  Sheet="$Sheet\n| $(((a++)+1)) | [$jsFileName]($Raw) | $Name | $Entry |"
  Sheet="$Sheet\n|[$jsFileName]($Raw) | $Name | $Entry |"
done

echo -e "$Sheet\n\n共有 **"${#JsList[@]}"** 个文件\n\n此内容仅供参考" >"$FileReadme"
