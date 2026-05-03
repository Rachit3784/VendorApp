import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const signup = createAsyncThunk('auth/signup', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/signup', formData);
    await AsyncStorage.setItem('authToken', res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const login = createAsyncThunk('auth/login', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', formData);
    await AsyncStorage.setItem('authToken', res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const loadSession = createAsyncThunk('auth/loadSession', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return rejectWithValue('No token');
    const res = await api.get('/auth/me');
    return { token, user: res.data.user };
  } catch (err) {
    await AsyncStorage.removeItem('authToken');
    return rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout').catch(() => {});
    await AsyncStorage.removeItem('authToken');
    return null;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    // formData may be FormData (multipart) or plain object
    const isFormData = formData instanceof FormData;
    const res = await api.put('/users/profile', formData, isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {},
    );
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:       null,
    token:      null,
    loading:    false,
    splashDone: false,
    error:      null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setSplashDone: (state) => { state.splashDone = true; },
  },
  extraReducers: (builder) => {
    // ── signup
    builder.addCase(signup.pending,   (s) => { s.loading = true;  s.error = null; });
    builder.addCase(signup.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; });
    builder.addCase(signup.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // ── login
    builder.addCase(login.pending,    (s) => { s.loading = true;  s.error = null; });
    builder.addCase(login.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; });
    builder.addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload; });

    // ── loadSession (splash)
    builder.addCase(loadSession.pending,    (s) => { s.loading = true; });
    builder.addCase(loadSession.fulfilled,  (s, a) => { s.loading = false; s.splashDone = true; s.user = a.payload.user; s.token = a.payload.token; });
    builder.addCase(loadSession.rejected,   (s) => { s.loading = false; s.splashDone = true; s.user = null; s.token = null; });

    // ── logout
    builder.addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; });

    // ── updateProfile
    builder.addCase(updateProfile.pending,   (s) => { s.loading = true;  s.error = null; });
    builder.addCase(updateProfile.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; });
    builder.addCase(updateProfile.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, setSplashDone } = authSlice.actions;
export default authSlice.reducer;
