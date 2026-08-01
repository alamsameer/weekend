export type ProgressEvent =
  | { type: "start"; total: number }
  | { type: "progress"; updated: number; total: number }
  | { type: "done"; updated: number; total: number }
  | { type: "error"; message: string };

export async function readNdjsonProgress(
  res: Response,
  onEvent: (ev: ProgressEvent) => void,
): Promise<ProgressEvent> {
  if (!res.ok || !res.body) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let last: ProgressEvent = { type: "start", total: 0 };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const ev = JSON.parse(line) as ProgressEvent;
      last = ev;
      onEvent(ev);
      if (ev.type === "error") throw new Error(ev.message);
    }
  }

  if (buffer.trim()) {
    const ev = JSON.parse(buffer) as ProgressEvent;
    last = ev;
    onEvent(ev);
    if (ev.type === "error") throw new Error(ev.message);
  }

  return last;
}
