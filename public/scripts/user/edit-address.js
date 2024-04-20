const line1 = document.querySelector("input[name='line1']");
const line2 = document.querySelector("input[name='line2']");
const phone = document.querySelector("input[name='phone']");
const pin = document.querySelector("input[name='pin']");

const line1Warning = document.getElementById("line1-warning");
const line2Warning = document.getElementById("line2-warning");
const phoneWarning = document.getElementById("phone-warning");
const pinWarning = document.getElementById("pin-warning");

const line1Validate = () => {
  if (line1.value === (null || "")) {
    line1Warning.innerText = "Enter your address line";
    return false;
  } else {
    if (line1.value.length < 4 || line1.value === "   ") {
      line1Warning.innerText = "Address too short";
      return false;
    } else {
      line1Warning.innerText = "";
      return true;
    }
  }
};

const line2Validate = () => {
  if (line2.value === (null || "")) {
    line2Warning.innerText = "Enter your address line";
    return false;
  } else {
    if (line2.value.length < 4 || line2.value === "   ") {
      line2Warning.innerText = "Address too short";
      return false;
    } else {
      line2Warning.innerText = "";
      return true;
    }
  }
};

const phoneValidate = () => {
  if (phone.value === (null || "")) {
    phoneWarning.innerText = "Enter your phone number";
    return false;
  } else {
    const isValidPhone = (phone) => {
      const regex = /^\d{10}$/;
      return regex.test(phone.toString());
    };
    if (!isValidPhone(phone.value)) {
      phoneWarning.innerText = "Enter a valid number";
      return false;
    } else {
      phoneWarning.innerText = "";
      return true;
    }
  }
};

const pinValidate = () => {
  if (pin.value === (null || "")) {
    pinWarning.innerText = "Enter your pin code";
    return false;
  } else {
    const isValidPhone = (pin) => {
      const regex = /^\d{6}$/;
      return regex.test(pin.toString());
    };
    if (!isValidPhone(pin.value)) {
      pinWarning.innerText = "Enter a valid pin code";
      return false;
    } else {
      pinWarning.innerText = "";
      return true;
    }
  }
};

async function submit(id) {
  if (line1Validate() && line2Validate() && pinValidate() && phoneValidate()) {
    $.ajax({
      type: "POST",
      url: "/profile/edit-address",
      data: {
        address: id,
        data: {
          line1: line1.value,
          line2: line2.value,
          phone: phone.value,
          pin: pin.value,
        },
      },
      dataType: "json",
      success: function (data) {
        window.location.href = "/profile";
      },
    });
  }
}

function back() {
  window.history.back();
}
