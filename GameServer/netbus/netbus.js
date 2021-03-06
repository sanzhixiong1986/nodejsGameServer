var net = require('net');
var ws = require('ws');
var log = require('../uitl/log.js');
var proto_man = require('./proto_man.js');
var service_manager = require("./service_manager.js");

var global_session_list = {};//全局的客户端列表
var global_session_key = 1; //关键操作

var netbus = {
	PROTO_JSON: 1,
	PROTO_BUF: 2,
};

//客户端进来
/**
 * 客户端的进来
 * @param {*} session 客户端的引用 
 * @param {*} proto_type json还是二进制
 * @param {*} is_ws 是否是websocket
 */
function on_session_enter(session, proto_type, is_ws, is_encrypt) {
	if (is_ws) {
		log.info("session enter", session._socket.remoteAddress, session._socket.remotePort);
	}
	else {
		log.info("session enter", session.remoteAddress, session.remotePort);
	}

	//客户端的引用加入列表
	session.last_pkg = null; // 表示我们存储的上一次没有处理完的TCP包;
	session.is_ws = is_ws;
	session.proto_type = proto_type;
	session.is_connected = true; //客户端已经连接上服务器了socket
	session.is_encrypt = is_encrypt;//是否加密

	//对session的扩展内置函数
	session.send_encoded_cmd = session_send_encoded_cmd;
	session.send_cmd = session_send_cmd;

	global_session_list[global_session_key] = session;
	session.session_key = global_session_key;
	global_session_key++;
	//end
}

//发送命令
function session_send_encoded_cmd(cmd) {
	//没有连接上就不能发送消息
	if (!this.is_connected) {
		return;
	}
	//如果是websocket操作
	if (this.is_ws) {
		this.send(cmd);
	}
}

/**
 * 发送消息
 * @param {*} stype	服务器编号 
 * @param {*} ctype 服务器的模块好
 * @param {*} body 	数据封装
 * @returns 
 */
function session_send_cmd(stype, ctype, body) {
	if (!this.is_connected) {
		return;
	}
	var cmd = null;
	cmd = proto_man.encode_cmd(this.proto_type, stype, ctype, body);
	if (cmd) {
		this.send_encoded_cmd(cmd);
	}
}

function get_client_session(session_key) {
	return global_session_list[session_key];
}

//推出操作
function on_session_exit(session) {
	log.info("session exit");
	service_manager.on_client_lost_connect(session);

	session.last_pag = null;//记录上一次的数据操作的
	if (global_session_list[session.session_key]) {
		global_session_list[session.session] = null;
		delete global_session_list[session.session_key];
		session.session_key = null;
	}
}

//关闭操作
function session_close(session) {
	if (!session.is_ws) {
		session.end();
		return;
	} else {
		session.close();
	}
}

// 一定能够保证是一个整包;
// 如果是json协议 str_or_buf json字符串;
// 如果是buf协议 str_or_buf Buffer对象;
function on_session_recv_cmd(session, str_or_buf) {
	if (!service_manager.on_recv_client_cmd(session, str_or_buf)) {
		session_close(session);//3-16修改
	}
}

// 发送命令
function session_send(session, cmd) {
	if (!session.is_ws) { // 
		var data = tcppkg.package_data(cmd);
		session.write(data);
		return;
	}
	else {
		session.send(cmd);
	}
}

//增加监听函数（tcp）
function add_client_session_event(session, proto_type, is_encrtpt) {
	session.on('close', function () {
		on_session_exit();
		session.end();
	})

	//正常介入到数据
	session.on("data", function (data) {
		if (!Buffer.isBuffer(data)) {
			session_close(session);//关闭操作
			return;
		}

		var last_pkg = session.last_pkg;
		if (last_pkg != null) { // 上一次剩余没有处理完的半包;
			var buf = Buffer.concat([last_pkg, data], last_pkg.length + data.length);
			last_pkg = buf;
		}
		else {
			last_pkg = data;
		}
		var offset = 0;
		var pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
		if (pkg_len < 0) {
			return;
		}
		while (offset + pkg_len <= last_pkg.length) { // 判断是否有完整的包;
			// 根据长度信息来读取我们的数据,架设我们穿过来的是文本数据
			var cmd_buf;
			// 收到了一个完整的数据包
			if (session.proto_type == proto_man.PROTO_JSON) {
				var json_str = last_pkg.toString("utf8", offset + 2, offset + pkg_len);
				if (!json_str) {
					session_close(session);
					return;
				}
				on_session_recv_cmd(session, json_str);
			}
			else {
				cmd_buf = Buffer.allocUnsafe(pkg_len - 2); // 2个长度信息
				last_pkg.copy(cmd_buf, 0, offset + 2, offset + pkg_len);
				on_session_recv_cmd(session, cmd_buf);
			}

			offset += pkg_len;
			if (offset >= last_pkg.length) { // 正好我们的包处理完了;
				break;
			}

			pkg_len = tcppkg.read_pkg_size(last_pkg, offset);
			if (pkg_len < 0) {
				break;
			}
		}

		// 能处理的数据包已经处理完成了,保存 0.几个包的数据
		if (offset >= last_pkg.length) {
			last_pkg = null;
		}
		else { // offset, length这段数据拷贝到新的Buffer里面
			var buf = Buffer.allocUnsafe(last_pkg.length - offset);
			last_pkg.copy(buf, 0, offset, last_pkg.length);
			last_pkg = buf;
		}

		session.last_pkg = last_pkg;
	});

	session.on("error", function (err) {
	});

	//如果有客户端进来就走这里
	on_session_enter(session, proto_type, false);
}

//开始的tcp服务
function start_tcp_server(ip, prot, proto_type, is_encrypt) {
	log.info("start tcp server...", ip, port);
	var str_proto = {
		1: "PROTO_JSON",
		2: "PROTO_BUF"
	}
	log.info("start tcp server...", ip, port, str_proto[proto_type]);
	//创建tcpserver
	var server = net.createServer(function (client_sock) {
		add_client_session_event(client_sock, proto_type);
	});

	//监听事件
	server.on("error", function () {
		log.error("sever listen error");
	});

	server.on("close", function () {
		log.error("server listen close");
	})

	server.listen({
		port: port,
		host: ip,
		exclusive: true,
	})
}

// -------------------------
function isString(str) { //判断对象是否是字符串  
	return false;
}
//3-16 增加is_encrypt
function ws_add_client_session_event(session, proto_type, is_encrypt) {
	// close事件
	session.on("close", function () {
		on_session_exit(session);
		session.close();
	});

	// error事件
	session.on("error", function (err) {
	});
	// end 

	session.on("message", function (data) {
		if (session.proto_type == proto_man.PROTO_JSON) {
			log.info("data is ", typeof data)
			on_session_recv_cmd(session, data);
		}
		else {
			if (!Buffer.isBuffer(data)) {
				session_close(session);
				return;
			}
			on_session_recv_cmd(session, data);
		}
	});
	// end
	on_session_enter(session, proto_type, true, is_encrypt);
}

function start_ws_server(ip, port, proto_type, is_encrypt) {
	log.info("start ws server ..", ip, port);
	var str_proto = {
		1: "PROTO_JSON",
		2: "PROTO_BUF",
	}
	var server = new ws.Server({
		host: ip,
		port: port,
	});

	function on_server_client_comming(client_sock) {
		ws_add_client_session_event(client_sock, proto_type, is_encrypt);
	}
	server.on("connection", on_server_client_comming);

	function on_server_listen_error(err) {
		log.error("ws server listen error!!");
	}
	server.on("error", on_server_listen_error);

	function on_server_listen_close(err) {
		log.error("ws server listen close!!");
	}
	server.on("close", on_server_listen_close);
}

function on_session_disconnect(session) {
	session.is_connected = false;
	var stype = session.session_key;
	session.last_pkg = null;
	session.session_key = null;
	if (server_connect_list[stype]) {
		server_connect_list[stype] = null;
		delete server_connect_list[stype]; // 把这个key, value从 {}里面删除	
	}
}
var session_wb = null;
/**
 * 链接服务器
 * @param {*} stype 服务器的类型 
 * @param {*} host 
 * @param {*} port 
 * @param {*} proto_type 
 * @param {*} is_encrypt 
 */
function connect_ws_server(stype, host, port, proto_type, is_encrypt) {

	var str_proto = {
		1: "PROTO_JSON",
		2: "PROTO_BUF",
	}

	var sock = new ws("ws://" + host + ":" + port);
	sock.is_connected = false;
	sock.on("open", function () {
		on_session_connected(stype, sock, port, proto_type, true, is_encrypt);
	});

	sock.on("error", function (err) {
		console.log("error: ", err);
	});

	sock.on("close", function () {
		console.log("close");
		if (sock.is_connected === true) {
			on_session_disconnect(sock);
		}
		sock.close();

		setTimeout(function () {
			connect_ws_server(stype, host, port, proto_type, is_encrypt)
		}, 3000);
	});

	sock.on("message", function (data) {
		console.log(data);
		if (sock.proto_type == proto_man.PROTO_JSON) {
			log.info("data is ", typeof data)
			on_session_recv_cmd(session, data);
		}
	});
}

function on_session_recv_cmd(session, str_or_buf) {
	if (!service_manager.on_recv_server_return(session, str_or_buf)) {
		session_close(session);
	}
}
//加入列表
var server_connect_list = {};
function on_session_connected(stype, session, proto_type, is_ws, is_encrypt) {
	if (is_ws) {
		log.info("session connect:", session._socket.remoteAddress, session._socket.remotePort);
	}
	else {
		log.info("session connect:", session.remoteAddress, session.remotePort);
	}

	session.last_pkg = null; // 表示我们存储的上一次没有处理完的TCP包;
	session.is_ws = is_ws;
	session.proto_type = proto_type;
	session.is_connected = true;
	session.is_encrypt = is_encrypt;

	// 扩展session的方法
	session.send_encoded_cmd = session_send_encoded_cmd;
	session.send_cmd = session_send_cmd;
	// end 

	// 加入到我们的serssion 列表里面
	server_connect_list[stype] = session;
	session.session_key = stype;
}

function get_server_session(stype) {
	return server_connect_list[stype];
}

var netbus = {
	start_tcp_server: start_tcp_server,
	start_ws_server: start_ws_server,
	// session_send : session_send,
	session_close: session_close,
	connect_ws_server: connect_ws_server,
	get_client_session: get_client_session,
	get_server_session:get_server_session,
}

module.exports = netbus;


