import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './authSlice';
import vendorReducer       from './vendorSlice';
import appointmentReducer  from './appointmentSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    auth:         authReducer,
    vendor:       vendorReducer,
    appointment:  appointmentReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
