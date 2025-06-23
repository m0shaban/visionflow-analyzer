export enum AnalysisStatus {
  Idle = 'Idle',
  Processing = 'Processing',
  Success = 'Success',
  Error = 'Error',
  Paused = 'Paused',
}

export interface VehicleTypeCount {
  type: string; // "car", "bus", "truck", "motorcycle", "other"
  count: number;
}

export interface BoundingBox { // Normalized coordinates (0.0 to 1.0)
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
  label?: string; // Optional label for the box itself
}

export interface DetectedVehicleInstance {
  type: string; // "car", "bus", "truck", "motorcycle", "other"
  bounding_box: BoundingBox;
  confidence?: number; // Optional
}

export interface UnusualActivity {
  detected: boolean;
  description: string;
  activity_type?: string | null; // e.g., "Stopped Vehicle", "Pedestrian On Road", null if not applicable
  bounding_box?: BoundingBox | null; // Area of unusual activity, null if not applicable
}

export interface FrameAnalysisDataFromAI {
  total_vehicles: number; // Overall count
  vehicle_type_counts: VehicleTypeCount[]; // Aggregated counts for chart e.g. {"type": "car", "count": 5}
  detected_vehicle_instances: DetectedVehicleInstance[]; // For drawing boxes on the image
  congestion_level: "Light" | "Moderate" | "Heavy" | "Congested" | "Unknown";
  description: string; // General scene description
  unusual_activity: UnusualActivity | null; // Info about unusual events
}

export interface ProcessedFrameData extends FrameAnalysisDataFromAI {
  timestamp: number; // in seconds, relative to video start or analysis start
  frameImageBase64: string; // base64 of the analyzed frame
}

export interface PeakCongestionMoment {
  timestamp: number;
  total_vehicles: number;
  congestion_level: string;
  frameImageBase64?: string; // Added for thumbnail display
}

export interface OverallTrafficSummary {
  totalFramesAnalyzed: number;
  totalVehiclesDetectedAcrossFrames: number;
  averageVehiclesPerFrame: number;
  peakCongestionMoments: PeakCongestionMoment[]; // Updated to use PeakCongestionMoment
  vehicleTypeDistribution: VehicleTypeCount[]; // Aggregated across all frames
  commonCongestionLevels: { level: string; count: number }[];
  detectedUnusualActivitiesCount: number; // Total count of frames with unusual activities
  mostCommonUnusualActivityTypes: { type: string; count: number }[]; // Summary of unusual activity types
}