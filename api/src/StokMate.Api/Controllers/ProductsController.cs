using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using StokMate.Api.Auth;
using StokMate.Api.Hubs;
using StokMate.Api.Models;
using StokMate.Api.Services;

namespace StokMate.Api.Controllers;

[ApiController]
[Route("products")]
[BearerAuth]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;
    private readonly IHubContext<ProductHub> _productHub;

    public ProductsController(ProductService productService, IHubContext<ProductHub> productHub)
    {
        _productService = productService;
        _productHub = productHub;
    }

    /// <summary>Filtrelenebilir, sıralanabilir ve sayfalanabilir ürün listesi.</summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetList([FromQuery] ProductQuery query)
        => await _productService.GetListAsync(query);

    /// <summary>Stok durumu özeti.</summary>
    [HttpGet("stats")]
    public async Task<ActionResult<ProductStatsDto>> GetStats()
        => await _productService.GetStatsAsync();

    /// <summary>Yeni eklenen: Ürünün tüm alanlarını detay olarak döndürür.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetDetail(int id)
        => await _productService.GetDetailAsync(id);

    /// <summary>Yeni ürün oluşturur.</summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductRequest request)
    {
        var product = await _productService.CreateAsync(request);
        await BroadcastProductChangedAsync(product.Id, ProductChangeTypes.Created, product.UpdatedAt);
        return StatusCode(StatusCodes.Status201Created, product);
    }

    /// <summary>Ürünün tüm alanlarını günceller.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpdateProductRequest request)
    {
        var product = await _productService.UpdateAsync(id, request);
        await BroadcastProductChangedAsync(product.Id, ProductChangeTypes.Updated, product.UpdatedAt);
        return product;
    }

    /// <summary>Yeni eklenen: Yalnızca verilen ürün alanlarını günceller.</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> UpdateFields(int id, [FromBody] UpdateProductFieldsRequest request)
    {
        var product = await _productService.UpdateFieldsAsync(id, request);
        await BroadcastProductChangedAsync(product.Id, ProductChangeTypes.Updated, product.UpdatedAt);
        return product;
    }

    /// <summary>Yalnızca stok miktarını günceller.</summary>
    [HttpPatch("{id:int}/stock")]
    public async Task<ActionResult<ProductDto>> UpdateStock(int id, [FromBody] UpdateStockRequest request)
    {
        var product = await _productService.UpdateStockAsync(id, request);
        await BroadcastProductChangedAsync(product.Id, ProductChangeTypes.StockUpdated, product.UpdatedAt);
        return product;
    }

    /// <summary>Ürünü siler.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _productService.DeleteAsync(id);
        await BroadcastProductChangedAsync(id, ProductChangeTypes.Deleted, DateTime.UtcNow);
        return NoContent();
    }

    private Task BroadcastProductChangedAsync(int productId, string changeType, DateTime updatedAt)
        => _productHub.Clients.All.SendAsync(
            ProductHub.ProductChangedEventName,
            new ProductChangeEvent(productId, changeType, updatedAt));
}
