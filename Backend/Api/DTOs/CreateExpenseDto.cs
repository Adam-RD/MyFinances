namespace Api.DTOs
{
    public class ExpenseCreateDto
    {
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int CategoryId { get; set; }
    }


}
