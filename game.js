/*! Cenoural (c) 2026 João Pedro Borges. Todos os direitos reservados. Proibida a copia, modificacao ou redistribuicao sem autorizacao. Ver LICENSE.txt */
(()=>{
// ===== 0-idiomas/00-motor.js — Motor de idiomas: __("texto em português") devolve o texto no idioma ativo =====
// Como funciona: o texto escrito no código é o português (idioma de origem) e serve de chave. Cada idioma é um arquivo desta pasta
// (ex.: 20-en.js) que chama addLang(código, nome, {"texto em português":"translation"}). Texto sem tradução cai no português.
//   __("Nível {0}!",n)      parâmetros {0}, {1}...
//   "{0} item": n=>...      valor-função no arquivo do idioma = plural/gênero sob medida
//   N_("Cobre")             só marca o texto para a extração (dados guardados em português no save, traduzidos ao exibir)
//   data-i18n / data-i18n-attr  no index.html: traduz o conteúdo / os atributos (title, aria-label, placeholder) do elemento
// Adicionar um idioma:  python tools/i18n.py novo fr  ->  cria src/0-idiomas/30-fr.js com todas as chaves; traduza os valores e rode tools/build.py.
// Conferir o que falta:  python tools/i18n.py check
const LANGS={},LANG_KEY="cenoural-lang",LANG_SRC="pt-BR";
let LANG=LANG_SRC;
const i18nMiss=new Set(),langHooks=[];
function addLang(code,name,dict,opt){LANGS[code]=Object.assign({code,name,dict:dict||{},dec:","},opt)}
const N_=s=>s;
function __(s,...a){
 const L=LANGS[LANG];let r=L.dict[s];
 if(r===undefined||r===""){if(LANG!==LANG_SRC)i18nMiss.add(s);r=s}
 if(typeof r==="function")return r(...a);
 return a.length?r.replace(/\{(\d+)\}/g,(m,i)=>a[i]!==undefined?a[i]:m):r;
}
const ndec=x=>String(x).replace(".",LANGS[LANG].dec);   // separador decimal do idioma (vírgula no português)
const onLang=f=>{langHooks.push(f)};
const pickLang=c=>{c=String(c||"").toLowerCase();const ks=Object.keys(LANGS);return ks.find(k=>k.toLowerCase()===c)||ks.find(k=>k.toLowerCase().split("-")[0]===c.split("-")[0])};
function detectLang(){   // ?lang=en  >  escolha salva  >  idioma do navegador  >  português
 try{const q=pickLang(new URLSearchParams(location.search).get("lang"));if(q)return q}catch(e){}
 try{const s=localStorage.getItem(LANG_KEY);if(s&&LANGS[s])return s}catch(e){}
 for(const l of navigator.languages||[navigator.language]){const p=pickLang(l);if(p)return p}
 return LANG_SRC;
}
function applyStatic(){
 document.querySelectorAll("[data-i18n]").forEach(e=>{if(e._k===undefined)e._k=e.innerHTML.trim().replace(/\s+/g," ");e.innerHTML=__(e._k)});
 document.querySelectorAll("[data-i18n-attr]").forEach(e=>{if(!e._ka)e._ka=e.dataset.i18nAttr.split(",").map(a=>[a,e.getAttribute(a)]);e._ka.forEach(([a,k])=>e.setAttribute(a,__(k)))});
}
// Botões de idioma: cada [data-langs] vira uma fileira com um botão por idioma registrado (o nome aparece no próprio idioma).
function langButtons(){
 document.querySelectorAll("[data-langs]").forEach(box=>{box.innerHTML="";
  for(const c in LANGS){const b=document.createElement("button");b.type="button";b.dataset.lang=c;b.lang=c;b.innerHTML="<b></b><span></span>";b.firstChild.textContent=c.split("-")[0].toUpperCase();b.lastChild.textContent=LANGS[c].name;b.classList.toggle("on",c===LANG);b.onclick=()=>setLang(c,true);box.appendChild(b)}});
}
// Menu suspenso de idioma ([data-langmenu], usado na tela inicial): um botão com o idioma atual que abre a lista dos idiomas registrados.
const GLOBE='<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></g></svg>';
function closeLangMenus(){document.querySelectorAll(".langpick.open").forEach(x=>{x.classList.remove("open");x.firstChild.setAttribute("aria-expanded","false")})}
document.addEventListener("click",closeLangMenus);
document.addEventListener("keydown",e=>{const o=document.querySelector(".langpick.open");if(e.key==="Escape"&&o){e.stopPropagation();closeLangMenus();o.firstChild.focus()}},true);
function langMenus(){
 document.querySelectorAll("[data-langmenu]").forEach(box=>{
  box.classList.add("langpick");box.innerHTML="";
  const btn=document.createElement("button"),list=document.createElement("div");
  btn.type="button";btn.className="lp-btn";btn.setAttribute("aria-haspopup","listbox");btn.setAttribute("aria-expanded","false");
  list.className="lp-list";list.setAttribute("role","listbox");
  const close=()=>{box.classList.remove("open");btn.setAttribute("aria-expanded","false")};
  btn.onclick=e=>{e.stopPropagation();btn.setAttribute("aria-expanded",box.classList.toggle("open"))};
  for(const c in LANGS){const b=document.createElement("button");b.type="button";b.dataset.lang=c;b.lang=c;b.setAttribute("role","option");
   b.innerHTML="<b></b><span></span>";b.firstChild.textContent=c.split("-")[0].toUpperCase();b.lastChild.textContent=LANGS[c].name;
   b.onclick=e=>{e.stopPropagation();setLang(c,true);close();btn.focus()};list.appendChild(b)}
  box.append(btn,list);
 });
 langMenuLabel();
}
function langMenuLabel(){document.querySelectorAll(".lp-btn").forEach(b=>{b.innerHTML=GLOBE+"<span>Idioma / Language</span><em></em>";b.lastChild.textContent=LANGS[LANG].name})}
function setLang(code,keep){
 if(!LANGS[code])return;
 LANG=code;document.documentElement.lang=code;
 if(keep){try{localStorage.setItem(LANG_KEY,code)}catch(e){}}
 applyStatic();
 document.querySelectorAll("[data-lang]").forEach(b=>{b.classList.toggle("on",b.dataset.lang===code);b.setAttribute("aria-selected",b.dataset.lang===code)});langMenuLabel();
 langHooks.forEach(f=>f());
}
window.__textosSemTraducao=()=>[...i18nMiss];   // no console: o que o idioma atual ainda não traduz

// ===== 0-idiomas/10-pt-BR.js — Português (idioma de origem: os textos do código já estão em português, então o dicionário fica vazio) =====
addLang("pt-BR","Português",{});

// ===== 0-idiomas/20-en.js — English (traduza os valores; vazio = cai no português; dec = separador decimal) =====
addLang("en","English",{
// --- index.html
"OURO":"GOLD",
"PROFUNDIDADE":"DEPTH",
"ENERGIA":"ENERGY",
"Experiência do nível":"Level experience",
"Área de escavação":"Digging area",
"Nível":"Level",
"Progresso dentro da camada atual":"Progress through the current layer",
"Pausa":"Pause",
"Poderes de renascimento (comprados com fragmentos), Renascer, estatísticas e conquistas.":"Rebirth powers (bought with shards), Rebirth, stats and achievements.",
"Poderes de renascimento":"Rebirth powers",
"fragmentos":"shards",
"Renascer":"Rebirth",
"Estatísticas":"Statistics",
"Conquistas":"Achievements",
"Como jogar, controles, som e save. Toque num título para abrir ou fechar a seção.":"How to play, controls, sound and save. Tap a title to open or close its section.",
"Como jogar":"How to play",
"<b>Cave:</b> escolha a direção (<kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> ou setas) e segure <kbd>Espaço</kbd>.":"<b>Dig:</b> choose a direction (<kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrow keys) and hold <kbd>Space</kbd>.",
"<b>Junte:</b> cada bloco dá ouro e alguns soltam minérios, que vão para a mochila.":"<b>Collect:</b> every block gives gold and some drop ores, which go into your backpack.",
"<b>Venda:</b> suba até a superfície (ou use o teleporte <kbd>Q</kbd>) e entregue a mochila no baú.":"<b>Sell:</b> climb back to the surface (or use the teleport <kbd>Q</kbd>) and hand your backpack over at the chest.",
"<b>Melhore:</b> gaste o ouro na mesa de trabalho e na loja para descer mais a cada vez.":"<b>Upgrade:</b> spend your gold at the workbench and the shop to get deeper on every run.",
"<b>Cuidado com a energia:</b> cavar e voar gastam energia. Se acabar, você perde a mochila e volta à superfície.":"<b>Watch your energy:</b> digging and flying use energy. If it runs out, you lose your backpack and return to the surface.",
"<b>Renasça:</b> depois de 100 m, Renascer troca o progresso da vida por fragmentos, que compram poderes permanentes na aba Poder. Baús raros também podem dar fragmentos.":"<b>Be reborn:</b> after 100 m, Rebirth trades your run's progress for shards, which buy permanent powers in the Power tab. Rare chests can also give shards.",
"Teclado":"Keyboard",
"<kbd>Espaço</kbd>":"<kbd>Space</kbd>",
"Segure para cavar. Perto do baú, da fornalha, do quadro ou do caça-níquel, usa o objeto":"Hold to dig. Next to the chest, furnace, board or slot machine, it uses that object",
"Mover e escolher a direção (W = cima). Segure ↓ num buraco já cavado para cair de graça":"Move and pick a direction (W = up). Hold ↓ over a dug hole to fall for free",
"Correr":"Run",
"Dinamite":"Dynamite",
"Trocar o tipo de dinamite (vale com 2 ou mais tipos)":"Switch dynamite type (works with 2 or more types)",
"Comer a comida de peixe escolhida (botão direito no slot troca o tipo)":"Eat the selected fish food (right-click the slot to switch type)",
"Teleporte (compre em Melhorias)":"Teleport (buy it in Upgrades)",
"Fúria do Minerador (libera aos 50 m) e Escavação Frenética (aos 150 m)":"Miner's Fury (unlocks at 50 m) and Frenzied Digging (at 150 m)",
"Som ligado/desligado":"Sound on/off",
"Zoom do jogo":"Game zoom",
"Mouse":"Mouse",
"<kbd>Clique</kbd>":"<kbd>Click</kbd>",
"Num bloco ao lado do personagem: muda a direção":"On a block next to the character: changes direction",
"No baú, na fornalha, no quadro ou no caça-níquel (estando perto): usa":"On the chest, furnace, board or slot machine (when close): uses it",
"Nos ícones da barra: usa a dinamite, a habilidade, o teleporte, a comida ou a poção":"On the bar icons: uses dynamite, the skill, teleport, food or potion",
"<kbd>Botão direito</kbd>":"<kbd>Right click</kbd>",
"No ícone da dinamite: troca o tipo":"On the dynamite icon: switches type",
"Celular":"Mobile",
"Mover e escolher a direção":"Move and pick a direction",
"<kbd>Minerar</kbd>":"<kbd>Mine</kbd>",
"Segure para cavar (também usa baú, fornalha, quadro e caça-níquel quando perto)":"Hold to dig (also uses the chest, furnace, board and slot machine when close)",
"<kbd>Ícones</kbd>":"<kbd>Icons</kbd>",
"Toque nos ícones da barra para dinamite, habilidades, teleporte, comida e poções":"Tap the bar icons for dynamite, skills, teleport, food and potions",
"<kbd>Pausa</kbd>":"<kbd>Pause</kbd>",
"Botão no topo do painel":"Button at the top of the panel",
"Telas especiais":"Special screens",
"Caça-níquel":"Slot machine",
"<kbd>←</kbd> <kbd>→</kbd> ou <kbd>A</kbd> <kbd>D</kbd> mudam a aposta, <kbd>Espaço</kbd> ou <kbd>Enter</kbd> gira, <kbd>Esc</kbd> sai":"<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> change the bet, <kbd>Space</kbd> or <kbd>Enter</kbd> spins, <kbd>Esc</kbd> exits",
"Pesca":"Fishing",
"<kbd>Espaço</kbd> ou clique lança e fisga; segure <kbd>Espaço</kbd> para subir a barra verde; <kbd>Esc</kbd> sai":"<kbd>Space</kbd> or click casts and hooks; hold <kbd>Space</kbd> to raise the green bar; <kbd>Esc</kbd> exits",
"Fogueira":"Campfire",
"<kbd>Espaço</kbd> tira o peixe do fogo; <kbd>Esc</kbd> fecha (o peixe não se perde)":"<kbd>Space</kbd> takes the fish off the fire; <kbd>Esc</kbd> closes (the fish is not lost)",
"Baú do subsolo":"Underground chest",
"<kbd>Espaço</kbd>, <kbd>Enter</kbd> ou <kbd>Esc</kbd> avançam":"<kbd>Space</kbd>, <kbd>Enter</kbd> or <kbd>Esc</kbd> advance",
"Subir de nível":"Level up",
"<kbd>W A S D</kbd> ou setas escolhem, <kbd>Espaço</kbd> ou <kbd>Enter</kbd> confirma. Em 30 s o jogo escolhe por você":"<kbd>W A S D</kbd> or arrow keys choose, <kbd>Space</kbd> or <kbd>Enter</kbd> confirms. After 30 s the game picks for you",
"<kbd>W</kbd> <kbd>S</kbd> navegam, <kbd>Esc</kbd> ou <kbd>P</kbd> continuam":"<kbd>W</kbd> <kbd>S</kbd> navigate, <kbd>Esc</kbd> or <kbd>P</kbd> resume",
"Sem energia":"Out of energy",
"<kbd>Espaço</kbd>, <kbd>Enter</kbd> ou <kbd>Esc</kbd> voltam a cavar":"<kbd>Space</kbd>, <kbd>Enter</kbd> or <kbd>Esc</kbd> go back to digging",
"Superfície":"Surface",
"Da esquerda para a direita:":"From left to right:",
"<b>Cama:</b> salva o jogo e abre este menu.":"<b>Bed:</b> saves the game and opens this menu.",
"<b>Mesa de trabalho:</b> compre melhorias.":"<b>Workbench:</b> buy upgrades.",
"<b>Fornalha:</b> leve os minérios, ela refina com o tempo e vende sozinha por mais ouro. Melhore a velocidade na mesa.":"<b>Furnace:</b> drop off your ores; it refines them over time and sells them on its own for extra gold. Upgrade its speed at the workbench.",
"<b>Buraco:</b> a entrada da mina.":"<b>Hole:</b> the mine entrance.",
"<b>Caça-níquel:</b> aposte uma parte do seu ouro. A casa ganha no longo prazo.":"<b>Slot machine:</b> bet part of your gold. The house wins in the long run.",
"<b>Baú:</b> fique ao lado dele e clique (ou aperte <kbd>Espaço</kbd>) para vender a mochila.":"<b>Chest:</b> stand next to it and click (or press <kbd>Space</kbd>) to sell your backpack.",
"<b>Loja:</b> dinamite e comida de energia.":"<b>Shop:</b> dynamite and energy food.",
"<b>Riacho e praia:</b> perto da água, aperte <kbd>Espaço</kbd> (ou clique) para lançar a vara: a câmera dá zoom na água e a pesca acontece ali mesmo. Quando aparecer um <b>!</b>, aperte <kbd>Espaço</kbd>; depois segure <kbd>Espaço</kbd> para manter o peixe na barra verde. <kbd>Esc</kbd> sai da pesca.":"<b>Stream and beach:</b> near the water, press <kbd>Space</kbd> (or click) to cast the rod: the camera zooms in on the water and the fishing happens right there. When a <b>!</b> appears, press <kbd>Space</kbd>; then hold <kbd>Space</kbd> to keep the fish inside the green bar. <kbd>Esc</kbd> leaves fishing.",
"<b>Fogueira:</b> asse os peixes no ponto certo e ganhe comida de energia. Os peixes também podem ser vendidos na carrocinha da loja.":"<b>Campfire:</b> roast fish to just the right point and get energy food. Fish can also be sold at the shop cart.",
"<b>Quadro de contratos:</b> missões que pagam ouro e XP.":"<b>Contract board:</b> missions that pay gold and XP.",
"Energia":"Energy",
"Subir com a mochila a jato gasta mais que cavar.":"Flying up with the jetpack costs more than digging.",
"Comece a subir quando a energia chegar a 25%.":"Start heading up when your energy reaches 25%.",
"O teleporte leva ao baú sem gastar energia. A <b>Poção de teleporte</b> (só cai de baús) faz o mesmo uma vez, sem precisar da melhoria.":"Teleport takes you to the chest without spending energy. The <b>Teleport potion</b> (only found in chests) does the same once, with no upgrade needed.",
"Comida de energia (da loja) fica na barra e recupera energia no subsolo.":"Energy food (from the shop) sits on the bar and restores energy underground.",
"Na superfície a energia se recupera sozinha.":"On the surface, energy recovers by itself.",
"Bom saber":"Good to know",
"Veios de <b>pedra dura</b> só quebram com dinamite.":"<b>Hard stone</b> veins only break with dynamite.",
"<b>Veios de minério</b> são raros: manchas de blocos brilhantes que rendem vários minérios cada.":"<b>Ore veins</b> are rare: patches of shiny blocks that each yield several ores.",
"Há <b>baús raros</b> escondidos no subsolo, e o visual mostra a raridade: madeira (comum), ferro (incomum), ouro (raro), roxo (épico) e obsidiana (lendário). Dão ouro, XP, itens, minérios, fragmentos, poções de teleporte e, às vezes, um bônus de melhoria como os de subir de nível.":"There are <b>rare chests</b> hidden underground, and their look shows the rarity: wood (common), iron (uncommon), gold (rare), purple (epic) and obsidian (legendary). They give gold, XP, items, ores, shards, teleport potions and, sometimes, an upgrade bonus like the level-up ones.",
"De <b>noite</b> a superfície escurece (o vagalume brilha mais) e descer dá um pouco mais de XP.":"At <b>night</b> the surface gets dark (the firefly glows brighter) and descending gives a bit more XP.",
"<b>Estrelas cadentes</b> aparecem raramente à noite e dão ouro ou sorte por um tempo.":"<b>Shooting stars</b> rarely appear at night and grant gold or luck for a while.",
"<b>Liberação gradual:</b> o jogo começa com poucas melhorias e itens, e a fornalha, o quadro de contratos e o caça-níquel só aparecem depois. Tudo vai sendo liberado conforme o seu <b>recorde de profundidade</b>, com um aviso dourado na tela, e a dica no topo das Melhorias mostra o que vem a seguir. O que já foi liberado não some ao Renascer.":"<b>Gradual unlocks:</b> the game starts with few upgrades and items, and the furnace, the contract board, and the slot machine only show up later. Everything unlocks as your <b>depth record</b> grows, with a golden notice on screen, and the hint at the top of Upgrades shows what comes next. Whatever you unlocked is kept when you are reborn.",
"Cada mundo novo (jogo novo ou Renascer) usa uma semente aleatória.":"Every new world (new game or Rebirth) uses a random seed.",
"Sobre o save":"About the save",
"Seu progresso fica salvo <b>só neste navegador e neste aparelho</b>. Se você limpar os dados do navegador, usar aba anônima ou trocar de aparelho, o progresso some. Para guardar ou levar para outro lugar, use <b>Exportar save</b> abaixo e guarde o texto.":"Your progress is saved <b>only in this browser on this device</b>. If you clear your browser data, use a private window or switch devices, your progress is gone. To keep it or move it elsewhere, use <b>Export save</b> below and store the text.",
"Créditos":"Credits",
"Criado por <b>João Pedro Borges</b> com auxílio de <b>inteligência artificial</b> (Claude, da Anthropic): parte do código e do conteúdo do jogo foi gerada com IA.<br>Fonte: Silkscreen (Jason Kottke, licença SIL OFL).":"Created by <b>João Pedro Borges</b> with the help of <b>artificial intelligence</b> (Claude, by Anthropic): part of the game's code and content was generated with AI.<br>Font: Silkscreen (Jason Kottke, SIL OFL license).",
"© 2026 João Pedro Borges. Todos os direitos reservados.":"© 2026 João Pedro Borges. All rights reserved.",
"Áudio":"Audio",
"Música":"Music",
"Efeitos":"Effects",
"Ambiente":"Ambience",
"Texto do save: exporte ou cole aqui para importar":"Save text: export, or paste here to import",
"Exportar save":"Export save",
"Importar save":"Import save",
"Apagar progresso":"Erase progress",
"Jogar":"Play",
"© 2026 João Pedro Borges · Todos os direitos reservados<br>Feito com auxílio de inteligência artificial · Seu progresso fica salvo só neste navegador":"© 2026 João Pedro Borges · All rights reserved<br>Made with the help of artificial intelligence · Your progress is saved only in this browser",
// --- 1-nucleo/00-balanceamento.js
"Comum":"Common",
"Incomum":"Uncommon",
"Raro":"Rare",
"Épico":"Epic",
"Lendário":"Legendary",
// --- 1-nucleo/02-camadas-minerios.js
"Terra":"Dirt",
"Argila":"Clay",
"Areia e cascalho":"Sand and gravel",
"Calcário":"Limestone",
"Arenito":"Sandstone",
"Xisto":"Shale",
"Carvão mineral":"Coal",
"Granito":"Granite",
"Basalto":"Basalt",
"Gnaisse":"Gneiss",
"Quartzito":"Quartzite",
"Mármore":"Marble",
"Magma solidificado":"Solidified magma",
"Cristais profundos":"Deep crystals",
"Vidro vulcânico":"Volcanic glass",
"Rocha-mãe":"Bedrock",
"Madeira":"Wood",
"Pedra":"Stone",
"Ferro":"Iron",
"Bronze":"Bronze",
"Aço":"Steel",
"Ouro":"Gold",
"Diamante":"Diamond",
"Mithril":"Mithril",
"Adamante":"Adamantite",
"Obsidiana":"Obsidian",
"Titânio":"Titanium",
"Estelar":"Stellar",
"Cósmica":"Cosmic",
"Abissal":"Abyssal",
"Primordial":"Primordial",
"Cobre":"Copper",
"Rubi":"Ruby",
"Esmeralda":"Emerald",
"Safira":"Sapphire",
"Ametista":"Amethyst",
"Topázio":"Topaz",
"Opala negra":"Black opal",
"Cristal do abismo":"Abyss crystal",
"Lambari":"Tetra",
"Tilápia":"Tilapia",
"Bagre":"Catfish",
"Traíra":"Wolf fish",
"Truta":"Trout",
"Dourado":"Golden dorado",
"Peixe-cenoura":"Carrot fish",
"Sardinha":"Sardine",
"Tainha":"Mullet",
"Robalo":"Sea bass",
"Atum":"Tuna",
"Lagosta":"Lobster",
"Peixe-espada":"Swordfish",
"Peixe-lua":"Moonfish",
// --- 1-nucleo/04-formulas.js
"Explode uma área de raio {0}. Gasta {1} blocos de energia; recarga de {2} s. Também quebra os veios de pedra dura":"Blasts an area of radius {0}. Costs {1} blocks of energy; {2} s cooldown. Also breaks hard stone veins",
"Explode uma área de raio {0}. Mais forte que a anterior; gasta {1} blocos de energia; recarga de {2} s. Também quebra os veios de pedra dura":"Blasts an area of radius {0}. Stronger than the previous one; costs {1} blocks of energy; {2} s cooldown. Also breaks hard stone veins",
"Dinamite reforçada":"Reinforced dynamite",
"Dinamite pesada":"Heavy dynamite",
"Carga de nitro":"Nitro charge",
"Bomba de demolição":"Demolition bomb",
"Cenourinha":"Little carrot",
"Recupera 10% da energia máxima. Só se colhe no bosque":"Restores 10% of max energy. Only found in the grove",
"Sopa de cogumelo":"Mushroom soup",
"Recupera 25% da energia máxima. Só se faz no caldeirão da igreja":"Restores 25% of max energy. Only made in the church cauldron",
"Poção de energia":"Energy potion",
"Recupera 50% da energia máxima. Só se faz no caldeirão da igreja":"Restores 50% of max energy. Only made in the church cauldron",
"Poção de teleporte":"Teleport potion",
"Uso único: leva ao baú sem gastar energia (na superfície, volta ao ponto de onde saiu). Cai de baús ou se faz no caldeirão da igreja":"Single use: takes you to the chest without spending energy (on the surface, returns you to where you left from). Drops from chests or is made in the church cauldron",
"Peixe assado":"Roasted fish",
"Recupera 20% da energia máxima. Só se faz na fogueira":"Restores 20% of max energy. Only made at the campfire",
"Peixe grelhado":"Grilled fish",
"Recupera 45% da energia máxima. Só se faz na fogueira":"Restores 45% of max energy. Only made at the campfire",
"Cogumelo":"Mushroom",
"Ingrediente: {0} cogumelos viram 1 Sopa de cogumelo no caldeirão da igreja":"Ingredient: {0} mushrooms make 1 Mushroom soup in the church cauldron",
"Banquete do pescador":"Fisherman's feast",
"Recupera 85% da energia máxima. Só se faz na fogueira":"Restores 85% of max energy. Only made at the campfire",
"Fornalha":"Furnace",
"Quadro de contratos":"Contract board",
"NOVIDADE LIBERADA":"NEW UNLOCK",
"e mais {0}":"and {0} more",
"Próxima novidade aos {0} m: {1}":"Next unlock at {0} m: {1}",
// --- 1-nucleo/05-audio-avisos.js
"Clima: {0}":"Weather: {0}",
"Estação: {0}":"Season: {0}",
"Cenoura! Ouro e energia infinitos":"Carrot! Infinite gold and energy",
"Cenoura desligada":"Carrot off",
// --- 2-sistemas/01-melhorias.js
"{0} blocos":"{0} blocks",
"Afiar picareta":"Sharpen pickaxe",
"+12% de dano da picareta por nível":"+12% pickaxe damage per level",
"Velocidade de escavação":"Digging speed",
"+5% de velocidade de escavação por nível":"+5% dig speed per level",
"Chance de golpe crítico":"Critical hit chance",
"+{0}% de chance de crítico (dano x3) por nível, até {1}%":"+{0}% crit chance (x3 damage) per level, up to {1}%",
"Energia máxima":"Max energy",
"+30 de energia máxima por nível":"+30 max energy per level",
"Economia de energia":"Energy saving",
"-5% de gasto de energia por nível (cumulativo). Gasto atual: {0}%":"-5% energy spent per level (cumulative). Current spend: {0}%",
"Eficiência da mochila a jato":"Jetpack efficiency",
"-5% de energia gasta no jato por nível (cumulativo). Gasto atual: {0}%":"-5% jetpack energy spent per level (cumulative). Current spend: {0}%",
"Velocidade da mochila a jato":"Jetpack speed",
"+10% de velocidade do jato por nível":"+10% jetpack speed per level",
"Resistência à lava":"Lava resistance",
"-10% do dano da lava por nível. Agora: {0}% (próximo: {1}%)":"-10% lava damage per level. Now: {0}% (next: {1}%)",
"-10% do dano da lava por nível. Agora: {0}%":"-10% lava damage per level. Now: {0}%",
"Escavação automática":"Auto digging",
"Quebra o bloco à frente sozinho: +0,25 golpe/s por nível. Gasta metade da energia, mas é mais fraco":"Breaks the block ahead by itself: +0.25 hits/s per level. Half the energy, but weaker",
"Força da escavação automática":"Auto-dig power",
"+10% de dano dos golpes automáticos por nível":"+10% damage on automatic hits per level",
"Sorte para ouro e minérios":"Luck for gold and ores",
"+12% de ouro e +2% de chance de minério por nível":"+12% gold and +2% ore chance per level",
"Ganho de experiência":"Experience gain",
"+10% de experiência por nível":"+10% experience per level",
"Duração das habilidades":"Skill duration",
"+5% de duração da Fúria e da Frenética por nível":"+5% Fury and Frenzy duration per level",
"Potência da Fúria do Minerador":"Miner's Fury power",
"Dano: x{0} (próximo: x{1}). Recarga: {2} s":"Damage: x{0} (next: x{1}). Cooldown: {2} s",
"Dano: x{0}. Recarga: {1} s":"Damage: x{0}. Cooldown: {1} s",
"Potência da Escavação Frenética":"Frenzied Digging power",
"Velocidade: x{0} (próximo: x{1}). Recarga: {2} s":"Speed: x{0} (next: x{1}). Cooldown: {2} s",
"Velocidade: x{0}. Recarga: {1} s":"Speed: x{0}. Cooldown: {1} s",
"Lanterna":"Lantern",
"Mais luz no escuro: {0} (próximo: {1})":"More light in the dark: {0} (next: {1})",
"Mais luz no escuro: {0}":"More light in the dark: {0}",
"Vagalume companheiro":"Firefly companion",
"Vagalume que ilumina o escuro: {0} (próximo: {1})":"Firefly that lights the dark: {0} (next: {1})",
"Vagalume que ilumina o escuro: {0}":"Firefly that lights the dark: {0}",
"Velocidade da fornalha":"Furnace speed",
"Refina {0} minérios/s (próximo: {1}). Refinado vale +{2}% de ouro":"Refines {0} ores/s (next: {1}). Refined ore: +{2}% gold",
"Refina {0} minérios/s. Refinado vale +{1}% de ouro":"Refines {0} ores/s. Refined ore: +{1}% gold",
"Melhoria de minérios":"Ore improvement",
"{0}% de chance de minério render extras (+1 a +{1}). Próximo: {2}%":"{0}% chance of extra ore (+1 to +{1}). Next: {2}%",
"{0}% de chance de minério render extras (+1 a +{1})":"{0}% chance of extra ore (+1 to +{1})",
"Vara de pesca":"Fishing rod",
"Zona verde da pesca: {0}% da pista (próximo: {1}%)":"Fishing green zone: {0}% of the track (next: {1}%)",
"Zona verde da pesca: {0}% da pista":"Fishing green zone: {0}% of the track",
"Isca":"Bait",
"Peixe morde {0}% mais rápido; raros {1}% mais (próximo: {2}% e {3}%)":"Fish bite {0}% faster; rare fish {1}% more (next: {2}% and {3}%)",
"Peixe morde {0}% mais rápido; raros {1}% mais":"Fish bite {0}% faster; rare fish {1}% more",
"Medidor de retorno":"Return gauge",
"Marca na barra de energia a reserva para voltar e pulsa quando fica apertada. Compra única":"Marks the energy needed to return on the bar and pulses when tight. One-time purchase",
"Comprado: a barra mostra a reserva para voltar e avisa quando fica apertada":"Bought: the bar shows the reserve to return and warns when tight",
"Relógio":"Clock",
"Relógio de sol e lua na barra do topo (o dia dura {0} min)":"Sun-and-moon clock on the top bar (a day lasts {0} min)",
"Comprado: hora do dia na barra do topo (passe o mouse para ver o período)":"Bought: time of day on the top bar (hover for the period)",
"Teleporte":"Teleport",
"Teleporte ao baú sem gastar energia; na superfície, volta de onde saiu":"Teleports to the chest for free; on the surface, returns you to where you left",
"Recarga: {0} s ({1} s no próximo)":"Cooldown: {0} s ({1} s next)",
"Recarga: {0} s":"Cooldown: {0} s",
"Nova picareta: {0}":"New pickaxe: {0}",
"Sem {0}: compre na loja (na superfície)":"No {0}: buy some at the shop (on the surface)",
"Na superfície a energia já se recupera sozinha":"On the surface, energy recovers by itself",
"Energia já está cheia":"Energy is already full",
"{0}: +{1} de energia":"{0}: +{1} energy",
// --- 2-sistemas/02-energia-mochila.js
"Leve <b>comida de energia</b> (cenourinha do bosque, sopa e poção do caldeirão, peixe da fogueira): ela fica na barra ao lado das habilidades e recupera energia no subsolo.":"Bring <b>energy food</b> (carrots from the grove, soup and potions from the cauldron, fish from the campfire): it sits on the bar next to the skills and restores energy underground.",
"Melhore a <b>Energia máxima</b> na mesa de trabalho para ir mais fundo em cada descida.":"Upgrade your <b>Max energy</b> at the workbench to go deeper on every descent.",
"O <b>Teleporte</b> leva ao baú sem gastar energia: ótimo para voltar com a mochila cheia.":"<b>Teleport</b> takes you to the chest without spending energy: great for coming back with a full backpack.",
"Comece a subir quando a energia chegar a 25%: subir com a mochila a jato gasta mais.":"Start heading up when your energy reaches 25%: flying up with the jetpack costs more.",
"SEM ENERGIA":"OUT OF ENERGY",
"Você apagou e a mochila ficou para trás.":"You passed out and your backpack was left behind.",
"Você apagou e voltou à superfície.":"You passed out and returned to the surface.",
"PROFUNDIDADE · {0}":"DEPTH · {0}",
"RECORDE":"RECORD",
"OURO PERDIDO":"GOLD LOST",
"ITENS PERDIDOS":"ITEMS LOST",
"Voltar a cavar":"Back to digging",
"Você apagou! Perdeu {0} itens ({1} de ouro)":"You passed out! Lost {0} items ({1} gold)",
"Você apagou e voltou à superfície":"You passed out and returned to the surface",
"Vendido: +{0}":"Sold: +{0}",
"Mochila vazia: nada para vender.":"Backpack empty: nothing to sell.",
"Sem Poção de teleporte":"No Teleport potion",
"Teleporte: use no subsolo para subir ao baú":"Teleport: use it underground to go up to the chest",
// --- 2-sistemas/03-nivel-xp.js
"Dano da picareta":"Pickaxe damage",
"+15% de dano":"+15% damage",
"Velocidade de ataque":"Attack speed",
"+10% de velocidade ao minerar":"+10% speed while mining",
"+10% de duração":"+10% duration",
"Ouro extra":"Extra gold",
"+12% de ouro":"+12% gold",
"+8% de energia máxima":"+8% max energy",
"Velocidade de movimento":"Movement speed",
"+10% de velocidade":"+10% speed",
"+10% de experiência":"+10% experience",
"Rara":"Rare",
"Épica":"Epic",
"Lendária":"Legendary",
"Nível {0}!":"Level {0}!",
"Nível {0}":"Level {0}",
"Escolha uma melhoria · {0} s":"Choose an upgrade · {0} s",
"nv {0} → {1}":"lv {0} → {1}",
// --- 2-sistemas/04-habilidades.js
"Herança de ouro":"Gold inheritance",
"Começa cada vida com 400 x nível² de ouro":"Start each life with 400 x level² gold",
"Picareta herdada":"Inherited pickaxe",
"Começa cada vida com a picareta do tipo de nível igual ao nível deste poder":"Start each life with the pickaxe tier equal to this power's level",
"Veia eterna":"Eternal vein",
"+8% de ouro por nível":"+8% gold per level",
"Músculos do abismo":"Abyss muscles",
"+8% de dano da picareta por nível":"+8% pickaxe damage per level",
"Fôlego eterno":"Eternal breath",
"+6% de energia máxima por nível":"+6% max energy per level",
"Pulmões de jato":"Jet lungs",
"-6% da energia gasta ao subir com o jato por nível":"-6% of the energy spent flying up with the jetpack per level",
"Faro de minério":"Ore nose",
"+2% de chance de minério por nível":"+2% ore chance per level",
"Sabedoria antiga":"Ancient wisdom",
"Fúria do Minerador":"Miner's Fury",
"Dano maior":"More damage",
"Escavação Frenética":"Frenzied Digging",
"Cava mais rápido":"Digs faster",
"Dano x{0} por {1} s (recarga {2} s; efeito reduzido quando combinada)":"Damage x{0} for {1} s ({2} s cooldown; reduced when combined)",
"Cava x{0} mais rápido por {1} s (recarga {2} s; efeito reduzido quando combinada)":"Digs x{0} faster for {1} s ({2} s cooldown; reduced when combined)",
"Habilidade ativada: {0}":"Skill activated: {0}",
"Dinamite escolhida: {0}":"Dynamite selected: {0}",
"Sem dinamite: compre na loja (na superfície)":"No dynamite: buy some at the shop (on the surface)",
"Nada para explodir aqui":"Nothing to blow up here",
"{0}: {1} blocos · +{2}":"{0}: {1} blocks · +{2}",
"Primeiros passos":"First steps",
"Chegue a 10 m":"Reach 10 m",
"Subsolo":"Underground",
"50 m":"50 m",
"Centenário":"Centennial",
"100 m":"100 m",
"Abismo":"Abyss",
"300 m":"300 m",
"Coração do abismo":"Heart of the abyss",
"Chegue ao fundo (1500 m)":"Reach the bottom (1500 m)",
"Garimpeiro":"Prospector",
"50 minérios":"50 ores",
"Mina de ouro":"Gold mine",
"500 minérios":"500 ores",
"Magnata":"Tycoon",
"1M de ouro no total":"1M gold in total",
"Primeira venda":"First sale",
"Venda itens no baú":"Sell items at the chest",
"Quase lá":"Almost there",
"Apague de energia uma vez":"Run out of energy once",
"Picareta de ouro":"Golden pickaxe",
"Compre a picareta de Ouro":"Buy the Gold pickaxe",
"Renascido":"Reborn",
"Use Renascer":"Use Rebirth",
"Cavador de verdade":"Real digger",
"Chegue a 200 m":"Reach 200 m",
"Meia-descida":"Halfway down",
"500 m":"500 m",
"Metade do caminho":"Halfway there",
"750 m":"750 m",
"Mil metros":"A thousand meters",
"1000 m":"1000 m",
"Calor do magma":"Magma heat",
"1200 m":"1200 m",
"Beira do fim":"Edge of the end",
"1400 m":"1400 m",
"Colecionador":"Collector",
"Descubra 5 minérios diferentes":"Discover 5 different ores",
"Catálogo completo":"Complete catalog",
"Descubra todos os minérios":"Discover every ore",
"Brilho de diamante":"Diamond shine",
"Encontre um Diamante":"Find a Diamond",
"Luz do abismo":"Light of the abyss",
"Encontre um Cristal do abismo":"Find an Abyss crystal",
"Veia inesgotável":"Endless vein",
"5000 minérios":"5000 ores",
"Bilionário":"Billionaire",
"1B de ouro no total":"1B gold in total",
"Trilionário":"Trillionaire",
"1T de ouro no total":"1T gold in total",
"Britadeira":"Jackhammer",
"Quebre 1000 blocos":"Break 1000 blocks",
"Máquina de escavar":"Digging machine",
"Quebre 100 mil blocos":"Break 100 thousand blocks",
"Ferreiro":"Blacksmith",
"Compre a picareta de Ferro":"Buy the Iron pickaxe",
"Mãos de diamante":"Diamond hands",
"Compre a picareta de Diamante":"Buy the Diamond pickaxe",
"Lenda das picaretas":"Pickaxe legend",
"Tenha a picareta Primordial":"Own the Primordial pickaxe",
"Ao máximo":"Maxed out",
"Deixe uma melhoria no nível máximo":"Max out one upgrade",
"Arsenal completo":"Full arsenal",
"Todas as melhorias no nível máximo":"Max out all upgrades",
"Teleportado":"Teleported",
"Desbloqueie o teleporte":"Unlock teleport",
"Teimoso":"Stubborn",
"Apague de energia 10 vezes":"Run out of energy 10 times",
"Banquete":"Feast",
"Coma 20 itens de energia":"Eat 20 energy items",
"Pavio curto":"Short fuse",
"Use 10 dinamites":"Use 10 dynamites",
"Demolidor":"Demolisher",
"Use 100 dinamites":"Use 100 dynamites",
"Viajante":"Traveler",
"Use o teleporte 10 vezes":"Use teleport 10 times",
"Pedra no sapato":"Rock in your shoe",
"Quebre 20 pedras duras":"Break 20 hard stones",
"Veterano":"Veteran",
"Chegue ao nível 10":"Reach level 10",
"Experiente":"Experienced",
"Nível 25":"Level 25",
"Nível 50":"Level 50",
"Ciclo":"Cycle",
"Renasça 3 vezes":"Be reborn 3 times",
"Eterno":"Eternal",
"Renasça 10 vezes":"Be reborn 10 times",
"Comerciante":"Merchant",
"Venda no baú 25 vezes":"Sell at the chest 25 times",
"Atacadista":"Wholesaler",
"Venda no baú 250 vezes":"Sell at the chest 250 times",
"Boa noite":"Good night",
"Salve o jogo na cama":"Save the game at the bed",
"Sono pesado":"Deep sleeper",
"Deite na cama 20 vezes":"Lie in the bed 20 times",
"Companhia":"Company",
"Chame o vagalume":"Call the firefly",
"Despensa cheia":"Full pantry",
"Tenha 99 de algum item da loja":"Have 99 of any shop item",
"Fornalha acesa":"Furnace lit",
"Refine 1 minério na fornalha":"Refine 1 ore in the furnace",
"Mestre ferreiro":"Master smith",
"Refine 1000 minérios":"Refine 1000 ores",
"Empreiteiro":"Contractor",
"Entregue 10 contratos":"Deliver 10 contracts",
"Na sorte":"Lucky",
"Jogue na mesa de apostas":"Play at the slot machine",
"Viciado":"Addicted",
"Jogue 100 vezes na mesa de apostas":"Play the slot machine 100 times",
"Caçador de tesouros":"Treasure hunter",
"Abra um baú no subsolo":"Open an underground chest",
"Baú épico":"Epic chest",
"Abra um baú Épico ou melhor":"Open an Epic chest or better",
"Sorte lendária":"Legendary luck",
"Abra um baú Lendário":"Open a Legendary chest",
"Caça-baús":"Chest hunter",
"Abra 10 baús":"Open 10 chests",
"Rei dos baús":"King of chests",
"Abra 100 baús":"Open 100 chests",
"Coleção completa":"Full collection",
"Abra um baú de cada raridade":"Open one chest of each rarity",
"Chuva de ouro":"Golden rain",
"Abra 5 baús Lendários":"Open 5 Legendary chests",
"Presente dos baús":"Chest gifts",
"Ganhe 10 bônus de melhoria de baús":"Get 10 upgrade bonuses from chests",
"Colecionador de cacos":"Shard collector",
"Ache 10 fragmentos em baús":"Find 10 shards in chests",
"Viajante de bolso":"Pocket traveler",
"Use 5 poções de teleporte":"Use 5 teleport potions",
"Primeira fisgada":"First catch",
"Pesque seu primeiro peixe":"Catch your first fish",
"Pescador":"Angler",
"Pesque 25 peixes":"Catch 25 fish",
"Mestre das águas":"Master of the waters",
"Pesque 150 peixes":"Catch 150 fish",
"Mão firme":"Steady hand",
"Faça uma pescaria perfeita":"Make a perfect catch",
"Álbum completo":"Complete album",
"Descubra todas as espécies de peixe":"Discover every fish species",
"Lenda das águas":"Legend of the waters",
"Pesque um peixe lendário":"Catch a legendary fish",
"Churrasqueiro":"Grill master",
"Asse 10 peixes na fogueira":"Roast 10 fish at the campfire",
"Ponto perfeito":"Perfectly done",
"Asse um peixe no ponto perfeito":"Roast a fish to the perfect point",
"Horta dourada":"Golden Garden",
"Deixe todas as cenouras da horta douradas":"Turn every carrot in the garden golden",
"{0} CONQUISTAS":"{0} ACHIEVEMENTS",
"CONQUISTA":"ACHIEVEMENT",
// --- 2-sistemas/05-noite-estrelas.js
"Estrela cadente! Minérios x{0} por {1}s":"Shooting star! Ores x{0} for {1}s",
"Estrela cadente! Ouro x{0} por {1}s":"Shooting star! Gold x{0} for {1}s",
"O brilho da estrela se apagou":"The star's glow faded",
"Noite · +{0}% XP":"Night · +{0}% XP",
"Sorte estelar · minérios x{0}":"Star luck · ores x{0}",
"Chuva de ouro · ouro x{0}":"Golden rain · gold x{0}",
// --- 2-sistemas/06-fornalha.js
"Fornalha: +{0} minérios":"Furnace: +{0} ores",
"Fornalha carregada: {0} minérios · pronta em {1}":"Furnace loaded: {0} ores · ready in {1}",
"Refinado: +{0}":"Refined: +{0}",
"Fornalha: {0} minérios refinados · +{1} de ouro":"Furnace: {0} ores refined · +{1} gold",
"Só há pedra comum na mochila: ela vai para o baú.":"Only plain stone in the backpack: it goes to the chest.",
"Sem minérios na mochila para pôr na fornalha.":"No ores in the backpack to put in the furnace.",
// --- 2-sistemas/07-estacoes.js
"Primavera":"Spring",
"Chegou a primavera!":"Spring has arrived!",
"Verão":"Summer",
"Chegou o verão!":"Summer has arrived!",
"Outono":"Autumn",
"Chegou o outono!":"Autumn has arrived!",
"Inverno":"Winter",
"Chegou o inverno!":"Winter has arrived!",
// --- 2-sistemas/08-clima.js
"Céu limpo":"Clear sky",
"O tempo abriu":"The weather cleared up",
"Nublado":"Cloudy",
"O céu fechou":"The sky clouded over",
"Chuva":"Rain",
"Começou a chover":"It started to rain",
"Tempestade":"Storm",
"Tempestade chegando!":"A storm is coming!",
"Neve":"Snow",
"Começou a nevar":"It started to snow",
"Neblina":"Fog",
"A neblina chegou":"Fog rolled in",
// --- 2-sistemas/10-contratos.js
"Quebre {0} blocos a partir de {1} m":"Break {0} blocks from {1} m",
"Quebre {0} blocos":"Break {0} blocks",
"Colete {0} de {1} a partir de {2} m":"Collect {0} {1} from {2} m",
"Colete {0} de {1}":"Collect {0} {1}",
"Chegue a {0} m de profundidade":"Reach {0} m depth",
"Contrato: +{0}":"Contract: +{0}",
"{0} / {1} · recompensa {2} de ouro + XP":"{0} / {1} · reward {2} gold + XP",
"Entregar":"Deliver",
"Em andamento":"In progress",
"Dispensar":"Dismiss",
"Missões que pagam um bônus. Conta a partir do momento em que aparece aqui; blocos e minérios só valem na profundidade indicada.":"Missions that pay a bonus. Progress counts from the moment one appears here; blocks and ores only count at the stated depth.",
"Nenhum contrato no quadro.":"No contracts on the board.",
"Próximo contrato em <b id='ct-w'>{0}</b>":"Next contract in <b id='ct-w'>{0}</b>",
"Fechar":"Close",
// --- 2-sistemas/11-cassino.js
"Cenoura":"Carrot",
"Moeda":"Coin",
"Cristal":"Crystal",
"Estrela":"Star",
"CAÇA-NÍQUEL":"SLOT MACHINE",
"JACKPOT! {0} de ouro":"JACKPOT! {0} gold",
"3 {0}s! +{1} de ouro":"3 {0}s! +{1} gold",
"Par de {0}: +{1} de ouro":"Pair of {0}s: +{1} gold",
"Não foi dessa vez":"Not this time",
"Ouro insuficiente para essa aposta":"Not enough gold for that bet",
"Girando...":"Spinning...",
"Ouro: <b>{0}</b>":"Gold: <b>{0}</b>",
"Girar · {0}":"Spin · {0}",
"3 iguais: {0}":"3 of a kind: {0}",
"2 primeiros iguais: x0,5 a x8 conforme o símbolo":"First 2 matching: x0.5 to x8 depending on the symbol",
"Retorno médio de ~{0}%: a casa sempre ganha no longo prazo. Aposte só o que não vai fazer falta.":"Average return ~{0}%: the house always wins in the long run. Only bet what you won't miss.",
"Saldo da máquina:":"Machine balance:",
"Boa sorte!":"Good luck!",
// --- 2-sistemas/12-baus.js
"Minério: {0} x{1}":"Ore: {0} x{1}",
"Fragmentos x{0}":"Shards x{0}",
"+ {0} baú(s) na fila":"+ {0} chest(s) in the queue",
"Coletar":"Collect",
"Pular":"Skip",
"BAÚ {0}!":"{0} CHEST!",
"achado a {0} m de profundidade":"found at {0} m deep",
"+{0} de ouro":"+{0} gold",
"BÔNUS {0}: {1} +{2} nv":"{0} BONUS: {1} +{2} lv",
// --- 2-sistemas/13-pesca.js
"Bota velha":"Old boot",
"Alga":"Seaweed",
"Lata enferrujada":"Rusty can",
"comum":"common",
"raro":"rare",
"lendário":"legendary",
"Bolsa de peixes cheia: venda na carrocinha ou asse na fogueira":"Fish bag full: sell at the cart or roast at the campfire",
"Espere morder. Aperte Espaço no !":"Wait for a bite. Press Space at the !",
"O peixe soltou a isca antes de você puxar!":"The fish let go of the bait before you pulled!",
"AGORA!":"NOW!",
"Você puxou cedo demais e o peixe fugiu!":"You pulled too early and the fish got away!",
"Segure Espaço: sobe · Solte: desce":"Hold Space: up · Release: down",
"O peixe fugiu!":"The fish got away!",
"{0}: {1} cm. Vale cerca de {2} de ouro. Venda na carrocinha ou asse na fogueira.":"{0}: {1} cm. Worth about {2} gold. Sell it at the cart or roast it at the campfire.",
"Você pescou: {0}. Vendida por {1} de ouro.":"You caught: {0}. Sold for {1} gold.",
"Vender para Izans":"Sell to Izans",
"Vender tudo · {0}":"Sell all · {0}",
"Você não tem peixes para vender.":"You have no fish to sell.",
"Dica: peixes também podem ser assados na fogueira e viram comida de energia.":"Tip: fish can also be roasted at the campfire into energy food.",
"Peixes vendidos: +{0}":"Fish sold: +{0}",
// --- 2-sistemas/14-fogueira.js
"Escolha um peixe · no ponto perfeito sobe um nível":"Pick a fish · perfect doneness goes up a tier",
"Sem peixes · pesque no riacho ou no mar":"No fish · catch some in the creek or sea",
"Comidas":"Food",
"+{0}% de energia":"+{0}% energy",
"Fechar · Esc":"Close · Esc",
"<b>Espaço</b> na faixa <b>dourada</b> · não demore ou queima!":"<b>Space</b> on the <b>golden</b> zone · don’t wait or it burns!",
"Tirar do fogo · Espaço":"Take off the fire · Space",
"Voltar":"Back",
"Mal passado":"Undercooked",
"No ponto":"Done",
"PERFEITO!":"PERFECT!",
"Queimou!":"Burnt!",
"Você ganhou: {0}":"You got: {0}",
"Virou carvão. Mais sorte da próxima vez.":"It turned to charcoal. Better luck next time.",
"Assar outro":"Roast another",
// --- 2-sistemas/15-fundo.js
"Uma cenoura dourada cresce da raiz do cristal, bem no coração do abismo. Ela pulsa devagar, como se esperasse por você.":"A golden carrot grows from the crystal’s root, deep in the heart of the abyss. It pulses slowly, as if waiting for you.",
"O vagalume não sai do seu lado. Ele brilha tanto que dá para sentir o calor daqui.":"The firefly stays by your side. It glows so brightly you can feel the warmth from here.",
"A CENOURA DOURADA":"THE GOLDEN CARROT",
"Tocar na cenoura":"Touch the carrot",
"Cenoura dourada na horta: {0}/{1}":"Golden carrot in the garden: {0}/{1}",
// --- 2-sistemas/16-caldeirao.js
"Minério fundo":"Deep ore",
"Escolha uma receita · ↑ ↓ trocam · Espaço cozinha":"Pick a recipe · ↑ ↓ switch · Space cooks",
"Ingredientes":"Ingredients",
"Do bosque":"From the grove",
"Comidas e poções":"Food and potions",
"a partir de {0}":"{0} or better",
"Cozinhar tudo ({0})":"Cook all ({0})",
"Você já tem itens demais.":"You already have too many.",
"Faltam ingredientes.":"Missing ingredients.",
// --- 3-mundo/02-coleta.js
"Novo minério: {0}":"New ore: {0}",
// --- 3-mundo/03-mineracao.js
"VOCÊ CHEGOU AO FUNDO":"YOU REACHED THE BOTTOM",
"Sua jornada até aqui":"Your journey so far",
"TEMPO DE JOGO":"PLAY TIME",
"{0} h {1} min":"{0} h {1} min",
"{0} min":"{0} min",
"BLOCOS QUEBRADOS":"BLOCKS BROKEN",
"MINÉRIOS COLETADOS":"ORES COLLECTED",
"RENASCIMENTOS":"REBIRTHS",
"Renascer troca esta vida por <b>{0}</b> fragmentos (poderes permanentes). Ou continue cavando e renasça depois, na aba Poder.":"Rebirth trades this life for <b>{0}</b> shards (permanent powers). Or keep digging and be reborn later, in the Power tab.",
"Renascer agora":"Rebirth now",
"Continuar cavando":"Keep digging",
"Novo recorde: {0} m":"New record: {0} m",
"CORAÇÃO DO ABISMO":"HEART OF THE ABYSS",
"CAMADA: {0}":"LAYER: {0}",
"A Rocha-mãe é inquebrável: você chegou ao fundo!":"Bedrock is unbreakable: you reached the bottom!",
"ÓTIMO!":"GREAT!",
"INCRÍVEL!":"INCREDIBLE!",
"IMPARÁVEL!":"UNSTOPPABLE!",
"LENDÁRIO!":"LEGENDARY!",
"MÍTICO!":"MYTHIC!",
"DIVINO!":"DIVINE!",
"Minério extra! +{0}":"Extra ore! +{0}",
"+Energia":"+Energy",
"Lava! -{0} de energia":"Lava! -{0} energy",
"Pedra dura: use dinamite":"Hard stone: use dynamite",
"CRÍTICO! {0}":"CRITICAL! {0}",
// --- 4-interface/01-painel.js
"Dinamites":"Dynamites",
"Picareta":"Pickaxe",
"Sorte e experiência":"Luck and experience",
"Habilidades":"Skills",
"Utilidades":"Utilities",
"Máx":"Max",
"Você consegue comprar {0}x com o ouro que tem":"You can buy {0}x with the gold you have",
"MÁX":"MAX",
"Nv {0}/{1}":"Lv {0}/{1}",
"Recorde: {0} m":"Record: {0} m",
"Superfície · melhorias liberadas · {0}":"Surface · upgrades unlocked · {0}",
"INQUEBRÁVEL":"UNBREAKABLE",
"Minérios x3":"Ores x3",
"Ouro x3":"Gold x3",
"Melhorias só na superfície. Suba (ou use o teleporte) para comprar.":"Upgrades only on the surface. Go up (or use teleport) to buy.",
"A loja fica na superfície. Suba (ou use o teleporte) para comprar.":"The shop is on the surface. Go up (or use teleport) to buy.",
"Na loja: compre dinamite.":"At the shop: buy dynamite.",
"Vá até a loja (à direita do baú) para comprar.":"Go to the shop (right of the chest) to buy.",
"{0} · você tem {1}":"{0} · you have {1}",
"(preço sobe a cada camada alcançada)":"(price rises with every layer reached)",
"Fornalha: {0} minérios na fila · pronta em {1}. Pode ir cavar: ela vende sozinha.":"Furnace: {0} ores in the queue · ready in {1}. Go dig: it sells by itself.",
"Refina os minérios com o tempo e vende sozinha (+{0}% de ouro). Pedra comum vai para o baú.":"Refines ores over time and sells them on its own (+{0}% gold). Plain stone goes to the chest.",
"Os poderes só podem ser comprados depois de Renascer pela primeira vez. Os fragmentos vêm do Renascer e, às vezes, dos baús raros do subsolo.":"Powers can only be bought after your first Rebirth. Shards come from Rebirth and, sometimes, from rare underground chests.",
"Fragmentos disponíveis: {0} (vêm do Renascer e dos baús raros).":"Shards available: {0} (from Rebirth and rare chests).",
"Som: desligado":"Sound: off",
"Som: ligado":"Sound: on",
"Picareta de {0}":"{0} pickaxe",
"Melhor picareta do jogo (camada {0})":"Best pickaxe in the game (layer {0})",
"Dano x{0} (atual: {1}). Recomendada para a camada {2}":"Damage x{0} (current: {1}). Recommended for the {2} layer",
"{0} frag.":n=>n+(n==1?" shard":" shards"),
"Chegue a 100 m nesta vida para ganhar fragmentos. Reinicia ouro, picareta e melhorias; mantém poderes, nível e conquistas":"Reach 100 m in this life to earn shards. Resets gold, pickaxe and upgrades; keeps powers, level and achievements",
"Reinicia ouro, picareta e melhorias e ganha {0} fragmentos (1 por camada de 100 m alcançada nesta vida, +5 por chegar ao fundo)":g=>"Resets gold, pickaxe and upgrades and earns "+g+(g==1?" shard":" shards")+" (1 per 100 m layer reached in this life, +5 for reaching the bottom)",
"Confirmar?":"Confirm?",
"+{0} fragmentos":n=>"+"+n+(n==1?" shard":" shards"),
"Escavação":"Digging",
"Dano por golpe":"Damage per hit",
"Dano automático":"Automatic damage",
"Chance de crítico":"Crit chance",
"Velocidade":"Speed",
"Por bloco (aqui)":"Per block (here)",
"Por bloco (automático)":"Per block (auto)",
"Subir 1 m com o jato":"Fly up 1 m with jetpack",
"Dano da lava (aqui)":"Lava damage (here)",
"sem lava":"no lava",
"Nesta profundidade · {0} m":"At this depth · {0} m",
"Ouro por bloco":"Gold per block",
"Dureza":"Hardness",
"Chance de minério":"Ore chance",
"Bônus de XP":"XP bonus",
"Progresso":"Progress",
"Profundidade máxima":"Max depth",
"Ouro total":"Total gold",
"Blocos quebrados":"Blocks broken",
"Minérios coletados":"Ores collected",
"Catálogo de minérios":"Ore catalog",
"Renascimentos":"Rebirths",
"Fragmentos":"Shards",
"Estação do ano":"Season",
"Uso":"Usage",
"Vendas no baú":"Chest sales",
"Vezes sem energia":"Times out of energy",
"Dinamites usadas":"Dynamites used",
"Itens comidos":"Items eaten",
"Teleportes":"Teleports",
"Pedras duras quebradas":"Hard stones broken",
"Veios de minério quebrados":"Ore veins broken",
"Vezes na cama":"Times in bed",
"Minérios refinados":"Ores refined",
"Baús":"Chests",
"Baús abertos":"Chests opened",
"Ouro de baús":"Gold from chests",
"Fragmentos de baús":"Shards from chests",
"Bônus de melhoria":"Upgrade bonuses",
"Poções de teleporte usadas":"Teleport potions used",
"Peixes pescados":"Fish caught",
"Pescarias perfeitas":"Perfect catches",
"Peixes na bolsa":"Fish in bag",
"Peixes assados":"Fish roasted",
"Ouro de peixes":"Fish gold",
"Álbum de peixes":"Fish album",
"Pendentes · {0}":"Pending · {0}",
"Concluídas · {0}":"Completed · {0}",
"Renascido! Fragmentos: {0}":"Reborn! Shards: {0}",
"Clique de novo para apagar tudo":"Click again to erase everything",
"Pedra dura":"Hard stone",
"vazia":"empty",
"MOCHILA":"BACKPACK",
"{0} item":"{0} item",
"{0} itens":"{0} items",
"vale {0} de ouro":"worth {0} gold",
// --- 4-interface/02-abas.js
"Melhorias":"Upgrades",
"Loja":"Shop",
"Poder":"Power",
"Menu":"Menu",
"Sair da tela":"Exit fullscreen",
"Tela cheia":"Fullscreen",
"Jogo salvo na cama":"Game saved at the bed",
// --- 4-interface/03-barra-habilidades.js
"Comida de peixe":"Fish food",
"Comida escolhida: {0}":"Food selected: {0}",
"{0} — {1} (clique ou F para usar; feito na fogueira). Você tem {2}. Botão direito troca o tipo":"{0} — {1} (click or F to use; made at the campfire). You have {2}. Right-click to switch type",
"{0} — {1} (clique para usar). Você tem {2}":"{0} — {1} (click to use). You have {2}",
"{0} — {1} (clique para usar; feito na fogueira). Você tem {2}":"{0} — {1} (click to use; made at the campfire). You have {2}",
"{0} — {1} (clique para usar; compre na loja). Você tem {2}":"{0} — {1} (click to use; buy at the shop). You have {2}",
"{0} — {1}: explode uma área de raio {2} e quebra veios de pedra dura (consome 1, compre na loja). Você tem {3}. Botão direito ou R troca o tipo":"{0} — {1}: blasts an area of radius {2} and breaks hard stone veins (uses 1, buy at the shop). You have {3}. Right click or R switches type",
"{0} — leva ao baú sem gastar energia; na superfície, volta ao ponto de onde saiu (compre em Melhorias)":"{0} — takes you to the chest without spending energy; on the surface, returns to where you left from (buy in Upgrades)",
"{0} — {1} (desbloqueia aos {2} m)":"{0} — {1} (unlocks at {2} m)",
"{0} (raio {1})":"{0} (radius {1})",
// --- 4-interface/04-entrada.js
"Minerar":"Mine",
// --- 4-interface/05-pausa.js
"nível {0}":"level {0}",
"Continuar":"Continue",
"Salvar jogo":"Save game",
"Menu inicial":"Main menu",
"Jogo salvo":"Game saved",
"Jogo salvo ✓":"Game saved ✓",
// --- 4-interface/06-relogio.js
"Manhã":"Morning",
"Tarde":"Afternoon",
"Noite":"Night",
"Madrugada":"Late night",
"{0} · {1} · {2} (o sol aparece no alto ao meio-dia e a lua à meia-noite)":"{0} · {1} · {2} (the sun is high at noon and the moon at midnight)",
// --- 4-interface/07-controle.js
"Painel: A escolhe, LB/RB troca de aba, B volta":"Panel: A selects, LB/RB switch tab, B goes back",
"Controle conectado":"Controller connected",
"Controle desconectado":"Controller disconnected",
// --- 5-desenho/03-mundo.js
"Mesa de trabalho: compre aqui":"Workbench: buy here",
"Mesa de trabalho":"Workbench",
"fora de uso · {0} m":"out of order · {0} m",
"fora de uso":"out of order",
"Fornalha · {0} minérios · {1}":"Furnace · {0} ores · {1}",
"Fornalha: clique para refinar":"Furnace: click to refine",
"Loja: compre aqui":"Shop: buy here",
"Baú: clique para vender":"Chest: click to sell",
"Baú: entregue a mochila":"Chest: drop off your backpack",
// --- 5-desenho/04-combo-efeitos.js
"Combo final x{0}":"Final combo x{0}",
// --- 5-desenho/06-quadro.js
"Pedra dura: dinamite":"Hard stone: dynamite",
"Veio de {0}: x{1}":"{0} vein: x{1}",
// --- 5-desenho/08-dia-noite.js
"Lua nova":"New moon",
"Crescente":"Waxing crescent",
"Quarto crescente":"First quarter",
"Gibosa crescente":"Waxing gibbous",
"Lua cheia":"Full moon",
"Gibosa minguante":"Waning gibbous",
"Quarto minguante":"Last quarter",
"Minguante":"Waning crescent",
// --- 5-desenho/12-povoado.js
"Salvo!":"Saved!",
"Cama":"Bed",
"Poço de água":"Well",
"Contratos: clique para abrir":"Contracts: click to open",
"Contratos prontos!":"Contracts ready!",
"Contratos":"Contracts",
"Caça-níquel: clique para jogar":"Slot machine: click to play",
// --- 5-desenho/13-paisagem.js
"Fogueira: clique para assar":"Campfire: click to roast",
// --- 5-desenho/16-pesca-desenho.js
"Riacho da floresta: clique para pescar":"Forest stream: click to fish",
"Riacho: clique para pescar":"Stream: click to fish",
"Mar: clique para pescar":"Sea: click to fish",
"Vender":"Sell",
// --- 5-desenho/19-cogumelos-cenouras.js
"Mochila cheia: {0}":"Bag full: {0}",
// --- 5-desenho/20-caldeirao.js
"Caldeirão: clique para cozinhar":"Cauldron: click to cook",
"Caldeirão":"Cauldron",
"Sopa pronta!":"Soup ready!",
"Poção pronta!":"Potion ready!",
// --- 6-jogo/01-laco-inicio.js
"Frenesi mineral! Minérios x3 por 20s":"Mineral Frenzy! Ores x3 for 20s",
"Corrida do ouro! Ouro x3 por 20s":"Gold Rush! Gold x3 for 20s",
"Escavação automática pausada: energia só para voltar":"Auto digging paused: energy is only enough to go back",
"Save exportado: copie o texto":"Save exported: copy the text",
"Falha ao exportar":"Export failed",
"Save importado!":"Save imported!",
"Save inválido":"Invalid save",
},{dec:"."});

// ===== 0-idiomas/99-iniciar.js — Escolhe o idioma ao abrir o jogo (os módulos seguintes registram o que refazer ao trocar com onLang) =====
langButtons();langMenus();setLang(detectLang());

// ===== 1-nucleo/00-balanceamento.js — TABELA ÚNICA DE BALANCEAMENTO: custos, ritmo e números do jogo (mexa só aqui para afinar) =====
const BAL={
 // Coleta no bosque da esquerda: regrow = segundos de jogo até o que foi colhido nascer de novo; car/mr/mb = unidades por cenoura, cogumelo vermelho e grupo de cogumelos marrons; soupCost = cogumelos por Sopa de cogumelo no caldeirão
 forage:{regrow:300,car:1,mr:1,mb:2,soupCost:3,energyPot:{cog:4,cen:2},tpPot:{cog:2,minOre:6}},
 // Queda livre: segurar ↓ num trecho já cavado desce de graça, acelerando (s por bloco: começa em t0 e chega a tMin depois de `ramp` s)
 // shift = multiplicador do intervalo com Shift apertado (menor = mais rápido) · maxSteps = máx. de blocos por quadro
 fall:{t0:.14,tMin:.025,ramp:1.3,shift:.45,maxSteps:12},
 exitBrake:{rows:5,ms:150},   // subindo pelo buraco: nos últimos `rows` blocos antes da superfície o intervalo entre passos vai subindo até `ms` (ms por bloco), desacelerando a saída
 // Melhorias da mesa de trabalho: custo do nível N = b x k^N (N começa em 0) · max = nível máximo
 ups:{
  sharp:{b:80,k:2.114,max:20}, // afiar picareta
  speed:{b:220,k:1.932,max:20}, // velocidade de escavação
  crit:{b:400,k:2.05,max:18}, // golpe crítico
  emax:{b:100,k:1.44,max:40}, // energia máxima
  eco:{b:300,k:1.953,max:20}, // economia de energia
  jet:{b:250,k:1.919,max:20}, // eficiência do jato
  jetspd:{b:250,k:2.306,max:15}, // velocidade da mochila a jato (subida)
  lavares:{b:150,k:2.606,max:15},  // resistência à lava
  auto:{b:400,k:2.955,max:12}, // escavação automática
  autopow:{b:500,k:2.896,max:12}, // força da escavação automática
  luck:{b:200,k:2.038,max:20}, // sorte
  xp:{b:300,k:1.767,max:20}, // experiência
  duration:{b:500,k:1.72,max:20}, // duração das habilidades
  furia:{b:3000,k:2.55,max:10}, // potência da Fúria do Minerador
  frenesi:{b:3000,k:2.55,max:10}, // potência da Escavação Frenética
  tele:{b:1500,k:4.427,max:8}, // teleporte
  lant:{b:150,k:1.95,max:5}, // lanterna (barata, antes do vagalume)
  pet:{b:8000,k:6.58,max:5},  // vagalume companheiro
  furn:{b:500,k:1.812,max:20},  // velocidade da fornalha
  clock:{b:400,k:1,max:1},   // relógio na barra do topo (compra única; custo fixo b)
  fort:{b:20000,k:7,max:5},    // Melhoria de minérios: 20 mil, 140 mil, 980 mil, 6,9 mi, 48 mi
  rod:{b:120,k:1.85,max:10},   // vara de pesca: zona verde maior no minijogo
  bait:{b:200,k:1.9,max:10},   // isca: peixe morde mais rápido e peixes raros aparecem mais
  back:{b:30000,k:1,max:1}   // medidor de retorno: energia para subir de volta (compra única, cara; custo fixo b)
 },
 // LIBERAÇÃO GRADUAL: cada coisa só aparece quando o recorde de profundidade (m) chega ao número abaixo (0 = desde o início). Vale para melhorias da mesa, itens da loja e construções da superfície.
 // O recorde sobrevive ao Renascer, então o que foi liberado não some. Quem já tem nível/estoque no save continua vendo. on:false libera tudo (modo antigo).
 unlock:{on:true,
  ups:{sharp:0,speed:0,emax:0,eco:10,jet:15,luck:20,lant:25,xp:30,furn:30,crit:40,auto:50,duration:50,furia:50,autopow:60,clock:60,jetspd:70,lavares:80,tele:120,frenesi:150,pet:150,back:150,fort:120},
  items:{cen:0,dyn:25,sop:60,dyn2:100,poc:150,dyn3:250,dyn4:500,dyn5:900},
  build:{furnace:30,board:60,slot:150}},
 // PESCA (2-sistemas/13-pesca.js) e FOGUEIRA (2-sistemas/14-fogueira.js). Espécies e valores: FISH em 1-nucleo/02-camadas-minerios.js (valor = blocos de ouro da profundidade do recorde).
 // wait = espera até morder (s, dividida pela isca) · window = tempo para fisgar depois do "!" (s) · baitCut = -7% de espera por nível de isca · baitRare = +18% de chance dos peixes raros por nível · rain = chuva favorece os raros · junk = chance de lixo · bag = peixes na bolsa
 // bar (minijogo): h = altura da pista (px) · base/per = zona verde (px) e ganho por nível da vara (teto 60% da pista) · lift/grav = aceleração ao segurar/soltar · bounce = quique no fundo · maxV = velocidade máxima da zona
 // fishSpd/fishSpdD = velocidade do peixe (px/s) base e por ponto de dificuldade · prog = progresso por segundo (sobe dentro da zona, desce fora; downD = descida extra por dificuldade) · perfectOut = máximo de segundos fora da zona para a pesca ser perfeita (valor x perfect)
 // cook: speed = voltas do marcador por segundo (vai e volta na barra) por raridade do peixe · ramp = aumento de velocidade a cada ida/volta · passes = idas e voltas até queimar sozinho · zones = limites do ponto (cru < z0 <= no ponto < z1 <= perfeito < z2 <= queimado)
 fish:{wait:[1.8,5.2],window:1,baitCut:.07,baitRare:.18,rain:1.6,junk:.08,junkV:.5,bag:80,perfect:1.5,perfectOut:.9,maxTime:60,
  bar:{h:288,base:44,per:2,lift:520,grav:330,bounce:.35,maxV:270},fishSpd:24,fishSpdD:15,prog:{up:.16,down:.09,downD:.05,start:.35},
  cook:{speed:[1.5,1.9,2.4],ramp:.1,passes:6,zones:[.38,.6,.74]}},
 fort:{per:.1,max:.5},                                   // Melhoria de minérios: +10% de chance por nível (teto 50%) de o minério render unidades extras (+1 a +ceil(nível/2))
 critMax:.75,                                          // teto da chance de crítico
 critPer:.04,                                           // chance de crítico por nível da melhoria
 ecoPer:.05,jetPer:.05,                                  // economia e eficiência do jato: -5% COMPOSTO por nível (0,95^nível), então nunca zera mesmo com muitos níveis
 jetSpd:.1,                                           // velocidade de subida com a mochila a jato: +10% por nível (intervalo entre blocos dividido por 1 + jetSpd x nível)
 tier:{b:600,k:3.4,dmgMult:2.6},                       // nova picareta: custo = b x k^(tier+1) · dano x dmgMult por tipo
 items:{dyn:40,dyn2:100,dyn3:260,dyn4:650,dyn5:1700,cen:30,sop:90,poc:220},itemK:1.9,       // loja: preço base e crescimento por camada alcançada
 dig:{powBase:4,hardBase:50,hardK:3.25,goldBase:1.5,goldK:2.15,crit:3},   // dano inicial · dureza (x hardK a cada 100 m) · ouro por bloco · multiplicador de crítico
 // Energia: máxima, custo de cavar (digBase x digGrow^camada: cresce 20% a cada 100 m), custo de andar/subir e fração gasta pela escavação automática
 energy:{base:100,perLevel:30,digBase:2.5,digGrow:1.2,stepBase:.06,stepLayer:.014,auto:.5,dyn:2,retMargin:.15,retBlocks:2},   // dyn = dinamite gasta o equivalente a 2 blocos cavados · aviso de volta: apertado quando a energia < custo de subir x (1 + retMargin) + retBlocks blocos cavados da profundidade seguinte
 // Lava (a partir de 100 m): chance por bloco = p0 + pL x camada. Ao quebrar tira flat + flatL x camada + (pct + pctL x camada) da energia máxima; não é reduzida pela economia.
 // res = cada nível de Resistência à lava multiplica o dano por (1 - res).
 lava:{from:100,p0:.012,pL:.0025,flat:6,flatL:3,pct:.03,pctL:.006,res:.1},
 // Fornalha: refina minérios da mochila com o tempo e vende sozinha. base = minérios por segundo no nível 0 · per = +x% da base por nível · bonus = ouro extra do refinado
 furnace:{base:.4,per:.3,bonus:.3},
 xp:{base:20,k:1.22},                                  // XP para o próximo nível = base x k^(nível-1)
 events:{len:20,gapMin:90,gapRand:90},                 // frenesi/corrida do ouro: duração e intervalo (s)
 skills:{fury:{dur:8,cd:80,at:50,mult:2,per:.15},frenzy:{dur:6,cd:110,at:150,mult:1.4,per:.08},comboFactor:.5}, // habilidades ativas: bônus reduzido quando Fúria e Frenesi são usados juntos
 tele:{base:180,perLevel:18,min:25},                    // recarga do teleporte (s): base - perLevel x nível, nunca abaixo de min
 // Dinamites da loja (mesmo preço-base em items): r = raio da explosão (blocos) · p = força (x dano da picareta, gasta a dureza dos blocos) · e = energia gasta (x o custo de cavar 1 bloco aqui) · cd = recarga (s) até poder usar qualquer dinamite de novo
 dyn:{dyn:{r:2.2,p:60,e:2,cd:1.5},dyn2:{r:3,p:160,e:3,cd:3},dyn3:{r:4,p:420,e:4.5,cd:6},dyn4:{r:5,p:1100,e:6.5,cd:10},dyn5:{r:6.5,p:3000,e:9,cd:16}},
 pet:{light:.9},                                       // vagalume: blocos de luz extra por nível
 lant:{light:.3},                                      // lanterna: blocos de luz extra por nível (upgrade mais barato, comprável antes do vagalume)
 moon:{cycle:8,start:.5,south:true,glow:.3},               // fases da lua (só visual): cycle = dias de jogo (1 dia = day.len s) de uma lua nova à seguinte (8 = uma fase por dia) · start = fase de um jogo novo (0 nova, .25 quarto crescente, .5 cheia, .75 quarto minguante) · south: hemisfério sul (a crescente fica iluminada à esquerda) · glow = brilho que sobra no halo com lua nova
 day:{len:480,start:.12},                              // dia e noite na superfície: duração do ciclo (s) e hora inicial (0 = amanhecer, .25 = meio-dia, .5 = pôr do sol, .75 = meia-noite)
 // noite: from = a partir de que escuridão (0-1) vale o bônus · xp = bônus de XP ao descer de noite · dark = escurecimento máximo da superfície (1 = breu total) · pet = brilho extra do vagalume
 // luz: lit = raio (blocos) da lanterna do jogador sem vagalume · petLit = blocos de luz que cada bloco de BAL.pet.light acrescenta · soft = largura (blocos) da borda suave da luz
 // céu: sky = fração do escuro que sobra no alto do céu (deixa estrelas e lua à vista) · skyZone = altura (blocos) acima do chão que fica totalmente escura (mesa, fornalha, loja...)
 night:{from:.4,xp:.15,dark:.97,pet:.35,lit:1,petLit:1.3,soft:2.4,sky:.28,skyZone:1.8},
 shake:{crit:2.5,dyn:[0,0,4,6,8],decay:14},              // tremor de tela (px de amplitude): golpe crítico · por tipo de dinamite (0 = sem tremor; só as 3 maiores tremem) · queda por segundo. Mais nada treme
 weather:{fade:8,                                          // clima da superfície (só visual e sonoro, não muda o jogo): segundos para uma mudança de tempo se completar
  dur:{clear:[90,240],cloudy:[60,150],rain:[90,200],storm:[40,90],snow:[90,200],fog:[60,140]},   // quanto cada tempo dura (s de jogo, sorteado entre os dois valores)
  w:[[40,25,25,5,0,5],[55,15,12,15,0,3],[30,30,25,5,0,10],[35,25,0,0,35,5]],   // chance de cada tempo por estação (primavera, verão, outono, inverno), na ordem: limpo, nublado, chuva, tempestade, neve, neblina
  boltGap:[9,28],                                          // intervalo entre raios na tempestade (s)
  vol:{rain:.011,snow:.005,storm:.004}},                      // volume do chiado de chuva/vento (multiplica o volume de ambiente)
 season:{len:600},                                      // estações do ano: duração de cada estação (s de jogo, só com o jogo aberto). O ano tem 4 estações: 600 s = 10 min cada, 40 min o ano
 star:{gapMin:150,gapRand:200,len:45,gold:2,luck:2},     // estrela cadente (só de noite): espera até a próxima (s de noite) · duração do bônus (s) · multiplicador de ouro · multiplicador da chance de minério
 oreVein:{chance:.14,units:4,min:8},                     // veio de minério: chance por região · minérios por bloco · profundidade mínima (m)
 // Quadro de contratos: `slots` missões ao mesmo tempo; depois de entregar uma, a vaga volta em `cd` s. A recompensa é uma fração `pay` do ouro que os blocos já dariam (base = bloco do seu recorde), então é um bônus, não o ganho principal.
 // blk = quebrar blocos · ore = coletar um minério específico · dep = chegar a X m (add = metros acima do recorde). xp = fração do XP do nível atual dada ao entregar.
 // minD = só contam blocos/minérios de profundidade >= minD x seu recorde (impede farmar contrato na camada fácil estando fundo)
 contracts:{slots:3,cd:60,minD:.75,blk:{n:[60,160],pay:.2},ore:{n:[2,6],pay:.35},dep:{add:[20,60],pay:35},xp:.12},
 // Mesa de apostas (caça-níquel de 3 rolos): w = peso de cada símbolo (pedra, cenoura, moeda, dinamite, cristal, estrela) · p3 = prêmio (x aposta) com 3 iguais · p2 = prêmio com os 2 primeiros rolos iguais.
 // O retorno teórico fica perto de 90% (o teste confere). A aposta é uma porcentagem do seu ouro, nunca mais que max.
 // Baús raros no subsolo (um visual por raridade: madeira, ferro, ouro, roxo, obsidiana; a raridade é fixa pela posição e `w` é o peso do sorteio). Ficam no lugar de um bloco, cada bloco tem chance `p` (~1 baú a cada 400 blocos).
 // ore = [chance, unidades] de minério pronto (um dos 2 melhores da profundidade, vai para a mochila e pode ir à fornalha) · fr = [chance, quantidade] de fragmentos de Renascer
 // pk = [chance, raridade 0-4 da tabela RAR] de o baú dar uma melhoria de nível (igual às do level up, com o bônus da raridade)
 // g = ouro em blocos da profundidade do baú · xp = fração do XP do nível atual · it = [item, chance, quantidade] · w = peso do sorteio
 chest:{min:8,p:.0024,tiers:[
  {n:N_("Comum"),c:"#cfd3da",w:58,g:20,xp:.01,it:[["cen",.3,1]],pk:[.2,0]},
  {n:N_("Incomum"),c:"#5ee08a",w:28,g:45,xp:.03,it:[["cen",1,1],["sop",.3,1]],pk:[.4,1],ore:[.5,2]},
  {n:N_("Raro"),c:"#4aa8ff",w:10,g:110,xp:.07,it:[["sop",1,1],["dyn",.7,2],["ptp",.3,1]],pk:[.7,2],ore:[.8,4],fr:[.1,1]},
  {n:N_("Épico"),c:"#b45cff",w:3.5,g:300,xp:.15,it:[["poc",1,1],["dyn2",1,2],["ptp",.6,1]],pk:[1,3],ore:[1,8],fr:[.4,1]},
  {n:N_("Lendário"),c:"#ffb02e",w:.5,g:1000,xp:.4,it:[["poc",1,2],["dyn3",1,3],["dyn4",.5,1],["ptp",1,2]],pk:[1,4],ore:[1,15],fr:[1,2]}]},
 slot:{w:[10,7,5,3,2,1],p3:[5,12,24,55,170,500],p2:[.5,1,2,3,5,8],bets:[.01,.05,.1,.25,.5,.75,1],spin:[1.1,1.55,2.1]},
 prestigeBonus:5                                       // fragmentos extras por chegar ao fundo
};

// ===== 1-nucleo/01-utilidades.js — Atalhos, formatação de números e funções matemáticas básicas =====
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SUF=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
function fmt(n){if(n<0)return"-"+fmt(-n);if(!isFinite(n))return"∞";if(n<1000)return n<10?n.toFixed(1).replace(/\.0$/,""):Math.floor(n)+"";let i=Math.floor(Math.log10(n)/3);if(i>=SUF.length)return n.toExponential(2).replace("+","");return (n/Math.pow(1000,i)).toFixed(2)+SUF[i]}
// SEED: semente do mundo (vem do save). Com SEED=0 o resultado é igual ao dos mundos antigos. Veios, lava e texturas dependem dela.
let SEED=0;
const newSeed=()=>1+Math.floor(Math.random()*2147483000);
const hash=(a,b)=>{let h=(a*374761393+b*668265263+SEED*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295};
const FONT='"Silkscreen","Courier New",monospace';

// ===== 1-nucleo/02-camadas-minerios.js — Tamanho do mundo, camadas, tipos de picareta e minérios =====
const LAYER_HEIGHT=100;          // metros por camada
const HALF=10;                   // o mundo vai de -10 a +10 (21 colunas); fora disso é rocha inquebrável
const COLS=HALF*2+1;
// Superfície: o jogador pode andar além das colunas do mundo subterrâneo, só acima da linha 0 (a mina e as camadas ficam como antes).
// À esquerda a trilha termina no pé da grande montanha em SURF_L; à direita a praia termina no mar em SURF_R. PAD_L/PAD_R = colunas de cenário que a câmera ainda mostra além desses limites.
const SURF_L=-100,SURF_R=52,PAD_L=8,PAD_R=9;   // esquerda estendida: do moinho (-26) até as montanhas altas (-100)
// Paisagem estendida (só visual, em 5-desenho/13-paisagem.js). Esquerda da casa: horta de cenouras, moinho de vento e a trilha até a grande montanha (sem nada lá, só montanha).
// Direita: riacho com ponte de madeira e roda d'água, fogueira com banco de pedra, praia com farol e trapiche. Posições em colunas do mundo.
const GARDEN_L=-20.6,GARDEN_R=-13,MILL_C=-26,GARDEN_SLOTS=16;   // GARDEN_SLOTS: cenouras da horta; cada chegada ao fundo (1 por vida) deixa mais uma dourada
const CHURCH_C=-87;   // igreja gótica de pedra no fim do bosque da esquerda (depois do riacho, perto do pé da montanha); ocupa ~15 colunas, interior à vista, com a mesa de encantar no altar (5-desenho/18-igreja.js)
const CAULDRON_C=CHURCH_C+10.2;   // caldeirão de sopa de cogumelo, ao lado da igreja (2-sistemas/16-caldeirao.js e 5-desenho/20-caldeirao.js)
const RIVER_C0=24,RIVER_C1=30,WHEEL_C=27.4;                       // água do riacho: colunas RIVER_C0..RIVER_C1 (a ponte passa por cima)
const CAMP_C=38.4,BEACH_C0=42,LIGHT_C=46.5,PIER_C=52.4,PIER_END_C=55.6;   // o mar começa depois de SURF_R
const FRIV_C0=-68,FRIV_C1=-63;   // riacho da floresta da esquerda (entre o moinho e as montanhas): colunas FRIV_C0..FRIV_C1, com pontezinha; também dá para pescar
const riverOf=c=>c<(RIVER_C0+FRIV_C1)/2?[FRIV_C0,FRIV_C1]:[RIVER_C0,RIVER_C1];   // o riacho mais próximo da coluna c
const isRiver=c=>(c>=RIVER_C0&&c<=RIVER_C1)||(c>=FRIV_C0&&c<=FRIV_C1),isSea=c=>c>SURF_R,isBeach=c=>c>=BEACH_C0&&c<=SURF_R;
const WALK_R=Math.floor(PIER_END_C-.5);   // última coluna andável: a ponta do trapiche (a praia termina em SURF_R, o trapiche segue sobre o mar)
const inS=c=>c>=SURF_L&&c<=WALK_R;
const CHEST_C=5;                 // coluna do baú de depósito, na superfície
const KEEPER_C=10.7;   // Izans, o dono da carrocinha (SHOP_C+1.7): é com ele que se vendem os peixes
const SHOP_C=9;                  // coluna da loja de consumáveis (dinamite, comida de energia), na superfície, depois do baú
const BED_C=-9;                  // coluna da cama (salva o jogo e abre o menu), na superfície, depois da mesa de trabalho
const ENCH_C=CHURCH_C+4;         // mesa decorativa de encantamento, apenas visual, agora no altar da igreja (a posição exata em pixels vem de CHURCH_ALTAR_DX em 18-igreja.js)
const SLOT_C=3;                  // máquina de caça-níquel, ao lado do baú (entre o buraco e o baú)
const BOARD_C=14;                // quadro de contratos, na passagem da direita
const WELL_C=19;                 // poço de água (só enfeite), na passagem da direita, depois do quadro de contratos
// Ferraria medieval alemã (enxaimel + telhado de telhas sobre cama, mesa e fornalha): pilares em colunas fixas; a lanterna fica pendurada em FORGE_LANTERN_C
const FORGE_PILLARS=[-10.4,-6.97,-3.46,-0.95],FORGE_LANTERN_C=-6.97;
const FURN_C=-2;                 // coluna da fornalha (refina minérios), na superfície, entre o buraco e a mesa de trabalho
const BENCH_C=-5;                // coluna da mesa de trabalho (onde se compram as melhorias), na superfície
// [nome, matiz, saturação, luminosidade, cor de detalhe, estilo de textura]
const BIO=[[N_("Terra"),27,40,30,"#a97847",0],[N_("Argila"),19,45,31,"#b66445",0],[N_("Areia e cascalho"),39,32,36,"#c7ad72",0],[N_("Calcário"),45,17,41,"#c3bda2",0],[N_("Arenito"),24,48,34,"#bd7c4c",0],[N_("Xisto"),210,13,31,"#888f96",0],[N_("Carvão mineral"),220,9,21,"#70747a",0],[N_("Granito"),220,12,40,"#9da3a8",0],[N_("Basalto"),10,19,27,"#8b7467",0],[N_("Gnaisse"),210,13,32,"#969899",0],
 [N_("Quartzito"),335,22,46,"#e8c9d8",0],[N_("Mármore"),200,8,60,"#d9dde2",0],[N_("Magma solidificado"),8,55,24,"#ff7a2a",0],[N_("Cristais profundos"),265,42,29,"#b78cff",0],[N_("Vidro vulcânico"),270,12,13,"#6a5a8a",0],
 [N_("Rocha-mãe"),218,12,19,"#6f777f",0]];
const FINAL_DEPTH=LAYER_HEIGHT*(BIO.length-1);   // 1500 m: a Rocha-mãe é inquebrável
const layerOf=d=>clamp(Math.floor(d/LAYER_HEIGHT),0,BIO.length-1);
const layerName=d=>__(BIO[layerOf(d)][0]);
// Uma picareta por camada quebrável (15 no total). Não existe picareta além da última.
const TIERS=[N_("Madeira"),N_("Pedra"),N_("Ferro"),N_("Bronze"),N_("Aço"),N_("Ouro"),N_("Diamante"),N_("Mithril"),N_("Adamante"),N_("Obsidiana"),N_("Titânio"),N_("Estelar"),N_("Cósmica"),N_("Abissal"),N_("Primordial")];
const TCOL=["#b08a55","#9aa0a6","#cfd6dd","#c98a3a","#9fb4c7","#ffd45c","#7fe6ff","#7fb0ff","#c99bff","#6a4f9c","#d4dde6","#fff3a0","#ff7ad9","#4a2d8a","#ff5a3a"];
// [nome, multiplicador de valor, cor, profundidade em que começa a aparecer]. Os do meio (Esmeralda a Opala) aparecem mais cedo desde 2026-10-21 para o trecho 300-900 m não arrastar.
const ORES=[[N_("Cobre"),1.5,"#d98a4a",0],[N_("Ferro"),2.5,"#c9ced6",20],[N_("Ouro"),5,"#ffd45c",50],[N_("Rubi"),10,"#ff5a7a",100],[N_("Diamante"),20,"#7fe6ff",200],[N_("Esmeralda"),40,"#4ddf8a",280],[N_("Safira"),80,"#4f77ff",430],[N_("Ametista"),160,"#b78cff",620],[N_("Topázio"),320,"#ffb347",850],[N_("Opala negra"),640,"#ff9bf5",1150],[N_("Cristal do abismo"),1280,"#ffffff",1450]];
function rollOre(r){if(Math.random()>oreChance())return null;const u=ORES.filter(o=>o[3]<=r);return u[Math.floor(Math.pow(Math.random(),1.6)*u.length)]}
// ===== Pesca (2-sistemas/13-pesca.js): espécies =====
// id · nome · lugar (r = riacho, s = mar) · peso do sorteio · valor em blocos de ouro da profundidade do recorde · dificuldade do minijogo (1 a 10) · raridade (0 comum, 1 raro, 2 lendário) · cor · comprimento médio (cm)
// Condições: se = estações em que aparece (0 primavera, 1 verão, 2 outono, 3 inverno) · ng = só à noite · rn = só com chuva ou tempestade
const FISH=[
 {id:"lam",n:N_("Lambari"),p:"r",w:30,v:10,d:2,t:0,c:"#a9bfd0",len:12},
 {id:"til",n:N_("Tilápia"),p:"r",w:24,v:16,d:3,t:0,c:"#c2b08a",len:28},
 {id:"bag",n:N_("Bagre"),p:"r",w:18,v:26,d:4,t:0,c:"#7d776b",len:40},
 {id:"tra",n:N_("Traíra"),p:"r",w:11,v:48,d:5,t:1,c:"#64855a",len:45},
 {id:"tru",n:N_("Truta"),p:"r",w:8,v:80,d:6,t:1,c:"#d29a9a",len:38,se:[2,3]},
 {id:"dou",n:N_("Dourado"),p:"r",w:6,v:150,d:7,t:1,c:"#ffcc4a",len:70,rn:1},
 {id:"pce",n:N_("Peixe-cenoura"),p:"r",w:1.3,v:900,d:9,t:2,c:"#ff8a2a",len:80,ng:1},
 {id:"sar",n:N_("Sardinha"),p:"s",w:30,v:10,d:2,t:0,c:"#b9ccd8",len:18},
 {id:"tai",n:N_("Tainha"),p:"s",w:22,v:18,d:3,t:0,c:"#9fb0b8",len:40},
 {id:"rob",n:N_("Robalo"),p:"s",w:16,v:34,d:4,t:0,c:"#8fa4a0",len:55},
 {id:"ata",n:N_("Atum"),p:"s",w:10,v:70,d:6,t:1,c:"#4f6f9a",len:120},
 {id:"lag",n:N_("Lagosta"),p:"s",w:7,v:110,d:6,t:1,c:"#d4533a",len:35,se:[0,1]},
 {id:"esp",n:N_("Peixe-espada"),p:"s",w:5,v:170,d:8,t:1,c:"#c7d3de",len:130,ng:1},
 {id:"lua",n:N_("Peixe-lua"),p:"s",w:1.2,v:1000,d:9,t:2,c:"#e8e2c0",len:200,ng:1}
];
const FISH_BAG_MAX=80;   // teto de peixes na bolsa (o save é limpo com este número)

// ===== 1-nucleo/03-estado-save.js — Estado do jogo (S), validação do save, carregar/salvar e variáveis de sessão =====
const SAVE_KEY="abismo-v3";
const fresh=()=>({gc:0,gcAt:-1,gold:0,depth:0,mc:0,prog:0,best:0,runMax:0,tier:0,runs:0,total:0,oc:0,blocks:0,deaths:0,sold:0,en:-1,
 lv:{sharp:0,emax:0,eco:0,jet:0,jetspd:0,auto:0,autopow:0,speed:0,crit:0,luck:0,xp:0,duration:0,furia:0,frenesi:0,tele:0,pet:0,furn:0,lavares:0,lant:0,clock:0,back:0,fort:0,rod:0,bait:0},items:{dyn:0,dyn2:0,dyn3:0,dyn4:0,dyn5:0,cen:0,sop:0,poc:0,ptp:0,pas:0,pgr:0,pbq:0,cog:0},dsel:"dyn",fsel:"pas",fg:{},
 bag:{v:0,n:0,o:{},ov:{}},fur:{n:0,v:0,a:0,e:0,tg:0,tn:0},refined:0,sea:BAL.season.len*1.5,moon:BAL.moon.start*BAL.moon.cycle,dir:"down",dug:[],ach:[],debug:false,real:0,pts:0,sk:{her:0,ini:0,ouro:0,dmg:0,fol:0,jato:0,gar:0,xp:0},od:[],xp:0,lvl:1,lvp:0,pk:{},tpBack:null,tab:0,ts:0,seed:0,bombs:0,eaten:0,tps:0,veins:0,sleeps:0,rich:0,ct:[],ctW:0,ctDone:0,pend:0,spins:0,slotNet:0,chests:0,chTop:0,chT:BAL.chest.tiers.map(()=>0),chGold:0,chFr:0,chPk:0,ptpUsed:0,fb:[],fdx:{},fishN:0,fishP:0,fishG:0,cookN:0,cookP:0,play:0,v:9,vol:{m:.7,s:1,a:.7}});
let S=fresh();S.seed=newSeed();
function clean(o){const src=o&&typeof o==="object"?o:{},hasVersion=Number.isFinite(src.v),f=fresh();o=Object.assign(f,src);if(!hasVersion)o.v=7;
 for(const k of["gold","depth","prog","best","runMax","tier","runs","total","oc","blocks","deaths","sold","pts","real","xp","lvp","bombs","eaten","tps","veins","sleeps","rich","refined","ctDone","spins","pend","chests","chTop","chGold","chFr","chPk","ptpUsed","fishN","fishP","fishG","cookN","cookP","play","gc"])if(!Number.isFinite(o[k])||o[k]<0)o[k]=0;
 o.gc=Math.min(GARDEN_SLOTS,Math.floor(o.gc));if(!Number.isFinite(o.gcAt))o.gcAt=-1;
 o.chT=BAL.chest.tiers.map((_,i)=>Array.isArray(o.chT)&&Number.isFinite(o.chT[i])&&o.chT[i]>0?Math.floor(o.chT[i]):0);   // baús abertos por raridade
 // pesca: bolsa de peixes [id, cm, perfeito] e álbum (melhor tamanho por espécie)
 o.fb=(Array.isArray(o.fb)?o.fb:[]).filter(e=>Array.isArray(e)&&FISH.some(f=>f.id===e[0])&&Number.isFinite(e[1])&&e[1]>0).slice(0,FISH_BAG_MAX).map(e=>[e[0],Math.round(e[1]),e[2]?1:0]);
 {const d={};if(o.fdx&&typeof o.fdx==="object"&&!Array.isArray(o.fdx))for(const f of FISH)if(Number.isFinite(o.fdx[f.id])&&o.fdx[f.id]>0)d[f.id]=Math.round(o.fdx[f.id]);o.fdx=d}
 if(!Number.isFinite(o.gold)&&!o.debug)o.gold=0;
 if(!Number.isFinite(o.moon)||o.moon<0)o.moon=BAL.moon.start*BAL.moon.cycle;   // idade da lua em dias (5-desenho/08-dia-noite.js); sem ela começa na lua cheia
 if(!Number.isFinite(o.sea)||o.sea<0)o.sea=BAL.season.len*1.5;   // relógio das estações (2-sistemas/07-estacoes.js); sem ele começa no meio do verão
 o.depth=clamp(Math.floor(o.depth),0,FINAL_DEPTH);o.mc=clamp(Math.floor(Number.isFinite(o.mc)?o.mc:0),o.depth>0?-HALF:SURF_L,o.depth>0?HALF:WALK_R);   // na superfície dá para estar fora das colunas da mina
 o.best=Math.max(Math.floor(o.best),o.depth);o.runMax=Math.max(Math.floor(o.runMax),o.depth);
 o.tier=Math.min(TIERS.length-1,Math.floor(o.tier));
 if(!Number.isFinite(o.en))o.en=-1;
 if(o.v<4){ // poderes de renascimento foram refeitos: devolve os pontos gastos e converte os fragmentos antigos
  const old=o.sk&&typeof o.sk==="object"?o.sk:{};for(const k of["gar","her","ouro","fol"]){const L=Math.floor(old[k])||0;if(L>0)o.pts+=L*(L+1)/2}
  if(Number.isFinite(o.shards)&&o.shards>0)o.pts+=o.shards;o.sk={};delete o.shards}
 if(o.v<5&&o.lv&&o.lv.blast>0){let r=0;for(let l=0;l<Math.floor(o.lv.blast);l++)r+=Math.ceil(600*Math.pow(1.4,l));o.gold+=r}   // upgrade "Alcance da dinamite" foi removido: devolve o ouro gasto
 if(o.lv)delete o.lv.blast;
 if(o.v<5&&o.tab>=1)o.tab++;   // entrou a aba Loja (posição 1)
 o.lv=Object.assign(fresh().lv,o.lv);o.sk=Object.assign(fresh().sk,o.sk);
 for(const k in o.lv)if(!Number.isFinite(o.lv[k])||o.lv[k]<0)o.lv[k]=0;
 if(o.v<6&&o.lv.wide>2){let r=0;for(let l=2;l<Math.floor(o.lv.wide);l++)r+=Math.ceil(800*Math.pow(4.5,l));o.gold+=r;o.lv.wide=2}   // Picareta ampla agora tem só 2 níveis: devolve o ouro dos níveis removidos
 for(const k in o.sk)if(!Number.isFinite(o.sk[k])||o.sk[k]<0)o.sk[k]=0;
 if(!o.bag||typeof o.bag!=="object")o.bag={v:0,n:0,o:{},ov:{}};
 o.bag={v:Number.isFinite(o.bag.v)&&o.bag.v>0?o.bag.v:0,n:Number.isFinite(o.bag.n)&&o.bag.n>0?o.bag.n:0,o:o.bag.o&&typeof o.bag.o==="object"?o.bag.o:{},ov:o.bag.ov&&typeof o.bag.ov==="object"&&!Array.isArray(o.bag.ov)?o.bag.ov:{}};
 for(const k in o.bag.ov)if(!Number.isFinite(o.bag.ov[k])||o.bag.ov[k]<0)delete o.bag.ov[k];   // valor por minério na mochila (a fornalha só aceita o que tem valor registrado)
 if(!o.fur||typeof o.fur!=="object"||Array.isArray(o.fur))o.fur={};o.fur=Object.assign(fresh().fur,o.fur);for(const k in o.fur)if(!Number.isFinite(o.fur[k])||o.fur[k]<0)o.fur[k]=0;o.fur.n=Math.floor(o.fur.n);if(o.fur.n<1)o.fur=fresh().fur;
 if(!["down","left","right","up"].includes(o.dir))o.dir="down";
 for(const k of["ach","dug","od"])if(!Array.isArray(o[k]))o[k]=[];
 o.lvl=Math.max(1,Math.floor(o.lvl)||1);
 if(!o.pk||typeof o.pk!=="object"||Array.isArray(o.pk))o.pk={};
 for(const k of["crit","ore"]){const L=Math.round(Number(o.pk[k]))||0;if(L>0)o.lvp=(Number.isFinite(o.lvp)?o.lvp:0)+L;delete o.pk[k]}   // cartas de crítico e minério por nível foram removidas: devolve os pontos para escolher outra melhoria
for(const k in o.pk)if(!Number.isFinite(o.pk[k])||o.pk[k]<0)o.pk[k]=0;
 if(o.tpBack&&!(Number.isFinite(o.tpBack.c)&&Number.isFinite(o.tpBack.d)))o.tpBack=null;
 if(!o.items||typeof o.items!=="object"||Array.isArray(o.items))o.items={};o.items=Object.assign(fresh().items,o.items);for(const k in o.items)o.items[k]=Number.isFinite(o.items[k])&&o.items[k]>0?Math.floor(o.items[k]):0;
 {const d={};if(o.fg&&typeof o.fg==="object"&&!Array.isArray(o.fg))for(const k in o.fg)if(/^-?\d+$/.test(k)&&Number.isFinite(o.fg[k])&&o.fg[k]>=0)d[k]=o.fg[k];o.fg=d}   // o que já foi colhido no bosque: coluna -> instante (S.play) da colheita

 if(!/^dyn[2-5]?$/.test(o.dsel))o.dsel="dyn";if(!/^p(as|gr|bq)$/.test(o.fsel))o.fsel="pas";   // dinamite escolhida (tecla R troca)
 o.vol=Object.assign({m:.7,s:1,a:.7},o.vol);for(const k in o.vol)if(!Number.isFinite(o.vol[k]))o.vol[k]=.7;
 if(o.v<6&&!Number.isFinite(o.seed))o.seed=0;   // saves antigos mantêm o mundo que já escavaram
 if(!Number.isFinite(o.seed)||o.seed<0)o.seed=newSeed();o.seed=Math.floor(o.seed);
 // v7: contratos e mesa de apostas
 if(!Array.isArray(o.ct))o.ct=[];
 o.ct=o.ct.filter(c=>c&&["blk","ore","dep"].includes(c.t)&&Number.isFinite(c.n)&&c.n>0&&Number.isFinite(c.g)&&c.g>=0&&(c.t!=="ore"||ORES.some(x=>x[0]===c.o))).slice(0,BAL.contracts.slots)
  .map(c=>({t:c.t,n:Math.floor(c.n),p:Number.isFinite(c.p)&&c.p>0?Math.min(Math.floor(c.p),Math.floor(c.n)):0,g:c.g,o:c.t==="ore"?c.o:"",d:Number.isFinite(c.d)&&c.d>0&&c.t!=="dep"?c.d:0,x:Number.isFinite(c.x)&&c.x>0?c.x:0}));
 if(!Number.isFinite(o.ctW)||o.ctW<0)o.ctW=0;
 if(!Number.isFinite(o.slotNet))o.slotNet=0;
 if(o.pend>0){o.gold+=o.pend;o.pend=0}   // fechou o jogo no meio de uma rodada do caça-níquel: o prêmio já sorteado é pago
 if(o.v<8)o.ach=o.ach.filter(i=>i!==49).map(i=>i>49?i-1:i);   // conquista "Cartógrafo" (marcador no mapa) foi removida: as seguintes sobem uma posição
 if(o.v<9){   // remove Picareta ampla e Aprimoramento: devolve o ouro investido e remove a conquista Túnel largo
  const refund=(l,b,k,max)=>{let total=0;for(let i=0;i<Math.min(max,Math.max(0,Math.floor(Number(l)||0)));i++)total+=Math.ceil(b*Math.pow(k,i));return total};
  o.gold+=refund(o.lv.wide,100000,14.422,4)+refund(o.lv.refine,40000,7.5,5);
  delete o.lv.wide;delete o.lv.refine;
  o.ach=o.ach.filter(i=>i!==11).map(i=>i>11?i-1:i);
 }
 delete o.marks;delete o.shards;o.v=9;return o}
let dug=new Set(),saveSeen=false;   // saveSeen: já existe save gravado por este jogo (se ele sumir, o jogador apagou o save)
try{
 const r=localStorage.getItem(SAVE_KEY);
 if(r){S=clean(JSON.parse(r));saveSeen=true}
 else{const old=localStorage.getItem("abismo-v1");   // save antigo: só aproveita o que ainda faz sentido
  if(old){const o=JSON.parse(old);S=clean({v:6,seed:newSeed(),pts:(Number(o.pts)||0)+(Number(o.shards)||0),runs:o.runs,od:o.od,vol:o.vol,best:Math.min(o.best||0,FINAL_DEPTH)});localStorage.removeItem("abismo-v1")}}   // o save v1 só é aproveitado uma vez
}catch(e){}
SEED=S.seed;
if(S.debug)S.gold=Infinity;
dug=new Set(S.dug.filter(k=>/^-?\d+,\d+$/.test(k)));
function save(){try{
 // Se o jogador apagou o save pelo navegador com o jogo aberto, não regrava o progresso antigo: recomeça do zero.
 if(saveSeen&&localStorage.getItem(SAVE_KEY)===null){saveSeen=false;wipeAll();return}
 localStorage.setItem(SAVE_KEY,JSON.stringify(Object.assign({},S,{dug:[...dug],ts:Date.now()})));saveSeen=localStorage.getItem(SAVE_KEY)!==null}catch(e){}}
let qty=1;
// variáveis de sessão (não são salvas)
let musOn=false,musT=0,ambT=0,amb=[],modal=null,levelChoiceId=0,levelChoiceTicker=0;
let cmb=0,cmbT=0,cmbPulse=0,cmbMax=0,cmbFlash=0,cmbBanner=0,cmbBannerT="",cmbLast=0,cmbLastT=0,cmbTier=0;
let skT=[0,0],skCD=[0,0],dynCD=0,dynCDt=1.5,tpCD=0,ev=0,evT=0,evNext=60+Math.random()*60;
let star=0,starT=0,starNext=60+Math.random()*120,shoot=null;   // estrela cadente: segundos de bônus restantes · tipo (0 ouro, 1 sorte) · espera até a próxima · risco no céu
let mute=false,actx=null,toasts=[],breakNoise=null,breakSfxNext=0;
let camX=0,camY=0,mX=0,mY=0,swing=0,parts=[],texts=[],shake=0,flash=0,flashC="#ff2a2a",flashText="",chestOpen=0,lowEnPulse=0,retSeen=0,layerSeen=0,jetT=0;
let holdM=false,holdS=false,lastH=0,held=null,heldC=null,lastMv=0,shiftOn=false,fallR=0,fallAcc=0,cheatBuf="",cheatT=0,cheatSurf=false,cheatPos=null;
// Códigos secretos (digitar a palavra, como em GTA). CENOURA: ouro e energia infinitos (em qualquer lugar). FINAL: teleporta para a Rocha-mãe e dispara a cena da cenoura dourada (em qualquer lugar) · CLIMA: troca o clima · SEASON: avança a estação (esses dois só valem na superfície, onde se vê o efeito).
const CHEATS=["CENOURA","CLIMA","SEASON","FINAL"],CHEATS_SURF=["CLIMA","SEASON"];

// ===== 1-nucleo/04-formulas.js — Fórmulas de dano, dureza, ouro, energia e custos (os números ficam em BAL, 00-balanceamento.js) =====
const pk=k=>S.pk[k]||0;
const gmult=()=>(1+.12*S.lv.luck)*(1+.08*S.sk.ouro)*(1+.12*pk("gold"))*(ev>0&&!evT?3:1)*(star>0&&!starT?BAL.star.gold:1);
// Dano: a picareta de cada camada vale 2,6x a anterior; a dureza dos blocos cresce 3x a cada 100 m.
// Assim as camadas fundas ficam duras mesmo com todos os upgrades no máximo (sem a picareta e os upgrades certos, ficam muito duras).
const basePow=()=>BAL.dig.powBase*Math.pow(BAL.tier.dmgMult,S.tier)*(1+.12*S.lv.sharp)*(1+.08*S.sk.dmg)*(1+.15*pk("dmg"));
const furyMult=()=>BAL.skills.fury.mult+BAL.skills.fury.per*S.lv.furia;        // dano x2 até x3,5 com a melhoria no máximo
const frenzyMult=()=>BAL.skills.frenzy.mult+BAL.skills.frenzy.per*S.lv.frenesi;   // velocidade x1,4 até x2,2 com a melhoria no máximo
// Ao manter as duas habilidades ativas, cada bônus acima de 1x é reduzido pela metade.
const furyActiveMult=()=>1+(furyMult()-1)*(skT[1]>0?BAL.skills.comboFactor:1);
const frenzyActiveMult=()=>1+(frenzyMult()-1)*(skT[0]>0?BAL.skills.comboFactor:1);
const clickPow=()=>basePow()*(skT[0]>0?furyActiveMult():1);
// Escavação automática: cada nível dá +0,25 golpe/s; a força dá +10% por nível (12 níveis de cada: ~100% do manual, sem Fúria nem crítico).
const autoDps=()=>S.lv.auto*.25*basePow()*(1+.1*S.lv.autopow);
const AUTO_ENERGY=BAL.energy.auto;   // a escavação automática gasta metade da energia por bloco
const attackSpeedMult=()=>(1+.1*pk("spd"))*(1+.05*S.lv.speed);
const skillDurationMult=()=>(1+.1*pk("duration"))*(1+.05*S.lv.duration);
const nightDive=()=>S.depth>0&&nightAmt()>=BAL.night.from;   // abaixo da superfície com a noite caída: ganha um pouco mais de XP
const xpGainMult=()=>(1+.1*pk("xp"))*(1+.1*S.lv.xp)*(1+.1*S.sk.xp)*(nightDive()?1+BAL.night.xp:1);
const oreChance=()=>Math.min(.95,((S.dir==="down"?.1:.16)+.02*S.sk.gar+.02*S.lv.luck)*(ev>0&&evT?3:1)*(star>0&&starT?BAL.star.luck:1));
const critCh=()=>Math.min(BAL.critMax,BAL.critPer*S.lv.crit);
const CRIT_MULT=BAL.dig.crit;
const fortCh=()=>Math.min(BAL.fort.max,BAL.fort.per*S.lv.fort);   // Melhoria de minérios: chance de unidades extras de minério
// Dureza dos blocos: HARD_BASE é o quanto o primeiro bloco resiste (sem upgrades, a picareta de madeira leva ~5 golpes no topo e ~13 no fim da 1ª camada).
const HARD_BASE=BAL.dig.hardBase;
const hardness=r=>r>=FINAL_DEPTH?Infinity:HARD_BASE*Math.pow(BAL.dig.hardK,r/100);
const blockGold=r=>BAL.dig.goldBase*Math.pow(BAL.dig.goldK,r/100)*gmult();
// Energia: cavar e voar gastam; só se recupera na superfície.
const maxEn=()=>Math.round((BAL.energy.base+BAL.energy.perLevel*S.lv.emax)*(1+.06*S.sk.fol)*(1+.08*pk("energy")));
const ecoMult=()=>Math.pow(1-BAL.ecoPer,S.lv.eco);   // composto: cada nível multiplica o gasto por 0,95
const jetSpdMult=()=>1+BAL.jetSpd*S.lv.jetspd;               // mochila a jato: velocidade de subida
const jetMult=()=>Math.pow(1-BAL.jetPer,S.lv.jet)*(1-.06*S.sk.jato);     // mochila a jato: custo de subir
const digCost=r=>BAL.energy.digBase*Math.pow(BAL.energy.digGrow,layerOf(r))*ecoMult();   // quanto mais fundo, mais energia cada bloco custa
// Lava: dano fixo + porcentagem da energia máxima, ambos crescem com a camada. A economia de energia não reduz; só a Resistência à lava.
const lavaRes=()=>Math.pow(1-BAL.lava.res,S.lv.lavares);   // fração do dano da lava que ainda passa (0,9 por nível)
const lavaDmg=r=>{const B=BAL.lava,L=layerOf(r);return(B.flat+B.flatL*L+(B.pct+B.pctL*L)*maxEn())*lavaRes()};
const stepCost=r=>(BAL.energy.stepBase+BAL.energy.stepLayer*layerOf(r))*ecoMult();         // custo base de um passo (descer e andar de lado = metade; subir com o jato = inteiro)
const WALK=[0];for(let d=1;d<=FINAL_DEPTH;d++)WALK[d]=WALK[d-1]+BAL.energy.stepBase+BAL.energy.stepLayer*layerOf(d-1);
const returnCost=()=>WALK[clamp(S.depth,0,FINAL_DEPTH)]*ecoMult()*jetMult();
// Energia para voltar: 0 = folga · 1 = apertado (sobra menos que o custo de subir + uma margem e uns blocos de cavada) · 2 = não dá para chegar à superfície subindo
const returnNeed=()=>returnCost()*(1+BAL.energy.retMargin)+digCost(S.depth+1)*BAL.energy.retBlocks;
const returnState=()=>{if(S.debug||S.depth<=0||S.lv.back<1)return 0;return S.en<returnCost()?2:S.en<returnNeed()?1:0};
const autoOK=()=>S.debug||S.depth<=0||S.en>returnCost()+digCost(S.depth)*AUTO_ENERGY+4;
// Custos
const tierCost=()=>Math.ceil(BAL.tier.b*Math.pow(BAL.tier.k,S.tier+1));
const upCost=(k,l)=>Math.ceil(UPS[k].b*Math.pow(UPS[k].k,l));
const teleCD=()=>Math.max(BAL.tele.min,BAL.tele.base-BAL.tele.perLevel*S.lv.tele);
// Consumáveis (loja): preço base x 1,9^(camada mais funda já alcançada). Energia: fração da energia máxima que devolvem.
const dynDesc=k=>{const D=BAL.dyn[k],r=ndec(D.r),e=ndec(D.e),cd=ndec(D.cd);
 return k==="dyn"?__("Explode uma área de raio {0}. Gasta {1} blocos de energia; recarga de {2} s. Também quebra os veios de pedra dura",r,e,cd)
  :__("Explode uma área de raio {0}. Mais forte que a anterior; gasta {1} blocos de energia; recarga de {2} s. Também quebra os veios de pedra dura",r,e,cd)};
// n e d são getters: o texto é traduzido na hora de exibir (vale também depois de trocar o idioma)
const ITEMS={
 dyn:{g:"Dinamites",get n(){return __("Dinamite")},get d(){return dynDesc("dyn")},b:BAL.items.dyn,c:"#e5412d"},
 dyn2:{g:"Dinamites",get n(){return __("Dinamite reforçada")},get d(){return dynDesc("dyn2")},b:BAL.items.dyn2,c:"#ff9a2a"},
 dyn3:{g:"Dinamites",get n(){return __("Dinamite pesada")},get d(){return dynDesc("dyn3")},b:BAL.items.dyn3,c:"#3fa8ff"},
 dyn4:{g:"Dinamites",get n(){return __("Carga de nitro")},get d(){return dynDesc("dyn4")},b:BAL.items.dyn4,c:"#b45cff"},
 dyn5:{g:"Dinamites",get n(){return __("Bomba de demolição")},get d(){return dynDesc("dyn5")},b:BAL.items.dyn5,c:"#ffd45c"},
 cen:{g:"Comida de energia",get n(){return __("Cenourinha")},get d(){return __("Recupera 10% da energia máxima. Só se colhe no bosque")},b:BAL.items.cen,c:"#ff9a3a",en:.1,noShop:1},
 sop:{g:"Comida de energia",get n(){return __("Sopa de cogumelo")},get d(){return __("Recupera 25% da energia máxima. Só se faz no caldeirão da igreja")},b:BAL.items.sop,c:"#c9a27a",en:.25,noShop:1},
 poc:{g:"Comida de energia",get n(){return __("Poção de energia")},get d(){return __("Recupera 50% da energia máxima. Só se faz no caldeirão da igreja")},b:BAL.items.poc,c:"#6ff0ff",en:.5,noShop:1},
 ptp:{get n(){return __("Poção de teleporte")},get d(){return __("Uso único: leva ao baú sem gastar energia (na superfície, volta ao ponto de onde saiu). Cai de baús ou se faz no caldeirão da igreja")},b:0,c:"#9a5cff",tp:1,noShop:1},
 pas:{get n(){return __("Peixe assado")},get d(){return __("Recupera 20% da energia máxima. Só se faz na fogueira")},b:0,c:"#e0a45f",en:.2,noShop:1},
 pgr:{get n(){return __("Peixe grelhado")},get d(){return __("Recupera 45% da energia máxima. Só se faz na fogueira")},b:0,c:"#ee8a4a",en:.45,noShop:1},
 cog:{get n(){return __("Cogumelo")},get d(){return __("Ingrediente: {0} cogumelos viram 1 Sopa de cogumelo no caldeirão da igreja",BAL.forage.soupCost)},b:0,c:"#d23a2a",noShop:1},
 pbq:{get n(){return __("Banquete do pescador")},get d(){return __("Recupera 85% da energia máxima. Só se faz na fogueira")},b:0,c:"#ffd45c",en:.85,noShop:1}
};
const itemCost=k=>Math.ceil(ITEMS[k].b*Math.pow(BAL.itemK,layerOf(S.best)));
const have=k=>S.items[k]||0;
// Quantos níveis/unidades dá para comprar agora com o ouro que se tem (mostrado como "xN" ao lado de cada melhoria e item da loja)
const affordUp=k=>{const mx=UPS[k].max;let l=S.lv[k],g=S.gold,n=0;while(l<mx){const c=upCost(k,l);if(g<c)break;g-=c;l++;n++}return n};
const affordItem=k=>{const room=99-have(k);return room<=0?0:Math.min(room,Math.floor(S.gold/itemCost(k)))};
// ----- Liberação gradual (BAL.unlock): o que ainda não foi liberado fica escondido -----
const BUILD_NAMES={furnace:N_("Fornalha"),board:N_("Quadro de contratos"),slot:N_("Caça-níquel")};
function unlockAt(kind,k){const u=BAL.unlock[kind];return u&&u[k]!=null?u[k]:0}
function isUnl(kind,k){
 if(!BAL.unlock.on||S.debug)return true;
 if(kind==="ups"&&S.lv[k]>0)return true;                 // já comprou: continua visível
 if(kind==="items"&&have(k)>0)return true;
 if(kind==="build"&&(k==="furnace"?S.fur.n>0||S.refined>0:k==="board"?S.ctDone>0:S.spins>0))return true;
 return S.best>=unlockAt(kind,k);
}
// nomes (já traduzidos) do que se libera ao passar de `from` até `to` m; sem `from`, tudo que ainda está bloqueado
function unlockNames(from,to){
 const out=[],add=(kind,k,nm)=>{const a=unlockAt(kind,k);if(a>from&&a<=to&&(to>=1e9?!isUnl(kind,k):true))out.push([a,nm])};
 for(const k in UPS)add("ups",k,UPS[k].n);
 for(const k in ITEMS)if(!ITEMS[k].noShop)add("items",k,ITEMS[k].n);
 for(const k in BUILD_NAMES)add("build",k,__(BUILD_NAMES[k]));
 return out;
}
let ulSeen=-1;
function checkUnlocks(){   // avisa na tela quando o recorde libera algo novo (não avisa ao carregar o jogo nem ao apagar o progresso)
 if(!BAL.unlock.on||S.debug||ulSeen<0||S.best<ulSeen){ulSeen=S.best;return}
 if(S.best===ulSeen)return;
 const l=unlockNames(ulSeen,S.best);ulSeen=S.best;
 if(l.length)showUnlock(l.map(x=>x[1]));
}
// Faixa própria de "novidade liberada": dourada, com fanfarra, no canto inferior direito (#notis, junto com as conquistas, sem cobrir uma à outra); várias seguidas entram em fila
let ulQ=[],ulT=0;
function showUnlock(names){ulQ.push(names);if(!ulT)ulNext()}
function ulNext(){
 const el=$("unl");ulT=0;if(!el)return;
 const n=ulQ.shift();if(!n){el.className="";return}
 el.innerHTML="<small>"+__("NOVIDADE LIBERADA")+"</small>"+n.slice(0,3).map(x=>"<b>"+x+"</b>").join("")+(n.length>3?"<span>"+__("e mais {0}",n.length-3)+"</span>":"");
 el.className="";void el.offsetWidth;el.className="on";
 [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>sfx(f,.2,"triangle"),i*85));setTimeout(()=>sfx(2093,.35,"sine"),430);
 ulT=setTimeout(ulNext,4300);
}
function nextUnlockText(){   // dica no topo das melhorias: o que vem a seguir
 const l=unlockNames(S.best,1e9);if(!l.length)return"";
 const m=Math.min(...l.map(x=>x[0]));
 return __("Próxima novidade aos {0} m: {1}",m,l.filter(x=>x[0]===m).map(x=>x[1]).join(", "));
}
// Renascer: fragmentos = 1 por camada de 100 m alcançada nesta vida (+5 por chegar ao fundo)
const prestGain=()=>S.runMax>=LAYER_HEIGHT?Math.floor(S.runMax/LAYER_HEIGHT)+(S.runMax>=FINAL_DEPTH?BAL.prestigeBonus:0):0;

// ===== 1-nucleo/05-audio-avisos.js — Efeitos sonoros, música ambiente, avisos na tela e truque secreto =====
function ac(){actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();return actx}
function sfx(f,d,t){if(mute||S.vol.s<=0)return;try{ac();const o=actx.createOscillator(),g=actx.createGain();o.type=t||"square";o.frequency.value=f;g.gain.value=.04*S.vol.s;g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+d)}catch(e){}}
// ----- Som por tipo de bloco -----
// "dirt" terra, argila e areia (camadas 0 a 2) · "stone" pedra (as demais camadas) · "ore" minério (veio de minério ou o bloco que sorteou minério) · "lava" · "hard" veio de pedra dura (só a dinamite quebra)
// Cada tipo tem um som de golpe (hitSfx) e outro de quebra (breakSfx), todos sintetizados aqui (sem arquivos de áudio).
const DIRT_LAYERS=3;
function blockKind(c,r,ore){
 if(isVein(c,r))return"hard";
 if(lava(c,r))return"lava";
 if(ore||oreVeinAt(c,r)>=0)return"ore";
 return layerOf(r)<DIRT_LAYERS?"dirt":"stone";
}
function noiseBuf(){if(!breakNoise){breakNoise=actx.createBuffer(1,Math.floor(actx.sampleRate*.7),actx.sampleRate);const d=breakNoise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return breakNoise}
// rajada de ruído filtrada: início t · filtro (tipo, frequência, Q) · volume · duração da queda · fTo = frequência final do filtro (varredura), opcional
function nz(t,type,f,q,vol,dec,fTo){const n=actx.createBufferSource(),fl=actx.createBiquadFilter(),g=actx.createGain();n.buffer=noiseBuf();fl.type=type;fl.frequency.setValueAtTime(f,t);if(fTo)fl.frequency.exponentialRampToValueAtTime(fTo,t+dec);fl.Q.value=q;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dec);n.connect(fl);fl.connect(g);g.connect(actx.destination);n.start(t,Math.random()*.25);n.stop(t+dec+.02)}
// tom que vai de f0 a f1 enquanto some
function tn(t,type,f0,f1,vol,dur){const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur*.85);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+dur+.02)}
// tinido metálico: três parciais que não são múltiplos da base (soa como metal ou cristal, não como nota)
function ting(t,f,vol,dec){for(const[m,a]of[[1,1],[2.76,.5],[5.4,.25]])tn(t,"sine",f*m,f*m*.995,vol*a,dec/Math.sqrt(m))}
// Combo: cada golpe sobe uma nota da escala pentatônica (a altura vai subindo até a 3ª oitava); a cada 5 golpes entra um tinido e,
// nos marcos (ms >= 0), uma fanfarra de acorde maior subindo + batida grave. Ao acabar um combo grande, duas notas descendo.
function comboSfx(n,ms){
 if(mute||S.vol.s<=0)return;
 try{ac();const t=actx.currentTime,v=S.vol.s,sc=[0,2,4,7,9],st=sc[n%5]+12*Math.min(1,Math.floor(n/5)),f=330*Math.pow(2,st/12);
  tn(t,"triangle",f,f,.045*v,.1);
  if(n>=5)tn(t,"sine",f*2,f*2,.02*v,.12);
  if(n%5===0&&ms<0)ting(t+.02,f*2,.025*v,.3);
  if(ms>=0){const b=440*Math.pow(2,ms*2/12);
   [1,1.26,1.5,2].forEach((m,i)=>tn(t+.07*i,"triangle",b*m,b*m,.045*v,.3));
   ting(t+.28,b*2,.03*v,.6);tn(t,"sine",140,50,.08*v,.25)}
 }catch(e){}
}
function comboEndSfx(){
 if(mute||S.vol.s<=0)return;
 try{ac();const t=actx.currentTime,v=S.vol.s;tn(t,"triangle",392,280,.035*v,.2);tn(t+.12,"triangle",294,170,.035*v,.3)}catch(e){}
}
// Quebra do bloco (limitada a uma a cada 45 ms para não virar chiado quando quebra muita coisa): oi = índice do minério em ORES
function breakSfx(depth,kind,oi){
 if(mute||S.vol.s<=0)return;
 try{ac();const t=actx.currentTime;if(t<breakSfxNext)return;breakSfxNext=t+.045;
  const v=S.vol.s,lay=layerOf(depth),r=Math.random();
  if(kind==="dirt"){          // terra: baque surdo, ruído abafado e uns grãos caindo depois
   nz(t,"lowpass",650+lay*120+r*150,.5,.2*v,.12);tn(t,"sine",105+r*20,55,.08*v,.09);
   nz(t+.035,"bandpass",1500+r*500,1,.03*v,.05);nz(t+.07,"bandpass",1900+r*500,1,.02*v,.04);
  }else if(kind==="lava"){    // lava: chiado que vai ficando grave, bolha estourando e um ronco
   nz(t,"highpass",3200,.7,.11*v,.4,900);tn(t,"sine",170+r*30,70,.08*v,.22);tn(t+.09,"sine",260+r*40,120,.045*v,.14);tn(t,"triangle",62,45,.05*v,.3);
  }else{                      // pedra: estalo seco, mais agudo que a terra; minério = o mesmo estalo (mais baixo) com um tinido por cima
   const k=kind==="ore"?.7:1;
   nz(t,"bandpass",2400+r*500,1.1,.14*k*v,.05);nz(t,"highpass",5000,.7,.05*k*v,.02);nz(t,"lowpass",1500+lay*80,.8,.08*k*v,.08);
   tn(t,"triangle",210+lay*6+r*30,105,.04*k*v,.085);tn(t,"sine",620+r*80,330,.015*k*v,.03);
   if(kind==="ore"){ting(t+.01,880+(oi||0)*105,.045*v,.3);nz(t+.01,"highpass",6000,.7,.02*v,.06)}
  }
 }catch(e){}
}
// Golpe que ainda não quebrou o bloco (só o golpe manual toca): um "toc" curto por tipo; em pedra dura, um clangor metálico
function hitSfx(kind,depth){
 if(mute||S.vol.s<=0)return;
 try{ac();const t=actx.currentTime,v=S.vol.s,lay=layerOf(depth),r=Math.random();
  if(kind==="dirt"){nz(t,"lowpass",520+r*160,.5,.14*v,.06);tn(t,"sine",85+r*15,58,.06*v,.06)}
  else if(kind==="lava"){tn(t,"sine",190+r*40,95,.07*v,.09);nz(t,"highpass",3500,.7,.06*v,.1)}
  else if(kind==="hard"){ting(t,1250+r*60,.05*v,.16);nz(t,"bandpass",4200,1.5,.03*v,.04)}
  else{nz(t,"bandpass",2800+r*500,1.4,.14*v,.03);nz(t,"highpass",5500,.7,.04*v,.015);tn(t,"triangle",320+lay*8+r*40,200,.03*v,.04);if(kind==="ore")ting(t,1500+r*150,.03*v,.1)}
 }catch(e){}
}
function note(){try{if(!actx)return;const sc=[0,3,5,7,10,12],f=(110+layerOf(S.depth)*6)*Math.pow(2,sc[Math.floor(Math.random()*6)]/12),o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.025*S.vol.m,t+.6);g.gain.exponentialRampToValueAtTime(.0001,t+3);o.connect(g);g.connect(actx.destination);o.start();o.stop(t+3.1)}catch(e){}}
function drip(){if(!actx)return;try{const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;o.type="sine";o.frequency.value=300+layerOf(S.depth)%BIO.length*110+Math.random()*120;g.gain.setValueAtTime(.02*S.vol.a,t);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g);g.connect(actx.destination);o.start();o.stop(t+.3)}catch(e){}}
// ----- Fila de avisos -----
// Cada aviso vira uma linha na pilha #toasts (abaixo da barra fixa #layer): entram um atrás do outro, ficam um tempo e somem. No máximo TOAST_MAX ao mesmo tempo (o mais antigo sai primeiro).
// Aviso repetido (mesmo texto ainda na tela) não duplica: só renova o tempo dele. O texto longo fica mais tempo (4 s a 8 s).
const TOAST_MAX=5;
function toastClean(m){return String(m).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF\u2B00-\u2BFF]|\uFE0F|\u200D|\u20E3/g,"").trim()}
function toastHas(m){const t=toastClean(m);return toasts.some(x=>x.txt===t)}
function sayK(k,m){
 const txt=toastClean(m),dur=Math.min(8,Math.max(4,2+txt.length*.05));
 if(!txt)return;
 const old=toasts.find(x=>x.txt===txt);
 if(old){old.t=dur;old.el.classList.remove("out");return}
 const box=document.getElementById("toasts");if(!box)return;
 const el=document.createElement("div");el.className="toast";
 const ic=document.createElement("i");ic.className="ic";ic.style.backgroundImage=noteIcon(k);
 el.appendChild(ic);el.appendChild(document.createTextNode(txt));box.appendChild(el);
 toastFit(el);toasts.push({el,txt,t:dur});
 while(toasts.length>TOAST_MAX){const o=toasts.shift();o.el.remove()}
}
// tenta caber em UMA linha: se faltar espaço, a letra diminui (até 60%); só então quebra a linha
function toastFit(el){
 const pf=el.parentElement.parentElement,avail=pf.clientWidth-(matchMedia("(max-width:760px)").matches?96:104);
 el.style.fontSize="";const base=parseFloat(getComputedStyle(el).fontSize)||12,nat=el.scrollWidth;
 if(avail>0&&nat>avail){const r=avail/nat;if(r>=.6)el.style.fontSize=(base*r*.97).toFixed(2)+"px";else el.style.whiteSpace="normal"}
}
function toastTick(dt){
 for(let i=toasts.length-1;i>=0;i--){const x=toasts[i];x.t-=dt;if(x.t<=0){x.el.remove();toasts.splice(i,1)}else if(x.t<.5)x.el.classList.add("out")}
}
function sayMine(m){sayK("mine",m)}
function sayFish(m){sayK("fish",m)}
function sayGold(m){sayK("gold",m)}
function sayWeather(m){sayK("weather",m)}
function sayStar(m){sayK("star",m)}
function sayLevel(m){sayK("level",m)}
function sayPower(m){sayK("power",m)}
function sayFood(m){sayK("food",m)}
function sayWarn(m){sayK("warn",m)}
function sayInfo(m){sayK("info",m)}
// Executa um código secreto digitado (ver CHEATS em 1-nucleo/03-estado-save.js e o tratamento em 4-interface/04-entrada.js)
function runCheat(w){
 if(w==="CENOURA"){toggleDbg();return}
 // se a primeira letra ("S" de SEASON) desceu um bloco no buraco, desfaz: o código não deve mudar a posição do jogador
 if(cheatPos&&S.mc===cheatPos.mc&&S.depth===cheatPos.depth+1){S.depth=cheatPos.depth;S.best=cheatPos.best;S.runMax=cheatPos.runMax;mY=camY=S.depth;S.prog=0}
 if(w==="FINAL"){   // vai direto para a Rocha-mãe (abre o poço da coluna atual, para dar para subir de volta) e roda a cena de chegada
  if(modal)return;S.mc=clamp(S.mc,-HALF,HALF);for(let r=1;r<FINAL_DEPTH;r++)dug.add(S.mc+","+r);
  S.depth=FINAL_DEPTH;S.best=Math.max(S.best,FINAL_DEPTH);S.runMax=Math.max(S.runMax,FINAL_DEPTH);S.prog=0;S.en=maxEn();
  mX=camX=S.mc;mY=camY=S.depth;layerSeen=BIO.length-1;carrotC=null;reachBottom();return}
 if(w==="CLIMA"){const k=WX_KEYS[(WX_KEYS.indexOf(wx.cur)+1)%WX_KEYS.length];weatherSet(k);sayWeather(__("Clima: {0}",WX[k].n));return}
 if(w==="SEASON"){const L=BAL.season.len,i=(Math.floor(S.sea/L)+1)%4;S.sea=i*L+L/2;sayWeather(__("Estação: {0}",SEASONS[i].n))}   // vai para o meio da próxima estação (a paleta dela vale por inteira ali)
}
function toggleDbg(){S.debug=!S.debug;if(S.debug){S.real=S.gold;S.gold=Infinity}else S.gold=S.real||0;sayInfo(S.debug?__("Cenoura! Ouro e energia infinitos"):__("Cenoura desligada"));build()}

// ===== 2-sistemas/01-melhorias.js — Tabela de melhorias (mesa de trabalho) e compra de melhorias, picareta e consumáveis (loja) =====
// g = grupo no painel · n = nome · d = descrição · b = custo base · k = crescimento do custo · max = nível máximo
const fmtN=x=>ndec(+x.toFixed(2));
const fortPct=l=>Math.min(BAL.fort.max,BAL.fort.per*l)*100;
const fmtLight=(l,v)=>__("{0} blocos",ndec((l*v).toFixed(1)));
// n e d: o nome é um getter e a descrição uma função, ambos traduzidos na hora de exibir (g = grupo, traduzido pelo painel)
const UPS={
 sharp:{g:"Picareta",get n(){return __("Afiar picareta")},d:l=>__("+12% de dano da picareta por nível"),...BAL.ups.sharp},
 speed:{g:"Picareta",get n(){return __("Velocidade de escavação")},d:l=>__("+5% de velocidade de escavação por nível"),...BAL.ups.speed},
 crit:{g:"Picareta",get n(){return __("Chance de golpe crítico")},d:l=>__("+{0}% de chance de crítico (dano x3) por nível, até {1}%",Math.round(BAL.critPer*100),Math.round(BAL.critMax*100)),...BAL.ups.crit},
 emax:{g:"Energia",get n(){return __("Energia máxima")},d:l=>__("+30 de energia máxima por nível"),...BAL.ups.emax},
 eco:{g:"Energia",get n(){return __("Economia de energia")},d:l=>__("-5% de gasto de energia por nível (cumulativo). Gasto atual: {0}%",Math.round(Math.pow(1-BAL.ecoPer,l)*100)),...BAL.ups.eco},
 jet:{g:"Energia",get n(){return __("Eficiência da mochila a jato")},d:l=>__("-5% de energia gasta no jato por nível (cumulativo). Gasto atual: {0}%",Math.round(Math.pow(1-BAL.jetPer,l)*100)),...BAL.ups.jet},
 jetspd:{g:"Energia",get n(){return __("Velocidade da mochila a jato")},d:l=>__("+10% de velocidade do jato por nível"),...BAL.ups.jetspd},
 lavares:{g:"Energia",get n(){return __("Resistência à lava")},d:l=>l<BAL.ups.lavares.max?__("-10% do dano da lava por nível. Agora: {0}% (próximo: {1}%)",Math.round(Math.pow(1-BAL.lava.res,l)*100),Math.round(Math.pow(1-BAL.lava.res,l+1)*100)):__("-10% do dano da lava por nível. Agora: {0}%",Math.round(Math.pow(1-BAL.lava.res,l)*100)),...BAL.ups.lavares},
 auto:{g:"Escavação automática",get n(){return __("Escavação automática")},d:l=>__("Quebra o bloco à frente sozinho: +0,25 golpe/s por nível. Gasta metade da energia, mas é mais fraco"),...BAL.ups.auto},
 autopow:{g:"Escavação automática",get n(){return __("Força da escavação automática")},d:l=>__("+10% de dano dos golpes automáticos por nível"),...BAL.ups.autopow},
 luck:{g:"Sorte e experiência",get n(){return __("Sorte para ouro e minérios")},d:l=>__("+12% de ouro e +2% de chance de minério por nível"),...BAL.ups.luck},
 xp:{g:"Sorte e experiência",get n(){return __("Ganho de experiência")},d:l=>__("+10% de experiência por nível"),...BAL.ups.xp},
 duration:{g:"Habilidades",get n(){return __("Duração das habilidades")},d:l=>__("+5% de duração da Fúria e da Frenética por nível"),...BAL.ups.duration},
 furia:{g:"Habilidades",get n(){return __("Potência da Fúria do Minerador")},d:l=>{const a=fmtN(BAL.skills.fury.mult+BAL.skills.fury.per*l),cd=BAL.skills.fury.cd;return l<BAL.ups.furia.max?__("Dano: x{0} (próximo: x{1}). Recarga: {2} s",a,fmtN(BAL.skills.fury.mult+BAL.skills.fury.per*(l+1)),cd):__("Dano: x{0}. Recarga: {1} s",a,cd)},...BAL.ups.furia},
 frenesi:{g:"Habilidades",get n(){return __("Potência da Escavação Frenética")},d:l=>{const a=fmtN(BAL.skills.frenzy.mult+BAL.skills.frenzy.per*l),cd=BAL.skills.frenzy.cd;return l<BAL.ups.frenesi.max?__("Velocidade: x{0} (próximo: x{1}). Recarga: {2} s",a,fmtN(BAL.skills.frenzy.mult+BAL.skills.frenzy.per*(l+1)),cd):__("Velocidade: x{0}. Recarga: {1} s",a,cd)},...BAL.ups.frenesi},
 lant:{g:"Habilidades",get n(){return __("Lanterna")},d:l=>l<BAL.ups.lant.max?__("Mais luz no escuro: {0} (próximo: {1})",fmtLight(l,BAL.lant.light),fmtLight(l+1,BAL.lant.light)):__("Mais luz no escuro: {0}",fmtLight(l,BAL.lant.light)),...BAL.ups.lant},
 pet:{g:"Habilidades",get n(){return __("Vagalume companheiro")},d:l=>l<BAL.ups.pet.max?__("Vagalume que ilumina o escuro: {0} (próximo: {1})",fmtLight(l,BAL.pet.light),fmtLight(l+1,BAL.pet.light)):__("Vagalume que ilumina o escuro: {0}",fmtLight(l,BAL.pet.light)),...BAL.ups.pet},
 furn:{g:"Fornalha",get n(){return __("Velocidade da fornalha")},d:l=>l<BAL.ups.furn.max?__("Refina {0} minérios/s (próximo: {1}). Refinado vale +{2}% de ouro",ndec(furRate(l).toFixed(2)),ndec(furRate(l+1).toFixed(2)),Math.round(BAL.furnace.bonus*100)):__("Refina {0} minérios/s. Refinado vale +{1}% de ouro",ndec(furRate(l).toFixed(2)),Math.round(BAL.furnace.bonus*100)),...BAL.ups.furn},
 fort:{g:"Sorte e experiência",get n(){return __("Melhoria de minérios")},d:l=>{const ch=Math.round(fortPct(l)),ex=Math.max(1,Math.ceil(l/2));return l<BAL.ups.fort.max?__("{0}% de chance de minério render extras (+1 a +{1}). Próximo: {2}%",ch,ex,Math.round(fortPct(l+1))):__("{0}% de chance de minério render extras (+1 a +{1})",ch,ex)},...BAL.ups.fort},
 rod:{g:"Pesca",get n(){return __("Vara de pesca")},d:l=>l<BAL.ups.rod.max?__("Zona verde da pesca: {0}% da pista (próximo: {1}%)",Math.round(rodZone(l)/BAL.fish.bar.h*100),Math.round(rodZone(l+1)/BAL.fish.bar.h*100)):__("Zona verde da pesca: {0}% da pista",Math.round(rodZone(l)/BAL.fish.bar.h*100)),...BAL.ups.rod},
 bait:{g:"Pesca",get n(){return __("Isca")},d:l=>l<BAL.ups.bait.max?__("Peixe morde {0}% mais rápido; raros {1}% mais (próximo: {2}% e {3}%)",Math.round((1-baitBite(l))*100),Math.round((baitRare(l)-1)*100),Math.round((1-baitBite(l+1))*100),Math.round((baitRare(l+1)-1)*100)):__("Peixe morde {0}% mais rápido; raros {1}% mais",Math.round((1-baitBite(l))*100),Math.round((baitRare(l)-1)*100)),...BAL.ups.bait},
 back:{g:"Energia",get n(){return __("Medidor de retorno")},d:l=>l<1?__("Marca na barra de energia a reserva para voltar e pulsa quando fica apertada. Compra única"):__("Comprado: a barra mostra a reserva para voltar e avisa quando fica apertada"),...BAL.ups.back},
 clock:{g:"Utilidades",get n(){return __("Relógio")},d:l=>l<1?__("Relógio de sol e lua na barra do topo (o dia dura {0} min)",Math.round(BAL.day.len/60)):__("Comprado: hora do dia na barra do topo (passe o mouse para ver o período)"),...BAL.ups.clock},
 tele:{g:"Habilidades",get n(){return __("Teleporte")},d:l=>{const c=Math.max(BAL.tele.min,BAL.tele.base-BAL.tele.perLevel*l);return l<1?__("Teleporte ao baú sem gastar energia; na superfície, volta de onde saiu"):l<BAL.ups.tele.max?__("Recarga: {0} s ({1} s no próximo)",c,Math.max(BAL.tele.min,BAL.tele.base-BAL.tele.perLevel*(l+1))):__("Recarga: {0} s",c)},...BAL.ups.tele}
};
function buy(k){
 if(!nearBench()||!isUnl("ups",k))return;
 let n=qty===0?(S.debug?100:1e9):qty,done=0;
 while(done<n){const l=S.lv[k];if(l>=UPS[k].max)break;const c=upCost(k,l);if(S.gold<c)break;S.gold-=c;S.lv[k]++;done++}
 if(done){sfx(700,.12,"triangle");sfx(940,.14,"triangle");if(k==="emax")S.en=Math.max(S.en,Math.min(maxEn(),S.en+30*done))}
 build();
}
function buyTier(){
 if(!nearBench()||S.tier>=TIERS.length-1)return;
 const c=tierCost();if(S.gold<c)return;
 S.gold-=c;S.tier++;sfx(520,.2,"sawtooth");sfx(780,.3,"triangle");sayMine(__("Nova picareta: {0}",__(TIERS[S.tier])));build();
}
// Loja de consumáveis (fica na superfície, à direita do baú): dinamite e comida que recupera energia.
function buyItem(k){
 if(!nearShop()||!ITEMS[k]||ITEMS[k].noShop||!isUnl("items",k))return;
 let n=qty===0?(S.debug?100:1e9):qty,done=0;
 while(done<n&&have(k)+done<99){const c=itemCost(k);if(S.gold<c)break;S.gold-=c;done++}
 if(done){S.items[k]=have(k)+done;if(DYN_IDS.includes(k)&&have(S.dsel)<1)S.dsel=k;sfx(700,.12,"triangle");sfx(940,.14,"triangle")}
 build();
}
// Comer/usar um item de energia (clique do mouse na barra): só no subsolo e se faltar energia.
function useItem(k){
 const it=ITEMS[k];if(modal)return;if(it&&it.tp){teleport(true);return}
 if(!it||!it.en)return;
 if(have(k)<1){sayWarn(__("Sem {0}: compre na loja (na superfície)",it.n));return}
 if(atSurface()){sayPower(__("Na superfície a energia já se recupera sozinha"));return}
 const m=maxEn();if(S.en>=m-.5){sayPower(__("Energia já está cheia"));return}
 if(!S.debug)S.items[k]--;S.eaten++;
 const g=Math.min(m-S.en,m*it.en);S.en+=g;
 const p=blockXY(S.mc,S.depth);texts.push({x:p.x,y:p.y-T*.8,t:0,s:__("{0}: +{1} de energia",it.n,Math.round(g)),c:"#6ff0ff",big:1});
 for(let i=0;i<10;i++)parts.push({x:p.x,y:p.y-T*.4,vx:(Math.random()-.5)*160,vy:-60-Math.random()*140,l:.6,c:it.c});
 sfx(660,.1,"sine");sfx(990,.14,"sine");refresh();
}

// ===== 2-sistemas/02-energia-mochila.js — Energia, morte, venda no baú e teleporte =====
const atSurface=()=>S.depth<=0;
const onGround=()=>S.depth===0;   // no chão (voando acima da linha 0 não vale): só assim se usa mesa, baú, loja, fornalha, quadro, cama, caça-níquel e fogueira
const nearChest=()=>onGround()&&Math.abs(S.mc-CHEST_C)<=1;
const nearBench=()=>onGround()&&Math.abs(S.mc-BENCH_C)<=1;
const nearBed=()=>onGround()&&Math.abs(S.mc-BED_C)<=1;
const nearSlot=()=>onGround()&&isUnl("build","slot")&&Math.abs(S.mc-SLOT_C)<=1;
const nearBoard=()=>onGround()&&isUnl("build","board")&&Math.abs(S.mc-BOARD_C)<=1;
const nearFurnace=()=>onGround()&&isUnl("build","furnace")&&Math.abs(S.mc-FURN_C)<=1;
const nearShop=()=>onGround()&&Math.abs(S.mc-SHOP_C)<=1;
const nearKeeper=()=>onGround()&&Math.abs(S.mc-KEEPER_C)<=1.3;   // perto do Izans (vender peixes)
const JET_FLAME=.3;
function spend(n){if(S.debug||S.depth<=0)return;S.en-=n;if(lowEnPulse<=0&&S.en<maxEn()*.25)lowEnPulse=1;if(S.en<=0){S.en=0;die()}}
let deathLock=0;
function showDeath(info){
 if(modal)return;                                   // não atropela outra janela aberta
 const b=openModal("death");b.style.maxWidth="420px";
 const ores=Object.entries(info.o).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>{const o=ORES.find(x=>x[0]===k);return"<span><i style='background:"+(o?o[2]:"#8d9299")+"'></i>"+__(k)+" x"+v+"</span>"}).join("");
 const eat=Object.keys(ITEMS).filter(k=>ITEMS[k].en),noFood=eat.every(k=>have(k)<1);
 const tip=noFood?__("Leve <b>comida de energia</b> (cenourinha do bosque, sopa e poção do caldeirão, peixe da fogueira): ela fica na barra ao lado das habilidades e recupera energia no subsolo.")
  :S.lv.emax<5?__("Melhore a <b>Energia máxima</b> na mesa de trabalho para ir mais fundo em cada descida.")
  :S.lv.tele<1?__("O <b>Teleporte</b> leva ao baú sem gastar energia: ótimo para voltar com a mochila cheia.")
  :__("Comece a subir quando a energia chegar a 25%: subir com a mochila a jato gasta mais.");
 b.innerHTML="<div class='dead'><h2>"+__("SEM ENERGIA")+"</h2><div class='sub'>"+(info.n?__("Você apagou e a mochila ficou para trás."):__("Você apagou e voltou à superfície."))+"</div>"
  +"<div class='grid'><div class='st'><b>"+fmt(info.depth)+" m</b><small>"+__("PROFUNDIDADE · {0}",layerName(info.depth).toUpperCase())+"</small></div>"
  +"<div class='st'><b>"+fmt(S.best)+" m</b><small>"+__("RECORDE")+"</small></div>"
  +"<div class='st lost'><b>"+(info.n?"-"+fmt(info.v):"0")+"</b><small>"+__("OURO PERDIDO")+"</small></div>"
  +"<div class='st lost'><b>"+(info.n?"-"+info.n:"0")+"</b><small>"+__("ITENS PERDIDOS")+"</small></div></div>"
  +(ores?"<div class='ores'>"+ores+"</div>":"")
  +"<div class='tip'>"+tip+"</div><button id='deadok'>"+__("Voltar a cavar")+"</button></div>";
 $("deadok").onclick=closeModal;deathLock=performance.now()+700;
}
function die(){
 const lost=S.bag.v,n=S.bag.n,info={v:lost,n,o:Object.assign({},S.bag.o),depth:S.depth};
 S.bag={v:0,n:0,o:{},ov:{}};S.deaths++;S.prog=0;cmb=0;cmbT=0;
 S.depth=0;S.mc=0;S.dir="down";S.en=maxEn();
 mX=0;mY=0;camX=0;camY=0;
 flash=1;flashC="#ff2a2a";flashText="";sfx(110,.6,"sawtooth");sfx(70,.8,"square");
 sayWarn(n?__("Você apagou! Perdeu {0} itens ({1} de ouro)",n,fmt(lost)):__("Você apagou e voltou à superfície"));
 showDeath(info);
}
function sellBag(){
 const b=S.bag;if(b.n<=0&&b.v<=0)return;
 const v=b.v,n=b.n;S.gold+=v;S.total+=v;S.sold++;S.bag={v:0,n:0,o:{},ov:{}};
 gainXp(Math.min(60,n*.3));chestOpen=1;
 const p=chestXY();texts.push({x:p.x,y:p.y-T*.8,t:0,s:__("Vendido: +{0}",fmt(v)),c:"#ffd45c",big:1});
 for(let i=0;i<Math.min(40,8+n);i++)parts.push({x:p.x+(Math.random()-.5)*T,y:p.y,vx:(Math.random()-.5)*260,vy:-180-Math.random()*320,l:1,c:i%3?"#ffd45c":"#fff3a0",big:1});
 sfx(880,.1,"triangle");setTimeout(()=>sfx(1175,.12,"triangle"),90);setTimeout(()=>sfx(1568,.2,"triangle"),180);
 refresh();
}
// Vende só quando o jogador pede: clique do mouse no baú ou Espaço ao lado dele. Devolve true se tratou o comando (não cava).
function chestUse(){
 if(!nearChest())return false;
 if(S.bag.n>0)sellBag();else sayWarn(__("Mochila vazia: nada para vender."));
 return true;
}
function chestHit(px,py){   // o ponto (px,py) da tela está sobre o desenho do baú?
 const u=pu(),cs=sprChest(chestOpen>.1),c=chestXY().x,y=rowY(0);
 return px>=c-cs.w*u/2&&px<=c+cs.w*u/2&&py>=y-cs.h*u&&py<=y;
}
function teleport(pot){   // pot: poção de teleporte (uso único, sem nível de teleporte nem recarga)
 if(modal||(!pot&&(S.lv.tele<1||tpCD>0)))return;
 if(pot&&have("ptp")<1){sayWarn(__("Sem Poção de teleporte"));return}
 if(S.depth>0){S.tpBack={c:S.mc,d:S.depth};goTo(CHEST_C,0)}
 else if(S.tpBack&&isDug(S.tpBack.c,S.tpBack.d-1)){goTo(S.tpBack.c,S.tpBack.d);S.tpBack=null}
 else{sayInfo(__("Teleporte: use no subsolo para subir ao baú"));return}
 if(pot){if(!S.debug)S.items.ptp--;S.ptpUsed++}else tpCD=teleCD();
 S.tps++;sfx(300,.3,"sine");sfx(900,.35,"sine");
}
function goTo(c,d){
 for(let i=0;i<26;i++)parts.push({x:W/2+(mX-camX)*T,y:rowY(mY)-T*.5,vx:(Math.random()-.5)*340,vy:(Math.random()-.5)*340,l:.6,c:i%2?"#9ad9ff":"#fff"});
 S.mc=c;S.depth=d;S.prog=0;S.dir="down";mX=c;mY=d;camX=c;camY=d;flash=.6;flashC="#7ad0ff";flashText="";
 for(let i=0;i<26;i++)parts.push({x:W/2+(mX-camX)*T,y:rowY(mY)-T*.5,vx:(Math.random()-.5)*340,vy:(Math.random()-.5)*340,l:.6,c:i%2?"#9ad9ff":"#fff"});
}

// ===== 2-sistemas/03-nivel-xp.js — Experiência e escolha de melhoria a cada nível =====
const PK={dmg:[N_("Dano da picareta"),N_("+15% de dano"),.15],spd:[N_("Velocidade de ataque"),N_("+10% de velocidade ao minerar"),.1],duration:[N_("Duração das habilidades"),N_("+10% de duração"),.1],gold:[N_("Ouro extra"),N_("+12% de ouro"),.12],energy:[N_("Energia máxima"),N_("+8% de energia máxima"),.08],mov:[N_("Velocidade de movimento"),N_("+10% de velocidade"),.1],xp:[N_("Ganho de experiência"),N_("+10% de experiência"),.1]};
const RAR=[[N_("Comum"),1,"#9aa0a6",60],[N_("Incomum"),1.5,"#6fcf6f",25],[N_("Rara"),2,"#5aa0ff",10],[N_("Épica"),3,"#b06cff",4],[N_("Lendária"),5,"#ffb43a",1]];
const xpNeed=l=>Math.round(BAL.xp.base*Math.pow(BAL.xp.k,l-1));
function gainXp(n){if(!(n>0)||!isFinite(n))return;S.xp+=n*xpGainMult();let g=0;while(S.xp>=xpNeed(S.lvl)&&g++<50){S.xp-=xpNeed(S.lvl);S.lvl++;S.lvp++;sayLevel(__("Nível {0}!",S.lvl));sfx(1100,.4,"sine")}if(S.lvp>0&&!modal)levelUp()}
function clearLevelChoiceTimer(){clearInterval(levelChoiceTicker);levelChoiceTicker=0;levelChoiceId++}
function rollPerks(n){const pool=Object.keys(PK).filter(k=>pk(k)<10),out=[];while(out.length<n&&pool.length){const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0];let r=Math.random()*100,ri=0;for(;ri<4;ri++){r-=RAR[ri][3];if(r<0)break}out.push([k,ri])}return out}
function addPerk(k,m){S.pk[k]=Math.min(10,pk(k)+m)}
function openModal(m){modal=m;held=null;holdS=false;$("ov").classList.add("on");const b=$("bx");b.style.cssText="";$("ov").style.padding="";b.innerHTML="";sfx(520,.05,"sine");return b}
function closeModal(){clearLevelChoiceTimer();modal=null;setHeld();$("ov").classList.remove("on");refresh();if(S.lvp>0)levelUp()}
// Escolha por teclado: lvSel = cartão selecionado, lvPick = confirma o selecionado, lvLock = trava curta contra apertar Espaço sem querer ao abrir.
let lvSel=0,lvN=0,lvPick=null,lvLock=0;
function lvMove(d){if(modal!=="lv"||lvN<1)return;lvSel=(lvSel+d+lvN)%lvN;lvPaint();sfx(560,.04,"sine")}
function lvPaint(){document.querySelectorAll("#bx .card").forEach((c,i)=>c.classList.toggle("sel",i===lvSel))}
function lvConfirm(){if(modal!=="lv"||!lvPick||performance.now()<lvLock)return;lvPick(lvSel)}
function levelUp(){clearLevelChoiceTimer();const choiceId=levelChoiceId,b=openModal("lv"),opts=rollPerks(3);if(!opts.length){S.lvp=0;closeModal();return}
 b.innerHTML="<h2>"+__("Nível {0}",S.lvl)+"</h2><div id='lvchoice-clock' style='color:var(--mute);margin-bottom:10px'>"+__("Escolha uma melhoria · {0} s",30)+"</div>";
 const w=document.createElement("div");w.className="cards";
 const choose=(k,ri)=>{if(choiceId!==levelChoiceId||S.lvp<=0||modal!=="lv")return;clearLevelChoiceTimer();S.lvp--;addPerk(k,RAR[ri][1]);sfx(800,.15,"triangle");modal=null;if(S.lvp>0)levelUp();else closeModal()};
 opts.forEach(([k,ri],oi)=>{const R=RAR[ri],c=document.createElement("div");c.className="card";c.style.borderColor=R[2];c.innerHTML="<div style='color:"+R[2]+";font-weight:700'>"+__(R[0])+"</div><div style='font-weight:600;margin:6px 0'>"+__(PK[k][0])+"</div><div>"+__(PK[k][1]).replace(/\d+%/,m=>Math.round(parseFloat(m)*R[1])+"%")+"</div><div style='color:var(--mute);font-size:.8rem;margin-top:6px'>"+__("nv {0} → {1}",fmtN(pk(k)),fmtN(Math.min(10,pk(k)+R[1])))+"</div>";c.onclick=()=>choose(k,ri);c.onmouseenter=()=>{lvSel=oi;lvPaint()};w.appendChild(c)});
 lvN=opts.length;lvSel=Math.floor((lvN-1)/2);lvPick=i=>choose(opts[i][0],opts[i][1]);lvLock=performance.now()+450;lvPaint();
 b.appendChild(w);lvPaint();const deadline=Date.now()+30000;levelChoiceTicker=setInterval(()=>{if(choiceId!==levelChoiceId||modal!=="lv"){clearLevelChoiceTimer();return}const secs=Math.max(0,Math.ceil((deadline-Date.now())/1000)),clock=$("lvchoice-clock");if(clock)clock.textContent=__("Escolha uma melhoria · {0} s",secs);if(secs===0){const rarity=Math.max(...opts.map(x=>x[1])),best=opts.filter(x=>x[1]===rarity),[k,ri]=best[Math.floor(Math.random()*best.length)];choose(k,ri)}},200)}

// ===== 2-sistemas/04-habilidades.js — Habilidades permanentes, ativas (Fúria, Frenesi), dinamite e conquistas =====
// Poderes de renascimento: só se compram com fragmentos (ganhos ao Renascer). [nome, descrição, nível máximo]. O nível N custa N+1 fragmentos (15 no total por poder).
const SK={
 her:[N_("Herança de ouro"),N_("Começa cada vida com 400 x nível² de ouro"),5],
 ini:[N_("Picareta herdada"),N_("Começa cada vida com a picareta do tipo de nível igual ao nível deste poder"),4],
 ouro:[N_("Veia eterna"),N_("+8% de ouro por nível"),5],
 dmg:[N_("Músculos do abismo"),N_("+8% de dano da picareta por nível"),5],
 fol:[N_("Fôlego eterno"),N_("+6% de energia máxima por nível"),5],
 jato:[N_("Pulmões de jato"),N_("-6% da energia gasta ao subir com o jato por nível"),5],
 gar:[N_("Faro de minério"),N_("+2% de chance de minério por nível"),5],
 xp:[N_("Sabedoria antiga"),N_("+10% de experiência por nível"),5]
};
// [nome, descrição, duração s, recarga s, desbloqueia ao chegar a X m]
const SKL=[[N_("Fúria do Minerador"),N_("Dano maior"),BAL.skills.fury.dur,BAL.skills.fury.cd,BAL.skills.fury.at],[N_("Escavação Frenética"),N_("Cava mais rápido"),BAL.skills.frenzy.dur,BAL.skills.frenzy.cd,BAL.skills.frenzy.at]];
const skillDuration=i=>SKL[i][2]*skillDurationMult();
const skillDescription=i=>i===0?__("Dano x{0} por {1} s (recarga {2} s; efeito reduzido quando combinada)",fmtN(skT[1]>0?furyActiveMult():furyMult()),fmt(skillDuration(i)),SKL[i][3]):__("Cava x{0} mais rápido por {1} s (recarga {2} s; efeito reduzido quando combinada)",fmtN(skT[0]>0?frenzyActiveMult():frenzyMult()),fmt(skillDuration(i)),SKL[i][3]);
function useSk(i){if(modal||i<0||i>=SKL.length||S.best<SKL[i][4]||skCD[i]>0)return;skCD[i]=SKL[i][3];skT[i]=skillDuration(i);flash=.35;flashC="#ffb43a";sfx(500+i*120,.2,"sawtooth");sayPower(__("Habilidade ativada: {0}",__(SKL[i][0])))}
const dynMax=()=>dynCDt;   // recarga da última dinamite usada (BAL.dyn[tipo].cd): quanto mais forte, maior
const DYN_IDS=["dyn","dyn2","dyn3","dyn4","dyn5"];   // tipos de dinamite, do mais fraco ao mais forte (números em BAL.dyn)
// Dinamite em uso: a escolhida (tecla R troca); se acabou, usa a mais forte que ainda houver
function dynPick(){if(have(S.dsel)>0||S.debug)return S.dsel;for(let i=DYN_IDS.length-1;i>=0;i--)if(have(DYN_IDS[i])>0)return DYN_IDS[i];return S.dsel}
function dynNext(){const own=DYN_IDS.filter(k=>have(k)>0||k===S.dsel||S.debug);if(!own.length)return;const i=own.indexOf(S.dsel);S.dsel=own[(i+1)%own.length];sayMine(__("Dinamite escolhida: {0}",ITEMS[S.dsel].n));sfx(620,.08,"triangle");refresh()}
function boom(){
 if(modal||dynCD>0)return;
 const dk=dynPick();
 if(have(dk)<1&&!S.debug){sayWarn(__("Sem dinamite: compre na loja (na superfície)"));return}
 const DB=BAL.dyn[dk];
 const[tc,tr]=tgt();let tot=0,n=0;
 const R=DB.r,RI=Math.ceil(R),cells=[];
 for(let dx=-RI;dx<=RI;dx++)for(let dy=-RI;dy<=RI;dy++){const c=tc+dx,r=tr+dy;if(dx*dx+dy*dy>R*R||!canBlast(c,r))continue;cells.push([dx*dx+dy*dy,c,r])}
 if(!cells.length){sayWarn(__("Nada para explodir aqui"));return}
 if(!S.debug)S.items[dk]--;
 S.dsel=dk;
 cells.sort((x,y)=>x[0]-y[0]);let B=DB.p*clickPow();   // força da explosão = p x dano da picareta (gasta a dureza dos blocos; veios de pedra dura sempre quebram)
 for(const[,c,r]of cells){if(!isVein(c,r)){const hh=hardness(r);if(B<hh)continue;B-=hh}const o=collect(c,r);tot+=o.v;n++;if(Math.random()<.5){const p=blockXY(c,r);parts.push({x:p.x,y:p.y+T/2,vx:(Math.random()-.5)*300,vy:-Math.random()*260,l:.8,c:ITEMS[dk].c})}}
 dynCDt=DB.cd;dynCD=dynCDt;S.bombs++;const big=DYN_IDS.indexOf(dk);shake=Math.max(shake,BAL.shake.dyn[big]||0);flash=.4+big*.08;flashC=ITEMS[dk].c;sfx(90-big*8,.4+big*.08,"sawtooth");
 const p=blockXY(tc,tr);texts.push({x:p.x,y:p.y-T*.5,t:0,s:__("{0}: {1} blocos · +{2}",ITEMS[dk].n,n,fmt(tot)),c:ITEMS[dk].c,big:1});
 if(n)spend(digCost(S.depth)*DB.e);   // dinamite: custa energia = e x o custo de cavar 1 bloco na profundidade atual
}
const ACH=[[N_("Primeiros passos"),N_("Chegue a 10 m"),()=>S.best>=10],[N_("Subsolo"),N_("50 m"),()=>S.best>=50],[N_("Centenário"),N_("100 m"),()=>S.best>=100],[N_("Abismo"),N_("300 m"),()=>S.best>=300],[N_("Coração do abismo"),N_("Chegue ao fundo (1500 m)"),()=>S.best>=FINAL_DEPTH],[N_("Garimpeiro"),N_("50 minérios"),()=>S.oc>=50],[N_("Mina de ouro"),N_("500 minérios"),()=>S.oc>=500],[N_("Magnata"),N_("1M de ouro no total"),()=>S.total>=1e6],[N_("Primeira venda"),N_("Venda itens no baú"),()=>S.sold>0],[N_("Quase lá"),N_("Apague de energia uma vez"),()=>S.deaths>0],[N_("Picareta de ouro"),N_("Compre a picareta de Ouro"),()=>S.tier>=5],[N_("Renascido"),N_("Use Renascer"),()=>S.runs>0]];
// Conquistas novas ficam SEMPRE no fim da lista: o save guarda o número de cada uma.
ACH.push(
 [N_("Cavador de verdade"),N_("Chegue a 200 m"),()=>S.best>=200],[N_("Meia-descida"),N_("500 m"),()=>S.best>=500],[N_("Metade do caminho"),N_("750 m"),()=>S.best>=750],[N_("Mil metros"),N_("1000 m"),()=>S.best>=1000],[N_("Calor do magma"),N_("1200 m"),()=>S.best>=1200],[N_("Beira do fim"),N_("1400 m"),()=>S.best>=1400],
 [N_("Colecionador"),N_("Descubra 5 minérios diferentes"),()=>S.od.length>=5],[N_("Catálogo completo"),N_("Descubra todos os minérios"),()=>S.od.length>=ORES.length],[N_("Brilho de diamante"),N_("Encontre um Diamante"),()=>S.od.includes("Diamante")],[N_("Luz do abismo"),N_("Encontre um Cristal do abismo"),()=>S.od.includes("Cristal do abismo")],[N_("Veia inesgotável"),N_("5000 minérios"),()=>S.oc>=5000],
 [N_("Bilionário"),N_("1B de ouro no total"),()=>S.total>=1e9],[N_("Trilionário"),N_("1T de ouro no total"),()=>S.total>=1e12],
 [N_("Britadeira"),N_("Quebre 1000 blocos"),()=>S.blocks>=1000],[N_("Máquina de escavar"),N_("Quebre 100 mil blocos"),()=>S.blocks>=1e5],
 [N_("Ferreiro"),N_("Compre a picareta de Ferro"),()=>S.tier>=2],[N_("Mãos de diamante"),N_("Compre a picareta de Diamante"),()=>S.tier>=6],[N_("Lenda das picaretas"),N_("Tenha a picareta Primordial"),()=>S.tier>=TIERS.length-1],
 [N_("Ao máximo"),N_("Deixe uma melhoria no nível máximo"),()=>Object.keys(UPS).some(k=>S.lv[k]>=UPS[k].max)],[N_("Arsenal completo"),N_("Todas as melhorias no nível máximo"),()=>Object.keys(UPS).filter(k=>UPS[k].g!=="Pesca").every(k=>S.lv[k]>=UPS[k].max)],[N_("Teleportado"),N_("Desbloqueie o teleporte"),()=>S.lv.tele>=1],
 [N_("Teimoso"),N_("Apague de energia 10 vezes"),()=>S.deaths>=10],[N_("Banquete"),N_("Coma 20 itens de energia"),()=>S.eaten>=20],[N_("Pavio curto"),N_("Use 10 dinamites"),()=>S.bombs>=10],[N_("Demolidor"),N_("Use 100 dinamites"),()=>S.bombs>=100],[N_("Viajante"),N_("Use o teleporte 10 vezes"),()=>S.tps>=10],[N_("Pedra no sapato"),N_("Quebre 20 pedras duras"),()=>S.veins>=20],
 [N_("Veterano"),N_("Chegue ao nível 10"),()=>S.lvl>=10],[N_("Experiente"),N_("Nível 25"),()=>S.lvl>=25],[N_("Lendário"),N_("Nível 50"),()=>S.lvl>=50],
 [N_("Ciclo"),N_("Renasça 3 vezes"),()=>S.runs>=3],[N_("Eterno"),N_("Renasça 10 vezes"),()=>S.runs>=10],
 [N_("Comerciante"),N_("Venda no baú 25 vezes"),()=>S.sold>=25],[N_("Atacadista"),N_("Venda no baú 250 vezes"),()=>S.sold>=250],
 [N_("Boa noite"),N_("Salve o jogo na cama"),()=>S.sleeps>=1],[N_("Sono pesado"),N_("Deite na cama 20 vezes"),()=>S.sleeps>=20],[N_("Companhia"),N_("Chame o vagalume"),()=>S.lv.pet>=1],[N_("Despensa cheia"),N_("Tenha 99 de algum item da loja"),()=>Object.keys(S.items).some(k=>ITEMS[k]&&!ITEMS[k].noShop&&S.items[k]>=99)],
 [N_("Fornalha acesa"),N_("Refine 1 minério na fornalha"),()=>S.refined>=1],[N_("Mestre ferreiro"),N_("Refine 1000 minérios"),()=>S.refined>=1000],
 [N_("Empreiteiro"),N_("Entregue 10 contratos"),()=>S.ctDone>=10],[N_("Na sorte"),N_("Jogue na mesa de apostas"),()=>S.spins>=1],[N_("Viciado"),N_("Jogue 100 vezes na mesa de apostas"),()=>S.spins>=100],[N_("Caçador de tesouros"),N_("Abra um baú no subsolo"),()=>S.chests>=1],[N_("Baú épico"),N_("Abra um baú Épico ou melhor"),()=>S.chTop>=4],[N_("Sorte lendária"),N_("Abra um baú Lendário"),()=>S.chTop>=5],
 [N_("Caça-baús"),N_("Abra 10 baús"),()=>S.chests>=10],[N_("Rei dos baús"),N_("Abra 100 baús"),()=>S.chests>=100],[N_("Coleção completa"),N_("Abra um baú de cada raridade"),()=>S.chT.every(n=>n>0)],[N_("Chuva de ouro"),N_("Abra 5 baús Lendários"),()=>S.chT[4]>=5],[N_("Presente dos baús"),N_("Ganhe 10 bônus de melhoria de baús"),()=>S.chPk>=10],[N_("Colecionador de cacos"),N_("Ache 10 fragmentos em baús"),()=>S.chFr>=10],[N_("Viajante de bolso"),N_("Use 5 poções de teleporte"),()=>S.ptpUsed>=5],
 [N_("Primeira fisgada"),N_("Pesque seu primeiro peixe"),()=>S.fishN>=1],[N_("Pescador"),N_("Pesque 25 peixes"),()=>S.fishN>=25],[N_("Mestre das águas"),N_("Pesque 150 peixes"),()=>S.fishN>=150],[N_("Mão firme"),N_("Faça uma pescaria perfeita"),()=>S.fishP>=1],
 [N_("Álbum completo"),N_("Descubra todas as espécies de peixe"),()=>Object.keys(S.fdx).length>=FISH.length],[N_("Lenda das águas"),N_("Pesque um peixe lendário"),()=>FISH.some(f=>f.t===2&&S.fdx[f.id])],
 [N_("Churrasqueiro"),N_("Asse 10 peixes na fogueira"),()=>S.cookN>=10],[N_("Ponto perfeito"),N_("Asse um peixe no ponto perfeito"),()=>S.cookP>=1],
 [N_("Horta dourada"),N_("Deixe todas as cenouras da horta douradas"),()=>S.gc>=GARDEN_SLOTS]
);
// Notificação de conquista: caixa própria (azul, com troféu) e fanfarra própria; várias de uma vez viram uma caixa só
let achQ=[],achT=0;
function checkAch(){const n=[];for(let i=0;i<ACH.length;i++)if(!S.ach.includes(i)&&ACH[i][2]()){S.ach.push(i);n.push(i)}if(n.length)showAch(n)}
function showAch(l){achQ.push(l);if(!achT)achNext()}
function achNext(){
 const el=$("ach");achT=0;if(!el)return;
 if(modal&&achQ.length){achT=setTimeout(achNext,400);return}   // com tela aberta (título, pausa, nível...) a caixa ficaria atrás: espera fechar
 const l=achQ.shift();if(!l){el.className="";return}
 el.innerHTML="<small>"+(l.length>1?__("{0} CONQUISTAS",l.length):__("CONQUISTA"))+"</small>"+l.slice(0,3).map(i=>"<b>"+__(ACH[i][0])+"</b>"+(l.length===1?"<span>"+__(ACH[i][1])+"</span>":"")).join("")+(l.length>3?"<span>"+__("e mais {0}",l.length-3)+"</span>":"");
 el.className="";void el.offsetWidth;el.className="on";
 [392,494,587].forEach((f,i)=>setTimeout(()=>sfx(f,.14,"square"),i*90));   // fanfarra: três notas curtas e um acorde brilhante
 setTimeout(()=>{[784,988,1175].forEach(f=>sfx(f,.7,"sine"));sfx(1568,.5,"triangle")},300);
 achT=setTimeout(achNext,4200);
}

// ===== 2-sistemas/05-noite-estrelas.js — Estrela cadente (evento raro, só de noite) e indicadores de bônus da noite =====
// De noite, de tempos em tempos, uma estrela cruza o céu e dá um bônus por BAL.star.len segundos: ouro x2 ou chance de minério x2.
// O bônus vale em qualquer profundidade; o risco no céu só aparece se a superfície estiver à vista (ver skyShoot em 08-dia-noite.js).
function starFall(){
 starT=Math.random()<.5?0:1;star=BAL.star.len;
 shoot={t:0,len:2.2,x:.3+Math.random()*.4,y:.1+Math.random()*.2,dir:Math.random()<.5?-1:1};
 sayStar(starT?__("Estrela cadente! Minérios x{0} por {1}s",BAL.star.luck,BAL.star.len):__("Estrela cadente! Ouro x{0} por {1}s",BAL.star.gold,BAL.star.len));
 sfx(1568,.25,"sine");sfx(2093,.4,"sine");
}
function starTick(dt){
 if(star>0){star-=dt;if(star<=0){star=0;sayStar(__("O brilho da estrela se apagou"))}}
 if(shoot){shoot.t+=dt;if(shoot.t>=shoot.len)shoot=null}
 if(nightAmt()<BAL.night.from)return;           // a espera só corre de noite
 starNext-=dt;if(starNext>0)return;
 starNext=BAL.star.gapMin+Math.random()*BAL.star.gapRand;starFall();
}
// Plaquinhas de bônus ativos (canto superior esquerdo do jogo)
const BUFF_MOON="<svg viewBox='0 0 24 24'><path d='M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z' fill='#cfd8ff' stroke='#10142e' stroke-width='1.6' stroke-linejoin='round'/></svg>";
const BUFF_STAR="<svg viewBox='0 0 24 24'><path d='M12 2.5l2.7 6 6.3.6-4.8 4.3 1.5 6.4L12 16.6 6.3 19.8l1.5-6.4L3 9.1l6.3-.6z' fill='#ffd45c' stroke='#3a2606' stroke-width='1.6' stroke-linejoin='round'/></svg>";
let buffsHtml="";
function buffsUI(){
 const el=$("buffs");if(!el)return;
 let h="";
 if(nightDive())h+="<div class='buff night'>"+BUFF_MOON+"<span>"+__("Noite · +{0}% XP",Math.round(BAL.night.xp*100))+"</span></div>";
 if(star>0)h+="<div class='buff star'>"+BUFF_STAR+"<span>"+(starT?__("Sorte estelar · minérios x{0}",BAL.star.luck):__("Chuva de ouro · ouro x{0}",BAL.star.gold))+" · "+Math.ceil(star)+"s</span></div>";
 if(h!==buffsHtml){buffsHtml=h;el.innerHTML=h}
}

// ===== 2-sistemas/06-fornalha.js — Fornalha: refina os minérios da mochila com o tempo e vende sozinha (ouro + bônus) =====
// Perto dela, clicar nela com o mouse ou apertar Espaço põe os minérios da mochila na fila (pedra comum fica na mochila para o baú). Cada minério leva 1/furRate() s;
// quando fica pronto vira ouro na hora: valor médio do que foi carregado x (1 + BAL.furnace.bonus). O tempo só corre com o jogo aberto.
const furRate=(l=S.lv.furn)=>BAL.furnace.base*(1+BAL.furnace.per*l);   // minérios refinados por segundo
const furEta=()=>S.fur.n>0?(S.fur.n-S.fur.a)/furRate():0;
const furXY=()=>({x:colX(FURN_C),y:rowY(0)});
const isOre=k=>ORES.some(o=>o[0]===k);
const fmtT=s=>s>=60?Math.floor(s/60)+"min "+String(Math.round(s%60)).padStart(2,"0")+"s":Math.max(1,Math.ceil(s))+"s";
let furPopT=0;
function furLoad(){
 const b=S.bag,f=S.fur;let n=0,v=0;
 for(const k of Object.keys(b.o)){
  if(!isOre(k))continue;const c=b.o[k],val=b.ov[k];
  if(!(c>0)||!Number.isFinite(val))continue;   // minério sem valor registrado (mochila de save antigo) vai para o baú
  n+=c;v+=val;delete b.o[k];delete b.ov[k];
 }
 if(n<=0)return false;
 b.n=Math.max(0,b.n-n);b.v=b.n>0?Math.max(0,b.v-v):0;
 f.n+=n;f.v+=v;f.tn+=n;
 const p=furXY();texts.push({x:p.x,y:p.y-T*1.4,t:0,s:__("Fornalha: +{0} minérios",n),c:"#ff9a3a",big:1});
 sfx(200,.25,"sawtooth");setTimeout(()=>sfx(330,.2,"triangle"),120);
 sayMine(__("Fornalha carregada: {0} minérios · pronta em {1}",n,fmtT(furEta())));
 refresh();return true;
}
function furTick(dt){
 const f=S.fur;if(f.n<1)return;
 f.a+=furRate()*dt;
 while(f.a>=1&&f.n>=1){   // cada minério pronto vira ouro refinado
  const per=f.v/f.n,g=per*(1+BAL.furnace.bonus);
  f.n-=1;f.v-=per;f.a-=1;S.gold+=g;S.total+=g;f.e+=g;f.tg+=g;S.refined++;
 }
 furPopT-=dt;
 if(f.e>0&&furPopT<=0&&atSurface()){const p=furXY();texts.push({x:p.x,y:p.y-T*1.4,t:0,s:__("Refinado: +{0}",fmt(f.e)),c:"#ffd45c",big:1});f.e=0;furPopT=1.2;sfx(1040,.07,"triangle")}
 if(f.n<1){   // fila vazia: avisa o total
  sayMine(__("Fornalha: {0} minérios refinados · +{1} de ouro",f.tn,fmt(f.tg)));sfx(880,.12,"triangle");
  S.fur={n:0,v:0,a:0,e:0,tg:0,tn:0};
 }
}
// Carrega só quando o jogador pede: clique do mouse na fornalha ou Espaço ao lado dela. Devolve true se tratou o comando (não cava).
function furUse(){
 if(!nearFurnace())return false;
 if(!furLoad())sayMine(S.bag.n>0?__("Só há pedra comum na mochila: ela vai para o baú."):__("Sem minérios na mochila para pôr na fornalha."));
 return true;
}
function furHit(px,py){   // o ponto (px,py) da tela está sobre o desenho da fornalha?
 if(!isUnl("build","furnace"))return false;
 const u=pu(),s=sprFurnace(),c=colX(FURN_C),y=rowY(0);
 return px>=c-s.w*u/2&&px<=c+s.w*u/2&&py>=y-s.h*u&&py<=y;
}

// ===== 2-sistemas/07-estacoes.js — Estações do ano: a grama e as colinas da superfície mudam de cor com o tempo =====
// Cada estação dura BAL.season.len segundos de jogo. O relógio S.sea é salvo e só corre com o jogo aberto; um jogo novo começa no meio do verão (as cores de sempre).
// As cores passam de uma estação para a próxima em degradê contínuo: cada paleta vale por inteiro no MEIO da sua estação, e o nome muda no meio da mistura.
// g/h = grama da linha 0 (corpo e topo claro, que também é a cor das folhinhas) · nh/nhh = colinas próximas (corpo e topo) · fh/fhh = colinas distantes (corpo e topo) · d/dh = trilha de terra (corpo e topo; no inverno vira neve)
const SEASONS=[
 {get n(){return __("Primavera")},get msg(){return __("Chegou a primavera!")},g:"#5fb03c",h:"#9be065",nh:"#4aa65a",nhh:"#74cc70",fh:"#a8dcd4",fhh:"#c4eee6",d:"#8f6a3f",dh:"#b08a58"},
 {get n(){return __("Verão")},get msg(){return __("Chegou o verão!")},g:"#548b31",h:"#80b949",nh:"#3f7d4a",nhh:"#5aa05a",fh:"#9cc4e0",fhh:"#b4d4ea",d:"#b48a58",dh:"#d4ad76"},
 {get n(){return __("Outono")},get msg(){return __("Chegou o outono!")},g:"#a9722a",h:"#e0a43a",nh:"#b4532b",nhh:"#dc8438",fh:"#d1ae94",fhh:"#e4c9b0",d:"#9a5e2e",dh:"#c98a4a"},
 {get n(){return __("Inverno")},get msg(){return __("Chegou o inverno!")},g:"#c6d3dc",h:"#f4f8fb",nh:"#8ba3b8",nhh:"#c9d8e4",fh:"#a9bccd",fhh:"#d2dde8",d:"#dfe8ef",dh:"#f6fafc"}];
const SEA_KEYS=["g","h","nh","nhh","fh","fhh","d","dh"];
const hexCh=(s,i)=>parseInt(s.substr(i,2),16);
const mixHex=(a,b,k)=>"#"+[1,3,5].map(i=>Math.round(hexCh(a,i)+(hexCh(b,i)-hexCh(a,i))*k).toString(16).padStart(2,"0")).join("");
// Paleta do relógio "sea" (s): idx = estação em curso (0 primavera · 1 verão · 2 outono · 3 inverno) mais as 6 cores já misturadas
function seasonMix(sea){
 const L=BAL.season.len,p=(((sea/L)%4)+4)%4,q=p-.5,a=Math.floor(q),f=q-a,k=f*f*(3-2*f);   // q = posição entre o centro da estação a e o da seguinte
 const A=SEASONS[((a%4)+4)%4],B=SEASONS[(((a+1)%4)+4)%4],o={idx:Math.floor(p)%4};
 for(const c of SEA_KEYS)o[c]=mixHex(A[c],B[c],k);
 return o;
}
let SEA=seasonMix(S.sea),seaIdx=-1,seaStep=-1;
function seasonTick(dt){
 S.sea=(S.sea+dt)%(BAL.season.len*4);
 const st=Math.floor(S.sea*2);if(st===seaStep)return;seaStep=st;   // as cores só são recalculadas a cada meio segundo (a mudança é lenta demais para se notar)
 SEA=seasonMix(S.sea);
 if(seaIdx>=0&&SEA.idx!==seaIdx){const s=SEASONS[SEA.idx];sayWeather(s.msg)}
 seaIdx=SEA.idx;
}

// ===== 2-sistemas/08-clima.js — Clima dinâmico da superfície: nublado, chuva, tempestade com raios, neve e neblina (só visual e sonoro) =====
// O tempo muda sozinho (duração e chances em BAL.weather; as chances dependem da estação: neve só no inverno, tempestade mais no verão).
// Os valores cover/rain/snow/fog/wind vão em direção ao alvo do tempo atual aos poucos, então tudo aparece e some em degradê. Só se vê e se ouve com o céu à vista.
// Desenho: 5-desenho/10-clima.js (céu escurecido, nuvens extras, chuva, neve, neblina, raio). Não é salvo: ao abrir o jogo o tempo começa limpo.
const WX={
 clear:{get n(){return __("Céu limpo")},cover:0,rain:0,snow:0,fog:0,wind:.3,get msg(){return __("O tempo abriu")}},
 cloudy:{get n(){return __("Nublado")},cover:.7,rain:0,snow:0,fog:0,wind:.5,get msg(){return __("O céu fechou")}},
 rain:{get n(){return __("Chuva")},cover:.85,rain:.6,snow:0,fog:0,wind:.6,get msg(){return __("Começou a chover")}},
 storm:{get n(){return __("Tempestade")},cover:1,rain:1,snow:0,fog:0,wind:1,get msg(){return __("Tempestade chegando!")}},
 snow:{get n(){return __("Neve")},cover:.7,rain:0,snow:.8,fog:0,wind:.4,get msg(){return __("Começou a nevar")}},
 fog:{get n(){return __("Neblina")},cover:.4,rain:0,snow:0,fog:.8,wind:.15,get msg(){return __("A neblina chegou")}}};
const WX_KEYS=["clear","cloudy","rain","storm","snow","fog"];
const wx={cur:"clear",left:90,cover:0,rain:0,snow:0,fog:0,wind:.3,clock:0,bolt:0,boltX:0,boltJ:[],nextBolt:12,thunder:[],bed:null,bedF:null};
const skyVis=()=>{const g=rowY(0);return g<=0?0:clamp(g/(H*.12),0,1)};   // 0 = céu fora da tela (no subsolo), 1 = céu à vista
function weatherPick(){
 const w=BAL.weather.w[SEA.idx%4];let tot=0;for(let i=0;i<w.length;i++)if(WX_KEYS[i]!==wx.cur)tot+=w[i];
 let r=Math.random()*tot;
 for(let i=0;i<w.length;i++){if(WX_KEYS[i]===wx.cur)continue;r-=w[i];if(r<=0&&w[i]>0)return WX_KEYS[i]}
 return"clear";
}
function weatherSet(k){
 wx.cur=k;const d=BAL.weather.dur[k];wx.left=d[0]+Math.random()*(d[1]-d[0]);
 wx.nextBolt=BAL.weather.boltGap[0]+Math.random()*(BAL.weather.boltGap[1]-BAL.weather.boltGap[0]);
}
function thunderSfx(k){   // 3 tipos de trovão, conforme a distância do raio: 0 = perto (estalo seco + estrondo), 1 = médio (rolando em ondas), 2 = longe (surdo e demorado)
 const v=skyVis();if(mute||S.vol.s<=0||v<=0||!actx)return;
 try{const t=actx.currentTime,s=S.vol.s*v;
  if(k===0){
   nz(t,"bandpass",2600,.7,.15*s,.22,500);nz(t+.02,"lowpass",1500,.5,.12*s,.9,220);   // estalo
   nz(t+.12,"lowpass",430,.6,.14*s,2.6,70);tn(t,"sine",90,32,.1*s,1.8);               // estrondo
   nz(t+.9,"lowpass",300,.6,.07*s,2.2,60);                                            // eco nas montanhas
  }else if(k===1){
   for(let i=0;i<4;i++)nz(t+i*(.35+Math.random()*.3),"lowpass",520-i*70,.6,(.1-i*.016)*s,1.4+Math.random()*.8,90);
   tn(t,"sine",70,30,.08*s,2.4);
  }else{
   nz(t,"lowpass",300,.5,.07*s,3.4,55);nz(t+1.1,"lowpass",240,.5,.05*s,2.6,50);tn(t,"sine",58,28,.05*s,3);
  }
 }catch(e){}
}
function rainBed(){   // chiado contínuo de chuva e vento (ruído filtrado em laço), com volume que acompanha o tempo
 if(!actx)return;
 if(!wx.bed){
  try{const n=Math.floor(actx.sampleRate*2.5),b=actx.createBuffer(1,n,actx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
   const src=actx.createBufferSource(),fl=actx.createBiquadFilter(),g=actx.createGain();src.buffer=b;src.loop=true;fl.type="bandpass";fl.frequency.value=1500;fl.Q.value=.4;g.gain.value=0;
   src.connect(fl);fl.connect(g);g.connect(actx.destination);src.start();wx.bed=g;wx.bedF=fl}catch(e){wx.bed=null;return}
 }
 const B=BAL.weather.vol,quiet=mute||S.vol.a<=0||modal==="pause"||modal==="lv",tot=wx.rain+wx.snow,
  gain=quiet?0:S.vol.a*(wx.rain*B.rain+wx.snow*B.snow+(wx.cur==="storm"?B.storm*wx.rain:0))*skyVis(),
  f=700+1700*(tot>0?wx.rain/tot:0);
 try{wx.bed.gain.setTargetAtTime(gain,actx.currentTime,.4);wx.bedF.frequency.setTargetAtTime(f,actx.currentTime,.6)}catch(e){}
}
function weatherTick(dt){
 wx.clock+=dt;
 if(dt>0){
  wx.left-=dt;
  if(wx.left<=0){const prev=wx.cur;weatherSet(weatherPick());if(prev!==wx.cur&&skyVis()>0)sayWeather(WX[wx.cur].msg)}
  const T=WX[wx.cur],k=1-Math.exp(-dt/(BAL.weather.fade/3));
  for(const p of["cover","rain","snow","fog","wind"])wx[p]+=(T[p]-wx[p])*k;
  wx.bolt=Math.max(0,wx.bolt-dt*4);
  if(wx.cur==="storm"&&wx.rain>.7){wx.nextBolt-=dt;if(wx.nextBolt<=0){   // raio: clarão no céu e, um pouco depois, o trovão
   wx.bolt=1;wx.boltX=.15+Math.random()*.7;wx.boltJ=Array.from({length:9},()=>(Math.random()-.5)*.09);
   wx.nextBolt=BAL.weather.boltGap[0]+Math.random()*(BAL.weather.boltGap[1]-BAL.weather.boltGap[0]);{const d=.2+Math.random()*3;wx.thunder.push({t:d,k:d<.9?0:d<2?1:2})}}}
  for(let i=wx.thunder.length-1;i>=0;i--){const th=wx.thunder[i];th.t-=dt;if(th.t<=0){wx.thunder.splice(i,1);thunderSfx(th.k)}}
 }
 rainBed();
}

// ===== 2-sistemas/10-contratos.js — Quadro de contratos: missões que pagam um bônus em ouro e XP =====
// Tipos: blk = quebrar N blocos · ore = coletar N de um minério · dep = chegar a N metros. O progresso conta a partir do momento em que a missão aparece no quadro, em qualquer lugar.
// Blocos e minérios só contam a partir de ctMinD() (75% do recorde): não dá para cumprir quebrando terra fácil lá no alto.
// Recompensa = fração (BAL.contracts) do ouro que os mesmos blocos já dariam no seu recorde de profundidade: é um bônus, não o ganho principal.
const ctBase=()=>BAL.dig.goldBase*Math.pow(BAL.dig.goldK,S.best/100);   // ouro de um bloco no recorde, sem sorte nem eventos
const ctRand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const ctMinD=()=>Math.floor(S.best*BAL.contracts.minD/10)*10;   // profundidade mínima para blocos e minérios contarem
function ctGen(){
 const B=BAL.contracts,kinds=["blk","ore","dep"],used=S.ct.map(c=>c.t);
 let pool=kinds.filter(k=>!used.includes(k));if(!pool.length)pool=kinds;
 const t=pool[Math.floor(Math.random()*pool.length)],base=ctBase(),xp=B.xp*xpNeed(S.lvl);let c;
 if(t==="blk"){const n=ctRand(B.blk.n[0],B.blk.n[1]);c={t,n,p:0,g:Math.ceil(n*base*B.blk.pay),o:"",d:ctMinD(),x:xp}}
 else if(t==="ore"){
  const u=ORES.filter(o=>o[3]<=S.best),i=Math.floor(Math.pow(Math.random(),1.6)*u.length),o=u[i];   // mesmo sorteio que o do jogo: minério raro é pedido mais raramente
  const n=Math.max(1,Math.round(ctRand(B.ore.n[0],B.ore.n[1])*(1-i/(u.length*1.4))));
  c={t,n,p:0,g:Math.ceil(n*base*o[1]*B.ore.pay),o:o[0],d:ctMinD(),x:xp}}
 else{const d=Math.max(30,Math.ceil((S.best+ctRand(B.dep.add[0],B.dep.add[1]))/10)*10);c={t,n:Math.min(FINAL_DEPTH,d),p:0,g:Math.ceil(B.dep.pay*BAL.dig.goldBase*Math.pow(BAL.dig.goldK,d/100)),o:"",d:0,x:xp}}
 S.ct.push(c);
}
function ctProg(kind,key,amt,r){
 for(const c of S.ct){if(c.p>=c.n||r<(c.d||0))continue;
  if(kind==="blk"&&c.t==="blk")c.p=Math.min(c.n,c.p+amt);
  else if(kind==="ore"&&c.t==="ore"&&c.o===key)c.p=Math.min(c.n,c.p+amt)}
}
function ctTick(dt){
 for(const c of S.ct)if(c.t==="dep"&&c.p<c.n)c.p=Math.max(c.p,Math.min(c.n,Math.floor(S.depth)));
 if(S.ct.length<BAL.contracts.slots){if(S.ctW>0)S.ctW-=dt;if(S.ctW<=0)while(S.ct.length<BAL.contracts.slots)ctGen()}
}
const fmtClock=t=>{t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+":"+String(t%60).padStart(2,"0")};   // m:ss do próximo contrato
const ctReady=()=>S.ct.some(c=>c.p>=c.n);
function ctText(c){const d=c.d;return c.t==="blk"?(d>0?__("Quebre {0} blocos a partir de {1} m",c.n,d):__("Quebre {0} blocos",c.n)):c.t==="ore"?(d>0?__("Colete {0} de {1} a partir de {2} m",c.n,__(c.o),d):__("Colete {0} de {1}",c.n,__(c.o))):__("Chegue a {0} m de profundidade",c.n)}
function ctClaim(i){
 const c=S.ct[i];if(!c||c.p<c.n)return false;
 S.gold+=c.g;S.total+=c.g;S.ctDone++;gainXp(c.x);S.ct.splice(i,1);if(S.ctW<=0)S.ctW=BAL.contracts.cd;
 const x=colX(BOARD_C),y=rowY(0);texts.push({x,y:y-T*1.6,t:0,s:__("Contrato: +{0}",fmt(c.g)),c:"#ffe08a",big:1});
 for(let k=0;k<22;k++)parts.push({x,y:y-T*.9,vx:(Math.random()-.5)*260,vy:-140-Math.random()*300,l:.9,c:k%3?"#ffd45c":"#fff3a0",big:1});
 sfx(784,.1,"triangle");setTimeout(()=>sfx(988,.1,"triangle"),80);setTimeout(()=>sfx(1318,.2,"triangle"),160);
 return true;
}
function ctDrop(i){if(!S.ct[i])return;S.ct.splice(i,1);if(S.ctW<=0)S.ctW=BAL.contracts.cd;sfx(220,.1,"sine")}
function boardUse(){
 if(!nearBoard())return false;
 if(modal)return true;
 openBoard();return true;
}
function boardHit(px,py){if(!isUnl("build","board"))return false;const u=pu(),s=sprBoard(),c=colX(BOARD_C),y=rowY(0);return px>=c-s.w*u/2&&px<=c+s.w*u/2&&py>=y-s.h*u&&py<=y}
let ctShown=-1;
function openBoard(){
 const b=openModal("ct");b.style.maxWidth="520px";ctShown=-1;paintBoard();
 const iv=setInterval(()=>{if(modal!=="ct"){clearInterval(iv);return}if(S.ct.length!==ctShown)paintBoard();const e=$("ct-w");if(e)e.textContent=fmtClock(S.ctW)},500);
}
function paintBoard(){
 if(modal!=="ct")return;const b=$("bx");ctShown=S.ct.length;
 const rows=S.ct.map((c,i)=>{const ok=c.p>=c.n,o=c.t==="ore"?ORES.find(r=>r[0]===c.o):null,pc=Math.floor(c.p/c.n*100);
  return"<div class='crow"+(ok?" ok":"")+"'><div class='ci'><b>"+ctText(c)+"</b><div class='cbar'><i style='width:"+pc+"%'></i></div>"
   +"<small>"+__("{0} / {1} · recompensa {2} de ouro + XP",Math.floor(c.p),c.n,fmt(c.g))+"</small></div>"
   +"<div class='cb'><button data-c='"+i+"' "+(ok?"":"disabled")+">"+(ok?__("Entregar"):__("Em andamento"))+"</button><a data-d='"+i+"'>"+__("Dispensar")+"</a></div></div>"}).join("");
 b.innerHTML="<div class='board'><h2>"+__("Quadro de contratos")+"</h2><div class='sub'>"+__("Missões que pagam um bônus. Conta a partir do momento em que aparece aqui; blocos e minérios só valem na profundidade indicada.")+"</div>"
  +(rows||"<div class='sub'>"+__("Nenhum contrato no quadro.")+"</div>")
  +(S.ct.length<BAL.contracts.slots?"<div class='mfoot'>"+__("Próximo contrato em <b id='ct-w'>{0}</b>",fmtClock(S.ctW))+"</div>":"")
  +"<button id='ctok' class='cl'>"+__("Fechar")+"</button></div>";
 b.querySelectorAll("button[data-c]").forEach(x=>x.onclick=()=>{if(ctClaim(+x.dataset.c))refresh();paintBoard()});
 b.querySelectorAll("a[data-d]").forEach(x=>x.onclick=()=>{ctDrop(+x.dataset.d);paintBoard()});
 $("ctok").onclick=closeModal;
}

// ===== 2-sistemas/11-cassino.js — Caça-níquel de 3 rolos com animação (aposta = % do seu ouro) =====
// O resultado é sorteado na hora de girar, o ouro da aposta sai na hora e o prêmio fica guardado em S.pend até os rolos pararem (se fechar o jogo no meio, o prêmio é pago ao carregar o save).
// Números em BAL.slot. O retorno teórico (slotRtp) fica perto de 90%: no longo prazo a máquina é um ralo de ouro, de propósito.
const SLOT_NAMES=[N_("Pedra"),N_("Cenoura"),N_("Moeda"),N_("Dinamite"),N_("Cristal"),N_("Estrela")];
const slotTotalW=()=>BAL.slot.w.reduce((a,b)=>a+b,0);
function slotRoll(){let r=Math.random()*slotTotalW();for(let i=0;i<BAL.slot.w.length;i++){r-=BAL.slot.w[i];if(r<0)return i}return 0}
function slotMult(a,b,c){const B=BAL.slot;return a===b?(b===c?B.p3[a]:B.p2[a]):0}
function slotRtp(){const W=BAL.slot.w,T=slotTotalW();let r=0;for(let a=0;a<W.length;a++)for(let b=0;b<W.length;b++)for(let c=0;c<W.length;c++)r+=W[a]*W[b]*W[c]/(T*T*T)*slotMult(a,b,c);return r}
// aposta de cada botão: % do ouro (mínimo 1, sem arredondar). Com ouro infinito (CENOURA) usa uma base fixa, para não apostar infinito.
const slotBase=()=>Number.isFinite(S.gold)?S.gold:1e6;
const slotBetAmt=i=>{const g=slotBase();return Math.min(g,Math.max(1,g*BAL.slot.bets[i]))};   // sem arredondar: 100% aposta exatamente todo o ouro (frações incluídas); nunca passa do que você tem
let slotSel=1,slotBusy=false,slotLast=null;
function slotUse(){
 if(!nearSlot())return false;
 if(modal)return true;
 openSlot();return true;
}
function slotHit(px,py){if(!isUnl("build","slot"))return false;const u=pu(),s=sprSlot(),c=colX(SLOT_C),y=rowY(0);return px>=c-s.w*u/2&&px<=c+s.w*u/2&&py>=y-s.h*u&&py<=y}

// ---------- animação (canvas dentro do modal) ----------
const SL={w:460,h:306,cell:68,top:48,rx:[34,170,306],rw:120};
let slG=null,slCv=null,slRaf=0,slReels=[],slFx=null,slParts=[],slT=0,slWinShow=0,slWinTo=0,slText="",slTextT=0;
// Símbolos em pixel art 12x12 (mkSpr, com contorno): pedra, cenoura, moeda, dinamite, cristal e estrela. Desenhados sem suavização, em escala inteira.
function slotSprite(i){
 const P={b:"#8d9299",w:"#c9ced6",d:"#5d6168",o:"#ff9a3a",O:"#c96d1c",l:"#ffc27a",g:"#4ddf8a",h:"#2f9a5a",y:"#ffd45c",Y:"#fff3a0",G:"#d6a02a",X:"#d23a2a",x:"#ff7a5a",f:"#f6f0dc",u:"#6a4f27",C:"#7fe6ff",W:"#e8fbff",c:"#38b8d8",r:"#d23a2a"};
 return mkSpr("sl"+i,12,12,P,R=>{
  if(i===0){R(3,2,6,1,"b");R(2,3,8,6,"b");R(3,9,6,1,"d");R(8,5,2,4,"d");R(3,3,3,2,"w");R(3,5,1,1,"w");R(7,8,2,1,"d")}
  else if(i===1){R(5,0,1,3,"g");R(3,1,1,2,"g");R(7,1,1,2,"g");R(4,2,1,1,"h");R(6,2,1,1,"h");R(3,3,6,2,"o");R(4,5,5,1,"o");R(4,6,4,1,"o");R(5,7,3,1,"o");R(5,8,2,1,"o");R(5,9,1,2,"o");R(3,3,1,2,"l");R(4,5,1,1,"l");R(6,4,2,1,"O");R(6,6,1,1,"O");R(6,8,1,1,"O")}
  else if(i===2){R(4,1,4,10,"G");R(3,2,6,8,"G");R(2,3,8,6,"G");R(4,2,4,8,"y");R(3,3,6,6,"y");R(5,4,2,4,"G");R(4,5,4,1,"G");R(3,3,2,1,"Y");R(4,2,1,1,"Y")}
  else if(i===3){R(3,3,6,8,"X");R(3,3,2,8,"x");R(3,6,6,2,"f");R(6,1,1,2,"u");R(7,0,2,1,"u");R(8,0,2,1,"y");R(9,1,1,1,"X")}
  else if(i===4){R(5,0,2,1,"C");R(4,1,4,1,"C");R(3,2,6,1,"C");R(2,3,8,2,"C");R(3,5,6,2,"C");R(4,7,4,2,"C");R(5,9,2,2,"C");R(3,3,2,1,"W");R(4,2,1,1,"W");R(4,4,1,1,"W");R(7,4,2,1,"c");R(6,6,2,1,"c");R(6,8,1,2,"c")}
  else{R(5,0,2,3,"y");R(4,2,4,1,"y");R(1,3,10,1,"y");R(2,4,8,1,"y");R(3,5,6,2,"y");R(2,7,8,1,"y");R(2,8,3,1,"y");R(7,8,3,1,"y");R(1,9,3,1,"y");R(8,9,3,1,"y");R(1,10,2,1,"y");R(9,10,2,1,"y");R(5,1,1,2,"Y");R(2,3,3,1,"Y");R(4,4,4,1,"r");R(6,5,1,3,"r")}
 },1);
}
function slotIcon(g,i,cx,cy,s){   // s = lado disponível: escala inteira para os pixels ficarem nítidos
 const sp=slotSprite(i),k=Math.max(2,Math.floor(s/(sp.w+2))),sz=(sp.w+2)*k;g.imageSmoothingEnabled=false;g.drawImage(sp.cv,Math.round(cx-sz/2),Math.round(cy-sz/2),sz,sz);
}
function slotInitReels(){
 slReels=[0,1,2].map(i=>{const strip=[];for(let k=0;k<36;k++)strip.push(k%6);for(let k=35;k>0;k--){const j=Math.floor(Math.random()*(k+1));[strip[k],strip[j]]=[strip[j],strip[k]]}   // fita com os 6 símbolos (6 de cada), embaralhada: todo resultado existe nela
  for(let k=1;k<36;k++)if(strip[k]===strip[k-1]){const j=(k+7)%36;[strip[k],strip[j]]=[strip[j],strip[k]]}
  return{strip,pos:Math.floor(Math.random()*36),vel:0,state:"idle",t0:0,from:0,to:0,dur:0,res:0,stopAt:0,lastTick:0,landed:0}});
}
const easeOutBack=x=>{const c1=1.35,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
function slotDrawFrame(dt){
 const g=slG,t=slT,{w,h,cell,top,rx,rw}=SL;
 g.setTransform(slCv.width/w,0,0,slCv.height/h,0,0);
 // gabinete
 const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,"#5a1620");bg.addColorStop(1,"#2a0a10");g.fillStyle=bg;g.fillRect(0,0,w,h);
 g.strokeStyle="#d6a02a";g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3);
 // lâmpadas correndo na borda de cima (acendem mais rápido quando ganha)
 const won=!!(slFx&&slFx.done&&slFx.win>0),run=won?14:5;for(let i=0;i<17;i++){const on=((i+Math.floor(t*run))%3)===0;g.fillStyle=on?"#fff3a0":"#7a5a1c";g.beginPath();g.arc(14+i*(w-28)/16,13,4,0,7);g.fill();if(on){g.globalAlpha=.35;g.fillStyle="#ffd45c";g.beginPath();g.arc(14+i*(w-28)/16,13,9,0,7);g.fill();g.globalAlpha=1}}
 g.fillStyle="#ffd45c";g.font="900 18px "+FONT;g.textAlign="center";g.textBaseline="middle";g.fillText(__("CAÇA-NÍQUEL"),w/2,32);
 // rolos
 const cy=top+cell*1.5;
 slReels.forEach((R,i)=>{
  const x=rx[i];g.save();g.beginPath();g.rect(x,top,rw,cell*3);g.clip();
  g.fillStyle="#f3ecd8";g.fillRect(x,top,rw,cell*3);
  const spinning=R.state==="spin"||(R.state==="stop"&&R.vel>3);
  const base=Math.floor(R.pos);
  for(let j=base-2;j<=base+2;j++){
   const y=cy-(j-R.pos)*cell,k=((j%36)+36)%36,sym=R.strip[k];
   g.globalAlpha=spinning?.78:1;slotIcon(g,sym,x+rw/2,y,cell*.94);
  }
  g.globalAlpha=1;
  if(spinning){g.fillStyle="rgba(255,255,255,.22)";for(let k=0;k<5;k++){const yy=top+((t*420+k*47+i*13)%(cell*3));g.fillRect(x+6,yy,rw-12,2)}}
  const sh=g.createLinearGradient(0,top,0,top+cell*3);sh.addColorStop(0,"rgba(0,0,0,.55)");sh.addColorStop(.28,"rgba(0,0,0,0)");sh.addColorStop(.72,"rgba(0,0,0,0)");sh.addColorStop(1,"rgba(0,0,0,.55)");g.fillStyle=sh;g.fillRect(x,top,rw,cell*3);
  g.restore();
  // moldura do rolo (pisca no prêmio)
  const hit=won&&(slFx.kind===3||i<2);const pulse=hit?.5+.5*Math.sin(t*14):0;
  g.lineWidth=hit?4:2.5;g.strokeStyle=hit?"rgba(255,"+Math.round(200+55*pulse)+","+Math.round(60+120*pulse)+",1)":"#b8841c";g.strokeRect(x,top,rw,cell*3);
 });
 // linha de pagamento
 g.strokeStyle=won?"rgba(255,244,160,"+(.55+.45*Math.sin(t*16))+")":"rgba(255,70,70,.8)";g.lineWidth=2;g.beginPath();g.moveTo(rx[0]-14,cy);g.lineTo(rx[2]+rw+14,cy);g.stroke();
 g.fillStyle="#ff4646";g.beginPath();g.moveTo(rx[0]-26,cy-9);g.lineTo(rx[0]-10,cy);g.lineTo(rx[0]-26,cy+9);g.fill();g.beginPath();g.moveTo(rx[2]+rw+26,cy-9);g.lineTo(rx[2]+rw+10,cy);g.lineTo(rx[2]+rw+26,cy+9);g.fill();
 // faixa de prêmio
 g.fillStyle="rgba(0,0,0,.55)";g.fillRect(34,top+cell*3+10,392,h-(top+cell*3)-20);
 g.textBaseline="middle";g.textAlign="center";
 if(slWinTo>0){const sc=1+(won&&slWinShow<slWinTo?.06*Math.sin(t*30):0);g.save();g.translate(w/2,top+cell*3+34);g.scale(sc,sc);g.fillStyle="#ffe08a";g.font="900 24px "+FONT;g.fillText("+"+fmt(Math.floor(slWinShow)),0,0);g.restore()}
 else if(slText){g.fillStyle=slFx&&slFx.lost?"#b9a58a":"#ffe08a";g.font="700 16px "+FONT;g.fillText(slText,w/2,top+cell*3+34)}
 // partículas (moedas)
 for(const p of slParts){p.vy+=620*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.l-=dt;
  if(p.y>h-4&&p.vy>0){p.y=h-4;p.vy*=-.45;p.vx*=.7}
  g.save();g.translate(p.x,p.y);g.rotate(p.r);g.globalAlpha=Math.max(0,Math.min(1,p.l*1.5));g.fillStyle=p.c;g.beginPath();g.ellipse(0,0,p.s*1.3,p.s*1.3*Math.abs(Math.cos(p.r*2)),0,0,7);g.fill();g.restore()}
 slParts=slParts.filter(p=>p.l>0);
 if(slFx&&slFx.flash>0){g.fillStyle="rgba(255,240,160,"+(slFx.flash*.45)+")";g.fillRect(0,0,w,h);slFx.flash=Math.max(0,slFx.flash-dt*1.6)}
}
function slotCoins(n,power){for(let i=0;i<n;i++)slParts.push({x:SL.w/2+(Math.random()-.5)*SL.w*.7,y:-6-Math.random()*30,vx:(Math.random()-.5)*160,vy:Math.random()*80,r:Math.random()*6,vr:(Math.random()-.5)*14,s:3.5+Math.random()*2.5,c:Math.random()<.2?"#fff3a0":"#ffd45c",l:1.6+Math.random()*1.6*power})}
function slotFrame(now){
 if(modal!=="slot"||!slCv){slRaf=0;return}
 const dt=Math.min(.05,(now-(slotFrame.last||now))/1000);slotFrame.last=now;slT+=dt;
 // física dos rolos
 for(let i=0;i<3;i++){const R=slReels[i];
  if(R.state==="spin"){R.pos+=R.vel*dt;if(slT>=R.stopAt){const D=.75+(R.slow?.55:0),need=R.vel*D/3;let k=Math.ceil(R.pos+need);for(let g=0;g<72&&R.strip[((k%36)+36)%36]!==R.res;g++)k++;R.state="stop";R.t0=slT;R.from=R.pos;R.to=k;R.dur=D}}
  else if(R.state==="stop"){const x=Math.min(1,(slT-R.t0)/R.dur),p=R.from+(R.to-R.from)*easeOutBack(x);R.vel=Math.abs(p-R.pos)/Math.max(dt,.001);R.pos=p;
   if(x>=1){R.pos=R.to;R.vel=0;R.state="done";slotStopSfx(i);if(slFx)slFx.stopped++;
    if(i===1&&slFx&&slFx.near){slFx.tension=1}}}
  if(R.state==="spin"||R.state==="stop"){const c=Math.floor(R.pos);if(c!==R.lastTick){R.lastTick=c;if(slT-slotFrame.snd>.045){slotFrame.snd=slT;sfx(240+((c%5)*40),.02,"square")}}}
 }
 if(slFx&&!slFx.done&&slFx.near&&slReels[2].state==="spin"&&slReels[1].state==="done"&&slT-slotFrame.tens>.16){slotFrame.tens=slT;slotFrame.tn=(slotFrame.tn||0)+1;sfx(330+slotFrame.tn*38,.07,"triangle");if(slotFrame.tn%2)sfx(660+slotFrame.tn*76,.04,"sine")}   // suspense: o 3º rolo ainda gira com os 2 primeiros iguais
 if(slFx&&!slFx.done&&slFx.stopped>=3){slotFinish()}
 if(slFx&&slFx.done&&slWinShow<slWinTo){slWinShow=Math.min(slWinTo,slWinShow+Math.max(1,slWinTo)*dt*(1/1.1));if(Math.random()<dt*28)sfx(900+Math.random()*500,.025,"triangle")}
 slotDrawFrame(dt);
 slRaf=requestAnimationFrame(slotFrame);
}
slotFrame.last=0;slotFrame.snd=0;slotFrame.tens=0;slotFrame.tn=0;

// ---------- jogo ----------
function slotFinish(){
 const f=slFx;f.done=true;slotBusy=false;
 S.gold+=f.win;S.pend=0;S.slotNet+=f.win-f.bet;save();
 const tiers=f.kind===3?(f.res[0]>=4?3:f.res[0]>=2?2:1):f.win>f.bet?1:0;
 if(f.win>0){slWinShow=0;slWinTo=f.win;slText="";
  slFx.flash=f.kind===3?1:.25;slotCoins(f.kind===3?60+tiers*40:18,f.kind===3?1.4:.6);
  const notes=[523,659,784,1047,1319,1568];const n=f.kind===3?6:3;for(let i=0;i<n;i++)setTimeout(()=>{sfx(notes[i+(f.kind===3?0:1)],.16,"triangle");if(f.kind===3)sfx(notes[i]/2,.2,"sine")},i*95);
  slotCoinSfx(f.kind===3?28+tiers*14:9,f.kind===3?55:90);if(f.kind===3)setTimeout(()=>{sfx(1568,.5,"sine");sfx(2093,.6,"sine");sfx(784,.6,"triangle")},650);
  if(f.kind===3&&f.res[0]===5){sayGold(__("JACKPOT! {0} de ouro",fmt(f.win)));for(let i=0;i<8;i++)setTimeout(()=>{sfx(1568-i*80,.2,"square");slotCoins(30,1.5)},i*180)}
  else sayGold(f.kind===3?__("3 {0}s! +{1} de ouro",__(SLOT_NAMES[f.res[0]]),fmt(f.win)):__("Par de {0}: +{1} de ouro",__(SLOT_NAMES[f.res[0]]),fmt(f.win)))}
 else{slWinTo=0;slText=__("Não foi dessa vez");sfx(220,.16,"triangle");setTimeout(()=>sfx(185,.18,"triangle"),130);setTimeout(()=>sfx(147,.3,"triangle"),270)}
 paintSlotUi();refresh();
}
// ---------- sons do caça-níquel (todos sintetizados) ----------
function slotLeverSfx(){sfx(110,.12,"square");setTimeout(()=>sfx(70,.14,"sawtooth"),70);for(let i=0;i<5;i++)setTimeout(()=>sfx(900+i*90,.025,"square"),140+i*45);setTimeout(()=>{sfx(440,.08,"triangle");sfx(587,.1,"triangle")},400)}   // alavanca, catraca e partida
function slotStopSfx(i){sfx(150+i*40,.1,"sine");sfx(70,.12,"square");setTimeout(()=>sfx(1200+i*220,.05,"triangle"),30)}   // baque + tilintar, mais agudo a cada rolo
function slotCoinSfx(n,gap){for(let i=0;i<n;i++)setTimeout(()=>{sfx(1700+Math.random()*1500,.05,"triangle");if(Math.random()<.4)sfx(2400+Math.random()*900,.03,"sine")},i*gap+Math.random()*gap*.6)}   // moedas caindo na bandeja
function slotSpin(){
 if(slotBusy||modal!=="slot")return;
 const bet=slotBetAmt(slotSel);
 if(!(S.gold>=bet)||!(bet>0)){sayWarn(__("Ouro insuficiente para essa aposta"));sfx(140,.1,"square");return}
 const res=[slotRoll(),slotRoll(),slotRoll()],m=slotMult(res[0],res[1],res[2]),win=bet*m;
 const kind=res[0]===res[1]?(res[1]===res[2]?3:2):0;
 S.gold-=bet;S.pend=win;S.spins++;save();   // aposta sai agora, prêmio fica pendente até os rolos pararem
 slotBusy=true;slWinShow=0;slWinTo=0;slText=__("Girando...");slParts=[];
 slFx={bet,win,res,kind,near:kind===2,done:false,stopped:0,flash:0,lost:win<=0};
 const S0=BAL.slot.spin;
 slReels.forEach((R,i)=>{R.state="spin";R.vel=15+i*1.4;R.res=res[i];R.slow=i===2&&kind>=2;R.stopAt=slT+S0[i]+(i===2&&kind>=2?.9:0);R.lastTick=-1});
 slotLeverSfx();
 paintSlotUi();refresh();
}
function slotKey(e){
 if(e.code==="Escape"){e.preventDefault();if(!slotBusy)closeModal();return}
 if(e.code==="Space"||e.code==="Enter"){e.preventDefault();if(!e.repeat)slotSpin();return}
 if(slotBusy)return;
 const d={ArrowLeft:-1,KeyA:-1,ArrowRight:1,KeyD:1}[e.code];
 if(d){e.preventDefault();slotSel=clamp(slotSel+d,0,BAL.slot.bets.length-1);paintSlotUi();sfx(560,.04,"sine")}
}
function paintSlotUi(){
 const ui=$("slui");if(!ui)return;
 const bets=BAL.slot.bets.map((p,i)=>"<button data-b='"+i+"' class='"+(i===slotSel?"on":"")+"' "+(slotBusy?"disabled":"")+">"+Math.round(p*100)+"%<small>"+fmt(slotBetAmt(i))+"</small></button>").join("");
 const sym=BAL.slot.p3.map((m,i)=>"<span>"+__(SLOT_NAMES[i])+" <b>x"+m+"</b></span>").join("");
 ui.innerHTML="<div class='sgold'>"+__("Ouro: <b>{0}</b>",fmt(S.gold))+"</div><div class='sbets'>"+bets+"</div>"
  +"<button id='slgo' class='go' "+(slotBusy||!(S.gold>=slotBetAmt(slotSel)&&slotBetAmt(slotSel)>0)?"disabled":"")+">"+(slotBusy?__("Girando..."):__("Girar · {0}",fmt(slotBetAmt(slotSel))))+"</button>"
  +"<div class='stbl'>"+__("3 iguais: {0}",sym)+"<br>"+__("2 primeiros iguais: x0,5 a x8 conforme o símbolo")+"</div>"
  +"<div class='snote'>"+__("Retorno médio de ~{0}%: a casa sempre ganha no longo prazo. Aposte só o que não vai fazer falta.",Math.round(slotRtp()*100))
  +(S.spins?" · "+__("Saldo da máquina:")+" <b style='color:"+(S.slotNet>=0?"#6fe3a0":"#ff7a6a")+"'>"+(S.slotNet>=0?"+":"-")+fmt(Math.abs(S.slotNet))+"</b>":"")+"</div>"
  +"<button id='slok' class='cl' "+(slotBusy?"disabled":"")+">"+__("Fechar")+"</button>";
 ui.querySelectorAll("button[data-b]").forEach(b=>b.onclick=()=>{slotSel=+b.dataset.b;paintSlotUi();sfx(560,.04,"sine")});
 $("slgo").onclick=slotSpin;$("slok").onclick=()=>{if(!slotBusy)closeModal()};
}
function openSlot(){
 const b=openModal("slot");sfx(660,.06,"triangle");setTimeout(()=>sfx(880,.08,"triangle"),70);b.style.maxWidth="560px";slotBusy=false;slFx=null;slWinShow=0;slWinTo=0;slText=__("Boa sorte!");slParts=[];
 b.innerHTML="<div class='casino'><canvas id='slcv'></canvas><div id='slui'></div></div>";
 slCv=$("slcv");const dpr=Math.min(2,window.devicePixelRatio||1);slCv.width=SL.w*dpr;slCv.height=SL.h*dpr;slCv.style.cssText="width:100%;max-width:"+SL.w+"px;aspect-ratio:"+SL.w+"/"+SL.h+";display:block;margin:0 auto 10px;border-radius:10px;image-rendering:auto";
 slG=slCv.getContext("2d");slotInitReels();paintSlotUi();
 cancelAnimationFrame(slRaf);slotFrame.last=0;slRaf=requestAnimationFrame(slotFrame);
}

// ===== 2-sistemas/12-baus.js — Baús raros do subsolo: sorteio do prêmio e animação de abertura (janela "chest") =====
// O baú ocupa o lugar de um bloco e a raridade (BAL.chest.tiers) já está definida pela posição, com um visual por raridade. Ao quebrar, o prêmio é sorteado e pago NA HORA (ouro, XP, itens):
// a animação é só apresentação, então fechar o jogo no meio não perde nada. Baús quebrados juntos (dinamite) entram numa fila e abrem um por vez.
let chQ=[];   // fila de prêmios já pagos esperando a animação (não vai para o save)
function chestRoll(r,ti=chestTierPick(Math.random())){
 const T=BAL.chest.tiers,t=T[ti],gold=Math.ceil(blockGold(r)*t.g*(.8+Math.random()*.4)),xp=xpNeed(S.lvl)*t.xp,items=[];
 for(const[k,p,q]of t.it){if(Math.random()>=p)continue;const add=Math.min(q,99-have(k));if(add>0)items.push([k,add])}
 let ore=null,frag=0;
 if(t.ore&&Math.random()<t.ore[0]){const us=ORES.filter(o=>o[3]<=r),o=us[us.length-1-Math.floor(Math.random()*Math.min(2,us.length))];ore=[o[0],t.ore[1],o[2],blockGold(r)*o[1]*t.ore[1]]}
 if(t.fr&&Math.random()<t.fr[0])frag=t.fr[1];
 let perk=null;const pool=Object.keys(PK).filter(k=>pk(k)<10);
 if(pool.length&&Math.random()<t.pk[0])perk=[pool[Math.floor(Math.random()*pool.length)],t.pk[1]];
 const shown=items.map(([k,q])=>[ITEMS[k].n+" x"+q,ITEMS[k].c]);
 if(ore)shown.push([__("Minério: {0} x{1}",__(ore[0]),ore[1]),ore[2]]);
 if(frag)shown.push([__("Fragmentos x{0}",frag),"#ffd45c"]);
 return{ti,gold,xp,items,ore,frag,shown,perk,r};
}
function chestFound(r,ti){
 const R=chestRoll(r,ti);
 S.gold+=R.gold;S.total+=R.gold;S.chests++;S.chT[R.ti]++;S.chGold+=R.gold;S.chFr+=R.frag;if(R.perk)S.chPk++;if(R.ti+1>S.chTop)S.chTop=R.ti+1;
 for(const[k,q]of R.items){S.items[k]=have(k)+q;if(DYN_IDS.includes(k)&&have(S.dsel)<1)S.dsel=k}
 if(R.ore){const[on,n,,v]=R.ore;S.bag.v+=v;S.bag.n+=n;S.bag.o[on]=(S.bag.o[on]||0)+n;S.bag.ov[on]=(S.bag.ov[on]||0)+v;S.oc+=n;if(!S.od.includes(on))S.od.push(on);ctProg("ore",on,n,r)}
 S.pts+=R.frag;
 if(R.perk){const k=R.perk[0],b=pk(k);addPerk(k,RAR[R.perk[1]][1]);R.perk[2]=pk(k)-b}   // perk[2] = níveis ganhos de verdade (o teto é 10)
 gainXp(R.xp);chQ.push(R);return R;
}
function chestTick(){if(!modal&&chQ.length&&S.depth>=0)openChest(chQ.shift())}

// ---------- animação ----------
const CH={w:420,h:392,k:10,cx:210,by:226},CH_POP=1.6;
const CH_NOTES=[523,659,784,1047,1319,1568,2093,2637,3136];
let chCv=null,chG=null,chRaf=0,chT=0,chR=null,chCues=[],chParts=[],chFlash=0,chShow=0,chItemN=0,chDoneAt=0,chShakeT=0,chBg=null,chLast=0,chCoin=false,chLock=0;
const chTier=()=>BAL.chest.tiers[chR.ti];
function chCue(t,fn,must){chCues.push({t,fn,must:!!must,done:false})}
function openChest(R){
 chR=R;chT=0;chParts=[];chFlash=0;chShow=0;chItemN=0;chCoin=false;chLast=0;chLock=performance.now()+600;
 const b=openModal("chest");b.style.maxWidth="470px";
 b.innerHTML="<div class='casino'><canvas id='chcv'></canvas><div id='chui'></div></div>";
 chCv=$("chcv");const dpr=Math.min(2,window.devicePixelRatio||1);chCv.width=CH.w*dpr;chCv.height=CH.h*dpr;
 chCv.style.cssText="width:100%;max-width:"+CH.w+"px;aspect-ratio:"+CH.w+"/"+CH.h+";display:block;margin:0 auto 10px;border-radius:10px;cursor:pointer";
 chCv.onclick=chestAdvance;chG=chCv.getContext("2d");
 // fundo de caverna: pedrinhas fixas
 chBg=[];for(let i=0;i<46;i++)chBg.push([Math.random()*CH.w,Math.random()*CH.h,2+Math.random()*4,Math.random()]);
 // sons: tudo programado por tempo da animação (pular a animação não deixa sons atrasados soltos)
 chCues=[];
 chCue(0,()=>{sfx(90,.15,"square");sfx(60,.22,"sine");setTimeout(()=>sfx(210,.16,"sawtooth"),90);setTimeout(()=>sfx(150,.2,"sawtooth"),210)},true);   // baú cai no chão + rangido
 let tt=.35,i=0,gap=.22;while(tt<CH_POP-.05){const f=300+i*34;chCue(tt,()=>{sfx(f,.05,"square");sfx(f*2,.03,"sine")});tt+=gap;gap=Math.max(.075,gap*.9);i++}   // tique-taque cada vez mais rápido
 chCue(CH_POP,()=>{sfx(70,.28,"square");sfx(2200,.04,"square");sfx(120,.2,"sawtooth");sfx(1400,.12,"sawtooth")},true);                                   // tampa estala
 for(let k=0;k<8;k++)chCue(CH_POP+.02+k*.022,()=>sfx(300+k*170,.05,"sine"),true);                                                                         // sopro de luz subindo
 const t=R.ti,n=Math.min(CH_NOTES.length,3+Math.round(t*1.5));
 for(let k=0;k<n;k++)chCue(CH_POP+.14+k*.085,()=>{sfx(CH_NOTES[k],.18,"triangle");if(t>=2)sfx(CH_NOTES[k]/2,.2,"sine")},true);                              // fanfarra: mais notas quanto mais rara
 const fin=CH_POP+.14+n*.085+.05;
 if(t>=3)chCue(fin,()=>{sfx(1047,.7,"sine");sfx(1319,.7,"sine");sfx(1568,.7,"sine");sfx(110,.5,"sawtooth")},true);
 if(t>=4)for(let k=0;k<10;k++)chCue(fin+.1+k*.07,()=>sfx(2000+Math.random()*2200,.08,"sine"),true);                                                           // brilho lendário
 chCue(CH_POP+.4,()=>slotCoinSfx(10+t*8,70),true);
 chDoneAt=CH_POP+1.2+1.2+R.shown.length*.25+(R.perk?.5:0)+.4;
 if(R.perk)chCue(CH_POP+2.1+R.shown.length*.25,()=>{sfx(660,.12,"triangle");sfx(990,.2,"triangle")},true);
 for(let k=0;k<R.shown.length;k++)chCue(CH_POP+2.1+k*.25,()=>sfx(880+k*110,.08,"triangle"),true);
 paintChUi();
 cancelAnimationFrame(chRaf);chRaf=requestAnimationFrame(chestFrame);
}
const chReady=()=>chT>=chDoneAt;
function paintChUi(){
 const ui=$("chui");if(!ui)return;
 const q=chQ.length?"<div class='snote'>"+__("+ {0} baú(s) na fila",chQ.length)+"</div>":"";
 ui.innerHTML="<button id='chok' class='go'>"+(chReady()?__("Coletar"):__("Pular"))+"</button>"+q;
 $("chok").onclick=chestAdvance;
}
function chestAdvance(){
 if(modal!=="chest"||performance.now()<chLock)return;   // trava curta: quem está martelando Espaço para cavar não pula a animação sem querer
 chLock=performance.now()+350;
 if(chT<CH_POP){chT=CH_POP-.001}                                  // pula o suspense: abre já
 else if(!chReady()){chT=Math.max(chT,chDoneAt);chShow=chR.gold;chItemN=chR.shown.length}   // pula a contagem
 else{cancelAnimationFrame(chRaf);chRaf=0;closeModal();return}
 paintChUi();
}
function chestKey(e){
 if(e.code==="Space"||e.code==="Enter"||e.code==="Escape"){e.preventDefault();if(!e.repeat)chestAdvance()}
}
function chBurst(n,col){
 const T=chTier();
 for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.6,v=120+Math.random()*340;
  chParts.push({x:CH.cx+(Math.random()-.5)*60,y:CH.by-6*CH.k,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:520,l:.8+Math.random()*1.1,ml:1.9,s:2+Math.random()*3,c:i%4===0?"#ffffff":i%3===0?"#ffd45c":col,sq:1})}
}
function chestFrame(now){
 if(modal!=="chest"||!chCv){chRaf=0;return}
 const dt=Math.min(.05,(now-(chLast||now))/1000);chLast=now;
 const was=chT;chT+=dt;
 // sons por tempo: o que ficou para trás por mais de .25 s só toca se for essencial
 for(const c of chCues){if(c.done||c.t>chT)continue;c.done=true;if(chT-c.t<.25||c.must)c.fn()}
 if(was<CH_POP&&chT>=CH_POP){chFlash=1;chBurst(40+chR.ti*40,chTier().c);chShakeT=.35+chR.ti*.08}
 if(was<chDoneAt&&chT>=chDoneAt)paintChUi();
 const tr=chT-CH_POP;
 if(tr>1.2&&chShow<chR.gold){const prev=chShow;chShow=Math.min(chR.gold,chShow+chR.gold*dt/1.1);if(Math.floor(prev*7/chR.gold)!==Math.floor(chShow*7/chR.gold)||Math.random()<dt*20)sfx(900+Math.random()*500,.025,"triangle")}
 if(tr>=2.1)chItemN=Math.min(chR.shown.length,Math.floor((tr-2.1)/.25)+1);
 if(chShow<chR.gold&&chT>=chDoneAt)chShow=chR.gold;
 // chuva de moedas quando começa a contagem
 if(tr>1.2&&!chCoin){chCoin=true;for(let i=0;i<14+chR.ti*10;i++)chParts.push({x:CH.cx+(Math.random()-.5)*CH.w*.7,y:-10-Math.random()*40,vx:(Math.random()-.5)*60,vy:Math.random()*60,g:420,l:1.5+Math.random()*1.2,ml:2.7,s:4+Math.random()*2,c:Math.random()<.2?"#fff3a0":"#ffd45c",sq:1})}
 chDraw(dt);
 chRaf=requestAnimationFrame(chestFrame);
}
function chDraw(dt){
 const g=chG,{w,h,k,cx,by}=CH,T=chTier(),t=chT,popped=t>=CH_POP,tr=t-CH_POP;
 g.setTransform(chCv.width/w,0,0,chCv.height/h,0,0);g.imageSmoothingEnabled=false;
 // tremor de tela na abertura
 let ox=0,oy=0;if(chShakeT>0){chShakeT-=dt;const m=Math.min(1,chShakeT*4)*(3+chR.ti*1.5);ox=(Math.random()-.5)*m;oy=(Math.random()-.5)*m}
 g.save();g.translate(ox,oy);
 // caverna
 const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,"#0b0c14");bg.addColorStop(1,"#1a1420");g.fillStyle=bg;g.fillRect(-10,-10,w+20,h+20);
 for(const[x,y,s,a]of chBg){g.fillStyle="rgba("+(a<.5?"255,255,255":"0,0,0")+",.05)";g.fillRect(x,y,s,s)}
 // cor da aura: a da raridade do baú (que já aparece no visual dele)
 const auraC=T.c;
 const build=Math.min(1,t/CH_POP);
 // chão
 g.fillStyle="rgba(0,0,0,.45)";g.beginPath();g.ellipse(cx,by+4,k*8.2,k*1.5,0,0,7);g.fill();
 // brilho no chão
 const glow=g.createRadialGradient(cx,by-2*k,4,cx,by-2*k,k*(popped?15:5+build*5));
 glow.addColorStop(0,auraC);glow.addColorStop(1,"rgba(0,0,0,0)");
 g.globalCompositeOperation="lighter";g.globalAlpha=popped?Math.min(.8,.35+tr*.8):.12+build*.3;g.fillStyle=glow;g.fillRect(0,0,w,h);g.globalAlpha=1;
 // raios giratórios depois da abertura
 if(popped){const n=14,rot=t*.5,len=Math.max(w,h),a0=Math.min(1,tr*2.5)*(.2+chR.ti*.04);
  for(let i=0;i<n;i++){const a=rot+i*6.283/n;g.fillStyle=T.c;g.globalAlpha=a0*(i%2?.6:1);g.beginPath();g.moveTo(cx,by-6*k);g.lineTo(cx+Math.cos(a)*len,by-6*k+Math.sin(a)*len);g.lineTo(cx+Math.cos(a+.1)*len,by-6*k+Math.sin(a+.1)*len);g.closePath();g.fill()}
  g.globalAlpha=1}
 g.globalCompositeOperation="source-over";
 // baú: entra caindo, treme cada vez mais, estala
 const dy=t<.3?-(1-t/.3)*70:0;
 const sh=popped?0:Math.min(1,Math.max(0,(t-.35)/(CH_POP-.4)))*5,sx=Math.sin(t*61)*sh,sy2=Math.abs(Math.sin(t*47))*-sh*.5;
 const bx=Math.round(cx-6*k+sx),byy=Math.round(by-6*k+dy+sy2);
 const body=sprChBody(chR.ti);g.drawImage(body.cv,bx-k,byy-k,(body.w+2)*k,(body.h+2)*k);
 // interior iluminado
 if(popped){g.globalCompositeOperation="lighter";const ia=Math.min(1,tr*4);g.globalAlpha=ia;g.fillStyle=T.c;g.fillRect(bx+k,byy-k*.6,10*k,k*1.2);g.fillStyle="#ffffff";g.globalAlpha=ia*.7;g.fillRect(bx+3*k,byy-k*.4,6*k,k*.8);
  // feixe de luz
  const bm=g.createLinearGradient(0,byy,0,0);bm.addColorStop(0,T.c);bm.addColorStop(1,"rgba(0,0,0,0)");g.globalAlpha=ia*(.45+.1*Math.sin(t*9));g.fillStyle=bm;g.fillRect(bx+2*k,0,8*k,byy);
  g.globalAlpha=1;g.globalCompositeOperation="source-over"}
 // tampa: antes da abertura fica fechada com fresta de luz; depois vira para trás
 const hing=byy;
 if(!popped){
  const lift=t>CH_POP-.5?Math.abs(Math.sin(t*70))*k*.35*((t-(CH_POP-.5))/.5):0;
  const lid=sprChLid(false,chR.ti);g.drawImage(lid.cv,bx-k,hing-4*k-lift-k,(lid.w+2)*k,(lid.h+2)*k);
  if(build>.25){g.globalCompositeOperation="lighter";g.fillStyle=auraC;g.globalAlpha=.25+build*.55;g.fillRect(bx+k*.5,hing-lift-2,11*k,2+lift);g.globalAlpha=1;g.globalCompositeOperation="source-over"}
 }else{
  const ang=Math.min(1,tr/.3),a=easeOutBack(ang)*2.25,cs=Math.cos(a),hh=4*k*Math.abs(cs),lift=Math.sin(a)*k*1.4;
  const lid=sprChLid(cs<0,chR.ti);g.drawImage(lid.cv,bx-k,hing-hh-lift-k*Math.abs(cs),(lid.w+2)*k,hh+2*k*Math.abs(cs))
 }
 // partículas
 for(let i=chParts.length-1;i>=0;i--){const p=chParts[i];p.l-=dt;if(p.l<=0||p.y>h+20){chParts.splice(i,1);continue}
  p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;g.globalAlpha=Math.min(1,p.l/p.ml*2.2);g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)}
 g.globalAlpha=1;
 // faíscas saindo da fresta durante o suspense
 if(!popped&&build>.3&&Math.random()<dt*(6+build*40))chParts.push({x:cx+(Math.random()-.5)*8*k,y:byy-2,vx:(Math.random()-.5)*50,vy:-60-Math.random()*90,g:60,l:.5+Math.random()*.4,ml:.9,s:2,c:auraC});
 // faixa com a raridade
 if(popped&&tr>.35){
  const e=Math.min(1,(tr-.35)/.4),sc=easeOutBack(e),txt=__("BAÚ {0}!",__(T.n).toUpperCase());
  g.save();g.translate(cx,56);g.scale(sc,sc);g.font="900 "+(chR.ti>=3?34:30)+"px "+FONT;g.textAlign="center";g.textBaseline="middle";
  g.lineWidth=7;g.lineJoin="round";g.strokeStyle="rgba(8,6,12,.9)";g.strokeText(txt,0,0);
  g.fillStyle=chR.ti===4?"hsl("+(40+Math.sin(t*6)*12)+",100%,"+(60+Math.sin(t*9)*8)+"%)":T.c;g.fillText(txt,0,0);g.restore();
  g.font="700 11px "+FONT;g.textAlign="center";g.fillStyle="rgba(255,255,255,"+(e*.6)+")";g.fillText(__("achado a {0} m de profundidade",chR.r),cx,86)}
 // prêmios
 if(popped&&tr>1.2){
  g.textAlign="center";g.textBaseline="middle";g.font="900 24px "+FONT;g.lineWidth=5;g.lineJoin="round";
  const gt=__("+{0} de ouro",fmt(Math.floor(chShow)));g.strokeStyle="rgba(8,6,12,.9)";g.strokeText(gt,cx,262);g.fillStyle="#ffd45c";g.fillText(gt,cx,262);
  g.font="700 12px "+FONT;g.fillStyle="#9ad7ff";g.fillText("+"+fmt(Math.round(chR.xp))+" XP",cx,284);
  for(let i=0;i<chItemN;i++){const it=chR.shown[i],y=306+Math.floor(i/2)*20,col=i%2,n=Math.min(2,chR.shown.length-Math.floor(i/2)*2),x=cx+(col-(n-1)/2)*200;
   const pop=Math.min(1,(tr-2.1-i*.25)/.2);g.globalAlpha=Math.max(0,pop);g.fillStyle=it[1];g.fillRect(x-80,y-5,10,10);g.fillStyle="#fff";g.font="700 12px "+FONT;g.textAlign="left";g.fillText(it[0],x-66,y);g.textAlign="center";g.globalAlpha=1}}
 if(chR.perk&&chItemN>=chR.shown.length){const[pkk,pri]=chR.perk,RR=RAR[pri],pt=tr-2.1-chR.shown.length*.25,y=306+Math.ceil(chR.shown.length/2)*20+8;
  if(pt>0){g.globalAlpha=Math.min(1,pt/.25);g.font="900 13px "+FONT;g.textAlign="center";g.textBaseline="middle";g.lineWidth=4;g.strokeStyle="rgba(8,6,12,.9)";const tx=__("BÔNUS {0}: {1} +{2} nv",__(RR[0]).toUpperCase(),__(PK[pkk][0]),fmtN(chR.perk[2]??RR[1]));g.strokeText(tx,cx,y);g.fillStyle=RR[2];g.fillText(tx,cx,y);g.globalAlpha=1}}
 // flash da abertura
 if(chFlash>0){chFlash=Math.max(0,chFlash-dt*2.6);g.fillStyle="rgba(255,255,255,"+chFlash*.85+")";g.fillRect(-10,-10,w+20,h+20)}
 g.restore();
 // moldura: dourada, e da cor da raridade depois da abertura
 g.strokeStyle=popped?T.c:"#7a4f27";g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3);
}

// ===== 2-sistemas/13-pesca.js — Pesca no estilo Stardew Valley (riacho e mar) e venda dos peixes na carrocinha =====
// Fluxo (tudo no próprio mapa, sem janela): Espaço (ou clique) perto da água -> a câmera dá zoom e o personagem lança a vara -> espere o peixe morder (aparece "!")
// -> aperte Espaço a tempo para fisgar -> minijogo: segure Espaço para subir a barra verde e solte para ela descer; mantenha o peixe dentro dela até a barra de progresso encher. Esc sai.
// Números: BAL.fish. Espécies e preços: FISH (1-nucleo/02-camadas-minerios.js). Os peixes ficam em S.fb ([id, cm, perfeito]) e podem ser vendidos
// na carrocinha da loja ou assados na fogueira (14-fogueira.js). Desenho da pesca no mundo e dicas: 5-desenho/16-pesca-desenho.js (zoom e câmera: 3-mundo/00-camera.js e 6-jogo/01-laco-inicio.js).
const FISH_BY={};for(const f of FISH)FISH_BY[f.id]=f;
const JUNK=[N_("Bota velha"),N_("Alga"),N_("Lata enferrujada")];
// Onde dá para pescar: perto do riacho (inclui a ponte) ou no fim da praia, junto ao trapiche
const fishSpot=()=>{if(S.depth!==0)return null;const c=S.mc;if((c>=RIVER_C0-2&&c<=RIVER_C1+2)||(c>=FRIV_C0-2&&c<=FRIV_C1+2))return"r";if(c>=SURF_R-3)return"s";return null};
const rainy=()=>wx.cur==="rain"||wx.cur==="storm";
const rodZone=l=>Math.min(BAL.fish.bar.h*.6,BAL.fish.bar.base+BAL.fish.bar.per*l);   // altura da zona verde (px da pista)
const baitBite=l=>Math.max(.3,1-BAL.fish.baitCut*l);                                  // multiplicador do tempo de espera
const baitRare=l=>1+BAL.fish.baitRare*l;                                              // multiplicador do peso dos peixes raros
const fishValue=e=>{const f=FISH_BY[e[0]];return f?Math.max(1,Math.ceil(blockGold(S.best)*f.v*(e[1]/f.len)*(e[2]?BAL.fish.perfect:1))):0};
const tierName=t=>[__("comum"),__("raro"),__("lendário")][t]||"";
function fishOk(f,p){
 if(f.p!==p)return false;
 if(f.se&&!f.se.includes(SEA.idx))return false;
 if(f.ng&&nightAmt()<.5)return false;
 if(f.rn&&!rainy())return false;
 return true;
}
// Sorteia a espécie (null = lixo). A isca e a chuva aumentam a chance dos peixes raros.
function fishPick(p){
 if(Math.random()<BAL.fish.junk)return null;
 const bo=baitRare(S.lv.bait),rb=rainy()?BAL.fish.rain:1,pool=FISH.filter(f=>fishOk(f,p)).map(f=>({f,w:f.w*(f.t>0?bo*rb:1)}));
 let tot=0;for(const x of pool)tot+=x.w;
 let r=Math.random()*tot;for(const x of pool){r-=x.w;if(r<=0)return x.f}
 return pool[0].f;
}

// ---------- pesca direto no mundo (sem janela): a câmera dá zoom na água e o personagem lança a vara ----------
let fs=null,fishHold=false;
const FSC={h:288,tw:14};   // pista do minijogo (px lógicos; o desenho escala para a tela)
const CASTT={wind:.32,snap:.1,fly:.55};   // balançar a vara para trás, estalar para a frente e voo da boia (s)
function fishUse(){
 const p=fishSpot();if(!p)return false;
 if(modal)return true;
 if(fs)return true;
 if(S.fb.length>=BAL.fish.bag){sayWarn(__("Bolsa de peixes cheia: venda na carrocinha ou asse na fogueira"));return true}
 startFish(p);return true;
}
function fishHit(px,py){   // clique do mouse sobre a água (riacho ou mar/trapiche) estando perto dela
 if(fs)return false;
 if(!fishSpot())return false;
 const y=rowY(0);if(py<y-T*2.6||py>y+T*1.6)return false;
 const c=camX+(px-W/2)/T;
 return(c>=RIVER_C0-.5&&c<=RIVER_C1+.5)||(c>=FRIV_C0-.5&&c<=FRIV_C1+.5)||c>=PIER_C-1.2;
}
// Coluna da água onde a boia cai e para que lado o personagem olha
function fishAim(p){
 const m=S.mc;let d=S.dir==="left"?-1:1,tc;
 if(p==="r"){
  const[R0,R1]=riverOf(m);
  if(m<R0)d=1;else if(m>R1)d=-1;
  tc=clamp(m+d*3,R0,R1);
 }else{
  d=1;tc=Math.min(Math.max(SURF_R+2.2,m+4,PIER_END_C+1.4),SURF_R+9);   // a boia cai sempre depois da ponta do trapiche
 }
 return{d,tc};
}
function startFish(p){
 const{d,tc}=fishAim(p);
 S.dir=d<0?"left":"right";S.prog=0;
 document.body.classList.add("fishing");   // avisos de conquista sobem para o alto enquanto pesca (não cobrem a tira de dicas nem o cartão)
 fs={p,age:0,t:0,ph:"cast",tc,lock:performance.now()+350,rel:false,rip:9,stop:false};
 fishHold=false;fishCast();
}
function fishEnd(){fishHold=false;fs=null;document.body.classList.remove("fishing")}
function fishCast(){
 const B=BAL.fish;
 Object.assign(fs,{ph:"cast",t:0,rel:false,rip:9,wait:(B.wait[0]+Math.random()*(B.wait[1]-B.wait[0]))*baitBite(S.lv.bait),f:null,junk:null,res:null,lost:false,msg:""});
 sfx(360,.06,"triangle");setTimeout(()=>sfx(240,.09,"sine"),70);
 sayFish(__("Espere morder. Aperte Espaço no !"));
}
// Um passo da pesca (chamado pelo laço do jogo; dt = 0 com o jogo pausado)
function fishTick(dt){
 if(!fs)return;
 if(!fishSpot()||S.depth>0){fishEnd();return}
 fs.age+=dt;fs.t+=dt;fs.rip+=dt;
 const ph=fs.ph,C=CASTT;
 if(ph==="cast"){
  if(!fs.rel&&fs.t>=C.wind+C.snap){fs.rel=true;sfx(520,.05,"triangle");sfx(300,.12,"sine")}
  if(fs.t>=C.wind+C.snap+C.fly){fs.ph="wait";fs.t=0;fs.rip=0;fishSplash(10);sfx(170,.1,"sine");sfx(90,.14,"triangle")}
 }
 else if(ph==="wait"){if(fs.t>=fs.wait)fishBite()}
 else if(ph==="bite"){if(fs.t>=BAL.fish.window)fishLose(__("O peixe soltou a isca antes de você puxar!"))}
 else if(ph==="reel")fishReelTick(dt);
}
function fishBite(){
 fs.f=fishPick(fs.p);fs.ph="bite";fs.t=0;fs.rip=0;
 sfx(880,.07,"square");setTimeout(()=>sfx(1320,.12,"square"),70);
 fishSplash(6);
 sayFish(__("AGORA!"));
}
// Espaço / clique / toque / botão A (um aperto): fisga ou lança de novo
function fishAct(){
 if(!fs||performance.now()<fs.lock)return;
 const ph=fs.ph;
 if(ph==="wait")fishLose(__("Você puxou cedo demais e o peixe fugiu!"));
 else if(ph==="bite")fishHook();
 else if(ph==="done"){
  if(S.fb.length>=BAL.fish.bag){sayWarn(__("Bolsa de peixes cheia: venda na carrocinha ou asse na fogueira"));return}
  fishCast();
 }
}
function fishHook(){
 const f=fs.f;
 if(!f){fishJunk();return}
 const B=BAL.fish,H=B.bar.h,zh=rodZone(S.lv.rod);
 Object.assign(fs,{ph:"reel",t:0,zh,zc:H-zh/2,vz:0,fy:H*.6,ft:H*.6,ftT:.4,pr:B.prog.start,outT:0,inZ:false,len:Math.round(f.len*(.75+Math.random()*.5))});
 sfx(660,.06,"triangle");setTimeout(()=>sfx(990,.08,"triangle"),60);
 sayFish(__("Segure Espaço: sobe · Solte: desce"));
}
// Um passo do minijogo (dt em s). Posições em px da pista, de cima (0) para baixo (altura BAL.fish.bar.h).
// Devolve 1 (pegou), -1 (fugiu) ou 0 (continua). Fica separado do desenho para poder ser testado.
function reelStep(s,dt,hold){
 const B=BAL.fish,H=B.bar.h,zh=s.zh,f=s.f;
 s.vz+=(hold?-B.bar.lift:B.bar.grav)*dt;s.vz=clamp(s.vz,-B.bar.maxV,B.bar.maxV);s.zc+=s.vz*dt;
 if(s.zc<zh/2){s.zc=zh/2;if(s.vz<0)s.vz=0}
 if(s.zc>H-zh/2){s.zc=H-zh/2;s.vz=s.vz>0?-s.vz*B.bar.bounce:0;if(Math.abs(s.vz)<25)s.vz=0}
 // o peixe nada em arrancadas até um alvo novo; quanto mais difícil a espécie, mais rápido e mais longe ele vai
 s.ftT-=dt;
 if(s.ftT<=0){const far=Math.random()<.3+.05*f.d;s.ft=clamp(s.fy+(Math.random()-.5)*H*(far?1.1:.45),14,H-14);s.ftT=Math.max(.3,1.5-.09*f.d)*(.5+Math.random())}
 const sp=B.fishSpd+f.d*B.fishSpdD,dy=s.ft-s.fy;s.fy+=Math.sign(dy)*Math.min(Math.abs(dy),sp*dt);
 s.inZ=Math.abs(s.fy-s.zc)<=zh/2;
 if(s.inZ)s.pr+=B.prog.up*dt;else{s.pr-=B.prog.down*(1+B.prog.downD*f.d)*dt;s.outT+=dt}
 s.pr=Math.min(1,s.pr);
 return s.pr>=1?1:s.pr<=0?-1:0;
}
function fishReelTick(dt){
 const r=reelStep(fs,dt,fishHold);
 if(r>0)fishWin();else if(r<0||fs.t>BAL.fish.maxTime)fishLose(__("O peixe fugiu!"));
 else if(fs.inZ&&Math.random()<dt*7)sfx(500+fs.pr*500,.015,"square");   // tique da carretilha, mais agudo perto de pegar
}
function fishWin(){
 const f=fs.f,B=BAL.fish,perfect=fs.outT<=B.perfectOut,e=[f.id,fs.len,perfect?1:0];
 S.fb.push(e);S.fishN++;if(perfect)S.fishP++;
 const known=f.id in S.fdx,rec=fs.len>(S.fdx[f.id]||0);if(rec)S.fdx[f.id]=fs.len;
 gainXp(xpNeed(S.lvl)*(.015+.02*f.t)*(perfect?1.5:1));
 const val=fishValue(e);
 fs.ph="done";fs.t=0;fs.res={f,len:fs.len,perfect,isNew:!known,rec:known&&rec,val};
 fs.msg=__("{0}: {1} cm. Vale cerca de {2} de ouro. Venda na carrocinha ou asse na fogueira.",__(f.n),fs.len,fmt(val));
 fishSplash(14);sayFish(fs.msg);
 const notes=[523,659,784,1047,1319].slice(0,2+f.t*1+(perfect?1:0)+(known?0:1));notes.forEach((n,i)=>setTimeout(()=>{sfx(n,.16,"triangle");if(perfect)sfx(n/2,.2,"sine")},i*95));
 save();
}
function fishLose(msg){
 fs.ph="done";fs.t=0;fs.res=null;fs.lost=true;fs.msg=msg;sayFish(msg);
 sfx(300,.15,"triangle");setTimeout(()=>sfx(220,.2,"triangle"),120);setTimeout(()=>sfx(160,.3,"triangle"),260);
}
function fishJunk(){
 const n=JUNK[Math.floor(Math.random()*JUNK.length)],g=Math.max(1,Math.ceil(blockGold(S.best)*BAL.fish.junkV));
 S.gold+=g;S.total+=g;S.fishG+=g;
 fs.ph="done";fs.t=0;fs.res=null;fs.lost=false;fs.junk=n;
 fs.msg=__("Você pescou: {0}. Vendida por {1} de ouro.",__(n),fmt(g));
 sfx(200,.12,"sawtooth");sfx(150,.14,"square");sayFish(fs.msg);refresh();
}
// Controle: A fisga e segura para subir a barra (o estado "segurando" vem do botão), B sai (ver 4-interface/07-controle.js)
addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="Enter")fishHold=false});
addEventListener("pointerup",()=>{fishHold=false});
addEventListener("pointercancel",()=>{fishHold=false});
addEventListener("blur",()=>{fishHold=false});

// ---------- Izans (dono da carrocinha): vender peixes ----------
function fishGroups(){   // peixes da bolsa agrupados por espécie (na ordem de FISH) com quantidade e valor total
 const g={};
 for(const e of S.fb){const f=FISH_BY[e[0]];if(!f)continue;const o=g[e[0]]||(g[e[0]]={f,n:0,v:0});o.n++;o.v+=fishValue(e)}
 return FISH.filter(f=>g[f.id]).map(f=>g[f.id]);
}
function marketUse(){
 if(!nearKeeper()||!S.fb.length)return false;
 if(modal)return true;
 openMarket();return true;
}
function marketHit(px,py){
 if(!S.fb.length)return false;
 const y=rowY(0);if(py<y-T*2.8||py>y+T*.4)return false;
 return Math.abs(camX+(px-W/2)/T-KEEPER_C)<=1.1;   // clique no Izans
}
function openMarket(){const b=openModal("fmk");b.style.maxWidth="460px";paintMarket()}
function paintMarket(){
 const b=$("bx");if(modal!=="fmk"||!b)return;
 const gs=fishGroups(),tot=gs.reduce((a,x)=>a+x.v,0);
 b.innerHTML="<div class='fkw'><h2 class='fkh'>"+__("Vender para Izans")+"</h2>"
  +(gs.length?"<div class='fklist'>"+gs.map(x=>"<button data-s='"+x.f.id+"' data-t='"+x.f.t+"'><i style='background:"+x.f.c+"'></i><span class='n'>"+__(x.f.n)+" <small>x"+x.n+"</small></span><span class='v'>+"+fmt(x.v)+"</span></button>").join("")+"</div><button id='fkall' class='go'>"+__("Vender tudo · {0}",fmt(tot))+"</button>"
   :"<div class='fkfood'>"+__("Você não tem peixes para vender.")+"</div>")
  +"<div class='fkfood'>"+__("Dica: peixes também podem ser assados na fogueira e viram comida de energia.")+"</div><div class='fsbtns'><button id='fkclose'>"+__("Fechar")+"</button></div></div>";
 b.querySelectorAll("button[data-s]").forEach(x=>x.onclick=()=>fishSell(x.dataset.s));
 const all=$("fkall");if(all)all.onclick=()=>fishSell(null);
 $("fkclose").onclick=closeModal;
}
function fishSell(id){   // id = espécie; null vende tudo
 let v=0,n=0;const keep=[];
 for(const e of S.fb){if(id==null||e[0]===id){v+=fishValue(e);n++}else keep.push(e)}
 if(!n)return;
 S.fb=keep;S.gold+=v;S.total+=v;S.fishG+=v;gainXp(Math.min(60,n*.3));
 sfx(880,.1,"triangle");setTimeout(()=>sfx(1175,.12,"triangle"),90);setTimeout(()=>sfx(1568,.2,"triangle"),180);
 sayFish(__("Peixes vendidos: +{0}",fmt(v)));
 paintMarket();refresh();save();
}

// ===== 2-sistemas/14-fogueira.js — Fogueira: assar os peixes pescados e transformá-los em comida de energia =====
// Espaço (ou clique) perto da fogueira abre a janela: escolha um peixe, ele fica no espeto e o marcador da barra de ponto vai e volta cada vez mais rápido; aperte Espaço (ou o botão)
// quando ele passar pela faixa certa (se demorar demais o peixe queima sozinho). Crua/mal passada rebaixa a comida, no ponto mantém, PERFEITA sobe um nível, queimada vira carvão (o peixe se perde).
// Comida pela raridade do peixe: comum = Peixe assado, raro = Peixe grelhado, lendário = Banquete do pescador (ITEMS pas/pgr/pbq; ficam na barra).
// Velocidade e limites do ponto: BAL.fish.cook. Desenho da janela: 5-desenho/16-pesca-desenho.js. O peixe só sai da bolsa no fim, então fechar a janela no meio não perde nada.
const FOODS=["pas","pgr","pbq"];
const nearCamp=()=>onGround()&&Math.abs(S.mc-CAMP_C)<=2;
const CPC={w:460,h:220};
let cp=null,cpRaf=0,cpCv=null,cpG=null;
function campHit(px,py){
 const y=rowY(0);if(py<y-T*2.6||py>y+T*.4)return false;
 return Math.abs(camX+(px-W/2)/T-CAMP_C)<=2.2;
}
function campUse(){
 if(!nearCamp())return false;
 if(modal)return true;
 openCamp();return true;
}
function openCamp(){
 const b=openModal("camp");b.style.maxWidth="500px";
 b.innerHTML="<div class='casino campbox potbox'><canvas id='cpcv'></canvas><div id='cpui'></div></div>";
 cpCv=$("cpcv");const dpr=Math.min(2,window.devicePixelRatio||1);cpCv.width=CPC.w*dpr;cpCv.height=CPC.h*dpr;
 cpCv.style.cssText="width:100%;max-width:"+CPC.w+"px;aspect-ratio:"+CPC.w+"/"+CPC.h+";display:block;margin:0 auto 8px;border-radius:10px";
 cpG=cpCv.getContext("2d");
 cpCv.onpointerdown=()=>{if(!cp)return;if(cp.sc==="roast")campTake();else if(cp.sc==="result"&&cp.t>.5){cp={sc:"list",t:0,age:cp.age};campPaint()}};   // tocar/clicar na fogueira tira o peixe (celular) e volta à lista
 cp={sc:"list",t:0,age:0};campPaint();
 cancelAnimationFrame(cpRaf);campFrame.last=0;cpRaf=requestAnimationFrame(campFrame);
}
function campPaint(){
 const ui=$("cpui");if(!ui||!cp||modal!=="camp")return;
 if(cp.sc==="list"){
  const gs=fishGroups();
  ui.innerHTML="<div class='fshint'><span>"+(gs.length?__("Escolha um peixe · no ponto perfeito sobe um nível"):__("Sem peixes · pesque no riacho ou no mar"))+"</span></div>"
   +(gs.length?"<div class='fklist'>"+gs.map(x=>"<button data-s='"+x.f.id+"' data-t='"+x.f.t+"' style='--tc:"+x.f.c+"'><span class='rn'>"+__(x.f.n)+"</span><span class='rq'><em>"+tierName(x.f.t)+"</em><u>\u2192</u><em class='ok'>"+ITEMS[FOODS[x.f.t]].n+"</em></span><span class='v'>x"+x.n+"</span></button>").join("")+"</div>":"")
   +"<div class='cpfoods'><div class='cpft'><span>"+__("Comidas")+"</span></div><div class='cpfg'>"+FOODS.map(k=>"<div class='fd"+(have(k)?"":" no")+"' style='--fc:"+ITEMS[k].c+"'><i></i><span class='fn'"+(ITEMS[k].n.length>16?" style='font-size:.54rem'":"")+">"+ITEMS[k].n+"</span><small>"+__("+{0}% de energia",Math.round(ITEMS[k].en*100))+"</small><b>x"+have(k)+"</b></div>").join("")+"</div></div>"
   +"<div class='fsbtns'><button id='cpclose'>"+__("Fechar · Esc")+"</button></div>";
  ui.querySelectorAll("button[data-s]").forEach(x=>x.onclick=()=>campStart(x.dataset.s));
  $("cpclose").onclick=closeModal;
 }else if(cp.sc==="roast"){
  ui.innerHTML="<div class='fshint'><span>"+__("<b>Espaço</b> na faixa <b>dourada</b> · não demore ou queima!")+"</span></div>"
   +"<div class='fsbtns'><button id='cptake' class='go'>"+__("Tirar do fogo · Espaço")+"</button><button id='cpback'>"+__("Voltar")+"</button></div>";
  $("cptake").onclick=campTake;$("cpback").onclick=()=>{cp={sc:"list",t:0,age:cp.age};campPaint()};
 }else{
  const r=cp.res,names=[__("Mal passado"),__("No ponto"),__("PERFEITO!"),__("Queimou!")];
  ui.innerHTML="<div class='fshint'><span><b>"+names[r.q]+"</b> "+(r.food?__("Você ganhou: {0}",ITEMS[r.food].n):__("Virou carvão. Mais sorte da próxima vez."))+"</span></div>"
   +"<div class='fsbtns'><button id='cpagain' class='go'>"+__("Assar outro")+"</button><button id='cpclose'>"+__("Fechar · Esc")+"</button></div>";
  $("cpagain").onclick=()=>{cp={sc:"list",t:0,age:cp.age};campPaint()};$("cpclose").onclick=closeModal;
 }
}
function campStart(id){
 let idx=-1;   // assa o menor peixe da espécie primeiro (os maiores valem mais para vender)
 for(let i=0;i<S.fb.length;i++){const e=S.fb[i];if(e[0]===id&&(idx<0||e[1]<S.fb[idx][1]))idx=i}
 const f=FISH_BY[id];if(idx<0||!f)return;
 cp={sc:"roast",t:0,age:cp.age,id,idx,f,ph:0,p:0,tt:0,sizz:0};
 campPaint();sfx(300,.06,"triangle");
}
// qualidade pelo ponto p (0 a 1): 0 mal passado · 1 no ponto · 2 perfeito · 3 queimado
const campQuality=p=>{const z=BAL.fish.cook.zones;return p<z[0]?0:p<z[1]?1:p<z[2]?2:3};
function campTake(){
 if(!cp||cp.sc!=="roast"||modal!=="camp")return;
 const q=campQuality(Math.min(1,cp.p)),f=cp.f,e=S.fb[cp.idx];
 if(!e||e[0]!==cp.id){cp={sc:"list",t:0,age:cp.age};campPaint();return}
 S.fb.splice(cp.idx,1);
 let food=null;
 if(q<3){
  const tier=clamp(f.t+(q===2?1:q===0?-1:0),0,2);food=FOODS[tier];
  S.items[food]=Math.min(99,have(food)+1);S.cookN++;if(q===2)S.cookP++;
  gainXp(xpNeed(S.lvl)*.01*(1+tier));
 }
 cp={sc:"result",t:0,age:cp.age,f,res:{q,food}};
 if(q===2){[659,784,988,1319].forEach((n,i)=>setTimeout(()=>{sfx(n,.16,"triangle");sfx(n/2,.2,"sine")},i*90))}
 else if(q===3){sfx(150,.25,"sawtooth");setTimeout(()=>sfx(110,.3,"sawtooth"),140)}
 else{sfx(587,.1,"triangle");setTimeout(()=>sfx(784,.14,"triangle"),90)}
 campPaint();save();refresh();
}
function campFrame(now){
 if(modal!=="camp"||!cp||!cpCv){cpRaf=0;return}
 const dt=Math.min(.05,(now-(campFrame.last||now))/1000);campFrame.last=now;
 cp.age+=dt;cp.t+=dt;
 if(cp.sc==="roast"){
  const C=BAL.fish.cook;cp.ph+=C.speed[cp.f.t]*(1+C.ramp*Math.floor(cp.ph))*dt;   // fase: cada 1 é uma ida ou uma volta, cada vez mais rápida
  const m=cp.ph%2;cp.p=m<1?m:2-m;cp.tt=Math.min(1,cp.ph/C.passes);cp.sizz-=dt;
  if(cp.sizz<=0){cp.sizz=.1+Math.random()*.16;sfx(1800+Math.random()*2200,.02,"sawtooth")}
  if(cp.ph>=C.passes){cp.p=1;campTake()}   // demorou demais: queimou
 }
 campDraw(cpG,dt);
 cpRaf=requestAnimationFrame(campFrame);
}
function campKey(e){
 if(e.code==="Escape"){e.preventDefault();closeModal();return}
 if(e.code==="Space"||e.code==="Enter"){
  if(!cp)return;
  e.preventDefault();if(e.repeat)return;
  if(cp.sc==="roast")campTake();
  else if(cp.sc==="result"&&cp.t>.5){cp={sc:"list",t:0,age:cp.age};campPaint()}
 }
}

// ===== 2-sistemas/15-fundo.js — Final: a cenoura dourada na Rocha-mãe (cena de chegada) e a escolha entre Renascer e continuar cavando =====
// Ao chegar à Rocha-mãe (1500 m) abre-se uma alcova ao lado do jogador com a cenoura dourada. A cena pede para tocar nela; depois vem a tela "VOCÊ CHEGOU AO FUNDO" (3-mundo/03-mineracao.js, openBottom) com as duas escolhas.
// carrotC é só da sessão (não entra no save): o Renascer gera outro mundo e zera.
let carrotC=null,memLock=0;
function carrotSpot(){
 if(carrotC===null&&S.depth>=FINAL_DEPTH){carrotC=clamp(S.mc+(S.mc>0?-1:1),-HALF,HALF);dug.add(carrotC+","+(FINAL_DEPTH-1))}
 return carrotC}
// Chamado pelo laço: se o jogo foi aberto no fundo, a cenoura continua lá (desenhada), sem repetir a cena.
function memCheck(){if(S.depth>=FINAL_DEPTH)carrotSpot()}
function openMemoria(){
 if(S.depth<FINAL_DEPTH)return;
 if(modal){setTimeout(openMemoria,800);return}
 const b=openModal("mem");b.style.maxWidth="440px";
 const P=[__("Uma cenoura dourada cresce da raiz do cristal, bem no coração do abismo. Ela pulsa devagar, como se esperasse por você.")];
 if(S.lv.pet>0)P.push(__("O vagalume não sai do seu lado. Ele brilha tanto que dá para sentir o calor daqui."));
 b.innerHTML="<div class='carta gold'><h2>"+__("A CENOURA DOURADA")+"</h2>"+P.map((t,i)=>"<p style='--i:"+i+"'>"+t+"</p>").join("")
  +"<button id='mem-go' disabled style='--i:"+(P.length+1)+"'>"+__("Tocar na cenoura")+"</button></div>";
 memLock=performance.now()+(P.length+1)*550+900;
 setTimeout(()=>{const x=$("mem-go");if(x)x.disabled=false},memLock-performance.now());
 $("mem-go").onclick=tocarCenoura}
function memKey(e){   // só o botão "Tocar na cenoura" aceita teclado (Espaço/Enter, depois da trava); Esc não fecha a cena
 if($("mem-go")){e.preventDefault();if(!e.repeat&&performance.now()>=memLock&&(e.code==="Space"||e.code==="Enter"))$("mem-go").click()}}
// Cada vida que chega ao fundo deixa UMA cenoura da horta (superfície, 13-paisagem.js) dourada; com a horta toda dourada sai a conquista. gcAt guarda a vida (S.runs) já contada.
function gainGoldenCarrot(){
 if(S.runMax<FINAL_DEPTH&&S.depth<FINAL_DEPTH)return false;
 if(S.gcAt===S.runs)return false;
 S.gcAt=S.runs;
 if(S.gc<GARDEN_SLOTS){S.gc++;sayGold(__("Cenoura dourada na horta: {0}/{1}",S.gc,GARDEN_SLOTS))}
 return true}
function tocarCenoura(){
 gainGoldenCarrot();
 flash=1.2;flashC="#ffd45c";flashText="";shake=Math.max(shake,6);
 [392,523,659,784,1047].forEach((f,i)=>setTimeout(()=>sfx(f,.5,"sine"),i*160));
 closeModal();openBottom()}

// ===== 2-sistemas/16-caldeirao.js — Caldeirão da igreja: cozinhar Sopa de cogumelo, Poção de energia e Poção de teleporte =====
// Espaço (ou clique) perto do caldeirão abre a janela, no mesmo formato da fogueira (cena no alto, lista de receitas, estoque e botões).
// Receitas (POT_RECIPES; números em BAL.forage): Sopa = soupCost cogumelos · Poção de energia = energyPot.cog cogumelos + energyPot.cen cenourinhas · Poção de teleporte = tpPot.cog cogumelos + 1 minério fundo da mochila
// (qualquer minério de ORES[tpPot.minOre] em diante, Safira ou melhor; sai da mochila e do valor dela, então se gasta em vez de vender). Cogumelos e cenourinhas vêm do bosque (5-desenho/19-cogumelos-cenouras.js).
// Desenho do mundo e da cena da janela: 5-desenho/20-caldeirao.js (a cor das bolhas e do líquido muda com a receita marcada). Nada é perdido se fechar a janela: cada item é feito na hora.
const POT_RECIPES=[
 {id:"sop",col:["#d9b25a","#b78d3a"],need:()=>({cog:BAL.forage.soupCost})},
 {id:"poc",col:["#6ff0ff","#2fb8d8"],need:()=>({cog:BAL.forage.energyPot.cog,cen:BAL.forage.energyPot.cen})},
 {id:"ptp",col:["#c9a0ff","#8a52e8"],need:()=>({cog:BAL.forage.tpPot.cog,ore:1})}];
const nearCauldron=()=>onGround()&&Math.abs(S.mc-CAULDRON_C)<=2;
let pot=null,potRaf=0,potCv=null,potG=null;
const deepNames=()=>ORES.slice(BAL.forage.tpPot.minOre).map(o=>o[0]);
const deepOres=()=>deepNames().reduce((a,k)=>a+(S.bag.o[k]||0),0);
function takeOre(){   // tira 1 minério fundo da mochila (o mais barato primeiro) e o valor dele
 for(const k of deepNames()){const n=S.bag.o[k]||0;if(n<=0)continue;
  const per=(S.bag.ov[k]||0)/n;S.bag.o[k]=n-1;S.bag.ov[k]=Math.max(0,(S.bag.ov[k]||0)-per);S.bag.v=Math.max(0,S.bag.v-per);S.bag.n=Math.max(0,S.bag.n-1);
  if(S.bag.o[k]<=0){delete S.bag.o[k];delete S.bag.ov[k]}return true}
 return false}
const potHave=k=>k==="ore"?deepOres():have(k);
function potMax(r){r=r||POT_RECIPES[pot?pot.sel:0];const nd=r.need();let m=99-have(r.id);for(const k in nd)m=Math.min(m,Math.floor(potHave(k)/nd[k]));return Math.max(0,m)}
function needTxt(r){const nd=r.need();return Object.keys(nd).map(k=>nd[k]+"x "+(k==="ore"?__("Minério fundo"):ITEMS[k].n)).join(" + ")}
function cauldronHit(px,py){
 const y=rowY(0),u=potPos().u;if(!atSurface()||py<y-(POT_H+3)*u||py>y+T*.4)return false;
 return Math.abs(camX+(px-W/2)/T-CAULDRON_C)<=1.2}
function cauldronUse(){
 if(!nearCauldron())return false;
 if(modal)return true;
 openPot();return true}
function openPot(){
 const b=openModal("pot");b.style.maxWidth="500px";
 b.innerHTML="<div class='casino campbox potbox'><canvas id='ptcv'></canvas><div id='ptui'></div></div>";
 potCv=$("ptcv");const dpr=Math.min(2,window.devicePixelRatio||1);potCv.width=CPC.w*dpr;potCv.height=CPC.h*dpr;
 potCv.style.cssText="width:100%;max-width:"+CPC.w+"px;aspect-ratio:"+CPC.w+"/"+CPC.h+";display:block;margin:0 auto 8px;border-radius:10px";
 potG=potCv.getContext("2d");
 potCv.onpointerdown=()=>potCook(false);   // tocar/clicar no caldeirão cozinha 1 da receita marcada (celular)
 pot={msg:"",age:0,res:null,sel:0};potPaint();
 cancelAnimationFrame(potRaf);potFrame.last=0;potRaf=requestAnimationFrame(potFrame)}
function potPaint(){
 const ui=$("ptui");if(!ui||!pot||modal!=="pot")return;
 const r0=POT_RECIPES[pot.sel],mx=potMax(r0),ore=ORES[BAL.forage.tpPot.minOre],nd0=r0.need();
 const cell=(k,c,nm,sm,n)=>"<div class='fd"+(n?"":" no")+(nd0[k]||k===r0.id?" use":"")+"' style='--fc:"+c+"'><span class='fn'>"+nm+"</span><small>"+sm+"</small><b>x"+n+"</b></div>";
 const chips=r=>{const nd=r.need();return Object.keys(nd).map(k=>"<em class='"+(potHave(k)>=nd[k]?"ok":"no")+"'>"+nd[k]+"x "+(k==="ore"?__("Minério fundo"):ITEMS[k].n)+"</em>").join("<u>+</u>")};
 ui.innerHTML="<div class='fshint"+(pot.msg?" msg":"")+"'><span>"+(pot.msg||__("Escolha uma receita · ↑ ↓ trocam · Espaço cozinha"))+"</span></div>"
  +"<div class='fklist'>"+POT_RECIPES.map((r,i)=>"<button data-i='"+i+"' class='"+(i===pot.sel?"sel":"")+(potMax(r)<1?" no":"")+"' style='--tc:"+ITEMS[r.id].c+"'><span class='rn'>"+ITEMS[r.id].n+"</span><span class='rq'>"+chips(r)+"</span><span class='v'>x"+have(r.id)+"</span></button>").join("")+"</div>"
  +"<div class='cpfoods'><div class='cpft'><span>"+__("Ingredientes")+"</span></div><div class='cpfg'>"
  +cell("cog",ITEMS.cog.c,ITEMS.cog.n,__("Do bosque"),have("cog"))
  +cell("cen",ITEMS.cen.c,ITEMS.cen.n,__("+{0}% de energia",Math.round(ITEMS.cen.en*100)),have("cen"))
  +cell("ore",ore[2],__("Minério fundo"),__("a partir de {0}",__(ore[0])),deepOres())
  +"</div><div class='cpft'><span>"+__("Comidas e poções")+"</span></div><div class='cpfg'>"
  +cell("sop",ITEMS.sop.c,ITEMS.sop.n,__("+{0}% de energia",Math.round(ITEMS.sop.en*100)),have("sop"))
  +cell("poc",ITEMS.poc.c,ITEMS.poc.n,__("+{0}% de energia",Math.round(ITEMS.poc.en*100)),have("poc"))
  +cell("ptp",ITEMS.ptp.c,ITEMS.ptp.n,__("Teleporte"),have("ptp"))
  +"</div></div>"
  +"<div class='fsbtns'>"+(mx>1?"<button id='potall' class='go'>"+__("Cozinhar tudo ({0})",mx)+"</button>":"")+"<button id='potclose'>"+__("Fechar · Esc")+"</button></div>";
 ui.querySelectorAll("button[data-i]").forEach(b=>b.onclick=()=>{pot.sel=+b.dataset.i;pot.msg="";potCook(false)});
 if($("potall"))$("potall").onclick=()=>potCook(true);$("potclose").onclick=closeModal}
function potCook(all){
 if(modal!=="pot"||!pot)return;
 const r=POT_RECIPES[pot.sel],n=all?potMax(r):Math.min(1,potMax(r));
 if(n<1){sfx(160,.12,"sawtooth");pot.msg=have(r.id)>=99?__("Você já tem itens demais."):__("Faltam ingredientes.");potPaint();return}
 const nd=r.need();
 for(const k in nd){if(k==="ore"){for(let i=0;i<n*nd.ore;i++)takeOre()}else S.items[k]=have(k)-n*nd[k]}
 S.items[r.id]=have(r.id)+n;S.cookN++;
 gainXp(xpNeed(S.lvl)*.01*n*(r.id==="sop"?1:2));
 pot.msg=__("Você ganhou: {0}",ITEMS[r.id].n+(n>1?" x"+n:""));pot.res={t:0,n,id:r.id};
 [392,523,659,784].forEach((f,i)=>setTimeout(()=>sfx(f,.1,"triangle"),i*80));
 save();refresh();potPaint()}
function potFrame(now){
 if(modal!=="pot"||!pot||!potCv){potRaf=0;return}
 const dt=Math.min(.05,(now-(potFrame.last||now))/1000);potFrame.last=now;
 pot.age+=dt;if(pot.res)pot.res.t+=dt;
 potDraw(potG,dt);potRaf=requestAnimationFrame(potFrame)}
function potKey(e){
 if(e.code==="Escape"){e.preventDefault();closeModal();return}
 const N=POT_RECIPES.length,sel=i=>{e.preventDefault();pot.sel=(i+N)%N;pot.msg="";potPaint()};
 if(e.code==="ArrowUp"||e.code==="KeyW"){sel(pot.sel-1);return}
 if(e.code==="ArrowDown"||e.code==="KeyS"){sel(pot.sel+1);return}
 if(e.code==="Digit1"||e.code==="Digit2"||e.code==="Digit3"){sel(+e.code.slice(5)-1);return}
 if(e.code==="Space"||e.code==="Enter"){e.preventDefault();if(!e.repeat)potCook(false)}}

// ===== 2-sistemas/17-sino.js — Sino da igreja: clique ou Espaço perto da torre para tocar =====
// O sino (desenho e balanço em 5-desenho/18-igreja.js) é um pêndulo amortecido: cada toque dá um empurrão e alterna "DING" / "DONG". O som soma parciais de sino (razões inarmônicas).
const bell={a:0,v:0,cd:0,flip:1};
const bellCol=()=>CHURCH_C+(31.5-CHURCH_W/2)*pu()/T;   // coluna da torre sineira (x do sino no sprite da igreja)
const nearBell=()=>onGround()&&Math.abs(S.mc-bellCol())<=3.2;
function bellHit(px,py){
 if(!atSurface())return false;
 const P=bellPos();return Math.abs(px-P.x)<=9*P.u&&Math.abs(py-P.y)<=10*P.u}
function bellTick(dt){
 bell.cd=Math.max(0,bell.cd-dt);
 bell.v+=(-38*bell.a-.9*bell.v)*dt;bell.a=clamp(bell.a+bell.v*dt,-.34,.34);
 if(Math.abs(bell.a)<.0008&&Math.abs(bell.v)<.01){bell.a=0;bell.v=0}}
function bellSound(low){
 const b=low?262:330;
 [[.5,2.4,"sine"],[1,1.9,"sine"],[2,1.5,"sine"],[2.76,1.1,"sine"],[4.07,.7,"sine"],[5.4,.45,"triangle"]].forEach(([m,d,ty])=>sfx(b*m,d,ty))}
function bellUse(){
 if(!nearBell())return false;
 if(modal)return true;
 if(bell.cd>0)return true;
 bell.cd=.45;bell.flip*=-1;bell.v+=bell.flip*2.1;
 bellSound(bell.flip<0);
 const P=bellPos();texts.push({x:P.x,y:P.oy+24*P.u,t:0,s:bell.flip>0?"DING!":"DONG!",c:"#ffd45c",big:1});
 return true}

// ===== 3-mundo/00-camera.js — Canvas, câmera, zoom limitado ao mundo e conversão de coordenadas =====
const cv=$("cv");let ctx=cv.getContext("2d");   // let: 5-desenho/00b-cache.js troca o ctx por um instante para pré-renderizar camadas
let W=0,H=0,T=44,dpr=1,worldZoom=1,zoomPreference=1;
const SURF=.3;                                   // fração da altura onde fica a superfície
const baseTile=()=>W<500?36:44;
const zoomMin=()=>W/(COLS+2)/baseTile();          // zoom normal mínimo: o mundo da mina cabe na tela
const zoomMax=()=>Math.max(2.2,zoomMin()*1.8);
function surfaceZoomTarget(){
 if(fs)return Math.max(zoomPreference,Math.min(3.2,W/(baseTile()*9),H/(baseTile()*7)));   // pescando: zoom in na água (suave, como o resto)
 if(S.depth>0)return zoomPreference;
 return zoomPreference;                                  // na superfície (qualquer lado): sem zoom out, o zoom fica como o jogador escolheu
}
function applyZoom(dt=0){const target=surfaceZoomTarget();if(dt>0)worldZoom+=(target-worldZoom)*(1-Math.exp(-4*dt));else worldZoom=target;T=baseTile()*worldZoom}
function setZoom(z){zoomPreference=clamp(z,zoomMin(),zoomMax());applyZoom(0)}
function updateZoom(dt){applyZoom(dt)}
function resize(){dpr=Math.min(2,window.devicePixelRatio||1);const r=cv.getBoundingClientRect();W=Math.max(200,r.width);H=Math.max(200,r.height);cv.width=W*dpr;cv.height=H*dpr;setZoom(zoomPreference)}
new ResizeObserver(resize).observe(cv);
resize();
const rowY=r=>H*SURF+(r-camY)*T;
const colX=c=>W/2+(c-camX)*T;                    // centro da coluna na tela
const blockXY=(c,r)=>({x:colX(c),y:rowY(r)});
const chestXY=()=>({x:colX(CHEST_C),y:rowY(0)});
// Limites do centro da câmera: o mundo (HALF) no subsolo e, SÓ na superfície (profundidade 0), o cenário todo (SURF_L..SURF_R mais PAD_L/PAD_R).
// Os limites vão de um para o outro devagar (camLo/camHi), cada um em direção ao seu alvo: nunca se cruzam nem puxam a câmera para o lado, então descer ou subir não faz a tela balançar.
let camLo=0,camHi=0,camInit=false;
function camTarget(vis,up){const lo=up?SURF_L-.5-PAD_L:-(HALF+.5),hi=up?SURF_R+.5+PAD_R:HALF+.5;return hi-lo<=vis?[(lo+hi)/2,(lo+hi)/2]:[lo+vis/2,hi-vis/2]}
function clampCam(){
 const[tl,th]=camTarget(W/T,S.depth<=0);
 if(!camInit){camLo=tl;camHi=th;camInit=true}
 camLo+=(tl-camLo)*.08;camHi+=(th-camHi)*.08;
 if(Math.abs(tl-camLo)<.01)camLo=tl;if(Math.abs(th-camHi)<.01)camHi=th;
 camX=clamp(camX,camLo,camHi);
}

// ===== 3-mundo/01-celulas.js — Células escavadas, limites do mundo, linha inquebrável e alvo do golpe =====
const inW=c=>c>=-HALF&&c<=HALF;
// A linha 0 (primeira da Terra) é inquebrável, exceto o buraco da coluna 0 onde o jogador desce.
const isDug=(c,r)=>r<0?inS(c):(r===0&&c===0)||dug.has(c+","+r);
// Veios de pedra dura: trechos curtos (3 ou 5 blocos, em linha reta ou diagonal) que a picareta NÃO quebra; só a dinamite.
// São calculados pela posição (não entram no save). O mundo é dividido em regiões de VEIN_REG x VEIN_REG e cada região pode ter um veio.
const VEIN_MIN=10,VEIN_REG=7,VEIN_CHANCE=.6;
function isVein(c,r){
 if(r<VEIN_MIN||r>=FINAL_DEPTH||!inW(c))return false;
 const bx=Math.floor(c/VEIN_REG),by=Math.floor(r/VEIN_REG);
 if(hash(bx*7+3,by*11+5)>=VEIN_CHANCE)return false;
 const cx=bx*VEIN_REG+1+Math.floor(hash(bx+17,by+3)*(VEIN_REG-2)),cy=by*VEIN_REG+1+Math.floor(hash(bx+29,by+13)*(VEIN_REG-2));
 const dir=[[1,0],[0,1],[1,1],[1,-1]][Math.floor(hash(bx+41,by+23)*4)],half=1+Math.floor(hash(bx+53,by+31)*2);
 for(let k=-half;k<=half;k++)if(c===cx+k*dir[0]&&r===cy+k*dir[1])return true;
 return false;
}
// Veios de minério: manchas raras de 5 a 9 blocos do mesmo minério (o minério combina com a profundidade). Cada bloco rende vários minérios (BAL.oreVein.units).
// Também calculados pela posição. Regiões de RV_W x RV_H; cada uma pode ter uma mancha. Quebram com a picareta normal (não são pedra dura).
const RV_W=7,RV_H=12;
function oreVeinAt(c,r){   // índice em ORES do veio que contém o bloco, ou -1
 if(r<BAL.oreVein.min||r>=FINAL_DEPTH||!inW(c))return-1;
 const bx=Math.floor(c/RV_W),by=Math.floor(r/RV_H);
 if(hash(bx*13+211,by*17+307)>=BAL.oreVein.chance)return-1;
 const cx=bx*RV_W+1+Math.floor(hash(bx+61,by+71)*(RV_W-2)),cy=by*RV_H+1+Math.floor(hash(bx+83,by+97)*(RV_H-2)),dx=c-cx,dy=r-cy;
 if(Math.abs(dx)>1||Math.abs(dy)>1)return-1;                                           // mancha de até 3x3
 if(dx&&dy&&hash(bx*5+dx*3+401,by*5+dy*3+503)<.5)return-1;                            // cantos: só metade deles
 if(isVein(c,r))return-1;                                                              // pedra dura tem prioridade
 const n=ORES.filter(o=>o[3]<=cy).length;
 return Math.max(0,n-1-Math.floor(hash(bx+127,by+131)*Math.min(3,n)));                // um dos 3 melhores minérios para essa profundidade
}
// Baús raros: cada bloco tem uma chance pequena e independente (BAL.chest.p), sem grade: ficam espalhados ao acaso e podem até aparecer perto uns dos outros.
// Calculado pela posição e pela semente do mundo (muda a cada jogo novo e a cada Renascer), não entra no save. Nunca em veio, pedra dura ou lava.
// Devolve 0 (sem baú) ou raridade+1 (índice em BAL.chest.tiers, sorteado pelo peso `w` e fixo para aquela posição: cada raridade tem o seu visual).
function chestAt(c,r){
 if(r<BAL.chest.min||r>=FINAL_DEPTH||!inW(c)||hash(c*31+401,r*17+613)>=BAL.chest.p)return 0;
 if(isVein(c,r)||oreVeinAt(c,r)>=0||lava(c,r))return 0;
 return chestTierPick(hash(c*53+7,r*29+3))+1;
}
function chestTierPick(u){const T=BAL.chest.tiers;let x=u*T.reduce((a,t)=>a+t.w,0),ti=0;for(;ti<T.length-1;ti++){x-=T[ti].w;if(x<0)break}return ti}
const inBounds=(c,r)=>inW(c)&&r>=1&&r<FINAL_DEPTH&&!dug.has(c+","+r);
const canBreak=(c,r)=>inBounds(c,r)&&!isVein(c,r);   // picareta: tudo, menos os veios de pedra dura
const canBlast=(c,r)=>inBounds(c,r);                 // dinamite: inclui os veios
const lava=(c,r)=>r>=BAL.lava.from&&hash(r,c)>1-(BAL.lava.p0+BAL.lava.pL*layerOf(r));   // mais comum quanto mais fundo
// O jogador fica em (mc, depth): os pés estão no topo da linha "depth"; o corpo ocupa a linha depth-1.
function tgt(){const p=S.depth,c=S.mc;switch(S.dir){
 case"left":return[c-1,p-1];case"right":return[c+1,p-1];case"up":return[c,p-2];
 default:return[c,p]}}
// No ar: abaixo da superfície, com a célula sob os pés já cavada (sem chão). Nesse caso a mochila a jato fica ligada, com chama.
const SKY_CEIL=8;   // teto invisível: a mochila a jato sobe no máximo este tanto de blocos acima do chão da superfície (acima do telhado da casa e da chaminé)
// Telhado da casa da ferraria: sólido nas linhas -2 e -3 (do beiral à cumeeira) nas colunas da casa. Dentro dela sobe-se só até -1 (a viga) e de lado não se entra pelo telhado,
// mas a partir de -4 (acima da chaminé) passa-se por cima dele livremente.
const HOUSE_L=-10,HOUSE_R=-1;
const houseSolid=(c,d)=>c>=HOUSE_L&&c<=HOUSE_R&&d>=-3&&d<=-2;
// Telhado da igreja (mesmo esquema da casa): nave e transepto sólidos nas linhas -2 e -3; a torre sineira, nas linhas -2 a -6. Por dentro sobe-se só até -1 (abaixo das vigas) e acima do telhado passa-se livremente.
// O sprite da igreja escala com o pixel (pu), então as colunas cobertas saem da razão pu/T (36 ou 44 de baseTile): CHURCH_SEGS = [x0, x1 no sprite, linha de cima, linha de baixo].
const CHURCH_SEGS=[[16,45,2,6],[43,148,2,3]];
const churchRatio=()=>{const b=baseTile();return Math.round(b/12)/b};
function churchSolid(c,d){
 if(d>-2||d<-6)return false;
 const r=churchRatio(),x0=CHURCH_W/2+(c-CHURCH_C-.5)/r,x1=x0+1/r,k=-d;
 for(const[a,b,k0,k1]of CHURCH_SEGS)if(k>=k0&&k<=k1&&Math.min(x1,b)-Math.max(x0,a)>=.35/r)return true;
 return false}
const roofSolid=(c,d)=>houseSolid(c,d)||churchSolid(c,d);
const houseBlocks=(dir)=>{if(roofSolid(S.mc,S.depth))return false;   // se já estiver preso nele, deixa sair
 const c=dir==="left"?S.mc-1:dir==="right"?S.mc+1:S.mc,d=dir==="up"?S.depth-1:dir==="down"?S.depth+1:S.depth;return roofSolid(c,d)}
const airborne=()=>S.depth<0||(S.depth>0&&S.depth<FINAL_DEPTH&&isDug(S.mc,S.depth));
const DIR_UP=["up"];
function setDir(d){if(!["up","down","left","right"].includes(d))return;   // só as 4 direções: não existe mais golpe nem movimento na diagonal
 if(DIR_UP.includes(d)&&S.depth<=-SKY_CEIL)return;if(d==="down"){jetT=0;parts=parts.filter(p=>!p.jet)} // ao começar a descer, apaga a chama e as partículas imediatamente
 if(S.dir!==d){S.dir=d;S.prog=0}}

// ===== 3-mundo/02-coleta.js — Quebrar um bloco: sorteia minério, coloca na mochila e abre a célula =====
// O combo é só visual: não altera o ouro. Veio de pedra dura (só dinamite): vale VEIN_GOLD x um bloco comum e nunca tem minério.
// Veio de minério: sempre rende o minério do veio, BAL.oreVein.units vezes (vale ouro e entra na mochila na mesma quantidade).
const VEIN_GOLD=6;
function collect(c,r){
 const vein=isVein(c,r),rk=vein?-1:oreVeinAt(c,r),rich=rk>=0,ore=rich?ORES[rk]:vein?null:rollOre(r);
 let n=rich?BAL.oreVein.units:1,fort=0;
 if(ore&&S.lv.fort>0&&Math.random()<fortCh()){fort=1+Math.floor(Math.random()*Math.ceil(S.lv.fort/2));n+=fort}   // Melhoria de minérios: unidades extras (vale ouro, mochila e XP)
 let v=blockGold(r)*(ore?ore[1]*n:vein?VEIN_GOLD:1);
 S.bag.v+=v;S.bag.n+=n;S.blocks++;if(vein)S.veins++;if(rich)S.rich++;
 const key=ore?ore[0]:vein?"Pedra dura":"Pedra";S.bag.o[key]=(S.bag.o[key]||0)+n;S.bag.ov[key]=(S.bag.ov[key]||0)+v;
 if(ore){S.oc+=n;if(!S.od.includes(ore[0])){S.od.push(ore[0]);sayMine(__("Novo minério: {0}",__(ore[0])))}}
 dug.add(c+","+r);
 const chk=chestAt(c,r);if(chk)chestFound(r,chk-1);   // baú: o prêmio é sorteado e pago agora; a animação de abertura roda assim que não houver outra janela aberta
 ctProg("blk",null,1,r);if(ore)ctProg("ore",ore[0],n,r);
 return{v,ore,rich,n,fort};
}

// ===== 3-mundo/03-mineracao.js — Movimento, golpes, combo e escavação automática =====
// Chegada à Rocha-mãe: tremor, clarão dourado com o título e uma fanfarra (só na primeira vez de cada vida em que se chega ao fundo); depois a cena da cenoura dourada (2-sistemas/15-fundo.js)
function reachBottom(){
 shake=Math.max(shake,10);flash=1.8;flashC="#ffd45c";flashText=__("VOCÊ CHEGOU AO FUNDO");
 [523,659,784,1047,1319,1568].forEach((f,i)=>setTimeout(()=>{sfx(f,.35,"triangle");sfx(f/2,.4,"sine")},i*140));
 setTimeout(()=>{sfx(1047,.9,"sine");sfx(1319,.9,"sine");sfx(1568,.9,"sine");sfx(110,.6,"sawtooth")},900);
 carrotSpot();setTimeout(openMemoria,2800);   // cena da cenoura dourada (tocar nela) e só depois a escolha de openBottom
}
// Janela depois da cena: resumo da jornada e a escolha entre Renascer agora ou continuar no fundo
function openBottom(){
 if(modal||S.depth<FINAL_DEPTH){setTimeout(openBottom,800);return}
 const b=openModal("bottom");b.style.maxWidth="420px";
 const g=prestGain(),tm=Math.floor(S.play),hh=Math.floor(tm/3600),mm=Math.floor(tm%3600/60),
  row=(l,v)=>"<div class='st'><b>"+v+"</b><small>"+l+"</small></div>";
 b.innerHTML="<div class='dead'><h2>"+__("VOCÊ CHEGOU AO FUNDO")+"</h2><div class='sub'>"+__("Sua jornada até aqui")+"</div>"
  +"<div class='grid'>"+row(__("TEMPO DE JOGO"),hh>0?__("{0} h {1} min",hh,mm):__("{0} min",mm))+row(__("BLOCOS QUEBRADOS"),fmt(S.blocks))+row(__("MINÉRIOS COLETADOS"),fmt(S.oc))+row(__("RENASCIMENTOS"),S.runs)+"</div>"
  +"<div class='tip'>"+__("Renascer troca esta vida por <b>{0}</b> fragmentos (poderes permanentes). Ou continue cavando e renasça depois, na aba Poder.",g)+"</div>"
  +"<button id='bt-re'>"+__("Renascer agora")+"</button><button id='bt-no' style='margin-top:8px'>"+__("Continuar cavando")+"</button></div>";
 $("bt-no").onclick=closeModal;
 $("bt-re").onclick=()=>{closeModal();doRebirth()};
 $("bt-no").focus();
}
function move(d){if(modal||fs)return;if(d==="up"&&S.depth<=-SKY_CEIL)return;setDir(d);if(houseBlocks(d))return;   // telhado da casa: sólido; só se passa por cima dele
 const[a,b]=tgt();if(isDug(a,b)){S.prog=0;step(d==="down")}}   // descer por buraco já cavado é de graça
function step(free){
 const[tc]=tgt();
 if(S.dir==="left"||S.dir==="right")S.mc=tc;
 else if(S.dir==="up")S.depth--;
 else S.depth++;
 S.depth=clamp(S.depth,-SKY_CEIL,FINAL_DEPTH);
 if(S.depth>S.runMax)S.runMax=S.depth;
 if(S.depth>S.best){S.best=S.depth;if(S.best%50===0){sayMine(__("Novo recorde: {0} m",S.best));gainXp(25);sfx(1200,.3,"sine")}}
 const L=layerOf(S.depth);
 if(L>layerSeen){layerSeen=L;cmbBanner=1;cmbBannerT=L>=BIO.length-1?__("CORAÇÃO DO ABISMO"):__("CAMADA: {0}",__(BIO[L][0]).toUpperCase());sfx(330,.4,"triangle");sfx(494,.5,"triangle");
  if(S.depth>=FINAL_DEPTH){sayMine(__("A Rocha-mãe é inquebrável: você chegou ao fundo!"));reachBottom()}}
 if(S.dir==="up"){jetT=JET_FLAME;sfx(140+Math.random()*30,.07,"sawtooth");if(S.depth>=0)spend(stepCost(Math.max(0,S.depth))*jetMult())}   // subir: mochila a jato, gasta o passo inteiro
 else if(S.depth>0&&!free)spend(stepCost(Math.max(0,S.depth-1))*.5);   // descer ou andar de lado: metade
}
// Marcos do combo: a cada um aparece uma faixa grande, tela pisca na cor do nível e toca uma fanfarra
const CMB_MS=[[10,N_("ÓTIMO!")],[25,N_("INCRÍVEL!")],[50,N_("IMPARÁVEL!")],[100,N_("LENDÁRIO!")],[200,N_("MÍTICO!")],[400,N_("DIVINO!")]];
function onCombo(){
 cmbPulse=1;if(cmb>cmbMax)cmbMax=cmb;
 const ms=CMB_MS.findIndex(m=>m[0]===cmb),col=comboColor(cmb),cp=comboXY(),cx=cp.x,cy=cp.y;
 comboSfx(cmb,ms);
 if(ms>=0){   // marco: faixa + explosão de faíscas + flash + tremor
  cmbBanner=1;cmbBannerT=__(CMB_MS[ms][1]);cmbTier=ms+1;
  for(let i=0;i<14+ms*3;i++){const a=Math.random()*6.283,v=90+Math.random()*190;parts.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,l:.7,c:i%3?col:"#ffffff"})}
  flash=Math.min(.2,.1+ms*.02);flashC=col;flashText="";
 }else if(cmb>=10&&cmb%5===0){   // a cada 5 golpes: chuvinha de faíscas
  for(let i=0;i<4;i++)parts.push({x:cx+(Math.random()-.5)*60,y:cy+(Math.random()-.5)*16,vx:(Math.random()-.5)*120,vy:-40-Math.random()*90,l:.5,c:i%2?col:"#fff3c0"});
 }
}
function comboEnd(){   // o tempo acabou: combos de 10 para cima mostram o total final e tocam um som descendente
 if(cmb>=10){cmbLast=cmb;cmbLastT=1.4;comboEndSfx()}
}
function breakPrimary(tc,tr,auto,crit){
 if(!auto){cmb=cmbT>0?cmb+1:1;cmbT=1.8;onCombo()}   // só o golpe manual conta para o combo
 const{v,ore,rich,n,fort}=collect(tc,tr),p=blockXY(tc,tr);
 gainXp(1+tr/25);if(ore)gainXp((4+ORES.indexOf(ore)*3)*n);
 breakSfx(tr,blockKind(tc,tr,ore),ore?ORES.indexOf(ore):0);   // som pelo tipo de bloco (terra, pedra, minério, lava)
 if(rich){sfx(1040+ORES.indexOf(ore)*90,.2,"triangle");sfx(1560+ORES.indexOf(ore)*90,.3,"sine")}
 texts.push({x:p.x+(Math.random()-.5)*30,y:p.y-T*.3,t:0,s:(ore?ore[0]+(n>1?" x"+n:"")+" +":"+")+fmt(v),c:ore?ore[2]:"#ffd45c",big:ore?1:0});
 for(let i=0;i<(rich?26:10);i++)parts.push({x:p.x,y:p.y+T/2,vx:(Math.random()-.5)*240,vy:-Math.random()*220,l:.7,c:ore?ore[2]:"#ffd45c"});
 for(let i=0;i<6;i++)parts.push({x:p.x+(Math.random()-.5)*T*.8,y:p.y+Math.random()*T,vx:(Math.random()-.5)*110,vy:-30-Math.random()*90,l:.6,c:blockColor(tr,tc,hash(tr,i)*8)});
 if(fort>0){texts.push({x:p.x,y:p.y-T*.95,t:0,s:__("Minério extra! +{0}",fort),c:"#7dffb0",big:1});sfx(1250,.1,"sine");setTimeout(()=>sfx(1670,.14,"sine"),70);for(let i=0;i<8;i++)parts.push({x:p.x,y:p.y+T/2,vx:(Math.random()-.5)*200,vy:-60-Math.random()*200,l:.6,c:i%2?"#7dffb0":"#ffffff"})}
 if(Math.random()<.02){const g=maxEn()*.06;S.en=Math.min(maxEn(),S.en+g);texts.push({x:p.x,y:p.y-T*.7,t:0,s:__("+Energia"),c:"#6ff0ff",big:1});sfx(1320,.15,"sine")}
 if(lava(tc,tr)){const l=lavaDmg(tr);texts.push({x:p.x,y:p.y-T*.9,t:0,s:__("Lava! -{0} de energia",Math.round(l)),c:"#ff5a1f",big:1});spend(l)}
 spend(digCost(tr)*(auto?AUTO_ENERGY:1));
}
function hit(dmg,crit,auto){
 const[a,b]=tgt();
 if(isDug(a,b))return;
 if(!canBreak(a,b)){S.prog=0;if(isVein(a,b)&&!auto){hitSfx("hard",b);{const m=__("Pedra dura: use dinamite");if(!toastHas(m))sayWarn(m)}}return}
 const d0=S.deaths;
 if(!auto||Math.random()<.04)swing=1;
 if(!auto)hitSfx(blockKind(a,b),b);
 S.prog+=dmg;
 const p=blockXY(a,b);
 if(!auto||Math.random()<.05)for(let i=0;i<4;i++)parts.push({x:p.x+(Math.random()-.5)*T*.6,y:p.y+T/2,vx:(Math.random()-.5)*120,vy:-Math.random()*140,l:.5,c:blockColor(b,a,hash(b,i)*8)});
 if(crit){texts.push({x:p.x+(Math.random()-.5)*40,y:p.y-T*.5,t:0,s:__("CRÍTICO! {0}",fmt(dmg)),c:"#ff7a3a",big:1});shake=Math.max(shake,BAL.shake.crit)}   // tremor de tela: só no crítico e nas dinamites grandes (BAL.shake)
 for(let g=0;g<40;g++){
  const[tc,tr]=tgt();if(!canBreak(tc,tr))break;
  const h=hardness(tr);if(S.prog<h)break;
  S.prog-=h;
  breakPrimary(tc,tr,auto,crit&&g===0);if(S.deaths!==d0)return;
  step();if(S.deaths!==d0)return;
  const[a2,b2]=tgt();if(isDug(a2,b2)||!canBreak(a2,b2)){S.prog=0;break}
 }
}
function clickDig(){if(modal)return;if(fs){fishAct();return}if(atSurface()){if(nearFurnace()){furUse();return}if(nearChest()){chestUse();return}if(nearBoard()){boardUse();return}if(nearSlot()){slotUse();return}if(nearCamp()){campUse();return}if(forageUse())return;if(nearCauldron()){cauldronUse();return}if(nearBell()){bellUse();return}if(fishSpot()){fishUse();return}if(nearKeeper()&&S.fb.length){marketUse();return}}const c=Math.random()<critCh();hit(clickPow()*(c?CRIT_MULT:1),c)}

// Ícones em pixel dos avisos (9x9): a = cor principal, b = brilho, c = detalhe escuro. Cada categoria tem sua cor: mina, pesca, ouro, clima, estrela, nível, habilidade, comida, alerta e geral.
const NOTE_ICONS={
 mine:{c:["#f0913a","#ffc27a","#9a5b2a"],r:["..aaaaa..",".aabbbaa.","aa..c..aa","a...c...a","....c....","....c....","....c....","....c....","....c...."]},
 fish:{c:["#4db6ff","#a6dcff","#2a6fb0"],r:[".........",".........","..aaaa...",".abbaaa.a","aadaaaaaa",".aaaaaa.a","..aaaa...",".........","........."]},
 gold:{c:["#f5c431","#fff0a0","#b8860b"],r:["..aaaaa..",".abbaaaa.","abaaacaaa","aaaaacaaa","aaaaacaaa","aaaaacaaa","aaaaacaaa",".aaaaaaa.","..aaaaa.."]},
 weather:{c:["#7cc8ff","#d6efff","#4a8fc4"],r:[".........",".........","...aaa...","..abbaa..",".abbaaaaa","aaaaaaaaa","aaaaaaaaa",".aaaaaaa.","........."]},
 star:{c:["#c7a0ff","#eadbff","#8a5fd0"],r:["....a....","....a....","...aaa...","aaaaaaaaa",".aaabaaa.","..aaaaa..","..aa.aa..",".aa...aa.",".a.....a."]},
 level:{c:["#6ee07a","#c4f5c9","#3a9a47"],r:["....a....","...aaa...","..aabaa..",".aabaaaa.","...aaa...","...aaa...","...aaa...","...aaa...","........."]},
 power:{c:["#c8e84a","#f1ffa8","#8aa51f"],r:["....aaa..","...aaa...","..aaa....",".aaaaaaa.","...aaa...","..aaa....",".aaa.....",".aa......",".a......."]},
 food:{c:["#f0893a","#ffc08a","#5fd35f"],r:["...c.c...","....c....","...aaa...","..abaaa..","..aaaaa..","...aaa...","...aaa...","....a....","....a...."]},
 warn:{c:["#ff6b6b","#ffb0b0","#b83a3a"],r:["...aaa...","...aaa...","...aaa...","...aaa...","...aaa...",".........","...aaa...","...aaa...","........."]},
 info:{c:["#cfd8ea","#ffffff","#8a96b0"],r:["....a....","...aba...","..aabaa..",".aaaaaaa.","aaaaaaaaa",".aaaaaaa.","..aaaaa..","...aaa...","....a...."]}
};
const noteIconCache={};
function noteIcon(kind){
 if(noteIconCache[kind])return noteIconCache[kind];
 const d=NOTE_ICONS[kind]||NOTE_ICONS.info,cv=document.createElement("canvas");cv.width=9;cv.height=9;
 const g=cv.getContext("2d");
 d.r.forEach((row,y)=>{for(let x=0;x<9;x++){const ch=row[x];if(ch==="."||ch===undefined)continue;g.fillStyle=d.c[ch==="b"?1:ch==="a"?0:2];g.fillRect(x,y,1,1)}});
 return noteIconCache[kind]="url("+cv.toDataURL()+")";
}
// Texto do aviso do canto superior direito: ícone colorido + texto, tentando caber em UMA linha. Se faltar pouco espaço, a letra diminui até 25%; se o texto for bem longo, quebra linha normalmente.
let layerKey="",layerBase=0;
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{layerKey=""});   // a fonte pixelada é mais larga que a reserva: mede de novo quando carregar
function setLayerText(txt,kind){
 const l=$("layer"),pw=l.parentElement.clientWidth,key=kind+"|"+txt+"|"+pw;
 if(key===layerKey)return;layerKey=key;
 l.textContent="";const ic=document.createElement("i");ic.className="ic";ic.style.backgroundImage=noteIcon(kind);l.appendChild(ic);l.appendChild(document.createTextNode(txt));
 l.style.fontSize="";l.style.whiteSpace="nowrap";
 if(!layerBase)layerBase=parseFloat(getComputedStyle(l).fontSize)||12;
 const cs=getComputedStyle(l),padX=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),bdX=parseFloat(cs.borderLeftWidth)+parseFloat(cs.borderRightWidth);
 const maxW=pw-(matchMedia("(max-width:760px)").matches?96:104),nat=l.scrollWidth;   // nat = largura natural em uma linha (ícone + texto + padding); o ícone usa em, então encolhe junto com a letra
 if(nat+bdX>maxW){const r=(maxW-padX-bdX)/(nat-padX);if(r>=.75)l.style.fontSize=(layerBase*r*.95).toFixed(2)+"px";else l.style.whiteSpace="";}
}
// ===== 4-interface/01-painel.js — Construção do painel (build) e atualização da interface (refresh), Renascer e apagar progresso =====
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const upBtn=(id,fn)=>{const b=mk("button","up",'<span class="n"></span><span class="d"></span><span class="c"></span><span class="k"></span><span class="lv"><b class="lt"></b><span class="pips"></span></span>');b.id=id;b.onclick=fn;return b};
const SGROUPS=[N_("Dinamites")];   // categorias da aba Loja
const GROUPS=[N_("Picareta"),N_("Energia"),N_("Escavação automática"),N_("Sorte e experiência"),N_("Habilidades"),N_("Utilidades"),N_("Fornalha"),N_("Pesca")];
function build(){
 const keepScroll=[...document.querySelectorAll(".pane")].map(p=>[p,p.scrollTop]);   // recriar a lista não pode jogar o scroll de volta para o topo ao comprar
 $("qty").innerHTML="";
 [[1,"x1"],[10,"x10"],[100,"x100"],[0,__("Máx")]].forEach(([v,t])=>{const b=mk("button",qty===v?"on":"",t);b.onclick=()=>{qty=v;build()};$("qty").appendChild(b)});
 const box=$("ups");box.innerHTML="";
 {const nx=mk("div","ph");nx.id="nextul";box.appendChild(nx)}   // dica: o que se libera a seguir (liberação gradual)
 for(const g of GROUPS){
  {const h=mk("h2",null,__(g));h.dataset.g=g;box.appendChild(h)}
  if(g==="Fornalha"){const m=mk("div","ph");m.id="furmsg";m.dataset.g=g;box.appendChild(m)}
  if(g==="Picareta"){const t=upBtn("u-tier",buyTier);t.classList.add("tier");box.appendChild(t)}
  for(const k in UPS)if(UPS[k].g===g){const ub=upBtn("u-"+k,()=>buy(k));box.appendChild(ub)}
 }
 const sh=$("shop");sh.innerHTML="";
 $("shopqty").innerHTML="";
 [[1,"x1"],[10,"x10"],[0,__("Máx")]].forEach(([v,t])=>{const b=mk("button",qty===v?"on":"",t);b.onclick=()=>{qty=v;build()};$("shopqty").appendChild(b)});
 for(const g of SGROUPS){
  {const h=mk("h2",null,__(g));h.dataset.g=g;sh.appendChild(h)}
  for(const k in ITEMS)if(!ITEMS[k].noShop&&ITEMS[k].g===g)sh.appendChild(upBtn("i-"+k,()=>buyItem(k)));
 }
 const sk=$("sks");sk.innerHTML="";
 for(const k in SK)sk.appendChild(upBtn("s-"+k,()=>{const l=S.sk[k];if(S.runs>0&&l<SK[k][2]&&S.pts>=l+1){S.pts-=l+1;S.sk[k]++;sfx(700,.12,"triangle");refresh()}}));
 refresh();
 for(const[p,y]of keepScroll)p.scrollTop=y;
}
// Cor discreta por progresso da melhoria (igual para todas): 0 = sem cor · 1..4 = faixas de 25% · 5 = máximo
const lvTier=(l,mx)=>l<=0?0:l>=mx?5:1+Math.min(3,Math.floor(l/mx*4));
// Realce de "dá para comprar": número xN balançando ao lado do custo; a cor/intensidade sobe com a quantidade (1 · 2 a 9 · 10 ou mais)
// Escreve no DOM só quando o valor muda (refresh() roda a cada ~150 ms e reescrevia ~100 textos iguais, invalidando o layout e forçando reflow no offsetHeight)
const txSet=(e,v)=>{if(e.textContent!==v)e.textContent=v};
function afford(b,cnt){const a=cnt>0?(cnt>=10?3:cnt>=2?2:1):0,k=b._k||(b._k=b.querySelector(".k"));
 if(k){const t=a?"x"+fmt(cnt):"";if(k.textContent!==t)k.textContent=t}
 b.classList.toggle("can",a>0);if(a){if(b.dataset.a!==String(a))b.dataset.a=a}else if(b.dataset.a)delete b.dataset.a;
 const tt=a?__("Você consegue comprar {0}x com o ouro que tem",fmt(cnt)):"";if(b.title!==tt)b.title=tt}
// Linha de nível da melhoria: selo "Nv 3/10" (ou "MÁX") + uma barrinha por nível (barra contínua que enche conforme o nível). A cor vem do tier do botão (data-t).
function setLv(b,l,mx){
 const lv=b._lv||(b._lv=b.querySelector(".lv")),key=l+"/"+mx;b.classList.add("hl");
 if(lv.dataset.k===key)return;lv.dataset.k=key;const p=lv.querySelector(".pips");
 lv.querySelector(".lt").textContent=l>=mx?__("MÁX"):__("Nv {0}/{1}",l,mx);
 p.classList.add("bar");p.style.setProperty("--p",(mx>0?Math.min(1,l/mx)*100:0)+"%");
}
function setTxt(id,n,d,c,dis,tier,cnt,lvl){const b=$(id);if(!b)return;if(lvl)setLv(b,lvl[0],lvl[1]);if(tier!=null&&b.dataset.t!==String(tier))b.dataset.t=tier;if(cnt!==undefined)afford(b,cnt);
 const q=b._q||(b._q=[b.querySelector(".n"),b.querySelector(".d"),b.querySelector(".c")]);txSet(q[0],n);txSet(q[1],d);txSet(q[2],c);if(b.disabled!==!!dis)b.disabled=!!dis}
function refresh(){
 const surf=atSurface(),shop=nearBench(),mE=maxEn();
 txSet($("gold"),fmt(S.gold));
 txSet($("depth"),fmt(Math.max(0,S.depth))+" m");txSet($("best"),fmt(S.best));{const tt=__("Recorde: {0} m",fmt(S.best)),db=$("depthbox");if(db.title!==tt)db.title=tt}
 const er=clamp(S.en/mE,0,1);$("enfill").style.width=(er*100)+"%";txSet($("ent"),Math.ceil(S.en)+" / "+mE);$("enbox").classList.toggle("low",er<.25);
 // medidor de retorno (melhoria da mesa): só efeitos na barra de energia (zonas, marca e brilho), sem textos nem números novos
 const rs=returnState(),rc=returnCost(),own=S.lv.back>0&&S.depth>0&&!S.debug,eb=$("enbox");
 eb.classList.toggle("ret",own);eb.classList.toggle("tight",rs===1);eb.classList.toggle("danger",rs===2);
 for(const id of["enmark","enres","enmar"])$(id).hidden=!own;
 if(own){const pc=v=>clamp(v/mE,0,1)*100,need=returnNeed();
  $("enmark").style.left=pc(rc)+"%";$("enres").style.width=pc(rc)+"%";$("enmar").style.left=pc(rc)+"%";$("enmar").style.width=(pc(need)-pc(rc))+"%"}
 if(rs>retSeen){if(rs===2){sfx(150,.25,"sawtooth");sfx(110,.35,"square")}else{sfx(440,.12,"triangle");setTimeout(()=>sfx(330,.15,"triangle"),120)}}
 retSeen=rs;
 barUI();
 refreshBagPop();
 txSet($("lv"),String(S.lvl));const xpGoal=xpNeed(S.lvl),xr=clamp(S.xp/xpGoal,0,1);txSet($("xpt"),fmt(S.xp)+" / "+fmt(xpGoal)+" XP");$("xpi").style.width=(xr*100)+"%";$("xpbar").style.setProperty("--xp-brightness",1+xr*.65);$("xpbar").style.setProperty("--xp-glow",(4+xr*18)+"px");$("xpbar").classList.toggle("xp-near",xr>=.8);$("xpbar").setAttribute("aria-valuenow",Math.round(xr*100));
 txSet($("pts"),String(S.pts));
 setLayerText((surf?__("Superfície · melhorias liberadas · {0}",WX[wx.cur].n):layerName(S.depth)+(S.depth>=FINAL_DEPTH?" · "+__("INQUEBRÁVEL"):""))+(ev>0?"  "+(evT?__("Minérios x3"):__("Ouro x3"))+" "+Math.ceil(ev)+"s":""),surf?"weather":"mine");
 $("toasts").style.top=($("layer").offsetHeight+14)+"px";
 {const l=$("layer"),tt=l.textContent;if(l.title!==tt)l.title=tt}
 txSet($("surfmsg"),!surf?__("Melhorias só na superfície. Suba (ou use o teleporte) para comprar."):"");{const d=surf?"none":"";if($("surfmsg").style.display!==d)$("surfmsg").style.display=d}   // só o aviso no subsolo: na superfície a aba não traz texto de ajuda
 $("surfmsg").classList.toggle("warn",!shop);
 const nshop=nearShop();txSet($("shopmsg"),!surf?__("A loja fica na superfície. Suba (ou use o teleporte) para comprar."):nshop?__("Na loja: compre dinamite."):__("Vá até a loja (à direita do baú) para comprar."));
 $("shopmsg").classList.toggle("warn",!nshop);
 for(const k in ITEMS){if(ITEMS[k].noShop)continue;const c=itemCost(k),mx=have(k)>=99;setTxt("i-"+k,__("{0} · você tem {1}",ITEMS[k].n,have(k)),ITEMS[k].d+(ITEMS[k].en?"":" "+__("(preço sobe a cada camada alcançada)")),mx?__("MÁX"):fmt(c),mx||!nshop||S.gold<c,undefined,mx?0:affordItem(k))}
 if($("furmsg")){const f=S.fur;txSet($("furmsg"),f.n>0?__("Fornalha: {0} minérios na fila · pronta em {1}. Pode ir cavar: ela vende sozinha.",f.n,fmtT(furEta())):__("Refina os minérios com o tempo e vende sozinha (+{0}% de ouro). Pedra comum vai para o baú.",Math.round(BAL.furnace.bonus*100)))}
 txSet($("skmsg"),S.runs<1?__("Os poderes só podem ser comprados depois de Renascer pela primeira vez. Os fragmentos vêm do Renascer e, às vezes, dos baús raros do subsolo."):__("Fragmentos disponíveis: {0} (vêm do Renascer e dos baús raros).",S.pts));
 txSet($("b-snd"),mute?__("Som: desligado"):__("Som: ligado"));
 // picareta (material)
 if(S.tier>=TIERS.length-1)setTxt("u-tier",__("Picareta de {0}",__(TIERS[S.tier])),__("Melhor picareta do jogo (camada {0})",TIERS.length),__("MÁX"),true,5,0,[S.tier,TIERS.length-1]);
 else setTxt("u-tier",__("Nova picareta: {0}",__(TIERS[S.tier+1])),__("Dano x{0} (atual: {1}). Recomendada para a camada {2}",ndec(BAL.tier.dmgMult),__(TIERS[S.tier]),__(BIO[S.tier+1][0])),fmt(tierCost()),!shop||S.gold<tierCost(),lvTier(S.tier,TIERS.length-1),S.gold>=tierCost()?1:0,[S.tier,TIERS.length-1]);
 for(const k in UPS){const l=S.lv[k],mx=l>=UPS[k].max,c=upCost(k,l);setTxt("u-"+k,UPS[k].n,UPS[k].d(l),mx?__("MÁX"):fmt(c),mx||!shop||S.gold<c,lvTier(l,UPS[k].max),mx?0:affordUp(k),[l,UPS[k].max])}
 {const vis={};   // liberação gradual: esconde o que ainda não foi liberado (e grupos que ficaram vazios)
  for(const k in UPS){const on=isUnl("ups",k),b=$("u-"+k);if(b){b.classList.toggle("lock",!on);if(!on)b.disabled=true}if(on)vis[UPS[k].g]=1}
  $("ups").querySelectorAll("[data-g]").forEach(e=>e.classList.toggle("lock",!(e.dataset.g==="Picareta"||vis[e.dataset.g])));
  const visS={};   // idem na loja: a categoria só aparece se tiver algum item liberado
  for(const k in ITEMS){if(ITEMS[k].noShop)continue;const on=isUnl("items",k),b=$("i-"+k);if(b){b.classList.toggle("lock",!on);if(!on)b.disabled=true}if(on)visS[ITEMS[k].g]=1}
  $("shop").querySelectorAll("[data-g]").forEach(e=>e.classList.toggle("lock",!visS[e.dataset.g]));
  const nx=$("nextul");if(nx){const tx=nextUnlockText();nx.textContent=tx;nx.classList.toggle("lock",!tx)}}
 for(const k in SK){const l=S.sk[k],mx=l>=SK[k][2];setTxt("s-"+k,__(SK[k][0]),__(SK[k][1]),mx?__("MÁX"):__("{0} frag.",l+1),mx||S.pts<l+1||S.runs<1,undefined,undefined,[l,SK[k][2]])}
 renderStats();clockUpdate();
 const g=prestGain();$("prest").disabled=(g<1&&!armed)||!surf;
 txSet($("prestd"),g<1?__("Chegue a 100 m nesta vida para ganhar fragmentos. Reinicia ouro, picareta e melhorias; mantém poderes, nível e conquistas"):__("Reinicia ouro, picareta e melhorias e ganha {0} fragmentos (1 por camada de 100 m alcançada nesta vida, +5 por chegar ao fundo)",g));
 txSet($("prestc"),armed?__("Confirmar?"):(g>0?__("+{0} fragmentos",g):""));
 const t=document.querySelectorAll(".tabs button");
 if(t.length){t[0].classList.toggle("has",surf&&!!document.querySelector("#ups .up:not(:disabled)")&&(S.tab||0)!==0);t[2].classList.toggle("has",S.runs>0&&Object.keys(SK).some(k=>S.sk[k]<SK[k][2]&&S.pts>=S.sk[k]+1)&&(S.tab||0)!==2)}   // ponto na aba Poder só se dá para comprar algum poder
}
// Estatísticas e conquistas (aba Poderes): seções com rótulo à esquerda e valor à direita; só redesenha se algo mudou.
let statsHtml="";
function renderStats(){
 if((S.tab||0)!==2)return;
 const row=(l,v)=>"<dt>"+l+"</dt><dd>"+v+"</dd>",sec=(t,r)=>"<h3>"+t+"</h3><dl class='sg'>"+r.join("")+"</dl>",pct=x=>Math.round(x*100)+"%";
 const st=sec(__("Escavação"),[row(__("Dano por golpe"),fmt(clickPow())),row(__("Dano automático"),fmt(autoDps())+"/s"),row(__("Chance de crítico"),pct(critCh())),row(__("Velocidade"),"+"+Math.round((attackSpeedMult()-1)*100)+"%")])
  +sec(__("Energia"),[row(__("Por bloco (aqui)"),digCost(Math.max(0,S.depth)).toFixed(1)),row(__("Por bloco (automático)"),(digCost(Math.max(0,S.depth))*AUTO_ENERGY).toFixed(1)),row(__("Subir 1 m com o jato"),(stepCost(Math.max(0,S.depth))*jetMult()).toFixed(2)),row(__("Dano da lava (aqui)"),S.depth>=BAL.lava.from?Math.round(lavaDmg(S.depth)):__("sem lava"))])
  +sec(__("Nesta profundidade · {0} m",fmt(S.depth)),[row(__("Ouro por bloco"),fmt(blockGold(S.depth))),row(__("Dureza"),fmt(hardness(S.depth))),row(__("Chance de minério"),pct(oreChance())),row(__("Bônus de XP"),"+"+Math.round((xpGainMult()-1)*100)+"%")])
  +sec(__("Progresso"),[row(__("Profundidade máxima"),fmt(S.best)+" m"),row(__("Ouro total"),fmt(S.total)),row(__("Blocos quebrados"),fmt(S.blocks)),row(__("Minérios coletados"),fmt(S.oc)),row(__("Catálogo de minérios"),S.od.length+"/"+ORES.length),row(__("Renascimentos"),S.runs),row(__("Fragmentos"),S.pts),row(__("Estação do ano"),SEASONS[SEA.idx].n)])
  +sec(__("Uso"),[row(__("Vendas no baú"),S.sold),row(__("Vezes sem energia"),S.deaths),row(__("Dinamites usadas"),S.bombs),row(__("Itens comidos"),S.eaten),row(__("Teleportes"),S.tps),row(__("Pedras duras quebradas"),S.veins),row(__("Veios de minério quebrados"),S.rich),row(__("Vezes na cama"),S.sleeps),row(__("Minérios refinados"),fmt(S.refined))])
  +sec(__("Baús"),[row(__("Baús abertos"),S.chests)].concat(BAL.chest.tiers.map((t,i)=>row(__(t.n),"<span style='color:"+t.c+"'>"+S.chT[i]+"</span>")),[row(__("Ouro de baús"),fmt(S.chGold)),row(__("Fragmentos de baús"),S.chFr),row(__("Bônus de melhoria"),S.chPk),row(__("Poções de teleporte usadas"),S.ptpUsed)]))
  +sec(__("Pesca"),[row(__("Peixes pescados"),S.fishN),row(__("Pescarias perfeitas"),S.fishP),row(__("Peixes na bolsa"),S.fb.length+"/"+BAL.fish.bag),row(__("Peixes assados"),S.cookN),row(__("Ouro de peixes"),fmt(S.fishG)),row(__("Álbum de peixes"),Object.keys(S.fdx).length+"/"+FISH.length)].concat(FISH.map(f=>row(S.fdx[f.id]?"<span style='color:"+f.c+"'>"+__(f.n)+"</span>":"???",S.fdx[f.id]?S.fdx[f.id]+" cm":"-"))));
 const all=ACH.map((a,i)=>({a,i,ok:S.ach.includes(i)})),todo=all.filter(x=>!x.ok),done=all.filter(x=>x.ok);
 const li=x=>"<li class='"+(x.ok?"ok":"")+"'><i>"+(x.ok?"✓":"")+"</i><span><b>"+__(x.a[0])+"</b><small>"+__(x.a[1])+"</small></span></li>";
 const ac="<div class='achbar'><i style='width:"+(done.length/ACH.length*100)+"%'></i></div>"
  +(todo.length?"<h3>"+__("Pendentes · {0}",todo.length)+"</h3><ul class='achl'>"+todo.map(li).join("")+"</ul>":"")
  +(done.length?"<h3>"+__("Concluídas · {0}",done.length)+"</h3><ul class='achl'>"+done.map(li).join("")+"</ul>":"");
 const h=st+"\u0001"+ac+"\u0001"+done.length+"/"+ACH.length;
 if(h===statsHtml)return;statsHtml=h;
 $("stats").innerHTML=st;$("achl").innerHTML=ac;$("achc").textContent=done.length+"/"+ACH.length;
}
let armed=false,armT=0;
$("prest").onclick=()=>{
 if(prestGain()<1||!atSurface())return;
 if(!armed){armed=true;armT=setTimeout(()=>{armed=false;refresh()},3000);refresh();return}
 clearTimeout(armT);armed=false;doRebirth();
};
function doRebirth(){   // Renascer (botão do painel, depois de confirmar, e janela de chegada ao fundo)
 gainGoldenCarrot();   // quem chegou ao fundo nesta vida e não tocou na cenoura (jogo reaberto lá embaixo) também ganha a dourada
 const keep={gc:S.gc,gcAt:S.gcAt,runs:S.runs+1,best:S.best,ach:S.ach,oc:S.oc,total:S.total,debug:S.debug,sk:S.sk,pts:S.pts+prestGain(),od:S.od,xp:S.xp,lvl:S.lvl,lvp:S.lvp,pk:S.pk,vol:S.vol,deaths:S.deaths,sold:S.sold,play:S.play,blocks:S.blocks,tab:S.tab,items:S.items,bombs:S.bombs,eaten:S.eaten,tps:S.tps,veins:S.veins,rich:S.rich,sleeps:S.sleeps,refined:S.refined,ctDone:S.ctDone,spins:S.spins,chests:S.chests,chTop:S.chTop,chT:S.chT,chGold:S.chGold,chFr:S.chFr,chPk:S.chPk,ptpUsed:S.ptpUsed,slotNet:S.slotNet,sea:S.sea,moon:S.moon,fb:S.fb,fdx:S.fdx,fishN:S.fishN,fishP:S.fishP,fishG:S.fishG,cookN:S.cookN,cookP:S.cookP};
 const h=S.sk.her,ini=S.sk.ini,clk=S.lv.clock,bk=S.lv.back,rd=S.lv.rod,bt=S.lv.bait;S=Object.assign(fresh(),keep);S.lv.clock=clk;S.lv.back=bk;S.lv.rod=rd;S.lv.bait=bt;   // o relógio (compra única), a vara e a isca de pesca e a estação do ano não se perdem ao renascer
 S.seed=SEED=newSeed();chQ.length=0;carrotC=null;dug=new Set();mX=mY=camX=camY=0;layerSeen=0;
 S.tier=Math.min(ini,TIERS.length-1);S.gold=S.debug?Infinity:400*h*h;S.en=maxEn();build();save();sayLevel(__("Renascido! Fragmentos: {0}",S.pts));
}
let rst=false;
function wipeAll(){   // recomeça do zero (botão "Apagar progresso" e save apagado pelo navegador)
S=fresh();S.seed=SEED=newSeed();chQ.length=0;carrotC=null;dug=new Set();mX=mY=camX=camY=0;skT=[0,0];skCD=[0,0];dynCD=0;tpCD=0;ev=0;cmb=0;cmbT=0;layerSeen=0;rst=false;armed=false;S.en=maxEn();
 try{localStorage.removeItem("abismo-v1")}catch(e){}
 if($("reset"))$("reset").textContent=__("Apagar progresso");build();save()}
$("reset").onclick=()=>{if(!rst){rst=true;$("reset").textContent=__("Clique de novo para apagar tudo");setTimeout(()=>{rst=false;$("reset").textContent=__("Apagar progresso")},3000);return}
 wipeAll()};

// Conteúdo da mochila: aparece ao passar o mouse (ou tocar) na caixa "MOCHILA", sem aba nova.
let bagHtml="";
function refreshBagPop(){
 const b=S.bag,names=[N_("Pedra"),N_("Pedra dura")].concat(ORES.map(o=>o[0])),col=n=>n==="Pedra"?"#9aa0a6":n==="Pedra dura"?"#6b7a94":ORES.find(o=>o[0]===n)[2];
 const list=b.n<=0?"<div class='chips'><div>"+__("vazia")+"</div></div>":"<div class='chips'>"+names.filter(n=>b.o[n]>0).map(n=>"<div><i style='background:"+col(n)+"'></i>"+__(n)+" <span>x"+b.o[n]+"</span></div>").join("")+"</div>";
 const h="<div class='pt'><b>"+__("MOCHILA")+"</b> · "+(b.n===1?__("{0} item",b.n):__("{0} itens",b.n))+" · "+__("vale {0} de ouro",fmt(b.v))+"</div>"+list;
 if(h!==bagHtml){bagHtml=h;$("bagside").innerHTML=h}
}

// ===== 4-interface/02-abas.js — Abas do painel (Melhorias, Loja, Poder, Menu), botões rápidos e abertura automática da aba certa na mesa/loja =====
function setTab(i){S.tab=i;document.querySelectorAll(".tabs button").forEach((b,k)=>b.classList.toggle("on",k===i));document.querySelectorAll("#side .pane").forEach((p,k)=>p.classList.toggle("on",k===i))}
const TAB_NAMES=[N_("Melhorias"),N_("Loja"),N_("Poder"),N_("Menu")];
let fsLab=null;   // refaz o texto do botão de tela cheia (ao trocar de idioma)
const relabelTabs=()=>document.querySelectorAll("#tabs button").forEach((b,i)=>{b.innerHTML=__(TAB_NAMES[i])+"<i class='dot'></i>"});
function buildTabs(){
 const tb=$("tabs");tb.innerHTML="";
 TAB_NAMES.forEach((n,i)=>{const b=mk("button","",__(n)+"<i class='dot'></i>");b.onclick=()=>{setTab(i);sfx(500,.04,"sine")};tb.appendChild(b)});
 $("qk-pause").onclick=openPause;
 {const fb=$("qk-full"),de=document.documentElement,can=document.fullscreenEnabled||document.webkitFullscreenEnabled;   // tela cheia (iPhone não suporta: some o botão)
  if(!can)fb.hidden=true;
  else{const isF=()=>document.fullscreenElement||document.webkitFullscreenElement,lab=()=>{fb.textContent=isF()?__("Sair da tela"):__("Tela cheia")};fsLab=lab;
   fb.onclick=()=>{fb.blur();try{const p=isF()?(document.exitFullscreen||document.webkitExitFullscreen).call(document):(de.requestFullscreen||de.webkitRequestFullscreen).call(de);if(p&&p.catch)p.catch(()=>{})}catch(e){}};
   document.addEventListener("fullscreenchange",lab);document.addEventListener("webkitfullscreenchange",lab);lab()}}
 $("b-snd").onclick=()=>{mute=!mute;refresh()};
 setTab(clamp(Math.floor(Number.isFinite(S.tab)?S.tab:0),0,3));
}
// Ao chegar na mesa de trabalho abre "Melhorias"; ao chegar na loja abre "Loja" (só na chegada: depois dá para trocar de aba à vontade).
const zoneNow=()=>nearBed()?"bed":nearBench()?"bench":nearShop()?"shop":nearFurnace()?"furn":nearChest()?"chest":null;
let zonePrev=zoneNow();
function autoTab(){const z=zoneNow();if(z===zonePrev)return;zonePrev=z;if(z==="bench"&&(S.tab||0)!==0)setTab(0);else if(z==="shop"&&(S.tab||0)!==1)setTab(1);else if(z==="bed")sleepSave()}
// Cama (ao lado da mesa de trabalho): ao chegar perto dela o jogo é salvo e o painel abre a aba Menu (save, som, exportar/importar).
function sleepSave(){S.sleeps++;save();if((S.tab||0)!==3)setTab(3);sayInfo(__("Jogo salvo na cama"));sfx(440,.15,"sine");setTimeout(()=>sfx(660,.2,"sine"),120)}

// ===== 4-interface/03-barra-habilidades.js — Barra de habilidades no estilo hotbar do Minecraft (Dinamite, Fúria, Frenesi, Teleporte e itens de energia) com ícones em pixel art =====
// Ícones: matrizes 14x14 (cada letra é uma cor da paleta, "." é vazio). O contorno escuro é desenhado automaticamente e o SVG sai com pixels nítidos (sem suavização).
const SPR={
 dyn:["........y.....",".......yoy....","........f.....",".......f......","...RRRRRRRR...","...rRRRRRRR...","...rRRRRRRR...","...WWWWWWWW...","...WkkWkkWW...","...WWWWWWWW...","...rRRRRRRR...","...rRRRRRRR...","...RRRRRRRR...","...RRRRRRRR..."],
 fury:["......O.......","......OO......",".....OOO..O...",".....OOOOOO...","....OOOOOOOO..","....OOOYOOOO..","...OOOOYYOOOO.","...OOOYYYYOOO.","...OOOYYYYOOO.","...OOOYYWYOOO.","...OOOYWWYOOO.","....OOYYYYOO..",".....OOYYOO...","......OOOO...."],
 frenzy:["......YYYYY...",".....YYYYY....","....YYYYY.....","...YYYYY......","..YYYYYYYYY...","..YWYYYYYY....",".......YYY....","......YYY.....","......YYY.....",".....YYY......",".....YY.......","....YY........","....Y.........","...Y.........."],
 tele:["....DDDDDD....","..DDPPPPPPDD..",".DPPPPPPPPPPD.",".DPPpppppPPPD.","DPPPpppppppPPD","DPPpppWWpppPPD","DPPppWWWWppPPD","DPPppWWWWppPPD","DPPpppWWpppPPD","DPPPpppppppPPD",".DPPpppppPPPD.",".DPPPPPPPPPPD.","..DDPPPPPPDD..","....DDDDDD...."],
 cen:[".........gg...","......g.gggg..",".......gggg...","......OOOg....",".....OOOOO....","....OOoOOO....","...OOOOOOO....","..OOoOOOO.....","..OOOOOO......",".OOoOOO.......",".OOOOO........","OOOO..........","OOO...........","OO............"],
 sop:["....w....w....",".....w....w...","....w....w....","..yyyyyyyyyy..",".yyyyrryyyyyy.",".BBBBBBBBBBBB.",".BBBBBBBBBBBB.","..BBBBBBBBBB..","..BbBBBBBBBB..","...BBBBBBBB...","....BBBBBB....","....dddddd....","..............",".............."],
 poc:["....cccccc....","....cccccc....",".....GGGG.....",".....GGGG.....","....GGGGGG....","...GGGGGGGG...","..GGLLLLLLGG..","..GLLLLLLLLG..","..GLLwLLLLLG..","..GLLLLLLLLG..","..GLLLLLLLLG..","...GLLLLLLG...","....GGGGGG....",".............."]
};
const SPR_PAL={fury:{O:"#ff6a2a",Y:"#ffd45c",W:"#fff3b0"},frenzy:{Y:"#ffe14a",W:"#fff8c8"},tele:{D:"#2c1766",P:"#6a3dff",p:"#b9a2ff",W:"#ffffff"},cen:{O:"#ff8a2a",o:"#c75a12",g:"#58c458"},sop:{w:"#f2f2f2",y:"#f0cf8c",r:"#e24b3b",B:"#c98a4b",b:"#e9b27a",d:"#8a5a2a"},poc:{c:"#b9854a",G:"#e6f7ff",L:"#35dcff",w:"#c9f6ff"}};
SPR.ptp=SPR.poc;SPR_PAL.ptp={c:"#b9854a",G:"#efe6ff",L:"#9a5cff",w:"#e3d2ff"};
// comidas feitas na fogueira: o mesmo peixe no espeto, mais dourado a cada nível (b corpo, l brilho, d marcas da brasa, t cauda, e olho, s espeto)
const FISHSPR=["..............","..............","..............","...bbbbbb.....","..bblllbbbb..t",".bbllbbddbbbtt","ssebbbbddbbbtt",".bbbbbbddbbbtt","..bbbbbbbbb..t","...bbbbbb.....","..............","..............","..............",".............."];
SPR.pas=FISHSPR;SPR_PAL.pas={b:"#d9a05b",l:"#f0c98a",d:"#8a5a2a",t:"#c9843a",e:"#2a1a0a",s:"#a8793f"};
SPR.pgr=FISHSPR;SPR_PAL.pgr={b:"#ee8a4a",l:"#ffc08a",d:"#8a3a1a",t:"#d96a2a",e:"#2a1a0a",s:"#a8793f"};
SPR.pbq=FISHSPR;SPR_PAL.pbq={b:"#ffd45c",l:"#fff3b0",d:"#c98a1a",t:"#f0b02a",e:"#2a1a0a",s:"#d9b46a"};
const lighten=(h,a)=>"#"+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*(1-a)+255*a).toString(16).padStart(2,"0")).join("");
const hotCache={};
function pixSVG(rows,pal){
 const G=Array.from({length:16},()=>Array(16).fill(null));
 rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const c=pal[r[x]];if(c)G[y+1][x+1]=c}});
 const O=G.map(r=>r.slice());
 for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(!G[y][x]&&((y>0&&G[y-1][x])||(y<15&&G[y+1][x])||(x>0&&G[y][x-1])||(x<15&&G[y][x+1])))O[y][x]="#140d06";
 let s="";for(let y=0;y<16;y++){let x=0;while(x<16){const c=O[y][x];if(!c){x++;continue}let e=x;while(e<16&&O[y][e]===c)e++;s+="<rect x='"+x+"' y='"+y+"' width='"+(e-x)+"' height='1' fill='"+c+"'/>";x=e}}
 return "<svg viewBox='0 0 16 16' shape-rendering='crispEdges'>"+s+"</svg>"}
// Dinamite: o corpo muda de cor conforme o tipo (cor do item)
function dynSprite(k){const key="d"+k;return hotCache[key]||(hotCache[key]=pixSVG(SPR.dyn,{R:ITEMS[k].c,r:lighten(ITEMS[k].c,.4),W:"#f6e6b8",k:"#3a2a1a",f:"#e9d9aa",y:"#ffd45c",o:"#ff9a3a"}))}
const sprite=k=>hotCache[k]||(hotCache[k]=pixSVG(SPR[k],SPR_PAL[k]));
// [nome, tecla, item de energia (clique), sprite]. Dinamite e itens de energia são consumíveis comprados na loja; os itens de energia só têm clique.
const BAR=[[N_("Dinamite"),"E",null,"dyn"],[N_("Fúria do Minerador"),"1",null,"fury"],[N_("Escavação Frenética"),"2",null,"frenzy"],[N_("Teleporte"),"Q",null,"tele"],[N_("Cenourinha"),"","cen","cen"],[N_("Sopa de cogumelo"),"","sop","sop"],[N_("Poção de energia"),"","poc","poc"],[N_("Poção de teleporte"),"","ptp","ptp"],[N_("Comida de peixe"),"F",null,"fish"]];
const FI=BAR.length-1;   // slot único das comidas de peixe (alterna entre assado, grelhado e banquete)
const foodPick=()=>{if(have(S.fsel)>0||S.debug)return S.fsel;for(let i=FOODS.length-1;i>=0;i--)if(have(FOODS[i])>0)return FOODS[i];return S.fsel};
function foodNext(){const own=FOODS.filter(k=>have(k)>0||k===S.fsel||S.debug);if(!own.length)return;const i=own.indexOf(S.fsel);S.fsel=own[(i+1)%own.length];sayFood(__("Comida escolhida: {0}",ITEMS[S.fsel].n));refresh()}
function slotTitle(i){const s=BAR[i];
 if(i===FI){const k=foodPick(),it=ITEMS[k];return __("{0} — {1} (clique ou F para usar; feito na fogueira). Você tem {2}. Botão direito troca o tipo",it.n,it.d,have(k))}
 if(s[2]){const it=ITEMS[s[2]];return it.tp?__("{0} — {1} (clique para usar). Você tem {2}",it.n,it.d,have(s[2])):it.noShop?__("{0} — {1} (clique para usar; feito na fogueira). Você tem {2}",it.n,it.d,have(s[2])):__("{0} — {1} (clique para usar; compre na loja). Você tem {2}",it.n,it.d,have(s[2]))}
 const nm=__(s[0]);
 return i===0?__("{0} — {1}: explode uma área de raio {2} e quebra veios de pedra dura (consome 1, compre na loja). Você tem {3}. Botão direito ou R troca o tipo",nm,ITEMS[dynPick()].n,fmtN(BAL.dyn[dynPick()].r),have(dynPick()))
  :i===3?__("{0} — leva ao baú sem gastar energia; na superfície, volta ao ponto de onde saiu (compre em Melhorias)",nm)
  :__("{0} — {1} (desbloqueia aos {2} m)",nm,skillDescription(i-1),SKL[i-1][4])}
function buildBar(){const bar=$("bar");bar.innerHTML="";const hot=mk("div","hot");bar.appendChild(hot);
 const G=[mk("div","hg g-sk"),mk("div","hg g-it"),mk("div","hg g-fd")];G.forEach(g=>hot.appendChild(g));   // habilidades · consumíveis · comida de peixe
 BAR.forEach((s,i)=>{const b=mk("button","slot",(i===0?dynSprite(dynPick()):i===FI?sprite(foodPick()):sprite(s[3]))+(s[1]?"<span class='k'>"+s[1]+"</span>":"")+"<span class='qn'></span><i class='cd'></i>");
  b.title=slotTitle(i);
  if(i===0)b.oncontextmenu=e=>{e.preventDefault();dynNext()};
  if(i===FI)b.oncontextmenu=e=>{e.preventDefault();foodNext()};
  b.onclick=()=>{if(i===0)boom();else if(i===3)teleport();else if(i===FI)useItem(foodPick());else if(s[2])useItem(s[2]);else useSk(i-1)};
  const g=G[i<4?0:i<8?1:2];
  if(i===0||i===FI){const w=mk("span","dwrap");w.appendChild(b);const dp=mk("div","dpick");dp.id=i===0?"dpick":"fpick";w.appendChild(dp);g.appendChild(w)}else g.appendChild(b)})}
// Seletor de dinamite: pilha de casinhas acima do ícone (aparece com 2 ou mais tipos); clique escolhe qual a tecla E usa
function pickUI(id,ids,cur,sp,tip,choose){const dp=$(id);if(!dp)return;const own=ids.filter(k=>have(k)>0||S.debug),sig=own.map(k=>k+have(k)).join()+cur;if(dp.dataset.s===sig)return;dp.dataset.s=sig;dp.innerHTML="";if(own.length<2)return;
 for(const k of own){const c=mk("button","dchip"+(k===cur?" on":""),sp(k)+"<b>"+(S.debug?"\u221e":have(k))+"</b>");c.title=tip(k);c.onclick=e=>{e.stopPropagation();choose(k)};dp.appendChild(c)}}
function dpickUI(){
 pickUI("dpick",DYN_IDS,dynPick(),dynSprite,k=>__("{0} (raio {1})",ITEMS[k].n,fmtN(BAL.dyn[k].r)),k=>{S.dsel=k;sayMine(__("Dinamite escolhida: {0}",ITEMS[k].n));refresh()});
 pickUI("fpick",FOODS,foodPick(),sprite,k=>ITEMS[k].n,k=>{S.fsel=k;sayFood(__("Comida escolhida: {0}",ITEMS[k].n));refresh()})}
function barUI(){const slots=document.querySelectorAll(".slot");BAR.forEach((s,i)=>{const b=slots[i];if(!b)return;
 let lock=false,empty=false,active=0,frac=0,txt="";   // frac = parte da recarga que falta (véu branco que desce, como no Minecraft)
 if(i===0){const dk=dynPick();empty=have(dk)<1&&!S.debug;frac=dynCD>0?dynCD/dynMax():0;txt=S.debug?"∞":String(have(dk));
  if(b.dataset.dk!==dk){b.dataset.dk=dk;b.querySelector("svg").outerHTML=dynSprite(dk)}}
 else if(i===FI){const fk=foodPick();empty=have(fk)<1&&!S.debug;txt=S.debug?"∞":String(have(fk));if(b.dataset.fk!==fk){b.dataset.fk=fk;b.querySelector("svg").outerHTML=sprite(fk);b.style.setProperty("--tc",ITEMS[fk].c)}
  const hid=S.cookN<1&&!FOODS.some(k=>have(k)>0)&&!S.debug,grp=b.closest(".hg"),dsp=hid?"none":"";if(grp&&grp.style.display!==dsp)grp.style.display=dsp}
 else if(s[2]){empty=have(s[2])<1&&!S.debug;txt=S.debug?"∞":String(have(s[2]))}
 else if(i===3){lock=S.lv.tele<1;frac=tpCD>0?tpCD/teleCD():0;if(tpCD>0)txt=Math.ceil(tpCD)+"s"}
 else{const k=SKL[i-1];lock=S.best<k[4];active=skT[i-1];frac=!lock&&active<=0&&skCD[i-1]>0?skCD[i-1]/k[3]:0;txt=lock?k[4]+"m":active>0?Math.ceil(active)+"s":skCD[i-1]>0?Math.ceil(skCD[i-1])+"s":""}
 const cl="slot"+(lock?" lock":"")+(empty?" empty":"")+(active>0?" active":"");if(b.className!==cl)b.className=cl;
 b.querySelector(".cd").style.height=Math.round(clamp(frac,0,1)*38)+"px";
 const q=b.querySelector(".qn");if(q.textContent!==txt){q.textContent=txt}
 const t=slotTitle(i);if(b.title!==t)b.title=t});dpickUI()}

// ===== 4-interface/04-entrada.js — Mouse, teclado, toque e botões de celular =====
cv.addEventListener("pointerdown",e=>{e.preventDefault();
 if(fs&&!modal){fishHold=true;fishAct();return}   // pescando: tocar/clicar fisga, segura a barra e lança de novo
 if(atSurface()&&!modal){for(const[hit,use]of[[boardHit,boardUse],[slotHit,slotUse],[campHit,campUse],[cauldronHit,cauldronUse],[bellHit,bellUse],[forageHit,forageUse],[fishHit,fishUse],[marketHit,marketUse]])if(hit(e.offsetX,e.offsetY)&&use())return}
 if(atSurface()&&furHit(e.offsetX,e.offsetY)){furUse();return}
 if(atSurface()&&chestHit(e.offsetX,e.offsetY)){chestUse();return}
 const c=Math.floor((e.offsetX-W/2)/T+camX+.5),r=Math.floor((e.offsetY-H*SURF)/T+camY),p=S.depth,m=S.mc;
 if(c===m-1&&r===p-1)setDir("left");else if(c===m+1&&r===p-1)setDir("right");else if(c===m&&r===p)setDir("down");else if(c===m&&r===p-2)setDir("up");
});
// Pilha de direções seguradas: vale a última tecla pressionada; ao soltá-la, volta para a que ainda está segura (ex.: segurar W, tocar em A e soltar continua subindo).
const dirKeys=[];
function setHeld(){
 const n=dirKeys.length,l=dirKeys[n-1];held=l?l.d:null;heldC=l?l.id:null;
}
function pressDir(id,d){const i=dirKeys.findIndex(x=>x.id===id);if(i>=0)dirKeys.splice(i,1);dirKeys.push({id,d});setHeld()}
function releaseDir(id){const i=dirKeys.findIndex(x=>x.id===id);if(i>=0)dirKeys.splice(i,1);setHeld()}
addEventListener("pointerup",()=>holdM=false);
addEventListener("pointercancel",()=>holdM=false);
addEventListener("keydown",e=>{
 if(/^(TEXTAREA|INPUT)$/.test(e.target.tagName))return;
 if(modal){
  if(modal==="pause"){pauseKey(e);return}
  if(modal==="mem"){memKey(e);return}
  if(modal==="slot"){slotKey(e);return}
  if(modal==="chest"){chestKey(e);return}
  if(modal==="camp"){campKey(e);return}
  if(modal==="pot"){potKey(e);return}
  if(modal==="title"){if(e.target.closest&&e.target.closest(".langpick"))return;e.preventDefault();if(!e.repeat&&(e.code==="Space"||e.code==="Enter"))startGame();return}
  if(modal==="death"){e.preventDefault();if(!e.repeat&&performance.now()>deathLock&&(e.code==="Space"||e.code==="Enter"||e.code==="Escape"))closeModal();return}
  if(modal==="lv"){   // escolha de melhoria ao subir de nível: WASD/setas movem, Espaço (ou Enter) confirma
   const d={KeyA:-1,ArrowLeft:-1,KeyW:-1,ArrowUp:-1,KeyD:1,ArrowRight:1,KeyS:1,ArrowDown:1}[e.code];
   if(d){e.preventDefault();if(!e.repeat)lvMove(d);return}
   if(e.code==="Space"||e.code==="Enter"){e.preventDefault();if(!e.repeat)lvConfirm();return}
  }
  if(e.code==="Escape"&&modal!=="lv")closeModal();return}
 if(e.key==="Shift")shiftOn=true;musOn=true;
 // pescando (sem janela): Espaço/Enter fisga, segura a barra e lança de novo; Esc sai; andar só sai da pesca fora do minijogo
 if(fs){
  const dk=/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|KeyA|KeyD|KeyW|KeyS)$/.test(e.code);
  if(e.code==="Escape"){e.preventDefault();fishEnd();return}
  if(e.code==="Space"||e.code==="Enter"){e.preventDefault();if(!e.repeat){fishHold=true;fishAct()}return}
  if(e.code==="KeyP"){openPause();return}
  if(e.code==="KeyN"){mute=!mute;refresh();return}
  if(dk&&(fs.ph==="cast"||fs.ph==="wait"||fs.ph==="done"))fishEnd();else return;
 }
 // código secreto (como em GTA): digitar uma das palavras de CHEATS. A primeira letra ainda faz a sua função normal; as seguintes são engolidas (não cavam, não explodem, não abrem o mapa).
 // CLIMA e SEASON só valem se a primeira letra foi digitada na superfície (profundidade 0): lá "S" e "E" não atrapalham, e é onde se vê o efeito.
 if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.repeat&&/^Key[A-Z]$/.test(e.code)){
  const nowK=performance.now(),L=e.code.slice(3),okWord=(w,surf)=>!CHEATS_SURF.includes(w)||surf;
  if(nowK-cheatT>2000)cheatBuf="";
  let buf=cheatBuf+L;
  if(!CHEATS.some(w=>w.startsWith(buf)&&okWord(w,cheatBuf?cheatSurf:S.depth<=0)))buf=CHEATS.some(w=>w.startsWith(L)&&okWord(w,S.depth<=0))?L:"";
  if(buf.length===1){cheatSurf=S.depth<=0;cheatPos={mc:S.mc,depth:S.depth,best:S.best,runMax:S.runMax}}
  cheatBuf=buf;cheatT=nowK;
  const word=CHEATS.find(w=>w===buf&&okWord(w,cheatSurf));
  if(word){cheatBuf="";runCheat(word);return}
  if(buf.length>=2)return;
 }
 const m={ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowDown:"down",KeyS:"down",ArrowUp:"up",KeyW:"up"}[e.code];
 if(/^Digit[1-2]$/.test(e.code)){useSk(+e.code.slice(5)-1);return}
 if(e.code==="KeyE"){boom();return}
 if(e.code==="KeyR"){dynNext();return}
 if(e.code==="KeyF"){useItem(foodPick());return}
 if(e.code==="KeyQ"){teleport();return}
 if(e.code==="Escape"){openPause();return}
 if(e.code==="KeyP"){openPause();return}
 if(e.code==="KeyN"){mute=!mute;refresh();return}
 if(m){e.preventDefault();if(!e.repeat){pressDir(e.code,m);move(held);lastMv=performance.now()}return}
 if(e.code==="Space"){e.preventDefault();if(!e.repeat){holdS=true;clickDig();lastH=performance.now()}}});
addEventListener("keyup",e=>{if(e.code==="Space"){holdS=false;e.preventDefault()}releaseDir(e.code);if(e.key==="Shift")shiftOn=false});
addEventListener("blur",()=>{holdS=holdM=false;dirKeys.length=0;setHeld();shiftOn=false});
cv.addEventListener("wheel",e=>{e.preventDefault();setZoom(zoomPreference*(e.deltaY<0?1.12:1/1.12))},{passive:false});
if(matchMedia("(pointer:coarse)").matches||innerWidth<760){
 // Controles de celular: direcionais à esquerda, Minerar à direita (a Pausa fica só no painel e no teclado).
 const bar=mk("div");bar.style.cssText="position:fixed;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));pointer-events:none;z-index:9;-webkit-touch-callout:none;background:linear-gradient(rgba(11,12,16,0),#0b0c10 42%)";
 const ups=[];   // liberadores ativos: soltam tudo se o toque se perder (janela abriu, app foi para segundo plano etc.)
 const btn=(t,dn,up,w,fs)=>{const b=mk("button","",t);
  b.style.cssText="pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;box-sizing:border-box;padding:0;white-space:nowrap;overflow:hidden;text-align:center;width:"+(w||56)+"px;height:56px;font-size:"+(fs||22)+"px;background:#15171cf2;border:1px solid #666;border-radius:12px;color:#fff";
  let on=false;const rel=()=>{if(!on)return;on=false;b.style.background="#15171cf2";up()};ups.push(rel);
  b.addEventListener("pointerdown",e=>{e.preventDefault();if(on)return;on=true;b.style.background="#3a3f4bf2";try{b.setPointerCapture(e.pointerId)}catch(_){}musOn=true;dn()});
  ["pointerup","pointercancel","lostpointercapture"].forEach(n=>b.addEventListener(n,rel));return b};
 const pad=mk("div");pad.style.cssText="display:grid;grid-template-columns:repeat(3,56px);gap:6px";
 const dr=(t,d)=>btn(t,()=>{pressDir("touch-"+d,d);move(d);lastMv=performance.now()},()=>releaseDir("touch-"+d));
 [mk("span"),dr("▲","up"),mk("span"),dr("◀","left"),dr("▼","down"),dr("▶","right")].forEach(x=>pad.appendChild(x));
 const mine=btn(__("Minerar"),()=>{holdS=true;if(fs)fishHold=true;clickDig();lastH=performance.now()},()=>{holdS=false;fishHold=false},104,15);
 mine.style.height="118px";mine.style.letterSpacing=".03em";mine.style.fontWeight="700";
 bar.appendChild(pad);bar.appendChild(mine);onLang(()=>{mine.textContent=__("Minerar")});
 addEventListener("blur",()=>ups.forEach(f=>f()));document.addEventListener("visibilitychange",()=>{if(document.hidden)ups.forEach(f=>f())});
 bar.oncontextmenu=e=>e.preventDefault();document.body.style.overscrollBehavior="none";document.body.appendChild(bar);document.body.style.paddingBottom="150px"}

// ===== 4-interface/05-pausa.js — Menu de pausa (Esc ou P): congela o jogo e oferece continuar, salvar, som e voltar ao menu =====
function openPause(){
 if(modal)return;
 const b=openModal("pause");b.style.maxWidth="320px";paintPause();
 $("pm-go").focus();
}
function paintPause(){
 const b=$("bx"),where=atSurface()?__("Superfície"):fmt(S.depth)+" m · "+layerName(S.depth);
 b.innerHTML="<div class='pm'><h2>"+__("Pausa")+"</h2><div class='sub'>"+where+" · "+__("nível {0}",S.lvl)+"</div>"
  +"<button id='pm-go' class='main'>"+__("Continuar")+"</button><button id='pm-sv'>"+__("Salvar jogo")+"</button><button id='pm-snd'></button><div data-langmenu></div><button id='pm-menu'>"+__("Menu inicial")+"</button>"
  +"</div>";
 const snd=()=>{$("pm-snd").textContent=mute?__("Som: desligado"):__("Som: ligado")};snd();
 langMenus();
 $("pm-go").onclick=closeModal;
 $("pm-sv").onclick=()=>{save();sayInfo(__("Jogo salvo"));$("pm-sv").textContent=__("Jogo salvo ✓")};
 $("pm-snd").onclick=()=>{mute=!mute;snd();refresh()};
 $("pm-menu").onclick=()=>{save();closeModal();showTitle()};
}
function pauseKey(e){
 if(e.code==="Escape"||e.code==="KeyP"){e.preventDefault();if(!e.repeat)closeModal();return}
 const d={ArrowUp:-1,KeyW:-1,ArrowDown:1,KeyS:1}[e.code];
 if(d){e.preventDefault();const bs=[...document.querySelectorAll("#bx .pm button")].filter(b=>b.offsetParent),i=bs.indexOf(document.activeElement);bs[(i+d+bs.length)%bs.length].focus()}
}

// ===== 4-interface/06-relogio.js — Relógio de sol e lua na barra do topo (como o do Minecraft); aparece depois de comprado na mesa de trabalho =====
// O mostrador gira com o dia (dayT, ver 5-desenho/08-dia-noite.js): o sol fica no alto ao meio-dia, a lua no alto à meia-noite; a metade do lado do sol é clara e a oposta é escura.
// dayT 0 = amanhecer (6:00) · .25 = meio-dia · .5 = pôr do sol (18:00) · .75 = meia-noite. Só o mostrador (a hora aparece ao passar o mouse). Redesenhado a cada refresh (a cada ~0,15 s), pixel a pixel numa grade de 22x22.
const clkCv=$("clk"),clkG=clkCv.getContext("2d");let clkLast="";
const clkMix=(a,b,k)=>[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*k));
function clockHour(){const h=((6+dayT*24)%24+24)%24;return{h:Math.floor(h),m:Math.floor((h%1)*60)}}
function clockPeriod(){return dayT<.25?__("Manhã"):dayT<.5?__("Tarde"):dayT<.75?__("Noite"):__("Madrugada")}
function clockDraw(){
 const g=clkG,a=(dayT-.25)*Math.PI*2,sx=Math.sin(a),sy=-Math.cos(a);   // direção do sol a partir do centro (para cima = meio-dia)
 g.clearRect(0,0,22,22);
 for(let y=0;y<22;y++)for(let x=0;x<22;x++){
  const dx=x+.5-11,dy=y+.5-11,d=Math.hypot(dx,dy);if(d>11)continue;
  let c;
  if(d>9.3){const l=(-dx-dy)/(1.414*d);c=l>.35?"#ffe27a":l<-.35?"#7a5410":"#c8962a"}   // aro dourado com luz vinda de cima à esquerda
  else{const dot=(dx*sx+dy*sy)/9.3,k=Math.max(0,Math.min(1,.5+dot*.75)),m=clkMix([16,20,48],[104,182,240],k);c="rgb("+m[0]+","+m[1]+","+m[2]+")"}
  g.fillStyle=c;g.fillRect(x,y,1,1);
 }
 const disc=(cx,cy,r,col,hi)=>{for(let y=0;y<22;y++)for(let x=0;x<22;x++){const q=Math.hypot(x+.5-cx,y+.5-cy);if(q<=r){g.fillStyle=hi&&q<r*.5?hi:col;g.fillRect(x,y,1,1)}}};
 const R=6.3,mx=11-sx*R,my=11-sy*R,mp=moonP(),mr=2.3;
 disc(11+sx*R,11+sy*R,2.3,"#ffd45c","#fff3a0");   // sol
 for(let y=0;y<22;y++)for(let x=0;x<22;x++){   // lua com a fase atual: parte iluminada clara, parte escura apagada
  const qx=x+.5-mx,qy=y+.5-my;if(Math.hypot(qx,qy)>mr)continue;
  g.fillStyle=moonLit(qx/mr,qy/mr,mp)?"#e6ebf5":"#2c3458";g.fillRect(x,y,1,1);
 }
 if(moonLight(mp)>.55){g.fillStyle="#a9b2c8";g.fillRect(Math.round(mx+.2),Math.round(my-1),1,1);g.fillRect(Math.round(mx-1),Math.round(my+.3),1,1)}   // crateras (só com a lua bem iluminada)
}
function clockUpdate(){
 const own=S.lv.clock>0,box=$("clockbox");if(box.hidden===own)box.hidden=!own;
 if(!own)return;
 const t=clockHour(),txt=String(t.h).padStart(2,"0")+":"+String(t.m).padStart(2,"0"),key=txt+"|"+Math.round(dayT*2000)+"|"+Math.round(moonP()*64);
 if(key===clkLast)return;clkLast=key;
 clockDraw();box.title=__("{0} · {1} · {2} (o sol aparece no alto ao meio-dia e a lua à meia-noite)",clockPeriod(),txt,moonName());
}

// ===== 4-interface/07-controle.js — Suporte a controle (Gamepad API: Xbox, PlayStation, Switch Pro e genéricos no layout padrão) =====
// Jogo:   direcional ou analógico esquerdo = mover · A = cavar (segure) / usar baú, fornalha, quadro e caça-níquel · B (segure) = correr
//         X = dinamite · Y = trocar dinamite · LB / RB = habilidades 1 e 2 · LT = teleporte · RT (segure) = correr
//         Start = pausa · analógico direito (cima/baixo) = zoom · clique do analógico esquerdo = som · clique do analógico direito = painel (Melhorias/Loja)
// Janelas: direcional/analógico navega · A confirma · B volta/fecha · Start fecha a pausa
const GP={dz:.5,id:"",dir:null,a:false,prev:[],navT:0,navD:null,lastModal:null,wait:{a:false,b:false,st:false},tLast:0,seen:false,sel:-1,edge:false,panel:false,psel:0};
function gpPad(){
 const l=navigator.getGamepads?navigator.getGamepads():[];
 for(const p of l)if(p&&p.connected&&p.mapping==="standard")return p;
 for(const p of l)if(p&&p.connected)return p;
 return null;
}
function gpKey(code,down=true){   // reaproveita os tratadores de teclado das janelas (nível, baú, cassino, cena final, morte)
 window.dispatchEvent(new KeyboardEvent(down?"keydown":"keyup",{code,key:code,bubbles:true,cancelable:true}));
}
function gpRelease(){   // solta tudo (janela abriu, controle desconectou, aba perdeu o foco)
 if(GP.dir){releaseDir("gp-"+GP.dir);GP.dir=null}
 if(GP.a){holdS=false;GP.a=false}
 shiftOn=false;
}
function gpFocusList(){return[...document.querySelectorAll("#bx button, #bx a[data-d]")].filter(b=>b.offsetParent&&!b.disabled)}
// Seleção própria (não depende do anel de foco do navegador, que some depois de um clique do mouse) e que sobrevive a repintar/confirmar.
function gpPaintSel(){
 const bs=gpFocusList();document.querySelectorAll(".gp-sel").forEach(x=>x.classList.remove("gp-sel"));
 if(!bs.length)return null;
 if(GP.sel<0||GP.sel>=bs.length){const i=bs.findIndex(b=>b.classList.contains("main")||b.classList.contains("go"));GP.sel=i<0?0:i}
 const el=bs[GP.sel];el.classList.add("gp-sel");if(document.activeElement!==el)el.focus({preventScroll:false});return el;
}
function gpNavMenu(d){   // d: -1 / +1 entre os botões visíveis da janela
 const bs=gpFocusList();if(!bs.length)return;
 gpPaintSel();GP.sel=(GP.sel+d+bs.length)%bs.length;gpPaintSel();sfx(560,.04,"sine");
}
function gpConfirmMenu(){const el=gpPaintSel();if(el)el.click()}
function gpModalInput(p,now,up,down,left,right,pa,pb,pst){
 const m=modal,dir=up?-1:down?1:left?-1:right?1:0;
 if(m==="title"){if(pa||pst)startGame();return}
 if(m==="lv"||m==="slot"){   // esquerda/direita escolhem (cartões ou aposta); cima/baixo também no nível
  const k=m==="lv"?(up||left?"ArrowLeft":down||right?"ArrowRight":null):(left?"ArrowLeft":right?"ArrowRight":null);
  if(k&&GP.edge)gpKey(k);
  if(pa)gpKey("Space");
  if(pb&&m==="slot")gpKey("Escape");
  return;
 }
 if(m==="death"||m==="mem"||m==="chest"){if(pa||pb&&m!=="mem")gpKey(pa?"Space":"Escape");return}
 // pausa, quadro de contratos, melhorias e outras janelas com botões
 if(dir&&GP.edge)gpNavMenu(dir);
 if(pa)gpConfirmMenu();
 if(pb||(pst&&m==="pause")){if(m==="pause"||!/^(mem|death|chest|title|lv)$/.test(m))closeModal()}
}
// Painel lateral (Melhorias, Loja, Poder, Menu): clique no analógico direito entra/sai; cima/baixo escolhe, A compra, esquerda/direita ou LB/RB trocam de aba.
function gpPanelList(){return[...document.querySelectorAll("#side .pane.on button")].filter(b=>b.offsetParent)}
function gpPanelPaint(scroll){
 document.querySelectorAll("#side .gp-sel").forEach(x=>x.classList.remove("gp-sel"));
 const bs=gpPanelList();if(!bs.length)return null;
 GP.psel=Math.max(0,Math.min(GP.psel,bs.length-1));
 const el=bs[GP.psel];el.classList.add("gp-sel");if(scroll)el.scrollIntoView({block:"nearest"});return el;
}
function gpPanelOff(){GP.panel=false;$("side").classList.remove("gp-panel");document.querySelectorAll("#side .gp-sel").forEach(x=>x.classList.remove("gp-sel"))}
function gpTab(d){const t=clamp((S.tab||0)+d,0,3);if(t!==(S.tab||0)){setTab(t);GP.psel=0;sfx(500,.04,"sine")}gpPanelPaint(true)}
function gpPanelInput(pa,pb,up,down,left,right,rb,lb){
 if(pb){gpPanelOff();return}
 if(GP.edge&&(up||down)){const n=gpPanelList().length;if(n){GP.psel=(GP.psel+(down?1:-1)+n)%n;sfx(560,.04,"sine");gpPanelPaint(true)}}
 if(lb||(GP.edge&&left))gpTab(-1);
 if(rb||(GP.edge&&right))gpTab(1);
 if(pa){const el=gpPanelPaint(true);if(el)el.click()}
 gpPanelPaint(false);
}
function gpFrame(now){
 requestAnimationFrame(gpFrame);
 const dt=Math.min(.1,(now-(GP.tLast||now))/1000);GP.tLast=now;
 const p=gpPad();
 if(!p){if(GP.seen){GP.seen=false;gpRelease()}return}
 if(!GP.seen){GP.seen=true;GP.id=p.id}
 const B=i=>!!(p.buttons[i]&&p.buttons[i].pressed),ax=i=>p.axes[i]||0;
 const pr=i=>B(i)&&!GP.prev[i];                 // acabou de apertar
 let lx=ax(0),ly=ax(1);const ry=ax(3);
 let dh=0;if(p.mapping!=="standard"&&p.axes.length>9){const h=p.axes[9],T=[[-1,"u"],[-.714,"ur"],[-.428,"r"],[-.142,"dr"],[.143,"d"],[.428,"dl"],[.714,"l"],[1,"ul"]];const m=T.find(x=>Math.abs(x[0]-h)<.1);dh=m?m[1]:""}
 let up=B(12)||dh==="u"||dh==="ur"||dh==="ul"||ly<-GP.dz,down=B(13)||dh==="d"||dh==="dr"||dh==="dl"||ly>GP.dz,left=B(14)||dh==="l"||dh==="dl"||dh==="ul"||lx<-GP.dz,right=B(15)||dh==="r"||dh==="ur"||dh==="dr"||lx>GP.dz;
 if(!B(12)&&!B(13)&&!B(14)&&!B(15)&&(up||down)&&(left||right)){   // analógico na diagonal: vale o eixo mais forte
  if(Math.abs(ly)>=Math.abs(lx)){left=right=false}else{up=down=false}
 }
 if((up||down)&&(left||right)){up=down=false}   // direcional + analógico juntos: horizontal ganha
 const nowD=up?"up":down?"down":left?"left":right?"right":null;
 const pa=pr(0),pb=pr(1),pst=pr(9);
 // borda de navegação com repetição (350 ms até repetir, depois 120 ms)
 GP.edge=false;
 if(nowD!==GP.navD){GP.navD=nowD;GP.navT=now+350;GP.edge=!!nowD}
 else if(nowD&&now>=GP.navT){GP.navT=now+120;GP.edge=true}
 // qualquer entrada libera o áudio (os navegadores só liberam depois de um gesto)
 if(p.buttons.some(b=>b.pressed)||Math.abs(lx)>GP.dz||Math.abs(ly)>GP.dz)musOn=true;
 if(modal){
  if(GP.lastModal!==modal){gpPanelOff();gpRelease();GP.lastModal=modal;GP.sel=-1;GP.wait.a=B(0);GP.wait.b=B(1);GP.wait.st=B(9)}
  // botões que já estavam apertados quando a janela abriu só valem depois de soltos
  if(!B(0))GP.wait.a=false;if(!B(1))GP.wait.b=false;if(!B(9))GP.wait.st=false;
  if(!/^(title|lv|slot|death|mem|chest)$/.test(modal))gpPaintSel();
  gpModalInput(p,now,up,down,left,right,pa&&!GP.wait.a,pb&&!GP.wait.b,pst&&!GP.wait.st);
 }else{
  if(GP.lastModal){GP.lastModal=null;document.querySelectorAll(".gp-sel").forEach(x=>x.classList.remove("gp-sel"));GP.wait.a=B(0);GP.wait.b=B(1);GP.wait.st=B(9)}
  if(!B(0))GP.wait.a=false;if(!B(1))GP.wait.b=false;if(!B(9))GP.wait.st=false;
  if(pr(11)){
   GP.panel=!GP.panel;gpRelease();GP.psel=0;
   if(GP.panel){$("side").classList.add("gp-panel");gpPanelPaint(true);sayInfo(__("Painel: A escolhe, LB/RB troca de aba, B volta"))}else gpPanelOff();
  }
  if(GP.panel){gpPanelInput(pa&&!GP.wait.a,pb&&!GP.wait.b,up,down,left,right,pr(5),pr(4));if(pst&&!GP.wait.st){gpPanelOff();openPause()}}
  else{
   // movimento
   if(nowD!==GP.dir){
    if(GP.dir)releaseDir("gp-"+GP.dir);
    GP.dir=nowD;
    if(nowD){pressDir("gp-"+nowD,nowD);move(held);lastMv=performance.now()}
   }
   // cavar: segurar A
   const dig=B(0)&&!GP.wait.a;
   if(fs){fishHold=dig;if(pb&&!GP.wait.b)fishEnd()}   // pescando: A fisga e segura a barra, B sai
   if(dig&&!GP.a){GP.a=true;holdS=true;clickDig();lastH=performance.now()}
   else if(!dig&&GP.a){GP.a=false;holdS=false}
   shiftOn=B(1)||B(7);
   if(pr(2))boom();
   if(pr(3))dynNext();
   if(pr(4))useSk(0);
   if(pr(5))useSk(1);
   if(pr(6))teleport();
   if(pr(10)){mute=!mute;refresh()}
   if(pst&&!GP.wait.st)openPause();
   if(Math.abs(ry)>.25)setZoom(zoomPreference*Math.exp(-ry*dt*1.4));
  }
 }
 GP.prev=p.buttons.map(b=>b.pressed);
}
addEventListener("gamepadconnected",e=>{sayInfo(__("Controle conectado"));musOn=true});
addEventListener("gamepaddisconnected",()=>{gpRelease();sayInfo(__("Controle desconectado"))});
addEventListener("blur",gpRelease);
requestAnimationFrame(gpFrame);

// ===== 5-desenho/00-pixel.js — Direção de arte: sprites em pixel art, tiles de apoio (cavidade, rocha-base, pedra dura, veio de minério) =====
// Regras do estilo (as mesmas dos blocos): grade de pixels grossos, nada de degradê liso; luz clara em cima/à esquerda,
// sombra embaixo/à direita; cores com o mesmo matiz e pequenas variações; detalhes de 1 pixel (brilhos e grãos).
const sprCache={};
const pu=()=>Math.max(.75,Math.round(baseTile()/12)*worldZoom); // escala contínua do pixel do sprite durante o zoom; evita estruturas pulsarem de tamanho
// Cria um sprite w x h a partir de retângulos (R) e uma paleta {letra:cor}. ol: contorno escuro suave em volta.
function mkSpr(key,w,h,pal,fn,ol){
 if(sprCache[key])return sprCache[key];
 const g=Array.from({length:h},()=>Array(w).fill("."));
 fn((x,y,ww,hh,c)=>{for(let j=y;j<y+hh;j++)for(let i=x;i<x+ww;i++)if(i>=0&&i<w&&j>=0&&j<h)g[j][i]=c});
 const cv=document.createElement("canvas");cv.width=w+2;cv.height=h+2;const q=cv.getContext("2d");
 if(ol){q.fillStyle="rgba(24,14,8,.62)";for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(g[j][i]!=="."){for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=i+a,y=j+b;if(x<0||y<0||x>=w||y>=h||g[y][x]===".")q.fillRect(x+1,y+1,1,1)}}}
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const c=g[j][i];if(c!=="."){q.fillStyle=pal[c];q.fillRect(i+1,j+1,1,1)}}
 return sprCache[key]={cv,w,h};
}
// Desenha o sprite com o centro em cx e a base em "bottom" (sem suavização: pixels nítidos).
function drawSpr(s,cx,bottom,u,flip){
 ctx.imageSmoothingEnabled=false;
 const x=Math.round(cx-s.w*u/2)-u,y=Math.round(bottom-s.h*u)-u;
 ctx.drawImage(s.cv,x,y,(s.w+2)*u,(s.h+2)*u);
}
function pxShadow(cx,w,y,u){ctx.fillStyle="rgba(0,0,0,.28)";ctx.fillRect(Math.round(cx-w/2),Math.round(y-u*.4),Math.round(w),Math.max(2,Math.round(u*.9)))}
// Texto flutuante sobre as estruturas: mesma fonte pixel e contorno escuro dos textos de combo.
function lbl(s,x,y,col){ctx.font="700 12px "+FONT;ctx.textAlign="center";ctx.lineWidth=4;ctx.lineJoin="round";ctx.strokeStyle="rgba(10,8,6,.85)";ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y)}
const WOOD={W:"#b27a3a",w:"#7a4f27",d:"#4a2f16",k:"#241609"},METAL={M:"#d5dae1",m:"#8d9299",n:"#5d6168",N:"#2f3238"};

// ---------- Estruturas da superfície ----------
function sprBench(){return mkSpr("bench",18,12,Object.assign({b:"#8a5a2b",H:"#aab0b8"},WOOD,METAL),R=>{
 R(0,4,18,1,"W");R(0,5,18,1,"w");R(0,6,18,1,"d");                           // tampo: luz em cima, sombra embaixo
 R(1,7,3,5,"w");R(1,7,1,5,"d");R(14,7,3,5,"w");R(16,7,1,5,"d");R(4,9,10,1,"d");   // pernas e travessa
 R(1,0,9,1,"M");R(0,1,2,1,"m");R(2,1,8,1,"m");R(4,2,4,1,"n");R(3,3,6,1,"N");    // bigorna
 R(12,0,5,1,"H");R(12,1,5,1,"n");R(14,2,1,2,"b");                          // martelo
 R(10,3,1,1,"M");R(11,3,1,1,"m");                                          // faíscas de metal no tampo
},1)}
function sprShop(){return mkSpr("cart",22,19,Object.assign({r:"#c8452f",R:"#e8664d",e:"#8f2e20",f:"#f2efe6",H:"#ffffff",F:"#c9c3ae",X:"#d23a2a",x:"#8f2418",y:"#ffd45c",C:"#ff9a3a",c:"#d96f1c",g:"#4ddf8a",q:"#6ff0ff",Q:"#2fb8cc",S:"#c9a27a",s:"#a07e58",b:"#8a5a2b"},WOOD),R=>{
 // carrocinha parada de vendedor itinerante: toldo listrado, balcão de tábuas, uma roda grande e a haste de puxar apoiada no chão
 R(3,4,16,5,"k");R(2,4,1,6,"w");R(2,4,1,6,"d");R(19,4,1,6,"w");R(19,4,1,6,"d");
 for(let i=1;i<21;i++){const a=Math.floor(i/2)%2===0;R(i,0,1,1,a?"R":"H");R(i,1,1,1,a?"r":"f");R(i,2,1,1,a?"e":"F");if(i%4<3)R(i,3,1,1,a?"e":"F")}   // toldo
 R(4,6,2,2,"X");R(4,7,2,1,"x");R(5,5,1,1,"y");                              // dinamite
 R(8,6,2,2,"C");R(9,7,1,1,"c");R(8,5,2,1,"g");                              // cenoura
 R(12,6,3,1,"S");R(13,7,1,1,"f");R(12,6,1,1,"s");                          // cogumelo
 R(17,6,2,2,"q");R(17,7,2,1,"Q");R(17,5,1,1,"f");                           // poção
 R(1,9,20,1,"W");R(1,10,20,4,"w");R(1,14,20,1,"d");R(5,10,1,4,"d");R(16,10,1,4,"d");R(1,9,1,6,"d");R(20,9,1,6,"d");   // balcão
 R(8,12,7,1,"k");R(7,13,9,5,"k");R(8,18,7,1,"k");R(9,13,5,5,"W");R(8,14,7,3,"W");R(11,13,1,5,"d");R(8,15,7,1,"d");R(11,15,1,1,"y");   // roda com raios e cubo
 R(0,12,5,1,"w");R(0,12,5,1,"d");R(0,13,1,6,"d");                                                                                     // haste e pé de apoio
},1)}
function sprChest(open){return mkSpr("chest"+(open?1:0),11,open?8:5,Object.assign({y:"#ffd45c",Y:"#fff3a0",G:"#d6a02a"},WOOD,METAL),R=>{
 const y0=open?3:0;
 R(0,y0,11,5,"w");R(0,y0+4,11,1,"d");R(0,y0,11,1,"W");                      // corpo com luz em cima
 R(2,y0,1,5,"n");R(8,y0,1,5,"n");R(4,y0+1,3,3,"m");R(5,y0+2,1,1,"N");        // cintas de ferro e fechadura
 if(open){R(1,0,9,3,"w");R(1,0,9,1,"W");R(1,2,9,1,"d");R(2,0,1,3,"n");R(8,0,1,3,"n");   // tampa levantada
  R(1,3,9,2,"G");R(2,3,7,1,"y");R(3,3,2,1,"Y");R(6,4,2,1,"Y")}              // moedas aparecendo
 else{R(1,0,9,1,"W");R(0,1,11,1,"w");R(0,2,11,1,"d")}
},1)}
// Baú do subsolo (o visual depende da raridade, ver CHPAL): versão inteira para o bloco e as duas metades (corpo e tampa) usadas na animação de abertura.
// Um visual de baú por raridade (a mesma da tabela BAL.chest.tiers): madeira, ferro, ouro, roxo e obsidiana. W/w/d/k = corpo (claro a escuro), M/n/N = cintas, y/Y = fecho.
const CHPAL=[
 Object.assign({y:"#ffd45c",Y:"#fff3a0",G:"#d6a02a"},WOOD,METAL),
 Object.assign({},WOOD,METAL,{W:"#b4bbc6",w:"#737b87",d:"#474d57",k:"#2a2e35",M:"#9aa0a8",n:"#30343b",N:"#15171b",y:"#e8ecf2",Y:"#ffffff",G:"#9aa0a8"}),
 Object.assign({},WOOD,METAL,{W:"#ffe680",w:"#e0aa24",d:"#9a6a10",k:"#5e3f08",M:"#fff6b8",n:"#a8741a",N:"#5e3f08",y:"#4aa8ff",Y:"#c4e6ff",G:"#2a6fc0"}),
 Object.assign({},WOOD,METAL,{W:"#c47aff",w:"#8a3ad0",d:"#52208a",k:"#2c0e50",M:"#ecd2ff",n:"#6a46a0",N:"#2c1850",y:"#ffd45c",Y:"#fff3a0",G:"#d6a02a"}),
 Object.assign({},WOOD,METAL,{W:"#3a3544",w:"#241f2e",d:"#15111c",k:"#0a080e",M:"#ffe08a",n:"#e0902a",N:"#8a4a10",y:"#ff7a2a",Y:"#ffe08a",G:"#ffb02e"})];
function sprChestBlk(ti=0){return mkSpr("chblk"+ti,12,10,CHPAL[ti],R=>{
 R(1,0,10,1,"W");R(0,1,12,1,"W");R(0,2,12,2,"w");R(0,4,12,1,"k");R(0,5,12,5,"w");R(0,5,12,1,"W");R(0,7,12,1,"d");R(0,9,12,1,"d");
 R(2,0,1,10,"n");R(9,0,1,10,"n");R(2,1,1,1,"M");R(9,1,1,1,"M");R(2,6,1,1,"M");R(9,6,1,1,"M");R(5,3,2,3,"y");R(5,3,2,1,"Y");R(6,4,1,1,"N")},1)}
function sprChBody(ti=0){return mkSpr("chbody"+ti,12,6,CHPAL[ti],R=>{
 R(0,0,12,6,"w");R(0,0,12,1,"k");R(0,1,12,1,"W");R(0,3,12,1,"d");R(0,5,12,1,"d");
 R(2,0,1,6,"n");R(9,0,1,6,"n");R(2,2,1,1,"M");R(9,2,1,1,"M");R(5,1,2,3,"y");R(5,1,2,1,"Y");R(6,2,1,1,"N")},1)}
function sprChLid(under,ti=0){return mkSpr("chlid"+ti+(under?1:0),12,4,CHPAL[ti],R=>{
 if(under){R(0,0,12,4,"d");R(1,0,10,3,"k");R(2,0,1,4,"n");R(9,0,1,4,"n");R(0,3,12,1,"w")}
 else{R(1,0,10,1,"W");R(0,1,12,1,"W");R(0,2,12,2,"w");R(0,3,12,1,"d");R(2,0,1,4,"n");R(9,0,1,4,"n");R(2,1,1,1,"M");R(9,1,1,1,"M")}},1)}
function sprFurnace(){return mkSpr("furnace",16,15,Object.assign({B:"#8a7868",L:"#a99886",b:"#66574b",k:"#1c120c"},METAL),R=>{
 R(9,0,7,1,"L");R(10,1,5,5,"B");R(10,1,1,5,"L");R(14,1,1,5,"b");R(10,3,5,1,"b");                                   // chaminé
 R(0,6,16,9,"B");R(0,6,16,1,"L");R(0,14,16,1,"b");R(0,7,1,7,"L");R(15,7,1,7,"b");                                  // corpo de tijolos: luz em cima/esquerda
 R(1,9,14,1,"b");R(1,12,14,1,"b");R(4,7,1,2,"b");R(9,7,1,2,"b");R(13,7,1,2,"b");R(2,10,1,2,"b");R(7,10,1,2,"b");R(12,10,1,2,"b");   // argamassa
 R(4,9,8,5,"k");R(5,8,6,1,"k");R(3,9,1,5,"n");R(12,9,1,5,"n");R(4,8,1,1,"n");R(11,8,1,1,"n");R(5,7,6,1,"n");R(4,13,8,1,"N");   // boca com arco e grade
},1)}
function sprPillar(){return mkSpr("post",5,11,WOOD,R=>{   // poste de madeira fino: capitel pequeno, fuste de 3 px com veios e pregos, base de tábua
 R(0,0,5,1,"W");R(0,1,5,1,"w");                        // capitel (luz em cima)
 R(1,2,3,8,"w");R(1,2,1,8,"W");R(3,2,1,8,"d");         // fuste: luz à esquerda, sombra à direita
 R(2,4,1,1,"d");R(2,6,1,2,"W");R(2,9,1,1,"d");         // veios da madeira
 R(2,3,1,1,"k");R(2,8,1,1,"k");                         // pregos
 R(0,10,5,1,"d")},1)}

// ---------- Tiles de apoio (mesma grade 4x4 de sub-blocos dos blocos) ----------
const pixTiles={};
const rngOf=sd=>()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;
function tileCv(key,tb,paint){const k=key+":"+tb;if(pixTiles[k])return pixTiles[k];const cv=document.createElement("canvas");cv.width=cv.height=tb;paint(cv.getContext("2d"),Math.floor(tb/4));return pixTiles[k]=cv}
// Pedra dura: placas de aço azulado com chanfro, parafusos nos cantos e reforço em cruz (só a dinamite quebra).
function veinTile(tb,vi){return tileCv("v"+vi,tb,(g,m)=>{
 const rnd=rngOf(vi*7717+101),ri=n=>Math.floor(rnd()*n);
 g.fillStyle="#1f2430";g.fillRect(0,0,tb,tb);
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){const px=i*m,py=j*m;
  g.fillStyle="hsl("+(216+ri(8))+","+(18+ri(8))+"%,"+(21+ri(7))+"%)";g.fillRect(px,py,m,m);
  if(rnd()<.4){g.fillStyle="rgba(255,255,255,.2)";g.fillRect(px+2+ri(Math.max(1,m-6)),py+2+ri(Math.max(1,m-6)),1+ri(3),1)}}
 g.fillStyle="rgba(130,150,190,.2)";g.fillRect(0,Math.floor(tb/2)-1,tb,2);g.fillRect(Math.floor(tb/2)-1,0,2,tb);
 for(const[a,b]of[[3,3],[tb-6,3],[3,tb-6],[tb-6,tb-6]]){g.fillStyle="#4a556b";g.fillRect(a,b+1,3,2);g.fillStyle="#9fb0cc";g.fillRect(a,b,3,2);g.fillStyle="#e4ecf8";g.fillRect(a,b,1,1)}
 g.fillStyle="rgba(0,0,0,.35)";g.fillRect(0,tb-2,tb,2);g.fillRect(tb-2,0,2,tb);g.fillStyle="rgba(255,255,255,.2)";g.fillRect(0,0,tb,1);g.fillRect(0,0,1,tb)})}
// Veio de minério: por cima do bloco da camada, uma bolsa escura cheia de cristais do minério (cor em ORES), com brilho e contorno.
function shadeCol(hex,f){const c=[1,3,5].map(i=>parseInt(hex.substr(i,2),16));return"rgb("+c.map(v=>Math.round(f>0?v+(255-v)*f:v*(1+f)))+")"}
function richTile(k,tb,vi){return tileCv("r"+k+"_"+vi,tb,(g,m)=>{
 const col=ORES[k][2],rnd=rngOf(k*5081+vi*2713+17),ri=n=>Math.floor(rnd()*n);
 g.fillStyle="rgba(6,6,12,.5)";g.fillRect(2,3,tb-4,tb-6);g.fillRect(3,2,tb-6,tb-4);               // bolsa escura (cantos cortados)
 const gem=(x,y,s)=>{g.fillStyle="#0b0b12";g.fillRect(x-1,y-1,s+2,s+2);g.fillStyle=shadeCol(col,-.45);g.fillRect(x,y,s,s);g.fillStyle=col;g.fillRect(x,y,s-1,s-1);
  g.fillStyle=shadeCol(col,.65);g.fillRect(x,y,Math.max(1,s>>1),1);g.fillRect(x,y,1,Math.max(1,s>>1))};
 const pos=[[.16,.18],[.55,.12],[.34,.5],[.7,.46],[.14,.72],[.52,.76],[.78,.76]];
 for(const[a,b]of pos){const s=Math.max(4,Math.round(m*(.55+rnd()*.5)));gem(Math.round(a*tb+ri(3)),Math.round(b*tb+ri(3)),s)}
 g.fillStyle="#ffffff";for(let i=0;i<3;i++)g.fillRect(3+ri(tb-7),3+ri(tb-7),1,1);                  // grãos de brilho
 g.fillStyle="rgba(255,255,255,.2)";g.fillRect(0,0,tb,1);g.fillRect(0,0,1,tb);g.fillStyle="rgba(0,0,0,.3)";g.fillRect(0,tb-1,tb,1);g.fillRect(tb-1,0,1,tb)})}
// Rocha-base (fora do mundo e no fundo): quase preta, com os mesmos sub-blocos e fissuras fracas.
function bedTile(tb,vi){return tileCv("b"+vi,tb,(g,m)=>{
 const rnd=rngOf(vi*3331+7),ri=n=>Math.floor(rnd()*n);
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){const px=i*m,py=j*m;
  g.fillStyle="hsl("+(232+ri(10))+","+(10+ri(6))+"%,"+(4+ri(4))+"%)";g.fillRect(px,py,m,m);
  if(rnd()<.35){g.fillStyle="rgba(120,130,170,.12)";g.fillRect(px+2+ri(Math.max(1,m-6)),py+2+ri(Math.max(1,m-5)),1+ri(3),1)}}})}
// Cavidade escavada: parede de fundo da camada, bem mais escura que o bloco (mesmo matiz e grade), para o túnel ler como "buraco".
function caveTile(L,vi,tb){return tileCv("c"+L+"_"+vi,tb,(g,m)=>{
 const B=BIO[L],rnd=rngOf(L*6101+vi*9973+29),ri=n=>Math.floor(rnd()*n);
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){const px=i*m,py=j*m;
  g.fillStyle="hsl("+B[1]+","+Math.round(B[2]*.55)+"%,"+(7+rnd()*4.5+B[3]*.12)+"%)";g.fillRect(px,py,m,m);
  if(rnd()<.3){g.fillStyle="rgba(255,255,255,.05)";g.fillRect(px+2+ri(Math.max(1,m-5)),py+2+ri(Math.max(1,m-5)),1+ri(2),1)}}})}
function drawCave(x,y,ts,tb,c,r){ctx.imageSmoothingEnabled=false;ctx.drawImage(caveTile(layerOf(r),Math.floor(hash(c*5+3,r*3+1)*4),tb),x,y,tb*ts+1,tb*ts+1)}

function pixDisc(cx,cy,r,ps,col){ctx.fillStyle=col;for(let j=-r;j<=r;j++){const w=Math.floor(Math.sqrt(r*r-j*j+.5));ctx.fillRect(cx-w*ps,cy+j*ps,(2*w+1)*ps,ps)}}
// Nuvens: três formas em pixel art (luz branca em cima, azul-claro no meio, sombra azulada embaixo).
const CLOUD_PAL={h:"#ffffff",w:"#f1f8ff",s:"#d3e6f7",u:"#aecbe6"};
function sprCloud(i){
 if(i===0)return mkSpr("cl0",16,6,CLOUD_PAL,R=>{R(5,0,4,1,"h");R(10,0,3,1,"h");R(2,1,11,1,"h");R(0,2,16,2,"w");R(1,4,14,1,"s");R(3,5,10,1,"u")});
 if(i===1)return mkSpr("cl1",11,5,CLOUD_PAL,R=>{R(3,0,4,1,"h");R(1,1,8,1,"h");R(0,2,11,1,"w");R(1,3,9,1,"s");R(3,4,5,1,"u")});
 return mkSpr("cl2",22,6,CLOUD_PAL,R=>{R(6,0,4,1,"h");R(14,0,4,1,"h");R(3,1,16,1,"h");R(1,2,20,2,"w");R(2,4,18,1,"s");R(4,5,14,1,"u")});
}
// Colinas em degraus de pixel com parallax. As colunas são PRESAS À CAMADA (coluna k fica em k*ps, só desliza), pré-renderizadas numa faixa (00b-cache.js): idx = slot da faixa; night escurece as cores
const _hills=[];
function pixHills(idx,sky,par,amp,hexCol,hexHi,seed,ps,night){
 const off=camX*T*par,hmax=Math.max(ps,Math.ceil(amp/ps)*ps),nq=Math.round(night*32)/32;
 const s=stripFor(_hills[idx]||(_hills[idx]=bakeNew()),off,ps,hmax,ps+"|"+hmax+"|"+seed,nq+"|"+hexCol+"|"+hexHi,(k,x)=>{
  const wx=k*ps+seed,v=(Math.sin(wx*.006)*.5+Math.sin(wx*.0145+seed)*.3+Math.sin(wx*.031+1.7)*.2)*.5+.5,h=Math.max(ps,Math.round(v*amp/ps)*ps);
  ctx.fillStyle=nightCol(hexCol,nq);ctx.fillRect(x,hmax-h,ps,h);ctx.fillStyle=nightCol(hexHi,nq);ctx.fillRect(x,hmax-h,ps,ps)});
 ctx.drawImage(s.cv,Math.round(s.c0*ps-off),Math.round(sky-hmax));
}

// ===== 5-desenho/00b-cache.js — Camadas pré-renderizadas ("bake"): peças que só deslizam com a câmera são desenhadas UMA vez num canvas e depois só copiadas =====
// Cordilheiras, colinas e a parte fixa da forja custavam milhares de fillRect por quadro. Agora cada uma vive num canvas 1x (a pixel art tem coordenadas inteiras, então o
// drawImage sem suavização, ampliado pelo dpr da tela, fica idêntico ao desenho direto) e só é refeita quando a forma muda (tamanho, zoom, semente) ou sai da área já pronta.
// Mudança só de COR (estação do ano, escurecer da noite) pode esperar: no máximo `bakeBudget` camadas por quadro são refeitas por cor, o resto usa a versão anterior por instantes.
let bakeBudget=1;
const bakeNew=()=>({cv:null,gk:"",ck:"",c0:0,c1:0,x0:0,y0:0});
// Desenha fn() no canvas do slot (w x h, coordenadas locais) trocando o ctx global por um instante; todo o código de desenho do jogo usa o ctx global
function bakeOn(slot,w,h,fn){
 w=Math.max(1,Math.ceil(w));h=Math.max(1,Math.ceil(h));
 const c=slot.cv||(slot.cv=document.createElement("canvas"));
 if(c.width!==w||c.height!==h){c.width=w;c.height=h}
 const g=c.getContext("2d");g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.imageSmoothingEnabled=false;
 const o=ctx;ctx=g;
 try{fn()}finally{ctx=o}
}
// Faixa horizontal presa a uma camada com parallax: colunas de largura ps numeradas k (posição no mundo da camada = k*ps), altura hmax (a base fica embaixo).
// paint(k, xLocal) desenha a coluna k com a base em y = hmax. Devolve o slot pronto; desenhe com ctx.drawImage(slot.cv, Math.round(slot.c0*ps-off), Math.round(sky-hmax)).
function stripFor(slot,off,ps,hmax,gk,ck,paint){
 const kA=Math.floor(off/ps)-1,kB=Math.ceil((off+W)/ps)+1;
 const fit=slot.cv&&slot.gk===gk&&kA>=slot.c0&&kB<=slot.c1;
 if(!fit||(slot.ck!==ck&&bakeBudget>0)){
  if(fit)bakeBudget--;
  const m=Math.ceil(W/ps/2),c0=kA-m,c1=kB+m;
  bakeOn(slot,(c1-c0)*ps,hmax,()=>{for(let k=c0;k<c1;k++)paint(k,(k-c0)*ps)});
  slot.gk=gk;slot.ck=ck;slot.c0=c0;slot.c1=c1;
 }
 return slot;
}
// Camada de fundo com câmera PRÓPRIA (o chamador já ajustou T e camX, como faz drawScenery): paint(y0, k) desenha as colunas da camada numa faixa 2x mais larga que a tela
// (W é alargado por um instante, então colX() já cai no lugar certo) e depois só desliza: o deslocamento é a diferença da âncora colX(0) desde que a faixa foi feita.
// id = slot · gk = chave da FORMA (tamanho, zoom, semente...) · ck = chave da COR (noite, inverno) · hc = altura máxima da camada · k = nightCol com a noite em passos de 1/32.
const _bkSlots={},nq32=()=>Math.round(nightAmt()*32)/32;
function bakedCols(id,gk,ck,hc,y0,paint){
 const slot=_bkSlots[id]||(_bkSlots[id]=bakeNew()),m=Math.ceil(W*.5),xr=colX(0);
 gk=W+"|"+H+"|"+T+"|"+hc+"|"+SEED+"|"+gk;
 let dx=slot.cv&&slot.gk===gk?Math.round(xr-slot.x0-m):1;
 const fit=dx<=0&&dx>=-2*m;   // a faixa ainda cobre a tela inteira?
 if(!fit||(slot.ck!==ck&&bakeBudget>0)){
  if(fit)bakeBudget--;
  const W0=W,nq=nq32(),kq=hx=>nightCol(hx,nq);
  slot.x0=xr;
  bakeOn(slot,W0+2*m,hc,()=>{W=W0+2*m;try{paint(hc,kq)}finally{W=W0}});
  slot.gk=gk;slot.ck=ck;dx=-m;
 }
 ctx.drawImage(slot.cv,dx,Math.round(y0-hc));
}

// ===== 5-desenho/01-cores-blocos.js — Cor de cada bloco por camada =====
function blockColor(d,c,v){const B=BIO[layerOf(d)%BIO.length];return"hsl("+B[1]+","+B[2]+"%,"+(B[3]+(v||0)+((c+d)%2?1.5:0))+"%)"}

// ===== 5-desenho/02-ceu-nuvens.js — Céu em degradê, sol e colinas em pixel art (cores da estação do ano), nuvens em duas camadas com parallax (sprites em 00-pixel.js) =====
// Cada nuvem: [posição inicial 0-1, altura 0-1, tamanho, velocidade, camada (0 = longe, 1 = perto), fase]
const CLOUDS=[[.05,.55,34,5,0,0],[.32,.3,40,6,0,1.3],[.6,.62,30,4.5,0,2.1],[.85,.25,38,5.5,0,3.4],[.15,.2,62,11,1,.7],[.5,.5,78,14,1,2.7],[.8,.15,56,12,1,4.1],[.98,.58,66,10,1,5.2]];
// As camadas do céu (estrelas, aurora, sol/lua, estrela cadente, nuvens) são desenhadas como se o céu tivesse sempre a altura skyH() e presas ao horizonte (translate):
// ao subir com o jato elas rolam junto com o chão, sem esticar nem se espalhar. Subindo, sobra uma faixa vazia no alto: tile = repete a camada para cima, só dentro dela.
function skyLayers(sky,fn,tile){
 const sh=skyH(),off=Math.round(sky-sh);
 ctx.save();ctx.translate(0,off);fn(sh,0);ctx.restore();
 if(tile&&off>0){
  const step=Math.max(8,Math.round(sh*.62));
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,off);ctx.clip();
  for(let dy=off-step,k=1;dy+sh*.72>0;dy-=step,k++){if(dy>=H)continue;ctx.save();ctx.translate(0,dy);fn(sh,k);ctx.restore()}   // faixas abaixo da tela não precisam ser desenhadas (no alto o horizonte fica bem abaixo)
  ctx.restore();
 }
}
// Nuvens das faixas de cima (k>=1, quando se sobe muito): igualmente espaçadas, em fileiras alternadas (padrão simétrico, sem colunas repetidas), todas na mesma velocidade para o espaçamento nunca se desfazer
function cloudBand(i,k,n){return{p:(i+.25+.5*(k&1))/n,hh:.12+.4*((i+k)&1),v:6+(k%3)*3,par:.12}}
function skyClouds(sh,t,scale,night,k){
 const span=W+240*scale;let n=0,i=0;
 for(const[p0,hh0,s,v0,ly,ph]of CLOUDS){
  const bd=k>0?cloudBand(i++,k,CLOUDS.length):null,p=bd?bd.p:p0,hh=bd?bd.hh:hh0,v=bd?bd.v:v0;
  const size=s*scale*(W<500?.8:1),par=bd?bd.par:(ly?.18:.07),px=Math.max(2,Math.round(size/13)),sp=sprCloud(n++%3);
  const x=((p*span+t*v*scale-camX*T*par)%span+span)%span-120*scale,y=sh*(.12+hh*.6)+Math.sin(t*.25+ph)*3;
  ctx.globalAlpha=(ly?1:.62)*(1-night*.55);
  ctx.drawImage(sp.cv,1,1,sp.w,sp.h,Math.round(x/px)*px,Math.round(y/px)*px,sp.w*px,sp.h*px);
 }
 ctx.globalAlpha=1;
}
function drawSky(sky,t){
 if(sky<=0)return;
 ctx.imageSmoothingEnabled=false;
 const sg=ctx.createLinearGradient(0,sky-skyH(),0,sky);   // topo azul-vivo -> horizonte azul-claro (um degradê só, sem emendas)
 sg.addColorStop(0,"rgb(63,143,224)");sg.addColorStop(.65,"rgb(140,200,242)");sg.addColorStop(1,"rgb(207,233,250)");
 ctx.fillStyle=sg;ctx.fillRect(0,0,W,sky+1);
 if(sky<42)return;
 const scale=clamp(W/850,.5,1.1),ps=Math.max(3,Math.round(4*scale)),night=nightAmt();
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,sky);ctx.clip();
 altSpace(sky);   // altitude: o céu escurece de azul-profundo a índigo, quase o espaço no teto do jato (17-altitude.js)
 skyTint(sky);
 skyLayers(sky,sh=>skyStars(sh,t,ps),true);
 altStars(sky,t,ps);   // estrelas fracas de dia, só onde o céu já está escuro
 // aurora e sol/lua: uma só, presas ao horizonte (sem repetir); ao subir andam na metade da velocidade do chão (ficam longe, sempre à vista)
 skyLayers(sky,sh=>{ctx.translate(0,-Math.max(0,sky-sh)*.5);skyAurora(sh,t,ps)},false);
 skyLayers(sky,sh=>{ctx.translate(0,-Math.max(0,sky-sh)*.5);skyBody(sh,ps);skyShoot(sh,ps)},false);
 skyLayers(sky,(sh,k)=>skyClouds(sh,t,scale,night,k),false);   // nuvens fofas só na faixa de baixo (não repetem mais para cima)
 altClouds(sky,t,scale,night,ps);   // cirros e fiapos mais acima
 skyLife(sky,t,scale,night,ps);   // pássaros, pipa, avião de papel e balão
 sceneRanges(sky,ps,night);   // cordilheiras ao fundo, em 3 camadas (5-desenho/11-cenario.js)
 // colinas distantes (azul-acinzentado) e próximas (verde escuro), em degraus de pixel, com parallax (altura fixa: não crescem quando se sobe)
 pixHills(0,sky,.03,skyH()*.2,SEA.fh,SEA.fhh,40,ps,night);   // as colinas escurecem de noite pela própria cor
 pixHills(1,sky,.08,skyH()*.11,SEA.nh,SEA.nhh,300,ps,night);   // as cores das colinas e da grama vêm da estação do ano (2-sistemas/07-estacoes.js)
 weatherSky(sky,scale,night);   // clima: nuvens extras, véu escuro, neblina e clarão do raio (5-desenho/10-clima.js)
 ctx.restore();
}

// ===== 5-desenho/03-mundo.js — Blocos, grama, pedra dura, mesa, loja, portão de pedra do buraco, baú e personagem (sprites em 00-pixel.js) =====
function layerBackdrops(r0,r1){
 const first=Math.floor(r0/LAYER_HEIGHT),last=Math.floor(r1/LAYER_HEIGHT);
 for(let L=first;L<=last;L++){const B=BIO[Math.min(L,BIO.length-1)],top=Math.max(0,rowY(L*LAYER_HEIGHT)),bottom=Math.min(H,rowY((L+1)*LAYER_HEIGHT));if(bottom<=top)continue;ctx.fillStyle="hsl("+B[1]+",38%,7%)";ctx.fillRect(0,top,W,bottom-top)}
}
function drawBedrock(x,y,ts,tb,c,r){ctx.imageSmoothingEnabled=false;ctx.drawImage(bedTile(tb,Math.floor(hash(c*9+5,r*7+3)*4)),x,y,tb*ts+1,tb*ts+1)}
// Cada bloco grande é desenhado como uma grade 4x4 de blocos menores (só visual: o bloco continua se quebrando inteiro).
// O desenho é feito uma vez por (camada, variação) numa imagem em cache; textura por camada e pontinhos dos minérios que aparecem naquela profundidade.
const TILE_VARIANTS=8,TEX=[0,0,0,1,1,2,2,3,3,3,4,4,5,6,7],tileCache={};
function solidTile(L,vi,tb){
 const key=tb+":"+L+":"+vi,hit=tileCache[key];if(hit)return hit;
 const cvs=document.createElement("canvas");cvs.width=cvs.height=tb;const g=cvs.getContext("2d");
 let sd=(L*7919+vi*104729+13)>>>0;const rnd=()=>{sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd/4294967296},ri=n=>Math.floor(rnd()*n);
 const B=BIO[L],N=4,m=Math.floor(tb/N),tx=TEX[L]||0;
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){
  const px=i*m,py=j*m;
  g.fillStyle="hsl("+B[1]+","+(B[2]+(rnd()-.5)*8)+"%,"+(B[3]+(rnd()-.5)*7)+"%)";g.fillRect(px,py,m,m);
  if(tx===0){for(let k=0;k<2;k++)if(rnd()<.55){g.fillStyle=rnd()<.5?"rgba(0,0,0,.2)":"rgba(255,255,255,.14)";g.fillRect(px+1+ri(m-4),py+1+ri(m-4),2,1+ri(2))}}                      // terra: grãos e pedrinhas
  else if(tx===1){if(rnd()<.6){g.fillStyle="rgba(0,0,0,.14)";g.fillRect(px+1,py+2+ri(m-5),m-2,1);g.fillStyle="rgba(255,255,255,.1)";g.fillRect(px+1,py+3+ri(m-5),m-4,1)}}      // camadas sedimentares
  else if(tx===2){if(rnd()<.6){g.fillStyle=B[4];g.globalAlpha=.3;g.fillRect(px+1+ri(m-4),py+1+ri(m-4),3,1);g.globalAlpha=1}if(rnd()<.35){g.fillStyle="rgba(255,255,255,.28)";g.fillRect(px+2+ri(m-5),py+2+ri(m-5),1,1)}}   // xisto e carvão: lascas brilhantes
  else if(tx===3){for(let k=0;k<3;k++){g.fillStyle=rnd()<.5?"rgba(0,0,0,.22)":"rgba(255,255,255,.16)";g.fillRect(px+1+ri(m-2),py+1+ri(m-2),1,1)}}                                     // rochas ígneas: sal e pimenta
  else if(tx===4){if(rnd()<.55){g.fillStyle=rnd()<.5?"rgba(255,255,255,.22)":"rgba(0,0,0,.1)";g.fillRect(px+1+ri(m-5),py+1+ri(m-5),3+ri(2),2+ri(2))}}                           // quartzito e mármore: manchas claras
  else if(tx===5){if(rnd()<.5){g.fillStyle="#ffb43a";g.globalAlpha=.8;g.fillRect(px+1+ri(m-3),py+1+ri(m-3),2,2);g.globalAlpha=1}if(rnd()<.3){g.fillStyle="rgba(0,0,0,.3)";g.fillRect(px+ri(m-3),py+ri(m-3),3,2)}}   // magma: brasas
  else if(tx===6){if(rnd()<.55){const ox=px+2+ri(m-6),oy=py+2+ri(m-6);g.fillStyle="rgba(255,255,255,.3)";g.fillRect(ox+1,oy,1,1);g.fillRect(ox,oy+1,3,1);g.fillRect(ox+1,oy+2,1,1)}}                // cristais: pontinhos de brilho
  else{if(rnd()<.6){g.fillStyle="rgba(255,255,255,.18)";g.fillRect(px+1+ri(m-4),py+1+ri(m-4),1,3)}}                                                                                  // vidro vulcânico: reflexos
 }
 // minérios que existem nesta profundidade aparecem como pontinhos de cor (só decoração: o minério de verdade sai ao quebrar)
 const pool=ORES.filter(o=>o[3]<=L*LAYER_HEIGHT+LAYER_HEIGHT-1).slice(-3);
 for(let k=0,n=rnd()<.7?1+ri(2):0;k<n;k++){
  const o=pool[ri(pool.length)],ox=ri(N)*m+2+ri(Math.max(1,m-6)),oy=ri(N)*m+2+ri(Math.max(1,m-6));
  g.fillStyle="rgba(0,0,0,.35)";g.fillRect(ox,oy+2,3,1);
  g.fillStyle=o[2];g.fillRect(ox,oy,3,2);g.fillRect(ox+1,oy+2,1,1);
  g.fillStyle="rgba(255,255,255,.65)";g.fillRect(ox,oy,1,1);
 }
 tileCache[key]=cvs;return cvs;
}
function drawSolid(x,y,ts,tb,c,r){
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(solidTile(layerOf(r),Math.floor(hash(c*3+1,r*5+2)*TILE_VARIANTS),tb),x,y,tb*ts+1,tb*ts+1);
 // Bloco comum (a maioria): só o tile. O save/translate/scale/restore abaixo só vale a pena quando há algo extra para desenhar por cima
 const lv=lava(c,r),band=r>0&&r%LAYER_HEIGHT===0,vein=isVein(c,r);let rk=-1,chest=0;if(!vein){rk=oreVeinAt(c,r);if(rk<0)chest=chestAt(c,r)}
 if(r!==0&&!lv&&!band&&!vein&&rk<0&&!chest)return;
 ctx.save();ctx.translate(x,y);ctx.scale(ts,ts);
 if(r===0){ // primeira linha: inquebrável (grama por cima e pedras cinzentas por dentro)
  ctx.fillStyle="rgba(20,20,26,.35)";ctx.fillRect(0,0,tb+1,tb+1);ctx.fillStyle="#6a6e74";ctx.fillRect(3,tb-9,8,5);ctx.fillRect(tb-14,tb-14,9,6);
  ctx.fillStyle=SEA.g;ctx.fillRect(0,0,tb+1,5);ctx.fillStyle=SEA.h;ctx.fillRect(0,0,tb+1,2);
  for(let g=0;g<6;g++){const gx=hash(c+g*7,515)*(tb-2)+1,gh=2+hash(g,c+733)*3;ctx.fillRect(gx,-gh,2,gh+2)}
 }
 if(lv){ctx.fillStyle="#ff5a1f";ctx.fillRect(0,0,tb+1,tb+1);ctx.globalAlpha=.16;ctx.fillRect(-tb/2,-tb/2,tb*2,tb*2);ctx.globalAlpha=1}
 if(band){ctx.fillStyle="rgba(255,255,255,.1)";ctx.fillRect(0,0,tb+1,2)}
 if(vein)drawVein(tb,c,r);
 else if(rk>=0)drawRich(tb,c,r,rk);else if(chest)drawChestBlock(tb,c,r);
 ctx.restore();
}
// Pedra dura: placas de aço azulado com chanfro e parafusos (tile em cache, ver 00-pixel.js). Só a dinamite quebra.
// Veio de minério: tile de cristais + brilhos piscando (poucos blocos por quadro, então o custo é baixo)
function drawRich(tb,c,r,rk){
 ctx.drawImage(richTile(rk,tb,Math.floor(hash(c*19+5,r*23+3)*3)),0,0,tb+1,tb+1);
 const t=performance.now()/1000,ph=hash(c,r)*6.28;
 for(let i=0;i<2;i++){const a=Math.sin(t*2.6+ph+i*2.4);if(a<.2)continue;const sx=3+hash(c+i*9,r+31)*(tb-9),sy=3+hash(c+7,r+i*13)*(tb-9);
  ctx.globalAlpha=a;ctx.fillStyle="#fff";ctx.fillRect(sx,sy,2,2);ctx.fillRect(sx-2,sy,6,1);ctx.fillRect(sx,sy-2,1,6)}
 ctx.globalAlpha=1;
}
// Baú no lugar de um bloco: o visual mostra a raridade (madeira, ferro, ouro, roxo, obsidiana). Brilho discreto na cor da raridade para dar para achar no escuro.
function drawChestBlock(tb,c,r){
 const ti=chestAt(c,r)-1,t=performance.now()/1000,ph=hash(c,r)*6.28,sp=sprChestBlk(ti),cw=tb*.9,ch=cw*(sp.h+2)/(sp.w+2);
 ctx.imageSmoothingEnabled=false;ctx.drawImage(sp.cv,(tb-cw)/2,tb-ch-tb*.03,cw,ch);
 const a=Math.sin(t*3+ph);if(a>.3){ctx.globalAlpha=a;ctx.fillStyle=ti>0?BAL.chest.tiers[ti].c:"#fff";const sx=tb*.2+hash(c+Math.floor(t*.7),r)*tb*.55,sy=tb*.2+hash(c,r+Math.floor(t*.7))*tb*.3;ctx.fillRect(sx,sy,2,2);ctx.fillRect(sx-2,sy,6,1);ctx.fillRect(sx,sy-2,1,6);ctx.globalAlpha=1}
}
function drawVein(tb,c,r){ctx.drawImage(veinTile(tb,Math.floor(hash(c*13+1,r*17+9)*4)),0,0,tb+1,tb+1)}
function drawBench(t){
 const u=pu(),s=sprBench(),c=Math.round(colX(BENCH_C)),y=Math.round(rowY(0));
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);
 if(atSurface())lbl(nearBench()?__("Mesa de trabalho: compre aqui"):__("Mesa de trabalho"),c,y-(s.h+3)*u-Math.sin(t*4)*2,nearBench()?"#6fe3a0":"#ffd45c");
}
// Construção ainda não liberada (liberação gradual): aparece desligada e em ruínas, sem chama nem luz: cores apagadas e sujas de fuligem, cantos lascados, buracos, trinca, teia, entulho no chão e uma faísca de curto de vez em quando. O rótulo diz a profundidade que a conserta.
const brokenCache={};
function brokenSpr(s,kind){
 if(brokenCache[kind])return brokenCache[kind];
 const W=s.w+2,H=s.h+2,cv=document.createElement("canvas");cv.width=W;cv.height=H;const q=cv.getContext("2d");
 q.drawImage(s.cv,0,0);
 const im=q.getImageData(0,0,W,H),d=im.data;
 let sd=kind.length*7919+13;const rnd=()=>{sd=(sd*1103515245+12345)&0x7fffffff;return sd/0x7fffffff};
 const ok=(i,j)=>i>=0&&j>=0&&i<W&&j<H&&d[(j*W+i)*4+3]>0;
 const put=(i,j,r,g,b)=>{if(!ok(i,j))return;const k=(j*W+i)*4;d[k]=r;d[k+1]=g;d[k+2]=b};
 for(let j=0;j<H;j++){const br=.42+.2*(j/H);   // mais escuro em cima (fuligem), um pouco mais claro embaixo
  for(let i=0;i<W;i++){const k=(j*W+i)*4;if(!d[k+3])continue;
   const l=d[k]*.3+d[k+1]*.59+d[k+2]*.11,m=(c,t)=>Math.min(255,(l*.72+c*.28)*br*t);
   d[k]=m(d[k],1.04);d[k+1]=m(d[k+1],1);d[k+2]=m(d[k+2],1.1)}}
 for(let n=0;n<14&&n<40;n++){   // cantos lascados: tira 1 a 3 pixels de pontas da borda
  const i=1+Math.floor(rnd()*(W-2)),j=1+Math.floor(rnd()*(H-2));
  if(!ok(i,j)||ok(i-1,j)&&ok(i+1,j)&&ok(i,j-1)&&ok(i,j+1))continue;
  for(const[di,dj]of[[0,0],[1,0],[0,1],[-1,0],[0,-1]])if(rnd()<.55&&ok(i+di,j+dj))d[((j+dj)*W+i+di)*4+3]=0}
 for(let n=0;n<3;n++){   // buracos por dentro (rombo escuro de 1 a 2 pixels)
  const i=2+Math.floor(rnd()*(W-4)),j=2+Math.floor(rnd()*(H-4));
  put(i,j,12,9,8);if(rnd()<.6)put(i+1,j,12,9,8);if(rnd()<.4)put(i,j+1,12,9,8)}
 {let x=Math.floor(W*(.3+rnd()*.4));   // trinca em zigue-zague de cima até quase o chão, com um filete claro ao lado
  for(let j=1;j<H*.75;j++){put(x,j,14,10,8);if(rnd()<.45)put(x+1,j,106,100,94);const r=rnd();x+=r<.3?-1:r<.6?1:0}}
 for(let t=0;t<5;t++){put(1+t,1,176,172,166);put(1,1+t,176,172,166);put(1+t,1+t,150,146,140)}   // teia no canto de cima
 put(3,2,150,146,140);put(2,3,150,146,140);put(4,2,150,146,140);put(2,4,150,146,140);
 q.putImageData(im,0,0);
 return brokenCache[kind]={cv,w:s.w,h:s.h,sx:.35+rnd()*.3};
}
function drawBroken(s,c,y,u,nome,kind){
 const t=performance.now()/1000,bs=brokenSpr(s,kind),x0=Math.round(c-s.w*u/2),y0=Math.round(y-s.h*u),hw=s.w/2;
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(bs,c,y,u);
 for(const[dx,w,col]of[[-hw-2,2,"#5b5650"],[-hw-.5,1,"#3f3b37"],[hw+.5,2,"#6a645d"],[hw+2.5,1,"#3f3b37"],[-hw+2,1,"#4a3a2a"],[hw-2.5,1,"#4a3a2a"],[-1,1,"#5b5650"]]){   // entulho no chão
  ctx.fillStyle=col;ctx.fillRect(Math.round(c+dx*u),Math.round(y-u),Math.round(w*u),Math.round(u))}
 const ph=(t*1.1+kind.length*.7)%5;
 if(ph<.16&&Math.floor(t*30)%2===0){const sx=Math.round(x0+bs.sx*s.w*u),sy=Math.round(y0+s.h*u*.45);   // faísca de curto, rara e curta
  ctx.fillStyle="#fff3a0";ctx.fillRect(sx,sy,u,u);ctx.fillStyle="#ffd45c";ctx.fillRect(sx-u,sy,u,Math.max(1,Math.round(u*.5)));ctx.fillRect(sx+u,sy+u,u,Math.max(1,Math.round(u*.5)));ctx.fillRect(sx,sy-u,Math.max(1,Math.round(u*.5)),u)}
 if(atSurface()){const a=unlockAt("build",kind),by=y-(s.h+3)*u-Math.sin(t*4)*2;   // duas linhas para não encostar nos vizinhos
  lbl(nome,c,by-14,"#9a8f86");lbl(a>0?__("fora de uso · {0} m",a):__("fora de uso"),c,by,"#7d746c")}
}
function drawFurnace(t){
 if(!isUnl("build","furnace")){drawBroken(sprFurnace(),Math.round(colX(FURN_C)),Math.round(rowY(0)),pu(),__("Fornalha"),"furnace");return}
 const u=pu(),s=sprFurnace(),c=Math.round(colX(FURN_C)),y=Math.round(rowY(0)),f=S.fur,act=f.n>0;
 pxShadow(c,(s.w+2)*u,y,u);
 if(act){ctx.save();ctx.fillStyle="#ff9a3a";ctx.globalAlpha=.07+.03*Math.sin(t*9);ctx.fillRect(c-s.w*u,y-s.h*u*1.4,2*s.w*u,s.h*u*1.4);ctx.globalAlpha=.08+.03*Math.sin(t*7+1);ctx.fillRect(c-s.w*u*.6,y-s.h*u,s.w*u*1.2,s.h*u);ctx.restore()}
 drawSpr(s,c,y,u);
 const x0=Math.round(c-s.w*u/2),y0=Math.round(y-s.h*u);
 if(act){   // chamas na boca (3 camadas de cor, alturas que tremem) e fumaça na chaminé
  for(let i=5;i<=10;i++){const h=Math.min(4,1+Math.floor((Math.sin(t*11+i*1.9)+1)*1.4+((i*7)%3)*.5));
   ctx.fillStyle="#ff5a1f";ctx.fillRect(x0+i*u,y0+(13-h)*u,u,h*u);
   ctx.fillStyle="#ff9a3a";ctx.fillRect(x0+i*u,y0+(13-Math.max(1,h-1))*u,u,Math.max(1,h-1)*u);
   if(h>2){ctx.fillStyle="#ffd45c";ctx.fillRect(x0+i*u,y0+(13-h+2)*u,u,(h-2)*u)}}
  for(let k=0;k<3;k++){const ph=(t*.45+k/3)%1,sz=Math.round(u*(1.2+ph*1.8));ctx.globalAlpha=(1-ph)*.55;ctx.fillStyle="#b9b3ad";
   ctx.fillRect(Math.round(x0+12.5*u+Math.sin(t*2+k*2)*u*ph*2-sz/2),Math.round(forgeStackTopY()-ph*u*11-sz),sz,sz)}
  ctx.globalAlpha=1;
 }else{ctx.fillStyle="#7a2e14";ctx.fillRect(x0+6*u,y0+12*u,u,u);ctx.fillRect(x0+9*u,y0+12*u,u,u)}   // brasas
 if(atSurface())lbl(act?__("Fornalha · {0} minérios · {1}",f.n,fmtT(furEta())):nearFurnace()?__("Fornalha: clique para refinar"):__("Fornalha"),c,y-(s.h+3)*u-Math.sin(t*4)*2,act?"#ff9a3a":nearFurnace()?"#6fe3a0":"#ffd45c");
}
function drawShop(t){
 const u=pu(),s=sprShop(),c=Math.round(colX(SHOP_C)),y=Math.round(rowY(0));
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);drawShopLamp(t);
 if(atSurface())lbl(nearShop()?__("Loja: compre aqui"):__("Loja"),c,y-(s.h+12)*u-Math.sin(t*4)*2,nearShop()?"#6fe3a0":"#ffd45c");
}
function drawGateAndChest(t){
 const u=pu(),x=colX(0)-T/2,y=Math.round(rowY(0)),pl=sprPillar();
 // Lá embaixo (linha 0 muito acima do topo da tela) nada da superfície aparece: só a escada de corda continua descendo pelo poço
 if(y<-T*4){drawRopeLadder(t);return}
 // portão de madeira em volta do buraco: dois postes finos em pixel art e uma viga escura sobre a abertura
 ctx.fillStyle="#2b1a0d";ctx.fillRect(Math.round(x-u),y-Math.round(u*.6),Math.round(T+2*u),Math.round(u*1.4));
 ctx.fillStyle="#8a5a2b";ctx.fillRect(Math.round(x-u),y-Math.round(u*.6),Math.round(T+2*u),Math.max(1,Math.round(u*.4)));
 drawSpr(pl,x-pl.w*u/2+u,y,u);drawSpr(pl,x+T+pl.w*u/2-u,y,u);
 drawLandscape(t);   // horta, moinho, riacho com ponte e roda, fogueira, praia com farol, bichinhos (13-paisagem.js)
 drawRopeLadder(t);
 drawForge(t);   // forja por trás: os nomes das estruturas ficam sempre legíveis por cima dos pilares e da chaminé
 drawVillage(t);
 drawBench(t);
 drawFurnace(t);
 drawShop(t);drawShopkeeper(t);
 // baú: tampa fecha/abre com sprites (aberto = moedas brilhando)
 const c=chestXY(),cx=Math.round(c.x),open=chestOpen>.1,cs=sprChest(open);
 pxShadow(cx,(cs.w+2)*u,y,u);drawSpr(cs,cx,y,u);
 if(atSurface()&&S.bag.n>0)lbl(nearChest()?__("Baú: clique para vender"):__("Baú: entregue a mochila"),cx,y-(cs.h+3)*u-Math.sin(t*4)*2,"#ffd45c");
}
// Voo para os lados: o corpo se inclina para a frente (pose de super-herói) com os braços à frente e as pernas esticadas para trás. plK vai de 0 (em pé) a 1 (deitado no ar), suavizado
let plK=0,plAt=0,plHAt=-9999;
let jetNz={x:0,y:0,t:0};   // bocal da mochila a jato em coordenadas da tela, medido no desenho do jogador (inclui espelho, inclinação e zoom) para as partículas nascerem no lugar certo
let flameL=4;   // comprimento médio da chama da mochila, suavizado (mudar de direção rápido não faz a chama disparar)
// Passos: nuvenzinhas de poeira atrás dos pés (mais e maiores com Shift); com chuva, respingos de poça; com neve, flocos levantados
function stepDust(mx,my,sg,dt){
 const run=shiftOn,wet=wx.rain>.25,snow=wx.snow>.25&&!wet,z=worldZoom,r=Math.random;
 if(r()>dt*(run?46:20))return;
 const back=-sg,n=run&&r()<.5?2:1;
 for(let i=0;i<n;i++){
  const x=mx+back*(5+r()*4)*z,y=my-1*z;
  if(wet)parts.push({x,y,vx:back*(20+r()*50)+(r()-.5)*40,vy:-(60+r()*(run?130:90)),l:.38+r()*.2,c:r()<.4?"#ffffff":"#bfe6ff",s:Math.max(2,Math.round(1.8*z)),a:.9});
  else{
   const c=snow?(r()<.5?"#ffffff":"#dfeaf5"):(r()<.5?"#c9b189":"#a8905f"),l=(run?.55:.4)+r()*.25;
   parts.push({x,y,vx:back*(14+r()*(run?55:30)),vy:-(6+r()*(run?34:20)),g:-14,l,l0:l,c,s:Math.max(2,Math.round((run?2.6:2)*z)),gr:run?.6:.4,a:.55});
  }
 }
}
function drawPlayer(){
 const now=performance.now(),mx=colX(mX),my=rowY(mY),B0=ctx.getTransform();
 const dx=S.mc-mX,dy=S.depth-mY,descending=S.depth!==0&&S.dir==="down"&&(dy>.05||airborne()),flying=!descending&&(jetT>0||dy<-.05||airborne()),falling=descending||(!flying&&dy>.05),walking=!flying&&!falling&&Math.abs(dx)>.05;
 const ph=now/(shiftOn?65:105),sw=Math.sin(ph),idle=Math.sin(now/280);
 const bob=flying?Math.sin(now/60)*1.3:walking?-Math.abs(sw)*3:idle*.9;
 if(flying&&!fs&&(S.dir==="left"||S.dir==="right")&&Math.abs(dx)>.03)plHAt=now;
 const dtK=Math.min(.1,Math.max(0,(now-plAt)/1000));plAt=now;
 if(walking&&!modal&&!fs)stepDust(mx,my,Math.sign(dx),dtK);
 const hf=flying&&!fs&&now-plHAt<240;plK+=((hf?1:0)-plK)*Math.min(1,dtK*(hf?9:7));if(plK<.002)plK=0;
 const k1=plK,glide=k1*(.3+Math.sin(now/130)*.02);   // inclinação leve (~17°) no voo para os lados
 const lean=(fs?0:flying?-.2:walking?.1:falling?-.04:0)*(1-k1)+glide;   // inclinação do corpo (em torno dos pés; no voo lateral, em torno do meio do corpo)
 const squash=1-Math.min(.07,swing*.07);                                    // agacha um pouco no golpe
 const cloth="#3b6fb5",clothD="#2c5590",skin="#e6b48a";
 ctx.save();ctx.translate(mx,my);ctx.scale(worldZoom,worldZoom);ctx.translate(-mx,-my);
 ctx.translate(mx,0);ctx.scale(S.dir==="left"?-1:1,1);ctx.translate(-mx,0);
 {const pv=my-15*k1;ctx.translate(mx,pv);ctx.rotate(lean);ctx.translate(-mx,-pv);ctx.translate(mx,my);ctx.scale(1,squash);ctx.translate(-mx,-my)}
 // perna de trás, braço de trás
 const leg=(hx,a,col)=>{ctx.save();ctx.translate(hx,my-9+bob*.4);ctx.rotate(a);ctx.fillStyle=col;ctx.fillRect(-3,0,6,6);ctx.fillStyle="#1d1d1d";ctx.fillRect(-3,5,8,4);ctx.restore()};
 const la=(flying?.32+Math.sin(now/85)*.12:falling?-.4:walking?sw*.85:idle*.03)+k1*.25, lb=(flying?.14+Math.sin(now/85+1.4)*.12:falling?.4:walking?-sw*.85:0)+k1*.2;
 leg(mx-3,la,"#23252b");
 // mochila a jato (nas costas): tanque, bocal e chama
 ctx.fillStyle="#4a4f58";ctx.fillRect(mx-15,my-25+bob,7,14);ctx.fillStyle="#7d8591";ctx.fillRect(mx-15,my-25+bob,7,3);ctx.fillStyle="#c8452f";ctx.fillRect(mx-14,my-20+bob,5,3);
 ctx.fillStyle="#2b2e34";ctx.fillRect(mx-14,my-11+bob,5,3);
 {const q=B0.inverse().transformPoint(ctx.getTransform().transformPoint(new DOMPoint(mx-11.5,my-8+bob)));jetNz.x=q.x;jetNz.y=q.y;jetNz.t=now}
 if(!descending&&(jetT>0||flying)){const sb=shiftOn&&!fs&&(S.dir==="left"||S.dir==="right"),fl=(flameL+=(Math.min(30,(jetT>0?16:4.25)*(1+.6*k1)*(sb?2.4:1))-flameL)*Math.min(1,dtK*12))*(.6+Math.random()*.8);   // Shift + A/D: o jato queima muito mais forte
  ctx.fillStyle="#ffb43a";ctx.fillRect(mx-14,my-8+bob,5,fl);ctx.fillStyle="#fff3a0";ctx.fillRect(mx-13,my-8+bob,3,fl*.55);ctx.fillStyle="#ff5a1f";ctx.fillRect(mx-14,my-8+bob+fl,5,3)}
 // braço de trás (balança ao contrário do braço da picareta)
 ctx.save();ctx.translate(mx-6,my-21+bob);ctx.rotate((flying?-2.3:falling?-2.5:walking?-sw*.8+.2:.25+idle*.06)*(1-k1)+(-1.15+Math.sin(now/110)*.06)*k1);ctx.fillStyle=clothD;ctx.fillRect(-2,0,4,7);ctx.fillStyle=skin;ctx.fillRect(-2,6,4,3);ctx.restore();
 // tronco com cinto e gola
 ctx.fillStyle=cloth;ctx.fillRect(mx-9,my-24+bob,18,16);ctx.fillStyle=clothD;ctx.fillRect(mx-9,my-24+bob,3,16);ctx.fillStyle="#5a8fd6";ctx.fillRect(mx-6,my-24+bob,12,2);
 ctx.fillStyle="#6a4a2a";ctx.fillRect(mx-9,my-12+bob,18,3);ctx.fillStyle="#d9b24a";ctx.fillRect(mx-1,my-12+bob,3,3);
 leg(mx+3,lb,"#2b2d34");
 // cabeça: rosto, olho (pisca), capacete e lanterna
 const hb=bob+(falling?-1.5:0);
 ctx.fillStyle=skin;ctx.fillRect(mx-6,my-33+hb,12,9);
 ctx.fillStyle="#2a1a10";if(now%3200<130)ctx.fillRect(mx+2,my-29+hb,3,1);else ctx.fillRect(mx+2,my-30+hb,2,3);
 ctx.fillStyle="#ffb43a";ctx.fillRect(mx-8,my-38+hb,16,6);ctx.fillStyle="#d98a1c";ctx.fillRect(mx-8,my-33+hb,16,1);ctx.fillStyle="#fff6b8";ctx.fillRect(mx+5,my-37+hb,4,3);
 ctx.globalAlpha=.25+.1*Math.sin(now/200);ctx.fillStyle="#fff3a0";ctx.fillRect(mx+9,my-38+hb,6,5);ctx.globalAlpha=1;
 // braço da frente com a picareta: levanta ao voar/cair, balança ao andar, golpeia ao cavar. Pescando, segura a vara (rodPose em 16-pesca-desenho.js)
 const rp=fs?rodPose():null,base0=rp?rp.a:S.dir==="up"?-1.6:flying?-2.3:falling?-2.1:walking?-.9+sw*.55:-1.1+idle*.05,base=base0*(1-k1)+(-1.0+Math.sin(now/110+.8)*.05)*k1;
 ctx.save();ctx.translate(mx+8,my-20+bob);ctx.rotate(base+(rp?0:swing*1.8));
 if(rp){
  ctx.fillStyle="#7a5428";ctx.fillRect(-4,-1.5,26,3);ctx.fillStyle="#caa264";ctx.fillRect(-4,-1.5,26,1);
  ctx.fillStyle="#555b66";ctx.fillRect(6,1.5,6,4);ctx.fillStyle="#9aa3b0";ctx.fillRect(7,2.5,4,2);   // carretilha
  ctx.save();ctx.translate(22,0);ctx.rotate(rp.b);ctx.fillStyle="#8a6334";ctx.fillRect(0,-1.2,24,2.4);ctx.fillStyle="#d9b97a";ctx.fillRect(0,-1.2,24,.9);ctx.restore();   // ponta da vara, que envergada
  const ex=22+24*Math.cos(rp.b),ey=24*Math.sin(rp.b),X=mx+8+ex*Math.cos(rp.a)-ey*Math.sin(rp.a),Y=my-20+bob+ex*Math.sin(rp.a)+ey*Math.cos(rp.a),fx=S.dir==="left"?2*mx-X:X;
  fishTip={x:mx+(fx-mx)*worldZoom,y:my+(Y-my)*worldZoom};   // onde a linha começa (tela)
 }else{
  ctx.fillStyle="#8a5a2b";ctx.fillRect(0,-2,22,4);ctx.fillStyle=TCOL[S.tier%TCOL.length];ctx.fillRect(18,-9,5,18);ctx.fillStyle="rgba(255,255,255,.35)";ctx.fillRect(18,-9,2,18);
  if(swing>.5){ctx.fillStyle="#fff6b8";ctx.fillRect(22,-4,4,4)}
 }
 ctx.fillStyle=cloth;ctx.fillRect(-2,-2,8,4);ctx.fillStyle=skin;ctx.fillRect(5,-2,4,4);ctx.restore();
 ctx.restore();
}

// ===== 5-desenho/04-combo-efeitos.js — Combo grande na tela, faixas de aviso, partículas, textos flutuantes e flashes =====
// Cores por nível do combo (de 100 para cima a cor gira pelo arco-íris)
const comboColor=n=>n>=100?"hsl("+Math.floor(performance.now()/5%360)+",100%,66%)":n>=50?"#ff6a2a":n>=25?"#ffa83a":n>=10?"#ffd45c":"#fff0b8";
const comboXY=()=>({x:clamp(colX(mX),70,W-70),y:Math.max(46,rowY(mY)-T*2.1)});   // segue o personagem, um pouco acima da cabeça
function comboTxt(s,x,y,size,col,lw,glow){   // texto com contorno grosso (sem brilho)
 ctx.font="700 "+Math.round(size)+"px "+FONT;ctx.lineJoin="round";ctx.lineWidth=lw;ctx.strokeStyle="#000";
 ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);
}
function comboHud(dt){
 cmbPulse=Math.max(0,cmbPulse-dt*5);cmbBanner=Math.max(0,cmbBanner-dt*.8);cmbLastT=Math.max(0,cmbLastT-dt);
 const k=clamp(Math.min(W,H*1.3)/700,.7,1.1),cp=comboXY(),cx=cp.x,cy=cp.y,size=(22+Math.min(16,cmb*.18))*k;
 ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
 if(cmb>1){
  const col=comboColor(cmb),f=Math.min(1,cmbT/.7),pop=1+.22*cmbPulse,wob=Math.sin(performance.now()/38)*.04*cmbPulse;
  ctx.globalAlpha=.6+.4*f;   // nos últimos instantes esmaece e encolhe, avisando que vai acabar
  ctx.translate(cx,cy);ctx.rotate(wob);ctx.scale(pop*(.9+.1*f),pop*(.9+.1*f));
  comboTxt("COMBO",0,-size*.75,Math.max(9,size*.36),"#ffffff",3,0);
  comboTxt("x"+cmb,0,0,size,col,Math.max(3,size*.14),4+8*cmbPulse);
 }
 ctx.restore();
 if(cmbBanner>0){   // faixa do marco: entra com um quique leve e some devagar
  const p=1-cmbBanner,sc=p<.12?p/.12*1.2:p<.25?1.2-(p-.12)/.13*.2:1,sz=18*k;
  ctx.save();ctx.globalAlpha=Math.min(1,cmbBanner*2.2);ctx.translate(cx,cy+size*.8+sz*.8);ctx.scale(sc,sc);ctx.textAlign="center";ctx.textBaseline="middle";
  comboTxt(cmbBannerT,0,0,sz,comboColor(cmb),Math.max(4,sz*.2),8);ctx.restore();
 }
 if(cmbLastT>0&&cmb<2){   // combo acabou: o total final cai e some
  ctx.save();ctx.globalAlpha=Math.min(1,cmbLastT/.6);ctx.textAlign="center";ctx.textBaseline="middle";
  comboTxt(__("Combo final x{0}",cmbLast),cx,cy+(1.4-cmbLastT)*22,13*k,"#d8d8d8",3,0);ctx.restore();
 }
}
function drawEffects(dt){
 drawAmb(dt);
 weatherFront();
 for(const p of parts){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g===undefined?520:p.g)*dt;ctx.globalAlpha=clamp(p.l*1.6,0,1)*(p.a||1);ctx.fillStyle=p.c;let s=p.s||(p.big?6:4);if(p.gr)s*=1+p.gr*(1-p.l/p.l0);s=Math.round(s);ctx.fillRect(Math.round(p.x-s/2),Math.round(p.y-s/2),s,s)}
 {let j=0;for(let i=0;i<parts.length;i++){const p=parts[i];if(p.l>0)parts[j++]=p}parts.length=j}if(parts.length>500)parts.splice(0,parts.length-500);ctx.globalAlpha=1;
 ctx.textAlign="center";
 for(const t of texts){t.t+=dt;const life=t.big?1.5:1.1;ctx.globalAlpha=clamp(1-t.t/life,0,1);ctx.font=(t.big?"800 19px":"700 15px")+" "+FONT;const yy=t.y-t.t*(t.big?42:50),pop=t.t<.12?1+(.12-t.t)*4:1;
  ctx.save();ctx.translate(t.x,yy);ctx.scale(pop,pop);ctx.fillStyle="#000";ctx.fillText(t.s,1,1);ctx.fillStyle=t.c;ctx.fillText(t.s,0,0);ctx.restore()}
 ctx.globalAlpha=1;texts=texts.filter(t=>t.t<(t.big?1.5:1.1));if(texts.length>30)texts.splice(0,texts.length-30);
}
// Noite na superfície: tudo escurece, menos um círculo de luz em volta do jogador (a lanterna do capacete). O vagalume é o que aumenta esse círculo.
// A escuridão é pintada numa camada pequena (1/4 da tela, sem custo) e esticada sobre o jogo. No alto do céu ela é afrouxada para estrelas e lua
// continuarem à vista; perto do chão (mesa, fornalha, loja...) ela é total. Números em BAL.night.
let nightCv=null,nightG=null;
function nightLayer(mx,my,sn){
 const k=.25,w=Math.ceil(W*k),h=Math.ceil(H*k),B=BAL.night;
 if(!nightCv){nightCv=document.createElement("canvas");nightG=nightCv.getContext("2d")}
 if(nightCv.width!==w||nightCv.height!==h){nightCv.width=w;nightCv.height=h}
 const g=nightG,cx=mx*k,cy=(my-T*.5)*k,r0=T*(B.lit+lanternLight()+petLight()*B.petLit)*k,r1=r0+T*B.soft*k,d=sn*B.dark;
 g.globalCompositeOperation="source-over";g.clearRect(0,0,w,h);
 const gr=g.createRadialGradient(cx,cy,r0,cx,cy,r1);   // dentro de r0 não escurece nada; de r0 a r1 a luz some suavemente; fora, escuridão total
 for(const[o,a]of[[0,0],[.25,.12],[.5,.45],[.75,.8],[1,1]])gr.addColorStop(o,"rgba(4,8,34,"+(a*d).toFixed(3)+")");
 g.fillStyle=gr;g.fillRect(0,0,w,h);
 lampHoles(g,k,sn);   // postes de luz abrem a escuridão em volta deles
 const hz=rowY(0),zone=T*B.skyZone,ramp=Math.max(40,skyH()*.5);   // hz = linha do chão na tela
 if(hz-zone>0){   // alto do céu: tira parte da escuridão (só sobra a fração B.sky) para as estrelas e a lua aparecerem
  g.globalCompositeOperation="destination-out";
  const sg=g.createLinearGradient(0,(hz-zone-ramp)*k,0,(hz-zone)*k);sg.addColorStop(0,"rgba(0,0,0,"+(1-B.sky)+")");sg.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=sg;g.fillRect(0,0,w,(hz-zone)*k);g.globalCompositeOperation="source-over";
 }
 ctx.imageSmoothingEnabled=true;ctx.drawImage(nightCv,0,0,W,H);
}
function drawOverlays(dt,mx,my){
 const sn=surfNight();
 if(sn>.01)nightLayer(mx,my,sn);
 const dark=Math.min(.72,S.depth/600);
 if(dark>0){const cy=my-T*.5,gr=ctx.createRadialGradient(mx,cy,T*(1.4+lanternLight()+petLight()),mx,cy,Math.max(W,H)*.6);gr.addColorStop(0,"rgba(0,0,0,0)");gr.addColorStop(1,"rgba(0,0,0,"+dark+")");ctx.fillStyle=gr;ctx.fillRect(0,0,W,H)}
 // energia baixa: bordas vermelhas pulsando
 const er=S.en/maxEn();
 if(S.depth>0&&er<.25){lowEnPulse=Math.max(0,lowEnPulse-dt);const a=(.25-er)*2.2*(.55+.45*Math.sin(performance.now()/160));ctx.strokeStyle="rgba(255,30,30,"+clamp(a,0,.6)+")";ctx.lineWidth=8;ctx.strokeRect(4,4,W-8,H-8)}
 if(flash>0){ctx.globalAlpha=clamp(flash,0,1)*.5;ctx.fillStyle=flashC;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;if(flashText){ctx.save();ctx.globalAlpha=clamp(flash*1.4,0,1);ctx.textAlign="center";ctx.font="900 40px "+FONT;ctx.lineWidth=7;ctx.strokeStyle="#000";ctx.strokeText(flashText,W/2,H*.4);ctx.fillStyle="#fff";ctx.fillText(flashText,W/2,H*.4);ctx.restore()}flash=Math.max(0,flash-dt*1.1)}
 chestOpen=Math.max(0,chestOpen-dt*1.4);
}

// ===== 5-desenho/06-quadro.js — Desenho de cada quadro: céu, blocos, alvo, personagem e efeitos =====
function updateDepthRuler(){
 const ruler=$("depthruler");
 const layer=layerOf(S.depth),pos=S.depth>=FINAL_DEPTH?1:clamp((S.depth-layer*LAYER_HEIGHT)/LAYER_HEIGHT,0,1),css=(pos*100)+"%",color=BIO[layer][4];
 if(ruler.style.getPropertyValue("--depth-position")!==css)ruler.style.setProperty("--depth-position",css);
 if(ruler.style.getPropertyValue("--layer-color")!==color)ruler.style.setProperty("--layer-color",color);
}
function drawTarget(){
 const[tc,tr]=tgt();if(isDug(tc,tr)||tr<0)return;
 const x=Math.round(colX(tc)-T/2),cy=Math.round(rowY(tr)),ok=canBreak(tc,tr),pr=ok?Math.min(1,S.prog/hardness(tr)):0,u=Math.max(.75,Math.round(baseTile()/14)*worldZoom),L=Math.round(T*.3);
 // mira em cantos (estilo pixel): sombra escura por baixo e cor por cima
 for(const[col,o]of[["rgba(0,0,0,.55)",1],[ok?"#ffb43a":"#9a9a9a",0]])for(const[ax,ay,dx,dy]of[[x,cy,1,1],[x+T,cy,-1,1],[x,cy+T,1,-1],[x+T,cy+T,-1,-1]]){
  ctx.fillStyle=col;const px=ax+(dx>0?0:-u)+o,py=ay+(dy>0?0:-u)+o;ctx.fillRect(px,py,dx>0?L:-L,u);ctx.fillRect(px,py,u,dy>0?L:-L)}
 if(isVein(tc,tr))lbl(__("Pedra dura: dinamite"),x+T/2,cy-8,"#ff9a3a");
 else{const rk=oreVeinAt(tc,tr);if(rk>=0)lbl(__("Veio de {0}: x{1}",__(ORES[rk][0]),BAL.oreVein.units),x+T/2,cy-8,ORES[rk][2])}
 if(pr>0){
  ctx.fillStyle="rgba(255,180,58,.16)";ctx.fillRect(x+1,cy+T-(T-2)*pr-1,T-2,(T-2)*pr);
  const bh=Math.max(5,u*2);ctx.fillStyle="rgba(0,0,0,.55)";ctx.fillRect(x,cy+T-bh-2,T,bh+2);   // barra de progresso em segmentos
  const seg=Math.max(.75,Math.round(baseTile()/8)*worldZoom),fillW=Math.round(T*pr/seg)*seg;ctx.fillStyle="#ffcf70";ctx.fillRect(x+1,cy+T-bh-1,Math.max(0,fillW-2),bh);ctx.fillStyle="#fff0b8";ctx.fillRect(x+1,cy+T-bh-1,Math.max(0,fillW-2),Math.max(1,Math.round(bh/3)))
 }
}
function draw(dt){
 const t=performance.now()/1000;bakeBudget=1;   // camadas pré-renderizadas: no máximo 1 refeita só por mudança de cor neste quadro (00b-cache.js)
 ctx.setTransform(dpr,0,0,dpr,0,0);
 let sx=0,sy=0;if(shake>0){sx=Math.round((Math.random()-.5)*shake);sy=Math.round((Math.random()-.5)*shake);   // em pixels inteiros: a pixel art não borra ao tremer
 shake=Math.max(0,shake-BAL.shake.decay*dt)}
 ctx.save();ctx.translate(sx,sy);
 const sky=rowY(0);
 drawSky(sky,t);
 const r0=Math.max(0,Math.floor(camY-H*SURF/T)-1),r1=Math.ceil(camY+H*(1-SURF)/T)+1;
 layerBackdrops(r0,r1);
 drawScenery(t);weatherVeil(rowY(0));   // cenário da superfície que fica preso ao mundo: bloqueio à esquerda, árvores e a grande montanha à direita
 const half=Math.ceil(W/2/T)+1,cb=Math.round(camX),tb=baseTile(),ts=T/tb;
 for(let r=r0;r<=r1;r++){
  const y=rowY(r);
  for(let c=cb-half;c<=cb+half;c++){
   const x=colX(c)-T/2;
   if(!inW(c)||r>=FINAL_DEPTH){
    if(r===0&&r<FINAL_DEPTH){if(isRiver(c)||isSea(c))drawWaterCell(x,y,ts,tb,c,r,isSea(c));else if(isBeach(c))drawSandCell(x,y,ts,tb,c,r);else{drawSolid(x,y,ts,tb,c,r);if((c>HALF&&c<BEACH_C0)||(c<-HALF&&c>=SURF_L))drawPathTop(x,y,ts,tb,c)}}   // fora do mundo a linha 0 continua como superfície (grama; trilha de terra na passagem da direita)
    else if(r<=4&&c>=SURF_L-PAD_L-1&&c<=SURF_R+PAD_R+1){if((isRiver(c)&&r<=1)||(isSea(c)&&r<=2))drawWaterCell(x,y,ts,tb,c,r,isSea(c));else if(isBeach(c)&&r<=1)drawSandCell(x,y,ts,tb,c,r);else{drawSolid(x,y,ts,tb,c,r);ctx.fillStyle="rgba(8,8,12,"+(.2+r*.15)+")";ctx.fillRect(x,y,T+1,T+1)}}   // sob a extensão da superfície o chão continua e vai escurecendo até a rocha-base (sem vazio preto)
    else drawBedrock(x,y,ts,tb,c,r);
    continue}
   if(isDug(c,r)){drawCave(x,y,ts,tb,c,r);continue}
   drawSolid(x,y,ts,tb,c,r);
  }
 }
 drawGateAndChest(t);
 drawTarget();
 drawGoldenCarrot(t);
 drawPlayer();
 drawPet(dt,t);
 drawEffects(dt);
 swing=Math.max(0,swing-dt*5);
 ctx.restore();
 drawOverlays(dt,colX(mX),rowY(mY));
 drawFishing(t);   // pesca: linha, boia, peixe, minijogo e resultado por cima de tudo (16-pesca-desenho.js)
 drawFireflies(t);   // vaga-lumes por cima da escuridão da noite (13-paisagem.js)
 updateDepthRuler();
 comboHud(dt);
}

// ===== 5-desenho/07-pet.js — Vagalume companheiro: segue o jogador, brilha e aumenta o raio de luz no escuro (brilha bem mais à noite, na superfície) =====
let petX=0,petY=0,petSide=1,petInit=false;
const petLight=()=>S.lv.pet*BAL.pet.light;           // blocos de luz extra (usado em drawOverlays)
const lanternLight=()=>S.lv.lant*BAL.lant.light;      // lanterna: blocos de luz extra, mais barata e menor que o vagalume (usado em drawOverlays)
const surfNight=()=>nightAmt();   // 0-1: quanto de noite vale agora — não some com a profundidade, soma com a escuridão natural da caverna (quanto mais desce, mais escuro)
function drawPet(dt,t){
 if(S.lv.pet<1){petInit=false;return}
 if(S.dir==="left")petSide=1;else if(S.dir==="right")petSide=-1;
 const tx=mX+petSide*.85,ty=mY-.1;
 if(!petInit||Math.abs(petX-mX)>8||Math.abs(petY-mY)>8){petX=tx;petY=ty;petInit=true}
 const k=Math.min(1,dt*3.2);petX+=(tx-petX)*k;petY+=(ty-petY)*k;
 const u=Math.max(.75,Math.round(baseTile()/14)*worldZoom),px=Math.round(colX(petX)),py=Math.round(rowY(petY)-T*.8+Math.sin(t*3.1)*T*.07);
 // brilho suave (soma de luz)
 const nt=surfNight(),gr=T*(.42+.11*S.lv.pet)*(1+nt*.7),pulse=.85+.15*Math.sin(t*4.3),ga=(S.depth>0?.06:.015)+nt*BAL.night.pet*.5;   // brilho reduzido, discreto durante o dia e mais contido à noite
 ctx.save();ctx.globalCompositeOperation="lighter";
 const g=ctx.createRadialGradient(px,py,0,px,py,gr);g.addColorStop(0,"rgba(255,214,120,"+(ga*pulse)+")");g.addColorStop(1,"rgba(255,180,60,0)");
 ctx.fillStyle=g;ctx.fillRect(px-gr,py-gr,gr*2,gr*2);ctx.restore();
 // corpo em pixel art: asas batendo, barriga laranja e núcleo claro
 const wing=Math.sin(t*34)>0?-u:0;
 ctx.fillStyle="rgba(200,235,255,.8)";ctx.fillRect(px-2*u,py-u+wing,u,u);ctx.fillRect(px+u,py-u+wing,u,u);
 ctx.fillStyle="#ff9a3a";ctx.fillRect(px-u,py-u,2*u,3*u);
 ctx.fillStyle="#ffd45c";ctx.fillRect(px-u,py+u,2*u,u);
 ctx.fillStyle=nt>.3?"#fffbd8":"#fff3a0";ctx.fillRect(px-u,py-u,u,u);
 if(Math.random()<dt*7)parts.push({x:px+(Math.random()-.5)*u,y:py+2.5*u,vx:(Math.random()-.5)*10,vy:5,g:6,l:.45,l0:.45,c:"#ffd45c",s:Math.max(2,Math.round(u))});   // pó de brilho sai da pontinha da barriga e flutua (sem a gravidade padrão, que o fazia despencar)
}

// ===== 5-desenho/08-dia-noite.js — Ciclo de dia e noite (sol, lua, estrelas, aurora boreal, estrela cadente e tons do céu) =====
// dayT: 0 = amanhecer · .25 = meio-dia · .5 = pôr do sol · .75 = meia-noite. Duração do ciclo: BAL.day.len.
// O céu é pintado só com degradês contínuos (um por camada de cor), sem faixas nem retângulos translúcidos sobrepostos,
// que deixavam linhas horizontais visíveis. O degradê é ancorado na linha do horizonte e rola junto com o chão.
let dayT=BAL.day.start;
const dayTick=dt=>{dayT=(dayT+dt/BAL.day.len)%1;S.moon=(S.moon+dt/BAL.day.len)%BAL.moon.cycle};
// Fases da lua (só visual). S.moon = idade da lua em dias de jogo; moonP(): 0 = nova · .25 = quarto crescente · .5 = cheia · .75 = quarto minguante.
const moonP=()=>(((S.moon/BAL.moon.cycle)%1)+1)%1;
const moonLight=(p=moonP())=>(1-Math.cos(p*Math.PI*2))/2;                   // fração iluminada: 0 = nova · 1 = cheia
const MOON_NAMES=[N_("Lua nova"),N_("Crescente"),N_("Quarto crescente"),N_("Gibosa crescente"),N_("Lua cheia"),N_("Gibosa minguante"),N_("Quarto minguante"),N_("Minguante")];
const moonName=(p=moonP())=>__(MOON_NAMES[Math.round(p*8)%8]);
// O ponto (x,y) do disco unitário (x para a direita, y para baixo) está na parte iluminada? O terminador é uma meia-elipse de largura cos(2πp)·√(1-y²).
function moonLit(x,y,p){const w=Math.sqrt(Math.max(0,1-y*y)),xt=Math.cos(p*Math.PI*2)*w,xx=BAL.moon.south?-x:x;return p<.5?xx>xt-.001:xx<-xt+.001}
const sunElev=()=>Math.sin(dayT*Math.PI*2);                 // altura do sol: 1 = zênite, -1 = nadir
const nightAmt=()=>clamp((.18-sunElev())/.5,0,1);           // 0 = dia · 1 = noite fechada
const skyH=()=>Math.max(H*SURF,120);                        // altura do céu quando a câmera está na superfície
// Mistura uma cor "#rrggbb" com o azul-noite (usado nas colinas, que são desenhadas depois do tom do céu)
const _ncMem=new Map();   // memória: o mesmo hex com a mesma noite se repete dezenas de vezes por quadro (árvores, pedras, montanhas)
function nightCol(hex,n){
 const key=hex+n;let v=_ncMem.get(key);if(v!==undefined)return v;
 const k=n*.55,r=parseInt(hex.substr(1,2),16),g=parseInt(hex.substr(3,2),16),b=parseInt(hex.substr(5,2),16);
 v="rgb("+Math.round(r+(8-r)*k)+","+Math.round(g+(12-g)*k)+","+Math.round(b+(44-b)*k)+")";
 if(_ncMem.size>400)_ncMem.clear();_ncMem.set(key,v);return v}
// Tom do céu: azul-noite (mais forte no topo) e laranja perto do horizonte no amanhecer e no pôr do sol
function skyTint(sky){
 const n=nightAmt(),e=sunElev(),dusk=Math.max(0,1-Math.abs(e)/.38)*(1-n*.4);
 if(n<.01&&dusk<.01)return;
 const y0=sky-skyH();
 if(n>.01){const g=ctx.createLinearGradient(0,y0,0,sky);g.addColorStop(0,"rgba(8,12,44,"+(n*.72).toFixed(3)+")");g.addColorStop(1,"rgba(8,12,44,"+(n*.48).toFixed(3)+")");ctx.fillStyle=g;ctx.fillRect(0,0,W,sky)}
 if(dusk>.01){const g=ctx.createLinearGradient(0,y0,0,sky);g.addColorStop(0,"rgba(255,120,50,0)");g.addColorStop(.5,"rgba(255,120,50,"+(dusk*.085).toFixed(3)+")");g.addColorStop(1,"rgba(255,120,50,"+(dusk*.34).toFixed(3)+")");ctx.fillStyle=g;ctx.fillRect(0,0,W,sky)}
}
function skyStars(sky,t,ps){
 const n=nightAmt();if(n<.15)return;
 for(let i=0;i<44;i++){
  const x=Math.round(hash(i,11)*W/ps)*ps,y=Math.round(hash(i,23)*sky*.7/ps)*ps,a=n*(.35+.5*(.5+.5*Math.sin(t*1.4+i*1.7)));
  ctx.globalAlpha=Math.min(1,a);ctx.fillStyle=i%7===0?"#fff3c0":"#ffffff";const s=i%6===0?2:1;ctx.fillRect(x,y,ps*s*.75,ps*s*.75);
 }
 ctx.globalAlpha=1;
}
// Aurora boreal: duas cortinas de raios verdes, azul-turquesa e roxos que ondulam devagar. Só de noite e com o céu aberto
// (sem nuvens, chuva, neve ou neblina); no inverno aparece mais forte. Colunas de 2 pixels de sprite, cada uma com seu degradê vertical.
const _auroraSlot=bakeNew();
function auroraCols(sky,t,ps,aur){
 const cw=ps*2,top0=sky-skyH();
 ctx.save();ctx.globalCompositeOperation="lighter";
 for(let L=0;L<2;L++){
  const ph=L*2.3,sh=L?.7:1;
  for(let x=0;x<W+cw;x+=cw){
   const wv=Math.sin(x*.0071+t*.11+ph)*.5+Math.sin(x*.0193-t*.19+ph*1.7)*.3+Math.sin(x*.0037+t*.05)*.2;   // forma da cortina (-1 a 1)
   const cy=top0+sky*(.24+.07*L+.08*wv),h=sky*(.26+.16*(.5+.5*Math.sin(x*.012+t*.33+ph)))*(L?.8:1);
   const ray=.45+.55*(.5+.5*Math.sin(x*.046+t*.8+L*1.9)),a=Math.min(1,aur*ray*sh*.95);
   if(a<.01)continue;
   const yt=cy-h*.55,yb=cy+h*.45,g=ctx.createLinearGradient(0,yt,0,yb);
   g.addColorStop(0,"rgba(150,90,255,0)");g.addColorStop(.22,"rgba(130,100,255,"+(a*.55).toFixed(3)+")");
   g.addColorStop(.5,L?"rgba(70,230,230,"+(a*.8).toFixed(3)+")":"rgba(80,255,160,"+a.toFixed(3)+")");
   g.addColorStop(.82,"rgba(60,230,150,"+(a*.5).toFixed(3)+")");g.addColorStop(1,"rgba(60,230,150,0)");
   ctx.fillStyle=g;ctx.fillRect(Math.round(x),Math.round(yt),cw,Math.round(yb-yt));
  }
 }
 ctx.restore();
}
function skyAurora(sky,t,ps){
 const al=altAmt(),n=clamp(nightAmt()+altSmooth(.3,1,al)*.4,0,1);if(n<.2)return;   // lá no alto a aurora aparece até de dia (fraca) e fica mais forte
 const aur=Math.pow(n,1.4)*clamp(1-wx.cover*1.25,0,1)*clamp(1-wx.fog*1.5,0,1)*(SEA.idx===3?1:.62)*(.8+.2*Math.sin(t*.23))*(1+.4*al);
 if(aur<.03)return;
 // As cortinas são luz difusa e ondulam devagar: o canvas é feito em METADE da resolução (4x menos pixels de degradê para pintar) e só ~12 vezes por segundo (ela muda bem devagar); nos outros quadros só se amplia e soma a luz
 const sl=_auroraSlot,k=.5,cw=Math.ceil(W*k),ch=Math.ceil(sky*k);
 if(!sl.cv||sl.cv.width!==cw||sl.cv.height!==ch||sl.gk!==ps||t-sl.t>1/12||t<sl.t){bakeOn(sl,cw,ch,()=>{ctx.scale(k,k);auroraCols(sky,t,ps,aur)});sl.gk=ps;sl.t=t}
 ctx.save();ctx.globalCompositeOperation="lighter";ctx.imageSmoothingEnabled=true;ctx.drawImage(sl.cv,0,0,W,sky);ctx.restore();
}
// Disco da lua (raio 5 em pixels de sprite) com a fase atual: parte iluminada clara com crateras e parte escura (luz cinzenta da Terra) quase invisível
function moonDisc(cx,cy,ps){
 const p=moonP(),R=5.2;
 for(let j=-5;j<=5;j++){const w=Math.floor(Math.sqrt(25-j*j+.5));
  for(let i=-w;i<=w;i++){
   const lit=moonLit(i/R,j/R,p);
   ctx.fillStyle=lit?(Math.hypot(i,j)<=4?"#f4f6fb":"#dfe5f5"):"rgba(38,46,82,.6)";
   ctx.fillRect(cx+i*ps,cy+j*ps,ps,ps);
   if(lit&&(i===-2&&j===-1||i===1&&j===1||i===-1&&j===2)){ctx.fillStyle="#c3cae0";ctx.fillRect(cx+i*ps,cy+j*ps,ps,ps)}   // crateras só onde há luz
  }}
}
// Sol (dia) ou lua (noite) cruzando o céu em arco
function skyBody(sky,ps){
 const e=sunElev(),horizon=sky*.8,arc=sky*.6,u=dayT<.5?dayT/.5:(dayT-.5)/.5,x=Math.round(W*(.08+.84*u)/ps)*ps;
 if(dayT<.5){
  const y=Math.round((horizon-e*arc)/ps)*ps,warm=e<.22;
  pixDisc(x,y,14,ps,"rgba(255,244,170,.07)");pixDisc(x,y,10,ps,"rgba(255,244,170,.09)");pixDisc(x,y,7,ps,warm?"rgba(255,170,90,.16)":"rgba(255,244,170,.12)");
  pixDisc(x,y,5,ps,warm?"#ff9a50":"#ffe27a");pixDisc(x,y,4,ps,warm?"#ffc27a":"#fff7c4");
  ctx.fillStyle=warm?"#ffb070":"#fff1a0";for(const[a,b,w,hh]of[[0,-8,1,2],[0,7,1,2],[-8,0,2,1],[7,0,2,1]])ctx.fillRect(x+a*ps,y+b*ps,w*ps,hh*ps);
  const al=altAmt();   // lá no alto a lua também aparece de dia, do lado oposto ao do sol
  if(al>.3){
   const mu=(u+.5)%1,ma=altSmooth(.3,.85,al)*Math.sin(Math.PI*mu)*.75*clamp(1-wx.cover*.8,0,1),mx=Math.round(W*(.08+.84*mu)/ps)*ps,my=Math.round((horizon-Math.sin(Math.PI*mu)*arc)/ps)*ps;
   if(ma>.02){const gl=BAL.moon.glow+(1-BAL.moon.glow)*moonLight();ctx.globalAlpha=ma;pixDisc(mx,my,9,ps,"rgba(200,215,255,"+(.08*gl).toFixed(3)+")");pixDisc(mx,my,7,ps,"rgba(200,215,255,"+(.1*gl).toFixed(3)+")");moonDisc(mx,my,ps);ctx.globalAlpha=1}
  }
 }else{
  const y=Math.round((horizon+e*arc)/ps)*ps,al=altAmt(),gl=BAL.moon.glow+(1-BAL.moon.glow)*moonLight();   // gl: o halo some junto com a parte iluminada
  if(al>.05){pixDisc(x,y,13,ps,"rgba(200,215,255,"+(.05*al*gl).toFixed(3)+")");pixDisc(x,y,11,ps,"rgba(200,215,255,"+(.07*al*gl).toFixed(3)+")")}   // no alto o brilho da lua é maior
  pixDisc(x,y,9,ps,"rgba(200,215,255,"+(.07*gl).toFixed(3)+")");pixDisc(x,y,7,ps,"rgba(200,215,255,"+(.1*gl).toFixed(3)+")");
  moonDisc(x,y,ps);
 }
}
// Estrela cadente: cabeça brilhante e cauda de pixels que se apaga, cruzando o céu na diagonal (evento em 2-sistemas/05-noite-estrelas.js)
function skyShoot(sky,ps){
 if(!shoot)return;
 const u=shoot.t/shoot.len,fade=Math.sin(Math.PI*clamp(u,0,1)),x0=W*shoot.x,y0=sky*shoot.y,dx=-shoot.dir*W*.38,dy=sky*.55;
 for(let k=18;k>=0;k--){
  const p=u-k*.022;if(p<0)continue;
  const x=Math.round((x0+dx*p)/ps)*ps,y=Math.round((y0+dy*p)/ps)*ps,a=fade*(k?.8*(1-k/19):1),sz=k===0?3:k<4?2:1;
  ctx.globalAlpha=clamp(a*.3,0,1);ctx.fillStyle="#ffe9a0";ctx.fillRect(x-ps*2,y-ps*2,ps*(sz+4),ps*(sz+4));   // halo
  ctx.globalAlpha=clamp(a,0,1);ctx.fillStyle=k<2?"#ffffff":k<6?"#fff3c0":"#ffd98a";ctx.fillRect(x,y,ps*sz,ps*sz);
 }
 ctx.globalAlpha=1;
}

// ===== 5-desenho/09-ambiente.js — Partículas de ambiente por camada: poeira, brasas no magma e brilhos nos cristais =====
// amb[i] = {x,y,vx,vy,l,l0,c,k}  (k: "dust" poeira · "ember" brasa · "spark" brilho)
const AMB_MAX=70;
function ambSpawn(dt){
 if(S.depth<=0||amb.length>=AMB_MAX)return;
 const L=layerOf(S.depth),B=BIO[L],r=Math.random;
 let kind="dust",rate=5;
 if(L===12){kind="ember";rate=15}                                   // magma solidificado: brasas subindo
 else if(L===13){kind="spark";rate=8}                               // cristais profundos: brilhos coloridos
 else if(L===14){kind=r()<.5?"spark":"dust";rate=5}                 // vidro volcânico: reflexos roxos
 else if(L===10||L===11){kind=r()<.55?"spark":"dust";rate=5}        // quartzito e mármore: pontinhos de luz
 else if(L>=15)rate=2.5;
 if(r()>dt*rate)return;
 let p;
 if(kind==="ember")p={x:r()*W,y:H+5,vx:(r()-.5)*20,vy:-40-r()*60,l:2.6,c:r()<.5?"#ff7a2a":r()<.5?"#ffb43a":"#ff4a1f"};
 else if(kind==="spark")p={x:r()*W,y:r()*H,vx:0,vy:0,l:2.4+r()*2,c:L===13?(r()<.5?"#d6b8ff":r()<.5?"#ffffff":"#7fe6ff"):L===14?"#b9a0e8":"#ffffff"};
 else p={x:r()*W,y:H+5,vx:(r()-.5)*14,vy:-4-r()*12,l:6+r()*3,c:B[4]};
 p.k=kind;p.l0=p.l;amb.push(p);
}
function drawAmb(dt){
 for(const a of amb){
  a.l-=dt;a.x+=a.vx*dt;a.y+=a.vy*dt;const f=clamp(a.l/a.l0,0,1);
  if(a.k==="ember"){a.vx+=(Math.random()-.5)*90*dt;ctx.globalAlpha=f;ctx.fillStyle=a.c;const s=f>.5?3:2;ctx.fillRect(a.x,a.y,s,s)}
  else if(a.k==="spark"){ctx.globalAlpha=Math.sin(Math.PI*(1-f))*.9;ctx.fillStyle=a.c;ctx.fillRect(a.x,a.y,2,2);if(ctx.globalAlpha>.55){ctx.fillRect(a.x-2,a.y,6,2);ctx.fillRect(a.x,a.y-2,2,6)}}
  else{a.vx+=(Math.random()-.5)*20*dt;ctx.globalAlpha=Math.min(.4,f*.6);ctx.fillStyle=a.c;ctx.fillRect(a.x,a.y,2,2)}
 }
 ctx.globalAlpha=1;
 for(let i=amb.length-1;i>=0;i--)if(amb[i].l<=0||amb[i].y<-10||amb[i].y>H+10)amb.splice(i,1);
}

// ===== 5-desenho/10-clima.js — Desenho do clima: nuvens extras e céu escuro (atrás do mundo); chuva, neve, neblina e raio (na frente) =====
// Gotas e flocos não têm estado: a posição de cada um sai de uma conta com o índice e o relógio do clima (wx.clock), então não pesam e congelam na pausa.
const wxR=(i,s)=>{const x=Math.sin(i*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};
function weatherSky(sky,scale,night){   // dentro do recorte do céu, depois das nuvens e colinas de sempre
 const c=wx.cover;if(c<.01&&wx.bolt<=0&&wx.fog<.01)return;
 if(c>.02)skyLayers(sky,(sh,k)=>{   // camada extra de nuvens (maiores e mais lentas) que cobre o céu (presa ao horizonte, como o resto do céu)
  const span=W+240*scale;let n=1,i=0;
  for(const[p0,hh0,s,v0,ly,ph]of CLOUDS){
   const bd=k>0?cloudBand(i++,k,CLOUDS.length):null,p=bd?bd.p-.37:p0,hh=bd?bd.hh:hh0,v=bd?bd.v:v0;   // faixas de cima: espaçadas por igual (o -.37 compensa o deslocamento abaixo)
   const size=s*1.3*scale*(W<500?.8:1),par=bd?bd.par:(ly?.18:.07),px=Math.max(2,Math.round(size/13)),sp=sprCloud(n++%3);
   const x=((((p+.37)%1)*span+wx.clock*v*(.6+wx.wind)*scale-camX*T*par)%span+span)%span-120*scale,y=sh*(.08+hh*.62)+Math.sin(wx.clock*.2+ph)*3;
   ctx.globalAlpha=c*(ly?.95:.65)*(1-night*.5);
   ctx.drawImage(sp.cv,1,1,sp.w,sp.h,Math.round(x/px)*px,Math.round(y/px)*px,sp.w*px,sp.h*px);
  }
  ctx.globalAlpha=1;
 },false);   // sem repetir para cima: acima das nuvens o céu fica limpo
}
// Véu do tempo (nublado, neblina de fundo e clarão do raio): é desenhado DEPOIS do cenário da superfície (chamado em 5-desenho/06-quadro.js), por cima do céu, das cordilheiras, colinas, montanhas, árvores e pedras.
// Se ficasse junto das nuvens, o cenário (que é desenhado depois do céu) apareceria sem o véu e a borda do efeito ficaria visível na silhueta dele.
function weatherVeil(sky){
 const c=wx.cover*(1-clamp(altAmt()*1.2-.2,0,1)*.9);if(sky<=0||(c<.02&&wx.bolt<=0&&wx.fog<.01))return;   // lá no alto, acima das nuvens, o véu cinza some
 if(c>.02){
  const g=ctx.createLinearGradient(0,sky-skyH(),0,sky);   // véu cinza-azulado: mais escuro no alto, mais claro no horizonte
  g.addColorStop(0,"rgba(46,56,76,"+(.5*c).toFixed(3)+")");g.addColorStop(1,"rgba(112,124,142,"+(.28*c).toFixed(3)+")");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,sky);
 }
 if(wx.fog>.01){const g=ctx.createLinearGradient(0,sky-H*.45,0,sky);g.addColorStop(0,"rgba(226,233,239,0)");g.addColorStop(1,"rgba(226,233,239,"+(.6*wx.fog).toFixed(3)+")");ctx.fillStyle=g;ctx.fillRect(0,Math.max(0,sky-H*.45),W,Math.min(sky,H*.45))}
 if(wx.bolt>0){ctx.globalAlpha=Math.min(1,wx.bolt)*.35;ctx.fillStyle="#eef4ff";ctx.fillRect(0,0,W,sky);ctx.globalAlpha=1}
}
function weatherShelters(){   // polígonos em tela (do telhado ao chão) onde não chove nem neva: a casa (ferraria) e o interior da igreja
 const u=pu(),y=Math.round(rowY(0)),out=[];
 {const xl=forgeFx(FORGE_PILLARS[0]),xr=forgeFx(FORGE_PILLARS[FORGE_PILLARS.length-1]);
  if(xr>-T*8&&xl<W+T*8){const rb=y-FORGE_H*u-2*u,L0=xl-6*u,R0=xr+6*u,rw=11*u;out.push([[L0,y+3],[L0,rb],[L0+rw,rb-rw],[R0-rw,rb-rw],[R0,rb],[R0,y+3]])}}   // telhado trapezoidal da ferraria (mesma geometria de drawForge)
 {const cx=forgeFx(CHURCH_C);
  if(cx>-T*12&&cx<W+T*12){const ox=cx-CHURCH_W*u/2,oy=y-CHURCH_H*u;out.push([[ox+43*u,oy+30*u],[ox+148*u,oy+30*u],[ox+148*u,y+3],[ox+43*u,y+3]])}}   // nave e transepto da igreja
 return out}
function weatherFront(){   // por cima do mundo, antes da escuridão da noite
 const g=rowY(0);if(g<=8)return;
 const ck=wx.clock,co=camX*T;ctx.save();   // co = deslocamento horizontal da câmera em pixels: os respingos acompanham o chão (1x) e as gotas e flocos andam um pouco (parallax), então correr ou voar rápido não deixa a chuva "colada" na tela

 ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);   // recorte: chuva e neve não entram nos abrigos (casa e igreja)
 for(const p of weatherShelters()){ctx.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)ctx.lineTo(p[i][0],p[i][1]);ctx.closePath()}
 ctx.clip("evenodd");
 if(wx.rain>.02){
  // O ciclo de cada gota usa um período FIXO (PER, independente da altura do chão na tela): antes ele dependia de g, e ao voar para cima ou para baixo o chão mudava de lugar a cada quadro e todas as gotas e respingos pulavam.
  // As gotas são cortadas no chão (y>=g) e os respingos têm relógio próprio, então a câmera pode subir e descer sem nada piscar.
  const N=Math.round(wx.rain*Math.min(200,W/4.5)),slope=.12+.22*wx.wind,sp=1+.25*wx.rain,SPL=.3,PER=H+320;
  ctx.strokeStyle="rgba(196,214,238,.5)";ctx.lineWidth=1;ctx.beginPath();
  const sp2=[];
  for(let i=0;i<N;i++){
   const r1=wxR(i,1),r2=wxR(i,2),v=(520+r1*240)*sp,len=7+r1*7,y=(r1*4000+ck*v)%PER,yy=Math.min(y,g),x=((r2*(W+260)+yy*slope-60-co*.35)%(W+260)+W+260)%(W+260)-130;
   if(y<g-2){ctx.moveTo(x,y);ctx.lineTo(x-slope*len,y-len)}
   const cyc=PER/v,t=(ck+wxR(i,5)*cyc)%cyc;   // respingo no chão: uma vez por ciclo da gota, dura SPL s (q de 0 a 1)
   if(t<SPL)sp2.push([((wxR(i,6)*(W+260)-60-co)%(W+260)+W+260)%(W+260)-130,t/SPL]);
  }
  ctx.stroke();
  const gy=Math.round(g),pz=Math.max(2,Math.round(T/24));
  for(const[x0,q]of sp2){
   const x=Math.round(x0),a=1-q;
   ctx.fillStyle="rgba(210,224,242,"+(.5*a).toFixed(3)+")";ctx.fillRect(x-Math.round((2+q*9)*pz/2),gy-1,Math.round((4+q*18)*pz/2),Math.max(1,Math.round(pz/2)));   // ondinha que abre
   ctx.fillStyle="rgba(228,238,252,"+(.95*a).toFixed(3)+")";
   const up=Math.sin(Math.PI*Math.min(1,q*1.15))*(5+3*(x%3))*pz*.8,sd=(2+q*7)*pz*.7;
   ctx.fillRect(x-Math.round(sd),gy-2-Math.round(up),pz,pz);ctx.fillRect(x+Math.round(sd),gy-2-Math.round(up),pz,pz);ctx.fillRect(x,gy-2-Math.round(up*1.3),pz,pz);   // gotículas que saltam
  }
 }
 if(wx.snow>.02){
  const N=Math.round(wx.snow*Math.min(150,W/6));ctx.fillStyle="rgba(255,255,255,.88)";
  for(let i=0;i<N;i++){
   const r1=wxR(i,3),r2=wxR(i,4),y=(r1*3000+ck*(26+r1*34))%(H+8),x=(((r2*(W+120)+Math.sin(ck*.7+r1*6.3)*18+ck*wx.wind*16-co*.35)%(W+120))+W+120)%(W+120)-60;
   if(y<g-1){const s=r2>.7?3:2;ctx.fillRect(Math.round(x),Math.round(y),s,s)}
  }
 }
 ctx.restore();
 if(wx.fog>.01){   // faixas de névoa à deriva por cima do chão: manchas elípticas com degradê radial (sem bordas retas) que entram e saem da tela suavemente
  for(let k=0;k<3;k++){
   const bw=W*.9,per=W+bw,top=g-T*(1.5+k*.7),h=T*(1.9+k*.7),rx=bw/2,ry=h*.5;
   const cx=((ck*(6+k*3)+k*W*.37)%per)-bw+rx,cy=top+h*.6;   // o salto do módulo acontece com a mancha toda fora da tela
   const f=ctx.createRadialGradient(0,0,0,0,0,rx),a=.2*wx.fog;
   f.addColorStop(0,"rgba(228,234,240,"+a.toFixed(3)+")");f.addColorStop(.5,"rgba(228,234,240,"+(a*.6).toFixed(3)+")");f.addColorStop(.8,"rgba(228,234,240,"+(a*.18).toFixed(3)+")");f.addColorStop(1,"rgba(228,234,240,0)");
   ctx.save();ctx.translate(cx,cy);ctx.scale(1,ry/rx);ctx.fillStyle=f;ctx.fillRect(-rx,-rx,rx*2,rx*2);ctx.restore()}
 }
 if(wx.bolt>.45){   // o raio, só nos primeiros instantes do clarão
  const bx=wx.boltX*W,n=wx.boltJ.length;ctx.strokeStyle="rgba(255,255,255,.95)";ctx.lineWidth=2;ctx.shadowColor="#bcd6ff";ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(bx,0);
  let x=bx;for(let i=0;i<n;i++){x+=wx.boltJ[i]*W;ctx.lineTo(x,g*(i+1)/n)}ctx.stroke();
 }
 ctx.restore();
}

// ===== 5-desenho/11-cenario.js — Cenário da superfície: cordilheiras ao fundo, bloqueio rochoso à esquerda e passagem até a grande montanha à direita =====
// Tudo aqui é só visual e só aparece ACIMA da linha 0 (o subsolo não muda). Quem barra o jogador é inS()/isDug (3-mundo/01-celulas.js) com SURF_L e SURF_R (1-nucleo/02-camadas-minerios.js).
const winterAmt=()=>clamp((hexCh(SEA.g,5)-70)/150,0,1);   // 0 fora do inverno · 1 no meio do inverno (a grama vira neve): mais neve nas montanhas
const ridgeV=(wx,sd)=>Math.pow(clamp((1-Math.abs(Math.sin(wx*.0052+sd)))*.55+(1-Math.abs(Math.sin(wx*.0127+sd*2.3)))*.3+(Math.sin(wx*.031+sd)+1)*.075,0,1),1.25);
// Colunas de pixel PRESAS AO MUNDO: cada coluna tem largura q e posição fixa no mundo, então ao andar a forma inteira só desliza (os pixels nunca são reamostrados, não "fervem" nem piscam).
// Chama fn(w, x, largura) para cada coluna visível entre as colunas de mundo wA e wB (w = centro da coluna em unidades de coluna do mundo; x = pixel da tela).
function worldCols(q,wA,wB,fn){
 const st=q/T,k0=Math.max(Math.floor(wA/st),Math.floor((camX-W/2/T)/st)-1),k1=Math.min(Math.ceil(wB/st),Math.ceil((camX+W/2/T)/st)+1);
 for(let k=k0;k<k1;k++){const x=Math.round(W/2+(k*st-camX)*T),x2=Math.round(W/2+((k+1)*st-camX)*T);fn((k+.5)*st,x,x2-x)}
}

// ---------- cordilheiras do fundo (dentro do clip do céu, atrás das colinas) ----------
// Três camadas de profundidade. Cada uma é uma faixa fixa na própria camada que desliza devagar (par menor que o das colinas da frente, em 02-ceu-nuvens.js: .03 e .08).
// O tamanho dos picos NÃO depende da posição do jogador. As montanhas grandes das pontas (massa à esquerda, grande montanha à direita) são presas ao mundo, mais abaixo.
const vn=(x,s)=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return hash(i,s)*(1-u)+hash(i+1,s)*u};   // ruído de valor suave (determinístico, preso ao mundo)
// Cumes tipo Everest: pirâmide com ombros largos na base e ponta íngreme (curva em S, não uma reta), espigões laterais e rochedos irregulares no alto; vales largos entre eles
const ridgeP=(wx,sd)=>{
 const m=1-Math.abs(Math.sin(wx*.0029+sd)),sh=m*m*(3-2*m),prof=.5*sh+.5*Math.pow(m,1.15),spur=.16*Math.pow(1-Math.abs(Math.sin(wx*.0071+sd*1.7)),2.2);
 const crag=((vn(wx*.011,sd)-.5)*.26+(vn(wx*.033,sd+3)-.5)*.12+(vn(wx*.09,sd+7)-.5)*.05)*(.25+prof);
 return clamp(prof*.86+spur*prof+crag,0,1)};
const _rangeStrips=[];   // uma faixa pré-renderizada por camada (00b-cache.js)
function sceneRanges(sky,ps,night){
 if(sky<=0)return;
 const A=H*SURF,wint=winterAmt(),fogL=mixHex(SEA.fh,"#ffffff",.25),nq=Math.round(night*32)/32;
 const layers=[   // par = parallax (fração do movimento da câmera) · amp = altura máxima (fração do céu) · sn = a partir de que fração da altura há neve
  {par:.005,sd:11.3,amp:1.2,sn:.5,sf:1.05,peaky:1,body:mixHex(SEA.fh,"#a9bad6",.62),lit:mixHex("#ffffff","#c9d7ec",.35)},   // bem ao fundo: poucos cumes altíssimos e pontudos, com muita neve, quase azul-céu (altura passa de 1 para aparecerem acima da montanha gigante)
  {par:.010,sd:1.7,amp:1.12,sn:.84,body:mixHex(SEA.fh,"#8ea4c6",.55),lit:mixHex(SEA.fhh,"#ffffff",.3)},
  {par:.018,sd:4.1,amp:.64,sn:.9,body:mixHex(SEA.fh,"#5f79a3",.72),lit:mixHex(fogL,"#7f98bd",.45)},
  {par:.026,sd:7.3,amp:.4,sn:2,body:mixHex(SEA.nh,"#3f567c",.68),lit:mixHex(SEA.nhh,"#5d78a0",.62)}];
 for(let li=0;li<layers.length;li++){
  const L=layers[li],off=camX*T*L.par,hmax=Math.max(ps,Math.ceil(A*L.amp/ps)*ps),ridge=L.peaky?ridgeP:ridgeV;
  // A faixa é feita uma vez (forma: ps, altura, semente; cor: estação e noite em passos de 1/32) e depois só desliza; as colunas ficam presas à camada (k*ps)
  let body,lit,snow,snowD,sn,dk,hl;
  const s=stripFor(_rangeStrips[li]||(_rangeStrips[li]=bakeNew()),off,ps,hmax,ps+"|"+hmax+"|"+SEED+"|"+L.sd,nq+"|"+wint.toFixed(3)+"|"+L.body+"|"+L.lit,(k,x)=>{
   if(body===undefined){body=nightCol(L.body,nq);lit=nightCol(L.lit,nq);snow=nightCol(mixHex("#eef4fa","#ffffff",wint),nq);snowD=nightCol("#b9c9dc",nq);sn=L.sn-.22*wint;
    if(L.peaky){dk=nightCol(mixHex(L.body,"#3a4a6c",.5),nq);hl=nightCol(mixHex(L.lit,"#ffffff",.5),nq)}}
   const wx=k*ps,v=ridge(wx,L.sd),v2=ridge(wx+ps*(L.peaky?4:1.5),L.sd),r=L.peaky?.12+.88*v:.3+.7*v,h=Math.max(ps,Math.round(A*L.amp*r/ps)*ps),top=hmax-h,up=v2>v;
   ctx.fillStyle=up?lit:body;ctx.fillRect(x,top,ps,h);
   if(L.peaky){   // ravinas diagonais e arestas (presas à coluna do mundo): dão relevo às faces, sem listras verticais
    for(let y=top+ps*3;y<hmax;y+=ps*2){const g=Math.sin(wx*.021+(hmax-y)/(ps*7.5)+Math.sin(wx*.006+L.sd)*2);
     if(g>.86){ctx.fillStyle=dk;ctx.globalAlpha=up?.3:.5;ctx.fillRect(x,y,ps,ps)}else if(up&&g<-.93){ctx.fillStyle=hl;ctx.globalAlpha=.35;ctx.fillRect(x,y,ps,ps)}}
    ctx.globalAlpha=1}
   if(r>sn*.9){let sh=(r-sn*.9)*A*L.amp*(L.sf||1.6);if(L.peaky)sh*=(up?1:.72)*(.78+.44*vn(wx*.045,L.sd+11));sh=Math.min(h,Math.round(sh/ps)*ps);   // neve irregular: as faces íngremes à sombra soltam neve
    if(sh>0){ctx.fillStyle=up?snow:snowD;ctx.fillRect(x,top,ps,Math.max(ps,sh));}}
  });
  ctx.drawImage(s.cv,Math.round(s.c0*ps-off),Math.round(sky-hmax));
 }
}

// ---------- peças de pixel art ----------
// Paleta do cenário do quadro (hex; nightCol escurece quando for desenhar)
function scenePal(){
 const w=winterAmt();
 return{wint:w,trunk:"#5a3f2a",pL:mixHex("#2f7a45","#e9f2f6",w*.55),pD:mixHex("#1c4f33","#c3d2dc",w*.5),pLb:mixHex("#3b6a52","#cfdde4",w*.4),pDb:mixHex("#27503f","#a9bccb",w*.35),
  lf:SEA.nhh,lfD:SEA.nh,lfb:mixHex(SEA.nh,"#2d4d3f",.4),
  rkL:"#a3a7ae",rkM:"#7c8189",rkD:"#575c66",rkE:"#3f434c",moss:SEA.nh,gr:SEA.g,grH:SEA.h,
  snow:"#f4f8fb",dirt:SEA.d,dirtH:SEA.dh};
}
const TREE_K=2.2;   // fator de tamanho das árvores e pinheiros (altura e largura crescem juntas)
function pxPine(cx,by,hpx,q,P,k,back){   // pinheiro em degraus; back = versão mais escura e fria (fileira de trás)
 hpx*=TREE_K;cx=Math.round(cx);by=Math.round(by);
 const th=Math.max(q,Math.round(hpx*.16/q)*q),R=Math.max(3,Math.round((hpx-th)/q)),mh=Math.max(2,Math.round(hpx*.2/q)),tr=Math.max(2,Math.round(R/3));
 ctx.fillStyle=k(P.trunk);ctx.fillRect(cx-Math.floor(q/2),by-th,q,th);
 const cL=k(back?P.pLb:P.pL),cD=k(back?P.pDb:P.pD),cS=k(P.snow);
 for(let i=0;i<R;i++){
  const hw=Math.max(1,Math.round(mh*((i+1)/R)*(.7+.3*((i%tr)/tr)))),y=by-th-(R-i)*q+q;
  ctx.fillStyle=cL;ctx.fillRect(cx-hw*q,y,hw*q,q);ctx.fillStyle=cD;ctx.fillRect(cx,y,hw*q,q);
  if(P.wint>.25&&i%tr===0){ctx.globalAlpha=P.wint*.85;ctx.fillStyle=cS;ctx.fillRect(cx-hw*q,y,hw*q*2,q);ctx.globalAlpha=1}
 }
}
function pxTree(cx,by,hpx,q,P,k,back){   // árvore de copa redonda (copa nas cores da estação)
 hpx*=TREE_K;cx=Math.round(cx);by=Math.round(by);
 const th=Math.max(q,Math.round(hpx*.36/q)*q),cw=Math.max(2,Math.round(hpx*.28/q)),ch=Math.max(3,Math.round((hpx-th)/q)+1);
 ctx.fillStyle=k(P.trunk);ctx.fillRect(cx-Math.floor(q/2),by-th,q,th);
 const cL=k(back?P.lfb:P.lf),cD=k(back?mixHex(P.lfb,"#10261c",.35):P.lfD);
 for(let i=0;i<ch;i++){
  const hw=Math.max(1,Math.round(cw*Math.sin(Math.PI*(i+.5)/ch))),y=by-hpx+i*q;
  ctx.fillStyle=cL;ctx.fillRect(cx-hw*q,y,hw*q,q);ctx.fillStyle=cD;ctx.fillRect(cx,y,hw*q,q);
 }
}
function pxBush(cx,by,w,q,P,k){cx=Math.round(cx);by=Math.round(by);const n=Math.max(2,Math.round(w/q));for(let i=0;i<2;i++){const hw=n-i;ctx.fillStyle=k(P.lf);ctx.fillRect(cx-hw*q,by-(i+1)*q,hw*q,q);ctx.fillStyle=k(P.lfD);ctx.fillRect(cx,by-(i+1)*q,hw*q,q)}}
function pxBoulder(cx,by,rad,q,P,k){   // pedra grande: meia elipse em degraus, luz à esquerda, musgo em cima
 cx=Math.round(cx);by=Math.round(by);
 const rows=Math.max(2,Math.round(rad*1.15/q));
 for(let i=0;i<rows;i++){
  const d=(rows-i-.5)/rows,hw=Math.max(1,Math.round(rad*Math.sqrt(1-d*d)/q)),y=by-(rows-i)*q,x=cx-hw*q,lw=Math.max(1,Math.round(hw*.8))*q;
  ctx.fillStyle=k(i>rows*.72?P.rkD:P.rkM);ctx.fillRect(x,y,hw*2*q,q);
  ctx.fillStyle=k(P.rkL);ctx.fillRect(x,y,Math.min(lw,hw*2*q),q);
  ctx.fillStyle=k(P.rkE);ctx.fillRect(x+hw*2*q-q,y,q,q);
  if(i===0){ctx.fillStyle=k(P.moss);ctx.fillRect(x,y,hw*2*q,q)}
 }
}
// trilha de terra da passagem da direita: troca a grama da linha 0 (chamada de 5-desenho/06-quadro.js)
function drawPathTop(x,y,ts,tb,c){
 const P=scenePal(),w=P.wint,au=SEA.idx===2?1:0;ctx.save();ctx.translate(x,y);ctx.scale(ts,ts);
 ctx.fillStyle=P.dirt;ctx.fillRect(0,0,tb+1,5);ctx.fillStyle=P.dirtH;ctx.fillRect(0,0,tb+1,2);
 ctx.fillStyle=mixHex("#000000","#6d8aa3",w)+"";ctx.globalAlpha=.18+.17*w;   // marquinhas: terra escura; no inverno sombras azuladas na neve
 for(let i=0;i<3;i++)ctx.fillRect(2+hash(c*3+i,611)*(tb-6),2+hash(c*5+i,613)*2,2,1);
 ctx.globalAlpha=1;
 if(au>.5)for(let i=0;i<2;i++){ctx.fillStyle=hash(c*7+i,617)<.5?"#e0a43a":"#b4532b";ctx.fillRect(1+hash(c*11+i,619)*(tb-4),hash(c*13+i,621)*3,2,1)}   // folhas secas caídas no outono
 if(w>.15){ctx.globalAlpha=Math.min(1,w*1.4);ctx.fillStyle="#f4f8fb";for(let i=0;i<3;i++){const bx=hash(c*17+i,623)*(tb-4);ctx.fillRect(bx,-1,3,1)}ctx.globalAlpha=1}   // montinhos de neve no topo
 ctx.restore();
}

// ---------- cenário preso ao mundo (atrás do chão e do jogador) ----------
// árvores, arbustos e pedras espalhados entre as colunas c0 e c1 (deterministas: não piscam nem mudam ao andar)
const sceneBlocked=c=>(c>=-22&&c<=-11)||(c>=-30&&c<=-22.5)||(c>=CHURCH_C-8.5&&c<=CHURCH_C+8.5)||(c>=CAULDRON_C-1.5&&c<=CAULDRON_C+1.5)||(c>=22&&c<=32)||(c>=FRIV_C0&&c<=FRIV_C1)||(c>=35.5&&c<=41)||c>=BEACH_C0;   // horta, moinho, riacho, fogueira e praia ficam sem árvores aleatórias
const sceneBlockedB=c=>sceneBlocked(c)&&!(c>=FRIV_C0&&c<=FRIV_C1);   // as fileiras de trás passam por cima da água do riacho da floresta (árvores ao fundo, na outra margem)
function sceneScatter(y0,q,P,k,c0,c1,back,dens=1,sd=0,thr0){   // dens = árvores possíveis por coluna (bosque denso da esquerda usa 3); sd = fileira (muda as sementes); thr0 = limiar de vazios
 for(let c=c0;c<=c1;c++){
  const x0=colX(c);if(x0<-T*3||x0>W+T*3||(back?sceneBlockedB(c):sceneBlocked(c)))continue;
  for(let m=0;m<dens;m++){
   const ck=(m===0&&sd===0)?c:c*7+m*131+sd*977,x=x0+(m===0?0:m*T/dens),s=back?hash(ck,911):hash(ck,901),thr=thr0!==undefined?thr0:back?.35:.5;if(s<thr)continue;
   const j=(hash(ck,back?913:903)-.5)*T*.9,kind=hash(ck,back?917:907),hh=T*((back?1.5:1.1)+hash(ck,back?919:909)*1.1)*(back?.8:1);
   if(back){if(kind<.62)pxPine(x+j,y0,hh,q,P,k,true);else pxTree(x+j,y0,hh*.8,q,P,k,true)}
   else if(kind<.45)pxPine(x+j,y0+q,hh,q,P,k,false);
   else if(kind<.72)pxTree(x+j,y0+q,hh*.85,q,P,k,false);
   else if(kind<.88)pxBush(x+j,y0+q,T*.38,q,P,k);
   else pxBoulder(x+j,y0+q,T*.3,q,P,k);
  }
 }
}
// Pedras do lado direito (passagem, riacho, fogueira e praia): pedras isoladas e grupos de três de tamanhos variados no cenário de fundo, mais duas pilhas de pedras (cairns)
const stonesBlocked=c=>isRiver(c)||(c>=BOARD_C-1&&c<=BOARD_C+1)||(c>=WELL_C-1&&c<=WELL_C+1)||(c>=CAMP_C-2.4&&c<=CAMP_C+2.4)||(c>=LIGHT_C-1.2&&c<=LIGHT_C+1.2)||c>=PIER_C-1;
const CAIRNS_R=[21.8,33.6];
function sceneStones(y0,q,P,k){
 for(let c=HALF+2;c<=SURF_R;c++){
  const x0=colX(c);if(x0<-T*3||x0>W+T*3||stonesBlocked(c))continue;
  if(hash(c,961)<.86)continue;   // poucas pedras isoladas ao longo da passagem
  const x=x0+(hash(c,962)-.5)*T*.9,r=T*(.18+hash(c,964)*.26);
  pxBoulder(x,y0+q,r,q,P,k);
  if(hash(c,963)>.85){pxBoulder(x+r*1.15,y0+q,r*.6,q,P,k);pxBoulder(x-r*.9,y0+q,r*.45,q,P,k)}   // grupo: uma grande e duas pequenas coladas
 }
 for(const c of CAIRNS_R)drawCairn(y0,q,P,k,c);
}
function drawScenery(t){
 const y0=Math.round(rowY(0));if(y0<=8)return;
 const q=Math.max(.75,Math.round(baseTile()/11)*worldZoom),night=nightAmt(),A=H*SURF,P=scenePal(),k=hx=>nightCol(hx,night);
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,y0);ctx.clip();ctx.imageSmoothingEnabled=false;
 // a grande montanha fica no fim da trilha da esquerda (espelhada, sem nada nela); à direita o cenário termina no mar (13-paisagem.js)
 // cordilheira alta da esquerda (área estendida): duas fileiras de picos que passam do topo da tela, com neve; a de trás é mais clara e fria
 // As montanhas são fundo distante: forma, tamanho E velocidade de rolagem fixos, sem depender do zoom (que varia enquanto se anda para a esquerda e fazia a montanha "esticar").
 // x = centro + (w-SURF_L)*Tm + (SURF_L-camX)*Tp -> o pé da montanha em SURF_L anda a Tp px por coluna, linear, e chega ao centro junto com o jogador no fim da trilha.
 // Para isso troca por um instante a escala T e a câmera por uma câmera "de fundo".
 const T0=T,cam0=camX,Tm=baseTile()*zoomPreference,Tp=Tm*.6,qm=Math.max(.75,Math.round(baseTile()/11)*zoomPreference);
 T=Tm;camX=cam0<=-30?SURF_L-(SURF_L-cam0)*.25:SURF_L-(SURF_L+30)*.25+(cam0+30)*1.6;   // a montanha gigante rola bem devagar (.25) na floresta; depois do moinho (-30) passa a sair da tela rápido (1.6) e some antes da casa: nunca aparece na praia
 giantMountain(y0,qm,A,P,k,t,-90,Tm);
 T=Tm;camX=SURF_L-(SURF_L-cam0)*Tp/Tm;
 tallRange(y0,qm,A,P,k,SURF_L-14,-40,31,1.45,["#a4b4d0","#7d90b3","#5b6f93"],1.02);
 tallRange(y0,qm,A,P,k,SURF_L-10,-50,57,1.12,["#7584a4","#52617f","#37455f"],.86);
 bigMountain(y0,qm,A,P,k,SURF_L-.5,true);
 T=T0;camX=cam0;
 for(const c of CAIRNS)drawCairn(y0,q,P,k,c);
 // fileira de trás (árvores menores e mais frias) e depois a da frente, nos trechos livres das trilhas
 // À esquerda: bosque bem denso, com três fileiras (duas de trás e a da frente) e várias árvores por coluna; à direita a mata continua rala.
 sceneScatter(y0,q,P,k,SURF_L-16,-HALF-1,true,3,0,.25);sceneScatter(y0,q,P,k,SURF_L-16,-HALF-1,true,2,1,.25);sceneScatter(y0,q,P,k,HALF+2,SURF_R-1,true);
 sceneScatter(y0,q,P,k,SURF_L-16,-HALF-2,false,3,0,.3);sceneScatter(y0,q,P,k,HALF+2,SURF_R-1,false);
 sceneStones(y0,q,P,k);   // mais pedras à direita
 // árvores nas margens do riacho da floresta: uma de cada lado, maiores que as do bosque, e a mata fecha em volta (só a água fica sem árvores)
 for(const[cc,sd]of[[FRIV_C0-.9,1],[FRIV_C1+.9,2],[FRIV_C0-2.1,3],[FRIV_C1+2.2,4]]){const x=colX(cc);if(x<-T*3||x>W+T*3)continue;const hh=T*(1.5+hash(sd,951)*.6);if(sd<3)pxTree(x,y0+q,hh,q,P,k,false);else pxPine(x,y0+q,hh*.9,q,P,k,false)}
 ctx.restore();
}

// ---------- cordilheira alta e marcos da esquerda estendida ----------
const CAIRNS=[-58,-74,-99.5];   // pilhas de pedras à beira da trilha (só visual)
const _rangeCache={};
// Montanha gigantesca ao fundo da esquerda: bem mais larga e alta que as outras, passa do topo da tela (voando alto dá para ver o cume), com neve e geleira no alto, estratos de rocha, névoa no pé e nuvens enroladas na encosta.
// Cores azuladas e claras de montanha muito distante (perspectiva atmosférica). Desenhada com a câmera de fundo própria (ver drawScenery).
// Perfil de uma montanha (u = 0 no pé, 1 no cume): ombros largos e ponta íngreme (curva em S) com rochedos irregulares, em vez de um triângulo reto
function mtnShape(u,w,c){const s=u*u*(3-2*u),b=.5*s+.5*Math.pow(u,1.15);return b*(1+(vn(w*.55,Math.floor(c)+5)-.5)*.3*Math.min(1,u*2.2)+(vn(w*1.5,Math.floor(c)+9)-.5)*.1*Math.min(1,u*3))}
function giantMountain(y0,q,A,P,k,t,wp,Tm){
 const peaks=[[wp,.88,24],[wp-17,.62,13],[wp+15,.66,15],[wp+29,.44,10],[wp-30,.48,11]];   // [coluna do pico, altura (fração do céu), meia-largura em colunas]
 const hOf=w=>{let h=0;for(const[c,a,hw]of peaks){const u=1-Math.abs(w-c)/hw;if(u>0)h=Math.max(h,a*mtnShape(u,w,c))}return h*A*(1+.035*Math.sin(w*1.7)+.025*Math.sin(w*4.3+1)+.015*Math.sin(w*9.1))};
 if(colX(wp+42)<=0||colX(wp-42)>=W)return;
 bakedCols("giant",wp+"|"+q+"|"+A+"|"+Tm,nq32()+"|"+P.wint.toFixed(3),Math.ceil(A*.88*1.32)+q*2,y0,(y0,k)=>{
 const lit=k(mixHex("#b9c6dc","#e4ecf6",P.wint*.4)),shade=k("#8d9db9"),deep=k("#6a7b9a"),band=k("#7889a8"),sL=k("#f6f9fc"),sD=k("#c9d6e8"),haze=k("#d6e3f0"),snowAt=A*(.66-.2*P.wint);
 worldCols(q,wp-42,wp+42,(w,x,cw)=>{
  const h=Math.round(hOf(w)/q)*q;if(h<=0)return;
  const up=hOf(w+.5)>hOf(w-.5),top=y0-h;
  ctx.fillStyle=up?lit:shade;ctx.fillRect(x,top,cw,h);
  for(let y=Math.max(top+q*2,y0-A*1.3);y<y0;y+=q*2){   // estratos de rocha (faixas horizontais) e ravinas em diagonal
   const hh=(y0-y)/A,v=Math.sin(w*1.6+(y0-y)/(Tm*.7)+Math.sin(w*.5)*1.6);
   if(v>.84){ctx.fillStyle=deep;ctx.globalAlpha=.4;ctx.fillRect(x,y,cw,q);ctx.globalAlpha=1}
   else if(Math.sin(hh*34+Math.floor(w*.5))>.93){ctx.fillStyle=band;ctx.globalAlpha=.3;ctx.fillRect(x,y,cw,q);ctx.globalAlpha=1}
  }
  if(h>snowAt){const wq=Math.floor(w*3),sh=Math.round(((h-snowAt)*.95+hash(wq,37)*q*5)/q)*q;ctx.fillStyle=up?sL:sD;ctx.fillRect(x,top,cw,Math.min(h,Math.max(q,sh)));
   if(h>snowAt+A*.22&&hash(wq,39)>.55){ctx.fillStyle=up?sD:k("#b3c4dc");ctx.globalAlpha=.6;ctx.fillRect(x,top+Math.round(sh*.5/q)*q,cw,Math.round(sh*.45/q)*q);ctx.globalAlpha=1}}   // geleira: línguas de gelo mais azuladas descendo da neve
  ctx.fillStyle=haze;ctx.globalAlpha=.4;ctx.fillRect(x,y0-Math.round(A*.16/q)*q,cw,Math.round(A*.16/q)*q);ctx.globalAlpha=1;   // névoa no pé
 });
 });
 const xc=colX(wp);ctx.fillStyle=k("#ffffff");   // nuvens enroladas na encosta, andando devagar
 for(let i=0;i<5;i++){const cy=y0-A*(.42+i*.1),cw=Tm*(6+i*1.4),cx=xc+Math.sin(t*.04+i*1.9)*Tm*(10+i*2.5),hh=Math.max(q,Math.round(A*.012/q)*q);
  ctx.globalAlpha=.42;ctx.fillRect(Math.round(cx-cw/2),Math.round(cy),Math.round(cw),hh);ctx.fillRect(Math.round(cx-cw*.35),Math.round(cy-hh),Math.round(cw*.7),hh);ctx.fillRect(Math.round(cx-cw*.2),Math.round(cy-hh*2),Math.round(cw*.4),hh);ctx.globalAlpha=1}
}
function tallRange(y0,q,A,P,k,w0,w1,sd,amp,cols,snowF){   // picos presos ao mundo entre as colunas w0 e w1; amp = altura máxima em frações do céu (passa de 1: o pico sai da tela)
 const key=sd+":"+w0+":"+w1;let pk=_rangeCache[key];
 if(!pk){pk=[];for(let c=w0,i=0;c<w1;c+=10+hash(i,sd)*7,i++)pk.push([c+(hash(i,sd+1)-.5)*4,amp*(.55+hash(i,sd+2)*.45),7+hash(i,sd+3)*7]);_rangeCache[key]=pk}
 if(colX(w1+10)<=0||colX(w0-10)>=W)return;
 const hOf=w=>{let h=0;for(const[c,a,hw]of pk){const t=1-Math.abs(w-c)/hw;if(t>0)h=Math.max(h,a*mtnShape(t,w,c))}return h*A*(1+.05*Math.sin(w*2.9+sd)+.035*Math.sin(w*6.7+2))};
 bakedCols("t"+sd,w0+"|"+w1+"|"+amp+"|"+snowF+"|"+q+"|"+A,nq32()+"|"+P.wint.toFixed(3)+"|"+cols,Math.ceil(A*amp*1.32)+q*2,y0,(y0,k)=>{
 const lit=k(cols[0]),shade=k(cols[1]),deep=k(cols[2]),sL=k("#f4f8fb"),sD=k("#c3d1e3"),wint=P.wint,snowAt=A*(snowF-.15*wint);
 worldCols(q,w0-10,w1+10,(w,x,cw)=>{
  const h=Math.round(hOf(w)/q)*q;if(h<=0)return;
  const up=hOf(w+.4)>hOf(w-.4),top=y0-h;
  ctx.fillStyle=up?lit:shade;ctx.fillRect(x,top,cw,h);
  for(let y=Math.max(top+q*2,y0-A*1.1);y<y0;y+=q){const v=Math.sin(w*2.2+(y0-y)/(T*.6)+Math.sin(w*.65+sd)*1.5);if(v>.82){ctx.fillStyle=deep;ctx.globalAlpha=.4;ctx.fillRect(x,y,cw,q);ctx.globalAlpha=1}}
  if(h>snowAt){const wq=Math.floor(w*4),sh=Math.round(((h-snowAt)*.9+hash(wq,sd)*q*3)/q)*q;ctx.fillStyle=up?sL:sD;ctx.fillRect(x,top,cw,Math.min(h,Math.max(q,sh)))}
 });
 });
}
function drawCairn(y0,q,P,k,c){   // três pedras empilhadas
 const x=colX(c);if(x<-T*2||x>W+T*2)return;
 pxBoulder(x,y0+q,T*.5,q,P,k);pxBoulder(x+q,y0+q-T*.52,T*.34,q,P,k);pxBoulder(x-q,y0+q-T*.84,T*.2,q,P,k);
}
// Grande montanha à direita: sobe logo depois da última coluna andável (SURF_R) e ocupa o fundo até o limite da câmera. Sem portas nem estruturas: só rocha, neve e floresta no pé.
function bigMountain(y0,q,A,P,k,B,mir){   // mir = espelhada (usada à esquerda: sobe depois de SURF_L)
 const C=B+5,L0=B-7,R0=C+11,sg=mir?-1:1,e0=mir?2*B-R0:L0,e1=mir?2*B-L0:R0;if(colX(e1)<=0||colX(e0)>=W)return;
 const PK=A*.56,wint=P.wint,snowAt=PK*(.72-.22*wint);   // bem abaixo da altura do céu: deixa as cordilheiras do fundo (o Everest) aparecerem por cima
 const prof=w0=>{const w=mir?2*B-w0:w0,t=w<=C?(w-L0)/(C-L0):1-(w-C)/(R0-C);return t<=0?0:mtnShape(Math.min(1,t),w0,B)};
 const hOf=w=>PK*prof(w)*(1+.05*Math.sin(w*2.3)+.035*Math.sin(w*5.9+1));
 bakedCols("big"+(mir?"m":"r")+B,B+"|"+q+"|"+A,nq32()+"|"+P.wint.toFixed(3),Math.ceil(PK*1.32)+q*2,y0,(y0,k)=>{
 const lit=k("#9a928d"),shade=k("#615952"),deep=k("#3b342f"),hi=k("#c4bcb4"),sL=k("#fbfcfd"),sD=k("#cdd8e6");
 worldCols(q,e0,e1,(w,x,cw)=>{
  const h=Math.round(hOf(w)/q)*q;if(h<=0)return;
  const up=hOf(w+.45)>hOf(w-.45),top=y0-h;   // encosta voltada para a luz (esquerda) ou para a sombra
  ctx.fillStyle=up?lit:shade;ctx.fillRect(x,top,cw,h);
  for(let y=top+q*2;y<y0;y+=q){   // ravinas e cristas em diagonal (presas ao mundo): dão volume à encosta
   const v=Math.sin(w*2.1+(y0-y)/(T*.55)+Math.sin(w*.7)*1.5);
   if(v>.8){ctx.fillStyle=deep;ctx.globalAlpha=.4;ctx.fillRect(x,y,cw,q);ctx.globalAlpha=1}
   else if(v<-.93){ctx.fillStyle=hi;ctx.globalAlpha=.35;ctx.fillRect(x,y,cw,q);ctx.globalAlpha=1}
  }
  if(h>snowAt){const wq=Math.floor(w*4),sh=Math.round(((h-snowAt)*.85+hash(wq,29)*q*3)/q)*q;ctx.fillStyle=up?sL:sD;ctx.fillRect(x,top,cw,Math.min(h,Math.max(q,sh)))}
 });
 });
 // pedras caídas no pé da encosta e floresta de pinheiros (a trilha termina aqui)
 pxBoulder(colX(B-sg*.05),y0+q,T*.62,q,P,k);pxBoulder(colX(B+sg*.55),y0+q,T*.45,q,P,k);pxBoulder(colX(B-sg*1.4),y0+q,T*.4,q,P,k);
 for(let o=-6;o<3;o+=.6){const w=B+sg*o,j=hash(Math.floor(w*5),71);if(j<.3)continue;
  const x=colX(w+(j-.5)*.4),hh=T*(1.0+hash(Math.floor(w*5),73)*1.2)*(o>0?.7:1);if(x<-T||x>W+T)continue;
  if(j>.6)pxPine(x,y0+q,hh,q,P,k,true);else pxPine(x,y0+q,hh*.85,q,P,k,false)}
}

// ===== 5-desenho/12-povoado.js — Cama, lamparina da carrocinha da loja, poço de água, ferraria alemã de enxaimel, quadro de contratos e caça-níquel na superfície =====
// Tudo em pixel art (mkSpr, 00-pixel.js) e posições em colunas fixas (02-camadas-minerios.js).
// ---------- cama (volta ao lugar de antes, ao lado da mesa de trabalho) ----------
function sprBed(){return mkSpr("bed",20,9,Object.assign({c:"#e4dcc4",C:"#f6f0dc",B:"#3f6fd0",L:"#6f98f0",D:"#2d4fa0",f:"#fbfaf4",F:"#d8d3c0"},WOOD),R=>{
 R(0,0,2,9,"w");R(0,0,1,9,"d");R(18,3,2,6,"w");R(19,3,1,6,"d");R(0,0,2,1,"W");R(18,3,2,1,"W");   // cabeceira e pé
 R(2,5,16,1,"W");R(2,6,16,1,"w");R(2,7,16,2,"d");                          // estrado
 R(2,3,16,2,"c");R(2,3,16,1,"C");                                           // colchão
 R(8,2,10,3,"B");R(8,2,10,1,"L");R(8,4,10,1,"D");R(8,3,1,2,"L");            // cobertor com dobra
 R(3,1,5,2,"f");R(3,2,5,1,"F");                                            // travesseiro
},1)}
function drawBed(t){
 const u=pu(),s=sprBed(),c=Math.round(colX(BED_C)),y=Math.round(rowY(0));
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);
 if(atSurface()&&c>-60)lbl(nearBed()?__("Salvo!"):__("Cama"),Math.max(c,34),y-(s.h+3)*u-Math.sin(t*4)*2,nearBed()?"#6fe3a0":"#ffd45c");
}

// ---------- lamparina da carrocinha da loja: haste de madeira sobre o toldo, braço, corrente e lamparina de vidro (sem poste separado) ----------
const SHOP_LAMP={dx:-6.5,dy:23};   // centro da lamparina em pixels de sprite, em relação ao centro da carrocinha e à base
function shopLampPos(){const u=pu();return{x:forgeFx(SHOP_C)+Math.round(SHOP_LAMP.dx*u),y:rowY(0)-SHOP_LAMP.dy*u}}
function drawShopLamp(t){
 const u=pu(),c=forgeFx(SHOP_C),y=Math.round(rowY(0)),n=nightAmt();if(c<-T*5||c>W+T*5)return;
 const x0=c-11*u,y0=y-19*u,L=shopLampPos(),lx=L.x,ly=L.y,fl=.92+.08*Math.sin(t*7+SHOP_C*3);
 PX(x0+1*u,y0-9*u,u,9*u,"#7a4f27");PX(x0+1*u,y0-9*u,.4*u,9*u,"#b27a3a");           // haste de madeira presa ao canto do toldo
 PX(x0+1*u,y0-9*u,4*u,u,"#7a4f27");PX(x0+2*u,y0-8*u,u,u,"#4a2f16");                // braço e mão-francesa
 PX(x0+4*u,y0-8*u,u,u,"#8d9299");PX(x0+3*u,y0-7*u,3*u,u,"#3a3a44");               // corrente e tampa
 PX(x0+3*u,y0-6*u,3*u,3*u,"#241609");PX(x0+4*u,y0-6*u,u,2*u,n>.03?"#fff3c4":"#ffd98a");PX(x0+3*u,y0-3*u,3*u,u,"#3a3a44");   // vidro com chama e base
 if(n>.03){
  const r=T*3,gr=ctx.createRadialGradient(lx,ly,0,lx,ly,r);gr.addColorStop(0,"rgba(255,214,130,"+(.5*n*fl).toFixed(3)+")");gr.addColorStop(.35,"rgba(255,196,100,"+(.2*n*fl).toFixed(3)+")");gr.addColorStop(1,"rgba(255,180,80,0)");
  ctx.fillStyle=gr;ctx.fillRect(lx-r,ly-r,r*2,r*2);
  ctx.fillStyle="rgba(255,205,120,"+(.18*n*fl).toFixed(3)+")";ctx.beginPath();ctx.ellipse(lx,y-u*.3,T*1.7,u*1.4,0,0,7);ctx.fill();
  ctx.fillStyle="rgba(255,250,200,"+(.85*n).toFixed(3)+")";ctx.fillRect(Math.round(lx-u),Math.round(ly-1.5*u),Math.round(2*u),Math.round(3*u));
 }
}
function lampHoles(g,k,d){   // chamado por nightLayer (04-combo-efeitos.js): abre a escuridão em volta da lamparina da carrocinha e das outras luzes
 g.globalCompositeOperation="destination-out";
 {const L=shopLampPos();if(L.x>=-T*6&&L.x<=W+T*6){
  const cx=L.x*k,cy=L.y*k,r=T*3.6*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
  for(const[o,a]of[[0,.93],[.35,.85],[.6,.5],[.82,.18],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
  g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2)}}
 forgeHoles(g,k);campfireHoles(g,k);lighthouseHoles(g,k);pierHoles(g,k);churchHoles(g,k);potHoles(g,k);
 g.globalCompositeOperation="source-over";
}

// ---------- ferraria medieval alemã (Fachwerk): base de pedra, parede de enxaimel, telhado alto de telhas, chaminé de pedra e lanterna de ferro ----------
// Cobre a cama, a mesa e a fornalha. Aberta na frente (as estruturas continuam à vista); a parede de enxaimel fica ao fundo.
const FORGE_H=24,FORGE_TOP=44;   // altura da viga (em pixels de sprite) e topo da chaminé
const FORGE_LAN={dx:-6,dy:19.5};    // lanterna: deslocamento em relação ao pilar e altura (pixels de sprite)
const forgeFx=c=>Math.round(colX(0))+Math.round(c*T);   // coluna -> x da tela com UM só arredondamento (âncora) e deslocamentos inteiros: nada treme entre si ao andar
function forgeLantern(){const u=pu();return{x:forgeFx(FORGE_LANTERN_C)+Math.round(FORGE_LAN.dx*u),y:rowY(0)-FORGE_LAN.dy*u}}
function forgeStackTopY(){return rowY(0)-FORGE_TOP*pu()}
const _forgeSlot=bakeNew();
function drawForge(t){
 const u=pu(),y=Math.round(rowY(0)),n=nightAmt(),P=FORGE_PILLARS,xl=forgeFx(P[0]),xr=forgeFx(P[P.length-1]);
 if(xr<-T*8||xl>W+T*8)return;
 const R=(x,yy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(yy),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 const hs=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
 const TB="#4a2f16",TH="#6b4423",TD="#2f1c0e",ST=["#8d8984","#9a968f","#7f7b76","#a39e96"];   // madeira escura do enxaimel e pedras
 const by=y-FORGE_H*u,pl=7*u,wl=xl-Math.round(1.5*u),ww=xr-xl+Math.round(3*u),wallTop=by+2*u;

 const paintForgeStatic=()=>{
 // ---- 1. embasamento de pedra ao longo de toda a parede dos fundos
 R(wl,y-pl,ww,pl,"#4f4c48");
 [[0,2],[2,2],[4,3]].forEach(([r0,h],r)=>{
  let x=wl-(r%2)*2*u,ix=0;const yy=y-pl+r0*u;   // ix: índice da pedra na fileira (o padrão fica preso à parede, não à tela)
  while(x<wl+ww){const w=Math.round((4+hs(ix+r*7,r)*4)*u),x1=Math.max(x,wl),x2=Math.min(x+w,wl+ww);
   if(x2>x1){const c=ST[Math.floor(hs(ix,r+3)*ST.length)];R(x1,yy,x2-x1-Math.max(1,Math.round(u*.5)),h*u-Math.max(1,Math.round(u*.5)),c);R(x1,yy,x2-x1-Math.max(1,Math.round(u*.5)),Math.max(1,Math.round(u*.5)),"#b8b3aa")}
   x+=w;ix++}
 });
 // ---- 1b. chão da casa: tábuas de madeira (cama e mesa) e lajes de pedra junto da fornalha; pisa-se sobre ele ao nível do chão
 {const fh=4*u,xa=wl,xm=forgeFx(P[2]),xe=wl+ww,jw=Math.max(1,Math.round(u*.5));
  R(xa,y,xm-xa,fh,"#8a5a2b");R(xa,y,xm-xa,u,"#b27a3a");R(xa,y+fh-u,xm-xa,u,"#3a2410");   // tábuas: luz em cima, sombra embaixo
  for(let x=xa+6*u,ix=0;x<xm-2*u;x+=Math.round((7+hs(ix,41)*6)*u),ix++){R(x,y+u,jw,fh-2*u,"#4a2f16");if(hs(ix,43)>.5)R(x+2*u,y+u*2,u,u,"#2f3238")}   // juntas das tábuas e pregos
  R(xm,y,xe-xm,fh,"#8d8984");R(xm,y,xe-xm,u,"#b8b3aa");R(xm,y+fh-u,xe-xm,u,"#625f5b");   // lajes de pedra no canto da fornalha
  for(let x=xm+5*u,ix=0;x<xe-2*u;x+=Math.round((6+hs(ix,47)*5)*u),ix++)R(x,y+u,jw,fh-2*u,"#625f5b");
  R(xm-u,y,2*u,fh,"#3a2410");   // emenda entre a madeira e a pedra
 }
 // ---- 2. painéis de reboco entre os pilares, com enxaimel: montantes, travessa no meio e escoras em diagonal
 const railY=y-pl-7*u,lowTop=railY+Math.round(1.5*u),lowH=y-pl-lowTop,upH=railY-wallTop;
 let gi=0;
 for(let i=0;i<P.length-1;i++){
  const a=forgeFx(P[i])+Math.round(1.5*u),b=forgeFx(P[i+1])-Math.round(1.5*u),wd=b-a,m=Math.max(2,Math.round(wd/(11*u))),sw=wd/m;
  for(let k=0;k<m;k++,gi++){
   const sx=Math.round(a+k*sw),ex=Math.round(a+(k+1)*sw),w=ex-sx,pc=["#e8dfc6","#e2d8bd","#ebe2cb"][Math.floor(hs(gi,2)*3)];
   R(sx,wallTop,w,y-pl-wallTop,pc);
   R(sx,wallTop,w,2*u,"rgba(0,0,0,.14)");R(sx,y-pl-2*u,w,2*u,"rgba(90,70,40,.18)");   // sombra do beiral e sujeira junto à pedra
   R(sx+hs(gi,4)*w*.6+u,wallTop+(2+hs(gi,5)*3)*u,u,u,"#cfc3a3");R(sx+hs(gi,6)*w*.6+u,lowTop+(1+hs(gi,7)*3)*u,u,u,"#cfc3a3");   // manchas de reboco
   const dir=gi%2;   // escora em diagonal nos painéis de baixo, alternando o lado
   for(let x=0;x<w;x+=u){const f=x/w,yy=dir?lowTop+lowH*(1-f):lowTop+lowH*f;
    const cy=Math.min(Math.max(yy-.75*u,lowTop),lowTop+lowH-1.5*u);R(sx+x,cy,u,1.5*u,TB);R(sx+x,cy,u,Math.max(1,Math.round(u*.5)),TH)}
  }
  // montantes de cada painel e travessa horizontal
  for(let k=0;k<=m;k++){const x=Math.round(a+k*sw);R(x-.75*u,wallTop,1.5*u,y-pl-wallTop,TB);R(x-.75*u,wallTop,Math.max(1,Math.round(u*.5)),y-pl-wallTop,TH)}
  R(a,railY,wd,1.5*u,TB);R(a,railY,wd,Math.max(1,Math.round(u*.5)),TH);
 }
 // ---- 3. pilares: pé de pedra e poste de madeira escura com escoras (Kopfbänder) subindo até a viga
 P.forEach((col,i)=>{
  const x=forgeFx(col);
  R(x-2.5*u,y-pl,5*u,pl,"#8d8984");R(x-2.5*u,y-pl,5*u,u,"#b8b3aa");R(x-2.5*u,y-pl,u,pl,"#a39e96");R(x+1.5*u,y-pl,u,pl,"#625f5b");R(x-.5*u,y-pl+3*u,u,u,"#625f5b");   // pé de pedra
  R(x-1.5*u,by-u,3*u,FORGE_H*u-pl+u,TB);R(x-1.5*u,by-u,u,FORGE_H*u-pl+u,TH);R(x+.5*u,by-u,u,FORGE_H*u-pl+u,TD);   // poste
  R(x-2*u,y-pl-u,4*u,u,TD);R(x-2*u,by+3*u,4*u,u,TD);   // sapatas
  for(let k=0;k<3;k++)R(x-.5*u,y-pl-(4+k*3)*u,u,u,TH);   // entalhes decorativos
  for(let k=0;k<6;k++){if(i<P.length-1)R(x+1.5*u+k*u,by+(7-k)*u,u*1.3,u*1.5,TB);if(i>0)R(x-2.8*u-k*u,by+(7-k)*u,u*1.3,u*1.5,TB)}   // escoras (só para dentro da casa: a de fora dos pilares das pontas ficava solta no ar)
 });
 // ---- chaminé de pedra por DENTRO da casa: sobe da fornalha atrás dos pilares e da viga; o telhado fica na frente dela e só a ponta aparece saindo da cumeeira
 const sF=sprFurnace(),cF=Math.round(colX(FURN_C)),y0F=Math.round(y-sF.h*u),csx=cF-Math.round(sF.w*u/2)+10*u,csw=5*u,ctop=y-Math.round(FORGE_TOP*u);
 R(csx,ctop,csw,y0F-ctop+u,"#8a7868");R(csx,ctop,u,y0F-ctop+u,"#a99886");R(csx+csw-u,ctop,u,y0F-ctop+u,"#66574b");   // corpo
 for(let yy=ctop+3*u,r=0;yy<y0F;yy+=3*u,r++){R(csx,yy,csw,Math.max(1,Math.round(u*.7)),"#66574b");R(csx+((r%2)?1:3)*u,yy-3*u,Math.max(1,Math.round(u*.7)),3*u,"#66574b")}   // juntas das pedras
 R(csx-u,ctop-u,csw+2*u,2*u,"#a99886");R(csx-u,ctop+u,csw+2*u,Math.max(1,Math.round(u*.7)),"#66574b");R(csx+u,ctop-u,csw-2*u,Math.round(u*.8),"#1c120c");   // boca com tampa e fuligem
 // ---- 4. viga superior (Rähm) e telhado alto de telhas vermelhas, com as pontas inclinadas (por cima da chaminé)
 R(xl-2*u,by-u,xr-xl+4*u,3*u,TB);R(xl-2*u,by-u,xr-xl+4*u,Math.max(1,Math.round(u*.6)),TH);R(xl-2*u,by+u,xr-xl+4*u,u,TD);
 const rb=by-2*u,rows=11,L0=xl-6*u,Wd=xr-xl+12*u,TC=["#a8452f","#9a3b28","#b24f36","#8f3524"],TW=Math.round(3*u);
 R(L0,rb,Wd,Math.round(1.5*u),TD);R(L0,rb,Wd,Math.max(1,Math.round(u*.5)),TB);   // beiral
 for(let j=0;j<rows;j++){
  const yy=rb-(j+1)*u,left=L0+j*u,right=L0+Wd-j*u,off=(j%2)*Math.round(1.5*u);
  for(let k=-1;;k++){const b0=L0+off+k*TW;if(b0>=right)break;const sx=Math.max(b0,left),ex=Math.min(b0+TW,right);if(ex<=sx)continue;
   R(sx,yy,ex-sx,u,TC[Math.floor(hs(k+j*13,j)*TC.length)]);R(ex-Math.max(1,Math.round(u*.4)),yy,Math.max(1,Math.round(u*.4)),u,"rgba(0,0,0,.30)");R(sx,yy+u-Math.max(1,Math.round(u*.4)),ex-sx,Math.max(1,Math.round(u*.4)),"rgba(0,0,0,.28)")}
  R(left,yy,Math.max(1,Math.round(u*.7)),u,"#4a1c10");R(right-Math.max(1,Math.round(u*.7)),yy,Math.max(1,Math.round(u*.7)),u,"#3a140b");   // arestas das pontas
 }
 const ridge=rb-rows*u;R(L0+rows*u-u,ridge-Math.round(u*1.2),Wd-2*rows*u+2*u,Math.round(1.6*u),"#5a2418");R(L0+rows*u-u,ridge-Math.round(u*1.2),Wd-2*rows*u+2*u,Math.max(1,Math.round(u*.6)),"#7a3424");   // cumeeira
 R(csx-u,ridge-Math.round(2.2*u),csw+2*u,Math.round(1.6*u),"#6d7077");R(csx-u,ridge-Math.round(2.2*u),csw+2*u,Math.max(1,Math.round(u*.5)),"#9aa0a8");   // colar de chumbo: a chaminé sai de dentro do telhado
 };
 // Partes 1 a 4 (embasamento, chão, painéis, pilares, chaminé e telhado) não mudam com o tempo: são pré-renderizadas (00b-cache.js) e só deslizam com a câmera.
 // A caixa [bx0,by0] é relativa à âncora (xl,y); a forma só muda com o tamanho do pixel (u) e o tile (T).
 const bx0=xl-Math.round(9*u),by0=y-Math.round((FORGE_TOP+4)*u),bw=xr-xl+Math.round(18*u),bh=y+Math.round(6*u)-by0;
 const fslot=_forgeSlot,fk=u.toFixed(3)+"|"+T.toFixed(3)+"|"+(xr-xl)+"|"+(Math.round(colX(FURN_C))-xl);
 if(fslot.gk!==fk||!fslot.cv){
  bakeOn(fslot,bw,bh,()=>{ctx.translate(-bx0,-by0);paintForgeStatic()});
  fslot.gk=fk;fslot.x0=bx0-xl;fslot.y0=by0-y;
 }
 ctx.drawImage(fslot.cv,xl+fslot.x0,y+fslot.y0);
 // ---- 5. lanterna de ferro forjado no pilar do meio (braço com voluta, corrente, vidro e chama)
 {const px0=forgeFx(FORGE_LANTERN_C),Lt=forgeLantern(),ly=Math.round(Lt.y),swy=Math.sin(t*1.6)*u*.4,lx=Math.round(Lt.x+swy),fl=.9+.1*Math.sin(t*8.3)+.04*Math.sin(t*13.1),ay=ly-3*u,IR="#2f3238",ax=Lt.x;
  R(ax-u,ay,px0-1.5*u-(ax-u),u,IR);R(ax-u,ay,u,2*u,IR);R(ax,ay+u,u,u,IR);   // braço (para o lado da cama) e voluta
  for(let k=0;k<3;k++)R(px0-2.5*u-k*u,ay+(k+1)*u,u,u,IR);   // mão-francesa de ferro
  R(lx-.5*u,ay+u,u,Math.max(1,ly-2.5*u-ay-u),"#8d9299");   // corrente
  R(lx-u,ly-2.5*u,2*u,u,IR);R(lx-2*u,ly-1.5*u,4*u,u,IR);   // telhadinho
  R(lx-2*u,ly-.5*u,4*u,3*u,IR);R(lx-1.5*u,ly,3*u,2*u,n>.03?"#ffd98a":"#e8d7a0");   // armação e vidro
  R(lx-.5*u,ly,u,2*u,fl>.95?"#ffb43a":"#ff9a3a");R(lx-.5*u,ly,u,u,"#fff3c4");R(lx-2*u,ly+2.5*u,4*u,u,IR);R(lx-.5*u,ly+3.5*u,u,u,IR);   // chama, base e pino
  if(n>.03){
   const r=T*3.4,gr=ctx.createRadialGradient(lx,ly+u,0,lx,ly+u,r);gr.addColorStop(0,"rgba(255,214,130,"+(.5*n*fl).toFixed(3)+")");gr.addColorStop(.35,"rgba(255,196,100,"+(.2*n*fl).toFixed(3)+")");gr.addColorStop(1,"rgba(255,180,80,0)");
   ctx.fillStyle=gr;ctx.fillRect(lx-r,ly+u-r,r*2,r*2);
   ctx.fillStyle="rgba(255,250,200,"+(.85*n).toFixed(3)+")";ctx.fillRect(lx-u,ly,2*u,2*u);
  }
 }
 // ---- 6. placa de ferreiro (bigorna) pendurada no pilar da ponta esquerda, para fora
 {const x0p=forgeFx(P[0]),sw=Math.round(Math.sin(t*1.3)*u*.4),ay=by+5*u,IR="#2f3238";
  R(x0p-9*u,ay,8*u,u,IR);R(x0p-9*u,ay,u,2*u,IR);for(let k=0;k<3;k++)R(x0p-3*u-k*u,ay+(k+1)*u,u,u,IR);   // braço, voluta e escora
  R(x0p-8*u+sw,ay+u,u,2*u,"#8d9299");R(x0p-3*u+sw,ay+u,u,2*u,"#8d9299");   // correntes
  const bx=x0p-10*u+sw,bY=ay+3*u;
  R(bx,bY,9*u,7*u,"#7a4f27");R(bx,bY,9*u,u,"#b27a3a");R(bx,bY+6*u,9*u,u,TD);R(bx+u,bY+u,7*u,5*u,"#d8b878");
  R(bx+2*u,bY+2*u,5*u,u,"#1c120c");R(bx+u,bY+2*u,u,u,"#1c120c");R(bx+3*u,bY+3*u,2*u,u,"#1c120c");R(bx+2*u,bY+4*u,4*u,u,"#1c120c");   // bigorna
 }
 // ---- 7. sombra do telhado no chão (leve)
 ctx.fillStyle="rgba(0,0,0,"+(.10+.05*n).toFixed(3)+")";ctx.fillRect(xl-2*u,y-u*.5,xr-xl+4*u,u*1.2);
}
function forgeHoles(g,k){   // abre a escuridão em volta da lanterna da forja (chamado por lampHoles)
 const L=forgeLantern();if(L.x<-T*6||L.x>W+T*6)return;
 g.globalCompositeOperation="destination-out";
 const cx=L.x*k,cy=L.y*k,r=T*4.6*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
 for(const[o,a]of[[0,.95],[.35,.88],[.6,.55],[.82,.2],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
 g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);g.globalCompositeOperation="source-over";
}

// ---------- escada de corda pequena, pendurada na viga do portão, descendo para dentro do buraco ----------
const LADDER_RUNGS=4;   // máximo de degraus (a escada é só enfeite: não muda a física do jogador); só desce até onde o poço já está cavado
function drawRopeLadder(t){
 const u=pu(),y=Math.round(rowY(0)),cx=Math.round(colX(0));if(cx<-T*2||cx>W+T*2)return;
 const R=(x,yy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(yy),Math.round(w),Math.round(h))};
 const half=Math.round(T*.27),top=y+Math.round(u*.8),step=Math.round(T*.34);
 let open=1;while(open<LADDER_RUNGS&&isDug(0,open))open++;   // linhas abertas do poço (a linha 0 é sempre aberta): a escada nunca passa para cima de um bloco
 const room=open*T-Math.round(u*.8),rungs=Math.max(1,Math.min(LADDER_RUNGS,Math.floor((room-u*2)/step))),len=Math.min(room,step*rungs+Math.round(u*2));
 const sway=(k)=>Math.round(Math.sin(t*1.4+k*.5)*u*.5*(k/len));   // balança de leve, mais na ponta de baixo
 // cordas laterais (em pedaços de 1 px de sprite, para acompanhar o balanço sem serrilhado estranho)
 for(let k=0;k<len;k+=u){const dx=sway(k);
  R(cx-half-u/2+dx,top+k,u,u,(k/u)%3===2?"#9a8350":"#c9b27a");
  R(cx+half-u/2+dx,top+k,u,u,(k/u)%3===2?"#7a6a40":"#a8935a")}
 // degraus de madeira presos por nós
 for(let i=1;i<=rungs;i++){const k=i*step-Math.round(u*.5),dx=sway(k);
  R(cx-half-u*1.5+dx,top+k,2*half+3*u,u*1.3,"#7a4f27");R(cx-half-u*1.5+dx,top+k,2*half+3*u,u*.5,"#b27a3a");R(cx-half-u*1.5+dx,top+k+u,2*half+3*u,u*.4,"#4a2f16");
  R(cx-half-u*.5+dx,top+k-u*.4,u*1.2,u*.8,"#e0cf9a");R(cx+half-u*.5+dx,top+k-u*.4,u*1.2,u*.8,"#c9b27a")}   // nós de corda
 // argolas de ferro na viga
 R(cx-half-u,y-u*.4,u*2,u*1.6,"#2f3238");R(cx+half-u,y-u*.4,u*2,u*1.6,"#2f3238");
 R(cx-half-u,y-u*.4,u,u,"#8d9299");R(cx+half-u,y-u*.4,u,u,"#8d9299");
}

// ---------- poço de água (pequeno, 14x15): aro de pedra baixo, dois postes finos, rolo com manivela, telhadinho e balde na corda ----------
function sprWell(){return mkSpr("well",14,15,Object.assign({B:"#8d8984",L:"#b0aba3",b:"#625f5b",q:"#4aa8e8",Q:"#2f7fc0",k:"#1c120c",P:"#e0cf9a"},WOOD),R=>{
 R(5,0,4,1,"W");R(3,1,8,1,"W");R(1,2,12,1,"w");R(1,3,12,1,"d");R(6,1,1,1,"d");R(4,2,1,1,"d");R(9,2,1,1,"d");                  // telhadinho de tábuas
 R(2,4,1,5,"w");R(11,4,1,5,"w");R(2,4,1,5,"W");R(11,4,1,5,"w");                                                          // postes
 R(3,5,8,2,"W");R(3,5,8,1,"P");R(3,6,8,1,"d");R(12,5,2,1,"w");R(13,6,1,2,"w");                                          // rolo da corda e manivela
 R(1,8,12,1,"L");R(2,9,10,1,"k");R(3,9,8,1,"q");R(3,9,2,1,"Q");                                                          // borda e boca do poço com água
 R(0,10,14,1,"L");R(0,11,14,4,"B");R(0,11,1,4,"L");R(13,11,1,4,"b");R(0,14,14,1,"b");R(0,13,14,1,"b");                  // aro de pedra
 R(4,11,1,2,"b");R(9,11,1,2,"b");R(2,13,1,1,"B");R(6,13,1,1,"B");R(11,13,1,1,"B");                                       // argamassa
},1)}
function drawWell(t){
 const u=pu(),s=sprWell(),c=Math.round(colX(WELL_C)),y=Math.round(rowY(0));if(c<-T*2||c>W+T*2)return;
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);
 const x0=Math.round(c-s.w*u/2),y0=Math.round(y-s.h*u),sw=Math.round(Math.sin(t*1.7)*u*.5);
 // brilhos na água
 for(let i=0;i<3;i++){if(Math.sin(t*2.4+i*2.1)>.55){ctx.fillStyle="#d9f3ff";ctx.fillRect(x0+(4+i*2)*u,y0+9*u,u,Math.max(1,Math.round(u*.6)))}}
 // corda e balde pendurados no rolo, balançando de leve
 ctx.fillStyle="#c9b27a";ctx.fillRect(x0+7*u+Math.round(sw*.5),y0+7*u,u,u);
 const bx=x0+6*u+sw;ctx.fillStyle="#7a4f27";ctx.fillRect(bx,y0+8*u,3*u,2*u);ctx.fillStyle="#b27a3a";ctx.fillRect(bx,y0+8*u,3*u,Math.max(1,Math.round(u*.5)));
 ctx.fillStyle="#2f3238";ctx.fillRect(bx,y0+9*u,3*u,Math.max(1,Math.round(u*.5)));
 if(atSurface())lbl(__("Poço de água"),c,y0-3*u-Math.sin(t*4)*2,"#7fd6ff");
}

// ---------- quadro de contratos ----------
function sprBoard(){return mkSpr("board",14,18,{p:"#c99a5b",w:"#7a4f27",d:"#4a2f16",W:"#b27a3a",a:"#efe3bd",A:"#cdbd8f",X:"#d23a2a",k:"#241609"},R=>{
 R(0,0,14,2,"W");R(0,2,14,1,"w");R(1,3,1,15,"w");R(12,3,1,15,"w");R(1,3,1,15,"d");R(12,3,1,15,"d");
 R(2,3,10,10,"p");R(2,3,10,1,"w");R(2,12,10,1,"w");for(let y=5;y<12;y+=3)R(2,y,10,1,"W");
 R(3,4,4,4,"a");R(3,7,4,1,"A");R(4,5,2,1,"A");R(8,5,3,4,"a");R(8,8,3,1,"A");R(9,6,1,1,"A");R(4,9,5,3,"a");R(4,11,5,1,"A");R(5,10,3,1,"A");
 R(4,4,1,1,"X");R(9,5,1,1,"X");R(6,9,1,1,"X");R(1,17,2,1,"k");R(11,17,2,1,"k");
},1)}
function drawBoard(t){
 if(!isUnl("build","board")){drawBroken(sprBoard(),Math.round(colX(BOARD_C)),Math.round(rowY(0)),pu(),__("Quadro de contratos"),"board");return}
 const u=pu(),s=sprBoard(),c=Math.round(colX(BOARD_C)),y=Math.round(rowY(0)),near=nearBoard(),rd=ctReady();
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);
 if(!atSurface())return;
 lbl(near?__("Contratos: clique para abrir"):rd?__("Contratos prontos!"):__("Contratos"),c,y-(s.h+2)*u-Math.sin(t*4)*2,near?"#6fe3a0":"#ffd45c");
}

// ---------- caça-níquel (só a máquina, sem mesa) ----------
function sprSlot(){return mkSpr("slotmachine2",10,13,{R:"#b8283a",r:"#e8485a",e:"#7a1020",y:"#ffd45c",Y:"#fff3a0",G:"#d6a02a",M:"#d5dae1",k:"#241609",X:"#d23a2a",f:"#f6f0dc",n:"#3a3a44",N:"#5d6168"},R=>{
 R(0,0,9,11,"R");R(0,0,9,1,"r");R(0,0,1,11,"r");R(8,1,1,10,"e");R(0,10,9,1,"e");                       // gabinete
 R(1,1,7,2,"y");R(1,1,7,1,"Y");                                                                       // letreiro
 R(1,4,7,4,"k");R(2,5,1,2,"f");R(4,5,1,2,"f");R(6,5,1,2,"f");                                         // tela com 3 rolos (animados por cima)
 R(1,8,7,1,"G");R(3,9,3,1,"k");                                                                      // bandeja e saída de moedas
 R(9,3,1,5,"M");R(9,2,1,2,"X");                                                                       // alavanca
 R(0,11,10,2,"N");R(0,11,10,1,"M");R(0,12,10,1,"n");                                                  // base
},1)}
function drawSlotTable(t){
 if(!isUnl("build","slot")){drawBroken(sprSlot(),Math.round(colX(SLOT_C)),Math.round(rowY(0)),pu(),__("Caça-níquel"),"slot");return}
 const u=pu(),s=sprSlot(),c=Math.round(colX(SLOT_C)),y=Math.round(rowY(0)),near=nearSlot();
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);
 const x0=Math.round(c-s.w*u/2),y0=Math.round(y-s.h*u),col=["#8d9299","#ff9a3a","#ffd45c","#e5412d","#7fe6ff","#fff3a0"];
 for(let i=0;i<3;i++){const k=Math.floor(t*(near?9:2.2)+i*1.7)%6;ctx.fillStyle=col[k];ctx.fillRect(x0+(2+i*2)*u,y0+5*u,u,2*u)}   // rolos girando
 for(let i=0;i<4;i++){const on=(Math.floor(t*(near?8:3))+i)%2===0;ctx.fillStyle=on?"#fff3a0":"#9a6a18";ctx.fillRect(x0+(1+i*2)*u,y0+2*u,u,u)}   // lâmpadas do letreiro
 if(atSurface())lbl(near?__("Caça-níquel: clique para jogar"):__("Caça-níquel"),c,y0-3*u-Math.sin(t*4)*2,near?"#6fe3a0":"#ffd45c");
}
// ---------- dono da carrocinha (só enfeite): parecido com o jogador, mas com chapéu de palha, avental e lenço; parado ao lado da loja ----------
function drawShopkeeper(t){
 const mx=Math.round(colX(SHOP_C+1.7)),my=Math.round(rowY(0));if(mx<-60||mx>W+60)return;
 const idle=Math.sin(t*3.5),bob=idle*.9,hb=bob,blink=(t*1000)%4100<130,wave=Math.sin(t*1.7)*.12,skin="#e6b48a",cloth="#3f8a5a",clothD="#2d6642";
 pxShadow(mx,26*worldZoom,my,pu());
 ctx.save();ctx.translate(mx,my);ctx.scale(worldZoom,worldZoom);ctx.translate(-mx,-my);
 ctx.translate(mx,0);ctx.scale(-1,1);ctx.translate(-mx,0);   // olha para a carrocinha
 ctx.fillStyle="#3a2a1c";ctx.fillRect(mx-6,my-9,5,6);ctx.fillRect(mx+1,my-9,5,6);ctx.fillStyle="#1d1d1d";ctx.fillRect(mx-7,my-4,7,4);ctx.fillRect(mx,my-4,7,4);   // pernas e botas
 ctx.save();ctx.translate(mx-6,my-21+bob);ctx.rotate(.25+idle*.04);ctx.fillStyle=clothD;ctx.fillRect(-2,0,4,7);ctx.fillStyle=skin;ctx.fillRect(-2,6,4,3);ctx.restore();   // braço de trás
 ctx.fillStyle=cloth;ctx.fillRect(mx-9,my-24+bob,18,16);ctx.fillStyle=clothD;ctx.fillRect(mx-9,my-24+bob,3,16);
 ctx.fillStyle="#ece6d6";ctx.fillRect(mx-6,my-19+bob,13,12);ctx.fillStyle="#cfc7b2";ctx.fillRect(mx-6,my-8+bob,13,1);ctx.fillRect(mx+5,my-19+bob,2,12);   // avental
 ctx.fillStyle="#c8452f";ctx.fillRect(mx-8,my-26+bob,16,4);ctx.fillStyle="#9a3426";ctx.fillRect(mx-8,my-23+bob,16,1);ctx.fillRect(mx+5,my-24+bob,3,7);   // lenço
 ctx.fillStyle=skin;ctx.fillRect(mx-6,my-34+hb,12,9);
 ctx.fillStyle="#2a1a10";if(blink)ctx.fillRect(mx+2,my-30+hb,3,1);else ctx.fillRect(mx+2,my-31+hb,2,3);
 ctx.fillStyle="#5a3a1c";ctx.fillRect(mx+1,my-27+hb,6,2);   // bigode
 ctx.fillStyle="#d8b45a";ctx.fillRect(mx-6,my-41+hb,12,6);ctx.fillStyle="#a8842c";ctx.fillRect(mx-6,my-37+hb,12,1);ctx.fillStyle="#d8b45a";ctx.fillRect(mx-12,my-36+hb,24,3);ctx.fillStyle="#a8842c";ctx.fillRect(mx-12,my-34+hb,24,1);ctx.fillStyle="#f0d27a";ctx.fillRect(mx-12,my-36+hb,24,1);   // chapéu de palha
 ctx.save();ctx.translate(mx+7,my-21+bob);ctx.rotate(-.5+wave);ctx.fillStyle=cloth;ctx.fillRect(-2,0,4,7);ctx.fillStyle=skin;ctx.fillRect(-2,6,4,3);ctx.restore();   // braço da frente, acenando de leve
 ctx.restore();
 if(atSurface())lbl("Izans",mx,Math.round(my-50*worldZoom+hb*worldZoom),"#ffd45c");   // nome do vendedor
}
function drawVillage(t){
 drawBed(t);drawEnchant(t);drawSlotTable(t);drawBoard(t);drawWell(t);
}

// ===== 5-desenho/13-paisagem.js — Paisagem estendida da superfície: horta e moinho (esquerda); riacho com ponte e roda d'água, fogueira, praia com farol e trapiche (direita); bichinhos de pixel =====
// Tudo aqui é só visual (não muda a física). Posições em colunas do mundo (constantes em 1-nucleo/02-camadas-minerios.js). As peças usam forgeFx (âncora única de arredondamento)
// e padrões por índice/hash, para nada tremer ao andar. Luzes noturnas: campfireHoles/lighthouseHoles (chamadas por lampHoles) e vaga-lumes por cima da escuridão (drawFireflies).
const PX=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
const STONE4=["#8d8984","#9a968f","#7f7b76","#a39e96"];

// ---------- chão: água (riacho e mar) e areia da praia ----------
function drawWaterCell(x,y,ts,tb,c,r,sea){
 const t=performance.now()/1000,X=Math.round(x),Y=Math.round(y),w=Math.round(T)+1,q=Math.max(.75,Math.round(baseTile()/16)*worldZoom);
 const cols=sea?["#3b93d6","#2a73b4","#1f5a94"]:(c>=FRIV_C0&&c<=FRIV_C1)?["#4d9fa6","#357f8c"]:["#58aee0","#3b8fcf"];   // riacho da floresta: água mais escura e esverdeada
 ctx.fillStyle=cols[Math.min(r,cols.length-1)];ctx.fillRect(X,Y,w,w);
 if(r===0){ctx.fillStyle="rgba(255,255,255,.38)";ctx.fillRect(X,Y,w,Math.max(2,Math.round(q*.8)))}   // brilho da superfície
 for(let i=0;i<3;i++){   // linhas de onda que deslizam (riacho: sempre para a direita; mar: vai e vem)
  const ph=hash(c*7+i,r*13+5),lw=q*(3+Math.floor(ph*4)),off=sea?((Math.sin(t*.8+ph*6)*.5+.5)*(T-lw)):((t*(16+ph*8)+ph*T*3)%T),ly=Y+(.18+.64*hash(c+i*3,r+9))*T+(sea?Math.sin(t*1.2+ph*6)*q*.4:0);
  const ww=Math.min(lw,w-off);if(ww>0){ctx.fillStyle="rgba(255,255,255,"+(r===0?.26:.14)+")";ctx.fillRect(Math.round(X+off),Math.round(ly),Math.round(ww),q*.6<1?1:Math.round(q*.6))}
 }
 if(r>=1){ctx.fillStyle="rgba(8,20,48,"+(.10*r)+")";ctx.fillRect(X,Y,w,w)}
}
function drawSandCell(x,y,ts,tb,c,r){
 const X=Math.round(x),Y=Math.round(y),w=Math.round(T)+1,q=Math.max(.75,Math.round(baseTile()/16)*worldZoom);
 ctx.fillStyle=r===0?"#e6d19a":"#d2b878";ctx.fillRect(X,Y,w,w);
 if(r===0){ctx.fillStyle="#f2e2b4";ctx.fillRect(X,Y,w,q*1.5)}
 ctx.fillStyle=r===0?"rgba(150,120,60,.28)":"rgba(90,70,35,.25)";
 for(let i=0;i<6;i++)ctx.fillRect(Math.round(X+hash(c*5+i,r+17)*(T-q)),Math.round(Y+q*2+hash(c+i*3,r+19)*(T-q*3)),q,q);
 if(r===1){ctx.fillStyle="rgba(8,8,12,.18)";ctx.fillRect(X,Y,w,w)}
}

// ---------- horta de cenouras (esquerda da casa) ----------
function drawGarden(t){
 const u=pu(),y=Math.round(rowY(0)),xa=forgeFx(GARDEN_L),xb=forgeFx(GARDEN_R);
 if(xb<-T*4||xa>W+T*4)return;
 const P=scenePal(),w=P.wint,len=xb-xa,TB="#4a2f16",TH="#6b4423",gl=mixHex("#4dbb4d","#e9f2f6",w*.6),gd=mixHex("#2f8a3a","#c3d2dc",w*.5);
 // cerca de trás (estacas e duas travessas)
 const fy=y-13*u;
 PX(xa,fy+2*u,len,u,TB);PX(xa,fy+5*u,len,u,TB);
 for(let x=xa,i=0;x<=xb;x+=Math.round(4.5*u),i++){PX(x,fy,1.6*u,8*u,"#8a5a2b");PX(x,fy,.6*u,8*u,"#b27a3a");PX(x,fy,1.6*u,u,TH)}
 // canteiro de uma fileira só
 const rows=[[3,"#6f4e2e","#8f673a","#4e341c"]];
 for(const[oy,c1,c2,c3]of rows){
  const by=y-oy*u;
  PX(xa+u,by-2*u,len-2*u,2*u,c1);PX(xa+u,by-2*u,len-2*u,.7*u,c2);PX(xa+u,by-.6*u,len-2*u,.6*u,c3);
  for(let i=0;i<GARDEN_SLOTS;i++){   // GARDEN_SLOTS cenouras com espaçamento fixo (a quantidade não muda com o zoom); as primeiras S.gc são douradas
   const x=xa+4*u+Math.round(i*(len-7*u)/(GARDEN_SLOTS-1)),gold=i<S.gc;
   const sw=Math.round(Math.sin(t*1.5+i*1.3+oy)*.6*u);
   if(gold){PX(x-u,by-3*u,2*u,u,"#ffd84a");PX(x-.5*u,by-3*u,u,.6*u,"#fff6c2");PX(x+.4*u,by-3*u,.6*u,u,"#e3a400");   // ombro dourado, com luz e sombra
    const tw=Math.sin(t*3+i*2.1);if(tw>.55){ctx.save();ctx.globalAlpha=(tw-.55)/.45;PX(x-.5*u,by-4.6*u,u,u,"#fffbe0");PX(x-1.5*u,by-3.6*u,.6*u,.6*u,"#ffe98a");PX(x+1.1*u,by-3.8*u,.6*u,.6*u,"#ffe98a");ctx.restore()}}   // brilhinho que pisca
   else{PX(x-u,by-3*u,2*u,u,"#ff8a1f");PX(x-.5*u,by-3*u,u,.6*u,"#ffb04a")}   // ombro da cenoura laranja saindo da terra
   PX(x-.4*u+sw*.5,by-5*u,.8*u,2*u,gd);   // caule
   PX(x-2*u+sw,by-7*u,1.2*u,2.5*u,gl);PX(x+.8*u+sw,by-7*u,1.2*u,2.5*u,gl);PX(x-.6*u+sw,by-8.2*u,1.2*u,3.2*u,gd);   // folhas
  }
 }
 // portão de estacas mais altas nas pontas + caixote de cenouras e barril
 for(const gx of[xa,xb]){PX(gx-.8*u,y-9*u,2.4*u,9*u,"#8a5a2b");PX(gx-.8*u,y-9*u,.8*u,9*u,"#b27a3a");PX(gx-u,y-10*u,3*u,1.4*u,TH)}
 const cx=xb+Math.round(5*u);
 PX(cx-4*u,y-5*u,8*u,5*u,"#8a5a2b");PX(cx-4*u,y-5*u,8*u,u,"#b27a3a");PX(cx-4*u,y-2.4*u,8*u,.8*u,TB);PX(cx-4*u,y-.8*u,8*u,.8*u,TB);
 for(let i=0;i<4;i++){PX(cx-3.2*u+i*1.9*u,y-8*u+(i%2)*u,1.4*u,3.4*u,"#ff8a1f");PX(cx-3.2*u+i*1.9*u,y-8*u+(i%2)*u,.5*u,3.4*u,"#ffb04a");PX(cx-3*u+i*1.9*u,y-9.6*u+(i%2)*u,u,1.8*u,gl)}
 const bx=xa-Math.round(5*u);
 PX(bx-3*u,y-8*u,6*u,8*u,"#7a4f27");PX(bx-3*u,y-8*u,u,8*u,"#b27a3a");PX(bx+2*u,y-8*u,u,8*u,"#4a2f16");PX(bx-3*u,y-6*u,6*u,.8*u,"#2f3238");PX(bx-3*u,y-2.2*u,6*u,.8*u,"#2f3238");PX(bx-2.5*u,y-8.6*u,5*u,.8*u,"#4a2f16");PX(bx-2*u,y-8*u,4*u,.8*u,"#4dbb4d");
}

// ---------- moinho de vento (esquerda da horta): torre de pedra e enxaimel, cúpula de telhas e quatro velas girando ----------
const MILL_S=1.5,LIGHT_S=1.5;   // aumento do moinho e do farol (multiplica o tamanho do pixel do sprite)
function drawWindmill(t){
 const u=pu()*MILL_S,y=Math.round(rowY(0)),cx=forgeFx(MILL_C),n=nightAmt();
 if(cx<-T*9||cx>W+T*9)return;
 const H1=24,TB="#4a2f16";
 pxShadow(cx,28*u,y,u);
 for(let i=0;i<H1;i++){   // torre cônica: pedra até 8 linhas, reboco com madeira por cima
  const hw=Math.round((11-i*4/H1)*u),yy=y-(i+1)*u,stone=i<8;
  PX(cx-hw,yy,2*hw,u,stone?(i%4===3?"#6f6b66":STONE4[Math.floor(hash(i,5)*4)]):"#e8dfc6");
  PX(cx-hw,yy,Math.round(hw*.5),u,stone?"rgba(255,255,255,.12)":"rgba(255,255,255,.3)");PX(cx+hw-Math.round(hw*.55),yy,Math.round(hw*.55),u,"rgba(0,0,0,.2)");
  PX(cx-hw,yy,u*.7,u,"#3a2f26");PX(cx+hw-u*.7,yy,u*.7,u,"#2f251d");
  if(stone&&i%4!==3&&hash(i,9)>.4)PX(cx-hw+hash(i,11)*2*hw,yy,u*.6,u,"#625f5b");
  if(!stone&&(i===8||i===15||i===22))PX(cx-hw,yy,2*hw,u,TB);
  if(!stone&&i>8&&(i<15||i>15)){PX(cx-Math.round(hw*.5),yy,u*.8,u,TB);PX(cx+Math.round(hw*.5),yy,u*.8,u,TB)}
 }
 PX(cx-2.5*u,y-9*u,5*u,9*u,TB);PX(cx-1.5*u,y-10*u,3*u,u,TB);PX(cx-.3*u,y-9*u,.7*u,9*u,"#2f1c0e");PX(cx+1.2*u,y-4*u,u,u,"#c9b27a");PX(cx-4*u,y-u,8*u,u,"#625f5b");   // porta e degrau
 const win=n>.03?"#ffd98a":"#2f3a4a";
 PX(cx-1.5*u,y-19*u,3*u,4*u,win);PX(cx-3*u,y-19*u,1.2*u,4*u,"#6b4423");PX(cx+1.8*u,y-19*u,1.2*u,4*u,"#6b4423");   // janela com venezianas
 const gw=Math.round(8.6*u);PX(cx-gw,y-17*u,2*gw,u*1.2,"#6b4423");for(let k=-gw;k<=gw;k+=Math.round(3*u))PX(cx+k,y-18.6*u,u*.8,1.6*u,"#4a2f16");PX(cx-gw,y-18.8*u,2*gw,u*.7,"#8a5a2b");   // galeria com guarda-corpo
 for(let j=0;j<9;j++){   // cúpula de telhas vermelhas
  const hw=Math.round(8.5*Math.sqrt(1-Math.pow(j/9.5,2))*u),yy=y-(H1+j+1)*u;
  PX(cx-hw,yy,2*hw,u,j%2?"#8a3a28":"#7a3424");PX(cx-hw,yy,Math.round(hw*.6),u,"rgba(255,255,255,.14)");PX(cx+hw-Math.round(hw*.5),yy,Math.round(hw*.5),u,"rgba(0,0,0,.22)");
  for(let k=-hw+u;k<hw;k+=Math.round(3*u))PX(cx+k+(j%2)*u,yy,u*.5,u,"rgba(0,0,0,.25)");
 }
 PX(cx-.5*u,y-(H1+11)*u,u,2*u,"#2f3238");PX(cx-u,y-(H1+11.6)*u,2*u,u,"#c9b27a");
 const hx=cx,hy=y-(H1+2)*u,Ls=17*u,ang=t*.45;   // eixo e velas
 ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);
 for(let a=0;a<4;a++){ctx.save();ctx.rotate(a*Math.PI/2);
  ctx.fillStyle="#5a3a1c";ctx.fillRect(0,-u*.6,Ls,u*1.2);
  const x0=Ls*.22,wd=5*u;
  ctx.fillStyle="rgba(236,226,196,.55)";ctx.fillRect(x0,u*.6,Ls-x0,wd);
  ctx.strokeStyle="#6b4423";ctx.lineWidth=Math.max(1,u*.7);ctx.strokeRect(x0,u*.6,Ls-x0,wd);
  ctx.fillStyle="#6b4423";for(let k=1;k<5;k++)ctx.fillRect(x0+(Ls-x0)*k/5,u*.6,Math.max(1,u*.5),wd);
  ctx.restore()}
 ctx.restore();
 PX(hx-2.5*u,hy-2.5*u,5*u,5*u,"#4a2f16");PX(hx-1.2*u,hy-1.2*u,2.4*u,2.4*u,"#2f3238");PX(hx-.6*u,hy-.6*u,u,u,"#9aa0a8");   // cubo do eixo
}

// ---------- riacho: margens de pedra, juncos, vitórias-régias, roda d'água por trás e ponte de madeira ----------
function drawRiver(t){drawRiverAt(t,RIVER_C0,RIVER_C1,WHEEL_C);drawRiverAt(t,FRIV_C0,FRIV_C1,null)}   // o da direita tem roda d'água; o da floresta (esquerda) é mais selvagem, com pedras no leito
function drawRiverAt(t,C0,C1,WC){
 const u=pu(),y=Math.round(rowY(0)),xa=Math.round(colX(C0-.5)),xb=xa+Math.round((C1-C0+1)*T);
 if(xb<-T*5||xa>W+T*5)return;
 const TB="#4a2f16",TH="#6b4423",dp=Math.round(T*2),wild=WC==null;
 if(!wild)for(const[bx,dir]of[[xa,-1],[xb,1]]){   // muros de pedra nas duas margens (por baixo da linha da água)
  const sx=dir<0?bx-2.5*u:bx;
  for(let k=0,yy=0;yy<dp;k++,yy+=3*u)PX(sx,y+yy,2.5*u,Math.min(3*u,dp-yy)-1,STONE4[(k+(dir<0?0:2))%4]);
  PX(dir<0?bx-.8*u:bx,y,.8*u,dp,"rgba(8,20,48,.25)");
 }
 if(wild)for(const[bx,dir]of[[xa,-1],[xb,1]]){   // margens naturais: barranco de terra irregular, pedras soltas, grama pendurada e samambaias
  const off=dir<0?0:9;
  for(let k=0,yy=0;yy<dp;k++,yy+=2.5*u){const w=(2+hash(k+off,71)*2.2)*u;PX(dir<0?bx-w:bx,y+yy,w,Math.min(2.5*u,dp-yy),k%3===1?"#6b4a2b":"#7d5a35")}
  for(let k=0;k<6;k++){const w=(2+hash(k+off,73)*3)*u,sy=y+hash(k+off,75)*(dp-3*u),sx=dir<0?bx-w*.8:bx-w*.2;PX(sx,sy,w,w*.7,STONE4[k%4]);PX(sx,sy,w,.5*u,"#b8b2a8")}
  PX(dir<0?bx-3.5*u:bx-.5*u,y-.8*u,4*u,1.4*u,"#4f9a3a");
  for(let f=0;f<3;f++){const fx=bx+dir*(3+f*3.5+hash(f+off,77)*2)*u,sw=Math.round(Math.sin(t*1.2+f+off)*.5*u);
   PX(fx,y-4*u,.7*u,4*u,"#2f7a34");PX(fx-2*u,y-3*u,2*u,.8*u,"#3f9a44");PX(fx+.7*u,y-3.4*u,2*u,.8*u,"#3f9a44");PX(fx-1.4*u+sw,y-4.4*u,1.6*u,.8*u,"#4fb054");PX(fx+.7*u+sw,y-4.8*u,1.6*u,.8*u,"#4fb054")}
 }
 // roda d'água (por trás da ponte): suportes, aro, raios e pás girando, parte de baixo dentro da água
 if(WC!=null){const wx=forgeFx(WC),cy=y-6*u,Rw=12*u;
  ctx.save();ctx.strokeStyle=TB;ctx.lineWidth=1.6*u;ctx.beginPath();ctx.moveTo(wx,cy);ctx.lineTo(wx-15*u,y+8*u);ctx.moveTo(wx,cy);ctx.lineTo(wx+15*u,y+8*u);ctx.stroke();
  ctx.translate(wx,cy);ctx.rotate(t*.7);
  ctx.strokeStyle="#5a3a1c";ctx.lineWidth=1.4*u;ctx.beginPath();ctx.arc(0,0,Rw,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,Rw-3*u,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle="#7a4f27";ctx.lineWidth=.9*u;ctx.beginPath();for(let a=0;a<12;a++){ctx.moveTo(0,0);ctx.lineTo(Math.cos(a*Math.PI/6)*Rw,Math.sin(a*Math.PI/6)*Rw)}ctx.stroke();
  for(let a=0;a<12;a++){ctx.save();ctx.rotate(a*Math.PI/6);ctx.fillStyle="#8a5a2b";ctx.fillRect(Rw-u,-1.8*u,3.2*u,3.6*u);ctx.fillStyle="#4a2f16";ctx.fillRect(Rw+1.6*u,-1.8*u,.7*u,3.6*u);ctx.restore()}
  ctx.fillStyle="#2f3238";ctx.beginPath();ctx.arc(0,0,2.2*u,0,Math.PI*2);ctx.fill();ctx.fillStyle="#9aa0a8";ctx.fillRect(-.5*u,-.5*u,u,u);
  ctx.restore();
  PX(wx-Rw-5*u,y,2*Rw+10*u,Rw+6*u,"rgba(50,125,190,.45)");PX(wx-Rw-5*u,y,2*Rw+10*u,u*.6,"rgba(255,255,255,.55)");   // a parte de baixo fica dentro da água
  for(let i=0;i<5;i++){const ph=(t*1.6+hash(i,31))%1;PX(wx-Rw+hash(i,33)*2*Rw,y-Math.sin(ph*Math.PI)*6*u,u*.8,u*.8,"rgba(255,255,255,"+(1-ph).toFixed(2)+")")}   // respingos
 }
 // vitórias-régias e juncos
 for(let i=0;i<5;i++){const px=xa+(.12+.76*hash(i+(WC==null?7:0),3))*(xb-xa);PX(px,y+u*.2,4*u,u,"#2f8a3a");PX(px,y+u*.2,2*u,u*.5,"#4dbb4d");if(i%2===0)PX(px+1.6*u,y-.7*u,u,u,"#f2a6c8")}
 if(wild)for(let i=0;i<5;i++){const px=xa+(.08+.84*hash(i,61))*(xb-xa),sz=(2.5+hash(i,63)*3)*u;PX(px-u,y,sz+2*u,.5*u,"rgba(255,255,255,.6)");PX(px,y-sz*.55,sz,sz*.55+.3*u,STONE4[i%4]);PX(px,y-sz*.55,sz,.5*u,"#b8b2a8");PX(px+sz*.3,y-sz*.55,sz*.4,.5*u,"#6aa05a")}   // pedras no leito, com espuma e musgo
 [xa-4*u,xa-8*u,xb+4*u,xb+8*u].forEach((rx,ri)=>{for(let k=0;k<3;k++){const sw=Math.round(Math.sin(t*1.3+ri*2.1+k)*.7*u),hh=(6+k*1.5)*u;PX(rx+k*1.4*u+sw,y-hh,.8*u,hh,"#3f8a3a");PX(rx+k*1.4*u+sw-.2*u,y-hh-1.2*u,1.2*u,2.4*u,"#6b4423")}})
 // ponte de madeira: pilares na água, tabuleiro de tábuas, vigas e guarda-corpo
 const b0=xa-5*u,b1=xb+5*u,len=b1-b0;
 if(wild){   // travessia: um tronco caído coberto de musgo
  PX(xa,y+T*.5,xb-xa,T*.4,"rgba(20,60,70,.3)");
  PX(b0,y-.5*u,len,4.5*u,"#5a3a1c");PX(b0,y-.5*u,len,1.2*u,"#7d5a35");PX(b0,y+2.8*u,len,1.2*u,"#3a2410");
  for(let x=b0+3*u,ix=0;x<b1-2*u;x+=Math.round((6+hash(ix,81)*5)*u),ix++)PX(x,y+.6*u,.6*u,2.4*u,"#3a2410");
  for(let ix=0;ix<5;ix++)PX(b0+hash(ix,83)*(len-4*u),y-1.1*u,(2+hash(ix,85)*3)*u,.9*u,"#4f9a3a");
  PX(b0-.8*u,y-.2*u,1.6*u,4*u,"#c9a36a");PX(b1-.8*u,y-.2*u,1.6*u,4*u,"#c9a36a");PX(b0+len*.3,y-2.4*u,1.2*u,2*u,"#5a3a1c");
  return;
 }
 for(let i=0;i<4;i++){const px=xa+(xb-xa)*(i+.5)/4;PX(px-u,y+2.5*u,2*u,T*1.1,TB);PX(px-u,y+2.5*u,.7*u,T*1.1,TH)}
 PX(xa,y+T*.5,xb-xa,T*.7,"rgba(50,125,190,.35)");
 PX(b0,y,len,2.5*u,"#8a5a2b");PX(b0,y,len,.8*u,"#b27a3a");PX(b0,y+1.7*u,len,.8*u,"#3a2410");
 for(let x=b0+4*u,ix=0;x<b1-2*u;x+=Math.round((5+hash(ix,53)*3)*u),ix++)PX(x,y+.8*u,.6*u,1.7*u,TB);
 PX(b0,y+2.5*u,len,1.4*u,TB);
 for(let x=b0+u,ix=0;x<=b1;x+=Math.round(7*u),ix++){PX(x,y-7*u,1.6*u,7*u,TH);PX(x,y-7*u,.6*u,7*u,"#8a5a2b");PX(x-.2*u,y-7.6*u,2*u,u,TB)}
 PX(b0,y-6.6*u,len,1.2*u,"#8a5a2b");PX(b0,y-6.6*u,len,.5*u,"#b27a3a");PX(b0,y-3.6*u,len,u,TH);
}

// ---------- fogueira com banco de pedra ----------
const campPos=()=>({x:forgeFx(CAMP_C),y:rowY(0)-6*pu()});
function drawCampfire(t){
 const u=pu(),y=Math.round(rowY(0)),n=nightAmt(),cx=forgeFx(CAMP_C);
 if(cx<-T*5||cx>W+T*5)return;
 const fl=.85+.15*Math.sin(t*9.1)+.05*Math.sin(t*14.3),bx=cx-Math.round(T*1.9);
 pxShadow(bx,13*u,y,u);   // banco de pedra (pequeno): dois pés e uma laje curta
 PX(bx-4.5*u,y-3*u,3*u,3*u,"#7f7b76");PX(bx+1.5*u,y-3*u,3*u,3*u,"#7f7b76");PX(bx-4.5*u,y-3*u,.8*u,3*u,"#a39e96");PX(bx+1.5*u,y-3*u,.8*u,3*u,"#a39e96");PX(bx+3.7*u,y-3*u,.8*u,3*u,"#625f5b");
 PX(bx-6*u,y-5*u,12*u,2*u,"#9a968f");PX(bx-6*u,y-5*u,12*u,.7*u,"#b8b3aa");PX(bx-6*u,y-3.6*u,12*u,.8*u,"#625f5b");PX(bx-.7*u,y-5*u,.6*u,2*u,"#625f5b");
 for(let i=0;i<7;i++){const h=2*u+hash(i,61)*u;PX(cx-7*u+i*2.3*u,y-h,2.4*u,h,STONE4[i%4]);PX(cx-7*u+i*2.3*u,y-h,2.4*u,.6*u,"#b8b3aa")}   // anel de pedras
 PX(cx-5*u,y-3.4*u,10*u,2*u,"#5a3a1c");PX(cx-5*u,y-3.4*u,10*u,.6*u,"#7a4f27");PX(cx-5*u,y-3.4*u,u,2*u,"#c28e4a");PX(cx+4*u,y-3.4*u,u,2*u,"#c28e4a");   // lenha
 for(let k=0;k<8;k++){PX(cx-4*u+k*u,y-3.6*u-k*.7*u,1.6*u,1.6*u,"#4a2f16");PX(cx+4*u-k*u,y-3.6*u-k*.7*u,1.6*u,1.6*u,"#5a3a1c")}
 PX(cx-4*u,y-2.2*u,8*u,u*.8,"rgba(255,120,30,.6)");   // brasas
 for(let i=-3;i<=3;i++){   // chamas em três camadas, cada coluna dançando
  const h=(6.5-Math.abs(i)*1.4)*u*fl*(.8+.2*Math.sin(t*7+i*2.1)),x=cx+i*1.4*u-.7*u;
  PX(x,y-3.4*u-h,1.4*u,h,"#ff8a1f");PX(x,y-3.4*u-h*.65,1.4*u,h*.65,"#ffb43a");PX(x,y-3.4*u-h*.35,1.4*u,h*.35,"#fff0a0");
 }
 for(let k=0;k<6;k++){const ph=(t*.8+hash(k,1))%1,sx=cx+(hash(k,2)-.5)*6*u+Math.sin(t*3+k)*u,sy=y-7*u-ph*26*u;PX(sx,sy,u*.8,u*.8,"rgba(255,207,112,"+(1-ph).toFixed(2)+")")}   // faíscas
 for(let k=0;k<3;k++){const ph=(t*.35+k/3)%1;PX(cx+Math.sin(t*1.5+k*2)*3*u+ph*4*u,y-9*u-ph*30*u,(1.5+ph*2.5)*u,(1.5+ph*2.5)*u,"rgba(150,150,155,"+((1-ph)*.28).toFixed(2)+")")}   // fumaça
 if(n>.03){const gx=cx,gy=y-6*u,r=T*3.2,gr=ctx.createRadialGradient(gx,gy,0,gx,gy,r);gr.addColorStop(0,"rgba(255,160,70,"+(.5*n*fl).toFixed(3)+")");gr.addColorStop(.4,"rgba(255,130,50,"+(.2*n*fl).toFixed(3)+")");gr.addColorStop(1,"rgba(255,110,40,0)");ctx.fillStyle=gr;ctx.fillRect(gx-r,gy-r,r*2,r*2)}
 if(atSurface())lbl(nearCamp()?__("Fogueira: clique para assar"):__("Fogueira"),cx,y-19*u,nearCamp()?"#6fe3a0":"#ffb43a");
}
function campfireHoles(g,k){   // abre a escuridão em volta da fogueira (chamado por lampHoles)
 const P=campPos();if(P.x<-T*7||P.x>W+T*7)return;
 g.globalCompositeOperation="destination-out";
 const cx=P.x*k,cy=P.y*k,r=T*4.4*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
 for(const[o,a]of[[0,.95],[.35,.85],[.6,.5],[.82,.18],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
 g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);g.globalCompositeOperation="source-over";
}

// ---------- praia: farol listrado com luz giratória e trapiche ----------
const lhLamp=()=>({x:forgeFx(LIGHT_C),y:rowY(0)-35*pu()*LIGHT_S});
function drawLighthouse(t){
 const u=pu()*LIGHT_S,y=Math.round(rowY(0)),cx=forgeFx(LIGHT_C),n=nightAmt();
 if(cx<-T*16||cx>W+T*16)return;
 pxShadow(cx,24*u,y,u);
 for(let i=0;i<3;i++){const hw=Math.round((12-i*2)*u);PX(cx-hw,y-(i+1)*u,2*hw,u,STONE4[(i+1)%4]);PX(cx-hw,y-(i+1)*u,Math.round(hw*.6),u,"rgba(255,255,255,.14)");if(i)PX(cx-hw+(i%2?3:7)*u,y-(i+1)*u,.7*u,u,"#625f5b")}   // base de pedras
 const by=y-3*u,TH=28;
 for(let i=0;i<TH;i++){   // torre cônica de listras brancas e vermelhas
  const hw=Math.round((6.5-i*2.3/TH)*u),yy=by-(i+1)*u,red=Math.floor(i/6)%2===1;
  PX(cx-hw,yy,2*hw,u,red?"#c8452f":"#f0ece0");PX(cx-hw,yy,Math.round(hw*.5),u,"rgba(255,255,255,.22)");PX(cx+hw-Math.round(hw*.55),yy,Math.round(hw*.55),u,"rgba(0,0,0,.2)");
  PX(cx-hw,yy,u*.7,u,"#3a2f26");PX(cx+hw-u*.7,yy,u*.7,u,"#2f251d");
 }
 PX(cx-2*u,by-6*u,4*u,6*u,"#4a2f16");PX(cx-1.2*u,by-7*u,2.4*u,u,"#4a2f16");PX(cx+.7*u,by-3*u,.8*u,.8*u,"#c9b27a");   // porta
 const wl=n>.03?"#ffd98a":"#2f3a4a";for(const wy of[10,18,24])PX(cx-.8*u,by-wy*u,1.6*u,3*u,wl);   // janelinhas
 const gy=by-TH*u,gw=Math.round(7.4*u);   // galeria com guarda-corpo
 PX(cx-gw,gy,2*gw,1.5*u,"#2f3238");PX(cx-gw,gy,2*gw,.5*u,"#6a6e74");
 for(let k=-gw;k<=gw;k+=Math.round(2.5*u))PX(cx+k,gy-3*u,.8*u,3*u,"#2f3238");PX(cx-gw,gy-3.2*u,2*gw,.8*u,"#2f3238");
 const lg=n>.03?"#fff3c4":"#bfe3f0";   // sala da lanterna
 PX(cx-3.5*u,gy-6*u,7*u,6*u,lg);PX(cx-3.5*u,gy-6*u,2*u,6*u,"rgba(255,255,255,.35)");
 for(const bxk of[-3.5,0,3.2])PX(cx+bxk*u,gy-6*u,.9*u,6*u,"#2f3238");PX(cx-4*u,gy-6.6*u,8*u,.8*u,"#2f3238");
 for(let j=0;j<5;j++){const hw=Math.round((4.6-j*.9)*u);PX(cx-hw,gy-(7+j)*u,2*hw,u,j%2?"#a8352a":"#c8452f");PX(cx-hw,gy-(7+j)*u,Math.round(hw*.5),u,"rgba(255,255,255,.18)")}   // teto cônico
 PX(cx-.5*u,gy-13*u,u,1.6*u,"#2f3238");PX(cx-.8*u,gy-13.6*u,1.6*u,1.2*u,"#c9b27a");
 if(n>.03){   // luz giratória: um feixe que varre o mar e a praia e some quando aponta para a tela
  const L=lhLamp(),c=Math.cos(t*.85),ext=T*14*c,ac=Math.abs(c),lx=L.x,ly=L.y;
  const gr=ctx.createRadialGradient(lx,ly,0,lx,ly,T*2.4);gr.addColorStop(0,"rgba(255,240,170,"+(.55*n).toFixed(3)+")");gr.addColorStop(1,"rgba(255,230,140,0)");ctx.fillStyle=gr;ctx.fillRect(lx-T*2.4,ly-T*2.4,T*4.8,T*4.8);
  if(ac>.06){const bg=ctx.createLinearGradient(lx,ly,lx+ext,ly);bg.addColorStop(0,"rgba(255,240,170,"+(.5*n*Math.sqrt(ac)).toFixed(3)+")");bg.addColorStop(1,"rgba(255,240,170,0)");ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+ext,ly-Math.abs(ext)*.17);ctx.lineTo(lx+ext,ly+Math.abs(ext)*.17);ctx.closePath();ctx.fill()}
 }
}
function lighthouseHoles(g,k){   // abre a escuridão em volta da lanterna do farol e ao longo do feixe
 const L=lhLamp();if(L.x<-T*16||L.x>W+T*16)return;
 const t=performance.now()/1000,c=Math.cos(t*.85),ext=T*14*c,ac=Math.abs(c);
 g.globalCompositeOperation="destination-out";
 let cx=L.x*k,cy=L.y*k,r=T*4*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
 for(const[o,a]of[[0,.95],[.35,.8],[.65,.4],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
 g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);
 if(ac>.06){const bg=g.createLinearGradient(cx,cy,cx+ext*k,cy);bg.addColorStop(0,"rgba(0,0,0,"+(.8*Math.sqrt(ac)).toFixed(3)+")");bg.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=bg;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+ext*k,cy-Math.abs(ext)*.17*k);g.lineTo(cx+ext*k,cy+Math.abs(ext)*.17*k);g.closePath();g.fill()}
 g.globalCompositeOperation="source-over";
}
// ---------- lamparina do trapiche: poste fino de madeira com a lamparina pendurada num braço, no meio do deck ----------
function pierLampPos(){const u=pu(),x=Math.round(colX(PIER_C+(PIER_END_C-PIER_C)*.5));return{x,lx:x+Math.round(3.1*u),ly:rowY(0)-9.6*u}}
function drawPierLamp(t,y,u,n){
 const L=pierLampPos(),x=L.x,lx=L.lx,ly=L.ly,TB="#4a2f16",fl=.92+.08*Math.sin(t*7+2);
 if(n>.03){const r=T*2.8,gr=ctx.createRadialGradient(lx,ly,0,lx,ly,r);gr.addColorStop(0,"rgba(255,214,130,"+(.5*n*fl).toFixed(3)+")");gr.addColorStop(.35,"rgba(255,196,100,"+(.2*n*fl).toFixed(3)+")");gr.addColorStop(1,"rgba(255,180,80,0)");ctx.fillStyle=gr;ctx.fillRect(lx-r,ly-r,r*2,r*2)}
 PX(x-.8*u,y-14*u,1.6*u,14*u,"#6b4423");PX(x-.8*u,y-14*u,.6*u,14*u,"#8a5a2b");PX(x-1.2*u,y-.8*u,2.4*u,.8*u,TB);   // poste e base
 PX(x-.8*u,y-14*u,4.6*u,1.2*u,TB);PX(x-.8*u,y-14*u,4.6*u,.5*u,"#6b4423");                                              // braço
 PX(lx-.2*u,y-12.8*u,.4*u,1.2*u,"#8d9299");PX(lx-1.6*u,y-11.6*u,3.2*u,.8*u,"#3a3a44");                                // corrente e tampa
 PX(lx-1.2*u,y-10.8*u,2.4*u,2.6*u,"#241609");PX(lx-.7*u,y-10.4*u,1.4*u,1.8*u,"#ffd98a");PX(lx-.7*u,y-10.4*u,1.4*u,.7*u,"#fff3c4");PX(lx-1.6*u,y-8.2*u,3.2*u,.8*u,"#3a3a44");   // vidro, chama e base
 if(n>.03){ctx.fillStyle="rgba(255,250,200,"+(.85*n).toFixed(3)+")";ctx.fillRect(Math.round(lx-.7*u),Math.round(y-10.4*u),Math.round(1.4*u),Math.round(1.8*u))}
}
function pierHoles(g,k){   // abre a escuridão da noite em volta da lamparina do trapiche (chamado por lampHoles)
 const L=pierLampPos();if(L.x<-T*6||L.x>W+T*6)return;
 g.globalCompositeOperation="destination-out";
 const cx=L.lx*k,cy=L.ly*k,r=T*3.2*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
 for(const[o,a]of[[0,.93],[.35,.85],[.6,.5],[.82,.18],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
 g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);g.globalCompositeOperation="source-over";
}
function drawBeach(t){
 const u=pu(),y=Math.round(rowY(0)),n=nightAmt(),xs=Math.round(colX(SURF_R+.5));
 if(colX(BEACH_C0)>W+T*8||colX(PIER_END_C)<-T*8)return;
 // enfeites da areia: capim de duna, madeira trazida pelo mar, conchas e estrela-do-mar
 for(const c of[41.4,42.2,43.0]){const x=forgeFx(c);for(let k=0;k<4;k++){const sw=Math.round(Math.sin(t*1.4+c+k)*.6*u);PX(x+k*1.3*u+sw,y-(5-k%2*1.5)*u,.8*u,(5-k%2*1.5)*u,"#9ab04a");PX(x+k*1.3*u+sw,y-(5-k%2*1.5)*u,.8*u,u,"#c9d27a")}}
 {const x=forgeFx(44.6);PX(x-5*u,y-2.2*u,10*u,2.2*u,"#8a6a45");PX(x-5*u,y-2.2*u,10*u,.7*u,"#b8946a");PX(x+3*u,y-3.6*u,u,1.6*u,"#8a6a45");PX(x-5*u,y-2.2*u,u,2.2*u,"#5a3f2a")}
 for(const[c,col]of[[43.6,"#f2d6d0"],[48.4,"#f6e7b8"],[50.6,"#f2d6d0"]]){const x=forgeFx(c);PX(x,y-1.6*u,2*u,1.6*u,col);PX(x+.5*u,y-1.6*u,.6*u,.8*u,"rgba(120,80,60,.35)")}
 {const x=forgeFx(49.3),sc="#f0873a";PX(x-.5*u,y-3*u,u,3*u,sc);PX(x-2*u,y-2*u,4.5*u,u,sc);PX(x-1.4*u,y-2.8*u,u,u,sc);PX(x+.9*u,y-2.8*u,u,u,sc);PX(x-.4*u,y-1.7*u,.8*u,.8*u,"#ffd09a")}
 drawLighthouse(t);
 // espuma na linha da água
 for(let i=0;i<4;i++){const o=Math.sin(t*1.5+i*1.7)*2.2*u;PX(xs-(3+i*2.4)*u+o,y-.2*u,2.6*u,.9*u,"rgba(255,255,255,"+(.75-i*.12).toFixed(2)+")")}
 // trapiche (deck ao nível do chão, vigas e pilares na água) com poste de amarração
 {const p0=Math.round(colX(PIER_C)),p1=Math.round(colX(PIER_END_C)),len=p1-p0,TB="#4a2f16";
  for(let x=p0+3*u;x<p1;x+=Math.round(7*u)){PX(x-u,y+2.5*u,2*u,T*1.1,TB);PX(x-u,y+2.5*u,.7*u,T*1.1,"#6b4423")}
  PX(p0,y,len,2.5*u,"#8a5a2b");PX(p0,y,len,.8*u,"#b27a3a");PX(p0,y+1.7*u,len,.8*u,"#3a2410");
  for(let x=p0+3*u,ix=0;x<p1-u;x+=Math.round((4.5+hash(ix,57)*3)*u),ix++)PX(x,y+.8*u,.6*u,1.7*u,TB);
  PX(p0,y+2.5*u,len,1.4*u,TB);
  PX(p1-3*u,y-5*u,2.2*u,5*u,"#6b4423");PX(p1-3*u,y-5*u,.8*u,5*u,"#8a5a2b");PX(p1-3.4*u,y-5.6*u,3*u,u,TB);PX(p1-3.2*u,y-3.4*u,2.6*u,.8*u,"#c9b27a");   // poste e corda enrolada
  drawPierLamp(t,y,u,n);
 }
}

// ---------- bichinhos de pixel (1 a 3 pixels cada), só enfeite ----------
// De dia: borboletas, passarinhos, gaivotas, coelhos, sapos, caranguejos e peixes saltando. De noite: vaga-lumes (drawFireflies, por cima da escuridão).
const CR_L=SURF_L+3,CR_R=SURF_R-3;
function critterQ(){return Math.max(.75,Math.round(Math.round(baseTile()/12)*.8)*worldZoom)}
function drawCritters(t){
 const u=pu(),y=Math.round(rowY(0)),q=critterQ(),day=1-clamp(nightAmt()*1.6,0,1);
 // borboletas (dia): voo em oito perto de onde nasceram, asas batendo
 if(day>.05)for(let i=0;i<22;i++){
  const home=CR_L+hash(i,101)*(CR_R-CR_L),x=colX(home+Math.sin(t*.4+i)*1.1+Math.sin(t*.9+i*2)*.4);if(x<-T||x>W+T)continue;
  const by=y-(4+hash(i,103)*9+Math.sin(t*1.1+i*1.7)*2.5)*u,col=["#ff9ac8","#ffd86a","#9ad0ff","#ffffff","#ff9a5a"][i%5],fl=Math.sin(t*14+i*3)>0;
  ctx.globalAlpha=day;PX(x,by,q,q,"#2f1c0e");PX(x-q,by-(fl?q:0),q,q,col);PX(x+q,by-(fl?q:0),q,q,col);if(!fl){PX(x-q,by+q,q,q,col);PX(x+q,by+q,q,q,col)}ctx.globalAlpha=1;
 }
 // passarinhos (dia) cruzando o céu e gaivotas girando na praia
 if(day>.05){
  const span=CR_R-CR_L+20;
  for(let i=0;i<6;i++){const w=CR_L-10+((hash(i,111)*span+t*(.5+hash(i,113)*.5))%span),x=colX(w),by=y-(30+hash(i,115)*12+Math.sin(t*1.2+i)*2)*u;if(x<-T||x>W+T)continue;
   const up=Math.sin(t*9+i*2)>0;ctx.globalAlpha=day;PX(x,by+(up?0:q),q,q,"#3a3a44");PX(x-q,by+(up?q:0),q,q,"#3a3a44");PX(x+q,by+(up?q:0),q,q,"#3a3a44");ctx.globalAlpha=1}
  for(let i=0;i<4;i++){const x=colX(48+hash(i,121)*10+Math.sin(t*.5+i*1.9)*4),by=y-(14+hash(i,123)*12+Math.sin(t*.8+i)*4)*u;if(x<-T||x>W+T)continue;
   const up=Math.sin(t*5+i*2.3)>0;ctx.globalAlpha=day;for(const dx of[-2,-1,1,2])PX(x+dx*q,by+(Math.abs(dx)===2?(up?-q:q):0),q,q,"#f4f4f8");PX(x,by+q,q,q,"#f4f4f8");ctx.globalAlpha=1}
 }
 // coelhos: pulam para um novo ponto e permanecem nele até o próximo salto
 for(let i=0;i<4;i++){
  const home=[-23,-12.2,13,34][i],cyc=3.4+i*.5,tt=t+i*1.3,ph=tt%cyc,cnt=Math.floor(tt/cyc),hop=ph>cyc-.8?(ph-(cyc-.8))/.8:-1;
  // Os offsets de cada ciclo viram o ponto de partida/alvo do salto seguinte: sem voltar ao ponto antigo.
  const p0=(hash(cnt,i+131)-.5)*4*u,p1=(hash(cnt+1,i+131)-.5)*4*u,k=hop>=0?hop:0,dir=p1>=p0?1:-1;
  const x=colX(home)+Math.round(p0+(p1-p0)*k);if(x<-T||x>W+T)continue;
  const by=y-(hop>=0?Math.sin(hop*Math.PI)*3*u:0);
  PX(x,by-2*q,3*q,2*q,"#d8d0bc");PX(x+(dir>0?2:0)*q,by-3*q,q,q,"#e8e0cc");PX(x+(dir>0?2:0)*q,by-4*q,q,q,"#d8d0bc");PX(x+(dir>0?0:2)*q,by-3*q,q,q,"#d8d0bc");PX(x+(dir>0?-1:3)*q,by-2*q,q,q,"#ffffff");PX(x+(dir>0?2:0)*q,by-3*q,q*.6,q*.6,"#2f1c0e");
 }
 // sapos nas margens do riacho: cada salto termina numa nova posição e não desfaz o movimento
 for(let i=0;i<8;i++){
  const home=[22.9,23.4,31.1,31.6,FRIV_C0-1.1,FRIV_C0-.6,FRIV_C1+1.1,FRIV_C1+1.6][i],cyc=3+i*.7,tt=t+i*.9,ph=tt%cyc,cnt=Math.floor(tt/cyc),hop=ph>cyc-.6?(ph-(cyc-.6))/.6:-1;
  const p0=(hash(cnt,i+181)-.5)*2.5*u,p1=(hash(cnt+1,i+181)-.5)*2.5*u,k=hop>=0?hop:0,x=colX(home)+Math.round(p0+(p1-p0)*k);if(x<-T||x>W+T)continue;
  const by=y-(hop>=0?Math.sin(hop*Math.PI)*3*u:0);PX(x,by-2*q,3*q,2*q,"#4da64d");PX(x,by-3*q,q,q,"#7ad07a");PX(x+2*q,by-3*q,q,q,"#7ad07a");PX(x,by-3*q,q*.5,q*.5,"#1c120c");PX(x+2.5*q,by-3*q,q*.5,q*.5,"#1c120c");
 }
 // caranguejos na areia (andam de lado)
 for(let i=0;i<4;i++){const x=colX(45+i*2.2+Math.sin(t*.6+i*2)*.7);if(x<-T||x>W+T)continue;const m=Math.sin(t*6+i)>0;
  PX(x,y-q,3*q,q,"#e0553a");PX(x-q,y-2*q,q,q,"#e0553a");PX(x+3*q,y-2*q,q,q,"#e0553a");PX(x,y-2*q,q*.6,q*.6,"#1c120c");PX(x+2*q,y-2*q,q*.6,q*.6,"#1c120c");PX(x+(m?-1:3)*q,y,q,q*.6,"#e0553a")}
 // peixes que saltam no riacho e no mar: o próximo salto começa onde o anterior aterrissou
 for(let i=0;i<9;i++){
  const sea=i>=3&&i<6,per=5+hash(i,141)*5,tt=t+hash(i,143)*per,cnt=Math.floor(tt/per),ph=tt%per;if(ph>.8)continue;
  const f=ph/.8,home=sea?54+hash(i,145)*5:i>=6?FRIV_C0+.8+hash(i,145)*3.4:24.8+hash(i,145)*4.4;
  // Posição de cada aterrissagem dentro do trecho de água. O destino vira a origem do salto seguinte.
  const p0=hash(cnt,i+147)*6*u,p1=hash(cnt+1,i+147)*6*u,x=colX(home)+p0+(p1-p0)*f,by=y-Math.sin(f*Math.PI)*9*u,fl=p1>=p0?1:-1;
  if(x<-T||x>W+T)continue;
  PX(x,by-q,3*q,q,"#dfeaf2");PX(x+q,by-2*q,q,q,"#b7c8d8");PX(x-q,by-(fl>0?0:2)*q,q,q,"#b7c8d8");PX(x+2*q,by-q,q*.6,q*.6,"#1c120c");
  if(f<.18||f>.82){ctx.globalAlpha=.7;PX(x-q,y-.6*q,5*q,.6*q,"#ffffff");ctx.globalAlpha=1}   // respingo ao entrar/sair da água
 }
}
const FIREFLIES=Array.from({length:Math.round(90*(SURF_R-SURF_L)/88)},(_,i)=>({c:SURF_L+3+hash(i,151)*(SURF_R-SURF_L-6),h:2.5+hash(i,153)*12,ph:hash(i,155)*6.28,sp:.6+hash(i,157)*1.2}));
function drawFireflies(t){   // vaga-lumes: pontinhos que piscam e passeiam sobre a grama e a água; só à noite, só perto da superfície, desenhados por cima da escuridão
 const n=nightAmt();if(n<.12)return;
 const u=pu(),y=Math.round(rowY(0)),q=critterQ();if(y<-T||y>H+T*2)return;
 for(const f of FIREFLIES){
  const x=colX(f.c+Math.sin(t*.5*f.sp+f.ph)*1.3+Math.sin(t*1.1*f.sp+f.ph*2)*.4);if(x<-T||x>W+T)continue;
  const fy=y-(f.h+Math.sin(t*.7*f.sp+f.ph*1.7)*2.2)*u,bl=Math.pow(Math.max(0,Math.sin(t*1.7*f.sp+f.ph)),2)*n;if(bl<.05)continue;
  ctx.globalAlpha=bl*.22;PX(x-q,fy-q,3*q,3*q,"#d6ff6a");ctx.globalAlpha=bl*.4;PX(x-q*.5,fy-q*.5,2*q,2*q,"#e8ff7a");ctx.globalAlpha=bl;PX(x,fy,q,q,"#fbffd0");ctx.globalAlpha=1;
 }
}

// ---------- tudo junto (chamado por drawGateAndChest, atrás do jogador) ----------
// pedrinhas e pedras chatas assentadas na linha do chão (direita): detalhe de terreno ao longo da passagem, nas margens do riacho e na praia (aí mais claras)
function drawPebbles(){
 const u=pu(),y=Math.round(rowY(0));
 for(let c=HALF+2;c<=SURF_R;c++){
  if(isRiver(c)||c>=PIER_C-1)continue;
  const beach=isBeach(c);
  for(let m=0;m<1;m++){
   const h=hash(c*3+m,971);if(h<(beach?.72:.8))continue;
   const x=forgeFx(c+(hash(c*3+m,973)-.5)*.9),w=(1.4+hash(c*3+m,975)*2.4)*u,hh=Math.max(u,w*(.45+hash(c*3+m,977)*.3));
   if(x<-T||x>W+T)continue;
   const i=Math.floor(hash(c*3+m,979)*4);
   PX(x,y-hh,w,hh,beach?["#d8cfb8","#c9bfa4","#e6dfcc","#b7ac92"][i]:STONE4[i]);PX(x,y-hh,w,Math.max(1,.45*u),beach?"#f2ecdc":"#bdb8ae");PX(x+w*.6,y-hh*.5,w*.4,hh*.5,"rgba(0,0,0,.14)");
  }
 }
}
function drawLandscape(t){
 if(rowY(0)<=8)return;
 drawWindmill(t);drawChurch(t);drawCauldron(t);drawForage(t);drawGarden(t);drawRiver(t);drawPebbles();drawCampfire(t);drawBeach(t);drawFishHints(t);drawCritters(t);
}

// ===== 5-desenho/14-cenoura-dourada.js — A cenoura dourada brotando da Rocha-mãe, no fundo do abismo =====
// Cenoura dourada: só o ombro aparece, brotando da rocha-mãe; raízes de cristal azuis e roxas descem pela pedra. Desenhada antes do jogador e da escuridão.
function drawGoldenCarrot(t){
 if(carrotC===null)return;
 const u=Math.max(.75,Math.round(baseTile()/14)*worldZoom),cx=Math.round(colX(carrotC)),y0=Math.round(rowY(FINAL_DEPTH)),pulse=.5+.5*Math.sin(t*2.2);
 ctx.save();   // raízes de cristal
 for(let k=-3;k<=3;k++)for(let i=0;i<7;i++){
  ctx.globalAlpha=Math.max(.12,.55-i*.06)*(.7+.3*Math.sin(t*2+k+i*.5));
  ctx.fillStyle=(k+i)%2?"#8fe6ff":"#d9a6ff";
  ctx.fillRect(cx+Math.round(k*(i*.55+1)*u),y0+i*2*u,u,2*u)}
 ctx.restore();
 ctx.save();ctx.globalCompositeOperation="lighter";   // brilho dourado
 const gr=T*(2.6+.4*pulse),gy=y0-5*u,g=ctx.createRadialGradient(cx,gy,0,cx,gy,gr);
 g.addColorStop(0,"rgba(255,214,90,"+(.5+.2*pulse)+")");g.addColorStop(1,"rgba(255,180,40,0)");
 ctx.fillStyle=g;ctx.fillRect(cx-gr,gy-gr,gr*2,gr*2);ctx.restore();
 const W7=[3,5,6,7,8,8,8];   // ombro: contorno, luz à esquerda, sombra à direita e sulcos
 ctx.fillStyle="#7a4a00";ctx.fillRect(cx-1.5*u,y0-8*u,3*u,u);
 for(let i=0;i<7;i++){const w=W7[i]*u,x=cx-w/2,y=y0-(7-i)*u;
  ctx.fillStyle="#7a4a00";ctx.fillRect(x-u,y,w+2*u,u);
  ctx.fillStyle="#ffd84a";ctx.fillRect(x,y,w,u);
  ctx.fillStyle="#e3a400";ctx.fillRect(x+w*.62,y,w*.38,u);
  if(i%2){ctx.fillStyle="#b87800";ctx.fillRect(x+u,y+u*.5,Math.max(u,w*.3),u*.4)}}
 ctx.fillStyle="#fff6c2";ctx.fillRect(cx-2*u,y0-5*u,u,2*u);
 const top=y0-8*u;   // folhas balançando
 for(let k=-1;k<=1;k++){const sw=Math.sin(t*1.4+k*1.3)*u*.8;
  ctx.fillStyle=k?"#4dbb4d":"#2f8a3a";ctx.fillRect(cx+k*2*u+sw*.5-u*.5,top-4*u,u,4*u);ctx.fillRect(cx+k*3*u+sw-u,top-6*u,2*u,2.5*u)}
 if(Math.random()<.18)parts.push({x:cx+(Math.random()-.5)*5*u,y:y0-4*u,vx:(Math.random()-.5)*14,vy:-18-Math.random()*22,l:.9,c:Math.random()<.5?"#ffd45c":"#fff6c2"});
}

// ===== 5-desenho/15-mesa-encantar.js — Mesa de encantamento decorativa da casa (somente visual) =====
// Não possui desbloqueio, interação, efeitos ou marcador no mapa. É apenas um detalhe visual: fica no altar da igreja (18-igreja.js).
function sprEnchant(){return mkSpr("enchant_s",10,8,{G:"#5a4a78",O:"#3d2f52",o:"#2b2238",y:"#ffd45c",R:"#8a1f3a",r:"#b8324f",e:"#5e1226",p:"#8a4fe0",P:"#c58bff",k:"#241609"},R=>{
 R(1,0,1,2,"p");R(1,0,1,1,"P");R(8,0,1,2,"p");R(8,0,1,1,"P");
 R(0,2,10,1,"G");R(0,3,10,1,"y");
 R(2,4,6,4,"R");R(2,4,1,3,"r");R(7,4,1,3,"r");R(2,7,6,1,"e");
 R(4,4,2,1,"y");R(3,5,4,1,"y");R(4,6,2,1,"y");
 R(1,4,1,4,"o");R(8,4,1,4,"o");R(0,7,2,1,"O");R(8,7,2,1,"O");
},1)}
function drawEnchant(t){
 const u=pu(),s=sprEnchant(),c=Math.round(forgeFx(CHURCH_C)+CHURCH_ALTAR_DX*u),y=Math.round(rowY(0)-CHURCH_ALTAR_LIFT*u),x0=Math.round(c-s.w*u/2),y0=Math.round(y-s.h*u);
 if(c<-T*6||c>W+T*6)return;
 pxShadow(c,(s.w+2)*u,y,u);
 ctx.save();ctx.fillStyle="#b45cff";ctx.globalAlpha=.035+.012*Math.sin(t*3);ctx.fillRect(c-s.w*u*.75,y0-5*u,s.w*u*1.5,(s.h+5)*u);ctx.restore();
 drawSpr(s,c,y,u);
 ctx.fillStyle=Math.sin(t*3)>0?"#fff3a0":"#ffd45c";ctx.fillRect(x0+4*u,y0+4*u,2*u,u);ctx.fillRect(x0+3*u,y0+5*u,4*u,u);ctx.fillRect(x0+4*u,y0+6*u,2*u,u);
 const bob=Math.round(Math.sin(t*2.2)*u*.6),bx=c-Math.round(2.5*u),by=y0-3*u+bob;
 ctx.fillStyle="#2b2238";ctx.fillRect(bx-u,by+u,7*u,2*u);
 ctx.fillStyle="#efe3bd";ctx.fillRect(bx,by,2*u,2*u);ctx.fillRect(bx+3*u,by,2*u,2*u);
 ctx.fillStyle="#cdbd8f";ctx.fillRect(bx,by+u,2*u,Math.max(1,Math.round(u*.5)));ctx.fillRect(bx+3*u,by+u,2*u,Math.max(1,Math.round(u*.5)));
 ctx.fillStyle="#8a4fe0";ctx.fillRect(bx+2*u,by,u,2*u);
 ctx.fillStyle=Math.sin(t*4)>0?"#c58bff":"#8a4fe0";
 ctx.fillRect(bx+Math.round(.5*u),by+Math.round(.5*u),Math.max(1,Math.round(u)),Math.max(1,Math.round(u*.4)));ctx.fillRect(bx+Math.round(3.5*u),by+Math.round(.5*u),Math.max(1,Math.round(u)),Math.max(1,Math.round(u*.4)));
 for(let k=0;k<2;k++){
  const ph=(t*.55+k/2)%1,sz=Math.max(1,Math.round(u*(1-ph*.5)));
  ctx.globalAlpha=(1-ph)*.55;ctx.fillStyle=k%2?"#c58bff":"#fff3a0";
  ctx.fillRect(Math.round(c+Math.sin(t*2+k*2.1)*u*(1.5+ph*1.5)-sz/2),Math.round(by-ph*u*6-sz),sz,sz)
 }
 ctx.globalAlpha=1;
}

// ===== 5-desenho/16-pesca-desenho.js — Desenho da pesca no mundo (vara, linha, boia, minijogo e resultado), da janela da fogueira e das dicas de pesca/venda no mundo =====
// Tudo em canvas 2D, só com quadradinhos (pixel art). Lógica: 2-sistemas/13-pesca.js e 14-fogueira.js.
// ===== Pixel art: tudo é desenhado com quadradinhos (fillRect em grade inteira), sem curvas nem suavização =====
// Preenche um retângulo em coordenadas inteiras (bordas arredondadas para a grade, sem borrar)
function fsR(g,x,y,w,h){const x1=Math.round(x),y1=Math.round(y),x2=Math.round(x+w),y2=Math.round(y+h);if(x2>x1&&y2>y1)g.fillRect(x1,y1,x2-x1,y2-y1)}
// Lista de pixels [coluna,linha,cor] -> contorno escuro de 1 pixel em volta e depois as cores; u = tamanho do pixel
function fsPx(g,px,x0,y0,u){
 g.fillStyle="#0b0f14";for(const[i,j]of px){g.fillRect(x0+(i-1)*u,y0+j*u,u,u);g.fillRect(x0+(i+1)*u,y0+j*u,u,u);g.fillRect(x0+i*u,y0+(j-1)*u,u,u);g.fillRect(x0+i*u,y0+(j+1)*u,u,u)}
 for(const[i,j,c]of px){g.fillStyle=c;g.fillRect(x0+i*u,y0+j*u,u,u)}
}
// Peixe de lado (16x9), olhando para a esquerda. B corpo · D dorso · L barriga · F nadadeiras e cauda · E/P olho
const FISH_PX=["......FFF.......","....DDDDDD....FF","..DDDDDDDDDD.FFF",".DDDDDDDDDDDFFFF",".BPEBBBBBBBBFFFF",".LLLLLLLLLLLFFFF","..LLLLLLLLLL.FFF","....LLLLLL....FF","......FF........"];
function fishIcon(g,cx,cy,s,col,dir,tail,uFix){   // s = comprimento aproximado em px · dir = 1 (esquerda) ou -1 (direita) · tail = balanço da cauda · uFix = tamanho do pixel fixo (opcional)
 const u=uFix||Math.max(1,Math.round(s*1.25/16)),d=dir||1,x0=Math.round(cx-8*u),y0=Math.round(cy-4.5*u),st=clamp(Math.round((tail||0)/(u*1.5)),-1,1);
 const pal={B:col,D:mixHex(col,"#000000",.28),L:mixHex(col,"#ffffff",.32),F:mixHex(col,"#000000",.14),E:"#ffffff",P:"#111111"},px=[];
 FISH_PX.forEach((row,j)=>{for(let i=0;i<16;i++){const c=row[i];if(c!==".")px.push([d>0?i:15-i,j+(i>=12?st:0),pal[c]])}});
 fsPx(g,px,x0,y0,u);
}
// Peixinho de 10x5 para a pista fina do minigame (olhando para a esquerda)
const FISHM_PX=["...DDD....",".DDBBBB.FF",".PEBBBBFFF",".LLLLLL.FF","...LL....."];
// Peixe da pista fina do minigame, de pé (5x10, escala u): a cabeça aponta para onde ele está indo (dir -1 = sobe, 1 = desce)
function fishLane(g,cx,cy,col,dir,tail,u){
 const d=dir||-1,x0=Math.round(cx-2.5*u),y0=Math.round(cy-5*u),st=clamp(Math.round((tail||0)/2),-1,1),pal={B:col,D:mixHex(col,"#000000",.28),L:mixHex(col,"#ffffff",.32),F:mixHex(col,"#000000",.14),E:"#ffffff",P:"#111111"},px=[];
 FISHM_PX.forEach((row,j)=>{for(let i=0;i<10;i++){const c=row[i];if(c!==".")px.push([j+(i>=7?st:0),d<0?i:9-i,pal[c]])}});
 fsPx(g,px,x0,y0,u);
}
// Boia (5x5): antena, topo vermelho e base branca
const BOB_PX=["..K..",".RRR.","RRRRR","WWWWW",".WWW."],BOB_C={K:"#111111",R:"#e23a2a",W:"#f4f4f4"};
function fsBobber(g,x,y,u){const px=[];BOB_PX.forEach((row,j)=>{for(let i=0;i<5;i++)if(row[i]!==".")px.push([i,j,BOB_C[row[i]]])});fsPx(g,px,Math.round(x-2.5*u),Math.round(y-2.5*u),u)}
// Elipse vazada em pixels (ondas na água)
function pxEllipse(g,cx,cy,rx,ry,u,col){
 g.fillStyle=col;const n=Math.max(12,Math.ceil((rx+ry)/u*1.6));
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2;g.fillRect(Math.round((cx+Math.cos(a)*rx)/u)*u,Math.round((cy+Math.sin(a)*ry)/u)*u,u,u)}
}
// Elipse cheia em pixels (brilho em degraus da fogueira)
function pxDisc(g,cx,cy,rx,ry,u,col){
 g.fillStyle=col;for(let y=-ry;y<ry;y+=u){const hw=rx*Math.sqrt(Math.max(0,1-(y+u/2)*(y+u/2)/(ry*ry)));g.fillRect(Math.round((cx-hw)/u)*u,Math.round((cy+y)/u)*u,Math.round(hw*2/u)*u,u)}
}
// Curva (linha de pesca) em pixels: pontos de uma Bézier quadrática encaixados na grade
function pxCurve(g,x0,y0,cx,cy,x1,y1,u,col){
 g.fillStyle=col;const n=Math.max(2,Math.ceil((Math.abs(x1-x0)+Math.abs(y1-y0))/u));
 for(let i=0;i<=n;i++){const t=i/n,m=1-t,x=m*m*x0+2*m*t*cx+t*t*x1,y=m*m*y0+2*m*t*cy+t*t*y1;g.fillRect(Math.round(x/u)*u,Math.round(y/u)*u,u,u)}
}
const fsLerp=(a,b,k)=>a+(b-a)*k;
// ---------- pesca no mundo ----------
let fishTip={x:0,y:0};   // ponta da vara na tela (calculada em drawPlayer a cada quadro)
// Ângulo do braço/vara (rad, antes do espelhamento) e curvatura da ponta, por fase da pesca
function rodPose(){
 const C=CASTT,t=fs.t,n=fs.age,ease=k=>k*k*(3-2*k);
 let a=-.95+Math.sin(n*1.6)*.02,b=.12;
 if(fs.ph==="cast"){
  if(t<C.wind){const k=ease(t/C.wind);a=fsLerp(-.95,-2.45,k);b=-.12*k}                 // balança a vara para trás
  else if(t<C.wind+C.snap){const k=(t-C.wind)/C.snap;a=fsLerp(-2.45,-.55,k);b=.55*(1-k)}   // estala para a frente
  else{const k=Math.min(1,(t-C.wind-C.snap)/.35);a=fsLerp(-.55,-.95,k);b=.2*(1-k)+.12*k}
 }else if(fs.ph==="bite"){a=-.83+Math.sin(n*38)*.07;b=.45+Math.sin(n*30)*.1}
 else if(fs.ph==="reel"){a=-.95+(fs.inZ?0:.1)+Math.sin(n*9)*(fs.inZ?.02:.06);b=fs.inZ?.3:.52}
 return{a,b};
}
// Altura (tela) da água visível: no riacho a ponte cobre a superfície, então a boia cai logo abaixo dela
const fishWy=()=>Math.round(rowY(0))+T*(fs.p==="r"?.6:.1);
// Posição da boia na tela
function fishBob(){
 const C=CASTT,k=T/baseTile(),tx=colX(fs.tc),ty=fishWy()+T*.04;
 let x=tx,y=ty;
 if(fs.ph==="cast"){
  const tr=C.wind+C.snap;
  if(fs.t<tr){x=fishTip.x;y=fishTip.y+5*k}   // pendurada na ponta da vara
  else{const q=Math.min(1,(fs.t-tr)/C.fly),e=1-(1-q)*(1-q);x=fsLerp(fishTip.x,tx,e);y=fsLerp(fishTip.y+5*k,ty,q)-Math.sin(q*Math.PI)*T*1.5}
 }
 else if(fs.ph==="wait")y=ty+Math.sin(fs.age*2.4)*2*k;
 else if(fs.ph==="bite"){y=ty+T*.1+Math.sin(fs.age*38)*3*k;x=tx+Math.sin(fs.age*29)*2*k}
 else if(fs.ph==="reel"){x=tx+Math.sin(fs.age*3.2)*(fs.inZ?5:16)*k;y=ty+Math.sin(fs.age*5)*3*k}
 return{x,y};
}
function fishSplash(n){   // gotinhas na água onde a boia está
 if(!fs)return;const B=fishBob();
 for(let i=0;i<n;i++)parts.push({x:B.x+(Math.random()-.5)*10,y:B.y,vx:(Math.random()-.5)*120,vy:-70-Math.random()*140,l:.55,c:i%3?"#bfe6ff":"#ffffff"});
}
// Visual das janelas: cor por raridade (comum, raro, lendário), painel com cantos arredondados e pílula de texto
const TIERC=["#7f9db3","#5fb8ff","#ffb43a"];
function fsRR(g,x,y,w,h){g.beginPath();g.rect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}   // cantos retos, como o resto do jogo (o raio é ignorado)
// Painel no estilo da janela do baú e do caça-níquel: fundo escuro em degradê com pedrinhas, moldura grossa de 3px na cor da raridade e lâmpadas correndo na borda de cima
// (mais rápidas quando está indo bem). Tudo em quadradinhos inteiros.
function fsBox(g,x,y,w,h,col,t,fast,noLamps){
 x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
 g.fillStyle="#000";g.fillRect(x,y,w,h);
 const bg=g.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,"#0b0c14");bg.addColorStop(1,"#1a1420");g.fillStyle=bg;g.fillRect(x+3,y+3,w-6,h-6);
 for(let i=0;i<14;i++){const px=x+4+(i*53)%Math.max(1,w-14),py=y+4+(i*37)%Math.max(1,h-14),s=2+(i%3)*2;g.fillStyle=i%2?"rgba(255,255,255,.05)":"rgba(0,0,0,.25)";g.fillRect(px,py,s,s)}
 g.fillStyle=col;g.fillRect(x,y,w,3);g.fillRect(x,y+h-3,w,3);g.fillRect(x,y,3,h);g.fillRect(x+w-3,y,3,h);
 g.fillStyle="#000";g.fillRect(x+3,y+3,w-6,1);g.fillRect(x+3,y+h-4,w-6,1);g.fillRect(x+3,y+3,1,h-6);g.fillRect(x+w-4,y+3,1,h-6);
 if(noLamps)return;   // sem as lâmpadas piscando na borda de cima
 const n=Math.max(4,Math.floor((w-16)/10)),run=fast?14:5;
 for(let i=0;i<n;i++){const on=((i+Math.floor(t*run))%3)===0,lx=Math.round(x+8+i*(w-20)/Math.max(1,n-1));g.fillStyle=on?"#fff3a0":mixHex(col,"#000000",.55);g.fillRect(lx,y+5,4,4);if(on){g.fillStyle="rgba(255,212,92,.35)";g.fillRect(lx-1,y+4,6,1);g.fillRect(lx-1,y+9,6,1)}}
}
// "!" desenhado em pixels (2 de largura, 5 de haste, vão e ponto), com contorno escuro, para não depender da fonte
const BANG_PX=["XX","XX","XX","XX","XX","..","XX","XX"];
function fsBang(g,cx,cy,u,hop){
 const px=[];BANG_PX.forEach((row,j)=>{for(let i=0;i<2;i++)if(row[i]==="X")px.push([i,j,j<2?"#fff3a0":"#ffd45c"])});
 fsPx(g,px,Math.round(cx-u),Math.round(cy-4*u-hop),u);
}
function fsFit(g,txt,maxW,size,wt){let z=size;g.font=(wt||700)+" "+z+"px "+FONT;while(g.measureText(txt).width>maxW&&z>7){z--;g.font=(wt||700)+" "+z+"px "+FONT}return z}
function drawFishing(t){
 if(!fs)return;
 const g=ctx,k=T/baseTile(),sy=fishWy(),ph=fs.ph,t2=fs.age,C=CASTT,B=fishBob(),done=ph==="done";
 g.save();g.textBaseline="alphabetic";
 if(!done){
  // ondas em volta da boia e o anel da queda na água
  if(ph==="wait"||ph==="bite"||ph==="reel"){
   const bite=ph==="bite";g.lineWidth=Math.max(1.5,k*.9);
   for(let i=0;i<2;i++){const q=((bite?t2*3:t2*.8)+i*.5)%1;g.globalAlpha=(1-q)*.85;pxEllipse(g,B.x,sy,(8+q*(bite?34:22))*k,(2+q*(bite?9:5))*k,Math.max(2,Math.round(k*1.5)),"#ffffff")}
  }
  if(fs.rip<.9){const q=fs.rip/.9;g.globalAlpha=(1-q)*.9;pxEllipse(g,colX(fs.tc),sy,(6+q*34)*k,(1.6+q*8)*k,Math.max(2,Math.round(k*1.5)),"#ffffff")}
  g.globalAlpha=1;
  // linha da ponta da vara até a boia
  const sag=ph==="cast"?(fs.t<C.wind+C.snap?4*k:T*.12):ph==="wait"?T*.5:ph==="bite"?T*.28:T*.07;
  pxCurve(g,fishTip.x,fishTip.y,(fishTip.x+B.x)/2,(fishTip.y+B.y)/2+sag,B.x,B.y-5*k,Math.max(1,Math.round(k*.9)),"#e8eef2");
  // peixe nadando embaixo da boia durante o minijogo
  if(ph==="reel"&&fs.f){
   const fx=colX(fs.tc)+Math.sin(t2*2.3)*18*k*.8,fy=sy+T*(.3+1.0*(fs.fy/FSC.h)),sz=(26+fs.f.d*2)*k*.55;
   g.globalAlpha=.9;fishIcon(g,fx,fy,sz,fs.f.c,Math.cos(t2*2.3)>0?1:-1,Math.sin(t2*14)*3*k);g.globalAlpha=.35;pxCurve(g,B.x,B.y+5*k,(B.x+fx)/2,(B.y+fy)/2,fx,fy-sz*.2,Math.max(1,Math.round(k*.9)),"#ffffff");g.globalAlpha=1;
  }
  // boia
  const r=5.5*k;
  fsBobber(g,B.x,B.y,Math.max(2,Math.round(1.3*k)));   // boia/isca pequena (antes 2.2*k)
  // "!" quando o peixe morde
  if(ph==="bite"){
   const fz=clamp(34*k*.75,28,88),u=Math.max(2,Math.round(fz/15)),hop=Math.round(Math.abs(Math.sin(t2*16))*u*1.5),by=Math.round(B.y-r-u*5);
   fsBang(g,B.x,by,u,hop);
  }
 }
 g.globalAlpha=1;
 // minijogo: painel ao lado da boia, no estilo do baú/cassino (moldura na cor da raridade, lâmpadas na borda). Alto: lâmpadas e tempo restante · meio: pista de captura e barra de progresso com marcas de 25%
 // · baixo: ★ com a tolerância do PERFEITO (esvazia a cada segundo fora da zona) e a tecla Espaço, cheia enquanto você segura
 if(ph==="reel"){
  const B2=BAL.fish,kb=clamp((H-190)/(FSC.h+78),.55,1.5),bh=FSC.h*kb,fu=Math.max(2,Math.round(kb*2)),tw=5*fu+6,pw=Math.max(3,Math.round(3*kb)),pad=7*kb,iw=Math.max(tw+pw+5*kb,36*kb),tot=pad*2+iw,rest=colX(fs.tc),hd=Math.max(20,Math.round(20*kb)),ft=40*kb;
  let x0=rest+T;if(x0+tot>W-16)x0=rest-T-tot;x0=clamp(x0,16,Math.max(16,W-tot-16));   // à direita da boia; se não couber, à esquerda
  const ty=clamp(H*.5-bh/2,60+hd,Math.max(60+hd,H-bh-ft-120)),ix=x0+pad,tx=ix+(iw-tw-pw-6*kb)/2,tc=TIERC[fs.f.t]||TIERC[0];
  fsBox(g,x0,ty-hd,tot,bh+hd+ft,tc,t2,fs.inZ,true);
  // tempo restante (azul; vermelho no fim)
  const tl=clamp(1-fs.t/B2.maxTime,0,1),tb=ty-9,th=3;
  g.fillStyle="#000";fsR(g,ix-1,tb-1,iw+2,th+2);g.fillStyle="#13222f";fsR(g,ix,tb,iw,th);g.fillStyle=tl>.2?"#6fb8ff":"#ff6a4a";fsR(g,ix,tb,iw*tl,th);
  // pista
  g.fillStyle="#13222f";fsRR(g,tx,ty,tw,bh);g.fill();
  g.save();fsRR(g,tx,ty,tw,bh);g.clip();
  for(let i=1;i<8;i++){g.fillStyle="rgba(255,255,255,.07)";fsR(g,tx,ty+i*bh/8,tw,1)}
  const zt=ty+(fs.zc-fs.zh/2)*kb,zh=fs.zh*kb;
  g.fillStyle=fs.inZ?"rgba(90,230,130,.65)":"rgba(90,230,130,.34)";fsRR(g,tx+2,zt,tw-4,zh);g.fill();g.strokeStyle=fs.inZ?"#b6ffc8":"#5fd885";g.lineWidth=2;g.stroke();
  g.restore();
  g.strokeStyle="#000";g.lineWidth=2;fsRR(g,tx,ty,tw,bh);g.stroke();
  if(fs.pfy===undefined)fs.pfy=fs.fy;if(Math.abs(fs.fy-fs.pfy)>.2)fs.fd=fs.fy<fs.pfy?-1:1;fs.pfy=fs.fy;
  fishLane(g,tx+tw/2,ty+fs.fy*kb,fs.f.c,fs.fd||-1,Math.sin(t2*16)*2,fu);
  // barra de progresso: vermelha perto de perder, verde perto de pegar
  const px=tx+tw+5*kb,pr=clamp(fs.pr,0,1);
  g.fillStyle="#13222f";fsRR(g,px,ty,pw,bh);g.fill();
  if(pr>0){g.fillStyle="hsl("+Math.round(pr*120)+",80%,52%)";fsR(g,px,ty+bh*(1-pr),pw,bh*pr)}
  g.fillStyle="#000";for(let i=1;i<4;i++)fsR(g,px,Math.round(ty+bh*i/4)-1,pw,2);   // marcas de 25%, 50% e 75%
  g.strokeStyle="#000";g.lineWidth=2;fsRR(g,px,ty,pw,bh);g.stroke();
  // rodapé 1: ★ + tolerância do PERFEITO
  const f1=ty+bh+10*kb,left=clamp(1-fs.outT/B2.perfectOut,0,1),bx=ix+16*kb,bwf=iw-16*kb,bhf=7*kb;
  g.textAlign="left";g.textBaseline="middle";g.font="900 "+Math.round(13*kb)+"px "+FONT;g.fillStyle=left>0?"#ffd45c":"#4a5a68";g.fillText(left>0?"\u2605":"\u2606",ix,f1+bhf/2);
  g.fillStyle="#000";fsR(g,bx-1,f1-1,bwf+2,bhf+2);g.fillStyle="#13222f";fsR(g,bx,f1,bwf,bhf);g.fillStyle="#ffd45c";fsR(g,bx,f1,bwf*left,bhf);
  // rodapé 2: tecla Espaço (cheia enquanto segura)
  const f2=f1+bhf+16*kb,ch2=Math.round(18*kb);
  g.fillStyle="#000";fsR(g,ix,f2-ch2/2,iw,ch2);g.fillStyle=fishHold?"#ffd45c":"#2c2c2c";fsR(g,ix+2,f2-ch2/2+2,iw-4,ch2-4);

 }
 g.restore();
}

// ---------- janela da fogueira ----------
function campDraw(g,dt){
 const{w,h}=CPC,c=cp,t=c.age,fl=.85+.15*Math.sin(t*9.1)+.05*Math.sin(t*14.3),cx=w/2,gy=170;
 g.setTransform(cpCv.width/w,0,0,cpCv.height/h,0,0);g.clearRect(0,0,w,h);
 ["#120d1c","#161020","#1b1321","#211722","#2a1a12"].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,Math.round(i*h/5),w,Math.ceil(h/5)+1)});   // céu em faixas
 for(let i=0;i<18;i++){g.fillStyle="rgba(255,255,255,"+(.25+.35*Math.abs(Math.sin(t*1.3+i))).toFixed(2)+")";g.fillRect((i*67+13)%w,(i*31+5)%70,2,2)}
 for(let i=5;i>=1;i--)pxDisc(g,cx,gy-20,i*34,i*22,4,"rgba(255,130,45,"+(.075*fl).toFixed(3)+")");   // luz da fogueira em degraus
 g.fillStyle="#2b1d12";g.fillRect(0,gy,w,h-gy);g.fillStyle="#3a2817";g.fillRect(0,gy,w,4);
 // pedras, lenha e chamas
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2,sx=cx+Math.cos(a)*50,sy=gy+2+Math.sin(a)*5;g.fillStyle=["#8a8680","#6f6b66","#9a968f"][i%3];g.fillRect(sx-8,sy-8,16,10)}
 g.fillStyle="#5a3a1c";g.save();g.translate(cx,gy-4);g.rotate(-.35);g.fillRect(-44,-5,88,10);g.restore();g.save();g.translate(cx,gy-4);g.rotate(.35);g.fillRect(-44,-5,88,10);g.fillStyle="#7a4f27";g.fillRect(-44,-5,88,3);g.restore();
 for(let i=-4;i<=4;i++){const hh=(46-Math.abs(i)*8)*fl*(.8+.2*Math.sin(t*7+i*2.1)),x=cx+i*9-5;
  g.fillStyle="#ff8a1f";g.fillRect(x,gy-6-hh,10,hh);g.fillStyle="#ffb43a";g.fillRect(x+1,gy-6-hh*.65,8,hh*.65);g.fillStyle="#fff0a0";g.fillRect(x+2,gy-6-hh*.35,6,hh*.35)}
 for(let k=0;k<10;k++){const ph=(t*.7+k*.137)%1,sx=cx+Math.sin(t*2+k*3)*30+(k%3-1)*8,sy=gy-40-ph*90;g.fillStyle="rgba(255,207,112,"+(1-ph).toFixed(2)+")";g.fillRect(sx,sy,2,2)}
 // peixe no espeto
 if(c.sc==="roast"||c.sc==="result"){
  const f=c.f,p=c.sc==="roast"?c.tt:null,q=c.sc==="result"?c.res.q:null;
  let col;
  if(c.sc==="roast"){const z=[.5,.74,.9];col=p<z[0]?mixHex(f.c,"#d9a05b",p/z[0]):p<z[1]?mixHex("#d9a05b","#e8a43a",(p-z[0])/(z[1]-z[0])):p<z[2]?"#f0b23c":mixHex("#f0b23c","#241812",Math.min(1,(p-z[2])/(1-z[2])))}
  else col=[mixHex(f.c,"#d9a05b",.7),"#e8a43a","#f0b23c","#241812"][q];
  const sy=gy-96+Math.sin(t*3)*1.2;
  g.strokeStyle="#a8793f";g.lineWidth=4;g.lineCap="round";g.beginPath();g.moveTo(cx-100,sy+4);g.lineTo(cx+100,sy-4);g.stroke();
  g.fillStyle="#5a3a1c";g.fillRect(cx-122,sy+6,18,40);g.fillRect(cx+104,sy-6,18,52);   // forquilhas de apoio
  fishIcon(g,cx,sy,56,col,1,0);
  if(c.sc==="roast"&&p>.4){for(let k=0;k<3;k++){const ph=(t*.9+k/3)%1;g.fillStyle="rgba(235,235,240,"+((1-ph)*(p>.88?.5:.25)).toFixed(2)+")";if(p>.88)g.fillStyle="rgba(60,60,64,"+((1-ph)*.6).toFixed(2)+")";g.fillRect(cx-30+k*30+Math.sin(t*2+k)*6,sy-20-ph*40,8+ph*6,8+ph*6)}}
  if(c.sc==="result"){   // faixa do resultado como a do baú: texto grande com contorno, sem painel
   const nm=[__("Mal passado"),__("No ponto"),__("PERFEITO!"),__("Queimou!")][q],qc2=["#9fb4c4","#ffb43a","#ffd45c","#ff6a4a"][q],e=clamp(c.t/.35,0,1),sz=Math.max(8,Math.round(fsFit(g,nm,w-40,30,900)*easeOutBack(e)));
   g.textAlign="center";g.textBaseline="middle";g.font="900 "+sz+"px "+FONT;g.lineWidth=7;g.lineJoin="round";g.strokeStyle="rgba(8,6,12,.9)";g.strokeText(nm,cx,42);g.fillStyle=q===2?"hsl("+(40+Math.sin(t*6)*12)+",100%,"+(60+Math.sin(t*9)*8)+"%)":qc2;g.fillText(nm,cx,42)}
 }
 // HUD do assado, no estilo do baú/cassino: só o medidor, num painel com moldura na cor da raridade e lâmpadas na borda (correm mais rápido e a moldura fica dourada no ponto PERFEITO).
 // Sem nome do peixe, aviso de estado nem segundos: as cores das faixas dizem o ponto. Barra fina; o marcador vai e volta cada vez mais rápido.
 let frame="#7a4f27";
 if(c.sc==="roast"){
  const z=BAL.fish.cook.zones,x0=24,bw=w-48,y0=199,bh=8,p=Math.min(1,c.p),qi=campQuality(p),big=qi===2;
  frame=TIERC[c.f.t]||TIERC[0];
  fsBox(g,x0-12,182,bw+24,34,big?(Math.floor(t*8)%2?"#ffd45c":"#fff3a0"):frame,t,big);
  const segs=[[0,z[0],"#566a7a"],[z[0],z[1],"#d98a2a"],[z[1],z[2],"#ffd45c"],[z[2],1,"#6a2420"]];
  for(const[a,b,col]of segs){const sx=Math.round(x0+bw*a),sw=Math.round(x0+bw*b)-sx;g.fillStyle=col;g.fillRect(sx,y0,sw,bh);g.fillStyle="rgba(255,255,255,.18)";g.fillRect(sx,y0,sw,2)}
  g.fillStyle="#000";for(const f of z)g.fillRect(Math.round(x0+bw*f)-1,y0,2,bh);
  const mx=Math.round(x0+bw*p);   // marcador que vai e volta
  g.fillStyle="#000";g.fillRect(mx-3,y0-4,6,bh+8);g.fillStyle="#fff";g.fillRect(mx-1,y0-4,2,bh+8);
  g.strokeStyle="#000";g.lineWidth=2;g.strokeRect(x0,y0,bw,bh);
 }else if(c.sc==="result")frame=["#9fb4c4","#ffb43a","#ffd45c","#ff6a4a"][c.res.q];
 g.strokeStyle=frame;g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3);   // moldura da janela, como a do baú
}

// ---------- dicas no mundo ----------
function drawFishHints(t){
 if(!atSurface()||modal||fs)return;
 const u=pu(),y=Math.round(rowY(0)),sp=fishSpot();
 if(sp){const rv=riverOf(S.mc),forest=rv[0]===FRIV_C0,c=sp==="r"?(rv[0]+rv[1])/2:PIER_C+.6,x=Math.round(forgeFx(c));if(x>-T*3&&x<W+T*3)lbl(sp==="r"?(forest?__("Riacho da floresta: clique para pescar"):__("Riacho: clique para pescar")):__("Mar: clique para pescar"),x,y-14*u-Math.sin(t*4)*2,"#6fe3a0")}
 if(nearKeeper()&&S.fb.length){const x=Math.round(colX(KEEPER_C));lbl(__("Vender"),x,y-66*worldZoom-Math.sin(t*4)*2,"#6fe3a0")}   // logo acima do nome do Izans
}

// ===== 5-desenho/17-altitude.js — Céu com altitude: escurece até quase o espaço, estrelas de dia, camadas de nuvens (cirros e fiapos) e vida no céu (pássaros, pipa, avião de papel, balão) =====
// Tudo aqui é desenhado em coordenadas da tela, preso ao chão (a altura de cada coisa é medida acima do horizonte), então rola junto com o mundo quando se sobe com o jato.
// altAmt(): 0 = no chão · 1 = no teto do jato (SKY_CEIL, em 3-mundo/01-celulas.js). altTop(): altura (em blocos) do topo da tela no teto do jato.
const altAmt=()=>clamp((rowY(0)-H*SURF)/(T*SKY_CEIL),0,1);
const altTop=()=>H*SURF/T+SKY_CEIL;
const altSmooth=(a,b,x)=>{const u=clamp((x-a)/(b-a),0,1);return u*u*(3-2*u)};
// Escurecimento: por cima do degradê do céu, de baixo (transparente, perto do horizonte) para cima (azul-profundo, índigo e quase o preto do espaço).
// [posição 0-1, r, g, b, alfa]. A escuridão de cada ponto depende da altura dele acima do chão, então o horizonte continua claro e o topo escurece só quando se sobe.
const ALT_PAL=[[0,40,90,200,0],[.3,30,70,175,.42],[.62,26,30,128,.8],[1,8,8,38,.97]];
function altPal(d){let i=1;while(i<ALT_PAL.length-1&&d>ALT_PAL[i][0])i++;const a=ALT_PAL[i-1],b=ALT_PAL[i],k=(d-a[0])/(b[0]-a[0]);return[1,2,3,4].map(j=>a[j]+(b[j]-a[j])*k)}
function altSpace(sky){
 const yRef=H*SURF,span=T*SKY_CEIL;if(sky-yRef<2)return;
 const g=ctx.createLinearGradient(0,0,0,sky),N=18;
 for(let i=0;i<=N;i++){const f=i/N,c=altPal(altSmooth(0,1,clamp((sky-f*sky-yRef)/span,0,1)));g.addColorStop(f,"rgba("+Math.round(c[0])+","+Math.round(c[1])+","+Math.round(c[2])+","+c[3].toFixed(3)+")")}
 ctx.fillStyle=g;ctx.fillRect(0,0,W,sky+1);
 const al=altAmt(),hh=T*3.2,hg=ctx.createLinearGradient(0,sky-hh,0,sky);   // brilho claro perto do horizonte
 hg.addColorStop(0,"rgba(150,205,255,0)");hg.addColorStop(1,"rgba(170,215,255,"+(.3*al).toFixed(3)+")");ctx.fillStyle=hg;ctx.fillRect(0,sky-hh,W,hh+1);
}
// Estrelas fracas: cada uma tem uma altura fixa acima do chão e só aparece quando o céu ali já está escuro (somem de novo ao descer)
function altStars(sky,t,ps){
 const yRef=H*SURF,span=T*SKY_CEIL,hmax=yRef+span;if(sky-yRef<2)return;
 const cov=clamp(1-wx.cover*.7,0,1),s=Math.max(2,Math.round(ps*.75));
 for(let i=0;i<90;i++){
  const hp=hash(i,47)*hmax,d=(hp-yRef)/span;if(d<=.12)continue;
  const y=Math.round((sky-hp)/ps)*ps;if(y<0||y>sky)continue;
  const x=Math.round(((((hash(i,31)*W-camX*T*.02)%W)+W)%W)/ps)*ps,k=i%6===0?2:1;
  ctx.globalAlpha=clamp(altSmooth(.12,.7,d)*(.4+.4*(.5+.5*Math.sin(t*1.3+i*2.1)))*cov,0,1);
  ctx.fillStyle=i%7===0?"#fff3c0":"#ffffff";ctx.fillRect(x,y,s*k,s*k);
 }
 ctx.globalAlpha=1;
}
// Nuvens de altitude: cirros (finos e esticados, poucos) na faixa do meio e só alguns fiapos perto do topo; acima disso nenhuma.
// As nuvens fofas de baixo continuam em 02-ceu-nuvens.js (só na faixa de baixo, sem repetir para cima).
function altClouds(sky,t,scale,night,ps){
 const top=altTop(),hmax=H*SURF+SKY_CEIL*T,span=W+360*scale,al0=1-night*.5;
 const X=(i,sd,v,par,mg)=>{return((((hash(i,sd)*span)+t*v-camX*T*par)%span)+span)%span-mg};
 const R=v=>Math.round(v/ps)*ps;
 ctx.fillStyle="#ffffff";
 for(let i=0;i<9;i++){   // cirros
  const L=.44+.2*((i*.618+.13)%1),len=R((110+90*hash(i,5))*scale),x=R(X(i,9,(2.6+1.6*(i%3))*(i&1?-1:1),.1,180*scale)),y=R(sky-L*hmax+Math.sin(t*.2+i)*2);
  if(x>W||x+len<0||y<-ps*3||y>sky)continue;
  ctx.globalAlpha=.4*al0;ctx.fillRect(x,y,len,ps);
  ctx.globalAlpha=.26*al0;ctx.fillRect(x+R(len*.18)+ps*3,y+ps,R(len*.6),ps);
  ctx.globalAlpha=.2*al0;ctx.fillRect(x+R(len*.62),y-ps,R(len*.28),ps);
 }
 for(let i=0;i<5;i++){   // fiapos no topo
  const L=.7+.18*((i*.618+.31)%1),len=R((50+60*hash(i,15))*scale),x=R(X(i,19,(2+i%2)*(i&1?1:-1),.08,120*scale)),y=R(sky-L*hmax),f=1-altSmooth(.8,.9,L);
  if(x>W||x+len<0||y<-ps*3||y>sky||f<.02)continue;
  ctx.globalAlpha=.3*al0*f;ctx.fillRect(x,y,len,ps);
  ctx.globalAlpha=.18*al0*f;ctx.fillRect(x+R(len*.3),y+ps,R(len*.35),ps);ctx.fillRect(x+len,y-ps,ps,ps);
 }
 ctx.globalAlpha=1;
}
// ---- Vida no céu ----
// [tipo, altura 0-1 (fração de altTop), velocidade px/s (negativa = vai para a esquerda), pássaros, fase]
const SKY_LIFE=[["flock",.27,15,6,1],["kite",.36,-8,0,2],["flock",.52,-12,5,3],["plane",.6,24,0,4],["balloon",.74,6,0,5],["flock",.82,-18,2,6]];
function skyBird(x,y,u,f){
 for(const[i,j]of(f?[[-2,1],[-1,0],[0,-1],[1,0],[2,1],[0,0]]:[[-2,-1],[-1,0],[0,1],[1,0],[2,-1],[0,0]]))ctx.fillRect(x+i*u,y+j*u,u,u);
}
function skyKite(x,y,u,t){
 for(let j=-3;j<=3;j++){const w=3-Math.abs(j);for(let i=-w;i<=w;i++){ctx.fillStyle=i===0||j===0?"#7a3a1a":i<0?"#e8483a":"#ffd24a";ctx.fillRect(x+i*u,y+j*u,u,u)}}
 for(let k=1;k<=7;k++){ctx.fillStyle=k&1?"#e8483a":"#ffffff";ctx.fillRect(Math.round((x+Math.sin(t*3+k*.9)*u*1.4*(.3+k/7))/u)*u,y+(3+k*1.7)*u,u,u)}
}
function skyPlane(x,y,u){
 ctx.fillStyle="#ffffff";ctx.fillRect(x,y,u*7,u);ctx.fillRect(x,y-u,u,u);
 ctx.fillStyle="#d5dcea";ctx.fillRect(x+u*2,y+u,u*5,u);
 ctx.fillStyle="#a9b4cc";ctx.fillRect(x+u*4,y+u*2,u*3,u);
}
function skyBalloon(x,y,u){
 const cols=["#d9483b","#f6e7c1"];
 for(let j=-6;j<=9;j++){const w=j<=6?Math.floor(Math.sqrt(36-j*j+.5)):j===7?3:j===8?2:1;for(let i=-w;i<=w;i++){ctx.fillStyle=cols[Math.floor((i+7)/2)&1];ctx.fillRect(x+i*u,y+j*u,u,u)}}
 ctx.fillStyle="#5a3b24";ctx.fillRect(x-u*2,y+9*u,u,u*3);ctx.fillRect(x+u,y+9*u,u,u*3);
 ctx.fillStyle="#a8693a";ctx.fillRect(x-u*2,y+12*u,u*4,u*2);ctx.fillStyle="#7a4a28";ctx.fillRect(x-u*2,y+13*u,u*4,u);
 ctx.fillStyle="#ffdf80";ctx.fillRect(x-u,y+8*u,u*2,u);
}
function skyLife(sky,t,scale,night,ps){
 const vis=clamp(1-wx.cover*1.2,0,1)*(1-night*.45);if(vis<.03)return;
 const hmax=H*SURF+SKY_CEIL*T,yRef=H*SURF,span=T*SKY_CEIL,w=W+300,u=Math.max(2,ps-1);
 ctx.globalAlpha=vis;
 for(const[k,L,v,n,ph]of SKY_LIFE){
  const hp=L*hmax,bob=Math.sin(t*.5+ph)*ps*2,y=Math.round((sky-hp+bob)/ps)*ps,dir=v<0?-1:1;
  const x=Math.round(((((hash(ph,77)*w)+t*v-camX*T*.08)%w)+w)%w-150);
  if(y<-ps*16||y>sky+ps*4||x<-90||x>W+90)continue;
  if(k==="flock"){
   const d=altSmooth(0,1,clamp((hp-yRef)/span,0,1)),c=[0,1,2].map(j=>Math.round([40,52,78][j]+([216,224,244][j]-[40,52,78][j])*d));
   ctx.fillStyle="rgb("+c+")";
   for(let j=0;j<n;j++){const r=Math.ceil(j/2),sd=j&1?-1:1;skyBird(Math.round((x-dir*r*u*4+Math.sin(t*.9+j)*u)/u)*u,Math.round((y+(j?sd*r*u*1.8:0)+Math.sin(t*.7+j*1.3)*u*.6)/u)*u,u,Math.sin(t*8+j*1.7+ph)>.15)}
  }else if(k==="kite")skyKite(Math.round(x/ps)*ps,y,ps,t);
  else if(k==="plane")skyPlane(Math.round(x/ps)*ps,Math.round((y+Math.sin(t*.9+ph)*ps*3)/ps)*ps,ps);
  else if(k==="balloon")skyBalloon(Math.round(x/ps)*ps,y,ps);
 }
 ctx.globalAlpha=1;
}

// ===== 5-desenho/18-igreja.js — Igreja gótica de pedra no fim do bosque da esquerda, com interior à vista e a mesa de encantar no altar =====
// Por fora: torre sineira com flecha de ardósia e sino dourado, portal com tochas, telhado de ardósia com grade e cruzes, transepto com empena e pináculos.
// Por dentro (corte aberto na frente, como a forja: o jogador anda diante dos bancos): vigas de madeira, parede de reboco com vitrais coloridos, estandartes,
// dois lustres de velas, confessionário, seis bancos e, no transepto, o altar com degraus e tapete vermelho diante do vitral grande, onde fica a mesa de encantar (15-mesa-encantar.js).
// Sprite único em pixel art (mkSpr), 1 pixel de sprite = pu(). De noite os vitrais, os lustres, as tochas e os castiçais abrem a escuridão (churchHoles, chamada por lampHoles).
const CHURCH_W=167,CHURCH_H=73;
const CHURCH_WIN=[68,87,106];   // x do canto esquerdo dos três vitrais da nave (largura 7)
const CHURCH_FLAMES=[[23,58],[39,58],[7,62],[124,57],[134,57]];   // chamas animadas (tochas do portal, lanterna e castiçais do altar), em pixels de sprite
const CHURCH_LUSTRES=[[74,56],[102,56]];   // lustres de velas
const CHURCH_ALTAR_DX=129-CHURCH_W/2,CHURCH_ALTAR_LIFT=2;   // a mesa de encantar fica no centro do altar (x do sprite 129), sobre o degrau de 2 px
function sprChurch(){
 const PAL=Object.assign({
  s0:"#c4c0b8",s1:"#a8a49c",s2:"#8f8b85",s3:"#77746e",s4:"#5f5c57",s5:"#46443f",   // pedra, da luz à sombra
  r0:"#5a6076",r1:"#454a5d",r2:"#363a4a",r3:"#282b37",r4:"#1b1d26",                   // telhas de ardósia
  a0:"#fff0a8",a1:"#ffd35a",a2:"#f5a82a",a3:"#c97a14",ml:"#2a2019",bd:"#1b1a22",       // vitral âmbar, chumbo e vão escuro do sino
  sg0:"#3a5ac8",sg1:"#c8392f",sg2:"#f2c53a",sg3:"#6a8cec",                             // vitral colorido (azul, vermelho, amarelo)
  g0:"#fff0a0",g1:"#e6b030",g2:"#a8741a",g3:"#6a460c",ir:"#2e2a2a",                    // ouro e ferro
  b0:"#3a58a8",b1:"#2a4282",b2:"#1c2d5c",                                              // estandarte azul
  pl:"#bfae8c",pl1:"#cdbf9f",pl2:"#a89877",pl3:"#8c7c5e",pl4:"#6e6048",                // reboco interno
  mr:"#7a1f2e",mr2:"#a8324a",cr:"#b02434",cr2:"#7e1522",cd:"#f4ecd0",pu:"#6a2f7a",pu2:"#4a1f58"   // almofadas, tapete, vela e cortina roxa
 },WOOD,METAL);
 return mkSpr("church2",CHURCH_W,CHURCH_H,PAL,R=>{
  const px=(x,y,c)=>R(x,y,1,1,c),h2=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
  // parede de tijolos de pedra: fiadas de 3 px, juntas alternadas a cada 7 px e pedras mais claras/escuras
  const bricks=(x0,y0,w,h,sd)=>{
   R(x0,y0,w,h,"s2");
   for(let j=0;j<h;j++){const row=Math.floor(j/3);
    if(j%3===2){R(x0,y0+j,w,1,"s4");continue}
    const off=(row%2)*3;
    for(let i=0;i<w;i++){const b=Math.floor((i+off)/7);
     if((i+off)%7===0){px(x0+i,y0+j,"s4");continue}
     const v=h2(b+sd,row*3+sd);if(v>.72)px(x0+i,y0+j,"s1");else if(v<.2)px(x0+i,y0+j,"s3");
    }}
  };
  // telhado de ardósia: fiadas de 3 px com luz em cima, sombra embaixo e juntas alternadas
  const slate=(x0,y0,w,h)=>{
   R(x0,y0,w,h,"r2");
   for(let j=0;j<h;j++){const row=Math.floor(j/3),m=j%3,off=(row%2)*3;
    if(m===0)R(x0,y0+j,w,1,"r1");else if(m===2)R(x0,y0+j,w,1,"r3");
    for(let i=0;i<w;i++){const b=Math.floor((i+off)/6);
     if((i+off)%6===0&&m!==0)px(x0+i,y0+j,"r4");
     else if(m===1&&h2(b,row+9)>.82)px(x0+i,y0+j,"r0");}
   }
  };
  // abertura ogival: moldura de pedra clara, caixilho escuro e miolo (fill: "glass" = vitral âmbar, "stain" = vitral colorido, senão a chave da cor)
  const arch=(x0,top,w,h,fill,tracery)=>{
   const A=Math.round(w*.85),ins=j=>j<A?Math.round((A-j)/A*((w-1)/2)):0,cxm=x0+(w-1)/2;
   for(let j=-1;j<h;j++){const i0=ins(Math.max(0,j));R(x0+i0-1,top+j,w-2*i0+2,1,"s0");if(j>=0)px(x0+w-i0,top+j,"s3")}
   for(let j=0;j<h;j++){const i0=ins(j),ww=w-2*i0;R(x0+i0,top+j,ww,1,"ml");
    if(ww>2)for(let i=1;i<ww-1;i++){const ax=x0+i0+i;let c;
     if(fill==="glass"){const gy=j/h,b=gy<.3?"a0":gy<.7?"a1":"a2",hv=h2(ax,top+j);c=hv>.82?(b==="a0"?"a1":"a0"):hv<.14?(b==="a2"?"a3":"a2"):b}
     else if(fill==="stain"){const dx=Math.abs(ax-cxm),m=j%5;   // cruz e flor amarelas sobre fundo azul com toques vermelhos
      c=dx<.6||m===2?"sg2":(dx<2&&m===0)||(dx>=2&&m===4&&h2(ax,j)>.5)?"sg1":h2(ax+3,top+j)>.78?"sg3":"sg0"}
     else c=fill;
     px(ax,top+j,c)}}
   if(fill==="glass"||fill==="stain"){
    if(tracery){R(x0+3,top+A,1,h-A,"ml");R(x0+w-4,top+A,1,h-A,"ml");R(x0+1,top+Math.round(h*.45),w-2,1,"ml");R(x0+1,top+Math.round(h*.45)+7,w-2,1,"ml");R(x0+3,top+4,w-6,1,"ml")}   // grade e travessas da janela grande
    else if(fill==="glass")R(x0+Math.floor(w/2),top+A,1,h-A,"ml");
   }
   R(x0-1,top+h,w+2,1,"s1");R(x0-1,top+h+1,w+2,1,"s3");   // peitoril
  };
  // pináculo com contraforte: agulha de ardósia, fuste de pedra, capuz escuro em V e base alargada
  const butt=(cx,tip,capY,baseY=61)=>{
   px(cx,tip,"r1");R(cx-1,tip+1,3,2,"r2");px(cx-1,tip+1,"r1");
   R(cx-1,tip+3,3,baseY-tip-3,"s1");R(cx-1,tip+3,1,baseY-tip-3,"s0");R(cx+1,tip+3,1,baseY-tip-3,"s3");
   for(let j=0;j<=baseY-capY;j++){const hw=Math.round(j/(baseY-capY)*2.2);R(cx-hw,capY+j,2*hw+1,1,j%2?"r3":"r2");px(cx-hw,capY+j,"r1")}
   R(cx-2,baseY,5,CHURCH_H-baseY,"s2");R(cx-2,baseY,1,CHURCH_H-baseY,"s1");R(cx+2,baseY,1,CHURCH_H-baseY,"s3");R(cx-2,baseY,5,1,"s0");R(cx-2,baseY+5,5,1,"s3");
  };
  const cross=(cx,top,hgt)=>{R(cx,top,1,hgt,"ir");R(cx-1,top+1,3,1,"ir")};
  const plaster=(x0,y0,w,h,sd)=>{   // reboco interno: faixa clara em cima, lambril de madeira embaixo e salpicos
   R(x0,y0,w,h,"pl");R(x0,y0,w,1,"pl1");R(x0,y0+1,w,1,"pl2");
   for(let j=0;j<h;j++)for(let i=0;i<w;i++){const v=h2(x0+i+sd,y0+j);if(v>.93)px(x0+i,y0+j,"pl1");else if(v<.05)px(x0+i,y0+j,"pl2")}
   R(x0,y0+h-7,w,1,"pl3");R(x0,y0+h-6,w,6,"pl2");for(let i=0;i<w;i+=5)R(x0+i,y0+h-6,1,6,"pl3");   // lambril
  };
  const beams=(x0,w,posts)=>{   // forro de vigas de madeira entre o beiral e a parede do fundo (sy 47..53)
   R(x0,47,w,7,"k");R(x0,47,w,1,"w");R(x0,48,w,1,"W");R(x0,53,w,1,"d");
   for(const p of posts)for(let j=0;j<6;j++){R(p-j-1,53-j,2,1,"w");R(p+j,53-j,2,1,"w");px(p-j-1,53-j,"W");px(p+j+1,53-j,"d")}   // escoras em V
  };

  // ---------- nave: telhado, grade da cumeeira com cruzes, forro de vigas e interior à vista ----------
  slate(43,32,79,15);R(43,32,79,1,"r0");R(43,46,79,1,"r4");
  R(43,30,79,1,"ir");for(let x=44;x<122;x+=2)px(x,31,"ir");
  for(const x of[45,56,70,85,100,115,122])cross(x,26,5);
  beams(43,77,[62,81,100]);
  plaster(43,54,77,18,1);
  for(const x0 of CHURCH_WIN)arch(x0,55,7,12,"stain");   // vitrais coloridos na parede do fundo
  R(43,70,77,3,"w");R(43,70,77,1,"W");for(let x=45;x<120;x+=7)R(x,71,1,2,"d");R(43,72,77,1,"d");   // piso de tábuas
  // confessionário de madeira com cortina roxa, junto da torre
  R(47,57,11,15,"w");R(47,57,11,1,"W");R(46,56,13,1,"d");R(47,58,1,14,"W");R(57,58,1,14,"d");R(50,61,5,10,"pu");R(50,61,5,1,"pu2");for(let i=51;i<55;i+=2)R(i,62,1,9,"pu2");R(52,53,1,3,"g1");R(51,54,3,1,"g1");
  // estandartes nas colunas, colunas de madeira com capitel e base de pedra
  for(const cx of[62,81,100]){
   R(cx-1,53,3,17,"w");R(cx-1,53,1,17,"W");R(cx+1,53,1,17,"d");R(cx-2,53,5,1,"W");R(cx-2,54,5,1,"d");R(cx-2,68,5,2,"s2");R(cx-2,68,5,1,"s0");
   R(cx+2,56,4,8,"b1");R(cx+2,64,4,1,"b1");R(cx+3,65,2,1,"b1");R(cx+2,56,1,8,"b0");R(cx+5,56,1,8,"b2");R(cx+3,58,1,4,"g1");R(cx+2,59,3,1,"g1");   // estandarte azul com cruz dourada
  }
  // lustres: corrente, aro de madeira e velas
  for(const[lx,ly]of CHURCH_LUSTRES){R(lx,54,1,ly-54,"n");R(lx-4,ly,9,1,"w");R(lx-4,ly,9,1,"w");px(lx-4,ly,"W");R(lx-3,ly+1,7,1,"d");px(lx,ly+2,"w");
   for(const dx of[-4,-2,0,2,4]){px(lx+dx,ly-1,"cd");px(lx+dx,ly-2,"a1")}}
  // seis bancos (vistos de lado): encosto, almofada vinho, assento e pé
  for(const x of[50,66,72,88,94,110]){R(x,64,1,7,"w");R(x,64,1,1,"W");R(x+1,68,5,1,"mr2");R(x+1,69,5,1,"mr");R(x,70,6,1,"d");R(x+5,70,1,2,"d");R(x,71,1,1,"d")}

  // ---------- transepto à direita: empena de pedra, interior com vitral grande e altar de degraus com tapete e castiçais ----------
  R(138,38,1,1,"r1");for(let i=0;i<10;i++){const top=38+Math.round(i*.95);R(138+i,top,1,47-top,i%3?"r2":"r1");if(i%2)px(138+i,top+2,"r3")}   // telhado menor, à direita
  beams(120,19,[129]);
  plaster(120,54,19,18,4);
  bricks(139,47,8,25,6);R(139,47,8,1,"s5");R(139,48,8,1,"s3");R(146,47,2,25,"s3");
  R(139,69,9,3,"s3");R(139,68,9,1,"s0");for(let i=140;i<147;i+=6)R(i,69,1,3,"s4");R(139,72,9,1,"s4");
  for(let j=0;j<16;j++){const hw=Math.round(j*.56),y=32+j;
   R(129-hw,y,2*hw+1,1,"s1");
   for(let i=-hw+1;i<hw;i++)if(h2(i+9,y)>.9)px(129+i,y,"s0");else if(h2(i+3,y+2)<.08)px(129+i,y,"s3");
   R(129-hw-1,y,3,1,"r2");px(129-hw-1,y,"r1");R(129+hw-1,y,3,1,"r2");px(129+hw+1,y,"r3")}
  R(128,39,3,3,"s4");px(129,40,"s5");px(128,39,"s3");   // óculo
  arch(124,45,10,22,"stain",true);
  R(120,70,19,3,"w");R(120,70,19,1,"W");   // piso do transepto
  R(122,70,15,2,"s1");R(122,70,15,1,"s0");R(121,72,17,1,"s3");   // degrau do altar
  R(125,70,9,2,"cr");R(125,70,9,1,"mr2");R(125,71,1,1,"cr2");R(133,71,1,1,"cr2");   // tapete vermelho
  for(const cx of[123,135]){R(cx,60,1,10,"g1");R(cx,60,1,1,"g0");R(cx-1,69,3,1,"g2");R(cx,58,1,2,"cd")}   // castiçais dourados com vela
  R(138,70,1,2,"s2");
  px(146,65,"s4");arch(141,57,5,10,"glass");
  butt(119,33,46);butt(139,30,46);
  cross(129,26,5);
  R(116,47,3,25,"s1");R(116,47,1,25,"s0");R(118,47,1,25,"s3");   // pilastra de pedra entre a nave e o transepto

  // ---------- torre sineira: corpo, flecha de ardósia, pináculos, vão do sino, empena do portal, porta e contrafortes ----------
  bricks(22,24,19,48,3);R(40,24,1,48,"s3");
  R(21,23,21,1,"s0");R(21,24,21,1,"s2");R(22,37,19,1,"s0");R(22,38,19,1,"s3");   // cornijas
  for(let j=0;j<19;j++){const hw=Math.round(7*Math.pow(j/18,.9)),y=6+j;   // flecha
   R(31-hw,y,hw,1,"r1");R(32,y,hw,1,"r2");px(31,y,"r3");px(31-hw,y,"r4");px(31+hw,y,"r4");
   if(j%3===2){R(31-hw,y,2*hw+1,1,"r3");px(31-hw,y,"r4");px(31+hw,y,"r4")}}
  R(31,0,1,6,"g1");R(29,2,5,1,"g1");px(31,0,"g0");px(29,2,"g0");px(30,2,"g0");px(32,3,"g2");px(31,5,"g2");   // cruz dourada
  for(const cx of[23,39]){px(cx,16,"r1");R(cx-1,17,3,1,"r2");R(cx-1,18,3,6,"s1");R(cx-1,18,1,6,"s0");R(cx+1,18,1,6,"s3");cross(cx,12,4)}   // pináculos de canto
  arch(27,26,9,10,"bd");   // vão do sino
  R(28,28,7,1,"d");   // viga de onde o sino pendura (o sino em si é desenhado à parte, sprBell, para poder balançar)
  for(let j=0;j<11;j++){const hw=Math.round(j*.9),y=39+j;R(31-hw,y,2*hw+1,1,"s1");px(31-hw,y,"s0");px(31+hw,y,"s3")}   // empena do portal
  R(22,50,19,1,"s1");
  R(29,48,5,5,"s4");R(31,48,1,5,"g1");R(29,50,5,1,"g1");R(30,49,3,3,"g1");px(31,50,"g0");px(29,48,"s1");px(33,48,"s1");px(29,52,"s1");px(33,52,"s1");   // quadrifólio dourado
  arch(25,54,13,17,"w");
  {const A=Math.round(13*.85);for(let i=26;i<37;i+=2)R(i,54+A,1,17-A,"d");R(31,54+5,1,12,"k");R(31,54+A,1,17-A,"k");R(26,61,4,1,"N");R(33,61,4,1,"N");R(26,67,4,1,"N");R(33,67,4,1,"N");px(30,64,"g1");px(32,64,"g1")}   // tábuas, fresta central e ferragens
  R(23,71,17,1,"s0");R(23,72,17,1,"s3");   // degrau
  for(const[x0,w2,top,tip]of[[16,6,37,33],[41,4,40,36]]){   // contrafortes da torre
   R(x0,top,w2,CHURCH_H-top,"s1");R(x0,top,1,CHURCH_H-top,"s0");R(x0+w2-1,top,1,CHURCH_H-top,"s3");
   for(let j=top;j<CHURCH_H;j+=3)for(let i=x0+((j/3|0)%2);i<x0+w2;i+=3)px(i,j+2>CHURCH_H-1?CHURCH_H-1:j+2,"s4");
   R(x0+1,tip+3,w2-2,top-tip-3,"s1");px(x0+w2/2|0,tip,"r1");R(x0+1,tip+1,w2-2,2,"r2");R(x0-1,top,w2+2,1,"s0");R(x0-1,top+1,w2+2,1,"s3");
   R(x0-1,52,w2+2,1,"s0");R(x0,53,w2,1,"s3");}
  for(const cx of[23,39]){R(cx-1,60,3,1,"n");R(cx,61,1,2,"N");R(cx-1,63,3,1,"N")}   // arandelas das tochas
  R(43,47,4,25,"s1");R(43,47,1,25,"s0");R(46,47,1,25,"s3");   // pilastra de pedra entre a torre e a nave

  // ---------- à esquerda: cerca, poste com lanterna ---------- à direita: cerca, poste com estandarte ----------
  for(const[a,b]of[[4,12],[148,9]]){R(a,69,b,1,"W");R(a,71,b,1,"d");for(let x=a+1;x<a+b;x+=3)R(x,68,1,4,"w");for(let x=a+1;x<a+b;x+=3)px(x,68,"W")}
  R(2,60,2,12,"w");R(2,60,1,12,"W");R(3,60,1,12,"d");R(2,59,8,1,"w");R(2,58,8,1,"W");px(4,60,"d");px(5,60,"d");   // poste da lanterna e braço
  R(7,60,1,1,"N");R(6,61,3,1,"N");R(6,62,3,4,"ml");R(7,63,1,2,"a1");R(6,66,3,1,"N");
  R(157,57,2,15,"w");R(157,57,1,15,"W");R(158,57,1,15,"d");R(157,58,9,1,"w");R(157,57,9,1,"W");   // poste do estandarte
  R(161,59,5,7,"b1");R(162,66,3,1,"b1");px(163,67,"b1");R(161,59,1,7,"b0");R(165,59,1,7,"b2");R(163,61,1,4,"g1");R(162,62,3,1,"g1");
 });
}
function sprBell(){   // sino dourado 7x7; o pivô fica na viga, 1 px acima do topo
 return mkSpr("bell",7,7,{g0:"#fff0a0",g1:"#e6b030",g2:"#a8741a",g3:"#6a460c"},R=>{
  R(2,0,3,1,"g1");R(1,1,5,2,"g1");R(1,1,1,2,"g0");R(0,3,7,2,"g1");R(0,3,1,2,"g0");R(6,3,1,2,"g2");R(0,5,7,1,"g2");R(3,6,1,1,"g3")},0)}
function bellPos(){const u=pu(),cx=forgeFx(CHURCH_C),ox=cx-CHURCH_W*u/2,oy=rowY(0)-CHURCH_H*u;return{u,ox,oy,x:ox+31.5*u,y:oy+31*u,px:ox+31.5*u,py:oy+28.5*u}}
function drawBell(t){   // sino balançando dentro do vão da torre (recortado pela abertura)
 const P=bellPos(),u=P.u;if(P.x<-T*12||P.x>W+T*12)return;
 bellTick(Math.min(.05,Math.max(0,t-(drawBell.last||t))));drawBell.last=t;
 ctx.save();ctx.beginPath();ctx.rect(P.ox+28*u,P.oy+27*u,7*u,9*u);ctx.clip();
 ctx.translate(P.px,P.py);ctx.rotate(bell.a);ctx.imageSmoothingEnabled=false;
 const s=sprBell();ctx.drawImage(s.cv,-4.5*u,-.5*u,(s.w+2)*u,(s.h+2)*u);ctx.restore();
}
function drawChurch(t){
 const u=pu(),y=Math.round(rowY(0)),cx=forgeFx(CHURCH_C),n=nightAmt();
 if(cx<-T*12||cx>W+T*12)return;
 const s=sprChurch(),ox=Math.round(cx-CHURCH_W*u/2),oy=Math.round(y-CHURCH_H*u);
 pxShadow(cx,(CHURCH_W-10)*u,y,u);drawSpr(s,cx,y,u);drawBell(t);
 if(n>.03){   // vitrais acesos de noite
  ctx.fillStyle="rgba(255,238,170,"+(.28*n).toFixed(3)+")";
  for(const x0 of CHURCH_WIN)ctx.fillRect(ox+(x0+1)*u,oy+58*u,5*u,8*u);
  ctx.fillRect(ox+125*u,oy+53*u,8*u,13*u);ctx.fillRect(ox+142*u,oy+60*u,3*u,6*u);ctx.fillRect(ox+29*u,oy+30*u,5*u,5*u);
 }
 const fl=(fx,fy,i)=>{   // chamas das tochas, castiçais, lanterna e velas: tremem
  const f=Math.sin(t*9+i*2.3),tall=f>.2?3:2;
  PX(ox+fx*u,oy+(fy-tall+1)*u,u,tall*u,"#ff8a1f");PX(ox+fx*u,oy+(fy-tall+1)*u,u,u,"#ffd45c");PX(ox+(fx-1)*u,oy+fy*u,u,u,"#c8541a");
 };
 CHURCH_FLAMES.forEach(([fx,fy],i)=>fl(fx,fy,i));
 CHURCH_LUSTRES.forEach(([lx,ly],i)=>{for(const dx of[-4,-2,0,2,4])PX(ox+(lx+dx)*u,oy+(ly-2)*u,u,u,Math.sin(t*8+dx+i*3)>.1?"#ffe08a":"#ffb43a")});
}
function churchHoles(g,k){   // abre a escuridão nos vitrais, lustres, castiçais, tochas e lanterna (chamado por lampHoles)
 const u=pu(),cx=forgeFx(CHURCH_C);if(cx<-T*12||cx>W+T*12)return;
 const ox=cx-CHURCH_W*u/2,oy=rowY(0)-CHURCH_H*u;
 g.globalCompositeOperation="destination-out";
 const spot=(sx,sy,r,a)=>{const X=(ox+sx*u)*k,Y=(oy+sy*u)*k,Rr=r*k,gr=g.createRadialGradient(X,Y,0,X,Y,Rr);
  for(const[o,m]of[[0,a],[.4,a*.85],[.75,a*.35],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+m.toFixed(3)+")");
  g.fillStyle=gr;g.fillRect(X-Rr,Y-Rr,Rr*2,Rr*2)};
 for(const x0 of CHURCH_WIN)spot(x0+3.5,61,T*1.3,.75);
 for(const[lx,ly]of CHURCH_LUSTRES)spot(lx,ly+2,T*3.2,.85);   // lustres: iluminam o interior da nave
 spot(55,64,T*2,.45);spot(88,64,T*3,.4);spot(112,64,T*2.2,.4);
 spot(129,56,T*2.6,.9);spot(129,64,T*3.2,.8);spot(123,60,T*1.4,.8);spot(135,60,T*1.4,.8);   // vitral grande, altar e castiçais
 spot(31,31,T*1,.6);spot(143.5,62,T*.9,.6);spot(23,59,T*1.5,.85);spot(39,59,T*1.5,.85);spot(7,64,T*1.5,.85);
 g.globalCompositeOperation="source-over";
}

// ===== 5-desenho/19-cogumelos-cenouras.js — Cenouras e cogumelos para colher no chão do bosque da esquerda =====
// Poucos pontos de colheita, bem espalhados: o bosque é dividido em blocos de 6 colunas e cada bloco tem, no máximo, 1 ponto (forageAt(c), determinista por hash). Espaço ou clique perto (a até 1 coluna do jogador) colhe: a cenoura vira "Cenourinha" (a mesma comida da loja, com o mesmo ícone)
// e os cogumelos viram "Cogumelo", ingrediente da sopa no caldeirão da igreja (2-sistemas/16-caldeirao.js). O que foi colhido volta a crescer sozinho: um brotinho aparece e cresce até dar para colher de novo, depois de BAL.forage.regrow segundos de jogo; enquanto cresce só aparece o brotinho (cenoura) ou um pontinho (cogumelo) e não dá para colher. A cenoura fica enfiada na terra, só com a rama e o topo laranja à mostra.
// Ficam fora dos trechos sem árvores (horta, moinho, igreja, caldeirão, riacho: sceneBlocked) e somem no inverno (neve por cima). Os números vão em BAL.forage.
const FORAGE_PAL={e:"#8f2418",R:"#d23a2a",r:"#e8664d",H:"#ffffff",S:"#efe3bd",s:"#cdbd8f",B:"#a8743c",b:"#6e4a24",L:"#c99a5c"};
const CAR_PAL={l:"#3f9a35",L:"#6fc653",o:"#ee8a28",O:"#ffa84a",q:"#c9611a",D:"#5b3a1c",E:"#7a4f27"};
function sprCenouraTerra(){   // cenoura enfiada no chão: rama verde, topo laranja saindo de um montinho de terra
 const rows=[".l.....l.","..l.L.l..","...lLl...","....L....","...ooO...","..DoOqD..",".DDDDDDD.","DDEDDDEDD"];
 return mkSpr("forage_car",9,8,CAR_PAL,R=>{rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]!==".")R(i,j,1,1,row[i])})},0)}
function sprBrotoCenoura(){   // brotinho: a cenoura colhida volta a crescer
 const rows=[".l.l.","..L..","..l..",".DDD.","DDEDD"];
 return mkSpr("forage_sprout",5,5,CAR_PAL,R=>{rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]!==".")R(i,j,1,1,row[i])})},0)}
function sprCogumeloVerm(){return mkSpr("forage_mr",7,6,FORAGE_PAL,R=>{
 R(2,0,3,1,"R");R(1,1,5,1,"R");R(0,2,7,1,"R");R(2,0,1,1,"r");R(1,1,1,1,"r");R(1,3,5,1,"e");   // chapéu com luz à esquerda e lamelas escuras
 R(3,0,1,1,"H");R(1,2,1,1,"H");R(5,2,1,1,"H");R(4,1,1,1,"H");                                   // bolinhas brancas
 R(2,4,3,2,"S");R(2,4,1,2,"s");R(4,4,1,2,"s");R(3,4,1,2,"S");
},0)}
function sprCogumeloMarrom(){return mkSpr("forage_mb",5,5,FORAGE_PAL,R=>{
 R(1,0,3,1,"B");R(0,1,5,1,"B");R(1,0,1,1,"L");R(0,1,1,1,"L");R(1,2,3,1,"b");R(2,3,1,2,"S");R(2,3,1,1,"s");   // chapéu marrom pequeno e talo claro
},0)}
function forageAt(c){   // o que nasce na coluna c: {k:"car"|"mr"|"mb", dx (fração de coluna), n (unidades ao colher)} ou null
 if(c<SURF_L+1||c>-HALF-3)return null;
 const blk=Math.floor((c-SURF_L)/6);
 if(c!==SURF_L+blk*6+Math.floor(hash(blk,1311)*6)||hash(blk,1317)>.8||sceneBlocked(c))return null;   // no máximo 1 ponto por bloco de 6 colunas
 const dx=(hash(blk,1303)-.5)*.7,kind=blk%3;   // os tipos se alternam entre os blocos: sempre tem cenoura e cogumelo espalhados
 if(kind===0)return{k:"car",dx,n:(hash(blk,1307)<.3?2:1)*BAL.forage.car};
 if(kind===1)return{k:"mr",dx,n:BAL.forage.mr};
 return{k:"mb",dx,n:BAL.forage.mb}}
const forageReady=c=>{const t=S.fg[c];return t==null||S.play-t>=BAL.forage.regrow||S.play<t};
const forageProg=c=>{const t=S.fg[c];return t==null||S.play<t?1:clamp((S.play-t)/BAL.forage.regrow,0,1)};   // 0 a 1: quanto já cresceu de novo depois de colhido
const forageOn=c=>{if(scenePal().wint>.4)return null;const f=forageAt(c);return f&&forageReady(c)?f:null};
function forageNearest(){   // coluna do que dá para colher agora (a até 1 coluna do jogador, a mais perto primeiro) ou null
 if(!onGround())return null;
 for(const d of[0,-1,1])if(forageOn(S.mc+d))return S.mc+d;
 return null}
function forageHit(px,py){   // clique em cima de algo colhível
 const y=rowY(0);if(!atSurface()||py<y-T*1.6||py>y+T*.5)return false;
 const c0=Math.round(camX+(px-W/2)/T);
 for(let c=c0-1;c<=c0+1;c++){const f=forageOn(c);if(f&&Math.abs(colX(c+f.dx)-px)<T*.6)return true}
 return false}
function forageUse(){
 if(modal)return false;
 const c=forageNearest();if(c==null)return false;
 const f=forageOn(c),key=f.k==="car"?"cen":"cog",it=ITEMS[key];
 if(have(key)>=99){sayK("forage",__("Mochila cheia: {0}",it.n));return true}
 const n=Math.min(f.n,99-have(key));
 S.items[key]=have(key)+n;S.fg[c]=S.play;
 texts.push({x:colX(c+f.dx),y:rowY(0)-T*1.1,t:0,s:"+"+n+" "+it.n,c:it.c,big:1});
 sayK("forage","+"+n+" "+it.n+" ("+have(key)+")");
 sfx(key==="cen"?620:480,.06,"triangle");setTimeout(()=>sfx(key==="cen"?830:640,.08,"triangle"),60);
 save();refresh();return true}
function drawForage(t){
 const y=Math.round(rowY(0));if(y<=8)return;
 if(scenePal().wint>.4)return;
 const u=pu(),cs=Math.max(1,u*.8),c0=Math.max(SURF_L+1,Math.floor(camX-W/2/T)-2),c1=Math.min(-HALF-3,Math.ceil(camX+W/2/T)+2);
 for(let c=c0;c<=c1;c++){
  const f=forageAt(c);if(!f)continue;
  const x=Math.round(colX(c+f.dx));if(x<-T||x>W+T)continue;
  const p=forageProg(c);
  if(p<1){   // ainda crescendo de novo (NÃO dá para colher): só aparece o brotinho, sempre menor e sem o laranja da cenoura madura; cogumelo é só um pontinho
   if(f.k==="car")drawSpr(sprBrotoCenoura(),x,y,p<.5?cs*.8:cs*1.3);
   else if(p>.5)drawSpr(f.k==="mr"?sprCogumeloVerm():sprCogumeloMarrom(),x,y,u*.4);
   continue}
  let top;
  if(f.k==="car"){drawSpr(sprCenouraTerra(),x,y,cs);if(f.n>1)drawSpr(sprCenouraTerra(),x+Math.round(T*.3),y,cs);top=8*cs}
  else if(f.k==="mr"){drawSpr(sprCogumeloVerm(),x,y,u);top=6*u}
  else{drawSpr(sprCogumeloMarrom(),x,y,u);drawSpr(sprCogumeloMarrom(),x+Math.round(u*5.5),y,u);drawSpr(sprCogumeloMarrom(),x-Math.round(u*4.5),y+Math.round(u*.4),u);top=5*u}
  const sp=Math.sin(t*2.4+c*1.9);   // brilhinho que avisa que dá para colher
  if(sp>.8){const k=Math.max(1,Math.round(u*.5)),sx=x+Math.round(T*.18),sy=y-top-k*2;ctx.fillStyle="rgba(255,248,200,"+((sp-.8)*5).toFixed(2)+")";ctx.fillRect(sx,sy-k,k,k*3);ctx.fillRect(sx-k,sy,k*3,k)}
 }
}

// ===== 5-desenho/20-caldeirao.js — Caldeirão de ferro sobre tripé e fogueirinha, ao lado da igreja (sopa de cogumelo) =====
// Sprite fixo (tripé de madeira, corrente, panela de ferro, pedras e lenha) + parte animada: chamas, bolhas, vapor e brilho de noite (potHoles, chamada por lampHoles).
const POT_W=26,POT_H=24,POT_K=.6;   // POT_K: o caldeirão do mundo é desenhado em 60% do tamanho do pixel normal (a cena da janela usa escala própria)
function sprCauldron(){
 return mkSpr("cauldron",POT_W,POT_H,Object.assign({t:"#8a5a2b",T:"#b27a3a",y:"#4a2f16",z:"#8d8984",Z:"#7f7b76",Y:"#a39e96",X:"#5f5c57"},WOOD,METAL),R=>{
  const px=(x,y,c)=>R(x,y,1,1,c);
  for(let j=1;j<23;j++){const lx=Math.round(12.5-9.5*(j-1)/22),rx=Math.round(13.5+9.5*(j-1)/22);R(lx,j,2,1,j%5<2?"T":"t");px(lx+1,j,"y");R(rx,j,2,1,j%5<2?"T":"t");px(rx+1,j,"y")}   // duas pernas do tripé, abertas
  R(12,0,3,3,"w");R(12,0,3,1,"W");R(12,2,3,1,"d");   // amarração do alto
  for(let j=3;j<8;j++){px(13,j,j%2?"n":"m")}   // corrente
  // panela de ferro: aro, bojo arredondado, brilho à esquerda, alças e base
  R(7,8,13,1,"M");R(7,8,13,1,"m");R(6,9,15,1,"n");R(5,10,17,1,"N");R(4,11,19,4,"N");R(5,15,17,1,"N");R(7,16,13,1,"N");R(9,17,9,1,"k");
  R(6,10,1,5,"n");R(6,11,1,3,"m");R(7,11,1,2,"M");R(21,11,1,4,"k");R(20,15,1,1,"k");
  R(3,10,2,1,"n");R(2,10,1,2,"n");R(22,10,2,1,"n");R(24,10,1,2,"n");   // alças
  R(9,12,9,1,"n");R(9,13,9,1,"N");   // faixa de reforço
  // fogueirinha: anel de pedras e lenha
  R(4,21,4,3,"z");R(4,21,4,1,"Y");R(4,23,4,1,"X");R(19,21,4,3,"z");R(19,21,4,1,"Y");R(19,23,4,1,"X");R(8,22,3,2,"Z");R(16,22,3,2,"Z");R(8,22,3,1,"Y");R(16,22,3,1,"Y");
  R(9,20,9,2,"w");R(9,20,9,1,"W");R(10,19,7,1,"d");R(11,22,5,2,"d");
 },0)}
function potPos(){return{x:forgeFx(CAULDRON_C),y:Math.round(rowY(0)),u:pu()*POT_K}}
// parte animada (serve ao mundo e à janela): chamas entre as pedras, bolhas da sopa e vapor. g = contexto, rise = quanto o vapor sobe, boil = fervura forte (depois de cozinhar)
function potAnim(g,cx,y,u,t,rise,boil,cols,liq){
 const ox=cx-POT_W*u/2,R=(x,yy,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(yy),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 for(let i=0;i<4;i++){const fx=11+i*1.6,h=(2.5+Math.sin(t*10+i*2.1)*1.2+(i===1||i===2?1.5:0))*u;
  R(ox+fx*u,y-3*u-h,1.4*u,h+u,i%2?"#ff8a1f":"#ff6a1a");R(ox+(fx+.2)*u,y-3*u-h*.6,.9*u,h*.6,"#ffd45c")}
 cols=cols||["#d9b25a","#b78d3a"];
 if(liq)R(ox+8*u,y-(POT_H-7)*u,11*u,u,liq);   // superfície do líquido (só na janela), na cor da receita
 const nb=boil?7:3;
 for(let i=0;i<nb;i++){const ph=(t*(boil?1.8:.7)+i/nb)%1,bx=ox+(9+(i%3)*4)*u+Math.sin(t*3+i)*u*.5;
  g.globalAlpha=(1-ph)*.9;R(bx,y-(POT_H-8.5)*u-ph*u*(boil?6:2.5),u,u,i%2?cols[0]:cols[1]);g.globalAlpha=1}
 for(let i=0;i<4;i++){const ph=(t*.35+i/4)%1;g.globalAlpha=(1-ph)*.32;g.fillStyle="#eef2f4";
  const sz=Math.round(u*(1.4+ph*1.8));g.fillRect(Math.round(cx+(Math.sin(t*1.7+i*2.4)*2.2+(i-1.5)*1.3)*u-sz/2),Math.round(y-(POT_H+.5)*u-ph*u*rise),sz,sz)}
 g.globalAlpha=1}
function drawCauldron(t){
 const P=potPos(),u=P.u,cx=P.x,y=P.y,n=nightAmt();
 if(cx<-T*6||cx>W+T*6||y<=8)return;
 const s=sprCauldron();
 pxShadow(cx,(POT_W-2)*u,y,u);
 if(n>.03){const r=T*2,gr=ctx.createRadialGradient(cx,y-4*u,0,cx,y-4*u,r),fl=.88+.12*Math.sin(t*9);   // clarão da fogueira no chão e na panela
  gr.addColorStop(0,"rgba(255,190,100,"+(.45*n*fl).toFixed(3)+")");gr.addColorStop(1,"rgba(255,170,80,0)");ctx.fillStyle=gr;ctx.fillRect(cx-r,y-4*u-r,r*2,r*2)}
 drawSpr(s,cx,y,u);
 potAnim(ctx,cx,y,u,t,14,false);
 if(atSurface())lbl(nearCauldron()?__("Caldeirão: clique para cozinhar"):__("Caldeirão"),cx,y-(POT_H+7)*u,nearCauldron()?"#6fe3a0":"#ffb43a");
}
// cena da janela do caldeirão (mesmo formato da fogueira: noite, chão, clarão, panela grande e moldura que fica dourada ao cozinhar)
function potDraw(g,dt){
 const{w,h}=CPC,c=pot,rc=POT_RECIPES[c.sel].col,t=c.age,fl=.85+.15*Math.sin(t*9.1)+.05*Math.sin(t*14.3),cx=w/2,gy=176,u=5,r=c.res,hot=r&&r.t<1.4;
 g.setTransform(potCv.width/w,0,0,potCv.height/h,0,0);g.clearRect(0,0,w,h);
 ["#120d1c","#161020","#1b1321","#211722","#2a1a12"].forEach((cc,i)=>{g.fillStyle=cc;g.fillRect(0,Math.round(i*h/5),w,Math.ceil(h/5)+1)});
 for(let i=0;i<18;i++){g.fillStyle="rgba(255,255,255,"+(.25+.35*Math.abs(Math.sin(t*1.3+i))).toFixed(2)+")";g.fillRect((i*67+13)%w,(i*31+5)%70,2,2)}
 for(let i=5;i>=1;i--)pxDisc(g,cx,gy-20,i*34,i*22,4,"rgba(255,130,45,"+(.075*fl).toFixed(3)+")");
 g.fillStyle="#2b1d12";g.fillRect(0,gy,w,h-gy);g.fillStyle="#3a2817";g.fillRect(0,gy,w,4);
 const s=sprCauldron();g.imageSmoothingEnabled=false;g.drawImage(s.cv,Math.round(cx-POT_W*u/2)-u,Math.round(gy-POT_H*u)-u,(POT_W+2)*u,(POT_H+2)*u);
 potAnim(g,cx,gy,u,t,9,hot,rc,rc[1]);
 if(hot){for(let k=0;k<12;k++){const ph=clamp(r.t/1.2,0,1),a=k/12*Math.PI*2,d=ph*(34+(k%3)*12);g.globalAlpha=1-ph;g.fillStyle=rc[0];g.fillRect(Math.round(cx+Math.cos(a)*d),Math.round(gy-POT_H*u+8+Math.sin(a)*d*.7-ph*20),3,3);g.globalAlpha=1}
  const nm=(r.id==="sop"?__("Sopa pronta!"):__("Poção pronta!"))+(r.n>1?" x"+r.n:""),e=clamp(r.t/.35,0,1),sz=Math.max(8,Math.round(fsFit(g,nm,w-40,30,900)*easeOutBack(e)));
  g.textAlign="center";g.textBaseline="middle";g.font="900 "+sz+"px "+FONT;g.lineWidth=7;g.lineJoin="round";g.strokeStyle="rgba(8,6,12,.9)";g.strokeText(nm,cx,34);g.fillStyle="hsl("+(40+Math.sin(t*6)*12)+",100%,"+(60+Math.sin(t*9)*8)+"%)";g.fillText(nm,cx,34)}
 g.strokeStyle=hot?"#ffd45c":"#7a4f27";g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3);
}
function potHoles(g,k){   // abre a escuridão em volta da fogueirinha do caldeirão (chamado por lampHoles)
 const P=potPos();if(P.x<-T*7||P.x>W+T*7)return;
 g.globalCompositeOperation="destination-out";
 const cx=P.x*k,cy=(P.y-5*P.u)*k,r=T*2.6*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
 for(const[o,a]of[[0,.95],[.35,.85],[.6,.5],[.82,.18],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
 g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);g.globalCompositeOperation="source-over";
}

// ===== 6-jogo/01-laco-inicio.js — Laço principal, eventos, salvar/exportar/importar e inicialização =====
let last=performance.now(),acc=0,sv=0,autoMsgT=0,exitUp=false;   // exitUp: está subindo pelo buraco (vale até o passo que cruza a superfície)
function loop(now){
 requestAnimationFrame(loop);   // agenda o próximo quadro antes de tudo: uma exceção num quadro não congela o jogo para sempre
 const dt=modal==="pause"||modal==="lv"||modal==="chest"?0:Math.min(.1,(now-last)/1000);last=now;   // pausa, escolha de melhoria ao subir de nível e animação de abrir baú congelam o jogo (tempo, habilidades, energia, combo, clima, fornalha...)
 if(modal!=="title")S.play+=dt;dayTick(dt);seasonTick(dt);weatherTick(dt);starTick(dt);cmbT-=dt;if(cmbT<=0){if(cmb>0)comboEnd();cmb=0}
 for(let i=0;i<2;i++){if(skT[i]>0)skT[i]-=dt;if(skCD[i]>0)skCD[i]-=dt}
 ambSpawn(dt);
 if(!Number.isFinite(S.gold)&&!S.debug)S.gold=0;
 ambT-=dt;if(musOn&&!mute&&S.vol.a>0&&ambT<=0){ambT=3+Math.random()*4;drip()}
 musT-=dt;if(musOn&&!mute&&S.vol.m>0&&musT<=0){musT=2+Math.random();note()}
 if(S.dir==="down")jetT=0;if(jetT>0)jetT-=dt;if(jetT>0||(!modal&&airborne()&&S.dir!=="down")){const jx=colX(mX),jy=rowY(mY);const sb=shiftOn&&!fs&&(S.dir==="left"||S.dir==="right");if(Math.random()<dt*(jetT>0?60:sb?55:14)){const bz=sb?2.2:1;const nzk=performance.now()-jetNz.t<150;parts.push({x:(nzk?jetNz.x:jx+(S.dir==="left"?9:-9)*worldZoom)+(Math.random()-.5)*4,y:(nzk?jetNz.y:jy-8*worldZoom)+2*worldZoom,vx:(Math.random()-.5)*(jetT>0?50:25)*bz,vy:(jetT>0?90+Math.random()*110:40+Math.random()*50)*bz,l:.3,c:Math.random()<.5?"#ffb43a":"#ff6a2a",jet:true})}}
 dynCD=Math.max(0,dynCD-dt);tpCD=Math.max(0,tpCD-dt);toastTick(dt);autoMsgT-=dt;
 if(ev>0)ev-=dt;else{evNext-=dt;if(evNext<=0){ev=BAL.events.len;evT=Math.random()<.5?0:1;evNext=BAL.events.gapMin+Math.random()*BAL.events.gapRand;sayK(evT?"mine":"gold",evT?__("Frenesi mineral! Minérios x3 por 20s"):__("Corrida do ouro! Ouro x3 por 20s"))}}
 // superfície: recupera energia rápido e entrega a mochila ao chegar perto do baú
 if(atSurface()){const m=maxEn();if(S.en<m)S.en=Math.min(m,S.en+60*dt);}
 furTick(dt);ctTick(dt);chestTick();memCheck();fishTick(dt);
 // escavação automática (pausa sozinha quando a energia só dá para voltar)
 const ad=autoDps();
 if(ad>0&&!modal&&!fs){if(autoOK())hit(ad*dt,false,true);else if(autoMsgT<=0&&S.depth>0&&canBreak(...tgt())){autoMsgT=6;sayWarn(__("Escavação automática pausada: energia só para voltar"))}}
 if(!modal&&!fs&&holdS&&now-lastH>(skT[1]>0?150/frenzyActiveMult():150)/attackSpeedMult()){lastH=now;clickDig()}
 // queda livre: segurando ↓ sobre buraco já cavado, desce de graça e acelera aos poucos; soltar a tecla para na hora
 const falling=!modal&&!fs&&held==="down"&&S.depth<FINAL_DEPTH&&isDug(S.mc,S.depth);fallR=falling?fallR+dt:0;
 let mvMs=(shiftOn?60:130)/(1+.1*pk("mov"))/(held==="up"?jetSpdMult():1);
 // saída do buraco: ao subir, a mochila a jato vai freando nos últimos blocos até a superfície (suave, sem trancos) e só solta depois de sair
 if(held==="up"&&S.depth>0)exitUp=true;else if(held!=="up"||S.depth<0)exitUp=false;
 if(exitUp&&S.depth>=0&&S.depth<=BAL.exitBrake.rows){const X=BAL.exitBrake,u=S.depth>0?1-(S.depth-1)/X.rows:1;mvMs+=(Math.max(mvMs,X.ms)-mvMs)*u*u*(3-2*u)}
 if(falling){
  // queda livre: vários blocos por quadro se preciso; começa em t0 e acelera até tMin; Shift multiplica o intervalo por F.shift
  const F=BAL.fall,iv=(shiftOn?F.shift:1)*(F.t0-(F.t0-F.tMin)*Math.min(1,fallR/F.ramp));
  fallAcc=Math.min(fallAcc+dt,iv*F.maxSteps);
  for(let n=0;n<F.maxSteps&&fallAcc>=iv&&held==="down";n++){fallAcc-=iv;const d0=S.depth;move("down");if(S.depth===d0)break}
  lastMv=now;
 }else{
  fallAcc=0;
  const surfStop=exitUp&&held==="up"&&S.depth===0;   // saiu do buraco segurando ↑: para na superfície (não sai voando para o céu); soltar e apertar ↑ de novo voa
  if(surfStop)jetT=0;
  if(!modal&&!fs&&held&&!surfStop&&now-lastMv>mvMs){lastMv=now;move(held)}
 }
 const k=Math.min(1,dt*(falling?(shiftOn?60:40):shiftOn?26:14)),kc=Math.min(1,dt*(falling?(shiftOn?30:20):shiftOn?12:7));
 mX+=(S.mc-mX)*k;mY+=(S.depth-mY)*k;camX+=((fs?(mX+fs.tc)/2:mX)-camX)*kc;camY+=((fs?mY+.6:mY)-camY)*kc;   // pescando: a câmera fica entre o personagem e a boia e mostra mais água
 updateZoom(dt);clampCam();
 draw(dt);
 acc+=dt;if(acc>.15){acc=0;checkAch();checkUnlocks();autoTab();refresh();buffsUI()}
 sv+=dt;if(sv>5){sv=0;save()}
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});
addEventListener("pagehide",save);
document.addEventListener("click",e=>{if(e.target.tagName==="BUTTON")e.target.blur()});
$("exp").onclick=()=>{try{$("sv").value=btoa(unescape(encodeURIComponent(JSON.stringify(Object.assign({},S,{dug:[...dug]})))));$("sv").select();sayInfo(__("Save exportado: copie o texto"))}catch(e){sayWarn(__("Falha ao exportar"))}};
$("imp").onclick=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob($("sv").value.trim()))));S=clean(o);SEED=S.seed;chQ.length=0;carrotC=null;dug=new Set(S.dug.filter(k=>/^-?\d+,\d+$/.test(k)));if(S.en<0)S.en=maxEn();if(S.debug)S.gold=Infinity;camX=mX=S.mc;camY=mY=S.depth;layerSeen=layerOf(S.depth);build();save();sayInfo(__("Save importado!"))}catch(e){sayWarn(__("Save inválido"))}};
for(const[id,k]of[["vm","m"],["vs","s"],["va","a"]]){const e=$(id);e.value=S.vol[k];e.oninput=()=>{S.vol[k]=+e.value}}
S.en=S.en<0?maxEn():Math.min(S.en,maxEn());
layerSeen=layerOf(S.depth);
camY=mY=S.depth;camX=mX=S.mc;
buildTabs();buildBar();build();
// Menu inicial (só nome + Play): o jogo fica pausado até apertar Play, Espaço ou Enter. O gancho de teste pula o menu.
const ttl=$("title");
function startGame(){if(modal!=="title")return;modal=null;ttl.classList.add("off");setTimeout(()=>{ttl.style.display="none"},500);musOn=true;setHeld();if(S.lvp>0)levelUp()}
function showTitle(){ttl.style.display="";ttl.classList.remove("off");modal="title";$("play").focus()}
if(typeof window.__TESTE__==="function")ttl.style.display="none";
else{modal="title";$("play").onclick=startGame;$("play").focus()}
if(S.lvp>0&&!modal)levelUp();
// Trocar de idioma: os textos estáticos (data-t) o motor já refaz; aqui se refaz o que o jogo monta por código.
onLang(()=>{relabelTabs();if(fsLab)fsLab();buildBar();build();statsHtml="";bagHtml="";buffsHtml="";clkLast="";if(modal==="pause"){paintPause();const lb=document.querySelector("#bx .lp-btn");if(lb)lb.focus()}refresh()});
requestAnimationFrame(loop);
// gancho opcional usado só por tools/smoke.js (não faz nada no jogo normal)
if(typeof window.__TESTE__==="function")window.__TESTE__({get pot(){return pot},deepOres,POT_RECIPES,ORES,churchSolid,roofSolid,houseBlocks,bell,bellCol,nearBell,bellUse,CHURCH_C,CAULDRON_C,nearCauldron,cauldronUse,openPot,potCook,potMax,forageAt,forageProg,forageOn,forageUse,sayK,toastTick,toastHas,get worldZoom(){return worldZoom},get zoomPreference(){return zoomPreference},set fishHold(v){fishHold=v},fishTick,fishEnd,startFish,fishSpot,fishUse,fishAct,fishCast,fishBite,fishHook,reelStep,fishPick,fishValue,fishWin,FISH,FISH_BY,fishGroups,fishSell,marketUse,nearCamp,campUse,campStart,campTake,campQuality,FOODS,rodZone,baitBite,get fs(){return fs},get cp(){return cp},fortCh,returnCost,returnNeed,returnState,get skT(){return skT},get skCD(){return skCD},get modal(){return modal},SURF_L,SURF_R,WALK_R,clampCam,get camX(){return camX},set camX(v){camX=v},wx,WX,WX_KEYS,weatherSet,weatherTick,weatherPick,onCombo,comboEnd,get cmb(){return cmb},set cmb(v){cmb=v},get cmbBanner(){return cmbBanner},get cmbLastT(){return cmbLastT},lavaRes,furLoad,furTick,furRate,furEta,nearFurnace,FURN_C,airborne,lava,lavaDmg,teleCD,get S(){return S},isUnl,checkUnlocks,nextUnlockText,unlockNames,openMemoria,carrotSpot,get carrotC(){return carrotC},reachBottom,get dug(){return dug},hit,move,step,die,sellBag,teleport,spend,maxEn,isDug,canBreak,tgt,buy,buyTier,clickPow,hardness,setDir,goTo,digCost,returnCost,autoOK,tierCost,upCost,UPS,FINAL_DEPTH,HALF,CHEST_C,BED_C,SLOT_C,BOARD_C,WELL_C,nearBed,nearSlot,nearBoard,ctGen,ctProg,ctTick,ctClaim,ctDrop,openBoard,openSlot,slotSpin,chestAt,chestFound,chestTick,chestKey,chestRoll,get chQ(){return chQ},slotRtp,slotMult,slotBetAmt,slotKey,get slotBusy(){return slotBusy},get SEED(){return SEED},atSurface,closeModal,BENCH_C,blockGold,gainXp,nearBench,basePow,autoDps,TIERS,BIO,SK,prestGain,get held(){return held},get jetT(){return jetT},boom,dynNext,dynPick,DYN_IDS,BAL,furyMult,frenzyMult,furyActiveMult,frenzyActiveMult,useSk,fmtN,skillDescription,get skT(){return skT},useItem,buyItem,isVein,canBlast,have,ITEMS,SHOP_C,nearShop,itemCost,collect,wipeAll,save,clean,get dynCD(){return dynCD},oreVeinAt,starFall,starTick,nightAmt,nightDive,moonP,moonLit,moonLight,moonName,xpGainMult,gmult,oreChance,get star(){return star},get starT(){return starT},get shoot(){return shoot},get dayT(){return dayT},set dayT(v){dayT=v},RV_W,RV_H,ORES,SEASONS,seasonMix,seasonTick,blockKind,breakSfx,hitSfx,get SEA(){return SEA},get shake(){return shake},set shake(v){shake=v}});
})();
