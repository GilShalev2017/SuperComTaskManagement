import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
// import {Grid} from '@mui/material/Grid2';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteTask } from '../store/slices/taskSlice';
import { toast } from 'react-toastify';
import { PriorityLabels } from '../types';
import { format, formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  onOpenForm: (taskId?: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onOpenForm }) => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.tasks);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [flippedTasks, setFlippedTasks] = useState<{ [key: number]: boolean }>({});
  const [now, setNow] = useState(new Date());
  const [backgroundOption, setBackgroundOption] = useState<number>(0);
  const VISIBLE_COUNT = 2;

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < now;

  const formatRemainingTime = (dueDate: string) => {
    const diffMs = Math.max(0, new Date(dueDate).getTime() - now.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);
    return `${days}d:${hours}h:${minutes}m:${seconds}s`;
  };

  const getCardBackground = () => {
    switch (backgroundOption) {
      case 0: return undefined;
      case 1: return 'linear-gradient(135deg, #f0f4ff 0%, #d9e2ff 100%)';
      case 2: return 'linear-gradient(145deg, #fff8e1 0%, #ffe0b2 100%)';
      case 3: return 'url(https://www.transparenttextures.com/patterns/diagonal-noise.png)';
      default: return undefined;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Tasks ({tasks.length})</Typography>
        <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
          <InputLabel>Card Background</InputLabel>
          <Select
            value={backgroundOption}
            label="Card Background"
            onChange={(e) => setBackgroundOption(Number(e.target.value))}
          >
            <MenuItem value={0}>No background</MenuItem>
            <MenuItem value={1}>Blue Gradient</MenuItem>
            <MenuItem value={2}>Orange Gradient</MenuItem>
            <MenuItem value={3}>Pattern</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => onOpenForm()}>New Task</Button>
      </Box>

      <Grid container spacing={2}>
        {tasks.map((task) => {
          const totalMs = new Date(task.dueDate).getTime() - new Date(task.createdAt).getTime();
          const remainingMs = Math.max(0, new Date(task.dueDate).getTime() - now.getTime());
          const remainingPercent = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
          const overdue = isOverdue(task.dueDate);
          let animationColor = 'green';
          if (remainingMs < 24 * 60 * 60 * 1000 && !overdue) animationColor = 'gold';

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
              <Box sx={{ perspective: "1000px", width: 370, height: 240 }}>
                <Box sx={{ position: "relative", width: "100%", height: "100%", transition: "transform 0.6s", transformStyle: "preserve-3d", transform: flippedTasks[task.id] ? "rotateY(180deg)" : "none" }}>
                  <Card sx={{ position: "absolute", width: "100%", height: "100%", borderRadius: 2, backfaceVisibility: "hidden", border: overdue ? '2px solid #f44336' : '2px solid transparent', boxShadow: 2, cursor: 'pointer', transition: 'all 0.3s ease-in-out', background: getCardBackground(), '&:hover': { boxShadow: 10, transform: 'translateY(-4px)', borderColor: overdue ? '#f44336' : 'primary.main' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Tooltip title={task.title} placement="top" arrow>
                          <Typography variant="h6" component="div" sx={{ maxWidth: '230px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'default' }}>{task.title}</Typography>
                        </Tooltip>
                        <Box sx={{ opacity: 0.7, transition: 'opacity 0.2s ease-in-out' }}>
                          <IconButton size="small" onClick={() => onOpenForm(task.id)} sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' } }} aria-label="Edit"><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(task.id)} sx={{ '&:hover': { backgroundColor: 'error.main', color: 'error.contrastText' } }} aria-label="Delete"><Delete /></IconButton>
                          <IconButton size="small" onClick={() => setFlippedTasks(prev => ({ ...prev, [task.id]: true }))}><FlipToBackIcon fontSize="small" /></IconButton>
                        </Box>
                      </Box>
                      {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, maxWidth: "320px", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden", textOverflow: "ellipsis", cursor: "default" }}>{task.description}</Typography>
                      )}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2"><strong>Contact:</strong> {task.fullName}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {task.email}</Typography>
                        <Typography variant="body2"><strong>Phone:</strong> {task.telephone}</Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color={overdue ? 'error' : 'text.primary'}><strong>Due:</strong> {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}{overdue && ' (OVERDUE)'}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip label={PriorityLabels[task.priority]} color={getPriorityColor(task.priority)} size="small" />
                        {task.tags.slice(0, VISIBLE_COUNT).map((tag) => (<Chip key={tag.id} label={tag.name} size="small" />))}
                        {task.tags.length > VISIBLE_COUNT && (
                          <Tooltip title={<Box><Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>Other Tags:</Typography>{task.tags.slice(VISIBLE_COUNT).map(tag => (<Typography key={tag.id} variant="body2">• {tag.name}</Typography>))}</Box>} arrow placement="top">
                            <Chip label={`+${task.tags.length - VISIBLE_COUNT}`} size="small" variant="outlined" sx={{ cursor: "help", "&:hover": { backgroundColor: "action.hover" } }} />
                          </Tooltip>
                        )}
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ position: "absolute", width: "100%", height: "100%", borderRadius: 2, backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", p: 2, boxShadow: 2, background: getCardBackground() }}>
                    <IconButton size="small" onClick={() => setFlippedTasks(prev => ({ ...prev, [task.id]: false }))} sx={{ position: "absolute", top: 4, right: 4 }}>
                      <FlipToFrontIcon fontSize="small" />
                    </IconButton>
                    {overdue ? (
                      <>
                        <Typography variant="h6" sx={{ mb: 1, color: 'error' }}>Overdue</Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: 'error' }}>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</Typography>
                        <Box sx={{ width: 40, height: 60, backgroundColor: 'red', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <HourglassFullIcon sx={{ color: 'white' }} />
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ mb: 1 }}>Time Remaining</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>{formatRemainingTime(task.dueDate)}</Typography>
                        <Box sx={{ width: 20, height: 60, backgroundColor: '#f0f0f0', borderRadius: 1, overflow: 'hidden' }}>
                          <Box sx={{ width: '100%', height: `${remainingPercent}%`, backgroundColor: animationColor, transition: 'height 1s linear' }} />
                        </Box>
                      </>
                    )}
                  </Card>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {tasks.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">No tasks yet. Create your first task!</Typography>
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this task?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;
