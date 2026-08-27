using Microsoft.AspNetCore.SignalR;

namespace StokMate.Api.Hubs;

/// <summary>
/// Read-only product-change event channel. Clients cannot mutate products
/// through this hub; all changes continue to use the existing HTTP API.
/// </summary>
public sealed class ProductHub : Hub
{
    public const string Path = "/hubs/products";
    public const string ProductChangedEventName = "productChanged";
}
