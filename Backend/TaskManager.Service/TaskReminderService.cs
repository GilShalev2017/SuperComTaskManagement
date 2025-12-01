using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using TaskManager.Data;

namespace TaskManager.Service
{
    public class TaskReminderService : IDisposable
    {
        private readonly ILogger<TaskReminderService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IDbContextFactory<ApplicationDbContext> _contextFactory;
        private IConnection? _connection;
        private RabbitMQ.Client.IModel? _channel;
        private readonly string _queueName;
        private readonly HashSet<int> _processedTasks = new();

        public TaskReminderService(
            ILogger<TaskReminderService> logger,
            IConfiguration configuration,
            IDbContextFactory<ApplicationDbContext> contextFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _contextFactory = contextFactory;
            _queueName = configuration["RabbitMQ:QueueName"] ?? "task-reminders";
            InitializeRabbitMQ();
        }

        private void InitializeRabbitMQ()
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _configuration["RabbitMQ:HostName"] ?? "localhost",
                    Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672"),
                    UserName = _configuration["RabbitMQ:UserName"] ?? "guest",
                    Password = _configuration["RabbitMQ:Password"] ?? "guest",
                    DispatchConsumersAsync = true
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                // Declare queue with durability
                _channel.QueueDeclare(
                    queue: _queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null);

                // Set QoS for concurrent processing
                _channel.BasicQos(prefetchSize: 0, prefetchCount: 10, global: false);

                _logger.LogInformation("RabbitMQ connection established successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize RabbitMQ connection");
                throw;
            }
        }
        public async Task CheckAndPublishOverdueTasks()
        {
            try
            {
                await using var context = await _contextFactory.CreateDbContextAsync();

                // FIX: Use local time instead of UTC
                var now = DateTime.Now;  

                var overdueTasks = await context.Tasks
                    .Include(t => t.TaskTags)
                    .ThenInclude(tt => tt.Tag)
                    .Where(t => t.DueDate < now && !_processedTasks.Contains(t.Id))
                    .ToListAsync();

                _logger.LogInformation($"Found {overdueTasks.Count} overdue tasks at {now:yyyy-MM-dd HH:mm:ss}");

                foreach (var task in overdueTasks)
                {
                    PublishTaskReminder(task);
                    _processedTasks.Add(task.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking and publishing overdue tasks");
            }
        }
        private void PublishTaskReminder(Core.Models.Task task)
        {
            try
            {
                var message = new TaskReminderMessage
                {
                    TaskId = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    DueDate = task.DueDate,
                    FullName = task.FullName,
                    Email = task.Email,
                    Telephone = task.Telephone,
                    Priority = task.Priority,
                    Tags = task.TaskTags.Select(tt => tt.Tag.Name).ToList(),
                    PublishedAt = DateTime.Now
                };

                var json = JsonSerializer.Serialize(message);
                var body = Encoding.UTF8.GetBytes(json);

                var properties = _channel!.CreateBasicProperties();
                properties.Persistent = true;
                properties.ContentType = "application/json";

                _channel.BasicPublish(
                    exchange: "",
                    routingKey: _queueName,
                    basicProperties: properties,
                    body: body);

                _logger.LogInformation($"Published reminder for task {task.Id}: {task.Title}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error publishing reminder for task {task.Id}");
            }
        }

        public void StartConsumer(CancellationToken cancellationToken)
        {
            try
            {
                var consumer = new AsyncEventingBasicConsumer(_channel!);

                consumer.Received += async (model, ea) =>
                {
                    try
                    {
                        var body = ea.Body.ToArray();
                        var json = Encoding.UTF8.GetString(body);
                        var message = JsonSerializer.Deserialize<TaskReminderMessage>(json);

                        if (message != null)
                        {
                            // Log the reminder
                            _logger.LogInformation(
                                $"REMINDER: Hi, your Task is due - Task ID: {message.TaskId}, " +
                                $"Title: '{message.Title}', " +
                                $"Assigned to: {message.FullName}, " +
                                $"Due Date: {message.DueDate:yyyy-MM-dd HH:mm}, " +
                                $"Priority: {GetPriorityName(message.Priority)}, " +
                                $"Tags: {string.Join(", ", message.Tags)}");

                            // Acknowledge the message
                            _channel!.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing reminder message");

                        // Reject and requeue the message
                        _channel!.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                    }

                    await Task.CompletedTask;
                };

                _channel.BasicConsume(
                    queue: _queueName,
                    autoAck: false,
                    consumer: consumer);

                _logger.LogInformation("Started consuming task reminder messages");

                // Keep the consumer running
                while (!cancellationToken.IsCancellationRequested)
                {
                    Thread.Sleep(1000);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in consumer");
            }
        }

        private static string GetPriorityName(int priority)
        {
            return priority switch
            {
                1 => "Low",
                2 => "Medium",
                3 => "High",
                _ => "Unknown"
            };
        }

        public void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            _logger.LogInformation("RabbitMQ connection closed");
        }
    }

    public class TaskReminderMessage
    {
        public int TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty;
        public int Priority { get; set; }
        public List<string> Tags { get; set; } = new();
        public DateTime PublishedAt { get; set; }
    }
}