import { supabase } from '../lib/supabase';

export interface ContentVersion {
  id: string;
  resource_type: string;
  resource_id: string;
  version_number: number;
  content_snapshot: any;
  change_summary: string | null;
  changed_fields: string[];
  created_by: string;
  created_at: string;
  is_published: boolean;
  published_at: string | null;
}

export interface ContentDraft {
  id: string;
  resource_type: string;
  resource_id: string | null;
  draft_content: any;
  based_on_version: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_locked: boolean;
  locked_by: string | null;
}

export interface ContentLock {
  id: string;
  resource_type: string;
  resource_id: string;
  locked_by: string;
  locked_at: string;
  expires_at: string;
  lock_token: string;
}

class VersionControlService {
  async createVersion(
    resourceType: string,
    resourceId: string,
    content: any,
    createdBy: string,
    changeSummary?: string,
    changedFields: string[] = []
  ): Promise<{ success: boolean; versionId?: string; error?: string }> {
    try {
      const nextVersionNumber = await this.getNextVersionNumber(resourceType, resourceId);

      const { data, error } = await supabase
        .from('content_versions')
        .insert({
          resource_type: resourceType,
          resource_id: resourceId,
          version_number: nextVersionNumber,
          content_snapshot: content,
          change_summary: changeSummary,
          changed_fields: changedFields,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      if (nextVersionNumber > 1) {
        await this.createDiff(resourceType, resourceId, data.id);
      }

      return { success: true, versionId: data.id };
    } catch (error: any) {
      console.error('Error creating version:', error);
      return { success: false, error: error.message };
    }
  }

  async getVersionHistory(
    resourceType: string,
    resourceId: string
  ): Promise<ContentVersion[]> {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*, profiles(first_name, last_name)')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching version history:', error);
      return [];
    }
  }

  async getVersion(versionId: string): Promise<ContentVersion | null> {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('id', versionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching version:', error);
      return null;
    }
  }

  async publishVersion(
    versionId: string,
    publishedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('content_versions')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', versionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error publishing version:', error);
      return { success: false, error: error.message };
    }
  }

  async rollbackToVersion(
    versionId: string,
    rolledBackBy: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        return { success: false, error: 'Version not found' };
      }

      const currentVersions = await this.getVersionHistory(
        version.resource_type,
        version.resource_id
      );
      const currentVersion = currentVersions[0];

      await supabase.from('content_rollback_log').insert({
        resource_type: version.resource_type,
        resource_id: version.resource_id,
        from_version_id: currentVersion.id,
        to_version_id: versionId,
        rolled_back_by: rolledBackBy,
        reason,
      });

      const newVersionResult = await this.createVersion(
        version.resource_type,
        version.resource_id,
        version.content_snapshot,
        rolledBackBy,
        `Rolled back to version ${version.version_number}: ${reason}`
      );

      return newVersionResult;
    } catch (error: any) {
      console.error('Error rolling back version:', error);
      return { success: false, error: error.message };
    }
  }

  async createDraft(
    resourceType: string,
    resourceId: string | null,
    draftContent: any,
    createdBy: string,
    basedOnVersion?: string
  ): Promise<{ success: boolean; draftId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .insert({
          resource_type: resourceType,
          resource_id: resourceId,
          draft_content: draftContent,
          based_on_version: basedOnVersion,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, draftId: data.id };
    } catch (error: any) {
      console.error('Error creating draft:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDraft(
    draftId: string,
    draftContent: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('content_drafts')
        .update({
          draft_content: draftContent,
          last_auto_save: new Date().toISOString(),
        })
        .eq('id', draftId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating draft:', error);
      return { success: false, error: error.message };
    }
  }

  async getDraft(draftId: string): Promise<ContentDraft | null> {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('id', draftId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching draft:', error);
      return null;
    }
  }

  async getUserDrafts(userId: string): Promise<ContentDraft[]> {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('created_by', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user drafts:', error);
      return [];
    }
  }

  async deleteDraft(draftId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('content_drafts').delete().eq('id', draftId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting draft:', error);
      return { success: false, error: error.message };
    }
  }

  async acquireLock(
    resourceType: string,
    resourceId: string,
    userId: string,
    durationMinutes: number = 30
  ): Promise<{ success: boolean; lockToken?: string; error?: string }> {
    try {
      const lockToken = this.generateLockToken();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

      const { data, error } = await supabase
        .from('content_locks')
        .insert({
          resource_type: resourceType,
          resource_id: resourceId,
          locked_by: userId,
          expires_at: expiresAt.toISOString(),
          lock_token: lockToken,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Resource is already locked' };
        }
        throw error;
      }

      return { success: true, lockToken };
    } catch (error: any) {
      console.error('Error acquiring lock:', error);
      return { success: false, error: error.message };
    }
  }

  async releaseLock(lockToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('content_locks')
        .delete()
        .eq('lock_token', lockToken);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error releasing lock:', error);
      return { success: false, error: error.message };
    }
  }

  async checkLock(
    resourceType: string,
    resourceId: string
  ): Promise<ContentLock | null> {
    try {
      const { data, error } = await supabase
        .from('content_locks')
        .select('*, profiles(first_name, last_name)')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .maybeSingle();

      if (error) throw error;

      if (data && new Date(data.expires_at) < new Date()) {
        await this.releaseLock(data.lock_token);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking lock:', error);
      return null;
    }
  }

  async schedulePublication(
    resourceType: string,
    resourceId: string,
    versionId: string,
    scheduledFor: Date,
    scheduledBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('content_scheduling').insert({
        resource_type: resourceType,
        resource_id: resourceId,
        version_id: versionId,
        action: 'publish',
        scheduled_for: scheduledFor.toISOString(),
        scheduled_by: scheduledBy,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error scheduling publication:', error);
      return { success: false, error: error.message };
    }
  }

  private async getNextVersionNumber(
    resourceType: string,
    resourceId: string
  ): Promise<number> {
    const { data, error } = await supabase
      .from('content_versions')
      .select('version_number')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error getting version number:', error);
      return 1;
    }

    return data ? data.version_number + 1 : 1;
  }

  private async createDiff(
    resourceType: string,
    resourceId: string,
    toVersionId: string
  ): Promise<void> {
    try {
      const versions = await this.getVersionHistory(resourceType, resourceId);
      if (versions.length < 2) return;

      const toVersion = versions.find((v) => v.id === toVersionId);
      const fromVersion = versions[1];

      if (!toVersion || !fromVersion) return;

      const changedFields = this.detectChangedFields(
        fromVersion.content_snapshot,
        toVersion.content_snapshot
      );

      const diffEntries = changedFields.map((field) => ({
        from_version_id: fromVersion.id,
        to_version_id: toVersionId,
        field_name: field,
        old_value: fromVersion.content_snapshot[field],
        new_value: toVersion.content_snapshot[field],
        change_type: this.getChangeType(
          fromVersion.content_snapshot[field],
          toVersion.content_snapshot[field]
        ),
      }));

      if (diffEntries.length > 0) {
        await supabase.from('content_diff').insert(diffEntries);
      }
    } catch (error) {
      console.error('Error creating diff:', error);
    }
  }

  private detectChangedFields(oldContent: any, newContent: any): string[] {
    const changed: string[] = [];
    const allKeys = new Set([...Object.keys(oldContent), ...Object.keys(newContent)]);

    allKeys.forEach((key) => {
      if (JSON.stringify(oldContent[key]) !== JSON.stringify(newContent[key])) {
        changed.push(key);
      }
    });

    return changed;
  }

  private getChangeType(
    oldValue: any,
    newValue: any
  ): 'added' | 'modified' | 'removed' {
    if (oldValue === undefined || oldValue === null) return 'added';
    if (newValue === undefined || newValue === null) return 'removed';
    return 'modified';
  }

  private generateLockToken(): string {
    return `lock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

export const versionControlService = new VersionControlService();
