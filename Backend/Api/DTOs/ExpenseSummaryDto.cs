namespace Api.DTOs
{
    public class ExpenseSummaryDto
    {
        public decimal TotalExpenses { get; set; }
        public decimal WeeklyExpenses { get; set; }
        public decimal MonthlyExpenses { get; set; }
        public decimal YearlyExpenses { get; set; }
        public IEnumerable<ExpenseByCategoryDto> ExpensesByCategory { get; set; } = [];

    }
}

