const newsListContainer = document.querySelector('.box-tintuc');
const pageNumber = document.getElementById('pageNumber');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const detailContainer = document.querySelector('.page-tintuc-content');

let newsData = [];
let currentPage = 1;
const itemsPerPage = 10;

//  Nếu có .box-tintuc thì hiển thị danh sách
function renderNewsList() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = newsData.slice(start, end);

  newsListContainer.innerHTML = '';
  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.padding = '10px';
  list.style.margin = '0';
  list.style.maxHeight = '320px';
  list.style.overflowY = 'auto';

  currentItems.forEach(item => {
    const li = document.createElement('li');
    li.style.marginBottom = '10px';
    li.style.padding = '15px';
    li.style.borderRadius = '5px';
    li.innerHTML = `
      <a href="tintuc.html?id=${item.id}" style="text-decoration: none;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="color: #6d1c00; font-weight: bold; margin-right: 5px;">[ Tin tức ]</div>
          <div style="color: #0c2e57; font-weight: bold; flex: 1;">${item.title}</div>
          <div style="color: #aaa; font-size: 13px;">[ ${new Date(item.created_at).toLocaleDateString('vi-VN')} ]</div>
        </div>
      </a>`;
    list.appendChild(li);
  });

  newsListContainer.appendChild(list);
  pageNumber.textContent = currentPage;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= Math.ceil(newsData.length / itemsPerPage);
}

//  Nếu có .page-tintuc-content thì hiển thị chi tiết
function renderNewsDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get("id"), 10);
  const news = newsData.find(item => item.id === id);

  if (news && detailContainer) {
    detailContainer.innerHTML = `
      <h2 style="color:white">${news.title}</h2>
      <p style="color:#ccc; font-size: 13px">Ngày đăng: ${new Date(news.created_at).toLocaleDateString("vi-VN")}</p>
      <div style="color:white; margin-top:10px; font-size:16px">${news.content}</div>`;
  } else if (detailContainer) {
    detailContainer.innerHTML = `<p style="color: white;">Không tìm thấy bài viết.</p>`;
  }
}

// Khởi động
async function initNews() {
  try {
    const API_URL = 'https://post.tltruongkiem.xyz/wp-json/wp/v2/posts?per_page=100'; // lấy tối đa 100 bài
    const response = await fetch(API_URL);
    const data = await response.json();

    newsData = data.map(post => ({
      id: post.id,
      title: post.title.rendered,
      content: post.content.rendered,
      created_at: post.date
    }));

    if (newsListContainer) renderNewsList();
    if (detailContainer) renderNewsDetail();

  } catch (err) {
    console.error(err);
    if (newsListContainer)
      newsListContainer.innerHTML = '<p style="color:white">Không thể kết nối đến server</p>';
  }
}


//  Gắn sự kiện phân trang (nếu có)
if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderNewsList();
    }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(newsData.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderNewsList();
    }
  });
}

//  Tự chạy khi load
initNews();
