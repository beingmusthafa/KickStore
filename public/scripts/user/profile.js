$(".extra-order-details").addClass("d-none");
const image = document.getElementsByClassName("userImage");
const editButton = document.getElementById("image-edit-button");
image[0].addEventListener("mouseover", () => {
  editButton.style.opacity = "1";
});
image[0].addEventListener("mouseout", () => {
  editButton.style.opacity = "0";
});
editButton.addEventListener("mouseover", () => {
  editButton.style.opacity = "1";
});
editButton.addEventListener("mouseout", () => {
  editButton.style.opacity = "0";
});

function openTransactions() {
  $("#transactions").removeClass("d-none");
}
function closeTransactions() {
  $("#transactions").addClass("d-none");
}

function openProfileConfirm() {
  $("#overlay").removeClass("d-none");
  $("#confirm-profile").removeClass("d-none");
}
function closeProfileConfirm() {
  $("#overlay").addClass("d-none");
  $("#confirm-profile").addClass("d-none");
}
function changeProfile() {
  $("#loading").removeClass("d-none");
  const form = document.getElementById("image-form");
  var formData = new FormData(form);
  $.ajax({
    url: "/profile/update-image",
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
function logout() {
  window.location.href = "/logout";
}
function editProfile() {
  window.location.href = "/profile/edit-profile";
}
function addAddress() {
  window.location.href = "/profile/add-address";
}
function editAddress(id) {
  window.location.href = "/profile/edit-address?address=" + id;
}
function deleteAddress(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/profile/delete-address",
    data: { address: id },
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
function makeDefaultAddress(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/profile/make-default-address",
    data: { address: id },
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
let orderId;
function openCancelConfirm(id) {
  orderId = id;
  $("#overlay").removeClass("d-none");
  $("#confirm-cancel").removeClass("d-none");
}
function closeCancelConfirm() {
  $("#overlay").addClass("d-none");
  $("#confirm-cancel").addClass("d-none");
}
function cancelOrder() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/cancel-order",
    data: { order: orderId },
    dataType: "json",
    success: () => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function openReturnConfirm(id) {
  orderId = id;
  $("#overlay").removeClass("d-none");
  $("#confirm-return").removeClass("d-none");
}
function closeReturnConfirm() {
  $("#overlay").addClass("d-none");
  $("#confirm-return").addClass("d-none");
  $("#return-warning").text("");
}
function returnOrder() {
  const reason = $("select[name='reason']").val();
  const feedback = $("textarea[name='feedback']").val();
  if (!reason) {
    return $("#return-warning").text("Choose a reason for return");
  }
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/return-order",
    data: { order: orderId, reason, feedback },
    dataType: "json",
    success: () => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function downloadInvoice(id) {
  $("#loading").removeClass("d-none");
  //getting order details
  $.ajax({
    type: "GET",
    url: "/get-invoice-data",
    data: { order: id },
    dataType: "json",
    success: (res) => {
      console.log("success");
      let productsArray = [];
      for (const order of res.orders) {
        let list = {
          "quantity": order.quantity,
          "description": `${order.product.brand} ${order.product.name}`,
          "tax-rate": 0,
          "price": order.product.finalPrice,
        };
        productsArray.push(list);
      }
      var data = {
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        "customize": {
          //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
        },
        "images": {
          // The logo on top of your invoice
          "logo":
            "https://res.cloudinary.com/dfezowkdc/image/upload/v1697096319/kickstore_logo_dbympn.png",
          // The invoice background
          "background": "",
        },
        // Your own data
        "sender": {
          "company": `${res.user.name}`,
          "address": `${res.user.email}`,
          "zip": "",
          "city": "",
          "country": "",
          //"custom1": "custom value 1",
          //"custom2": "custom value 2",
          //"custom3": "custom value 3"
        },
        // Your recipient
        "client": {
          "company": "KickStore Ltd",
          "address": "",
          "zip": "",
          "city": "",
          "country": "",
          // "custom1": "custom value 1",
          // "custom2": "custom value 2",
          // "custom3": "custom value 3"
        },
        "information": {
          // Invoice number
          "number": `${res.orders[0].orderId}`,
          // Invoice data
          "date": `${new Date().toDateString("en-US")}`,
          // Invoice due date
          "due-date": "- - -",
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        "products": productsArray,
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Thank you for shopping with us.",
        // Settings to customize your invoice
        "settings": {
          "currency": "INR",
        },
      };
      easyinvoice.createInvoice(data, function (result) {
        easyinvoice.download("kickstore_order_invoice.pdf", result.pdf);
        $("#loading").addClass("d-none");
      });
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
