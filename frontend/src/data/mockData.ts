import type { DashboardKPI, StadiumZone, ParkingLot, FoodCourt, Incident, Notification, Team, Fixture, Volunteer } from '@/types';

export const mockKPIs: DashboardKPI = {
  total_attendance: 45230,
  capacity_percent: 69.6,
  active_incidents: 3,
  resolved_incidents: 12,
  parking_available: 1240,
  parking_percent: 58.7,
  avg_queue_time: 8.5,
  weather_temp: 28.0,
  weather_condition: 'Partly Cloudy',
  weather_humidity: 65,
  active_volunteers: 156,
  revenue_today: 198500,
  timestamp: new Date().toISOString(),
};

export const mockZones: StadiumZone[] = [
  { id: 1, name: 'North Stand', zone_code: 'NORTH', capacity: 12000, current_occupancy: 9360, density_level: 'yellow', x_position: 25, y_position: 5, width: 50, height: 15, updated_at: new Date().toISOString() },
  { id: 2, name: 'South Stand', zone_code: 'SOUTH', capacity: 12000, current_occupancy: 6240, density_level: 'green', x_position: 25, y_position: 80, width: 50, height: 15, updated_at: new Date().toISOString() },
  { id: 3, name: 'East Wing', zone_code: 'EAST', capacity: 8000, current_occupancy: 7520, density_level: 'red', x_position: 75, y_position: 30, width: 20, height: 40, updated_at: new Date().toISOString() },
  { id: 4, name: 'West Wing', zone_code: 'WEST', capacity: 8000, current_occupancy: 5680, density_level: 'yellow', x_position: 5, y_position: 30, width: 20, height: 40, updated_at: new Date().toISOString() },
  { id: 5, name: 'VIP Lounge', zone_code: 'VIP', capacity: 3000, current_occupancy: 1290, density_level: 'green', x_position: 30, y_position: 35, width: 15, height: 10, updated_at: new Date().toISOString() },
  { id: 6, name: 'Concourse A', zone_code: 'CONCOURSE_A', capacity: 5000, current_occupancy: 3400, density_level: 'yellow', x_position: 10, y_position: 20, width: 15, height: 12, updated_at: new Date().toISOString() },
  { id: 7, name: 'Concourse B', zone_code: 'CONCOURSE_B', capacity: 5000, current_occupancy: 2750, density_level: 'green', x_position: 75, y_position: 20, width: 15, height: 12, updated_at: new Date().toISOString() },
  { id: 8, name: 'Media Zone', zone_code: 'MEDIA', capacity: 800, current_occupancy: 240, density_level: 'green', x_position: 42, y_position: 20, width: 16, height: 8, updated_at: new Date().toISOString() },
  { id: 9, name: 'Field Area', zone_code: 'FIELD', capacity: 500, current_occupancy: 45, density_level: 'green', x_position: 25, y_position: 30, width: 50, height: 40, updated_at: new Date().toISOString() },
];

export const mockParking: ParkingLot[] = [
  { id: 1, name: 'Lot A – VIP & Premium', lot_code: 'LOT_A', total_spaces: 750, occupied_spaces: 652, reserved_spaces: 100, ev_spaces: 50, ev_occupied: 42, distance_to_entrance: '2 min walk', price_per_hour: 15, is_open: true, occupancy_percent: 87.0, available_spaces: 98 },
  { id: 2, name: 'Lot B – Main Entrance', lot_code: 'LOT_B', total_spaces: 1200, occupied_spaces: 744, reserved_spaces: 120, ev_spaces: 80, ev_occupied: 56, distance_to_entrance: '5 min walk', price_per_hour: 10, is_open: true, occupancy_percent: 62.0, available_spaces: 456 },
  { id: 3, name: 'Lot C – East Side', lot_code: 'LOT_C', total_spaces: 900, occupied_spaces: 405, reserved_spaces: 60, ev_spaces: 40, ev_occupied: 18, distance_to_entrance: '8 min walk', price_per_hour: 8, is_open: true, occupancy_percent: 45.0, available_spaces: 495 },
  { id: 4, name: 'Lot D – Remote (Shuttle)', lot_code: 'LOT_D', total_spaces: 2000, occupied_spaces: 460, reserved_spaces: 0, ev_spaces: 20, ev_occupied: 5, distance_to_entrance: '15 min shuttle', price_per_hour: 5, is_open: true, occupancy_percent: 23.0, available_spaces: 1540 },
];

export const mockFoodCourts: FoodCourt[] = [
  { id: 1, name: 'Zone A Grill & BBQ', location: 'North Stand Level 1', vendor_count: 6, current_queue: 145, avg_wait_time: 22, capacity: 300, is_open: true },
  { id: 2, name: 'North Concession Stand', location: 'North Entrance', vendor_count: 4, current_queue: 80, avg_wait_time: 12, capacity: 200, is_open: true },
  { id: 3, name: 'VIP Restaurant & Bar', location: 'VIP Lounge Level 2', vendor_count: 3, current_queue: 18, avg_wait_time: 4, capacity: 150, is_open: true },
  { id: 4, name: 'East Snack Bar', location: 'East Wing Concourse', vendor_count: 5, current_queue: 110, avg_wait_time: 18, capacity: 250, is_open: true },
  { id: 5, name: 'West Food Village', location: 'West Entrance Plaza', vendor_count: 8, current_queue: 62, avg_wait_time: 9, capacity: 400, is_open: true },
  { id: 6, name: 'South Gate Refreshments', location: 'South Gate Area', vendor_count: 3, current_queue: 35, avg_wait_time: 6, capacity: 180, is_open: true },
];

export const mockIncidents: Incident[] = [
  { id: 1, title: 'Suspected Heat Exhaustion', description: 'Fan in Section B-12 is showing signs of heat exhaustion. Pale, sweating, dizzy.', incident_type: 'medical', severity: 'high', status: 'in_progress', location: 'Section B-12', zone: 'North Stand', reporter_id: 3, ai_summary: 'A stadium attendee in Section B-12 is experiencing symptoms consistent with heat exhaustion including pallor, excessive sweating, and dizziness. The situation requires immediate medical attention given the current warm weather conditions.', ai_recommended_actions: '1. Deploy medical team immediately to Section B-12\n2. Move patient to shaded, cool area\n3. Provide water and electrolytes\n4. Monitor vital signs continuously\n5. Prepare ambulance standby if condition worsens', ai_estimated_resolution: '20-45 minutes', created_at: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: 2, title: 'Unauthorized Access Attempt – Gate 7', description: 'Individual attempted to bypass security checkpoint at Gate 7 without valid credentials.', incident_type: 'security', severity: 'medium', status: 'in_progress', location: 'Gate 7', zone: 'East Wing', reporter_id: 2, ai_summary: 'A security breach attempt was detected at Gate 7 where an individual tried to bypass standard security protocols. While contained, this requires investigation and increased security presence in the area.', ai_recommended_actions: '1. Detain individual for questioning\n2. Increase security presence at Gate 7\n3. Review CCTV footage of last 30 minutes\n4. Check for confederates in the area\n5. File formal incident report', ai_estimated_resolution: '30-60 minutes', created_at: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 3, title: 'Blocked Emergency Exit – East Concourse', description: 'Emergency stairwell door blocked by equipment left by maintenance crew.', incident_type: 'maintenance', severity: 'medium', status: 'open', location: 'East Concourse Level 2', zone: 'East Wing', reporter_id: 4, ai_summary: 'An emergency exit in the East Concourse Level 2 is obstructed by maintenance equipment, creating a potential safety hazard that violates fire safety regulations.', ai_recommended_actions: '1. Dispatch maintenance crew immediately\n2. Remove all obstructions from exit\n3. Verify all emergency exits are clear\n4. File maintenance compliance report\n5. Brief maintenance crew on safety protocols', ai_estimated_resolution: '15-30 minutes', created_at: new Date(Date.now() - 10 * 60000).toISOString() },
];

export const mockNotifications: Notification[] = [
  { id: 1, title: '🚨 Crowd Alert: East Wing', message: 'East Wing is at 94% capacity. Redirect fans to West Gate.', notification_type: 'emergency', target_role: 'security', is_read: false, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 2, title: '⚠️ Parking Lot A Near Full', message: 'Lot A at 87%. Activate overflow to Lot C in ~35 mins.', notification_type: 'warning', target_role: 'operations', is_read: false, created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 3, title: '🌡️ Heat Advisory', message: 'Temperature 32°C. Water stations activated.', notification_type: 'warning', target_role: 'all', is_read: false, created_at: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: 4, title: '✅ Medical Incident Resolved', message: 'Medical incident at Section B-12 resolved. Patient transported.', notification_type: 'success', target_role: 'medical', is_read: true, created_at: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: 5, title: '🔴 Live Match Started', message: 'Team Alpha FC vs Striker FC kicked off. 65K attendance expected.', notification_type: 'info', target_role: 'all', is_read: true, created_at: new Date(Date.now() - 65 * 60000).toISOString() },
];

export const mockTeams: Team[] = [
  { id: 1, name: 'Team Alpha FC', short_code: 'ALP', country: 'USA', group_name: 'Group A', wins: 2, losses: 0, draws: 1, goals_for: 6, goals_against: 2, points: 7 },
  { id: 2, name: 'Delta United', short_code: 'DEL', country: 'Brazil', group_name: 'Group A', wins: 1, losses: 1, draws: 1, goals_for: 4, goals_against: 4, points: 4 },
  { id: 3, name: 'Striker FC', short_code: 'STR', country: 'Germany', group_name: 'Group A', wins: 1, losses: 1, draws: 1, goals_for: 3, goals_against: 3, points: 4 },
  { id: 4, name: 'Phoenix FC', short_code: 'PHX', country: 'Spain', group_name: 'Group A', wins: 0, losses: 2, draws: 1, goals_for: 2, goals_against: 6, points: 1 },
  { id: 5, name: 'Titan Athletic', short_code: 'TIT', country: 'France', group_name: 'Group B', wins: 3, losses: 0, draws: 0, goals_for: 8, goals_against: 1, points: 9 },
  { id: 6, name: 'Storm City SC', short_code: 'STM', country: 'Italy', group_name: 'Group B', wins: 2, losses: 1, draws: 0, goals_for: 5, goals_against: 3, points: 6 },
  { id: 7, name: 'Iron Eagles FC', short_code: 'IRN', country: 'England', group_name: 'Group B', wins: 1, losses: 2, draws: 0, goals_for: 3, goals_against: 6, points: 3 },
  { id: 8, name: 'Coastal Warriors', short_code: 'CST', country: 'Portugal', group_name: 'Group B', wins: 0, losses: 3, draws: 0, goals_for: 1, goals_against: 7, points: 0 },
];

export const mockVolunteers: Volunteer[] = [
  { id: 1, name: 'James Wilson', role: 'Crowd Controller', zone_assigned: 'East Wing', is_available: false, skills: 'Crowd Control, Communication', tasks_completed: 8, shift_start: new Date().toISOString(), shift_end: new Date(Date.now() + 4 * 3600000).toISOString() },
  { id: 2, name: 'Emma Davis', role: 'Medical Support', zone_assigned: 'North Stand', is_available: true, skills: 'First Aid, CPR', tasks_completed: 5, shift_start: new Date().toISOString(), shift_end: new Date(Date.now() + 4 * 3600000).toISOString() },
  { id: 3, name: 'Carlos Rodriguez', role: 'Gate Manager', zone_assigned: 'Main Entrance', is_available: false, skills: 'Languages, Customer Service', tasks_completed: 12, shift_start: new Date().toISOString(), shift_end: new Date(Date.now() + 4 * 3600000).toISOString() },
  { id: 4, name: 'Priya Patel', role: 'Parking Guide', zone_assigned: 'Parking Lot A', is_available: true, skills: 'Parking Management', tasks_completed: 6, shift_start: new Date().toISOString(), shift_end: new Date(Date.now() + 4 * 3600000).toISOString() },
  { id: 5, name: 'Michael Johnson', role: 'Information Desk', zone_assigned: 'Concourse A', is_available: true, skills: 'Customer Service, Languages', tasks_completed: 3, shift_start: new Date().toISOString(), shift_end: new Date(Date.now() + 4 * 3600000).toISOString() },
  { id: 6, name: 'Sophie Turner', role: 'Security Assist', zone_assigned: 'Gate B', is_available: false, skills: 'Security Protocol, Communication', tasks_completed: 9, shift_start: new Date().toISOString(), shift_end: new Date(Date.now() + 4 * 3600000).toISOString() },
];

export const mockAttendanceTrend = Array.from({ length: 15 }, (_, i) => {
  const hour = 8 + i;
  const factors: Record<number, number> = { 8: 2000, 9: 3500, 10: 5800, 11: 9200, 12: 13500, 13: 18000, 14: 24000, 15: 31000, 16: 37000, 17: 43000, 18: 47000, 19: 45000, 20: 42000, 21: 38000, 22: 32000 };
  return { time: `${String(hour).padStart(2, '0')}:00`, attendance: factors[hour] || 20000, arrivals: Math.floor(Math.random() * 1500 + 500), departures: Math.floor(Math.random() * 600 + 100) };
});
