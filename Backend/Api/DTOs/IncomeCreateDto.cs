namespace Api.DTOs
{
    public class IncomeCreateDto
    {
        public required string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
    }

}
