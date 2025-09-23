import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Target, Flame, Rocket, Sword, Shield, Heart, Star } from 'lucide-react';

const AutoBattleRPG = () => {
  const [gameState, setGameState] = useState({
    character: {
      level: 1,
      xp: 0,
      xpToNext: 100,
      health: 100,
      maxHealth: 100,
      damage: 10,
      attackSpeed: 1000,
      lastAttack: 0,
      x: 400,
      y: 300,
      speed: 5,
      attackRange: 120
    },
    enemies: [],
    bosses: [],
    bossProjectiles: [],
    projectiles: [],
    enemiesKilled: 0,
    currentWave: 1,
    waveProgress: 'preparing',
    waveStartTime: 0,
    waveTransitionTime: 0,
    isLevelingUp: false,
    levelUpOptions: [],
    abilities: {
      weaponMultiplier: 0,
      rockets: 0,
      thunderStrike: 0,
      fireball: 0,
      healthBoost: 0,
      speedBoost: 0,
      auraBoost: 0
    },
    effects: [],
    gameTime: 0,
    keys: {}
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to PixelnoYaiba!",
      content: "An epic auto-battle RPG where you fight waves of enemies! Let's learn how to play this amazing game.",
      highlight: null,
      position: "center"
    },
    {
      title: "Your Character",
      content: "This blue circle with a sword is you! The faint blue circle around you shows your attack range - enemies within this range will be automatically attacked.",
      highlight: "character",
      position: "center"
    },
    {
      title: "Movement Controls",
      content: "Use WASD keys or Arrow Keys to move around the battlefield. Position yourself strategically to avoid enemies and stay within attack range!",
      highlight: "controls",
      position: "bottom-left"
    },
    {
      title: "Health System",
      content: "Your red health bar shows your current health. When enemies touch you, you take damage. If your health reaches 0, it's game over! Keep moving to survive!",
      highlight: "health",
      position: "top-left"
    },
    {
      title: "Experience & Leveling",
      content: "Kill enemies to gain XP (experience points). When the XP bar fills up, you level up! Each level increases your damage (+5), health (+20), and attack speed.",
      highlight: "xp",
      position: "top-left"
    },
    {
      title: "Wave System",
      content: "Enemies come in waves. Clear all enemies in a wave to advance to the next one. Each wave gets progressively harder with more and stronger enemies!",
      highlight: "wave",
      position: "top-center"
    },
    {
      title: "Boss Battles",
      content: "Every 3rd wave brings a powerful Moon-ranked boss! These enemies have special abilities, more health, and require strategic positioning to defeat.",
      highlight: "wave",
      position: "top-center"
    },
    {
      title: "Abilities & Power-ups",
      content: "When you level up, choose from 3 random abilities to enhance your power! Each ability can be upgraded multiple times. Build your perfect warrior!",
      highlight: "abilities",
      position: "top-left"
    },
    {
      title: "Auto Combat System",
      content: "Your character automatically attacks the closest enemies within your attack range. No clicking required - just focus on positioning and survival strategy!",
      highlight: "character",
      position: "center"
    },
    {
      title: "Ready for Battle!",
      content: "You're ready to begin your epic journey! Click the Start button to begin fighting waves of monsters. May your blade stay sharp, warrior!",
      highlight: "start-button",
      position: "bottom-left"
    }
  ];

  const enemyTypes = [
    { name: 'Kappa Demon', health: 25, xp: 10, color: 'bg-green-500', speed: 1.5, damage: 10 },
    { name: 'Oni Warrior', health: 50, xp: 25, color: 'bg-red-500', speed: 1.2, damage: 15 },
    { name: 'Tengu Beast', health: 100, xp: 50, color: 'bg-gray-600', speed: 0.8, damage: 25 },
    { name: 'Ryujin Serpent', health: 200, xp: 100, color: 'bg-purple-600', speed: 0.6, damage: 35 }
  ];

  const bossTypes = [
    {
      name: 'Lower Moon Six: Ketsumaru',
      health: 600,
      xp: 150,
      color: 'bg-red-600',
      speed: 0.7,
      damage: 25,
      size: 20,
      abilities: ['bloodFrenzy'],
      attackCooldown: 3500,
      projectileSpeed: 3.5,
      specialCooldown: 6000
    },
    {
      name: 'Lower Moon Five: Dokuja',
      health: 700,
      xp: 175,
      color: 'bg-green-700',
      speed: 0.9,
      damage: 28,
      size: 22,
      abilities: ['poisonCloud'],
      attackCooldown: 3200,
      projectileSpeed: 4,
      specialCooldown: 5500
    },
    {
      name: 'Lower Moon Four: Hikage',
      health: 750,
      xp: 180,
      color: 'bg-indigo-700',
      speed: 1.1,
      damage: 30,
      size: 22,
      abilities: ['shadowStep'],
      attackCooldown: 3000,
      projectileSpeed: 4.2,
      specialCooldown: 5000
    },
    {
      name: 'Lower Moon Three: Akemaru',
      health: 800,
      xp: 200,
      color: 'bg-red-700',
      speed: 0.8,
      damage: 30,
      size: 24,
      abilities: ['crimsonBlade'],
      attackCooldown: 3000,
      projectileSpeed: 4,
      specialCooldown: 5000
    },
    {
      name: 'Lower Moon Two: Yamikaze', 
      health: 1200,
      xp: 300,
      color: 'bg-gray-800',
      speed: 1.0,
      damage: 35,
      size: 24,
      abilities: ['shadowClone', 'voidStep'],
      attackCooldown: 2500,
      projectileSpeed: 5,
      specialCooldown: 6000
    },
    {
      name: 'Lower Moon One: Tetsugan',
      health: 1600,
      xp: 400, 
      color: 'bg-gray-400',
      speed: 0.6,
      damage: 45,
      size: 28,
      abilities: ['ironSkin', 'meteorFist'],
      attackCooldown: 4000,
      projectileSpeed: 3,
      specialCooldown: 8000
    },
    {
      name: 'Upper Moon Six: Kuroyuki',
      health: 2500,
      xp: 600,
      color: 'bg-blue-800',
      speed: 0.9,
      damage: 55,
      size: 32,
      abilities: ['blizzardShadows', 'frozenTime'],
      attackCooldown: 2000,
      projectileSpeed: 6,
      specialCooldown: 7000
    },
    {
      name: 'Upper Moon Five: Shinigami',
      health: 3000,
      xp: 700,
      color: 'bg-purple-800',
      speed: 1.0,
      damage: 60,
      size: 32,
      abilities: ['deathScythe', 'soulReap'],
      attackCooldown: 1900,
      projectileSpeed: 6.5,
      specialCooldown: 6500
    },
    {
      name: 'Upper Moon Four: Jigokuou',
      health: 3200,
      xp: 750,
      color: 'bg-orange-800',
      speed: 0.8,
      damage: 65,
      size: 34,
      abilities: ['hellfire', 'infernoRage'],
      attackCooldown: 2200,
      projectileSpeed: 6,
      specialCooldown: 6000
    },
    {
      name: 'Upper Moon Three: Raijinmaru',
      health: 3500,
      xp: 800,
      color: 'bg-yellow-600',
      speed: 1.1,
      damage: 65,
      size: 32,
      abilities: ['thunderWrath', 'stormPhase'],
      attackCooldown: 1800,
      projectileSpeed: 7,
      specialCooldown: 5500
    },
    {
      name: 'Upper Moon Two: Mugenki',
      health: 4200,
      xp: 1000,
      color: 'bg-pink-800',
      speed: 1.3,
      damage: 75,
      size: 34,
      abilities: ['infiniteSlash', 'dimensionRift'],
      attackCooldown: 1600,
      projectileSpeed: 8,
      specialCooldown: 5000
    },
    {
      name: 'Upper Moon One: Yaminokage',
      health: 5000,
      xp: 1200,
      color: 'bg-black',
      speed: 1.2,
      damage: 80,
      size: 36,
      abilities: ['eternalNight', 'thousandStrikes'],
      attackCooldown: 1500,
      projectileSpeed: 8,
      specialCooldown: 4000
    }
  ];

  const availableAbilities = [
    { 
      id: 'weaponMultiplier', 
      name: 'Multi Strike', 
      description: 'Attack multiple enemies at once', 
      icon: Sword,
      effect: (state) => state
    },
    { 
      id: 'rockets', 
      name: 'Rocket Launcher', 
      description: 'Guaranteed rocket hits every 3 seconds', 
      icon: Rocket,
      effect: (state) => state
    },
    { 
      id: 'thunderStrike', 
      name: 'Thunder Strike', 
      description: 'Lightning strikes every 4 seconds', 
      icon: Zap,
      effect: (state) => state
    },
    { 
      id: 'fireball', 
      name: 'Fireball', 
      description: 'Projectile that pierces through enemies', 
      icon: Flame,
      effect: (state) => state
    },
    { 
      id: 'healthBoost', 
      name: 'Vitality', 
      description: '+50 max health and heal damage', 
      icon: Heart,
      effect: (state) => ({ 
        ...state, 
        character: { 
          ...state.character, 
          maxHealth: state.character.maxHealth + 50,
          health: Math.min(state.character.health + 75, state.character.maxHealth + 50)
        } 
      })
    },
    { 
      id: 'speedBoost', 
      name: 'Swift Movement', 
      description: '+2 movement speed', 
      icon: Target,
      effect: (state) => ({ 
        ...state, 
        character: { 
          ...state.character, 
          speed: state.character.speed + 2 
        } 
      })
    },
    { 
      id: 'auraBoost', 
      name: 'Aura Expansion', 
      description: '+30 attack range', 
      icon: Shield,
      effect: (state) => ({ 
        ...state, 
        character: { 
          ...state.character, 
          attackRange: state.character.attackRange + 30
        } 
      })
    }
  ];

  const addEffect = useCallback((effect) => {
    setGameState(prev => ({
      ...prev,
      effects: [...prev.effects, { ...effect, id: Date.now() + Math.random(), time: prev.gameTime }]
    }));
  }, []);

  const checkCollision = (char, enemy) => {
    const dx = char.x - enemy.x;
    const dy = char.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 35;
  };

  const executeBossAbilities = useCallback(() => {
    setGameState(prev => {
      let newState = { ...prev };
      
      newState.bosses = newState.bosses.map(boss => {
        const now = newState.gameTime;
        
        // Regular projectile attack
        if (now - boss.lastAttackTime > boss.attackCooldown) {
          const dx = newState.character.x - boss.x;
          const dy = newState.character.y - boss.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0 && distance < 400) {
            const projectile = {
              id: Date.now() + Math.random(),
              x: boss.x,
              y: boss.y,
              vx: (dx / distance) * boss.projectileSpeed,
              vy: (dy / distance) * boss.projectileSpeed,
              damage: boss.damage,
              lifetime: 0,
              type: 'boss'
            };
            
            newState.bossProjectiles.push(projectile);
            boss.lastAttackTime = now;
          }
        }
        
        // Special abilities
        if (now - (boss.lastSpecialAttack || 0) > boss.specialCooldown) {
          boss.lastSpecialAttack = now;
          
          if (boss.abilities.includes('bloodFrenzy')) {
            boss.hasBloodFrenzy = true;
            boss.bloodFrenzyUntil = now + 4000;
            boss.speed *= 1.5;
            boss.attackCooldown *= 0.7;
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'BLOOD FRENZY!',
              color: 'text-red-600'
            });
          }
          
          if (boss.abilities.includes('poisonCloud')) {
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              const distance = 60 + Math.random() * 40;
              const cloudX = boss.x + Math.cos(angle) * distance;
              const cloudY = boss.y + Math.sin(angle) * distance;
              
              setTimeout(() => {
                addEffect({
                  type: 'poison',
                  x: cloudX,
                  y: cloudY,
                  text: '☠️',
                  color: 'text-green-500'
                });
                
                const dx = newState.character.x - cloudX;
                const dy = newState.character.y - cloudY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 40) {
                  newState.character.health -= boss.damage * 0.5;
                  addEffect({
                    type: 'playerDamage',
                    x: newState.character.x,
                    y: newState.character.y,
                    text: `POISONED -${Math.floor(boss.damage * 0.5)}`,
                    color: 'text-green-600'
                  });
                }
              }, i * 200);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'POISON CLOUD!',
              color: 'text-green-400'
            });
          }
          
          if (boss.abilities.includes('shadowStep')) {
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                boss.x = 200 + Math.random() * 400;
                boss.y = 150 + Math.random() * 300;
                
                const dx = newState.character.x - boss.x;
                const dy = newState.character.y - boss.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                  const projectile = {
                    id: Date.now() + Math.random() + i,
                    x: boss.x,
                    y: boss.y,
                    vx: (dx / distance) * boss.projectileSpeed * 1.2,
                    vy: (dy / distance) * boss.projectileSpeed * 1.2,
                    damage: boss.damage * 0.8,
                    lifetime: 0,
                    type: 'shadow'
                  };
                  
                  newState.bossProjectiles.push(projectile);
                }
              }, i * 800);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'SHADOW STEP!',
              color: 'text-indigo-400'
            });
          }
          
          if (boss.abilities.includes('crimsonBlade')) {
            for (let i = 0; i < 5; i++) {
              const angle = (i - 2) * 0.3;
              const dx = newState.character.x - boss.x;
              const dy = newState.character.y - boss.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0) {
                const baseVx = (dx / distance) * boss.projectileSpeed * 1.5;
                const baseVy = (dy / distance) * boss.projectileSpeed * 1.5;
                
                const rotatedVx = baseVx * Math.cos(angle) - baseVy * Math.sin(angle);
                const rotatedVy = baseVx * Math.sin(angle) + baseVy * Math.cos(angle);
                
                const projectile = {
                  id: Date.now() + Math.random() + i,
                  x: boss.x,
                  y: boss.y,
                  vx: rotatedVx,
                  vy: rotatedVy,
                  damage: boss.damage * 1.2,
                  lifetime: 0,
                  type: 'crimson'
                };
                
                newState.bossProjectiles.push(projectile);
              }
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'CRIMSON BLADE!',
              color: 'text-red-400'
            });
          }
          
          if (boss.abilities.includes('shadowClone')) {
            boss.isInvisible = true;
            boss.invisibleUntil = now + 2000;
            
            boss.x = 200 + Math.random() * 400;
            boss.y = 150 + Math.random() * 300;
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'SHADOW CLONE!',
              color: 'text-purple-400'
            });
          }
          
          if (boss.abilities.includes('ironSkin')) {
            boss.hasIronSkin = true;
            boss.ironSkinUntil = now + 4000;
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'IRON SKIN!',
              color: 'text-gray-300'
            });
          }
          
          if (boss.abilities.includes('meteorFist')) {
            const dx = newState.character.x - boss.x;
            const dy = newState.character.y - boss.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const projectile = {
                id: Date.now() + Math.random(),
                x: boss.x,
                y: boss.y,
                vx: (dx / distance) * boss.projectileSpeed * 0.7,
                vy: (dy / distance) * boss.projectileSpeed * 0.7,
                damage: boss.damage * 2.5,
                lifetime: 0,
                type: 'meteor',
                size: 20
              };
              
              newState.bossProjectiles.push(projectile);
              
              addEffect({
                type: 'bossSpecial',
                x: boss.x,
                y: boss.y - 40,
                text: 'METEOR FIST!',
                color: 'text-orange-400'
              });
            }
          }
          
          if (boss.abilities.includes('blizzardShadows')) {
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              const projectile = {
                id: Date.now() + Math.random() + i,
                x: boss.x + Math.cos(angle) * 60,
                y: boss.y + Math.sin(angle) * 60,
                vx: Math.cos(angle) * boss.projectileSpeed * 0.5,
                vy: Math.sin(angle) * boss.projectileSpeed * 0.5,
                damage: boss.damage * 0.8,
                lifetime: 0,
                type: 'blizzard',
                homing: true
              };
              
              newState.bossProjectiles.push(projectile);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'BLIZZARD SHADOWS!',
              color: 'text-blue-300'
            });
          }
          
          if (boss.abilities.includes('deathScythe')) {
            for (let i = 0; i < 7; i++) {
              const baseAngle = Math.atan2(newState.character.y - boss.y, newState.character.x - boss.x);
              const angle = baseAngle + (i - 3) * 0.2;
              
              const projectile = {
                id: Date.now() + Math.random() + i,
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angle) * boss.projectileSpeed * 1.2,
                vy: Math.sin(angle) * boss.projectileSpeed * 1.2,
                damage: boss.damage * 1.3,
                lifetime: 0,
                type: 'scythe',
                size: 12
              };
              
              newState.bossProjectiles.push(projectile);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'DEATH SCYTHE!',
              color: 'text-purple-400'
            });
          }
          
          if (boss.abilities.includes('hellfire')) {
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2;
              
              setTimeout(() => {
                const projectile = {
                  id: Date.now() + Math.random() + i,
                  x: boss.x + Math.cos(angle) * 80,
                  y: boss.y + Math.sin(angle) * 80,
                  vx: Math.cos(angle) * boss.projectileSpeed * 0.8,
                  vy: Math.sin(angle) * boss.projectileSpeed * 0.8,
                  damage: boss.damage * 0.9,
                  lifetime: 0,
                  type: 'hellfire'
                };
                
                newState.bossProjectiles.push(projectile);
              }, i * 150);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'HELLFIRE RING!',
              color: 'text-orange-400'
            });
          }
          
          if (boss.abilities.includes('thunderWrath')) {
            for (let i = 0; i < 6; i++) {
              setTimeout(() => {
                const randomX = 100 + Math.random() * 600;
                const randomY = 100 + Math.random() * 400;
                
                addEffect({
                  type: 'lightning',
                  x: randomX,
                  y: randomY,
                  text: '⚡',
                  color: 'text-yellow-300'
                });
                
                const dx = newState.character.x - randomX;
                const dy = newState.character.y - randomY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 50) {
                  newState.character.health -= boss.damage * 0.7;
                  addEffect({
                    type: 'playerDamage',
                    x: newState.character.x,
                    y: newState.character.y,
                    text: `-${Math.floor(boss.damage * 0.7)}`,
                    color: 'text-yellow-600'
                  });
                }
              }, i * 300);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'THUNDER WRATH!',
              color: 'text-yellow-400'
            });
          }
          
          if (boss.abilities.includes('infiniteSlash')) {
            for (let wave = 0; wave < 3; wave++) {
              setTimeout(() => {
                for (let i = 0; i < 8; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = boss.projectileSpeed * (0.8 + Math.random() * 0.6);
                  
                  const projectile = {
                    id: Date.now() + Math.random() + wave + i,
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: boss.damage * 0.7,
                    lifetime: 0,
                    type: 'slash'
                  };
                  
                  newState.bossProjectiles.push(projectile);
                }
              }, wave * 400);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'INFINITE SLASH!',
              color: 'text-pink-400'
            });
          }
          
          if (boss.abilities.includes('eternalNight')) {
            boss.hasCursed = true;
            boss.cursedUntil = now + 6000;
            
            if (!newState.character.cursedDamage) {
              newState.character.cursedDamage = Math.floor(newState.character.damage * 0.6);
              newState.character.originalDamage = newState.character.damage;
              newState.character.damage = newState.character.cursedDamage;
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'ETERNAL NIGHT CURSE!',
              color: 'text-purple-600'
            });
            
            addEffect({
              type: 'curse',
              x: newState.character.x,
              y: newState.character.y - 50,
              text: 'CURSED! -40% DAMAGE',
              color: 'text-purple-500'
            });
          }
          
          if (boss.abilities.includes('thousandStrikes')) {
            for (let i = 0; i < 20; i++) {
              setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const speed = boss.projectileSpeed * (0.8 + Math.random() * 0.4);
                
                const projectile = {
                  id: Date.now() + Math.random() + i,
                  x: boss.x,
                  y: boss.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  damage: boss.damage * 0.6,
                  lifetime: 0,
                  type: 'thousand'
                };
                
                newState.bossProjectiles.push(projectile);
              }, i * 100);
            }
            
            addEffect({
              type: 'bossSpecial',
              x: boss.x,
              y: boss.y - 40,
              text: 'THOUSAND STRIKES!',
              color: 'text-black'
            });
          }
        }
        
        // Clear temporary effects
        if (boss.invisibleUntil && now > boss.invisibleUntil) {
          boss.isInvisible = false;
          delete boss.invisibleUntil;
        }
        
        if (boss.ironSkinUntil && now > boss.ironSkinUntil) {
          boss.hasIronSkin = false;
          delete boss.ironSkinUntil;
        }
        
        if (boss.bloodFrenzyUntil && now > boss.bloodFrenzyUntil) {
          boss.hasBloodFrenzy = false;
          boss.speed /= 1.5;
          boss.attackCooldown /= 0.7;
          delete boss.bloodFrenzyUntil;
        }
        
        if (boss.cursedUntil && now > boss.cursedUntil) {
          boss.hasCursed = false;
          delete boss.cursedUntil;
          
          if (newState.character.cursedDamage) {
            newState.character.damage = newState.character.originalDamage;
            delete newState.character.cursedDamage;
            delete newState.character.originalDamage;
            
            addEffect({
              type: 'curseRemoved',
              x: newState.character.x,
              y: newState.character.y - 50,
              text: 'CURSE BROKEN!',
              color: 'text-green-400'
            });
          }
        }
        
        return boss;
      });
      
      return newState;
    });
  }, [addEffect]);

  const spawnWave = useCallback((waveNumber) => {
    const enemyCount = Math.min(3 + waveNumber * 2, 15);
    const scaleFactor = Math.floor(gameState.character.level / 2) + Math.floor(waveNumber / 2);
    
    const isBossWave = waveNumber % 3 === 0;
    
    if (isBossWave) {
      const bossIndex = Math.min((Math.floor(waveNumber / 3) - 1) % bossTypes.length, bossTypes.length - 1);
      const bossType = bossTypes[bossIndex];
      
      const boss = {
        id: Date.now() + Math.random(),
        ...bossType,
        currentHealth: bossType.health + (scaleFactor * 100),
        maxHealth: bossType.health + (scaleFactor * 100),
        x: 400 + (Math.random() - 0.5) * 200,
        y: 200 + (Math.random() - 0.5) * 200,
        xp: bossType.xp + (scaleFactor * 30),
        damage: bossType.damage + (scaleFactor * 5),
        lastDamageTime: 0,
        lastAttackTime: 0,
        lastSpecialAttack: 0,
        abilityPhase: 0,
        isBoss: true
      };
      
      const bosses = [boss];
      
      // Multiple bosses at higher waves - spawn duplicate of same boss
      if (waveNumber >= 15 && Math.random() < 0.3) {
        const secondBoss = {
          ...boss,
          id: Date.now() + Math.random() + 1,
          x: 400 + (Math.random() - 0.5) * 300,
          y: 200 + (Math.random() - 0.5) * 300,
        };
        bosses.push(secondBoss);
      }
      
      setGameState(prev => ({
        ...prev,
        bosses: bosses,
        enemies: [],
        bossProjectiles: [],
        waveProgress: 'active',
        waveStartTime: prev.gameTime
      }));
    } else {
      const newEnemies = [];
      for (let i = 0; i < enemyCount; i++) {
        const enemyTypeIndex = Math.min(
          Math.floor(waveNumber / 2) + Math.floor(Math.random() * 2), 
          enemyTypes.length - 1
        );
        const enemyType = enemyTypes[enemyTypeIndex];
        
        const angle = (i / enemyCount) * Math.PI * 2;
        const distance = 400 + Math.random() * 200;
        const centerX = 400;
        const centerY = 300;
        
        const isElite = waveNumber >= 6 && Math.random() < 0.25;
        
        const newEnemy = {
          id: Date.now() + Math.random() + i,
          ...enemyType,
          name: isElite ? `Elite ${enemyType.name}` : enemyType.name,
          currentHealth: (enemyType.health + (scaleFactor * 25)) * (isElite ? 1.5 : 1),
          maxHealth: (enemyType.health + (scaleFactor * 25)) * (isElite ? 1.5 : 1),
          damage: (enemyType.damage + (scaleFactor * 3)) * (isElite ? 1.3 : 1),
          speed: enemyType.speed * (isElite ? 1.2 : 1),
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          xp: (enemyType.xp + (scaleFactor * 8)) * (isElite ? 1.5 : 1),
          lastDamageTime: 0,
          isElite: isElite,
          color: isElite ? 'bg-orange-600' : enemyType.color
        };
        
        newEnemies.push(newEnemy);
      }

      setGameState(prev => ({
        ...prev,
        enemies: newEnemies,
        bosses: [],
        bossProjectiles: [],
        waveProgress: 'active',
        waveStartTime: prev.gameTime
      }));
    }
  }, [gameState.character.level]);

  const attackEnemies = useCallback(() => {
    setGameState(prev => {
      if (prev.enemies.length === 0 && prev.bosses.length === 0) return prev;
      
      const now = prev.gameTime;
      if (now - prev.character.lastAttack < prev.character.attackSpeed) return prev;

      let newState = { ...prev };
      const damage = newState.character.damage;
      const attackRange = newState.character.attackRange;
      
      const enemiesInRange = newState.enemies
        .map(enemy => ({
          enemy,
          distance: Math.sqrt(
            Math.pow(newState.character.x - enemy.x, 2) + 
            Math.pow(newState.character.y - enemy.y, 2)
          )
        }))
        .filter(item => item.distance <= attackRange)
        .sort((a, b) => a.distance - b.distance);

      const bossesInRange = newState.bosses
        .filter(boss => !boss.isInvisible)
        .map(boss => ({
          boss,
          distance: Math.sqrt(
            Math.pow(newState.character.x - boss.x, 2) + 
            Math.pow(newState.character.y - boss.y, 2)
          )
        }))
        .filter(item => item.distance <= attackRange)
        .sort((a, b) => a.distance - b.distance);

      const allTargetsInRange = [...enemiesInRange.map(e => ({...e, type: 'enemy'})), ...bossesInRange.map(b => ({...b, type: 'boss'}))];

      if (allTargetsInRange.length > 0) {
        const multiStrikeLevel = newState.abilities.weaponMultiplier;
        const targetsToAttack = Math.min(
          1 + multiStrikeLevel,
          allTargetsInRange.length
        );

        for (let i = 0; i < targetsToAttack; i++) {
          const target = allTargetsInRange[i];
          
          if (target.type === 'enemy') {
            const enemy = target.enemy;
            const newHealth = enemy.currentHealth - damage;
            
            addEffect({
              type: 'damage',
              x: enemy.x,
              y: enemy.y,
              text: `-${damage}`,
              color: 'text-red-500'
            });
            
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += enemy.xp;
              
              addEffect({
                type: 'kill',
                x: enemy.x,
                y: enemy.y,
                text: `+${enemy.xp} XP`,
                color: 'text-yellow-400'
              });
              
              newState.enemies = newState.enemies.filter(e => e.id !== enemy.id);
            } else {
              newState.enemies = newState.enemies.map(e => 
                e.id === enemy.id ? { ...e, currentHealth: newHealth } : e
              );
            }
          } else if (target.type === 'boss') {
            const boss = target.boss;
            let actualDamage = damage;
            
            if (boss.hasIronSkin) {
              actualDamage = Math.floor(damage * 0.3);
              addEffect({
                type: 'bossResist',
                x: boss.x,
                y: boss.y - 20,
                text: 'RESISTED!',
                color: 'text-gray-400'
              });
            }
            
            const newHealth = boss.currentHealth - actualDamage;
            
            addEffect({
              type: 'damage',
              x: boss.x,
              y: boss.y,
              text: `-${actualDamage}`,
              color: 'text-red-500'
            });
            
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += boss.xp;
              
              addEffect({
                type: 'kill',
                x: boss.x,
                y: boss.y,
                text: `BOSS DEFEATED! +${boss.xp} XP`,
                color: 'text-gold-400'
              });
              
              newState.bosses = newState.bosses.filter(b => b.id !== boss.id);
            } else {
              newState.bosses = newState.bosses.map(b => 
                b.id === boss.id ? { ...b, currentHealth: newHealth } : b
              );
            }
          }
        }

        newState.character.lastAttack = now;

        if (newState.enemies.length === 0 && newState.bosses.length === 0 && newState.waveProgress === 'active') {
          newState.waveProgress = 'cleared';
          newState.waveTransitionTime = newState.gameTime;
        }
      }

      return newState;
    });
  }, [addEffect]);

  const executeAbilities = useCallback(() => {
    setGameState(prev => {
      let newState = { ...prev };
      
      const allTargets = [
        ...newState.enemies.map(enemy => ({...enemy, type: 'enemy'})),
        ...newState.bosses.filter(boss => !boss.isInvisible).map(boss => ({...boss, type: 'boss'}))
      ];
      
      if (newState.abilities.rockets > 0 && newState.gameTime % 3000 < 50 && allTargets.length > 0) {
        const rocketsLevel = newState.abilities.rockets;
        const rocketDamage = newState.character.damage * (1.5 / (1 + rocketsLevel * 0.15));
        const rocketsToFire = Math.min(rocketsLevel, 3);
        
        const sortedTargets = allTargets
          .map(target => ({
            target,
            distance: Math.sqrt(
              Math.pow(newState.character.x - target.x, 2) + 
              Math.pow(newState.character.y - target.y, 2)
            )
          }))
          .sort((a, b) => a.distance - b.distance);
        
        const targetsToHit = Math.min(rocketsToFire, sortedTargets.length);
        
        for (let i = 0; i < targetsToHit; i++) {
          const target = sortedTargets[i].target;
          
          addEffect({
            type: 'rocket',
            x: target.x,
            y: target.y,
            text: '🚀',
            color: 'text-orange-500'
          });
          
          let actualDamage = rocketDamage;
          if (target.type === 'boss' && target.hasIronSkin) {
            actualDamage = Math.floor(rocketDamage * 0.3);
          }
          
          const newHealth = target.currentHealth - actualDamage;
          
          if (target.type === 'enemy') {
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += target.xp;
              newState.enemies = newState.enemies.filter(e => e.id !== target.id);
            } else {
              newState.enemies = newState.enemies.map(e => 
                e.id === target.id ? { ...e, currentHealth: newHealth } : e
              );
            }
          } else if (target.type === 'boss') {
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += target.xp;
              addEffect({
                type: 'kill',
                x: target.x,
                y: target.y,
                text: `BOSS DEFEATED! +${target.xp} XP`,
                color: 'text-gold-400'
              });
              newState.bosses = newState.bosses.filter(b => b.id !== target.id);
            } else {
              newState.bosses = newState.bosses.map(b => 
                b.id === target.id ? { ...b, currentHealth: newHealth } : b
              );
            }
          }
        }
      }

      if (newState.abilities.fireball > 0 && newState.gameTime % 5000 < 50 && allTargets.length > 0) {
        const fireballLevel = newState.abilities.fireball;
        const nearestTarget = allTargets.reduce((closest, target) => {
          const closestDist = Math.sqrt(
            Math.pow(newState.character.x - closest.x, 2) + 
            Math.pow(newState.character.y - closest.y, 2)
          );
          const targetDist = Math.sqrt(
            Math.pow(newState.character.x - target.x, 2) + 
            Math.pow(newState.character.y - target.y, 2)
          );
          return targetDist < closestDist ? target : closest;
        });

        const dx = nearestTarget.x - newState.character.x;
        const dy = nearestTarget.y - newState.character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const speed = 8;
          const fireballDamage = newState.character.damage * (2.5 / (1 + fireballLevel * 0.2));
          
          const fireball = {
            id: Date.now() + Math.random(),
            x: newState.character.x,
            y: newState.character.y,
            vx: (dx / distance) * speed,
            vy: (dy / distance) * speed,
            damage: fireballDamage,
            lifetime: 0
          };
          
          newState.projectiles.push(fireball);
        }
      }

      if (newState.abilities.thunderStrike > 0 && newState.gameTime % 4000 < 50 && allTargets.length > 0) {
        const thunderLevel = newState.abilities.thunderStrike;
        const thunderDamage = newState.character.damage * (2 / (1 + thunderLevel * 0.25));
        const strikeCount = Math.min(2 + Math.floor(thunderLevel / 2), Math.min(5, allTargets.length));
        
        const shuffledTargets = [...allTargets].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < strikeCount; i++) {
          const target = shuffledTargets[i];
          
          addEffect({
            type: 'lightning',
            x: target.x,
            y: target.y,
            text: '⚡',
            color: 'text-blue-400'
          });
          
          let actualDamage = thunderDamage;
          if (target.type === 'boss' && target.hasIronSkin) {
            actualDamage = Math.floor(thunderDamage * 0.3);
          }
          
          const newHealth = target.currentHealth - actualDamage;
          
          addEffect({
            type: 'shock',
            x: target.x,
            y: target.y,
            text: `-${Math.floor(actualDamage)}`,
            color: 'text-cyan-400'
          });
          
          if (target.type === 'enemy') {
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += target.xp;
              newState.enemies = newState.enemies.filter(e => e.id !== target.id);
            } else {
              newState.enemies = newState.enemies.map(e => 
                e.id === target.id ? { ...e, currentHealth: newHealth } : e
              );
            }
          } else if (target.type === 'boss') {
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += target.xp;
              addEffect({
                type: 'kill',
                x: target.x,
                y: target.y,
                text: `BOSS DEFEATED! +${target.xp} XP`,
                color: 'text-gold-400'
              });
              newState.bosses = newState.bosses.filter(b => b.id !== target.id);
            } else {
              newState.bosses = newState.bosses.map(b => 
                b.id === target.id ? { ...b, currentHealth: newHealth } : b
              );
            }
          }
        }
      }

      return newState;
    });
  }, [addEffect]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setGameState(prev => ({
        ...prev,
        keys: { ...prev.keys, [e.key.toLowerCase()]: true }
      }));
    };

    const handleKeyUp = (e) => {
      setGameState(prev => ({
        ...prev,
        keys: { ...prev.keys, [e.key.toLowerCase()]: false }
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        let newState = { ...prev };
        newState.gameTime += 50;

        const { keys, character } = newState;
        let newX = character.x;
        let newY = character.y;
        
        if (keys['w'] || keys['arrowup']) newY -= character.speed;
        if (keys['s'] || keys['arrowdown']) newY += character.speed;
        if (keys['a'] || keys['arrowleft']) newX -= character.speed;
        if (keys['d'] || keys['arrowright']) newX += character.speed;
        
        newX = Math.max(16, Math.min(1264, newX)); // Allow full screen width
        newY = Math.max(16, Math.min(984, newY)); // Allow full screen height
        
        newState.character.x = newX;
        newState.character.y = newY;

        newState.enemies = newState.enemies.map(enemy => {
          const dx = newState.character.x - enemy.x;
          const dy = newState.character.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const moveX = (dx / distance) * enemy.speed;
            const moveY = (dy / distance) * enemy.speed;
            
            return {
              ...enemy,
              x: enemy.x + moveX,
              y: enemy.y + moveY
            };
          }
          return enemy;
        });

        newState.bosses = newState.bosses.map(boss => {
          if (boss.isInvisible) return boss;
          
          const dx = newState.character.x - boss.x;
          const dy = newState.character.y - boss.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const idealDistance = 150;
          let moveX = 0, moveY = 0;
          
          if (distance > idealDistance + 50) {
            moveX = (dx / distance) * boss.speed;
            moveY = (dy / distance) * boss.speed;
          } else if (distance < idealDistance - 50) {
            moveX = -(dx / distance) * boss.speed * 0.7;
            moveY = -(dy / distance) * boss.speed * 0.7;
          } else {
            const perpX = -dy / distance;
            const perpY = dx / distance;
            moveX = perpX * boss.speed * 0.5;
            moveY = perpY * boss.speed * 0.5;
          }
          
          const newX = Math.max(boss.size, Math.min(800 - boss.size, boss.x + moveX));
          const newY = Math.max(boss.size, Math.min(600 - boss.size, boss.y + moveY));
          
          return { ...boss, x: newX, y: newY };
        });

        const updatedProjectiles = [];
        newState.projectiles.forEach(projectile => {
          const newProjectile = {
            ...projectile,
            x: projectile.x + projectile.vx,
            y: projectile.y + projectile.vy,
            lifetime: projectile.lifetime + 50
          };

          if (newProjectile.x >= 0 && newProjectile.x <= 800 && 
              newProjectile.y >= 0 && newProjectile.y <= 600 && 
              newProjectile.lifetime < 3000) {
            
            let hitEnemy = false;
            newState.enemies = newState.enemies.map(enemy => {
              const distance = Math.sqrt(
                Math.pow(newProjectile.x - enemy.x, 2) + 
                Math.pow(newProjectile.y - enemy.y, 2)
              );
              
              if (distance < 25 && !hitEnemy) {
                hitEnemy = true;
                const newHealth = enemy.currentHealth - newProjectile.damage;
                
                addEffect({
                  type: 'fireball_hit',
                  x: enemy.x,
                  y: enemy.y,
                  text: '🔥',
                  color: 'text-red-600'
                });
                
                addEffect({
                  type: 'fireball_damage',
                  x: enemy.x,
                  y: enemy.y + 20,
                  text: `-${Math.floor(newProjectile.damage)}`,
                  color: 'text-orange-600'
                });
                
                if (newHealth <= 0) {
                  newState.enemiesKilled++;
                  newState.character.xp += enemy.xp;
                  return null;
                }
                return { ...enemy, currentHealth: newHealth };
              }
              return enemy;
            }).filter(Boolean);
            
            if (!hitEnemy) {
              updatedProjectiles.push(newProjectile);
            }
          }
        });
        
        newState.projectiles = updatedProjectiles;

        const updatedBossProjectiles = [];
        newState.bossProjectiles.forEach(projectile => {
          let newProjectile = {
            ...projectile,
            x: projectile.x + projectile.vx,
            y: projectile.y + projectile.vy,
            lifetime: projectile.lifetime + 50
          };

          if (projectile.homing && newProjectile.lifetime > 500) {
            const dx = newState.character.x - newProjectile.x;
            const dy = newState.character.y - newProjectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const speed = Math.sqrt(newProjectile.vx ** 2 + newProjectile.vy ** 2);
              newProjectile.vx = (dx / distance) * speed;
              newProjectile.vy = (dy / distance) * speed;
            }
          }

          if (newProjectile.x >= -50 && newProjectile.x <= 850 && 
              newProjectile.y >= -50 && newProjectile.y <= 650 && 
              newProjectile.lifetime < 5000) {
            
            const distance = Math.sqrt(
              Math.pow(newProjectile.x - newState.character.x, 2) + 
              Math.pow(newProjectile.y - newState.character.y, 2)
            );
            
            const hitRadius = projectile.size ? projectile.size : 15;
            
            if (distance < hitRadius) {
              newState.character.health -= newProjectile.damage;
              
              addEffect({
                type: 'playerDamage',
                x: newState.character.x,
                y: newState.character.y,
                text: `-${newProjectile.damage}`,
                color: 'text-red-600'
              });
              
              if (newState.character.health <= 0) {
                newState.character.health = 0;
                setGameOver(true);
                setIsPlaying(false);
              }
            } else {
              updatedBossProjectiles.push(newProjectile);
            }
          }
        });
        
        newState.bossProjectiles = updatedBossProjectiles;

        newState.enemies.forEach(enemy => {
          if (checkCollision(newState.character, enemy)) {
            const now = newState.gameTime;
            if (now - enemy.lastDamageTime > 1000) {
              newState.character.health -= enemy.damage;
              enemy.lastDamageTime = now;
              
              addEffect({
                type: 'playerDamage',
                x: newState.character.x,
                y: newState.character.y,
                text: `-${enemy.damage}`,
                color: 'text-red-600'
              });
              
              if (newState.character.health <= 0) {
                newState.character.health = 0;
                setGameOver(true);
                setIsPlaying(false);
              }
            }
          }
        });

        newState.bosses.forEach(boss => {
          if (!boss.isInvisible && checkCollision(newState.character, boss)) {
            const now = newState.gameTime;
            if (now - (boss.lastPlayerDamage || 0) > 1000) {
              newState.character.health -= boss.damage;
              boss.lastPlayerDamage = now;
              
              addEffect({
                type: 'playerDamage',
                x: newState.character.x,
                y: newState.character.y,
                text: `-${boss.damage}`,
                color: 'text-red-600'
              });
              
              if (newState.character.health <= 0) {
                newState.character.health = 0;
                setGameOver(true);
                setIsPlaying(false);
              }
            }
          }
        });

        if (newState.waveProgress === 'cleared' && newState.gameTime - newState.waveTransitionTime > 3000) {
          newState.waveProgress = 'transition';
        }
        
        if (newState.waveProgress === 'transition' && newState.gameTime - newState.waveTransitionTime > 6000) {
          newState.currentWave++;
          newState.waveProgress = 'preparing';
        }
        
        if (newState.waveProgress === 'preparing' && newState.enemies.length === 0 && newState.bosses.length === 0) {
          if (newState.gameTime - newState.waveTransitionTime > 7000) {
            spawnWave(newState.currentWave);
          }
        }
        
        if (newState.enemies.length === 0 && newState.bosses.length === 0 && newState.waveProgress === 'active') {
          newState.waveProgress = 'cleared';
          newState.waveTransitionTime = newState.gameTime;
        }

        newState.effects = newState.effects.filter(effect => 
          newState.gameTime - effect.time < 1500
        );

        if (newState.character.xp >= newState.character.xpToNext) {
          newState.character.xp -= newState.character.xpToNext;
          newState.character.level++;
          newState.character.xpToNext = Math.floor(newState.character.xpToNext * 1.4);
          
          newState.character.maxHealth += 8;
          newState.character.health += 12;
          newState.character.damage += 2;
          newState.character.attackSpeed = Math.max(300, newState.character.attackSpeed - 30);
          
          if (newState.character.health > newState.character.maxHealth) {
            newState.character.health = newState.character.maxHealth;
          }
          
          const shuffled = [...availableAbilities].sort(() => Math.random() - 0.5);
          newState.levelUpOptions = shuffled.slice(0, 3);
          newState.isLevelingUp = true;
        }

        return newState;
      });

      attackEnemies();
      executeAbilities();
      executeBossAbilities();
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, attackEnemies, executeAbilities, executeBossAbilities, spawnWave, addEffect]);

  const chooseAbility = (abilityId) => {
    setGameState(prev => {
      const ability = availableAbilities.find(a => a.id === abilityId);
      let newState = ability.effect(prev);
      
      const currentLevel = newState.abilities[abilityId];
      if (currentLevel < 5) {
        newState.abilities = { ...newState.abilities, [abilityId]: currentLevel + 1 };
      } else {
        newState.character.damage += 1;
        addEffect({
          type: 'maxed',
          x: newState.character.x,
          y: newState.character.y - 40,
          text: 'ABILITY MAXED! +1 DMG',
          color: 'text-purple-400'
        });
      }
      
      newState.isLevelingUp = false;
      newState.levelUpOptions = [];
      return newState;
    });
  };

  const forceNextWave = () => {
    setGameState(prev => ({
      ...prev,
      currentWave: prev.currentWave + 1,
      waveProgress: 'preparing',
      waveTransitionTime: prev.gameTime
    }));
    setTimeout(() => {
      spawnWave(gameState.currentWave + 1);
    }, 100);
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const toggleGame = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    setIsPlaying(!isPlaying);
    if (!isPlaying && gameState.enemies.length === 0) {
      spawnWave(gameState.currentWave);
    }
  };

  const resetGame = () => {
    setGameState({
      character: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        health: 100,
        maxHealth: 100,
        damage: 10,
        attackSpeed: 1000,
        lastAttack: 0,
        x: 400,
        y: 300,
        speed: 5,
        attackRange: 120
      },
      enemies: [],
      bosses: [],
      bossProjectiles: [],
      projectiles: [],
      enemiesKilled: 0,
      currentWave: 1,
      waveProgress: 'preparing',
      waveStartTime: 0,
      waveTransitionTime: 0,
      isLevelingUp: false,
      levelUpOptions: [],
      abilities: {
        weaponMultiplier: 0,
        rockets: 0,
        thunderStrike: 0,
        fireball: 0,
        healthBoost: 0,
        speedBoost: 0,
        auraBoost: 0
      },
      effects: [],
      gameTime: 0,
      keys: {}
    });
    setIsPlaying(false);
    setGameOver(false);
  };

  return (
    <div 
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        fontFamily: "'BloodCrow', monospace, sans-serif",
        letterSpacing: '0.08em',
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-2 h-2 bg-white rounded-full animate-pulse" style={{left: '10%', top: '20%', animationDelay: '0s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{left: '20%', top: '60%', animationDelay: '1s'}}></div>
        <div className="absolute w-2 h-2 bg-white rounded-full animate-pulse" style={{left: '70%', top: '30%', animationDelay: '2s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{left: '80%', top: '70%', animationDelay: '3s'}}></div>
        <div className="absolute w-2 h-2 bg-white rounded-full animate-pulse" style={{left: '50%', top: '80%', animationDelay: '4s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{left: '90%', top: '40%', animationDelay: '5s'}}></div>
      </div>
      
      <div className="relative h-screen border-4 border-gray-700">
        <div 
          className={`absolute w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center z-10 shadow-lg border-4 border-blue-300 transition-all duration-75 ${
            showTutorial && tutorialSteps[tutorialStep]?.highlight === 'character' ? 'ring-4 ring-yellow-400' : ''
          }`}
          style={{ 
            left: `${gameState.character.x - 32}px`, 
            top: `${gameState.character.y - 32}px`,
            transform: gameState.character.health <= 30 ? 'scale(0.9)' : 'scale(1)'
          }}
        >
          <Sword className="w-8 h-8 text-white" />
          <div 
            className="absolute border border-blue-300 border-opacity-30 rounded-full -z-10"
            style={{ 
              width: `${gameState.character.attackRange * 2}px`, 
              height: `${gameState.character.attackRange * 2}px` 
            }}
          ></div>
        </div>

        {gameState.bossProjectiles.map(projectile => {
          const size = projectile.size || 8;
          let emoji = '💀';
          let bgColor = 'bg-red-600';
          
          if (projectile.type === 'crimson') {
            emoji = '🗡️';
            bgColor = 'bg-red-700';
          } else if (projectile.type === 'meteor') {
            emoji = '☄️';
            bgColor = 'bg-orange-600';
          } else if (projectile.type === 'blizzard') {
            emoji = '❄️';
            bgColor = 'bg-blue-400';
          } else if (projectile.type === 'thousand') {
            emoji = '⚫';
            bgColor = 'bg-gray-900';
          } else if (projectile.type === 'shadow') {
            emoji = '👻';
            bgColor = 'bg-indigo-700';
          } else if (projectile.type === 'scythe') {
            emoji = '💀';
            bgColor = 'bg-purple-600';
          } else if (projectile.type === 'hellfire') {
            emoji = '🔥';
            bgColor = 'bg-orange-700';
          } else if (projectile.type === 'slash') {
            emoji = '⚡';
            bgColor = 'bg-pink-600';
          }
          
          return (
            <div
              key={projectile.id}
              className={`absolute ${bgColor} rounded-full animate-pulse z-15 flex items-center justify-center text-xs`}
              style={{ 
                left: `${projectile.x - size}px`, 
                top: `${projectile.y - size}px`,
                width: `${size * 2}px`,
                height: `${size * 2}px`
              }}
            >
              {emoji}
            </div>
          );
        })}

        {gameState.projectiles.map(projectile => (
          <div
            key={projectile.id}
            className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse z-15"
            style={{ left: `${projectile.x - 6}px`, top: `${projectile.y - 6}px` }}
          >
            🔥
          </div>
        ))}

        {gameState.bosses.map(boss => (
          <div key={boss.id}>
            <div
              className={`absolute ${boss.color} rounded-lg flex items-center justify-center transition-all duration-75 shadow-xl border-4 border-red-600 ${
                boss.isInvisible ? 'opacity-30' : ''
              } ${boss.hasIronSkin ? 'ring-2 ring-gray-400' : ''} ${boss.hasBloodFrenzy ? 'ring-2 ring-red-400' : ''}`}
              style={{ 
                left: `${boss.x - boss.size}px`, 
                top: `${boss.y - boss.size}px`,
                width: `${boss.size * 2}px`,
                height: `${boss.size * 2}px`
              }}
            >
              <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
            </div>
            
            <div
              className="absolute text-sm font-bold text-red-400 bg-black bg-opacity-90 px-2 py-1 rounded whitespace-nowrap border border-red-500"
              style={{ 
                left: `${boss.x - boss.size}px`, 
                top: `${boss.y - boss.size - 35}px`,
                transform: 'translateX(-50%)',
                marginLeft: `${boss.size}px`
              }}
            >
              {boss.name}
            </div>
            
            {(boss.isInvisible || boss.hasIronSkin || boss.hasBloodFrenzy) && (
              <div
                className="absolute text-xs font-bold text-purple-300 bg-black bg-opacity-90 px-1 py-0.5 rounded whitespace-nowrap"
                style={{ 
                  left: `${boss.x - boss.size}px`, 
                  top: `${boss.y - boss.size - 50}px`,
                  transform: 'translateX(-50%)',
                  marginLeft: `${boss.size}px`
                }}
              >
                {boss.isInvisible && '👻 SHADOW'}
                {boss.hasIronSkin && '🛡️ IRON SKIN'}
                {boss.hasBloodFrenzy && '🩸 FRENZY'}
              </div>
            )}
            
            <div 
              className="absolute bg-gray-800 rounded border border-red-500"
              style={{ 
                left: `${boss.x - boss.size}px`, 
                top: `${boss.y - boss.size - 15}px`,
                width: `${boss.size * 2}px`,
                height: '8px'
              }}
            >
              <div 
                className="h-full bg-red-500 rounded transition-all duration-200"
                style={{ width: `${(boss.currentHealth / boss.maxHealth) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}

        {gameState.enemies.map(enemy => (
          <div key={enemy.id}>
            <div
              className={`absolute w-12 h-12 ${enemy.color} rounded-lg flex items-center justify-center transition-all duration-75 shadow-lg`}
              style={{ left: `${enemy.x - 24}px`, top: `${enemy.y - 24}px` }}
            >
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
            
            <div
              className="absolute text-xs font-semibold text-white bg-black bg-opacity-75 px-1 rounded whitespace-nowrap"
              style={{ 
                left: `${enemy.x - 24}px`, 
                top: `${enemy.y - 45}px`,
                transform: 'translateX(-50%)',
                marginLeft: '24px'
              }}
            >
              {enemy.name}
            </div>
            
            <div 
              className="absolute w-12 h-1 bg-gray-600 rounded"
              style={{ left: `${enemy.x - 24}px`, top: `${enemy.y - 30}px` }}
            >
              <div 
                className="h-full bg-red-500 rounded transition-all duration-200"
                style={{ width: `${(enemy.currentHealth / enemy.maxHealth) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}

        {gameState.effects.map(effect => (
          <div
            key={effect.id}
            className={`absolute ${effect.color} font-bold text-lg animate-bounce pointer-events-none z-20`}
            style={{ left: `${effect.x}px`, top: `${effect.y}px` }}
          >
            {effect.text}
          </div>
        ))}

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          {gameState.waveProgress === 'cleared' && (
            <div className="text-4xl font-bold text-yellow-400 animate-pulse">
              WAVE {gameState.currentWave} CLEARED!
            </div>
          )}
          {gameState.waveProgress === 'transition' && (
            <div className="space-y-2">
              <div className="text-5xl font-bold text-green-400 animate-pulse">
                WAVE {gameState.currentWave + 1} INCOMING!
              </div>
              {(gameState.currentWave + 1) % 3 === 0 && (
                <div className="text-3xl font-bold text-red-500 animate-pulse">
                  {(() => {
                    const nextWave = gameState.currentWave + 1;
                    const bossIndex = Math.min((Math.floor(nextWave / 3) - 1) % bossTypes.length, bossTypes.length - 1);
                    const nextBoss = bossTypes[bossIndex];
                    return `🌙 ${nextBoss.name} APPROACHES! 🌙`;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="flex justify-between items-start">
          <div className={`bg-black bg-opacity-30 border border-gray-400 rounded px-4 py-3 space-y-2 ${
            showTutorial && (tutorialSteps[tutorialStep]?.highlight === 'xp' || tutorialSteps[tutorialStep]?.highlight === 'health' || tutorialSteps[tutorialStep]?.highlight === 'wave') ? 'ring-2 ring-yellow-400' : ''
          }`}>
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold">Level {gameState.character.level}</div>
              <div className="text-sm">
                XP: {gameState.character.xp}/{gameState.character.xpToNext}
              </div>
              <div className="text-lg font-bold text-yellow-400">
                Wave {gameState.currentWave} 
                {gameState.currentWave % 3 === 0 && gameState.bosses.length > 0 && (
                  <span className="text-red-400 text-sm ml-2">BOSS FIGHT</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <div className="w-32 h-3 bg-gray-600 rounded">
                <div 
                  className={`h-full rounded transition-all duration-200 ${
                    gameState.character.health <= 30 ? 'bg-red-600' : 'bg-red-500'
                  }`}
                  style={{ width: `${(gameState.character.health / gameState.character.maxHealth) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm">{gameState.character.health}/{gameState.character.maxHealth}</span>
            </div>
            <div className="text-sm">
              Damage: {Math.round(gameState.character.damage)} {gameState.character.cursedDamage && <span className="text-purple-400">💀 CURSED</span>} | 
              Attack Speed: {(1000 / gameState.character.attackSpeed).toFixed(1)}/s |
              Move Speed: {gameState.character.speed} |
              Range: {gameState.character.attackRange}
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-lg font-bold bg-black bg-opacity-30 border border-gray-400 rounded px-3 py-1">Enemies Killed: {gameState.enemiesKilled}</div>
            <div className="text-sm bg-black bg-opacity-30 border border-gray-400 rounded px-3 py-1">Active Enemies: {gameState.enemies.length + gameState.bosses.length}</div>
            {gameState.bosses.length > 0 && (
              <div className="text-sm bg-red-800 bg-opacity-50 border border-red-400 rounded px-3 py-1">
                🔥 BOSS ACTIVE
              </div>
            )}
          </div>
        </div>

        {Object.entries(gameState.abilities).some(([key, level]) => level > 0) && (
          <div className={`mt-4 bg-black bg-opacity-30 border border-gray-400 rounded px-3 py-2 inline-block ${
            showTutorial && tutorialSteps[tutorialStep]?.highlight === 'abilities' ? 'ring-2 ring-yellow-400' : ''
          }`}>
            <div className="text-sm font-semibold mb-2">Active Abilities:</div>
            <div className="space-y-1">
              {Object.entries(gameState.abilities).map(([key, level]) => {
                if (level === 0) return null;
                const ability = availableAbilities.find(a => a.id === key);
                const Icon = ability.icon;
                return (
                  <div key={key} className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded whitespace-nowrap">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{ability.name} {level}{level === 5 && <span className="text-yellow-400"> MAX</span>}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 space-y-2">
        <div className={`text-sm bg-black bg-opacity-50 p-2 rounded ${
          showTutorial && tutorialSteps[tutorialStep]?.highlight === 'controls' ? 'ring-2 ring-yellow-400' : ''
        }`}>
          Move: WASD / Arrow Keys
        </div>
        <div className="space-x-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
          <button 
            onClick={toggleGame}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              gameOver
                ? 'bg-blue-600 hover:bg-blue-700'
                : isPlaying 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
            } ${
              showTutorial && tutorialSteps[tutorialStep]?.highlight === 'start-button' ? 'ring-4 ring-yellow-400' : ''
            }`}
          >
            {gameOver ? 'Restart' : isPlaying ? 'Pause' : 'Start'}
          </button>
          
          {isPlaying && gameState.enemies.length === 0 && gameState.bosses.length === 0 && gameState.waveProgress !== 'transition' && (
            <button 
              onClick={forceNextWave}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-sm transition-all"
            >
              Force Next Wave
            </button>
          )}
          
          <button 
            onClick={resetGame}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-all"
          >
            Reset
          </button>

          <button 
            onClick={startTutorial}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-sm transition-all"
          >
            Tutorial
          </button>
        </div>
      </div>

      {showTutorial && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div 
            className={`rounded-lg max-w-md w-full mx-4 shadow-2xl border-2 border-gray-600 ${
              tutorialSteps[tutorialStep].position === 'top-left' ? 'absolute top-20 left-4' : 
              tutorialSteps[tutorialStep].position === 'bottom-left' ? 'absolute bottom-20 left-4' : 
              tutorialSteps[tutorialStep].position === 'top-center' ? 'absolute top-20 left-1/2 transform -translate-x-1/2' :
              'relative'
            }`}
            style={{
              backgroundImage: 'url("/tutorialui.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
            <div className="p-8 relative z-10">
              <div className="text-center mb-6">
                <div className="text-lg font-bold text-blue-400 mb-2">
                  Step {tutorialStep + 1} of {tutorialSteps.length}
                </div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-3">{tutorialSteps[tutorialStep].title}</h2>
                <p className="text-gray-300 text-base leading-relaxed">{tutorialSteps[tutorialStep].content}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={skipTutorial}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-sm transition-all"
                >
                  Skip Tutorial
                </button>
                
                <div className="flex space-x-2">
                  {tutorialStep > 0 && (
                    <button 
                      onClick={() => setTutorialStep(tutorialStep - 1)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm transition-all"
                    >
                      Previous
                    </button>
                  )}
                  
                  <button 
                    onClick={nextTutorialStep}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm transition-all"
                  >
                    {tutorialStep === tutorialSteps.length - 1 ? 'Start Playing!' : 'Next'}
                  </button>
                </div>
              </div>

              <div className="flex justify-center mt-4 space-x-2">
                {tutorialSteps.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === tutorialStep ? 'bg-yellow-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
            <div className="text-xl mb-2">Level Reached: {gameState.character.level}</div>
            <div className="text-xl mb-2">Wave Reached: {gameState.currentWave}</div>
            <div className="text-xl mb-6">Enemies Killed: {gameState.enemiesKilled}</div>
            <button 
              onClick={resetGame}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {gameState.isLevelingUp && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <Star className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-yellow-400">LEVEL UP!</h2>
              <p className="text-gray-300">Choose an ability to enhance your power</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {gameState.levelUpOptions.map(ability => {
                const Icon = ability.icon;
                const currentLevel = gameState.abilities[ability.id];
                return (
                  <button
                    key={ability.id}
                    onClick={() => chooseAbility(ability.id)}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-left"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="w-6 h-6 text-blue-400" />
                      <span className="font-semibold text-lg">{ability.name}</span>
                      {currentLevel > 0 && (
                        <span className={`text-sm px-2 py-1 rounded ${currentLevel >= 5 ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                          Level {currentLevel}{currentLevel >= 5 && ' MAX'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">
                      {ability.description}
                      {currentLevel >= 5 && ' (Will give +1 damage instead)'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoBattleRPG;
