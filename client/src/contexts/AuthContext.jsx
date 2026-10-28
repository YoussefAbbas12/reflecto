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

// Synchronously capture and persist cross-domain handover tokens BEFORE initial render
const initHandover = () => {
  if (typeof window === 'undefined') return;
  try {
    let handover = null;
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const raw = hashParams.get('auth_data');
      if (raw) {
        try { handover = JSON.parse(decodeURIComponent(raw)); } catch {}
      } else if (hashParams.get('access_token')) {
        try {
          handover = {
            access_token: hashParams.get('access_token'),
            refresh_token: hashParams.get('refresh_token'),
            user: hashParams.get('user') ? JSON.parse(decodeURIComponent(hashParams.get('user'))) : null
          };
        } catch {}
      }
    }
    if (!handover && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const raw = searchParams.get('auth_data');
      if (raw) {
        try { handover = JSON.parse(decodeURIComponent(raw)); } catch {}
      } else if (searchParams.get('access_token')) {
        try {
          handover = {
            access_token: searchParams.get('access_token'),
            refresh_token: searchParams.get('refresh_token'),
            user: searchParams.get('user') ? JSON.parse(decodeURIComponent(searchParams.get('user'))) : null
          };
        } catch {}
      }
    }
    if (handover && handover.access_token) {
      setTokens({
        access_token: handover.access_token,
        refresh_token: handover.refresh_token,
        user: handover.user
      });
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);
    }
  } catch (e) {
    console.error('Initial handover error:', e);
  }
};

initHandover();

const initialStoredUser = getStoredUser();
const initialToken = getAccessToken();

const initialState = /** @type {AuthState} */ ({
  isAuthenticated: Boolean(initialToken),
  user: initialStoredUser || (initialToken ? { role: 'client' } : null),
  phone: (typeof window !== 'undefined' ? sessionStorage.getItem('reflecto_otp_phone') : null) || null,
  isLoading: Boolean(initialToken),
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
    // Cross-Domain Auth Handover from SEEDA Portal
    try {
      if (typeof window !== 'undefined') {
        let handover = null;
        if (window.location.hash) {
          const hashStr = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hashStr);
          const rawData = hashParams.get('auth_data');
          if (rawData) {
            try { handover = JSON.parse(decodeURIComponent(rawData)); } catch {}
          } else if (hashParams.get('access_token')) {
            try {
              handover = {
                access_token: hashParams.get('access_token'),
                refresh_token: hashParams.get('refresh_token'),
                user: hashParams.get('user') ? JSON.parse(decodeURIComponent(hashParams.get('user'))) : null
              };
            } catch {}
          }
        }

        if (!handover && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search);
          const rawData = searchParams.get('auth_data');
          if (rawData) {
            try { handover = JSON.parse(decodeURIComponent(rawData)); } catch {}
          } else if (searchParams.get('access_token')) {
            try {
              handover = {
                access_token: searchParams.get('access_token'),
                refresh_token: searchParams.get('refresh_token'),
                user: searchParams.get('user') ? JSON.parse(decodeURIComponent(searchParams.get('user'))) : null
              };
            } catch {}
          }
        }

        if (handover && handover.access_token) {
          setTokens({
            access_token: handover.access_token,
            refresh_token: handover.refresh_token,
            user: handover.user
          });
          const cleanPath = window.location.pathname;
          window.history.replaceState({}, document.title, cleanPath);
        }
      }
    } catch (e) {
      console.error('Error handling cross-domain auth handover:', e);
    }

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
              employee_code: meData.employee_code || user.employee_code || null,
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

  const updateUser = useCallback((patch) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: { ...(state.user || {}), ...patch }
      }
    });
    const stored = getStoredUser();
    if (stored) {
      const updated = { ...stored, ...patch };
      localStorage.setItem('reflecto_user', JSON.stringify(updated));
    }
  }, [state.user]);

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
    updateUser,
    hasPermission,
  }), [state, setPhone, login, logout, updateUser, hasPermission]);

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