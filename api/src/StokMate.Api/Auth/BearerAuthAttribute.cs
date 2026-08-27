using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace StokMate.Api.Auth;

/// <summary>
/// "Authorization: Bearer &lt;token&gt;" header validation for controller actions.
/// Validated user IDs are stored on the current <see cref="HttpContext"/>.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class BearerAuthAttribute : Attribute, IAuthorizationFilter
{
    internal const string UserIdItemKey = "UserId";

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        if (!OpaqueAccessTokenAuthentication.TryAuthenticateHeader(context.HttpContext, out _))
        {
            context.Result = PlainTextUnauthorized();
        }
    }

    /// <summary>Returns the API's existing plain-text 401 response.</summary>
    internal static ContentResult PlainTextUnauthorized() => new()
    {
        StatusCode = StatusCodes.Status401Unauthorized,
        ContentType = "text/plain; charset=utf-8",
        Content = "Yetkilendirme başlığı eksik, hatalı veya erişim anahtarı geçersiz."
    };
}

/// <summary>
/// Shared opaque-access-token validation for HTTP controllers and the SignalR
/// product hub. Supplied tokens are intentionally never logged.
/// </summary>
public static class OpaqueAccessTokenAuthentication
{
    private const string Scheme = "Bearer ";

    public static bool TryAuthenticateHeader(HttpContext context, out int userId)
    {
        var header = context.Request.Headers.Authorization.ToString();
        var token = header.StartsWith(Scheme, StringComparison.OrdinalIgnoreCase)
            ? header[Scheme.Length..].Trim()
            : null;

        return TryAuthenticate(context, token, out userId);
    }

    public static bool TryAuthenticate(HttpContext context, string? token, out int userId)
    {
        userId = default;
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        var tokenService = context.RequestServices.GetRequiredService<TokenService>();
        var validatedUserId = tokenService.Validate(token);
        if (validatedUserId is null)
        {
            return false;
        }

        userId = validatedUserId.Value;
        context.Items[BearerAuthAttribute.UserIdItemKey] = userId;
        return true;
    }
}

public static class BearerAuthExtensions
{
    /// <summary>Returns the user ID validated by <see cref="BearerAuthAttribute"/>.</summary>
    public static int GetUserId(this HttpContext context)
        => (int)context.Items[BearerAuthAttribute.UserIdItemKey]!;
}
