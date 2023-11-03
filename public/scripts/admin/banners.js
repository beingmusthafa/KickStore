var selectedGender;
function openGenderUpload(gender) {
  $("#overlay").removeClass("d-none");
  $("#selected-gender").val(gender);
  $("#upload-gender").removeClass("d-none");
}
function closeGenderUpload() {
  $("#overlay").addClass("d-none");
  $("#upload-gender").addClass("d-none");
}
function changeGender() {
  $("#loading").removeClass("d-none");
  const form = document.getElementById("gender-form");
  var formData = new FormData(form);
  $.ajax({
    url: "/admin/banners/update-gender-image",
    type: "PUT",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function openUploadBanner(type) {
  $("#upload-banner-type").text(type);
  $("input[name='type']").val(type);
  $("#overlay").removeClass("d-none");
  $("#upload-banner").removeClass("d-none");
}
function closeUploadBanner() {
  $("#overlay").addClass("d-none");
  $("#upload-banner").addClass("d-none");
}
function uploadBanner() {
  $("#loading").removeClass("d-none");
  const form = document.getElementById("upload-banner-form");
  var formData = new FormData(form);
  $.ajax({
    url: "/admin/banners/upload-banner",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function openEditBanner(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    url: "/admin/banners/get-banner-details",
    type: "GET",
    data: { id },
    success: function (res) {
      $("#loading").addClass("d-none");
      $("#overlay").removeClass("d-none");
      $("#edit-banner").html(`<div class="dialog">Edit ${res.type}</div>
          <img loading="lazy" class="edit-banner-preview" src="${res.image}" alt="">
        <form id="edit-banner-form" class="banner-form" action="">
          <label for="order">Order</label>
          <input type="number" name="order" style="width: 5rem;" value="${res.order}">
          <label for="order">URL</label>
          <input type="text" name="url" value="${res.url}">
          <input hidden type="text" name="id" value="${res._id}">
        </form>
        <div>
          <button onclick="closeEditBanner()" class="confirm-button">Cancel</button>
        <button onclick="editBanner()" class="confirm-button">Apply</button>
        </div>`);
      $("#edit-banner").removeClass("d-none");
    },
    error: function (error) {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
function closeEditBanner() {
  $("#overlay").addClass("d-none");
  $("#edit-banner").addClass("d-none");
}
function editBanner() {
  $("#loading").removeClass("d-none");
  const url = $("#edit-banner-form input[name='url'").val();
  const order = $("#edit-banner-form input[name='order'").val();
  const id = $("#edit-banner-form input[name='id'").val();
  $.ajax({
    url: "/admin/banners/edit-banner",
    type: "PUT",
    data: { id, order, url },
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function disableBanner(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    url: "/admin/banners/disable-banner",
    type: "PATCH",
    data: { banner: id },
    dataType: "json",
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      location.reload();
    },
  });
}

function enableBanner(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    url: "/admin/banners/enable-banner",
    type: "PATCH",
    data: { banner: id },
    dataType: "json",
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      location.reload();
    },
  });
}

var selectedBanner;
function openDeleteConfirm(id) {
  $("#overlay").removeClass("d-none");
  selectedBanner = id;
  $("#confirm-delete").removeClass("d-none");
}
function closeDeleteConfirm() {
  $("#overlay").addClass("d-none");
  $("#confirm-delete").addClass("d-none");
}
function deleteBanner() {
  $("#loading").removeClass("d-none");
  $.ajax({
    url: "/admin/banners/delete-banner",
    type: "POST",
    data: { banner: selectedBanner },
    dataType: "json",
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
