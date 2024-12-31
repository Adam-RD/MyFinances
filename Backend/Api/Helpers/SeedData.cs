using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Helpers
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = new AppDbContext(serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>());

            // Verifica si ya hay datos en la base de datos
            if (context.Users.Any() || context.Categories.Any() || context.Expenses.Any())
            {
                return; // La base de datos ya tiene datos
            }

            // Crear usuarios
            var user1 = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123") // Contraseña cifrada
            };

            var user2 = new User
            {
                Username = "john_doe",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("securepassword")
            };

            await context.Users.AddRangeAsync(user1, user2);

            // Crear categorías para cada usuario
            var categoriesUser1 = new List<Category>
        {
            new Category { Name = "Food", User = user1 },
            new Category { Name = "Transport", User = user1 },
            new Category { Name = "Entertainment", User = user1 }
        };

            var categoriesUser2 = new List<Category>
        {
            new Category { Name = "Utilities", User = user2 },
            new Category { Name = "Groceries", User = user2 }
        };

            await context.Categories.AddRangeAsync(categoriesUser1);
            await context.Categories.AddRangeAsync(categoriesUser2);

            // Crear gastos para cada usuario
            var expensesUser1 = new List<Expense>
        {
            new Expense
            {
                Description = "Lunch at restaurant",
                Amount = 25.00m,
                Date = DateTime.Now.AddDays(-3),
                Category = categoriesUser1[0], // Food
                User = user1
            },
            new Expense
            {
                Description = "Taxi ride",
                Amount = 15.50m,
                Date = DateTime.Now.AddDays(-2),
                Category = categoriesUser1[1], // Transport
                User = user1
            }
        };

            var expensesUser2 = new List<Expense>
        {
            new Expense
            {
                Description = "Electricity bill",
                Amount = 100.00m,
                Date = DateTime.Now.AddDays(-10),
                Category = categoriesUser2[0], // Utilities
                User = user2
            },
            new Expense
            {
                Description = "Weekly groceries",
                Amount = 75.50m,
                Date = DateTime.Now.AddDays(-7),
                Category = categoriesUser2[1], // Groceries
                User = user2
            }
        };

            await context.Expenses.AddRangeAsync(expensesUser1);
            await context.Expenses.AddRangeAsync(expensesUser2);

            // Guardar los datos en la base de datos
            await context.SaveChangesAsync();
        }
    }

}
