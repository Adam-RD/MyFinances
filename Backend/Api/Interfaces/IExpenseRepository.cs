using Api.DTOs;
using Api.Models;

namespace Api.Interfaces
{
    public interface IExpenseRepository
    {
        Task<IEnumerable<Expense>> GetExpensesByUserAsync(int userId);
        Task AddExpenseAsync(Expense expense);
        Task<decimal> GetTotalExpensesByUserAsync(int userId);
        Task<IEnumerable<Expense>> GetWeeklyExpensesByUserAsync(int userId);
        Task<IEnumerable<Expense>> GetMonthlyExpensesByUserAsync(int userId);
        Task<IEnumerable<Expense>> GetYearlyExpensesByUserAsync(int userId);
        Task<IEnumerable<ExpenseByCategoryDto>> GetExpensesByCategoryAsync(int userId);
        Task DeleteExpenseAsync(int id, int userId);
    }

}

