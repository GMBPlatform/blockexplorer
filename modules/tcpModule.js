const net = require("net");
const tcpConfig = { host: process.env.EXPLORER_IS_HOST, port: process.env.EXPLORER_IS_PORT };
const tcpSendMessage = message => {
  client.write(message);
};

module.exports = SCAConfig =>
  SCAConfig === undefined ? net.createConnection(tcpConfig) : net.createConnection(SCAConfig);
