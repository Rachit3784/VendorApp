import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchVendors = createAsyncThunk('vendor/fetchAll', async ({ page = 1, search = '' } = {}, { rejectWithValue }) => {
  try {
    const res = await api.get(`/vendors?page=${page}&limit=20&search=${search}`);
    return { vendors: res.data.vendors, page };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchVendorById = createAsyncThunk('vendor/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/vendors/${id}`);
    return res.data.vendor;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});


export const fetchAvailableSlots = createAsyncThunk('vendor/fetchSlots', async ({ vendorId, date }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/vendors/${vendorId}/available-slots?date=${date}`);
    return res.data.slots;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchVendorProfile = createAsyncThunk('vendor/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/vendors/me/dashboard');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateVendorProfile = createAsyncThunk('vendor/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/vendors/me/profile', data);
    return res.data.vendor;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const submitRating = createAsyncThunk('vendor/rate', async ({ vendorId, stars, review }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/vendors/${vendorId}/rate`, { stars, review });
    return { vendorId, avgRating: res.data.avgRating };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const vendorSlice = createSlice({
  name: 'vendor',
  initialState: {
    list:          [],
    selectedVendor: null,
    availableSlots: [],
    dashboard:     null,
    loading:       false,
    slotsLoading:  false,
    error:         null,
  },
  reducers: {
    clearVendorError: (state) => { state.error = null; },
    clearSelectedVendor: (state) => { state.selectedVendor = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchVendors.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.page === 1 ? a.payload.vendors : [...s.list, ...a.payload.vendors];
      })
      .addCase(fetchVendors.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchVendorById.pending,   (s) => { s.loading = true; })
      .addCase(fetchVendorById.fulfilled, (s, a) => { s.loading = false; s.selectedVendor = a.payload; })
      .addCase(fetchVendorById.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchAvailableSlots.pending,   (s) => { s.slotsLoading = true; })
      .addCase(fetchAvailableSlots.fulfilled, (s, a) => { s.slotsLoading = false; s.availableSlots = a.payload; })
      .addCase(fetchAvailableSlots.rejected,  (s) => { s.slotsLoading = false; s.availableSlots = []; })

      .addCase(fetchVendorProfile.fulfilled, (s, a) => { s.dashboard = a.payload; })
      .addCase(updateVendorProfile.fulfilled, (s) => { s.loading = false; })
      .addCase(submitRating.fulfilled, (s, a) => {
        if (s.selectedVendor && s.selectedVendor._id === a.payload.vendorId) {
          s.selectedVendor.avgRating = a.payload.avgRating;
        }
      });
  },
});

export const { clearVendorError, clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
