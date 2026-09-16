/* ===== 右上角用户信息下拉菜单 =====
 * 依赖结构：
 *   #userProfileWrap      外层容器（position: relative）
 *   #userProfileTrigger   触发按钮
 *   #userDropdown         下拉面板
 *   #copyMailBtn          复制邮箱按钮
 *   [data-action]         菜单项：help / clear-cache / logout
 */

(function () {
  'use strict';

  var EMAIL = 'nake06870@maiyawx.com';
  var TOAST_ID = 'headerUserToast';

  /* ---------- 轻量 Toast ---------- */
  function toast(msg) {
    var el = document.getElementById(TOAST_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = TOAST_ID;
      el.className = 'header-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    void el.offsetWidth; // 连续触发时重放动画
    el.classList.add('show');
    if (el._timer) clearTimeout(el._timer);
    el._timer = setTimeout(function () {
      el.classList.remove('show');
    }, 2000);
  }

  /* ---------- 复制文本（含降级方案，兼容 file:// 打开） ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  /* ---------- 初始化 ---------- */
  function initUserMenu() {
    var wrap = document.getElementById('userProfileWrap');
    if (!wrap) return;

    var trigger = document.getElementById('userProfileTrigger');
    var dropdown = document.getElementById('userDropdown');
    var copyBtn = document.getElementById('copyMailBtn');

    function open() {
      wrap.classList.add('open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      wrap.classList.remove('open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        if (wrap.classList.contains('open')) {
          close();
        } else {
          open();
        }
      });
    }

    // 点击面板外部关闭
    document.addEventListener('click', function (e) {
      if (!wrap.classList.contains('open')) return;
      if (wrap.contains(e.target)) return;
      close();
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) close();
    });

    // 复制邮箱
    if (copyBtn) {
      copyBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        copyText(EMAIL)
          .then(function () {
            copyBtn.classList.add('copied');
            toast('邮箱已复制：' + EMAIL);
            setTimeout(function () {
              copyBtn.classList.remove('copied');
            }, 1600);
          })
          .catch(function () {
            toast('复制失败，请手动复制：' + EMAIL);
          });
      });
    }

    // 菜单项
    if (dropdown) {
      dropdown.addEventListener('click', function (e) {
        var item = e.target.closest ? e.target.closest('[data-action]') : null;
        if (!item) return;
        var action = item.getAttribute('data-action');

        if (action === 'help') {
          close();
          if (window.prd && typeof window.prd.openPrdPanel === 'function') {
            window.prd.openPrdPanel();
          } else if (typeof window.openPrdPanel === 'function') {
            window.openPrdPanel();
          } else {
            toast('帮助指南（演示）');
          }
        } else if (action === 'clear-cache') {
          close();
          try {
            sessionStorage.clear();
            Object.keys(localStorage).forEach(function (k) {
              if (k !== 'delivery_system') localStorage.removeItem(k);
            });
          } catch (err) {}
          toast('缓存已清除');
        } else if (action === 'logout') {
          close();
          toast('已退出登录（演示）');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserMenu);
  } else {
    initUserMenu();
  }
})();
