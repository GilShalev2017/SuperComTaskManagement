import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createTask, updateTask, fetchTaskById } from '../store/slices/taskSlice';
import { CreateTaskRequest, PriorityLabels } from '../types';
import { toast } from 'react-toastify';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  taskId?: number | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, taskId }) => {
  const dispatch = useAppDispatch();
  const { selectedTask, loading } = useAppSelector((state) => state.tasks);
  const { tags } = useAppSelector((state) => state.tags);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskRequest>({
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString().slice(0, 16),
      priority: 2,
      fullName: '',
      telephone: '',
      email: '',
      tagIds: [],
    },
  });

  useEffect(() => {
    if (taskId && open) {
      dispatch(fetchTaskById(taskId));
    }
  }, [taskId, open, dispatch]);

  useEffect(() => {
    if (selectedTask && taskId) {
      setValue('title', selectedTask.title);
      setValue('description', selectedTask.description || '');
      setValue('dueDate', new Date(selectedTask.dueDate).toISOString().slice(0, 16));
      setValue('priority', selectedTask.priority);
      setValue('fullName', selectedTask.fullName);
      setValue('telephone', selectedTask.telephone);
      setValue('email', selectedTask.email);
      setValue('tagIds', selectedTask.tags.map((t) => t.id));
    }
  }, [selectedTask, taskId, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateTaskRequest) => {
    setSubmitting(true);
    try {
      if (taskId) {
        await dispatch(updateTask({ id: taskId, task: data })).unwrap();
        toast.success('Task updated successfully');
      } else {
        await dispatch(createTask(data)).unwrap();
        toast.success('Task created successfully');
      }
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{taskId ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="title"
              control={control}
              rules={{
                required: 'Title is required',
                maxLength: {
                  value: 200,
                  message: 'Title cannot exceed 200 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              rules={{
                maxLength: {
                  value: 2000,
                  message: 'Description cannot exceed 2000 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="dueDate"
              control={control}
              rules={{ required: 'Due date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Due Date"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dueDate}
                  helperText={errors.dueDate?.message}
                />
              )}
            />

            <Controller
              name="priority"
              control={control}
              rules={{ required: 'Priority is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.priority}>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label="Priority">
                    <MenuItem value={1}>{PriorityLabels[1]}</MenuItem>
                    <MenuItem value={2}>{PriorityLabels[2]}</MenuItem>
                    <MenuItem value={3}>{PriorityLabels[3]}</MenuItem>
                  </Select>
                  {errors.priority && (
                    <FormHelperText>{errors.priority.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="fullName"
              control={control}
              rules={{
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Full name cannot exceed 100 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                />
              )}
            />

            <Controller
              name="telephone"
              control={control}
              rules={{
                required: 'Telephone is required',
                pattern: {
                  value: /^[\d\s\-\+\(\)]+$/,
                  message: 'Please enter a valid phone number',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Telephone"
                  fullWidth
                  error={!!errors.telephone}
                  helperText={errors.telephone?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="tagIds"
              control={control}
              rules={{
                required: 'At least one tag is required',
                validate: (value) =>
                  value.length > 0 || 'At least one tag is required',
              }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tagIds}>
                  <InputLabel>Tags</InputLabel>
                  <Select
                    {...field}
                    multiple
                    input={<OutlinedInput label="Tags" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const tag = tags.find((t) => t.id === value);
                          return tag ? (
                            <Chip key={value} label={tag.name} size="small" />
                          ) : null;
                        })}
                      </Box>
                    )}
                  >
                    {tags.map((tag) => (
                      <MenuItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tagIds && (
                    <FormHelperText>{errors.tagIds.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || loading}
          >
            {submitting ? <CircularProgress size={24} /> : taskId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;