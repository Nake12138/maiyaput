/* ============================================================
 * scripts/targeting-packages.js
 * ------------------------------------------------------------
 * 定向包（Targeting Package）数据共享模块
 *
 * 数据源：模板管理-定向包页面
 *   - pages/fb-template.html    （FB 渠道定向包 tab）
 *   - pages/overseas-template.html （海外/TT 渠道定向包 tab）
 *
 * 当前登录人：娜可（默认）
 *
 * 由以下页面引入：
 *   - pages/fb-template.html
 *   - pages/overseas-template.html
 *   - pages/fb-auto-delivery.html     （选择定向包 弹窗）
 *   - pages/fb-batch-delivery.html    （我的定向包 弹框）
 *   - pages/overseas-auto-delivery.html（选择定向包 按钮/弹窗）
 *
 * 存储 key：localStorage['delivery_targeting_packages']
 *   第一次访问时 seed TARGETING_PACKAGES_DEFAULT；之后用户
 *   在「模板管理-定向包」页面做的变更同步写入这里。
 *
 * 调用约定：
 *   var packages = getTargetingPackages();     // 取最新数据
 *   renderTargetingTable(tbodyEl);             // 渲染标准表格（ID/名称/语言/创建人/创建时间/更新时间）
 *   bindTemplateTargetingPanel({               // 一键接管 模板管理-定向包 tab 的 tbody / 搜索 / 重置
 *     tbodyId, searchId, langId, creatorId,
 *     queryBtnId, resetBtnId, refreshBtnId
 *   });
 * ============================================================ */

(function (global) {
  'use strict';

  /* ---------- 当前登录人：默认娜可 ---------- */
  global.CURRENT_USER = '娜可';

  /* ---------- 创建人下拉选项（弹窗筛选用） ---------- */
  global.TARGETING_CREATORS = ['娜可', '听泉', '魔法七', '橙子', '孤树'];

  /* ---------- 默认定向包数据（与 fb-template.html / overseas-template.html 定向包 tab 一致） ----------
   * 所有数据创建人统一为「娜可」，与模板管理-定向包页面的「创建人」筛选下拉只有「娜可」一项一致。
   */
  global.TARGETING_PACKAGES_DEFAULT = [
    { id: 56, name: '意大利',         lang: '意大利语', creator: '娜可', createTime: '2026-08-17 11:15:15', updateTime: '2026-08-17 11:15:15' },
    { id: 49, name: '日语',           lang: '日语',     creator: '娜可', createTime: '2026-08-14 22:40:54', updateTime: '2026-08-14 22:40:54' },
    { id: 30, name: '美国-不限-16',   lang: '英语',     creator: '娜可', createTime: '2026-08-07 14:19:27', updateTime: '2026-08-18 11:40:43' },
    { id: 42, name: '多单价',         lang: '西班牙语', creator: '娜可', createTime: '2026-08-11 14:21:51', updateTime: '2026-08-11 14:21:51' },
    { id: 29, name: '日本-女性-23',   lang: '日语',     creator: '娜可', createTime: '2026-08-07 14:19:23', updateTime: '2026-08-11 14:20:51' },
    { id: 35, name: '韩国-不限-18',   lang: '韩语',     creator: '娜可', createTime: '2026-08-06 17:21:02', updateTime: '2026-08-11 14:20:39' },
    { id: 51, name: '印尼-不限-12',   lang: '印尼语',   creator: '娜可', createTime: '2026-08-05 10:12:40', updateTime: '2026-08-12 09:02:11' },
    { id: 55, name: '美国-女性-21',   lang: '英语',     creator: '娜可', createTime: '2026-08-09 15:33:52', updateTime: '2026-08-15 15:33:52' }
  ];

  var STORAGE_KEY = 'delivery_targeting_packages';

  function safeRead() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch (err) { return null; }
  }

  function safeWrite(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (err) {}
  }

  /* ---------- 取数据 ---------- */
  function getTargetingPackages() {
    var cached = safeRead();
    if (cached && cached.length) return cached;
    safeWrite(global.TARGETING_PACKAGES_DEFAULT.slice());
    return global.TARGETING_PACKAGES_DEFAULT.slice();
  }

  /* ---------- 写数据（供模板管理-定向包页面的新增/编辑/删除调用） ---------- */
  function setTargetingPackages(arr) {
    safeWrite(Array.isArray(arr) ? arr : []);
  }

  /* ---------- 把数据塞回默认（清空缓存） ---------- */
  function resetTargetingPackages() {
    safeWrite(global.TARGETING_PACKAGES_DEFAULT.slice());
  }

  /* ---------- 过滤 ---------- */
  function filterTargetingPackages(opts) {
    opts = opts || {};
    var kw = (opts.keyword || '').trim();
    var lang = opts.lang || '';
    var creator = opts.creator || '';
    return getTargetingPackages().filter(function (p) {
      var matchKw = !kw || (p.name || '').indexOf(kw) >= 0;
      var matchLang = !lang || p.lang === lang;
      var matchCreator = !creator || p.creator === creator;
      return matchKw && matchLang && matchCreator;
    });
  }

  /* ---------- 渲染标准表格行（ID / 名称 / 语言 / 创建人 / 创建时间 / 更新时间） ---------- */
  function buildTargetingRowHtml(p, opts) {
    opts = opts || {};
    var checked = opts.checked ? ' checked' : '';
    var checkboxCell = opts.checkbox !== false
      ? '<td class="checkbox-col"><input type="checkbox" value="' + p.name + '"' + checked + ' /></td>'
      : '';
    var actionCell = opts.actionsHtml || '';
    var nameCell = opts.nameHtml != null
      ? opts.nameHtml
      : '<a href="javascript:void(0)" style="color:var(--color-info);text-decoration:none;">' + p.name + '</a>';
    return '<tr data-name="' + p.name + '" data-id="' + p.id + '">' +
      checkboxCell +
      '<td>' + p.id + '</td>' +
      '<td>' + nameCell + '</td>' +
      '<td>' + p.lang + '</td>' +
      '<td>' + p.creator + '</td>' +
      '<td>' + p.createTime + '</td>' +
      '<td>' + p.updateTime + '</td>' +
      (actionCell ? '<td>' + actionCell + '</td>' : '') +
      '</tr>';
  }

  /* ---------- 标准模板管理-定向包 tab tbody 渲染 ---------- */
  function renderTargetingTable(tbodyEl) {
    if (!tbodyEl) return;
    var rows = getTargetingPackages().map(function (p) {
      return buildTargetingRowHtml(p, {
        checked: false,
        actionsHtml: '<a href="#" class="link"<div class=\"row-actions\"> onclick="openTargetDrawer && openTargetDrawer(\'edit\',\'' + p.name + '\')">复制</a> ' +
                     '<a href="#" class="link" onclick="openTargetDrawer && openTargetDrawer(\'edit\',\'' + p.name + '\')">编辑</a> ' +
                     '<a href="#" class="link link-danger" onclick="deleteTargetingRow(this)\">删除</a></div>'
      });
    });
    tbodyEl.innerHTML = rows.join('') ||
      '<tr><td colspan="7" style="text-align:center;color:var(--color-text-tertiary);padding:24px 0;">暂无数据</td></tr>';
  }

  /* ---------- 给「模板管理-定向包」tab 提供一键接管：
   *   - 搜索 / 语言 / 创建人 / 查询 / 重置 / 刷新
   *   - tbody 渲染
   *   - 列表为空提示
   */
  function bindTemplateTargetingPanel(cfg) {
    if (!cfg || !cfg.tbodyId) return;
    var tbody = document.getElementById(cfg.tbodyId);
    if (!tbody) return;

    function rerender() {
      var kw = cfg.searchId ? (document.getElementById(cfg.searchId) || {}).value || '' : '';
      var lang = cfg.langId ? (document.getElementById(cfg.langId) || {}).value || '' : '';
      var creator = cfg.creatorId ? (document.getElementById(cfg.creatorId) || {}).value || '' : '';
      var list = filterTargetingPackages({ keyword: kw, lang: lang, creator: creator });
      var rows = list.map(function (p) {
        return buildTargetingRowHtml(p, {
          checked: false,
          actionsHtml: '<a href="#" class="link"<div class=\"row-actions\"> onclick="openTargetDrawer && openTargetDrawer(\'edit\',\'' + p.name + '\')">复制</a> ' +
                       '<a href="#" class="link" onclick="openTargetDrawer && openTargetDrawer(\'edit\',\'' + p.name + '\')">编辑</a> ' +
                       '<a href="#" class="link link-danger" onclick="deleteTargetingRow(this)\">删除</a></div>'
        });
      });
      tbody.innerHTML = rows.join('') ||
        '<tr><td colspan="7" style="text-align:center;color:var(--color-text-tertiary);padding:24px 0;">暂无数据</td></tr>';
      var info = document.querySelector('#template-tab-target .pagination-info');
      if (info) info.textContent = '共 ' + list.length + ' 条';
    }

    if (cfg.queryBtnId) {
      var q = document.getElementById(cfg.queryBtnId);
      if (q) q.addEventListener('click', rerender);
    }
    if (cfg.resetBtnId) {
      var r = document.getElementById(cfg.resetBtnId);
      if (r) r.addEventListener('click', function () {
        if (cfg.searchId) (document.getElementById(cfg.searchId) || {}).value = '';
        if (cfg.langId) (document.getElementById(cfg.langId) || {}).selectedIndex = 0;
        if (cfg.creatorId) (document.getElementById(cfg.creatorId) || {}).selectedIndex = 0;
        rerender();
      });
    }
    if (cfg.refreshBtnId) {
      var rf = document.getElementById(cfg.refreshBtnId);
      if (rf) rf.addEventListener('click', rerender);
    }

    // 默认渲染
    rerender();
  }

  /* ---------- 导出 ---------- */
  global.getTargetingPackages = getTargetingPackages;
  global.setTargetingPackages = setTargetingPackages;
  global.resetTargetingPackages = resetTargetingPackages;
  global.filterTargetingPackages = filterTargetingPackages;
  global.buildTargetingRowHtml = buildTargetingRowHtml;
  global.renderTargetingTable = renderTargetingTable;
  global.bindTemplateTargetingPanel = bindTemplateTargetingPanel;
})(window);