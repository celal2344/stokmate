# StokMate Portfolio-Grade Delivery Plan

## 1. Architecture and Foundations

- Convert the repository into a pnpm/Turborepo workspace:
  - `apps/web`: Vite + React + TypeScript.
  - `apps/mobile`: Expo managed React Native + TypeScript.
  - `api`: existing .NET 8 API, wrapped with package-level Turbo scripts.
  - `packages/api-client`: generated API operations, TypeScript contracts, and Zod schemas.
  - `packages/domain`: pure shared formatters, validation, product enums, and query keys.
  - `packages/i18n`: Turkish and English resources.
  - Shared TypeScript/ESLint configuration packages.
- Keep UI components, navigation, token storage, server-address persistence, and platform lifecycle behavior inside their respective applications.
- Configure package-level `dev`, `build`, `lint`, `typecheck`, and contract-generation tasks. Root scripts only delegate through `turbo run`.
- Keep environment files application-specific:
  - Web: `VITE_API_BASE_URL=http://localhost:5080`.
  - Mobile: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5080`.
- Keep the entire case study local. Do not add cloud hosting, a hosted database, or remote caching.
- Preserve the supplied EF Core in-memory database behavior; data and sessions resetting after an API restart is an accepted case-study constraint.

## 2. Backend and Shared Contract

### Required API additions

- Add `GET /products/{id}` returning a complete `ProductDetailDto`:
  - Identity, SKU, barcode, image.
  - Category, brand, and supplier IDs/names.
  - Price and cost price in kuruş.
  - Stock, minimum stock, unit, status.
  - Description, featured state, created/updated timestamps.
- Add `PATCH /products/{id}` for the web-edit surface:
  - Optional `name`, `price`, `stock`, and `status`.
  - Reject an empty request.
  - Preserve all unrelated fields.
  - Apply existing validation rules and return the updated detail DTO.
- Keep the existing full `PUT` and stock-only `PATCH /products/{id}/stock` for compatibility.
- Retain last-write-wins behavior. Do not add versions, ETags, or conflict detection.
- Preserve plain-text API errors; clients normalize status and text into a shared `ApiError`.
- Do not add roles, persistent storage, ProblemDetails, product creation/deletion UI, or low-stock list filtering.
- Update Swagger, `api/API.md`, and the Turkish root README with every backend change.

### Core freshness behavior

- Deliver the required flows without depending on SignalR.
- While the web product list is open, refetch it every 30 seconds while the tab is visible.
- Refetch list/detail/statistics queries when the tab regains focus and after local mutations.
- Pause polling while the tab is hidden.

### Later portfolio phase: SignalR freshness

- Add SignalR only after authentication, list, detail, web editing, mobile stock updates, polling, and smoke checks are working.
- SignalR is portfolio polish and must not block the core case-study delivery.
- Add authenticated `/hubs/products`.
- Reuse the opaque access-token validator; accept the SignalR `access_token` query parameter during connection.
- Broadcast `productChanged` after create, update, stock update, and delete:
  - `productId`
  - `changeType`
  - `updatedAt`
- Web invalidates the matching TanStack Query detail/list/statistics caches.
- Reconnect automatically, refetch on recovery, and show connection state persistently in the web header.

### Generated shared client

- Treat C# DTOs and Swagger as the only contract source.
- Use Orval to generate committed TypeScript models, fetch operations, reusable Zod 4 schemas, and success-response validation inside `@stokmate/api-client`. Orval supports fetch and reusable Zod output from OpenAPI. [Orval documentation](https://orval.dev/docs/reference/configuration/output/)
- Provide a shared client factory accepting:
  - API base URL.
  - Platform-specific token-store adapter.
  - Unauthorized callback.
- Implement single-flight refresh-token rotation:
  - Attach the access token.
  - On `401`, allow one refresh operation across concurrent requests.
  - Replace both rotated tokens.
  - Retry the original request once.
  - Clear the session and redirect to login if refresh fails.
- Commit generated artifacts. CI regenerates them, builds both consumers, and fails if a diff remains.

## 3. Product Applications

### Web application

- Use React Router, TanStack Query, React Hook Form, Zod, Tailwind, shadcn/ui, and i18next.
- Routes:
  - `/login`
  - `/products`
  - `/products/:id`
- Persist the session until logout or refresh-token expiry.
- Product list:
  - Read-only KPI strip for total, low-stock, and out-of-stock counts.
  - Debounced server-side search across name, SKU, and barcode.
  - Category, brand, and status filters.
  - Server-side sorting by name, price, stock, or update time.
  - Numbered server-side pagination with page-size selection.
  - Synchronize search, filters, sort, page, and page size with URL query parameters.
  - Dense desktop/tablet table with product image, identity, classification, price, stock, status, and update time.
  - Poll every 30 seconds only while the tab is visible and refetch when focus returns.
- Product detail:
  - Dedicated route only.
  - Display the entire product record.
  - Explicit edit mode for name, price, stock, and status.
  - Convert localized TL input safely to integer kuruş.
  - On save, update the detail cache and invalidate list/statistics queries.
- Use shadcn Skeleton, Alert, Empty, Badge, Field, Pagination, Table, and toast patterns for loading, errors, empty states, forms, and feedback.
- Support desktop/tablet from 768px upward with graceful narrow fallback.
- Provide light, dark, and system themes.

### Mobile application

- Use Expo Router, NativeWind, app-specific native components, TanStack Query, SecureStore, i18next, Expo Camera, `expo-image`, and FlashList.
- Login:
  - Persist tokens in SecureStore.
  - Show an always-visible editable API URL.
  - Validate and save the server address locally.
  - Document emulator and physical-device addresses.
- Product list:
  - Debounced server-side search.
  - Category, brand, and status filter bottom sheet.
  - Active-filter chips and clear action.
  - Server-side pagination using a fixed page size and explicit "Load more" button.
  - Pull-to-refresh, loading footer, end-of-list, retry, and empty states.
  - Reset accumulated pages when search or filters change.
- Barcode scanner:
  - Launch from the search area.
  - Request camera permission with a manual-search fallback.
  - Query the existing `q` parameter using the barcode. The supplied API exposes `Product.Barcode`, returns it in `ProductDto`, and includes barcode in server-side `q` matching.
  - Compare exact barcode matches and open the detail screen.
  - Handle no match, ambiguous result, permission denial, and retry.
- Product detail:
  - Display the same complete record as web.
  - Emphasize current/minimum stock and the stock action.
  - Accept a non-negative integer representing the final physically counted stock.
  - Use the existing stock-only endpoint.
  - Update detail/list caches and invalidate related queries after success.
- Use FlashList with stable rows, memoized renderers, `expo-image` caching/recycling keys, request cancellation, and focus refetch.
- Support light, dark, and system themes.

### Localization and visual system

- Keep source code, identifiers, routes, and commit messages in English.
- Default UI language to Turkish, provide a persistent English switch, and use English fallback keys.
- Localize labels, validation, dates, statuses, units, currency, empty states, and errors.
- Use a minimal-neutral visual system with semantic tokens, clear density, accessible contrast, keyboard support on web, and native touch targets on mobile.

## 4. Validation, CI, Delivery, and Documentation

### Separate executable smoke checks

- Keep smoke checks outside production application code under `tests/smoke`.
- Use Node's built-in `fetch` rather than adding a large testing framework.
- Add an API smoke command that:
  - Logs in with the supplied test account.
  - Reads the paged product list and one product detail.
  - Exercises the focused product `PATCH` and restores the original values.
  - Exercises the stock-only update and restores the original stock.
  - Fails clearly on unexpected status codes or response shapes.
- Add a contract smoke command that exports Swagger, regenerates Orval/Zod artifacts, typechecks both clients, and fails when committed generated output is stale.
- These checks are intentionally narrow; UI unit/component suites remain deferred.

### CI validation

Pull requests and pushes run:

1. Restore/build the .NET API.
2. Start the API and download `/swagger/v1/swagger.json`.
3. Run the API smoke checks.
4. Regenerate Orval/Zod artifacts and run the contract smoke check.
5. Run lint, TypeScript checks, web build, and Expo export validation through Turborepo.
6. Build both API consumers against the newly generated contract.
7. Fail if committed generated files are stale.

After each implementation slice, review the diff against the case-study requirements, error paths, authentication behavior, cache invalidation, accessibility, and platform constraints. A successful build alone is not acceptance.

### Manual acceptance matrix

- Web: Chrome and Edge at desktop and tablet widths.
- Mobile: Android emulator and one physical Android device.
- Verify:
  - Valid/invalid login, persisted session, refresh rotation, logout, expired-session redirect.
  - Local API address changes and unreachable-server feedback.
  - Search, filters, sorting, pagination, URL restoration, loading/error/empty states.
  - Full detail rendering and web edits.
  - Kuruş/TL conversion and non-negative stock validation.
  - Mobile load-more, pull-to-refresh, scanner permission, exact match, and no-match flows.
  - Mobile stock update appearing on the open web list through polling/focus refetch within the defined freshness window.
  - After the core delivery is complete: SignalR invalidation, disconnect/reconnect status, and recovery refetch.
  - Turkish/English switching and light/dark/system themes.
  - API restart behavior: in-memory data and sessions reset.

### APK delivery

- Configure an EAS `preview` profile with internal distribution and Android APK output.
- Use EAS-managed signing credentials.
- Perform the required first interactive EAS setup once.
- Produce one signed APK manually with `eas build --platform android --profile preview`.
- Download the finished APK and share the EAS internal-distribution URL or upload the file to Drive/WeTransfer for delivery.
- Do not automate APK build or delivery in the initial scope. Reconsider automation only after all required work is complete and it is explicitly requested.
- Internal-distribution profiles generate installable APKs and can use EAS-managed credentials. [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/) and [APK configuration](https://docs.expo.dev/build-reference/apk/)

### Turkish README

The root README must contain:

- Prerequisites and exact API/web/mobile commands.
- Emulator, LAN-device, firewall, and Android cleartext-network instructions.
- Test credentials.
- APK/EAS/Drive/WeTransfer delivery link.
- In-memory reset limitation.
- Architecture and monorepo layout.
- Library choices and rationale.
- Backend additions and why the original API was insufficient.
- Swagger → Orval → Zod → shared-client contract workflow.
- Manual QA checklist.
- A decision log summarizing every grill answer and its rationale.
- Known limitations and explicitly deferred items.

## 5. Implementation and Commit Gates

Implement in small reviewable slices:

1. Monorepo/Turborepo and shared configuration.
2. Product detail and focused update API contracts.
3. Generated API/Zod client and shared domain/i18n packages.
4. Separate API and contract smoke checks.
5. Web authentication and product list with polling/focus freshness.
6. Web detail/edit, themes, and localization.
7. Mobile authentication, list, filters, pagination, and detail/stock.
8. Barcode scanning and mobile polish.
9. CI validation and cross-platform manual review.
10. Later portfolio phase: authenticated SignalR product events.
11. One manual EAS preview build.
12. Turkish README and delivery verification.

Before every commit:

- Ask for explicit approval to commit.
- Ask separately before any push or tag.
- Never combine unrelated slices into one commit.

Explicitly out of scope for this local case study: hosted API/web deployment and replacing the supplied in-memory database.

Deferred unless explicitly selected later: broad UI/unit test suites, concurrency control, structured backend errors, offline queues, create/delete UI, APK automation, screenshots, and demo video.
