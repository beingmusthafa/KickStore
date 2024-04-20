const name = document.querySelector("input[name='name']");
const brand = document.querySelector("input[name='brand']");
const price = document.querySelector("input[name='price']");
const description = document.querySelector("input[name='description']");

const nameWarning = document.getElementById("name-warning");
const brandWarning = document.getElementById("brand-warning");
const priceWarning = document.getElementById("price-warning");
const descriptionWarning = document.getElementById("description-warning");
const genderWarning = document.getElementById("gender-warning");
const categoryWarning = document.getElementById("category-warning");

function submit() {
  $("#loading").removeClass("d-none");
  const form = document.getElementById("edit-form");
  var formData = new FormData(form);
  $.ajax({
    type: "POST",
    url: "/admin/products/product-details/edit-product",
    data: formData,
    processData: false,
    contentType: false,
    success: (res) => {
      if (res.message === "success") {
        history.back();
      } else {
        nameWarning.innerText = res.name;
        brandWarning.innerText = res.brand;
        priceWarning.innerText = res.price;
        descriptionWarning.innerText = res.description;
        genderWarning.innerText = res.gender;
        $("#loading").addClass("d-none");
      }
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
