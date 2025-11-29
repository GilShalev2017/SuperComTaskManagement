namespace TaskManager.Service;
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IConfiguration _configuration;
    private readonly TaskReminderService _reminderService;

    public Worker(
        ILogger<Worker> logger,
        IConfiguration configuration,
        TaskReminderService reminderService)
    {
        _logger = logger;
        _configuration = configuration;
        _reminderService = reminderService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Task Reminder Service started at: {time}", DateTimeOffset.Now);

        // Start the consumer in a separate task
        _ = Task.Run(() => _reminderService.StartConsumer(stoppingToken), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Checking for overdue tasks at: {time}", DateTimeOffset.Now);
                await _reminderService.CheckAndPublishOverdueTasks();

                // Wait for 1 minute before checking again
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking overdue tasks");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Task Reminder Service stopping at: {time}", DateTimeOffset.Now);
        _reminderService.Dispose();
        await base.StopAsync(cancellationToken);
    }
}
