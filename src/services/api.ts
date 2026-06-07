export interface BackendTrainStatus {
  speed: number;
  latitude: number;
  longitude: number;
  distanceToBarrier: number;
  eta: number;
}

export interface BackendDeviceStatus {
  ledRed: boolean;
  ledGreen: boolean;
  buzzer: boolean;
  lcd: string;
  servo: string; // "UP" or "DOWN"
}

export interface BackendSensorStatus {
  hallA: boolean;
  hallB: boolean;
}

export interface BackendCoordinate {
  latitude: number;
  longitude: number;
}

export interface BackendCoordinates {
  barrier: BackendCoordinate;
  stationA: BackendCoordinate;
  stationB: BackendCoordinate;
}

export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  const url = localStorage.getItem('API_BASE_URL');
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const testApiConnection = async (testUrl: string): Promise<boolean> => {
  const url = testUrl.endsWith('/') ? testUrl.slice(0, -1) : testUrl;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    const res = await fetch(`${url}/api/devices`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    return false;
  }
};

export const fetchTrainStatus = async (): Promise<BackendTrainStatus> => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/train`);
  if (!res.ok) throw new Error('Failed to fetch train status');
  return res.json();
};

export const fetchDeviceStatus = async (): Promise<BackendDeviceStatus> => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/devices`);
  if (!res.ok) throw new Error('Failed to fetch devices status');
  return res.json();
};

export const fetchSensorStatus = async (): Promise<BackendSensorStatus> => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/sensors`);
  if (!res.ok) throw new Error('Failed to fetch sensors status');
  return res.json();
};

export const fetchCoordinates = async (): Promise<BackendCoordinates> => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/coordinates`);
  if (!res.ok) throw new Error('Failed to fetch coordinates');
  return res.json();
};

export interface AuthResponse {
  token: string | null;
  username: string | null;
  displayName: string | null;
  message: string;
}

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

export const registerUser = async (username: string, password: string, displayName: string): Promise<AuthResponse> => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, displayName })
  });
  return res.json();
};


