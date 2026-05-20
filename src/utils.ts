import { Coordinate } from './types';

// Haversine formula to compute distance in meters between two coordinates
export function getDistanceMeters(c1: { lat: number; lng: number }, c2: { lat: number; lng: number }): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Linearly interpolate between two points
export function interpolateCoords(
  c1: { lat: number; lng: number },
  c2: { lat: number; lng: number },
  fraction: number
): { lat: number; lng: number } {
  return {
    lat: c1.lat + (c2.lat - c1.lat) * fraction,
    lng: c1.lng + (c2.lng - c1.lng) * fraction,
  };
}

// Find coordinate on a multi-segment path A -> Crossing -> B based on overall progress (0 to 1)
export function getTrainPositionOnPath(
  a: Coordinate,
  crossing: Coordinate,
  b: Coordinate,
  progress: number // 0 to 1
): { lat: number; lng: number; segment: 'A_TO_CROSSING' | 'CROSSING_TO_B' } {
  if (progress <= 0.5) {
    const fraction = progress / 0.5; // map 0-0.5 to 0-1
    return {
      ...interpolateCoords(a, crossing, fraction),
      segment: 'A_TO_CROSSING',
    };
  } else {
    const fraction = (progress - 0.5) / 0.5; // map 0.5-1 to 0-1
    return {
      ...interpolateCoords(crossing, b, fraction),
      segment: 'CROSSING_TO_B',
    };
  }
}

// Vietnam railroad intersection presets
export interface MapPreset {
  id: string;
  label: string;
  description: string;
  a: Coordinate;
  crossing: Coordinate;
  b: Coordinate;
}

export const MAP_PRESETS: MapPreset[] = [
  {
    id: 'hanoi_khamthien',
    label: 'Khâm Thiên - Điện Biên Phủ, Hà Nội',
    description: 'Tuyến đường sắt nội đô nổi tiếng đi sát khu dân cư tại phố Khâm Thiên',
    a: { lat: 21.0245, lng: 105.8412, name: 'Ga Hà Nội' },
    crossing: { lat: 21.0180, lng: 105.8418, name: 'Đường sắt rào chắn Khâm Thiên' },
    b: { lat: 21.0080, lng: 105.8425, name: 'Trạm gác Lê Duẩn (Đại Cồ Việt)' },
  },
  {
    id: 'saigon_binhtrieu',
    label: 'Giao lộ Nguyễn Văn Trỗi, TP. HCM',
    description: 'Thanh chắn đường ngang huyết mạch tại Phú Nhuận hướng về Ga Sài Gòn',
    a: { lat: 10.7816, lng: 106.6760, name: 'Ga Sài Gòn' },
    crossing: { lat: 10.7935, lng: 106.6740, name: 'Nút giao Nguyễn Văn Trỗi' },
    b: { lat: 10.8175, lng: 106.6885, name: 'Ga Gò Vấp' },
  },
  {
    id: 'tuyengac_kiemthu',
    label: 'Tuyến gác kiểm định quy chuẩn nội bộ',
    description: 'Sơ đồ định tuyến cự ly ngắn hiệu chuẩn cảm biến, tối ưu kiểm tra tốc độ phản hồi thiết bị',
    a: { lat: 21.0000, lng: 105.8000, name: 'Điểm kiểm định khởi hành (0m)' },
    crossing: { lat: 21.0015, lng: 105.8020, name: 'Điểm gác giao lộ hiệu chuẩn (150m)' },
    b: { lat: 21.0030, lng: 105.8040, name: 'Điểm kiểm định đích đến (300m)' },
  },
];
