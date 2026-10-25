import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function boot(withSprites = false) {
  const elements = new Map();
  const handlers = new Map();
  const spriteDraws = [];
  const canvasContext = Object.fromEntries(['save', 'restore', 'translate', 'scale', 'beginPath', 'ellipse', 'fill', 'stroke', 'arc', 'rotate', 'fillText'].map(key => [key, () => {}]));
  canvasContext.drawImage = (...args) => spriteDraws.push(args);
  function node(id = '') {
    let html = '';
    const ownHandlers = new Map();
    return {
      id, style: {}, textContent: '', children: [], dataset: {},
      get innerHTML() { return html; },
      set innerHTML(value) { html = value; this.children = []; },
      classList: { add() {}, remove() {} },
      addEventListener(type, fn) { ownHandlers.set(type, fn); handlers.set(id + ':' + type, fn); },
      appendChild(child) { this.children.push(child); },
      getBoundingClientRect() { return { width: 960, height: 540 }; },
      getContext() { return canvasContext; },
      click() { ownHandlers.get('click')?.(); }
    };
  }
  const get = id => {
    if (!elements.has(id)) elements.set(id, node(id));
    return elements.get(id);
  };
  const context = {
    document: { getElementById: get, createElement: () => node('button'), querySelectorAll: () => [], addEventListener() {} },
    window: { addEventListener() {}, devicePixelRatio: 1 },
    performance: { now: () => 0 },
    requestAnimationFrame() {},
    Math,
    ...(withSprites ? { Image: class { complete = true; naturalWidth = 1536; naturalHeight = 1024; set src(value) { this.url = value; } } } : {})
  };
  const source = readFileSync(new URL('./game.js', import.meta.url), 'utf8').replace(
    /\}\)\(\);\s*$/,
    'globalThis.check = { startRound, attack, playCard, update, drawFighter, state: () => ({ phase, round, player, enemy, hand, selected, selectedSpirit }) };\n})();'
  );
  runInNewContext(source, context);
  return { game: context.check, elements, handlers, get, spriteDraws };
}

test('generated sheets are cropped to the correct battle pose', () => {
  const { game, spriteDraws } = boot(true);
  game.startRound();
  const { player } = game.state();
  game.drawFighter(player, 0);
  assert.deepEqual(spriteDraws.at(-1).slice(1, 5), [0, 0, 512, 512]);
  player.attack = { type: 'light', elapsed: .15 };
  game.drawFighter(player, 0);
  assert.deepEqual(spriteDraws.at(-1).slice(1, 5), [1024, 0, 512, 512]);
  player.attack = null;
  player.guard = true;
  game.drawFighter(player, 0);
  assert.deepEqual(spriteDraws.at(-1).slice(1, 5), [512, 512, 512, 512]);
});

test('twelve heroes are selectable and start launches the human versus god tournament', () => {
  const { game, get, handlers } = boot();
  assert.equal(get('roster').children.length, 12);
  assert.equal(get('spirits').children.length, 3);
  handlers.get('start:click')();
  assert.equal(game.state().phase, 'fight');
  assert.equal(game.state().player.profile.name, '关羽');
  assert.equal(game.state().enemy.profile.name, '雷公');
  assert.equal(get('cards').children.length, 3);
});

test('Qin Qiong can be selected with his own sprite and special move', () => {
  const { game, get } = boot();
  get('roster').children[6].click();
  game.startRound();
  assert.equal(game.state().player.profile.name, '秦琼');
  assert.equal(game.state().player.profile.sprite, 'qinqiong');
  assert.equal(game.state().player.profile.title, '双锏镇关');
});

test('all playable heroes, enemies and guardian spirits have PNG assets', () => {
  const names = ['guan', 'lvbu', 'zhuge', 'xiangyu', 'mulan', 'wukong', 'qinqiong', 'yuchi',
    'zhaoyun', 'yuefei', 'liguang', 'muguiying', 'leigong', 'xingtian', 'gonggong',
    'chixiao', 'xuanjia', 'qingluan'];
  for (const name of names) {
    const png = readFileSync(new URL('./assets/' + name + '.png', import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG', name);
    assert.equal(png[25], 6, name + ' needs an RGBA transparent canvas');
  }
});

test('spirit selection changes battle energy gain', () => {
  const { game, get } = boot();
  get('spirits').children[2].click();
  game.startRound();
  assert.equal(game.state().selectedSpirit, 2);
  const { player, enemy } = game.state();
  enemy.x = player.x + 80;
  game.attack(player, 'light');
  game.update(.12);
  assert.equal(player.energy, 12.5);
});

test('a light strike lands in range and misses from afar', () => {
  const { game } = boot();
  game.startRound();
  const { player, enemy } = game.state();
  enemy.x = player.x + 80;
  assert.equal(game.attack(player, 'light'), true);
  game.update(.12);
  assert.ok(enemy.hp < 100);
  const hp = enemy.hp;
  enemy.x = player.x + 400;
  game.update(.4);
  assert.equal(game.attack(player, 'light'), true);
  game.update(.12);
  assert.equal(enemy.hp, hp);
});

test('tactical cards heal and respect cooldown', () => {
  const { game } = boot();
  game.startRound();
  game.state().player.hp = 45;
  assert.equal(game.playCard(2), true);
  assert.equal(game.state().player.hp, 63);
  assert.equal(game.playCard(2), false);
  assert.ok(game.state().hand[2].cooldown > 0);
});

test('special finishing blow opens the next tournament round', () => {
  const { game } = boot();
  game.startRound();
  const { player, enemy } = game.state();
  enemy.x = player.x + 90;
  enemy.hp = 4;
  player.energy = 50;
  assert.equal(game.attack(player, 'special'), true);
  game.update(.31);
  assert.equal(game.state().phase, 'ending');
  game.update(1.6);
  assert.equal(game.state().phase, 'victory');
  game.startRound(1);
  assert.equal(game.state().enemy.profile.name, '刑天');
  game.startRound(2);
  const final = game.state();
  final.enemy.x = final.player.x + 90;
  final.enemy.hp = 4;
  final.player.energy = 50;
  game.attack(final.player, 'special');
  game.update(.31);
  game.update(1.6);
  assert.equal(game.state().phase, 'complete');
});
