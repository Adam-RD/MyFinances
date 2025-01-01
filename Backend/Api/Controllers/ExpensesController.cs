using Api.Interfaces;
using Api.DTOs;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseRepository _expenseRepository;

        public ExpensesController(IExpenseRepository expenseRepository)
        {
            _expenseRepository = expenseRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetExpenses()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var expenses = await _expenseRepository.GetExpensesByUserAsync(userId);
            var expenseDtos = expenses
                .OrderByDescending(expense => expense.Date)
                .Select(expense => new ExpenseResponseDto
                {
                    Id = expense.Id,
                    Description = expense.Description,
                    Amount = expense.Amount,
                    Date = expense.Date,
                    CategoryName = expense.Category?.Name
                })
                .ToList();

            return Ok(expenseDtos);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetExpenseSummary()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var startOfYear = new DateTime(DateTime.UtcNow.Year, 1, 1);

            var totalExpenses = await _expenseRepository.GetTotalExpensesByUserAsync(userId);
            var weeklyExpenses = await _expenseRepository.GetExpensesByUserAndDateRangeAsync(userId, sevenDaysAgo, DateTime.UtcNow);
            var monthlyExpenses = await _expenseRepository.GetExpensesByUserAndDateRangeAsync(userId, startOfMonth, DateTime.UtcNow);
            var yearlyExpenses = await _expenseRepository.GetExpensesByUserAndDateRangeAsync(userId, startOfYear, DateTime.UtcNow);

            var summary = new ExpenseSummaryDto
            {
                TotalExpenses = totalExpenses,
                WeeklyExpenses = weeklyExpenses.Sum(e => e.Amount),
                MonthlyExpenses = monthlyExpenses.Sum(e => e.Amount),
                YearlyExpenses = yearlyExpenses.Sum(e => e.Amount),
                WeeklyExpensesByCategory = weeklyExpenses
                    .GroupBy(e => e.Category.Name)
                    .Select(group => new ExpenseByCategoryDto
                    {
                        CategoryName = group.Key,
                        TotalAmount = group.Sum(e => e.Amount)
                    }),
                MonthlyExpensesByCategory = monthlyExpenses
                    .GroupBy(e => e.Category.Name)
                    .Select(group => new ExpenseByCategoryDto
                    {
                        CategoryName = group.Key,
                        TotalAmount = group.Sum(e => e.Amount)
                    }),
                YearlyExpensesByCategory = yearlyExpenses
                    .GroupBy(e => e.Category.Name)
                    .Select(group => new ExpenseByCategoryDto
                    {
                        CategoryName = group.Key,
                        TotalAmount = group.Sum(e => e.Amount)
                    }),
                ExpensesByCategory = await _expenseRepository.GetExpensesByCategoryAsync(userId)
            };

            return Ok(summary);
        }

        [HttpPost]
        public async Task<IActionResult> AddExpense([FromBody] ExpenseCreateDto expenseDto)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var expense = new Expense
            {
                Description = expenseDto.Description,
                Amount = expenseDto.Amount,
                Date = expenseDto.Date,
                CategoryId = expenseDto.CategoryId,
                UserId = userId
            };

            await _expenseRepository.AddExpenseAsync(expense);
            return CreatedAtAction(nameof(GetExpenses), new { id = expense.Id }, expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] ExpenseCreateDto expenseDto)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var expense = new Expense
            {
                Id = id,
                Description = expenseDto.Description,
                Amount = expenseDto.Amount,
                Date = expenseDto.Date,
                CategoryId = expenseDto.CategoryId,
                UserId = userId
            };

            try
            {
                await _expenseRepository.UpdateExpenseAsync(expense);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);
            await _expenseRepository.DeleteExpenseAsync(id, userId);
            return NoContent();
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetExpensesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            if (startDate > endDate)
            {
                return BadRequest("La fecha inicial no puede ser mayor que la fecha final.");
            }

            var expenses = await _expenseRepository.GetExpensesByUserAndDateRangeAsync(userId, startDate, endDate);
            var expenseDtos = expenses
                .OrderByDescending(expense => expense.Date)
                .Select(expense => new ExpenseResponseDto
                {
                    Id = expense.Id,
                    Description = expense.Description,
                    Amount = expense.Amount,
                    Date = expense.Date,
                    CategoryName = expense.Category?.Name
                })
                .ToList();

            return Ok(expenseDtos);
        }

        [HttpGet("categories-summary")]
        public async Task<IActionResult> GetExpensesByCategoriesSummary()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var expensesByCategory = await _expenseRepository.GetExpensesByCategoryAsync(userId);

            return Ok(expensesByCategory);
        }

    }
}
