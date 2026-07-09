import { Client, TextChannel, EmbedBuilder } from 'discord.js';

const TOXIC_QUOTES_CHANNEL_ID = '1419976465583444020';

const MIN_INTERVAL_MS = 10 * 60 * 1000;
const MAX_INTERVAL_MS = 30 * 60 * 1000;

const TOXIC_DEEP_QUOTES: string[] = [
    "Sự rời đi của một người không hẳn là phụ bạc, đôi khi chỉ là vũ trụ đang nhẹ nhàng nhắc nhở rằng: tần số của bạn chưa đủ cao để giữ chân những điều tuyệt vời. 🥀",
    "Vạn sự tùy duyên, điều gì thuộc về mình ắt sẽ ở lại. Còn nếu nỗ lực mãi vẫn hoài công, thì đành mỉm cười an yên chấp nhận: vũ trụ này vốn dĩ chẳng ưu ái chia đều phước báu cho tất cả. ☁️",
    "Thanh tẩy tâm hồn bằng nước mắt là một cách chữa lành, dẫu cho ngày mai nhân thế vẫn giông bão, thì ít nhất chiếc gối của bạn cũng đã đẫm đi sự yếu đuối. 🌧️",
    "Bản chất của nhân sinh là vô thường. Không ai đồng hành cùng ta mãi mãi, học cách tĩnh tại trước sự rời đi của người khác chính là bước đầu của sự trưởng thành. 🚶‍♀️",
    "Sự tĩnh lặng của cô đơn không đến từ việc thế giới thiếu vắng tình yêu, mà do trái tim ta cứ bướng bỉnh gieo rắc sự chân thành vào những tâm hồn không cùng đẳng cấp. 🌾",
    "Lòng tin là món quà vô giá của tâm hồn. Trao đi vô điều kiện không hẳn là sai, chỉ là ta đang tự cho mình cơ hội trải nghiệm cái giá của sự ngây thơ thiếu trí tuệ. 🌿",
    "Vết thương sâu sắc nhất luôn được chạm khắc bởi những bàn tay ta từng nắm chặt. An yên thực sự là khi ta học được cách tự bước đi mà không bấu víu vào ai. 🕯️",
    "Đừng muộn phiền khi nỗ lực chưa đơm hoa. Hãy mỉm cười vì sự kiên trì của bạn đôi khi lại là lớp nền hoàn hảo để nâng bước những đoá hoa vốn đã ngự ở vạch đích. 🪷",
    "Người ta ngợi ca thời gian như liều thuốc xoa dịu mọi vệt xước, nhưng thường lờ đi sự thật rằng: cái giá của sự chữa lành ấy chính là thanh xuân của bạn không bao giờ trở lại. ⏳",
    "Mỗi sinh mệnh sinh ra đều mang trong mình một vũ trụ riêng. Chỉ tiếc là đôi khi, vũ trụ của ta lại chỉ được phân vai quần chúng trong thước phim rực rỡ của người khác. 🎞️",
    "Đừng rơi lệ vì sự vô tình của nhân thế, hãy tự quay vào bên trong và tự hỏi: sao ta vẫn còn quá sân si khi đặt kỳ vọng vào một sinh linh phàm tục? 🍂",
    "Người gieo thiện lành ắt gặt quả ngọt. Nhưng trước khi quả ngọt tới, vũ trụ thường thử thách ta bằng cách để lòng tốt ấy được người khác 'tận dụng' triệt để. 🍵",
    "Vấp ngã là để trưởng thành. Cứ mạnh mẽ đứng lên, vì con đường phía trước còn rất nhiều trắc trở đang chờ để bạn rèn luyện lại từ đầu. 🛤️",
    "Thành tựu là sự kết tinh của 1% nỗ lực nội tại và 99% phước báu từ các mối quan hệ. Có những linh hồn dù nỗ lực mấy kiếp vẫn chưa gom đủ cả hai. 🕊️",
    "Sự hy sinh cao cả nhất là dốc lòng vì một người, để rồi bao dung nhìn họ dùng chính sự bình yên ta trao để ủ ấm cho một người khác. 🍃",
    "Thanh xuân là chuyến tàu cho phép ta được quyền đi lạc. Ta cứ bình tâm rẽ sai hướng, để rồi khi ngoảnh lại, thanh xuân đã lặng lẽ rời ga tự lúc nào. 🚂",
    "Không đạt được thành tựu chẳng có gì đáng sợ. Đáng sợ là sự chai sạn của tâm hồn khi ta bắt đầu coi sự dang dở như một thói quen tĩnh tại của đời mình. 🎪",
    "'Hãy là phiên bản chân thật nhất của chính mình' - một triết lý tuyệt đẹp, miễn là phiên bản ấy đừng vô tình làm xáo trộn nhãn quan của những người xung quanh. 🌸",
    "Kẻ mộng mơ kiên nhẫn đợi chờ chân ái, mà không biết rằng người xứng đáng ấy đang bận rộn xây dựng một câu chuyện ngôn tình không có tên mình. ⌛",
    "Những giông bão không thể quật ngã ta sẽ làm ta kiên cường hơn? Không đâu, nó chỉ âm thầm rèn luyện cho ta khả năng chịu đựng những tổn thương mãn tính một cách thanh lịch. 🩹",
    "Ta cứ mải miết đi tìm chân lý cuộc đời, mà quên mất rằng, cuộc đời này đôi khi còn chẳng bận tâm đến việc thấu hiểu mong cầu nhỏ bé của ta. 🌀",
    "Tình tri kỷ ngỡ như tường đồng vách sắt, thẳm sâu lại nhẹ tựa lông hồng. Chỉ cần một cơn gió của quyền lợi thổi qua, vạn sự chân tâm bỗng chốc hoá hư không. 🍂",
    "Sự kiên cường ban ngày là chiếc áo giáp lộng lẫy của tâm hồn, nhưng khi màn đêm 3 giờ sáng buông xuống, nó lại nhẹ nhàng bóc trần những vụn vỡ yếu mềm nhất. 🌙",
    "Kẻ mang tâm hồn tổn thương thường hay đi tìm bóng hình chữa lành từ người khác, mà quên mất rằng đối phương cũng đang che giấu những mảnh vỡ chẳng kém gì ta. 🎭",
    "Cứ nỗ lực gieo hạt dẫu đất cằn cỗi, rồi bạn sẽ thấu hiểu một chân lý: có những cái cây sinh ra đã tỏa bóng mát chỉ vì chúng được gieo ở khu vườn của một gia tộc quyền thế. 🌳",
    "Tình yêu thật kỳ diệu. Đó là khi ta hoan hỉ trao đi trọn vẹn chân tâm, để rồi nhẹ nhàng đón nhận bài học vũ trụ mang tên: 'Chúng ta không thuộc về một tần số'. 💌",
    "Ai cũng là một viên ngọc quý giá giữa nhân sinh? Đôi khi ta chỉ là viên sỏi mộc mạc, nhưng lại huyễn hoặc bản thân đang phản chiếu ánh sáng lấp lánh của trần thế. 🪨",
    "Hãy luôn nở nụ cười rạng rỡ từ bi. Bởi lẽ giữa dòng đời hối hả, chẳng có mấy ai chịu dừng chân để đo độ mặn trong giọt lệ của bạn đâu. 🌸",
    "Người xưa dạy im lặng là vàng. Nhưng đôi khi trong dòng chảy của thời đại, sự im lặng chỉ là cách nhanh nhất để bản thân chìm vào góc khuất của sự lãng quên. 🤐",
    "Khi nỗi buồn bủa vây, hãy hít một hơi thật sâu và an yên đón nhận, bởi biết đâu ngày mai, vũ trụ sẽ còn mang đến những bài học mang tên 'thử thách' chông gai hơn. 📅",
    "Lời khuyên 'hãy kiên nhẫn' từ những người đứng trên đỉnh vinh quang luôn thật êm tai, chỉ là họ thường vô tình quên nhắc đến yếu tố mang tên 'thời vận'. 🍀",
    "Hành trình thức tỉnh là ngừng so sánh bản thân với người khác. Không phải vì ta đã đủ thấu hiểu trần gian, mà vì vũ trụ đã ngầm định những khoảng cách ta khó lòng với tới. 📊",
    "'Mọi giông bão rồi sẽ qua' — đó là câu thần chú xoa dịu tuyệt vời nhất, cũng là lời tự huyễn hoặc êm ái nhất mà ta tự dỗ dành linh hồn mình mỗi đêm. 🕯️",
    "Kỳ vọng để rồi buông bỏ, gieo mầm rồi lại nhìn hoa tàn... Cuộc đời là những vòng lặp luân hồi, rèn giũa cho trái tim ta quen với sự chông chênh của nhân thế. 🎡",
    "Có những sự xa lánh không xuất phát từ lòng đố kỵ với sự ưu tú, mà đơn giản vì đôi khi, cách ta tỏa sáng lại vô tình làm phiền đến sự an tĩnh của người khác. 🐸",
    "Lời thề non hẹn biển vốn dĩ rất đẹp, chỉ tiếc nó cũng mang trên mình một lớp hạn sử dụng vô hình, và thời gian thì luôn trôi qua vội vã hơn ta tưởng. 📜",
    "Đừng tự đặt mình làm trung tâm của vũ trụ. Dẫu vắng đi một vì sao, bầu trời đêm của tổ chức hay nhân loại vẫn tuần hoàn vận hành trơn tru như nó vốn dĩ. 🏢",
    "Trách nhân thế vô tình không thấu hiểu nỗi lòng ta? Hãy chậm lại một nhịp, tự vấn xem ngay cả chính tâm hồn mình, ta đã thực sự chạm tới tận cùng hay chưa? 🧩",
    "Buông bỏ chấp niệm theo đuổi vật chất là một cảnh giới. Bởi dẫu có cố chạy theo, đôi chân mỏi mệt của phàm nhân cũng khó lòng đuổi kịp dòng chảy vô tình của kim tiền. 💸",
    "Khát khao trở thành một cá thể độc bản là bản ngã tự nhiên, tuyệt diệu thay, cả 8 tỷ sinh linh ngoài kia cũng đang mang trong mình sự tỉnh thức y hệt thế. 🌍",
    "Trong dòng chảy vô thường của thế sự, thứ duy nhất duy trì sự trung thành tuyệt đối và nhắc nhở ta về thực tại mỗi tháng, chính là những hóa đơn và kỳ hạn công việc. ⚡",
    "Cho phép bản thân chậm lại để nạp đầy năng lượng là điều tốt. Chỉ có điều, guồng quay của trần thế thì chưa bao giờ học được cách dừng lại để đợi chờ bất kỳ ai. 🏃",
    "Chân lý 'nỗ lực ắt sinh trái ngọt' chỉ thực sự tròn trịa, nếu như ta không dùng toàn bộ sinh lực ấy để gieo hạt trên một mảnh đất đã được định sẵn là cằn cỗi. 🧭",
    "Nỗi sợ đánh mất một mối duyên lành đôi khi chỉ là sự ảo tưởng. Vì biết đâu, người đã âm thầm rời khỏi tần số của bạn từ lâu, chỉ là bạn vẫn cố chấp giữ lại tàn dư. 👋",
    "Nhịp đập của số phận hệt như sóng wifi của trần thế — khi tỏ khi mờ, và đáng buồn thay, chìa khóa để duy trì kết nối vĩnh cửu lại chẳng ai chịu trao cho ta. 📶",
    "Giải phóng nỗi buồn qua những giọt lệ là cách gột rửa tâm trí. Dù rằng sau khi cạn dòng, thứ duy nhất thực sự vơi đi trong cơ thể bạn chỉ là lượng nước tự nhiên. 💧",
    "Vạn tòa tháp nguy nga đều có thể trở về cát bụi chỉ sau một cái chớp mắt của vũ trụ. Vậy nên, hãy cứ an yên khép mi và đừng quá cưỡng cầu điều gì. 🏗️",
    "Buông bỏ ảo mộng về những cái kết viên mãn như cổ tích là bước ngoặt của sự tỉnh thức. Thực tại không có bà tiên, và đôi khi, ta cũng chẳng phải nhân vật chính. 👸",
    "Sức chịu đựng dẻo dai là một loại phước báu. Thật đáng tự hào khi đó có lẽ là hành trang duy nhất nổi bật mà bạn mang theo trên hành trình vạn dặm này. 🏆",
    "Sẽ có ngày ta bình tâm nhìn lại những năm tháng đã qua và mỉm cười thanh thản. Mỉm cười vì không ngờ bản thân từng trao đi sự hồn nhiên đến mức ngây dại như vậy. 😂",
    "Cứ dệt nên những giấc mộng vĩ đại cho tâm hồn bay bổng, để rồi đón nhận cú chạm thực tế từ vũ trụ, giúp ta tỉnh giấc khỏi cơn mê muộn màng. 💫",
    "Gam màu của nhân sinh vốn không phải sắc hồng rực rỡ, nó mang sắc xám nguyên bản — một sắc xám tĩnh tại hệt như chính chân trời phía trước của bạn vậy. 🩶",
    "Sự chín chắn của tâm hồn không đong đếm bằng tuổi tác. Nó hiển hiện rõ nhất khi lúc 3 giờ sáng, tay ta vẫn vô thức tìm về những tàn dư của người cũ trong tĩnh lặng. 📱",
    "'Hãy quay về ôm ấp đứa trẻ bên trong bạn' - một thông điệp chữa lành tuyệt đẹp, dẫu đôi khi, ngay cả đứa trẻ ấy cũng đang muốn tìm đường trốn chạy khỏi bạn. 🪞",
    "Người đời ngợi khen sự ngoan cường của bạn. Nhưng thẳm sâu, ta đều biết đó chẳng qua là trạng thái tĩnh lặng của một trái tim đã quá quen với những vệt xước. 🧱",
    "Thay vì ngửa mặt oán trách 'vì sao đời đọa đày', hãy xoay vào trong và tự vấn: 'ta đã gieo nhân gì để đón nhận quả này?' À, thường thì ta chỉ chọn cách oán trách thôi. 😮‍💨",
    "Duy trì một lăng kính tích cực là cảnh giới của tu tập. Tiếc thay, những con số trong tài khoản ngân hàng lại chọn cách vận hành theo hệ quy chiếu hoàn toàn ngược lại. 🏦",
    "Giữa chốn phồn hoa, những mối giao tình đếm không xuể. Nhưng khi bão giông ập tới, ta mới an yên nhận ra tri kỷ duy nhất không rời bỏ mình chính là chiếc bóng. 🫥",
    "Bảo vệ cái tôi chân thật là một sự dung dưỡng đáng quý. Nhưng nếu chân thật đến mức đánh rơi cả sự khôn ngoan, thì đó lại là bài học đắt giá của nhân sinh. 🤷",
    "Bóng tối không hề đáng sợ như ta tưởng. Nhất là khi ta đã dành cả nửa đời người để tĩnh lặng thu mình dưới cái bóng quá đỗi rực rỡ của những người xung quanh. 🌑",
    "Việc cố gắng gồng mình để kiến tạo sự hoàn hảo trong mắt người khác thật mệt mỏi. Trong khi họ đang bận rộn dùng sự hoàn hảo của mình để thu hút một tần số khác. 💅",
    "Mọi cơ duyên hội ngộ trên đời đều mang theo một kỳ hạn. Và dường như, vũ trụ luôn ưu ái sắp xếp cho bạn làm người nhận thông báo hết hạn sớm nhất. 📆",
    "Cảnh giới của sự vững chãi không nằm ở lời nói. Bởi đôi khi, vỏ bọc kiên cường ấy lại dễ dàng vỡ tan chỉ bằng một dòng tin nhắn mỏng manh từ quá khứ. 📩",
    "Cuộc đời mỗi người là một tác phẩm nghệ thuật. Có những tác phẩm mang lại nụ cười rạng rỡ cho nhân thế, dù người họa sĩ phải lặng lẽ nuốt những giọt lệ đắng cay. 🃏",
    "Luật nhân quả luôn hiện hữu một cách công bằng. Chỉ là trên hành trình của bạn, có vẻ như định luật ấy đang xin phép vũ trụ được đình công một thời gian. ☸️",
    "Lòng bao dung là đóa hoa đẹp nhất của tâm hồn. Dù rằng hương thơm của nó thường hay thu hút những kẻ thích ngắt hoa bẻ cành hết lần này đến lần khác. 🐕",
    "Sự cự tuyệt không phải là điều đáng buồn. Hãy hoan hỉ tĩnh tại, vì ít nhất sự tồn tại của bạn cũng đủ tạo ra năng lượng khiến đối phương phải tiêu tốn tâm sức để phong tỏa. 🚫",
    "Năng lượng đổi mới của vạn vật vào mỗi dịp đầu năm thật thiêng liêng. Đáng tiếc là sau vài tuần trăng, phiên bản 'tôi mới' lại ngoan ngoãn chìm vào quỹ đạo cũ kỹ. 🔄",
    "Quen thuộc với cô độc là một dạng tự tại. Hoặc nhìn qua một lăng kính trần trụi hơn: đó là trạng thái an yên khi xung quanh ta chẳng còn bất kỳ sự lựa chọn nào khác. 🎰",
    "'Hãy mở rộng cánh cửa tâm hồn để đón nhận tình yêu'. Ta vâng lời mở cửa, để rồi hoan hỉ nhìn người ta bước vào, lấy đi sự bình yên, và quay lưng rời bước. 🚪",
    "Ngước nhìn lên, thấy ngợp trời là những vì tinh tú rực sáng. Nhìn xuống dưới, lại nhẹ nhàng nhận ra ai nấy đều mang một sự viên mãn mà ta chưa từng chạm tới. 👀",
    "Giữ cho lương tâm luôn trong vắt không vướng bụi trần là một điều tuyệt diệu. Nhất là khi cả đời này, ta dường như chưa từng để nó phải vận động quá nhiều. ✨",
    "Đừng để cảm giác lẻ loi xâm chiếm tâm hồn. Bởi ở những góc khuất vô hình, các khoản nợ trần gian vẫn luôn trung thành bám rễ và ôm ấp lấy bạn mỗi ngày. 💳",
    "Hãy cháy hết mình với thanh xuân như một ngọn đuốc rực rỡ, để rồi nhanh chóng thấu hiểu trạng thái 'hết mình' thẳm sâu cũng đồng nghĩa với sự cạn kiệt sinh lực. 🔋",
    "Sinh mệnh nào ra đời cũng mang trong mình một giá trị riêng biệt. Chỉ là đôi khi, giá trị ấy được vũ trụ phái đến cốt để làm niềm vui xoa dịu cho những sinh linh khác. 🎪",
    "Sự tĩnh lặng không phải lúc nào cũng là minh chứng cho một nội tâm vững chãi. Có đôi khi, im lặng đơn giản chỉ vì góc khuất của ta chẳng có bóng người ghé qua hỏi han. 🤫",
    "Kiếp nhân sinh tuy dài nhưng lại vô cùng ngắn ngủi. Thật lãng phí làm sao, khi ta dành trọn vẹn sự ngắn ngủi ấy để trôi dạt trong những vòng lặp mông lung không hồi kết. ⏰",
    "Cứ mạnh dạn phóng tầm mắt về những hoài bão lớn lao, để rồi an yên đón nhận những bài học thực tế chát chúa mà vũ trụ dành tặng để kéo bạn về với mặt đất. 🎯",
    "Kỷ niệm lấp lánh như những vì sao cất giữ trong rương báu. Chỉ tiếc là, người từng cùng ta cất giữ rương báu ấy đã sớm quên mất mật mã từ kiếp nào. 📸",
    "Tâm niệm 'tôi sẽ lột xác' là một hạt giống chữa lành tuyệt đẹp. Qua năm tháng, thứ duy nhất thực sự lột xác và tăng lên có lẽ chỉ là những con số trên chiếc bánh sinh nhật. 🎂",
    "Tưới tẩm tâm hồn bằng những tư duy tích cực độc hại là cách ta chạy trốn thực tại. Sự xoa dịu ấy chẳng xóa đi được bão giông, chỉ ru ngủ ta trong một lớp sương mù ảo mộng. 🌈",
    "Chấp nhận sự tan vỡ của nhân duyên như một lẽ thường tình. Bởi vạn sự tuần hoàn, biết đâu những sự dang dở ấy đã được định sẵn là xu hướng vận hành của đời bạn. 📈",
    "Dùng sự bận rộn làm tấm mộc che chắn tâm hồn là một lựa chọn thanh lịch. Nó giúp ta che giấu đi sự thật rằng: ta chỉ đang bận trốn chạy khỏi những gánh nặng của trưởng thành. 🏃‍♂️",
    "Triết lý 'kim tiền không mua được hạnh phúc' luôn là ngọn hải đăng cho tâm hồn. Nhưng khi trôi dạt giữa biển khơi không một xu dính túi, bão tố trong lòng ắt sẽ dữ dội gấp đôi. 💰",
    "Khắc kỷ cống hiến hết mình là một sự hy sinh thiêng liêng. Đáng buồn thay, ta thường lại dâng hiến vạn sự tinh hoa cho những bến đỗ vốn chẳng hề mưu cầu chúng. 🎁",
    "Đi qua bao bể dâu, rốt cuộc thì sự hiện diện của chúng ta cũng chỉ đọng lại thành một cụm từ 'ngày xưa có một người...' thật mờ nhạt trong miền ký ức của ai đó. 📖",
    "Tĩnh tại chờ đợi một 'thời điểm hoàn hảo' là bài tu tập về sự kiên nhẫn. Nhưng quy luật thời gian thì luôn khắc nghiệt: cái gọi là hoàn hảo ấy có lẽ chẳng bao giờ tái sinh. ⏳",
    "Sợ hãi ánh nhìn phán xét của thế nhân là điều vô nghĩa. Hãy an tâm buông xả, bởi từ lâu vũ trụ đã sớm đúc kết xong kết quả về bạn, và nó vốn dĩ không rực rỡ như bạn tưởng. 📋",
    "Cảnh giới cao nhất của sự trưởng thành không phải là hoá thân thành phượng hoàng lộng lẫy, mà là an yên chấp nhận sự nhạt nhòa của bản thân và lặng lẽ bước tiếp qua ngày. 🧓",
    "Để dòng suy tư miên man cuốn trôi giấc ngủ giữa đêm thâu? Hãy hoan hỉ biết ơn vì giữa muôn vàn sự trì trệ của cuộc sống, tâm trí bạn vẫn đang chăm chỉ vận hành... dẫu vô ích. 🧠",
    "Tự tin lan tỏa ánh hào quang và thành tựu của bạn ra thế giới. Chỉ là đừng xót xa khi năng lượng ấy lại trở thành liều thuốc tinh thần châm biếm trong những góc khuất của thế nhân. 📲",
    "Lời nguyện ước 'sẽ luôn kề cạnh' là một đóa hoa của thời gian. Đẹp đẽ, ngát hương, nhưng lại luôn mang theo một kỳ hạn lụi tàn mà không ai báo trước. 📍",
    "Sự độc lập tự chủ ngỡ như ngọn núi Thái Sơn vững chãi, hóa ra lại mong manh đến độ chỉ cần vài phút đứt gãy kết nối vạn vật, toàn bộ sự vững chãi ấy lập tức sụp đổ. 📶",
    "Hành thiện tích đức, sống vì niềm vui của người khác là điều cao cả. Cứ hoan hỉ cho đi, để rồi thấu suốt chân lý: lúc ta cạn kiệt, vòng tròn nhân quả dường như bỏ quên ta. 🔄",
    "Lời xoa dịu chân thành nhất chốn hồng trần là gì? Đó là những lời từ bi thốt ra từ chót lưỡi đầu môi của người vừa gieo xuống đời ta những hạt mầm ngang trái. 🙏",
    "Ba chữ 'Tôi vẫn ổn' là lớp lá chắn kiên cố nhất của một linh hồn vụn vỡ. Một mật ngữ hoàn hảo để che đậy đi sự hoang tàn bên trong mà ta chẳng mưu cầu ai thấu hiểu. 🆗",
    "Nỗ lực không ngừng nghỉ là chìa khóa của thành tựu? Nếu bánh lái đã chệch hướng từ đầu, thì mọi sự bứt tốc cật lực cũng chỉ đưa ta đến bờ vực của số không tròn trĩnh. 0️⃣",
    "Chấp niệm về vẻ đẹp hình thể chỉ làm thân tâm thêm sầu muộn. Hãy buông xả, vì dù ở nhân dáng nào, nhân thế vẫn luôn dư dả từ vựng để gieo những lời bình phẩm về bạn. 🤷‍♂️",
    "Mưu cầu sự tôn trọng từ chúng sinh là lẽ thường tình. Nhưng trước khi chờ đợi ánh nhìn ngưỡng mộ, chi bằng ta hãy tĩnh tâm tìm xem bản thân đã có viên ngọc nào đủ sáng chưa. 🏅",
    "Nhẹ nhàng mỉm cười và thầm nhủ 'let it go' trước những nghịch cảnh. Lời nguyện thì đẹp, chỉ là những chấp niệm ấy dường như chưa từng có ý định buông tha tâm trí bạn. ❄️",
    "'Hãy vững tin vào sự toàn năng của chính mình' là câu chú nguyện vi diệu. Vi diệu đến mức đôi khi, ngay cả linh hồn bên trong bạn cũng phải khẽ rung lên vì... buồn cười. 🪞",
    "Triết lý nhân quả ngợi ca 'cho đi ắt sẽ nhận lại'. Sau tháng năm thanh xuân miệt mài gieo hạt, thứ duy nhất nảy mầm và trao lại cho ta là vô vàn những bài học đẫm lệ. 📚",
    "Ngỡ rằng bản thân đã chạm đến đáy vực của những đau thương? Hãy hít thở sâu và vững tin lên, bởi dưới đáy vực ấy, vũ trụ luôn tinh tế chuẩn bị sẵn những tầng hầm vô tận. 🕳️",
    "Đừng tiêu tốn năng lượng để uốn nắn những linh hồn xung quanh. Hãy quay về bên trong, vì ngay cả bản thể của bạn cũng đang ngổn ngang vô vàn những mảnh ghép đợi chữa lành. 🔧",
    "Hoan hỉ tận hưởng từng khoảnh khắc trên chuyến đi nhân sinh dẫu giông bão. Chỉ tiếc là, trên hành trình ấy dường như chẳng có hoa hồng, mà chỉ chật kín những ổ gà và vực thẳm. 🛣️",
    "Ái tình vốn dĩ không mù quáng. Nó vô cùng sáng suốt khi đi tìm chân ái, chỉ là trong sự sáng suốt ấy, nó lại không ngừng ưu ái chọn sai người để thử thách trái tim bạn. 👁️",
    "Nuôi dưỡng kỳ vọng rực rỡ vào tia nắng ngày mới? Bình minh sẽ vẫn lên, chỉ là khi hoàng hôn buông xuống, bóng hình tĩnh lặng mang theo sự tiếc nuối vẫn là bạn mà thôi. 🛏️",
    "Hoang mang oán trách 'vì sao vạn sự lại chông gai?'. Sự lầm lạc có lẽ đã khởi nguồn ngay từ giây phút đầu tiên bạn lỡ gieo kỳ vọng vào một trần thế vốn chẳng trọn vẹn. ❓",
    "Theo đuổi lối sống tinh giản (minimalism) là một sự thanh tẩy tuyệt vời. Nhưng xin đừng khoác lớp áo mỹ miều ấy lên một hiện thực thẳm sâu mang tên 'tài lính cạn kiệt'. 🏠",
    "Một mình giữa đêm thâu chẳng hề đáng sợ. Nỗi hoang mang tận cùng là khi đứng giữa biển người phồn hoa xô bồ, thân tâm ta vẫn như chiếc lá trôi dạt không bến đậu. 👥",
    "Chắp tay thành kính thầm thì 'tôi biết ơn cuộc đời'. Cuộc đời dường như cũng nghe thấy, nhưng với một sự điềm nhiên tĩnh tại, nó chẳng mảy may bận tâm đến bạn. 🌍",
    "Cổ xúy bản thân sống 'không oán hận, không hối tiếc' là liều thuốc tê hoàn hảo. Thử chờ thêm một thập kỷ luân hồi, xem tâm trí ta có còn đủ dũng khí thốt ra lời ấy hay không. 🔮",
    "Lo sợ trước những lần vấp ngã trên vạn dặm đường? Ngược lại, ta nên e sợ sự thăng hoa vinh quang hơn, bởi vốn dĩ năng lực của ta chưa từng chuẩn bị cho sự hoành tráng ấy. 🏆",
    "Thả hồn vào những dòng đạo lý tạo động lực trên mạng là cách chữa lành phổ biến. Dù rằng những bậc vĩ nhân viết ra chúng cũng đang cuộn mình lười biếng trong chăn ấm. 🛌",
    "Bao dung tha thứ cho người là tự cởi trói cho mình. Nhưng đằng sau lớp áo bao dung ấy, đôi khi chỉ là sự bất lực của một trái tim đã quá rã rời để gánh thêm hờn giận. 😮‍💨",
    "Lèo lái con thuyền nhân sinh cũng hệt như việc hòa mình vào dòng xe cộ ngoằn ngoèo. Đại đa số chúng sinh đều vụng về lầm lạc, và dĩ nhiên, bạn cũng không là ngoại lệ. 🚗",
    "Tự nhủ rằng đêm hôm qua đã là tận cùng của sự giằng xé? Đừng vội an lòng, hãy hoan hỉ chờ xem kịch bản mà vũ trụ chuẩn bị cho đêm nay hoành tráng tới nhường nào. 🍺",
    "Cuộc đời mỗi chúng ta là một cuộn phim chân thực. Phim của bạn hẳn là một tuyệt tác tài liệu lột tả sự bế tắc — êm đềm, dài đằng đẵng, và dường như không có hồi kết. 🎬",
    "Phát nguyện rực rỡ 'rồi vạn sự sẽ khởi sắc bình an'. Ánh sáng ấy ắt sẽ rọi chiếu vạn vật chúng sinh, ngoại trừ điểm mù là chính nơi bạn đang đứng. 📢",
    "Đầu tư vào giá trị cốt lõi của bản thể luôn là khoản đầu tư an yên nhất. Cứ dốc lòng vun trồng đi, dẫu cho ngày hái quả lợi nhuận có tỷ lệ thuận với sự trống rỗng đi chăng nữa. 📈",
    "Đừng gieo mầm oán than lên sự khắc nghiệt của số phận. Bởi biết đâu ở một chiều không gian khác, chính số phận cũng đang bất lực thở dài trước những lựa chọn của bạn. ♾️",
    "Trở về với lối sống chậm (slow life) để thưởng lãm dòng chảy nhân gian. Quả là một mỹ từ xoa dịu tuyệt vời cho việc bạn đang bị guồng quay vạn vật bỏ lại phía sau lưng. 🐌",
    "Xây dựng vỏ bọc băng giá là cách bảo vệ trái tim thuần khiết. Nhưng thẳm sâu sự lạnh lẽo ấy, chỉ vì cõi đời này chẳng có ngọn lửa nào đủ hơi ấm cam tâm tình nguyện ở lại. 🧊",
    "Sách thánh hiền răn dạy 'hãy bồi đắp lòng quả cảm'. Lòng quả cảm đã được bạn bồi đắp thật thành tâm, trọn vẹn dùng để hứng chịu những ngọn roi từ thử thách vô thường. 🥊",
    "Nuôi dưỡng khát vọng xoay chuyển càn khôn, kiến tạo thế giới? Trước khi lan tỏa năng lượng vĩ mô ấy, chi bằng ta thử tu tập bẻ gãy thói quen dính chặt lấy chiếc giường mỗi sáng. 🌍",
    "Mải miết chạy đi tìm ý nghĩa thiêng liêng của sự tồn tại? Hãy buông xả, bởi việc an nhiên sống hòa hợp với sự vô nghĩa của đời mình cũng là một dạng cảnh giới tĩnh tại. 🤷‍♂️",
    "Áp dụng triết lý 'hãy sống như thể bạn đã thành tựu' (fake it till you make it) để thanh tẩy tư duy. Spoiler nhỏ cho chuỗi ngày bình yên: hạt giống ấy có vẻ sẽ mãi mãi nằm sâu dưới lớp vỏ ngụy trang. 🎭",
    "Tín tâm trọn vẹn vào bánh xe định mệnh? Định mệnh của mỗi chúng sinh đều có quỹ đạo riêng, còn quỹ đạo của bạn lại mang hình hài của một vòng lặp vĩnh cửu những sai lầm. 🔁",
    "Ngợi ca sức mạnh nội tại có thể gánh vác mọi trọng trách giông bão. Không đâu, chẳng qua vì giữa ngã ba đường, vũ trụ vốn chưa từng ban cho bạn một lối rẽ khác bình yên hơn. 🫠",
    "Cuốn biên niên sử cuộc đời đong đầy những chương sách thấm đẫm phong ba bão táp. Cốt truyện vốn rất hoa mỹ, chỉ tiếc người cầm bút lại là một tác giả không mấy tài ba. ✍️",
    "Miệt mài khâu vá những vết nứt tâm hồn, để rồi an yên mở lòng nhận thêm một nhát cắt mới. Vòng luân hồi của sự chữa lành vốn dĩ luôn rực rỡ những đau thương như thế. 🩹",
    "Bảo vệ sự toàn vẹn của cái tôi nguyên bản là một lý tưởng thanh cao. Chỉ e rằng sâu thẳm, chính cái tôi ấy cũng đang khẩn khoản dâng sớ xin vũ trụ được đổi chủ linh hồn. 🧬",
    "Bình tâm mỉm cười 'ta nay đã thức tỉnh, chẳng còn ngây dại như thuở nào'. Đúng vậy, cái vô minh thuở ấy đã lùi xa, để nhường chỗ cho một tầng vô minh mới sâu sắc và phong phú hơn. 🧠",
    "Chắp tay cầu nguyện một đời sóng yên biển lặng. Vạn vật hữu linh ắt sẽ chứng giám, chỉ là bến đỗ mang tên 'Bình Yên' dường như chưa từng lưu lại địa chỉ của bạn trong bản đồ trần thế. 🏡",
    "Thả lỏng tâm trí và 'tin tưởng vào tiến trình của vũ trụ'. Sự thật mất lòng ở chốn an yên này là: tiến trình của bạn đang hiển thị mã lỗi 404 không thể tìm thấy. 💻",
    "Nhầm tưởng những tầng sóng nhiễu loạn miên man trong tâm trí là sự chiêm nghiệm sâu sắc của bậc trí giả? Không, đó đơn thuần chỉ là trạng thái mắc kẹt của hội chứng suy nghĩ vẩn vơ. 🌊",
    "Khao khát trở thành điểm tựa không thể thiếu trong cõi hồng trần? Hãy buông bỏ chấp niệm đi, vì đôi khi, một điểm phát sóng miễn phí còn nhận được nhiều sự mong cầu hơn từ thế nhân. 📶",
    "Thốt lên câu 'tôi hoan hỉ đón nhận vạn sự' như một lẽ tự nhiên. Nhưng đừng dùng ngôn từ của sự tỉnh thức để che đậy cho sự kiệt quệ và bất lực trước nghịch cảnh bủa vây. 🏳️",
    "Thôi ngửa mặt trách sao kiếp nhân sinh rải đầy sỏi đá. Thay vào đó, hãy soi rọi lại tâm can, xem vì cớ gì ta cứ một mực đâm đầu vào những con ngõ cụt chông gai nhất. 🛤️",
    "Lựa chọn quay về 'yêu lấy bản thân mình' là con đường sáng suốt. Dù lớp sương mờ ấy thực chất chỉ là điệu múa tự xoa dịu của một tâm hồn đang run rẩy giữa muôn trùng đơn độc. 💝",
    "Linh hồn tự do dạo chơi trên con thuyền không bến đỗ — nghe thật đậm chất thiền. Nhưng khi vén bức màn mộng mị lên, ta mới nhận ra đó chỉ là mỹ từ của sự lạc lối mất phương hướng. ⛵",
    "Tưới tẩm hy vọng rạng đông hôm nay sẽ rũ bỏ được bụi trần hôm qua? Sáng nào tâm thức cũng nhen nhóm lửa, để rồi hoàng hôn xuống lại trầm mình trong biển khơi của sự tiếc nuối. 🌅",
    "Khởi tâm phát nguyện 'sự đổi thay sẽ bắt đầu vào ngày mai'. Một lời hứa thiêng liêng đến mức, ngay cả dòng thời gian của ngày mai nghe xong cũng không giấu nổi sự buồn cười. 📅",
    "Kiêu hãnh tuyên bố đang dấn bước trên con đường mang lý tưởng cao đẹp? Chẳng qua lý tưởng tối thượng nhất trong kiếp này của bạn chỉ là chật vật để sinh tồn qua từng kẽ hở của thời gian. 🎯",
    "Đừng để lòng trĩu nặng khi nhận ra mình chỉ là hạt cát vô danh giữa sa mạc. Đa số nhân loại đều mang dáng hình bình phàm, chỉ là bạn nhận được thông điệp ấy hơi muộn màng. 🪑",
    "Gồng mình ngược gió để chứng minh nội lực với đất trời. Nhưng quy luật vật lý của vũ trụ chưa từng thiên vị: sợi dây nтяну mãi đến giới hạn cuối cùng cũng phải chịu cảnh đứt lìa. 💪",
    "Hãnh diện truyền đi thông điệp 'sống một đời không tiếc nuối'. Quả là một câu chú hoàn mỹ để niêm phong lại hàng vạn những chấp niệm oán hận đang cào xé từ bên trong. 🧢",
    "Nuôi ảo vọng bản thân là vầng thái dương rọi sáng trung tâm sân khấu? Thật an yên làm sao khi nhận ra, bạn chỉ là mảnh ghép phụ họa vừa bị cắt bỏ khỏi khung hình của đạo diễn số phận. 🎬",
    "Những chông gai của trần thế là bục giảng miễn phí giúp ta tu tập trí tuệ. Thế nhưng học phí để đổi lấy sự trưởng thành từ bục giảng ấy lại có khả năng vắt kiệt mọi tài nguyên của bạn. 🎓",
    "Đạt đến sự cân bằng hoàn mỹ giữa nỗ lực và thụ hưởng (work-life balance) là cảnh giới đáng mơ ước. Cân bằng của bạn rất tĩnh tại: 90% cạn kiệt sinh lực, 10% còn lại dùng để chìm vào nước mắt đêm thâu. ⚖️"
];
const ACTIVE_HOUR_START = 9;
const ACTIVE_HOUR_END = 18;

function getVietnamHour(): number {
    const vnTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    return vnTime.getHours();
}

function getMsUntilNextActiveWindow(): number {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const next9am = new Date(now);
    next9am.setDate(next9am.getDate() + 1);
    next9am.setHours(ACTIVE_HOUR_START, 0, 0, 0);
    return next9am.getTime() - now.getTime();
}

function isWithinActiveHours(): boolean {
    const hour = getVietnamHour();
    return hour >= ACTIVE_HOUR_START && hour < ACTIVE_HOUR_END;
}

function getRandomInterval(): number {
    return Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS + 1)) + MIN_INTERVAL_MS;
}

function getRandomQuote(): string {
    return TOXIC_DEEP_QUOTES[Math.floor(Math.random() * TOXIC_DEEP_QUOTES.length)];
}

function buildQuoteEmbed(quote: string): EmbedBuilder {
    const decorations = ['🌑', '🥀', '💀', '🫠', '🎭', '🌧️', '🔮', '⚰️', '🕳️', '🪦'];
    const icon = decorations[Math.floor(Math.random() * decorations.length)];

    return new EmbedBuilder()
        .setColor(0x2F3136)
        .setDescription(`${icon} *${quote}*`)
        .setFooter({ text: '— Đạo Lý Dẩm Lồn Bot™ | Sáo rỗng nhưng chí mạng' })
        .setTimestamp();
}

async function sendQuote(client: Client): Promise<void> {
    try {
        const channel = await client.channels.fetch(TOXIC_QUOTES_CHANNEL_ID);
        if (!channel || !(channel instanceof TextChannel)) {
            console.error('[ToxicQuotes] Channel not found or not a TextChannel:', TOXIC_QUOTES_CHANNEL_ID);
            return;
        }

        const quote = getRandomQuote();
        const embed = buildQuoteEmbed(quote);
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('[ToxicQuotes] Error sending quote:', error);
    }
}

function scheduleNextQuote(client: Client): void {
    if (!isWithinActiveHours()) {
        const sleepMs = getMsUntilNextActiveWindow();
        const sleepHours = Math.round(sleepMs / 3600000 * 10) / 10;
        console.log(`[ToxicQuotes] Outside active hours (9h-18h VN). Sleeping ${sleepHours}h until next window.`);
        setTimeout(() => scheduleNextQuote(client), sleepMs);
        return;
    }

    const interval = getRandomInterval();
    const minutes = Math.round(interval / 60000);
    console.log(`[ToxicQuotes] Next quote in ${minutes} minutes`);

    setTimeout(async () => {
        if (isWithinActiveHours()) {
            await sendQuote(client);
        }
        scheduleNextQuote(client);
    }, interval);
}

export function startToxicQuotes(client: Client): void {
    console.log('[ToxicQuotes] Started — random 10-30min interval, active 9h-18h VN');
    scheduleNextQuote(client);
}
