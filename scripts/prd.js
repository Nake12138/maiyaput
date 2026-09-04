/* ===== 交互需求说明（PRD）通用脚本 =====
 * 依赖：页面上需预先定义 window.prdStories 数组，
 *       以及可选的 window.prdPageTitle / window.prdPageSub / window.PRD_PAGE_URL
 */

(function () {
  'use strict';

  /* 将筛选项/表格字段/数据来源按全角分隔符分行罗列（括号内的分隔符不拆行） */
  function prdSplitLines(text) {
    var out = [], buf = '', depth = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === '（') depth++;
      if (ch === '）' && depth > 0) depth--;
      if (depth === 0 && (ch === '／' || ch === '；' || ch === '。')) {
        var t = buf.trim();
        if (t) out.push(t);
        buf = '';
      } else {
        buf += ch;
      }
    }
    var last = buf.trim();
    if (last) out.push(last);
    return out;
  }

  function prdSuppItemHtml(label, text) {
    var lines = prdSplitLines(text);
    var content;
    if (lines.length > 1) {
      content = '<ul class="prd-story-supp-list">' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>';
    } else {
      content = '<span class="prd-story-supp-text">' + text + '</span>';
    }
    return '<div class="prd-story-supp-item"><span class="prd-story-supp-label">' + label + '</span>' + content + '</div>';
  }

  /* 拼接单个 US 的说明条目（筛选项/表格字段/数据来源/数据流转） */
  function prdSuppItemsHtml(s) {
    var items = '';
    if (s.filter) items += prdSuppItemHtml('筛选项', s.filter);
    if (s.fields) items += prdSuppItemHtml(s.fieldsLabel || '表格字段', s.fields);
    if (s.source) items += prdSuppItemHtml('数据来源', s.source);
    if (s.flow) items += '<div class="prd-story-supp-item"><span class="prd-story-supp-label">数据流转</span><span class="prd-story-supp-text">' + s.flow + '</span></div>';
    return items;
  }

  function renderPrdPanel() {
    var stories = window.prdStories || [];
    var body = document.getElementById('prd-panel-body');
    if (!body) return;
    body.innerHTML = stories.map(function (s, i) {
      var shotHtml = '';
      if (s.shot) {
        shotHtml = '<div class="prd-story-shot">' +
          '<div class="prd-story-shot-label">界面示意（点击图片放大查看）</div>' +
          '<img src="' + s.shot + '" alt="' + s.title + '" title="' + s.title + '" />' +
        '</div>';
      }
      var suppItems = prdSuppItemsHtml(s);
      var suppHtml = suppItems ? '<div class="prd-story-supp">' + suppItems + '</div>' : '';
      var mainHtml = '<div class="prd-story-main">' +
        '<div class="prd-story-desc">' + s.desc + '</div>' +
        suppHtml +
      '</div>';
      var shotColHtml = shotHtml ? '<div class="prd-story-shot-col">' + shotHtml + '</div>' : '';
      return '<div class="prd-story' + (i === 0 ? ' open' : '') + '" id="prd-story-' + s.id + '">' +
        '<div class="prd-story-head" onclick="window.prd.togglePrdStory(\'' + s.id + '\')">' +
          '<span class="prd-story-id">' + s.id + '</span>' +
          '<span class="prd-story-title">' + s.title + '</span>' +
          '<span class="prd-story-pri' + (s.priority === 'P1' ? ' p1' : '') + '">' + s.priority + '</span>' +
          '<span class="prd-story-caret">▶</span>' +
        '</div>' +
        '<div class="prd-story-body">' +
          shotColHtml +
          mainHtml +
        '</div>' +
      '</div>';
    }).join('');
  }

  function togglePrdStory(id) {
    var el = document.getElementById('prd-story-' + id);
    if (el) el.classList.toggle('open');
  }

  function openPrdPanel() {
    document.getElementById('prd-overlay').classList.add('open');
    document.getElementById('prd-panel').classList.add('open');
    var floatBtn = document.getElementById('prd-float-btn');
    if (floatBtn) floatBtn.style.display = 'none';
  }

  function closePrdPanel() {
    document.getElementById('prd-overlay').classList.remove('open');
    document.getElementById('prd-panel').classList.remove('open');
    var floatBtn = document.getElementById('prd-float-btn');
    if (floatBtn) floatBtn.style.display = '';
  }

  function togglePrdFullscreen() {
    var panel = document.getElementById('prd-panel');
    var btn = document.getElementById('prd-fullscreen-btn');
    var isFs = panel.classList.toggle('fullscreen');
    if (btn) {
      btn.textContent = isFs ? '还原' : '全屏';
      btn.title = isFs ? '退出全屏' : '全屏查看';
    }
  }

  function findPrdStory(id) {
    var stories = window.prdStories || [];
    for (var i = 0; i < stories.length; i++) {
      if (stories[i].id === id) return stories[i];
    }
    return null;
  }

  var usDetailCurrentId = null;
  function openUsDetail(id) {
    var s = findPrdStory(id);
    var panel = document.getElementById('us-detail-panel');
    if (!s || !panel) return;
    if (panel.classList.contains('open') && usDetailCurrentId === id) {
      closeUsDetail();
      return;
    }
    usDetailCurrentId = id;
    document.getElementById('us-detail-title').innerHTML =
      '<span class="prd-story-id">' + s.id + '</span>' +
      '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + s.title + '</span>' +
      '<span class="prd-story-pri' + (s.priority === 'P1' ? ' p1' : '') + '">' + s.priority + '</span>';
    var suppItems = prdSuppItemsHtml(s);
    document.getElementById('us-detail-body').innerHTML =
      '<div class="us-detail-desc">' + s.desc + '</div>' +
      (suppItems ? '<div class="us-detail-supp">' + suppItems + '</div>' : '');
    panel.classList.add('open');
  }

  function closeUsDetail() {
    var panel = document.getElementById('us-detail-panel');
    if (!panel) return;
    panel.classList.remove('open');
    usDetailCurrentId = null;
  }

  function openFullPrdFromUs() {
    closeUsDetail();
    openPrdPanel();
  }

  function prdShareLink() {
    var url = window.PRD_PAGE_URL || '';
    try {
      return new URL(url, location.href).href;
    } catch (e) {
      return url;
    }
  }

  function fallbackCopyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyPrdLink() {
    var link = prdShareLink();
    var btn = document.getElementById('prd-copy-link-btn');
    function finish(ok) {
      if (!btn) return;
      btn.textContent = ok ? '已复制' : '复制失败';
      setTimeout(function () { btn.textContent = '复制链接'; }, 1600);
    }
    function manualCopy() {
      window.prompt('自动复制失败，请手动复制需求说明页面链接：', link);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () { finish(true); }, function () {
        var ok = fallbackCopyText(link);
        finish(ok);
        if (!ok) manualCopy();
      });
    } else {
      var ok = fallbackCopyText(link);
      finish(ok);
      if (!ok) manualCopy();
    }
  }

  /* 让 US 悬浮按钮可拖动并可点击 */
  function triggerUsFab(btn) {
    var us = btn.getAttribute('data-us');
    if (!us) return;
    openUsDetail(us);
  }

  function makeUsFabDraggable(btn) {
    var st = { active: false, moved: false, dx: 0, dy: 0, sx: 0, sy: 0 };
    btn.addEventListener('pointerdown', function (e) {
      var rect = btn.getBoundingClientRect();
      st.active = true;
      st.moved = false;
      st.sx = e.clientX;
      st.sy = e.clientY;
      st.dx = e.clientX - rect.left;
      st.dy = e.clientY - rect.top;
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    btn.addEventListener('pointermove', function (e) {
      if (!st.active) return;
      if (!st.moved && Math.abs(e.clientX - st.sx) < 5 && Math.abs(e.clientY - st.sy) < 5) return;
      st.moved = true;
      btn.classList.add('dragging');
      var w = btn.offsetWidth;
      var h = btn.offsetHeight;
      var host = btn.closest('.us-fab-host');
      if (btn.classList.contains('us-fab-page') || !host) {
        var left = Math.min(Math.max(0, e.clientX - st.dx), Math.max(0, window.innerWidth - w));
        var top = Math.min(Math.max(0, e.clientY - st.dy), Math.max(0, window.innerHeight - h));
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
        btn.style.left = left + 'px';
        btn.style.top = top + 'px';
      } else {
        var hr = host.getBoundingClientRect();
        var left2 = Math.min(Math.max(0, e.clientX - st.dx - hr.left), Math.max(0, hr.width - w));
        var top2 = Math.min(Math.max(0, e.clientY - st.dy - hr.top), Math.max(0, hr.height - h));
        btn.style.bottom = 'auto';
        btn.style.left = left2 + 'px';
        btn.style.top = top2 + 'px';
      }
    });
    function endDrag() {
      if (!st.active) return;
      st.active = false;
      btn.classList.remove('dragging');
      if (!st.moved) triggerUsFab(btn);
    }
    btn.addEventListener('pointerup', endDrag);
    btn.addEventListener('pointercancel', function () { st.active = false; btn.classList.remove('dragging'); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerUsFab(btn); }
    });
  }

  /* 初始化：DOM 就绪后执行 */
  function initPrdSystem() {
    if (typeof window.prdStories === 'undefined' || !window.prdStories.length) return;

    /* 面板标题与副标题 */
    var titleEl = document.querySelector('.prd-panel-title');
    var subEl = document.querySelector('.prd-panel-sub');
    if (titleEl && window.prdPageTitle) titleEl.textContent = window.prdPageTitle;
    if (subEl && window.prdPageSub) subEl.textContent = window.prdPageSub;

    renderPrdPanel();

    var overlay = document.getElementById('prd-overlay');
    if (overlay) overlay.addEventListener('click', function (e) { if (e) e.stopPropagation(); closePrdPanel(); });

    /* 单个 US 详情面板：按 Esc 关闭 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var usPanel = document.getElementById('us-detail-panel');
        if (usPanel && usPanel.classList.contains('open')) closeUsDetail();
      }
    });

    /* US 悬浮按钮 */
    Array.prototype.forEach.call(document.querySelectorAll('.us-fab'), makeUsFabDraggable);

    /* 单个 US 详情面板拖动 */
    var usPanel = document.getElementById('us-detail-panel');
    var usHeader = document.getElementById('us-detail-header');
    if (usPanel && usHeader) {
      var usDrag = { active: false, dx: 0, dy: 0 };
      usHeader.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button')) return;
        var rect = usPanel.getBoundingClientRect();
        usDrag.active = true;
        usDrag.dx = e.clientX - rect.left;
        usDrag.dy = e.clientY - rect.top;
        usPanel.style.transition = 'none';
        usPanel.style.right = 'auto';
        usPanel.style.left = rect.left + 'px';
        usPanel.style.top = rect.top + 'px';
        try { usHeader.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      usHeader.addEventListener('pointermove', function (e) {
        if (!usDrag.active) return;
        var w = usPanel.offsetWidth;
        var left = Math.min(Math.max(0, e.clientX - usDrag.dx), Math.max(0, window.innerWidth - w));
        var top = Math.min(Math.max(0, e.clientY - usDrag.dy), Math.max(0, window.innerHeight - 44));
        usPanel.style.left = left + 'px';
        usPanel.style.top = top + 'px';
      });
      function endUsPanelDrag() {
        if (!usDrag.active) return;
        usDrag.active = false;
        usPanel.style.transition = '';
      }
      usHeader.addEventListener('pointerup', endUsPanelDrag);
      usHeader.addEventListener('pointercancel', endUsPanelDrag);
    }

    /* 通过分享链接打开时自动展开完整面板 */
    if (decodeURIComponent(location.hash || '') === '#交互需求说明') {
      openPrdPanel();
    }

    var panel = document.getElementById('prd-panel');
    var header = document.getElementById('prd-panel-header');

    /* 初始位置：视口右下角 */
    function initPrdPanelPos() {
      if (!panel) return;
      var w = Math.min(960, Math.round(window.innerWidth * 0.92));
      var h = Math.min(Math.max(360, Math.round(window.innerHeight * 0.72)), window.innerHeight - 16);
      panel.style.width = w + 'px';
      panel.style.height = h + 'px';
      panel.style.left = Math.max(8, window.innerWidth - w - 24) + 'px';
      panel.style.top = Math.max(8, window.innerHeight - h - 24) + 'px';
    }
    initPrdPanelPos();

    /* 全屏切换 */
    var fsBtn = document.getElementById('prd-fullscreen-btn');
    if (fsBtn) fsBtn.addEventListener('click', togglePrdFullscreen);
    if (header) {
      header.addEventListener('dblclick', function (e) {
        if (e.target.closest('button')) return;
        togglePrdFullscreen();
      });
    }

    /* 按住标题栏拖动完整面板 */
    var prdDrag = { active: false, dx: 0, dy: 0 };
    if (header) {
      header.addEventListener('pointerdown', function (e) {
        if (!panel || panel.classList.contains('fullscreen')) return;
        if (e.target.closest('button')) return;
        var rect = panel.getBoundingClientRect();
        prdDrag.active = true;
        prdDrag.dx = e.clientX - rect.left;
        prdDrag.dy = e.clientY - rect.top;
        panel.style.transition = 'none';
        try { header.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      header.addEventListener('pointermove', function (e) {
        if (!prdDrag.active || !panel) return;
        var w = panel.offsetWidth;
        var left = Math.min(Math.max(0, e.clientX - prdDrag.dx), Math.max(0, window.innerWidth - w));
        var top = Math.min(Math.max(0, e.clientY - prdDrag.dy), Math.max(0, window.innerHeight - 44));
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
      });
      function endPrdDrag() {
        if (!prdDrag.active || !panel) return;
        prdDrag.active = false;
        panel.style.transition = '';
      }
      header.addEventListener('pointerup', endPrdDrag);
      header.addEventListener('pointercancel', endPrdDrag);
    }

    /* 窗口尺寸变化时保持面板在可视区域内 */
    window.addEventListener('resize', function () {
      if (!panel || panel.classList.contains('fullscreen')) return;
      var w = panel.offsetWidth;
      var h = panel.offsetHeight;
      if (w > window.innerWidth - 16) { w = window.innerWidth - 16; panel.style.width = w + 'px'; }
      if (h > window.innerHeight - 16) { h = window.innerHeight - 16; panel.style.height = h + 'px'; }
      var left = parseFloat(panel.style.left) || 0;
      var top = parseFloat(panel.style.top) || 0;
      panel.style.left = Math.min(Math.max(0, left), Math.max(0, window.innerWidth - w)) + 'px';
      panel.style.top = Math.min(Math.max(0, top), Math.max(0, window.innerHeight - 44)) + 'px';
    });

    /* 主入口悬浮按钮：可拖动 + 点击打开 */
    var fab = document.getElementById('prd-float-btn');
    if (fab) {
      var fabDrag = { active: false, moved: false, dx: 0, dy: 0, sx: 0, sy: 0 };
      fab.addEventListener('pointerdown', function (e) {
        var rect = fab.getBoundingClientRect();
        fabDrag.active = true;
        fabDrag.moved = false;
        fabDrag.sx = e.clientX;
        fabDrag.sy = e.clientY;
        fabDrag.dx = e.clientX - rect.left;
        fabDrag.dy = e.clientY - rect.top;
        try { fab.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      fab.addEventListener('pointermove', function (e) {
        if (!fabDrag.active) return;
        if (!fabDrag.moved && Math.abs(e.clientX - fabDrag.sx) < 5 && Math.abs(e.clientY - fabDrag.sy) < 5) return;
        fabDrag.moved = true;
        fab.classList.add('dragging');
        var w = fab.offsetWidth;
        var h = fab.offsetHeight;
        var left = Math.min(Math.max(0, e.clientX - fabDrag.dx), Math.max(0, window.innerWidth - w));
        var top = Math.min(Math.max(0, e.clientY - fabDrag.dy), Math.max(0, window.innerHeight - h));
        fab.style.right = 'auto';
        fab.style.bottom = 'auto';
        fab.style.left = left + 'px';
        fab.style.top = top + 'px';
      });
      function endFabDrag() {
        if (!fabDrag.active) return;
        fabDrag.active = false;
        fab.classList.remove('dragging');
        if (!fabDrag.moved) openPrdPanel();
      }
      fab.addEventListener('pointerup', endFabDrag);
      fab.addEventListener('pointercancel', function () { fabDrag.active = false; fab.classList.remove('dragging'); });
      fab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPrdPanel(); }
      });
      window.addEventListener('resize', function () {
        var rect = fab.getBoundingClientRect();
        var left = Math.min(Math.max(0, rect.left), Math.max(0, window.innerWidth - fab.offsetWidth));
        var top = Math.min(Math.max(0, rect.top), Math.max(0, window.innerHeight - fab.offsetHeight));
        fab.style.left = left + 'px';
        fab.style.top = top + 'px';
      });
    }

    /* 图片放大查看 */
    var viewer = document.getElementById('prd-img-viewer');
    var viewerImg = document.getElementById('prd-img-viewer-img');
    if (viewer && viewerImg) {
      function openPrdImageViewer(src, alt) {
        if (!src) return;
        viewerImg.src = src;
        viewerImg.alt = alt || '';
        viewer.classList.add('open');
      }
      function closePrdImageViewer() {
        viewer.classList.remove('open');
        viewerImg.src = '';
      }
      var panelBody = document.getElementById('prd-panel-body');
      if (panelBody) {
        panelBody.addEventListener('click', function (e) {
          var img = e.target.closest('.prd-story-shot img');
          if (img) openPrdImageViewer(img.getAttribute('src'), img.getAttribute('alt'));
        });
      }
      viewer.addEventListener('click', function () { closePrdImageViewer(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && viewer.classList.contains('open')) closePrdImageViewer();
      });
    }
  }

  /* 暴露到全局 */
  window.prd = {
    renderPrdPanel: renderPrdPanel,
    togglePrdStory: togglePrdStory,
    openPrdPanel: openPrdPanel,
    closePrdPanel: closePrdPanel,
    togglePrdFullscreen: togglePrdFullscreen,
    findPrdStory: findPrdStory,
    openUsDetail: openUsDetail,
    closeUsDetail: closeUsDetail,
    openFullPrdFromUs: openFullPrdFromUs,
    copyPrdLink: copyPrdLink
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrdSystem);
  } else {
    initPrdSystem();
  }
})();
