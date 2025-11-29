import React, { useEffect } from 'react';
import { Container, Typography, Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { useAppDispatch } from './store/hooks';
import { fetchTasks } from './store/slices/taskSlice';
import { fetchTags } from './store/slices/tagSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const dispatch = useAppDispatch();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTaskId, setEditingTaskId] = React.useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTags());
  }, [dispatch]);

  const handleOpenForm = (taskId?: number) => {
    if (taskId) {
      setEditingTaskId(taskId);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTaskId(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Task Manager
          </Typography>
          <TaskList onOpenForm={handleOpenForm} />
          <TaskForm
            open={isFormOpen}
            onClose={handleCloseForm}
            taskId={editingTaskId}
          />
        </Box>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </Container>
    </ThemeProvider>
  );
}

export default App;