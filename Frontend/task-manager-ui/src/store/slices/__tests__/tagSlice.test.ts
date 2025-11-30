import { describe, test, expect, vi, beforeEach } from 'vitest';
import tagReducer, { fetchTags, createTag } from '../tagSlice';
import type { Tag } from '../../../types';
import { tagApi } from '../../../api/tagApi';

// Mock the API module
vi.mock('../../../api/tagApi', () => ({
  tagApi: {
    getAllTags: vi.fn(),
    createTag: vi.fn(),
  }
}));

describe('tagSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const initialState = {
    tags: [],
    loading: false,
    error: null,
  };

  test('should return initial state', () => {
    expect(tagReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('fetchTags.pending sets loading=true', () => {
    const nextState = tagReducer(initialState, fetchTags.pending('', undefined));
    expect(nextState.loading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  test('fetchTags.fulfilled stores tags', () => {
    const mockTags: Tag[] = [{ id: 1, name: 'Tag A' }];

    const nextState = tagReducer(
      initialState,
      fetchTags.fulfilled(mockTags, '', undefined)
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.tags).toEqual(mockTags);
  });

  test('fetchTags.rejected sets error', () => {
    const nextState = tagReducer(
      initialState,
      fetchTags.rejected(new Error('Failed'), '', undefined)
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBe('Failed');
  });

  test('createTag.fulfilled pushes new tag', () => {
    const startState = { ...initialState, tags: [{ id: 1, name: 'First' }] };
    const newTag: Tag = { id: 2, name: 'Second' };

    const nextState = tagReducer(
      startState,
      createTag.fulfilled(newTag, '', { name: 'Second' })
    );

    expect(nextState.tags).toHaveLength(2);
    expect(nextState.tags[1]).toEqual(newTag);
  });

  test('fetchTags thunk calls tagApi.getAllTags', async () => {
    (tagApi.getAllTags as vi.Mock).mockResolvedValue([]);

    await fetchTags()(vi.fn(), vi.fn(), undefined);

    expect(tagApi.getAllTags).toHaveBeenCalled();
  });

  test('createTag thunk calls tagApi.createTag', async () => {
    (tagApi.createTag as vi.Mock).mockResolvedValue({ id: 1, name: 'A' });

    await createTag({ name: 'A' })(vi.fn(), vi.fn(), undefined);

    expect(tagApi.createTag).toHaveBeenCalledWith({ name: 'A' });
  });
});
