# DeepSeek Harness 检索服务

工作台部署在 GitHub Pages，是静态网页，不能安全保存 DeepSeek 模型密钥，也不能在浏览器中启动 Harness SDK。此目录提供一个独立的服务端桥接程序：网页只提交企业名称，服务端调用 DeepSeek Harness SDK 的网页检索能力，并返回带来源链接的候选字段。

## 服务接口

- `POST /api/company-search`
- 请求头：`Authorization: Bearer <工作台服务令牌>`
- 请求体：`{"company_name":"企业全称"}`
- 返回：`companyName`、`fields`、`sources` 的 JSON 对象

页面的“联网检索”配置填写完整接口地址和工作台服务令牌。DeepSeek API 密钥只放在服务端环境变量 `DEEPSEEK_API_KEY` 中，不要放进网页、仓库或聊天内容。

## 部署

服务需部署在可从浏览器访问的 HTTPS 地址，并配置：

- `DEEPSEEK_API_KEY`：服务端调用 DeepSeek Harness 的模型凭证。
- `WORKBENCH_API_TOKEN`：至少 32 个字符的随机令牌；每个使用者在网页中自行填写。
- `ALLOWED_ORIGINS`：允许访问的网页源，例如 `https://cedar1128-yyqx.github.io`；本机预览按实际来源另行设置。
- 可选 `DSH_MODEL`：默认 `deepseek-v4-flash`。

在服务器的环境变量/密钥管理功能中设置密钥，不要把真实密钥写入 `.env` 提交或 Docker 镜像。安装与本地运行：

```sh
python -m pip install -r requirements.txt
uvicorn company_search:app --host 127.0.0.1 --port 8787
```

上面的本地地址只用于服务器自身检查；GitHub Pages 需要连接 HTTPS 公网域名，建议由受信任的反向代理终止 TLS 并限制服务访问。也可以使用随附 Dockerfile 部署。

## 检索边界

SDK 使用 `sdk-minimal` profile，并用 `company-research.patch.yml` 关闭文件、终端和本地工作目录工具，仅挂载 `web_search` / `web_fetch`。每个请求用临时 Harness Home 和空工作目录；请求完成后清理。会话日志上传已关闭。每次仅向服务端发送企业名称，财务、税务、申报和落地资料不会从工作台发出。

搜索返回的资料只是公开网页候选项。页面逐字段显示来源并要求使用者勾选确认；登记信息、资质、收入、深圳主体资格和资金测算仍需按政府原文及企业材料核验。
