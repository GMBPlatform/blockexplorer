const io = require("socket.io-client");
const schedule = require("node-schedule");
const db = require("./dbModule");
const moment = require("moment");

const config = { secure: true, reconnect: true, rejectUnauthorized: false };
const HOST = "https://gmbplatform.io:21979";
const socket = io.connect(HOST, config);

const MAX_LENGTH = 9;
const connection = db();

let tpsList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let timeList = [];
let dateList = [];
let amountList = [];
let transactionPerDay = 0;
let intervalTransactionCount = 0;

moment.tz.setDefault("Asia/Seoul");

const returnTpsList = tps => {
  for (let i = 0; i < MAX_LENGTH; i++) {
    tpsList[i] = tpsList[i + 1];
  }
  tpsList[MAX_LENGTH] = tps;
  return tpsList;
};

const returnTimeList = () => {
  const now = new Date();
  const timeList = [];
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  for (let i = MAX_LENGTH; i >= 0; i--) {
    timeList.push(
      `${("00" + hour).slice(-2)}:${("00" + (second - i < 0 ? minute - 1 : minute)).slice(-2)}:${(
        "00" + (second - i < 0 ? 60 + (second - i) : second - i)
      ).slice(-2)}`
    );
  }
  return timeList;
};

const setTpsList = () => {
  tpsList = returnTpsList(intervalTransactionCount);
  intervalTransactionCount = 0;
};

const setTimeList = () => {
  timeList = returnTimeList();
};

const setDailyList = () => {
  amountList[MAX_LENGTH] = transactionPerDay;
};

const setListScheduler = async isInit => {
  const now = moment().format("YYYY-MM-DD");
  const past = moment()
    .date(moment().date() - 9)
    .format("YYYY-MM-DD");
  const todayList = [];
  const todayAmount = [];
  const DAILY_TRANSACTION_INIT_QUERY = `
  INSERT INTO tbl_daily_transaction(date,amount)
  VALUES ("${now}}", 0)
  `;
  const DAILY_TRANSACTION_SELECT_QUERY = `
  SELECT DATE_FORMAT(date,'%Y-%m-%d') date,amount
  FROM tbl_daily_transaction
  WHERE DATE(date) BETWEEN '${past}' AND '${now}'
  ORDER BY DATE ASC;
  `;
  [select] = await connection.query(DAILY_TRANSACTION_SELECT_QUERY);

  if (!isInit) {
    await connection.query(DAILY_TRANSACTION_INIT_QUERY);
    transactionPerDay = 0;
  }
  const TODAY_DAILY_TRANSACTION_SELECT_QUERY = `
      SELECT date,amount FROM tbl_daily_transaction WHERE date = "${now}"
    `;
  [[todayRow]] = await connection.query(TODAY_DAILY_TRANSACTION_SELECT_QUERY);
  transactionPerDay = todayRow.amount;

  select.forEach(row => {
    todayList.push(row.date);
    todayAmount.push(row.amount);
  });

  dateList = todayList;
  amountList = todayAmount;
};

schedule.scheduleJob("10 00 00 * * *", setListScheduler.bind(null, false));

socket.on("message", async message => {
  switch (message.delimiter) {
    case "transaction":
      const UPDATE_DAILY_TRANSACTION_COUNT_QUERY = `UPDATE tbl_daily_transaction SET amount = amount + 1 where date = "${moment().format(
        "YYYY-MM-DD"
      )}"`;
      [update] = await connection.query(UPDATE_DAILY_TRANSACTION_COUNT_QUERY);
      intervalTransactionCount += 1;
      transactionPerDay += 1;
      break;
    case "block":
      break;
    default:
      break;
  }
});

setListScheduler(true);
setInterval(() => {
  setTpsList();
  setTimeList();
  setDailyList();
  socketSendMessage({
    delimiter: "chart",
    tpsList: tpsList,
    timeList: timeList,
    dateList: dateList,
    amountList: amountList
  });
}, 1000);
