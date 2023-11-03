const minPrice = document.querySelector("input[name='minPrice']");
const maxPrice = document.querySelector("input[name='maxPrice']");
const discountType = document.querySelector("input[name='discountType']");
const discount = document.querySelector("input[name='discount']");

const minPriceWarning = document.getElementById("minPrice-warning");
const maxPriceWarning = document.getElementById("maxPrice-warning");
const discountTypeWarning = document.getElementById("discountType-warning");
const discountWarning = document.getElementById("discount-warning");

function openOfferForm() {
  $("#offer-form").removeClass("d-none");
  $("#overlay").removeClass("d-none");
}
function closeOfferForm() {
  $("#offer-form").addClass("d-none");
  $("#overlay").addClass("d-none");
  $("#sd").val();
}

$("#type").change((event) => {
  if (event.target.value === "General") {
    $("#eligibility-field").html("");
  } else {
    $("#eligibility-field")
      .html(`<label id="eligibilityLabel"  class="label">Eligibility</label>
            <input
            id="eligibilityInput"
              class="inputField"
              name="eligibility"
              type="text"
              value=""
            />
            <div class="warning" id="eligibility-warning"></div>`);
  }
});

function eligibilityValidate() {
  if (document.getElementById("type").value !== "General") {
    if (eligibility.value === (null || "")) {
      eligibilityWarning.innerText = "Enter eligibility criteria!";
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
}
function discountValidate() {
  if (discount.value === (null || "")) {
    discountWarning.innerText = "Enter discount!";
    return false;
  } else {
    discountWarning.innerText = "";
    return true;
  }
}

function submit() {
  if (discountValidate()) {
    $("#loading").removeClass("d-none");

    var formData = $("#add-coupon").serialize();
    console.log(formData);
    $.ajax({
      type: "POST",
      url: "/admin/offers/category-offers/add-offer",
      data: formData,
      success: (res) => {
        if (res.message === "success") {
          location.reload();
        } else {
          codeWarning.innerText = res.code;
          minPriceWarning.innerText = res.minPrice;
          maxPriceWarning.innerText = res.maxPrice;
          discountWarning.innerText = res.discount;
          $("#loading").addClass("d-none");
        }
      },
      error: (error) => {
        $("#loading").addClass("d-none");
        console.log(error);
      },
    });
  }
}

let focusedOffer;
function openConfirm(name) {
  $("#overlay").removeClass("d-none");
  focusedOffer = name;
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
    url: "/admin/offers/category-offers/delete-offer",
    data: { offer: focusedOffer },
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
