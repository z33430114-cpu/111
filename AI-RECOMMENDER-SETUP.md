# AI Recommendation Improvements

## What changed

The recommender now supports two layers:

1. Image-based color labels generated offline into `.data/skin-color-index.json`.
2. A lightweight text-understanding AI provider for parsing simple Chinese or English requests.

The site can still run without either layer. If the color index is missing, the backend falls back to existing catalog fields. If the AI provider fails, the rule parser still handles common requests such as budget, color, style, guns-only, knife/glove inclusion, and wear preferences.

## Generate image color labels

Install Pillow once:

```powershell
py -m pip install pillow
```

Run a small test batch first:

```powershell
npm run colors:classify -- --limit 50
```

Run the full classifier when the test looks good:

```powershell
npm run colors:classify
```

Output:

```text
.data/skin-color-index.json
```

The script caches downloaded images in `.data/color-image-cache`, so later runs are incremental.

## Deploy a simple AI parser

The backend already supports `rules`, `ollama`, `openai`, and `custom` providers. For OpenRouter or any OpenAI-compatible API, use:

```env
AI_PROVIDER=custom
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openrouter/free
OPENAI_API_KEY=sk-or-...
AI_CUSTOM_RESPONSE_FORMAT=auto
```

For local Ollama, use:

```env
AI_PROVIDER=ollama
AI_BASE_URL=http://127.0.0.1:11434
AI_MODEL=qwen2.5:7b
```

The AI is only used to turn user text into structured requirements. Skin selection still happens in the backend rule engine so prices, budget, color index, exclusions, and weapon slots stay deterministic.

## Example requests

```text
预算500，白色干净，只要枪皮，不要刀手套
预算2000，红黑，带一把AK和M4A1-S，尽量吃满预算
3000以内，蓝白，低调一点，不要太花
```
