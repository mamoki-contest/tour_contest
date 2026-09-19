import { NavLink } from "react-router";

/**
 * 전역 하단 내비 — 이 제품의 크롬은 이것 하나뿐이다.
 *
 * `탐색 홈`과 `나만의 지도` 둘이 IA의 최상위이고, 나머지는 전부 그 아래다.
 * **모든 화면에서 살아 있다** — 상세와 시트 포함, 어디서든 두 최상위로 한 번에 돌아간다.
 *
 * 저장 개수 배지가 두 화면을 잇는 상시 연결이다 — 컬렉션이 보조 기능으로 묻히는 위험을
 * 이것이 막는다 (ADR-0005).
 */
export function BottomNav({ savedCount }: { savedCount: number }) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-grey-200 bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <NavItem to="/" label="탐색 홈" icon="🗺" />
      <NavItem to="/saved" label="나만의 지도" icon="★" badge={savedCount} />
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon,
  badge,
}: {
  to: string;
  label: string;
  icon: string;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "type-nav-label flex flex-1 flex-col items-center justify-center gap-0.5",
          isActive ? "text-primary-strong" : "text-grey-600",
        ].join(" ")
      }
    >
      <span aria-hidden="true" className="relative text-base leading-none">
        {icon}
        {badge !== undefined && badge > 0 ? (
          <span className="type-label-md absolute -top-2 -right-3 inline-flex min-w-5 items-center justify-center rounded-full bg-primary-strong px-1 text-[11px] leading-4 text-surface">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
      {badge !== undefined && badge > 0 ? <span className="sr-only">저장 {badge}곳</span> : null}
    </NavLink>
  );
}
