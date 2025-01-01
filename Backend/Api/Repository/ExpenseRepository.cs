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
                .Include(e => e.Category)
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

        public async Task<IEnumerable<Expense>> GetExpensesByUserAndDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId && e.Date >= startDate && e.Date <= endDate)
                .Include(e => e.Category) 
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseByCategoryDto>> GetExpensesByCategoryAsync(int userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId)
                .Include(e => e.Category)
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
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (expense != null)
            {
                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateExpenseAsync(Expense expense)
        {
            var existingExpense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == expense.Id && e.UserId == expense.UserId);

            if (existingExpense == null)
            {
                throw new KeyNotFoundException("El gasto no existe o no pertenece al usuario.");
            }

            existingExpense.Amount = expense.Amount;
            existingExpense.Description = expense.Description;
            existingExpense.CategoryId = expense.CategoryId;
            existingExpense.Date = expense.Date;

            _context.Expenses.Update(existingExpense);
            await _context.SaveChangesAsync();
        }
    }
}
