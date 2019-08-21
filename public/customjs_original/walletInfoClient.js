(function($) {
  "use strict";

  $(document).ready(function() {
    var table = $("#datatable").DataTable({
      lengthChange: false,
      buttons: ["print", "excel", "pdf", "colvis"],
      select: true,
      serverSide: false,
      paging: true,
      pageLength: 10,
      processing: true,
      language: {
        search: "Search hash (more than 4 char)"
      },
      //   ajax: {
      //     url: "https://www.gmbplatform.io/blockexplorer/provider/init/wallet",
      //     type: "POST",
      //     xhrFields: { withCredentials: true },
      //     crossDomain: true,
      //     data: data => {
      //       data.delimiter = "block";
      //     }
      //   },
      //   columns: [
      // { data: "no" },
      // // { data: "topk" },
      // // { data: "from" },
      // // { data: "amount" },
      // // { data: "kind" }
      // // {
      //   data: "hash",
      //   render: (data, type, row, meta) => {
      //     if (type === "display") {
      //       data = `<a style="color:#3498db;" onmouseover="$(this).css('text-decoration', 'underline');" onmouseout="$(this).css('text-decoration', 'none');" href="https://gmbplatform.io/blockexplorer/search/block?key=${data}">${data}</a>`;
      //     }
      //     return data;
      //   }
      // }
      //   ],
      lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]]
    });
    table
      .buttons()
      .container()
      .appendTo("#datatable_wrapper .col-md-6:eq(0)");
  });
})(jQuery);
