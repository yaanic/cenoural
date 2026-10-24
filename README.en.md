<p align="center">
  <img src="img/logo.png" alt="Cenoural" width="420">
</p>

<h3 align="center">Cenoural</h3>

<p align="center">
  An incremental pixel-art mining game that runs right in your browser.<br>
  Dig deeper, collect ores, upgrade your tools, and be reborn.
</p>

<p align="center">
  <a href="https://yaanic.github.io/cenoural/"><b>▶ Play now</b></a>
</p>

<p align="center">
  English · <a href="README.md">Português</a>
</p>

---

## About the game

You are a miner descending through layers of dirt, clay, stone, and ever harder rock. Every block gives you gold, and some drop ores. Climb back to the surface, sell what you carried, buy upgrades, and go back down to dig even deeper. When progress slows down, **be reborn** to earn permanent powers and start over stronger.

Nothing to install, no sign-up, and it works on desktop and mobile.

> **Languages:** the game is available in English and Brazilian Portuguese. Pick one on the title screen, in the pause menu, or in the **Menu** tab (it follows your browser language by default).

## How to play

1. **Dig:** pick a direction and hold **Space** (or the **Mine** button on mobile).
2. **Collect:** blocks give gold, and some drop ores that go into your backpack.
3. **Sell:** return to the surface (or use the teleport) and hand your backpack over at the chest.
4. **Upgrade:** spend your gold at the workbench and the shop to get deeper on every run.
5. **Watch your energy:** digging and flying use energy. If it runs out, you lose your backpack and return to the surface.
6. **Be reborn:** after 100 m, trade your run's progress for shards that buy permanent powers.

## Controls

| Key | Action |
| --- | --- |
| `Space` | Dig (and use the chest, furnace, board, and slot machine when nearby) |
| `W` `A` `S` `D` or arrow keys | Move and choose direction |
| `Shift` | Run |
| `E` / `R` | Use dynamite / switch dynamite type |
| `Q` | Teleport to the chest |
| `1` `2` | Skills |
| `M` | Open the map |
| `N` | Sound on or off |
| `Esc` or `P` | Pause |
| Scroll | Zoom |

On mobile, use the on-screen buttons (arrows, **Mine**, **Map**, and **Pause**) and tap the icons on the bar to use items and skills.

## Features

- 15 breakable layers (1500 m deep) and an unbreakable bedrock at the bottom
- Workbench with dozens of upgrades, different pickaxes, and an item shop
- Gradual unlocks: upgrades, shop items, the furnace, contracts board and slot machine unlock as your depth record grows (the buildings show up broken on the surface until then), with an on-screen notice and a hint about what comes next
- Ending at the bedrock: the golden carrot, then a choice between Rebirth and digging on
- Dynamite, hard-stone veins, and ore-rich veins
- Rare chests hidden underground, from common to legendary
- A furnace that refines ores, contracts with rewards, and a slot machine
- Levels, skills, and achievements
- Day and night cycle, seasons, weather (rain, storms, snow, fog), and shooting stars
- Map with zoom
- A new world every run, generated from a random seed
- Music and sound effects with volume controls

## Your progress

The game saves **only in the browser and on the device** you play on. If you clear your browser data, use a private window, or switch devices, your progress is lost. To back it up or move it elsewhere, open the **Menu** tab in the game and use **Exportar save** (export save); to restore it, use **Importar save** (import save).

## Made with AI

This game was created by **João Pedro Borges** with the help of artificial intelligence ([Claude](https://claude.ai), by Anthropic). Part of the code and content was generated with AI, under the author's direction and curation.

## License

© 2026 João Pedro Borges. **All rights reserved.**

The game may be played on the official site. Copying, hosting elsewhere, modifying, selling, or reusing the code and assets is **not allowed** without the author's prior written permission. Read the [full license](LICENSE.txt) (written in Portuguese).

## Credits

- Game, design, and direction: João Pedro Borges
- AI-assisted development: Claude (Anthropic)
- Font: [Silkscreen](https://fonts.google.com/specimen/Silkscreen) by Jason Kottke, SIL Open Font License

## Return gauge (energy to climb back)
One-time bench upgrade (Energy group, `BAL.ups.back`: 30,000 gold, unlocks at 150 m best depth, kept on rebirth). When owned, the existing energy bar gets effects only (no new text or numbers): a blue zone for the climb-back reserve (white marker at its end), a striped amber margin zone and a moving shine. Tight: bar and marker turn amber and pulse; not enough: the reserve turns red-striped and the bar shakes and glows red. Short sound when the state worsens. Tuning: `BAL.ups.back`, `BAL.energy.retMargin`, `retBlocks`. Lava damage is not included (the margin covers it).

## "Can afford" highlight
Each bench upgrade, shop item and the pickaxe show an **xN** badge next to the cost (how many levels/units your gold pays for). The cost gets a colored background and the number wobbles: green (1), yellow (2-9, faster), pink (10+, fastest). Shown even away from the bench. See `.up.can` and `upWob` in style.css.

## Enchantments and new return gauge look
**Fortune** (5 levels, unlocks at 120 m): +10% chance per level (cap 50%) that a mined ore gives extra units. **Refinement** (5 levels, unlocks at 180 m): on a manual critical hit, pickaxe side reach grows +1 block per level on each side for free (adds to Wide pickaxe). Both are in the "Enchantments" group on the bench.
