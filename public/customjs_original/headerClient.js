const searchHeaderOnSubmit = () => {
  const delimiter = $.trim($("#searchHeaderDropDown").text());
  const input = $("#search-input__header").val();

  switch (delimiter) {
    case "Tx":
      if (input.length !== 64) {
        searchSweetAlert("length");
        break;
      }
      $("#search-form__header").attr("action", `https://gmbplatform.io/blockexplorer/search/transaction`);
      return true;
    case "Block":
      if (input.length !== 64) {
        searchSweetAlert("length");
        break;
      }
      $("#search-form__header").attr("action", `https://gmbplatform.io/blockexplorer/search/block`);
      return true;
    case "Wallet":
      if (input.length !== 66) {
        searchSweetAlert("length");
        break;
      }
      $("#search-form__header").attr("action", `https://gmbplatform.io/blockexplorer/search/wallet`);
      return true;
    default:
      searchSweetAlert("filter");
      break;
  }
  return false;
};

const searchHeaderDropDownMenuOnClick = () => {};
const searchHeaderDropDownItemOnClick = delimiter => {
  switch (delimiter) {
    case "block":
      $("#searchHeaderDropDown").text("Block");
      break;
    case "transaction":
      $("#searchHeaderDropDown").text("Tx");
      break;
    case "wallet":
      $("#searchHeaderDropDown").text("Wallet");
      break;
    default:
      break;
  }
};

const searchSweetAlert = handler => {
  switch (handler) {
    case "length":
      swal("Search Error", "Term is too short!", "error");
      break;
    case "filter":
      swal("Search Error", "You have to choose Transaction Hash or Block Hash or Wallet Address.", "error");
      break;
    default:
      swal("Search Error", "Unknown Error", "error");
      break;
  }
};
