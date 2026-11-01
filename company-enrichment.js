(function () {
  "use strict";

  const ENDPOINT_SLOT = "regionalHarnessEndpoint";
  const TOKEN_SLOT = "regionalHarnessToken";
  const FIELD_LABELS = {
    cpName: "企业全称",
    cpCode: "统一社会信用代码",
    cpLegalRep: "法定代表人",
    cpRegisteredCapital: "注册资本",
    cpEstablishedDate: "成立日期",
    cpCompanyStatus: "登记状态",
    cpRegisteredAddress: "注册地址",
    cpBusinessScope: "经营范围",
    cpOfficialWebsite: "企业官网",
    cpParent: "母公司及关联关系",
    cpProduct: "产品 / 核心技术",
    cpIndustry: "行业与应用场景",
    cpDescription: "企业公开简介"
  };
  const ALIASES = {
    companyName: "cpName",
    unifiedSocialCreditCode: "cpCode",
    legalRepresentative: "cpLegalRep",
    registeredCapital: "cpRegisteredCapital",
    establishmentDate: "cpEstablishedDate",
    establishedDate: "cpEstablishedDate",
    businessStatus: "cpCompanyStatus",
    registeredAddress: "cpRegisteredAddress",
    businessScope: "cpBusinessScope",
    officialWebsite: "cpOfficialWebsite",
    parentCompany: "cpParent",
    productsOrTechnology: "cpProduct",
    industry: "cpIndustry",
    companyOverview: "cpDescription"
  };
  const IDS = Object.keys(FIELD_LABELS);
  let latestResearch = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || "").trim());
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = [
      ".company-name-field{grid-column:1/-1}",
      ".company-search-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}",
      ".company-search-row input{min-width:0}",
      ".company-search-row .btn{white-space:nowrap;min-height:36px}",
      ".company-enrichment-hint{font-size:9px;color:#737d8b;line-height:1.6}",
      ".company-search-config{margin-top:8px;padding:10px 11px;border:1px solid #e2e6eb;border-radius:9px;background:#f7f8fa}",
      ".company-search-config summary{cursor:pointer;font-size:10px;font-weight:650;color:#344b68}",
      ".company-search-endpoint-row{display:grid;gap:5px;margin-top:9px}",
      ".company-search-endpoint-row label{font-size:9px;font-weight:650;color:#536174}",
      ".company-search-endpoint-row input{width:100%;min-width:0;border:1px solid #e2e6eb;border-radius:8px;padding:9px 10px;font-size:10px}",
      ".company-search-key-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:9px}",
      ".company-search-key-row input{min-width:0;border:1px solid #e2e6eb;border-radius:8px;padding:9px 10px;font-size:10px}",
      ".company-search-config p{font-size:9px;line-height:1.6;color:#737d8b;margin:8px 0 0}",
      ".company-search-config a,.company-suggestion-source a,.company-search-sources a{color:#365578;text-decoration:none}",
      ".company-search-config a:hover,.company-suggestion-source a:hover,.company-search-sources a:hover{text-decoration:underline}",
      ".company-search-status{font-size:10px;line-height:1.55;color:#647080;margin-top:8px}",
      ".company-search-status.error{color:#a94442}",
      ".company-search-status.success{color:#355d49}",
      ".company-search-preview{margin-top:10px;padding:12px;border:1px solid #dce3eb;border-radius:10px;background:#fbfcfd}",
      ".company-search-preview[hidden]{display:none}",
      ".company-search-preview h4{font-size:11px;margin:0 0 7px;color:#253a54}",
      ".company-search-preview p{font-size:9px;line-height:1.6;color:#6f7b8a;margin:0 0 9px}",
      ".company-suggestion-list{display:grid;gap:7px}",
      ".company-suggestion{display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px;padding:9px;border:1px solid #e5e9ee;border-radius:8px;background:#fff}",
      ".company-suggestion input{margin:2px 0 0;accent-color:#29496f}",
      ".company-suggestion strong{font-size:10px;color:#34445a}",
      ".company-suggestion-value{display:block;font-size:10px;line-height:1.55;color:#334256;overflow-wrap:anywhere;margin-top:4px;white-space:pre-wrap}",
      ".company-suggestion-source{display:block;font-size:9px;line-height:1.5;color:#778394;margin-top:5px;overflow-wrap:anywhere}",
      ".company-suggestion-source em{font-style:normal;color:#946e35}",
      ".company-search-sources{font-size:9px;line-height:1.65;color:#748092;margin:9px 0 0}",
      ".company-search-sources ul{padding-left:16px;margin:4px 0 0}",
      ".company-search-actions{display:flex;justify-content:flex-end;margin-top:9px}",
      ".company-public-title{grid-column:1/-1;border-top:1px solid #e6e9ed;padding-top:11px;font-size:10px;font-weight:700;color:#344b68}",
      ".company-public-field textarea{min-height:76px}",
      "@media(max-width:760px){.company-search-row,.company-search-key-row{grid-template-columns:1fr}.company-search-row .btn{width:100%}.company-search-actions .btn{width:100%}}"
    ].join("");
    document.head.appendChild(style);
  }

  function fieldMarkup(id, label, placeholder, wide) {
    const cls = wide ? "field wide company-public-field" : "field company-public-field";
    if (id === "cpBusinessScope") {
      return '<div class="' + cls + '"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" placeholder="' + placeholder + '"></textarea></div>';
    }
    return '<div class="' + cls + '"><label for="' + id + '">' + label + '</label><input id="' + id + '" placeholder="' + placeholder + '"/></div>';
  }

  function insertPublicFields() {
    if (document.getElementById("cpLegalRep")) return;
    const parent = document.getElementById("cpParent");
    if (!parent) return;
    const host = parent.closest(".field");
    host.insertAdjacentHTML("afterend",
      '<div class="company-public-title">联网公开资料候选项 · 请核对来源后使用</div>' +
      fieldMarkup("cpLegalRep", "法定代表人", "仅记录公开登记信息", false) +
      fieldMarkup("cpRegisteredCapital", "注册资本", "以登记信息为准", false) +
      fieldMarkup("cpEstablishedDate", "成立日期", "YYYY-MM-DD 或登记年份", false) +
      fieldMarkup("cpCompanyStatus", "登记状态", "存续、在业等公开状态", false) +
      fieldMarkup("cpRegisteredAddress", "注册地址", "仅供主体核对", false) +
      fieldMarkup("cpOfficialWebsite", "企业官网", "以企业官方页面为准", false) +
      fieldMarkup("cpBusinessScope", "经营范围", "请以登记机关公示内容复核", true)
    );
  }

  function insertSearchControls() {
    const input = document.getElementById("cpName");
    if (!input || document.getElementById("companySearchButton")) return;
    const host = input.closest(".field");
    host.classList.add("company-name-field");
    const row = document.createElement("div");
    row.className = "company-search-row";
    input.parentNode.insertBefore(row, input);
    row.appendChild(input);

    const searchButton = document.createElement("button");
    searchButton.type = "button";
    searchButton.className = "btn btn-secondary";
    searchButton.id = "companySearchButton";
    searchButton.textContent = "联网检索并匹配资料";
    row.appendChild(searchButton);

    const hint = document.createElement("div");
    hint.className = "company-enrichment-hint";
    hint.textContent = "输入企业名称后联网检索。先核对候选来源，再填入企业档案；研发、销售、税务、资质和深圳落地数据不会自动补写。";
    host.appendChild(hint);

    const details = document.createElement("details");
    details.className = "company-search-config";
    details.id = "companySearchConfig";
    const summary = document.createElement("summary");
    summary.textContent = "连接 DeepSeek Harness 检索服务";
    details.appendChild(summary);

    const endpointRow = document.createElement("div");
    endpointRow.className = "company-search-endpoint-row";
    const endpointLabel = document.createElement("label");
    endpointLabel.htmlFor = "companySearchEndpoint";
    endpointLabel.textContent = "工作台检索服务地址";
    endpointRow.appendChild(endpointLabel);
    const endpointInput = document.createElement("input");
    endpointInput.type = "url";
    endpointInput.id = "companySearchEndpoint";
    endpointInput.autocomplete = "url";
    endpointInput.spellcheck = false;
    endpointInput.placeholder = "https://你的服务域名/api/company-search";
    endpointRow.appendChild(endpointInput);
    details.appendChild(endpointRow);

    const keyRow = document.createElement("div");
    keyRow.className = "company-search-key-row";
    const keyInput = document.createElement("input");
    keyInput.type = "password";
    keyInput.id = "companySearchAccessToken";
    keyInput.autocomplete = "off";
    keyInput.spellcheck = false;
    keyInput.placeholder = "工作台服务访问令牌（非 DeepSeek API Key）";
    keyRow.appendChild(keyInput);
    const saveKey = document.createElement("button");
    saveKey.type = "button";
    saveKey.className = "btn btn-secondary btn-small";
    saveKey.id = "companySearchConfigSave";
    saveKey.textContent = "保存连接";
    keyRow.appendChild(saveKey);
    details.appendChild(keyRow);

    const note = document.createElement("p");
    note.innerHTML = '此静态网页连接部署好的工作台检索服务，由服务端通过 <a href="https://deepseek-harness.github.io/deepseek-harness/en/guide/python-sdk" target="_blank" rel="noopener noreferrer">DeepSeek Harness SDK</a> 执行网页检索。DeepSeek API Key 应保存在 Harness 服务端；这里填写的是工作台服务地址和访问令牌。令牌只保存在当前标签页会话。每次检索只发送当前企业名称，不发送企业档案中的财务、税务或项目资料。';
    details.appendChild(note);
    host.appendChild(details);

    const status = document.createElement("div");
    status.className = "company-search-status";
    status.id = "companySearchStatus";
    status.setAttribute("aria-live", "polite");
    host.appendChild(status);

    const preview = document.createElement("div");
    preview.className = "company-search-preview";
    preview.id = "companySearchPreview";
    preview.hidden = true;
    host.appendChild(preview);

    searchButton.addEventListener("click", runCompanySearch);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        runCompanySearch();
      }
    });
    saveKey.addEventListener("click", function () {
      const endpoint = normalizeServiceEndpoint(endpointInput.value);
      const token = keyInput.value.trim();
      if (!endpoint) {
        setStatus("请填写有效的 HTTPS 检索服务地址；本机 localhost 可使用 HTTP。", "error");
        endpointInput.focus();
        return;
      }
      persistHarnessConfig(endpoint, token);
      setStatus(token ? "Harness 检索服务连接信息已保存到当前标签页。" : "服务地址已保存；还需要填写工作台访问令牌。", token ? "success" : "error");
    });
    try {
      endpointInput.value = sessionStorage.getItem(ENDPOINT_SLOT) || "";
      keyInput.value = sessionStorage.getItem(TOKEN_SLOT) || "";
    } catch (_) {
      endpointInput.value = "";
      keyInput.value = "";
    }
  }

  function normalizeServiceEndpoint(value) {
    try {
      const url = new URL(String(value || "").trim());
      const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
      if (url.protocol !== "https:" && !localHttp) return "";
      return url.href.replace(/\/$/, "");
    } catch (_) {
      return "";
    }
  }

  function persistHarnessConfig(endpoint, token) {
    try {
      if (endpoint) sessionStorage.setItem(ENDPOINT_SLOT, endpoint);
      else sessionStorage.removeItem(ENDPOINT_SLOT);
      if (token) sessionStorage.setItem(TOKEN_SLOT, token.trim());
      else sessionStorage.removeItem(TOKEN_SLOT);
    } catch (_) {}
  }

  function setStatus(message, kind) {
    const status = document.getElementById("companySearchStatus");
    if (!status) return;
    status.className = "company-search-status" + (kind ? " " + kind : "");
    status.textContent = message || "";
  }

  function normalizeResearch(data) {
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const sourceFallback = sources.find(function (item) { return safeUrl(item.url); }) || {};
    const rawFields = data.fields && typeof data.fields === "object" ? data.fields : {};
    const entries = Array.isArray(rawFields)
      ? rawFields.map(function (item) { return [item.id || item.field || "", item]; })
      : Object.entries(rawFields);
    const normalized = {};

    Object.keys(ALIASES).forEach(function (alias) {
      if (rawFields[alias] !== undefined && rawFields[ALIASES[alias]] === undefined) {
        entries.push([ALIASES[alias], rawFields[alias]]);
      }
    });

    entries.forEach(function (pair) {
      const rawId = String(pair[0] || "");
      const id = FIELD_LABELS[rawId] ? rawId : (ALIASES[rawId] || "");
      if (!id) return;
      const item = pair[1];
      const value = typeof item === "string" || typeof item === "number"
        ? String(item)
        : String((item && (item.value || item.text)) || "");
      const sourceUrl = safeUrl(item && (item.sourceUrl || item.url || (item.source && item.source.url)));
      if (!value.trim()) return;
      normalized[id] = {
        value: value.trim(),
        sourceUrl: sourceUrl,
        sourceName: String((item && (item.sourceName || item.sourceTitle || (item.source && item.source.title))) || ""),
        evidence: String((item && (item.evidence || item.quote || item.excerpt)) || ""),
        confidence: String((item && item.confidence) || "待核对")
      };
    });

    if (data.companyName && !normalized.cpName) {
      normalized.cpName = {
        value: String(data.companyName),
        sourceUrl: safeUrl(sourceFallback.url),
        sourceName: String(sourceFallback.title || ""),
        evidence: "",
        confidence: "待核对"
      };
    }
    return { fields: normalized, sources: sources };
  }

  async function runCompanySearch() {
    const nameInput = document.getElementById("cpName");
    const endpointInput = document.getElementById("companySearchEndpoint");
    const keyInput = document.getElementById("companySearchAccessToken");
    const button = document.getElementById("companySearchButton");
    const preview = document.getElementById("companySearchPreview");
    const name = nameInput ? nameInput.value.trim() : "";
    const endpoint = normalizeServiceEndpoint(endpointInput ? endpointInput.value : "");
    const key = keyInput ? keyInput.value.trim() : "";
    if (!name) {
      setStatus("先输入企业名称。", "error");
      if (nameInput) nameInput.focus();
      return;
    }
    if (!endpoint || !key) {
      const config = document.getElementById("companySearchConfig");
      if (config) config.open = true;
      setStatus(!endpoint ? "请先配置已部署的 DeepSeek Harness 检索服务地址。" : "请填写工作台服务访问令牌；不要把 DeepSeek API Key 粘贴到网页。", "error");
      if (!endpoint && endpointInput) endpointInput.focus();
      else if (keyInput) keyInput.focus();
      return;
    }

    persistHarnessConfig(endpoint, key);
    if (button) {
      button.disabled = true;
      button.textContent = "正在检索…";
    }
    if (preview) preview.hidden = true;
    setStatus("正在通过 DeepSeek Harness 检索公开网页并整理有来源支持的资料，可能需要几十秒。");

    const controller = new AbortController();
    const timeout = setTimeout(function () { controller.abort(); }, 120000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        headers: {
          "Authorization": "Bearer " + key,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ company_name: name }),
        signal: controller.signal
      });
      const raw = await response.text();
      let payload = {};
      try { payload = JSON.parse(raw); } catch (_) {}
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) throw new Error("工作台服务访问令牌无效或无权限，请检查连接设置。");
        if (response.status === 429) throw new Error("Harness 服务请求过于频繁，请稍后再试。");
        const detail = payload.detail || payload.message || (payload.error && payload.error.message) || "";
        throw new Error("Harness 检索服务暂不可用（HTTP " + response.status + "）。" + String(detail).slice(0, 160));
      }
      if (!raw.trim() || !Object.keys(payload).length) throw new Error("Harness 检索服务没有返回有效 JSON。");
      const structured = payload.result && typeof payload.result === "object" ? payload.result : payload;
      const normalized = normalizeResearch(structured);
      latestResearch = { query: name, result: structured, normalized: normalized, researchedAt: new Date().toISOString() };
      renderResearchPreview(latestResearch);
      const count = Object.keys(normalized.fields).length;
      setStatus(count
        ? "检索完成：找到 " + count + " 项候选资料。查看来源、勾选要填入的字段，再确认保存。"
        : "检索完成，但没有找到带明确来源的可填字段。可查看搜索来源并尝试更完整的企业名称。",
        count ? "success" : "");
    } catch (error) {
      if (error && error.name === "AbortError") {
        setStatus("检索超时，请稍后重试；如果反复超时，可减少查询范围。", "error");
      } else if (error instanceof TypeError) {
        setStatus("浏览器未能连接 Harness 服务。请检查服务地址、HTTPS、跨域（CORS）和网络连通性。", "error");
      } else {
        setStatus(error && error.message ? error.message : "检索失败，请检查 Harness 服务连接后重试。", "error");
      }
    } finally {
      clearTimeout(timeout);
      if (button) {
        button.disabled = false;
        button.textContent = "联网检索并匹配资料";
      }
    }
  }

  function renderResearchPreview(research) {
    const preview = document.getElementById("companySearchPreview");
    if (!preview) return;
    const fields = research.normalized.fields;
    const rows = Object.entries(fields);
    const items = rows.map(function (pair) {
      const id = pair[0];
      const item = pair[1];
      const target = document.getElementById(id);
      const current = target && String(target.value || "").trim();
      const link = safeUrl(item.sourceUrl);
      const confidence = String(item.confidence || "待核对");
      const selected = !!link && !current && !/low|低/i.test(confidence);
      const source = link
        ? '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.sourceName || link) + ' ↗</a>'
        : '<em>未提供有效来源链接，不能填入</em>';
      return '<label class="company-suggestion">' +
        '<input type="checkbox" data-company-target="' + escapeHtml(id) + '"' +
        (selected ? " checked" : "") + (!link ? " disabled" : "") + '>' +
        '<span><strong>' + escapeHtml(FIELD_LABELS[id]) + ' · ' + escapeHtml(confidence) + '</strong>' +
        '<span class="company-suggestion-value">' + escapeHtml(item.value) + '</span>' +
        '<span class="company-suggestion-source">来源：' + source +
        (item.evidence ? '<br>依据：' + escapeHtml(item.evidence) : "") +
        (current ? '<br>当前内容：' + escapeHtml(current) + '（默认不覆盖）' : "") +
        '</span></span></label>';
    }).join("");
    const sourceItems = (research.normalized.sources || []).map(function (source) {
      const link = safeUrl(source.url);
      if (!link) return "";
      return '<li><a href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(source.title || link) + ' ↗</a>' +
        (source.type ? " · " + escapeHtml(source.type) : "") + '</li>';
    }).join("");
    preview.innerHTML =
      '<h4>企业资料候选 · ' + escapeHtml(research.query) + '</h4>' +
      '<p>默认勾选有来源且当前为空的字段。请打开来源核对；登记信息可能滞后，搜索结果不等于官方认定。</p>' +
      '<div class="company-suggestion-list">' + (items || '<p>没有可填字段。请尝试输入工商登记全称。</p>') + '</div>' +
      (sourceItems ? '<div class="company-search-sources">其他检索来源<ul>' + sourceItems + '</ul></div>' : "") +
      '<div class="company-search-actions"><button type="button" class="btn btn-primary btn-small" id="applyCompanyResearch">填入已选字段</button></div>';
    preview.hidden = false;
    const apply = document.getElementById("applyCompanyResearch");
    if (apply) apply.addEventListener("click", applyResearchFields);
  }

  function applyResearchFields() {
    if (!latestResearch) return;
    const preview = document.getElementById("companySearchPreview");
    const checks = preview.querySelectorAll("[data-company-target]:checked");
    const applied = [];
    checks.forEach(function (check) {
      const id = check.getAttribute("data-company-target");
      const item = latestResearch.normalized.fields[id];
      const target = document.getElementById(id);
      if (!item || !target || !safeUrl(item.sourceUrl)) return;
      target.value = item.value;
      applied.push({
        id: id,
        label: FIELD_LABELS[id],
        value: item.value,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        evidence: item.evidence,
        confidence: item.confidence
      });
    });
    if (!applied.length) {
      setStatus("没有勾选可填字段。已有内容默认不覆盖；请核对后勾选需要更新的项目。", "");
      return;
    }
    try {
      localStorage.setItem("regionalCompanyResearch", JSON.stringify({
        query: latestResearch.query,
        researchedAt: latestResearch.researchedAt,
        fields: applied,
        sources: latestResearch.normalized.sources
      }));
    } catch (_) {}
    if (typeof window.saveCompanyProfile === "function") window.saveCompanyProfile();
    setStatus("已填入 " + applied.length + " 项候选资料并保存到本浏览器。请继续核对来源和企业原始材料。", "success");
  }

  function renderSavedSources() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem("regionalCompanyResearch") || "null");
    } catch (_) {}
    if (!saved || !Array.isArray(saved.fields) || !saved.fields.length) return;
    const preview = document.getElementById("companySearchPreview");
    if (!preview) return;
    const rows = saved.fields.map(function (item) {
      const link = safeUrl(item.sourceUrl);
      const source = link
        ? '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.sourceName || link) + ' ↗</a>'
        : '<em>来源链接不可用</em>';
      return '<li><strong>' + escapeHtml(item.label || FIELD_LABELS[item.id] || item.id) + '</strong>：' +
        escapeHtml(item.value) + '<br><span class="company-suggestion-source">来源：' + source +
        (item.evidence ? '<br>依据：' + escapeHtml(item.evidence) : "") + '</span></li>';
    }).join("");
    const when = saved.researchedAt ? new Date(saved.researchedAt).toLocaleString("zh-CN") : "时间待确认";
    preview.innerHTML = '<h4>最近一次资料检索 · ' + escapeHtml(saved.query || "") + '</h4>' +
      '<p>检索时间：' + escapeHtml(when) + '。以下为已填入字段的来源记录，可打开核对。</p>' +
      '<div class="company-search-sources"><ul>' + rows + '</ul></div>';
    preview.hidden = false;
  }

  function init() {
    if (!document.getElementById("cpName")) return;
    addStyles();
    insertSearchControls();
    insertPublicFields();
    if (typeof window.profileRead === "function") {
      const originalProfileRead = window.profileRead;
      window.profileRead = function () {
        const data = originalProfileRead();
        IDS.forEach(function (id) {
          const field = document.getElementById(id);
          if (field) data[id] = field.value;
        });
        return data;
      };
    }
    if (typeof window.loadCompanyProfile === "function") window.loadCompanyProfile();
    renderSavedSources();
    const saveButton = document.getElementById("saveCompany");
    if (saveButton && typeof window.saveCompanyProfile === "function") {
      saveButton.onclick = window.saveCompanyProfile;
    }
  }

  init();
})();
