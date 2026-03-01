import { tenantTemplate } from './schema';

export const kpiTypeEnum = tenantTemplate.enum('kpi_type', [
  'numeric',
  'percentage',
  'boolean',
  'duration',
  'count',
]);

export const kpiFrequencyEnum = tenantTemplate.enum('kpi_frequency', [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
]);

export const anomalyStatusEnum = tenantTemplate.enum('anomaly_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
  'cancelled',
]);

export const anomalySeverityEnum = tenantTemplate.enum('anomaly_severity', [
  'critical',
  'major',
  'minor',
  'observation',
]);

export const actionPlanStatusEnum = tenantTemplate.enum('action_plan_status', [
  'draft',
  'pending',
  'in_progress',
  'completed',
  'overdue',
  'cancelled',
]);

export const routineFrequencyEnum = tenantTemplate.enum('routine_frequency', [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
]);

export const routineStatusEnum = tenantTemplate.enum('routine_status', [
  'scheduled',
  'in_progress',
  'completed',
  'skipped',
  'overdue',
]);

export const checklistStatusEnum = tenantTemplate.enum('checklist_status', [
  'draft',
  'in_progress',
  'completed',
  'validated',
]);

export const notificationTypeEnum = tenantTemplate.enum('notification_type', [
  'anomaly_created',
  'anomaly_assigned',
  'action_plan_due',
  'action_plan_overdue',
  'routine_due',
  'kpi_threshold_breach',
  'checklist_completed',
  'system',
]);

export const auditActionEnum = tenantTemplate.enum('audit_action', [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'approve',
  'reject',
  'assign',
  'escalate',
]);
