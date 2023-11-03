const sizeAdd = document.querySelector("input[name='size']");
const quantityAdd = document.querySelector("input[name='quantity']");

function openAddSize(id) {
  orderId = id;
  $("#overlay").removeClass("d-none");
  $("#add-size").removeClass("d-none");
}
function closeAddSize() {
  $("#overlay").addClass("d-none");
  $("#add-size").addClass("d-none");
}
function addSize(productId) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/admin/products/product-details/manage-stock/add",
    data: {
      productId: productId,
      size: sizeAdd.value,
      stock: quantityAdd.value,
    },
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
function updateStock(stockId) {
  $("#loading").removeClass("d-none");
  let quantity = document.querySelector(`input[name='${stockId}']`).value;
  if (quantity < 0) {
    quantity = 0;
  }
  $.ajax({
    type: "POST",
    url: "/admin/products/product-details/manage-stock/update",
    data: { stock: quantity, stockId: stockId },
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
function back() {
  window.history.back();
}
