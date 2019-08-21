const db = require("../modules/dbModule");
const util = require("./commonUtils");

exports.index = (req, res) => {
  const client = tcpClient();
  const toIs = { delimiter: "blockExplorer" };
  client.once("data", data => {
    res.render("index", { data: JSON.parse(data.toString()) });
    client.end();
  });
  client.write(JSON.stringify(toIs));
};

exports.wallet = (req, res) => {
  res.render("wallet");
};

exports.transaction = (req, res) => {
  res.render("transaction");
};

exports.block = (req, res) => {
  res.render("block");
};

exports.search = async (req, res) => {
  const path = req.route.path;
  const request = req.query;

  switch (path) {
    case "/search/block":
      const blockConnection = await db({
        host: global.allocatedSca.ip,
        user: process.env.EXPLORER_SCA_USER,
        password: process.env.EXPLORER_SCA_PASSWORD,
        database: "block",
        charset: "utf8"
      });
      const SEARCH_BLOCK_QUERY = `SELECT * FROM contents WHERE hash = '${request.key}' LIMIT 1`;
      [[searchBlock]] = await blockConnection.execute(SEARCH_BLOCK_QUERY);

      if (searchBlock === undefined) {
        res.render("./blockInfo.ejs", { data: { status: false, hash: request.key } });
      } else {
        const SEARCH_BLOCK_TRANSACTIONS_QUERY = `SELECT * FROM tx WHERE block_num = ${searchBlock.block_num}`;
        [transactions] = await blockConnection.execute(SEARCH_BLOCK_TRANSACTIONS_QUERY);
        searchBlock.transactions = transactions;
        searchBlock.status = true;
        searchBlock.block_num = util.numberWithCommas(searchBlock.block_num);
        searchBlock.block_gen_time = util.returnUTCTime(searchBlock.block_gen_time);
        searchBlock.p2p_addr = `0x${Number(searchBlock.p2p_addr).toString(16)}`;
        res.render("./blockInfo.ejs", { data: searchBlock });
      }
      await blockConnection.end();
      break;
    case "/search/transaction":
      const transactionConnection = await db({
        host: global.allocatedSca.ip,
        user: process.env.EXPLORER_SCA_USER,
        password: process.env.EXPLORER_SCA_PASSWORD,
        database: "SCA",
        charset: "utf8"
      });
      const SEARCH_DB_KEY_QUERY = `SELECT db_key FROM info where hash = '${request.key}' LIMIT 1`;
      [[searchDbKey]] = await transactionConnection.execute(SEARCH_DB_KEY_QUERY);

      if (searchDbKey === undefined) {
        res.render("./transactionInfo.ejs", { data: { status: false, hash: request.key } });
      } else {
        const SEARCH_TRANSACTION_QUERY = `SELECT * FROM contents where db_key = '${
          searchDbKey.db_key
        }' LIMIT 1`;
        [[searchTransaction]] = await transactionConnection.execute(SEARCH_TRANSACTION_QUERY);
        if (searchTransaction === undefined) {
          res.render("./transactionInfo.ejs", { data: { status: false } });
        } else {
          const contract = JSON.parse(searchTransaction.contract);
          contract.ContractCreateTime = util.returnUTCTime(contract.ContractCreateTime);
          searchTransaction.status = true;
          res.render("./transactionInfo.ejs", { data: searchTransaction, contract: contract });
        }
      }
      await transactionConnection.end();
      break;
    case "/search/wallet":
      const address = request.key;
      res.render("./walletLedger.ejs", { data: { status: true, address: address } });
      break;

    default:
      res.render("./error.ejs");
      break;
  }
};
