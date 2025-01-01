using Api.DTOs;
using Api.Models;

namespace Api.Interfaces
{
    public interface IExpenseRepository
    {       
        Task<IEnumerable<Expense>> GetExpensesByUserAsync(int userId);
   
        Task AddExpenseAsync(Expense expense);

       
        Task<decimal> GetTotalExpensesByUserAsync(int userId);

        Task<IEnumerable<Expense>> GetExpensesByUserAndDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
               
        Task<IEnumerable<ExpenseByCategoryDto>> GetExpensesByCategoryAsync(int userId);

        Task UpdateExpenseAsync(Expense expense);

       
        Task DeleteExpenseAsync(int id, int userId);
    }
}
