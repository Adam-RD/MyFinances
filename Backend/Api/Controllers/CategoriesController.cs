using Api.DTOs;
using Api.Interfaces;
using Api.Models;
using Api.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _repository;

        public CategoriesController(ICategoryRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);
            var categories = await _repository.GetCategoriesByUserAsync(userId);
            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> AddCategory([FromBody] CategoryCreateDto categoryDto)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var category = new Category
            {
                Name = categoryDto.Name,
                UserId = userId
            };

            await _repository.AddCategoryAsync(category);
            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            // Verificar si la categoría tiene gastos asociados
            var category = await _repository.GetCategoryWithExpensesAsync(id, userId);
            if (category == null)
            {
                return NotFound("Categoría no encontrada.");
            }

            if (category.Expenses.Any())
            {
                return BadRequest("No se puede eliminar esta categoría porque está asociada a uno o más gastos.");
            }

            await _repository.DeleteCategoryAsync(id, userId);
            return NoContent();
        }

    }
}
