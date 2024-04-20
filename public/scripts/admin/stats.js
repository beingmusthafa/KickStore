function openReports() {
  $("#select-reports").removeClass("d-none");
  $("#browse-reports").attr("onclick", "closeReports()");
}
function closeReports() {
  $("#select-reports").addClass("d-none");
  $("#browse-reports").attr("onclick", "openReports()");
}

let xValues = [];
let yValues = [];
let barColors = ["rgb(2, 44, 75)", "green", "blue", "orange", "brown"];
new Chart("chart", {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [
      {
        backgroundColor: barColors,
        data: yValues,
      },
    ],
  },
  options: {
    legend: { display: false },
    title: {
      display: true,
      text: "Orders by categories",
    },
  },
});
$("document").ready(() => {
  $.ajax({
    type: "GET",
    url: "/admin/stats/get-category-graph",
    success: (res) => {
      for (category of res.categories) {
        xValues.push(category.name);
        yValues.push(category.orderCount);
      }
      new Chart("chart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [
            {
              backgroundColor: barColors,
              data: yValues,
            },
          ],
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: "Orders by categories",
          },
        },
      });
    },
  });
});

function route(url) {
  location.href = "/admin/stats/" + url;
}
