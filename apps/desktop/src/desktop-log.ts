function isPipeClosure(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { readonly code?: unknown }).code === "EPIPE"
  );
}

function writeDesktopLog(stream: NodeJS.WriteStream, message: string): void {
  if (stream.destroyed || !stream.writable) {
    return;
  }
  try {
    stream.write(`${message}\n`, (error) => {
      if (error && !isPipeClosure(error)) {
        stream.emit("error", error);
      }
    });
  } catch (error) {
    if (!isPipeClosure(error)) {
      throw error;
    }
  }
}

export function logDesktopInfo(message: string): void {
  writeDesktopLog(process.stdout, message);
}

export function logDesktopError(message: string): void {
  writeDesktopLog(process.stderr, message);
}
