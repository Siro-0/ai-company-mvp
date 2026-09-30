import { onRequestPost } from "./functions/api/ai.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API
    if (url.pathname === "/api/ai") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            "Allow": "POST"
          }
        });
      }

      return onRequestPost({
        request,
        env
      });
    }

    // それ以外は index.html / app.js / style.css などを配信
    return env.ASSETS.fetch(request);
  }
};
