function viewUserDetails(id) {
  const link = "/admin/users/user-details?id=" + id;
  console.log(link);
  window.location.href = link;
}
