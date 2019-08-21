const db = require("../modules/dbModule");
const util = require("./commonUtils");

const MAX_LIST_LENGTH = 5;
const blockList = [];
const transactionList = [];

exports.transaction = async (req, res) => {
  const transaction = req.body;
  const SELECT_TRANSACTION_COUNT_QUERY = `SELECT total_tx_cnt FROM tbl_stats_info`;
  const UPDATE_TRANSACTION_COUNT_QUERY = `UPDATE tbl_stats_info SET total_tx_cnt = total_tx_cnt + 1`;
  const INSERT_TRANSACTION_QUERY = `
  INSERT INTO tbl_transaction_info(hash, db_key, block_num) 
  VALUES(
  "${transaction.hash}",
  ${transaction.db_key},
  ${transaction.block_num}
  )
  `;
  const connection = await db();

  [insert] = await connection.execute(INSERT_TRANSACTION_QUERY);
  if (insert === undefined) {
    console.log("transaction insert error");
  }

  [update] = await connection.execute(UPDATE_TRANSACTION_COUNT_QUERY);
  if (update === undefined) {
    console.log("transaction update error");
  }

  [[{ total_tx_cnt: txCount }]] = await connection.execute(SELECT_TRANSACTION_COUNT_QUERY);

  if (transactionList.length < MAX_LIST_LENGTH) {
    transactionList.unshift(transaction);
  } else {
    for (let i = MAX_LIST_LENGTH - 1; i >= 0; i--) {
      transactionList[i] = transactionList[i - 1];
    }
    transactionList[0] = transaction;
  }

  await connection.end();

  socketSendMessage(util.messageGenerator(`transaction`, txCount, transactionList));

  res.send(200);
};

exports.block = async (req, res) => {
  const block = req.body;
  const SELECT_BLOCK_COUNT_QUERY = `SELECT total_blk_cnt FROM tbl_stats_info`;
  const UPDATE_BLOCK_COUNT_QUERY = `UPDATE tbl_stats_info SET total_blk_cnt = total_blk_cnt + 1`;
  const INSERT_BLOCK_QUERY = `INSERT INTO 
  tbl_block_info(block_num, hash, block_gen_time,tx_count)
  VALUES(
    ${BigInt(block.block_num)},
    "${block.hash}",
    ${BigInt(block.block_gen_time)},
    ${BigInt(block.tx_count)}
    )
    `;
  const connection = await db();
  [insert] = await connection.execute(INSERT_BLOCK_QUERY);

  if (insert === undefined) {
    console.log("block insert error");
  }

  [update] = await connection.execute(UPDATE_BLOCK_COUNT_QUERY);

  if (update === undefined) {
    console.log("block update error");
  }

  [[{ total_blk_cnt: blkCount }]] = await connection.execute(SELECT_BLOCK_COUNT_QUERY);

  block.block_gen_time = util.returnUTCTime(block.block_gen_time);
  if (blockList.length < MAX_LIST_LENGTH) {
    blockList.unshift(block);
  } else {
    for (let i = MAX_LIST_LENGTH - 1; i >= 0; i--) {
      blockList[i] = blockList[i - 1];
    }
    blockList[0] = block;
  }
  await connection.end();
  socketSendMessage(util.messageGenerator(`block`, blkCount, blockList));
  res.send(200);
};

exports.node = async (req, res) => {
  const node = req.body;
  socketSendMessage(util.messageGenerator(`node`, node.TIER[0].NN_LIST.length, node));
  res.send(200);
};
