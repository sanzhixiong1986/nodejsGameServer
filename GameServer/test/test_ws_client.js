var ws = require("ws");

// url ws://127.0.0.1:6080
// 创建了一个客户端的socket,然后让这个客户端去连接服务器的socket
var sock = new ws("ws://127.0.0.1:6081");
sock.on("open", function () {
	console.log("connect success !!!!");
	sock.send(
		JSON.stringify({
			name:"sanzhixiong",
			age:22,
		})
	);
});

sock.on("error", function(err) {
	console.log("error: ", err);
});

sock.on("close", function() {
	console.log("close");
});

sock.on("message", function(data) {
	console.log(data);
});
