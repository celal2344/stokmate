# Implementation Status

## Completed gates

| Gate | Scope                                                           | Commit               |
| ---- | --------------------------------------------------------------- | -------------------- |
| 1    | Monorepo/Turborepo foundation                                   | `ec72b88`            |
| 2    | Product detail and focused product updates API                  | `ba0a6dc`            |
| 3    | Generated contract, shared client, domain, and i18n foundations | `9e90e0e`, `800337d` |
| 4    | Separate API and contract smoke checks                          | `b2fc5fc`            |

## Verified commands

- `dotnet build api/StokMate.sln --configuration Release`
- `pnpm smoke:api`
- `pnpm smoke:contract`
- Package and consumer TypeScript checks run by `pnpm smoke:contract`.

## Known limitations

- The supplied API uses an in-memory database; product data and sessions reset when it restarts.
- Web and mobile application features are not implemented yet.
- CI validation, SignalR product events, APK delivery, and the expanded Turkish README are deferred.
- API errors remain plain text and product updates retain last-write-wins behavior.
- Orval 8.26 runtime validation does not emit a reusable top-level Zod parser for the API's inline `CategoryDto[]` and `BrandDto[]` lookup responses. Their item schemas are generated, but the generated fetch operations do not parse the arrays. This remains a generator limitation until a small configuration-only solution is available.

## Next gates

- Gate 5: web authentication and product list with polling/focus freshness.
- Gate 7: mobile authentication, list, filters, pagination, and detail/stock.

## Gate 11 Android preview delivery

- EAS project: `@celal2344s-team/stokmate` (`a5776ae1-4196-4d25-8686-9ed8d1dfae35`).
- Successful preview build: `a62cc63a-6c47-4637-bb10-da5be0edfa97`.
- Internal installation URL: <https://expo.dev/accounts/celal2344s-team/projects/stokmate/builds/a62cc63a-6c47-4637-bb10-da5be0edfa97>
- Android package: `com.celal2344.stokmate`.
- Distribution/signing: internal APK signed with EAS-managed Android credentials. No keystore or signing secret is stored in the repository.
- The APK is a standalone production build and does not require Metro or a development server.

### Install and connect to a local API

1. Open the internal installation URL on an Android device and install the APK.
2. Start the API so it listens on the computer's LAN interface, not only `localhost`.
3. In the app, set the editable API URL to `http://<computer-lan-ip>:5080`.
4. Ensure the device and computer use the same network and allow port `5080` through the computer's firewall.

Physical-device product workflows, stock updates, persistence, and barcode scanning remain to be verified against the preview APK.
