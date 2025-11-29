using Microsoft.EntityFrameworkCore;
using Serilog;
using TaskManager.Data;
using TaskManager.Service;

Log.Logger = new LoggerConfiguration()
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