namespace Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int UserId { get; set; } // Relación con User
        public User? User { get; set; } 
        public ICollection<Expense> Expenses { get; set; } = [];

    }

}
