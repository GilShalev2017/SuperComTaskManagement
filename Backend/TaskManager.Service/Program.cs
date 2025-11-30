using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;
using TaskManager.Data;
using TaskManager.Service;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)  // This will suppress EF Core logs
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)  // Specifically target DB commands
    .WriteTo.Console()
    .WriteTo.File("logs/taskmanager-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    var host = Host.CreateDefaultBuilder(args)
        .UseWindowsService(options =>
        {
            options.ServiceName = "Task Manager Reminder Service";
        })
        .UseSerilog()
        .ConfigureServices((hostContext, services) =>
        {
            services.AddDbContextFactory<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    hostContext.Configuration.GetConnectionString("DefaultConnection")));

            services.AddSingleton<TaskReminderService>();
            services.AddHostedService<Worker>();
        })
        .Build();

    await host.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}