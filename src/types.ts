export interface Coordinate {
  lat: number;
  lng: number;
  name: string;
}

export type TrainState = 'IDLE' | 'APPROACHING' | 'AT_CROSSING' | 'LEAVING' | 'ARRIVED_B';

export interface SensorStates {
  hallArriving: boolean; // Sensor 1
  hallDeparting: boolean; // Sensor 2
  ledRed: boolean;
  ledGreen: boolean;
  buzzerActive: boolean; // Còi báo động (Buzzer)
  barrierPosition: number; // 0 for lowered (closed), 90 for raised (open)
  barrierManualOverride: boolean;
  lcdMessage: string;
}

export interface SimulationConfig {
  speedKmh: number;
  totalDistanceMeters: number;
  currentProgressPct: number; // 0 to 100% of journey
  isPlaying: boolean;
  multiplier: number; // speed multiplier for demo purposes
}
