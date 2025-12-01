-- Predefined Tag IDs
DECLARE @TagIds TABLE (TagId INT);
INSERT INTO @TagIds(TagId)
VALUES (1),(2),(3),(4),(5),(6),(7),(8);

DECLARE @TaskId INT;
DECLARE @NumTags INT;
DECLARE @RndTagId INT;

----------------------
-- Task 1
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Fix login bug',
 'Users occasionally receive a 500 error on login. Investigate log entries and correct authentication handling.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 3,
 'Gil Shalev', '054-555-1234', 'gil@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();

SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 2
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Add user profile page',
 'Develop a new page allowing users to update their personal information and notification settings.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 2,
 'Dana Cohen', '052-440-9922', 'dana@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();

SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 3
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Team meeting – Q1 roadmap',
 'Quarterly planning meeting to review development timelines, deliverables, and priorities.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 1,
 'Omer Levi', '053-777-8811', 'omer@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();

SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 4
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Implement password reset',
 'Create functionality for users to reset their passwords via email verification.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 2,
 'Leah Katz', '054-123-9988', 'leah@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 5
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Optimize database queries',
 'Analyze and optimize slow queries affecting dashboard load time.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 3,
 'Yonatan Bar', '052-333-4422', 'yonatan@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 6
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Design new dashboard UI',
 'Create wireframes and mockups for the upcoming dashboard redesign.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 2,
 'Maya Friedman', '053-555-6677', 'maya@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 7
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Integrate payment gateway',
 'Add support for Stripe and PayPal for online payments.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 3,
 'Eli Navon', '054-889-3344', 'eli@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 8
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Bugfix: notifications not sending',
 'Investigate why some email notifications are not delivered to users.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 1,
 'Shira Cohen', '052-221-3344', 'shira@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 9
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Set up logging and monitoring',
 'Implement centralized logging and alerting for server errors.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 2,
 'Amit Levi', '053-998-7766', 'amit@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 10
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Migrate server to new hosting',
 'Move application and database to the new hosting environment with zero downtime.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 3,
 'Noa Shalev', '054-777-2211', 'noa@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END

----------------------
-- Task 11
----------------------
INSERT INTO Tasks
(Title, Description, DueDate, Priority, FullName, Telephone, Email, CreatedAt, UpdatedAt)
VALUES
('Prepare release notes',
 'Compile and review release notes for the next software version.',
 DATEADD(DAY, CAST(RAND() * 14 AS INT), GETDATE()), 1,
 'Yair Ben-David', '052-666-8899', 'yair@example.com',
 SYSDATETIME(), SYSDATETIME());

SET @TaskId = SCOPE_IDENTITY();
SET @NumTags = 2 + CAST(RAND() * 4 AS INT);
WHILE @NumTags > 0
BEGIN
    SELECT TOP 1 @RndTagId = TagId FROM @TagIds ORDER BY NEWID();
    IF NOT EXISTS (SELECT 1 FROM TaskTags WHERE TaskId = @TaskId AND TagId = @RndTagId)
        INSERT INTO TaskTags(TaskId, TagId) VALUES (@TaskId, @RndTagId);
    SET @NumTags = @NumTags - 1;
END
