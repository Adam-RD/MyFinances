namespace Api.DTOs
{
    public class ExpenseSummaryDto
    {
        public decimal TotalExpenses { get; set; }
        public decimal WeeklyExpenses { get; set; }
        public decimal MonthlyExpenses { get; set; }
        public decimal YearlyExpenses { get; set; }

        // Gastos agrupados por categoría
        public IEnumerable<ExpenseByCategoryDto> WeeklyExpensesByCategory { get; set; } = new List<ExpenseByCategoryDto>();
        public IEnumerable<ExpenseByCategoryDto> MonthlyExpensesByCategory { get; set; } = new List<ExpenseByCategoryDto>();
        public IEnumerable<ExpenseByCategoryDto> YearlyExpensesByCategory { get; set; } = new List<ExpenseByCategoryDto>();
        public IEnumerable<ExpenseByCategoryDto> ExpensesByCategory { get; set; } = new List<ExpenseByCategoryDto>();
    }
}


