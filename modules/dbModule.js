const mysql = require("mysql2/promise");

const blockExplorerDbConfig = {
  host: process.env.EXPLORER_LOCAL_HOST,
  user: process.env.EXPLORER_LOCAL_USER,
  password: process.env.EXPLORER_LOCAL_PASSWORD,
  database: process.env.EXPLORER_LOCAL_SCHEMA,
  charset: "utf8",
  waitForConnections: true,
  connectionLimit: 1000,
  queueLimit: 0,
  maxPreparedStatements: 16000,
  supportBigNumbers: true,
  bigNumberStrings: true
};

module.exports = dbConfig => {
  if (dbConfig === undefined) {
    return mysql.createPool(blockExplorerDbConfig);
  } else {
    dbConfig.waitForConnections = true;
    dbConfig.connectionLimit = 1000;
    dbConfig.queueLimit = 0;
    dbConfig.supportBigNumbers = true;
    dbConfig.bigNumberStrings = true;
    dbConfig.maxPreparedStatements = 16000;
    return mysql.createConnection(dbConfig);
  }
};
