# Welcome to React Router!

> **배포하러 왔다면 [`DEPLOY.md`](./DEPLOY.md) 를 보세요.** 이 README 는 React Router
> 템플릿이 준 글이라 이 프로젝트의 배포 방식(Vercel · 환경 변수 · 카카오 도메인 등록 ·
> 로컬과 같은지 확인하는 체크리스트)이 들어 있지 않습니다.

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

> **이 절은 템플릿의 일반 안내입니다.** 이 프로젝트를 실제로 올리는 절차는
> [`DEPLOY.md`](./DEPLOY.md) 에 있습니다 — Vercel 이 정본이고, 아래 Docker 는 대안입니다.

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

## 환경 변수

`.env.example`를 `.env`로 복사해 채운다.

| 이름 | 설명 |
|---|---|
| `API_BASE_URL` | 한사나다 백엔드(`/api/v1/**`) 주소. 서버 로더에서만 읽는다 |
| `KAKAO_MAP_APP_KEY` | 카카오맵 JavaScript 키. 비우면 지도 없이 목록만으로 탐색한다 |

외부 관광 API 키는 프론트엔드에 두지 않는다. 브라우저는 한사나다 백엔드만 호출한다.
