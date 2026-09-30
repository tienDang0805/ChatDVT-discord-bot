import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { SiteLayout } from '../components/SiteLayout';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';

export function NotFoundPage() {
  const { t } = useTranslation('site');
  const { pathFor } = useLanguage();
  usePageMeta(t('notFound.title'), {
    description: 'Trang bạn đang tìm không tồn tại trên devtiendang.blog.',
    noIndex: true,
  });

  return <SiteLayout>
    <section className="site-container site-hero">
      <div className="site-hero__content">
        <p className="site-kicker">404</p>
        <h1>{t('notFound.title')}.</h1>
        <p className="site-hero__copy">{t('notFound.copy')}</p>
        <div className="site-hero__actions">
          <Link to={pathFor('/')} className="site-button site-button--primary"><ArrowLeft size={17} /> {t('notFound.action')}</Link>
        </div>
      </div>
    </section>
  </SiteLayout>;
}
