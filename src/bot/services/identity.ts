import { prisma } from '../../database/prisma';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Interaction } from 'discord.js';

class UserIdentityService {
  private identityCache: Map<string, { data: any; timestamp: number }>;
  private CACHE_TTL: number;

  constructor() {
    this.identityCache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.startCacheCleanup();
  }

  private startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [userId, cacheEntry] of this.identityCache.entries()) {
        if (now - cacheEntry.timestamp > this.CACHE_TTL) {
          this.identityCache.delete(userId);
          cleaned++;
        }
      }
    }, 10 * 60 * 1000); // Run every 10 minutes
  }

  public invalidateCache(userId: string) {
    this.identityCache.delete(userId);
  }

  public async getOrCreateIdentity(userId: string, skipCache = false): Promise<any> {
    try {
      if (!skipCache) {
        const cached = this.identityCache.get(userId);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
          return cached.data;
        }
      }

      let identity = await prisma.userIdentity.findUnique({ where: { userId } });
      
      if (!identity) {
        identity = await prisma.userIdentity.create({
          data: {
            userId,
            nickname: '',
            signature: ''
          }
        });
      }

      this.identityCache.set(userId, {
        data: identity,
        timestamp: Date.now()
      });

      return identity;
    } catch (error) {
      console.error('[UserIdentity] Error in getOrCreateIdentity:', error);
      throw error;
    }
  }

  public async updateIdentity(userId: string, updates: any): Promise<any> {
    try {
      const identity = await prisma.userIdentity.upsert({
        where: { userId },
        update: { ...updates },
        create: { userId, ...updates }
      });

      // Invalidate cache
      this.identityCache.delete(userId);
      return identity;
    } catch (error) {
      console.error('[UserIdentity] Error in updateIdentity:', error);
      throw error;
    }
  }

  public async deleteIdentity(userId: string): Promise<boolean> {
    try {
      await prisma.userIdentity.delete({ where: { userId } });
      this.identityCache.delete(userId);
      return true;
    } catch (error) {
      // Record might not exist
      this.identityCache.delete(userId);
      return true;
    }
  }

  public async showIdentityMenu(interaction: any) {
    try {
      const userId = interaction.user.id;
      const identity = await this.getOrCreateIdentity(userId);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎭 Danh Tính Của Bạn')
        .setDescription(`Chào <@${userId}>! AI sẽ nhớ bạn theo thông tin này.`)
        .addFields(
          { 
            name: '🏷️ Biệt danh', 
            value: identity.nickname || '*Chưa đặt*', 
            inline: true 
          },
          { 
            name: '✍️ Signature', 
            value: identity.signature || '*Chưa đặt*', 
            inline: false 
          }
        )
        .setTimestamp();
        
      // Check timestamp if available
       if ((identity as any).updatedAt) {
          embed.setFooter({ text: `Cập nhật: ${(identity as any).updatedAt.toLocaleString('vi-VN')}` });
       }

      const editButton = new ButtonBuilder()
        .setCustomId('edit_identity')
        .setLabel('✏️ Chỉnh sửa')
        .setStyle(ButtonStyle.Primary);

      const resetButton = new ButtonBuilder()
        .setCustomId('reset_identity')
        .setLabel('🔄 Xóa')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(editButton, resetButton);

      return {
        embeds: [embed],
        components: [row],
        ephemeral: true
      };
    } catch (error) {
      console.error('[UserIdentity] Error in showIdentityMenu:', error);
      throw error;
    }
  }

  public async handleReset(interaction: any) {
    try {
      const userId = interaction.user.id;
      await this.deleteIdentity(userId);
      return true;
    } catch (error) {
       console.error('[UserIdentity] Error handleReset:', error);
       throw error;
    }
  }

  public async viewOtherUserIdentity(interaction: any, targetUserId: string) {
      try {
            const identity = await this.getOrCreateIdentity(targetUserId);

            if (!identity.nickname && !identity.signature) {
                return {
                    content: '❌ Người này chưa thiết lập danh tính.',
                    ephemeral: true
                };
            }

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`🎭 Danh Tính của <@${targetUserId}>`)
                .addFields(
                    { 
                        name: '🏷️ Biệt danh', 
                        value: identity.nickname || '*Không có*', 
                        inline: true 
                    },
                    { 
                        name: '✍️ Signature', 
                        value: identity.signature || '*Không có*', 
                        inline: false 
                    }
                )
                .setTimestamp();

            return {
                embeds: [embed],
                ephemeral: true
            };
        } catch (error) {
            console.error('[UserIdentity] Error in viewOtherUserIdentity:', error);
            throw error;
        }
  }

  public async getIdentityForPrompt(userId: string): Promise<{ nickname: string | null; signature: string | null }> {
    try {
      const identity = await this.getOrCreateIdentity(userId);
      return {
        nickname: identity.nickname || null,
        signature: identity.signature || null
      };
    } catch (error) {
      return { nickname: null, signature: null };
    }
  }
}

export const userIdentityService = new UserIdentityService();
