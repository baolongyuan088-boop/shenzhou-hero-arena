(() => {
  const W = 960, H = 540, GROUND = 438;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const heroes = [
    { name: '关羽', title: '青龙义斩', style: '刀势', glyph: '義', sprite: 'guan', color: '#2fb99f', dark: '#145c5d', accent: '#b7f6d5', weapon: 'blade', speed: 215, power: 1.04 },
    { name: '吕布', title: '无双破阵', style: '爆发', glyph: '武', sprite: 'lvbu', color: '#d85b59', dark: '#6a2635', accent: '#ffd0a5', weapon: 'spear', speed: 205, power: 1.15 },
    { name: '诸葛亮', title: '星阵天机', style: '谋略', glyph: '智', sprite: 'zhuge', color: '#69a4db', dark: '#314d8b', accent: '#d9e9ff', weapon: 'fan', speed: 205, power: 0.96 },
    { name: '项羽', title: '霸王裂地', style: '重击', glyph: '霸', sprite: 'xiangyu', color: '#bf725b', dark: '#603a3b', accent: '#ffe0ad', weapon: 'spear', speed: 185, power: 1.22 },
    { name: '花木兰', title: '双锋流影', style: '迅捷', glyph: '勇', sprite: 'mulan', color: '#b886d3', dark: '#67416f', accent: '#f4d6ff', weapon: 'blade', speed: 245, power: 0.98 },
    { name: '孙悟空', title: '齐天连舞', style: '灵动', glyph: '天', sprite: 'wukong', color: '#e0a94d', dark: '#906035', accent: '#fff3aa', weapon: 'staff', speed: 255, power: 1.03 },
    { name: '秦琼', title: '双锏镇关', style: '破甲', glyph: '秦', sprite: 'qinqiong', color: '#40b7ad', dark: '#245a61', accent: '#e1cf91', weapon: 'hammer', speed: 208, power: 1.13 },
    { name: '尉迟恭', title: '铁鞭撼岳', style: '防反', glyph: '尉', sprite: 'yuchi', color: '#a9a8ad', dark: '#41424e', accent: '#f5c98c', weapon: 'staff', speed: 190, power: 1.18 },
    { name: '赵云', title: '龙胆穿云', style: '突进', glyph: '赵', sprite: 'zhaoyun', color: '#a3c9ef', dark: '#42608b', accent: '#ecf6ff', weapon: 'spear', speed: 240, power: 1.02 },
    { name: '岳飞', title: '精忠破阵', style: '均衡', glyph: '岳', sprite: 'yuefei', color: '#78ad7d', dark: '#344d4a', accent: '#e4e8bf', weapon: 'spear', speed: 212, power: 1.09 },
    { name: '李广', title: '飞将逐日', style: '远攻', glyph: '李', sprite: 'liguang', color: '#b99665', dark: '#65513b', accent: '#f8dbab', weapon: 'blade', speed: 218, power: 1.02 },
    { name: '穆桂英', title: '破军梨花', style: '连击', glyph: '穆', sprite: 'muguiying', color: '#ca6a73', dark: '#693a54', accent: '#ffe1bf', weapon: 'spear', speed: 236, power: 1.03 }
  ];
  const gods = [
    { name: '雷公', title: '九霄雷罚', sprite: 'leigong', color: '#74bdec', dark: '#304d8e', accent: '#d1f5ff', weapon: 'hammer', speed: 190, power: 1.0 },
    { name: '刑天', title: '不屈战魄', sprite: 'xingtian', color: '#cc6866', dark: '#692b3d', accent: '#ffc8b2', weapon: 'axe', speed: 195, power: 1.08 },
    { name: '共工', title: '怒海倾天', sprite: 'gonggong', color: '#5e95c6', dark: '#293e78', accent: '#c9e6ff', weapon: 'trident', speed: 205, power: 1.12 }
  ];
  const spirits = [
    { name: '赤霄', desc: '攻击 +10%', type: 'might', image: 'chixiao' },
    { name: '玄甲', desc: '受伤 -12%', type: 'ward', image: 'xuanjia' },
    { name: '青鸾', desc: '战意 +25%', type: 'focus', image: 'qingluan' }
  ];
  const cardTypes = [
    { name: '奇袭', desc: '下一击伤害提高', type: 'assault' },
    { name: '护阵', desc: '短时间减伤', type: 'shield' },
    { name: '回春', desc: '回复 18 生命', type: 'heal' },
    { name: '雷令', desc: '远程雷击 15 伤害', type: 'bolt' }
  ];
  const attacks = {
    light: { damage: 8, range: 105, windup: .11, duration: .31, cooldown: .32, energy: 0 },
    heavy: { damage: 15, range: 125, windup: .24, duration: .55, cooldown: .62, energy: 0 },
    special: { damage: 27, range: 165, windup: .3, duration: .76, cooldown: .85, energy: 50 }
  };
  let selected = 0, selectedSpirit = 0, round = 0, phase = 'select', player = null, enemy = null;
  let hand = [], deckIndex = 3, cardSignature = '', seconds = 90, last = 0, aiClock = 0, endClock = 0;
  let messageClock = 0, effects = [], held = { left: false, right: false, guard: false };
  let lastFinish = '';
  const ROUNDS = ['第一战', '第二战', '终局'];
  const spriteCache = new Map();
  const spiritCache = new Map();

  function spriteFor(profile) {
    if (!profile?.sprite || typeof Image === 'undefined') return null;
    if (!spriteCache.has(profile.sprite)) {
      const image = new Image();
      image.src = 'assets/' + profile.sprite + '.png';
      spriteCache.set(profile.sprite, image);
    }
    const image = spriteCache.get(profile.sprite);
    return image.complete && image.naturalWidth > 0 ? image : null;
  }
  function spiritFor(spirit) {
    if (!spirit?.image || typeof Image === 'undefined') return null;
    if (!spiritCache.has(spirit.image)) {
      const image = new Image();
      image.src = 'assets/' + spirit.image + '.png';
      spiritCache.set(spirit.image, image);
    }
    const image = spiritCache.get(spirit.image);
    return image.complete && image.naturalWidth > 0 ? image : null;
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const width = Math.max(1, Math.round(box.width * dpr));
    const height = Math.max(1, Math.round(box.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height;
    }
  }
  window.addEventListener('resize', resize);

  function fighter(profile, x, side) {
    return { profile, x, y: GROUND, vy: 0, side, facing: side === 'player' ? 1 : -1,
      hp: 100, energy: 0, attack: null, cooldown: 0, stun: 0, guard: false,
      shield: 0, powerUp: 0, flash: 0, guardClock: 0, ko: false };
  }

  function say(text, duration = 1.1) {
    $('message').textContent = text;
    $('message').classList.add('show');
    messageClock = duration;
  }
  function hideMessage() { $('message').classList.remove('show'); }
  function showPanel(title, text, button, roster = false) {
    $('panel-title').textContent = title;
    $('panel-text').textContent = text;
    $('start').textContent = button;
    $('roster').style.display = roster ? 'grid' : 'none';
    $('spirits').style.display = roster ? 'flex' : 'none';
    $('overlay').classList.remove('hidden');
  }
  function renderRoster() {
    $('roster').innerHTML = '';
    heroes.forEach((hero, index) => {
      const button = document.createElement('button');
      button.className = 'hero' + (index === selected ? ' selected' : '');
      button.innerHTML = '<b>' + hero.name + '</b><small>' + hero.style + ' · ' + hero.title + '</small>';
      const portrait = document.createElement('span');
      portrait.className = 'hero-thumb';
      portrait.style.backgroundImage = 'url(assets/' + hero.sprite + '.png)';
      button.appendChild(portrait);
      button.addEventListener('click', () => { selected = index; spriteFor(hero); renderRoster(); });
      $('roster').appendChild(button);
    });
  }
  function renderSpirits() {
    $('spirits').innerHTML = '';
    spirits.forEach((spirit, index) => {
      const button = document.createElement('button');
      button.className = 'spirit' + (index === selectedSpirit ? ' selected' : '');
      button.textContent = '契灵·' + spirit.name + '｜' + spirit.desc;
      const portrait = document.createElement('img');
      portrait.className = 'spirit-thumb';
      portrait.src = 'assets/' + spirit.image + '.png';
      portrait.alt = '';
      button.appendChild(portrait);
      button.addEventListener('click', () => { selectedSpirit = index; spiritFor(spirit); renderSpirits(); });
      $('spirits').appendChild(button);
    });
  }
  renderRoster();
  renderSpirits();

  function refillHand() {
    hand = [cardTypes[0], cardTypes[1], cardTypes[2]].map(card => ({ card, cooldown: 0 }));
    deckIndex = 3;
    renderCards();
  }
  function renderCards() {
    const signature = phase + '|' + hand.map(slot => slot.card.type + ':' + Math.ceil(slot.cooldown)).join('|');
    if (signature === cardSignature) return;
    cardSignature = signature;
    $('cards').innerHTML = '';
    hand.forEach((slot, index) => {
      const button = document.createElement('button');
      button.className = 'card';
      button.disabled = phase !== 'fight' || slot.cooldown > 0;
      button.innerHTML = '<b>' + (index + 1) + ' · ' + slot.card.name + '</b><span>' +
        (slot.cooldown > 0 ? '重整 ' + Math.ceil(slot.cooldown) + ' 秒' : slot.card.desc) + '</span>';
      button.addEventListener('pointerdown', event => { event.preventDefault(); playCard(index); });
      button.addEventListener('click', () => playCard(index));
      $('cards').appendChild(button);
    });
  }
  function startRound(index = 0) {
    round = index;
    player = fighter(heroes[selected], 250, 'player');
    enemy = fighter(gods[round], 710, 'enemy');
    spriteFor(player.profile);
    spriteFor(enemy.profile);
    spiritFor(spirits[selectedSpirit]);
    seconds = 90; aiClock = .5; effects = []; endClock = 0;
    held = { left: false, right: false, guard: false };
    refillHand();
    phase = 'fight';
    $('overlay').classList.add('hidden');
    say(ROUNDS[round] + ' · ' + heroes[selected].name + ' 与契灵·' + spirits[selectedSpirit].name, 1.8);
    updateHud();
    renderCards();
    last = performance.now();
  }
  $('start').addEventListener('click', () => {
    if (phase === 'select' || phase === 'complete') startRound(0);
    else if (phase === 'victory') startRound(round + 1);
    else if (phase === 'defeat') startRound(round);
    else if (phase === 'paused') { phase = 'fight'; $('overlay').classList.add('hidden'); last = performance.now(); renderCards(); }
  });

  function pause() {
    if (phase !== 'fight') return;
    phase = 'paused';
    showPanel('对战暂停', '准备好了就继续。', '继续对战');
    renderCards();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  function jump(f) {
    if (phase !== 'fight' || f.ko || f.y < GROUND - 2 || f.stun > 0) return;
    f.vy = -625;
  }
  function attack(f, type) {
    if (phase !== 'fight' || f.ko || f.stun > 0 || f.cooldown > 0 || f.attack) return false;
    const spec = attacks[type];
    if (f.energy < spec.energy) return false;
    f.energy -= spec.energy;
    f.attack = { type, elapsed: 0, hit: false };
    f.cooldown = spec.cooldown;
    f.guard = false;
    f.guardClock = 0;
    return true;
  }
  function impact(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 70 + Math.random() * 210;
      effects.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: .4 + Math.random() * .4, max: .8, color });
    }
  }
  function damage(target, amount, attacker, source = 'strike') {
    if (target.ko || phase !== 'fight') return;
    const guarded = target.guard || target.shield > 0;
    const spiritPower = attacker.side === 'player' && spirits[selectedSpirit].type === 'might' ? 1.1 : 1;
    const spiritWard = target.side === 'player' && spirits[selectedSpirit].type === 'ward' ? .88 : 1;
    const final = Math.max(1, Math.round(amount * spiritPower * spiritWard * (guarded ? target.shield > 0 ? .42 : .32 : 1)));
    target.hp = Math.max(0, target.hp - final);
    target.flash = .2;
    target.stun = guarded ? .07 : source === 'special' ? .42 : .22;
    target.x = Math.max(75, Math.min(885, target.x + (attacker.x < target.x ? 1 : -1) * (guarded ? 12 : 29)));
    const spiritFocus = attacker.side === 'player' && spirits[selectedSpirit].type === 'focus' ? 1.25 : 1;
    attacker.energy = Math.min(100, attacker.energy + (source === 'card' ? 4 : 10) * spiritFocus);
    impact(target.x, target.y - 80, guarded ? '#bdeaff' : source === 'special' ? '#ffdb85' : '#fff2d3', guarded ? 5 : 13);
    say(guarded ? '格挡！' : source === 'special' ? attacker.profile.title + '！' : String(final) + ' 伤害', .42);
    if (target.hp <= 0) {
      target.ko = true;
      lastFinish = source === 'special' ? '终式 · ' + attacker.profile.title : '决胜一击';
      phase = 'ending';
      endClock = 1.5;
      say(lastFinish, 1.5);
    }
  }
  function resolveAttack(f, other, dt) {
    if (!f.attack) return;
    f.attack.elapsed += dt;
    const spec = attacks[f.attack.type];
    if (!f.attack.hit && f.attack.elapsed >= spec.windup) {
      f.attack.hit = true;
      const distance = Math.abs(other.x - f.x);
      const vertical = Math.abs((other.y - 80) - (f.y - 80));
      const inFront = (other.x - f.x) * f.facing > -15;
      if (distance <= spec.range && vertical < 95 && inFront) {
        let power = spec.damage * f.profile.power;
        if (f.powerUp > 0) { power *= 1.55; f.powerUp = 0; }
        damage(other, power, f, f.attack.type);
      }
    }
    if (f.attack.elapsed >= spec.duration) f.attack = null;
  }
  function playCard(index) {
    if (phase !== 'fight' || !hand[index] || hand[index].cooldown > 0) return false;
    const slot = hand[index];
    switch (slot.card.type) {
      case 'assault': player.powerUp = 6; say('奇袭 · 下一击强化'); break;
      case 'shield': player.shield = 5; say('护阵 · 减伤开启'); break;
      case 'heal': player.hp = Math.min(100, player.hp + 18); say('回春 · 回复生命'); break;
      case 'bolt':
        say('雷令 · 远程破敌');
        impact(enemy.x, enemy.y - 90, '#9deeff', 16);
        damage(enemy, 15, player, 'card');
        break;
    }
    slot.cooldown = 8;
    renderCards();
    return true;
  }

  function updateFighter(f, dt) {
    if (!f) return;
    f.lastX = f.x;
    f.cooldown = Math.max(0, f.cooldown - dt);
    f.stun = Math.max(0, f.stun - dt);
    f.shield = Math.max(0, f.shield - dt);
    f.powerUp = Math.max(0, f.powerUp - dt);
    f.flash = Math.max(0, f.flash - dt);
    f.guardClock = Math.max(0, f.guardClock - dt);
    f.vy += 1650 * dt;
    f.y = Math.min(GROUND, f.y + f.vy * dt);
    if (f.y === GROUND) f.vy = 0;
  }
  function playerInput(dt) {
    player.guard = held.guard && !player.attack && player.stun <= 0;
    if (player.stun > 0 || player.attack || player.guard) return;
    const move = Number(held.right) - Number(held.left);
    player.x = Math.max(75, Math.min(885, player.x + move * player.profile.speed * dt));
  }
  function enemyAI(dt) {
    const distance = player.x - enemy.x;
    enemy.facing = distance >= 0 ? 1 : -1;
    enemy.guard = enemy.guardClock > 0 && !enemy.attack;
    if (enemy.stun > 0 || enemy.attack) return;
    aiClock -= dt;
    if (Math.abs(distance) > 105) enemy.x += Math.sign(distance) * enemy.profile.speed * .67 * dt;
    else if (Math.abs(distance) < 55) enemy.x -= Math.sign(distance) * 45 * dt;
    enemy.x = Math.max(75, Math.min(885, enemy.x));
    if (aiClock <= 0) {
      aiClock = .36 + Math.random() * .35;
      if (Math.abs(distance) < 148) {
        const choice = Math.random();
        if (choice < .16) { enemy.guardClock = .45; enemy.guard = true; }
        else attack(enemy, enemy.energy >= 50 && choice > .88 ? 'special' : choice > .55 ? 'heavy' : 'light');
      }
    }
  }
  function update(dt) {
    if (phase === 'ending') {
      endClock -= dt;
      if (endClock <= 0) finishRound();
    }
    if (phase !== 'fight') {
      effects.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
      effects = effects.filter(p => p.life > 0);
      return;
    }
    seconds = Math.max(0, seconds - dt);
    if (seconds === 0) {
      if (player.hp === enemy.hp) { player.hp = 0; player.ko = true; }
      else if (player.hp > enemy.hp) enemy.ko = true;
      else player.ko = true;
      phase = 'ending'; endClock = 1.2; lastFinish = '时间到'; say('时间到', 1.2);
      return;
    }
    updateFighter(player, dt); updateFighter(enemy, dt);
    player.facing = enemy.x >= player.x ? 1 : -1;
    playerInput(dt); enemyAI(dt);
    resolveAttack(player, enemy, dt);
    if (phase === 'fight') resolveAttack(enemy, player, dt);
    hand.forEach(slot => {
      if (slot.cooldown <= 0) return;
      slot.cooldown = Math.max(0, slot.cooldown - dt);
      if (slot.cooldown === 0) slot.card = cardTypes[deckIndex++ % cardTypes.length];
    });
    effects.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    effects = effects.filter(p => p.life > 0);
    messageClock -= dt;
    if (messageClock <= 0) hideMessage();
  }
  function finishRound() {
    hideMessage();
    if (enemy.ko && !player.ko) {
      if (round === gods.length - 1) {
        phase = 'complete';
        showPanel('人间胜利', heroes[selected].name + ' 连胜三位神域斗士，成为本届擂台的胜者。', '重新选择英雄');
        $('roster').style.display = 'grid'; $('spirits').style.display = 'flex'; renderRoster(); renderSpirits();
      } else {
        phase = 'victory';
        showPanel('胜利 · ' + gods[round].name + ' 已败', lastFinish + '。下一战将面对 ' + gods[round + 1].name + '。', '进入下一战');
      }
    } else {
      phase = 'defeat';
      showPanel('人间暂败', heroes[selected].name + ' 在第 ' + (round + 1) + ' 战落败。调整出牌和防守节奏，再来一次。', '重试本战');
    }
    renderCards();
  }
  function updateHud() {
    if (!player || !enemy) return;
    $('player-name').textContent = player.profile.name + ' · ' + spirits[selectedSpirit].name;
    $('enemy-name').textContent = '神域 · ' + enemy.profile.name;
    $('player-health').style.width = player.hp + '%';
    $('enemy-health').style.width = enemy.hp + '%';
    $('player-energy').style.width = player.energy + '%';
    $('enemy-energy').style.width = enemy.energy + '%';
    $('timer').textContent = Math.ceil(seconds);
    $('round').textContent = ROUNDS[round];
  }

  function pathRoundRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y); ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius); ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  function drawFighter(f, time) {
    if (!f) return;
    const sprite = spriteFor(f.profile);
    if (sprite) {
      drawSpriteFighter(f, sprite, time);
      return;
    }
    const p = f.profile;
    const breathe = Math.sin(time * .003 + (f.side === 'enemy' ? 2 : 0)) * 2;
    const attackPhase = f.attack ? Math.sin(Math.min(1, f.attack.elapsed / attacks[f.attack.type].duration) * Math.PI) : 0;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.facing, 1);
    ctx.globalAlpha = f.ko ? .65 : 1;
    ctx.fillStyle = '#0008'; ctx.beginPath(); ctx.ellipse(0, 5, 42, 10, 0, 0, Math.PI * 2); ctx.fill();
    if (f.shield > 0 || f.guard) {
      ctx.strokeStyle = f.shield > 0 ? '#80f2ffbb' : '#ffe1a7a8';
      ctx.lineWidth = 5; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.ellipse(0, -80, 49, 95, 0, -.8, .8); ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (f.ko) { ctx.rotate(-.85); ctx.translate(-25, 12); }
    ctx.strokeStyle = '#0a1424'; ctx.lineWidth = 19; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, -61); ctx.lineTo(-24, -4); ctx.moveTo(13, -61); ctx.lineTo(24, -4); ctx.stroke();
    ctx.strokeStyle = p.dark; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(-14, -61); ctx.lineTo(-24, -5); ctx.moveTo(13, -61); ctx.lineTo(24, -5); ctx.stroke();
    ctx.fillStyle = p.dark; ctx.beginPath(); ctx.moveTo(-28, -96); ctx.lineTo(-15, -50); ctx.lineTo(15, -50); ctx.lineTo(28, -96); ctx.closePath(); ctx.fill();
    const armor = ctx.createLinearGradient(-30, -160, 30, -60);
    armor.addColorStop(0, p.accent); armor.addColorStop(.32, p.color); armor.addColorStop(1, p.dark);
    ctx.fillStyle = f.flash > 0 ? '#fff6d7' : armor;
    pathRoundRect(-27, -151 + breathe, 54, 80, 13); ctx.fill();
    ctx.strokeStyle = '#e5dcbd'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = p.dark; pathRoundRect(-31, -87, 62, 13, 5); ctx.fill();
    ctx.fillStyle = p.accent; ctx.fillRect(-4, -88, 8, 13);
    ctx.strokeStyle = p.dark; ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(-25, -135); ctx.lineTo(-42, -97); ctx.moveTo(24, -135); ctx.lineTo(42 + attackPhase * 25, -100 - attackPhase * 36); ctx.stroke();
    ctx.strokeStyle = p.color; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-25, -135); ctx.lineTo(-42, -97); ctx.moveTo(24, -135); ctx.lineTo(42 + attackPhase * 25, -100 - attackPhase * 36); ctx.stroke();
    ctx.fillStyle = '#e6b795'; ctx.beginPath(); ctx.arc(0, -177 + breathe, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.dark; ctx.beginPath(); ctx.ellipse(0, -194 + breathe, 24, 16, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#101722'; ctx.fillRect(9, -180 + breathe, 4, 2);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-20, -152); ctx.lineTo(20, -152); ctx.stroke();
    const handX = 42 + attackPhase * 25, handY = -100 - attackPhase * 36;
    ctx.save(); ctx.translate(handX, handY); ctx.rotate(-attackPhase * .7);
    ctx.strokeStyle = '#221a17'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-4, 26); ctx.lineTo(13, -56); ctx.stroke();
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-4, 26); ctx.lineTo(13, -56); ctx.stroke();
    ctx.fillStyle = '#e7e9de';
    if (p.weapon === 'fan') {
      ctx.beginPath(); ctx.moveTo(13, -55); ctx.arc(13, -55, 28, -2.7, -.4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.stroke();
    } else if (p.weapon === 'hammer' || p.weapon === 'axe') {
      ctx.fillStyle = p.color; pathRoundRect(-7, -70, 42, 25, 5); ctx.fill();
    } else if (p.weapon === 'staff') {
      ctx.strokeStyle = '#ffd87a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(16, -80); ctx.lineTo(-6, 41); ctx.stroke();
    } else if (p.weapon === 'trident') {
      ctx.strokeStyle = p.accent; ctx.lineWidth = 3;
      for (const dx of [-9, 0, 9]) { ctx.beginPath(); ctx.moveTo(13 + dx, -54); ctx.lineTo(13 + dx, -85); ctx.stroke(); }
    } else {
      ctx.beginPath(); ctx.moveTo(13, -56); ctx.lineTo(32, -97);
      ctx.lineTo(23, -45); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    if (f.attack && attackPhase > .25) {
      ctx.strokeStyle = f.attack.type === 'special' ? '#ffe7a6' : p.accent;
      ctx.lineWidth = f.attack.type === 'special' ? 10 : 6;
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 22;
      ctx.beginPath(); ctx.arc(30, -124, f.attack.type === 'special' ? 100 : 69, -.75, .6); ctx.stroke();
    }
    ctx.restore();
  }
  function drawSpriteFighter(f, sprite, time) {
    let pose = 0;
    if (f.ko || f.stun > .08 || f.flash > 0) pose = 5;
    else if (f.attack) pose = f.attack.type === 'light' ? 2 : 3;
    else if (f.guard || f.shield > 0) pose = 4;
    else if (f.y < GROUND - 3 || Math.abs(f.x - (f.lastX ?? f.x)) > .4) pose = 1;
    const cellW = sprite.naturalWidth / 3, cellH = sprite.naturalHeight / 2;
    const scale = f.profile.sprite === 'wukong' ? .49 : .52;
    const drawW = cellW * scale, drawH = cellH * scale;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.facing, 1);
    ctx.globalAlpha = f.ko ? .65 : 1;
    ctx.fillStyle = '#0008';
    ctx.beginPath(); ctx.ellipse(0, 5, 47, 10, 0, 0, Math.PI * 2); ctx.fill();
    if (f.side === 'player' && f.attack?.type === 'special') {
      const spirit = spirits[selectedSpirit];
      const guardian = spiritFor(spirit);
      const aura = ['#ffb36b', '#8eddf5', '#a8f5bd'][selectedSpirit];
      const strength = Math.sin(Math.min(1, f.attack.elapsed / attacks.special.duration) * Math.PI);
      ctx.save();
      ctx.globalAlpha = .3 + strength * .55;
      ctx.shadowColor = aura; ctx.shadowBlur = 32;
      if (guardian) {
        const guardianH = 310;
        const guardianW = guardianH * guardian.naturalWidth / guardian.naturalHeight;
        ctx.drawImage(guardian, -guardianW * .72, -guardianH + 6, guardianW, guardianH);
      } else {
        ctx.drawImage(sprite, 0, 512, cellW, cellH, -drawW * .78, -drawH * 1.5, drawW * 1.5, drawH * 1.5);
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = .7 + strength * .3;
      ctx.fillStyle = aura; ctx.shadowColor = aura; ctx.shadowBlur = 20;
      ctx.font = 'bold 19px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('契灵·' + spirit.name, 0, -drawH * 1.35);
      ctx.restore();
    }
    if (f.shield > 0 || f.guard) {
      ctx.strokeStyle = f.shield > 0 ? '#80f2ffbb' : '#ffe1a7a8';
      ctx.lineWidth = 5; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.ellipse(0, -106, 66, 115, 0, -.8, .8); ctx.stroke(); ctx.shadowBlur = 0;
    }
    const bob = pose === 0 ? Math.sin(time * .003) * 1.5 : 0;
    if (f.ko) { ctx.rotate(-.62); ctx.translate(-28, 8); }
    ctx.drawImage(sprite, (pose % 3) * cellW, Math.floor(pose / 3) * cellH,
      cellW, cellH, -drawW / 2, -drawH + 12 + bob, drawW, drawH);
    if (f.flash > 0) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = Math.min(.65, f.flash * 2.5);
      ctx.fillStyle = '#ffe6a5';
      ctx.beginPath(); ctx.ellipse(0, -105, 36, 86, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    if (f.attack && f.attack.elapsed >= attacks[f.attack.type].windup * .6) {
      const special = f.attack.type === 'special';
      ctx.globalAlpha = Math.min(1, (attacks[f.attack.type].duration - f.attack.elapsed) * 4);
      ctx.strokeStyle = special ? '#ffe7a6' : f.profile.accent;
      ctx.lineWidth = special ? 11 : 6;
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(58, -123, special ? 122 : 89, -.75, .5); ctx.stroke();
    }
    ctx.restore();
  }
  function draw() {
    if (!canvas.width || !canvas.height) return;
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#08111d3b'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#06101c35'; ctx.fillRect(0, 300, W, 240);
    const t = performance.now();
    drawFighter(player, t);
    drawFighter(enemy, t);
    effects.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    draw();
    updateHud();
    if (phase === 'fight') renderCards();
    requestAnimationFrame(frame);
  }

  const keyActions = { a: 'left', d: 'right', w: 'jump', j: 'light', k: 'heavy', l: 'guard', u: 'special',
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'jump' };
  function press(action) {
    if (action === 'left' || action === 'right' || action === 'guard') held[action] = true;
    else if (action === 'jump') jump(player);
    else if (attacks[action]) attack(player, action);
  }
  function release(action) { if (action in held) held[action] = false; }
  window.addEventListener('keydown', event => {
    const action = keyActions[event.key];
    if (action) {
      event.preventDefault();
      if (!event.repeat) press(action);
    } else if (['1', '2', '3'].includes(event.key)) {
      event.preventDefault(); if (!event.repeat) playCard(Number(event.key) - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (phase === 'fight') pause();
      else if (phase === 'paused') $('start').click();
    }
  });
  window.addEventListener('keyup', event => { const action = keyActions[event.key]; if (action) release(action); });
  document.querySelectorAll('[data-action]').forEach(button => {
    const action = button.dataset.action;
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); button.setPointerCapture(event.pointerId); press(action);
    });
    button.addEventListener('pointerup', () => release(action));
    button.addEventListener('pointercancel', () => release(action));
    button.addEventListener('lostpointercapture', () => release(action));
  });
  resize();
  last = performance.now();
  renderCards();
  requestAnimationFrame(frame);
})();
