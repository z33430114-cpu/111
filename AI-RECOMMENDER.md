# AI Recommender API

这个仓库现在已经带了一套可公网部署的 CS2 搭配推荐接口。

## 启动

```powershell
$env:OPENAI_API_KEY="你的 key"
$env:OPENAI_RECOMMENDER_MODEL="gpt-5.5"
npm run start
```

如果没有设置 `OPENAI_API_KEY`，接口也能工作，但会退回到规则引擎，不会做 AI 重排。

## 接 Qwen 纯文本 API

如果你要接 `Qwen3.5-2B` 这类纯文本模型，推荐走 `custom` provider：

```powershell
$env:AI_PROVIDER="custom"
$env:AI_BASE_URL="https://your-provider.example/v1"
$env:AI_MODEL="Qwen3.5-2B"
$env:OPENAI_API_KEY="你的 key"
$env:AI_CUSTOM_RESPONSE_FORMAT="off"
npm run start
```

说明：

- 自定义 provider 优先尝试 `POST /chat/completions`
- 如果对方只支持传统文本补全，会自动回退到 `POST /completions`
- 即使模型只返回纯文本，服务端也会从文本里提取 JSON 结果
- 如果你的供应商本身支持 `response_format: { type: "json_object" }`，可以把 `AI_CUSTOM_RESPONSE_FORMAT` 留空或设为 `auto`

## 直接接 OpenRouter 免费模型

如果你只是想先把接口跑起来，最省事的是直接接 OpenRouter 免费路由：

```powershell
$env:AI_PROVIDER="custom"
$env:AI_BASE_URL="https://openrouter.ai/api/v1"
$env:AI_MODEL="openrouter/free"
$env:OPENAI_API_KEY="sk-or-..."
$env:AI_CUSTOM_RESPONSE_FORMAT="auto"
npm run start
```

说明：

- `openrouter/free` 会自动挑当前可用的免费模型
- OpenRouter API 是 OpenAI 兼容的，适合当前这个项目直接接
- 免费模型池会变化，如果后面你想固定某个免费 Qwen，再把 `AI_MODEL` 换成对应 slug 即可

## 路由

`POST /api/recommendations/compose`

请求体示例：

```json
{
  "budget": 20000,
  "color": "白色",
  "style": "白色 干净 高级",
  "weaponPreferences": ["AK", "M4A1-S", "USP-S"],
  "extraWeapons": [],
  "mustInclude": []
}
```

返回说明：

- `selected`：主推方案
- `alternatives`：备选方案，默认最多 2 套
- `engine.usedAI`：是否真的走了 OpenAI 重排
- `requiredSlots`：本次按预算生成的核心槽位

## 当前推荐逻辑

- `500 以下`：优先枪皮
- `500-2000`：优先刀，再补主枪和手枪
- `2000 以上`：优先手套、刀、AK、M4A1-S、M4A4、USP-S、Glock
- 默认追求高预算利用率，尽量逼近 `90%-100%`
- 白色主题下会额外抬高 `Printstream / Snow Leopard / King Snake / Damascus Steel / Vulcan / Inheritance / Stainless / Clear Polymer` 等白系关键词

## 公网部署建议

- 用 `Nginx` 或 `Caddy` 反代到 Node 服务
- 把 `OPENAI_API_KEY` 配到服务器环境变量
- 定时运行价格同步脚本，保证 `.data/market-prices.json` 新鲜
- 如果前端单独部署，当前接口已经支持基础 `CORS`

## 已知限制

- 现在 AI 负责候选方案重排和说明，不直接裸选商品
- 价格依赖本地快照，想更实时就要把价格同步频率拉高
- 当前主题识别先重点优化了白色系，其他色系可以继续补词典
