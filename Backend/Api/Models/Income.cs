namespace Api.Models
{
    public class Income
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;

        // Relación con el usuario
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
