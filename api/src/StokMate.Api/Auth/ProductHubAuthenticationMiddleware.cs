using StokMate.Api.Hubs;

namespace StokMate.Api.Auth;

/// <summary>
/// Authenticates only product-hub transport requests. Browser WebSocket and
/// Server-Sent Events transports cannot always send an Authorization header,
/// so <c>access_token</c> is accepted solely beneath <see cref="ProductHub.Path"/>.
/// The token is intentionally never logged.
/// </summary>
public sealed class ProductHubAuthenticationMiddleware
{
    private readonly RequestDelegate _next;

    public ProductHubAuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments(ProductHub.Path))
        {
            await _next(context);
            return;
        }

        var authenticated = OpaqueAccessTokenAuthentication.TryAuthenticateHeader(context, out _)
            || OpaqueAccessTokenAuthentication.TryAuthenticate(
                context,
                context.Request.Query["access_token"].FirstOrDefault(),
                out _);

        if (!authenticated)
        {
            var unauthorized = BearerAuthAttribute.PlainTextUnauthorized();
            context.Response.StatusCode = unauthorized.StatusCode!.Value;
            context.Response.ContentType = unauthorized.ContentType;
            await context.Response.WriteAsync(unauthorized.Content!);
            return;
        }

        await _next(context);
    }
}
