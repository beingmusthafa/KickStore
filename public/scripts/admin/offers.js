const code = document.querySelector("input[name='code']");
const type = document.querySelector("input[name='type']");
const eligibility = document.querySelector("select[name='eligibility']");
const minPrice = document.querySelector("input[name='minPrice']");
const maxPrice = document.querySelector("input[name='maxPrice']");
const discountType = document.querySelector("input[name='discountType']");
const discount = document.querySelector("input[name='discount']");

const codeWarning = document.getElementById("code-warning");
const typeWarning = document.getElementById("type-warning");
const eligibilityWarning = document.getElementById("eligibility-warning");
const minPriceWarning = document.getElementById("minPrice-warning");
const maxPriceWarning = document.getElementById("maxPrice-warning");
const discountTypeWarning = document.getElementById("discountType-warning");
const discountWarning = document.getElementById("discount-warning");

function redirect(link) {
  location.href = "/admin/offers/" + link;
}
function openAddCouponForm() {
  $("#offer-form").removeClass("d-none");
  $("#overlay").removeClass("d-none");
}
function closeAddCouponForm() {
  $("#offer-form").addClass("d-none");
  $("#overlay").addClass("d-none");
}

$("#type").change((event) => {
  if (event.target.value === "General") {
    $("#eligibility-field").html("");
  } else {
    $("#eligibility-field").html(
      `<label class="label">Category</label>
            <select id="eligibilityInput" required class="select" name="eligibility">
              <% categories.forEach(function(category){ %>
              <option value="<%= category.name %>"><%= category.name %></option>
              <% }) %>
            </select>
            <div class="warning" id="eligibility-warning"></div>`
    );
  }
});

function codeValidate() {
  if (code.value === (null || "")) {
    codeWarning.innerText = "Enter coupon code!";
    return false;
  } else {
    codeWarning.innerText = "";
    return true;
  }
}
// function eligibilityValidate(){
//   if($("#type").val() !== "General"){
//     if(eligibility.value === (null || "")){
//       eligibilityWarning.innerText = "Enter eligibility criteria!"
//       return false;
//     } else {
//       return true;
//     }
//   } else {
//     return true
//   }
// }
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
  if (codeValidate() && discountValidate()) {
    $("#loading").removeClass("d-none");
    var formData = $("#add-coupon").serialize();
    $.ajax({
      type: "POST",
      url: "/admin/offers/add-coupon",
      data: formData,
      success: (res) => {
        if (res.message === "success") {
          location.reload();
        } else {
          // codeWarning.innerText = res.code;
          // eligibilityWarning.innerText = res.eligibility;
          // minPriceWarning.innerText = res.minPrice;
          // maxPriceWarning.innerText = res.maxPrice;
          // discountTypeWarning.innerText = res.discountType;
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

function deleteCoupon(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/admin/offers/delete-coupon",
    data: { coupon: id },
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function disableCoupon(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/admin/offers/disable-coupon",
    data: { coupon: id },
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function enableCoupon(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/admin/offers/enable-coupon",
    data: { coupon: id },
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
