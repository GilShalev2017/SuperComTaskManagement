SELECT 
    t.Id,
    t.Title,
    t.Description,
    t.DueDate,
    t.Priority,
    t.FullName,
    t.Email,
    t.Telephone,
    COUNT(tt.TagId) AS TagCount,
    STRING_AGG(tag.Name, ', ') AS TagNames
FROM 
    Tasks t
INNER JOIN 
    TaskTags tt ON t.Id = tt.TaskId
INNER JOIN 
    Tags tag ON tt.TagId = tag.Id
GROUP BY 
    t.Id, t.Title, t.Description, t.DueDate, t.Priority, 
    t.FullName, t.Email, t.Telephone
HAVING 
    COUNT(tt.TagId) >= 2
ORDER BY 
    TagCount DESC, t.Title ASC;