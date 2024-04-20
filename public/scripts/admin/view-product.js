function restoreProduct(id) {
  const confirmPopup = window.confirm(
    "Are you sure you want to RESTORE this product?"
  );
  if (confirmPopup) {
    const link = "/admin/products/product-details/restore?id=" + id;
    window.location.href = link;
  }
}
function editProduct(id) {
  const link = "/admin/products/product-details/edit-product?id=" + id;
  window.location.href = link;
}
function deleteProduct(id) {
  const link = "/admin/products/product-details/delete?id=" + id;
  window.location.href = link;
}
function manageStock(id) {
  const link = "/admin/products/product-details/manage-stock?id=" + id;
  window.location.href = link;
}
function openConfirm() {
  document.querySelector(".confirm-popup").classList.remove("d-none");
}
function closeConfirm() {
  document.querySelector(".confirm-popup").classList.add("d-none");
}
