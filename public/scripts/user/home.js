const slides = document.querySelector(".slider");
const images = slides.querySelectorAll(".slide");

let currentImageIndex = 0;

function slide() {
  currentImageIndex++;

  if (currentImageIndex >= images.length) {
    currentImageIndex = 0;
  }

  slides.scrollTo({
    left: images[currentImageIndex].offsetLeft,
    behavior: "smooth",
  });
}
setInterval(slide, 3000);

function route(link) {
  location.href = link;
}
function genderRedirect(gender) {
  location.href = `/products/filters?&gender=${gender}`;
}
function viewProductDetails(id) {
  const link = "/products/view-product?product=" + id;
  location.href = link;
}

function category(name) {
  const link = "/categories?category=" + name;
  location.href = link;
}
