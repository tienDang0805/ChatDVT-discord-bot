import { CHARACTERS } from './data';
import tienDangAvatarUrl from '../assets/tien_dang_avatar.png';
import tienDangSpriteUrl from '../assets/tien_dang_sprite.png';
import quangHuySpriteUrl from '../assets/quang_huy_sprite.png';
import ngocTamSpriteUrl from '../assets/ngoc_tam_sprite.png';
import giaBaoSpriteUrl from '../assets/gia_bao_sprite.png';
import thaiTaiSpriteUrl from '../assets/thai_tai_sprite.png';
import hoaTranSpriteUrl from '../assets/hoa_tran_sprite.png';
import chatdvtBotSpriteUrl from '../assets/chatdvt_bot_sprite.png';

import bugKingBossUrl from '../assets/bug_king_boss.png';
import skeletonArcherUrl from '../assets/skeleton_archer.png';
import zombieEnemyUrl from '../assets/zombie_enemy.png';
import ghostEnemyUrl from '../assets/ghost_enemy.png';
import batEnemyUrl from '../assets/bat.png';
import demonEnemyUrl from '../assets/demon.png';
import mageEnemyUrl from '../assets/mage.png';
import assassinEnemyUrl from '../assets/assassin.png';
import necromancerEnemyUrl from '../assets/necromancer.png';
import mechTitanBossUrl from '../assets/mech_titan.png';
import shadowLordBossUrl from '../assets/shadow_lord.png';
import chaosDragonBossUrl from '../assets/chaos_dragon.png';
import error404BossUrl from '../assets/error_404.png';

import xpPurpleGemUrl from '../assets/xp_purple_gem.png';
import dungeonTileUrl from '../assets/dungeon_tile.jpg';
import fireballOrbitUrl from '../assets/fireball_orbit.png';

import projCodeFlameUrl from '../assets/proj_code_flame.png';
import projRandomShotUrl from '../assets/proj_random_shot.png';
import projBulletHellUrl from '../assets/proj_bullet_hell.png';
import projBoomerangUrl from '../assets/proj_boomerang.png';
import projChaosBladeUrl from '../assets/proj_chaos_blade.png';
import projArcaneMissileUrl from '../assets/proj_arcane_missile.png';
import projFrostNovaUrl from '../assets/proj_frost_nova.png';
import projBugSwarmUrl from '../assets/proj_bug_swarm.png';
import projMeteorShowerUrl from '../assets/proj_meteor_shower.png';
import entityPlagueUrl from '../assets/entity_plague.png';
import auraShieldBashUrl from '../assets/aura_shield_bash.png';
import auraFortressUrl from '../assets/aura_fortress.png';
import groundToxicCloudUrl from '../assets/ground_toxic_cloud.png';
import groundBiohazardUrl from '../assets/ground_biohazard.png';
import vfxVortexUrl from '../assets/vfx_vortex.png';
import vfxBlackHoleUrl from '../assets/vfx_black_hole.png';

import pickupMagnetUrl from '../assets/pickup_magnet.png';
import pickupChestBronzeUrl from '../assets/pickup_chest_bronze.png';
import pickupChestSilverUrl from '../assets/pickup_chest_silver.png';
import pickupChestGoldUrl from '../assets/pickup_chest_gold.png';
import pickupChickenUrl from '../assets/pickup_chicken.png';
import pickupRosaryUrl from '../assets/pickup_rosary.png';
import pickupClockUrl from '../assets/pickup_clock.png';
import pickupBombUrl from '../assets/pickup_bomb.png';
import pickupCloverUrl from '../assets/pickup_clover.png';
import pickupCoinUrl from '../assets/pickup_coin.png';
import pickupSpeedUrl from '../assets/pickup_speed.png';
import pickupShieldUrl from '../assets/pickup_shield.png';

export type AnimState = 'idle' | 'run' | 'attack';

export class AssetManager {
  private static instance: AssetManager | null = null;
  private images: Map<string, CanvasImageSource> = new Map();
  private isLoaded = false;
  private groundPattern: CanvasPattern | null = null;

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  public async loadAll(): Promise<void> {
    if (this.isLoaded) return;

    this.generateProceduralSprites();

    const manifest: Record<string, string> = {
      tien_dang_avatar: tienDangAvatarUrl,
      tien_dang_sprite: tienDangSpriteUrl,
      quang_huy_sprite: quangHuySpriteUrl,
      ngoc_tam_sprite: ngocTamSpriteUrl,
      gia_bao_sprite: giaBaoSpriteUrl,
      thai_tai_sprite: thaiTaiSpriteUrl,
      hoa_tran_sprite: hoaTranSpriteUrl,
      chatdvt_bot_sprite: chatdvtBotSpriteUrl,

      bug_king_boss: bugKingBossUrl,
      skeleton_archer: skeletonArcherUrl,
      zombie_enemy: zombieEnemyUrl,
      ghost_enemy: ghostEnemyUrl,
      bat_enemy: batEnemyUrl,
      demon_enemy: demonEnemyUrl,
      mage_enemy: mageEnemyUrl,
      assassin_enemy: assassinEnemyUrl,
      necromancer_enemy: necromancerEnemyUrl,
      mech_titan_boss: mechTitanBossUrl,
      shadow_lord_boss: shadowLordBossUrl,
      chaos_dragon_boss: chaosDragonBossUrl,
      error_404_boss: error404BossUrl,

      xp_purple_gem: xpPurpleGemUrl,
      dungeon_tile: dungeonTileUrl,
      fireball_orbit: fireballOrbitUrl,

      proj_code_flame: projCodeFlameUrl,
      proj_random_shot: projRandomShotUrl,
      proj_bullet_hell: projBulletHellUrl,
      proj_boomerang: projBoomerangUrl,
      proj_chaos_blade: projChaosBladeUrl,
      proj_arcane_missile: projArcaneMissileUrl,
      proj_frost_nova: projFrostNovaUrl,
      proj_bug_swarm: projBugSwarmUrl,
      proj_meteor_shower: projMeteorShowerUrl,
      entity_plague: entityPlagueUrl,
      aura_shield_bash: auraShieldBashUrl,
      aura_fortress: auraFortressUrl,
      ground_toxic_cloud: groundToxicCloudUrl,
      ground_biohazard: groundBiohazardUrl,
      vfx_vortex: vfxVortexUrl,
      vfx_black_hole: vfxBlackHoleUrl,

      pickup_magnet: pickupMagnetUrl,
      pickup_chest_bronze: pickupChestBronzeUrl,
      pickup_chest_silver: pickupChestSilverUrl,
      pickup_chest_gold: pickupChestGoldUrl,
      pickup_chicken: pickupChickenUrl,
      pickup_rosary: pickupRosaryUrl,
      pickup_clock: pickupClockUrl,
      pickup_bomb: pickupBombUrl,
      pickup_clover: pickupCloverUrl,
      pickup_coin: pickupCoinUrl,
      pickup_speed: pickupSpeedUrl,
      pickup_shield: pickupShieldUrl,
    };

    const loadPromises = Object.entries(manifest).map(async ([key, url]) => {
      try {
        const img = await this.loadImage(key, url);
        if (key === 'dungeon_tile') {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 512, 512);
            this.groundPattern = ctx.createPattern(canvas, 'repeat');
          }
        }
      } catch (err) {
      }
    });

    await Promise.allSettled(loadPromises);

    const charMap: Record<string, string> = {
      tien: 'tien_dang_sprite',
      huy: 'quang_huy_sprite',
      tam: 'ngoc_tam_sprite',
      bao: 'gia_bao_sprite',
      tai: 'thai_tai_sprite',
      hoa: 'hoa_tran_sprite',
      bot: 'chatdvt_bot_sprite',
    };

    for (const [id, key] of Object.entries(charMap)) {
      if (this.images.has(key)) {
        this.registerAllFrames(id, this.images.get(key)!);
      }
    }

    const enemyMap: Record<string, string> = {
      zombie: 'zombie_enemy',
      skeleton: 'skeleton_archer',
      ghost: 'ghost_enemy',
      bat: 'bat_enemy',
      demon: 'demon_enemy',
      mage: 'mage_enemy',
      assassin: 'assassin_enemy',
      necromancer: 'necromancer_enemy',
      bug_king: 'bug_king_boss',
      mech_titan: 'mech_titan_boss',
      shadow_lord: 'shadow_lord_boss',
      chaos_dragon: 'chaos_dragon_boss',
      error_404: 'error_404_boss',
      twin_reaper_a: 'shadow_lord_boss',
      twin_reaper_b: 'assassin_enemy',
      lich_king: 'necromancer_enemy',
      storm_giant: 'demon_enemy',
      void_serpent: 'chaos_dragon_boss',
      demon_lord: 'demon_enemy',
    };

    for (const [id, key] of Object.entries(enemyMap)) {
      if (this.images.has(key)) {
        this.registerAllFrames(id, this.images.get(key)!);
      }
    }

    this.isLoaded = true;
  }

  private registerAllFrames(key: string, source: CanvasImageSource): void {
    this.images.set(key, source);
    for (let i = 0; i < 4; i++) {
      this.images.set(`${key}_run_${i}`, source);
      this.images.set(`${key}_idle_${i}`, source);
    }
  }

  public loadImage(key: string, url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load: ${url}`));
      img.src = url;
    });
  }

  public getSprite(key: string): CanvasImageSource | null {
    return this.images.get(key) || null;
  }

  public getGroundPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
    if (this.groundPattern) return this.groundPattern;
    const tile = this.images.get('dungeon_tile');
    if (tile && !this.groundPattern) {
      this.groundPattern = ctx.createPattern(tile, 'repeat');
    }
    return this.groundPattern;
  }

  public getFrame(key: string, state: AnimState, time: number): CanvasImageSource | null {
    const frameCount = state === 'run' ? 4 : 2;
    const fps = state === 'run' ? 8 : 3;
    const frameIndex = Math.floor(time * fps) % frameCount;
    const frameKey = `${key}_${state}_${frameIndex}`;
    return this.images.get(frameKey) || this.images.get(key) || null;
  }

  private generateProceduralSprites(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (const char of CHARACTERS) {
      for (let i = 0; i < 4; i++) {
        ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = char.color;
        ctx.beginPath();
        ctx.arc(32, 32, 20, 0, Math.PI * 2);
        ctx.fill();
        const img = new Image();
        img.src = canvas.toDataURL();
        this.images.set(`${char.id}_run_${i}`, img);
        this.images.set(`${char.id}_idle_${i}`, img);
      }
    }
  }
}
