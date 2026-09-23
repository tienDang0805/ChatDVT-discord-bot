import type { BlogPost } from '../types/blog';

export const DEFAULT_BLOG_POST: BlogPost = {
  id: -1,
  title: 'Vì sao một Mobile Dev lại đi làm bot? — Chuyện về ChatDVT (Phần 1)',
  slug: 'chatdvt-phan-1',
  excerpt: 'ChatDVT không bắt đầu từ một ý tưởng startup hay một project để làm đẹp CV. Nó bắt đầu từ một lần mình dỗi mấy ông đồng nghiệp.',
  status: 'published',
  readingMinutes: 9,
  publishedAt: '2026-09-23T00:00:00.000Z',
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
  content: `
    <p>Nếu nhìn vào ChatDVT bây giờ thì chắc khó đoán được lý do ban đầu mình làm nó khá... xàm. Không phải vì muốn học AI, không phải để có side project cho CV, cũng chẳng có ý tưởng startup gì cả. Nó bắt đầu từ một lần mình dỗi mấy ông đồng nghiệp.</p>

    <h2>Mọi chuyện bắt đầu từ team 8D</h2>
    <p>Hồi đó ở công ty mình có một nhóm bạn chơi chung, gọi là team 8D. Có một đợt mấy ông trong nhóm làm mình dỗi, thế là mình giận, không thèm nói chuyện với ai.</p>
    <p>Đúng lúc đó Telegram lại xảy ra một cái lỗi gì đó mà tới giờ mình cũng không nhớ chính xác nữa. Chỉ nhớ lúc ấy trong group có trường hợp tài khoản của người đang chat hiển thị hơi kỳ, nhìn giống như chính cái group đang nói chuyện.</p>
    <p>Mình vào group thì thấy “cái group” đang nhắn tin. Mấy ông 8D thấy vậy liền tranh thủ troll:</p>
    <blockquote><p>“Bọn tao mới mua AI về chat với mày đấy.”</p></blockquote>
    <p>Mình cũng bán tín bán nghi nên ngồi tương tác thử. Chat được vài câu thì thấy rõ là có thằng nào đó đang ngồi gõ chứ AI cái gì. Nhưng từ trò troll đấy mình lại nảy ra một suy nghĩ:</p>
    <blockquote><p>“Ủa, thế làm một con AI bot thật trong group có khó không?”</p></blockquote>
    <p>Thế là bắt đầu mò, và đó là lý do ChatDVT ra đời.</p>

    <h2>Một Mobile Dev bắt đầu mò Telegram Bot</h2>
    <p>Thời điểm đó công việc chính của mình là Mobile Developer, chủ yếu React Native với Android. Còn bot Telegram hoạt động thế nào thì gần như mình chưa biết gì: webhook là gì, Telegram gửi message về đâu, bot reply kiểu gì, AI giữ đoạn hội thoại trước như thế nào?</p>
    <p>Không biết thì đọc document, Google rồi thử. Mình bắt đầu với Telegram Bot API, xem thêm mấy bài hướng dẫn trên mạng và làm phiên bản đầu tiên bằng Google Apps Script.</p>
    <p>Lý do chọn Apps Script khá đơn giản: dễ bắt đầu. Không cần dựng server riêng, không cần quan tâm process chạy ở đâu; deploy thành Web App rồi lấy URL làm webhook cho Telegram là đã nhận được message.</p>
    <p>Mọi thứ lúc đó chạy theo một đường rất đơn giản: Telegram gửi message vào webhook → Google Apps Script đọc và lọc message → chạy feature tương ứng → gọi Telegram API để reply lại trong group.</p>
    <p>Trong source cũ, toàn bộ update đi vào <code>doPost()</code> để parse và xử lý. Không có architecture gì cao siêu, chỉ là một đống <code>if</code>: command này chạy hàm này, tag bot thì gọi AI, gửi ảnh thì xử lý ảnh, có audio thì đi đường audio. Nghĩ ra feature nào thì thêm tiếp.</p>
    <p>Nhìn lại đống file <code>.gs</code> bây giờ cũng khá buồn cười: Weather, Music, Sticker, AI, Pet, Traffic rồi đủ thứ linh tinh khác.</p>
    <p>Đúng kiểu làm side project: không roadmap, nghĩ gì vui thì code cái đó.</p>

    <h2>Rồi mình nhét Gemini vào làm “não”</h2>
    <p>Đúng lúc đó mình cũng đang nghịch Google AI Studio. Gemini lúc ấy còn khá mới với mình, mình dùng model Flash rồi nghĩ:</p>
    <blockquote><p>“Hay cho con bot này chat bằng AI luôn?”</p></blockquote>
    <p>Thế là bắt đầu ghép Gemini vào ChatDVT. Lúc đó mình không biết nhiều về cách xây chatbot AI: muốn bot có cách nói chuyện riêng thì viết prompt; muốn bot nhớ mấy câu trước thì lên Google AI Studio chat thử, bấm Get Code, xem request Google gửi như thế nào rồi bắt chước.</p>
    <p>Phần history mình lưu vào Google Sheet.</p>
    <p>Mỗi lần user nói chuyện với bot thì lấy history cũ lên, thêm message mới vào, gọi Gemini, nhận response rồi lưu cả câu hỏi lẫn câu trả lời trở lại Sheet. Source cũ vẫn còn đúng kiểu đó: đọc history từ Sheet, đưa vào request Gemini, sau đó lưu response của user/model lại.</p>
    <p>Hồi đó mình chưa quan tâm context management là gì, token bao nhiêu, history dài quá thì sao hay phải optimize thế nào. Bot nhớ được câu trước là thấy ngon rồi.</p>
    <p>Khi thêm Gemini, đường đi của một tin nhắn dài hơn một chút: Telegram → webhook → Apps Script lấy history từ Google Sheet → gửi sang Gemini → lưu lại history → gọi Telegram API để reply vào đúng message trong group.</p>
    <p>Thế là mình có một con AI bot chạy thật trong group.</p>

    <h2>Nghĩ ra cái gì thì thêm cái đó</h2>
    <p>Sau khi chat được rồi thì bắt đầu tới giai đoạn... nhét feature. Tag bot thì nó vào nói chuyện, gửi ảnh thì cho AI phân tích; sau này còn có audio, video, sticker, tìm ảnh, tìm nhạc, xem thời tiết và cả mấy feature rất vô tri kiểu đếm ngược còn bao lâu nữa thì hết giờ làm.</p>
    <p>Nói chung không có product requirement gì cả, chỉ là:</p>
    <blockquote><p>“Cái này vui này.”</p></blockquote>
    <p>Xong code. Có lẽ vì thế nên mấy ông đồng nghiệp bắt đầu gọi mình là content creator thay vì developer. Ngẫm lại cũng không sai lắm.</p>

    <h2>Rồi team dev chuyển sang Discord</h2>
    <p>ChatDVT sống trên Telegram như vậy được một thời gian. Đến năm 2025, việc dùng Telegram ở Việt Nam bắt đầu khá bất tiện nên team dev nội bộ chuyển cái group dùng để tám chuyện sang Discord.</p>
    <p>Công việc chính thức vẫn làm trên Microsoft Teams; Discord chỉ là chỗ anh em dev ngồi nói chuyện linh tinh. Mọi người chuyển nhà thì mình cũng muốn mang ChatDVT qua theo.</p>
    <p>Ban đầu mình nghĩ chắc đơn giản: Telegram có bot, Discord cũng có bot, bê logic qua rồi đổi API một chút là chạy. Đọc Discord.js một hồi mới thấy không phải vậy.</p>
    <p>Con Telegram Bot cũ của mình chủ yếu hoạt động bằng webhook: có message → Telegram gọi webhook → Apps Script chạy → xử lý xong là hết.</p>
    <p>Còn với Discord, bot phải duy trì kết nối với Gateway để nhận event realtime, tức là cần một process chạy liên tục. Tới đây Google Apps Script không còn phù hợp nữa; mình cần một project có package, dependency, thư viện và một process sống 24/7.</p>
    <p>Thế là bắt đầu chuyển qua Node.js và Discord.js.</p>

    <h2>Code xong rồi... chạy ở đâu?</h2>
    <p>Làm được bot Discord rồi thì xuất hiện một vấn đề mới: để nó chạy ở đâu? Không lẽ mở laptop cá nhân rồi để terminal chạy 24/7? Rõ ràng không ổn, mình cần server.</p>
    <p>Cũng từ đây mình mới bắt đầu lôi lại mấy thứ từng học ở trường.</p>

    <h2>Những thứ từng học ở PTIT bắt đầu có chỗ dùng</h2>
    <p>Trước đó ở PTIT HCM mình từng học môn Phát triển phần mềm hướng dịch vụ. Trong môn này mình có làm API, Docker và triển khai ứng dụng trên hai nền tảng khác nhau; mình chọn mobile application với web application.</p>
    <p>Đây cũng là một trong những môn đầu tiên giúp mình hiểu rõ hơn chuyện frontend/backend giao tiếp qua API và tại sao người ta lại đóng gói ứng dụng bằng Docker.</p>
    <p>Sau đó tới môn Chuyên đề Công nghệ Phần mềm, mình được làm CI/CD, Jenkins, cấu hình agent, viết pipeline bằng Groovy, reverse proxy và thử deploy web app lên AWS EC2.</p>
    <p>Nhưng phải nói thật là lúc học mình vẫn khá lơ mơ. VM thì hiểu sơ sơ, SSH thì dùng được, port thì vừa làm vừa Google, HTTPS chưa cấu hình được tử tế, domain cũng chẳng có. Web lúc đó cứ chạy bằng hostname mặc định AWS cấp.</p>
    <p>Và mình còn học thêm được một thứ rất dễ nhớ:</p>
    <blockquote><p>Tạo EC2 xong thì nhớ tắt.</p></blockquote>
    <p>Hồi làm bài mình từng để máy AWS chạy quên mất, đến lúc nhìn billing mới thấy hơi đau. Có những kiến thức cloud đọc slide xong quên, nhưng mất tiền thì nhớ khá lâu.</p>

    <h2>Bắt đầu đi săn server miễn phí</h2>
    <p>Vì từng có trải nghiệm hơi đau ví với AWS nên lúc ChatDVT cần server, mình bắt đầu tìm những chỗ có free trial. Đợt đó Google Cloud có chương trình khoảng 300 USD credit trong ba tháng.</p>
    <p>Có credit miễn phí thì suy nghĩ lúc đó cũng đơn giản:</p>
    <blockquote><p>“Tạo máy mạnh vào.”</p></blockquote>
    <p>Source ChatDVT chẳng có gì nặng nhưng mình vẫn tạo một con VM mạnh hơn nhu cầu khá nhiều. Kiểu mới dùng cloud nên thấy nhiều CPU với RAM thì thích, app có dùng hết không thì tính sau.</p>
    <p>Dù sao thì bot cũng chạy được 24/7, không còn phụ thuộc vào laptop của mình nữa. ChatDVT có căn nhà cloud đầu tiên.</p>
    <p>Credit Google Cloud chỉ dùng được trong ba tháng. Hết thời hạn đó, mình lại đi tìm provider nào còn free trial. Cuối cùng tìm được Alibaba Cloud có chương trình dùng thử khá lâu, hình như khoảng một năm, thế là chuyển ChatDVT qua đó để bot tiếp tục sống.</p>

    <h2>Và lúc đó mình vẫn chỉ nghĩ đây là một con bot để nghịch</h2>
    <p>Ban đầu ChatDVT chỉ xuất hiện vì một trò troll trong group Telegram, sau đó mình tò mò nên làm bot thật. Từ Telegram Bot API sang Google Apps Script rồi Gemini; team dev chuyển sang Discord thì mình học Discord.js; Discord cần process chạy liên tục thì mình phải tìm server; có server thì bắt đầu phải quan tâm chuyện deploy.</p>
    <p>Cứ mỗi lần muốn thêm một thứ thì lại phát sinh thêm một thứ khác phải tìm hiểu. Lúc đó mình vẫn chưa nghĩ ChatDVT sẽ thành một project kéo dài, nó đơn giản chỉ là một con bot mình làm để nghịch với mấy ông trong group.</p>
    <p>Nhưng sau khi có server riêng, mình bắt đầu thêm database, web, domain, HTTPS, Docker, reverse proxy, CI/CD... và từ đó source phình ra khá nhanh.</p>
    <p>Phần 2 chắc mình sẽ kể tiếp đoạn ChatDVT từ một con Discord bot bắt đầu có thêm web và đống thứ chạy phía sau.</p>
    <p>Còn tiếp.</p>
  `.trim(),
};
