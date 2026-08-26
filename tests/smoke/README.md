# Smoke checks

These executable checks use Node's built-in `fetch` and require a running local API.

```bash
pnpm smoke:api
pnpm smoke:contract
```

`STOKMATE_API_BASE_URL` overrides `http://localhost:5080`. API smoke also accepts
`STOKMATE_TEST_EMAIL` and `STOKMATE_TEST_PASSWORD`. Its local defaults are the
intentionally public case-study account documented in `api/README.md`:
`test@ornek.com` / `Test1234!`.

The API smoke check updates one seeded product through both PATCH endpoints and
restores its original name, price, stock, and status before it exits. The contract
smoke check downloads Swagger, regenerates the committed Orval/Zod artifacts, runs
the shared-package and consumer typechecks, and fails if those artifacts were stale
before or after generation.
