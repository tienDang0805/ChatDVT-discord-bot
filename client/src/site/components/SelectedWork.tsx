import { useLanguage } from '../../shared/i18n/LanguageContext';
import { Reveal } from './Reveal';
import { WorkVisual } from './WorkVisual';
import { WorkTechTags } from './WorkTechTags';

const work = [
  {
    visual: 'scanner',
    category: 'ANDROID · ON-DEVICE VISION',
    title: ['Quét nhiều hộp sản phẩm trong một lần chụp.', 'Scan multiple product boxes in one capture.'],
    intro: ['SDK Android giúp ứng dụng bán lẻ nhận diện nhiều hộp sản phẩm, đọc barcode và trả về Serial Number (SN) cùng Product ID (PID).', 'An Android SDK for retailers that detects multiple product boxes, reads barcodes and returns a Serial Number (SN) and Product ID (PID) for each box.'],
    contribution: ['Mình phụ trách SDK Android từ giao diện camera, xử lý ảnh và tích hợp hai model của team AI đến kết nối backend và phát hành thư viện cho team sản phẩm.', 'I built the SDK end to end, from the camera UI, image processing and integration of two AI-team models to backend integration and release for the product team.'],
    tech: ['Kotlin', 'CameraX', 'TensorFlow Lite', 'ML Kit', 'Gradle', 'Maven'],
  },
  {
    visual: 'systems',
    category: 'REACT NATIVE · MOBILE SYSTEMS',
    title: ['React Native, từ nghiệp vụ đến hạ tầng mobile.', 'React Native, from business workflows to mobile infrastructure.'],
    intro: ['Phát triển ứng dụng B2B, xử lý luồng nghiệp vụ, xây SDK analytics hỗ trợ offline và nâng cấp các ứng dụng React Native đang vận hành.', 'Built B2B apps and business workflows, developed an offline-capable analytics SDK, and upgraded React Native applications in production.'],
    contribution: ['Mình làm tính năng CRM, xây SDK analytics lưu sự kiện offline và nâng cấp React Native từ 0.62.2 lên 0.77.3 trên ứng dụng production.', 'I built CRM features and an offline-capable analytics SDK, and upgraded a production app from React Native 0.62.2 to 0.77.3.'],
    tech: ['React Native', 'TypeScript', 'Redux', 'MMKV', 'REST API', 'Android', 'Gradle'],
  },
  {
    visual: 'robot',
    category: 'REACT NATIVE · ANDROID · FIELD DELIVERY',
    title: ['Tablet điều khiển robot Woni.', 'The tablet that runs Woni.'],
    intro: ['Khách chọn dịch vụ trên tablet. Woni in phiếu và dẫn khách đến đúng quầy giao dịch.', 'Customers select a service on the tablet. Woni prints a ticket and guides them to the right counter.'],
    contribution: ['Mình phát triển app React Native trên tablet Android 6.0 (API 23) và tích hợp SDK hãng qua Java bridge. Làm việc với khách hàng từ lúc nhận yêu cầu đến triển khai tại ngân hàng và bàn giao cho đội FSE.', 'I built the React Native app for the Android 6.0 (API 23) tablet and integrated the vendor SDK through a Java bridge. I worked with customers from requirements through onsite deployment and handover to the field service team.'],
    tech: ['React Native', 'Java', 'Android Tablet', 'Native Bridge', 'Vendor SDK'],
  },
] as const;

const scanDetails = [
  ['CameraX ImageAnalysis chuẩn bị frame và xử lý rotation.', 'CameraX ImageAnalysis prepares frames and handles rotation.'],
  ['Hai model TensorFlow Lite do AI team cung cấp nhận diện hộp sản phẩm và vùng barcode khi người dùng nhấn Scan.', 'Two TensorFlow Lite models supplied by the AI team detect product boxes and barcode regions when the user presses Scan.'],
  ['Google ML Kit giải mã barcode. AI backend hỗ trợ xác định SN, còn logic nghiệp vụ phân loại PID.', 'Google ML Kit decodes barcodes. The AI backend helps identify serial numbers, and business rules classify product IDs.'],
  ['Đóng gói AAR và phát hành phiên bản qua kho Maven riêng trên Repsy.', 'Packaged the AAR and published versioned releases through private Repsy Maven.'],
] as const;

export function SelectedWork() {
  const { locale } = useLanguage();
  const en = locale === 'en', language = en ? 1 : 0;
  return <div className="lh-work-grid">{work.map((item, index) => (
    <Reveal key={item.category}>
      <article className={'lh-work-card lh-work-card--' + index}>
        <div className="work-case-copy">
          <p className="lh-kicker work-case-kicker"><span className="lh-section-number">0{index + 1}</span>{item.category}</p>
          <h3>{item.title[language]}</h3>
          <p>{item.intro[language]}</p>
          <h4>{en ? 'My contribution' : 'Phần mình phụ trách'}</h4>
          <p>{item.contribution[language]}</p>
          {index === 0 && <details className="work-case-details">
            <summary>{en ? 'Technical details' : 'Chi tiết kỹ thuật'}</summary>
            <ul>{scanDetails.map(detail => <li key={detail[0]}>{detail[language]}</li>)}</ul>
          </details>}
          <WorkTechTags items={item.tech} en={en} />
        </div>
        <WorkVisual kind={item.visual} />
      </article>
    </Reveal>
  ))}</div>;
}
