(function($) {
  "use strict";

  $(document).ready(function() {
    var table = $("#datatable").DataTable({
      ordering: false,
      lengthChange: true,
      buttons: ["print", "excel", "pdf", "colvis"],
      select: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      processing: true,
      language: {
        search: "Search hash (more than 4 char)"
      },
      ajax: {
        url: "https://www.gmbplatform.io/blockexplorer/provider/init/transaction",
        type: "POST",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: data => {
          data.delimiter = "transaction";
        }
      },
      columns: [
        { data: "block_num" },
        { data: "db_key" },
        {
          data: "hash",
          render: (data, type, row, meta) => {
            if (type === "display") {
              data = `<a style="color:#3498db;" onmouseover="$(this).css('text-decoration', 'underline');" onmouseout="$(this).css('text-decoration', 'none');" href="https://gmbplatform.io/blockexplorer/search/transaction?key=${data}">${data}</a>`;
            }

            return data;
          }
        }
      ],
      lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]]
    });
    table
      .buttons()
      .container()
      .appendTo("#datatable_wrapper .col-md-6:eq(0)");
  });
})(jQuery);
