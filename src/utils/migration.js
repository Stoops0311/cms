// Migration utilities for transitioning from localStorage to Convex
// UltraThink: This module handles the critical transition between storage systems
// with comprehensive error handling, validation, and rollback capabilities

import { toast } from '@/components/ui/use-toast.jsx';

export class MigrationManager {
  constructor(convexClient) {
    this.convex = convexClient;
    this.backupPrefix = 'cms_backup_';
    this.migrationLog = [];
  }

  // Create complete backup of localStorage data before migration
  async backupLocalStorage() {
    const backup = {};
    const timestamp = new Date().toISOString();
    
    try {
      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith(this.backupPrefix)) {
          backup[key] = localStorage.getItem(key);
        }
      }
      
      // Store backup with timestamp
      const backupKey = `${this.backupPrefix}${timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      this.log('BACKUP_CREATED', `Backup created: ${backupKey}`);
      return backupKey;
    } catch (error) {
      this.log('BACKUP_ERROR', `Failed to create backup: ${error.message}`);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  // Validate data integrity after migration
  async validateMigration(originalData, convexData) {
    const issues = [];
    
    // Check record counts
    if (originalData.length !== convexData.length) {
      issues.push(`Record count mismatch: ${originalData.length} vs ${convexData.length}`);
    }
    
    // Check essential fields exist
    for (const original of originalData) {
      const migrated = convexData.find(item => item.id === original.id);
      if (!migrated) {
        issues.push(`Missing record: ${original.id}`);
        continue;
      }
      
      // Validate key fields based on data type
      const keyFields = this.getKeyFieldsForValidation(original);
      for (const field of keyFields) {
        if (original[field] && !migrated[field]) {
          issues.push(`Missing field ${field} in record ${original.id}`);
        }
      }
    }
    
    return issues;
  }

  // Rollback migration by restoring from backup
  async rollbackMigration(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      const backup = JSON.parse(backupData);
      
      // Clear current localStorage (except backups)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith(this.backupPrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Restore from backup
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      this.log('ROLLBACK_SUCCESS', `Rolled back to backup: ${backupKey}`);
      toast({ title: "Rollback Complete", description: "Data restored from backup" });
    } catch (error) {
      this.log('ROLLBACK_ERROR', `Rollback failed: ${error.message}`);
      throw error;
    }
  }

  // Migrate specific data type from localStorage to Convex
  async migrateDataType(dataType, localStorageKey, convexMutation) {
    try {
      const localData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
      if (localData.length === 0) {
        this.log('MIGRATION_SKIP', `No data to migrate for ${dataType}`);
        return [];
      }

      const migrated = [];
      
      for (const item of localData) {
        try {
          // Add migration metadata
          const migrationData = {
            ...item,
            migratedFrom: 'localStorage',
            migrationDate: new Date().toISOString(),
            originalKey: localStorageKey
          };
          
          const result = await this.convex.mutation(convexMutation, migrationData);
          migrated.push(result);
          
          this.log('MIGRATION_ITEM', `Migrated ${dataType} item: ${item.id || 'unknown'}`);
        } catch (itemError) {
          this.log('MIGRATION_ITEM_ERROR', `Failed to migrate ${dataType} item: ${itemError.message}`);
          throw itemError;
        }
      }
      
      this.log('MIGRATION_COMPLETE', `Migrated ${migrated.length} ${dataType} records`);
      return migrated;
    } catch (error) {
      this.log('MIGRATION_ERROR', `Migration failed for ${dataType}: ${error.message}`);
      throw error;
    }
  }

  // Get essential fields for validation based on data structure
  getKeyFieldsForValidation(data) {
    const commonFields = ['id', 'name', 'title'];
    const typeSpecificFields = {
      projectName: ['projectName', 'clientInfo'],
      equipmentName: ['equipmentName', 'equipmentType'],
      fullName: ['fullName', 'email'],
      staffName: ['staffName', 'employeeId']
    };
    
    // Determine data type and return relevant fields
    for (const [field, requiredFields] of Object.entries(typeSpecificFields)) {
      if (data[field]) {
        return [...commonFields, ...requiredFields];
      }
    }
    
    return commonFields;
  }

  // Log migration activities
  log(type, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    
    this.migrationLog.push(logEntry);
    console.log(`[MIGRATION ${type}] ${message}`);
    
    // Store log in localStorage for debugging
    localStorage.setItem('cms_migration_log', JSON.stringify(this.migrationLog));
  }

  // Get migration log
  getLog() {
    return this.migrationLog;
  }

  // Clean up old backups (keep last 5)
  cleanupOldBackups() {
    const backupKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.backupPrefix)) {
        backupKeys.push(key);
      }
    }
    
    // Sort by timestamp (newest first)
    backupKeys.sort((a, b) => b.localeCompare(a));
    
    // Remove old backups (keep latest 5)
    if (backupKeys.length > 5) {
      const toRemove = backupKeys.slice(5);
      toRemove.forEach(key => {
        localStorage.removeItem(key);
        this.log('CLEANUP', `Removed old backup: ${key}`);
      });
    }
  }
}

// Utility functions for specific migrations
export const migrationPresets = {
  async migrateProjects(convex) {
    const manager = new MigrationManager(convex);
    await manager.migrateDataType('projects', 'projects', 'projects.createProject');
  },
  
  async migrateAttendance(convex) {
    const manager = new MigrationManager(convex);
    await manager.migrateDataType('attendance', 'attendanceLog', 'attendance.createAttendanceRecord');
  },
  
  async migrateEquipment(convex) {
    const manager = new MigrationManager(convex);
    await manager.migrateDataType('equipment', 'cmsEquipment', 'equipment.createEquipment');
  },
  
  async migrateAlerts(convex) {
    const manager = new MigrationManager(convex);
    await manager.migrateDataType('alerts', 'cmsUrgentAlerts', 'communications.createNotice');
  }
};

// Export default migration manager instance
export default MigrationManager;