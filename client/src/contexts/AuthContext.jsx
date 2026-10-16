/**
 * AuthContext — manages authentication state with real token-based auth.
 *
 * Stores: access_token, refresh_token, user { id, full_name, role, phone }
 * Provides: login (save tokens), logout (clear + call API), isAuthenticated, user, role checks
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setTokens,
  clearTokens,
  authService,
} from '../services/api';

// ─── Types ───────────────────────────────────────────────────

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} full_name
 * @property {string} role - "client" | "admin"
 * @property {string} [phone]
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {AuthUser|null} user
 * @property {string|null} phone - phone number used during OTP flow (before verify)
 * @property {boolean} isLoading
 */

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext(null);

const initialState = /** @type {AuthState} */ ({
  isAuthenticated: false,
  user: null,
  phone: sessionStorage.getItem('reflecto_otp_phone') || null,
  isLoading: true,
});

// ─── Reducer ─────────────────────────────────────────────────

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        phone: action.payload.user?.phone || state.phone,
        isLoading: false,
      };
    case 'SET_PHONE':
      return {
        ...state,
        phone: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        phone: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload ?? true };
    default:
      return state;
  }
};

// ─── Provider ────────────────────────────────────────────────

export const AuthProvider = React.memo(({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Restore session from localStorage on mount and sync profile from server
  useEffect(() => {
    const token = getAccessToken();
    let user = getStoredUser();

    if (token) {
      if (!user) {
        user = { role: 'client' };
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });

      // Silently sync user details from server
      authService.getMe()
        .then(meData => {
          if (meData) {
            const updatedUser = {
              id: meData.id || user.id,
              phone: meData.phone || user.phone,
              full_name: meData.full_name || user.full_name,
              email: meData.email || user.email,
              role: meData.role || user.role,
              role_id: meData.role_id || user.role_id,
              is_super_admin: meData.is_super_admin !== undefined ? !!meData.is_super_admin : true,
              permissions: meData.permissions,
              company_id: meData.company_id,
              branch_name: meData.branch_name
            };
            setTokens({ access_token: token, user: updatedUser });
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser } });
          }
        })
        .catch(() => {
          clearTokens();
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      // Also check legacy key for backwards compat
      const legacy = localStorage.getItem('reflecto_auth');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: { phone: parsed.phone, role: 'client' } },
          });
        } catch {
          localStorage.removeItem('reflecto_auth');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, []);

  /**
   * Save the phone number being used for OTP (before verification).
   * Called from LoginView after successfully sending OTP.
   */
  const setPhone = useCallback((phone) => {
    if (phone) {
      sessionStorage.setItem('reflecto_otp_phone', phone);
    } else {
      sessionStorage.removeItem('reflecto_otp_phone');
    }
    dispatch({ type: 'SET_PHONE', payload: phone });
  }, []);

  /**
   * Complete login — called after OTP verification succeeds.
   * Saves tokens to localStorage and updates context.
   *
   * @param {{ access_token: string, refresh_token: string, user: AuthUser }} data
   */
  const login = useCallback((data) => {
    queryClient.clear();
    setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    });
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user } });
  }, [queryClient]);

  /**
   * Logout — clears tokens locally and notifies the server.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Server call failed — still clear local state
    }
    sessionStorage.removeItem('reflecto_otp_phone');
    clearTokens();
    queryClient.clear();
    dispatch({ type: 'LOGOUT' });
  }, [queryClient]);

  const hasPermission = useCallback((permKey) => {
    if (!permKey) return true;
    if (!state.user) return false;

    const isSuper = Boolean(
      state.user.is_super_admin === 1 ||
      state.user.is_super_admin === true ||
      state.user.role === 'super_admin'
    );
    if (isSuper) return true;

    let perms = {};
    if (state.user.permissions) {
      try {
        perms = typeof state.user.permissions === 'string'
          ? JSON.parse(state.user.permissions)
          : state.user.permissions;
      } catch (e) { perms = {}; }
    }

    let rolePerms = {};
    if (state.user.role_permissions) {
      try {
        rolePerms = typeof state.user.role_permissions === 'string'
          ? JSON.parse(state.user.role_permissions)
          : state.user.role_permissions;
      } catch (e) { rolePerms = {}; }
    }

    return Boolean(perms[permKey] || rolePerms[permKey]);
  }, [state.user]);

  const value = useMemo(() => ({
    ...state,
    setPhone,
    login,
    logout,
    hasPermission,
  }), [state, setPhone, login, logout, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
});

// ─── Hook ────────────────────────────────────────────────────

/**
 * @returns {{ isAuthenticated: boolean, user: AuthUser|null, phone: string|null, isLoading: boolean, setPhone: Function, login: Function, logout: Function }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthProvider;