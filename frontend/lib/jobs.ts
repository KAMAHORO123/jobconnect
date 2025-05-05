import axios from 'axios';
import { getAuthToken, getUserInfo } from './auth';

const API_URL = 'http://localhost:6060/api';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string;
  type: string;
  posted: string;
  status?: string;
  experienceLevel?: string;
  employerId?: number;
  postedDate?: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  jobSeekerId: number;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
  cv?: string;
  cvFilename?: string;
  cvMimetype?: string;
  job: Job;
  jobSeekerEmail?: string;
}

export interface JobsResponse {
  jobs: Job[];
  hasMore: boolean;
  total: number;
}

export interface JobSearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  jobTypes?: string[];
  experienceLevels?: string[];
  locations?: string[];
  salaryRange?: [number, number];
}

export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE";
  description: string;
  requirements: string;
  salary: string;
}

// Get a single job by ID
export const getJob = async (id: number): Promise<Job> => {
  const response = await axios.get(`${API_URL}/jobs/${id}`);
  return response.data;
};

// Search jobs
export const searchJobs = async (): Promise<Job[]> => {
  const response = await axios.get(`${API_URL}/jobs`);
  return response.data;
};

// Apply for a job with CV and optional cover letter
export const applyForJob = async (jobId: number, cvFile: File, coverLetter?: string): Promise<JobApplication> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const formData = new FormData();
  formData.append('cv', cvFile);
  if (coverLetter) {
    formData.append('coverLetter', coverLetter);
  }

  const response = await axios.post(
    `${API_URL}/jobseeker/apply/${jobId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }
  );
  return response.data;
};

// Get user's job applications
export const getUserApplications = async (): Promise<JobApplication[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_URL}/jobseeker/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      throw new Error('Unable to connect to the server. Please make sure the backend server is running.');
    }
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    throw error;
  }
};

// Save job for later
export const saveJob = async (jobId: number): Promise<void> => {
  const token = getAuthToken();
  await axios.post(
    `${API_URL}/jobseeker/jobs/${jobId}/save`,
    null,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
};

// Get saved jobs
export const getSavedJobs = async (): Promise<Job[]> => {
  const token = getAuthToken();
  const response = await axios.get(`${API_URL}/jobseeker/jobs/saved`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Create a new job (employer only)
export const createJob = async (data: CreateJobData): Promise<Job> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const userInfo = getUserInfo();
    if (!userInfo || userInfo.role !== 'EMPLOYER') {
      throw new Error('Only employers can create jobs');
    }

    // Validate required fields
    if (!data.title || !data.company || !data.location || !data.description) {
      throw new Error('Please fill in all required fields');
    }

    const response = await axios.post(`${API_URL}/jobs`, data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Transform the response data to match the Job interface
    const job = response.data;
    return {
      ...job,
      posted: job.postedDate ? new Date(job.postedDate).toISOString() : new Date().toISOString(),
      postedDate: job.postedDate ? new Date(job.postedDate).toISOString() : undefined,
      requirements: job.requirements || '',
      status: job.status || 'ACTIVE'
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in again');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to create jobs');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message === 'Network Error') {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

// Update a job (employer only)
export const updateJob = async (jobId: number, jobData: Partial<Job>): Promise<Job> => {
  const token = getAuthToken();
  const response = await axios.put(`${API_URL}/jobs/${jobId}`, jobData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete a job (employer only)
export const deleteJob = async (jobId: number): Promise<void> => {
  const token = getAuthToken();
  await axios.delete(`${API_URL}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Get employer's posted jobs
export const getEmployerJobs = async (): Promise<Job[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/employer/jobs`);
    
    // Transform the response data to match the Job interface
    const jobs = response.data.map((job: any) => ({
      ...job,
      posted: job.postedDate ? new Date(job.postedDate).toISOString() : new Date().toISOString(),
      postedDate: job.postedDate ? new Date(job.postedDate).toISOString() : undefined,
      requirements: job.requirements || '',
      status: job.status || 'ACTIVE'
    }));
    
    return jobs;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in again');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to access this resource');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message === 'Network Error') {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw new Error('Failed to fetch jobs');
  }
};

// Get applications for a specific job (employer only)
export const getJobApplications = async (jobId: number): Promise<JobApplication[]> => {
  const token = getAuthToken();
  const response = await axios.get(`${API_URL}/employer/applications/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update application status (employer only)
export const updateApplicationStatus = async (
  applicationId: number,
  status: string
): Promise<JobApplication> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(
      `${API_URL}/employer/applications/${applicationId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to update application status. Please try again later.');
  }
};

// Remove saved job
export const removeSavedJob = async (jobId: number): Promise<void> => {
  const token = getAuthToken();
  await axios.delete(`${API_URL}/jobseeker/jobs/${jobId}/save`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Check if user has applied for a job
export const hasAppliedForJob = async (jobId: number): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/jobseeker/has-applied/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.hasApplied;
  } catch (error) {
    console.error('Error checking application status:', error);
    return false;
  }
};

// Get all applications for the employer (all jobs)
export const getAllJobApplications = async (): Promise<JobApplication[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/employer/applications`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in again');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to access this resource');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message === 'Network Error') {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw new Error('Failed to fetch job applications');
  }
};

// Get CV URL for viewing
export const getCvUrl = (applicationId: number, isEmployer: boolean = false): string => {
  return `${API_URL}/${isEmployer ? 'employer' : 'jobseeker'}/applications/${applicationId}/cv`;
};