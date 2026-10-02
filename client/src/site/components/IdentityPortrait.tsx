import { Link } from 'react-router-dom';
import { useLanguage } from '../../shared/i18n/LanguageContext';

export function IdentityPortrait() {
  const { locale, pathFor } = useLanguage();
  return <div className="identity-scene">
    <div className="identity-halo"><img className="identity-photo" src="/images/tien-dang-profile.jpg" alt="Đặng Văn Tiến" width={320} height={320} /><span className="identity-label">Mobile Software Engineer</span></div>
    <Link className="identity-sidekick" to={pathFor('/discord')}><img src="/images/chibi/chatdvt.jpg" alt="" width={56} height={56} /><div><small>{locale === 'en' ? 'MY AI SIDEKICK' : 'NGƯỜI BẠN AI MÌNH XÂY'}</small><strong>ChatDVT <span aria-hidden="true">↗</span></strong></div></Link>
  </div>;
}

