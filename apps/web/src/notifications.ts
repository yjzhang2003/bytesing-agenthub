import type { AgentHubEvent, Conversation, WorkbenchSnapshot } from "@agenthub/contracts";

interface AgentHubNotificationConstructor {
  readonly permission: NotificationPermission;
  requestPermission(): Promise<NotificationPermission>;
  new (title: string, options?: NotificationOptions): Notification;
}

interface NotificationTarget {
  readonly Notification?: AgentHubNotificationConstructor | undefined;
}

function currentNotificationTarget(): NotificationTarget {
  return globalThis as unknown as NotificationTarget;
}

export function canUseBrowserNotifications(
  target: NotificationTarget = currentNotificationTarget(),
): target is { readonly Notification: AgentHubNotificationConstructor } {
  return typeof target.Notification !== "undefined";
}

export async function requestAgentHubNotificationPermission(
  target: NotificationTarget = currentNotificationTarget(),
): Promise<NotificationPermission | "unsupported"> {
  if (!canUseBrowserNotifications(target)) {
    return "unsupported";
  }
  if (target.Notification.permission !== "default") {
    return target.Notification.permission;
  }
  return target.Notification.requestPermission();
}

export function notifyForAgentHubEvent(
  snapshot: Pick<WorkbenchSnapshot, "agents" | "conversations">,
  event: AgentHubEvent,
  target: NotificationTarget = currentNotificationTarget(),
): void {
  if (!canUseBrowserNotifications(target) || target.Notification.permission !== "granted") {
    return;
  }
  const notification = notificationForAgentHubEvent(snapshot, event);
  if (!notification) {
    return;
  }
  new target.Notification(notification.title, {
    body: notification.body,
    tag: notification.tag,
  });
}

export function notificationForAgentHubEvent(
  snapshot: Pick<WorkbenchSnapshot, "agents" | "conversations">,
  event: AgentHubEvent,
):
  | {
      readonly body: string;
      readonly tag: string;
      readonly title: string;
    }
  | null {
  const conversation = conversationForNotification(snapshot.conversations, event.conversationId);
  if (!conversation) {
    return null;
  }
  if (event.type === "permission.requested") {
    return {
      body: event.payload.summary,
      tag: `agenthub:${conversation.id}:permission:${event.payload.id}`,
      title: `${conversation.title} needs permission`,
    };
  }
  if (event.type === "agent.run.completed" || event.type === "agent.run.failed") {
    const agentName =
      snapshot.agents.find((agent) => agent.id === event.payload.agentId)?.displayName ?? "Agent";
    return {
      body: event.payload.message ?? `${agentName} ${event.payload.status}.`,
      tag: `agenthub:${conversation.id}:run:${event.runId ?? event.id}`,
      title:
        event.type === "agent.run.failed"
          ? `${agentName} failed in ${conversation.title}`
          : `${agentName} finished in ${conversation.title}`,
    };
  }
  return null;
}

function conversationForNotification(
  conversations: readonly Conversation[],
  conversationId: string | null,
): Conversation | null {
  if (!conversationId) {
    return null;
  }
  const conversation = conversations.find((candidate) => candidate.id === conversationId);
  if (!conversation || conversation.archivedAt || conversation.notificationsMuted) {
    return null;
  }
  return conversation;
}
