import axios from 'axios';

const API_URL = 'http://localhost:6060/api/auth';

export interface AuthResponse {
  token: string;
  role: string;
  username: string;
  email: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

export interface UserInfo {
  username: string;
  role: string;
  email: string;
}

export interface ProfileData {
  companyName: string;
  industry: string;
  website: string;
  location: string;
  description: string;
  profileImage?: string;
}

// Map backend roles to frontend roles
const roleMap: { [key: string]: string } = {
  'ROLE_JOB_SEEKER': 'JOB_SEEKER',
  'ROLE_EMPLOYER': 'EMPLOYER',
  'JOB_SEEKER': 'JOB_SEEKER',
  'EMPLOYER': 'EMPLOYER',
  'JOBSEEKER': 'JOB_SEEKER'
};

// Helper function to normalize role names
export const normalizeRole = (role: string): string => {
  const normalizedRole = role.toUpperCase();
  return roleMap[normalizedRole] || normalizedRole;
};

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add axios interceptor to handle token
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add axios interceptor to handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const register = async (username: string, password: string, email: string, role: string): Promise<RegisterResponse> => {
  const response = await axios.post(`${API_URL}/register`, {
    username,
    password,
    email,
    role
  });
  return response.data;
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password
    });
    
    console.log('Login response:', response.data);
    
    // Normalize the role using the helper function
    const role = normalizeRole(response.data.role);
    
    const authResponse = {
      ...response.data,
      role: role
    };

    // Set the token and user info
    setAuthToken(authResponse.token);
    setUserInfo({
      username: authResponse.username,
      role: authResponse.role,
      email: authResponse.email
    });

    console.log('Stored user info:', {
      username: authResponse.username,
      role: authResponse.role,
      email: authResponse.email
    });

    return authResponse;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const setUserInfo = (userInfo: UserInfo) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }
};

export const getUserInfo = (): UserInfo | null => {
  if (typeof window !== 'undefined') {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        console.log('Retrieved user info:', userInfo);
        return userInfo;
      } catch (error) {
        console.error('Error parsing user info:', error);
        return null;
      }
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    const userInfo = getUserInfo();
    return !!token && !!userInfo;
  }
  return false;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export async function updateProfile(data: ProfileData): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await axios.put(
    `${API_URL}/profile`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function uploadProfileImage(formData: FormData): Promise<{ imageUrl: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await axios.post(
    `${API_URL}/profile/image`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
} 