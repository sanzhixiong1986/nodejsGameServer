# 这是一款游戏服务器的开源项目

### 第一天
第一步：插入一些必要的库文件

express库 npm install express

ws 库 npm install ws

mysql ,readis npm install mysql,npm install readis

第二部：框架的划分
webserver:web服务，上传，下载，更新等

getway:网关服务器

* 接受客户端链接，转发客户端
* 链接服务器转发服务器的响应
* 安全防护，过滤掉非法数据包，让服务器免受客户端的攻击。

用户中心服务器 ：统一管理账号，同一个账号可以平台多个游戏

系统服务器：处理用户和系统通用模块之间的交互

游戏服务器：处理不通的游戏服务器

### 第二天 放一些基础的文件

加上学会使用sh批处理文件

### 第三天
* logo日志的操作（完成）
* tcp/websocket的基础操作（完成）


###  getway转发功能实现
* getway基础功能实现
* getway转发功能实现
