INSERT INTO users (
  name,
  email,
  password_hash
)
SELECT
  'Demo User',
  'demo@taskflow.local',
  'taskflowdemo:6c0cc1524a005939cb001637a09a6a2e6ee77849e66ed63eb4402310f0d93866d13d02ff7e8941b9010a0b69b862607497645da81a142e80e59919f655b49493'
WHERE NOT EXISTS (
  SELECT 1
  FROM users
  WHERE email = 'demo@taskflow.local'
);

INSERT INTO workflow_statuses (
  user_id,
  slug,
  label,
  color,
  category,
  system,
  position
)
SELECT
  demo_user.id,
  status.slug,
  status.label,
  status.color,
  status.category,
  true,
  status.position
FROM (
  SELECT id
  FROM users
  WHERE email = 'demo@taskflow.local'
) AS demo_user
CROSS JOIN (
  VALUES
    ('todo', 'Todo', '#64748b', 'pending', 0),
    ('in-progress', 'In Progress', '#6366f1', 'active', 1),
    ('done', 'Done', '#22c55e', 'completed', 2)
) AS status(slug, label, color, category, position)
WHERE NOT EXISTS (
  SELECT 1
  FROM workflow_statuses existing_status
  WHERE existing_status.user_id = demo_user.id
    AND existing_status.slug = status.slug
);

INSERT INTO tasks (
  user_id,
  title,
  description,
  workflow_status_id,
  priority,
  due_date,
  position
)
SELECT
  demo_user.id,
  task_seed.title,
  task_seed.description,
  workflow_status.id,
  task_seed.priority,
  CURRENT_DATE + task_seed.days_until_due,
  task_seed.position
FROM (
  SELECT id
  FROM users
  WHERE email = 'demo@taskflow.local'
) AS demo_user
JOIN (
  VALUES
    ('Design UI', 'Create the first dashboard layout', 'todo', 'high', 1, 0),
    ('Setup Hasura', 'Connect Hasura to PostgreSQL', 'in-progress', 'medium', 2, 1),
    ('Connect frontend', 'Prepare the frontend to query Hasura', 'done', 'low', 3, 2)
) AS task_seed(title, description, status_slug, priority, days_until_due, position)
  ON TRUE
JOIN workflow_statuses workflow_status
  ON workflow_status.user_id = demo_user.id
 AND workflow_status.slug = task_seed.status_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM tasks existing_task
  WHERE existing_task.user_id = demo_user.id
    AND existing_task.title = task_seed.title
);

INSERT INTO task_tags (task_id, name)
SELECT
  seeded_task.id,
  tag_seed.name
FROM (
  SELECT id, title
  FROM tasks
  WHERE user_id = (
    SELECT id
    FROM users
    WHERE email = 'demo@taskflow.local'
  )
) AS seeded_task
JOIN (
  VALUES
    ('Design UI', 'design'),
    ('Design UI', 'frontend'),
    ('Setup Hasura', 'hasura'),
    ('Connect frontend', 'integration')
) AS tag_seed(task_title, name)
  ON tag_seed.task_title = seeded_task.title
WHERE NOT EXISTS (
  SELECT 1
  FROM task_tags existing_tag
  WHERE existing_tag.task_id = seeded_task.id
    AND existing_tag.name = tag_seed.name
);

INSERT INTO activities (user_id, task_id, message)
SELECT
  demo_user.id,
  seeded_task.id,
  activity_seed.message
FROM (
  SELECT id
  FROM users
  WHERE email = 'demo@taskflow.local'
) AS demo_user
JOIN (
  SELECT id, title
  FROM tasks
  WHERE user_id = (
    SELECT id
    FROM users
    WHERE email = 'demo@taskflow.local'
  )
) AS seeded_task
  ON TRUE
JOIN (
  VALUES
    ('Design UI', 'Task "Design UI" created'),
    ('Setup Hasura', 'Task "Setup Hasura" created')
) AS activity_seed(task_title, message)
  ON activity_seed.task_title = seeded_task.title
WHERE NOT EXISTS (
  SELECT 1
  FROM activities existing_activity
  WHERE existing_activity.user_id = demo_user.id
    AND existing_activity.task_id = seeded_task.id
    AND existing_activity.message = activity_seed.message
);
