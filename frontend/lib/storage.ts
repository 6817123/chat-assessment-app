import { Conversation, Settings } from "./types";

// Storage keys
const STORAGE_KEYS = {
  CONVERSATIONS: "chat_conversations",
  SETTINGS: "chat_settings",
  ACTIVE_CONVERSATION: "chat_active_conversation",
} as const;

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  theme: "system",
  fontSize: "medium",
  features: {
    audio: true,
    tts: false,
    thinkingIndicator: true,
  },
};

// Generic localStorage helpers
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error parsing localStorage item ${key}:`, error);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage item ${key}:`, error);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage item ${key}:`, error);
  }
}

// Conversation storage
export function getConversations(): Conversation[] {
  const conversations = getStorageItem(STORAGE_KEYS.CONVERSATIONS, []);
  return conversations.map((conv: any) => ({
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
    messages: conv.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    })),
  }));
}

export function saveConversations(conversations: Conversation[]): void {
  setStorageItem(STORAGE_KEYS.CONVERSATIONS, conversations);
}

export function saveConversation(conversation: Conversation): void {
  const conversations = getConversations();
  const existingIndex = conversations.findIndex(
    (c) => c.id === conversation.id
  );

  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.unshift(conversation);
  }

  saveConversations(conversations);
}

export function deleteConversation(conversationId: string): void {
  const conversations = getConversations();
  const filtered = conversations.filter((c) => c.id !== conversationId);
  saveConversations(filtered);
}

// Settings storage
export function getSettings(): Settings {
  return getStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): void {
  setStorageItem(STORAGE_KEYS.SETTINGS, settings);
}

export function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Settings {
  const settings = getSettings();
  const updatedSettings = { ...settings, [key]: value };
  saveSettings(updatedSettings);
  return updatedSettings;
}

export function updateFeatureSetting(
  feature: keyof Settings["features"],
  enabled: boolean
): Settings {
  const settings = getSettings();
  const updatedSettings = {
    ...settings,
    features: {
      ...settings.features,
      [feature]: enabled,
    },
  };
  saveSettings(updatedSettings);
  return updatedSettings;
}

// Active conversation storage
export function getActiveConversationId(): string | null {
  return getStorageItem(STORAGE_KEYS.ACTIVE_CONVERSATION, null);
}

export function setActiveConversationId(conversationId: string | null): void {
  if (conversationId) {
    setStorageItem(STORAGE_KEYS.ACTIVE_CONVERSATION, conversationId);
  } else {
    removeStorageItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorageItem(key);
  });
}

export function exportData() {
  return {
    conversations: getConversations(),
    settings: getSettings(),
    activeConversationId: getActiveConversationId(),
    exportedAt: new Date().toISOString(),
  };
}

export function importData(data: any): void {
  if (data.conversations) {
    saveConversations(data.conversations);
  }
  if (data.settings) {
    saveSettings(data.settings);
  }
  if (data.activeConversationId) {
    setActiveConversationId(data.activeConversationId);
  }
}
