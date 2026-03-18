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

    // Check if either is already in a couple
    const existingCoupleSender = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: senderId }, { user2Id: senderId }] }
    });
    const existingCoupleReceiver = await prisma.couple.findFirst({
      where: { OR: [{ user1Id: receiverId }, { user2Id: receiverId }] }
    });

    if (existingCoupleSender) {
      return { success: false, message: 'Bạn đang trong một mối quan hệ rồi, tính bắt cá hai tay à?' };
    }
    if (existingCoupleReceiver) {
      return { success: false, message: 'Người ta có chậu rồi, đừng đập chậu cướp hoa!' };
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

    return { success: true, message: `Bạn đã ngỏ lời với <@${receiverId}>. Hãy chờ người ấy đồng ý nhé! 💕` };
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

    // Double check if either jumped into another relationship
    const existingCouple = await prisma.couple.findFirst({
      where: { 
        OR: [{ user1Id: senderId }, { user2Id: senderId }, { user1Id: receiverId }, { user2Id: receiverId }]
      }
    });

    if (existingCouple) {
      // Auto decline
      await prisma.coupleProposal.update({ where: { id: proposal.id }, data: { status: 'declined' } });
      return { success: false, message: 'Một trong hai người đã có tình yêu mới. Kèo này huỷ!' };
    }

    // Accept it
    await prisma.$transaction([
      prisma.coupleProposal.update({ where: { id: proposal.id }, data: { status: 'accepted' } }),
      prisma.couple.create({
        data: { user1Id: senderId, user2Id: receiverId }
      })
    ]);

    return { success: true, message: `Tuyệt vời! <@${senderId}> và <@${receiverId}> đã chính thức hẹn hò! 🎉💞` };
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

    // Check interaction cooldown (simple logic: using updatedAt as last interact time if we want to be lazy, 
    // but better to just let them spam a bit or add a specific field. 
    // Let's just increase affection directly for fun or add a daily limit later).
    // Let's just allow unlimited interactions for now to show off the system quickly.
    
    let newAffection = couple.affection + AFFECTION_PER_INTERACT;
    let newStatus = couple.status;
    let marriedAt = couple.marriedAt;
    let message = `Tình cảm đi lên! ❤️ (Điểm: ${newAffection})`;

    if (couple.status === 'dating' && newAffection >= MAX_AFFECTION_FOR_MARRIAGE) {
      newStatus = 'married';
      marriedAt = new Date();
      message = `🎊 CHÚC MỪNG! Tình cảm đã chín muồi. Hai bạn đã CHÍNH THỨC TRỞ THÀNH VỢ CHỒNG! 💍 (Điểm: ${newAffection})`;
    }

    await prisma.couple.update({
      where: { id: couple.id },
      data: {
        affection: newAffection,
        status: newStatus,
        marriedAt
      }
    });

    return { success: true, message };
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
      message: `Tình trạng: ${statusText}\nNửa kia: <@${partnerId}>\nĐiểm tình cảm: ${couple.affection}`
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
