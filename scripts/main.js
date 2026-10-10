// Main navigation and interaction logic

/* ===== 跨环境页面跳转：默认走 GitHub Pages，本地 http 服务兜底 ===== */
/* rootPath 为仓库根相对路径，如 'pages/overseas-batch-delivery.html'、'index.html' */
function navUrl(rootPath) {
  // 1. 已托管（含 GitHub Pages / htmlpreview.github.io）：使用相对路径
  var isHosted =
    window.location.hostname === 'nake12138.github.io' ||
    window.location.hostname === 'htmlpreview.github.io' ||
    (/^https?:$/.test(window.location.protocol) &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1');
  if (isHosted) {
    var inPages = window.location.pathname.replace(/\\/g, '/').indexOf('/pages/') !== -1;
    if (inPages) {
      if (rootPath === 'index.html') return '../index.html';
      return './' + rootPath.replace(/^pages\//, '');
    }
    return rootPath;
  }
  // 2. file:// 或本地 localhost：默认走 GitHub Pages（项目部署地址），便于分享/预览
  return 'https://nake12138.github.io/maiyaput/' + rootPath;
}

document.addEventListener('DOMContentLoaded', function () {
  // Navigation item click handlers
  document.querySelectorAll('.nav-item[data-page], .nav-child-item[data-page], .nav-grandchild-item[data-page]').forEach(function (item) {
    item.addEventListener('click', function () {
      const pageName = this.getAttribute('data-page');
      showPage(pageName);

      // Update active state in sidebar
      document.querySelectorAll('.nav-item, .nav-child-item').forEach(function (nav) {
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

  // 二级分组（批量投放 / 账号管理）展开收起
  document.querySelectorAll('.nav-child-item.has-children').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('expanded');
      var caret = this.querySelector('.nav-child-caret');
      if (caret) caret.textContent = this.classList.contains('expanded') ? '▼' : '▶';
    });
  });

  // Hash routing
  window.addEventListener('hashchange', function () {
    handleHashRoute();
  });

  handleHashRoute();
});

function showPage(pageName) {
  if (pageName.indexOf('fb-') === 0) {
    window.location.href = navUrl('pages/' + pageName + '.html');
    return;
  }
  // 海外投放系统页面 → 跳转独立页面文件
  if (pageName.indexOf('overseas-') === 0) {
    if (pageName === 'overseas-system-org') pageName = 'overseas-system-user';
    window.location.href = navUrl('pages/' + pageName + '.html');
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
  } else {
    // 切回国内投放系统：跳转到 index.html
    window.location.href = navUrl('index.html');
  }
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
