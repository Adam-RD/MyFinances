namespace Api.DTOs
{
    public class IncomeResponseDto
    {
        public int Id { get; set; }
        public required string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
    }
}
