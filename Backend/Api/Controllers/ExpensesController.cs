using Api.Interfaces;
using Api.DTOs;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
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

            var totalExpenses = await _expenseRepository.GetTotalExpensesByUserAsync(userId);
            var weeklyExpenses = await _expenseRepository.GetWeeklyExpensesByUserAsync(userId);
            var monthlyExpenses = await _expenseRepository.GetMonthlyExpensesByUserAsync(userId);
            var yearlyExpenses = await _expenseRepository.GetYearlyExpensesByUserAsync(userId);
            var expensesByCategory = await _expenseRepository.GetExpensesByCategoryAsync(userId);

            var summary = new ExpenseSummaryDto
            {
                TotalExpenses = totalExpenses,
                WeeklyExpenses = weeklyExpenses.Sum(e => e.Amount),
                MonthlyExpenses = monthlyExpenses.Sum(e => e.Amount),
                YearlyExpenses = yearlyExpenses.Sum(e => e.Amount),
                ExpensesByCategory = expensesByCategory
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
    }
}
