const socket = io("https://gmbplatform.io:21979");
socket.on("message", function(message) {
  const delimiter = message.delimiter;
  const count = message.count;
  const info = message.info;
  switch (delimiter) {
    case "transaction":
      const transactionResult = info.reduce((sum, transaction) => {
        return (sum += transactionTableRowGenerator(
          transaction.block_num,
          transaction.db_key,
          transaction.hash
        ));
      }, "");
      $("#total-transaction").text(count);
      $("#transaction-information__table > tbody:last").html(transactionResult);

      break;
    case "block":
      const blockResult = info.reduce((sum, block) => {
        return (sum += blockTableRowGenerator(
          block.block_num,
          block.block_gen_time,
          block.tx_count,
          block.hash
        ));
      }, "");
      $("#total-block").text(count);
      $("#block-information__table > tbody:last").html(blockResult);
      break;
    case "node":
      const NN_LIST = info.TIER[0].NN_LIST;

      const nodeResult = NN_LIST.reduce((sum, node) => {
        return (sum += tableRowGenerator(node.P2P, node.SOCK.PROTO));
      }, "");
      $("#node-information__table > tbody:last").html(nodeResult);
      break;
    case "chart":
      chartUpdate(message.timeList, message.tpsList, `tps__chart`);
      chartUpdate(message.dateList, message.amountList, `daily-transaction__chart`);
      break;
    default:
  }
});

const tableRowGenerator = (first, second, third, fourth) => {
  const tdStyle = `padding:12px;`;
  const h5Style = `font-size:12px`;
  const row = `
  <tr style="font-family:Monospace, 'Consolas'">
  <td style="${tdStyle}"><h5 style="${h5Style}">${first}</h5></td>
  <td style="${tdStyle}"><h5 style="${h5Style}">${second}</h5></td>
  ${third && `<td style="${tdStyle}"><h5 style="${h5Style}">${third}</h5></td>`}
  ${fourth && `<td style="${tdStyle}"><h5 style="${h5Style}">${fourth}</h5></td>`}
}
  </tr>
  `;
  return row;
};

const blockTableRowGenerator = (first, second, third, fourth) => {
  const tdStyle = `padding:12px;`;
  const h5Style = `font-size:12px;`;
  const colorStyle = `color:#3498db`;

  const row = `
  <tr style="font-family:Monospace, 'Consolas'">
  <td style="${tdStyle}"><h5 style="${h5Style}">${first}</h5></td>
  <td style="${tdStyle}"><h5 style="${h5Style}">${second}</h5></td>
  <td style="${tdStyle}"><h5 style="${h5Style}">${third}</h5></td>
  <td style="${tdStyle}">
    <a style="${tdStyle + h5Style + colorStyle}" onmouseover="$(this).css('text-decoration', 'underline');"
     onmouseout="$(this).css('text-decoration', 'none');"
     href="https://gmbplatform.io/blockexplorer/search/block?key=${fourth}">
     ${fourth}
    </a>
  </td>
  </tr>
  `;
  return row;
};

const transactionTableRowGenerator = (first, second, third) => {
  const tdStyle = `padding:12px;`;
  const h5Style = `font-size:12px;`;
  const colorStyle = `color:#3498db`;
  const row = `
  <tr style="font-family:Monospace, 'Consolas'">
  <td style="${tdStyle}"><h5 style="${h5Style}">${first}</h5></td>
  <td style="${tdStyle}"><h5 style="${h5Style}">${second}</h5></td>
  <td style="${tdStyle}">
  <a style="${tdStyle + h5Style + colorStyle}" onmouseover="$(this).css('text-decoration', 'underline');"
   onmouseout="$(this).css('text-decoration', 'none');"
   href="https://gmbplatform.io/blockexplorer/search/transaction?key=${third}">
   ${third}
  </a>
  </td>
 
  </tr>
  `;
  return row;
};

const chartUpdate = (timeList, tpsList, chartId) => {
  const chart = $(`#${chartId}`);
  if (!chart.length) {
    return;
  }
  echarts.init(chart.get(0)).setOption(
    {
      tooltip: {
        trigger: "axis"
      },
      title: null,
      legend: null,
      lineTension: 0,
      grid: { top: 10, right: 50, left: 50, bottom: 40 },
      xAxis: [
        {
          type: "category",
          boundaryGap: !1,
          data: [
            timeList[0],
            timeList[1],
            timeList[2],
            timeList[3],
            timeList[4],
            timeList[5],
            timeList[6],
            timeList[7],
            timeList[8],
            timeList[9]
          ],
          axisLine: { lineStyle: { color: "#e9ebee" } },
          axisTick: { show: !1 },
          splitLine: { lineStyle: { color: "#e9ebee" } },
          axisLabel: {
            margin: 20,
            fontFamily: "Open Sans",
            fontSize: 12,
            color: "#939daa"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          splitLine: { lineStyle: { color: "#e9ebee" } },
          axisLine: { lineStyle: { color: "#e9ebee" } },
          axisTick: { show: !1 },
          max: Math.max.apply(null, tpsList),
          min: 0,
          axisLabel: {
            formatter: value => {
              if (100000 < value) {
                return `${numberWithCommas(Math.floor(value / 1000))}k`;
              }
              return numberWithCommas(value);
            },
            fontFamily: "Open Sans",
            fontSize: 12,
            color: "#939daa"
          }
        }
      ],
      series: [
        {
          type: "line",
          data: [
            tpsList[0],
            tpsList[1],
            tpsList[2],
            tpsList[3],
            tpsList[4],
            tpsList[5],
            tpsList[6],
            tpsList[7],
            tpsList[8],
            tpsList[9]
          ],
          showSymbol: !1,
          lineStyle: { normal: { color: "#eb5463" } },
          smooth: true
        }
      ]
    },
    !0
  );
};

const initRequest = () => {
  $.ajax({
    type: "POST",
    url: "https://www.gmbplatform.io/blockexplorer/provider/init/dashboard",
    data: {
      delimiter: "dashboard"
    },
    success: result => {
      $("#Text_LastPrice").text("$ " + parseFloat(result.marketcap.price_usd).toFixed(4) + " USD");
      $("#Text_Change").text(result.marketcap.percent_change_24h + " % (24H)");
      $("#Text_Volume24H").text(result.marketcap["24h_volume_usd"] + " GMB");
      const blockResult = result.block.reduce((sum, block) => {
        return (sum += blockTableRowGenerator(
          block.block_num,
          block.block_gen_time,
          block.tx_count,
          block.hash
        ));
      }, "");
      const transactionResult = result.transaction.reduce((sum, transaction) => {
        return (sum += transactionTableRowGenerator(
          transaction.block_num,
          transaction.db_key,
          transaction.hash
        ));
      }, "");
      $("#transaction-information__table > tbody:last").html(transactionResult);
      $("#block-information__table > tbody:last").html(blockResult);

      $("#total-transaction").text(result.dashboard.total_tx_cnt);
      $("#total-block").text(result.dashboard.total_blk_cnt);
      $("#total-wallet").text(result.walletCount);
    }
  });
};

const searchAlert = handler => {
  switch (handler) {
    case "length":
      $("#search-alert").text("Term is too short!");
      break;
    case "filter":
      $("#search-alert").text("You have to choose Transaction Hash or Block Hash or Wallet Address.");
      break;
    default:
      $("#search-alert").text("Unknown Error");
      break;
  }

  $("#search-alert").show();
  setTimeout(() => {
    $("#search-alert").hide();
  }, 2000);
};

const searchOnSubmit = () => {
  const delimiter = $.trim($("#searchDropDown").text());
  const input = $("#search-input").val();

  switch (delimiter) {
    case "Tx Hash":
      if (input.length < 64) {
        searchAlert("length");
        break;
      }
      $("#search-form").attr("action", `https://gmbplatform.io/blockexplorer/search/transaction`);
      return true;
    case "Block Hash":
      if (input.length < 64) {
        searchAlert("length");
        break;
      }
      $("#search-form").attr("action", `https://gmbplatform.io/blockexplorer/search/block`);
      return true;
    case "Wallet Addr":
      if (input.length !== 66) {
        searchAlert("length");
        break;
      }
      $("#search-form").attr("action", `https://gmbplatform.io/blockexplorer/search/wallet`);
      return true;
    default:
      searchAlert("filter");
      break;
  }
  return false;
};

const searchDropDownMenuOnClick = () => {};
const searchDropDownItemOnClick = delimiter => {
  switch (delimiter) {
    case "block":
      $("#searchDropDown").text("Block Hash");
      break;
    case "transaction":
      $("#searchDropDown").text("Tx Hash");
      break;
    case "wallet":
      $("#searchDropDown").text("Wallet Addr");
      break;
    default:
      break;
  }
};

const numberWithCommas = number => {
  number = number.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(number)) {
    number = number.replace(pattern, "$1,$2");
  }
  return number;
};

const returnUTCTime = select => {
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

const init = () => {
  initRequest();
};
