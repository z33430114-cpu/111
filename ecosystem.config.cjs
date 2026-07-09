module.exports = {
  apps: [
    {
      name: "cs2-skin-atlas",
      script: "scripts/serve.mjs",
      cwd: __dirname,
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 4173,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
        OPENAI_RECOMMENDER_MODEL: process.env.OPENAI_RECOMMENDER_MODEL || "gpt-5.5"
      }
    }
  ]
};
