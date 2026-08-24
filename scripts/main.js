// Main navigation and interaction logic

/* ===== 跨环境页面跳转：兼容本地 / GitHub Pages / htmlpreview.github.io ===== */
/* rootPath 为仓库根相对路径，如 'pages/overseas-batch-delivery.html'、'index.html' */
function navUrl(rootPath) {
  if (window.location.hostname === 'htmlpreview.github.io') {
    return (
      'https://htmlpreview.github.io/?' +
      'https://github.com/Nake12138/maiyaput/blob/main/' +
      rootPath
    );
  }
  return rootPath;
}

document.addEventListener('DOMContentLoaded', function () {
  // Navigation item click handlers
  document.querySelectorAll('.nav-item[data-page]').forEach(function (item) {
    item.addEventListener('click', function () {
      const pageName = this.getAttribute('data-page');
      showPage(pageName);

      // Update active state in sidebar
      document.querySelectorAll('.nav-item').forEach(function (nav) {
        nav.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // Sidebar expand/collapse handlers
  document.querySelectorAll('.nav-item.has-children').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('expanded');
    });
  });

  // Hash routing
  window.addEventListener('hashchange', function () {
    handleHashRoute();
  });

  handleHashRoute();
});

function showPage(pageName) {
  // 海外投放系统页面 → 跳转独立页面文件
  if (pageName === 'overseas-batch-delivery') {
    window.location.href = navUrl('pages/overseas-batch-delivery.html');
    return;
  }
  if (pageName === 'overseas-auto-delivery') {
    window.location.href = navUrl('pages/overseas-auto-delivery.html');
    return;
  }

  // 本应用内已有页面：单页切换
  const targetPage = document.getElementById('page-' + pageName);
  if (targetPage) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(function (page) {
      page.classList.remove('active');
    });

    // Show target page
    targetPage.classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.nav-item, .nav-child-item').forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('data-page') === pageName) {
        item.classList.add('active');
      }
    });

    // Update hash
    window.location.hash = pageName;
    return;
  }

  // 未实现的页面：占位提示
  alert('页面开发中：' + pageName);
}

function handleHashRoute() {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const targetPage = document.getElementById('page-' + hash);
    if (targetPage) {
      document.querySelectorAll('.page').forEach(function (page) {
        page.classList.remove('active');
      });
      targetPage.classList.add('active');

      // Update sidebar active state
      document.querySelectorAll('.nav-item, .nav-child-item').forEach(function (item) {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === hash) {
          item.classList.add('active');
        }
      });
    }
  }
}

/* ===== 左上角系统切换器 ===== */
function toggleSystemMenu(e) {
  if (e) e.stopPropagation();
  var menu = document.getElementById('systemSwitchMenu');
  if (menu) menu.classList.toggle('open');
}

function switchSystem(system) {
  try {
    localStorage.setItem('delivery_system', system);
  } catch (err) {}
  if (system === 'overseas') {
    window.location.href = navUrl('pages/overseas-batch-delivery.html');
  }
  // 国内投放系统：停留在当前 index.html
}

document.addEventListener('click', function (e) {
  var menu = document.getElementById('systemSwitchMenu');
  if (!menu || !menu.classList.contains('open')) return;
  if (menu.contains(e.target)) return;
  if (e.target.closest && e.target.closest('.system-switch-trigger')) return;
  menu.classList.remove('open');
});

/* 页面加载：按 localStorage 高亮当前系统 */
(function highlightCurrentSystem() {
  var current = 'cn';
  try {
    current = localStorage.getItem('delivery_system') || 'cn';
  } catch (err) {}
  document.querySelectorAll('.system-switch-item').forEach(function (item) {
    if (item.getAttribute('data-system') === current) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
})();

/* ===== 遮罩点击关闭弹框（全系统统一） ===== */
document.addEventListener('click', function (e) {
  var t = e.target;
  if (!t || !t.classList) return;
  if (t.classList.contains('drawer') || t.classList.contains('modal') || t.classList.contains('config-modal')) {
    if (t.classList.contains('open')) {
      t.classList.remove('open');
      document.querySelectorAll('.drawer-overlay.open, .modal-overlay.open, .config-modal-overlay.open').forEach(function (o) { o.classList.remove('open'); });
    }
    return;
  }
  if (t.classList.contains('drawer-overlay') || t.classList.contains('modal-overlay') || t.classList.contains('config-modal-overlay')) {
    t.classList.remove('open');
    document.querySelectorAll('.drawer.open, .modal.open, .config-modal.open').forEach(function (m) { m.classList.remove('open'); });
  }
});
