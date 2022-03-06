var log = require('../uitl/log.js');
var proto_man = require('./proto_man.js');

var service_modules = {};

function register_service(stype, service){
    if(service_modules[stype]){
        log.warn("serice is registen !!");
    }

    service_modules[stype] = service;
    service.init();
}

function on_recv_client_cmd(session,str_or_buf){
    var cmd = proto_man.decode_cmd(session.proto_type,str_or_buf);
    if(!cmd){
        return false;
    }

    var stype,ctype,body;
    stype = cmd[0];
    ctype = cmd[1];
    body = cmd[2];
    if(service_modules[stype]){
        service_modules[stype].on_recv_player_cmd(session,ctype,body);
    }
    return true;
}

//玩家掉线就走这里
function on_client_lost_connect(session){
   for(var key in service_modules){
       service_models[key].on_player_disconnect(session);
   }
}

var service_manager = {
    on_client_lost_connect: on_client_lost_connect,
    on_recv_client_cmd: on_recv_client_cmd,
    register_service : register_service,
}

module.exports = service_manager;