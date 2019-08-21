const crypto = require("crypto");
const KJUR = require("jsrsasign");

const util = require("./commonUtils");
const db = require("../modules/dbModule");
const secp256r1WalletUtil = require("../utils/secp256r1WalletUtil");

exports.generatePage = async (req, res) => {
  res.render("./walletGenerate.ejs");
};

exports.generateApi = async (req, res) => {
  const request =
    req.body.password === undefined || req.body.mnemonic === undefined
      ? JSON.parse(Object.keys(req.body)[0])
      : req.body;
  if (
    request.password.length < 8 ||
    request.password.length > 20 ||
    (request.mnemonic.length < 8 || request.mnemonic.length > 256)
  ) {
    res.send("password or mnemonic length wrong");
    return;
  }
  const walletInfo = secp256r1WalletUtil(request);
  res.send(walletInfo);
};

exports.informationPage = async (req, res) => {
  res.render("./walletInformation.ejs", req.body);
};

exports.informationApi = async (req, res) => {
  res.render("./walletInformation.ejs");
};

exports.loadKeyfilePage = async (req, res) => {
  res.render("./walletLoadKeyfile.ejs");
};

exports.loadKeyfileApi = async (req, res) => {
  const walletInfo = secp256r1WalletUtil(req.body);
  res.send(walletInfo);
};

exports.loadDirectPage = async (req, res) => {
  res.render("./walletLoadDirect.ejs");
};

exports.loadDirectApi = async (req, res) => {
  const request =
    req.body.password === undefined || req.body.mnemonic === undefined
      ? JSON.parse(Object.keys(req.body)[0])
      : req.body;
  if (
    request.password.length < 8 ||
    request.password.length > 20 ||
    (request.mnemonic.length < 8 || request.mnemonic.length > 256)
  ) {
    res.send("password or mnemonic length wrong");
    return;
  }
  const walletInfo = secp256r1WalletUtil(request);
  res.send(walletInfo);
};

exports.transactionTransferPage = async (req, res) => {
  res.render("./walletTransfer.ejs");
};

exports.transactionTransferApi = async (req, res) => {
  const transfer = req.body;
  const transaction = await util.transactionGenerator(
    transfer.from,
    transfer.note
  );
  const leftBuffer = util.leftSignBufferGenerator(transaction);
  const rightBuffer = util.rightSignBufferGenerator(transaction.Note);
  const mergedBuffer = Buffer.concat([leftBuffer, rightBuffer]);
  const transferHash = crypto
    .createHash("sha256")
    .update(mergedBuffer)
    .digest("hex");
  const ec = new KJUR.crypto.ECDSA({ curve: "secp256r1" });
  const signHex = ec.signHex(transferHash, transfer.privateKey);
  const signRS = new KJUR.crypto.ECDSA.parseSigHexInHexRS(signHex);

  transaction.KeyR = signRS.r;
  transaction.KeyS = signRS.s;

  const client = tcpClient({
    host: global.allocatedSca.ip,
    port: global.allocatedSca.port
  });
  client.once("data", data => {
    res.send(JSON.parse(data.toString()));
    client.end();
  });
  const transactionLength = Buffer.from(
    util.hexPadding(JSON.stringify(transaction).length.toString(16)),
    "hex"
  );
  const transactionLengthBuffer = Buffer.concat([
    transactionLength.slice(1, 2),
    transactionLength.slice(0, 1)
  ]);
  const transactionBuffer = Buffer.from(JSON.stringify(transaction));
  const concatTransaction = Buffer.concat([
    transactionLengthBuffer,
    transactionBuffer
  ]);

  client.write(Buffer.from(concatTransaction));
};

exports.balanceApi = async (req, res) => {
  const address =
    req.body.address === undefined
      ? Object.keys(req.body)[0]
      : req.body.address;
  const SELECT_SENT_QUERY = `SELECT amount FROM transfer WHERE frompk = "${address}";`;
  const SELECT_RECEIVED_QUERY = `SELECT amount FROM transfer WHERE topk = "${address}";`;
  const connection = await db({
    host: global.allocatedSca.ip,
    user: process.env.EXPLORER_SCA_USER,
    password: process.env.EXPLORER_SCA_PASSWORD,
    database: "SCA",
    charset: "utf8"
  });
  [sentArray] = await connection.execute(SELECT_SENT_QUERY);
  [receivedArray] = await connection.execute(SELECT_RECEIVED_QUERY);

  const sent = sentArray.reduce(
    (sum, element) => (sum += parseFloat(element.amount)),
    0
  );
  const received = receivedArray.reduce(
    (sum, element) => (sum += parseFloat(element.amount)),
    0
  );
  const balance = received - sent;

  await connection.end();
  res.send({ balance: balance.toFixed(10) });
};
exports.ledgerApi = async (req, res) => {
  const address =
    req.body.address === undefined
      ? Object.keys(req.body)[0]
      : req.body.address;
  const SELECT_LEDGER_QUERY = `SELECT * FROM transfer WHERE topk = "${address}" or frompk = "${address}";`;
  const connection = await db({
    host: global.allocatedSca.ip,
    user: process.env.EXPLORER_SCA_USER,
    password: process.env.EXPLORER_SCA_PASSWORD,
    database: "SCA",
    charset: "utf8"
  });

  [ledger] = await connection.execute(SELECT_LEDGER_QUERY);

  await connection.end();
  res.send({ ledger: ledger });
};
