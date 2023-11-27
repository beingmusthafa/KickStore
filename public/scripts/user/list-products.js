let params = new URL(document.location).searchParams;
const min = Number(params.get("min")) !== 0 ? Number(params.get("min")) : "";
const max = Number(params.get("max")) !== 0 ? Number(params.get("max")) : "";
const page = Number(params.get("page") ?? 1);
const search = params.get("search") || "";
$("input[name='search']").val(search);
$("input[name='minPrice']").val(min);
$("input[name='maxPrice']").val(max);
$("select[name='category']").val(params.get("category"));
$("select[name='gender']").val(params.get("gender"));
$("select[name='sort']").val(params.get("sort"));
function openFilters() {
  $(".filter-tab").css("display", "flex");
  $(".filter-tab").css("animation-name", "filtersOpen");
}
function closeFilters() {
  $(".filter-tab").css("animation-name", "filtersClose");
  setTimeout(() => {
    $(".filter-tab").css("display", "none");
  }, 300);
}

function clearFilters() {
  window.location.href = `/products/filters?search=${search}&page=${1}&min=&max=&gender=&category=&sort=`;
}

function applyFilters() {
  const min = document.getElementById("min").value;
  const max = document.getElementById("max").value;
  const category = document.getElementById("category").value;
  const gender = document.getElementById("gender").value;
  const sort = document.getElementById("sort").value;
  location.href = `/products/filters?search=${search}&page=${1}&min=${min}&max=${max}&gender=${gender}&category=${category}&sort=${sort}`;
  // $("#filters-form").submit()
}

function viewProductDetails(id) {
  const link = "/products/view-product?product=" + id;
  location.href = link;
}

function prevPage(toPage) {
  location.href = `/search?search=${search}&page=${toPage}&min=${min}&max=${max}&gender=${gender}&category=${category}&sort=${sort}`;
}
function nextPage(toPage) {
  location.href = `/search?search=${search}&page=${toPage}&min=${min}&max=${max}&gender=${gender}&category=${category}&sort=${sort}`;
}
