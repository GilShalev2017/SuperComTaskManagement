import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Tag, CreateTagRequest } from '../../types';
import { tagApi } from '../../api/tagApi';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
};

export const fetchTags = createAsyncThunk('tags/fetchAll', async () => {
  return await tagApi.getAllTags();
});

export const createTag = createAsyncThunk(
  'tags/create',
  async (tag: CreateTagRequest) => {
    return await tagApi.createTag(tag);
  }
);

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tags';
      })
      .addCase(createTag.fulfilled, (state, action: PayloadAction<Tag>) => {
        state.tags.push(action.payload);
      });
  },
});

export default tagSlice.reducer;