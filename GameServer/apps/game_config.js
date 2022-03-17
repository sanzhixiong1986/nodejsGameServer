/**
 * 主要是为了后面的模块增加给出一些配置
 */
var Stype = require("./Stype.js");

var game_config = {
    geteway_config: {
        host: "127.0.0.1",
        ports: [6080, 6081, 6082, 6083]
    },

    game_server: {
        0: {
            stype: Stype.TalkCmd,
            host: "127.0.0.1",
            port: 6084,
        },
        1: {
            stype: Stype.Auth,
            host: "127.0.0.1",
            port: 6085,
        }
    }
}

module.exports = game_config;