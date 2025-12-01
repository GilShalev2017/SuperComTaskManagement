using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Serilog;
using Serilog.Events;
using TaskManager.API.Validators;
using TaskManager.Core.DTOs;
using TaskManager.Data;
using TaskManager.Data.UnitOfWork;


var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)  // Suppress EF Core logs
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)  // Specifically target DB commands
    .WriteTo.Console()
    .WriteTo.File("logs/taskmanager-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger/OpenAPI
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Task Manager API",
        Version = "v1",
        Description = "Full-stack task management application API",
        Contact = new OpenApiContact
        {
            Name = "Task Manager",
            Email = "support@taskmanager.com"
        }
    });
});


// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Validators
builder.Services.AddScoped<IValidator<CreateTaskDto>, CreateTaskDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateTaskDto>, UpdateTaskDtoValidator>();
builder.Services.AddScoped<IValidator<CreateTagDto>, CreateTagDtoValidator>();

// CORS
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowReactApp",
//        policy =>
//        {
//            policy.WithOrigins(
//                    "http://localhost:3000",
//                    "https://localhost:3000"
//                  )
//                  .AllowAnyHeader()
//                  .AllowAnyMethod();
//        });
//});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Manager API v1");
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "Task Manager API Documentation";
    });
}

//app.UseHttpsRedirection();
//app.UseCors("AllowReactApp");
app.UseCors("AllowAll");

// Global error handling middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An unhandled exception occurred");
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { message = "An error occurred processing your request" });
    }
});

app.UseAuthorization();
app.MapControllers();

// Apply migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.Migrate();
        Log.Information("Database migration completed successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while migrating the database");
    }
}

// Custom server listening log
var urls = builder.Configuration["ASPNETCORE_URLS"]
    ?? builder.WebHost.GetSetting(WebHostDefaults.ServerUrlsKey)
    ?? "https://localhost:7001;http://localhost:7000";

Log.Information("===================================================");
Log.Information("Task Manager API is now listening on: {Urls}", urls);
Log.Information("Environment: {Environment}", app.Environment.EnvironmentName);
Log.Information("Swagger UI available at: {SwaggerUrl}/swagger", urls.Split(';')[0]);
Log.Information("===================================================");

app.Run();