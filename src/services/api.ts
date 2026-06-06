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

export const fetchTrainStatus = async (): Promise<BackendTrainStatus> => {
  const res = await fetch('/api/train');
  if (!res.ok) throw new Error('Failed to fetch train status');
  return res.json();
};

export const fetchDeviceStatus = async (): Promise<BackendDeviceStatus> => {
  const res = await fetch('/api/devices');
  if (!res.ok) throw new Error('Failed to fetch devices status');
  return res.json();
};

export const fetchSensorStatus = async (): Promise<BackendSensorStatus> => {
  const res = await fetch('/api/sensors');
  if (!res.ok) throw new Error('Failed to fetch sensors status');
  return res.json();
};

export const fetchCoordinates = async (): Promise<BackendCoordinates> => {
  const res = await fetch('/api/coordinates');
  if (!res.ok) throw new Error('Failed to fetch coordinates');
  return res.json();
};
