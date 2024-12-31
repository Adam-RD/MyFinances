using Api.Interfaces;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repository
{
    public class IncomeRepository : IIncomeRepository
    {
        private readonly AppDbContext _context;

        public IncomeRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<decimal> GetBalanceByUserAsync(int userId)
        {
            var totalIncomes = await _context.Incomes
                .Where(i => i.UserId == userId)
                .SumAsync(i => (decimal?)i.Amount) ?? 0M;

            var totalExpenses = await _context.Expenses
                .Where(e => e.UserId == userId)
                .SumAsync(e => (decimal?)e.Amount) ?? 0M;

            return totalIncomes - totalExpenses;
        }

        public async Task<decimal> GetTotalExpensesByUserAsync(int userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId)
                .SumAsync(e => (decimal?)e.Amount) ?? 0M;
        }


        public async Task<IEnumerable<Income>> GetIncomesByUserAsync(int userId)
        {
            return await _context.Incomes
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.Date)
                .ToListAsync();
        }

        public async Task<Income?> GetIncomeByIdAsync(int userId, int incomeId)
        {
            return await _context.Incomes
                .FirstOrDefaultAsync(i => i.Id == incomeId && i.UserId == userId);
        }

        public async Task AddIncomeAsync(Income income)
        {
            await _context.Incomes.AddAsync(income);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateIncomeAsync(Income income)
        {
            _context.Incomes.Update(income);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteIncomeAsync(int incomeId, int userId)
        {
            var income = await GetIncomeByIdAsync(userId, incomeId);
            if (income == null)
            {
                throw new ArgumentException("Income not found or does not belong to the user.");
            }

            _context.Incomes.Remove(income);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<decimal> GetTotalIncomesByUserAsync(int userId)
        {
            return await _context.Incomes
                .Where(i => i.UserId == userId)
                .SumAsync(i => (decimal?)i.Amount) ?? 0M;
        }

        public async Task<IEnumerable<Income>> GetWeeklyIncomesByUserAsync(int userId)
        {
            var startDate = DateTime.UtcNow.AddDays(-7);
            return await _context.Incomes
                .Where(i => i.UserId == userId && i.Date >= startDate)
                .OrderByDescending(i => i.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Income>> GetMonthlyIncomesByUserAsync(int userId)
        {
            var startDate = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            return await _context.Incomes
                .Where(i => i.UserId == userId && i.Date >= startDate)
                .OrderByDescending(i => i.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Income>> GetYearlyIncomesByUserAsync(int userId)
        {
            var startDate = new DateTime(DateTime.UtcNow.Year, 1, 1);
            return await _context.Incomes
                .Where(i => i.UserId == userId && i.Date >= startDate)
                .OrderByDescending(i => i.Date)
                .ToListAsync();
        }
    }
}
