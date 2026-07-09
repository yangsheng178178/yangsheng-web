// Cloudflare Pages Function: /api/data
// GET  -> 讀取網站資料（給前台顯示用，公開）
// POST -> 儲存網站資料（後台用，需要密碼）
//
// 需要在 Cloudflare Pages 專案綁定:
//   KV namespace binding 名稱: YS_KV

const KEY = "site-data";

// GET /api/data —— 讀取資料
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const val = await env.YS_KV.get(KEY);
    if (val === null) {
      // 資料庫還沒有資料，回傳空物件（前台會用內建預設）
      return json({ ok: true, data: null });
    }
    return new Response(val, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}

// POST /api/data —— 儲存資料
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    if (typeof body.data === "undefined") {
      return json({ ok: false, error: "沒有資料" }, 400);
    }
    // 寫入 KV（存成字串）
    await env.YS_KV.put(KEY, JSON.stringify(body.data));
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}

// 處理 CORS 預檢
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
