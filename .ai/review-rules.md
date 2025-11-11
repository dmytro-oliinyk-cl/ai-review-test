CQ-1.01 Single Responsibility Everywhere — Each component/hook/module has one clear purpose; do not mix UI, business logic, and API.
CQ-1.02 Predictability & Determinism — No hidden side effects, shared mutable state, random timers, or non-determinism.
CQ-1.03 Explicit over Implicit — Declare dependencies/contexts explicitly; avoid “magic” sources of data.
CQ-1.04 Separation of Concerns — UI separate from logic/state/API; components should not know data origins.
CQ-1.05 Observability & Logging — No raw console.log in production; use structured logger.
CQ-1.06 Minimal Global State — Use global state only when strictly necessary; prefer local/server state.

CQ-2.01 Shared Modules Isolation — `/shared` (or `/common`) must not import from features or rely on feature internals.
CQ-2.02 Consistent Naming (Features/Folders) — Folders use lowercase kebab-case; predictable structure.
CQ-2.03 Absolute Import Paths — Use configured aliases (e.g., `@/shared`, `@/features`); avoid deep relative paths.
CQ-2.04 No Cross-Feature Coupling — Do not import internal files of another feature; extract shared logic into `/shared`.

CQ-3.01 Folders use kebab-case — All folder names are lowercase with hyphens.
CQ-3.02 Components/Hooks Naming — Components use PascalCase; custom hooks use `useCamelCase`.
CQ-3.03 Real Constants in UPPER*SNAKE_CASE — Only for global/config constants; local `const` variables remain `camelCase`.
CQ-3.04 Functions/Variables in camelCase — Follow standard JS naming.
CQ-3.05 Boolean Flags Descriptive & Positive — e.g., `isReady`, `hasError` (avoid double negatives).
CQ-3.06 Enums/Dictionaries PascalCase — Singular concept (e.g., `UserRole.Admin`).
CQ-3.07 File Name = Exported Entity — File name matches the main export.
CQ-3.08 Avoid Abbreviations/Acronyms — Prefer clear, expanded names over `usrCfg`, `cfg`.
CQ-3.09 No Meaningless Suffixes/Prefixes — Avoid `component*`, `_helper`, `util_`noise.
CQ-3.10 Tests Mirror Source —`Button.spec.js`colocated with`Button.jsx`.
CQ-3.11 Singular Folder for Single Feature — Use singular when it’s one module.
CQ-3.12 CSS/SCSS Modules Match Component — `UserCard.module.scss`↔`UserCard.jsx`.
CQ-3.13 Context/Provider Naming Consistency — `UserContext`, `UserProvider`, `useUserContext`.

CQ-4.01 Single Responsibility per Component — One well-defined responsibility per component.
CQ-4.02 Custom Hooks for Shared Logic — Extract repeated logic into `use*` hooks.
CQ-4.03 Complete Effect Dependencies — `useEffect` must list all dependencies; do not suppress lints.
CQ-4.05 Proper Keys in Lists — Use stable unique keys; never array index when order can change.
CQ-4.06 Clear Conditional Rendering — Avoid nested ternaries/long logical chains in JSX.
CQ-4.07 Memoization & Performance — Use memoization only when it measurably helps; avoid stale closures.
CQ-4.08 No Business Logic in JSX — Compute before `return()`; JSX describes structure only.
CQ-4.09 Avoid Heavy Components (>200 lines) — Split large components into smaller parts.
CQ-4.10 Consistent Event Handlers — Start with `handle*`; keep handlers short; move complexity to helpers/hooks.
CQ-4.11 No Inline Functions in Hot Loops — Avoid creating functions inside `.map()` of large/active lists.
CQ-4.12 Use Suspense & Lazy Loading — Load heavy modules via `React.lazy` within `<Suspense>`.
CQ-4.13 Avoid Mixing UI & Business Logic — Keep transforms/effects/validation out of JSX.

CQ-5.01 Local State First — Use `useState`/`useReducer` if state belongs to the component.
CQ-5.02 Server State via React Query — API data is managed by React Query (not `useState`).
CQ-5.03 Derived State in Selectors — Do not store what can be computed.
CQ-5.04 Avoid Prop Drilling Beyond Two Levels — Use context or a custom hook.
CQ-5.05 Keep State Immutable — No in-place mutations; create copies/functional updates.
CQ-5.06 Avoid Redundant State — Do not duplicate the source of truth.
CQ-5.07 Reset State on Unmount — Cleanup timers/forms/etc. in cleanup.
