/**
 * 他也是一个服务
 * 他的作用是防止非法的一些操作
 * 客户端必须要通过他和服务器进行交互
 * 他和服务器是直接链接，客户端直接链接网管，发送消息给网管，然后错误就返回，不是错误就发送给服务器
 * 
 */
//配置
var game_config = require('../game_config.js')
var proto_man = require('../../netbus/proto_man.js');
var netbus = require('../../netbus/netbus.js');
var service_manager = require('../../netbus/service_manager.js');

var host = game_config.geteway_config.host;
var ports = game_config.geteway_config.ports;

//启动聊天服务器
netbus.start_ws_server(host, ports[1], proto_man.PROTO_JSON, true);

var game_server = game_config.game_server;
for (var key in game_server) {
    netbus.connect_ws_server(game_server[key].stype, game_server[key].host, game_server[key].port, proto_man.PROTO_JSON, false);
    service_manager.register_service(game_server[key].stype, gw_service);
}