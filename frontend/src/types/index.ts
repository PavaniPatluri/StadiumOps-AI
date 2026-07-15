export type UserRole = 'admin' | 'security' | 'medical' | 'operations' | 'volunteer';
export type IncidentType = 'medical' | 'security' | 'fire' | 'lost_child' | 'maintenance' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type DensityLevel = 'green' | 'yellow' | 'red';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location?: string;
  zone?: string;
  reporter_id?: number;
  ai_summary?: string;
  ai_recommended_actions?: string;
  ai_estimated_resolution?: string;
  created_at: string;
  updated_at?: string;
}

export interface StadiumZone {
  id: number;
  name: string;
  zone_code: string;
  capacity: number;
  current_occupancy: number;
  density_level: DensityLevel;
  x_position?: number;
  y_position?: number;
  width?: number;
  height?: number;
  updated_at: string;
}

export interface ParkingLot {
  id: number;
  name: string;
  lot_code?: string;
  total_spaces: number;
  occupied_spaces: number;
  reserved_spaces: number;
  ev_spaces: number;
  ev_occupied: number;
  distance_to_entrance?: string;
  price_per_hour: number;
  is_open: boolean;
  occupancy_percent: number;
  available_spaces: number;
}

export interface FoodCourt {
  id: number;
  name: string;
  location?: string;
  vendor_count: number;
  current_queue: number;
  avg_wait_time: number;
  capacity: number;
  is_open: boolean;
}

export interface Team {
  id: number;
  name: string;
  short_code?: string;
  country?: string;
  logo_url?: string;
  group_name?: string;
  wins: number;
  losses: number;
  draws: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

export interface Fixture {
  id: number;
  venue?: string;
  match_date?: string;
  stage?: string;
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'live' | 'completed';
  expected_attendance?: number;
  home_team?: Team;
  away_team?: Team;
}

export interface Volunteer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  zone_assigned?: string;
  shift_start?: string;
  shift_end?: string;
  is_available: boolean;
  skills?: string;
  tasks_completed: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'emergency' | 'warning' | 'info' | 'success';
  target_role?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardKPI {
  total_attendance: number;
  capacity_percent: number;
  active_incidents: number;
  resolved_incidents: number;
  parking_available: number;
  parking_percent: number;
  avg_queue_time: number;
  weather_temp: number;
  weather_condition: string;
  weather_humidity: number;
  active_volunteers: number;
  revenue_today: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
