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

  // Tutorial steps definition
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
    { name: 'Goblin', health: 25, xp: 10, color: 'bg-green-500', speed: 1.5, damage: 10 },
    { name: 'Orc', health: 50, xp: 25, color: 'bg-red-500', speed: 1.2, damage: 15 },
    { name: 'Troll', health: 100, xp: 50, color: 'bg-gray-600', speed: 0.8, damage: 25 },
    { name: 'Dragon', health: 200, xp: 100, color: 'bg-purple-600', speed: 0.6, damage: 35 }
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

  const spawnWave = useCallback((waveNumber) => {
    const enemyCount = Math.min(3 + waveNumber * 2, 15);
    const levelFactor = Math.floor(gameState.character.level / 3);
    
    const newEnemies = [];
    for (let i = 0; i < enemyCount; i++) {
      const enemyTypeIndex = Math.min(
        Math.floor(waveNumber / 3) + Math.floor(Math.random() * 2), 
        enemyTypes.length - 1
      );
      const enemyType = enemyTypes[enemyTypeIndex];
      
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = 400 + Math.random() * 200;
      const centerX = 400;
      const centerY = 300;
      
      const newEnemy = {
        id: Date.now() + Math.random() + i,
        ...enemyType,
        currentHealth: enemyType.health + (levelFactor * 10),
        maxHealth: enemyType.health + (levelFactor * 10),
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        xp: enemyType.xp + (levelFactor * 5),
        lastDamageTime: 0
      };
      
      newEnemies.push(newEnemy);
    }

    setGameState(prev => ({
      ...prev,
      enemies: newEnemies,
      waveProgress: 'active',
      waveStartTime: prev.gameTime
    }));
  }, [gameState.character.level]);

  const attackEnemies = useCallback(() => {
    setGameState(prev => {
      if (prev.enemies.length === 0) return prev;
      
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

      if (enemiesInRange.length > 0) {
        const multiStrikeLevel = newState.abilities.weaponMultiplier;
        const enemiesToAttack = Math.min(
          1 + multiStrikeLevel,
          enemiesInRange.length
        );

        const attackedEnemyIds = new Set();
        
        for (let i = 0; i < enemiesToAttack; i++) {
          const targetEnemy = enemiesInRange[i].enemy;
          attackedEnemyIds.add(targetEnemy.id);
        }

        const updatedEnemies = newState.enemies.map(enemy => {
          if (attackedEnemyIds.has(enemy.id)) {
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
              
              return null;
            }
            return { ...enemy, currentHealth: newHealth };
          }
          return enemy;
        }).filter(Boolean);

        newState.enemies = updatedEnemies;
        newState.character.lastAttack = now;

        if (newState.enemies.length === 0 && newState.waveProgress === 'active') {
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
      
      if (newState.abilities.rockets > 0 && newState.gameTime % 3000 < 50) {
        const rocketDamage = newState.character.damage * 1.5;
        const rocketsToFire = newState.abilities.rockets;
        
        const sortedEnemies = newState.enemies
          .map(enemy => ({
            enemy,
            distance: Math.sqrt(
              Math.pow(newState.character.x - enemy.x, 2) + 
              Math.pow(newState.character.y - enemy.y, 2)
            )
          }))
          .sort((a, b) => a.distance - b.distance);
        
        const enemiesToHit = Math.min(rocketsToFire, sortedEnemies.length);
        const targetIds = new Set();
        
        for (let i = 0; i < enemiesToHit; i++) {
          targetIds.add(sortedEnemies[i].enemy.id);
        }
        
        newState.enemies = newState.enemies.map(enemy => {
          if (targetIds.has(enemy.id)) {
            addEffect({
              type: 'rocket',
              x: enemy.x,
              y: enemy.y,
              text: '🚀',
              color: 'text-orange-500'
            });
            
            const newHealth = enemy.currentHealth - rocketDamage;
            if (newHealth <= 0) {
              newState.enemiesKilled++;
              newState.character.xp += enemy.xp;
              return null;
            }
            return { ...enemy, currentHealth: newHealth };
          }
          return enemy;
        }).filter(Boolean);
      }

      if (newState.abilities.fireball > 0 && newState.gameTime % 5000 < 50 && newState.enemies.length > 0) {
        const nearestEnemy = newState.enemies.reduce((closest, enemy) => {
          const closestDist = Math.sqrt(
            Math.pow(newState.character.x - closest.x, 2) + 
            Math.pow(newState.character.y - closest.y, 2)
          );
          const enemyDist = Math.sqrt(
            Math.pow(newState.character.x - enemy.x, 2) + 
            Math.pow(newState.character.y - enemy.y, 2)
          );
          return enemyDist < closestDist ? enemy : closest;
        });

        const dx = nearestEnemy.x - newState.character.x;
        const dy = nearestEnemy.y - newState.character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const speed = 8;
          const fireball = {
            id: Date.now() + Math.random(),
            x: newState.character.x,
            y: newState.character.y,
            vx: (dx / distance) * speed,
            vy: (dy / distance) * speed,
            damage: newState.character.damage * 2.5,
            lifetime: 0
          };
          
          newState.projectiles.push(fireball);
        }
      }

      if (newState.abilities.thunderStrike > 0 && newState.gameTime % 4000 < 50 && newState.enemies.length > 0) {
        const thunderDamage = newState.character.damage * 2;
        const strikeCount = Math.min(2 + newState.abilities.thunderStrike, newState.enemies.length);
        
        const shuffledEnemies = [...newState.enemies].sort(() => Math.random() - 0.5);
        const targetIds = new Set();
        
        for (let i = 0; i < strikeCount; i++) {
          targetIds.add(shuffledEnemies[i].id);
          addEffect({
            type: 'lightning',
            x: shuffledEnemies[i].x,
            y: shuffledEnemies[i].y,
            text: '⚡',
            color: 'text-blue-400'
          });
        }
        
        newState.enemies = newState.enemies.map(enemy => {
          if (targetIds.has(enemy.id)) {
            const newHealth = enemy.currentHealth - thunderDamage;
            addEffect({
              type: 'shock',
              x: enemy.x,
              y: enemy.y,
              text: `-${thunderDamage}`,
              color: 'text-cyan-400'
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
        
        newX = Math.max(32, Math.min(768, newX));
        newY = Math.max(32, Math.min(568, newY));
        
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
                  text: `-${newProjectile.damage}`,
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

        if (newState.waveProgress === 'cleared' && newState.gameTime - newState.waveTransitionTime > 3000) {
          newState.waveProgress = 'transition';
        }
        
        if (newState.waveProgress === 'transition' && newState.gameTime - newState.waveTransitionTime > 6000) {
          newState.currentWave++;
          newState.waveProgress = 'preparing';
        }
        
        if (newState.waveProgress === 'preparing' && newState.enemies.length === 0) {
          if (newState.gameTime - newState.waveTransitionTime > 7000) {
            spawnWave(newState.currentWave);
          }
        }
        
        if (newState.enemies.length === 0 && newState.waveProgress === 'active') {
          newState.waveProgress = 'cleared';
          newState.waveTransitionTime = newState.gameTime;
        }

        newState.effects = newState.effects.filter(effect => 
          newState.gameTime - effect.time < 1500
        );

        if (newState.character.xp >= newState.character.xpToNext) {
          newState.character.xp -= newState.character.xpToNext;
          newState.character.level++;
          newState.character.xpToNext = Math.floor(newState.character.xpToNext * 1.3);
          newState.character.maxHealth += 20;
          newState.character.health = newState.character.maxHealth;
          newState.character.damage += 5;
          newState.character.attackSpeed = Math.max(200, newState.character.attackSpeed - 50);
          
          const shuffled = [...availableAbilities].sort(() => Math.random() - 0.5);
          newState.levelUpOptions = shuffled.slice(0, 3);
          newState.isLevelingUp = true;
        }

        return newState;
      });

      attackEnemies();
      executeAbilities();
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, attackEnemies, executeAbilities, spawnWave, addEffect]);

  const chooseAbility = (abilityId) => {
    setGameState(prev => {
      const ability = availableAbilities.find(a => a.id === abilityId);
      let newState = ability.effect(prev);
      newState.abilities = { ...newState.abilities, [abilityId]: newState.abilities[abilityId] + 1 };
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
      
      {/* Game Arena */}
      <div className="relative h-screen border-4 border-gray-700">
        {/* Character */}
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

        {gameState.projectiles.map(projectile => (
          <div
            key={projectile.id}
            className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse z-15"
            style={{ left: `${projectile.x - 6}px`, top: `${projectile.y - 6}px` }}
          >
            🔥
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
            <div className="text-5xl font-bold text-green-400 animate-bounce">
              WAVE {gameState.currentWave + 1} INCOMING!
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className={`text-xl font-bold ${
                showTutorial && tutorialSteps[tutorialStep]?.highlight === 'xp' ? 'ring-2 ring-yellow-400 rounded px-2' : ''
              }`}>Level {gameState.character.level}</div>
              <div className={`text-sm ${
                showTutorial && tutorialSteps[tutorialStep]?.highlight === 'xp' ? 'ring-2 ring-yellow-400 rounded px-2' : ''
              }`}>
                XP: {gameState.character.xp}/{gameState.character.xpToNext}
              </div>
              <div className={`text-lg font-bold text-yellow-400 ${
                showTutorial && tutorialSteps[tutorialStep]?.highlight === 'wave' ? 'ring-2 ring-yellow-400 rounded px-2' : ''
              }`}>Wave {gameState.currentWave}</div>
            </div>
            <div className={`flex items-center space-x-2 ${
              showTutorial && tutorialSteps[tutorialStep]?.highlight === 'health' ? 'ring-2 ring-yellow-400 rounded p-1' : ''
            }`}>
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
            <div className="text-lg font-bold">Enemies Killed: {gameState.enemiesKilled}</div>
            <div className="text-sm">Active Enemies: {gameState.enemies.length}</div>
          </div>
        </div>

        <div className={`mt-4 ${
          showTutorial && tutorialSteps[tutorialStep]?.highlight === 'abilities' ? 'ring-2 ring-yellow-400 rounded p-2' : ''
        }`}>
          <div className="text-sm font-semibold mb-2">Active Abilities:</div>
          <div className="flex space-x-2">
            {Object.entries(gameState.abilities).map(([key, level]) => {
              if (level === 0) return null;
              const ability = availableAbilities.find(a => a.id === key);
              const Icon = ability.icon;
              return (
                <div key={key} className="flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{ability.name} {level}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 space-y-2">
        <div className={`text-sm bg-black bg-opacity-50 p-2 rounded ${
          showTutorial && tutorialSteps[tutorialStep]?.highlight === 'controls' ? 'ring-2 ring-yellow-400' : ''
        }`}>
          Move: WASD / Arrow Keys
        </div>
        <div className="space-x-2">
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
          
          {isPlaying && gameState.enemies.length === 0 && gameState.waveProgress !== 'transition' && (
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

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className={`bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4 shadow-2xl border-2 border-gray-600 ${
            tutorialSteps[tutorialStep].position === 'top-left' ? 'absolute top-20 left-4' : 
            tutorialSteps[tutorialStep].position === 'bottom-left' ? 'absolute bottom-20 left-4' : 
            tutorialSteps[tutorialStep].position === 'top-center' ? 'absolute top-20 left-1/2 transform -translate-x-1/2' :
            'relative'
          }`}>
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

            {/* Progress dots */}
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
                        <span className="text-sm bg-blue-600 px-2 py-1 rounded">Level {currentLevel}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{ability.description}</p>
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
