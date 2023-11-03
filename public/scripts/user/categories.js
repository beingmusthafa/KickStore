function viewSubCategory(name) {
  const link = "/categories?category=" + name;
  window.location.href = link;
}

function viewProductDetails(id) {
  const link = "/products/view-product?product=" + id;
  window.location.href = link;
}
