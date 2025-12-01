import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  ToggleButtonGroup,
  ToggleButton,
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
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  TablePagination
} from '@mui/material';

import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import TableChartTwoToneIcon from '@mui/icons-material/TableChartTwoTone';

import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

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
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "dueDate",
    direction: "asc"
  });

  const requestSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.fullName.toLowerCase().includes(query) ||
      task.email.toLowerCase().includes(query) ||
      task.telephone.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.name.toLowerCase().includes(query))
    );
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aVal = a[sortConfig.key as keyof typeof a];
    const bVal = b[sortConfig.key as keyof typeof b];

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginated tasks for table view
  const paginatedTasks = sortedTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const VISIBLE_COUNT = 2;

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset to first page when search query changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">Tasks ({filteredTasks.length}{searchQuery && ` of ${tasks.length}`})</Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <ToggleButtonGroup
             color="primary"
            value={viewMode}
            exclusive
            onChange={(e, newView) => {
              if (newView !== null) setViewMode(newView);
            }}
            size="small"
          >
            <ToggleButton
              value="cards"
              >
              <DashboardTwoToneIcon /> Cards View
            </ToggleButton>

            <ToggleButton
              value="table"
              >
              <TableChartTwoToneIcon />Table View
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 180, marginRight: 10 }}>
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

          <Button variant="contained" startIcon={<Add />} onClick={() => onOpenForm()}>
            New Task
          </Button>
        </Box>
      </Box>

      {viewMode === "table" && (
        <Paper sx={{ width: '100%', mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => requestSort("title")} sx={{ cursor: "pointer", fontWeight: 'bold' }}>
                    Task Name {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </TableCell>
                  <TableCell onClick={() => requestSort("dueDate")} sx={{ cursor: "pointer", fontWeight: 'bold' }}>
                    Due Date {sortConfig.key === "dueDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </TableCell>
                  <TableCell onClick={() => requestSort("priority")} sx={{ cursor: "pointer", fontWeight: 'bold' }}>
                    Priority {sortConfig.key === "priority" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </TableCell>
                  <TableCell sx={{ cursor: "pointer", fontWeight: 'bold' }}
                    onClick={() => requestSort("status")}
                  >
                    Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedTasks.map(task => {
                  const overdue = isOverdue(task.dueDate);

                  return (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">{task.title}</Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {task.description.substring(0, 50)}{task.description.length > 50 && "..."}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(task.dueDate), "MMM dd, yyyy HH:mm")}
                        {overdue && <Chip label="Overdue" color="error" size="small" sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={PriorityLabels[task.priority]}
                          color={getPriorityColor(task.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{overdue ? "Overdue" : "On Track"}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => onOpenForm(task.id)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {sortedTasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery ? `No tasks found matching "${searchQuery}"` : "No tasks yet"}
                </Typography>
              </Box>
            )}
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={sortedTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      
      {viewMode === "cards" && (
        <Grid container spacing={2}>
          {sortedTasks.map((task) => {
            const totalMs = new Date(task.dueDate).getTime() - new Date(task.createdAt).getTime();
            const remainingMs = Math.max(0, new Date(task.dueDate).getTime() - now.getTime());
            const remainingPercent = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
            const overdue = isOverdue(task.dueDate);

            let animationColor = 'green';
            if (remainingMs < 24 * 60 * 60 * 1000 && !overdue) animationColor = 'gold';

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
                <Box sx={{ perspective: "1000px", width: 370, height: 240 }}>
                  <Box sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    transition: "transform 0.6s",
                    transformStyle: "preserve-3d",
                    transform: flippedTasks[task.id] ? "rotateY(180deg)" : "none"
                  }}>
                    
                    <Card sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      borderRadius: 2,
                      backfaceVisibility: "hidden",
                      border: overdue ? '2px solid #f44336' : '2px solid transparent',
                      boxShadow: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      background: getCardBackground(),
                      '&:hover': {
                        boxShadow: 10,
                        transform: 'translateY(-4px)',
                        borderColor: overdue ? '#f44336' : 'primary.main'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Tooltip title={task.title} placement="top" arrow>
                            <Typography
                              variant="h6"
                              sx={{
                                maxWidth: '230px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {task.title}
                            </Typography>
                          </Tooltip>

                          <Box sx={{ opacity: 0.7 }}>
                            <IconButton size="small" onClick={() => onOpenForm(task.id)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}>
                              <Delete />
                            </IconButton>
                            <IconButton size="small" onClick={() =>
                              setFlippedTasks(prev => ({ ...prev, [task.id]: true }))
                            }>
                              <FlipToBackIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {task.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Contact:</strong> {task.fullName}</Typography>
                          <Typography variant="body2"><strong>Email:</strong> {task.email}</Typography>
                          <Typography variant="body2"><strong>Phone:</strong> {task.telephone}</Typography>
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color={overdue ? 'error' : 'text.primary'}>
                            <strong>Due:</strong> {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}
                            {overdue && ' (OVERDUE)'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <Chip
                            label={PriorityLabels[task.priority]}
                            color={getPriorityColor(task.priority)}
                            size="small"
                          />

                          {task.tags.slice(0, VISIBLE_COUNT).map(tag => (
                            <Chip key={tag.id} label={tag.name} size="small" />
                          ))}

                          {task.tags.length > VISIBLE_COUNT && (
                            <Tooltip
                              title={
                                <Box>
                                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                                    Other Tags:
                                  </Typography>
                                  {task.tags.slice(VISIBLE_COUNT).map(tag => (
                                    <Typography key={tag.id} variant="body2">• {tag.name}</Typography>
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
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </CardContent>
                    </Card>

                    <Card sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      borderRadius: 2,
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      p: 2,
                      boxShadow: 2,
                      background: getCardBackground()
                    }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFlippedTasks(prev => ({ ...prev, [task.id]: false }))
                        }
                        sx={{ position: "absolute", top: 4, right: 4 }}
                      >
                        <FlipToFrontIcon fontSize="small" />
                      </IconButton>

                      {overdue ? (
                        <>
                          <Typography variant="h6" sx={{ mb: 1, color: 'error' }}>Overdue</Typography>
                          <Typography variant="body1" sx={{ mb: 1, color: 'error' }}>
                            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                          </Typography>

                          <Box sx={{
                            width: 40,
                            height: 60,
                            backgroundColor: 'red',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <HourglassFullIcon sx={{ color: 'white' }} />
                          </Box>
                        </>
                      ) : (
                        <>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Time Remaining
                          </Typography>

                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {formatRemainingTime(task.dueDate)}
                          </Typography>

                          <Box sx={{
                            width: 20,
                            height: 60,
                            backgroundColor: '#f0f0f0',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              width: '100%',
                              height: `${remainingPercent}%`,
                              backgroundColor: animationColor,
                              transition: 'height 1s linear'
                            }} />
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
      )}

      {sortedTasks.length === 0 && viewMode === "cards" && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? `No tasks found matching "${searchQuery}"` : "No tasks yet. Create your first task!"}
          </Typography>
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