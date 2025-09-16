import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import { authAPI } from '../services/api';

// Auth state type
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'INITIALIZE_FAILURE' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isInitialized: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        isLoading: true,
        isInitialized: false,
      };
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isInitialized: true,
      };
    case 'INITIALIZE_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isInitialized: true,
      };
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isInitialized: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'INITIALIZE_START' });
      
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          
          // Verify token is still valid
          try {
            await authAPI.verifyToken();
            dispatch({
              type: 'INITIALIZE_SUCCESS',
              payload: { user, token },
            });
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'INITIALIZE_FAILURE' });
          }
        } else {
          dispatch({ type: 'INITIALIZE_FAILURE' });
        }
      } catch (error) {
        dispatch({ type: 'INITIALIZE_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.login(username, password);
      const { user, token } = response;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    
    // Call logout API in background (don't wait for response)
    authAPI.logout().catch(() => {
      // Ignore errors
    });
  };

  // Check if user is authenticated
  const isAuthenticated = Boolean(state.user && state.token);

  // Check if user has specific roles
  const hasRole = (roles: UserRole[]): boolean => {
    return Boolean(state.user && roles.includes(state.user.role));
  };

  // Check if user can access specific department
  const canAccessDepartment = (departmentId: number): boolean => {
    if (!state.user) return false;
    
    // Company and deputy managers can access all departments
    if (state.user.role === 'COMPANY_MANAGER' || state.user.role === 'DEPUTY_MANAGER') {
      return true;
    }
    
    // Department-specific roles need to match department
    return state.user.department?.id === departmentId;
  };


  // Context value
  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    canAccessDepartment,
  };

  // Don't render children until auth is initialized
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
