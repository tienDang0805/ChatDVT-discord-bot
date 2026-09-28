import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { SiteLayout } from '../components/SiteLayout';

export function NotFoundPage() {
  usePageMeta('Không tìm thấy trang', {
    description: 'Trang bạn đang tìm không tồn tại trên devtiendang.blog.',
    noIndex: true,
  });

  return <SiteLayout>
    <section className="site-container site-hero">
      <div className="site-hero__content">
        <p className="site-kicker">404</p>
        <h1>Không tìm thấy trang.</h1>
        <p className="site-hero__copy">Đường dẫn này không tồn tại hoặc đã được chuyển sang nơi khác.</p>
        <div className="site-hero__actions">
          <Link to="/" className="site-button site-button--primary"><ArrowLeft size={17} /> Về trang chủ</Link>
        </div>
      </div>
    </section>
  </SiteLayout>;
}
