import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteTask } from '../store/slices/taskSlice';
import { toast } from 'react-toastify';
import { PriorityLabels } from '../types';
import { format } from 'date-fns';

interface TaskListProps {
  onOpenForm: (taskId?: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onOpenForm }) => {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector((state) => state.tasks);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const VISIBLE_COUNT = 3;

  const handleDelete = (id: number) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        await dispatch(deleteTask(taskToDelete)).unwrap();
        toast.success('Task deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete task');
      }
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 3:
        return 'error';
      default:
        return 'default';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading && tasks.length === 0) {
    return <Typography>Loading tasks...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Tasks ({tasks.length})</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => onOpenForm()}
        >
          New Task
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} md={6} key={task.id}>
            <Card
              sx={{
                border: isOverdue(task.dueDate)
                  ? '2px solid #f44336'
                  : '2px solid transparent',
                boxShadow: 2,

                height: 240,
                width: 370,

                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 10,
                  transform: 'translateY(-4px)',
                  borderColor: isOverdue(task.dueDate) ? '#f44336' : 'primary.main',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Tooltip title={task.title} placement="top" arrow>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        maxWidth: '250px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'default'
                      }}
                    >
                      {task.title}
                    </Typography>
                  </Tooltip>

                  <Box
                    className="action-buttons"
                    sx={{
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onOpenForm(task.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        },
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(task.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'error.main',
                          color: 'error.contrastText',
                        },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {task.description && (
                  <Tooltip title={task.description} placement="top" arrow>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,

                        maxWidth: "320px",

                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,         // Limit to 2 lines
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "default"
                      }}
                    >
                      {task.description}
                    </Typography>
                  </Tooltip>
                )}

                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {task.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {task.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {task.telephone}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    color={isOverdue(task.dueDate) ? 'error' : 'text.primary'}
                  >
                    <strong>Due:</strong>{' '}
                    {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}
                    {isOverdue(task.dueDate) && ' (OVERDUE)'}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={PriorityLabels[task.priority]}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />

                  {/* Show only first VISIBLE_COUNT tags */}
                  {task.tags.slice(0, VISIBLE_COUNT).map((tag) => (
                    <Chip key={tag.id} label={tag.name} size="small" />
                  ))}

                  {/* If more than VISIBLE_COUNT, show +N chip with tooltip */}
                  {task.tags.length > VISIBLE_COUNT && (
                    <Tooltip
                      title={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ mb: 0.5, fontWeight: 600 }}
                          >
                            Other Tags:
                          </Typography>

                          {/* Tooltip shows ONLY hidden tags */}
                          {task.tags.slice(VISIBLE_COUNT).map((tag) => (
                            <Typography key={tag.id} variant="body2">
                              • {tag.name}
                            </Typography>
                          ))}
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Chip
                        label={`+${task.tags.length - VISIBLE_COUNT}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          cursor: "help",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {tasks.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No tasks yet. Create your first task!
          </Typography>
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;
