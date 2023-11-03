function savedAddresses() {
  $(".saved-address-title").removeClass("d-none");
  $(".saved-addresses-container").removeClass("d-none");
}
function addAddress() {
  window.location.href = "/checkout/add-address";
}

function selectAddress(id) {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/checkout/select-address",
    data: { address: id },
    dataType: "json",
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

function applyCoupon() {
  $("#loading").removeClass("d-none");
  const coupon = document.querySelector("input[name='coupon']").value;
  const regex = /\S{3,}/;
  if (regex.test(coupon)) {
    $.ajax({
      type: "POST",
      url: "/checkout/apply-coupon",
      data: { coupon: coupon },
      dataType: "json",
      success: (res) => {
        if (res.message === "success") {
          location.reload();
        } else {
          $("#coupon-warning").text(res.warning);
          $("#loading").addClass("d-none");
        }
      },
    });
  } else {
    $("#coupon-warning").text("Invalid coupon code!");
    $("#loading").addClass("d-none");
  }
}

function removeCoupon() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "GET",
    url: "/checkout/remove-coupon",
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}
function useWallet() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "GET",
    url: "/checkout/use-wallet",
    success: (res) => {
      location.reload();
    },
    error: (error) => {
      $("#loading").addClass("d-none");
      console.log(error);
    },
  });
}

function placeOrder(total) {
  $("#checkoutButton").prop("disabled", true);
  setTimeout(() => {
    $("#checkoutButton").prop("disabled", false);
  }, 5000);
  let method = $("input[name='method']:checked").val();
  method = Number(total) === 0 ? "wallet" : method;
  if (method === "online") {
    $("#pay-warning").text("");
    $("#loading").removeClass("d-none");
    $.ajax({
      type: "GET",
      url: "/checkout/get-order",
      success: (order) => {
        $("#loading").addClass("d-none");
        var options = {
          "key": "rzp_test_eSdylVvgGUqnM9",
          "amount": order.amount_due,
          "currency": "INR",
          "name": "KickStore",
          "description": "Payment for KickStore order",
          "image":
            "https://res.cloudinary.com/dfezowkdc/image/upload/v1697096319/kickstore_logo_dbympn.png",
          "order_id": order.id,
          "callback_url": "/checkout/verify-payment",
          "theme": {
            "color": "#15416f",
          },
        };
        var rzp1 = new Razorpay(options);
        rzp1.open();
      },
      error: (error) => {
        console.log(error);
      },
    });
  } else if (method === "cod") {
    location.href = "/checkout/place-order";
  } else if (method === "wallet") {
    location.href = "/checkout/place-order";
  } else {
    $("#pay-warning").text("Select a payment method!");
    $("#checkoutButton").prop("disabled", false);
  }
}
