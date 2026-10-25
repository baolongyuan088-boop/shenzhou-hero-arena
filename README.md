# 神州英灵斗技场

独立于《大鱼吃小鱼》和《星轨回声》的手机/电脑网页格斗游戏。直接打开 `index.html` 即可玩；不需要联网或安装依赖。

## 玩法

从关羽、吕布、诸葛亮、项羽、花木兰、孙悟空、秦琼、尉迟恭、赵云、岳飞、李广、穆桂英十二位人间英灵中选一位，依次挑战雷公、刑天、共工。每战 90 秒，生命归零或时间结束时判定胜负。连胜三战通关。

开战前还可选一位原创契灵：赤霄提高攻击，玄甲降低所受伤害，青鸾提高战意获取。英雄与契灵的组合贯穿三战，绝技时出现契灵协战形象。这个搭档联动方向参考了《镇魂街》，人物、契灵名称与画面均为本游戏的原创设计。

- A/D 或左右箭头移动，W/上箭头跳跃，J 轻击，K 重击，L 格挡，U 绝技；绝技消耗 50 战意。
- 数字 1/2/3 打出战术卡；手机使用屏幕按钮和卡牌。
- 奇袭强化下一击；护阵短时间减伤；回春回复生命；雷令远程打击。使用后的卡位冷却，随后抽取下一张。
- 绝技击败对手时出现专属终结演出文案。人物、招式与视觉为本游戏的原创演绎；历史及神话人物名称不代表对其他作品角色造型的复制。

游戏玩法结合即时格斗、卡牌资源决策与人神擂台淘汰赛。当前为单人对电脑，不含联机、血腥处决或完整剧情。

## 资源

`assets/arena-v1.png` 是使用内置 imagegen 为本项目生成的原创擂台背景。提示词：`Original game background only, 16:9 wide cinematic side-view fighting arena inspired by ancient Chinese mythology and historical epics. A vast circular stone platform suspended above a sea of clouds, weathered bronze pillars with abstract patterns, distant mountains and storm light, human realm on the left in warm ember tones and celestial realm on the right in cool indigo. Clear empty playable foreground floor across the lower third, dramatic but not visually busy at the character level. Premium 2D painted game art with realistic materials and atmospheric depth. No people, no characters, no weapons, no written text, no logos, no copyrighted franchise visual references.`

十五名战斗角色的 `assets/*.png` 各是一张 1536×1024 的透明 3×2 动作图。每格按阅读顺序为待机、行走、轻击、重击或绝技、格挡、受击。浏览器裁切动作图，在战斗中按状态切换姿态；角色选择卡也显示角色图。它们是本项目生成的原创二维角色绘图，不是三维骨骼模型。

`assets/chixiao.png`、`assets/xuanjia.png`、`assets/qingluan.png` 是三位原创契灵的透明立绘，用于契灵选择和绝技协战。提示词要求单人全身、侧视、透明背景、半写实手绘、分别采用赤金火焰剑、玄黑青光盾、青玉羽翼长枪，且不模仿任何现成作品角色。

角色素材共用提示词：`Production-ready 2D side-view fighting game character sprite sheet on a genuinely transparent background. Exactly 3 columns and 2 rows of equal cells, six distinct full-body poses of the SAME character, all facing RIGHT, consistent costume, anatomy, face and weapon. Semi-realistic hand-painted game art with detailed materials, sharp readable silhouette, dramatic clean lighting, not pixel art and not chibi. Entire character and weapon inside each cell with generous margins; feet aligned near bottom of each cell. No grid lines, labels, text, floor, scenery, shadows, extra characters or duplicates inside a cell. Poses in reading order: ready idle stance; forward walking stride; fast horizontal attack; powerful overhead attack; guarded defensive stance; hurt recoil.` 每位角色另加其历史或神话形象、服饰、武器和配色描述。

GitHub 参考：[emollick/brush-and-blade](https://github.com/emollick/brush-and-blade)（MIT）。参考了它按格裁切角色动作图的技术方法；没有复制该项目的人物图片或代码。

契灵协战的玩法方向参考：[《镇魂街》授权游戏的共斗介绍](https://www.changyou.com/events/zhj/data/index.shtml)。仅借鉴人物与守护者并肩作战的抽象机制，没有使用其专有角色或美术。

## 检查

`node --test test.mjs`：验证动作图帧位读取、选角、契灵加成、出招命中范围、卡牌冷却、终结判定和三战通关。浏览器画面和真实手机操作仍需试玩验收。
