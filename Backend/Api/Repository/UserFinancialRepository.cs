namespace Api.Repository
{
    using Api.Interfaces;
    using Api.Models;
    using Microsoft.EntityFrameworkCore;

    public class UserFinancialRepository : IUserFinancialRepository
    {
        private readonly AppDbContext _context;

        public UserFinancialRepository(AppDbContext context)
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
    }

}
