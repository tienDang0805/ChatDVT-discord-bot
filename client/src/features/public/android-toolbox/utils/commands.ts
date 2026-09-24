export const PERMISSIONS = [
  ['android.permission.POST_NOTIFICATIONS', 'Thông báo (Android 13+)'],
  ['android.permission.CAMERA', 'Camera'],
  ['android.permission.RECORD_AUDIO', 'Microphone'],
  ['android.permission.ACCESS_FINE_LOCATION', 'Vị trí chính xác'],
  ['android.permission.ACCESS_COARSE_LOCATION', 'Vị trí gần đúng'],
  ['android.permission.READ_CONTACTS', 'Danh bạ'],
] as const;

export type AppAction = 'launch' | 'stop' | 'clear' | 'settings' | 'grant' | 'revoke';

export function packageId(value: string): string {
  const result = value.trim();
  if (!/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(result)) {
    throw new Error('Nhập package hợp lệ, ví dụ com.example.app.');
  }
  return result;
}

export function appCommand(action: AppAction, value: string, permission?: string): string[] {
  const pkg = packageId(value);
  switch (action) {
    case 'launch': return ['monkey', '-p', pkg, '-c', 'android.intent.category.LAUNCHER', '1'];
    case 'stop': return ['am', 'force-stop', pkg];
    case 'clear': return ['pm', 'clear', pkg];
    case 'settings': return ['am', 'start', '-a', 'android.settings.APPLICATION_DETAILS_SETTINGS', '-d', `package:${pkg}`];
    case 'grant':
    case 'revoke':
      if (!PERMISSIONS.some(([id]) => id === permission)) throw new Error('Permission không được hỗ trợ.');
      return ['pm', action, pkg, permission!];
  }
}

export function metroCommand(serial: string, port: string): string {
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new Error('Port phải từ 1 đến 65535.');
  }
  // Device serials come from USB descriptors; never interpolate them unquoted into a shell.
  const quoted = `'${serial.replace(/'/g, "'\\''")}'`;
  return `adb${serial ? ` -s ${quoted}` : ''} reverse tcp:${Number(port)} tcp:${Number(port)}`;
}

export function commandFailure(stdout: string, stderr: string, exitCode: number): string | undefined {
  const output = [stdout, stderr].filter(Boolean).join('\n').trim();
  // Android utilities can report a failed operation with exit code 0.
  if (exitCode !== 0 || /(^|\n)\s*(?:Error:|Error type \d|Failure\b|SecurityException|Exception occurred|\*\* No activities found|\*\* Monkey aborted)/im.test(output)) {
    return output || `Lệnh thất bại (exit ${exitCode}).`;
  }
}

export function connectionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/claim|busy|in use|access denied/i.test(message)) {
    return 'USB đang bị ADB hoặc ứng dụng khác giữ. Tạm ngừng chạy/debug trong Android Studio, chạy adb kill-server, đóng tab WebADB khác rồi kết nối lại. Windows có thể cần driver ADB.';
  }
  if (/notfound|no device selected/i.test(message)) return 'Chưa chọn thiết bị. Bấm Kết nối USB để thử lại.';
  if (/security|permission|access|notallowed/i.test(message)) return `Không truy cập được thiết bị. Kiểm tra quyền USB của trang và xác nhận trên điện thoại. ${message}`;
  return message;
}
