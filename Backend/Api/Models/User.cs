namespace Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }
        public ICollection<Expense> Expenses { get; set; } = [];
        public ICollection<Income> Incomes { get; set; } = [];
        public ICollection<Category> Categories { get; set; } = [];

       
        public decimal Balance => Incomes.Sum(income => income.Amount) - Expenses.Sum(expense => expense.Amount);
    }
}
