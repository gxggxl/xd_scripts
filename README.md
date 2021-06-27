1、lxk最终版及个人整理。

2、V4-bot安装：https://github.com/Annyoo2021/jd_v4_bot

3、安装我库宠汪汪的依赖命令如下：

   3.1、进入容器(容器名自行修改为自己的)：
    
    docker exec -it 容器名 bash 

   3.2、再依次执行以下3条命令：

    apk add --no-cache build-base g++ cairo-dev pango-dev giflib-dev

    cd scripts

    npm install canvas --build-from-source
 
