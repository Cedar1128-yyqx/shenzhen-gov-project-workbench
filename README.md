# 深圳政企项目工作台

面向深圳政府部门对接、企业项目落地和政策申报的通用工作台。企业档案由使用者录入，支持不同企业分别使用；页面包含政策库、申报测算、项目协同、会议纪要、拜访 Brief 和跟进周报。

## 在线访问

主线公开版：[打开工作台](https://cedar1128-yyqx.github.io/shenzhen-gov-project-workbench/)。功能分支 `feat/company-web-enrichment` 用于预览检索功能，尚未合并。

## 企业公开资料检索

企业档案中的联网检索通过 `POST /api/company-search` 调用独立的 Harness 服务。前端只提交企业名称；DeepSeek Harness SDK、网页搜索工具和模型凭证都在服务端运行。服务部署文件位于 `harness-service/`。

GitHub Pages 是静态网页，不能安全保存 DeepSeek API Key，也不能直接启动 Harness SDK。使用前需将 `harness-service` 部署到启用 HTTPS 的服务，并配置 `DEEPSEEK_API_KEY`、工作台访问令牌和允许的网页来源。网页设置中只填写服务地址和工作台访问令牌；令牌仅保存在当前标签页会话。

检索结果逐字段显示公开来源，由使用者勾选后才写入企业档案。研发、销售、税务、资质、深圳申报主体和落地计划不会从互联网推断。服务端只接收企业名称，不会收到企业档案中的财务或项目数据。

## 服务端部署

参阅 [`harness-service/README.md`](harness-service/README.md)。服务使用官方 Python SDK；SDK 与模型凭证配置说明见 [DeepSeek Harness Python SDK 文档](https://deepseek-harness.github.io/deepseek-harness/en/guide/python-sdk)。

## 当前版本说明

工作台的数据保存在当前浏览器本地。政策条目仍需按政府原文、申报指南、预算和受理时间逐项核验。没有填写企业和项目资料前，系统不会给出企业可获资金结论。