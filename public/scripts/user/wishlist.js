let productId;
function openDeleteConfirm(id) {
  productId = id;
  $("#overlay").removeClass("d-none");
  $("#confirm-delete").removeClass("d-none");
}
function closeDeleteConfirm() {
  $("#overlay").addClass("d-none");
  $("#confirm-delete").addClass("d-none");
}
function deleteFromWishlist() {
  $.ajax({
    type: "POST",
    url: "/delete-wishlist",
    data: { product: productId },
    dataType: "json",
    success: function (res) {
      location.reload();
    },
  });
}

function viewProductDetails(id) {
  const link = "/products/view-product?product=" + id;
  window.location.href = link;
}
