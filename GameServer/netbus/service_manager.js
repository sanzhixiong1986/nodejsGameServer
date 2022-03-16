const { info } = require('../uitl/log.js');
var log = require('../uitl/log.js');
var proto_man = require('./proto_man.js');

var service_modules = {};

function register_service(stype, service) {
    if (service_modules[stype]) {
        log.warn("serice is registen !!");
    }

    service_modules[stype] = service;
    service.init();
}

/**
 * 收到客户端来的信息
 * @param {*} session       客户端的引用
 * @param {*} str_or_buf    客户端的数据
 * @returns 
 */
function on_recv_client_cmd(session, str_or_buf) {
    var cmd = proto_man.decode_cmd(session.proto_type, str_or_buf);
    if (!cmd) {
        return false;
    }

    var stype, ctype, body;
    stype = cmd['stype'];
    ctype = cmd['ctype'];
    body = cmd['body'];

    //3-16加
    if (service_modules[stype].is_transfer) {
        service_modules[stype].on_recv_player_cmd(session, ctype, null, str_or_buf);
    }
    return true;
}

//玩家掉线就走这里
function on_client_lost_connect(session) {
    for (var key in service_modules) {
        service_modules[key].on_player_disconnect(session);
    }
}

var service_manager = {
    on_client_lost_connect: on_client_lost_connect,
    on_recv_client_cmd: on_recv_client_cmd,
    register_service: register_service,
}

module.exports = service_manager;