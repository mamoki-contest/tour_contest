import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

/* Pretendard — DESIGN.md 확정 서체 (Toss Product Sans는 토스 전용이라 쓸 수 없다) */
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://cdn.jsdelivr.net" },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const message = notFound ? "찾는 화면이 없어요" : "화면을 불러오지 못했어요";
  const stack = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <main className="mx-auto min-h-dvh max-w-[1024px] px-gutter py-gutter">
      <div className="rounded-xl bg-red-surface p-5" role="alert">
        <h1 className="type-headline-md text-red-deep">{message}</h1>
      </div>
      <Link
        to="/"
        className="type-label-lg mt-6 inline-flex h-12 items-center rounded-md bg-primary-strong px-4 text-surface transition-colors duration-200 hover:bg-primary-deep"
      >
        탐색 홈으로
      </Link>
      {stack ? (
        <pre className="type-caption mt-6 w-full overflow-x-auto rounded-lg bg-grey-100 p-4 text-grey-700">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
