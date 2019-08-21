const db = require("../modules/dbModule");
const util = require("./commonUtils");
const requestPromise = require("request-promise-native");

exports.initBlock = async (req, res) => {
  const request = req.body;
  if (request.delimiter !== "block") {
    res.send({ data: {} });
    return;
  }
  const search = request.search.value;
  const connection = await db();

  if (search === "" || !util.hashRegex.test(search)) {
    const SELECT_BLOCK_COUNT_QUERY = `SELECT total_blk_cnt FROM tbl_stats_info`;
    [[{ total_blk_cnt: selectBlockCount }]] = await connection.execute(
      SELECT_BLOCK_COUNT_QUERY
    );
    const SELECT_BLOCK_LIST_QUERY = `
    SELECT block_num, block_gen_time, hash, tx_count 
    FROM tbl_block_info
    WHERE block_num BETWEEN ${selectBlockCount -
      Number(request.length) -
      Number(request.start)} AND ${selectBlockCount - Number(request.start)}
    ORDER BY block_num desc
    `;
    [selectBlock] = await connection.execute(SELECT_BLOCK_LIST_QUERY);
    selectBlock = util.returnUTCTimeList(selectBlock);
    await connection.end();

    res.send({
      data: selectBlock,
      recordsTotal: selectBlockCount,
      recordsFiltered: selectBlockCount
    });

    return;
  } else {
    const SEARCH_BLOCK_LIST_QUERY = `
    SELECT block_num,block_gen_time, hash, tx_count 
    FROM tbl_block_info
    WHERE hash Like "%${search}%"
    `;

    [selectSearchBlock] = await connection.execute(SEARCH_BLOCK_LIST_QUERY);
    await connection.end();

    res.send({
      data: selectSearchBlock,
      recordsTotal: selectSearchBlock.length,
      recordsFiltered: selectSearchBlock.length
    });
    return;
  }
};

exports.initTransaction = async (req, res) => {
  const request = req.body;
  if (request.delimiter !== "transaction") {
    res.send({ data: {} });
    return;
  }
  const search = request.search.value;
  const connection = await db();

  if (search === "" || !util.hashRegex.test(search)) {
    const SELECT_TRANSACTION_COUNT_QUERY = `SELECT total_tx_cnt FROM tbl_stats_info`;

    [[{ total_tx_cnt: selectTransactionCount }]] = await connection.execute(
      SELECT_TRANSACTION_COUNT_QUERY
    );

    const SELECT_TRANSACTION_LIST_QUERY = `
    SELECT hash, db_key, block_num
    FROM tbl_transaction_info
    WHERE no BETWEEN ${selectTransactionCount -
      Number(request.length) -
      Number(request.start)} AND ${selectTransactionCount -
      Number(request.start)}
    ORDER BY no desc
    `;
    [selectTransaction] = await connection.execute(
      SELECT_TRANSACTION_LIST_QUERY
    );
    await connection.end();
    res.send({
      data: selectTransaction,
      recordsTotal: selectTransactionCount,
      recordsFiltered: selectTransactionCount
    });
    return;
  } else {
    const SEARCH_TRANSACTION_LIST_QUERY = `
    SELECT hash, db_key, block_num
    FROM tbl_transaction_info
    WHERE hash Like "%${search}%"
    `;

    [selectSearchTransaction] = await connection.execute(
      SEARCH_TRANSACTION_LIST_QUERY
    );

    await connection.end();

    res.send({
      data: selectSearchTransaction,
      recordsTotal: selectSearchTransaction.length,
      recordsFiltered: selectSearchTransaction.length
    });
    return;
  }
};

exports.initDashboard = async (req, res) => {
  const request = req.body;
  if (request.delimiter !== "dashboard") {
    res.send({ data: {} });
    return;
  }
  const SELECT_DASHBOARD_INIT_QUERY = `SELECT total_blk_cnt, total_tx_cnt FROM tbl_stats_info`;
  const SELECT_TRANSACTION_BOARD_INIT_QUERY = `SELECT hash, db_key, block_num FROM tbl_transaction_info ORDER BY no desc LIMIT 5`;
  const SELECT_BLOCK_BOARD_INIT_QUERY = `SELECT block_num, block_gen_time, hash, tx_count FROM tbl_block_info ORDER BY block_num desc LIMIT 5`;
  const SELECT_WALLET_COUNT_INIT_QUERY = `SELECT count(DISTINCT topk) as walletCount FROM transfer`;
  const connection = await db();
  const scaConnection = await db({
    host: global.allocatedSca.ip,
    user: process.env.EXPLORER_SCA_USER,
    password: process.env.EXPLORER_SCA_PASSWORD,
    database: "SCA",
    charset: "utf8"
  });

  [[selectWalletCount]] = await scaConnection.execute(
    SELECT_WALLET_COUNT_INIT_QUERY
  );

  [[selectDashboard]] = await connection.execute(SELECT_DASHBOARD_INIT_QUERY);
  [selectTransactionBoard] = await connection.execute(
    SELECT_TRANSACTION_BOARD_INIT_QUERY
  );
  [selectBlockBoard] = await connection.execute(SELECT_BLOCK_BOARD_INIT_QUERY);

  selectBlockBoard = util.returnUTCTimeList(selectBlockBoard);

  const result = {
    dashboard: selectDashboard,
    transaction: selectTransactionBoard,
    block: selectBlockBoard,
    walletCount: selectWalletCount.walletCount
  };

  await connection.end();
  await scaConnection.end();

  const marketcap = await requestPromise.get(
    "https://api.coinmarketcap.com/v1/ticker/gmb/"
  );
  result.marketcap = JSON.parse(marketcap)[0];
  res.send(result);
};

exports.initLedger = async (req, res) => {
  const request = req.body;
  const address = request.address;
  if (request.delimiter !== "ledger") {
    res.send({ data: {} });
    return;
  }
  const connection = await db({
    host: global.allocatedSca.ip,
    user: process.env.EXPLORER_SCA_USER,
    password: process.env.EXPLORER_SCA_PASSWORD,
    database: "SCA",
    charset: "utf8"
  });
  const SELECT_LEDGER_COUNT_QUERY = `SELECT count(*) as count FROM transfer WHERE topk = "${address}" or frompk = "${address}";`;
  [[ledgerCount]] = await connection.execute(SELECT_LEDGER_COUNT_QUERY);

  const SELECT_LEDGER_QUERY = `
  SELECT db_key ,frompk, topk, amount, kind
  FROM transfer
  WHERE topk = "${address}" or frompk = "${address}"
  ORDER BY no desc
  LIMIT ${request.start},${request.length}
  `;
  [ledgers] = await connection.execute(SELECT_LEDGER_QUERY);
  ledgers.forEach((element, index) => {
    element.no = Number(ledgerCount.count) - Number(request.start) - index;
  });
  await connection.end();

  res.send({
    data: ledgers,
    recordsTotal: ledgerCount.count,
    recordsFiltered: ledgerCount.count
  });
  return;
};
