import { NextResponse, type NextRequest } from "next/server";

/**
 * /admin/* と /admin/edit/* に対する Basic Auth 保護.
 *
 * 動作:
 *   - NODE_ENV !== "production": 認証スキップ (dev / preview build で煩雑にならない)
 *   - 本番環境 (Vercel deployment): Authorization ヘッダで Basic Auth 検証
 *   - 認証情報: 環境変数 ADMIN_BASIC_AUTH_USER / ADMIN_BASIC_AUTH_PASS
 *
 * Phase 4 本格認証 (Supabase Auth) ができたら middleware を置き換える想定.
 *
 * 注意:
 *   - filesystem 書込が本番では不可能なので、編集 UI は「開けるが保存できない」状態
 *   - 認証で守るのは "誰でも編集画面を見られる" 状態の回避
 */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/* のみ対象 (matcher でも絞っているが二重防御)
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // 本番以外は何もしない (dev / preview build の障害にしたくない)
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_BASIC_AUTH_USER;
  const pass = process.env.ADMIN_BASIC_AUTH_PASS;

  // 環境変数未設定 = 設定漏れの可能性。安全側に倒して 503 を返す
  if (!user || !pass) {
    return new NextResponse(
      "Admin auth env vars (ADMIN_BASIC_AUTH_USER / ADMIN_BASIC_AUTH_PASS) are not configured.",
      { status: 503 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);
        const colonIdx = decoded.indexOf(":");
        if (colonIdx >= 0) {
          const providedUser = decoded.slice(0, colonIdx);
          const providedPass = decoded.slice(colonIdx + 1);
          if (providedUser === user && providedPass === pass) {
            return NextResponse.next();
          }
        }
      } catch {
        // base64 decode 失敗は認証失敗扱い
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Carbomir Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
