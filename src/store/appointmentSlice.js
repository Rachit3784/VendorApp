import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const bookAppointment = createAsyncThunk('appointment/book', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/appointments', data);
    return res.data.appointment;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchUserAppointments = createAsyncThunk('appointment/fetchUser', async (status, { rejectWithValue }) => {
  try {
    const query = status ? `?status=${status}` : '';
    const res = await api.get(`/appointments/user${query}`);
    return res.data.appointments;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchVendorAppointments = createAsyncThunk('appointment/fetchVendor', async (status, { rejectWithValue }) => {
  try {
    const query = status ? `?status=${status}` : '';
    const res = await api.get(`/appointments/vendor${query}`);
    return res.data.appointments;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateAppointmentStatus = createAsyncThunk('appointment/updateStatus', async ({ id, status, vendorNote }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/appointments/${id}/status`, { status, vendorNote });
    return res.data.appointment;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const rescheduleAppointment = createAsyncThunk('appointment/reschedule', async ({ id, appointmentDate, appointmentTime }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/appointments/${id}/reschedule`, { appointmentDate, appointmentTime });
    return res.data.appointment;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const cancelAppointment = createAsyncThunk('appointment/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/appointments/${id}/cancel-by-user`);
    return res.data.appointment;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState: {
    userAppointments:   [],
    vendorAppointments: [],
    loading:            false,
    bookingLoading:     false,
    error:              null,
  },
  reducers: {
    clearAppointmentError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bookAppointment.pending,   (s) => { s.bookingLoading = true;  s.error = null; })
      .addCase(bookAppointment.fulfilled, (s, a) => { s.bookingLoading = false; s.userAppointments.unshift(a.payload); })
      .addCase(bookAppointment.rejected,  (s, a) => { s.bookingLoading = false; s.error = a.payload; })

      .addCase(fetchUserAppointments.pending,   (s) => { s.loading = true; })
      .addCase(fetchUserAppointments.fulfilled, (s, a) => { s.loading = false; s.userAppointments = a.payload; })
      .addCase(fetchUserAppointments.rejected,  (s) => { s.loading = false; })

      .addCase(fetchVendorAppointments.pending,   (s) => { s.loading = true; })
      .addCase(fetchVendorAppointments.fulfilled, (s, a) => { s.loading = false; s.vendorAppointments = a.payload; })
      .addCase(fetchVendorAppointments.rejected,  (s) => { s.loading = false; })

      .addCase(updateAppointmentStatus.fulfilled, (s, a) => {
        s.vendorAppointments = s.vendorAppointments.map(ap =>
          ap._id === a.payload._id ? a.payload : ap,
        );
      })

      .addCase(rescheduleAppointment.fulfilled, (s, a) => {
        s.userAppointments = s.userAppointments.map(ap =>
          ap._id === a.payload._id ? a.payload : ap,
        );
      })
      
      .addCase(cancelAppointment.fulfilled, (s, a) => {
        s.userAppointments = s.userAppointments.map(ap =>
          ap._id === a.payload._id ? a.payload : ap,
        );
      });
  },
});

export const { clearAppointmentError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
