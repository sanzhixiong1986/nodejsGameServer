/**
 * 聊天的封装
 * 
 * enter:
 * 客户端:进入聊天室
 * 1,1,body = { uname,usex};
 * 返回
 * 1,1,status = 0;
 * 
 * exit:
 * 客户端推出 
 * 1,2,body = null;
 * 返回
 * 1,2,status =0;
 * 
 * talk:
 * 1,5 body = "消息内容", 
 * 返回
 * 1,5, body = {
 *  0:status,
 *  1:uname,
 *  2:usex,
 *  3:msg,  //消息内容
 * }
 * 
 * UserMsg:服务器主动推送（系统消息）
 * 1,6,body = { 
 * 0:unmae,
 * 1:sex,
 * 2:msg,
 * }
 * 
 * 主动退出
 * UserEixt
 * 1,4,body = {
 * uname:""名字
 * usex:1/0
 * }
 * 
 * 主动发送
 * 1,3,body = {
 * uname:"", { value:}
 * usex:1,0
 * }
 */


