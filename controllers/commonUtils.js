const xor = require("buffer-xor");
const db = require("../modules/dbModule");

module.exports.hashRegex = () => /^[a-z0-9+]{5,65}$/;

module.exports.returnUTCTime = select => {
  const parseDate = new Date(Number(select));
  const yyyymmdd = `${parseDate.getFullYear()}-${("00" + (parseDate.getMonth() + 1)).slice(-2)}-${(
    "00" + parseDate.getDate()
  ).slice(-2)}`;
  const hhmmss = `${("00" + parseDate.getHours()).slice(-2)}:${("00" + parseDate.getMinutes()).slice(-2)}:${(
    "00" + parseDate.getSeconds()
  ).slice(-2)}`;
  const prettyTime = `${yyyymmdd} ${hhmmss}`;
  return prettyTime;
};

module.exports.returnUTCTimeList = select => {
  select.forEach(element => {
    const parseDate = new Date(Number(element.block_gen_time));
    const yyyymmdd = `${parseDate.getFullYear()}-${("00" + (parseDate.getMonth() + 1)).slice(-2)}-${(
      "00" + parseDate.getDate()
    ).slice(-2)}`;
    const hhmmss = `${("00" + parseDate.getHours()).slice(-2)}:${("00" + parseDate.getMinutes()).slice(
      -2
    )}:${("00" + parseDate.getSeconds()).slice(-2)}`;
    element.block_gen_time = `${yyyymmdd} ${hhmmss}`;
  });
  return select;
};

module.exports.hexPadding = hex => {
  while (hex.length < 4) {
    hex = "0" + hex;
    if (hex.length == 4) {
      break;
    }
  }
  return hex;
};

module.exports.transactionGenerator = async (from, note) => {
  const transaction = {
    Revision: 0,
    PreviousKeyID: 0,
    ContractCreateTime: new Date().getTime(),
    Fintech: 0,
    From: from,
    Balance: await getBalance(from),
    NotePrivacy: 0,
    Note: note
  };
  return transaction;
};

module.exports.messageGenerator = (delimiter, count, info) => ({
  delimiter: delimiter,
  count: count,
  info: info
});

module.exports.numberWithCommas = number => {
  number = number.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(number)) {
    number = number.replace(pattern, "$1,$2");
  }
  return number;
};

const bufferPaddingGenerator = (buffer, count) => {
  let result = buffer;
  for (let i = 0; i < count; i++) {
    result = Buffer.concat([result, Buffer.from("0")]);
  }
  return result;
};

const xorGenerator = (previous, now) => {
  const previousLength = previous.length;
  const nowLength = now.length;
  if (previousLength < nowLength) {
    const filledPrevious = bufferPaddingGenerator(previous, nowLength - previousLength);
    return xor(filledPrevious, now);
  } else if (previousLength > nowLength) {
    const filledNow = bufferPaddingGenerator(now, previousLength - nowLength);
    return xor(previous, filledNow);
  } else {
    return xor(previous, now);
  }
};

module.exports.rightSignBufferGenerator = note => {
  if (note.length === 1) {
    return Buffer.from(JSON.stringify(note[0]));
  }
  return note.reduce((sum, element, currentIndex) => {
    const previous = currentIndex === 1 ? Buffer.from(JSON.stringify(sum)) : sum;
    const now = Buffer.from(JSON.stringify(element));
    return xorGenerator(previous, now);
  });
};

module.exports.leftSignBufferGenerator = transfer => {
  return Buffer.from(
    JSON.stringify({
      Revision: transfer.Revision,
      PreviousKeyID: transfer.PreviousKeyID,
      ContractCreateTime: transfer.ContractCreateTime,
      Fintech: transfer.Fintech,
      From: transfer.From,
      Balance: transfer.Balance,
      NotePrivacy: transfer.NotePrivacy
    })
  );
};

const getBalance = async address => {
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

  const sent = sentArray.reduce((sum, element) => (sum += parseFloat(element.amount)), 0);
  const received = receivedArray.reduce((sum, element) => (sum += parseFloat(element.amount)), 0);
  const balance = received - sent;

  return balance.toFixed(10);
};

module.exports.getBalance = getBalance;
