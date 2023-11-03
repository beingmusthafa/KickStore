function logout() {
  window.location.href = "/logout";
}
function openNav() {
  $("#sidebar").css("display", "flex");
  $("#sidebar").css("animation-name", "navOpen");
}
function closeNav() {
  $("#sidebar").css("animation-name", "navClose");
  setTimeout(() => {
    $("#sidebar").css("display", "none");
  }, 300);
}
function page(route) {
  location.href = "/admin/" + route;
}
