import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAX_AFFECTION_FOR_MARRIAGE = 1000;
const AFFECTION_PER_INTERACT = 10;
const INTERACT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export class CoupleService {
  /**
   * Get top couples for leaderboard
   */
  static async getTopCouples(limit = 10) {
    return prisma.couple.findMany({
      orderBy: { affection: 'desc' },
      take: limit,
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
        affection: true,
        status: true,
        marriedAt: true,
        poopCount: true,
        createdAt: true,
      }
    });
  }

  /**
   * Send a proposal
   */
  static async propose(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      return { success: false, message: 'Đừng tự kỷ thế chứ, kiếm ai mà cầu hôn đi!' };
    }

    // Cắm sừng / Trà xanh check:
    let cheatingMessage = '';
    const existingCoupleSender = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: senderId }, { user2Id: senderId }] }
    });
    const existingCoupleReceiver = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: receiverId }, { user2Id: receiverId }] }
    });

    if (existingCoupleSender && existingCoupleReceiver) {
      cheatingMessage = ' 🚨 CẢ HAI ĐỀU ĐANG CÓ NGƯỜI YÊU! Quả là một vụ MÈO MẢ GÀ ĐỒNG chấn động!';
    } else if (existingCoupleSender) {
      cheatingMessage = ' 🚨 BẠN ĐANG ĐI NGOẠI TÌNH! Bắt cá hai tay à?';
    } else if (existingCoupleReceiver) {
      cheatingMessage = ' 🚨 TRÀ XANH XUẤT HIỆN! Bạn đang đập chậu cướp hoa!';
    }

    // Check pending proposals
    const pending = await prisma.coupleProposal.findFirst({
      where: { senderId, receiverId, status: 'pending' }
    });

    if (pending) {
      return { success: false, message: 'Bạn đã gửi lời tỏ tình rồi, hãy kiên nhẫn chờ hồi âm.' };
    }

    await prisma.coupleProposal.create({
      data: { senderId, receiverId }
    });

    return { success: true, message: `Bạn đã ngỏ lời với <@${receiverId}>. Hãy chờ người ấy đồng ý nhé! 💕${cheatingMessage}` };
  }

  /**
   * Accept a proposal
   */
  static async acceptProposal(receiverId: string, senderId: string) {
    const proposal = await prisma.coupleProposal.findFirst({
      where: { senderId, receiverId, status: 'pending' }
    });

    if (!proposal) {
      return { success: false, message: 'Không tìm thấy lời tỏ tình nào từ người này.' };
    }

    // Ngoại tình bóc phốt check!
    const couplesToBreak = await prisma.couple.findMany({
      where: { 
        OR: [{ user1Id: senderId }, { user2Id: senderId }, { user1Id: receiverId }, { user2Id: receiverId }]
      }
    });

    let dramaMessage = `Tuyệt vời! <@${senderId}> và <@${receiverId}> đã chính thức hẹn hò! 🎉💞`;

    if (couplesToBreak.length > 0) {
      let victims = [];
      for (const c of couplesToBreak) {
        if (c.user1Id !== senderId && c.user1Id !== receiverId) victims.push(c.user1Id);
        if (c.user2Id !== senderId && c.user2Id !== receiverId) victims.push(c.user2Id);
        
        // Cưỡng ép ly hôn
        await prisma.couple.delete({ where: { id: c.id } });
      }

      if (victims.length > 0) {
        const victimTags = victims.map(v => `<@${v}>`).join(' và ');
        dramaMessage = `🚨 BÓC PHỐT CẮM SỪNG! 🚨\nCẩu nam nữ <@${senderId}> và <@${receiverId}> đã lén lút "cắm sừng" phũ phàng đá bay ${victimTags} ra chuồng gà!\nMột mối tình TRÀ XANH TIỂU TAM đã chính thức bắt đầu, quả báo sẽ đến sớm thôi! 🐕🐷`;
      }
    }

    // Accept it
    await prisma.$transaction([
      prisma.coupleProposal.updateMany({
        where: { OR: [{ senderId: senderId }, { receiverId: receiverId }, { senderId: receiverId }, { receiverId: senderId }] },
        data: { status: 'declined' } // Huỷ bỏ mọi proposal cũ liên quan
      }),
      prisma.couple.create({
        data: { user1Id: senderId, user2Id: receiverId }
      })
    ]);

    return { success: true, message: dramaMessage };
  }

  /**
   * Decline a proposal
   */
  static async declineProposal(receiverId: string, senderId: string) {
    const proposal = await prisma.coupleProposal.findFirst({
      where: { senderId, receiverId, status: 'pending' }
    });

    if (!proposal) {
      return { success: false, message: 'Không tìm thấy lời tỏ tình nào.' };
    }

    await prisma.coupleProposal.update({ where: { id: proposal.id }, data: { status: 'declined' } });

    return { success: true, message: `Bạn đã từ chối tình cảm của <@${senderId}>. Phũ quá đi!` };
  }

  /**
   * Interact to increase affection
   */
  static async interact(userId: string) {
    const couple = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    if (!couple) {
      return { success: false, message: 'Bạn FA à? Kiếm người yêu đi rồi mới tương tác được nhé.' };
    }

    // Cho phép tương tác tăng điểm
    let newAffection = couple.affection + AFFECTION_PER_INTERACT;
    let message = `Tình cảm đi lên! ❤️ (Điểm: ${newAffection})`;

    await prisma.couple.update({
      where: { id: couple.id },
      data: { affection: newAffection }
    });

    return { success: true, message };
  }

  /**
   * Marry (Lễ cưới)
   */
  static async marry(userId: string) {
    const couple = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    if (!couple) return { success: false, message: 'Bạn chưa có người yêu mà đòi cưới ai??' };
    if (couple.status === 'married') return { success: false, message: 'Hai người đã cưới nhau rồi mà, hay định cưới vợ bé?' };
    if (couple.affection < 1000) return { success: false, message: `Trời ơi, yêu nhau chưa đủ đậm sâu! Cần 1000 điểm tình cảm (bạn đang có ${couple.affection}) mới rước nàng về dinh được.` };

    // Tự động trừ tiền hoặc phí nếu có thể (ở đây cho cưới free nhưng hoành tráng)
    // Cập nhật trạng thái
    await prisma.couple.update({
      where: { id: couple.id },
      data: { status: 'married', marriedAt: new Date() }
    });

    return { success: true, message: `🎊 CHÚC MỪNG! Tình cảm đã chín muồi. Trăm năm hạnh phúc nhé 💍` };
  }

  /**
   * Đẻ Cứt (Make Poop)
   */
  static async makePoop(userId: string) {
    const couple = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    if (!couple) return { success: false, message: 'Chưa có bồ sao rặn cứt chung được?' };
    if (couple.status !== 'married') return { success: false, message: 'Phải cưới nhau đàng hoàng mới được rặn 💩 nhé!' };
    if (couple.affection < 2000) return { success: false, message: `Tình cảm nhạt nhoà rặn không ra nổi 💩. Cần 2000 điểm tình duyên! (Đang có ${couple.affection})` };

    await prisma.couple.update({
      where: { id: couple.id },
      data: { poopCount: couple.poopCount + 1 }
    });

    return { success: true, message: `💦 PỌT! Chúc mừng hai vợ chồng vừa còng lưng rặn ra thêm 1 cục cứt 💩! (Tổng cộng: ${couple.poopCount + 1})` };
  }

  /**
   * Tặng Quà (Gift - Freestyle Version)
   */
  static async gift(userId: string, itemName: string, quantityInput: number) {
    const couple = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    if (!couple) return { success: false, message: 'Đang FA mà mang quà tặng ai?' };

    // Limit quantity to avoid numeric overflow, though realistically anyone can type 1000
    const quantity = Math.max(1, Math.min(quantityInput, 1000));

    // Mỗi món quà mang lại từ 10 - 50 điểm tình cảm ngẫu nhiên
    const randomAffectionPerItem = Math.floor(Math.random() * 41) + 10;
    const bonusAffection = randomAffectionPerItem * quantity;
    const newAffection = couple.affection + bonusAffection;

    await prisma.couple.update({
      where: { id: couple.id },
      data: { affection: newAffection }
    });

    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    return { success: true, message: `🎁 Bạn vừa dâng lên mãnh thú <@${partnerId}> ${quantity}x **${itemName}**. Lòng thành này đã giúp tình yêu thăng hoa +${bonusAffection} ❤️ điểm!` };
  }

  /**
   * Get formatting status
   */
  static async getStatus(userId: string) {
    const couple = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    if (!couple) {
      return { success: false, message: 'Trạng thái: FA vĩnh cửu 🥲' };
    }

    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    const statusText = couple.status === 'married' ? '💍 Đã kết hôn' : '💕 Đang hẹn hò';

    return {
      success: true,
      data: couple,
      message: `Tình trạng: ${statusText}\nNửa kia: <@${partnerId}>\nĐiểm tình cảm: ${couple.affection}\nSố cục 💩: ${couple.poopCount}`
    };
  }

  /**
   * Breakup/Divorce
   */
  static async breakup(userId: string) {
    const couple = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    if (!couple) {
      return { success: false, message: 'Chưa có người yêu mà đòi chia tay ai??' };
    }

    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    const isMarried = couple.status === 'married';

    await prisma.couple.delete({ where: { id: couple.id } });

    if (isMarried) {
      return { success: true, partnerId, message: `💔 Toà án đã giải quyết ly hôn rụp rèn giữa bạn và <@${partnerId}>.` };
    } else {
      return { success: true, partnerId, message: `💔 Bạn phũ phàng đá <@${partnerId}>. Chúc bạn vui vẻ quay lại con đường FA!` };
    }
  }
}
