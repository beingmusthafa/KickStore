let focusedProduct;
function openOfferForm(id) {
  focusedProduct = id;
  $("#offer-form").removeClass("d-none");
  $("#overlay").removeClass("d-none");
}
function closeOfferForm() {
  $("#offer-form").addClass("d-none");
  $("#overlay").addClass("d-none");
  $("#sd").val();
}
function submit() {
  $("#loading").removeClass("d-none");
  const discountType = $("select[name='discountType']").val();
  const discount = $("input[name='discount']").val();
  $.ajax({
    type: "POST",
    url: "/admin/offers/product-offers/add-offer",
    data: {
      productId: focusedProduct,
      discountType: discountType,
      discount: discount,
    },
    dataType: "json",
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

let focusedOffer;
function openConfirm(id) {
  focusedOffer = id;
  $("#overlay").removeClass("d-none");
  document.querySelector(".confirm-popup").classList.remove("d-none");
}
function closeConfirm() {
  $("#overlay").addClass("d-none");
  document.querySelector(".confirm-popup").classList.add("d-none");
}
function deleteOffer() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/admin/offers/product-offers/delete-offer",
    data: { productId: focusedOffer },
    dataType: "json",
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
