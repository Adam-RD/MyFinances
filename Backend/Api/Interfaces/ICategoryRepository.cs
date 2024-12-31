using Api.Models;

namespace Api.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetCategoriesByUserAsync(int userId);
        Task AddCategoryAsync(Category category);
        Task<Category> GetCategoryWithExpensesAsync(int categoryId, int userId);
        Task DeleteCategoryAsync(int categoryId, int userId);
    }
}