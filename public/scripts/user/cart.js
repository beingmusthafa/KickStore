function incCartCount(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/cart/inc-cart",
    data: { cart: id },
    dataType: "json",
    success: function (res) {
      location.reload();
    },
  });
}

function decCartCount(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/cart/dec-cart",
    data: { cart: id },
    dataType: "json",
    success: function (res) {
      location.reload();
    },
  });
}
let cartId;
function openDeleteConfirm(id) {
  cartId = id;
  $("#overlay").removeClass("d-none");
  $("#confirm-delete").removeClass("d-none");
}
function closeDeleteConfirm() {
  $("#overlay").addClass("d-none");
  $("#confirm-delete").addClass("d-none");
}

function deleteFromCart() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/cart/delete-cart",
    data: { cart: cartId },
    dataType: "json",
    success: function (res) {
      location.reload();
    },
  });
}
function checkout() {
  window.location.href = "/checkout";
}

function viewProductDetails(id) {
  const link = "/products/view-product?product=" + id;
  window.location.href = link;
}
