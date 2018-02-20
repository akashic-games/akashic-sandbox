export interface SandboxConfig {
  /** コンテンツ起動時に流すイベント名(`events` のキーのいずれか) */
  autoSendEventName?: string;

  /** Eventsツールでリストアップされるイベント */
  events?: { [key: string]: any };

  /** ページ読み込み時にデベロッパーメニューを開く */
  showMenu?: boolean;
}
