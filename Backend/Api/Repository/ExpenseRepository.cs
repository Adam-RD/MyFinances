using Api.DTOs;
using Api.Interfaces;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repository
{
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly AppDbContext _context;

        public ExpenseRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Expense>> GetExpensesByUserAsync(int userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId)
                .Include(e => e.Category) // Opcional: incluye la categoría asociada
                .ToListAsync();
        }

        public async Task AddExpenseAsync(Expense expense)
        {
            await _context.Expenses.AddAsync(expense);
            await _context.SaveChangesAsync();
        }

        public async Task<decimal> GetTotalExpensesByUserAsync(int userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId)
                .SumAsync(e => e.Amount);
        }

        public async Task<IEnumerable<Expense>> GetWeeklyExpensesByUserAsync(int userId)
        {
            var startDate = DateTime.Now.AddDays(-7);
            return await _context.Expenses
                .Where(e => e.UserId == userId && e.Date >= startDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Expense>> GetMonthlyExpensesByUserAsync(int userId)
        {
            var startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            return await _context.Expenses
                .Where(e => e.UserId == userId && e.Date >= startDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Expense>> GetYearlyExpensesByUserAsync(int userId)
        {
            var startDate = new DateTime(DateTime.Now.Year, 1, 1);
            return await _context.Expenses
                .Where(e => e.UserId == userId && e.Date >= startDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseByCategoryDto>> GetExpensesByCategoryAsync(int userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId)
                .GroupBy(e => e.Category.Name)
                .Select(group => new ExpenseByCategoryDto
                {
                    CategoryName = group.Key,
                    TotalAmount = group.Sum(e => e.Amount)
                })
                .ToListAsync();
        }


        public async Task DeleteExpenseAsync(int id, int userId)
        {
            var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
            if (expense != null)
            {
                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();
            }
        }
    }
}
