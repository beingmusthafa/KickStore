const button = document.getElementById("block");
const dialog = document.querySelector(".dialog");
function blockAndChange(id) {
  if (button.innerText === "Block") {
    $("#loading").removeClass("d-none");
    $.ajax({
      type: "POST",
      url: "/admin/users/user-details/block",
      data: { id: id },
      dataType: "json",
      success: function (res) {
        location.reload();
      },
    });
  } else {
    $("#loading").removeClass("d-none");
    $.ajax({
      type: "POST",
      url: "/admin/users/user-details/unblock",
      data: { id: id },
      dataType: "json",
      success: function (res) {
        location.reload();
      },
    });
  }
}
function openConfirm() {
  $("#overlay").removeClass("d-none");
  $(".popup").removeClass("d-none");
}
function closeConfirm() {
  $("#overlay").addClass("d-none");
  $(".popup").addClass("d-none");
}
