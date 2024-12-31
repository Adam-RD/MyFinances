namespace Api.Interfaces
{
    public interface IUserFinancialRepository
    {
        Task<decimal> GetBalanceByUserAsync(int userId);
    }

}
