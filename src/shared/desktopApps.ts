// Public product facts shared by the pages and both metadata renderers.
export const WALLPAPER_APP = {
  name: 'TD-WallpaperEngine',
  path: '/apps/td-wallpaperengine',
  sourceUrl: 'https://github.com/tienDang0805/TD_WallpaperEngine',
  releasesUrl: 'https://github.com/tienDang0805/TD_WallpaperEngine/releases/latest',
  demoUrl: 'https://github.com/tienDang0805/TD_WallpaperEngine#demo',
  version: '1.0.2',
  updatedAt: '2026-10-06',
  image: '/images/apps/td-wallpaperengine-library.png',
  settingsImage: '/images/apps/td-wallpaperengine-settings.png',
  stack: ['C#', '.NET 10', 'WPF', 'mpv'],
  description: {
    vi: 'TD-WallpaperEngine là app hình nền cho Windows do Đặng Văn Tiến làm. Dùng ảnh hoặc video làm hình nền, quản lý thư viện và tự đổi hình theo lịch.',
    en: 'TD-WallpaperEngine is a Windows wallpaper app by Đặng Văn Tiến. Use images or videos as your wallpaper, organize a library and rotate wallpapers on a schedule.',
  },
  features: {
    vi: [
      { title: 'Ảnh và video', text: 'Xem trước rồi đặt làm hình nền. Hỗ trợ video MP4 và WebM.' },
      { title: 'Thêm hình nền', text: 'Chọn file, thêm cả thư mục hoặc kéo thả vào app. Có thể tải từ URL trực tiếp và YouTube.' },
      { title: 'Thư viện riêng', text: 'Chia bộ sưu tập, đánh dấu yêu thích và tìm lại hình nền mình hay dùng.' },
      { title: 'Tự đổi theo lịch', text: 'Chọn khoảng thời gian, thứ tự ngẫu nhiên và màn hình muốn áp dụng.' },
      { title: 'Điều chỉnh playback', text: 'Chọn cách căn hình, âm lượng và FPS: gốc, 15, 30 hoặc 60.' },
      { title: 'Quản lý thư viện', text: 'Tìm file bị thiếu, nối lại thư mục đã chuyển, sao lưu media và hoàn tác dọn dẹp.' },
    ],
    en: [
      { title: 'Images and videos', text: 'Preview a wallpaper before applying it. Supports MP4 and WebM video.' },
      { title: 'Import your wallpapers', text: 'Add files or folders, drag and drop media, or download from a direct URL or YouTube.' },
      { title: 'Your own library', text: 'Organize collections, mark favorites and find the wallpapers you use most.' },
      { title: 'Scheduled rotation', text: 'Choose an interval, shuffle order and target monitor.' },
      { title: 'Playback controls', text: 'Adjust display fit, volume and frame rate: original, 15, 30 or 60 FPS.' },
      { title: 'Library maintenance', text: 'Find missing files, reconnect moved folders, back up media and undo cleanup.' },
    ],
  },
};

export function wallpaperSoftwareProperties(locale: 'vi' | 'en') {
  return {
    '@id': `https://devtiendang.blog${WALLPAPER_APP.path}#software`,
    name: WALLPAPER_APP.name,
    applicationCategory: 'DesktopEnhancementApplication',
    operatingSystem: 'Windows 10, Windows 11 (64-bit)',
    softwareVersion: WALLPAPER_APP.version,
    downloadUrl: WALLPAPER_APP.releasesUrl,
    sameAs: [WALLPAPER_APP.sourceUrl],
    featureList: WALLPAPER_APP.features[locale].map(feature => `${feature.title}: ${feature.text}`),
  };
}
