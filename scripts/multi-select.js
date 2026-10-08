/* ============================================================================
 * MultiSelect —— 公用多选下拉组件（下拉面板内带复选框 + 搜索）
 * ----------------------------------------------------------------------------
 * 依赖：styles/multi-select.css
 *
 * 用法：
 *   var ms = MultiSelect.init(document.getElementById('target-locale-field'), {
 *     placeholder: '请选择语言（可多选）',
 *     countLabel: '已选：{n} 种语言',          // {n} 会被替换为已选数量
 *     searchPlaceholder: '请输入名称',
 *     options: [ { id: '6', name: '英语 (English)', meta: '' }, ... ],
 *     selected: ['6'],                          // 初始已选 id
 *     maxWidth: '320px',                        // 可选，覆盖默认 420px
 *     onChange: function (selected) { }         // selected: [{id,name,meta}]
 *   });
 *
 * 实例方法：
 *   ms.getSelected()      -> [{id,name,meta}]  已选完整对象
 *   ms.getSelectedIds()   -> ['6','17']        已选 id
 *   ms.setSelected(ids)                        设置已选（触发 onChange）
 *   ms.refresh(options)                        重置数据源与已选项
 *   ms.open() / ms.close() / ms.toggle()
 *   ms.destroy()                               移除面板与事件
 *
 * 说明：下拉面板挂载到 <body> 并以 position:fixed 定位，
 *       避免被 .drawer-card{overflow:hidden} 之类的祖先元素裁剪。
 * ========================================================================== */
(function (global) {
  'use strict';

  var uid = 0;
  var all = [];
  var globalBound = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ==================== 构造 ==================== */
  function MultiSelect(el, options) {
    this.el = el;
    this.opts = options || {};
    this.id = ++uid;
    this.data = (this.opts.options || []).slice();
    this.selectedIds = (this.opts.selected || []).map(String);
    this.isOpen = false;
    this._kw = '';

    this._build();
    this._sync();
    all.push(this);
  }

  /* ==================== DOM 构建 ==================== */
  MultiSelect.prototype._build = function () {
    var self = this;

    this.el.classList.add('ms');
    if (this.opts.maxWidth) this.el.style.maxWidth = this.opts.maxWidth;
    this.el.innerHTML =
      '<div class="ms-field">' +
        '<button type="button" class="ms-trigger">' +
          '<span class="ms-label"></span>' +
          '<span class="ms-caret">▾</span>' +
        '</button>' +
        '<button type="button" class="ms-clear" title="清空已选">×</button>' +
      '</div>' +
      '<div class="ms-tags"></div>';

    this.triggerEl = this.el.querySelector('.ms-trigger');
    this.labelEl = this.el.querySelector('.ms-label');
    this.clearEl = this.el.querySelector('.ms-clear');
    this.tagsEl = this.el.querySelector('.ms-tags');

    /* 面板挂 body，避开祖先 overflow 裁剪 */
    this.panelEl = document.createElement('div');
    this.panelEl.className = 'ms-panel';
    this.panelEl.innerHTML =
      '<div class="ms-search"><input type="text" class="form-input" /></div>' +
      '<div class="ms-list"></div>';
    document.body.appendChild(this.panelEl);

    this.searchEl = this.panelEl.querySelector('input');
    this.listEl = this.panelEl.querySelector('.ms-list');
    this.searchEl.placeholder = this.opts.searchPlaceholder || '请输入名称';

    this.triggerEl.addEventListener('click', function (e) { e.stopPropagation(); self.toggle(); });
    this.clearEl.addEventListener('click', function (e) { e.stopPropagation(); self.clear(); });
    this.searchEl.addEventListener('click', function (e) { e.stopPropagation(); });
    this.searchEl.addEventListener('input', function () { self._kw = this.value; self._renderList(); });
    this.panelEl.addEventListener('click', function (e) { e.stopPropagation(); });

    /* 勾选（事件委托，避免拼接内联 onclick） */
    this.listEl.addEventListener('change', function (e) {
      var cb = e.target;
      if (!cb || cb.type !== 'checkbox') return;
      var id = String(cb.value);
      if (cb.checked) {
        if (self.selectedIds.indexOf(id) < 0) self.selectedIds.push(id);
      } else {
        self.selectedIds = self.selectedIds.filter(function (x) { return x !== id; });
      }
      self._sync();
    });

    /* 标签移除 */
    this.tagsEl.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('button[data-id]') : null;
      if (!btn) return;
      var id = String(btn.getAttribute('data-id'));
      self.selectedIds = self.selectedIds.filter(function (x) { return x !== id; });
      self._renderList();
      self._sync();
    });
  };

  /* ==================== 渲染 ==================== */
  MultiSelect.prototype._renderList = function () {
    var self = this;
    var kw = (this._kw || '').trim().toLowerCase();
    var list = this.data.filter(function (o) {
      if (!kw) return true;
      return String(o.name).toLowerCase().indexOf(kw) >= 0 ||
             String(o.meta || '').toLowerCase().indexOf(kw) >= 0;
    });

    if (!list.length) {
      this.listEl.innerHTML = '<div class="ms-empty">暂无数据</div>';
      return;
    }
    this.listEl.innerHTML = list.map(function (o) {
      var checked = self.selectedIds.indexOf(String(o.id)) >= 0;
      return '<label class="ms-option">' +
        '<input type="checkbox" value="' + esc(o.id) + '"' + (checked ? ' checked' : '') + ' />' +
        '<span>' + esc(o.name) + '</span>' +
        (o.meta ? '<span class="ms-meta">' + esc(o.meta) + '</span>' : '') +
      '</label>';
    }).join('');
  };

  /* 同步触发器文案 + 标签 + 回调 */
  MultiSelect.prototype._sync = function () {
    var selected = this.getSelected();
    var n = selected.length;

    var tpl = this.opts.countLabel || '已选：{n} 项';
    this.labelEl.textContent = n ? tpl.replace('{n}', n) : (this.opts.placeholder || '请选择');

    this.tagsEl.innerHTML = selected.map(function (o) {
      return '<span class="ms-tag">' + esc(o.name) + (o.meta ? '（' + esc(o.meta) + '）' : '') +
        '<button type="button" data-id="' + esc(o.id) + '" title="移除">&times;</button></span>';
    }).join('');

    if (typeof this.opts.onChange === 'function') this.opts.onChange(selected);
  };

  /* ==================== 定位 ==================== */
  MultiSelect.prototype._position = function () {
    if (!this.isOpen || !this.triggerEl) return;
    var r = this.triggerEl.getBoundingClientRect();
    var panel = this.panelEl;

    panel.style.width = r.width + 'px';
    panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - r.width - 8)) + 'px';

    var h = panel.offsetHeight || 300;
    var top = r.bottom + 4;
    /* 下方空间不足则向上翻转 */
    if (top + h > window.innerHeight - 8) {
      var up = r.top - 4 - h;
      if (up >= 8) top = up;
    }
    panel.style.top = top + 'px';
  };

  /* ==================== 开合 ==================== */
  MultiSelect.prototype.open = function () {
    if (this.isOpen) return;
    this.isOpen = true;
    this._kw = '';
    this.searchEl.value = '';
    this._renderList();
    this.panelEl.classList.add('is-open');
    this.el.classList.add('is-open');
    this._position();
  };

  MultiSelect.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.panelEl.classList.remove('is-open');
    this.el.classList.remove('is-open');
  };

  MultiSelect.prototype.toggle = function () {
    if (this.isOpen) { this.close(); } else { this.open(); }
  };

  /* ==================== 数据读写 ==================== */
  MultiSelect.prototype.getSelected = function () {
    var self = this;
    return this.selectedIds.map(function (id) {
      for (var i = 0; i < self.data.length; i++) {
        if (String(self.data[i].id) === id) return self.data[i];
      }
      return { id: id, name: id, meta: '' };
    });
  };

  MultiSelect.prototype.getSelectedIds = function () {
    return this.selectedIds.slice();
  };

  MultiSelect.prototype.setSelected = function (ids) {
    this.selectedIds = (ids || []).map(String);
    this._renderList();
    this._sync();
  };

  MultiSelect.prototype.clear = function () {
    this.setSelected([]);
  };

  /* 重置数据源与已选项 */
  MultiSelect.prototype.refresh = function (options) {
    var o = options || {};
    if (o.options) this.data = o.options.slice();
    this.selectedIds = (o.selected || []).map(String);
    this._renderList();
    this._sync();
  };

  MultiSelect.prototype.destroy = function () {
    this.close();
    if (this.panelEl && this.panelEl.parentNode) this.panelEl.parentNode.removeChild(this.panelEl);
    this.el.classList.remove('ms');
    this.el.innerHTML = '';
    all = all.filter(function (m) { return m !== this; }, this);
  };

  /* ==================== 全局事件（只绑一次） ==================== */
  function bindGlobal() {
    if (globalBound) return;
    globalBound = true;

    /* 点击面板/触发器外部 → 收起所有面板（内部已 stopPropagation） */
    document.addEventListener('click', function () {
      all.forEach(function (ms) { ms.close(); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        all.forEach(function (ms) { ms.close(); });
      }
    });

    var repositionAll = function () {
      all.forEach(function (ms) { if (ms.isOpen) ms._position(); });
    };
    window.addEventListener('resize', repositionAll);
    window.addEventListener('scroll', repositionAll, true);
  }

  /* ==================== 对外 API ==================== */
  function init(elOrSelector, options) {
    var el = typeof elOrSelector === 'string'
      ? document.querySelector(elOrSelector)
      : elOrSelector;
    if (!el) {
      console.warn('MultiSelect: 未找到容器元素', elOrSelector);
      return null;
    }
    bindGlobal();
    return new MultiSelect(el, options);
  }

  global.MultiSelect = {
    init: init,
    instances: function () { return all.slice(); },
    closeAll: function () { all.forEach(function (ms) { ms.close(); }); }
  };
})(window);
