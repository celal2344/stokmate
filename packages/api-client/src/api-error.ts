export class ApiError extends Error {
  public readonly status: number;
  public readonly body: string;

  public constructor(status: number, body: string) {
    super(body || `API request failed with status ${status}.`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function normalizeApiError(response: Response): Promise<ApiError> {
  return new ApiError(response.status, await response.text());
}
