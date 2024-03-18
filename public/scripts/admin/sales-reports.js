$(document).ready(() => {
  getAndShowReports("Weekly");
});
function submitDate() {
  console.log($("#date-input").val());
  console.log($("#type").val());
}

$("#type").change((event) => {
  switch (event.target.value) {
    case "Weekly":
      // $("#search").html(`<input id="date-input" type="date" style="width: 10rem;">`);
      getAndShowReports("Weekly");
      break;
    case "Monthly":
      // $("#search").html(`<select name="month" id="month">
      //   <option value="January">January</option>
      //   <option value="February">February</option>
      //   <option value="March">March</option>
      //   <option value="April">April</option>
      //   <option value="May">May</option>
      //   <option value="June">June</option>
      //   <option value="July">July</option>
      //   <option value="August">August</option>
      //   <option value="September">September</option>
      //   <option value="October">October</option>
      //   <option value="November">November</option>
      //   <option value="December">December</option>
      // </select>`);
      getAndShowReports("Monthly");
      break;
    case "Yearly":
      // $("#search").html(`<input type="number" min="2023" max="2100">`);
      getAndShowReports("Yearly");
      break;
  }
});
function getAndShowReports(type) {
  $.ajax({
    type: "GET",
    url: "/admin/stats/sales-reports/get-sales-reports",
    data: { type: type },
    success: (res) => {
      let reportHTML = "";
      if (res.reports.length > 0) {
        for (const report of res.reports) {
          let list = `<div class="report">
              <div class="report-name">${report.date}</div>
              <div class="download-buttons">
                <button onclick="downloadPDF('${report._id}')" class="report-download"><i  class='bx bxs-file-pdf'></i>  PDF</button>
              <button onclick="downloadExcel('${report._id}')" class="report-download"><i  class='bx bx-spreadsheet'></i>  Excel</button>
              </div>
              </div>`;
          reportHTML += list;
        }
        $("#report-list").html(reportHTML);
      } else {
        $("#report-list").html(
          `<div style="font-size: 2rem; color: grey; margin: 0 auto;  margin-top: 5rem;" id="emptyMessage">No reports to see...</div>`
        );
      }
    },
  });
}

function downloadExcel(id) {
  location.href = "/admin/stats/download-excel?report=sales&id=" + id;
}

async function downloadPDF(id) {
  try {
    const res = await fetch(
      "/admin/stats/download-pdf?report=sales&id=" + id
    ).then((res) => res.json());
    const pdfBinary = Uint8Array.from(atob(res.buffer), (c) => c.charCodeAt(0));
    const blob = new Blob([pdfBinary], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.href = url;
    link.download = "sales-report.pdf";
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.log(error);
  }
}
