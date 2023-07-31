
var express = require('express'),
    httpProxy = require('http-proxy');
var proxyApp = express();
const PROXY_PORT = process.env.PROXY_PORT || 8015
const HOST = process.env.SOCKET_HOST || "localhost"
const PORT = process.env.SOCKET_PORT || 6969
const SOCKET_PATH = "socket.io"
var http = require('http');
var debug = require('debug')('spb:server');
var morgan = require('morgan');
var cors = require('cors');
const { serializeUser } = require('@narmy/core').middlware

try {

    const wsProxy = httpProxy.createProxyServer({
        target: {
            host: HOST,
            port: PORT
        }
    })

    const proxyServer = http.createServer(proxyApp)
    proxyApp.use(morgan('dev'));
    proxyApp.use(cors());
    proxyApp.use(serializeUser());
    proxyApp.use(`/${SOCKET_PATH}`, function (req, res) {
        wsProxy.web(req, res, { target: `http://${HOST}:${PORT}/${SOCKET_PATH}` });
    });

    proxyServer.on("upgrade", function (req, socket, head) {
        console.log("upgrade:", "req, socket, head")
        wsProxy.ws(req, socket, head);
    })

    proxyServer.on("error", (err) => {
        console.log(err)
    })


    proxyServer.listen(PROXY_PORT, function () {
        debug(`Proxy server listening on http://${HOST}:${PROXY_PORT}`, '\n');
    });
}
catch (err) {
    console.log(err)
}
