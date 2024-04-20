const category = document.getElementById("category");
category.addEventListener("change", function () {
  document.getElementById("categoryForm").submit();
});

const gender = document.getElementById("gender");
gender.addEventListener("change", function () {
  document.getElementById("genderForm").submit();
});

function viewProductDetails(id) {
  const link = "/admin/products/product-details?id=" + id;
  window.location.href = link;
}

function manageCategory() {
  window.location.href = "/admin/products/manage-categories";
}

function addNew() {
  window.location.href = "/admin/products/add-product";
}
function page(site) {
  window.location.href = "/admin/" + site;
}
