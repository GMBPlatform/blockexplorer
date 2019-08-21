const walletState = { status: false };
let transferId = 1;

const initWallet = () => {};
const requestRender = (method_, firstUrl, lastUrl, success_, data_) => {
  $.ajax({
    type: method_,
    data: data_,
    url: `https://www.gmbplatform.io/blockexplorer/wallet/${firstUrl}/${lastUrl}`,
    success: success_ === null ? () => {} : success_
  });
};

const alertHandler = (id, message) => {
  $(`#${id}`).text(message);

  $(`#${id}`).show();
  setTimeout(() => {
    $(`#${id}`).hide();
  }, 2000);
};

const appendTransfer = () => {
  transferId++;
  $("#transfer_form").append(`
  <div id="transfer_${transferId}" class="transfer-form__inner">
    <div class="row wallet-row-wrapper">
      <div class="col-lg-12 ">
        <div style="display:flex; justify-content: space-between;">
          <div class="transfer-title">받는 지갑 주소</div>
          <div>
            <a
              id="remove_${transferId}"
              onclick="removeTransfer(this.id)"
              style="color:#a6a6a6; margin:0px 0px 0px 5px; font-size:15px;"
              onmouseover="$(this).css('text-decoration', 'underline'); $(this).css('cursor', 'pointer');"
              onmouseout="$(this).css('text-decoration', 'none');"
            >
              해당 정보 삭제
            </a>
          </div>
        </div>
        <input name="wallet_to" type="text" placeholder="From" class="form-control" maxlength="70" />
      </div>
    </div>
    <div class="row wallet-row-wrapper">
      <div class="col-lg-6 ">
        <div class="transfer-title">보낼 금액</div>
        <input
          name="wallet_amount"
          type="number"
          placeholder="Amount"
          class="form-control"
          maxlength="20"
        />
      </div>
      <div class="col-lg-6 ">
        <div class="transfer-title">수수료</div>
        <input name="wallet_fee" type="number" placeholder="Fee" class="form-control" maxlength="20" />
      </div>
    </div>
  </div>
  `);
};
const removeTransfer = id => {
  $(`#${$(`#${id}`).parents("div")[4].id}`).remove();
};

const fileUploadOnChange = () => {
  $("#file_upload_span").text($("#upload-files-default").prop("files")[0].name);
};

const buttonLoader = (id, isStart) => {
  if (isStart) {
    $(`#${id}`).addClass("is-loading");
    $(`#${id}`).attr("disabled", true);
  } else {
    $(`#${id}`).removeClass("is-loading");
    $(`#${id}`).attr("disabled", false);
  }
};

const sideBarOnClick = id => {
  const requestPage = result => {
    $("#dynamic-form").html(result);
  };
  switch (id) {
    case "wallet_generate":
      requestRender("post", "page", "generate", requestPage);
      break;

    case "wallet_information":
      if (!walletState.status) {
        return;
      }
      requestRender("post", "page", "information", requestPage, walletState);
      break;

    case "load_keyfile":
      requestRender("post", "page", "load/keyfile", requestPage);
      break;

    case "load_direct":
      requestRender("post", "page", "load/direct", requestPage);
      break;

    case "transfer":
      requestRender("post", "page", "transaction/transfer", requestPage);
      break;

    case "smart_contract":
      requestRender("post", "page", "transaction/contract", requestPage);
      break;

    default:
      break;
  }
};

const innerSubmitButtonOnClick = id => {
  switch (id) {
    case "wallet_generate_button":
      const walletPassword = $("#wallet_password").val();
      const walletMnemonic = $("#wallet_mnemonic").val();

      if (walletMnemonic.length > 256 || walletMnemonic.length < 8) {
        alertHandler(
          "wallet_generate_alert",
          "사용자 정의 문장은 8글자 이상 256글자 이하여야 합니다."
        );
        return;
      }

      if (walletPassword.length > 20 || walletPassword.length < 8) {
        alertHandler(
          "wallet_generate_alert",
          "비밀번호는 8글자 이상 20글자 이하여야 합니다."
        );
        return;
      }

      const generateRequestForm = {
        mnemonic: walletMnemonic,
        password: walletPassword
      };

      const generateRequestApi = result => {
        if (isIE()) {
          saveToFileIE(
            `${new Date().getTime()}.json`,
            JSON.stringify(result.keyFile)
          );
        } else {
          saveToFileChrome(
            `${new Date().getTime()}.json`,
            JSON.stringify(result.keyFile)
          );
        }
        walletState.status = true;
        walletState.walletInfo = result;
        $("#need_wallet_form").css("display", "block");
        buttonLoader(id, false);
        sideBarOnClick("wallet_information");
      };
      buttonLoader(id, true);
      requestRender(
        "post",
        "api",
        "generate",
        generateRequestApi,
        generateRequestForm
      );
      break;
    case "load_keyfile_button":
      const walletPassword_Keyfile = $("#wallet_password").val();
      const file = $("#upload-files-default").prop("files")[0];

      if (
        walletPassword_Keyfile.length > 20 ||
        walletPassword_Keyfile.length < 8
      ) {
        alertHandler(
          "wallet_keyfile_alert",
          "비밀번호는 8글자 이상 20글자 이하여야 합니다."
        );
        return;
      }
      if (file.type !== "application/json") {
        alertHandler(
          "wallet_keyfile_alert",
          "키 파일의 확장자명이 json이 아닙니다."
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (reader.result === undefined) {
            alertHandler("wallet_keyfile_alert", "잘못된 키 파일입니다.(1)");
            return;
          }
          const keyfileRequestForm = JSON.parse(
            Base64.decode(JSON.parse(reader.result).content)
          );

          const keyfileRequestApi = result => {
            walletState.status = true;
            walletState.walletInfo = result;
            $("#need_wallet_form").css("display", "block");
            buttonLoader(id, false);
            sideBarOnClick("wallet_information");
          };
          if (keyfileRequestForm.password !== sha256(walletPassword_Keyfile)) {
            alertHandler(
              "wallet_keyfile_alert",
              "잘못된 비밀번호입니다. 확인 후 다시 입력해주세요."
            );
            return;
          }
          keyfileRequestForm.password = walletPassword_Keyfile;
          buttonLoader(id, true);
          requestRender(
            "post",
            "api",
            "load/keyfile",
            keyfileRequestApi,
            keyfileRequestForm
          );
        } catch (e) {
          alertHandler("wallet_keyfile_alert", "잘못된 키 파일입니다.(2)");
        }
      };
      reader.readAsText(file, "utf-8");
      break;
    case "load_direct_button":
      const walletPassword_Direct = $("#wallet_password").val();
      const walletMnemonic_Direct = $("#wallet_mnemonic").val();
      const walletRandom_Direct = $("#wallet_random").val();

      if (
        walletMnemonic_Direct.length > 256 ||
        walletMnemonic_Direct.length < 8
      ) {
        alertHandler(
          "wallet_direct_alert",
          "사용자 정의 문장은 8글자 이상 256글자 이하여야 합니다."
        );
        return;
      }

      if (
        walletPassword_Direct.length > 20 ||
        walletPassword_Direct.length < 8
      ) {
        alertHandler(
          "wallet_direct_alert",
          "비밀번호는 8글자 이상 20글자 이하여야 합니다."
        );
        return;
      }

      const directRequestForm = {
        mnemonic: walletMnemonic_Direct,
        password: walletPassword_Direct,
        randomNumber: walletRandom_Direct
      };

      const directRequestApi = result => {
        walletState.status = true;
        walletState.walletInfo = result;
        $("#need_wallet_form").css("display", "block");
        buttonLoader(id, false);
        sideBarOnClick("wallet_information");
      };
      buttonLoader(id, true);
      requestRender(
        "post",
        "api",
        "load/direct",
        directRequestApi,
        directRequestForm
      );
      break;
    case "transfer_button":
      const walletFrom_Transfer = $("#wallet_from").val();
      const walletPrivateKey_Transfer = $("#wallet_private_key").val();

      const walletNote = [];

      const getAmount = $("input[name=wallet_amount]");
      const getTo = $("input[name=wallet_to]");
      const getFee = $("input[name=wallet_fee]");

      let sendAmount = 0;

      for (let i = 0; i < getTo.length; i++) {
        const innerAmount = getAmount.eq(i).val();
        const innerTo = getTo.eq(i).val();
        const innerFee = getFee.eq(i).val();

        if (innerAmount === "" || innerTo === "" || innerFee === "") {
          alertHandler("wallet_transfer_alert", "비어있는 항목이 존재합니다");
          return;
        }

        if (innerTo.length !== 66) {
          alertHandler(
            "wallet_transfer_alert",
            "받는 지갑 주소 중 잘못된 항목이 존재합니다. 지갑 주소는 66글자여야 합니다."
          );
        }

        sendAmount += Number(innerAmount) + Number(innerFee);

        walletNote.push({
          To: innerTo,
          Fee: innerFee,
          Kind: 1,
          Amount: innerAmount
        });
      }
      const walletBalanceForm_Transfer = { address: walletFrom_Transfer };
      const walletBalanceApi_Transfer = result => {
        const walletBalance_Transfer = result.balance;
        if (walletBalance_Transfer < sendAmount) {
          alertHandler("wallet_transfer_alert", "잔액이 부족합니다.");
          return;
        }

        if (walletFrom_Transfer.length !== 66) {
          alertHandler(
            "wallet_transfer_alert",
            "잘못된 지갑주소입니다. 보내는 지갑 주소를 올바르게 입력하세요."
          );
          return;
        }

        if (walletPrivateKey_Transfer.length !== 64) {
          alertHandler("wallet_transfer_alert", "잘못된 개인 키 입니다.");
          return;
        }

        const transferRequestForm = {
          from: walletFrom_Transfer,
          note: walletNote,
          privateKey: walletPrivateKey_Transfer
        };

        const transferRequestApi = result => {
          if (result.res === "success") {
            alertHandler("wallet_transfer_alert_success", "송금되었습니다.");
            setTimeout(() => {
              buttonLoader(id, false);
              sideBarOnClick("transfer");
              location.href = `/blockexplorer/search/transaction?key=${
                result.hash
              }`;
            }, 1000);
          } else {
            alertHandler(
              "wallet_transfer_alert",
              "송금이 실패하였습니다. 입력 항목을 확인하세요."
            );
            buttonLoader(id, false);
          }
        };
        buttonLoader(id, true);
        requestRender(
          "post",
          "api",
          "transaction/transfer",
          transferRequestApi,
          transferRequestForm
        );
      };
      requestRender(
        "post",
        "api",
        "balance",
        walletBalanceApi_Transfer,
        walletBalanceForm_Transfer
      );

      break;

    default:
      break;
  }
};

const saveToFileChrome = (fileName, content) => {
  var blob = new Blob([content], { type: "json" });

  objURL = window.URL.createObjectURL(blob);

  if (window.__Xr_objURL_forCreatingFile__) {
    window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
  }
  window.__Xr_objURL_forCreatingFile__ = objURL;

  var a = document.createElement("a");

  a.download = fileName;
  a.href = objURL;
  a.click();
};

const saveToFileIE = (fileName, content) => {
  var blob = new Blob([content], { type: "json", endings: "native" });

  window.navigator.msSaveBlob(blob, fileName);
};

const isIE = () => {
  return (
    (navigator.appName === "Netscape" &&
      navigator.userAgent.search("Trident") !== -1) ||
    navigator.userAgent.toLowerCase().indexOf("msie") !== -1
  );
};

const Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function(e) {
    var t = "";
    var n, r, i, s, o, u, a;
    var f = 0;
    e = Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = ((n & 3) << 4) | (r >> 4);
      u = ((r & 15) << 2) | (i >> 6);
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64;
      } else if (isNaN(i)) {
        a = 64;
      }
      t =
        t +
        this._keyStr.charAt(s) +
        this._keyStr.charAt(o) +
        this._keyStr.charAt(u) +
        this._keyStr.charAt(a);
    }
    return t;
  },
  decode: function(e) {
    var t = "";
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++));
      o = this._keyStr.indexOf(e.charAt(f++));
      u = this._keyStr.indexOf(e.charAt(f++));
      a = this._keyStr.indexOf(e.charAt(f++));
      n = (s << 2) | (o >> 4);
      r = ((o & 15) << 4) | (u >> 2);
      i = ((u & 3) << 6) | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r);
      }
      if (a != 64) {
        t = t + String.fromCharCode(i);
      }
    }
    t = Base64._utf8_decode(t);
    return t;
  },
  _utf8_encode: function(e) {
    e = e.replace(/\r\n/g, "\n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode((r >> 6) | 192);
        t += String.fromCharCode((r & 63) | 128);
      } else {
        t += String.fromCharCode((r >> 12) | 224);
        t += String.fromCharCode(((r >> 6) & 63) | 128);
        t += String.fromCharCode((r & 63) | 128);
      }
    }
    return t;
  },
  _utf8_decode: function(e) {
    var t = "";
    var n = 0;
    var r = (c1 = c2 = 0);
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++;
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode(((r & 31) << 6) | (c2 & 63));
        n += 2;
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode(
          ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        n += 3;
      }
    }
    return t;
  }
};

const sha256 = s => {
  var chrsz = 8;
  var hexcase = 0;

  function safe_add(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function S(X, n) {
    return (X >>> n) | (X << (32 - n));
  }
  function R(X, n) {
    return X >>> n;
  }
  function Ch(x, y, z) {
    return (x & y) ^ (~x & z);
  }
  function Maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
  }
  function Sigma0256(x) {
    return S(x, 2) ^ S(x, 13) ^ S(x, 22);
  }
  function Sigma1256(x) {
    return S(x, 6) ^ S(x, 11) ^ S(x, 25);
  }
  function Gamma0256(x) {
    return S(x, 7) ^ S(x, 18) ^ R(x, 3);
  }
  function Gamma1256(x) {
    return S(x, 17) ^ S(x, 19) ^ R(x, 10);
  }

  function core_sha256(m, l) {
    var K = new Array(
      0x428a2f98,
      0x71374491,
      0xb5c0fbcf,
      0xe9b5dba5,
      0x3956c25b,
      0x59f111f1,
      0x923f82a4,
      0xab1c5ed5,
      0xd807aa98,
      0x12835b01,
      0x243185be,
      0x550c7dc3,
      0x72be5d74,
      0x80deb1fe,
      0x9bdc06a7,
      0xc19bf174,
      0xe49b69c1,
      0xefbe4786,
      0xfc19dc6,
      0x240ca1cc,
      0x2de92c6f,
      0x4a7484aa,
      0x5cb0a9dc,
      0x76f988da,
      0x983e5152,
      0xa831c66d,
      0xb00327c8,
      0xbf597fc7,
      0xc6e00bf3,
      0xd5a79147,
      0x6ca6351,
      0x14292967,
      0x27b70a85,
      0x2e1b2138,
      0x4d2c6dfc,
      0x53380d13,
      0x650a7354,
      0x766a0abb,
      0x81c2c92e,
      0x92722c85,
      0xa2bfe8a1,
      0xa81a664b,
      0xc24b8b70,
      0xc76c51a3,
      0xd192e819,
      0xd6990624,
      0xf40e3585,
      0x106aa070,
      0x19a4c116,
      0x1e376c08,
      0x2748774c,
      0x34b0bcb5,
      0x391c0cb3,
      0x4ed8aa4a,
      0x5b9cca4f,
      0x682e6ff3,
      0x748f82ee,
      0x78a5636f,
      0x84c87814,
      0x8cc70208,
      0x90befffa,
      0xa4506ceb,
      0xbef9a3f7,
      0xc67178f2
    );

    var HASH = new Array(
      0x6a09e667,
      0xbb67ae85,
      0x3c6ef372,
      0xa54ff53a,
      0x510e527f,
      0x9b05688c,
      0x1f83d9ab,
      0x5be0cd19
    );

    var W = new Array(64);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;

    m[l >> 5] |= 0x80 << (24 - (l % 32));
    m[(((l + 64) >> 9) << 4) + 15] = l;

    for (var i = 0; i < m.length; i += 16) {
      a = HASH[0];
      b = HASH[1];
      c = HASH[2];
      d = HASH[3];
      e = HASH[4];
      f = HASH[5];
      g = HASH[6];
      h = HASH[7];

      for (var j = 0; j < 64; j++) {
        if (j < 16) W[j] = m[j + i];
        else
          W[j] = safe_add(
            safe_add(
              safe_add(Gamma1256(W[j - 2]), W[j - 7]),
              Gamma0256(W[j - 15])
            ),
            W[j - 16]
          );

        T1 = safe_add(
          safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]),
          W[j]
        );
        T2 = safe_add(Sigma0256(a), Maj(a, b, c));

        h = g;
        g = f;
        f = e;
        e = safe_add(d, T1);
        d = c;
        c = b;
        b = a;
        a = safe_add(T1, T2);
      }

      HASH[0] = safe_add(a, HASH[0]);
      HASH[1] = safe_add(b, HASH[1]);
      HASH[2] = safe_add(c, HASH[2]);
      HASH[3] = safe_add(d, HASH[3]);
      HASH[4] = safe_add(e, HASH[4]);
      HASH[5] = safe_add(f, HASH[5]);
      HASH[6] = safe_add(g, HASH[6]);
      HASH[7] = safe_add(h, HASH[7]);
    }
    return HASH;
  }

  function str2binb(str) {
    var bin = Array();
    var mask = (1 << chrsz) - 1;
    for (var i = 0; i < str.length * chrsz; i += chrsz) {
      bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - (i % 32));
    }
    return bin;
  }

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  function binb2hex(binarray) {
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
      str +=
        hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8 + 4)) & 0xf) +
        hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xf);
    }
    return str;
  }

  s = Utf8Encode(s);
  return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
};
