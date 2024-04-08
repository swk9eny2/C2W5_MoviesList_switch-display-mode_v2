//【指標作業】電影清單加碼功能：切換顯示模式
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/"; // 處理圖片檔案
const MOVIES_PER_PAGE = 12; // 每頁只顯示 12 筆資料
const movies = []; // 電影總清單
let filteredMovies = []; // 搜尋用
let currentDisplayMode = "card"; // ★默認認為卡片模式 (用來判定清單/卡片模式)

const dataPanel = document.querySelector("#data-panel"); // 之後卡片會塞入這裡
const searchForm = document.querySelector("#search-form"); // 表單監聽器用
const searchInput = document.querySelector("#search-input"); // 取得輸入的搜尋內容
const paginator = document.querySelector("#paginator"); // 動態產生頁數用
const displayButton = document.querySelector(".display_view"); // 切換顯示模式按鈕

// 在全局新增一個變數來儲存當前頁數
let currentPage = 1;
//--------------------------------------------------------

//★★★________函式區________★★★

//合併為一個遍歷所有的電影卡片資料,設定到html上
function renderMovieList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    if (currentDisplayMode === "card") {
      rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button 
                class="btn btn-primary btn-show-movie" 
                data-bs-toggle="modal" 
                data-bs-target="#movie-modal" 
                data-id="${item.id}">More
              </button>
              <button 
                class="btn btn-info btn-add-favorite" 
                data-id="${item.id}">+
              </button>
            </div>
          </div>
        </div>
      </div>`;
    } else if (currentDisplayMode === "list") {
      rawHTML += `<div class="row">
        <div class="mb-2">
          <div class="card">
            <div class="card-body d-flex justify-content-between ">
              <h5 class="card-title">${item.title}</h5>
              <div class="card-buttons">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }
  });
  dataPanel.innerHTML = rawHTML;
}

//________【另一個render分頁器】________
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE); // Math.ceil(無條件進位)
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

//________【取得頁數】________
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//________【 More的彈出視窗 】________
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

//________【 加入最愛 】________
function addToFavorite(id) {
  console.log(id);
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  //----------阻止重複添加同一部電影的判斷----------
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//________【重新渲染電影列表的函式】________
function renderMovies() {
  const dataToRender = filteredMovies.length ? filteredMovies : movies;
  const data = getMoviesByPage(currentPage); // 根據當前頁數獲取需要顯示的電影數據
  renderMovieList(data)
}

//★★★________按鈕區________★★★

//________【 more彈出"詳細清單按鈕" 以及 "新增最愛按鈕" 】listen to data panel________
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//________【 分頁器頁數按鈕 】________
// 分頁器頁數按鈕的點擊事件監聽器中
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  currentPage = page; // 更新當前頁數
  renderMovies(); // 重新渲染電影列表

  // 移除所有按鈕的 active 類別
  const pageItems = paginator.querySelectorAll(".page-item");
  pageItems.forEach((item) => {
    item.classList.remove("active");
  });

  // 為當前點擊的按鈕添加 active 類別
  event.target.parentElement.classList.add("active");
});

//________【 按鈕監聽器-來自電影清單的卡片 】listen to data panel________
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  }
});

//________ 【 搜尋的按鈕 】 listen to search form ________
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  //----------將輸入的值與電影做比對----------
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  //----------找不到相符的跳出提示框----------
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }

  renderPaginator(filteredMovies.length);
  renderMovieList(filteredMovies);
});

//________【 ★切換模式按鈕的點擊事件監聽器 】 ________
// 切換模式按鈕的點擊事件監聽器
displayButton.addEventListener("click", function displayButtonClicked(event) {
  let dataToRender = movies; // 默認使用 movies 陣列

  // 如果 filteredMovies 陣列不為空，則使用它當作渲染畫面的數據.
  if (filteredMovies.length > 0) {
    dataToRender = filteredMovies;
  }

  // 紀錄當前頁碼
  const currentPageElement = paginator.querySelector(
    ".page-item.active > .page-link"
  );
  let currentPageIndex = 1;
  if (currentPageElement) {
    currentPageIndex = parseInt(currentPageElement.getAttribute("data-page"));
  }

  // 根據點擊的按鈕來更新顯示模式
  if (event.target.matches(".fa.fa-bars")) {
    currentDisplayMode = "list"; // 更新目前顯示模式為清單模式
    dataPanel.innerHTML = ""; // 清空原先的內容
    renderMovieList(dataToRender); // 調用渲染清單模式的函式
  } else if (event.target.matches(".fa.fa-th")) {
    currentDisplayMode = "card"; // 更新目前顯示模式為卡片模式
    dataPanel.innerHTML = ""; // 清空原先的內容
    renderMovieList(dataToRender); // 調用渲染卡片模式的函式
  }

  // 更新 currentPage 變數
  currentPage = currentPageIndex;

  // 更新 paginator 中的 active 狀態
  const currentPageLink = paginator.querySelector(
    `[data-page="${currentPage}"]`
  );
  if (currentPageLink) {
    currentPageLink.parentElement.classList.add("active");
  }

  // 觸發頁碼按鈕的點擊事件
  currentPageLink.click();
});





// ________【 01. 將請求發送到索引API 】send request to index api ________
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovies(); // 初始渲染電影列表
  })
  .catch((err) => console.log(err));

