import { Navigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../shared/i18n/LanguageContext';

// Keep bookmarked Mobile URLs useful after merging navigation destinations.
export function MobilePage() {
  const { pathFor } = useLanguage();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set('category', 'mobile');
  return <Navigate replace to={`${pathFor('/playground')}?${params.toString()}`} />;
}
