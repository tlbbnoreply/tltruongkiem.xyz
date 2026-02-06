 
window.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector(".page-tintuc-content");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageNumber = document.getElementById("pageNumber");

  if (!container) return;

  const itemsPerPage = 15;
  let currentPage = 1;
  let newsData = [];

  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get("id"), 10);

  // Hàm lấy toàn bộ bài viết từ WordPress REST API
  async function fetchNewsList() {
    const res = await fetch('https://post.tltruongkiem.xyz/wp-json/wp/v2/posts?per_page=100');
    const data = await res.json();
    return data.map(post => ({
      id: post.id,
      title: post.title.rendered,
      content: post.content.rendered,
      created_at: post.date
    }));
  }

  // Hàm hiển thị danh sách tin tức
  function renderListPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = newsData.slice(start, end);

    container.innerHTML = '';
    const list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.padding = "0";
    list.style.margin = "0";

    currentItems.forEach(item => {
      const li = document.createElement("li");
      li.style.padding = "15px 15px";
      li.innerHTML = `
        <a href="tintuc.html?id=${item.id}" style="text-decoration:none;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fbeb6a; font-weight: bold;">[ Tin tức ]</span>
            <span style="color: #ffffff; font-weight: bold; flex: 1; padding: 0 10px;">${item.title}</span>
            <span style="color: #aaa; font-size: 13px;">[ ${new Date(item.created_at).toLocaleDateString('vi-VN')} ]</span>
          </div>
        </a>
      `;
      list.appendChild(li);
    });

    container.appendChild(list);

    if (pageNumber) pageNumber.textContent = currentPage;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage >= Math.ceil(newsData.length / itemsPerPage);
  }

  // Hàm hiển thị chi tiết bài viết
  async function renderNewsDetailFromAPI(id) {
    try {
      const res = await fetch(`https://post.tltruongkiem.xyz/wp-json/wp/v2/posts/${id}`);
      if (!res.ok) throw new Error('Không tìm thấy bài viết');
      const post = await res.json();

      container.classList.add("is-detail");
      container.innerHTML = `
        <h2 style="color:white; font-size: 24px;">${post.title.rendered}</h2>
        <p style="color:#ccc; font-size: 13px">Ngày đăng: ${new Date(post.date).toLocaleDateString("vi-VN")}</p>
        <div style="color:white; margin-top:10px; font-size:16px">${post.content.rendered}</div>

        <div style="margin-top: 20px;">
          <button onclick="window.location.href='tintuc.html'" style="margin-bottom: 20px; padding: 5px 15px; background-color: #222; color: white; border: 1px solid #444; cursor: pointer;">
            ← Trở về danh sách
          </button>
        </div>
      `;

      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (pageNumber) pageNumber.style.display = 'none';

    } catch (err) {
      console.error(err);
      container.innerHTML = '<p style="color: white;">Không thể tải bài viết.</p>';
    }
  }

  // Nếu có id trên URL → trang chi tiết
  if (!isNaN(id)) {
    await renderNewsDetailFromAPI(id);
    return;
  }

  // Nếu không có id → trang danh sách
  try {
    newsData = await fetchNewsList();
    renderListPage();
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="color: white;">Không thể kết nối đến server.</p>';
  }

  // Gắn sự kiện phân trang
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderListPage();
      }
    });

    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(newsData.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderListPage();
      }
    });
  }
});
 
