let focusedCategory;
function openConfirm(name) {
  $("#overlay").removeClass("d-none");
  focusedCategory = name;
  document.getElementById("confirm-name").innerText = `'${name}'`;
  document.querySelector(".confirm-popup").classList.remove("d-none");
}
function closeConfirm() {
  $("#overlay").addClass("d-none");
  document.querySelector(".confirm-popup").classList.add("d-none");
}
function closeForm() {
  $("#edit-form").addClass("d-none");
}
function page(site) {
  window.location.href = "/admin/" + site;
}
function viewSubCategory(name) {
  const link = "/admin/products/manage-categories/sub?category=" + name;
  window.location.href = link;
}

function addCategory(name) {
  const link = "/admin/products/manage-categories/add?category=" + name;
  window.location.href = link;
}

function viewProductDetails(id) {
  const link = "/admin/products/product-details?id=" + id;
  window.location.href = link;
}

function deleteCategory() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/admin/products/manage-categories/delete",
    data: { category: focusedCategory },
    dataType: "json",
    success: function (res) {
      location.reload();
    },
  });
}
function getEditFormDetails(name) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "GET",
    url: "/admin/products/manage-categories/get-category-details",
    data: { category: name },
    dataType: "json",
    success: function (res) {
      $("#loading").addClass("d-none");
      let options = "";
      res.categories.forEach((category) => {
        options += `<option value="${category.name}">${category.name}</option>`;
      });
      $("#edit-form").removeClass("d-none");
      document.getElementById("edit-form").innerHTML = `<form
            method="post"
            id="details"
            action="/admin/products/manage-categories/edit"
            class="form d-flex flex-column align-items-start"
            enctype="multipart/form-data"
          >
            <label class="label">Image</label>
            <input
              class="inputField"
              name="image"
              type="file"
              value=""
            />
            <input
              class="d-none"
              name="category"
              type="text"
              value="${res.currentCategory.name}"
            />

            <label class="label">Name</label>
            <input
              class="inputField"
              name="name"
              type="text"
              value="${res.currentCategory.name}"
            />
            <div class="warning" id="name-warning"></div>
            <label class="label">Parent category</label>
            <select class="select category" name="parent_category">
              <option value="${res.currentCategory.parent_category}" selected>
                ${res.currentCategory.parent_category}
              </option>
              <option value="none">--None--</option>
             
              ${options}

            </select>
          </form>
          <div class="edit-actions">
              <button onclick="closeForm()">Cancel</button>
              <button onclick="editSubmit()" style="margin-left: 3rem">Save</button>
            </div>`;
    },
  });
}

function editSubmit() {
  $("#loading").removeClass("d-none");
  const form = document.getElementById("details");
  var formData = new FormData(form);
  $.ajax({
    url: "/admin/products/manage-categories/edit",
    type: "PUT",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      if (response.message === "success") {
        location.reload();
      } else {
        $("#loading").addClass("d-none");
        document.getElementById("name-warning").innerText = response.message;
      }
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function getAddFormDetails(name) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "GET",
    url: "/admin/products/manage-categories/get-category-details",
    data: { category: name },
    dataType: "json",
    success: function (res) {
      $("#loading").addClass("d-none");
      let options = "";
      res.categories.forEach((category) => {
        options += `<option value="${category.name}">${category.name}</option>`;
      });
      $("#edit-form").removeClass("d-none");
      document.getElementById("edit-form").innerHTML = `<form
            method="post"
            id="details"
            action="/admin/products/manage-categories/edit"
            class="form d-flex flex-column align-items-start"
            enctype="multipart/form-data"
          >
            <label class="label">Image</label>
            <input
              class="inputField"
              name="image"
              required
              type="file"
              value=""
            />
            <input
              class="d-none"
              name="category"
              type="text"
              value="${res.currentCategory.name}"
            />

            <label class="label">Name</label>
            <input
              class="inputField"
              name="name"
              type="text"
              value=""
            />
            <div class="warning" id="name-warning"></div>
          </form>
          <div class="edit-actions">
              <button onclick="closeForm()">Cancel</button>
              <button onclick="addSubmit()" style="margin-left: 3rem">Save</button>
            </div>`;
    },
  });
}
function addSubmit() {
  $("#loading").removeClass("d-none");
  const form = document.getElementById("details");
  var formData = new FormData(form);
  $.ajax({
    url: "/admin/products/manage-categories/add",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      if (response.message === "success") {
        location.reload();
      } else {
        $("#loading").addClass("d-none");
        document.getElementById("name-warning").innerText = response.message;
      }
    },
    error: function (error) {
      console.log(error);
    },
  });
}
