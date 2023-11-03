function search() {
  const search = document.getElementById("search").value;
  const exclude = document.getElementbyId("exclude").value;
}
let orderId;
function openCancelConfirm(id) {
  orderId = id;
  $("#overlay").removeClass("d-none");
  $("#confirm-cancel").removeClass("d-none");
}
function closeCancelConfirm() {
  $("#overlay").addClass("d-none");
  $("#confirm-cancel").addClass("d-none");
}
function cancelOrder() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/home/cancel-order",
    data: { order: orderId },
    dataType: "json",
    success: () => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
function openStatusSelect(id) {
  orderId = id;
  $("#overlay").removeClass("d-none");
  $("#update-status").removeClass("d-none");
}
function closeStatusSelect() {
  $("#overlay").addClass("d-none");
  $("#update-status").addClass("d-none");
}
function updateStatus() {
  $("#loading").removeClass("d-none");
  const status = document.getElementById("status-select").value;
  $.ajax({
    type: "POST",
    url: "/admin/orders/update-status",
    data: { order: orderId, status: status },
    dataType: "json",
    success: () => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
