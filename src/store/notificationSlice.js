import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchNotifications = createAsyncThunk('notification/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const markAllRead = createAsyncThunk('notification/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/read-all');
    return null;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const markOneRead = createAsyncThunk('notification/markOneRead', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    list:        [],
    unreadCount: 0,
    loading:     false,
    error:       null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (s) => { s.loading = true; })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading     = false;
        s.list        = a.payload.notifications;
        s.unreadCount = a.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected,  (s) => { s.loading = false; })

      .addCase(markAllRead.fulfilled, (s) => {
        s.unreadCount = 0;
        s.list        = s.list.map(n => ({ ...n, isRead: true }));
      })

      .addCase(markOneRead.fulfilled, (s, a) => {
        s.list = s.list.map(n => n._id === a.payload ? { ...n, isRead: true } : n);
        s.unreadCount = Math.max(0, s.unreadCount - 1);
      });
  },
});

export default notificationSlice.reducer;
