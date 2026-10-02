import { ArrowUpRight, Github, Linkedin, Mail, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout, SectionHeading, ArrowLink } from '../components/SiteLayout';
import { IdentityPortrait } from '../components/IdentityPortrait';
import { profile, contributions, skillFamilies } from '../content/profileData';

export function MePage() {
  const { locale, pathFor } = useLanguage();
  const en = locale === 'en', language = en ? 1 : 0;
  usePageMeta('Đặng Văn Tiến — Mobile Software Engineer', { description: en ? 'React Native and Android/Kotlin engineer at South Telecom in Ho Chi Minh City. Experience, skills, personal projects and contact.' : 'Mobile Software Engineer tại South Telecom, TP.HCM. Kinh nghiệm React Native, Android/Kotlin, SDK, sản phẩm cá nhân và liên hệ.', schema: 'profile' });
  usePageTracker('Me');
  return <SiteLayout>
    <section className="site-container identity-hero identity-hero--me"><div>
      <p className="site-kicker"><span className="site-status-dot" />{en ? 'ABOUT ME · ĐẶNG VĂN TIẾN' : 'VỀ MÌNH · ĐẶNG VĂN TIẾN'}</p>
      <h1>{en ? 'Mobile is my main work.' : 'Mobile là công việc chính.'}<br /><em>{en ? 'Curiosity keeps me building.' : 'Tò mò là lý do mình tự xây.'}</em></h1>
      <p className="identity-lead">{en ? 'I work at South Telecom, developing React Native applications and native Android components. Outside work, I experiment with AI, build useful tools and write about what I learn.' : 'Mình làm việc tại South Telecom, phát triển ứng dụng React Native và các phần native Android. Ngoài công việc, mình thử AI, xây tool hữu ích và viết lại những điều học được.'}</p>
      <div className="site-hero__actions"><a className="site-button site-button--primary" href={'mailto:'+profile.email}><Mail size={17} />{en ? 'Discuss an opportunity' : 'Trao đổi công việc'}</a><a className="site-button" href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} />LinkedIn</a></div>
      <p className="identity-footnote">04/2023 — {en ? 'present' : 'nay'}<span>·</span>South Telecom<span>·</span>{en ? 'Ho Chi Minh City' : 'TP.HCM'}</p>
    </div><IdentityPortrait /></section>
    <section className="site-container experience-section" id="experience">
      <div className="experience-intro"><p className="site-kicker">{en ? 'PROFESSIONAL EXPERIENCE' : 'KINH NGHIỆM THỰC TẾ'}</p><h2>{en ? 'What I work on.' : 'Những phần việc mình làm.'}</h2><p>{en ? 'From application features to reusable SDKs and native integration — a few contributions from my work at South Telecom.' : 'Từ tính năng ứng dụng đến SDK dùng lại và kết nối native — một vài phần việc mình đã đóng góp tại công ty.'}</p><dl className="skill-families">{skillFamilies.map(group=><div key={group.title}><dt>{group.title}</dt><dd>{group.items}</dd></div>)}</dl></div>
      <article className="experience-entry"><div className="entry-meta"><span>04/2023 — {en ? 'PRESENT' : 'NAY'}</span><span>{en ? 'HO CHI MINH CITY' : 'TP. HỒ CHÍ MINH'}</span></div><h3>South Telecom</h3><p className="entry-role">{profile.role}</p><p className="company-summary">{en ? 'Developing and maintaining Android and React Native applications for businesses.' : 'Phát triển và duy trì ứng dụng Android, React Native cho doanh nghiệp.'}</p><ul className="company-contributions">{contributions.map(item=><li key={item.title[0]}><h4>{item.title[language]}</h4><p>{item.description[language]}</p></li>)}</ul><p className="company-disclosure">{en ? 'Company projects · Contribution summaries only.' : 'Dự án công ty · Chỉ giới thiệu phạm vi đóng góp.'}</p></article>
    </section>
    <section className="site-container site-section"><SectionHeading eyebrow={en ? 'OUTSIDE WORK' : 'NGOÀI CÔNG VIỆC'} title={en ? 'Things I build myself.' : 'Những thứ mình tự xây.'} action={<ArrowLink to={pathFor('/playground')}>{en ? 'Explore Projects & Lab' : 'Khám phá Projects & Lab'}</ArrowLink>} />
      <div className="me-work-list">{[
        { title:'Mobile Developer Toolkit', text:en?'Tools and notes for mobile development.':'Tool và ghi chú phục vụ công việc mobile.',href:'/mobile'},
        { title:'ChatDVT',text:en?'An AI companion on the web and Discord.':'Trợ lý AI trên web và Discord do mình xây dựng.',href:'/discord'},
        { title:'devtiendang.blog',text:en?'This website: my profile, writing and personal work.':'Website cá nhân để giới thiệu bản thân, viết và kết nối các sản phẩm.',href:'/'},
      ].map((item,i)=><Link to={pathFor(item.href)} key={item.title}>{i===1?<img src="/images/chibi/chatdvt.jpg" alt="" width={56} height={56}/>:<span className="work-number">0{i+1}</span>}<div><h3>{item.title}</h3><p>{item.text}</p></div><ArrowUpRight size={20}/></Link>)}</div>
    </section>
    <section className="site-container me-supporting-grid"><div><p className="site-kicker">{en?'EDUCATION':'HỌC VẤN'}</p><h3>PTIT · 2017–2022</h3><p>{en?'Software Engineering':'Kỹ thuật phần mềm'}</p></div><div><p className="site-kicker">{en?'WRITING & LEARNING':'TÀI LIỆU & HỌC TẬP'}</p><a className="arrow-link" href="/rn-learning-guide/"><span>React Native Learning Guide</span><b>↗</b></a><p>{en?'Architecture, testing and CI/CD.':'Kiến trúc, kiểm thử và CI/CD.'}</p></div></section>
    <section className="site-container contact-section"><p className="site-kicker">{en?'LET’S WORK TOGETHER':'KẾT NỐI VỚI TIẾN'}</p><h2>{en?'Looking for a Mobile Engineer?':'Bạn đang tìm một Mobile Engineer?'}</h2><p>{en?'Open to discussing React Native or Android/Kotlin roles in Ho Chi Minh City and suitable remote opportunities.':'Mình sẵn sàng trao đổi về vị trí React Native hoặc Android/Kotlin tại TP.HCM và cơ hội remote phù hợp.'}</p><div className="site-hero__actions"><a className="site-button site-button--primary" href={'mailto:'+profile.email}><Mail size={17}/>{profile.email}</a><a className="site-icon-button" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={20}/></a><a className="site-icon-button" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={20}/></a><a className="site-icon-button" href="https://www.facebook.com/dvtien8599" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={20}/></a></div></section>
  </SiteLayout>;
}
