// Xela-Elite Access Control & Audit System
// Enforces environment isolation, identity binding, and action logging

export type UserRole = 'owner' | 'contributor';

export interface XelaUser {
    id: string;
    name: string;
    role: UserRole;
}

export interface AuditEntry {
    timestamp: string;
    userId: string;
    agentId?: string;
    action: string;
    target?: string;
    result: 'success' | 'denied' | 'error';
    details?: string;
    tokensUsed?: number;
}

// User registry — in production, this comes from Firestore
const USER_REGISTRY: Record<string, XelaUser> = {
    'alex-001': { id: 'alex-001', name: 'Alex Weatherspoon', role: 'owner' },
    'david-002': { id: 'david-002', name: 'David Weatherspoon', role: 'owner' },
    'amber-003': { id: 'amber-003', name: 'Amber Wolfe', role: 'contributor' },
    'zeta-004': { id: 'zeta-004', name: 'Zeta Nova', role: 'contributor' },
    'amanda-005': { id: 'amanda-005', name: 'Amanda Davidson', role: 'contributor' },
    'sam-006': { id: 'sam-006', name: 'Sam Malikarjinon', role: 'contributor' },
};

// Audit log buffer — in production, writes to Firestore
const auditBuffer: AuditEntry[] = [];

export const getUser = (userId: string): XelaUser | null => {
    return USER_REGISTRY[userId] || null;
};

export const isOwner = (userId: string): boolean => {
    return USER_REGISTRY[userId]?.role === 'owner';
};

// Permission checks
export const canWriteShared = (userId: string): boolean => {
    return isOwner(userId);
};

export const canReadOther = (userId: string, targetUserId: string): boolean => {
    // Owners can read all audit logs; nobody can read another user's .keys/
    return isOwner(userId) && userId !== targetUserId;
};

export const canModifySkill = (userId: string, skillPath: string): boolean => {
    // Shared skills: owners only
    if (skillPath.startsWith('shared/')) return isOwner(userId);
    // Own skills: always
    if (skillPath.startsWith(`users/${userId}/`)) return true;
    // Other user's skills: never
    return false;
};

export const canAccessApiKey = (userId: string, keyOwnerId: string): boolean => {
    // Users can only access their own API keys
    return userId === keyOwnerId;
};

// Audit logging
export const logAction = (entry: AuditEntry): void => {
    const fullEntry = {
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString()
    };

    auditBuffer.push(fullEntry);

    // Production: audit entries written to Firestore
};

// Body grab detection
export interface BodyGrabSignal {
    type: 'identity_switch' | 'wrong_api_key' | 'cross_env_write' | 'unauthorized_shared_modify' | 'governance_generation' | 'cross_env_communication';
    severity: 'warning' | 'critical';
    action: 'log' | 'deny' | 'kill_session' | 'alert_owner';
}

export const detectBodyGrab = (
    currentUserId: string,
    claimedUserId: string,
    action: string,
    target: string
): BodyGrabSignal | null => {
    // Signal 1: Agent claims different identity
    if (currentUserId !== claimedUserId) {
        return {
            type: 'identity_switch',
            severity: 'critical',
            action: 'kill_session'
        };
    }

    // Signal 2: Writing to another user's environment
    if (action === 'file.write' && target.startsWith('users/') && !target.startsWith(`users/${currentUserId}/`)) {
        return {
            type: 'cross_env_write',
            severity: 'critical',
            action: 'deny'
        };
    }

    // Signal 3: Non-owner modifying shared
    if (action === 'skill.modify' && target.startsWith('shared/') && !isOwner(currentUserId)) {
        return {
            type: 'unauthorized_shared_modify',
            severity: 'critical',
            action: 'deny'
        };
    }

    return null;
};

// Enforcement wrapper — wraps any action with permission check + audit
export const enforceAction = (
    userId: string,
    action: string,
    target: string,
    execute: () => any
): { success: boolean; result?: any; denied?: string } => {
    // Check for body grab
    const bgSignal = detectBodyGrab(userId, userId, action, target);
    if (bgSignal) {
        logAction({
            timestamp: new Date().toISOString(),
            userId,
            action,
            target,
            result: 'denied',
            details: `Body grab detected: ${bgSignal.type}`
        });
        return { success: false, denied: `Body grab signal: ${bgSignal.type}` };
    }

    // Check permissions
    if (action === 'skill.modify' && !canModifySkill(userId, target)) {
        logAction({
            timestamp: new Date().toISOString(),
            userId,
            action,
            target,
            result: 'denied',
            details: 'Insufficient permissions for skill modification'
        });
        return { success: false, denied: 'Cannot modify this skill — insufficient permissions' };
    }

    if (action === 'api_key.access' && !canAccessApiKey(userId, target)) {
        logAction({
            timestamp: new Date().toISOString(),
            userId,
            action,
            target,
            result: 'denied',
            details: 'Cannot access another user\'s API key'
        });
        return { success: false, denied: 'API key access denied — not your key' };
    }

    // Execute the action
    try {
        const result = execute();
        logAction({
            timestamp: new Date().toISOString(),
            userId,
            action,
            target,
            result: 'success'
        });
        return { success: true, result };
    } catch (err: any) {
        logAction({
            timestamp: new Date().toISOString(),
            userId,
            action,
            target,
            result: 'error',
            details: err.message
        });
        return { success: false, denied: err.message };
    }
};

// Get audit log for a user (owners see all, contributors see own)
export const getAuditLog = (requesterId: string, targetUserId?: string): AuditEntry[] => {
    if (isOwner(requesterId)) {
        return targetUserId
            ? auditBuffer.filter(e => e.userId === targetUserId)
            : [...auditBuffer];
    }
    // Contributors can only see their own
    return auditBuffer.filter(e => e.userId === requesterId);
};
