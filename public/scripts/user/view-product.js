sizes = document.querySelectorAll(".size");
sizeWarning = document.getElementById("sizeWarning");
let size = "";
function sizeSelect(selection) {
  size = selection;
  sizeWarning.classList.add("d-none");
  for (let x of sizes) {
    if (x.innerText === selection) {
      x.style.backgroundColor = "white";
      x.style.color = "black";
    } else {
      x.style.backgroundColor = "black";
      x.style.color = "white";
    }
  }
  console.log(size);
}
function sizeSelected() {
  if (size === "") {
    sizeWarning.classList.remove("d-none");
    return false;
  } else {
    return true;
  }
}

function addToCart(product) {
  if (sizeSelected()) {
    $("#loading").removeClass("d-none");
    $.ajax({
      type: "POST",
      url: "/add-to-cart",
      data: {
        product: product,
        size: size,
      },
      dataType: "json",
      success: function (res) {
        document.getElementById("addedToCart").innerText = res.message;
        $("#loading").addClass("d-none");
        $("#addedToCart").removeClass("d-none");
        setTimeout(() => {
          $("#addedToCart").addClass("d-none");
        }, 5000);
      },
      error: (error) => {
        $("#loading").addClass("d-none");
        if (error.status === 403) location.href = "/login";
        console.log(error);
      },
    });
  }
}

function buyNow() {
  if (sizeSelected()) {
  }
}

function addWishlist(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/add-wishlist",
    data: { product: id },
    dataType: "json",
    success: function (res) {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      if (error.status === 403) location.href = "/login";
      console.log(error);
    },
  });
}

function removeWishlist(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/remove-wishlist",
    data: { product: id },
    dataType: "json",
    success: function (res) {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
