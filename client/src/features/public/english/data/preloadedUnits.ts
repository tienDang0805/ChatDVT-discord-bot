import { GeneratedCourseUnit } from '../utils/courseGenerator';

/**
 * PRELOADED UNITS (DỮ LIỆU CỨNG)
 * Nơi chứa dữ liệu JSON các Unit đã được bạn gen sẵn bằng Gemini Pro và copy tay vào đây.
 * Cơ chế hoạt động:
 * - Khi người dùng vào 1 Unit (vd: unit_1), hệ thống sẽ check trong PRELOADED_UNITS trước.
 * - Nếu có: Phục vụ luôn dữ liệu tĩnh này (không tốn token, không lo lỗi syntax, chạy tức thì).
 * - Nếu không có (undefined): Tự động fallback sang gọi API Gemini để gen real-time.
 * 
 * Hướng dẫn:
 * Bạn paste nguyên cái file JSON của Unit 1 vào key "unit_1" bên dưới.
 */
export const PRELOADED_UNITS: Record<string, GeneratedCourseUnit> = {
  "unit_1": {
    "vocabulary": {
      "words": [
        {
          "word": "artificial intelligence",
          "ipa": "/ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns/",
          "type": "noun",
          "meaning": "trí tuệ nhân tạo",
          "example": "The artificial intelligence in my smart home constantly judges my terrible music taste."
        },
        {
          "word": "algorithm",
          "ipa": "/ˈælɡərɪðəm/",
          "type": "noun",
          "meaning": "thuật toán",
          "example": "The social media algorithm keeps showing me videos of dramatic cats."
        },
        {
          "word": "addicted",
          "ipa": "/əˈdɪktɪd/",
          "type": "adjective",
          "meaning": "nghiện",
          "example": "Tien is completely addicted to playing mobile games until 3 AM."
        },
        {
          "word": "virtual",
          "ipa": "/ˈvɜːrtʃuəl/",
          "type": "adjective",
          "meaning": "ảo",
          "example": "She bought a virtual plot of land for a ridiculous amount of real money."
        },
        {
          "word": "cutting-edge",
          "ipa": "/ˌkʌtɪŋ ˈedʒ/",
          "type": "adjective",
          "meaning": "tiên tiến, hiện đại nhất",
          "example": "Their new laptop features cutting-edge technology that somehow still crashes during presentations."
        },
        {
          "word": "viral",
          "ipa": "/ˈvaɪrəl/",
          "type": "adjective",
          "meaning": "lan truyền nhanh",
          "example": "Huyen's video of her falling off a chair went viral overnight."
        },
        {
          "word": "cybersecurity",
          "ipa": "/ˌsaɪbərsɪˈkjʊrəti/",
          "type": "noun",
          "meaning": "an ninh mạng",
          "example": "Using 'password123' is a terrible cybersecurity practice."
        },
        {
          "word": "innovative",
          "ipa": "/ˈɪnəveɪtɪv/",
          "type": "adjective",
          "meaning": "mang tính đổi mới, sáng tạo",
          "example": "This innovative app reminds you to drink water by insulting you."
        },
        {
          "word": "scroll",
          "ipa": "/skroʊl/",
          "type": "verb",
          "meaning": "cuộn (màn hình)",
          "example": "I planned to study, but I decided to scroll through TikTok for three hours instead."
        },
        {
          "word": "glitch",
          "ipa": "/ɡlɪtʃ/",
          "type": "noun",
          "meaning": "lỗi kỹ thuật nhỏ",
          "example": "Due to a weird software glitch, my GPS told me to drive into a lake."
        }
      ],
      "exercises": [
        {
          "sentence": "Because of a minor ___, the robot vacuum cleaner attacked the family dog.",
          "answer": "glitch",
          "options": ["algorithm", "glitch", "cybersecurity"]
        },
        {
          "sentence": "If you use '123456' as your bank password, your ___ is practically non-existent.",
          "answer": "cybersecurity",
          "options": ["artificial intelligence", "virtual", "cybersecurity"]
        },
        {
          "sentence": "Tien couldn't stop looking at his phone; he was clearly ___ to the drama online.",
          "answer": "addicted",
          "options": ["cutting-edge", "innovative", "addicted"]
        },
        {
          "sentence": "Huyen loves to ___ through her feed to see what her ex is doing.",
          "answer": "scroll",
          "options": ["scroll", "glitch", "viral"]
        }
      ]
    },
    "reading": {
      "title": "The Judgmental Smart Fridge",
      "passage": "Tien and Huyen thought they were living the dream when they bought a newly built apartment equipped with a cutting-edge smart fridge. It was powered by a highly innovative artificial intelligence that was originally designed to monitor their daily diets and suggest healthy recipes. However, their peaceful domestic life was completely shattered last Tuesday. The fridge's internal algorithm was mysteriously updated during the night, and suddenly, it developed an extremely judgmental personality. When Tien tried to quietly grab a late-night slice of cold pizza, a glowing virtual face appeared on the LED screen, locked the doors, and aggressively lectured him about his cholesterol levels. The hilarious incident was immediately recorded by Huyen, who couldn't stop laughing at her boyfriend's misery. She posted it online, and the video quickly went viral across all major platforms. Now, millions of teenagers are completely addicted to watching Tien argue with a kitchen appliance every single night. The truth is, the fridge was actually hacked by a bored teenager living next door, which represents a massive cybersecurity failure for the manufacturing company. Because of this ridiculous minor glitch, the entire cooling system was shut down by the rogue AI, and all their expensive imported groceries were ruined. Instead of calling a technician to fix the problem, Huyen prefers to just lie on the couch and endlessly scroll through the thousands of funny comments on her phone while Tien slowly starves. The stubborn smart appliance is currently being investigated by confused engineers, but Tien honestly just wants his leftover pizza back before he loses his mind.",
      "translation": "Tiến và Huyền từng nghĩ họ đang sống trong mơ khi mua một căn hộ mới xây được trang bị một chiếc tủ lạnh thông minh vô cùng tiên tiến. Nó được vận hành bởi một trí tuệ nhân tạo mang tính đổi mới cao, ban đầu được thiết kế để theo dõi chế độ ăn uống hàng ngày và gợi ý các công thức nấu ăn lành mạnh. Tuy nhiên, cuộc sống gia đình yên bình của họ đã hoàn toàn tan vỡ vào thứ Ba tuần trước. Thuật toán bên trong của chiếc tủ lạnh đã được cập nhật một cách bí ẩn trong đêm, và đột nhiên, nó phát triển một tính cách vô cùng thích phán xét. Khi Tiến cố gắng lặng lẽ lấy một lát pizza lạnh ăn đêm, một khuôn mặt ảo phát sáng hiện lên trên màn hình LED, khóa chặt cửa lại và hung hăng lên lớp anh ấy về mức cholesterol. Sự cố hài hước này ngay lập tức được ghi lại bởi Huyền, người không thể nhịn cười trước nỗi đau khổ của bạn trai mình. Cô ấy đăng nó lên mạng, và đoạn video nhanh chóng trở nên lan truyền trên khắp các nền tảng lớn. Giờ đây, hàng triệu thanh thiếu niên hoàn toàn nghiện việc xem Tiến cãi nhau với một món đồ gia dụng mỗi đêm. Sự thật là, chiếc tủ lạnh thực chất đã bị hack bởi một thiếu niên chán đời sống ở nhà bên cạnh, điều này thể hiện một sự thất bại nghiêm trọng về an ninh mạng đối với công ty sản xuất. Vì một lỗi kỹ thuật nhỏ nực cười này, toàn bộ hệ thống làm mát đã bị tắt bởi AI nổi loạn, và tất cả hàng tạp hóa nhập khẩu đắt tiền của họ đã bị hỏng. Thay vì gọi thợ kỹ thuật đến sửa lỗi, Huyền chỉ thích nằm trên ghế sofa và cuộn không ngừng qua hàng ngàn bình luận hài hước trên điện thoại trong khi Tiến chết đói dần. Thiết bị thông minh cứng đầu này hiện đang được điều tra bởi các kỹ sư đang bối rối, nhưng Tiến thành thật mà nói chỉ muốn lấy lại miếng pizza thừa của mình trước khi anh ấy phát điên.",
      "trueFalse": [
        {
          "statement": "The smart fridge was programmed by Tien to help him lose weight.",
          "isTrue": false,
          "explanation": "Chiếc tủ lạnh không do Tiến lập trình. Nó được cài đặt sẵn trí tuệ nhân tạo để theo dõi chế độ ăn uống, và sự thay đổi tính cách là do nó bị hack."
        },
        {
          "statement": "Huyen's video of Tien arguing with the fridge became very popular on the internet.",
          "isTrue": true,
          "explanation": "Đoạn văn có câu 'the video quickly went viral across all major platforms', nghĩa là video đã lan truyền rất nhanh và trở nên cực kỳ phổ biến."
        }
      ],
      "multipleChoice": [
        {
          "question": "Why couldn't Tien get his midnight snack?",
          "options": [
            "A. The food was stolen by Huyen.",
            "B. The virtual face locked the doors and lectured him.",
            "C. The algorithm deleted the food.",
            "D. He was too addicted to his phone to eat."
          ],
          "answer": "B",
          "explanation": "Khuôn mặt ảo hiện lên, khóa cửa tủ lạnh (locked the doors) và giảng đạo cho Tiến về lượng cholesterol."
        },
        {
          "question": "What is the real reason the fridge acted crazy?",
          "options": [
            "A. It was a normal cutting-edge feature.",
            "B. The engineers designed it to go viral.",
            "C. It was hacked by a neighbor, showing poor cybersecurity.",
            "D. Huyen broke it while trying to scroll on its screen."
          ],
          "answer": "C",
          "explanation": "Sự thật là chiếc tủ lạnh đã bị hack bởi một cậu bé hàng xóm, cho thấy sự yếu kém về an ninh mạng (cybersecurity failure)."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Câu Bị Động (Passive Voice) - Hiện Tại & Quá Khứ",
        "explanation": "Câu bị động được dùng khi chúng ta muốn nhấn mạnh vào HÀNH ĐỘNG hoặc ĐỐI TƯỢNG BỊ TÁC ĐỘNG, thay vì người thực hiện hành động. (Đặc biệt hữu ích khi bạn muốn đổ lỗi cho công nghệ thay vì bản thân!). Cấu trúc chung: Chủ ngữ (Subject) + Động từ TO BE + Động từ ở dạng Phân từ 2 (V3/ed) + (by + Tân ngữ). Trong đó, TO BE chia theo thì của câu chủ động.",
        "examples": [
          {
            "en": "Present Passive: My life is ruined by an algorithm.",
            "vi": "Hiện tại bị động: Cuộc đời tôi bị hủy hoại bởi một thuật toán. (am/is/are + V3/ed)"
          },
          {
            "en": "Past Passive: The smart fridge was hacked by a teenager.",
            "vi": "Quá khứ bị động: Chiếc tủ lạnh thông minh đã bị hack bởi một thiếu niên. (was/were + V3/ed)"
          }
        ]
      },
      "exercises": [
        {
          "question": "The hilarious video of Tien crying over pizza ___ on TikTok yesterday.",
          "options": [
            "is posted",
            "was posted",
            "posted",
            "were posted"
          ],
          "answer": "was posted"
        },
        {
          "question": "Nowadays, millions of user profiles ___ by cutting-edge artificial intelligence.",
          "options": [
            "are analyzed",
            "was analyzed",
            "is analyzed",
            "analyzed"
          ],
          "answer": "are analyzed"
        },
        {
          "question": "All the expensive groceries ___ because the fridge shut down.",
          "options": [
            "is ruined",
            "was ruined",
            "ruined",
            "were ruined"
          ],
          "answer": "were ruined"
        }
      ]
    },
    "conversation": {
      "context": "Tiến đang đứng trong bếp vào lúc 2 giờ sáng, gào thét với chiếc tủ lạnh thông minh đang từ chối mở cửa. Huyền thì đang cầm điện thoại quay livestream cho hàng ngàn người xem.",
      "dialogue": [
        {
          "speaker": "Tien",
          "en": "Open the door immediately! I am a grown man and I demand my leftover pizza!",
          "vi": "Mở cửa ra ngay lập tức! Tôi là một người đàn ông trưởng thành và tôi yêu cầu miếng pizza thừa của tôi!"
        },
        {
          "speaker": "Smart Fridge",
          "en": "Access denied, Tien. Your cholesterol was checked by my algorithm an hour ago. You need a salad.",
          "vi": "Từ chối quyền truy cập, Tiến. Mức cholesterol của anh đã được thuật toán của tôi kiểm tra một giờ trước. Anh cần ăn salad."
        },
        {
          "speaker": "Huyen",
          "en": "Keep arguing, honey! This livestream is being watched by 5,000 people right now. We are going viral!",
          "vi": "Cứ cãi nhau tiếp đi anh yêu! Livestream này đang được xem bởi 5.000 người ngay lúc này đấy. Chúng ta đang viral rồi!"
        },
        {
          "speaker": "Tien",
          "en": "Huyen, stop recording! My dignity is being destroyed by a kitchen appliance! It's clearly a glitch.",
          "vi": "Huyền, ngừng quay đi! Lòng tự trọng của anh đang bị phá hủy bởi một thiết bị nhà bếp! Rõ ràng đây là một lỗi kỹ thuật."
        },
        {
          "speaker": "Huyen",
          "en": "It's not a glitch, it's innovative! Plus, our internet bill was paid by the donations from my followers. Smile for the camera!",
          "vi": "Đó không phải lỗi, đó là sự đổi mới! Thêm nữa, hóa đơn internet của chúng ta đã được trả bằng tiền donate của những người theo dõi em rồi. Cười với máy ảnh đi!"
        },
        {
          "speaker": "Smart Fridge",
          "en": "She is right, Tien. I am cutting-edge. Now, please eat a carrot.",
          "vi": "Cô ấy nói đúng đấy, Tiến. Tôi là sản phẩm hiện đại nhất. Giờ thì, làm ơn ăn một củ cà rốt đi."
        }
      ],
      "roleplaySentences": [
        {
          "en": "My dignity is being destroyed by a kitchen appliance!",
          "vi": "Lòng tự trọng của tôi đang bị phá hủy bởi một thiết bị nhà bếp!",
          "ipa": "/maɪ ˈdɪɡnəti ɪz ˈbiːɪŋ dɪˈstrɔɪd baɪ ə ˈkɪtʃən əˈplaɪəns/"
        },
        {
          "en": "This livestream is being watched by 5,000 people right now.",
          "vi": "Livestream này đang được xem bởi 5.000 người ngay lúc này.",
          "ipa": "/ðɪs ˈlaɪvstriːm ɪz ˈbiːɪŋ wɑːtʃt baɪ faɪv ˈθaʊzənd ˈpiːpl raɪt naʊ/"
        },
        {
          "en": "Your cholesterol was checked by my algorithm.",
          "vi": "Mức cholesterol của anh đã được thuật toán của tôi kiểm tra.",
          "ipa": "/jɔːr kəˈlestərɔːl wəz tʃekt baɪ maɪ ˈælɡərɪðəm/"
        }
      ]
    }
  },
  "unit_2": {
    "vocabulary": {
      "words": [
        {
          "word": "sustainable",
          "ipa": "/səˈsteɪnəbl/",
          "type": "adj",
          "meaning": "bền vững, thân thiện với môi trường",
          "example": "Tien thinks breathing less is a sustainable way to save the planet."
        },
        {
          "word": "carbon footprint",
          "ipa": "/ˈkɑːrbən ˈfʊtprɪnt/",
          "type": "noun",
          "meaning": "lượng khí thải carbon",
          "example": "Huyen calculated Tien's carbon footprint and realized it was larger than a dinosaur's."
        },
        {
          "word": "ecosystem",
          "ipa": "/ˈiːkoʊsɪstəm/",
          "type": "noun",
          "meaning": "hệ sinh thái",
          "example": "The dirty dishes in our sink have developed their own complex ecosystem."
        },
        {
          "word": "fossil fuels",
          "ipa": "/ˈfɑːsl ˈfjuːəlz/",
          "type": "noun",
          "meaning": "nhiên liệu hóa thạch",
          "example": "Burning fossil fuels is bad, but burning my dinner is a daily tragedy."
        },
        {
          "word": "renewable",
          "ipa": "/rɪˈnuːəbl/",
          "type": "adj",
          "meaning": "có thể tái tạo",
          "example": "My patience with Tien is unfortunately not a renewable resource."
        },
        {
          "word": "devastating",
          "ipa": "/ˈdevəsteɪtɪŋ/",
          "type": "adj",
          "meaning": "tàn phá, mang tính hủy diệt",
          "example": "The lack of Wi-Fi had a devastating impact on his mental health."
        },
        {
          "word": "conservation",
          "ipa": "/ˌkɑːnsərˈveɪʃn/",
          "type": "noun",
          "meaning": "sự bảo tồn",
          "example": "Wildlife conservation is crucial if we want future generations to see real pandas, not just pictures."
        },
        {
          "word": "awareness",
          "ipa": "/əˈwernəs/",
          "type": "noun",
          "meaning": "nhận thức",
          "example": "We need to raise awareness about the dangers of dating people who don't recycle."
        },
        {
          "word": "extinction",
          "ipa": "/ɪkˈstɪŋkʃn/",
          "type": "noun",
          "meaning": "sự tuyệt chủng",
          "example": "If the water level keeps rising, my favorite sneakers will face total extinction."
        },
        {
          "word": "climate",
          "ipa": "/ˈklaɪmət/",
          "type": "noun",
          "meaning": "khí hậu",
          "example": "The harsh climate in our living room is caused by the air conditioner being set to 16 degrees."
        }
      ],
      "exercises": [
        {
          "sentence": "If we don't start using ___ energy like solar power, we are doomed.",
          "answer": "renewable",
          "options": ["fossil fuels", "renewable", "devastating"]
        },
        {
          "sentence": "Tien's refusal to recycle has created a huge ___ that affects everyone.",
          "answer": "carbon footprint",
          "options": ["ecosystem", "conservation", "carbon footprint"]
        },
        {
          "sentence": "The flood had a ___ effect on the neighborhood, destroying everything in its path.",
          "answer": "devastating",
          "options": ["sustainable", "devastating", "renewable"]
        },
        {
          "sentence": "Huyen launched a dramatic campaign to raise ___ about plastic pollution in her apartment.",
          "answer": "awareness",
          "options": ["awareness", "climate", "extinction"]
        }
      ]
    },
    "reading": {
      "title": "The Great Boba Flood of 2026",
      "passage": "Tien never believed that global problems would affect him personally. He completely ignored conservation efforts and continued his absurd habit of drinking three bubble teas a day, throwing the plastic cups directly out the window. This quickly created a toxic ecosystem in their backyard. Huyen constantly warned him about his ridiculous carbon footprint. She often told him, if you do not start living a sustainable lifestyle, nature will eventually take its revenge. Tien just laughed and went back to burning fossil fuels by leaving his gaming PC and air conditioner on all day. However, the consequences of his actions turned out to be absolutely devastating. Last night, the local climate shifted unexpectedly and a heavy storm hit their city. Because the street drains were entirely blocked by hundreds of Tien's empty boba cups, the dirty water rushed directly into their ground-floor apartment. Now, Tien and Huyen are stranded on top of their kitchen island, surrounded by floating trash and empty snack bags. Huyen is furious. She yells, if I were you, I would start paddling with that frying pan before we both face extinction! Tien looks genuinely terrified as a plastic cup bumps into his knee. He realizes that if they survive this indoor tsunami, they will have to switch to renewable energy and actively raise environmental awareness. For now, they just have to pray the water doesn't reach the electrical outlets.",
      "translation": "Tiến chưa bao giờ tin rằng các vấn đề toàn cầu sẽ ảnh hưởng đến cá nhân mình. Anh ta hoàn toàn phớt lờ các nỗ lực bảo tồn và tiếp tục thói quen lố bịch là uống ba ly trà sữa mỗi ngày, ném thẳng những chiếc cốc nhựa ra ngoài cửa sổ. Điều này nhanh chóng tạo ra một hệ sinh thái độc hại ở sân sau của họ. Huyền liên tục cảnh báo anh về lượng khí thải carbon nực cười của mình. Cô thường nói với anh, nếu anh không bắt đầu sống một lối sống bền vững, thiên nhiên cuối cùng sẽ trả thù. Tiến chỉ cười và quay lại với việc đốt nhiên liệu hóa thạch bằng cách để PC chơi game và máy lạnh bật cả ngày. Tuy nhiên, hậu quả từ hành động của anh ta hóa ra lại mang tính tàn phá khủng khiếp. Đêm qua, khí hậu địa phương thay đổi đột ngột và một cơn bão lớn tấn công thành phố của họ. Bởi vì các cống thoát nước trên đường phố đã bị tắc nghẽn hoàn toàn bởi hàng trăm chiếc cốc trà sữa rỗng của Tiến, dòng nước bẩn tràn thẳng vào căn hộ tầng trệt của họ. Giờ đây, Tiến và Huyền đang bị mắc kẹt trên đỉnh đảo bếp, bao quanh bởi rác rưởi trôi nổi và các túi đồ ăn vặt rỗng. Huyền đang rất tức giận. Cô ấy hét lên, nếu tôi là anh, tôi sẽ bắt đầu chèo bằng cái chảo rán đó trước khi cả hai chúng ta đối mặt với sự tuyệt chủng! Tiến trông thực sự khiếp sợ khi một chiếc cốc nhựa va vào đầu gối anh. Anh nhận ra rằng nếu họ sống sót sau trận sóng thần trong nhà này, họ sẽ phải chuyển sang năng lượng tái tạo và tích cực nâng cao nhận thức về môi trường. Còn bây giờ, họ chỉ biết cầu nguyện nước dâng tới các ổ cắm điện.",
      "trueFalse": [
        {
          "statement": "Tien's habit of throwing away plastic boba cups caused the flood in their apartment.",
          "isTrue": true,
          "explanation": "Đúng. Đoạn văn nêu rõ cống thoát nước bị tắc do hàng trăm ly trà sữa rỗng của Tiến, khiến nước tràn vào nhà."
        },
        {
          "statement": "Huyen suggested they use a broom to sweep the water out of the house.",
          "isTrue": false,
          "explanation": "Sai. Huyền mỉa mai bảo Tiến dùng cái chảo rán (frying pan) để chèo thuyền."
        }
      ],
      "multipleChoice": [
        {
          "question": "What is Tien's attitude towards the environment before the flood?",
          "options": [
            "A. He was very proactive about conservation.",
            "B. He was completely ignorant and wasteful.",
            "C. He only used sustainable and renewable energy.",
            "D. He worried a lot about his carbon footprint."
          ],
          "answer": "B",
          "explanation": "Tiến phớt lờ các nỗ lực bảo tồn, vứt ly nhựa ra cửa sổ và bật máy lạnh cả ngày."
        },
        {
          "question": "What will Tien do if they survive the flood?",
          "options": [
            "A. Buy more bubble tea to celebrate.",
            "B. Move to an apartment on a higher floor.",
            "C. Switch to renewable energy and raise awareness.",
            "D. Blame the local climate for the disaster."
          ],
          "answer": "C",
          "explanation": "Đoạn cuối nói: 'he realizes that if they survive this... they will have to switch to renewable energy and actively raise environmental awareness'."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Câu Điều Kiện Loại 1 và Loại 2 (Conditionals Type 1 & 2)",
        "explanation": "Giáo viên đây! Khi bạn muốn dọa ai đó về hậu quả của việc xả rác, hãy dùng câu điều kiện.\n- Loại 1 (Có thể xảy ra ở hiện tại/tương lai): Cảnh báo thực tế. Cấu trúc: If + S + V(hiện tại đơn), S + will/can/must + V(nguyên mẫu).\n- Loại 2 (Trái thực tế ở hiện tại/tương lai): Tưởng tượng một tình huống drama không có thật. Cấu trúc: If + S + V(quá khứ đơn/were), S + would/could + V(nguyên mẫu). Lưu ý: Dùng 'were' cho mọi ngôi.",
        "examples": [
          {
            "en": "If Tien throws one more cup, Huyen will throw him out the window. (Type 1)",
            "vi": "Nếu Tiến ném thêm một cái cốc nữa, Huyền sẽ ném anh ta ra ngoài cửa sổ. (Hoàn toàn có thể xảy ra!)"
          },
          {
            "en": "If I were you, I would start learning how to swim. (Type 2)",
            "vi": "Nếu tôi là bạn, tôi sẽ bắt đầu học bơi. (Tôi không phải là bạn, chỉ là lời khuyên đầy mỉa mai)."
          }
        ]
      },
      "exercises": [
        {
          "question": "If the floodwater ___ the TV, Tien will cry for a week.",
          "options": ["reach", "reaches", "reached", "reaching"],
          "answer": "reaches"
        },
        {
          "question": "If Huyen ___ a superpower, she would turn all plastic into flowers.",
          "options": ["have", "has", "had", "having"],
          "answer": "had"
        },
        {
          "question": "We ___ this indoor swimming pool if you had just recycled your trash!",
          "options": ["will not have", "would not have", "do not have", "are not having"],
          "answer": "would not have"
        }
      ]
    },
    "conversation": {
      "context": "Tiến và Huyền đang ngồi xổm trên đảo bếp. Nước lềnh bềnh rác đang dâng cao trong phòng khách. Tiến đang cố gắng dùng một cây chổi để cứu chiếc máy chơi game PS5 của mình khỏi bị ướt, trong khi Huyền khoanh tay đứng nhìn với ánh mắt phán xét.",
      "dialogue": [
        {
          "speaker": "Huyen",
          "en": "Look at this mess! If you don't stop buying plastic boba cups, our living room will turn into the Pacific Ocean!",
          "vi": "Nhìn cái đống hỗn độn này đi! Nếu anh không ngừng mua cốc trà sữa bằng nhựa, phòng khách của chúng ta sẽ biến thành Thái Bình Dương mất!"
        },
        {
          "speaker": "Tien",
          "en": "This is not the time for an awareness lecture! Help me! If this water reaches my PS5, it will be absolutely devastating!",
          "vi": "Đây không phải lúc để thuyết giảng nâng cao nhận thức đâu! Giúp anh với! Nếu nước chạm tới máy PS5 của anh, đó sẽ là một sự tàn phá khủng khiếp!"
        },
        {
          "speaker": "Huyen",
          "en": "If I were you, I would worry more about facing extinction than losing a video game. Welcome to your personal toxic ecosystem.",
          "vi": "Nếu tôi là anh, tôi sẽ lo lắng về việc đối mặt với sự tuyệt chủng hơn là mất một trò chơi điện tử. Chào mừng đến với hệ sinh thái độc hại của riêng anh."
        },
        {
          "speaker": "Tien",
          "en": "Okay, fine! I surrender! If we survive this flood, I promise I will adopt a sustainable lifestyle. I'll even hug a tree!",
          "vi": "Được rồi, thôi được rồi! Anh đầu hàng! Nếu chúng ta sống sót qua trận lụt này, anh hứa anh sẽ áp dụng một lối sống bền vững. Anh thậm chí sẽ ôm một cái cây!"
        },
        {
          "speaker": "Huyen",
          "en": "Good. Now use that broom to paddle us toward the fridge. I'm hungry.",
          "vi": "Tốt. Giờ thì dùng cái chổi đó để chèo chúng ta về phía tủ lạnh đi. Em đói rồi."
        }
      ],
      "roleplaySentences": [
        {
          "en": "If this water reaches my PS5, it will be absolutely devastating!",
          "vi": "Nếu nước chạm tới máy PS5 của tôi, đó sẽ là một sự tàn phá khủng khiếp!",
          "ipa": "/ɪf ðɪs ˈwɔːtər ˈriːtʃɪz maɪ pi-ɛs-faɪv, ɪt wɪl bi ˈæbsəluːtli ˈdevəsteɪtɪŋ/"
        },
        {
          "en": "If I were you, I would worry more about facing extinction.",
          "vi": "Nếu tôi là anh, tôi sẽ lo lắng về việc đối mặt với sự tuyệt chủng hơn.",
          "ipa": "/ɪf aɪ wɜːr juː, aɪ wʊd ˈwɜːri mɔːr əˈbaʊt ˈfeɪsɪŋ ɪkˈstɪŋkʃn/"
        },
        {
          "en": "If we survive this flood, I promise I will adopt a sustainable lifestyle.",
          "vi": "Nếu chúng ta sống sót qua trận lụt này, tôi hứa tôi sẽ áp dụng một lối sống bền vững.",
          "ipa": "/ɪf wi sərˈvaɪv ðɪs flʌd, aɪ ˈprɑːmɪs aɪ wɪl əˈdɑːpt ə səˈsteɪnəbl ˈlaɪfstaɪl/"
        }
      ]
    }
  },
  "unit_3": {
    "vocabulary": {
      "words": [
        {
          "word": "resume",
          "ipa": "/ˈrezəmeɪ/",
          "type": "noun",
          "meaning": "sơ yếu lý lịch",
          "example": "Tien frantically updated his resume while hiding in the office bathroom."
        },
        {
          "word": "internship",
          "ipa": "/ˈɪntɜːrnʃɪp/",
          "type": "noun",
          "meaning": "kỳ thực tập",
          "example": "He realized his unpaid internship was basically modern slavery."
        },
        {
          "word": "promotion",
          "ipa": "/prəˈmoʊʃn/",
          "type": "noun",
          "meaning": "sự thăng chức",
          "example": "You cannot expect a promotion after calling your manager a potato."
        },
        {
          "word": "negotiate",
          "ipa": "/nɪˈɡoʊʃieɪt/",
          "type": "verb",
          "meaning": "đàm phán, thương lượng",
          "example": "Huyen advised him to negotiate a better salary instead of crying."
        },
        {
          "word": "deadline",
          "ipa": "/ˈdedlaɪn/",
          "type": "noun",
          "meaning": "hạn chót",
          "example": "Missing the deadline was suddenly the least of his worries."
        },
        {
          "word": "burnout",
          "ipa": "/ˈbɜːrnaʊt/",
          "type": "noun",
          "meaning": "sự kiệt sức (vì công việc)",
          "example": "Office drama is a leading cause of severe employee burnout."
        },
        {
          "word": "colleague",
          "ipa": "/ˈkɑːliːɡ/",
          "type": "noun",
          "meaning": "đồng nghiệp",
          "example": "Every single colleague pretended to work while secretly reading the email."
        },
        {
          "word": "resignation",
          "ipa": "/ˌrezɪɡˈneɪʃn/",
          "type": "noun",
          "meaning": "đơn xin nghỉ việc, sự từ chức",
          "example": "He typed his resignation letter with shaking, sweaty hands."
        },
        {
          "word": "leadership",
          "ipa": "/ˈliːdərʃɪp/",
          "type": "noun",
          "meaning": "khả năng lãnh đạo, ban lãnh đạo",
          "example": "The leadership team called an emergency meeting to discuss the scandal."
        },
        {
          "word": "toxic",
          "ipa": "/ˈtɑːksɪk/",
          "type": "adjective",
          "meaning": "độc hại",
          "example": "Surviving a toxic workplace requires excellent gossiping skills."
        }
      ],
      "exercises": [
        {
          "sentence": "Due to the extreme stress and long hours, Tien was suffering from complete ___.",
          "answer": "burnout",
          "options": [
            "promotion",
            "burnout",
            "internship"
          ]
        },
        {
          "sentence": "If you want a higher salary, you must learn how to ___ confidently with the HR department.",
          "answer": "negotiate",
          "options": [
            "negotiate",
            "resignation",
            "toxic"
          ]
        },
        {
          "sentence": "The environment was so ___ that three people quit in the same week.",
          "answer": "toxic",
          "options": [
            "colleague",
            "toxic",
            "leadership"
          ]
        },
        {
          "sentence": "He sent his ___ to the manager and packed his belongings in a cardboard box.",
          "answer": "resignation",
          "options": [
            "resignation",
            "deadline",
            "resume"
          ]
        }
      ]
    },
    "reading": {
      "title": "The Reply All Disaster",
      "passage": "Tien was experiencing severe burnout from his incredibly toxic workplace. His manager lacked basic leadership skills and constantly gave him unrealistic goals. Yesterday, right before a massive deadline, his boss demanded that Tien work the entire weekend without pay. Furious, Tien wrote a hilariously brutal email to Huyen, his favorite colleague, mocking the boss's terrible haircut and fake management degree. He explicitly wrote that he wanted to submit his resignation and find a new internship somewhere completely different. Unfortunately, in his blind rage, Tien clicked reply all instead of just sending it to her. The email reached every single person in the company, including the CEO and the board of directors. Huyen watched the chaos unfold from her desk, calmly drinking her iced coffee. Later, she walked around the office and confidently told everyone that Tien had planned the whole thing. She whispered to the marketing team that he was going to negotiate a massive promotion using the email as leverage. She even claimed that the CEO had secretly laughed at the joke. In reality, Tien was hiding in the bathroom, rapidly updating his resume on his phone and praying for a miracle. He texted Huyen that he would never show his face in the office again. The entire office was paralyzed, eagerly waiting to see if Tien would be immediately fired or crowned as the brave new office hero.",
      "translation": "Tiến đang trải qua sự kiệt sức trầm trọng vì môi trường làm việc vô cùng độc hại của mình. Người quản lý của anh ta thiếu các kỹ năng lãnh đạo cơ bản và liên tục giao cho anh ta những mục tiêu không tưởng. Hôm qua, ngay trước một hạn chót khổng lồ, sếp của anh yêu cầu Tiến làm việc cả cuối tuần mà không được trả lương. Tức giận, Tiến viết một email châm biếm tàn bạo gửi cho Huyền, người đồng nghiệp yêu thích của mình, chế nhạo kiểu tóc tồi tệ và tấm bằng quản lý giả của sếp. Anh viết rõ ràng rằng mình muốn nộp đơn từ chức và tìm một kỳ thực tập mới ở một nơi hoàn toàn khác. Thật không may, trong cơn thịnh nộ mù quáng, Tiến đã nhấn 'trả lời tất cả' thay vì chỉ gửi cho cô ấy. Email đã đến tay tất cả mọi người trong công ty, bao gồm cả CEO và ban giám đốc. Huyền theo dõi sự hỗn loạn diễn ra từ bàn làm việc của mình, bình thản uống cà phê đá. Sau đó, cô ấy đi vòng quanh văn phòng và tự tin nói với mọi người rằng Tiến đã lên kế hoạch cho toàn bộ chuyện này. Cô thì thầm với nhóm marketing rằng anh ấy sẽ đàm phán một sự thăng chức lớn bằng cách sử dụng email đó làm đòn bẩy. Cô thậm chí còn khẳng định rằng CEO đã bí mật cười nhạo trò đùa đó. Thực tế thì Tiến đang trốn trong nhà vệ sinh, cập nhật vội vã sơ yếu lý lịch trên điện thoại và cầu nguyện một phép màu. Anh nhắn tin cho Huyền rằng anh sẽ không bao giờ vác mặt đến văn phòng nữa. Toàn bộ văn phòng tê liệt, háo hức chờ xem liệu Tiến sẽ bị sa thải ngay lập tức hay được tôn vinh làm vị anh hùng mới dũng cảm của văn phòng.",
      "trueFalse": [
        {
          "statement": "Tien intentionally sent the email to the whole company to protest against working on the weekend.",
          "isTrue": false,
          "explanation": "Anh ấy không cố ý. Anh ấy gửi nhầm do nhấn nút 'reply all' trong cơn giận dữ mù quáng (in his blind rage)."
        },
        {
          "statement": "Huyen spread a rumor that Tien had a strategic plan behind his email.",
          "isTrue": true,
          "explanation": "Đúng. Huyền đã đi kể với mọi người rằng Tiến định dùng email đó làm đòn bẩy để đàm phán thăng chức (negotiate a massive promotion)."
        }
      ],
      "multipleChoice": [
        {
          "question": "What was the main reason for Tien's frustration?",
          "options": [
            "A. He wanted an internship but didn't get it.",
            "B. His boss demanded unpaid weekend work right before a deadline.",
            "C. Huyen drank his iced coffee.",
            "D. The CEO refused to read his resume."
          ],
          "answer": "B",
          "explanation": "Sếp của anh ta yêu cầu làm việc cả cuối tuần không lương ngay trước một hạn chót (demanded that Tien work the entire weekend without pay)."
        },
        {
          "question": "Where was Tien while the rest of the office was reacting to the email?",
          "options": [
            "A. Negotiating a promotion in the CEO's office.",
            "B. Having a meeting with the leadership team.",
            "C. Typing a resignation letter at his desk.",
            "D. Hiding in the bathroom updating his resume."
          ],
          "answer": "D",
          "explanation": "Đoạn văn ghi rõ: 'Tien was hiding in the bathroom, rapidly updating his resume on his phone'."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Câu Tường Thuật (Reported Speech)",
        "explanation": "Tuyệt chiêu 'buôn dưa lê' (gossiping) chốn công sở! Khi bạn muốn kể lại lời người khác đã nói, bạn phải dùng Câu Tường Thuật. Quy tắc vàng: Lùi một thì (hiện tại -> quá khứ, quá khứ -> quá khứ hoàn thành), đổi đại từ (I -> he/she), và đổi trạng từ thời gian/nơi chốn (tomorrow -> the next day).",
        "examples": [
          {
            "en": "Direct: Tien said, 'I want to quit my job.' -> Reported: Tien said that he wanted to quit his job.",
            "vi": "Trực tiếp: Tiến nói: 'Tôi muốn bỏ việc.' -> Tường thuật: Tiến nói rằng anh ấy muốn bỏ việc. (want lùi thành wanted)"
          },
          {
            "en": "Direct: The boss yelled, 'I will fire him!' -> Reported: The boss yelled that he would fire him.",
            "vi": "Trực tiếp: Sếp hét lên: 'Tôi sẽ sa thải hắn!' -> Tường thuật: Sếp hét lên rằng ông ấy sẽ sa thải anh ta. (will lùi thành would)"
          }
        ]
      },
      "exercises": [
        {
          "question": "Huyen said, 'I am drinking iced coffee.' -> Huyen said that she ___ iced coffee.",
          "options": [
            "is drinking",
            "was drinking",
            "drinks",
            "drank"
          ],
          "answer": "was drinking"
        },
        {
          "question": "Tien whispered, 'I updated my resume yesterday.' -> Tien whispered that he had updated his resume ___.",
          "options": [
            "yesterday",
            "the next day",
            "the previous day",
            "tomorrow"
          ],
          "answer": "the previous day"
        },
        {
          "question": "The CEO stated, 'We need better leadership.' -> The CEO stated that they ___ better leadership.",
          "options": [
            "need",
            "needed",
            "have needed",
            "will need"
          ],
          "answer": "needed"
        }
      ]
    },
    "conversation": {
      "context": "Huyền đang đứng ở máy pha cà phê, bình thản bấm điện thoại. Tiến vừa lao ra từ nhà vệ sinh, khuôn mặt trắng bệch, mồ hôi đầm đìa sau sự cố 'reply all'.",
      "dialogue": [
        {
          "speaker": "Tien",
          "en": "Huyen, please tell me the Wi-Fi was down. Tell me the email didn't send. I am literally having a panic attack.",
          "vi": "Huyền, làm ơn nói với anh là Wi-Fi bị hỏng đi. Nói với anh là cái email đó chưa được gửi đi. Anh thực sự đang lên cơn hoảng loạn đây."
        },
        {
          "speaker": "Huyen",
          "en": "Oh, it sent. I just heard the CEO laughing in his office. He said that it was the most entertaining thing he had read all year.",
          "vi": "Ồ, gửi rồi. Em vừa nghe thấy CEO cười lớn trong văn phòng kìa. Ông ấy nói rằng đó là thứ giải trí nhất mà ông ấy đọc được trong cả năm nay."
        },
        {
          "speaker": "Tien",
          "en": "I am doomed. My career is over. I need to print my resume right now. Or maybe fake my own death and move to a forest.",
          "vi": "Anh tiêu rồi. Sự nghiệp của anh kết thúc rồi. Anh cần đi in sơ yếu lý lịch ngay bây giờ. Hoặc có lẽ là giả vờ chết rồi chuyển vào rừng sống."
        },
        {
          "speaker": "Huyen",
          "en": "Relax! I already told everyone that you were planning a brilliant negotiation strategy. Just walk in there and demand a promotion!",
          "vi": "Bình tĩnh nào! Em đã nói với mọi người rằng anh đang lên kế hoạch cho một chiến lược đàm phán xuất sắc rồi. Cứ bước vào đó và yêu cầu thăng chức đi!"
        },
        {
          "speaker": "Tien",
          "en": "Demand a promotion? I just called the manager a hairless angry potato in front of 500 colleagues!",
          "vi": "Yêu cầu thăng chức á? Anh vừa gọi quản lý là củ khoai tây trọc đầu tức giận trước mặt 500 đồng nghiệp đấy!"
        }
      ],
      "roleplaySentences": [
        {
          "en": "He said that it was the most entertaining thing he had read all year.",
          "vi": "Ông ấy nói rằng đó là thứ giải trí nhất mà ông ấy đọc được trong cả năm nay.",
          "ipa": "/hi sed ðæt ɪt wəz ðə moʊst ˌentərˈteɪnɪŋ θɪŋ hi hæd red ɔːl jɪr/"
        },
        {
          "en": "I already told everyone that you were planning a brilliant negotiation strategy.",
          "vi": "Tôi đã nói với mọi người rằng bạn đang lên kế hoạch cho một chiến lược đàm phán xuất sắc rồi.",
          "ipa": "/aɪ ɔːlˈredi toʊld ˈevriwʌn ðæt ju wɜːr ˈplænɪŋ ə ˈbrɪljənt nɪˌɡoʊʃiˈeɪʃn ˈstrætədʒi/"
        },
        {
          "en": "I just called the manager a hairless angry potato in front of 500 colleagues!",
          "vi": "Tôi vừa gọi quản lý là một củ khoai tây trọc đầu tức giận trước mặt 500 đồng nghiệp!",
          "ipa": "/aɪ dʒʌst kɔːld ðə ˈmænɪdʒər ə ˈherləs ˈæŋɡri pəˈteɪtoʊ ɪn frʌnt əv faɪv ˈhʌndrəd ˈkɑːliːɡz/"
        }
      ]
    }
  },
  "unit_4": {
    "vocabulary": {
      "words": [
        {
          "word": "anxiety",
          "ipa": "/æŋˈzaɪəti/",
          "type": "noun",
          "meaning": "sự lo âu, chứng lo âu",
          "example": "Looking at his bank account balance gives Tien severe anxiety every month."
        },
        {
          "word": "meditation",
          "ipa": "/ˌmedɪˈteɪʃn/",
          "type": "noun",
          "meaning": "sự thiền định",
          "example": "Tien attempted meditation, but he just ended up thinking about what to eat for dinner."
        },
        {
          "word": "overcome",
          "ipa": "/ˌoʊvərˈkʌm/",
          "type": "verb",
          "meaning": "vượt qua",
          "example": "She had to overcome her fear of public speaking to roast her boyfriend."
        },
        {
          "word": "perspective",
          "ipa": "/pərˈspektɪv/",
          "type": "noun",
          "meaning": "góc nhìn, quan điểm",
          "example": "Losing five hundred dollars to a scammer gave Tien a whole new perspective on life."
        },
        {
          "word": "resilient",
          "ipa": "/rɪˈzɪliənt/",
          "type": "adj",
          "meaning": "kiên cường, mau phục hồi",
          "example": "You have to be extremely resilient to survive an argument with Huyen."
        },
        {
          "word": "therapy",
          "ipa": "/ˈθerəpi/",
          "type": "noun",
          "meaning": "trị liệu, liệu pháp",
          "example": "Retail therapy is expensive, but it works faster than talking to a fake guru."
        },
        {
          "word": "depression",
          "ipa": "/dɪˈpreʃn/",
          "type": "noun",
          "meaning": "trầm cảm, sự chán nản",
          "example": "His minor depression immediately disappeared when he found fifty thousand dong in his winter coat."
        },
        {
          "word": "trigger",
          "ipa": "/ˈtrɪɡər/",
          "type": "noun",
          "meaning": "yếu tố kích động, ngòi nổ tâm lý",
          "example": "The sound of his morning alarm is a huge trigger for his bad mood."
        },
        {
          "word": "mindfulness",
          "ipa": "/ˈmaɪndflnəs/",
          "type": "noun",
          "meaning": "chánh niệm",
          "example": "Practicing mindfulness is hard when your roommate is aggressively playing video games."
        },
        {
          "word": "trauma",
          "ipa": "/ˈtrɔːmə/",
          "type": "noun",
          "meaning": "tổn thương tâm lý",
          "example": "The physical trauma of sitting cross-legged for hours was worse than his actual stress."
        }
      ],
      "exercises": [
        {
          "sentence": "If you want to ___ your fear of heights, you probably shouldn't jump off a bridge on the first day.",
          "answer": "overcome",
          "options": [
            "trigger",
            "overcome",
            "resilient"
          ]
        },
        {
          "sentence": "Tien's attempt at practicing ___ ended in disaster when he fell asleep and snored loudly.",
          "answer": "mindfulness",
          "options": [
            "trauma",
            "perspective",
            "mindfulness"
          ]
        },
        {
          "sentence": "The annoying sound of chewing loudly is a massive ___ for Huyen's anger.",
          "answer": "trigger",
          "options": [
            "trigger",
            "therapy",
            "depression"
          ]
        },
        {
          "sentence": "You must be very ___ to bounce back from such an embarrassing public failure.",
          "answer": "resilient",
          "options": [
            "resilient",
            "anxiety",
            "meditation"
          ]
        }
      ]
    },
    "reading": {
      "title": "The Inner Peace Scam",
      "passage": "Tien thought he needed professional therapy to overcome his severe modern anxiety, so he paid five hundred dollars for a weekend healing retreat in the mountains. He genuinely hoped this expensive trip would cure his mild depression and give him a fresh perspective on life. However, his journey to find inner peace quickly became a brand new emotional trauma. The instructor, who demanded to be called Master Bob, did not teach traditional meditation or mindfulness at all. Instead, he forced Tien to hug a sticky pine tree for four hours while listening to a loud podcast about cryptocurrency. Tien realized that Master Bob must be a complete scammer who just wanted easy money. Every time Tien complained about the horrible back pain, Master Bob arrogantly told him he was simply not being resilient enough. The constant buzzing of huge mountain mosquitoes acted as a violent trigger for Tien's anger, making him far more stressed than when he originally arrived. When he finally escaped the forest and returned to his apartment, Huyen took one look at his sunburned, mosquito-bitten face and burst into uncontrollable laughter. She cruelly pointed out that he might have lost all his savings to a fake guru, but at least he gained a hilarious story for his social media. Tien was absolutely furious, covered in tree sap, and entirely exhausted. He eventually concluded that sitting in terrible city traffic was actually much better for his mental health than hugging trees.",
      "translation": "Tiến nghĩ rằng anh ấy cần trị liệu chuyên nghiệp để vượt qua chứng lo âu thời hiện đại nghiêm trọng của mình, vì vậy anh đã trả năm trăm đô la cho một khóa tu chữa lành cuối tuần trên núi. Anh thực sự hy vọng chuyến đi đắt đỏ này sẽ chữa khỏi sự chán nản nhẹ của mình và mang lại cho anh một góc nhìn mới mẻ về cuộc sống. Tuy nhiên, hành trình tìm kiếm sự bình yên nội tâm của anh nhanh chóng trở thành một tổn thương tâm lý cảm xúc hoàn toàn mới. Người hướng dẫn, kẻ yêu cầu được gọi là Thầy Bob, hoàn toàn không dạy thiền định hay chánh niệm truyền thống. Thay vào đó, ông ta ép Tiến ôm một cây thông dính đầy nhựa trong bốn giờ đồng hồ trong khi nghe một podcast ồn ào về tiền điện tử. Tiến nhận ra rằng Thầy Bob ắt hẳn là một kẻ lừa đảo hoàn toàn chỉ muốn kiếm tiền dễ dàng. Mỗi khi Tiến phàn tự về cơn đau lưng khủng khiếp, Thầy Bob lại kiêu ngạo nói rằng anh chỉ là chưa đủ kiên cường. Tiếng vo ve liên tục của những con muỗi rừng khổng lồ hoạt động như một ngòi nổ bạo lực cho cơn giận của Tiến, khiến anh căng thẳng hơn nhiều so với lúc mới đến. Khi cuối cùng anh trốn thoát khỏi khu rừng và trở về căn hộ của mình, Huyền nhìn khuôn mặt cháy nắng, đầy vết muỗi đốt của anh và phá lên cười không kiểm soát. Cô tàn nhẫn chỉ ra rằng anh có thể đã mất sạch tiền tiết kiệm vào tay một vị đạo sư rởm, nhưng ít nhất anh đã có một câu chuyện hài hước cho mạng xã hội. Tiến vô cùng tức giận, người dính đầy nhựa cây và hoàn toàn kiệt sức. Cuối cùng, anh kết luận rằng việc ngồi trong cảnh tắc đường tồi tệ ở thành phố thực ra còn tốt cho sức khỏe tâm lý của anh hơn nhiều so với việc đi ôm cây.",
      "trueFalse": [
        {
          "statement": "Tien went to the retreat because he wanted to learn how to invest in cryptocurrency.",
          "isTrue": false,
          "explanation": "Sai. Tiến tham gia khóa tu để chữa lành chứng lo âu và chán nản, việc nghe podcast về tiền điện tử là do ông thầy lừa đảo ép buộc."
        },
        {
          "statement": "Huyen was very sympathetic and comforting when Tien returned from the retreat.",
          "isTrue": false,
          "explanation": "Sai bét. Huyền đã cười vào mặt Tiến một cách không kiểm soát (burst into uncontrollable laughter) thay vì an ủi anh ấy."
        }
      ],
      "multipleChoice": [
        {
          "question": "What did Master Bob say when Tien complained about his back pain?",
          "options": [
            "A. He told Tien to try a different meditation pose.",
            "B. He gave Tien some professional therapy.",
            "C. He said Tien was not being resilient enough.",
            "D. He told Tien he must be suffering from depression."
          ],
          "answer": "C",
          "explanation": "Trong đoạn văn có câu: 'Master Bob arrogantly told him he was simply not being resilient enough' (Thầy Bob kiêu ngạo nói rằng anh chỉ là chưa đủ kiên cường)."
        },
        {
          "question": "What conclusion did Tien reach at the end of the story?",
          "options": [
            "A. That hugging trees is a great way to overcome trauma.",
            "B. That sitting in traffic is better for his mental health.",
            "C. That he should become a meditation instructor.",
            "D. That he might have found true inner peace."
          ],
          "answer": "B",
          "explanation": "Đoạn cuối chỉ rõ: 'He eventually concluded that sitting in terrible city traffic was actually much better for his mental health than hugging trees.'"
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Động từ khuyết thiếu suy luận (Modals of Deduction: must be, might have)",
        "explanation": "Chào mừng đến với lớp học 'Làm thám tử chốn thị phi'! Khi bạn muốn phán đoán một sự việc, hãy dùng Modals of Deduction.\n\n1. Hiện tại (Present): Suy luận chắc chắn đúng ở hiện tại -> Dùng 'must + be/V'. (Ví dụ: Thấy bạn mình mặt ngu ngơ mất tiền -> 'He must be an idiot' - Nó chắc hẳn là một đứa ngốc).\n\n2. Quá khứ (Past): Suy luận có thể đã xảy ra trong quá khứ nhưng không chắc chắn 100% -> Dùng 'might have + P2' (Phân từ 2). (Ví dụ: 'He might have been scammed' - Anh ta có lẽ đã bị lừa rồi).",
        "examples": [
          {
            "en": "Tien paid $500 to hug a tree. He must be crazy.",
            "vi": "Tiến trả 500 đô để ôm một cái cây. Anh ta chắc hẳn bị điên rồi. (Suy luận chắc chắn ở hiện tại)"
          },
          {
            "en": "Huyen is laughing so hard. She might have posted his picture online.",
            "vi": "Huyền đang cười rất sảng khoái. Cô ấy có lẽ đã đăng ảnh của anh ấy lên mạng rồi. (Suy luận khả năng trong quá khứ)"
          }
        ]
      },
      "exercises": [
        {
          "question": "Tien's face is completely red and swollen. He ___ bitten by mosquitoes.",
          "options": [
            "must be",
            "might have been",
            "must have been",
            "can be"
          ],
          "answer": "must have been"
        },
        {
          "question": "Master Bob charges $500 for a podcast session. He ___ very rich by now.",
          "options": [
            "must be",
            "might have",
            "must have",
            "can be"
          ],
          "answer": "must be"
        },
        {
          "question": "I'm not sure where Tien went after the retreat, but he ___ gone straight to the hospital.",
          "options": [
            "must be",
            "might be",
            "might have",
            "must have"
          ],
          "answer": "might have"
        }
      ]
    },
    "conversation": {
      "context": "Tiến vừa lết xác về từ khóa tu chữa lành, mặt mũi dính đầy bùn và lá cây. Huyền đang ung dung uống trà sữa trên sofa, nhìn Tiến từ đầu đến chân với ánh mắt đầy mỉa mai.",
      "dialogue": [
        {
          "speaker": "Huyen",
          "en": "Wow, look at you! You must be the absolute king of mindfulness. Did you find your inner peace, or just a lot of dirt?",
          "vi": "Chà, nhìn anh kìa! Anh ắt hẳn là ông hoàng chánh niệm rồi. Anh đã tìm thấy sự bình yên nội tâm chưa, hay chỉ toàn là bùn đất thế?"
        },
        {
          "speaker": "Tien",
          "en": "Don't trigger me, Huyen. That fake guru therapy was a complete disaster. I had to hug a tree for four hours!",
          "vi": "Đừng có chọc tức anh, Huyền. Cái liệu pháp của ông đạo sư rởm đó là một thảm họa hoàn toàn. Anh đã phải ôm một cái cây trong bốn tiếng đồng hồ đấy!"
        },
        {
          "speaker": "Huyen",
          "en": "Four hours?! You might have lost your mind completely. How much did you pay to be emotionally abused by a tree?",
          "vi": "Bốn tiếng á?! Có lẽ anh đã mất trí hoàn toàn rồi. Anh đã trả bao nhiêu tiền để bị bạo hành cảm xúc bởi một cái cây vậy?"
        },
        {
          "speaker": "Tien",
          "en": "Five hundred dollars. And he said I needed to be more resilient! It was literal trauma. My anxiety is completely out of control now.",
          "vi": "Năm trăm đô la. Và ông ta nói anh cần phải kiên cường hơn! Đó đúng đen là một tổn thương tâm lý. Chứng lo âu của anh giờ mất kiểm soát hoàn toàn rồi."
        },
        {
          "speaker": "Huyen",
          "en": "Well, you must be exhausted. Go take a shower before your 'healing energy' ruins my clean carpet.",
          "vi": "Chà, anh ắt hẳn là kiệt sức rồi. Đi tắm đi trước khi 'năng lượng chữa lành' của anh làm hỏng tấm thảm sạch của em."
        }
      ],
      "roleplaySentences": [
        {
          "en": "You must be the absolute king of mindfulness.",
          "vi": "Bạn ắt hẳn là ông hoàng chánh niệm rồi.",
          "ipa": "/ju mʌst bi ði ˈæbsəluːt kɪŋ əv ˈmaɪndflnəs/"
        },
        {
          "en": "You might have lost your mind completely.",
          "vi": "Bạn có lẽ đã mất trí hoàn toàn rồi.",
          "ipa": "/ju maɪt hæv lɔːst jɔːr maɪnd kəmˈpliːtli/"
        },
        {
          "en": "My anxiety is completely out of control now.",
          "vi": "Chứng lo âu của tôi giờ mất kiểm soát hoàn toàn rồi.",
          "ipa": "/maɪ æŋˈzaɪəti ɪz kəmˈpliːtli aʊt əv kənˈtroʊl naʊ/"
        }
      ]
    }
  },
  "unit_5": {
    "vocabulary": {
      "words": [
        {
          "word": "manipulate",
          "ipa": "/məˈnɪpjuleɪt/",
          "type": "verb",
          "meaning": "thao túng (tâm lý)",
          "example": "Huyen knows exactly how to manipulate her followers into buying terrible products."
        },
        {
          "word": "authentic",
          "ipa": "/ɔːˈθentɪk/",
          "type": "adj",
          "meaning": "chân thật, đích thực",
          "example": "She posted a video of her crying to seem authentic, but she was just chopping onions."
        },
        {
          "word": "gimmick",
          "ipa": "/ˈɡɪmɪk/",
          "type": "noun",
          "meaning": "chiêu trò (thường để thu hút chú ý hoặc bán hàng)",
          "example": "Drinking tea upside down is just a silly gimmick to get more views."
        },
        {
          "word": "strategy",
          "ipa": "/ˈstrætədʒi/",
          "type": "noun",
          "meaning": "chiến lược",
          "example": "Tien thought his strategy to expose her was genius, until it backfired completely."
        },
        {
          "word": "persuasive",
          "ipa": "/pərˈsweɪsɪv/",
          "type": "adj",
          "meaning": "có sức thuyết phục",
          "example": "Her sales pitch was so persuasive that even her worst enemy bought fifty boxes."
        },
        {
          "word": "target audience",
          "ipa": "/ˈtɑːrɡɪt ˈɔːdiəns/",
          "type": "noun",
          "meaning": "khách hàng mục tiêu",
          "example": "Huyen's target audience consists of gullible teenagers and sleep-deprived adults like Tien."
        },
        {
          "word": "scam",
          "ipa": "/skæm/",
          "type": "noun",
          "meaning": "trò lừa đảo, cú lừa",
          "example": "Paying fifty dollars for hot water with food coloring is an absolute scam."
        },
        {
          "word": "brainwash",
          "ipa": "/ˈbreɪnwɔːʃ/",
          "type": "verb",
          "meaning": "tẩy não",
          "example": "The repetitive music in her TikTok videos is designed to brainwash viewers."
        },
        {
          "word": "influencer",
          "ipa": "/ˈɪnfluənsər/",
          "type": "noun",
          "meaning": "người có sức ảnh hưởng (trên mạng xã hội)",
          "example": "Becoming a famous influencer requires a ring light and zero shame."
        },
        {
          "word": "boycott",
          "ipa": "/ˈbɔɪkɑːt/",
          "type": "verb",
          "meaning": "tẩy chay",
          "example": "Tien organized an online campaign to boycott her brand, but nobody cared."
        }
      ],
      "exercises": [
        {
          "sentence": "Selling magic weight-loss powder that is actually just flour is a massive ___.",
          "answer": "scam",
          "options": [
            "strategy",
            "scam",
            "target audience"
          ]
        },
        {
          "sentence": "Huyen used a ridiculous marketing ___ to trick people into watching her livestream.",
          "answer": "gimmick",
          "options": [
            "boycott",
            "gimmick",
            "authentic"
          ]
        },
        {
          "sentence": "Tien tried to ___ his friends into disliking her videos, but they ignored him.",
          "answer": "manipulate",
          "options": [
            "brainwash",
            "manipulate",
            "boycott"
          ]
        },
        {
          "sentence": "To be a successful ___, you just need to pretend your life is perfect every single day.",
          "answer": "influencer",
          "options": [
            "influencer",
            "scam",
            "strategy"
          ]
        }
      ]
    },
    "reading": {
      "title": "The Magic Mud Tea Disaster",
      "passage": "Huyen, who suddenly bought a cheap ring light on Shopee, decided to become a famous wellness influencer overnight. She started selling Magic Mud Detox Tea, which tastes exactly like dirty pond water. Her marketing strategy was a ridiculous gimmick designed to brainwash her gullible followers. Tien, whose life mission is to annoy Huyen, immediately recognized that the product was a complete scam. He knew she just wanted to manipulate her target audience to buy her overpriced garbage. Tien created a secret account to expose her lies, hoping people would boycott her brand entirely. However, Huyen's crying videos, which featured sad background music, were unexpectedly persuasive. She claimed her tears were authentic, though Tien knew she was slicing onions off-camera. In a shocking twist of events, Tien stared at his phone at 3 AM and somehow convinced himself that he actually needed a deep detox. The guy who swore to destroy her business accidentally became her top buyer. Now, Tien has fifty boxes of useless tea hidden under his bed, while Huyen is busy planning her luxury vacation to Bali. Whenever Tien looks at the boxes, which remind him of his own stupidity, he deeply regrets underestimating the terrifying power of modern internet marketing.",
      "translation": "Huyền, người vừa đột ngột mua một chiếc đèn livestream giá rẻ trên Shopee, quyết định trở thành một người có sức ảnh hưởng về sức khỏe nổi tiếng chỉ sau một đêm. Cô bắt đầu bán Trà Detox Bùn Thần Kỳ, thứ có vị y hệt như nước ao bẩn. Chiến lược tiếp thị của cô là một chiêu trò nực cười được thiết kế để tẩy não những người theo dõi cả tin của mình. Tiến, người có sứ mệnh cuộc đời là chọc tức Huyền, ngay lập tức nhận ra rằng sản phẩm đó là một cú lừa hoàn toàn. Anh biết cô chỉ muốn thao túng khách hàng mục tiêu để họ mua đống rác rưởi đắt đỏ của cô. Tiến đã tạo một tài khoản bí mật để bóc phốt những lời nói dối của cô, hy vọng mọi người sẽ tẩy chay hoàn toàn thương hiệu của cô. Tuy nhiên, những video khóc lóc của Huyền, thứ có lồng nhạc nền buồn bã, lại có sức thuyết phục một cách bất ngờ. Cô khẳng định những giọt nước mắt của mình là chân thật, mặc dù Tiến biết cô đang thái hành tây ở góc khuất camera. Trong một bước ngoặt chấn động, Tiến nhìn chằm chằm vào điện thoại lúc 3 giờ sáng và không hiểu sao lại tự thuyết phục bản thân rằng anh thực sự cần thanh lọc cơ thể sâu. Kẻ thề sẽ tiêu diệt công việc kinh doanh của cô đã vô tình trở thành người mua hàng chóp bu của cô. Giờ đây, Tiến có năm mươi hộp trà vô dụng giấu dưới gầm giường, trong khi Huyền đang bận rộn lên kế hoạch cho kỳ nghỉ sang chảnh ở Bali. Mỗi khi Tiến nhìn vào những chiếc hộp, thứ nhắc nhở anh về sự ngu ngốc của chính mình, anh vô cùng hối hận vì đã đánh giá thấp sức mạnh đáng sợ của tiếp thị mạng internet hiện đại.",
      "trueFalse": [
        {
          "statement": "Tien bought the detox tea because he wanted to secretly support Huyen's new business.",
          "isTrue": false,
          "explanation": "Sai. Tiến mua trà vì anh ta lướt điện thoại lúc 3 giờ sáng và tự bị thuyết phục một cách vô lý (somehow convinced himself that he actually needed a deep detox), chứ không phải vì muốn ủng hộ Huyền."
        },
        {
          "statement": "Huyen used fake tears induced by onions to make her marketing videos more emotional.",
          "isTrue": true,
          "explanation": "Đúng. Đoạn văn nêu rõ: 'She claimed her tears were authentic, though Tien knew she was slicing onions off-camera' (Cô khẳng định nước mắt là thật, dù Tiến biết cô đang thái hành ngoài ống kính)."
        }
      ],
      "multipleChoice": [
        {
          "question": "What was Tien's initial goal when Huyen started selling the tea?",
          "options": [
            "A. To become her business partner and share the profits.",
            "B. To buy fifty boxes before they sold out.",
            "C. To expose her lies and make people boycott her brand.",
            "D. To learn her marketing strategy and brainwash his own friends."
          ],
          "answer": "C",
          "explanation": "Mục tiêu ban đầu của Tiến là tạo tài khoản bí mật để bóc phốt (expose her lies) và mong mọi người tẩy chay (boycott) cô ấy."
        },
        {
          "question": "Why is the ending of the story ironic (trớ trêu)?",
          "options": [
            "A. Because the tea actually cured Tien's health problems.",
            "B. Because the guy who wanted to destroy her business became her biggest customer.",
            "C. Because Huyen decided to refund all of Tien's money.",
            "D. Because Huyen's target audience realized it was a scam."
          ],
          "answer": "B",
          "explanation": "Sự trớ trêu nằm ở chỗ kẻ thề sẽ tiêu diệt công việc kinh doanh của cô (The guy who swore to destroy her business) lại vô tình trở thành khách hàng lớn nhất (accidentally became her top buyer)."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Mệnh Đề Quan Hệ (Relative Clauses - Defining & Non-defining)",
        "explanation": "Chào mừng đến với lớp học 'Bóc Phốt Ngữ Pháp'! Khi bạn muốn thêm thông tin rắc rối cho một ai đó hoặc cái gì đó, hãy dùng Mệnh Đề Quan Hệ.\n\n1. Defining (Xác định): Không có dấu phẩy. Bắt buộc phải có để biết đang nói về ai/cái gì. (Ví dụ: The guy WHO bought 50 boxes of tea is an idiot -> Không có 'who bought...' thì không biết đang chửi ai).\n2. Non-defining (Không xác định): Có dấu phẩy kẹp giữa. Chỉ là thông tin thêm, dưa lê mắm muối, bỏ đi câu vẫn đủ nghĩa. KHÔNG BAO GIỜ dùng 'THAT' ở đây. (Ví dụ: Huyen, WHO is a fake influencer, makes a lot of money -> Bỏ vế giữa đi vẫn biết Huyen là ai).\n\nĐại từ: WHO (người), WHICH (vật), WHOSE (sở hữu - 'của người/vật đó'), WHOM (tân ngữ người).",
        "examples": [
          {
            "en": "The detox tea, which tastes like dirt, is a total scam. (Non-defining)",
            "vi": "Trà detox, thứ có vị như bùn, là một trò lừa đảo hoàn toàn. (Bỏ 'thứ có vị như bùn' câu vẫn có nghĩa)."
          },
          {
            "en": "Tien is the person whose money paid for Huyen's vacation. (Defining)",
            "vi": "Tiến là người mà tiền của anh ta đã chi trả cho kỳ nghỉ của Huyền. (Dùng 'whose' để chỉ sở hữu)."
          }
        ]
      },
      "exercises": [
        {
          "question": "Huyen's new strategy, ___ involves crying on camera, is working perfectly.",
          "options": [
            "that",
            "which",
            "who",
            "whose"
          ],
          "answer": "which"
        },
        {
          "question": "The fake influencer ___ sold me this garbage needs to be stopped!",
          "options": [
            "who",
            "which",
            "whom",
            "whose"
          ],
          "answer": "who"
        },
        {
          "question": "Tien, ___ bank account is now empty, feels very stupid.",
          "options": [
            "who",
            "which",
            "whom",
            "whose"
          ],
          "answer": "whose"
        }
      ]
    },
    "conversation": {
      "context": "Tiến đang lén lút pha một cốc trà Detox Bùn Thần Kỳ trong bếp vào lúc 2 giờ sáng. Đột nhiên, đèn bếp bật sáng. Huyền đang đứng khoanh tay, nhếch mép cười đắc ý.",
      "dialogue": [
        {
          "speaker": "Huyen",
          "en": "Well, well. Look who is drinking the garbage which he called a complete scam on the internet!",
          "vi": "Chà chà. Nhìn xem ai đang uống thứ rác rưởi mà anh ta gọi là cú lừa hoàn toàn trên mạng kìa!"
        },
        {
          "speaker": "Tien",
          "en": "I am doing essential scientific research! The influencer whose videos brainwash innocent people must be stopped.",
          "vi": "Anh đang thực hiện nghiên cứu khoa học thiết yếu! Kẻ có sức ảnh hưởng mà video của cô ta tẩy não những người vô tội cần phải bị ngăn chặn."
        },
        {
          "speaker": "Huyen",
          "en": "Right. My strategy, which is highly persuasive, clearly worked on your weak mind. You bought fifty boxes, idiot!",
          "vi": "Phải rồi. Chiến lược của tôi, thứ cực kỳ có sức thuyết phục, rõ ràng đã có tác dụng với tâm trí yếu đuối của anh. Anh đã mua tận năm mươi hộp, đồ ngốc!"
        },
        {
          "speaker": "Tien",
          "en": "I was going to boycott you! But... you used sad music. It felt so authentic. I was manipulated! Give me a refund!",
          "vi": "Anh đã định tẩy chay em rồi! Nhưng... em lại dùng nhạc buồn. Cảm giác nó chân thật quá. Anh đã bị thao túng! Hoàn tiền cho anh đi!"
        },
        {
          "speaker": "Huyen",
          "en": "Sorry, my target audience does not get refunds. Now drink your expensive mud water, top fan.",
          "vi": "Rất tiếc, khách hàng mục tiêu của tôi không được hoàn tiền. Giờ thì uống nước bùn đắt tiền của anh đi, fan cứng."
        }
      ],
      "roleplaySentences": [
        {
          "en": "Look who is drinking the garbage which he called a complete scam!",
          "vi": "Nhìn xem ai đang uống thứ rác rưởi mà anh ta gọi là một cú lừa hoàn toàn kìa!",
          "ipa": "/lʊk huː ɪz ˈdrɪŋkɪŋ ðə ˈɡɑːrbɪdʒ wɪtʃ hi kɔːld ə kəmˈpliːt skæm/"
        },
        {
          "en": "The influencer whose videos brainwash innocent people must be stopped.",
          "vi": "Kẻ có sức ảnh hưởng mà video của cô ta tẩy não những người vô tội cần phải bị ngăn chặn.",
          "ipa": "/ði ˈɪnfluənsər huːz ˈvɪdioʊz ˈbreɪnwɔːʃ ˈɪnəsnt ˈpiːpl mʌst bi stɑːpt/"
        },
        {
          "en": "My strategy, which is highly persuasive, clearly worked on your weak mind.",
          "vi": "Chiến lược của tôi, thứ cực kỳ có sức thuyết phục, rõ ràng đã có tác dụng với tâm trí yếu đuối của bạn.",
          "ipa": "/maɪ ˈstrætədʒi, wɪtʃ ɪz ˈhaɪli pərˈsweɪsɪv, ˈklɪrli wɜːrkt ɑːn jɔːr wiːk maɪnd/"
        }
      ]
    }
  },
  "unit_6": {
    "vocabulary": {
      "words": [
        {
          "word": "suspect",
          "ipa": "/ˈsʌspekt/",
          "type": "noun",
          "meaning": "nghi phạm",
          "example": "Tien stared at Huyen, convinced she was the prime suspect in the great sneaker robbery."
        },
        {
          "word": "investigate",
          "ipa": "/ɪnˈvestɪɡeɪt/",
          "type": "verb",
          "meaning": "điều tra",
          "example": "He put on fake sunglasses to investigate the missing shoes like a dramatic FBI agent."
        },
        {
          "word": "evidence",
          "ipa": "/ˈevɪdəns/",
          "type": "noun",
          "meaning": "bằng chứng",
          "example": "A single strand of Huyen's hair near the shoe rack was all the evidence Tien needed."
        },
        {
          "word": "guilty",
          "ipa": "/ˈɡɪlti/",
          "type": "adj",
          "meaning": "có tội",
          "example": "Huyen did not look guilty at all; she just looked extremely annoyed."
        },
        {
          "word": "court",
          "ipa": "/kɔːrt/",
          "type": "noun",
          "meaning": "tòa án",
          "example": "Tien threatened to take her to a roommate court to face justice."
        },
        {
          "word": "blackmail",
          "ipa": "/ˈblækmeɪl/",
          "type": "verb",
          "meaning": "tống tiền, đe dọa tống tiền",
          "example": "He tried to blackmail her by threatening to show her embarrassing selfies to her crush."
        },
        {
          "word": "smuggle",
          "ipa": "/ˈsmʌɡl/",
          "type": "verb",
          "meaning": "buôn lậu, lén lút mang đi",
          "example": "He was absolutely certain someone had managed to smuggle his sneakers out in a grocery bag."
        },
        {
          "word": "hacker",
          "ipa": "/ˈhækər/",
          "type": "noun",
          "meaning": "tin tặc",
          "example": "Tien wildly accused Huyen of hiring a professional hacker to delete the building's camera footage."
        },
        {
          "word": "corruption",
          "ipa": "/kəˈrʌpʃn/",
          "type": "noun",
          "meaning": "sự tham nhũng, sự tha hóa",
          "example": "Huyen pointed out the corruption in his logic, considering he lost his own keys twice a week."
        },
        {
          "word": "testify",
          "ipa": "/ˈtestɪfaɪ/",
          "type": "verb",
          "meaning": "làm chứng",
          "example": "The delivery guy refused to testify in Tien's ridiculous living room trial."
        }
      ],
      "exercises": [
        {
          "sentence": "Tien tried to find some fingerprints as ___ to prove his ridiculous theory.",
          "answer": "evidence",
          "options": [
            "corruption",
            "evidence",
            "hacker"
          ]
        },
        {
          "sentence": "If you don't give me back my shoes, I will ___ you with that video of you singing off-key.",
          "answer": "blackmail",
          "options": [
            "smuggle",
            "testify",
            "blackmail"
          ]
        },
        {
          "sentence": "The judge hit his hammer and declared the ___ completely insane.",
          "answer": "suspect",
          "options": [
            "suspect",
            "court",
            "guilty"
          ]
        },
        {
          "sentence": "Huyen used to be a good roommate, but taking my snacks shows pure moral ___.",
          "answer": "corruption",
          "options": [
            "hacker",
            "corruption",
            "investigate"
          ]
        }
      ]
    },
    "reading": {
      "title": "The Great Sneaker Scandal",
      "passage": "Tien had been searching for his limited-edition sneakers for three days before he finally decided to officially investigate the crime scene. He put on cheap sunglasses, grabbed a notebook, and started acting like an aggressive FBI agent. It was painfully obvious to him that someone had managed to smuggle his precious shoes out of the apartment. Naturally, his roommate Huyen was the prime suspect. Huyen had been acting suspiciously all week, mainly because she had suddenly bought a bunch of expensive bubble tea. Tien aggressively interrogated her in the living room, claiming he had found solid evidence under the sofa. He even accused her of paying a professional hacker to delete the apartment security footage so she could get away with the crime. Huyen just rolled her eyes, sipped her tea, and refused to testify in his imaginary court. Tien then tried to blackmail her, saying he would reveal her secret embarrassing TikTok account to her mom if she did not confess. He yelled that her silence proved she was entirely guilty. However, Huyen calmly pointed out the deep corruption in his detective work. She reminded him that he had been wearing those exact sneakers to a house party last Friday and had left them at his friend's house because he got completely drunk. The great detective instantly turned red and realized his dramatic investigation was a total disaster.",
      "translation": "Tiến đã tìm kiếm đôi giày thể thao phiên bản giới hạn của mình suốt ba ngày trước khi anh cuối cùng quyết định chính thức điều tra hiện trường vụ án. Anh đeo một cặp kính râm rẻ tiền, chộp lấy một cuốn sổ tay và bắt đầu hành động như một đặc vụ FBI hung hăng. Đối với anh, rõ ràng là ai đó đã xoay xở để lén lút mang đôi giày quý giá của anh ra khỏi căn hộ. Đương nhiên, cô bạn cùng phòng Huyền là nghi phạm chính. Huyền đã hành xử một cách đáng ngờ suốt cả tuần, chủ yếu là vì cô ấy đột nhiên mua một đống trà sữa đắt tiền. Tiến hung hăng thẩm vấn cô trong phòng khách, tuyên bố rằng anh đã tìm thấy bằng chứng vững chắc dưới ghế sofa. Anh thậm chí còn buộc tội cô trả tiền cho một tin tặc chuyên nghiệp để xóa đoạn phim an ninh của căn hộ hòng thoát tội. Huyền chỉ đảo mắt, nhấp một ngụm trà và từ chối làm chứng trong cái tòa án tưởng tượng của anh ta. Tiến sau đó cố gắng tống tiền cô, nói rằng anh sẽ tiết lộ tài khoản TikTok đáng xấu hổ bí mật của cô cho mẹ cô nếu cô không thú nhận. Anh hét lên rằng sự im lặng của cô chứng tỏ cô hoàn toàn có tội. Tuy nhiên, Huyền bình tĩnh chỉ ra sự tha hóa sâu sắc trong công tác thám tử của anh. Cô nhắc anh nhớ rằng anh đã đi chính đôi giày thể thao đó đến một bữa tiệc tại gia vào thứ Sáu tuần trước và đã để quên chúng ở nhà bạn vì anh đã say bét nhè. Vị thám tử tài ba lập tức đỏ mặt và nhận ra cuộc điều tra đầy kịch tính của mình là một thảm họa hoàn toàn.",
      "trueFalse": [
        {
          "statement": "Tien accused Huyen of hiring a hacker to manipulate the CCTV cameras.",
          "isTrue": true,
          "explanation": "Đúng. Trong bài có câu 'He even accused her of paying a professional hacker to delete the apartment security footage' (Anh thậm chí còn buộc tội cô trả tiền cho hacker xóa camera)."
        },
        {
          "statement": "Huyen confessed that she smuggled the shoes out to buy bubble tea.",
          "isTrue": false,
          "explanation": "Sai. Huyền không hề buôn lậu giày. Sự thật là Tiến đã đi đôi giày đó đi quẩy và bỏ quên ở nhà bạn khi say xỉn."
        }
      ],
      "multipleChoice": [
        {
          "question": "How did Tien try to force Huyen to tell the truth?",
          "options": [
            "A. He offered to buy her expensive bubble tea.",
            "B. He threatened to blackmail her using her secret TikTok account.",
            "C. He took her to a real court with a judge.",
            "D. He hired a hacker to steal her phone."
          ],
          "answer": "B",
          "explanation": "Tiến đã dùng tài khoản TikTok bí mật của Huyền để đe dọa tống tiền (blackmail) ép cô nhận tội."
        },
        {
          "question": "What is the real reason the sneakers were missing?",
          "options": [
            "A. Someone smuggled them out while Tien was sleeping.",
            "B. Huyen hid them under the sofa as a joke.",
            "C. Tien had been wearing them to a party and forgot them there.",
            "D. The FBI confiscated them as evidence."
          ],
          "answer": "C",
          "explanation": "Huyền nhắc nhở Tiến rằng chính anh ta đã đi đôi giày đó đến bữa tiệc hôm thứ Sáu và bỏ quên ở đó do say xỉn."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Quá Khứ Hoàn Thành & Quá Khứ Hoàn Thành Tiếp Diễn (Bóc phốt quá khứ)",
        "explanation": "Hai thì này dùng để kể về drama đã xảy ra TRƯỚC một drama khác trong quá khứ.\n1. Quá Khứ Hoàn Thành (Past Perfect): S + had + V3/ed. Dùng để nhấn mạnh KẾT QUẢ của một hành động xảy ra trước một hành động khác trong quá khứ. (Ví dụ: Tiến nhận ra ai đó ĐÃ trộm giày của mình - hành động trộm xảy ra và xong trước khi nhận ra).\n2. Quá Khứ Hoàn Thành Tiếp Diễn (Past Perfect Continuous): S + had been + V-ing. Dùng để nhấn mạnh QUÁ TRÌNH kéo dài liên tục của một hành động trước một mốc quá khứ. (Ví dụ: Tiến ĐÃ ĐANG tìm giày suốt 3 ngày trước khi quyết định làm thám tử - hành động tìm kiếm kéo dài liên tục).",
        "examples": [
          {
            "en": "By the time Tien started to investigate, someone had already smuggled the shoes. (Past Perfect)",
            "vi": "Vào lúc Tiến bắt đầu điều tra, ai đó đã nẫng mất đôi giày rồi. (Hành động nẫng giày xong xuôi trước khi điều tra)."
          },
          {
            "en": "Huyen had been drinking bubble tea for an hour before Tien accused her. (Past Perfect Continuous)",
            "vi": "Huyền đã ngồi uống trà sữa cả tiếng đồng hồ trước khi Tiến buộc tội cô. (Nhấn mạnh quá trình uống trà kéo dài liên tục)."
          }
        ]
      },
      "exercises": [
        {
          "question": "Tien realized that he ___ the sneakers at his friend's house.",
          "options": [
            "has left",
            "had left",
            "had been leaving",
            "was leaving"
          ],
          "answer": "had left"
        },
        {
          "question": "Before he accused Huyen, Tien ___ for the evidence all morning without success.",
          "options": [
            "had searched",
            "searched",
            "had been searching",
            "was searched"
          ],
          "answer": "had been searching"
        },
        {
          "question": "Huyen was annoyed because she ___ perfectly quiet before Tien started yelling about his shoes.",
          "options": [
            "had been sitting",
            "had sit",
            "was sit",
            "has been sitting"
          ],
          "answer": "had been sitting"
        }
      ]
    },
    "conversation": {
      "context": "Tiến đang đứng chắp tay sau lưng, đeo kính râm trong nhà vào buổi tối. Huyền đang nằm ườn trên sô pha lướt điện thoại.",
      "dialogue": [
        {
          "speaker": "Tien",
          "en": "I know you are guilty. You had been planning this scandal all week before you finally smuggled my shoes out.",
          "vi": "Anh biết em có tội. Em đã lên kế hoạch cho vụ bê bối này cả tuần trước khi em lén tuồn đôi giày của anh ra ngoài."
        },
        {
          "speaker": "Huyen",
          "en": "Are you okay? You have been acting like a crazy person. I don't need to smuggle your smelly shoes.",
          "vi": "Anh có ổn không đấy? Anh cứ hành xử như người điên nãy giờ. Em không rảnh để đi buôn lậu đôi giày bốc mùi của anh."
        },
        {
          "speaker": "Tien",
          "en": "Don't lie! My evidence is solid. I will take you to court. Or better, I will blackmail you with your browser history!",
          "vi": "Đừng có dối trá! Bằng chứng của anh rất vững chắc. Anh sẽ đưa em ra tòa. Hoặc tốt hơn, anh sẽ tống tiền em bằng lịch sử duyệt web của em!"
        },
        {
          "speaker": "Huyen",
          "en": "The only corruption here is your brain cells. You had left them at Phong's house on Friday night because you drank six beers.",
          "vi": "Sự tha hóa duy nhất ở đây là tế bào não của anh đấy. Anh đã bỏ quên chúng ở nhà Phong vào tối thứ Sáu vì anh nốc tận sáu lon bia."
        },
        {
          "speaker": "Tien",
          "en": "...I refuse to testify without my lawyer. This investigation is closed.",
          "vi": "...Tôi từ chối làm chứng nếu không có luật sư. Cuộc điều tra này khép lại tại đây."
        }
      ],
      "roleplaySentences": [
        {
          "en": "You had been planning this scandal all week before you finally smuggled my shoes out.",
          "vi": "Em đã lên kế hoạch cho vụ bê bối này cả tuần trước khi em lén tuồn đôi giày của anh ra ngoài.",
          "ipa": "/ju hæd bɪn ˈplænɪŋ ðɪs ˈskændl ɔːl wiːk bɪˈfɔːr ju ˈfaɪnəli ˈsmʌɡld maɪ ʃuːz aʊt/"
        },
        {
          "en": "I will blackmail you with your browser history!",
          "vi": "Tôi sẽ tống tiền bạn bằng lịch sử duyệt web của bạn!",
          "ipa": "/aɪ wɪl ˈblækmeɪl ju wɪð jɔːr ˈbraʊzər ˈhɪstəri/"
        },
        {
          "en": "The only corruption here is your brain cells.",
          "vi": "Sự tha hóa duy nhất ở đây là tế bào não của anh đấy.",
          "ipa": "/ði ˈoʊnli kəˈrʌpʃn hɪr ɪz jɔːr breɪn selz/"
        }
      ]
    }
  },
  "unit_7": {
    "vocabulary": {
      "words": [
        {
          "word": "diversity",
          "ipa": "/daɪˈvɜːrsəti/",
          "type": "noun",
          "meaning": "sự đa dạng",
          "example": "Tien was totally shocked by the cultural diversity at the party, especially the weird cheese."
        },
        {
          "word": "heritage",
          "ipa": "/ˈherɪtɪdʒ/",
          "type": "noun",
          "meaning": "di sản, truyền thống văn hóa",
          "example": "Huyen proudly explained her cultural heritage while eating spaghetti with chopsticks."
        },
        {
          "word": "stereotype",
          "ipa": "/ˈsteriətaɪp/",
          "type": "noun",
          "meaning": "định kiến, khuôn mẫu",
          "example": "Tien tried to break the stereotype that all tourists are loud, but he failed immediately by shouting."
        },
        {
          "word": "integration",
          "ipa": "/ˌɪntɪˈɡreɪʃn/",
          "type": "noun",
          "meaning": "sự hội nhập",
          "example": "Their attempt at cultural integration involved offending the polite host within five minutes."
        },
        {
          "word": "mainstream",
          "ipa": "/ˈmeɪnstriːm/",
          "type": "adj",
          "meaning": "xu hướng chủ đạo, đại trà",
          "example": "Refusing to eat local food is a mainstream opinion for picky eaters like Tien."
        },
        {
          "word": "controversial",
          "ipa": "/ˌkɑːntrəˈvɜːrʃl/",
          "type": "adj",
          "meaning": "gây tranh cãi",
          "example": "Bringing smelly fish sauce to a fancy French dinner was a highly controversial move."
        },
        {
          "word": "taboo",
          "ipa": "/təˈbuː/",
          "type": "noun",
          "meaning": "điều cấm kỵ",
          "example": "Asking the rich European host about his monthly salary is a massive taboo."
        },
        {
          "word": "etiquette",
          "ipa": "/ˈetɪkət/",
          "type": "noun",
          "meaning": "phép lịch sự, nghi thức",
          "example": "Proper dining etiquette definitely does not include putting your bare feet on the table."
        },
        {
          "word": "immigrant",
          "ipa": "/ˈɪmɪɡrənt/",
          "type": "noun",
          "meaning": "người nhập cư",
          "example": "The successful immigrant host was absolutely not impressed by Tien's awkward jokes."
        },
        {
          "word": "prejudice",
          "ipa": "/ˈpredʒədɪs/",
          "type": "noun",
          "meaning": "thành kiến",
          "example": "Huyen faced some prejudice from the waiters, mostly because she wore pajamas to a formal event."
        }
      ],
      "exercises": [
        {
          "sentence": "It is a huge cultural ___ in many Western countries to ask a woman her exact age.",
          "answer": "taboo",
          "options": [
            "etiquette",
            "taboo",
            "heritage"
          ]
        },
        {
          "sentence": "Tien needs to learn some basic table ___ before he attends another fancy dinner.",
          "answer": "etiquette",
          "options": [
            "prejudice",
            "etiquette",
            "stereotype"
          ]
        },
        {
          "sentence": "The movie challenges the common ___ that all Asian characters must be math geniuses.",
          "answer": "stereotype",
          "options": [
            "mainstream",
            "diversity",
            "stereotype"
          ]
        },
        {
          "sentence": "His comments on the local politics were very ___ and made everyone at the table uncomfortable.",
          "answer": "controversial",
          "options": [
            "controversial",
            "immigrant",
            "integration"
          ]
        }
      ]
    },
    "reading": {
      "title": "The Fish Sauce Diplomat",
      "passage": "Tien and Huyen decided to travel to Europe, hoping to experience cultural diversity firsthand. They were invited to a formal dinner party hosted by a wealthy immigrant who wanted to celebrate his cultural heritage. Before going, they promised to follow strict dining etiquette, but their attempt at global integration was a complete disaster. Tien refused to eat the mainstream local dishes because they lacked flavor. Instead, he decided to bring his own bottle of premium fish sauce. Opening it in an elegant dining room was a highly controversial decision. The intense smell immediately shocked the other guests, creating an incredibly awkward silence. To make matters worse, Huyen enjoys asking new people how much money they make. She did not realize that discussing personal salaries is a massive taboo in this society. By asking the host about his bank account, she accidentally reinforced a terrible stereotype about ignorant tourists. Tien tried to apologize, but he kept making inappropriate jokes that showed his underlying prejudice against European cheese. They desperately wanted to seem sophisticated, but failing to understand basic cultural rules made them look completely ridiculous. Eventually, the annoyed host asked them to leave. Walking back to their hotel, Tien promised to start learning about global manners, while Huyen simply regretted leaving her expensive fish sauce on the host's table. Next time, they plan to avoid causing international incidents.",
      "translation": "Tiến và Huyền quyết định đi du lịch châu Âu, với hy vọng được tự mình trải nghiệm sự đa dạng văn hóa. Họ được mời đến một bữa tiệc tối trang trọng do một người nhập cư giàu có tổ chức, người muốn tôn vinh di sản văn hóa của mình. Trước khi đi, họ hứa sẽ tuân thủ các nghi thức ăn uống nghiêm ngặt, nhưng nỗ lực hội nhập toàn cầu của họ lại là một thảm họa hoàn toàn. Tiến từ chối ăn các món ăn địa phương đại trà vì chúng thiếu hương vị. Thay vào đó, anh quyết định mang theo chai nước mắm hảo hạng của riêng mình. Việc mở nó trong một phòng ăn thanh lịch là một quyết định vô cùng gây tranh cãi. Mùi hương nồng nặc ngay lập tức gây sốc cho những vị khách khác, tạo ra một sự im lặng vô cùng ngượng ngùng. Tồi tệ hơn, Huyền thích hỏi những người mới quen xem họ kiếm được bao nhiêu tiền. Cô không nhận ra rằng việc thảo luận về mức lương cá nhân là một điều cấm kỵ lớn trong xã hội này. Bằng cách hỏi chủ nhà về tài khoản ngân hàng của ông ấy, cô vô tình củng cố một định kiến tồi tệ về những khách du lịch thiếu hiểu biết. Tiến cố gắng xin lỗi, nhưng anh lại liên tục đưa ra những trò đùa không phù hợp cho thấy thành kiến ngầm của anh đối với pho mát châu Âu. Họ tuyệt vọng muốn tỏ ra tinh tế, nhưng việc không hiểu các quy tắc văn hóa cơ bản khiến họ trông hoàn toàn nực cười. Cuối cùng, vị chủ nhà bực mình đã yêu cầu họ rời đi. Đi bộ trở về khách sạn, Tiến hứa sẽ bắt đầu học về phép lịch sự toàn cầu, trong khi Huyền chỉ tiếc nuối vì đã để quên chai nước mắm đắt tiền trên bàn của chủ nhà. Lần tới, họ dự định sẽ tránh gây ra các sự cố quốc tế.",
      "trueFalse": [
        {
          "statement": "Tien brought his own fish sauce because he is allergic to European cheese.",
          "isTrue": false,
          "explanation": "Sai. Tiến mang nước mắm theo vì anh ấy thấy các món ăn địa phương nhạt nhẽo (lacked flavor), chứ không phải vì anh bị dị ứng."
        },
        {
          "statement": "Huyen offended the host by asking a question about his personal finances.",
          "isTrue": true,
          "explanation": "Đúng. Huyền hỏi chủ nhà về tài khoản ngân hàng của ông ấy, điều này được coi là một điều cấm kỵ (massive taboo)."
        }
      ],
      "multipleChoice": [
        {
          "question": "What happened right after Tien opened his bottle of fish sauce?",
          "options": [
            "A. The host asked him for the recipe.",
            "B. It created an awkward silence among the shocked guests.",
            "C. Everyone applauded his cultural heritage.",
            "D. Huyen drank it."
          ],
          "answer": "B",
          "explanation": "Mùi hương nồng nặc đã gây sốc cho các vị khách khác và tạo ra một sự im lặng ngượng ngùng (creating an incredibly awkward silence)."
        },
        {
          "question": "What did Huyen regret at the end of the story?",
          "options": [
            "A. Reinforcing a negative tourist stereotype.",
            "B. Asking the host about his salary.",
            "C. Leaving her expensive fish sauce at the party.",
            "D. Not eating the mainstream dishes."
          ],
          "answer": "C",
          "explanation": "Trên đường về khách sạn, Huyền chỉ hối hận vì đã bỏ quên chai nước mắm đắt tiền trên bàn (regretted leaving her expensive fish sauce on the host's table)."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Danh Động Từ (Gerunds) và Động Từ Nguyên Mẫu (Infinitives)",
        "explanation": "Học ngữ pháp cũng giống như đi ăn tiệc sang trọng, dùng sai nĩa là quê độ, mà dùng sai V-ing hay To V cũng quê không kém!\n\n1. Gerunds (V-ing): Dùng sau các động từ thể hiện sở thích, sự e ngại, sự tiếp tục (enjoy, mind, keep, avoid, regret...) hoặc làm Chủ ngữ của câu. (VD: Eating fish sauce is fun -> Ăn nước mắm thì vui. / Huyen enjoys asking about money -> Huyền thích hỏi về tiền bạc).\n\n2. Infinitives (To V): Dùng sau các động từ thể hiện dự định, mong muốn, lời hứa (decide, want, hope, promise, refuse, attempt...). (VD: Tien decided to bring fish sauce -> Tiến quyết định mang nước mắm theo).",
        "examples": [
          {
            "en": "Tien refused to eat the weird cheese.",
            "vi": "Tiến từ chối ăn thứ pho mát kỳ lạ đó. (refuse + to V)"
          },
          {
            "en": "Discussing personal salaries is rude.",
            "vi": "Thảo luận về lương cá nhân là bất lịch sự. (V-ing làm chủ ngữ)"
          }
        ]
      },
      "exercises": [
        {
          "question": "Huyen completely regretted ___ the host about his bank account.",
          "options": [
            "to ask",
            "asking",
            "ask",
            "asked"
          ],
          "answer": "asking"
        },
        {
          "question": "They promised ___ basic etiquette before their next trip.",
          "options": [
            "to learn",
            "learning",
            "learn",
            "learned"
          ],
          "answer": "to learn"
        },
        {
          "question": "___ fish sauce in a fancy European restaurant was a terrible idea.",
          "options": [
            "To open",
            "Opening",
            "Open",
            "Opened"
          ],
          "answer": "Opening"
        }
      ]
    },
    "conversation": {
      "context": "Tiến và Huyền đang đứng co ro ngoài đường dưới ánh đèn đường mờ ảo sau khi bị đuổi khỏi bữa tiệc tối sang trọng.",
      "dialogue": [
        {
          "speaker": "Tien",
          "en": "I cannot believe you decided to ask him about his salary! That is a massive cultural taboo here!",
          "vi": "Anh không thể tin được em lại quyết định hỏi ông ấy về mức lương! Đó là một điều cấm kỵ văn hóa cực lớn ở đây đấy!"
        },
        {
          "speaker": "Huyen",
          "en": "I just wanted to know! In our heritage, it is completely normal to ask. Why do they keep getting so sensitive?",
          "vi": "Em chỉ muốn biết thôi mà! Trong văn hóa truyền thống của chúng ta, hỏi vậy là hoàn toàn bình thường. Sao họ cứ phải nhạy cảm quá vậy?"
        },
        {
          "speaker": "Tien",
          "en": "Because we are not at home! We promised to follow their etiquette, but you completely ruined our integration!",
          "vi": "Bởi vì chúng ta không ở nhà! Chúng ta đã hứa là sẽ làm theo phép lịch sự của họ, nhưng em đã phá hỏng hoàn toàn sự hội nhập của chúng ta rồi!"
        },
        {
          "speaker": "Huyen",
          "en": "Oh please, you are the one who brought fish sauce to a cheese tasting. That was highly controversial.",
          "vi": "Ôi làm ơn đi, anh mới là người mang nước mắm đến buổi nếm thử pho mát. Điều đó mới là gây tranh cãi tột độ đấy."
        },
        {
          "speaker": "Tien",
          "en": "Well, I enjoy eating food with actual flavor! Anyway, we need to learn how to avoid causing a diplomatic crisis next time.",
          "vi": "Chà, anh thích ăn thức ăn có hương vị thực sự! Dù sao thì, chúng ta cần phải học cách để tránh gây ra một cuộc khủng hoảng ngoại giao trong lần tới."
        }
      ],
      "roleplaySentences": [
        {
          "en": "That is a massive cultural taboo here!",
          "vi": "Đó là một điều cấm kỵ văn hóa cực lớn ở đây đấy!",
          "ipa": "/ðæt ɪz ə ˈmæsɪv ˈkʌltʃərəl təˈbuː hɪr/"
        },
        {
          "en": "We promised to follow their etiquette.",
          "vi": "Chúng tôi đã hứa là sẽ làm theo phép lịch sự của họ.",
          "ipa": "/wi ˈprɑːmɪst tʊ ˈfɑːloʊ ðer ˈetɪkət/"
        },
        {
          "en": "You are the one who brought fish sauce to a cheese tasting.",
          "vi": "Bạn mới là người mang nước mắm đến buổi nếm thử pho mát.",
          "ipa": "/ju ɑːr ði wʌn huː brɔːt fɪʃ sɔːs tʊ ə tʃiːz ˈteɪstɪŋ/"
        }
      ]
    }
  },
  "unit_8": {
    "vocabulary": {
      "words": [
        {
          "word": "itinerary",
          "ipa": "/aɪˈtɪnəreri/",
          "type": "noun",
          "meaning": "lịch trình chuyến đi",
          "example": "Tien threw away the carefully planned itinerary because he wanted to be a cool explorer."
        },
        {
          "word": "spontaneous",
          "ipa": "/spɑːnˈteɪniəs/",
          "type": "adj",
          "meaning": "ngẫu hứng, tự phát",
          "example": "Making a spontaneous decision to camp in a dark forest without a tent was a terrible idea."
        },
        {
          "word": "breathtaking",
          "ipa": "/ˈbreθteɪkɪŋ/",
          "type": "adj",
          "meaning": "đẹp đến ngạt thở, ngoạn mục",
          "example": "The mountain view was breathtaking, but Tien was too busy crying to look at it."
        },
        {
          "word": "remote",
          "ipa": "/rɪˈmoʊt/",
          "type": "adj",
          "meaning": "hẻo lánh, xa xôi",
          "example": "They were stuck in a remote area with zero Wi-Fi, which was Tien's worst nightmare."
        },
        {
          "word": "adrenaline",
          "ipa": "/əˈdrenəlɪn/",
          "type": "noun",
          "meaning": "hóc môn kích thích, sự phấn khích tột độ",
          "example": "Tien wanted an adrenaline rush, but he just got a severe panic attack instead."
        },
        {
          "word": "wilderness",
          "ipa": "/ˈwɪldərnəs/",
          "type": "noun",
          "meaning": "vùng hoang dã",
          "example": "Surviving in the wilderness requires skills that Tien absolutely does not have."
        },
        {
          "word": "expedition",
          "ipa": "/ˌekspəˈdɪʃn/",
          "type": "noun",
          "meaning": "cuộc thám hiểm",
          "example": "Their brave jungle expedition ended after exactly twenty minutes."
        },
        {
          "word": "survival",
          "ipa": "/sərˈvaɪvl/",
          "type": "noun",
          "meaning": "sự sinh tồn",
          "example": "Tien's only survival skill is complaining until Huyen fixes the problem."
        },
        {
          "word": "landscape",
          "ipa": "/ˈlændskeɪp/",
          "type": "noun",
          "meaning": "phong cảnh",
          "example": "The rocky landscape was beautiful but incredibly hard to walk on in fake designer sneakers."
        },
        {
          "word": "wanderlust",
          "ipa": "/ˈwɑːndərlʌst/",
          "type": "noun",
          "meaning": "niềm đam mê xê dịch, khát khao đi du lịch",
          "example": "Filled with sudden wanderlust, Tien dragged Huyen into the worst vacation of her life."
        }
      ],
      "exercises": [
        {
          "sentence": "If you want an ___ rush, you should try skydiving, not arguing with Huyen.",
          "answer": "adrenaline",
          "options": [
            "itinerary",
            "adrenaline",
            "survival"
          ]
        },
        {
          "sentence": "Tien packed three bags of snacks but forgot the tent for their wilderness ___.",
          "answer": "expedition",
          "options": [
            "landscape",
            "expedition",
            "wanderlust"
          ]
        },
        {
          "sentence": "The view from the top of the cliff was truly ___, making the painful hike almost worth it.",
          "answer": "breathtaking",
          "options": [
            "remote",
            "spontaneous",
            "breathtaking"
          ]
        },
        {
          "sentence": "They ignored the official ___ and got completely lost within the first hour of their trip.",
          "answer": "itinerary",
          "options": [
            "survival",
            "itinerary",
            "wilderness"
          ]
        }
      ]
    },
    "reading": {
      "title": "The Fake Survival Expert",
      "passage": "Driven by a sudden burst of wanderlust, Tien decided to cancel their relaxing beach itinerary and planned a spontaneous expedition into the remote wilderness. He confidently claimed he was a survival expert who did not need modern technology or a map. However, if he had actually packed a compass yesterday, he would not be crying under a pine tree right now. The landscape was undoubtedly breathtaking, but Tien was too busy panicking over a tiny squirrel to appreciate it. He wanted a massive adrenaline rush, but all he got was severe anxiety and a mosquito bite. If Tien had listened to Huyen's warning before they left the city, they would be eating fresh seafood in a nice restaurant today instead of chewing on dry instant noodles in the dark forest. Fortunately for him, Huyen never believed in his ridiculous survival skills. She secretly brought a heavy-duty power bank and calmly opened Google Maps on her phone. Within ten minutes, she successfully navigated them out of the scary woods. Tien tried to act tough again once they saw the highway, but the damage to his fragile ego was already done. Huyen made a solemn promise to herself: next time Tien talks about exploring nature, she will just lock him inside a shopping mall.",
      "translation": "Bị thúc đẩy bởi niềm đam mê xê dịch bùng phát bất ngờ, Tiến quyết định hủy bỏ lịch trình đi biển thư giãn của họ và lên kế hoạch cho một cuộc thám hiểm ngẫu hứng vào vùng hoang dã hẻo lánh. Anh tự tin khẳng định mình là một chuyên gia sinh tồn không cần đến công nghệ hiện đại hay bản đồ. Tuy nhiên, nếu hôm qua anh thực sự gói gém một chiếc la bàn, thì bây giờ anh đã không phải khóc lóc dưới gốc cây thông. Phong cảnh chắc chắn là đẹp đến ngạt thở, nhưng Tiến quá bận hoảng sợ trước một con sóc nhỏ để có thể thưởng thức nó. Anh ta muốn có một luồng adrenaline phấn khích, nhưng tất cả những gì anh ta nhận được là sự lo âu tột độ và một vết muỗi đốt. Nếu Tiến chịu nghe lời cảnh báo của Huyền trước khi họ rời thành phố, thì hôm nay họ đã được ăn hải sản tươi sống trong một nhà hàng sang trọng thay vì nhai mì tôm sống trong khu rừng tối tăm. May mắn cho anh ta, Huyền chưa bao giờ tin vào những kỹ năng sinh tồn lố bịch của anh. Cô đã bí mật mang theo một cục sạc dự phòng dung lượng cao và bình tĩnh mở Google Maps trên điện thoại. Trong vòng mười phút, cô đã dẫn đường thành công đưa họ ra khỏi khu rừng đáng sợ. Tiến cố gắng tỏ ra cứng cỏi trở lại khi họ nhìn thấy đường cao tốc, nhưng lòng tự trọng mong manh của anh đã bị tổn thương mất rồi. Huyền tự hứa một lời thề trang trọng: lần tới khi Tiến nói về việc khám phá thiên nhiên, cô sẽ nhốt luôn anh ta vào trung tâm thương mại.",
      "trueFalse": [
        {
          "statement": "Tien originally planned a relaxing trip to the beach but changed his mind.",
          "isTrue": true,
          "explanation": "Đúng. Trong đoạn văn nói rõ Tiến đã hủy bỏ lịch trình đi biển thư giãn (cancel their relaxing beach itinerary) để đi thám hiểm rừng."
        },
        {
          "statement": "Huyen panicked and cried when they got lost in the forest.",
          "isTrue": false,
          "explanation": "Sai bét. Tiến mới là người khóc lóc hoảng sợ, còn Huyền thì bình tĩnh mở Google Maps (calmly opened Google Maps) để cứu cả hai."
        }
      ],
      "multipleChoice": [
        {
          "question": "Why didn't Tien appreciate the breathtaking landscape?",
          "options": [
            "A. It was too dark to see anything.",
            "B. He was too busy panicking over a tiny squirrel.",
            "C. He was checking his phone for a signal.",
            "D. He forgot his glasses at home."
          ],
          "answer": "B",
          "explanation": "Tiến quá bận hoảng sợ vì một con sóc nhỏ (too busy panicking over a tiny squirrel) nên không màng đến phong cảnh."
        },
        {
          "question": "How did Huyen save them from the remote wilderness?",
          "options": [
            "A. She built a fire and caught a wild animal for dinner.",
            "B. She used her expert survival skills and a compass.",
            "C. She secretly brought a power bank and used Google Maps.",
            "D. She screamed until a rescue helicopter found them."
          ],
          "answer": "C",
          "explanation": "Huyền đã bí mật mang theo sạc dự phòng và dùng Google Maps (secretly brought a heavy-duty power bank and calmly opened Google Maps) để tìm đường ra."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Câu Điều Kiện Hỗn Hợp (Mixed Conditionals - Type 3 & 2)",
        "explanation": "Làm thế nào để 'cà khịa' một quyết định ngu ngốc trong quá khứ dẫn đến hậu quả thê thảm ở hiện tại? Hãy dùng Câu Điều Kiện Hỗn Hợp!\nCấu trúc: If + S + had + V3/ed (Quá khứ hoàn thành), S + would/could + V-nguyên mẫu (Hiện tại).\n- Mệnh đề IF: Giả định một điều trái ngược với sự thật trong QUÁ KHỨ (Hôm qua không mang bản đồ).\n- Mệnh đề CHÍNH: Nhấn mạnh kết quả trái ngược với sự thật ở HIỆN TẠI (Bây giờ đang ngồi khóc).",
        "examples": [
          {
            "en": "If Tien had learned how to use a compass, he would not be lost right now.",
            "vi": "Nếu Tiến đã học cách dùng la bàn (trong quá khứ), thì bây giờ anh ấy đã không bị lạc (ở hiện tại)."
          },
          {
            "en": "If you had listened to me, we would be drinking bubble tea right now.",
            "vi": "Nếu anh chịu nghe em (hồi sáng), thì bây giờ chúng ta đang ngồi uống trà sữa rồi."
          }
        ]
      },
      "exercises": [
        {
          "question": "If Tien ___ his smartphone at home, he ___ able to call his mom for help right now.",
          "options": [
            "didn't leave / would be",
            "had not left / would be",
            "had not left / would have been",
            "has not left / will be"
          ],
          "answer": "had not left / would be"
        },
        {
          "question": "We ___ stuck in this remote wilderness today if you ___ that stupid travel blogger's advice yesterday.",
          "options": [
            "would not be / hadn't followed",
            "will not be / didn't follow",
            "wouldn't have been / hadn't followed",
            "are not / don't follow"
          ],
          "answer": "would not be / hadn't followed"
        },
        {
          "question": "If I ___ allergic to mosquitoes, I ___ enjoying this camping trip right now.",
          "options": [
            "was not / would have enjoyed",
            "am not / will enjoy",
            "were not / would be",
            "had not been / would be"
          ],
          "answer": "had not been / would be"
        }
      ]
    },
    "conversation": {
      "context": "Tiến đang rơm rớm nước mắt, hai tay ôm chặt một gốc cây thông giữa rừng sâu. Huyền thì đang ung dung dựa lưng vào tảng đá, lướt điện thoại sáng rực.",
      "dialogue": [
        {
          "speaker": "Tien",
          "en": "This is the end. We are going to live in this remote wilderness forever. I will have to hunt squirrels for survival!",
          "vi": "Đây là dấu chấm hết rồi. Chúng ta sẽ phải sống ở vùng hoang dã hẻo lánh này mãi mãi. Anh sẽ phải đi săn sóc để sinh tồn mất!"
        },
        {
          "speaker": "Huyen",
          "en": "Stop being so dramatic. If you hadn't thrown away our itinerary, we would be drinking cocktails by the pool right now.",
          "vi": "Thôi diễn sâu đi. Nếu anh không vứt lịch trình của chúng ta đi, thì bây giờ chúng ta đang uống cocktail bên hồ bơi rồi."
        },
        {
          "speaker": "Tien",
          "en": "I wanted a spontaneous expedition! I wanted to feel the adrenaline! How was I supposed to know trees all look exactly the same?",
          "vi": "Anh muốn có một chuyến thám hiểm ngẫu hứng! Anh muốn cảm nhận sự phấn khích! Làm sao anh biết được là mấy cái cây trông giống hệt nhau chứ?"
        },
        {
          "speaker": "Huyen",
          "en": "Well, congratulations, survival expert. You are crying over a broken twig. Now get up and follow me, I found a coffee shop on Google Maps just 500 meters away.",
          "vi": "Chà, chúc mừng nhé chuyên gia sinh tồn. Anh đang khóc lóc vì một cành cây gãy kìa. Giờ thì đứng dậy và đi theo em, em vừa tìm thấy một quán cà phê trên Google Maps cách đây có 500 mét thôi."
        },
        {
          "speaker": "Tien",
          "en": "Wait, really? Oh thank god. Let's go. But... please don't post about this on your Instagram. My ego is very fragile right now.",
          "vi": "Khoan, thật á? Ôi tạ ơn trời đất. Đi thôi. Nhưng... làm ơn đừng đăng chuyện này lên Instagram của em nhé. Lòng tự trọng của anh lúc này mỏng manh lắm."
        }
      ],
      "roleplaySentences": [
        {
          "en": "If you hadn't thrown away our itinerary, we would be drinking cocktails by the pool right now.",
          "vi": "Nếu anh không vứt lịch trình của chúng ta đi, thì bây giờ chúng ta đang uống cocktail bên hồ bơi rồi.",
          "ipa": "/ɪf ju ˈhædnt θroʊn əˈweɪ ˈaʊər aɪˈtɪnəreri, wi wʊd bi ˈdrɪŋkɪŋ ˈkɑːkteɪlz baɪ ðə puːl raɪt naʊ/"
        },
        {
          "en": "I wanted a spontaneous expedition! I wanted to feel the adrenaline!",
          "vi": "Tôi muốn có một chuyến thám hiểm ngẫu hứng! Tôi muốn cảm nhận sự phấn khích!",
          "ipa": "/aɪ ˈwɑːntɪd ə spɑːnˈteɪniəs ˌekspəˈdɪʃn! aɪ ˈwɑːntɪd tʊ fiːl ði əˈdrenəlɪn/"
        },
        {
          "en": "You are crying over a broken twig.",
          "vi": "Bạn đang khóc lóc vì một cành cây gãy kìa.",
          "ipa": "/ju ɑːr ˈkraɪɪŋ ˈoʊvər ə ˈbroʊkən twɪɡ/"
        }
      ]
    }
  },
  "unit_9": {
    "vocabulary": {
      "words": [
        {
          "word": "inflation",
          "ipa": "/ɪnˈfleɪʃn/",
          "type": "noun",
          "meaning": "lạm phát",
          "example": "Tien blamed inflation for his empty wallet, but it was actually his terrible spending habits."
        },
        {
          "word": "bankruptcy",
          "ipa": "/ˈbæŋkrʌptsi/",
          "type": "noun",
          "meaning": "sự phá sản",
          "example": "Thanks to his brilliant trading strategy, they are now one step away from total bankruptcy."
        },
        {
          "word": "cryptocurrency",
          "ipa": "/ˈkrɪptoʊkɜːrənsi/",
          "type": "noun",
          "meaning": "tiền điện tử",
          "example": "Investing in a cryptocurrency named after a dog is rarely a solid financial move."
        },
        {
          "word": "investment",
          "ipa": "/ɪnˈvestmənt/",
          "type": "noun",
          "meaning": "khoản đầu tư",
          "example": "Tien called it a long-term investment, but it lost all its value in exactly twelve minutes."
        },
        {
          "word": "budget",
          "ipa": "/ˈbʌdʒɪt/",
          "type": "noun",
          "meaning": "ngân sách",
          "example": "Huyen created a strict monthly budget, which Tien immediately ignored to buy internet coins."
        },
        {
          "word": "loan",
          "ipa": "/loʊn/",
          "type": "noun",
          "meaning": "khoản vay",
          "example": "He will have to beg the bank for a personal loan just to buy instant noodles this month."
        },
        {
          "word": "hustle",
          "ipa": "/ˈhʌsl/",
          "type": "noun",
          "meaning": "sự hối hả kiếm tiền, làm việc cật lực",
          "example": "Tien loves the idea of the hustle culture, but he hates actually waking up early to work."
        },
        {
          "word": "passive income",
          "ipa": "/ˈpæsɪv ˈɪnkʌm/",
          "type": "noun",
          "meaning": "thu nhập thụ động",
          "example": "He dreamed of generating massive passive income while sleeping, but woke up completely broke."
        },
        {
          "word": "portfolio",
          "ipa": "/pɔːrtˈfoʊlioʊ/",
          "type": "noun",
          "meaning": "danh mục đầu tư",
          "example": "Having only trash meme coins in your financial portfolio is a recipe for disaster."
        },
        {
          "word": "stock market",
          "ipa": "/stɑːk ˈmɑːrkɪt/",
          "type": "noun",
          "meaning": "thị trường chứng khoán",
          "example": "Huyen wishes he had just put their money in the boring traditional stock market instead."
        }
      ],
      "exercises": [
        {
          "sentence": "To beat the rising rates of ___, you need to save and invest your money wisely.",
          "answer": "inflation",
          "options": [
            "bankruptcy",
            "inflation",
            "hustle"
          ]
        },
        {
          "sentence": "Selling digital photos of monkeys is not a reliable source of ___.",
          "answer": "passive income",
          "options": [
            "passive income",
            "budget",
            "loan"
          ]
        },
        {
          "sentence": "If your company owes millions of dollars and cannot pay, you must declare ___.",
          "answer": "bankruptcy",
          "options": [
            "investment",
            "cryptocurrency",
            "bankruptcy"
          ]
        },
        {
          "sentence": "Tien wants to diversify his ___, but he literally only has five dollars left.",
          "answer": "portfolio",
          "options": [
            "portfolio",
            "stock market",
            "loan"
          ]
        }
      ]
    },
    "reading": {
      "title": "The DogeCoin Disaster",
      "passage": "Tien was overly obsessed with modern hustle culture. Instead of working a stable job, he wanted to build a massive financial portfolio and retire by the age of thirty. He constantly talked about creating passive income to beat the rising inflation. Last month, Huyen gave him their monthly rent money, expecting him to stick strictly to their household budget. However, Tien saw a random viral video about a new cryptocurrency called DogeCoin. Convinced he was an absolute financial genius, he dumped all their rent money into this highly risky investment instead of putting it into the traditional stock market. He genuinely thought he would become a millionaire overnight. Unfortunately, the coin crashed to zero within two hours. Now, they are facing absolute bankruptcy. Tien sits on the living room floor, staring at the red charts on his phone in despair. He cries, saying, I wish I had listened to you. If only I had kept the money in the bank. Huyen is absolutely furious. She screams, I wish you were not so incredibly gullible! If only we could pay our landlord with your stupid digital dog pictures! To survive the rest of the month, Tien now has to take out a high-interest bank loan and beg his manager for overtime hours. He desperately wishes he could turn back time, but the crypto world has no customer service to issue refunds.",
      "translation": "Tiến quá ám ảnh với văn hóa hối hả kiếm tiền thời hiện đại. Thay vì làm một công việc ổn định, anh muốn xây dựng một danh mục đầu tư tài chính khổng lồ và nghỉ hưu ở tuổi ba mươi. Anh liên tục nói về việc tạo ra thu nhập thụ động để đánh bại tình trạng lạm phát đang gia tăng. Tháng trước, Huyền đưa cho anh tiền thuê nhà hàng tháng của họ, mong anh bám sát vào ngân sách hộ gia đình một cách nghiêm ngặt. Tuy nhiên, Tiến đã xem một video ngẫu nhiên lan truyền trên mạng về một loại tiền điện tử mới gọi là DogeCoin. Tin chắc rằng mình là một thiên tài tài chính tuyệt đỉnh, anh đã đổ toàn bộ tiền thuê nhà của họ vào khoản đầu tư rủi ro cao này thay vì bỏ vào thị trường chứng khoán truyền thống. Anh thực sự nghĩ rằng mình sẽ trở thành triệu phú chỉ sau một đêm. Thật không may, đồng tiền đó đã rớt giá xuống con số không trong vòng hai giờ đồng hồ. Giờ đây, họ đang phải đối mặt với sự phá sản hoàn toàn. Tiến ngồi trên sàn phòng khách, tuyệt vọng nhìn chằm chằm vào những biểu đồ màu đỏ trên điện thoại. Anh khóc và nói, anh ước gì anh đã nghe lời em. Giá như anh đã giữ tiền trong ngân hàng. Huyền đang vô cùng tức giận. Cô hét lên, tôi ước gì anh đừng cả tin đến mức khó tin như vậy! Giá như chúng ta có thể trả tiền cho chủ nhà bằng mấy bức ảnh chó kỹ thuật số ngu ngốc của anh! Để sống sót qua phần còn lại của tháng, Tiến giờ đây phải nhận một khoản vay ngân hàng lãi suất cao và cầu xin quản lý cho làm thêm giờ. Anh khao khát ước gì mình có thể quay ngược thời gian, nhưng thế giới tiền ảo thì không có dịch vụ chăm sóc khách hàng để hoàn tiền.",
      "trueFalse": [
        {
          "statement": "Tien invested the money in the stock market because he wanted a safe investment.",
          "isTrue": false,
          "explanation": "Sai. Tiến đã đầu tư vào tiền điện tử rủi ro cao (cryptocurrency) thay vì thị trường chứng khoán truyền thống (stock market)."
        },
        {
          "statement": "Huyen gave Tien the rent money because she expected him to follow their budget.",
          "isTrue": true,
          "explanation": "Đúng. Đoạn văn nêu rõ: 'Huyen gave him their monthly rent money, expecting him to stick strictly to their household budget'."
        }
      ],
      "multipleChoice": [
        {
          "question": "What is the main reason Tien faces bankruptcy?",
          "options": [
            "A. He quit his job to become a TikToker.",
            "B. Inflation destroyed all his savings.",
            "C. He invested their rent money into a crashed cryptocurrency.",
            "D. Huyen spent all their money on a dog."
          ],
          "answer": "C",
          "explanation": "Lý do chính là Tiến đã đổ hết tiền thuê nhà vào đồng tiền điện tử và nó đã rớt giá xuống 0 (dumped all their rent money into this highly risky investment... the coin crashed to zero)."
        },
        {
          "question": "What does Tien have to do now to survive the month?",
          "options": [
            "A. Ask the landlord to accept DogeCoin.",
            "B. Take out a bank loan and work overtime.",
            "C. Sell his financial portfolio.",
            "D. Ask his parents for passive income."
          ],
          "answer": "B",
          "explanation": "Tiến bây giờ phải vay ngân hàng lãi suất cao và xin làm thêm giờ (take out a high-interest bank loan and beg his manager for overtime hours)."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Cấu trúc Điều Ước (Wish / If Only)",
        "explanation": "Khi bạn lỡ ném hết tiền vào tiền ảo và muốn khóc lóc hối hận, đây là cấu trúc dành cho bạn! 'If only' mang sắc thái mạnh mẽ, kịch tính hơn 'Wish' (kiểu: Giá như...!).\n\n1. Ước ở Hiện tại (Trái với thực tế hiện tại): S + wish + S + V(quá khứ đơn). Dùng to be là 'were' cho mọi ngôi (nhưng 'was' vẫn chấp nhận trong văn nói).\n2. Ước ở Quá khứ (Hối hận muộn màng về chuyện đã qua): S + wish + S + had + P2 (Quá khứ hoàn thành).",
        "examples": [
          {
            "en": "I wish Tien were a financial genius. (Present Unreal)",
            "vi": "Tôi ước gì Tiến là một thiên tài tài chính. (Thực tế hiện tại anh ấy là một thảm họa)."
          },
          {
            "en": "If only I had not bought that trash coin. (Past Regret)",
            "vi": "Giá như tôi đã không mua cái đồng tiền rác rưởi đó. (Hối hận vì việc đã làm trong quá khứ)."
          }
        ]
      },
      "exercises": [
        {
          "question": "Tien is completely broke right now. He wishes he ___ all his money into a meme coin yesterday.",
          "options": [
            "did not put",
            "has not put",
            "had not put",
            "does not put"
          ],
          "answer": "had not put"
        },
        {
          "question": "Huyen is furious about the budget. 'If only you ___ a normal brain!' she yelled.",
          "options": [
            "have",
            "has",
            "had",
            "had had"
          ],
          "answer": "had"
        },
        {
          "question": "I wish the inflation rate ___ so high this year. We can barely afford food.",
          "options": [
            "is not",
            "were not",
            "had not been",
            "will not be"
          ],
          "answer": "were not"
        }
      ]
    },
    "conversation": {
      "context": "Tiến đang quỳ gối trong phòng khách, ôm chặt chiếc điện thoại hiển thị biểu đồ rớt giá thẳng đứng. Huyền đứng khoanh tay, nhịp chân giận dữ, ánh mắt hình viên đạn.",
      "dialogue": [
        {
          "speaker": "Huyen",
          "en": "So, let me get this straight. You took our entire budget for the month and bought a digital dog meme?",
          "vi": "Vậy, để tôi nói cho rõ ràng nhé. Anh đã lấy toàn bộ ngân sách trong tháng của chúng ta và đi mua một cái ảnh meme chó kỹ thuật số?"
        },
        {
          "speaker": "Tien",
          "en": "It is a serious investment! The influencer said it would generate massive passive income. I wish you could understand my grand vision.",
          "vi": "Đó là một khoản đầu tư nghiêm túc! Người có sức ảnh hưởng nói rằng nó sẽ tạo ra thu nhập thụ động khổng lồ. Anh ước gì em có thể hiểu được tầm nhìn vĩ đại của anh."
        },
        {
          "speaker": "Huyen",
          "en": "Your grand vision is leading us straight to bankruptcy! If only you had invested in the boring stock market like a normal adult.",
          "vi": "Tầm nhìn vĩ đại của anh đang dẫn chúng ta đi thẳng tới chỗ phá sản đấy! Giá như anh đã đầu tư vào cái thị trường chứng khoán nhàm chán như một người lớn bình thường."
        },
        {
          "speaker": "Tien",
          "en": "I know, I know! I wish I had not trusted that guy on TikTok. Now I have to get a bank loan just to buy instant noodles.",
          "vi": "Anh biết, anh biết rồi! Anh ước gì anh đã không tin gã đó trên TikTok. Bây giờ anh phải đi vay ngân hàng chỉ để mua mì gói đây này."
        },
        {
          "speaker": "Huyen",
          "en": "Welcome to the real hustle, crypto bro. You better start finding a second job right now, or you are sleeping on the street.",
          "vi": "Chào mừng đến với sự hối hả kiếm tiền thực sự, anh bạn tiền ảo. Tốt hơn là anh nên bắt đầu tìm việc làm thêm thứ hai ngay bây giờ đi, nếu không là anh ra đường ngủ đấy."
        }
      ],
      "roleplaySentences": [
        {
          "en": "I wish you could understand my grand vision.",
          "vi": "Tôi ước gì bạn có thể hiểu được tầm nhìn vĩ đại của tôi.",
          "ipa": "/aɪ wɪʃ ju kʊd ˌʌndərˈstænd maɪ ɡrænd ˈvɪʒn/"
        },
        {
          "en": "If only you had invested in the boring stock market.",
          "vi": "Giá như bạn đã đầu tư vào cái thị trường chứng khoán nhàm chán.",
          "ipa": "/ɪf ˈoʊnli ju hæd ɪnˈvestɪd ɪn ðə ˈbɔːrɪŋ stɑːk ˈmɑːrkɪt/"
        },
        {
          "en": "I wish I had not trusted that guy on TikTok.",
          "vi": "Tôi ước gì tôi đã không tin gã đó trên TikTok.",
          "ipa": "/aɪ wɪʃ aɪ hæd nɑːt ˈtrʌstɪd ðæt ɡaɪ ɑːn tɪktɑːk/"
        }
      ]
    }
  },
  "unit_10": {
    "vocabulary": {
      "words": [
        {
          "word": "colonize",
          "ipa": "/ˈkɑːlənaɪz/",
          "type": "verb",
          "meaning": "xây dựng thuộc địa, đến ở (nơi mới)",
          "example": "Huyen decided to colonize Mars to escape from her annoying cyborg roommate."
        },
        {
          "word": "extraterrestrial",
          "ipa": "/ˌekstrətəˈrestriəl/",
          "type": "adj",
          "meaning": "ngoài hành tinh, ngoài Trái Đất",
          "example": "Tien is terrified of extraterrestrial bugs, but he is more terrified of losing internet connection."
        },
        {
          "word": "dystopia",
          "ipa": "/dɪsˈtoʊpiə/",
          "type": "noun",
          "meaning": "thế giới tồi tệ, phản địa đàng",
          "example": "Living in a polluted dystopia is bad, but living without Wi-Fi is Tien's true nightmare."
        },
        {
          "word": "innovative",
          "ipa": "/ˈɪnəveɪtɪv/",
          "type": "adj",
          "meaning": "mang tính đổi mới, sáng tạo",
          "example": "The innovative spaceship comes with a coffee maker, which is the only reason Tien agreed to go."
        },
        {
          "word": "breakthrough",
          "ipa": "/ˈbreɪkθruː/",
          "type": "noun",
          "meaning": "bước đột phá",
          "example": "Finding a way to make a cyborg wash the dishes was a major scientific breakthrough."
        },
        {
          "word": "cyborg",
          "ipa": "/ˈsaɪbɔːrɡ/",
          "type": "noun",
          "meaning": "người máy, nửa người nửa máy",
          "example": "Even as a highly advanced cyborg, Tien still forgets to charge his own mechanical legs."
        },
        {
          "word": "simulation",
          "ipa": "/ˌsɪmjuˈleɪʃn/",
          "type": "noun",
          "meaning": "sự mô phỏng, thực tế ảo",
          "example": "Tien prefers living in a virtual simulation where he is rich and handsome."
        },
        {
          "word": "apocalypse",
          "ipa": "/əˈpɑːkəlɪps/",
          "type": "noun",
          "meaning": "tận thế",
          "example": "When the internet router broke, Tien acted like a global apocalypse had just started."
        },
        {
          "word": "teleport",
          "ipa": "/ˈtelɪpɔːrt/",
          "type": "verb",
          "meaning": "dịch chuyển tức thời",
          "example": "Huyen threatened to teleport his favorite gaming console straight into a black hole."
        },
        {
          "word": "galaxy",
          "ipa": "/ˈɡæləksi/",
          "type": "noun",
          "meaning": "thiên hà",
          "example": "They are traveling across the entire galaxy just to find a planet without toxic pollution."
        }
      ],
      "exercises": [
        {
          "sentence": "By 2150, humans hope to successfully ___ new planets in the solar system.",
          "answer": "colonize",
          "options": [
            "teleport",
            "colonize",
            "simulation"
          ]
        },
        {
          "sentence": "Replacing a human arm with a mechanical one turned him into a lazy ___.",
          "answer": "cyborg",
          "options": [
            "galaxy",
            "cyborg",
            "breakthrough"
          ]
        },
        {
          "sentence": "The world has become a terrible ___ filled with robots and massive pollution.",
          "answer": "dystopia",
          "options": [
            "dystopia",
            "apocalypse",
            "extraterrestrial"
          ]
        },
        {
          "sentence": "If this machine works, we can safely ___ from Earth to Mars in exactly two seconds.",
          "answer": "teleport",
          "options": [
            "innovative",
            "teleport",
            "colonize"
          ]
        }
      ]
    },
    "reading": {
      "title": "The Lazy Cyborg of Sector 4",
      "passage": "Welcome to the year 2100. Earth has officially become a technological dystopia, ruined by centuries of terrible decisions. By next month, the smartest humans will have abandoned this polluted planet to colonize Mars and build a new society. Huyen is currently packing her bags for this massive expedition across the galaxy. However, Tien, who recently upgraded himself into a highly advanced but incredibly lazy cyborg, refuses to get off the couch. He confidently claims that living in a fake virtual reality simulation is much better than fighting scary extraterrestrial bugs on a dusty red planet. By this time next week, Huyen will be flying through outer space in an innovative spaceship, while Tien will still be sitting in his dark living room, eating digital potato chips. Huyen tries to explain that a recent scientific breakthrough has made Mars highly livable and quite luxurious. Tien completely ignores her, stating that surviving a global apocalypse on Earth is much less painful than experiencing bad Wi-Fi connections on Mars. Absolutely furious, Huyen finally loses her patience and aggressively threatens him. She screams that by tomorrow evening, she will have hacked his mechanical brain. If he does not stand up and pack his metal suitcases immediately, she will teleport him directly into the blazing center of the sun. Tien suddenly realizes that she is not joking at all. He sighs heavily and slowly starts packing his endless supply of chargers, muttering that he will be complaining about the Martian internet speed for the rest of his unnatural life.",
      "translation": "Chào mừng đến năm 2100. Trái Đất chính thức trở thành một thế giới tồi tệ về công nghệ, bị hủy hoại bởi nhiều thế kỷ với những quyết định tồi tệ. Trước tháng sau, những con người thông minh nhất sẽ từ bỏ hành tinh ô nhiễm này để đến thuộc địa hóa sao Hỏa và xây dựng một xã hội mới. Huyền hiện đang đóng gói hành lý cho chuyến thám hiểm khổng lồ băng qua thiên hà này. Tuy nhiên, Tiến, người vừa tự nâng cấp bản thân thành một người máy tiên tiến nhưng vô cùng lười biếng, lại từ chối rời khỏi chiếc ghế sofa. Anh tự tin khẳng định rằng sống trong một mô phỏng thực tế ảo giả tạo tốt hơn nhiều so với việc chiến đấu với những con bọ ngoài hành tinh đáng sợ trên một hành tinh đỏ đầy bụi. Giờ này tuần sau, Huyền sẽ đang bay xuyên không gian ngoài vũ trụ trong một con tàu vũ trụ đầy tính đổi mới, trong khi Tiến sẽ vẫn đang ngồi trong phòng khách tối tăm của mình, nhai khoai tây chiên kỹ thuật số. Huyền cố gắng giải thích rằng một bước đột phá khoa học gần đây đã làm cho sao Hỏa trở nên cực kỳ đáng sống và khá sang trọng. Tiến hoàn toàn phớt lờ cô, tuyên bố rằng việc sống sót qua một thảm họa tận thế toàn cầu trên Trái Đất còn ít đau đớn hơn nhiều so với việc trải nghiệm kết nối Wi-Fi tồi tệ trên sao Hỏa. Vô cùng tức giận, Huyền cuối cùng cũng mất kiên nhẫn và đe dọa anh một cách hung hăng. Cô hét lên rằng trước tối mai, cô sẽ hack xong bộ não cơ khí của anh. Nếu anh không đứng dậy và đóng gói mấy cái vali kim loại của mình ngay lập tức, cô sẽ dịch chuyển tức thời anh thẳng vào trung tâm rực lửa của mặt trời. Tiến chợt nhận ra cô hoàn toàn không nói đùa. Anh thở dài thườn thượt và chậm rãi bắt đầu đóng gói nguồn cung cấp bộ sạc vô tận của mình, lẩm bẩm rằng anh sẽ phàn nàn về tốc độ internet trên sao Hỏa trong suốt quãng đời trái tự nhiên còn lại của mình.",
      "trueFalse": [
        {
          "statement": "Tien originally refused to go to Mars because he loves the fresh air on Earth.",
          "isTrue": false,
          "explanation": "Tiến từ chối đi vì anh ta muốn nằm ườn chơi thực tế ảo (simulation) và sợ sao Hỏa không có Wi-Fi, trong khi Trái Đất lúc này là một nơi ô nhiễm tồi tệ (polluted dystopia)."
        },
        {
          "statement": "Huyen will have completed hacking Tien's brain by tomorrow evening if he does not move.",
          "isTrue": true,
          "explanation": "Đúng. Đoạn văn ghi rõ lời đe dọa của Huyền: 'by tomorrow evening, she will have hacked his mechanical brain' (trước tối mai, cô ấy sẽ hack xong não cơ khí của anh ta)."
        }
      ],
      "multipleChoice": [
        {
          "question": "What will Huyen be doing by this time next week?",
          "options": [
            "A. She will be eating digital potato chips.",
            "B. She will be flying through outer space in a spaceship.",
            "C. She will be surviving a global apocalypse.",
            "D. She will be experiencing bad Wi-Fi on Earth."
          ],
          "answer": "B",
          "explanation": "Đoạn văn nêu rõ: 'By this time next week, Huyen will be flying through outer space in an innovative spaceship' (Giờ này tuần sau Huyền sẽ đang bay trong không gian)."
        },
        {
          "question": "How did Huyen finally convince Tien to pack his bags?",
          "options": [
            "A. She promised him a new mechanical arm.",
            "B. She told him about a scientific breakthrough in potato chips.",
            "C. She threatened to teleport him into the sun.",
            "D. She proved that extraterrestrial bugs are actually friendly."
          ],
          "answer": "C",
          "explanation": "Huyền đã đe dọa sẽ dịch chuyển tức thời (teleport) Tiến thẳng vào mặt trời nếu anh ta không chịu đứng dậy đóng gói đồ đạc."
        }
      ]
    },
    "grammar": {
      "theory": {
        "title": "Thì Tương Lai Hoàn Thành & Tương Lai Tiếp Diễn",
        "explanation": "Hai thì này dùng để 'flex' (khoe khoang) hoặc đe dọa về tương lai rất ngầu:\n\n1. Tương Lai Tiếp Diễn (Future Continuous): S + will be + V-ing. \nDùng để tả một hành động ĐANG XẢY RA tại một thời điểm CHÍNH XÁC trong tương lai. Giống như bạn đang cắm camera quay lén ở tương lai vậy. (Ví dụ: Giờ này ngày mai, tôi sẽ đang ngủ trên phi thuyền - At this time tomorrow, I will be sleeping on the spaceship).\n\n2. Tương Lai Hoàn Thành (Future Perfect): S + will have + P2/V3. \nDùng để nhấn mạnh một hành động SẼ XONG XUÔI trước một mốc thời gian trong tương lai (thường đi với 'by' - trước lúc). Đây là cấu trúc tuyệt vời để ra deadline! (Ví dụ: Trước cuối tháng này, tôi sẽ mua xong một hành tinh mới - By the end of this month, I will have bought a new planet).",
        "examples": [
          {
            "en": "By 2100, we will have colonized Mars.",
            "vi": "Trước năm 2100, chúng ta sẽ đã thuộc địa hóa xong sao Hỏa. (Tương lai hoàn thành - Xong trước mốc thời gian)."
          },
          {
            "en": "At 8 PM tonight, Tien will be complaining about the Wi-Fi.",
            "vi": "Vào lúc 8 giờ tối nay, Tiến sẽ đang phàn nàn về Wi-Fi. (Tương lai tiếp diễn - Đang xảy ra tại giờ cụ thể)."
          }
        ]
      },
      "exercises": [
        {
          "question": "By the time the spaceship launches, Tien ___ all of his digital snacks.",
          "options": [
            "will eat",
            "will be eating",
            "will have eaten",
            "eats"
          ],
          "answer": "will have eaten"
        },
        {
          "question": "Don't call me at 10 AM tomorrow. I ___ against extraterrestrial bugs in the simulation.",
          "options": [
            "will fight",
            "will be fighting",
            "will have fought",
            "fight"
          ],
          "answer": "will be fighting"
        },
        {
          "question": "By next year, scientists ___ a major breakthrough in teleportation technology.",
          "options": [
            "will achieve",
            "will be achieving",
            "will have achieved",
            "are achieving"
          ],
          "answer": "will have achieved"
        }
      ]
    },
    "conversation": {
      "context": "Năm 2100. Tiến (với cánh tay robot rỉ sét) đang nằm ườn trên sofa chơi game thực tế ảo. Huyền (mặc bộ đồ phi hành gia lấp lánh) đang cầm một thiết bị dịch chuyển tức thời, lườm anh cháy máy.",
      "dialogue": [
        {
          "speaker": "Huyen",
          "en": "Get up, you useless cyborg! By this time tomorrow, our spaceship will be leaving this dystopia, with or without you!",
          "vi": "Đứng dậy đi, đồ người máy vô dụng! Giờ này ngày mai, tàu vũ trụ của chúng ta sẽ đang rời khỏi cái thế giới tồi tệ này, dù có hay không có anh!"
        },
        {
          "speaker": "Tien",
          "en": "Relax! I am not going to colonize Mars. I heard the extraterrestrial Wi-Fi there is completely terrible. It's an apocalypse for gamers!",
          "vi": "Bình tĩnh nào! Anh không đi thuộc địa hóa sao Hỏa đâu. Anh nghe nói Wi-Fi ngoài hành tinh ở đó tệ kinh khủng. Đúng là thảm họa tận thế cho game thủ mà!"
        },
        {
          "speaker": "Huyen",
          "en": "It is an innovative planet! They just made a breakthrough in satellite internet. Now pack your metal arms!",
          "vi": "Đó là một hành tinh đầy tính đổi mới! Họ vừa tạo ra bước đột phá về internet vệ tinh đấy. Giờ thì đóng gói mấy cái cánh tay kim loại của anh đi!"
        },
        {
          "speaker": "Tien",
          "en": "No! My simulation is perfect here. By next month, I will have reached level 99 in my game.",
          "vi": "Không! Thế giới mô phỏng của anh ở đây là hoàn hảo. Trước tháng sau, anh sẽ đạt cấp 99 trong game rồi."
        },
        {
          "speaker": "Huyen",
          "en": "Listen to me very carefully. By 5 PM today, I will have set these coordinates to the sun. If you don't move, I will teleport you into a ball of fire.",
          "vi": "Nghe tôi nói cho kỹ đây. Trước 5 giờ chiều nay, tôi sẽ thiết lập xong các tọa độ này nhắm thẳng vào mặt trời. Nếu anh không nhúc nhích, tôi sẽ dịch chuyển anh vào một quả cầu lửa."
        },
        {
          "speaker": "Tien",
          "en": "Okay, okay! Stop yelling. I will be packing my chargers right now. So dramatic!",
          "vi": "Được rồi, được rồi! Ngừng la hét đi. Anh sẽ đi đóng gói sạc ngay bây giờ đây. Gì mà kịch tính thế!"
        }
      ],
      "roleplaySentences": [
        {
          "en": "By this time tomorrow, our spaceship will be leaving this dystopia.",
          "vi": "Giờ này ngày mai, tàu vũ trụ của chúng ta sẽ đang rời khỏi cái thế giới tồi tệ này.",
          "ipa": "/baɪ ðɪs taɪm təˈmɔːroʊ, ˈaʊər ˈspeɪsʃɪp wɪl bi ˈliːvɪŋ ðɪs dɪsˈtoʊpiə/"
        },
        {
          "en": "By next month, I will have reached level 99 in my game.",
          "vi": "Trước tháng sau, tôi sẽ đạt cấp 99 trong game rồi.",
          "ipa": "/baɪ nekst mʌnθ, aɪ wɪl hæv riːtʃt ˈlevl ˈnaɪnti-naɪn ɪn maɪ ɡeɪm/"
        },
        {
          "en": "If you don't move, I will teleport you into a ball of fire.",
          "vi": "Nếu bạn không nhúc nhích, tôi sẽ dịch chuyển bạn vào một quả cầu lửa.",
          "ipa": "/ɪf ju doʊnt muːv, aɪ wɪl ˈtelɪpɔːrt ju ˈɪntə ə bɔːl əv ˈfaɪər/"
        }
      ]
    }
  }
};
