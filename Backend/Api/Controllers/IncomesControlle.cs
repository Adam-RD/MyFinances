using Api.Interfaces;
using Api.DTOs;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IncomesController : ControllerBase
    {
        private readonly IIncomeRepository _incomeRepository;

        public IncomesController(IIncomeRepository incomeRepository)
        {
            _incomeRepository = incomeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetIncomes()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var incomes = await _incomeRepository.GetIncomesByUserAsync(userId);
            var incomeDtos = incomes
                .OrderByDescending(income => income.Date)
                .Select(income => new IncomeResponseDto
                {
                    Id = income.Id,
                    Description = income.Description,
                    Amount = income.Amount,
                    Date = income.Date
                })
                .ToList();

            return Ok(incomeDtos);
        }
        [HttpGet("summary")]
        public async Task<IActionResult> GetIncomeSummary()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var totalIncomes = await _incomeRepository.GetTotalIncomesByUserAsync(userId);
            var totalExpenses = await _incomeRepository.GetTotalExpensesByUserAsync(userId); 
            var weeklyIncomes = await _incomeRepository.GetWeeklyIncomesByUserAsync(userId);
            var monthlyIncomes = await _incomeRepository.GetMonthlyIncomesByUserAsync(userId);
            var yearlyIncomes = await _incomeRepository.GetYearlyIncomesByUserAsync(userId);
            var balance = totalIncomes - totalExpenses;

            var summary = new IncomeSummaryDto
            {
                TotalIncomes = totalIncomes,
                TotalExpenses = totalExpenses, 
                WeeklyIncomes = weeklyIncomes.Sum(i => i.Amount),
                MonthlyIncomes = monthlyIncomes.Sum(i => i.Amount),
                YearlyIncomes = yearlyIncomes.Sum(i => i.Amount),
                Balance = balance 
            };

            return Ok(summary);
        }



        [HttpPost]
        public async Task<IActionResult> AddIncome([FromBody] IncomeCreateDto incomeDto)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var income = new Income
            {
                Description = incomeDto.Description,
                Amount = incomeDto.Amount,
                Date = incomeDto.Date,
                UserId = userId
            };

            await _incomeRepository.AddIncomeAsync(income);
            return CreatedAtAction(nameof(GetIncomes), new { id = income.Id }, income);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIncome(int id)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);
            await _incomeRepository.DeleteIncomeAsync(id, userId);
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIncome(int id, [FromBody] IncomeCreateDto incomeDto)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

            var existingIncome = await _incomeRepository.GetIncomeByIdAsync(userId, id);
            if (existingIncome == null)
            {
                return NotFound("Income not found or does not belong to the user.");
            }

           
            existingIncome.Description = incomeDto.Description;
            existingIncome.Amount = incomeDto.Amount;
            existingIncome.Date = incomeDto.Date;

            await _incomeRepository.UpdateIncomeAsync(existingIncome);

            return NoContent();
        }


        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("UserId is missing in the token.");
            }

            var userId = int.Parse(userIdClaim);

           
            var totalIncomes = await _incomeRepository.GetTotalIncomesByUserAsync(userId);

            
            var totalExpenses = await _incomeRepository.GetTotalExpensesByUserAsync(userId); 

            var balance = totalIncomes - totalExpenses;

            
            return Ok(new
            {
                TotalIncomes = totalIncomes,
                TotalExpenses = totalExpenses,
                Balance = balance
            });
        }



    }
}
