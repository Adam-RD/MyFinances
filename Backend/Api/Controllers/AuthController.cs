using Api.DTOs;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IConfiguration configuration, AppDbContext context, ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto userLogin)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest("Invalid request payload");
        }

        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == userLogin.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(userLogin.Password, user.PasswordHash))
            {
                _logger.LogWarning($"Failed login attempt for username: {userLogin.Username}");
                return Unauthorized("Login incorrecto");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred during login: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred. Please try again later.");
        }
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];

        if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
        {
            throw new InvalidOperationException("JWT configuration is invalid. Ensure that Jwt:Key, Jwt:Issuer, and Jwt:Audience are set in appsettings.json.");
        }

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim("userId", user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
