using Api.Models;

namespace Api.Interfaces
{
    public interface IIncomeRepository
    {
        Task<IEnumerable<Income>> GetIncomesByUserAsync(int userId);
        Task<decimal> GetTotalIncomesByUserAsync(int userId);
        Task<IEnumerable<Income>> GetWeeklyIncomesByUserAsync(int userId);
        Task<IEnumerable<Income>> GetMonthlyIncomesByUserAsync(int userId);
        Task<IEnumerable<Income>> GetYearlyIncomesByUserAsync(int userId);
        Task AddIncomeAsync(Income income);
        Task UpdateIncomeAsync(Income income);
        Task<Income?> GetIncomeByIdAsync(int userId, int incomeId);

        Task DeleteIncomeAsync(int incomeId, int userId);
        Task<decimal> GetBalanceByUserAsync(int userId);
        Task<decimal> GetTotalExpensesByUserAsync(int userId);

    }


}
