import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Target, Flame, Rocket, Sword, Shield, Heart, Star } from 'lucide-react';
import './App.css';

const AutoBattleRPG = () => {
  const [gameState, setGameState] = useState({
    currency: 0,
    selectedCharacter: 'tanjiro',
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
      attackRange: 120,
      isAttacking: false
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

  const characterData = {
    tanjiro: {
      name: 'Tanjiro Kamado',
      image: 'character_tanjiro.png',
      cost: 0,
      baseStats: {
        health: 100,
        damage: 10,
        speed: 5,
        attackSpeed: 1000,
        attackRange: 120
      },
      specialAbility: 'waterWheel',
      description: 'Water Breathing techniques with balanced stats'
    },
    zenitsu: {
      name: 'Zenitsu Agatsuma',
      image: 'character_zenitsu.png',
      cost: 0,
      baseStats: {
        health: 75,
        damage: 12,
        speed: 7,
        attackSpeed: 800,
        attackRange: 100
      },
      specialAbility: 'thunderclap',
      description: 'Thunder Breathing - High speed, lower health'
    },
    inosuke: {
      name: 'Inosuke Hashibira',
      image: 'character_inosuke.png',
      cost: 0,
      baseStats: {
        health: 120,
        damage: 14,
        speed: 4,
        attackSpeed: 1200,
        attackRange: 90
      },
      specialAbility: 'beastFangs',
      inherentMultiStrike: 2,
      description: 'Beast Breathing - Dual swords attack 2 enemies'
    },
    giyu: {
      name: 'Giyu Tomioka',
      image: 'character_giyu.png',
      cost: 500,
      baseStats: {
        health: 150,
        damage: 15,
        speed: 6,
        attackSpeed: 900,
        attackRange: 140
      },
      specialAbility: 'deadCalm',
      description: 'Water Hashira - Defensive specialist'
    },
    rengoku: {
      name: 'Kyojuro Rengoku',
      image: 'character_rengoku.png',
      cost: 750,
      baseStats: {
        health: 130,
        damage: 18,
        speed: 6,
        attackSpeed: 850,
        attackRange: 110
      },
      specialAbility: 'flameSlash',
      description: 'Flame Hashira - High damage fire attacks'
    },
    tengen: {
      name: 'Tengen Uzui',
      image: 'character_tengen.png',
      cost: 600,
      baseStats: {
        health: 110,
        damage: 16,
        speed: 8,
        attackSpeed: 750,
        attackRange: 100
      },
      specialAbility: 'explosiveBeads',
      description: 'Sound Hashira - Speed and explosions'
    },
    shinobu: {
      name: 'Shinobu Kocho',
      image: 'character_shinobu.png',
      cost: 650,
      baseStats: {
        health: 80,
        damage: 8,
        speed: 9,
        attackSpeed: 600,
        attackRange: 130
      },
      specialAbility: 'poisonStrike',
      description: 'Insect Hashira - Poison damage over time'
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showStarterSelect, setShowStarterSelect] = useState(true);
  const [hasSelectedStarter, setHasSelectedStarter] = useState(false);
  const [tutorialShown, setTutorialShown] = useState(false);
  const [unlockedCharacters, setUnlockedCharacters] = useState([]);

  const tutorialSteps = [
    {
      title: "Welcome to PixelnoYaiba!",
      content: "An epic auto-battle RPG where you fight waves of enemies!\n\nLet's learn how to play this amazing game."
    },
    {
      title: "Combat Basics",
      content: "Your character fights automatically!\n\nWatch as they battle demons and gain experience.\n\nYour goal is to survive as many waves as possible."
    },
    {
      title: "Leveling & Stats",
      content: "Gain EXP to level up and increase your stats!\n\nHigher levels mean more HP, damage, and survival power.\n\nChoose your character wisely for different playstyles."
    },
    {
      title: "Currency System",
      content: "Earn coins by defeating enemies!\n\nUse coins to unlock powerful Hashira characters.\n\nEach character has unique abilities and stats."
    },
    {
      title: "Boss Battles",
      content: "Face challenging Moon-rank bosses!\n\nLower Moons appear every 5 waves.\n\nUpper Moons are the ultimate challenge!"
    },
    {
      title: "Ready to Fight!",
      content: "You're ready to begin your demon-slaying journey!\n\nGood luck, and may you survive many waves!\n\nTime to start your adventure!"
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

  const applyCharacterStats = useCallback((characterId) => {
    const charData = characterData[characterId];
    if (!charData) return;

    setGameState(prev => ({
      ...prev,
      selectedCharacter: characterId,
      character: {
        ...prev.character,
        health: charData.baseStats.health,
        maxHealth: charData.baseStats.health,
        damage: charData.baseStats.damage,
        speed: charData.baseStats.speed,
        attackSpeed: charData.baseStats.attackSpeed,
        attackRange: charData.baseStats.attackRange
      }
    }));
  }, []);

  const unlockCharacter = useCallback((characterId) => {
    const charData = characterData[characterId];
    if (!charData || gameState.currency < charData.cost) return false;

    setGameState(prev => ({
      ...prev,
      currency: prev.currency - charData.cost
    }));
    
    setUnlockedCharacters(prev => [...prev, characterId]);
    return true;
  }, [gameState.currency]);

  const selectStarterCharacter = useCallback((characterId) => {
    applyCharacterStats(characterId);
    setUnlockedCharacters([characterId]);
    setHasSelectedStarter(true);
    setShowStarterSelect(false);
    
    if (!tutorialShown) {
      setShowTutorial(true);
      setTutorialShown(true);
    }
  }, [applyCharacterStats, tutorialShown]);

  const selectCharacter = useCallback((characterId) => {
    if (!unlockedCharacters.includes(characterId)) return;
    
    applyCharacterStats(characterId);
    setShowCharacterSelect(false);
  }, [unlockedCharacters, applyCharacterStats]);

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
        currentHealth: bossType.health + (scaleFactor * 75),
        maxHealth: bossType.health + (scaleFactor * 75),
        x: 400 + (Math.random() - 0.5) * 200,
        y: 200 + (Math.random() - 0.5) * 200,
        xp: bossType.xp + (scaleFactor * 50),
        damage: bossType.damage + (scaleFactor * 3),
        lastDamageTime: 0,
        lastAttackTime: 0,
        lastSpecialAttack: 0,
        abilityPhase: 0,
        isBoss: true
      };
      
      const bosses = [boss];
      
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
          currentHealth: (enemyType.health + (scaleFactor * 15)) * (isElite ? 1.5 : 1),
          maxHealth: (enemyType.health + (scaleFactor * 15)) * (isElite ? 1.5 : 1),
          damage: (enemyType.damage + (scaleFactor * 2)) * (isElite ? 1.3 : 1),
          speed: enemyType.speed * (isElite ? 1.2 : 1),
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          xp: (enemyType.xp + (scaleFactor * 12)) * (isElite ? 1.5 : 1),
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
        const currentChar = characterData[newState.selectedCharacter];
        const inherentStrikes = currentChar.inherentMultiStrike || 1;
        
        const targetsToAttack = Math.min(
          inherentStrikes + multiStrikeLevel,
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
            
            const slashRotation = Math.random() * 360;
            addEffect({
              type: 'slash',
              x: enemy.x,
              y: enemy.y,
              text: '⚔️',
              color: 'text-white',
              rotation: slashRotation
            });
            
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += enemy.xp;
              newState.currency += Math.floor(enemy.xp / 5);
              
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
            
            const slashRotation = Math.random() * 360;
            addEffect({
              type: 'slash',
              x: boss.x,
              y: boss.y,
              text: '⚔️',
              color: 'text-white',
              rotation: slashRotation
            });
            
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += boss.xp;
              newState.currency += Math.floor(boss.xp / 3);
              
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
        newState.character.isAttacking = true;
        
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            character: { ...prev.character, isAttacking: false }
          }));
        }, 200);

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
            text: '💥',
            color: 'text-orange-500'
          });
          
          addEffect({
            type: 'rocketBurst',
            x: target.x,
            y: target.y,
            text: '',
            color: 'text-orange-500'
          });
          
          addEffect({
            type: 'explosion',
            x: target.x + (Math.random() - 0.5) * 20,
            y: target.y + (Math.random() - 0.5) * 20,
            text: '💥',
            color: 'text-red-500'
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
              newState.currency += Math.floor(target.xp / 5);
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
              newState.currency += Math.floor(target.xp / 3);
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
          
          const thunderSlashRotation = Math.random() * 360;
          addEffect({
            type: 'thunderSlash',
            x: target.x,
            y: target.y,
            text: '⚡',
            color: 'text-blue-400',
            rotation: thunderSlashRotation
          });
          
          addEffect({
            type: 'thunder_warning',
            x: target.x,
            y: target.y - 30,
            text: '🌩️',
            color: 'text-yellow-300'
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
              newState.currency += Math.floor(target.xp / 5);
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
              newState.currency += Math.floor(target.xp / 3);
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
        
        newX = Math.max(16, Math.min(1264, newX));
        newY = Math.max(16, Math.min(984, newY));
        
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
                  type: 'fireballBurst',
                  x: enemy.x,
                  y: enemy.y,
                  text: '',
                  color: 'text-orange-500'
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
                  newState.currency += Math.floor(enemy.xp / 5);
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
              
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 300);
              
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
              
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 300);
              
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
              
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 300);
              
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
          
          newState.character.maxHealth += 15;
          newState.character.health += 20;
          newState.character.damage += 3;
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
    if (!hasSelectedStarter) return;
    
    const selectedChar = characterData[gameState.selectedCharacter];
    
    setGameState(prev => ({
      ...prev,
      character: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        health: selectedChar.baseStats.health,
        maxHealth: selectedChar.baseStats.health,
        damage: selectedChar.baseStats.damage,
        attackSpeed: selectedChar.baseStats.attackSpeed,
        lastAttack: 0,
        x: 400,
        y: 300,
        speed: selectedChar.baseStats.speed,
        attackRange: selectedChar.baseStats.attackRange,
        isAttacking: false
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
    }));
    setIsPlaying(false);
    setGameOver(false);
  };

  // Tutorial modal styling with fixes applied
  const tutorialModalStyle = {
    position: 'fixed',
    top: '60%', // Moved lower
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundImage: 'url(/tutorialui.png)',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '800px',
    height: '500px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 80px 80px 80px', // More padding to keep content within parchment
    boxSizing: 'border-box'
  };

  const tutorialStepStyle = {
    color: '#4A90E2',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '1px 1px 2px white'
  };

  const tutorialHeadingStyle = {
    color: '#CC0000',
    fontSize: '36px', // Bigger heading
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    WebkitTextStroke: '0.5px black', // Thinner stroke so red shows through
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  };

  const tutorialContentStyle = {
    color: 'black',
    fontSize: '15px',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: '1.5',
    marginBottom: '25px',
    textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
    maxWidth: '600px' // Constrain width to fit better
  };

  const tutorialButtonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '500px', // Constrain button container width
    marginTop: '15px'
  };

  const tutorialSkipButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const tutorialNextButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
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
      
      <div className={`relative h-screen border-4 border-gray-700 ${screenShake ? 'animate-pulse' : ''}`} style={{ 
        transform: screenShake ? `translate(${Math.random() > 0.5 ? '6px' : '-6px'}, ${Math.random() > 0.5 ? '4px' : '-4px'})` : 'none',
        transition: screenShake ? 'none' : 'transform 100ms ease-out',
        animation: screenShake ? 'shake 300ms ease-in-out' : 'none'
      }}>
        <div 
          className="absolute w-20 h-20 flex items-center justify-center z-10 shadow-lg transition-all duration-75"
          style={{ 
            left: `${gameState.character.x - 40}px`, 
            top: `${gameState.character.y - 40}px`,
            transform: gameState.character.health <= 30 ? 'scale(0.9)' : 'scale(1)',
            backgroundImage: `url("/${characterData[gameState.selectedCharacter].image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
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

        {gameState.effects.map(effect => {
          const age = gameState.gameTime - effect.time;
          const fadeProgress = age / 1500;
          const scale = 1 + (fadeProgress * 0.3);
          const opacity = Math.max(0, 1 - fadeProgress);
          
          if (effect.type === 'slash') {
            return (
              <div
                key={effect.id}
                className="absolute pointer-events-none z-25"
                style={{ 
                  left: `${effect.x - 20}px`, 
                  top: `${effect.y - 2}px`,
                  opacity: Math.max(0, 1 - (age / 300)),
                  transform: `rotate(${effect.rotation}deg) scale(${1 + (age / 300)})`,
                }}
              >
                <div 
                  className="w-10 h-0.5 bg-white"
                  style={{
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                    borderRadius: '2px'
                  }}
                ></div>
              </div>
            );
          }
          
          if (effect.type === 'fireballBurst') {
            return (
              <div
                key={effect.id}
                className="absolute pointer-events-none z-24"
                style={{ 
                  left: `${effect.x - 30}px`, 
                  top: `${effect.y - 30}px`,
                  opacity: Math.max(0, 1 - (age / 400)),
                  transform: `scale(${1 + (age / 150)})`,
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(249, 115, 22, 0.6) 40%, rgba(245, 101, 101, 0.3) 70%, transparent 100%)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                  }}
                ></div>
              </div>
            );
          }
          
          if (effect.type === 'rocketBurst') {
            return (
              <div
                key={effect.id}
                className="absolute pointer-events-none z-24"
                style={{ 
                  left: `${effect.x - 35}px`, 
                  top: `${effect.y - 35}px`,
                  opacity: Math.max(0, 1 - (age / 450)),
                  transform: `scale(${1 + (age / 120)})`,
                }}
              >
                <div 
                  className="w-20 h-20 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(249, 115, 22, 0.9) 0%, rgba(234, 179, 8, 0.7) 30%, rgba(251, 191, 36, 0.5) 60%, transparent 80%)',
                    boxShadow: '0 0 25px rgba(249, 115, 22, 0.8), 0 0 40px rgba(234, 179, 8, 0.4)'
                  }}
                ></div>
              </div>
            );
          }
          
          if (effect.type === 'thunderSlash') {
            return (
              <div
                key={effect.id}
                className="absolute pointer-events-none z-25"
                style={{ 
                  left: `${effect.x - 25}px`, 
                  top: `${effect.y - 2}px`,
                  opacity: Math.max(0, 1 - (age / 600)),
                  transform: `rotate(${effect.rotation}deg) scale(${1 + (age / 600)})`,
                }}
              >
                <div 
                  className="absolute w-12 h-0.5"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #eab308, #3b82f6)',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.8), 0 0 6px rgba(234, 179, 8, 0.6)',
                    borderRadius: '2px'
                  }}
                ></div>
              </div>
            );
          }
          
          return (
            <div
              key={effect.id}
              className={`absolute ${effect.color} font-bold pointer-events-none z-20`}
              style={{ 
                left: `${effect.x}px`, 
                top: `${effect.y - (age * 0.05)}px`,
                transform: `scale(${scale})`,
                opacity: opacity,
                fontSize: effect.type === 'kill' ? '16px' : '18px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                transition: 'all 0.1s ease-out'
              }}
            >
              {effect.text}
            </div>
          );
        })}

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
          <div className="bg-black bg-opacity-30 border border-gray-400 rounded px-4 py-3 space-y-2">
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
              Damage: {Math.round(gameState.character.damage)} | 
              Attack Speed: {(1000 / gameState.character.attackSpeed).toFixed(1)}/s |
              Move Speed: {gameState.character.speed} |
              Range: {gameState.character.attackRange}
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-lg font-bold bg-black bg-opacity-30 border border-gray-400 rounded px-3 py-1">Currency: {gameState.currency} 💰</div>
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
          <div className="mt-4 bg-black bg-opacity-30 border border-gray-400 rounded px-3 py-2 inline-block">
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
        <div className="text-sm bg-black bg-opacity-50 p-2 rounded">
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

          {hasSelectedStarter && (
            <button 
              onClick={() => setShowCharacterSelect(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm transition-all"
            >
              Unlock Hashira
            </button>
          )}
        </div>
      </div>

      {showStarterSelect && !hasSelectedStarter && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-4xl w-full mx-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">Choose Your Starter Character</h2>
              <p className="text-gray-300 text-lg">This choice is permanent! Choose wisely, as you cannot switch between starter characters later.</p>
              <p className="text-gray-400 text-sm mt-2">You can unlock additional Hashira characters with currency during gameplay.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(characterData)
                .filter(([id, char]) => char.cost === 0)
                .map(([id, char]) => (
                  <div
                    key={id}
                    className="p-6 rounded-lg border-2 border-blue-400 bg-gray-700 hover:bg-gray-600 transition-all cursor-pointer"
                    onClick={() => selectStarterCharacter(id)}
                  >
                    <div className="text-center">
                      <div 
                        className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-white"
                        style={{
                          backgroundImage: `url("/${char.image}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      ></div>
                      
                      <h3 className="text-xl font-bold text-white mb-3">{char.name}</h3>
                      
                      <div className="text-sm space-y-2 mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>HP: <span className="text-green-400">{char.baseStats.health}</span></div>
                          <div>DMG: <span className="text-red-400">{char.baseStats.damage}</span></div>
                          <div>SPD: <span className="text-blue-400">{char.baseStats.speed}</span></div>
                          <div>RNG: <span className="text-yellow-400">{char.baseStats.attackRange}</span></div>
                        </div>
                        {char.inherentMultiStrike && (
                          <div className="text-purple-400 font-semibold">Dual Strike: Attacks {char.inherentMultiStrike} enemies</div>
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4">{char.description}</p>
                      
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all">
                        Choose {char.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {showCharacterSelect && hasSelectedStarter && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">Select Character</h2>
              <p className="text-gray-300">Current: {characterData[gameState.selectedCharacter].name} | Currency: {gameState.currency} 💰</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(characterData)
                .filter(([id, char]) => hasSelectedStarter ? char.cost > 0 : false)
                .map(([id, char]) => {
                const isUnlocked = unlockedCharacters.includes(id);
                const isSelected = gameState.selectedCharacter === id;
                const canAfford = gameState.currency >= char.cost;
                
                return (
                  <div
                    key={id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-yellow-400 bg-yellow-900 bg-opacity-30' 
                        : isUnlocked 
                          ? 'border-green-400 bg-gray-700 hover:bg-gray-600' 
                          : canAfford 
                            ? 'border-blue-400 bg-gray-700 hover:bg-gray-600'
                            : 'border-gray-600 bg-gray-800 opacity-70'
                    }`}
                  >
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 mx-auto mb-2 rounded-full"
                        style={{
                          backgroundImage: `url("/${char.image}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      ></div>
                      
                      <h3 className={`font-bold mb-2 ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
                        {char.name}
                      </h3>
                      
                      <div className="text-xs space-y-1 mb-3">
                        <div>HP: {char.baseStats.health} | DMG: {char.baseStats.damage}</div>
                        <div>SPD: {char.baseStats.speed} | RNG: {char.baseStats.attackRange}</div>
                        <div className="text-gray-400">{char.description}</div>
                      </div>
                      
                      {char.cost > 0 && (
                        <div className={`text-sm mb-2 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                          Cost: {char.cost} 💰
                        </div>
                      )}
                      
                      {isSelected ? (
                        <div className="text-yellow-400 font-bold">SELECTED</div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => selectCharacter(id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-all"
                        >
                          Select
                        </button>
                      ) : canAfford ? (
                        <button
                          onClick={() => {
                            if (unlockCharacter(id)) {
                              selectCharacter(id);
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all"
                        >
                          Unlock & Select
                        </button>
                      ) : (
                        <div className="text-gray-500 text-sm">Insufficient Funds</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-6">
              <button
                onClick={() => setShowCharacterSelect(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div style={tutorialModalStyle}>
            <div style={tutorialStepStyle}>
              Step {tutorialStep + 1} of {tutorialSteps.length}
            </div>
            <h2 style={tutorialHeadingStyle}>{tutorialSteps[tutorialStep].title}</h2>
            
            {/* Break content into paragraphs */}
            <div style={tutorialContentStyle}>
              {tutorialSteps[tutorialStep].content.split('\n').map((paragraph, index) => (
                <div key={index} style={{marginBottom: '10px'}}>
                  {paragraph}
                </div>
              ))}
            </div>
            
            <div style={tutorialButtonContainerStyle}>
              <button 
                onClick={skipTutorial} 
                style={tutorialSkipButtonStyle}
              >
                Skip Tutorial
              </button>
              <button 
                onClick={nextTutorialStep} 
                style={tutorialNextButtonStyle}
              >
                {tutorialStep === tutorialSteps.length - 1 ? 'Start Game!' : 'Next'}
              </button>
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
      )}

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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
