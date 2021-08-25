#!/usr/bin/env bash

## Author: https://github.com/nevinee
## Modified： 2021-03-18
## Version： v1.0.5

## 网址、路径、文件、标记信息以及表头
WorkDir=$(
  cd "$(dirname "$0")" || exit
  pwd
)

# shellcheck disable=SC2207
# shellcheck disable=SC2010
JsList=($(cd "$WorkDir" || exit;ls -- *.js* | grep -E "j[drx]_" | perl -ne "{print unless /\.bak/}"))

#echo ${JsList[*]}|grep .js

#JsList=("$(cd "$WorkDir" || exit; find . -maxdepth 1 -name "*.js" | grep -E "j[drx]_" | perl -ne "{print unless /\.bak/}")")
FileReadme=$WorkDir/list_README.md
UrlRaw=https://github.com/gxggxl/xd_scripts/raw/master/
SheetHead="| 序号 | 文件 | 名称 | 活动入口 |\n| :-: | - | - | - |"

## 删除标记行的内容
StartLine=$(($(grep -n "标记开始" "$FileReadme" | awk -F ":" '{print $1}') + 1))
EndLine=$(($(grep -n "标记结束" "$FileReadme" | awk -F ":" '{print $1}') - 1))
#Tail=$(perl -ne "$. > $EndLine && print" "$FileReadme")
perl -i -ne "{print unless $StartLine .. eof}" "$FileReadme"

## 生成新的表格并写入Readme
cd "$WorkDir" || exit
Sheet=$SheetHead
for ((i = 1; i <= ${#JsList[*]}; i++)); do
  Name=$(grep -E "new Env|Env" "${JsList[i]}" | awk -F "['\"]" '{print $2}' | head -1)
  Entry=$(grep -E "^ *活动入口" "${JsList[i]}" | awk -F "：|: " '{print $2}' | head -1)
  [[ -z $Entry ]] || [[ $Entry == 暂无 ]] && Entry=$(grep -E "^ *活动地址" "${JsList[i]}" | awk -F "：|: " '{print $2}' | head -1)
  [[ $Entry == http* ]] && Entry="[活动地址]($Entry)"
  Raw="$UrlRaw${JsList[i]}"
  Sheet="$Sheet\n|$((i ))|[${JsList[i]}]($Raw)|$Name|$Entry|"
done
#echo -e "$Sheet\n$Tail" >>"$FileReadme"
echo -e "$Sheet" >"$FileReadme"
