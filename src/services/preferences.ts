/**
 * Preferences Service
 * Manages user preferences with sensible defaults
 */

import { UserPreferences, loadPreferences, savePreferences } from './storage';

/**
 * Default preferences for new users
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en-US',
  features: {
    enableCommitTweets: true,
    enableAchievementTweets: true,
    enableLearningTweets: true,
  },
};

/**
 * PreferencesService
 * Provides preference management with defaults
 */
export class PreferencesService {
  /**
   * Get user preferences
   * Returns defaults if no preferences file exists
   */
  getPreferences(): UserPreferences {
    const preferences = loadPreferences();

    if (!preferences) {
      return { ...DEFAULT_PREFERENCES };
    }

    return preferences;
  }

  /**
   * Update user preferences
   * Merges partial updates with existing config
   */
  updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();

    const updated: UserPreferences = {
      ...current,
      ...updates,
      features: {
        ...current.features,
        ...(updates.features || {}),
      },
    };

    savePreferences(updated);

    return updated;
  }
}

/**
 * Singleton instance
 */
export const preferencesService = new PreferencesService();
