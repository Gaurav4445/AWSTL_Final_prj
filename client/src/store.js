import { create } from 'zustand';
import { userAPI, propertyAPI, taskAPI, recordAPI, vendorAPI } from './services/api';
import { toast } from 'sonner';

export const useStore = create((set, get) => ({
  // Auth State
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,

  // Data State
  properties: [],
  tasks: [],
  records: [],
  vendors: [],
  notifications: [],

  // UI State
  selectedProperty: null,
  error: null,

  // Auth Actions
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  // User Actions
  register: async (data) => {
    try {
      set({ isLoading: true });
      const response = await userAPI.register(data);
      get().setAuth(response.data.user, response.data.token);
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      toast.error(msg);
      set({ error: msg });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data) => {
    try {
      set({ isLoading: true });
      const response = await userAPI.login(data);
      get().setAuth(response.data.user, response.data.token);
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      toast.error(msg);
      set({ error: msg });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Property Actions
  fetchProperties: async () => {
    try {
      const response = await propertyAPI.getAll();
      set({ properties: response.data.data || response.data });
    } catch (err) {
      toast.error('Failed to fetch properties');
    }
  },

  createProperty: async (data) => {
    try {
      set({ isLoading: true });
      const response = await propertyAPI.create(data);
      set({ properties: [...get().properties, response.data.data] });
      toast.success('Property added!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create property');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProperty: async (id, data) => {
    try {
      const response = await propertyAPI.update(id, data);
      const props = get().properties.map(p => p._id === id ? response.data.data : p);
      set({ properties: props });
      toast.success('Property updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update property');
      return false;
    }
  },

  deleteProperty: async (id) => {
    try {
      await propertyAPI.delete(id);
      set({ properties: get().properties.filter(p => p._id !== id) });
      toast.success('Property deleted!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete property');
      return false;
    }
  },

  // Task Actions
  fetchTasks: async () => {
    try {
      const response = await taskAPI.getAll();
      set({ tasks: response.data.data || response.data });
    } catch (err) {
      toast.error('Failed to fetch tasks');
    }
  },

  fetchTasksByProperty: async (propId) => {
    try {
      const response = await taskAPI.getByProperty(propId);
      set({ tasks: response.data.data || response.data });
    } catch (err) {
      toast.error('Failed to fetch tasks');
    }
  },

  createTask: async (data) => {
    try {
      set({ isLoading: true });
      const response = await taskAPI.create(data);
      set({ tasks: [...get().tasks, response.data.data] });
      toast.success('Task created!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, data) => {
    try {
      const response = await taskAPI.update(id, data);
      const tasks = get().tasks.map(t => t._id === id ? response.data.data : t);
      set({ tasks });
      toast.success('Task updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task');
      return false;
    }
  },

  deleteTask: async (id) => {
    try {
      await taskAPI.delete(id);
      set({ tasks: get().tasks.filter(t => t._id !== id) });
      toast.success('Task deleted!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task');
      return false;
    }
  },

  // Record Actions
  fetchRecords: async () => {
    try {
      const response = await recordAPI.getAll();
      set({ records: response.data.data || response.data });
    } catch (err) {
      toast.error('Failed to fetch records');
    }
  },

  fetchRecordsByProperty: async (propId) => {
    try {
      const response = await recordAPI.getByProperty(propId);
      set({ records: response.data.data || response.data });
    } catch (err) {
      toast.error('Failed to fetch records');
    }
  },

  createRecord: async (data) => {
    try {
      set({ isLoading: true });
      const response = await recordAPI.create(data);
      set({ records: [...get().records, response.data.data] });
      toast.success('Record created!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create record');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecord: async (id, data) => {
    try {
      const response = await recordAPI.update(id, data);
      const records = get().records.map(r => r._id === id ? response.data.data : r);
      set({ records });
      toast.success('Record updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update record');
      return false;
    }
  },

  deleteRecord: async (id) => {
    try {
      await recordAPI.delete(id);
      set({ records: get().records.filter(r => r._id !== id) });
      toast.success('Record deleted!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete record');
      return false;
    }
  },

  // Vendor Actions
  fetchVendors: async () => {
    try {
      const response = await vendorAPI.getAll();
      set({ vendors: response.data.data || response.data });
    } catch (err) {
      toast.error('Failed to fetch vendors');
    }
  },

  createVendor: async (data) => {
    try {
      const response = await vendorAPI.create(data);
      set({ vendors: [...get().vendors, response.data.data] });
      toast.success('Vendor added!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create vendor');
      return false;
    }
  },

  updateVendor: async (id, data) => {
    try {
      const response = await vendorAPI.update(id, data);
      const vendors = get().vendors.map(v => v._id === id ? response.data.data : v);
      set({ vendors });
      toast.success('Vendor updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update vendor');
      return false;
    }
  },

  deleteVendor: async (id) => {
    try {
      await vendorAPI.delete(id);
      set({ vendors: get().vendors.filter(v => v._id !== id) });
      toast.success('Vendor deleted!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete vendor');
      return false;
    }
  },

  // Notification Actions
  fetchNotifications: async () => {
    try {
      const response = await userAPI.getNotifications?.() || { data: [] };
      set({ notifications: response.data.data || response.data });
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  },

  markAsRead: async (notifId) => {
    try {
      await userAPI.markNotificationAsRead?.(notifId);
      const notifs = get().notifications.map(n => n._id === notifId ? { ...n, read: true } : n);
      set({ notifications: notifs });
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  },

  addNotification: (notification) => {
    set({ notifications: [notification, ...get().notifications] });
  },

  setSelectedProperty: (property) => set({ selectedProperty: property }),
}));
