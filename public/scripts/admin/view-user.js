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
        console.log(res);
        button.innerText = "Unblock";
        dialog.innerText = "Unblock this user?";
        button.style.backgroundColor = "green";
        document.querySelector(".confirm-popup").classList.add("d-none");
        $("#loading").addClass("d-none");
        $("#overlay").addClass("d-none");
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
        console.log(res);
        button.innerText = "Block";
        dialog.innerText = "Block this user?";
        button.style.backgroundColor = "red";
        document.querySelector(".confirm-popup").classList.add("d-none");
        $("#loading").addClass("d-none");
        $("#overlay").addClass("d-none");
      },
    });
  }
}
function openConfirm() {
  $("#overlay").removeClass("d-none");
  document.querySelector(".confirm-popup").classList.remove("d-none");
}
function closeConfirm() {
  $("#overlay").addClass("d-none");
  document.querySelector(".confirm-popup").classList.add("d-none");
}
