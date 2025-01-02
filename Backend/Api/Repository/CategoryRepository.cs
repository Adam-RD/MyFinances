using Api.Interfaces;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetCategoriesByUserAsync(int userId)
        {
            return await _context.Categories.Where(c => c.UserId == userId).ToListAsync();
        }

        public async Task AddCategoryAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
        }

        public async Task<Category> GetCategoryByIdAsync(int id, int userId)
        {
            return await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        }

        public async Task DeleteCategoryAsync(int id, int userId)
        {
            var category = await GetCategoryByIdAsync(id, userId);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Category> GetCategoryWithExpensesAsync(int categoryId, int userId)
        {
            return await _context.Categories
                .Include(c => c.Expenses)
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);
        }

        public async Task UpdateCategoryAsync(Category updatedCategory, int userId)
        {
            var category = await GetCategoryByIdAsync(updatedCategory.Id, userId);
            if (category != null)
            {
                category.Name = updatedCategory.Name;               
                _context.Categories.Update(category);
                await _context.SaveChangesAsync();
            }
        }
    }
}
