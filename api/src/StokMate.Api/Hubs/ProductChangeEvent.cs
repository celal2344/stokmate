namespace StokMate.Api.Hubs;

/// <summary>Stable product-change event payload sent by <see cref="ProductHub"/>.</summary>
public sealed record ProductChangeEvent(int ProductId, string ChangeType, DateTime UpdatedAt);

/// <summary>Documented values for <see cref="ProductChangeEvent.ChangeType"/>.</summary>
public static class ProductChangeTypes
{
    public const string Created = "created";
    public const string Updated = "updated";
    public const string StockUpdated = "stockUpdated";
    public const string Deleted = "deleted";
}
