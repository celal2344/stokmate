const baseUrl = (process.env.STOKMATE_API_BASE_URL ?? "http://localhost:5080").replace(/\/$/, "");
const email = process.env.STOKMATE_TEST_EMAIL ?? "test@ornek.com";
const password = process.env.STOKMATE_TEST_PASSWORD ?? "Test1234!";

class SmokeCheckError extends Error {
  constructor(message) {
    super(message);
    this.name = "SmokeCheckError";
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new SmokeCheckError(message);
  }
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function responseText(response) {
  try {
    return await response.text();
  } catch {
    return "<response body could not be read>";
  }
}

async function expectJson(response, expectedStatus, context) {
  if (response.status !== expectedStatus) {
    throw new SmokeCheckError(
      `${context}: expected HTTP ${expectedStatus}, received ${response.status}: ${await responseText(response)}`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new SmokeCheckError(`${context}: expected a JSON response body.`);
  }
}

function assertProductDetail(value, context) {
  assert(isRecord(value), `${context}: expected an object response.`);
  assert(Number.isInteger(value.id), `${context}: expected integer product id.`);
  assert(typeof value.name === "string", `${context}: expected product name.`);
  assert(Number.isInteger(value.price), `${context}: expected integer price in kuruş.`);
  assert(Number.isInteger(value.stock), `${context}: expected integer stock.`);
  assert(Number.isInteger(value.status), `${context}: expected integer status.`);
}

function assertProductList(value) {
  assert(isRecord(value), "Product list: expected an object response.");
  assert(Array.isArray(value.items) && value.items.length > 0, "Product list: expected at least one product.");
  assert(Number.isInteger(value.items[0]?.id), "Product list: expected an integer product id.");
}

function alternateStatus(status) {
  return status === 1 ? 2 : 1;
}

function assertEqual(actual, expected, context) {
  assert(Object.is(actual, expected), `${context}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
}

async function main() {
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password })
  }).catch((error) => {
    throw new SmokeCheckError(`Login request to ${baseUrl} failed: ${error.message}`);
  });
  const login = await expectJson(loginResponse, 200, "Login");
  assert(isRecord(login) && typeof login.accessToken === "string" && login.accessToken.length > 0, "Login: response lacks accessToken.");

  const headers = {
    authorization: `Bearer ${login.accessToken}`,
    "content-type": "application/json"
  };
  const request = (path, init = {}) => fetch(`${baseUrl}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const list = await expectJson(await request("/products?Page=1&PageSize=1"), 200, "Product list");
  assertProductList(list);

  const productId = list.items[0].id;
  let original;
  let primaryError;
  let restorationError;

  try {
    original = await expectJson(await request(`/products/${productId}`), 200, "Product detail");
    assertProductDetail(original, "Product detail");

    const update = {
      name: `${original.name} [smoke]`,
      price: original.price + 1,
      stock: original.stock + 1,
      status: alternateStatus(original.status)
    };
    const focusedPatch = await expectJson(
      await request(`/products/${productId}`, { method: "PATCH", body: JSON.stringify(update) }),
      200,
      "Focused product PATCH"
    );
    assertProductDetail(focusedPatch, "Focused product PATCH");

    for (const [field, expected] of Object.entries(update)) {
      assertEqual(focusedPatch[field], expected, `Focused product PATCH ${field}`);
    }

    for (const field of [
      "id", "sku", "barcode", "imageUrl", "categoryId", "categoryName", "brandId", "brandName",
      "supplierId", "supplierName", "costPrice", "minStock", "unit", "description", "isFeatured", "createdAt"
    ]) {
      assertEqual(focusedPatch[field], original[field], `Focused product PATCH preserved ${field}`);
    }

    const stockAfterPatch = update.stock + 1;
    const stockPatch = await expectJson(
      await request(`/products/${productId}/stock`, { method: "PATCH", body: JSON.stringify({ stock: stockAfterPatch }) }),
      200,
      "Stock-only PATCH"
    );
    assert(isRecord(stockPatch) && Number.isInteger(stockPatch.stock), "Stock-only PATCH: expected product response with stock.");
    assertEqual(stockPatch.stock, stockAfterPatch, "Stock-only PATCH stock");
  } catch (error) {
    primaryError = error;
  } finally {
    if (original) {
      try {
        const restored = await expectJson(
          await request(`/products/${productId}`, {
            method: "PATCH",
            body: JSON.stringify({
              name: original.name,
              price: original.price,
              stock: original.stock,
              status: original.status
            })
          }),
          200,
          "Product restoration"
        );
        assertProductDetail(restored, "Product restoration");
        for (const field of ["name", "price", "stock", "status"]) {
          assertEqual(restored[field], original[field], `Product restoration ${field}`);
        }
      } catch (error) {
        restorationError = error;
      }
    }
  }

  if (restorationError) {
    const primaryMessage = primaryError ? ` Original smoke failure: ${primaryError.message}` : "";
    throw new SmokeCheckError(`Product restoration failed: ${restorationError.message}.${primaryMessage}`);
  }
  if (primaryError) {
    throw primaryError;
  }

  console.log(`API smoke passed for product ${productId}; all modified fields were restored.`);
}

main().catch((error) => {
  console.error(`API smoke failed: ${error.message}`);
  process.exitCode = 1;
});
