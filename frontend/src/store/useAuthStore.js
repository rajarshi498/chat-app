import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const normalizeUser = (u) => ({
  ...u,
  fullName: u.fullname ?? u.fullName ?? "",
});

const BASE_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: normalizeUser(res.data), isCheckingAuth: false });
      get().connectSocket();
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Failed to check auth:", err);
      }
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: normalizeUser(res.data) });
      toast.success("Account Created Successfully!");
      get().connectSocket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup Failed.");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: normalizeUser(res.data) });
      toast.success("Logged in Successfully!");
      get().connectSocket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed.");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out Successfully!");
      get().disconnectSocket();
    } catch {
      toast.error("Logout Failed.");
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: normalizeUser(res.data) });
      toast.success("Profile Updated Successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update Failed.");
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("getonlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
