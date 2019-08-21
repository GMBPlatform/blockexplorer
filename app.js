const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const chartModule = require("./modules/chartModule");

// routes
const viewRouter = require("./routes/viewRouter.js");
const schedulerRouter = require("./routes/schedulerRouter.js");
const providerRouter = require("./routes/providerRouter.js");
const walletRouter = require("./routes/walletRouter.js");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//proxy
// app.set("trust proxy", true);

// app.use(logger("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use("/blockexplorer", viewRouter);
app.use("/blockexplorer/scheduler", schedulerRouter);
app.use("/blockexplorer/provider", providerRouter);
app.use("/blockexplorer/wallet", walletRouter);

app.use("/blockexplorer/static", express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log(err.message);
  // render the error page
  res.status(err.status || 500);
  res.render("404");
});

module.exports = app;
