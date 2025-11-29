import axiosInstance from './axiosConfig';
import { Tag, CreateTagRequest } from '../types';

export const tagApi = {
  getAllTags: async (): Promise<Tag[]> => {
    const response = await axiosInstance.get('/tags');
    return response.data;
  },

  createTag: async (tag: CreateTagRequest): Promise<Tag> => {
    const response = await axiosInstance.post('/tags', tag);
    return response.data;
  },
};