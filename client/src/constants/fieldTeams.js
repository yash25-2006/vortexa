import {
  Car,
  Droplet,
  HeartPulse,
  GraduationCap,
  Zap,
  Wifi,
  Sprout,
  Home,
  Layers,
  HardHat
} from 'lucide-react';
import fieldTeamCategoriesRaw from '../data/fieldTeamCategories.json';
import fieldTeamsRaw from '../data/fieldTeams.json';

// Map icon names from JSON to Lucide component references
const ICON_MAP = {
  Car,
  Droplet,
  HeartPulse,
  GraduationCap,
  Zap,
  Wifi,
  Sprout,
  Home,
  Layers,
  HardHat
};

/**
 * Official Jan Setu Categories & Field Team Configuration
 * Categories loaded dynamically from client/src/data/fieldTeamCategories.json
 */
export const FIELD_TEAM_CATEGORIES = fieldTeamCategoriesRaw.map((cat) => ({
  ...cat,
  icon: ICON_MAP[cat.iconName] || Layers
}));

/**
 * Configured Field Departments & Execution Teams
 * Teams loaded dynamically from client/src/data/fieldTeams.json
 */
export const FIELD_TEAMS_DATA = fieldTeamsRaw;

/**
 * Helper to get departments / teams for a specific category
 */
export function getTeamsByCategory(categoryName) {
  if (!categoryName || categoryName === 'All') return FIELD_TEAMS_DATA;
  return FIELD_TEAMS_DATA.filter(
    (t) => t.category.toLowerCase().trim() === categoryName.toLowerCase().trim()
  );
}

/**
 * Helper to get a team by teamCode, username or ID
 */
export function getTeamByIdOrCode(idOrCode) {
  if (!idOrCode) return null;
  const target = String(idOrCode).toLowerCase().trim();
  return FIELD_TEAMS_DATA.find(
    (t) =>
      t.id.toLowerCase() === target ||
      t.teamCode.toLowerCase() === target ||
      t.email.toLowerCase() === target ||
      t.username.toLowerCase() === target
  );
}
