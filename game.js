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
"Mapa":"Map",
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
"Teleporte (compre em Melhorias)":"Teleport (buy it in Upgrades)",
"Fúria do Minerador (libera aos 50 m) e Escavação Frenética (aos 150 m)":"Miner's Fury (unlocks at 50 m) and Frenzied Digging (at 150 m)",
"Abrir e fechar o mapa. Com ele aberto, a roda do mouse dá zoom":"Open and close the map. While it's open, the mouse wheel zooms",
"Som ligado/desligado":"Sound on/off",
"Pausa. Com o mapa aberto, Esc fecha o mapa":"Pause. With the map open, Esc closes the map",
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
"<kbd>Mapa</kbd> <kbd>Pausa</kbd>":"<kbd>Map</kbd> <kbd>Pause</kbd>",
"Botões no topo do painel. Com o mapa aberto, tocar na tela fecha":"Buttons at the top of the panel. With the map open, tapping the screen closes it",
"Telas especiais":"Special screens",
"Caça-níquel":"Slot machine",
"<kbd>←</kbd> <kbd>→</kbd> ou <kbd>A</kbd> <kbd>D</kbd> mudam a aposta, <kbd>Espaço</kbd> ou <kbd>Enter</kbd> gira, <kbd>Esc</kbd> sai":"<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> change the bet, <kbd>Space</kbd> or <kbd>Enter</kbd> spins, <kbd>Esc</kbd> exits",
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
// --- 1-nucleo/04-formulas.js
"Explode uma área de raio {0}. Gasta {1} blocos de energia; recarga de {2} s. Também quebra os veios de pedra dura":"Blasts an area of radius {0}. Costs {1} blocks of energy; {2} s cooldown. Also breaks hard stone veins",
"Explode uma área de raio {0}. Mais forte que a anterior; gasta {1} blocos de energia; recarga de {2} s. Também quebra os veios de pedra dura":"Blasts an area of radius {0}. Stronger than the previous one; costs {1} blocks of energy; {2} s cooldown. Also breaks hard stone veins",
"Dinamite reforçada":"Reinforced dynamite",
"Dinamite pesada":"Heavy dynamite",
"Carga de nitro":"Nitro charge",
"Bomba de demolição":"Demolition bomb",
"Cenourinha":"Little carrot",
"Recupera 10% da energia máxima":"Restores 10% of max energy",
"Sopa de cogumelo":"Mushroom soup",
"Recupera 25% da energia máxima":"Restores 25% of max energy",
"Poção de energia":"Energy potion",
"Recupera 50% da energia máxima":"Restores 50% of max energy",
"Poção de teleporte":"Teleport potion",
"Uso único: leva ao baú sem gastar energia (na superfície, volta ao ponto de onde saiu). Só cai de baús":"Single use: takes you to the chest without spending energy (on the surface, returns to where you left from). Only found in chests",
"Fornalha":"Furnace",
"Quadro de contratos":"Contract board",
"NOVIDADE LIBERADA":"NEW UNLOCK",
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
"Picareta ampla":"Wide pickaxe",
"Quebra {0} bloco(s) de cada lado do alvo, de graça (cada nível soma +1 para os dois lados)":"Breaks {0} block(s) on each side of the target for free (each level adds +1 on both sides)",
"Velocidade de escavação":"Digging speed",
"+5% de velocidade ao segurar a escavação por nível":"+5% speed while holding dig, per level",
"Chance de golpe crítico":"Critical hit chance",
"+{0}% de chance de golpe crítico (dano x3) por nível, até {1}%":"+{0}% critical hit chance (x3 damage) per level, up to {1}%",
"Energia máxima":"Max energy",
"+30 de energia máxima por nível":"+30 max energy per level",
"Economia de energia":"Energy saving",
"-5% de gasto de energia ao cavar e voar por nível (cumulativo: cada nível multiplica por 0,95). Gasto atual: {0}%":"-5% energy spent when digging and flying per level (cumulative: each level multiplies by 0.95). Current spend: {0}%",
"Eficiência da mochila a jato":"Jetpack efficiency",
"-5% da energia gasta ao subir com o jato por nível (cumulativo). Gasto atual: {0}%":"-5% of the energy spent flying up with the jetpack per level (cumulative). Current spend: {0}%",
"Velocidade da mochila a jato":"Jetpack speed",
"+10% de velocidade ao subir com o jato por nível (subir continua gastando energia)":"+10% speed when flying up with the jetpack per level (flying up still spends energy)",
"Resistência à lava":"Lava resistance",
"-10% do dano da lava por nível (cumulativo). Lava aqui: {0}% do dano normal (próximo nível: {1}%)":"-10% lava damage per level (cumulative). Lava here: {0}% of normal damage (next level: {1}%)",
"-10% do dano da lava por nível (cumulativo). Lava aqui: {0}% do dano normal":"-10% lava damage per level (cumulative). Lava here: {0}% of normal damage",
"Escavação automática":"Auto digging",
"Quebra sozinho o bloco à frente com +0,25 golpe por segundo por nível. Gasta metade da energia, mas é mais fraco que cavar manualmente":"Automatically breaks the block ahead at +0.25 hits per second per level. Spends half the energy, but is weaker than digging by hand",
"Força da escavação automática":"Auto-dig power",
"+10% de dano dos golpes automáticos por nível":"+10% damage on automatic hits per level",
"Sorte para ouro e minérios":"Luck for gold and ores",
"+12% de ouro e +2% de chance de minério por nível":"+12% gold and +2% ore chance per level",
"Ganho de experiência":"Experience gain",
"+10% de experiência por nível":"+10% experience per level",
"Duração das habilidades":"Skill duration",
"+5% de duração da Fúria e da Escavação Frenética por nível":"+5% duration of Fury and Frenzied Digging per level",
"Potência da Fúria do Minerador":"Miner's Fury power",
"Dano da Fúria: x{0} (próximo nível: x{1}). Recarga: {2} s":"Fury damage: x{0} (next level: x{1}). Cooldown: {2} s",
"Dano da Fúria: x{0}. Recarga: {1} s":"Fury damage: x{0}. Cooldown: {1} s",
"Potência da Escavação Frenética":"Frenzied Digging power",
"Velocidade da Frenética: x{0} (próximo nível: x{1}). Recarga: {2} s":"Frenzy speed: x{0} (next level: x{1}). Cooldown: {2} s",
"Velocidade da Frenética: x{0}. Recarga: {1} s":"Frenzy speed: x{0}. Cooldown: {1} s",
"Lanterna":"Lantern",
"Um pouco mais de luz na escuridão. Luz extra: {0} (próximo nível: {1})":"A bit more light in the dark. Extra light: {0} (next level: {1})",
"Um pouco mais de luz na escuridão. Luz extra: {0}":"A bit more light in the dark. Extra light: {0}",
"Vagalume companheiro":"Firefly companion",
"Um vagalume te segue e ilumina o escuro. Luz extra: {0} (próximo nível: {1})":"A firefly follows you and lights up the dark. Extra light: {0} (next level: {1})",
"Um vagalume te segue e ilumina o escuro. Luz extra: {0}":"A firefly follows you and lights up the dark. Extra light: {0}",
"Velocidade da fornalha":"Furnace speed",
"Refina {0} minérios por segundo (próximo nível: {1}). O refinado vale +{2}% de ouro":"Refines {0} ores per second (next level: {1}). Refined ore is worth +{2}% gold",
"Refina {0} minérios por segundo. O refinado vale +{1}% de ouro":"Refines {0} ores per second. Refined ore is worth +{1}% gold",
"Relógio":"Clock",
"Mostra na barra do topo um relógio de sol e lua com a hora do dia (o dia dura {0} min)":"Shows a sun-and-moon clock with the time of day on the top bar (a day lasts {0} min)",
"Relógio comprado: veja a hora do dia na barra do topo (passe o mouse para ver o período)":"Clock bought: see the time of day on the top bar (hover to see the period)",
"Teleporte":"Teleport",
"Desbloqueia o teleporte: leva ao baú sem gastar energia e, usado na superfície, volta ao ponto de onde saiu":"Unlocks teleport: takes you to the chest without spending energy and, used on the surface, returns to where you left from",
"Recarga do teleporte: {0} s ({1} s no próximo nível)":"Teleport cooldown: {0} s ({1} s at the next level)",
"Recarga do teleporte: {0} s":"Teleport cooldown: {0} s",
"Nova picareta: {0}":"New pickaxe: {0}",
"Sem {0}: compre na loja (na superfície)":"No {0}: buy some at the shop (on the surface)",
"Na superfície a energia já se recupera sozinha":"On the surface, energy recovers by itself",
"Energia já está cheia":"Energy is already full",
"{0}: +{1} de energia":"{0}: +{1} energy",
// --- 2-sistemas/02-energia-mochila.js
"Compre <b>comida de energia</b> na loja: ela fica na barra ao lado das habilidades e recupera energia no subsolo.":"Buy <b>energy food</b> at the shop: it sits on the bar next to your skills and restores energy underground.",
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
"Dano x{0} por {1} s (recarga {2} s)":"Damage x{0} for {1} s ({2} s cooldown)",
"Cava x{0} mais rápido por {1} s (recarga {2} s)":"Digs x{0} faster for {1} s ({2} s cooldown)",
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
"Túnel largo":"Wide tunnel",
"Picareta ampla no nível máximo":"Wide pickaxe at max level",
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
"Conquista: {0}":"Achievement: {0}",
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
// --- 2-sistemas/15-fundo.js
"Uma cenoura dourada cresce da raiz do cristal, bem no coração do abismo. Ela pulsa devagar, como se esperasse por você.":"A golden carrot grows from the crystal’s root, deep in the heart of the abyss. It pulses slowly, as if waiting for you.",
"O vagalume não sai do seu lado. Ele brilha tanto que dá para sentir o calor daqui.":"The firefly stays by your side. It glows so brightly you can feel the warmth from here.",
"A CENOURA DOURADA":"THE GOLDEN CARROT",
"Tocar na cenoura":"Touch the carrot",
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
"Lava! -{0} de energia":"Lava! -{0} energy",
"ÓTIMO!":"GREAT!",
"INCRÍVEL!":"INCREDIBLE!",
"IMPARÁVEL!":"UNSTOPPABLE!",
"LENDÁRIO!":"LEGENDARY!",
"MÍTICO!":"MYTHIC!",
"DIVINO!":"DIVINE!",
"+Energia":"+Energy",
"Pedra dura: só quebra com dinamite":"Hard stone: only breaks with dynamite",
"CRÍTICO! {0}":"CRITICAL! {0}",
// --- 4-interface/01-painel.js
"Picareta":"Pickaxe",
"Sorte e experiência":"Luck and experience",
"Habilidades":"Skills",
"Utilidades":"Utilities",
"Máx":"Max",
"Consumíveis":"Consumables",
"Recorde: {0} m":"Record: {0} m",
"Superfície · melhorias liberadas · {0}":"Surface · upgrades unlocked · {0}",
"INQUEBRÁVEL":"UNBREAKABLE",
"Minérios x3":"Ores x3",
"Ouro x3":"Gold x3",
"Melhorias só na superfície. Suba (ou use o teleporte) para comprar.":"Upgrades only on the surface. Go up (or use teleport) to buy.",
"Na mesa de trabalho: você pode melhorar o equipamento. Venda os itens no baú (clique nele).":"At the workbench: you can upgrade your gear. Sell items at the chest (click it).",
"Vá até a mesa de trabalho (à esquerda do buraco) para comprar melhorias.":"Go to the workbench (left of the hole) to buy upgrades.",
"A loja fica na superfície. Suba (ou use o teleporte) para comprar.":"The shop is on the surface. Go up (or use teleport) to buy.",
"Na loja: compre dinamite e comida de energia. Os itens de energia ficam na barra, ao lado das habilidades (clique para usar).":"At the shop: buy dynamite and energy food. Energy items sit on the bar next to your skills (click to use).",
"Vá até a loja (à direita do baú) para comprar.":"Go to the shop (right of the chest) to buy.",
"{0} · você tem {1}":"{0} · you have {1}",
"(preço sobe a cada camada alcançada)":"(price rises with every layer reached)",
"MÁX":"MAX",
"Fornalha: {0} minérios na fila · pronta em {1}. Pode ir cavar: ela vende sozinha.":"Furnace: {0} ores in the queue · ready in {1}. Go dig: it sells by itself.",
"A fornalha fica à esquerda do buraco. Fique ao lado dela e clique nela para pôr os minérios da mochila: ela refina com o tempo e vende sozinha (+{0}% de ouro). Pedra comum continua indo para o baú.":"The furnace is to the left of the hole. Stand next to it and click it to load the ores from your backpack: it refines them over time and sells them on its own (+{0}% gold). Plain stone keeps going to the chest.",
"Os poderes só podem ser comprados depois de Renascer pela primeira vez. Os fragmentos vêm do Renascer e, às vezes, dos baús raros do subsolo.":"Powers can only be bought after your first Rebirth. Shards come from Rebirth and, sometimes, from rare underground chests.",
"Fragmentos disponíveis: {0} (vêm do Renascer e dos baús raros).":"Shards available: {0} (from Rebirth and rare chests).",
"Som: desligado":"Sound: off",
"Som: ligado":"Sound: on",
"Picareta de {0}":"{0} pickaxe",
"Melhor picareta do jogo (camada {0})":"Best pickaxe in the game (layer {0})",
"Dano x{0} (atual: {1}). Recomendada para a camada {2}":"Damage x{0} (current: {1}). Recommended for the {2} layer",
"{0} · nv {1}/{2}":"{0} · lv {1}/{2}",
"{0} · nv {1}":"{0} · lv {1}",
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
"{0} — {1} (clique para usar). Você tem {2}":"{0} — {1} (click to use). You have {2}",
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
"{0} · {1} (o sol aparece no alto ao meio-dia e a lua à meia-noite)":"{0} · {1} (the sun is high at noon and the moon at midnight)",
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
// --- 5-desenho/05-mapa.js
"Mapa · {0} m · recorde {1} m":"Map · {0} m · record {1} m",
"Toque na tela para fechar":"Tap the screen to close",
"Mapa · profundidade {0} m · recorde {1} m · roda do mouse: zoom · M ou Esc fecham":"Map · depth {0} m · record {1} m · mouse wheel: zoom · M or Esc closes",
// --- 5-desenho/06-quadro.js
"Pedra dura: dinamite":"Hard stone: dynamite",
"Veio de {0}: x{1}":"{0} vein: x{1}",
// --- 5-desenho/12-povoado.js
"Salvo!":"Saved!",
"Cama":"Bed",
"Poço de água":"Well",
"Contratos: clique para abrir":"Contracts: click to open",
"Contratos prontos!":"Contracts ready!",
"Contratos":"Contracts",
"Caça-níquel: clique para jogar":"Slot machine: click to play",
// --- 5-desenho/13-paisagem.js
"Horta de cenouras":"Carrot garden",
"Fogueira":"Campfire",
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
 // Queda livre: segurar ↓ num trecho já cavado desce de graça, acelerando (s por bloco: começa em t0 e chega a tMin depois de `ramp` s)
 // shift = multiplicador do intervalo com Shift apertado (menor = mais rápido) · maxSteps = máx. de blocos por quadro
 fall:{t0:.045,tMin:.012,ramp:.6,shift:.45,maxSteps:12},
 // Melhorias da mesa de trabalho: custo do nível N = b x k^N (N começa em 0) · max = nível máximo
 ups:{
  sharp:{b:80,k:2.114,max:20}, // afiar picareta
  wide:{b:100000,k:14.422,max:4}, // picareta ampla (meio/fim de jogo)
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
  clock:{b:400,k:1,max:1}   // relógio na barra do topo (compra única; custo fixo b)
 },
 // LIBERAÇÃO GRADUAL: cada coisa só aparece quando o recorde de profundidade (m) chega ao número abaixo (0 = desde o início). Vale para melhorias da mesa, itens da loja e construções da superfície.
 // O recorde sobrevive ao Renascer, então o que foi liberado não some. Quem já tem nível/estoque no save continua vendo. on:false libera tudo (modo antigo).
 unlock:{on:true,
  ups:{sharp:0,speed:0,emax:0,eco:10,jet:15,luck:20,lant:25,xp:30,furn:30,crit:40,auto:50,duration:50,furia:50,autopow:60,clock:60,jetspd:70,lavares:80,tele:120,frenesi:150,pet:150,wide:200},
  items:{cen:0,dyn:25,sop:60,dyn2:100,poc:150,dyn3:250,dyn4:500,dyn5:900},
  build:{furnace:30,board:60,slot:150}},
 critMax:.75,                                          // teto da chance de crítico
 critPer:.04,                                           // chance de crítico por nível da melhoria
 ecoPer:.05,jetPer:.05,                                  // economia e eficiência do jato: -5% COMPOSTO por nível (0,95^nível), então nunca zera mesmo com muitos níveis
 jetSpd:.1,                                           // velocidade de subida com a mochila a jato: +10% por nível (intervalo entre blocos dividido por 1 + jetSpd x nível)
 tier:{b:600,k:3.4,dmgMult:2.6},                       // nova picareta: custo = b x k^(tier+1) · dano x dmgMult por tipo
 items:{dyn:40,dyn2:100,dyn3:260,dyn4:650,dyn5:1700,cen:30,sop:90,poc:220},itemK:1.9,       // loja: preço base e crescimento por camada alcançada
 dig:{powBase:4,hardBase:50,hardK:3.25,goldBase:1.5,goldK:2.15,crit:3},   // dano inicial · dureza (x hardK a cada 100 m) · ouro por bloco · multiplicador de crítico
 // Energia: máxima, custo de cavar (digBase x digGrow^camada: cresce 20% a cada 100 m), custo de andar/subir e fração gasta pela escavação automática
 energy:{base:100,perLevel:30,digBase:2.5,digGrow:1.2,stepBase:.06,stepLayer:.014,auto:.5,dyn:2},   // dyn = dinamite gasta o equivalente a 2 blocos cavados
 // Lava (a partir de 100 m): chance por bloco = p0 + pL x camada. Ao quebrar tira flat + flatL x camada + (pct + pctL x camada) da energia máxima; não é reduzida pela economia.
 // Blocos de lava quebrados de graça pela picareta ampla contam wideMult do dano. res = cada nível de Resistência à lava multiplica o dano por (1 - res).
 lava:{from:100,p0:.012,pL:.0025,flat:6,flatL:3,pct:.03,pctL:.006,wideMult:.5,res:.1},
 // Fornalha: refina minérios da mochila com o tempo e vende sozinha. base = minérios por segundo no nível 0 · per = +x% da base por nível · bonus = ouro extra do refinado
 furnace:{base:.4,per:.3,bonus:.3},
 xp:{base:20,k:1.22},                                  // XP para o próximo nível = base x k^(nível-1)
 events:{len:20,gapMin:90,gapRand:90},                 // frenesi/corrida do ouro: duração e intervalo (s)
 skills:{fury:{dur:10,cd:80,at:50,mult:3,per:.35},frenzy:{dur:8,cd:110,at:150,mult:2,per:.2}},      // habilidades ativas: duração, recarga (s), profundidade que libera · mult = dano x / velocidade x base · per = bônus por nível da melhoria (soma ao multiplicador)
 tele:{base:180,perLevel:18,min:25},                    // recarga do teleporte (s): base - perLevel x nível, nunca abaixo de min
 // Dinamites da loja (mesmo preço-base em items): r = raio da explosão (blocos) · p = força (x dano da picareta, gasta a dureza dos blocos) · e = energia gasta (x o custo de cavar 1 bloco aqui) · cd = recarga (s) até poder usar qualquer dinamite de novo
 dyn:{dyn:{r:2.2,p:60,e:2,cd:1.5},dyn2:{r:3,p:160,e:3,cd:3},dyn3:{r:4,p:420,e:4.5,cd:6},dyn4:{r:5,p:1100,e:6.5,cd:10},dyn5:{r:6.5,p:3000,e:9,cd:16}},
 pet:{light:.9},                                       // vagalume: blocos de luz extra por nível
 lant:{light:.3},                                      // lanterna: blocos de luz extra por nível (upgrade mais barato, comprável antes do vagalume)
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
const SURF_L=-36,SURF_R=52,PAD_L=8,PAD_R=9;
// Paisagem estendida (só visual, em 5-desenho/13-paisagem.js). Esquerda da casa: horta de cenouras, moinho de vento e a trilha até a grande montanha (sem nada lá, só montanha).
// Direita: riacho com ponte de madeira e roda d'água, fogueira com banco de pedra, praia com farol, trapiche e barco parado. Posições em colunas do mundo.
const GARDEN_L=-20.6,GARDEN_R=-13,MILL_C=-26;
const RIVER_C0=24,RIVER_C1=30,WHEEL_C=27.4;                       // água do riacho: colunas RIVER_C0..RIVER_C1 (a ponte passa por cima)
const CAMP_C=38.4,BEACH_C0=42,LIGHT_C=46.5,PIER_C=52.4,PIER_END_C=55.6,BOAT_C=57.6;   // o mar começa depois de SURF_R
const isRiver=c=>c>=RIVER_C0&&c<=RIVER_C1,isSea=c=>c>SURF_R,isBeach=c=>c>=BEACH_C0&&c<=SURF_R;
const inS=c=>c>=SURF_L&&c<=SURF_R;
const CHEST_C=5;                 // coluna do baú de depósito, na superfície
const SHOP_C=9;                  // coluna da loja de consumáveis (dinamite, comida de energia), na superfície, depois do baú
const BED_C=-9;                  // coluna da cama (salva o jogo e abre o menu), na superfície, depois da mesa de trabalho
const SLOT_C=3;                  // máquina de caça-níquel, ao lado do baú (entre o buraco e o baú)
const BOARD_C=14;                // quadro de contratos, na passagem da direita
const WELL_C=19;                 // poço de água (só enfeite), na passagem da direita, depois do quadro de contratos
const LAMPS=[7.4];               // o único poste de luz: madeira fina com lamparina pendurada, perto da loja
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

// ===== 1-nucleo/03-estado-save.js — Estado do jogo (S), validação do save, carregar/salvar e variáveis de sessão =====
const SAVE_KEY="abismo-v3";
const fresh=()=>({gold:0,depth:0,mc:0,prog:0,best:0,runMax:0,tier:0,runs:0,total:0,oc:0,blocks:0,deaths:0,sold:0,en:-1,
 lv:{sharp:0,wide:0,emax:0,eco:0,jet:0,jetspd:0,auto:0,autopow:0,speed:0,crit:0,luck:0,xp:0,duration:0,furia:0,frenesi:0,tele:0,pet:0,furn:0,lavares:0,lant:0,clock:0},items:{dyn:0,dyn2:0,dyn3:0,dyn4:0,dyn5:0,cen:0,sop:0,poc:0,ptp:0},dsel:"dyn",
 bag:{v:0,n:0,o:{},ov:{}},fur:{n:0,v:0,a:0,e:0,tg:0,tn:0},refined:0,sea:BAL.season.len*1.5,dir:"down",dug:[],ach:[],debug:false,real:0,pts:0,sk:{her:0,ini:0,ouro:0,dmg:0,fol:0,jato:0,gar:0,xp:0},od:[],xp:0,lvl:1,lvp:0,pk:{},tpBack:null,tab:0,ts:0,seed:0,bombs:0,eaten:0,tps:0,veins:0,sleeps:0,rich:0,ct:[],ctW:0,ctDone:0,pend:0,spins:0,slotNet:0,chests:0,chTop:0,chT:BAL.chest.tiers.map(()=>0),chGold:0,chFr:0,chPk:0,ptpUsed:0,play:0,v:7,vol:{m:.7,s:1,a:.7}});
let S=fresh();S.seed=newSeed();
function clean(o){const f=fresh();o=Object.assign(f,o&&typeof o==="object"?o:{});
 for(const k of["gold","depth","prog","best","runMax","tier","runs","total","oc","blocks","deaths","sold","pts","real","xp","lvp","bombs","eaten","tps","veins","sleeps","rich","refined","ctDone","spins","pend","chests","chTop","chGold","chFr","chPk","ptpUsed","play"])if(!Number.isFinite(o[k])||o[k]<0)o[k]=0;
 o.chT=BAL.chest.tiers.map((_,i)=>Array.isArray(o.chT)&&Number.isFinite(o.chT[i])&&o.chT[i]>0?Math.floor(o.chT[i]):0);   // baús abertos por raridade
 if(!Number.isFinite(o.gold)&&!o.debug)o.gold=0;
 if(!Number.isFinite(o.sea)||o.sea<0)o.sea=BAL.season.len*1.5;   // relógio das estações (2-sistemas/07-estacoes.js); sem ele começa no meio do verão
 o.depth=clamp(Math.floor(o.depth),0,FINAL_DEPTH);o.mc=clamp(Math.floor(Number.isFinite(o.mc)?o.mc:0),o.depth>0?-HALF:SURF_L,o.depth>0?HALF:SURF_R);   // na superfície dá para estar fora das colunas da minao.best=Math.max(Math.floor(o.best),o.depth);o.runMax=Math.max(Math.floor(o.runMax),o.depth);
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
 if(!/^dyn[2-5]?$/.test(o.dsel))o.dsel="dyn";   // dinamite escolhida (tecla R troca)
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
 delete o.marks;delete o.shards;o.v=8;return o}
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
let mapOn=false,mapB=null,mapT=0,mapZ=1,musOn=false,musT=0,ambT=0,amb=[],modal=null,levelChoiceId=0,levelChoiceTicker=0;
let cmb=0,cmbT=0,cmbPulse=0,cmbMax=0,cmbFlash=0,cmbBanner=0,cmbBannerT="",cmbLast=0,cmbLastT=0,cmbTier=0;
let skT=[0,0],skCD=[0,0],dynCD=0,dynCDt=1.5,tpCD=0,ev=0,evT=0,evNext=60+Math.random()*60;
let star=0,starT=0,starNext=60+Math.random()*120,shoot=null;   // estrela cadente: segundos de bônus restantes · tipo (0 ouro, 1 sorte) · espera até a próxima · risco no céu
let mute=false,actx=null,toast="",toastT=0,breakNoise=null,breakSfxNext=0;
let camX=0,camY=0,mX=0,mY=0,swing=0,parts=[],texts=[],shake=0,flash=0,flashC="#ff2a2a",flashText="",chestOpen=0,lowEnPulse=0,layerSeen=0,jetT=0;
let holdM=false,holdS=false,lastH=0,held=null,heldC=null,lastMv=0,shiftOn=false,fallR=0,fallAcc=0,cheatBuf="",cheatT=0,cheatSurf=false,cheatPos=null;
// Códigos secretos (digitar a palavra, como em GTA). CENOURA: ouro e energia infinitos (em qualquer lugar). FINAL: teleporta para a Rocha-mãe e dispara a cena da cenoura dourada (em qualquer lugar) · CLIMA: troca o clima · SEASON: avança a estação (esses dois só valem na superfície, onde se vê o efeito).
const CHEATS=["CENOURA","CLIMA","SEASON","FINAL"],CHEATS_SURF=["CLIMA","SEASON"];

// ===== 1-nucleo/04-formulas.js — Fórmulas de dano, dureza, ouro, energia e custos (os números ficam em BAL, 00-balanceamento.js) =====
const pk=k=>S.pk[k]||0;
const gmult=()=>(1+.12*S.lv.luck)*(1+.08*S.sk.ouro)*(1+.12*pk("gold"))*(ev>0&&!evT?3:1)*(star>0&&!starT?BAL.star.gold:1);
// Dano: a picareta de cada camada vale 2,6x a anterior; a dureza dos blocos cresce 3x a cada 100 m.
// Assim as camadas fundas ficam duras mesmo com todos os upgrades no máximo (sem a picareta e os upgrades certos, ficam muito duras).
const basePow=()=>BAL.dig.powBase*Math.pow(BAL.tier.dmgMult,S.tier)*(1+.12*S.lv.sharp)*(1+.08*S.sk.dmg)*(1+.15*pk("dmg"));
const furyMult=()=>BAL.skills.fury.mult+BAL.skills.fury.per*S.lv.furia;        // Fúria: dano x (3 + 0,35 por nível)
const frenzyMult=()=>BAL.skills.frenzy.mult+BAL.skills.frenzy.per*S.lv.frenesi;   // Frenesi: velocidade x (2 + 0,2 por nível)
const clickPow=()=>basePow()*(skT[0]>0?furyMult():1);
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
 dyn:{get n(){return __("Dinamite")},get d(){return dynDesc("dyn")},b:BAL.items.dyn,c:"#e5412d"},
 dyn2:{get n(){return __("Dinamite reforçada")},get d(){return dynDesc("dyn2")},b:BAL.items.dyn2,c:"#ff9a2a"},
 dyn3:{get n(){return __("Dinamite pesada")},get d(){return dynDesc("dyn3")},b:BAL.items.dyn3,c:"#3fa8ff"},
 dyn4:{get n(){return __("Carga de nitro")},get d(){return dynDesc("dyn4")},b:BAL.items.dyn4,c:"#b45cff"},
 dyn5:{get n(){return __("Bomba de demolição")},get d(){return dynDesc("dyn5")},b:BAL.items.dyn5,c:"#ffd45c"},
 cen:{get n(){return __("Cenourinha")},get d(){return __("Recupera 10% da energia máxima")},b:BAL.items.cen,c:"#ff9a3a",en:.1},
 sop:{get n(){return __("Sopa de cogumelo")},get d(){return __("Recupera 25% da energia máxima")},b:BAL.items.sop,c:"#c9a27a",en:.25},
 poc:{get n(){return __("Poção de energia")},get d(){return __("Recupera 50% da energia máxima")},b:BAL.items.poc,c:"#6ff0ff",en:.5},
 ptp:{get n(){return __("Poção de teleporte")},get d(){return __("Uso único: leva ao baú sem gastar energia (na superfície, volta ao ponto de onde saiu). Só cai de baús")},b:0,c:"#9a5cff",tp:1,noShop:1}
};
const itemCost=k=>Math.ceil(ITEMS[k].b*Math.pow(BAL.itemK,layerOf(S.best)));
const have=k=>S.items[k]||0;
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
// Faixa própria de "novidade liberada" (não é o aviso comum do canto): aparece no meio do jogo, dourada, com fanfarra; várias seguidas entram em fila
let ulQ=[],ulT=0;
function showUnlock(names){ulQ.push(names);if(!ulT)ulNext()}
function ulNext(){
 const el=$("unl");ulT=0;if(!el)return;
 const n=ulQ.shift();if(!n){el.className="";return}
 el.innerHTML="<small>"+__("NOVIDADE LIBERADA")+"</small>"+n.map(x=>"<b>"+x+"</b>").join("");
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
function say(m){toast=String(m).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF\u2B00-\u2BFF]|\uFE0F|\u200D|\u20E3/g,"").trim();toastT=4}
// Executa um código secreto digitado (ver CHEATS em 1-nucleo/03-estado-save.js e o tratamento em 4-interface/04-entrada.js)
function runCheat(w){
 if(w==="CENOURA"){toggleDbg();return}
 // se a primeira letra ("S" de SEASON) desceu um bloco no buraco, desfaz: o código não deve mudar a posição do jogador
 if(cheatPos&&S.mc===cheatPos.mc&&S.depth===cheatPos.depth+1){S.depth=cheatPos.depth;S.best=cheatPos.best;S.runMax=cheatPos.runMax;mY=camY=S.depth;S.prog=0}
 if(w==="FINAL"){   // vai direto para a Rocha-mãe (abre o poço da coluna atual, para dar para subir de volta) e roda a cena de chegada
  if(modal)return;S.mc=clamp(S.mc,-HALF,HALF);for(let r=1;r<FINAL_DEPTH;r++)dug.add(S.mc+","+r);
  S.depth=FINAL_DEPTH;S.best=Math.max(S.best,FINAL_DEPTH);S.runMax=Math.max(S.runMax,FINAL_DEPTH);S.prog=0;S.en=maxEn();
  mX=camX=S.mc;mY=camY=S.depth;layerSeen=BIO.length-1;carrotC=null;reachBottom();return}
 if(w==="CLIMA"){const k=WX_KEYS[(WX_KEYS.indexOf(wx.cur)+1)%WX_KEYS.length];weatherSet(k);say(__("Clima: {0}",WX[k].n));return}
 if(w==="SEASON"){const L=BAL.season.len,i=(Math.floor(S.sea/L)+1)%4;S.sea=i*L+L/2;say(__("Estação: {0}",SEASONS[i].n))}   // vai para o meio da próxima estação (a paleta dela vale por inteira ali)
}
function toggleDbg(){S.debug=!S.debug;if(S.debug){S.real=S.gold;S.gold=Infinity}else S.gold=S.real||0;say(S.debug?__("Cenoura! Ouro e energia infinitos"):__("Cenoura desligada"));build()}

// ===== 2-sistemas/01-melhorias.js — Tabela de melhorias (mesa de trabalho) e compra de melhorias, picareta e consumáveis (loja) =====
// g = grupo no painel · n = nome · d = descrição · b = custo base · k = crescimento do custo · max = nível máximo
const fmtN=x=>ndec(+x.toFixed(2));
const fmtLight=(l,v)=>__("{0} blocos",ndec((l*v).toFixed(1)));
// n e d: o nome é um getter e a descrição uma função, ambos traduzidos na hora de exibir (g = grupo, traduzido pelo painel)
const UPS={
 sharp:{g:"Picareta",get n(){return __("Afiar picareta")},d:l=>__("+12% de dano da picareta por nível"),...BAL.ups.sharp},
 wide:{g:"Picareta",get n(){return __("Picareta ampla")},d:l=>__("Quebra {0} bloco(s) de cada lado do alvo, de graça (cada nível soma +1 para os dois lados)",l+1),...BAL.ups.wide},
 speed:{g:"Picareta",get n(){return __("Velocidade de escavação")},d:l=>__("+5% de velocidade ao segurar a escavação por nível"),...BAL.ups.speed},
 crit:{g:"Picareta",get n(){return __("Chance de golpe crítico")},d:l=>__("+{0}% de chance de golpe crítico (dano x3) por nível, até {1}%",Math.round(BAL.critPer*100),Math.round(BAL.critMax*100)),...BAL.ups.crit},
 emax:{g:"Energia",get n(){return __("Energia máxima")},d:l=>__("+30 de energia máxima por nível"),...BAL.ups.emax},
 eco:{g:"Energia",get n(){return __("Economia de energia")},d:l=>__("-5% de gasto de energia ao cavar e voar por nível (cumulativo: cada nível multiplica por 0,95). Gasto atual: {0}%",Math.round(Math.pow(1-BAL.ecoPer,l)*100)),...BAL.ups.eco},
 jet:{g:"Energia",get n(){return __("Eficiência da mochila a jato")},d:l=>__("-5% da energia gasta ao subir com o jato por nível (cumulativo). Gasto atual: {0}%",Math.round(Math.pow(1-BAL.jetPer,l)*100)),...BAL.ups.jet},
 jetspd:{g:"Energia",get n(){return __("Velocidade da mochila a jato")},d:l=>__("+10% de velocidade ao subir com o jato por nível (subir continua gastando energia)"),...BAL.ups.jetspd},
 lavares:{g:"Energia",get n(){return __("Resistência à lava")},d:l=>l<BAL.ups.lavares.max?__("-10% do dano da lava por nível (cumulativo). Lava aqui: {0}% do dano normal (próximo nível: {1}%)",Math.round(Math.pow(1-BAL.lava.res,l)*100),Math.round(Math.pow(1-BAL.lava.res,l+1)*100)):__("-10% do dano da lava por nível (cumulativo). Lava aqui: {0}% do dano normal",Math.round(Math.pow(1-BAL.lava.res,l)*100)),...BAL.ups.lavares},
 auto:{g:"Escavação automática",get n(){return __("Escavação automática")},d:l=>__("Quebra sozinho o bloco à frente com +0,25 golpe por segundo por nível. Gasta metade da energia, mas é mais fraco que cavar manualmente"),...BAL.ups.auto},
 autopow:{g:"Escavação automática",get n(){return __("Força da escavação automática")},d:l=>__("+10% de dano dos golpes automáticos por nível"),...BAL.ups.autopow},
 luck:{g:"Sorte e experiência",get n(){return __("Sorte para ouro e minérios")},d:l=>__("+12% de ouro e +2% de chance de minério por nível"),...BAL.ups.luck},
 xp:{g:"Sorte e experiência",get n(){return __("Ganho de experiência")},d:l=>__("+10% de experiência por nível"),...BAL.ups.xp},
 duration:{g:"Habilidades",get n(){return __("Duração das habilidades")},d:l=>__("+5% de duração da Fúria e da Escavação Frenética por nível"),...BAL.ups.duration},
 furia:{g:"Habilidades",get n(){return __("Potência da Fúria do Minerador")},d:l=>{const a=fmtN(BAL.skills.fury.mult+BAL.skills.fury.per*l),cd=BAL.skills.fury.cd;return l<BAL.ups.furia.max?__("Dano da Fúria: x{0} (próximo nível: x{1}). Recarga: {2} s",a,fmtN(BAL.skills.fury.mult+BAL.skills.fury.per*(l+1)),cd):__("Dano da Fúria: x{0}. Recarga: {1} s",a,cd)},...BAL.ups.furia},
 frenesi:{g:"Habilidades",get n(){return __("Potência da Escavação Frenética")},d:l=>{const a=fmtN(BAL.skills.frenzy.mult+BAL.skills.frenzy.per*l),cd=BAL.skills.frenzy.cd;return l<BAL.ups.frenesi.max?__("Velocidade da Frenética: x{0} (próximo nível: x{1}). Recarga: {2} s",a,fmtN(BAL.skills.frenzy.mult+BAL.skills.frenzy.per*(l+1)),cd):__("Velocidade da Frenética: x{0}. Recarga: {1} s",a,cd)},...BAL.ups.frenesi},
 lant:{g:"Habilidades",get n(){return __("Lanterna")},d:l=>l<BAL.ups.lant.max?__("Um pouco mais de luz na escuridão. Luz extra: {0} (próximo nível: {1})",fmtLight(l,BAL.lant.light),fmtLight(l+1,BAL.lant.light)):__("Um pouco mais de luz na escuridão. Luz extra: {0}",fmtLight(l,BAL.lant.light)),...BAL.ups.lant},
 pet:{g:"Habilidades",get n(){return __("Vagalume companheiro")},d:l=>l<BAL.ups.pet.max?__("Um vagalume te segue e ilumina o escuro. Luz extra: {0} (próximo nível: {1})",fmtLight(l,BAL.pet.light),fmtLight(l+1,BAL.pet.light)):__("Um vagalume te segue e ilumina o escuro. Luz extra: {0}",fmtLight(l,BAL.pet.light)),...BAL.ups.pet},
 furn:{g:"Fornalha",get n(){return __("Velocidade da fornalha")},d:l=>l<BAL.ups.furn.max?__("Refina {0} minérios por segundo (próximo nível: {1}). O refinado vale +{2}% de ouro",ndec(furRate(l).toFixed(2)),ndec(furRate(l+1).toFixed(2)),Math.round(BAL.furnace.bonus*100)):__("Refina {0} minérios por segundo. O refinado vale +{1}% de ouro",ndec(furRate(l).toFixed(2)),Math.round(BAL.furnace.bonus*100)),...BAL.ups.furn},
 clock:{g:"Utilidades",get n(){return __("Relógio")},d:l=>l<1?__("Mostra na barra do topo um relógio de sol e lua com a hora do dia (o dia dura {0} min)",Math.round(BAL.day.len/60)):__("Relógio comprado: veja a hora do dia na barra do topo (passe o mouse para ver o período)"),...BAL.ups.clock},
 tele:{g:"Habilidades",get n(){return __("Teleporte")},d:l=>{const c=Math.max(BAL.tele.min,BAL.tele.base-BAL.tele.perLevel*l);return l<1?__("Desbloqueia o teleporte: leva ao baú sem gastar energia e, usado na superfície, volta ao ponto de onde saiu"):l<BAL.ups.tele.max?__("Recarga do teleporte: {0} s ({1} s no próximo nível)",c,Math.max(BAL.tele.min,BAL.tele.base-BAL.tele.perLevel*(l+1))):__("Recarga do teleporte: {0} s",c)},...BAL.ups.tele}
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
 S.gold-=c;S.tier++;sfx(520,.2,"sawtooth");sfx(780,.3,"triangle");say(__("Nova picareta: {0}",__(TIERS[S.tier])));build();
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
 if(have(k)<1){say(__("Sem {0}: compre na loja (na superfície)",it.n));return}
 if(atSurface()){say(__("Na superfície a energia já se recupera sozinha"));return}
 const m=maxEn();if(S.en>=m-.5){say(__("Energia já está cheia"));return}
 if(!S.debug)S.items[k]--;S.eaten++;
 const g=Math.min(m-S.en,m*it.en);S.en+=g;
 const p=blockXY(S.mc,S.depth);texts.push({x:p.x,y:p.y-T*.8,t:0,s:__("{0}: +{1} de energia",it.n,Math.round(g)),c:"#6ff0ff",big:1});
 for(let i=0;i<10;i++)parts.push({x:p.x,y:p.y-T*.4,vx:(Math.random()-.5)*160,vy:-60-Math.random()*140,l:.6,c:it.c});
 sfx(660,.1,"sine");sfx(990,.14,"sine");refresh();
}

// ===== 2-sistemas/02-energia-mochila.js — Energia, morte, venda no baú e teleporte =====
const atSurface=()=>S.depth<=0;
const nearChest=()=>atSurface()&&Math.abs(S.mc-CHEST_C)<=1;
const nearBench=()=>atSurface()&&Math.abs(S.mc-BENCH_C)<=1;
const nearBed=()=>atSurface()&&Math.abs(S.mc-BED_C)<=1;
const nearSlot=()=>atSurface()&&isUnl("build","slot")&&Math.abs(S.mc-SLOT_C)<=1;
const nearBoard=()=>atSurface()&&isUnl("build","board")&&Math.abs(S.mc-BOARD_C)<=1;
const nearFurnace=()=>atSurface()&&isUnl("build","furnace")&&Math.abs(S.mc-FURN_C)<=1;
const nearShop=()=>atSurface()&&Math.abs(S.mc-SHOP_C)<=1;
const JET_FLAME=.3;
function spend(n){if(S.debug||S.depth<=0)return;S.en-=n;if(lowEnPulse<=0&&S.en<maxEn()*.25)lowEnPulse=1;if(S.en<=0){S.en=0;die()}}
function bagCount(){return S.bag.n}
let deathLock=0;
function showDeath(info){
 if(modal)return;                                   // não atropela outra janela aberta
 const b=openModal("death");b.style.maxWidth="420px";
 const ores=Object.entries(info.o).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>{const o=ORES.find(x=>x[0]===k);return"<span><i style='background:"+(o?o[2]:"#8d9299")+"'></i>"+__(k)+" x"+v+"</span>"}).join("");
 const eat=Object.keys(ITEMS).filter(k=>ITEMS[k].en),noFood=eat.every(k=>have(k)<1);
 const tip=noFood?__("Compre <b>comida de energia</b> na loja: ela fica na barra ao lado das habilidades e recupera energia no subsolo.")
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
 say(n?__("Você apagou! Perdeu {0} itens ({1} de ouro)",n,fmt(lost)):__("Você apagou e voltou à superfície"));
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
 if(S.bag.n>0)sellBag();else say(__("Mochila vazia: nada para vender."));
 return true;
}
function chestHit(px,py){   // o ponto (px,py) da tela está sobre o desenho do baú?
 const u=pu(),cs=sprChest(chestOpen>.1),c=chestXY().x,y=rowY(0);
 return px>=c-cs.w*u/2&&px<=c+cs.w*u/2&&py>=y-cs.h*u&&py<=y;
}
function teleport(pot){   // pot: poção de teleporte (uso único, sem nível de teleporte nem recarga)
 if(modal||(!pot&&(S.lv.tele<1||tpCD>0)))return;
 if(pot&&have("ptp")<1){say(__("Sem Poção de teleporte"));return}
 if(S.depth>0){S.tpBack={c:S.mc,d:S.depth};goTo(CHEST_C,0)}
 else if(S.tpBack&&isDug(S.tpBack.c,S.tpBack.d-1)){goTo(S.tpBack.c,S.tpBack.d);S.tpBack=null}
 else{say(__("Teleporte: use no subsolo para subir ao baú"));return}
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
function gainXp(n){if(!(n>0)||!isFinite(n))return;S.xp+=n*xpGainMult();let g=0;while(S.xp>=xpNeed(S.lvl)&&g++<50){S.xp-=xpNeed(S.lvl);S.lvl++;S.lvp++;say(__("Nível {0}!",S.lvl));sfx(1100,.4,"sine")}if(S.lvp>0&&!modal)levelUp()}
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
const skillDescription=i=>i===0?__("Dano x{0} por {1} s (recarga {2} s)",fmtN(furyMult()),fmt(skillDuration(i)),SKL[i][3]):__("Cava x{0} mais rápido por {1} s (recarga {2} s)",fmtN(frenzyMult()),fmt(skillDuration(i)),SKL[i][3]);
function useSk(i){if(modal||i<0||i>=SKL.length||S.best<SKL[i][4]||skCD[i]>0)return;skCD[i]=SKL[i][3];skT[i]=skillDuration(i);flash=.35;flashC="#ffb43a";sfx(500+i*120,.2,"sawtooth");say(__("Habilidade ativada: {0}",__(SKL[i][0])))}
const dynMax=()=>dynCDt;   // recarga da última dinamite usada (BAL.dyn[tipo].cd): quanto mais forte, maior
const DYN_IDS=["dyn","dyn2","dyn3","dyn4","dyn5"];   // tipos de dinamite, do mais fraco ao mais forte (números em BAL.dyn)
// Dinamite em uso: a escolhida (tecla R troca); se acabou, usa a mais forte que ainda houver
function dynPick(){if(have(S.dsel)>0||S.debug)return S.dsel;for(let i=DYN_IDS.length-1;i>=0;i--)if(have(DYN_IDS[i])>0)return DYN_IDS[i];return S.dsel}
function dynNext(){const own=DYN_IDS.filter(k=>have(k)>0||k===S.dsel||S.debug);if(!own.length)return;const i=own.indexOf(S.dsel);S.dsel=own[(i+1)%own.length];say(__("Dinamite escolhida: {0}",ITEMS[S.dsel].n));sfx(620,.08,"triangle");refresh()}
function boom(){
 if(modal||dynCD>0)return;
 const dk=dynPick();
 if(have(dk)<1&&!S.debug){say(__("Sem dinamite: compre na loja (na superfície)"));return}
 const DB=BAL.dyn[dk];
 const[tc,tr]=tgt();let tot=0,n=0;
 const R=DB.r,RI=Math.ceil(R),cells=[];
 for(let dx=-RI;dx<=RI;dx++)for(let dy=-RI;dy<=RI;dy++){const c=tc+dx,r=tr+dy;if(dx*dx+dy*dy>R*R||!canBlast(c,r))continue;cells.push([dx*dx+dy*dy,c,r])}
 if(!cells.length){say(__("Nada para explodir aqui"));return}
 if(!S.debug)S.items[dk]--;
 S.dsel=dk;
 cells.sort((x,y)=>x[0]-y[0]);let B=DB.p*clickPow();   // força da explosão = p x dano da picareta (gasta a dureza dos blocos; veios de pedra dura sempre quebram)
 for(const[,c,r]of cells){if(!isVein(c,r)){const hh=hardness(r);if(B<hh)continue;B-=hh}const o=collect(c,r);tot+=o.v;n++;if(Math.random()<.5){const p=blockXY(c,r);parts.push({x:p.x,y:p.y+T/2,vx:(Math.random()-.5)*300,vy:-Math.random()*260,l:.8,c:ITEMS[dk].c})}}
 dynCDt=DB.cd;dynCD=dynCDt;S.bombs++;const big=DYN_IDS.indexOf(dk);shake=Math.max(shake,BAL.shake.dyn[big]||0);flash=.4+big*.08;flashC=ITEMS[dk].c;sfx(90-big*8,.4+big*.08,"sawtooth");
 const p=blockXY(tc,tr);texts.push({x:p.x,y:p.y-T*.5,t:0,s:__("{0}: {1} blocos · +{2}",ITEMS[dk].n,n,fmt(tot)),c:ITEMS[dk].c,big:1});
 if(n)spend(digCost(S.depth)*DB.e);   // dinamite: custa energia = e x o custo de cavar 1 bloco na profundidade atual
}
const ACH=[[N_("Primeiros passos"),N_("Chegue a 10 m"),()=>S.best>=10],[N_("Subsolo"),N_("50 m"),()=>S.best>=50],[N_("Centenário"),N_("100 m"),()=>S.best>=100],[N_("Abismo"),N_("300 m"),()=>S.best>=300],[N_("Coração do abismo"),N_("Chegue ao fundo (1500 m)"),()=>S.best>=FINAL_DEPTH],[N_("Garimpeiro"),N_("50 minérios"),()=>S.oc>=50],[N_("Mina de ouro"),N_("500 minérios"),()=>S.oc>=500],[N_("Magnata"),N_("1M de ouro no total"),()=>S.total>=1e6],[N_("Primeira venda"),N_("Venda itens no baú"),()=>S.sold>0],[N_("Quase lá"),N_("Apague de energia uma vez"),()=>S.deaths>0],[N_("Picareta de ouro"),N_("Compre a picareta de Ouro"),()=>S.tier>=5],[N_("Túnel largo"),N_("Picareta ampla no nível máximo"),()=>S.lv.wide>=UPS.wide.max],[N_("Renascido"),N_("Use Renascer"),()=>S.runs>0]];
// Conquistas novas ficam SEMPRE no fim da lista: o save guarda o número de cada uma.
ACH.push(
 [N_("Cavador de verdade"),N_("Chegue a 200 m"),()=>S.best>=200],[N_("Meia-descida"),N_("500 m"),()=>S.best>=500],[N_("Metade do caminho"),N_("750 m"),()=>S.best>=750],[N_("Mil metros"),N_("1000 m"),()=>S.best>=1000],[N_("Calor do magma"),N_("1200 m"),()=>S.best>=1200],[N_("Beira do fim"),N_("1400 m"),()=>S.best>=1400],
 [N_("Colecionador"),N_("Descubra 5 minérios diferentes"),()=>S.od.length>=5],[N_("Catálogo completo"),N_("Descubra todos os minérios"),()=>S.od.length>=ORES.length],[N_("Brilho de diamante"),N_("Encontre um Diamante"),()=>S.od.includes("Diamante")],[N_("Luz do abismo"),N_("Encontre um Cristal do abismo"),()=>S.od.includes("Cristal do abismo")],[N_("Veia inesgotável"),N_("5000 minérios"),()=>S.oc>=5000],
 [N_("Bilionário"),N_("1B de ouro no total"),()=>S.total>=1e9],[N_("Trilionário"),N_("1T de ouro no total"),()=>S.total>=1e12],
 [N_("Britadeira"),N_("Quebre 1000 blocos"),()=>S.blocks>=1000],[N_("Máquina de escavar"),N_("Quebre 100 mil blocos"),()=>S.blocks>=1e5],
 [N_("Ferreiro"),N_("Compre a picareta de Ferro"),()=>S.tier>=2],[N_("Mãos de diamante"),N_("Compre a picareta de Diamante"),()=>S.tier>=6],[N_("Lenda das picaretas"),N_("Tenha a picareta Primordial"),()=>S.tier>=TIERS.length-1],
 [N_("Ao máximo"),N_("Deixe uma melhoria no nível máximo"),()=>Object.keys(UPS).some(k=>S.lv[k]>=UPS[k].max)],[N_("Arsenal completo"),N_("Todas as melhorias no nível máximo"),()=>Object.keys(UPS).every(k=>S.lv[k]>=UPS[k].max)],[N_("Teleportado"),N_("Desbloqueie o teleporte"),()=>S.lv.tele>=1],
 [N_("Teimoso"),N_("Apague de energia 10 vezes"),()=>S.deaths>=10],[N_("Banquete"),N_("Coma 20 itens de energia"),()=>S.eaten>=20],[N_("Pavio curto"),N_("Use 10 dinamites"),()=>S.bombs>=10],[N_("Demolidor"),N_("Use 100 dinamites"),()=>S.bombs>=100],[N_("Viajante"),N_("Use o teleporte 10 vezes"),()=>S.tps>=10],[N_("Pedra no sapato"),N_("Quebre 20 pedras duras"),()=>S.veins>=20],
 [N_("Veterano"),N_("Chegue ao nível 10"),()=>S.lvl>=10],[N_("Experiente"),N_("Nível 25"),()=>S.lvl>=25],[N_("Lendário"),N_("Nível 50"),()=>S.lvl>=50],
 [N_("Ciclo"),N_("Renasça 3 vezes"),()=>S.runs>=3],[N_("Eterno"),N_("Renasça 10 vezes"),()=>S.runs>=10],
 [N_("Comerciante"),N_("Venda no baú 25 vezes"),()=>S.sold>=25],[N_("Atacadista"),N_("Venda no baú 250 vezes"),()=>S.sold>=250],
 [N_("Boa noite"),N_("Salve o jogo na cama"),()=>S.sleeps>=1],[N_("Sono pesado"),N_("Deite na cama 20 vezes"),()=>S.sleeps>=20],[N_("Companhia"),N_("Chame o vagalume"),()=>S.lv.pet>=1],[N_("Despensa cheia"),N_("Tenha 99 de algum item da loja"),()=>Object.keys(S.items).some(k=>ITEMS[k]&&!ITEMS[k].noShop&&S.items[k]>=99)],
 [N_("Fornalha acesa"),N_("Refine 1 minério na fornalha"),()=>S.refined>=1],[N_("Mestre ferreiro"),N_("Refine 1000 minérios"),()=>S.refined>=1000],
 [N_("Empreiteiro"),N_("Entregue 10 contratos"),()=>S.ctDone>=10],[N_("Na sorte"),N_("Jogue na mesa de apostas"),()=>S.spins>=1],[N_("Viciado"),N_("Jogue 100 vezes na mesa de apostas"),()=>S.spins>=100],[N_("Caçador de tesouros"),N_("Abra um baú no subsolo"),()=>S.chests>=1],[N_("Baú épico"),N_("Abra um baú Épico ou melhor"),()=>S.chTop>=4],[N_("Sorte lendária"),N_("Abra um baú Lendário"),()=>S.chTop>=5],
 [N_("Caça-baús"),N_("Abra 10 baús"),()=>S.chests>=10],[N_("Rei dos baús"),N_("Abra 100 baús"),()=>S.chests>=100],[N_("Coleção completa"),N_("Abra um baú de cada raridade"),()=>S.chT.every(n=>n>0)],[N_("Chuva de ouro"),N_("Abra 5 baús Lendários"),()=>S.chT[4]>=5],[N_("Presente dos baús"),N_("Ganhe 10 bônus de melhoria de baús"),()=>S.chPk>=10],[N_("Colecionador de cacos"),N_("Ache 10 fragmentos em baús"),()=>S.chFr>=10],[N_("Viajante de bolso"),N_("Use 5 poções de teleporte"),()=>S.ptpUsed>=5]
);
function checkAch(){for(let i=0;i<ACH.length;i++)if(!S.ach.includes(i)&&ACH[i][2]()){S.ach.push(i);say(__("Conquista: {0}",__(ACH[i][0])));sfx(1040,.3,"sine")}}

// ===== 2-sistemas/05-noite-estrelas.js — Estrela cadente (evento raro, só de noite) e indicadores de bônus da noite =====
// De noite, de tempos em tempos, uma estrela cruza o céu e dá um bônus por BAL.star.len segundos: ouro x2 ou chance de minério x2.
// O bônus vale em qualquer profundidade; o risco no céu só aparece se a superfície estiver à vista (ver skyShoot em 08-dia-noite.js).
function starFall(){
 starT=Math.random()<.5?0:1;star=BAL.star.len;
 shoot={t:0,len:2.2,x:.3+Math.random()*.4,y:.1+Math.random()*.2,dir:Math.random()<.5?-1:1};
 say(starT?__("Estrela cadente! Minérios x{0} por {1}s",BAL.star.luck,BAL.star.len):__("Estrela cadente! Ouro x{0} por {1}s",BAL.star.gold,BAL.star.len));
 sfx(1568,.25,"sine");sfx(2093,.4,"sine");
}
function starTick(dt){
 if(star>0){star-=dt;if(star<=0){star=0;say(__("O brilho da estrela se apagou"))}}
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
 say(__("Fornalha carregada: {0} minérios · pronta em {1}",n,fmtT(furEta())));
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
  say(__("Fornalha: {0} minérios refinados · +{1} de ouro",f.tn,fmt(f.tg)));sfx(880,.12,"triangle");
  S.fur={n:0,v:0,a:0,e:0,tg:0,tn:0};
 }
}
// Carrega só quando o jogador pede: clique do mouse na fornalha ou Espaço ao lado dela. Devolve true se tratou o comando (não cava).
function furUse(){
 if(!nearFurnace())return false;
 if(!furLoad())say(S.bag.n>0?__("Só há pedra comum na mochila: ela vai para o baú."):__("Sem minérios na mochila para pôr na fornalha."));
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
// g/h = grama da linha 0 (corpo e topo claro, que também é a cor das folhinhas) · nh/nhh = colinas próximas (corpo e topo) · fh/fhh = colinas distantes (corpo e topo)
const SEASONS=[
 {get n(){return __("Primavera")},get msg(){return __("Chegou a primavera!")},g:"#5fb03c",h:"#9be065",nh:"#4aa65a",nhh:"#74cc70",fh:"#a8dcd4",fhh:"#c4eee6"},
 {get n(){return __("Verão")},get msg(){return __("Chegou o verão!")},g:"#548b31",h:"#80b949",nh:"#3f7d4a",nhh:"#5aa05a",fh:"#9cc4e0",fhh:"#b4d4ea"},
 {get n(){return __("Outono")},get msg(){return __("Chegou o outono!")},g:"#a9722a",h:"#e0a43a",nh:"#b4532b",nhh:"#dc8438",fh:"#d1ae94",fhh:"#e4c9b0"},
 {get n(){return __("Inverno")},get msg(){return __("Chegou o inverno!")},g:"#c6d3dc",h:"#f4f8fb",nh:"#8ba3b8",nhh:"#c9d8e4",fh:"#a9bccd",fhh:"#d2dde8"}];
const SEA_KEYS=["g","h","nh","nhh","fh","fhh"];
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
 if(seaIdx>=0&&SEA.idx!==seaIdx){const s=SEASONS[SEA.idx];say(s.msg)}
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
function thunderSfx(){
 const v=skyVis();if(mute||S.vol.s<=0||v<=0||!actx)return;
 try{const t=actx.currentTime,s=S.vol.s*v;nz(t,"lowpass",650,.6,.05*s,1.8,110);tn(t,"sine",75,34,.04*s,1.3)}catch(e){}
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
  if(wx.left<=0){const prev=wx.cur;weatherSet(weatherPick());if(prev!==wx.cur&&skyVis()>0)say(WX[wx.cur].msg)}
  const T=WX[wx.cur],k=1-Math.exp(-dt/(BAL.weather.fade/3));
  for(const p of["cover","rain","snow","fog","wind"])wx[p]+=(T[p]-wx[p])*k;
  wx.bolt=Math.max(0,wx.bolt-dt*4);
  if(wx.cur==="storm"&&wx.rain>.7){wx.nextBolt-=dt;if(wx.nextBolt<=0){   // raio: clarão no céu e, um pouco depois, o trovão
   wx.bolt=1;wx.boltX=.15+Math.random()*.7;wx.boltJ=Array.from({length:9},()=>(Math.random()-.5)*.09);
   wx.nextBolt=BAL.weather.boltGap[0]+Math.random()*(BAL.weather.boltGap[1]-BAL.weather.boltGap[0]);wx.thunder.push(.3+Math.random()*1.5)}}
  for(let i=wx.thunder.length-1;i>=0;i--){wx.thunder[i]-=dt;if(wx.thunder[i]<=0){wx.thunder.splice(i,1);thunderSfx()}}
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
  if(f.kind===3&&f.res[0]===5){say(__("JACKPOT! {0} de ouro",fmt(f.win)));for(let i=0;i<8;i++)setTimeout(()=>{sfx(1568-i*80,.2,"square");slotCoins(30,1.5)},i*180)}
  else say(f.kind===3?__("3 {0}s! +{1} de ouro",__(SLOT_NAMES[f.res[0]]),fmt(f.win)):__("Par de {0}: +{1} de ouro",__(SLOT_NAMES[f.res[0]]),fmt(f.win)))}
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
 if(!(S.gold>=bet)||!(bet>0)){say(__("Ouro insuficiente para essa aposta"));sfx(140,.1,"square");return}
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
// a animação é só apresentação, então fechar o jogo no meio não perde nada. Baús quebrados juntos (dinamite, picareta ampla) entram numa fila e abrem um por vez.
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
function tocarCenoura(){
 flash=1.2;flashC="#ffd45c";flashText="";shake=Math.max(shake,6);
 [392,523,659,784,1047].forEach((f,i)=>setTimeout(()=>sfx(f,.5,"sine"),i*160));
 closeModal();openBottom()}

// ===== 3-mundo/00-camera.js — Canvas, câmera, zoom limitado ao mundo e conversão de coordenadas =====
const cv=$("cv"),ctx=cv.getContext("2d");
let W=0,H=0,T=44,dpr=1,worldZoom=1;
const SURF=.3;                                   // fração da altura onde fica a superfície
const baseTile=()=>W<500?36:44;
const zoomMin=()=>W/(COLS+2)/baseTile();          // com o zoom mínimo o mundo inteiro cabe na tela e nada além dele aparece
const zoomMax=()=>Math.max(2.2,zoomMin()*1.8);
function setZoom(z){worldZoom=clamp(z,zoomMin(),zoomMax());T=baseTile()*worldZoom}
function resize(){dpr=Math.min(2,window.devicePixelRatio||1);const r=cv.getBoundingClientRect();W=Math.max(200,r.width);H=Math.max(200,r.height);cv.width=W*dpr;cv.height=H*dpr;setZoom(worldZoom)}
new ResizeObserver(resize).observe(cv);
resize();
const rowY=r=>H*SURF+(r-camY)*T;
const colX=c=>W/2+(c-camX)*T;                    // centro da coluna na tela
const blockXY=(c,r)=>({x:colX(c),y:rowY(r)});
const shopXY=()=>({x:colX(SHOP_C),y:rowY(0)});
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
const airborne=()=>S.depth>0&&S.depth<FINAL_DEPTH&&isDug(S.mc,S.depth);
const DIR_UP=["up"];
function setDir(d){if(!["up","down","left","right"].includes(d))return;   // só as 4 direções: não existe mais golpe nem movimento na diagonal
 if(DIR_UP.includes(d)&&S.depth<1)return;if(S.dir!==d){S.dir=d;S.prog=0}}

// ===== 3-mundo/02-coleta.js — Quebrar um bloco: sorteia minério, coloca na mochila e abre a célula =====
// O combo é só visual: não altera o ouro. Veio de pedra dura (só dinamite): vale VEIN_GOLD x um bloco comum e nunca tem minério.
// Veio de minério: sempre rende o minério do veio, BAL.oreVein.units vezes (vale ouro e entra na mochila na mesma quantidade).
const VEIN_GOLD=6;
function collect(c,r){
 const vein=isVein(c,r),rk=vein?-1:oreVeinAt(c,r),rich=rk>=0,ore=rich?ORES[rk]:vein?null:rollOre(r),n=rich?BAL.oreVein.units:1;
 let v=blockGold(r)*(ore?ore[1]*n:vein?VEIN_GOLD:1);
 S.bag.v+=v;S.bag.n+=n;S.blocks++;if(vein)S.veins++;if(rich)S.rich++;
 const key=ore?ore[0]:vein?"Pedra dura":"Pedra";S.bag.o[key]=(S.bag.o[key]||0)+n;S.bag.ov[key]=(S.bag.ov[key]||0)+v;
 if(ore){S.oc+=n;if(!S.od.includes(ore[0])){S.od.push(ore[0]);say(__("Novo minério: {0}",__(ore[0])))}}
 dug.add(c+","+r);
 const chk=chestAt(c,r);if(chk)chestFound(r,chk-1);   // baú: o prêmio é sorteado e pago agora; a animação de abertura roda assim que não houver outra janela aberta
 ctProg("blk",null,1,r);if(ore)ctProg("ore",ore[0],n,r);
 return{v,ore,rich,n};
}

// ===== 3-mundo/03-mineracao.js — Movimento, golpes, picareta ampla (dois lados), combo e escavação automática =====
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
function move(d){if(modal)return;setDir(d);const[a,b]=tgt();if(isDug(a,b)){S.prog=0;step(d==="down")}}   // descer por buraco já cavado é de graça
function step(free){
 const[tc]=tgt();
 if(S.dir==="left"||S.dir==="right")S.mc=tc;
 else if(S.dir==="up")S.depth--;
 else S.depth++;
 S.depth=clamp(S.depth,0,FINAL_DEPTH);
 if(S.depth>S.runMax)S.runMax=S.depth;
 if(S.depth>S.best){S.best=S.depth;if(S.best%50===0){say(__("Novo recorde: {0} m",S.best));gainXp(25);sfx(1200,.3,"sine")}}
 const L=layerOf(S.depth);
 if(L>layerSeen){layerSeen=L;cmbBanner=1;cmbBannerT=L>=BIO.length-1?__("CORAÇÃO DO ABISMO"):__("CAMADA: {0}",__(BIO[L][0]).toUpperCase());sfx(330,.4,"triangle");sfx(494,.5,"triangle");
  if(S.depth>=FINAL_DEPTH){say(__("A Rocha-mãe é inquebrável: você chegou ao fundo!"));reachBottom()}}
 if(S.dir==="up"){jetT=JET_FLAME;sfx(140+Math.random()*30,.07,"sawtooth");if(S.depth>=0)spend(stepCost(Math.max(0,S.depth))*jetMult())}   // subir: mochila a jato, gasta o passo inteiro
 else if(S.depth>0&&!free)spend(stepCost(Math.max(0,S.depth-1))*.5);   // descer ou andar de lado: metade
}
// Picareta ampla (4 níveis, item de meio/fim de jogo): cada nível quebra +1 bloco para os dois lados do alvo, de graça (sem gastar energia).
function extra(tc,tr){
 const n=S.lv.wide;if(!n)return;
 const vert=S.dir==="down"||S.dir==="up";let lavaE=0;
 for(let k=1;k<=n;k++)for(const sg of[-1,1]){
  const c=vert?tc+sg*k:tc,r=vert?tr:tr+sg*k;if(!canBreak(c,r))continue;
  const o=collect(c,r),p=blockXY(c,r);if(lava(c,r))lavaE+=lavaDmg(r)*BAL.lava.wideMult;
  for(let i=0;i<3;i++)parts.push({x:p.x,y:p.y+T/2,vx:(Math.random()-.5)*180,vy:-Math.random()*170,l:.5,c:o.ore?o.ore[2]:blockColor(r,c,hash(r,i)*8)});
  if(o.ore&&ORES.indexOf(o.ore)>=2)texts.push({x:p.x,y:p.y-T*.2,t:0,s:o.ore[0],c:o.ore[2]});
 }
 if(lavaE>0){const p=blockXY(tc,tr);texts.push({x:p.x,y:p.y-T*1.1,t:0,s:__("Lava! -{0} de energia",Math.round(lavaE)),c:"#ff5a1f",big:1});spend(lavaE)}
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
function breakPrimary(tc,tr,auto){
 if(!auto){cmb=cmbT>0?cmb+1:1;cmbT=1.8;onCombo()}   // só o golpe manual conta para o combo
 const{v,ore,rich,n}=collect(tc,tr),p=blockXY(tc,tr);
 gainXp(1+tr/25);if(ore)gainXp((4+ORES.indexOf(ore)*3)*n);
 breakSfx(tr,blockKind(tc,tr,ore),ore?ORES.indexOf(ore):0);   // som pelo tipo de bloco (terra, pedra, minério, lava)
 if(rich){sfx(1040+ORES.indexOf(ore)*90,.2,"triangle");sfx(1560+ORES.indexOf(ore)*90,.3,"sine")}
 texts.push({x:p.x+(Math.random()-.5)*30,y:p.y-T*.3,t:0,s:(ore?ore[0]+(rich?" x"+n:"")+" +":"+")+fmt(v),c:ore?ore[2]:"#ffd45c",big:ore?1:0});
 for(let i=0;i<(rich?26:10);i++)parts.push({x:p.x,y:p.y+T/2,vx:(Math.random()-.5)*240,vy:-Math.random()*220,l:.7,c:ore?ore[2]:"#ffd45c"});
 for(let i=0;i<6;i++)parts.push({x:p.x+(Math.random()-.5)*T*.8,y:p.y+Math.random()*T,vx:(Math.random()-.5)*110,vy:-30-Math.random()*90,l:.6,c:blockColor(tr,tc,hash(tr,i)*8)});
 extra(tc,tr);
 if(Math.random()<.02){const g=maxEn()*.06;S.en=Math.min(maxEn(),S.en+g);texts.push({x:p.x,y:p.y-T*.7,t:0,s:__("+Energia"),c:"#6ff0ff",big:1});sfx(1320,.15,"sine")}
 if(lava(tc,tr)){const l=lavaDmg(tr);texts.push({x:p.x,y:p.y-T*.9,t:0,s:__("Lava! -{0} de energia",Math.round(l)),c:"#ff5a1f",big:1});spend(l)}
 spend(digCost(tr)*(auto?AUTO_ENERGY:1));
}
function hit(dmg,crit,auto){
 const[a,b]=tgt();
 if(isDug(a,b))return;
 if(!canBreak(a,b)){S.prog=0;if(isVein(a,b)&&!auto){hitSfx("hard",b);if(toastT<=0)say(__("Pedra dura: só quebra com dinamite"))}return}
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
  breakPrimary(tc,tr,auto);if(S.deaths!==d0)return;
  step();if(S.deaths!==d0)return;
  const[a2,b2]=tgt();if(isDug(a2,b2)||!canBreak(a2,b2)){S.prog=0;break}
 }
}
function clickDig(){if(modal)return;if(atSurface()){if(nearFurnace()){furUse();return}if(nearChest()){chestUse();return}if(nearBoard()){boardUse();return}if(nearSlot()){slotUse();return}}const c=Math.random()<critCh();hit(clickPow()*(c?CRIT_MULT:1),c)}

// ===== 4-interface/01-painel.js — Construção do painel (build) e atualização da interface (refresh), Renascer e apagar progresso =====
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const upBtn=(id,fn)=>{const b=mk("button","up",'<span class="n"></span><span class="d"></span><span class="c"></span>');b.id=id;b.onclick=fn;return b};
const GROUPS=[N_("Picareta"),N_("Energia"),N_("Escavação automática"),N_("Sorte e experiência"),N_("Habilidades"),N_("Utilidades"),N_("Fornalha")];
function build(){
 $("qty").innerHTML="";
 [[1,"x1"],[10,"x10"],[100,"x100"],[0,__("Máx")]].forEach(([v,t])=>{const b=mk("button",qty===v?"on":"",t);b.onclick=()=>{qty=v;build()};$("qty").appendChild(b)});
 const box=$("ups");box.innerHTML="";
 {const nx=mk("div","ph");nx.id="nextul";box.appendChild(nx)}   // dica: o que se libera a seguir (liberação gradual)
 for(const g of GROUPS){
  {const h=mk("h2",null,__(g));h.dataset.g=g;box.appendChild(h)}
  if(g==="Fornalha"){const m=mk("div","ph");m.id="furmsg";m.dataset.g=g;box.appendChild(m)}
  if(g==="Picareta"){const t=upBtn("u-tier",buyTier);t.classList.add("tier");box.appendChild(t)}
  for(const k in UPS)if(UPS[k].g===g)box.appendChild(upBtn("u-"+k,()=>buy(k)));
 }
 const sh=$("shop");sh.innerHTML="";
 $("shopqty").innerHTML="";
 [[1,"x1"],[10,"x10"],[0,__("Máx")]].forEach(([v,t])=>{const b=mk("button",qty===v?"on":"",t);b.onclick=()=>{qty=v;build()};$("shopqty").appendChild(b)});
 sh.appendChild(mk("h2",null,__("Consumíveis")));
 for(const k in ITEMS)if(!ITEMS[k].noShop)sh.appendChild(upBtn("i-"+k,()=>buyItem(k)));
 const sk=$("sks");sk.innerHTML="";
 for(const k in SK)sk.appendChild(upBtn("s-"+k,()=>{const l=S.sk[k];if(S.runs>0&&l<SK[k][2]&&S.pts>=l+1){S.pts-=l+1;S.sk[k]++;sfx(700,.12,"triangle");refresh()}}));
 refresh();
}
// Cor discreta por progresso da melhoria (igual para todas): 0 = sem cor · 1..4 = faixas de 25% · 5 = máximo
const lvTier=(l,mx)=>l<=0?0:l>=mx?5:1+Math.min(3,Math.floor(l/mx*4));
function setTxt(id,n,d,c,dis,tier){const b=$(id);if(!b)return;if(tier!=null)b.dataset.t=tier;b.querySelector(".n").textContent=n;b.querySelector(".d").textContent=d;b.querySelector(".c").textContent=c;b.disabled=!!dis}
function refresh(){
 const surf=atSurface(),shop=nearBench(),mE=maxEn();
 $("gold").textContent=fmt(S.gold);
 $("depth").textContent=fmt(S.depth)+" m";$("best").textContent=fmt(S.best);$("depthbox").title=__("Recorde: {0} m",fmt(S.best));
 const er=clamp(S.en/mE,0,1);$("enfill").style.width=(er*100)+"%";$("ent").textContent=Math.ceil(S.en)+" / "+mE;$("enbox").classList.toggle("low",er<.25);
 barUI();
 refreshBagPop();
 $("lv").textContent=S.lvl;const xpGoal=xpNeed(S.lvl),xr=clamp(S.xp/xpGoal,0,1);$("xpt").textContent=fmt(S.xp)+" / "+fmt(xpGoal)+" XP";$("xpi").style.width=(xr*100)+"%";$("xpbar").style.setProperty("--xp-brightness",1+xr*.65);$("xpbar").style.setProperty("--xp-glow",(4+xr*18)+"px");$("xpbar").classList.toggle("xp-near",xr>=.8);$("xpbar").setAttribute("aria-valuenow",Math.round(xr*100));
 $("pts").textContent=S.pts;
 $("layer").textContent=toastT>0?toast:(surf?__("Superfície · melhorias liberadas · {0}",WX[wx.cur].n):layerName(S.depth)+(S.depth>=FINAL_DEPTH?" · "+__("INQUEBRÁVEL"):""))+(ev>0?"  "+(evT?__("Minérios x3"):__("Ouro x3"))+" "+Math.ceil(ev)+"s":"");
 $("layer").title=$("layer").textContent;
 $("surfmsg").textContent=!surf?__("Melhorias só na superfície. Suba (ou use o teleporte) para comprar."):shop?__("Na mesa de trabalho: você pode melhorar o equipamento. Venda os itens no baú (clique nele)."):__("Vá até a mesa de trabalho (à esquerda do buraco) para comprar melhorias.");
 $("surfmsg").classList.toggle("warn",!shop);
 const nshop=nearShop();$("shopmsg").textContent=!surf?__("A loja fica na superfície. Suba (ou use o teleporte) para comprar."):nshop?__("Na loja: compre dinamite e comida de energia. Os itens de energia ficam na barra, ao lado das habilidades (clique para usar)."):__("Vá até a loja (à direita do baú) para comprar.");
 $("shopmsg").classList.toggle("warn",!nshop);
 for(const k in ITEMS){if(ITEMS[k].noShop)continue;const c=itemCost(k),mx=have(k)>=99;setTxt("i-"+k,__("{0} · você tem {1}",ITEMS[k].n,have(k)),ITEMS[k].d+(ITEMS[k].en?"":" "+__("(preço sobe a cada camada alcançada)")),mx?__("MÁX"):fmt(c),mx||!nshop||S.gold<c)}
 if($("furmsg")){const f=S.fur;$("furmsg").textContent=f.n>0?__("Fornalha: {0} minérios na fila · pronta em {1}. Pode ir cavar: ela vende sozinha.",f.n,fmtT(furEta())):__("A fornalha fica à esquerda do buraco. Fique ao lado dela e clique nela para pôr os minérios da mochila: ela refina com o tempo e vende sozinha (+{0}% de ouro). Pedra comum continua indo para o baú.",Math.round(BAL.furnace.bonus*100))}
 $("skmsg").textContent=S.runs<1?__("Os poderes só podem ser comprados depois de Renascer pela primeira vez. Os fragmentos vêm do Renascer e, às vezes, dos baús raros do subsolo."):__("Fragmentos disponíveis: {0} (vêm do Renascer e dos baús raros).",S.pts);
 $("b-snd").textContent=mute?__("Som: desligado"):__("Som: ligado");
 // picareta (material)
 if(S.tier>=TIERS.length-1)setTxt("u-tier",__("Picareta de {0}",__(TIERS[S.tier])),__("Melhor picareta do jogo (camada {0})",TIERS.length),__("MÁX"),true,5);
 else setTxt("u-tier",__("Nova picareta: {0}",__(TIERS[S.tier+1])),__("Dano x{0} (atual: {1}). Recomendada para a camada {2}",ndec(BAL.tier.dmgMult),__(TIERS[S.tier]),__(BIO[S.tier+1][0])),fmt(tierCost()),!shop||S.gold<tierCost(),lvTier(S.tier,TIERS.length-1));
 for(const k in UPS){const l=S.lv[k],mx=l>=UPS[k].max,c=upCost(k,l);setTxt("u-"+k,__("{0} · nv {1}/{2}",UPS[k].n,l,UPS[k].max),UPS[k].d(l),mx?__("MÁX"):fmt(c),mx||!shop||S.gold<c,lvTier(l,UPS[k].max))}
 {const vis={};   // liberação gradual: esconde o que ainda não foi liberado (e grupos que ficaram vazios)
  for(const k in UPS){const on=isUnl("ups",k),b=$("u-"+k);if(b){b.classList.toggle("lock",!on);if(!on)b.disabled=true}if(on)vis[UPS[k].g]=1}
  $("ups").querySelectorAll("[data-g]").forEach(e=>e.classList.toggle("lock",!(e.dataset.g==="Picareta"||vis[e.dataset.g])));
  for(const k in ITEMS){if(ITEMS[k].noShop)continue;const on=isUnl("items",k),b=$("i-"+k);if(b){b.classList.toggle("lock",!on);if(!on)b.disabled=true}}
  const nx=$("nextul");if(nx){const tx=nextUnlockText();nx.textContent=tx;nx.classList.toggle("lock",!tx)}}
 for(const k in SK){const l=S.sk[k],mx=l>=SK[k][2];setTxt("s-"+k,__("{0} · nv {1}",__(SK[k][0]),l),__(SK[k][1]),mx?__("MÁX"):__("{0} frag.",l+1),mx||S.pts<l+1||S.runs<1)}
 renderStats();clockUpdate();
 const g=prestGain();$("prest").disabled=(g<1&&!armed)||!surf;
 $("prestd").textContent=g<1?__("Chegue a 100 m nesta vida para ganhar fragmentos. Reinicia ouro, picareta e melhorias; mantém poderes, nível e conquistas"):__("Reinicia ouro, picareta e melhorias e ganha {0} fragmentos (1 por camada de 100 m alcançada nesta vida, +5 por chegar ao fundo)",g);
 $("prestc").textContent=armed?__("Confirmar?"):(g>0?__("+{0} fragmentos",g):"");
 const t=document.querySelectorAll(".tabs button");
 if(t.length){t[0].classList.toggle("has",surf&&!!document.querySelector("#ups .up:not(:disabled)")&&(S.tab||0)!==0);t[2].classList.toggle("has",S.runs>0&&Object.keys(SK).some(k=>S.sk[k]<SK[k][2]&&S.pts>=S.sk[k]+1)&&(S.tab||0)!==2)}   // ponto na aba Poder só se dá para comprar algum poder
}
// Estatísticas e conquistas (aba Poderes): seções com rótulo à esquerda e valor à direita; só redesenha se algo mudou.
let statsHtml="";
function renderStats(){
 if((S.tab||0)!==2)return;
 const row=(l,v)=>"<dt>"+l+"</dt><dd>"+v+"</dd>",sec=(t,r)=>"<h3>"+t+"</h3><dl class='sg'>"+r.join("")+"</dl>",pct=x=>Math.round(x*100)+"%";
 const st=sec(__("Escavação"),[row(__("Dano por golpe"),fmt(clickPow())),row(__("Dano automático"),fmt(autoDps())+"/s"),row(__("Chance de crítico"),pct(critCh())),row(__("Velocidade"),"+"+Math.round((attackSpeedMult()-1)*100)+"%")])
  +sec(__("Energia"),[row(__("Por bloco (aqui)"),digCost(S.depth).toFixed(1)),row(__("Por bloco (automático)"),(digCost(S.depth)*AUTO_ENERGY).toFixed(1)),row(__("Subir 1 m com o jato"),(stepCost(S.depth)*jetMult()).toFixed(2)),row(__("Dano da lava (aqui)"),S.depth>=BAL.lava.from?Math.round(lavaDmg(S.depth)):__("sem lava"))])
  +sec(__("Nesta profundidade · {0} m",fmt(S.depth)),[row(__("Ouro por bloco"),fmt(blockGold(S.depth))),row(__("Dureza"),fmt(hardness(S.depth))),row(__("Chance de minério"),pct(oreChance())),row(__("Bônus de XP"),"+"+Math.round((xpGainMult()-1)*100)+"%")])
  +sec(__("Progresso"),[row(__("Profundidade máxima"),fmt(S.best)+" m"),row(__("Ouro total"),fmt(S.total)),row(__("Blocos quebrados"),fmt(S.blocks)),row(__("Minérios coletados"),fmt(S.oc)),row(__("Catálogo de minérios"),S.od.length+"/"+ORES.length),row(__("Renascimentos"),S.runs),row(__("Fragmentos"),S.pts),row(__("Estação do ano"),SEASONS[SEA.idx].n)])
  +sec(__("Uso"),[row(__("Vendas no baú"),S.sold),row(__("Vezes sem energia"),S.deaths),row(__("Dinamites usadas"),S.bombs),row(__("Itens comidos"),S.eaten),row(__("Teleportes"),S.tps),row(__("Pedras duras quebradas"),S.veins),row(__("Veios de minério quebrados"),S.rich),row(__("Vezes na cama"),S.sleeps),row(__("Minérios refinados"),fmt(S.refined))])
  +sec(__("Baús"),[row(__("Baús abertos"),S.chests)].concat(BAL.chest.tiers.map((t,i)=>row(__(t.n),"<span style='color:"+t.c+"'>"+S.chT[i]+"</span>")),[row(__("Ouro de baús"),fmt(S.chGold)),row(__("Fragmentos de baús"),S.chFr),row(__("Bônus de melhoria"),S.chPk),row(__("Poções de teleporte usadas"),S.ptpUsed)]));
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
 const keep={runs:S.runs+1,best:S.best,ach:S.ach,oc:S.oc,total:S.total,debug:S.debug,sk:S.sk,pts:S.pts+prestGain(),od:S.od,xp:S.xp,lvl:S.lvl,lvp:S.lvp,pk:S.pk,vol:S.vol,deaths:S.deaths,sold:S.sold,play:S.play,blocks:S.blocks,tab:S.tab,items:S.items,bombs:S.bombs,eaten:S.eaten,tps:S.tps,veins:S.veins,rich:S.rich,sleeps:S.sleeps,refined:S.refined,ctDone:S.ctDone,spins:S.spins,chests:S.chests,chTop:S.chTop,chT:S.chT,chGold:S.chGold,chFr:S.chFr,chPk:S.chPk,ptpUsed:S.ptpUsed,slotNet:S.slotNet,sea:S.sea};
 const h=S.sk.her,ini=S.sk.ini,clk=S.lv.clock;S=Object.assign(fresh(),keep);S.lv.clock=clk;   // o relógio (compra única) e a estação do ano não se perdem ao renascer
 S.seed=SEED=newSeed();chQ.length=0;carrotC=null;dug=new Set();mX=mY=camX=camY=0;layerSeen=0;
 S.tier=Math.min(ini,TIERS.length-1);S.gold=S.debug?Infinity:400*h*h;S.en=maxEn();build();save();say(__("Renascido! Fragmentos: {0}",S.pts));
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
 $("qk-map").onclick=()=>{mapOn=!mapOn;mapZ=1};
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
function sleepSave(){S.sleeps++;save();if((S.tab||0)!==3)setTab(3);say(__("Jogo salvo na cama"));sfx(440,.15,"sine");setTimeout(()=>sfx(660,.2,"sine"),120)}

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
const BAR=[[N_("Dinamite"),"E",null,"dyn"],[N_("Fúria do Minerador"),"1",null,"fury"],[N_("Escavação Frenética"),"2",null,"frenzy"],[N_("Teleporte"),"Q",null,"tele"],[N_("Cenourinha"),"","cen","cen"],[N_("Sopa de cogumelo"),"","sop","sop"],[N_("Poção de energia"),"","poc","poc"],[N_("Poção de teleporte"),"","ptp","ptp"]];
function slotTitle(i){const s=BAR[i];
 if(s[2]){const it=ITEMS[s[2]];return it.tp?__("{0} — {1} (clique para usar). Você tem {2}",it.n,it.d,have(s[2])):__("{0} — {1} (clique para usar; compre na loja). Você tem {2}",it.n,it.d,have(s[2]))}
 const nm=__(s[0]);
 return i===0?__("{0} — {1}: explode uma área de raio {2} e quebra veios de pedra dura (consome 1, compre na loja). Você tem {3}. Botão direito ou R troca o tipo",nm,ITEMS[dynPick()].n,fmtN(BAL.dyn[dynPick()].r),have(dynPick()))
  :i===3?__("{0} — leva ao baú sem gastar energia; na superfície, volta ao ponto de onde saiu (compre em Melhorias)",nm)
  :__("{0} — {1} (desbloqueia aos {2} m)",nm,skillDescription(i-1),SKL[i-1][4])}
function buildBar(){const bar=$("bar");bar.innerHTML="";const hot=mk("div","hot");bar.appendChild(hot);
 BAR.forEach((s,i)=>{const b=mk("button","slot",(i===0?dynSprite(dynPick()):sprite(s[3]))+(s[1]?"<span class='k'>"+s[1]+"</span>":"")+"<span class='qn'></span><i class='cd'></i>");
  b.title=slotTitle(i);
  if(i===0)b.oncontextmenu=e=>{e.preventDefault();dynNext()};
  b.onclick=()=>{if(i===0)boom();else if(i===3)teleport();else if(s[2])useItem(s[2]);else useSk(i-1)};
  if(i===0){const w=mk("span","dwrap");w.appendChild(b);const dp=mk("div","dpick");dp.id="dpick";w.appendChild(dp);hot.appendChild(w)}else hot.appendChild(b)})}
// Seletor de dinamite: pilha de casinhas acima do ícone (aparece com 2 ou mais tipos); clique escolhe qual a tecla E usa
function dpickUI(){const dp=$("dpick");if(!dp)return;const cur=dynPick(),own=DYN_IDS.filter(k=>have(k)>0||S.debug),sig=own.map(k=>k+have(k)).join()+cur;if(dp.dataset.s===sig)return;dp.dataset.s=sig;dp.innerHTML="";if(own.length<2)return;
 for(const k of own){const c=mk("button","dchip"+(k===cur?" on":""),dynSprite(k)+"<b>"+(S.debug?"∞":have(k))+"</b>");c.title=__("{0} (raio {1})",ITEMS[k].n,fmtN(BAL.dyn[k].r));c.onclick=e=>{e.stopPropagation();S.dsel=k;say(__("Dinamite escolhida: {0}",ITEMS[k].n));refresh()};dp.appendChild(c)}}
function barUI(){const slots=document.querySelectorAll(".slot");BAR.forEach((s,i)=>{const b=slots[i];if(!b)return;
 let lock=false,empty=false,active=0,frac=0,txt="";   // frac = parte da recarga que falta (véu branco que desce, como no Minecraft)
 if(i===0){const dk=dynPick();empty=have(dk)<1&&!S.debug;frac=dynCD>0?dynCD/dynMax():0;txt=S.debug?"∞":String(have(dk));
  if(b.dataset.dk!==dk){b.dataset.dk=dk;b.querySelector("svg").outerHTML=dynSprite(dk)}}
 else if(s[2]){empty=have(s[2])<1&&!S.debug;txt=S.debug?"∞":String(have(s[2]))}
 else if(i===3){lock=S.lv.tele<1;frac=tpCD>0?tpCD/teleCD():0;if(tpCD>0)txt=Math.ceil(tpCD)+"s"}
 else{const k=SKL[i-1];lock=S.best<k[4];active=skT[i-1];frac=!lock&&active<=0&&skCD[i-1]>0?skCD[i-1]/k[3]:0;txt=lock?k[4]+"m":active>0?Math.ceil(active)+"s":skCD[i-1]>0?Math.ceil(skCD[i-1])+"s":""}
 const cl="slot"+(lock?" lock":"")+(empty?" empty":"")+(active>0?" active":"");if(b.className!==cl)b.className=cl;
 b.querySelector(".cd").style.height=Math.round(clamp(frac,0,1)*38)+"px";
 const q=b.querySelector(".qn");if(q.textContent!==txt){q.textContent=txt}
 const t=slotTitle(i);if(b.title!==t)b.title=t});dpickUI()}

// ===== 4-interface/04-entrada.js — Mouse, teclado, toque e botões de celular =====
cv.addEventListener("pointerdown",e=>{e.preventDefault();
 if(mapOn){mapOn=false;return}   // mapa aberto: tocar na tela fecha (no celular não há mais botão de Mapa na barra)
 if(atSurface()&&!modal){for(const[hit,use]of[[boardHit,boardUse],[slotHit,slotUse]])if(hit(e.offsetX,e.offsetY)&&use())return}
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
  if(modal==="title"){if(e.target.closest&&e.target.closest(".langpick"))return;e.preventDefault();if(!e.repeat&&(e.code==="Space"||e.code==="Enter"))startGame();return}
  if(modal==="death"){e.preventDefault();if(!e.repeat&&performance.now()>deathLock&&(e.code==="Space"||e.code==="Enter"||e.code==="Escape"))closeModal();return}
  if(modal==="lv"){   // escolha de melhoria ao subir de nível: WASD/setas movem, Espaço (ou Enter) confirma
   const d={KeyA:-1,ArrowLeft:-1,KeyW:-1,ArrowUp:-1,KeyD:1,ArrowRight:1,KeyS:1,ArrowDown:1}[e.code];
   if(d){e.preventDefault();if(!e.repeat)lvMove(d);return}
   if(e.code==="Space"||e.code==="Enter"){e.preventDefault();if(!e.repeat)lvConfirm();return}
  }
  if(e.code==="Escape"&&modal!=="lv")closeModal();return}
 if(e.key==="Shift")shiftOn=true;musOn=true;
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
 if(e.code==="KeyQ"){teleport();return}
 if(e.code==="Escape"){if(mapOn)mapOn=false;else openPause();return}
 if(e.code==="KeyP"){openPause();return}
 if(e.code==="KeyM"){mapOn=!mapOn;mapZ=1;return}
 if(e.code==="KeyN"){mute=!mute;refresh();return}
 if(m){e.preventDefault();if(!e.repeat){pressDir(e.code,m);move(held);lastMv=performance.now()}return}
 if(e.code==="Space"){e.preventDefault();if(!e.repeat){holdS=true;clickDig();lastH=performance.now()}}});
addEventListener("keyup",e=>{if(e.code==="Space"){holdS=false;e.preventDefault()}releaseDir(e.code);if(e.key==="Shift")shiftOn=false});
addEventListener("blur",()=>{holdS=holdM=false;dirKeys.length=0;setHeld();shiftOn=false});
cv.addEventListener("wheel",e=>{e.preventDefault();if(mapOn){mapZ=clamp(mapZ*(e.deltaY<0?1.25:.8),1,12);return}setZoom(worldZoom*(e.deltaY<0?1.12:1/1.12))},{passive:false});
if(matchMedia("(pointer:coarse)").matches||innerWidth<760){
 // Controles de celular: direcionais à esquerda, Minerar à direita (Mapa e Pausa ficam só no painel e no teclado).
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
 const mine=btn(__("Minerar"),()=>{holdS=true;clickDig();lastH=performance.now()},()=>{holdS=false},104,15);
 mine.style.height="118px";mine.style.letterSpacing=".03em";mine.style.fontWeight="700";
 bar.appendChild(pad);bar.appendChild(mine);onLang(()=>{mine.textContent=__("Minerar")});
 addEventListener("blur",()=>ups.forEach(f=>f()));document.addEventListener("visibilitychange",()=>{if(document.hidden)ups.forEach(f=>f())});
 bar.oncontextmenu=e=>e.preventDefault();document.body.style.overscrollBehavior="none";document.body.appendChild(bar);document.body.style.paddingBottom="150px"}

// ===== 4-interface/05-pausa.js — Menu de pausa (Esc ou P): congela o jogo e oferece continuar, salvar, som, mapa e voltar ao menu =====
function openPause(){
 if(modal)return;
 const b=openModal("pause");b.style.maxWidth="320px";paintPause();
 $("pm-go").focus();
}
function paintPause(){
 const b=$("bx"),where=atSurface()?__("Superfície"):fmt(S.depth)+" m · "+layerName(S.depth);
 b.innerHTML="<div class='pm'><h2>"+__("Pausa")+"</h2><div class='sub'>"+where+" · "+__("nível {0}",S.lvl)+"</div>"
  +"<button id='pm-go' class='main'>"+__("Continuar")+"</button><button id='pm-sv'>"+__("Salvar jogo")+"</button><button id='pm-snd'></button><button id='pm-map'>"+__("Mapa")+"</button><div data-langmenu></div><button id='pm-menu'>"+__("Menu inicial")+"</button>"
  +"</div>";
 const snd=()=>{$("pm-snd").textContent=mute?__("Som: desligado"):__("Som: ligado")};snd();
 langMenus();
 $("pm-go").onclick=closeModal;
 $("pm-sv").onclick=()=>{save();say(__("Jogo salvo"));$("pm-sv").textContent=__("Jogo salvo ✓")};
 $("pm-snd").onclick=()=>{mute=!mute;snd();refresh()};
 $("pm-map").onclick=()=>{closeModal();mapOn=true;mapZ=1};
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
 const R=6.3,mx=11-sx*R,my=11-sy*R;
 disc(11+sx*R,11+sy*R,2.3,"#ffd45c","#fff3a0");   // sol
 disc(mx,my,2.1,"#e6ebf5");g.fillStyle="#a9b2c8";g.fillRect(Math.round(mx+.2),Math.round(my-1),1,1);g.fillRect(Math.round(mx-1),Math.round(my+.3),1,1);   // lua com crateras
}
function clockUpdate(){
 const own=S.lv.clock>0,box=$("clockbox");if(box.hidden===own)box.hidden=!own;
 if(!own)return;
 const t=clockHour(),txt=String(t.h).padStart(2,"0")+":"+String(t.m).padStart(2,"0"),key=txt+"|"+Math.round(dayT*2000);
 if(key===clkLast)return;clkLast=key;
 clockDraw();box.title=__("{0} · {1} (o sol aparece no alto ao meio-dia e a lua à meia-noite)",clockPeriod(),txt);
}

// ===== 5-desenho/00-pixel.js — Direção de arte: sprites em pixel art, tiles de apoio (cavidade, rocha-base, pedra dura, veio de minério) =====
// Regras do estilo (as mesmas dos blocos): grade de pixels grossos, nada de degradê liso; luz clara em cima/à esquerda,
// sombra embaixo/à direita; cores com o mesmo matiz e pequenas variações; detalhes de 1 pixel (brilhos e grãos).
const sprCache={};
const pu=()=>Math.max(2,Math.round(T/12));            // tamanho de um pixel de sprite na tela (inteiro, para não tremer)
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
function pixHills(sky,par,amp,col,hi,seed,ps){for(let x=0;x<W+ps;x+=ps){const wx=x+camX*T*par+seed,v=(Math.sin(wx*.006)*.5+Math.sin(wx*.0145+seed)*.3+Math.sin(wx*.031+1.7)*.2)*.5+.5,h=Math.max(ps,Math.round(v*amp/ps)*ps);ctx.fillStyle=col;ctx.fillRect(x,sky-h,ps,h);ctx.fillStyle=hi;ctx.fillRect(x,sky-h,ps,ps)}}

// ===== 5-desenho/01-cores-blocos.js — Cor de cada bloco por camada =====
function blockColor(d,c,v){const B=BIO[layerOf(d)%BIO.length];return"hsl("+B[1]+","+B[2]+"%,"+(B[3]+(v||0)+((c+d)%2?1.5:0))+"%)"}

// ===== 5-desenho/02-ceu-nuvens.js — Céu em degradê, sol e colinas em pixel art (cores da estação do ano), nuvens em duas camadas com parallax (sprites em 00-pixel.js) =====
// Cada nuvem: [posição inicial 0-1, altura 0-1, tamanho, velocidade, camada (0 = longe, 1 = perto), fase]
const CLOUDS=[[.05,.55,34,5,0,0],[.32,.3,40,6,0,1.3],[.6,.62,30,4.5,0,2.1],[.85,.25,38,5.5,0,3.4],[.15,.2,62,11,1,.7],[.5,.5,78,14,1,2.7],[.8,.15,56,12,1,4.1],[.98,.58,66,10,1,5.2]];
function drawSky(sky,t){
 if(sky<=0)return;
 ctx.imageSmoothingEnabled=false;
 const sg=ctx.createLinearGradient(0,sky-skyH(),0,sky);   // topo azul-vivo -> horizonte azul-claro (um degradê só, sem emendas)
 sg.addColorStop(0,"rgb(63,143,224)");sg.addColorStop(.65,"rgb(140,200,242)");sg.addColorStop(1,"rgb(207,233,250)");
 ctx.fillStyle=sg;ctx.fillRect(0,0,W,sky+1);
 if(sky<42)return;
 const scale=clamp(W/850,.5,1.1),ps=Math.max(3,Math.round(4*scale)),night=nightAmt();
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,sky);ctx.clip();
 skyTint(sky);skyStars(sky,t,ps);skyBody(sky,ps);skyShoot(sky,ps);
 const span=W+240*scale;let n=0;
 for(const[p,hh,s,v,ly,ph]of CLOUDS){
  const size=s*scale*(W<500?.8:1),par=ly?.18:.07,px=Math.max(2,Math.round(size/13)),sp=sprCloud(n++%3);
  const x=((p*span+t*v*scale-camX*T*par)%span+span)%span-120*scale,y=sky*(.12+hh*.6)+Math.sin(t*.25+ph)*3;
  ctx.globalAlpha=(ly?1:.62)*(1-night*.55);
  ctx.drawImage(sp.cv,1,1,sp.w,sp.h,Math.round(x/px)*px,Math.round(y/px)*px,sp.w*px,sp.h*px);
 }
 ctx.globalAlpha=1;
 sceneRanges(sky,ps,night);   // cordilheiras ao fundo, em 3 camadas (5-desenho/11-cenario.js)
 // colinas distantes (azul-acinzentado) e próximas (verde escuro), em degraus de pixel, com parallax
 pixHills(sky,.03,sky*.2,nightCol(SEA.fh,night),nightCol(SEA.fhh,night),40,ps);   // as colinas escurecem de noite pela própria cor
 pixHills(sky,.08,sky*.11,nightCol(SEA.nh,night),nightCol(SEA.nhh,night),300,ps);   // as cores das colinas e da grama vêm da estação do ano (2-sistemas/07-estacoes.js)
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
 const v=hash(r,c);ctx.save();ctx.translate(x,y);ctx.scale(ts,ts);
 if(r===0){ // primeira linha: inquebrável (grama por cima e pedras cinzentas por dentro)
  ctx.fillStyle="rgba(20,20,26,.35)";ctx.fillRect(0,0,tb+1,tb+1);ctx.fillStyle="#6a6e74";ctx.fillRect(3,tb-9,8,5);ctx.fillRect(tb-14,tb-14,9,6);
  ctx.fillStyle=SEA.g;ctx.fillRect(0,0,tb+1,5);ctx.fillStyle=SEA.h;ctx.fillRect(0,0,tb+1,2);
  for(let g=0;g<6;g++){const gx=hash(c+g*7,515)*(tb-2)+1,gh=2+hash(g,c+733)*3;ctx.fillRect(gx,-gh,2,gh+2)}
 }
 if(lava(c,r)){ctx.fillStyle="#ff5a1f";ctx.fillRect(0,0,tb+1,tb+1);ctx.globalAlpha=.16;ctx.fillRect(-tb/2,-tb/2,tb*2,tb*2);ctx.globalAlpha=1}
 if(r>0&&r%LAYER_HEIGHT===0){ctx.fillStyle="rgba(255,255,255,.1)";ctx.fillRect(0,0,tb+1,2)}
 if(isVein(c,r))drawVein(tb,c,r);
 else{const rk=oreVeinAt(c,r);if(rk>=0)drawRich(tb,c,r,rk);else if(chestAt(c,r))drawChestBlock(tb,c,r)}
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
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);
 if(atSurface())lbl(nearShop()?__("Loja: compre aqui"):__("Loja"),c,y-(s.h+3)*u-Math.sin(t*4)*2,nearShop()?"#6fe3a0":"#ffd45c");
}
function drawGateAndChest(t){
 // portão de madeira em volta do buraco: dois postes finos em pixel art e uma viga escura sobre a abertura
 const u=pu(),x=colX(0)-T/2,y=Math.round(rowY(0)),pl=sprPillar();
 ctx.fillStyle="#2b1a0d";ctx.fillRect(Math.round(x-u),y-Math.round(u*.6),Math.round(T+2*u),Math.round(u*1.4));
 ctx.fillStyle="#8a5a2b";ctx.fillRect(Math.round(x-u),y-Math.round(u*.6),Math.round(T+2*u),Math.max(1,Math.round(u*.4)));
 drawSpr(pl,x-pl.w*u/2+u,y,u);drawSpr(pl,x+T+pl.w*u/2-u,y,u);
 drawLandscape(t);   // horta, moinho, riacho com ponte e roda, fogueira, praia com farol e barco, bichinhos (13-paisagem.js)
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
function drawPlayer(){
 const now=performance.now(),mx=colX(mX),my=rowY(mY);
 const dx=S.mc-mX,dy=S.depth-mY,flying=jetT>0||dy<-.05||airborne(),falling=!flying&&dy>.05,walking=!flying&&!falling&&Math.abs(dx)>.05;
 const ph=now/(shiftOn?65:105),sw=Math.sin(ph),idle=Math.sin(now/280);
 const bob=flying?Math.sin(now/60)*1.3:walking?-Math.abs(sw)*3:idle*.9;
 const lean=flying?-.2:walking?.1:falling?-.04:0;                         // inclinação do corpo (em torno dos pés)
 const squash=1-Math.min(.07,swing*.07);                                    // agacha um pouco no golpe
 const cloth="#3b6fb5",clothD="#2c5590",skin="#e6b48a";
 ctx.save();ctx.translate(mx,my);ctx.scale(worldZoom,worldZoom);ctx.translate(-mx,-my);
 ctx.translate(mx,0);ctx.scale(S.dir==="left"?-1:1,1);ctx.translate(-mx,0);
 ctx.translate(mx,my);ctx.rotate(lean);ctx.scale(1,squash);ctx.translate(-mx,-my);
 // perna de trás, braço de trás
 const leg=(hx,a,col)=>{ctx.save();ctx.translate(hx,my-9+bob*.4);ctx.rotate(a);ctx.fillStyle=col;ctx.fillRect(-3,0,6,6);ctx.fillStyle="#1d1d1d";ctx.fillRect(-3,5,8,4);ctx.restore()};
 const la=flying?.32+Math.sin(now/85)*.12:falling?-.4:walking?sw*.85:idle*.03, lb=flying?.14+Math.sin(now/85+1.4)*.12:falling?.4:walking?-sw*.85:0;
 leg(mx-3,la,"#23252b");
 // mochila a jato (nas costas): tanque, bocal e chama
 ctx.fillStyle="#4a4f58";ctx.fillRect(mx-15,my-25+bob,7,14);ctx.fillStyle="#7d8591";ctx.fillRect(mx-15,my-25+bob,7,3);ctx.fillStyle="#c8452f";ctx.fillRect(mx-14,my-20+bob,5,3);
 ctx.fillStyle="#2b2e34";ctx.fillRect(mx-14,my-11+bob,5,3);
 if(jetT>0||flying){const fl=(jetT>0?10:2.5)+Math.random()*(jetT>0?12:3.5);ctx.fillStyle="#ffb43a";ctx.fillRect(mx-14,my-8+bob,5,fl);ctx.fillStyle="#fff3a0";ctx.fillRect(mx-13,my-8+bob,3,fl*.55);ctx.fillStyle="#ff5a1f";ctx.fillRect(mx-14,my-8+bob+fl,5,3)}
 // braço de trás (balança ao contrário do braço da picareta)
 ctx.save();ctx.translate(mx-6,my-21+bob);ctx.rotate(flying?-2.3:falling?-2.5:walking?-sw*.8+.2:.25+idle*.06);ctx.fillStyle=clothD;ctx.fillRect(-2,0,4,7);ctx.fillStyle=skin;ctx.fillRect(-2,6,4,3);ctx.restore();
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
 // braço da frente com a picareta: levanta ao voar/cair, balança ao andar, golpeia ao cavar
 const base=S.dir==="up"?-1.6:flying?-2.3:falling?-2.1:walking?-.9+sw*.55:-1.1+idle*.05;
 ctx.save();ctx.translate(mx+8,my-20+bob);ctx.rotate(base+swing*1.8);
 ctx.fillStyle="#8a5a2b";ctx.fillRect(0,-2,22,4);ctx.fillStyle=TCOL[S.tier%TCOL.length];ctx.fillRect(18,-9,5,18);ctx.fillStyle="rgba(255,255,255,.35)";ctx.fillRect(18,-9,2,18);
 if(swing>.5){ctx.fillStyle="#fff6b8";ctx.fillRect(22,-4,4,4)}
 ctx.fillStyle=cloth;ctx.fillRect(-2,-2,8,4);ctx.fillStyle=skin;ctx.fillRect(5,-2,4,4);ctx.restore();
 ctx.restore();
}

// ===== 5-desenho/04-combo-efeitos.js — Combo grande na tela, faixas de aviso, partículas, textos flutuantes e flashes =====
// Cores por nível do combo (de 100 para cima a cor gira pelo arco-íris)
const comboColor=n=>n>=100?"hsl("+Math.floor(performance.now()/5%360)+",100%,66%)":n>=50?"#ff6a2a":n>=25?"#ffa83a":n>=10?"#ffd45c":"#fff0b8";
const comboXY=()=>({x:clamp(colX(mX),70,W-70),y:Math.max(46,rowY(mY)-T*2.1)});   // segue o personagem, um pouco acima da cabeça
function comboTxt(s,x,y,size,col,lw,glow){   // texto com contorno grosso e brilho colorido
 ctx.font="700 "+Math.round(size)+"px "+FONT;ctx.lineJoin="round";ctx.lineWidth=lw;ctx.strokeStyle="#000";
 if(glow){ctx.shadowColor=col;ctx.shadowBlur=glow}
 ctx.strokeText(s,x,y);ctx.shadowBlur=0;ctx.fillStyle=col;ctx.fillText(s,x,y);
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
 for(const p of parts){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=520*dt;ctx.globalAlpha=clamp(p.l*1.6,0,1);ctx.fillStyle=p.c;const s=p.big?6:4;ctx.fillRect(p.x-s/2,p.y-s/2,s,s)}
 parts=parts.filter(p=>p.l>0);if(parts.length>500)parts.splice(0,parts.length-500);ctx.globalAlpha=1;
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
 const hz=rowY(0),zone=T*B.skyZone,ramp=Math.max(40,hz*.5);   // hz = linha do chão na tela
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
 if(S.depth>0&&er<.25){lowEnPulse=Math.max(0,lowEnPulse-dt);const a=(.25-er)*2.2*(.55+.45*Math.sin(performance.now()/160));const gr=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);gr.addColorStop(0,"rgba(255,0,0,0)");gr.addColorStop(1,"rgba(255,30,30,"+clamp(a,0,.6)+")");ctx.fillStyle=gr;ctx.fillRect(0,0,W,H)}
 if(flash>0){ctx.globalAlpha=clamp(flash,0,1)*.5;ctx.fillStyle=flashC;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;if(flashText){ctx.save();ctx.globalAlpha=clamp(flash*1.4,0,1);ctx.textAlign="center";ctx.font="900 40px "+FONT;ctx.lineWidth=7;ctx.strokeStyle="#000";ctx.strokeText(flashText,W/2,H*.4);ctx.fillStyle="#fff";ctx.fillText(flashText,W/2,H*.4);ctx.restore()}flash=Math.max(0,flash-dt*1.1)}
 chestOpen=Math.max(0,chestOpen-dt*1.4);
}

// ===== 5-desenho/05-mapa.js — Mapa (tecla M) com zoom e camadas =====
function drawMap(){
 const now=performance.now();
 if(!mapB||now-mapT>400){mapT=now;let d=1;const xs=[],ys=[];for(const k of dug){const i=k.indexOf(","),x=+k.slice(0,i),y=+k.slice(i+1);xs.push(x);ys.push(y);if(y>d)d=y}mapB={d,xs,ys}}
 const{d,xs,ys}=mapB,pad=36,sr=Math.max(S.depth,d)+3;
 const fit=Math.min((W-pad*2)/(COLS+2),(H-pad*2)/sr,14),sc=fit*mapZ,ox=mapZ>1?W/2-(S.mc+.5)*sc:W/2-.5*sc,oy=mapZ>1?H/2-(S.depth-.5)*sc:pad;
 ctx.fillStyle="rgba(0,0,0,.94)";ctx.fillRect(0,0,W,H);
 ctx.textAlign="left";ctx.font="600 11px "+FONT;
 for(let L=0;L*LAYER_HEIGHT<sr;L++){ctx.globalAlpha=.25;ctx.fillStyle=blockColor(L*LAYER_HEIGHT,0,0);ctx.fillRect(ox-(HALF+.5)*sc,oy+L*LAYER_HEIGHT*sc,COLS*sc,Math.min(LAYER_HEIGHT,sr-L*LAYER_HEIGHT)*sc);ctx.globalAlpha=1;if(sc*LAYER_HEIGHT>14){ctx.fillStyle="#9a9a9a";ctx.fillText(layerName(L*LAYER_HEIGHT),8,oy+L*LAYER_HEIGHT*sc+12)}}
 ctx.fillStyle="#ffe2a8";ctx.fillRect(ox-(HALF+.5)*sc,oy-2,COLS*sc,2);
 ctx.fillStyle="#ffd45c";ctx.fillRect(ox+(CHEST_C-.5)*sc,oy-Math.max(3,sc),Math.max(3,sc),Math.max(3,sc));
 for(const[c,col]of[[BED_C,"#4f77ff"],isUnl("build","slot")&&[SLOT_C,"#38c172"],isUnl("build","board")&&[BOARD_C,"#e8d7a8"]].filter(Boolean)){ctx.fillStyle=col;ctx.fillRect(ox+(c-.5)*sc,oy-Math.max(3,sc),Math.max(3,sc),Math.max(3,sc))}
 ctx.fillStyle="#b27a3a";ctx.fillRect(ox+(BENCH_C-.5)*sc,oy-Math.max(3,sc),Math.max(3,sc),Math.max(3,sc));
 if(isUnl("build","furnace")){ctx.fillStyle="#ff5a1f";ctx.fillRect(ox+(FURN_C-.5)*sc,oy-Math.max(3,sc),Math.max(3,sc),Math.max(3,sc));}
 ctx.fillStyle="#ff9a3a";ctx.fillRect(ox+(SHOP_C-.5)*sc,oy-Math.max(3,sc),Math.max(3,sc),Math.max(3,sc));
 ctx.fillStyle="#d9b06a";const cs=Math.max(1,sc);for(let i=0;i<xs.length;i++)ctx.fillRect(ox+xs[i]*sc-sc/2,oy+ys[i]*sc,cs,cs);
 const pr=Math.max(3,sc*.8)*(1+.06*Math.sin(now/700));ctx.beginPath();ctx.arc(ox+clamp(S.mc,-HALF,HALF)*sc,oy+(S.depth-.5)*sc,pr,0,7);ctx.fillStyle="#ff4d4d";ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle="#fff";ctx.stroke();   // jogador: ponto fixo, só respira de leve
 ctx.fillStyle="#ececec";ctx.font="600 14px "+FONT;
 if(W<600){   // celular: texto curto, abaixo do nível e do nome da camada, sem falar de mouse/Esc
  ctx.font="600 12px "+FONT;ctx.fillText(__("Mapa · {0} m · recorde {1} m",fmt(S.depth),fmt(S.best)),12,62);
  ctx.fillStyle="#9aa0a6";ctx.fillText(__("Toque na tela para fechar"),12,80);
 }else ctx.fillText(__("Mapa · profundidade {0} m · recorde {1} m · roda do mouse: zoom · M ou Esc fecham",fmt(S.depth),fmt(S.best)),12,22);
}

// ===== 5-desenho/06-quadro.js — Desenho de cada quadro: céu, blocos, alvo, personagem, efeitos e mapa =====
function updateDepthRuler(){
 const ruler=$("depthruler");ruler.classList.toggle("map-hidden",mapOn);if(mapOn)return;
 const layer=layerOf(S.depth),pos=S.depth>=FINAL_DEPTH?1:clamp((S.depth-layer*LAYER_HEIGHT)/LAYER_HEIGHT,0,1),css=(pos*100)+"%",color=BIO[layer][4];
 if(ruler.style.getPropertyValue("--depth-position")!==css)ruler.style.setProperty("--depth-position",css);
 if(ruler.style.getPropertyValue("--layer-color")!==color)ruler.style.setProperty("--layer-color",color);
}
function drawTarget(){
 const[tc,tr]=tgt();if(isDug(tc,tr)||tr<0)return;
 const x=Math.round(colX(tc)-T/2),cy=Math.round(rowY(tr)),ok=canBreak(tc,tr),pr=ok?Math.min(1,S.prog/hardness(tr)):0,u=Math.max(2,Math.round(T/14)),L=Math.round(T*.3);
 // mira em cantos (estilo pixel): sombra escura por baixo e cor por cima
 for(const[col,o]of[["rgba(0,0,0,.55)",1],[ok?"#ffb43a":"#9a9a9a",0]])for(const[ax,ay,dx,dy]of[[x,cy,1,1],[x+T,cy,-1,1],[x,cy+T,1,-1],[x+T,cy+T,-1,-1]]){
  ctx.fillStyle=col;const px=ax+(dx>0?0:-u)+o,py=ay+(dy>0?0:-u)+o;ctx.fillRect(px,py,dx>0?L:-L,u);ctx.fillRect(px,py,u,dy>0?L:-L)}
 if(isVein(tc,tr))lbl(__("Pedra dura: dinamite"),x+T/2,cy-8,"#ff9a3a");
 else{const rk=oreVeinAt(tc,tr);if(rk>=0)lbl(__("Veio de {0}: x{1}",__(ORES[rk][0]),BAL.oreVein.units),x+T/2,cy-8,ORES[rk][2])}
 if(pr>0){
  ctx.fillStyle="rgba(255,180,58,.16)";ctx.fillRect(x+1,cy+T-(T-2)*pr-1,T-2,(T-2)*pr);
  const bh=Math.max(5,u*2);ctx.fillStyle="rgba(0,0,0,.55)";ctx.fillRect(x,cy+T-bh-2,T,bh+2);   // barra de progresso em segmentos
  const seg=Math.max(2,Math.round(T/8)),fillW=Math.round(T*pr/seg)*seg;ctx.fillStyle="#ffcf70";ctx.fillRect(x+1,cy+T-bh-1,Math.max(0,fillW-2),bh);ctx.fillStyle="#fff0b8";ctx.fillRect(x+1,cy+T-bh-1,Math.max(0,fillW-2),Math.max(1,Math.round(bh/3)))
 }
}
function draw(dt){
 const t=performance.now()/1000;
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
 drawFireflies(t);   // vaga-lumes por cima da escuridão da noite (13-paisagem.js)
 updateDepthRuler();
 comboHud(dt);
 if(mapOn)drawMap();
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
 const u=Math.max(2,Math.round(T/14)),px=Math.round(colX(petX)),py=Math.round(rowY(petY)-T*.8+Math.sin(t*3.1)*T*.07);
 // brilho suave (soma de luz)
 const nt=surfNight(),gr=T*(.7+.18*S.lv.pet)*(1+nt*1.1),pulse=.85+.15*Math.sin(t*4.3),ga=(S.depth>0?.11:.03)+nt*BAL.night.pet;   // brilho discreto de dia (quase some na superfície) e forte à noite
 ctx.save();ctx.globalCompositeOperation="lighter";
 const g=ctx.createRadialGradient(px,py,0,px,py,gr);g.addColorStop(0,"rgba(255,214,120,"+(ga*pulse)+")");g.addColorStop(1,"rgba(255,180,60,0)");
 ctx.fillStyle=g;ctx.fillRect(px-gr,py-gr,gr*2,gr*2);ctx.restore();
 // corpo em pixel art: asas batendo, barriga laranja e núcleo claro
 const wing=Math.sin(t*34)>0?-u:0;
 ctx.fillStyle="rgba(200,235,255,.8)";ctx.fillRect(px-2*u,py-u+wing,u,u);ctx.fillRect(px+u,py-u+wing,u,u);
 ctx.fillStyle="#ff9a3a";ctx.fillRect(px-u,py-u,2*u,3*u);
 ctx.fillStyle="#ffd45c";ctx.fillRect(px-u,py+u,2*u,u);
 ctx.fillStyle=nt>.3?"#fffbd8":"#fff3a0";ctx.fillRect(px-u,py-u,u,u);
 if(Math.random()<dt*7)parts.push({x:px,y:py+2*u,vx:(Math.random()-.5)*18,vy:6,l:.45,c:"#ffd45c"});
}

// ===== 5-desenho/08-dia-noite.js — Ciclo de dia e noite (sol, lua, estrelas, estrela cadente e tons do céu) =====
// dayT: 0 = amanhecer · .25 = meio-dia · .5 = pôr do sol · .75 = meia-noite. Duração do ciclo: BAL.day.len.
// O céu é pintado só com degradês contínuos (um por camada de cor), sem faixas nem retângulos translúcidos sobrepostos,
// que deixavam linhas horizontais visíveis. O degradê é ancorado na linha do horizonte e rola junto com o chão.
let dayT=BAL.day.start;
const dayTick=dt=>{dayT=(dayT+dt/BAL.day.len)%1};
const sunElev=()=>Math.sin(dayT*Math.PI*2);                 // altura do sol: 1 = zênite, -1 = nadir
const nightAmt=()=>clamp((.18-sunElev())/.5,0,1);           // 0 = dia · 1 = noite fechada
const skyH=()=>Math.max(H*SURF,120);                        // altura do céu quando a câmera está na superfície
// Mistura uma cor "#rrggbb" com o azul-noite (usado nas colinas, que são desenhadas depois do tom do céu)
function nightCol(hex,n){const k=n*.55;return"rgb("+[1,3,5].map((i,j)=>Math.round(parseInt(hex.substr(i,2),16)+([8,12,44][j]-parseInt(hex.substr(i,2),16))*k))+")"}
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
// Sol (dia) ou lua (noite) cruzando o céu em arco
function skyBody(sky,ps){
 const e=sunElev(),horizon=sky*.8,arc=sky*.6,u=dayT<.5?dayT/.5:(dayT-.5)/.5,x=Math.round(W*(.08+.84*u)/ps)*ps;
 if(dayT<.5){
  const y=Math.round((horizon-e*arc)/ps)*ps,warm=e<.22;
  pixDisc(x,y,14,ps,"rgba(255,244,170,.07)");pixDisc(x,y,10,ps,"rgba(255,244,170,.09)");pixDisc(x,y,7,ps,warm?"rgba(255,170,90,.16)":"rgba(255,244,170,.12)");
  pixDisc(x,y,5,ps,warm?"#ff9a50":"#ffe27a");pixDisc(x,y,4,ps,warm?"#ffc27a":"#fff7c4");
  ctx.fillStyle=warm?"#ffb070":"#fff1a0";for(const[a,b,w,hh]of[[0,-8,1,2],[0,7,1,2],[-8,0,2,1],[7,0,2,1]])ctx.fillRect(x+a*ps,y+b*ps,w*ps,hh*ps);
 }else{
  const y=Math.round((horizon+e*arc)/ps)*ps;
  pixDisc(x,y,9,ps,"rgba(200,215,255,.07)");pixDisc(x,y,7,ps,"rgba(200,215,255,.1)");
  pixDisc(x,y,5,ps,"#dfe5f5");pixDisc(x,y,4,ps,"#f4f6fb");
  ctx.fillStyle="#c3cae0";ctx.fillRect(x-2*ps,y-ps,ps,ps);ctx.fillRect(x+ps,y+ps,ps,ps);ctx.fillRect(x-ps,y+2*ps,ps,ps);
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
 if(c>.02){   // camada extra de nuvens (maiores e mais lentas) que cobre o céu
  const span=W+240*scale;let n=1;
  for(const[p,hh,s,v,ly,ph]of CLOUDS){
   const size=s*1.3*scale*(W<500?.8:1),par=ly?.18:.07,px=Math.max(2,Math.round(size/13)),sp=sprCloud(n++%3);
   const x=((((p+.37)%1)*span+wx.clock*v*(.6+wx.wind)*scale-camX*T*par)%span+span)%span-120*scale,y=sky*(.08+hh*.62)+Math.sin(wx.clock*.2+ph)*3;
   ctx.globalAlpha=c*(ly?.95:.65)*(1-night*.5);
   ctx.drawImage(sp.cv,1,1,sp.w,sp.h,Math.round(x/px)*px,Math.round(y/px)*px,sp.w*px,sp.h*px);
  }
  ctx.globalAlpha=1;
 }
}
// Véu do tempo (nublado, neblina de fundo e clarão do raio): é desenhado DEPOIS do cenário da superfície (chamado em 5-desenho/06-quadro.js), por cima do céu, das cordilheiras, colinas, montanhas, árvores e pedras.
// Se ficasse junto das nuvens, o cenário (que é desenhado depois do céu) apareceria sem o véu e a borda do efeito ficaria visível na silhueta dele.
function weatherVeil(sky){
 const c=wx.cover;if(sky<=0||(c<.02&&wx.bolt<=0&&wx.fog<.01))return;
 if(c>.02){
  const g=ctx.createLinearGradient(0,0,0,sky);   // véu cinza-azulado: mais escuro no alto, mais claro no horizonte
  g.addColorStop(0,"rgba(46,56,76,"+(.5*c).toFixed(3)+")");g.addColorStop(1,"rgba(112,124,142,"+(.28*c).toFixed(3)+")");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,sky);
 }
 if(wx.fog>.01){const g=ctx.createLinearGradient(0,sky-H*.45,0,sky);g.addColorStop(0,"rgba(226,233,239,0)");g.addColorStop(1,"rgba(226,233,239,"+(.6*wx.fog).toFixed(3)+")");ctx.fillStyle=g;ctx.fillRect(0,Math.max(0,sky-H*.45),W,Math.min(sky,H*.45))}
 if(wx.bolt>0){ctx.globalAlpha=Math.min(1,wx.bolt)*.35;ctx.fillStyle="#eef4ff";ctx.fillRect(0,0,W,sky);ctx.globalAlpha=1}
}
function weatherFront(){   // por cima do mundo, antes da escuridão da noite
 const g=rowY(0);if(g<=8)return;
 const ck=wx.clock;ctx.save();
 if(wx.rain>.02){
  const N=Math.round(wx.rain*Math.min(200,W/4.5)),slope=.12+.22*wx.wind,sp=1+.25*wx.rain;
  ctx.strokeStyle="rgba(196,214,238,.5)";ctx.lineWidth=1;ctx.beginPath();
  const sp2=[];
  for(let i=0;i<N;i++){
   const r1=wxR(i,1),r2=wxR(i,2),v=(520+r1*240)*sp,len=7+r1*7,y=(r1*4000+ck*v)%(g+30),x=((r2*(W+260)+y*slope-60)%(W+260)+W+260)%(W+260)-130;
   if(y<g-2){ctx.moveTo(x,y);ctx.lineTo(x-slope*len,y-len)}else if(y<g+12)sp2.push(x);   // chegou ao chão: respingo
  }
  ctx.stroke();ctx.fillStyle="rgba(210,224,242,.45)";for(const x of sp2)ctx.fillRect(Math.round(x)-2,Math.round(g)-1,4,1);
 }
 if(wx.snow>.02){
  const N=Math.round(wx.snow*Math.min(150,W/6));ctx.fillStyle="rgba(255,255,255,.88)";
  for(let i=0;i<N;i++){
   const r1=wxR(i,3),r2=wxR(i,4),y=(r1*3000+ck*(26+r1*34))%(g+8),x=(((r2*(W+120)+Math.sin(ck*.7+r1*6.3)*18+ck*wx.wind*16)%(W+120))+W+120)%(W+120)-60;
   if(y<g-1){const s=r2>.7?3:2;ctx.fillRect(Math.round(x),Math.round(y),s,s)}
  }
 }
 if(wx.fog>.01){   // faixas de névoa à deriva por cima do chão
  for(let k=0;k<3;k++){const f=ctx.createLinearGradient(0,g-T*(1.5+k*.7),0,g+T*.4);f.addColorStop(0,"rgba(228,234,240,0)");f.addColorStop(.7,"rgba(228,234,240,"+(.2*wx.fog).toFixed(3)+")");f.addColorStop(1,"rgba(228,234,240,"+(.05*wx.fog).toFixed(3)+")");
   ctx.fillStyle=f;ctx.fillRect(((ck*(6+k*3)+k*W*.37)%(W*1.4))-W*.2-W*.5+W*.5,g-T*(1.5+k*.7),W*.9,T*(1.9+k*.7))}
 }
 if(wx.bolt>.45){   // o raio, só nos primeiros instantes do clarão
  const bx=wx.boltX*W,n=wx.boltJ.length;ctx.strokeStyle="rgba(255,255,255,.95)";ctx.lineWidth=2;ctx.shadowColor="#bcd6ff";ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(bx,0);
  let x=bx;for(let i=0;i<n;i++){x+=wx.boltJ[i]*W;ctx.lineTo(x,g*(i+1)/n)}ctx.stroke();
 }
 ctx.restore();
}

// ===== 5-desenho/11-cenario.js — Cenário da superfície: cordilheiras ao fundo, bloqueio rochoso à esquerda e passagem até a grande montanha à direita =====
// Tudo aqui é só visual e só aparece ACIMA da linha 0 (o subsolo não muda). Quem barra o jogador é inS()/isDug (3-mundo/01-celulas.js) com SURF_L e SURF_R (1-nucleo/02-camadas-minerios.js).
// As cores vêm da estação do ano (SEA) e escurecem de noite (nightCol), como as colinas.
const sm3=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
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
function sceneRanges(sky,ps,night){
 if(sky<=0)return;
 const A=H*SURF,wint=winterAmt(),fogL=mixHex(SEA.fh,"#ffffff",.25);
 const layers=[   // par = parallax (fração do movimento da câmera) · amp = altura máxima (fração do céu) · sn = a partir de que fração da altura há neve
  {par:.010,sd:1.7,amp:.92,sn:.84,body:mixHex(SEA.fh,"#8ea4c6",.55),lit:mixHex(SEA.fhh,"#ffffff",.3)},
  {par:.018,sd:4.1,amp:.64,sn:.9,body:mixHex(SEA.fh,"#5f79a3",.72),lit:mixHex(fogL,"#7f98bd",.45)},
  {par:.026,sd:7.3,amp:.4,sn:2,body:mixHex(SEA.nh,"#3f567c",.68),lit:mixHex(SEA.nhh,"#5d78a0",.62)}];
 for(const L of layers){
  const off=camX*T*L.par,body=nightCol(L.body,night),lit=nightCol(L.lit,night),snow=nightCol(mixHex("#eef4fa","#ffffff",wint),night),snowD=nightCol("#b9c9dc",night),sn=L.sn-.22*wint;
  for(let k=Math.floor(off/ps)-1,k1=Math.ceil((off+W)/ps)+1;k<k1;k++){   // coluna k da camada: posição fixa na camada (wx = k*ps), vai para a tela em wx - off
   const wx=k*ps,x=Math.round(wx-off),v=ridgeV(wx,L.sd),v2=ridgeV(wx+ps*1.5,L.sd),r=.3+.7*v,h=Math.max(ps,Math.round(A*L.amp*r/ps)*ps),top=sky-h;
   ctx.fillStyle=v2>v?lit:body;ctx.fillRect(x,top,ps,h);
   if(r>sn*.9){const sh=Math.min(h,Math.round((r-sn*.9)*A*L.amp*1.6/ps)*ps);if(sh>0){ctx.fillStyle=v2>v?snow:snowD;ctx.fillRect(x,top,ps,Math.max(ps,sh))}}
  }
 }
}

// ---------- peças de pixel art ----------
// Paleta do cenário do quadro (hex; nightCol escurece quando for desenhar)
function scenePal(){
 const w=winterAmt();
 return{wint:w,trunk:"#5a3f2a",pL:mixHex("#2f7a45","#e9f2f6",w*.55),pD:mixHex("#1c4f33","#c3d2dc",w*.5),pLb:mixHex("#3b6a52","#cfdde4",w*.4),pDb:mixHex("#27503f","#a9bccb",w*.35),
  lf:SEA.nhh,lfD:SEA.nh,lfb:mixHex(SEA.nh,"#2d4d3f",.4),
  rkL:"#a3a7ae",rkM:"#7c8189",rkD:"#575c66",rkE:"#3f434c",moss:SEA.nh,gr:SEA.g,grH:SEA.h,
  snow:"#f4f8fb",dirt:"#b48a58",dirtH:"#d4ad76"};
}
function pxPine(cx,by,hpx,q,P,k,back){   // pinheiro em degraus; back = versão mais escura e fria (fileira de trás)
 cx=Math.round(cx);by=Math.round(by);
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
 cx=Math.round(cx);by=Math.round(by);
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
 const P=scenePal();ctx.save();ctx.translate(x,y);ctx.scale(ts,ts);
 ctx.fillStyle=P.dirt;ctx.fillRect(0,0,tb+1,5);ctx.fillStyle=P.dirtH;ctx.fillRect(0,0,tb+1,2);
 ctx.fillStyle="rgba(0,0,0,.18)";for(let i=0;i<3;i++)ctx.fillRect(2+hash(c*3+i,611)*(tb-6),2+hash(c*5+i,613)*2,2,1);
 ctx.restore();
}

// ---------- cenário preso ao mundo (atrás do chão e do jogador) ----------
// árvores, arbustos e pedras espalhados entre as colunas c0 e c1 (deterministas: não piscam nem mudam ao andar)
const sceneBlocked=c=>(c>=-22&&c<=-11)||(c>=-28.5&&c<=-23.5)||(c>=22&&c<=32)||(c>=35.5&&c<=41)||c>=BEACH_C0;   // horta, moinho, riacho, fogueira e praia ficam sem árvores aleatórias
function sceneScatter(y0,q,P,k,c0,c1,back){
 for(let c=c0;c<=c1;c++){
  const x=colX(c);if(x<-T*3||x>W+T*3||sceneBlocked(c))continue;
  const s=back?hash(c,911):hash(c,901),thr=back?.35:.5;if(s<thr)continue;
  const j=(hash(c,back?913:903)-.5)*T*.9,kind=hash(c,back?917:907),hh=T*((back?1.5:1.1)+hash(c,back?919:909)*1.1)*(back?.8:1);
  if(back){if(kind<.62)pxPine(x+j,y0,hh,q,P,k,true);else pxTree(x+j,y0,hh*.8,q,P,k,true)}
  else if(kind<.45)pxPine(x+j,y0+q,hh,q,P,k,false);
  else if(kind<.72)pxTree(x+j,y0+q,hh*.85,q,P,k,false);
  else if(kind<.88)pxBush(x+j,y0+q,T*.38,q,P,k);
  else pxBoulder(x+j,y0+q,T*.3,q,P,k);
 }
}
function drawScenery(t){
 const y0=Math.round(rowY(0));if(y0<=8)return;
 const q=Math.max(2,Math.round(T/11)),night=nightAmt(),A=H*SURF,P=scenePal(),k=hx=>nightCol(hx,night);
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,y0);ctx.clip();ctx.imageSmoothingEnabled=false;
 // a grande montanha fica no fim da trilha da esquerda (espelhada, sem nada nela); à direita o cenário termina no mar (13-paisagem.js)
 bigMountain(y0,q,A,P,k,SURF_L-.5,true);
 // fileira de trás (árvores menores e mais frias) e depois a da frente, nos trechos livres das trilhas
 sceneScatter(y0,q,P,k,SURF_L+1,-HALF-1,true);sceneScatter(y0,q,P,k,HALF+2,SURF_R-1,true);
 sceneScatter(y0,q,P,k,SURF_L+1,-HALF-2,false);sceneScatter(y0,q,P,k,HALF+2,SURF_R-1,false);
 ctx.restore();
}

// Grande montanha à direita: sobe logo depois da última coluna andável (SURF_R) e ocupa o fundo até o limite da câmera. Sem portas nem estruturas: só rocha, neve e floresta no pé.
function bigMountain(y0,q,A,P,k,B,mir){   // mir = espelhada (usada à esquerda: sobe depois de SURF_L)
 const C=B+5,L0=B-7,R0=C+11,sg=mir?-1:1,e0=mir?2*B-R0:L0,e1=mir?2*B-L0:R0;if(colX(e1)<=0||colX(e0)>=W)return;
 const PK=A*1.04,wint=P.wint,snowAt=PK*(.72-.22*wint);   // quase a altura toda do céu: o pico aparece e a encosta já é uma parede em SURF_R
 const prof=w0=>{const w=mir?2*B-w0:w0,t=w<=C?(w-L0)/(C-L0):1-(w-C)/(R0-C);return t<=0?0:Math.pow(Math.min(1,t),.62)};
 const hOf=w=>PK*prof(w)*(1+.07*Math.sin(w*2.3)+.05*Math.sin(w*5.9+1));
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
 // pedras caídas no pé da encosta e floresta de pinheiros (a trilha termina aqui)
 pxBoulder(colX(B-sg*.05),y0+q,T*.62,q,P,k);pxBoulder(colX(B+sg*.55),y0+q,T*.45,q,P,k);pxBoulder(colX(B-sg*1.4),y0+q,T*.4,q,P,k);
 for(let o=-6;o<3;o+=.6){const w=B+sg*o,j=hash(Math.floor(w*5),71);if(j<.3)continue;
  const x=colX(w+(j-.5)*.4),hh=T*(1.0+hash(Math.floor(w*5),73)*1.2)*(o>0?.7:1);if(x<-T||x>W+T)continue;
  if(j>.6)pxPine(x,y0+q,hh,q,P,k,true);else pxPine(x,y0+q,hh*.85,q,P,k,false)}
}

// Massa de montanhas ao fundo da esquerda: presa ao mundo (não muda de tamanho nem pisca ao andar), atrás do terreno do bloqueio. Dois picos grandes com neve; passa um pouco de SURF_L para o lado da passagem.
function leftMassif(y0,q,A,P,k,E){
 const peaks=[[E-4.5,.98,7.5],[E-12,.82,8],[E+1.5,.52,5.5],[E-20,.7,9]];   // [centro, altura (fração do céu), meia-largura] em colunas
 const hOf=w=>{let h=0;for(const[c,a,hw]of peaks){const t=1-Math.abs(w-c)/hw;if(t>0)h=Math.max(h,a*Math.pow(t,.8))}return h*A*(1+.06*Math.sin(w*2.7)+.04*Math.sin(w*6.1+2))};
 const lit=k("#8397b6"),shade=k("#566a8c"),deep=k("#3b4d6c"),sL=k("#f4f8fb"),sD=k("#c3d1e3"),wint=P.wint,snowAt=A*(.66-.2*wint);
 worldCols(q,E-30,E+8,(w,x,cw)=>{
  const h=Math.round(hOf(w)/q)*q;if(h<=0)return;
  const up=hOf(w+.4)>hOf(w-.4),top=y0-h;
  ctx.fillStyle=up?lit:shade;ctx.fillRect(x,top,cw,h);
  for(let y=top+q*2;y<y0;y+=q){const v=Math.sin(w*1.9+(y0-y)/(T*.6)+Math.sin(w*.6)*1.4);if(v>.82){ctx.fillStyle=deep;ctx.globalAlpha=.4;ctx.fillRect(x,y,cw,q);ctx.globalAlpha=1}}
  if(h>snowAt){const wq=Math.floor(w*4),sh=Math.round(((h-snowAt)*.9+hash(wq,31)*q*3)/q)*q;ctx.fillStyle=up?sL:sD;ctx.fillRect(x,top,cw,Math.min(h,Math.max(q,sh)))}
 });
}
// Bloqueio à esquerda: terreno elevado de rocha e grama com pedras enormes e árvores, bem atrás de SURF_L. O jogador para na base.
function leftBlock(y0,q,A,P,k,E,back){
 const hOf=w=>{const d=E-w;if(d<=0)return 0;const wq=Math.floor(w*3);return(Math.min(3.5,1.5+d*.5)+(hash(wq,71)-.5)*.5)*T};
 const footH=(w,rc)=>Math.min(hOf(w-rc),hOf(w),hOf(w+rc));   // altura do terreno sob uma peça de meia-largura rc (em colunas): ela assenta no ponto mais baixo
 if(colX(E)<=0)return;
 if(back){   // árvores atrás do terreno (a base fica escondida por ele)
  for(const[dw,kind,r]of[[1.2,0,2.6],[3.0,0,3.1],[4.7,1,2.3],[6.4,0,3.3],[7.9,0,2.7]]){const w=E-dw,x=colX(w);if(x<-T||x>W+T)continue;const by=y0-footH(w,.3)+q*2;kind?pxTree(x,by,T*r*.8,q,P,k,true):pxPine(x,by,T*r,q,P,k,true)}
  return}
 const gr=k(P.gr),grH=k(P.grH),m=k(P.rkM),mD=k(P.rkD),mL=k(P.rkL);
 worldCols(q,E-20,E,(w,x,cw)=>{
  const h=Math.round(hOf(w)/q)*q;if(h<=0)return;
  const top=y0-h,wq=Math.floor(w*3);
  ctx.fillStyle=m;ctx.fillRect(x,top,cw,h);
  ctx.fillStyle=(hash(wq,81)>.5)?mL:mD;ctx.globalAlpha=.55;ctx.fillRect(x,top+q*2,cw,Math.round(h*.45/q)*q);ctx.globalAlpha=1;   // faixas de rocha clara/escura
  for(let y=top+q*4;y<y0-q;y+=q*3)if(hash(wq,Math.floor((y0-y)/(q*3))+90)>.55){ctx.fillStyle="rgba(0,0,0,.18)";ctx.fillRect(x,y,cw,q)}
  ctx.fillStyle=gr;ctx.fillRect(x,top,cw,q*2);ctx.fillStyle=grH;ctx.fillRect(x,top,cw,q);   // grama no topo do terreno
  if(P.wint>.25){ctx.globalAlpha=P.wint;ctx.fillStyle=k(P.snow);ctx.fillRect(x,top,cw,q*2);ctx.globalAlpha=1}
 });
 for(const[dw,r]of[[.3,1.0],[1.5,.75],[2.9,1.1],[4.8,.85],[6.3,1.05]]){const w=E-dw,x=colX(w);if(x<-T*2||x>W+T*2)continue;pxBoulder(x,y0-footH(w,r*.55)+q*2,T*r*.55,q,P,k)}
 for(const[dw,kind,r]of[[2.2,0,2.2],[4.0,1,1.9],[5.6,0,2.8],[7.0,0,2.0]]){const w=E-dw,x=colX(w);if(x<-T||x>W+T)continue;const by=y0-footH(w,.3)+q*2;kind?pxTree(x,by,T*r*.8,q,P,k,false):pxPine(x,by,T*r,q,P,k,false)}
 // barreira rochosa na frente do terreno, em SURF_L: pedras maiores para o bloqueio ficar legível
 pxBoulder(colX(E+.1),y0+q,T*.55,q,P,k);pxBoulder(colX(E-.7),y0+q,T*.7,q,P,k);
}

// ===== 5-desenho/12-povoado.js — Cama, poste de luz (perto da loja), poço de água, ferraria alemã de enxaimel, quadro de contratos e caça-níquel na superfície =====
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

// ---------- poste de luz: um só, de madeira fina, com a lamparina pendurada (perto da loja) ----------
const LAMP_DX=-2.5,LAMP_Y=29.5;   // posição da lamparina em pixels de sprite, em relação ao centro do sprite e à base
function sprLamp(){return mkSpr("lamp3",10,40,{W:"#b27a3a",w:"#7a4f27",d:"#4a2f16",k:"#241609",y:"#ffd98a",Y:"#fff3c4",m:"#8d9299",N:"#3a3a44"},R=>{
 R(6,4,2,36,"W");R(7,4,1,36,"w");R(5,38,4,2,"w");R(5,38,4,1,"W");     // poste fino de madeira e base
 R(1,3,7,2,"W");R(1,4,7,1,"w");R(5,5,1,1,"w");R(4,6,1,1,"w");           // braço e mão-francesa
 R(2,5,1,2,"m");R(1,7,3,1,"N");                                         // corrente e argola
 R(0,8,5,1,"N");R(1,9,3,4,"k");R(2,9,1,3,"y");R(2,9,1,1,"Y");R(0,13,5,1,"N");   // lamparina de vidro
},1)}
function drawLamps(t){
 const u=pu(),s=sprLamp(),y=Math.round(rowY(0)),n=nightAmt();
 for(const col of LAMPS){const x=Math.round(colX(col));if(x<-T*5||x>W+T*5)continue;
  const lx=x+Math.round(LAMP_DX*u),ly=y-LAMP_Y*u;
  if(n>.03){
   const fl=.92+.08*Math.sin(t*7+col*3),r=T*3;
   const gr=ctx.createRadialGradient(lx,ly,0,lx,ly,r);gr.addColorStop(0,"rgba(255,214,130,"+(.5*n*fl).toFixed(3)+")");gr.addColorStop(.35,"rgba(255,196,100,"+(.2*n*fl).toFixed(3)+")");gr.addColorStop(1,"rgba(255,180,80,0)");
   ctx.fillStyle=gr;ctx.fillRect(lx-r,ly-r,r*2,r*2);
   ctx.fillStyle="rgba(255,205,120,"+(.18*n*fl).toFixed(3)+")";ctx.beginPath();ctx.ellipse(lx,y-u*.3,T*1.7,u*1.4,0,0,7);ctx.fill();
  }
  pxShadow(x+u,(s.w+2)*u,y,u);
  // a lamparina balança de leve na corrente
  drawSpr(s,x,y,u);
  if(n>.03){ctx.fillStyle="rgba(255,250,200,"+(.85*n).toFixed(3)+")";ctx.fillRect(lx-Math.round(u),ly-Math.round(1.5*u),Math.round(2*u),Math.round(3*u))}
 }
}
function lampHoles(g,k,d){   // chamado por nightLayer (04-combo-efeitos.js): abre a escuridão em volta da lamparina
 g.globalCompositeOperation="destination-out";const hz=rowY(0),u=pu();
 for(const col of LAMPS){const x=colX(col);if(x<-T*6||x>W+T*6)continue;
  const cx=(x+LAMP_DX*u)*k,cy=(hz-LAMP_Y*u)*k,r=T*3.6*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
  for(const[o,a]of[[0,.93],[.35,.85],[.6,.5],[.82,.18],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
  g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2)}
 forgeHoles(g,k);campfireHoles(g,k);lighthouseHoles(g,k);
 g.globalCompositeOperation="source-over";
}

// ---------- ferraria medieval alemã (Fachwerk): base de pedra, parede de enxaimel, telhado alto de telhas, chaminé de pedra e lanterna de ferro ----------
// Cobre a cama, a mesa e a fornalha. Aberta na frente (as estruturas continuam à vista); a parede de enxaimel fica ao fundo.
const FORGE_H=24,FORGE_TOP=44;   // altura da viga (em pixels de sprite) e topo da chaminé
const FORGE_LAN={dx:-6,dy:19.5};    // lanterna: deslocamento em relação ao pilar e altura (pixels de sprite)
const forgeFx=c=>Math.round(colX(0))+Math.round(c*T);   // coluna -> x da tela com UM só arredondamento (âncora) e deslocamentos inteiros: nada treme entre si ao andar
function forgeLantern(){const u=pu();return{x:forgeFx(FORGE_LANTERN_C)+Math.round(FORGE_LAN.dx*u),y:rowY(0)-FORGE_LAN.dy*u}}
function forgeStackTopY(){return rowY(0)-FORGE_TOP*pu()}
function drawForge(t){
 const u=pu(),y=Math.round(rowY(0)),n=nightAmt(),P=FORGE_PILLARS,xl=forgeFx(P[0]),xr=forgeFx(P[P.length-1]);
 if(xr<-T*8||xl>W+T*8)return;
 const R=(x,yy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(yy),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 const hs=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
 const TB="#4a2f16",TH="#6b4423",TD="#2f1c0e",ST=["#8d8984","#9a968f","#7f7b76","#a39e96"];   // madeira escura do enxaimel e pedras
 const by=y-FORGE_H*u,pl=7*u,wl=xl-Math.round(1.5*u),ww=xr-xl+Math.round(3*u),wallTop=by+2*u;
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
  for(let k=0;k<6;k++){R(x+1.5*u+k*u,by+(7-k)*u,u*1.3,u*1.5,TB);R(x-2.8*u-k*u,by+(7-k)*u,u*1.3,u*1.5,TB)}   // escoras
 });
 // ---- chaminé de pedra por DENTRO da casa: sobe da fornalha atrás dos pilares e da viga; o telhado fica na frente dela e só a ponta aparece saindo da cumeeira
 const sF=sprFurnace(),cF=Math.round(colX(FURN_C)),y0F=Math.round(y-sF.h*u),csx=cF-Math.round(sF.w*u/2)+10*u,csw=5*u,ctop=Math.round(forgeStackTopY());
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

// ---------- poço de água: aro de pedra, dois postes, rolo com manivela, telhadinho de tábuas e balde na corda ----------
function sprWell(){return mkSpr("well",22,24,Object.assign({B:"#8d8984",L:"#b0aba3",b:"#625f5b",q:"#4aa8e8",Q:"#2f7fc0",k:"#1c120c",P:"#e0cf9a"},WOOD),R=>{
 R(9,0,4,1,"W");R(6,1,10,1,"W");R(3,2,16,1,"W");R(0,3,22,1,"w");R(7,1,1,1,"d");R(13,1,1,1,"d");R(5,2,1,1,"d");R(11,2,1,1,"d");R(16,2,1,1,"d");   // telhadinho de tábuas
 R(0,3,22,1,"W");R(1,4,20,1,"w");R(2,5,18,1,"d");                                                                   // viga
 R(3,5,2,9,"w");R(3,5,1,9,"W");R(4,5,1,9,"d");R(17,5,2,9,"w");R(17,5,1,9,"W");R(18,5,1,9,"d");                         // postes
 R(5,7,12,2,"W");R(5,8,12,1,"d");R(5,7,12,1,"P");R(4,7,1,2,"n");R(17,7,1,2,"n");                                    // rolo da corda
 R(19,7,3,1,"w");R(21,7,1,3,"w");R(21,9,1,1,"W");                                                                   // manivela
 R(4,12,14,2,"k");R(5,13,12,1,"q");R(6,13,3,1,"Q");                                                                  // boca do poço com água
 R(2,14,18,2,"L");R(2,14,18,1,"P");R(2,15,18,1,"B");R(2,16,18,8,"B");R(2,16,1,8,"L");R(19,16,1,8,"b");R(2,23,18,1,"b");   // aro de pedra
 R(2,18,18,1,"b");R(2,21,18,1,"b");R(6,16,1,2,"b");R(12,16,1,2,"b");R(16,16,1,2,"b");R(4,19,1,2,"b");R(9,19,1,2,"b");R(14,19,1,2,"b");R(7,22,1,1,"b");R(13,22,1,1,"b");   // argamassa
},1)}
function drawWell(t){
 const u=pu(),s=sprWell(),c=Math.round(colX(WELL_C)),y=Math.round(rowY(0));if(c<-T*2||c>W+T*2)return;
 pxShadow(c,(s.w+2)*u,y,u);drawSpr(s,c,y,u);
 const x0=Math.round(c-s.w*u/2),y0=Math.round(y-s.h*u),sw=Math.round(Math.sin(t*1.7)*u*.6);
 // brilhos na água
 for(let i=0;i<3;i++){if(Math.sin(t*2.4+i*2.1)>.55){ctx.fillStyle="#d9f3ff";ctx.fillRect(x0+(7+i*3)*u,y0+13*u,u,Math.max(1,Math.round(u*.6)))}}
 // corda e balde pendurados no rolo, balançando de leve
 ctx.fillStyle="#c9b27a";ctx.fillRect(x0+11*u+sw*.5,y0+9*u,u,2*u);
 const bx=x0+9*u+sw;ctx.fillStyle="#7a4f27";ctx.fillRect(bx,y0+11*u,5*u,3*u);ctx.fillStyle="#b27a3a";ctx.fillRect(bx,y0+11*u,5*u,Math.round(u*.6));
 ctx.fillStyle="#2f3238";ctx.fillRect(bx,y0+12*u,5*u,Math.round(u*.7));ctx.fillStyle="#4a2f16";ctx.fillRect(bx+4*u,y0+11*u,u,3*u);
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
 if(rd){const b=Math.abs(Math.sin(t*5))*u*2;ctx.fillStyle="#ffd45c";ctx.font="900 22px "+FONT;ctx.textAlign="center";ctx.lineWidth=4;ctx.strokeStyle="rgba(10,8,6,.85)";ctx.strokeText("!",c,y-(s.h+5)*u-b);ctx.fillText("!",c,y-(s.h+5)*u-b)}
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
}
function drawVillage(t){
 drawBed(t);drawLamps(t);drawSlotTable(t);drawBoard(t);drawWell(t);
}

// ===== 5-desenho/13-paisagem.js — Paisagem estendida da superfície: horta e moinho (esquerda); riacho com ponte e roda d'água, fogueira, praia com farol, trapiche e barco (direita); bichinhos de pixel =====
// Tudo aqui é só visual (não muda a física). Posições em colunas do mundo (constantes em 1-nucleo/02-camadas-minerios.js). As peças usam forgeFx (âncora única de arredondamento)
// e padrões por índice/hash, para nada tremer ao andar. Luzes noturnas: campfireHoles/lighthouseHoles (chamadas por lampHoles) e vaga-lumes por cima da escuridão (drawFireflies).
const PX=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
const STONE4=["#8d8984","#9a968f","#7f7b76","#a39e96"];

// ---------- chão: água (riacho e mar) e areia da praia ----------
function drawWaterCell(x,y,ts,tb,c,r,sea){
 const t=performance.now()/1000,X=Math.round(x),Y=Math.round(y),w=Math.round(T)+1,q=Math.max(2,Math.round(T/16));
 const cols=sea?["#3b93d6","#2a73b4","#1f5a94"]:["#58aee0","#3b8fcf"];
 ctx.fillStyle=cols[Math.min(r,cols.length-1)];ctx.fillRect(X,Y,w,w);
 if(r===0){ctx.fillStyle="rgba(255,255,255,.38)";ctx.fillRect(X,Y,w,Math.max(2,Math.round(q*.8)))}   // brilho da superfície
 for(let i=0;i<3;i++){   // linhas de onda que deslizam (riacho: sempre para a direita; mar: vai e vem)
  const ph=hash(c*7+i,r*13+5),lw=q*(3+Math.floor(ph*4)),off=sea?((Math.sin(t*.8+ph*6)*.5+.5)*(T-lw)):((t*(16+ph*8)+ph*T*3)%T),ly=Y+(.18+.64*hash(c+i*3,r+9))*T+(sea?Math.sin(t*1.2+ph*6)*q*.4:0);
  const ww=Math.min(lw,w-off);if(ww>0){ctx.fillStyle="rgba(255,255,255,"+(r===0?.26:.14)+")";ctx.fillRect(Math.round(X+off),Math.round(ly),Math.round(ww),q*.6<1?1:Math.round(q*.6))}
 }
 if(r>=1){ctx.fillStyle="rgba(8,20,48,"+(.10*r)+")";ctx.fillRect(X,Y,w,w)}
}
function drawSandCell(x,y,ts,tb,c,r){
 const X=Math.round(x),Y=Math.round(y),w=Math.round(T)+1,q=Math.max(2,Math.round(T/16));
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
 // canteiros em três fileiras (as de trás ficam mais altas na tela); o espantalho fica na última
 const rows=[[8,"#74522f","#946b3c","#523720"],[4,"#6f4e2e","#8f673a","#4e341c"],[0,"#6b4a2a","#8a6238","#4a3018"]];
 for(const[oy,c1,c2,c3]of rows){
  const by=y-oy*u;
  PX(xa+u,by-2*u,len-2*u,2*u,c1);PX(xa+u,by-2*u,len-2*u,.7*u,c2);PX(xa+u,by-.6*u,len-2*u,.6*u,c3);
  for(let x=xa+4*u,i=0;x<xb-3*u;x+=Math.round(5*u),i++){
   const sw=Math.round(Math.sin(t*1.5+i*1.3+oy)*.6*u);
   PX(x-u,by-3*u,2*u,u,"#ff8a1f");PX(x-.5*u,by-3*u,u,.6*u,"#ffb04a");   // ombro da cenoura laranja saindo da terra
   PX(x-.4*u+sw*.5,by-5*u,.8*u,2*u,gd);   // caule
   PX(x-2*u+sw,by-7*u,1.2*u,2.5*u,gl);PX(x+.8*u+sw,by-7*u,1.2*u,2.5*u,gl);PX(x-.6*u+sw,by-8.2*u,1.2*u,3.2*u,gd);   // folhas
  }
  if(oy===8){   // espantalho
   const sx=xa+Math.round(len*.46),sb=by-.5*u;
   PX(sx-.75*u,sb-18*u,1.5*u,18*u,TH);PX(sx-7*u,sb-13*u,14*u,1.5*u,TH);
   PX(sx-3*u,sb-14*u,6*u,7*u,"#c8452f");PX(sx-3*u,sb-14*u,6*u,u,"#e0604a");PX(sx-1.5*u,sb-10.5*u,3*u,2*u,"#3b6aa8");
   PX(sx-2.5*u,sb-20*u,5*u,5*u,"#e0c47a");PX(sx-1.5*u,sb-18.5*u,u,u,"#2f1c0e");PX(sx+.7*u,sb-18.5*u,u,u,"#2f1c0e");PX(sx-u,sb-16.8*u,2*u,.7*u,"#2f1c0e");
   PX(sx-4.5*u,sb-21*u,9*u,u,"#8a5a2b");PX(sx-2.5*u,sb-24*u,5*u,3*u,TH);PX(sx-2.5*u,sb-22.2*u,5*u,.7*u,"#c8452f");
   PX(sx-8*u,sb-13.6*u,1.4*u,3*u,"#e0c47a");PX(sx+6.6*u,sb-13.6*u,1.4*u,3*u,"#e0c47a");
   PX(sx+4*u,sb-15.6*u,2.5*u,1.8*u,"#1c120c");PX(sx+6.2*u,sb-15.2*u,u,.7*u,"#ffb43a");   // corvo pousado no braço
  }
 }
 // portão de estacas mais altas nas pontas + caixote de cenouras e barril
 for(const gx of[xa,xb]){PX(gx-.8*u,y-9*u,2.4*u,9*u,"#8a5a2b");PX(gx-.8*u,y-9*u,.8*u,9*u,"#b27a3a");PX(gx-u,y-10*u,3*u,1.4*u,TH)}
 const cx=xb+Math.round(5*u);
 PX(cx-4*u,y-5*u,8*u,5*u,"#8a5a2b");PX(cx-4*u,y-5*u,8*u,u,"#b27a3a");PX(cx-4*u,y-2.4*u,8*u,.8*u,TB);PX(cx-4*u,y-.8*u,8*u,.8*u,TB);
 for(let i=0;i<4;i++){PX(cx-3.2*u+i*1.9*u,y-8*u+(i%2)*u,1.4*u,3.4*u,"#ff8a1f");PX(cx-3.2*u+i*1.9*u,y-8*u+(i%2)*u,.5*u,3.4*u,"#ffb04a");PX(cx-3*u+i*1.9*u,y-9.6*u+(i%2)*u,u,1.8*u,gl)}
 const bx=xa-Math.round(5*u);
 PX(bx-3*u,y-8*u,6*u,8*u,"#7a4f27");PX(bx-3*u,y-8*u,u,8*u,"#b27a3a");PX(bx+2*u,y-8*u,u,8*u,"#4a2f16");PX(bx-3*u,y-6*u,6*u,.8*u,"#2f3238");PX(bx-3*u,y-2.2*u,6*u,.8*u,"#2f3238");PX(bx-2.5*u,y-8.6*u,5*u,.8*u,"#4a2f16");PX(bx-2*u,y-8*u,4*u,.8*u,"#4dbb4d");
 if(atSurface())lbl(__("Horta de cenouras"),(xa+xb)/2,y-28*u,"#9be37a");
}

// ---------- moinho de vento (esquerda da horta): torre de pedra e enxaimel, cúpula de telhas e quatro velas girando ----------
function drawWindmill(t){
 const u=pu(),y=Math.round(rowY(0)),cx=forgeFx(MILL_C),n=nightAmt();
 if(cx<-T*6||cx>W+T*6)return;
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
function drawRiver(t){
 const u=pu(),y=Math.round(rowY(0)),xa=Math.round(colX(RIVER_C0-.5)),xb=Math.round(colX(RIVER_C1+.5));
 if(xb<-T*5||xa>W+T*5)return;
 const TB="#4a2f16",TH="#6b4423",dp=Math.round(T*2);
 for(const[bx,dir]of[[xa,-1],[xb,1]]){   // muros de pedra nas duas margens (por baixo da linha da água)
  const sx=dir<0?bx-2.5*u:bx;
  for(let k=0,yy=0;yy<dp;k++,yy+=3*u)PX(sx,y+yy,2.5*u,Math.min(3*u,dp-yy)-1,STONE4[(k+(dir<0?0:2))%4]);
  PX(dir<0?bx-.8*u:bx,y,.8*u,dp,"rgba(8,20,48,.25)");
 }
 // roda d'água (por trás da ponte): suportes, aro, raios e pás girando, parte de baixo dentro da água
 {const wx=forgeFx(WHEEL_C),cy=y-6*u,Rw=12*u;
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
 for(let i=0;i<5;i++){const px=xa+(.12+.76*hash(i,3))*(xb-xa);PX(px,y+u*.2,4*u,u,"#2f8a3a");PX(px,y+u*.2,2*u,u*.5,"#4dbb4d");if(i%2===0)PX(px+1.6*u,y-.7*u,u,u,"#f2a6c8")}
 for(const rx of[xa-4*u,xa-8*u,xb+4*u,xb+8*u])for(let k=0;k<3;k++){const sw=Math.round(Math.sin(t*1.3+rx*.05+k)*.7*u),hh=(6+k*1.5)*u;PX(rx+k*1.4*u+sw,y-hh,.8*u,hh,"#3f8a3a");PX(rx+k*1.4*u+sw-.2*u,y-hh-1.2*u,1.2*u,2.4*u,"#6b4423")}
 // ponte de madeira: pilares na água, tabuleiro de tábuas, vigas e guarda-corpo
 const b0=xa-5*u,b1=xb+5*u,len=b1-b0;
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
 pxShadow(bx,19*u,y,u);   // banco de pedra: dois pés e uma laje comprida
 PX(bx-7*u,y-4*u,4*u,4*u,"#7f7b76");PX(bx+3*u,y-4*u,4*u,4*u,"#7f7b76");PX(bx-7*u,y-4*u,u,4*u,"#a39e96");PX(bx+3*u,y-4*u,u,4*u,"#a39e96");PX(bx+6*u,y-4*u,u,4*u,"#625f5b");
 PX(bx-9*u,y-6.5*u,18*u,2.5*u,"#9a968f");PX(bx-9*u,y-6.5*u,18*u,.8*u,"#b8b3aa");PX(bx-9*u,y-4.5*u,18*u,u,"#625f5b");PX(bx-u,y-6.5*u,.7*u,2.5*u,"#625f5b");
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
 if(atSurface())lbl(__("Fogueira"),cx,y-19*u,"#ffb43a");
}
function campfireHoles(g,k){   // abre a escuridão em volta da fogueira (chamado por lampHoles)
 const P=campPos();if(P.x<-T*7||P.x>W+T*7)return;
 g.globalCompositeOperation="destination-out";
 const cx=P.x*k,cy=P.y*k,r=T*4.4*k,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
 for(const[o,a]of[[0,.95],[.35,.85],[.6,.5],[.82,.18],[1,0]])gr.addColorStop(o,"rgba(0,0,0,"+a+")");
 g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);g.globalCompositeOperation="source-over";
}

// ---------- praia: farol listrado com luz giratória, trapiche e barco parado ----------
const lhLamp=()=>({x:forgeFx(LIGHT_C),y:rowY(0)-35*pu()});
function drawLighthouse(t){
 const u=pu(),y=Math.round(rowY(0)),cx=forgeFx(LIGHT_C),n=nightAmt();
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
 {const u=pu(),bx=(forgeFx(BOAT_C)+Math.round(8.7*u))*k,by=(rowY(0)-26*u)*k,r=T*2.2*k,g2=g.createRadialGradient(bx,by,0,bx,by,r);   // lanterninha do barco
  g2.addColorStop(0,"rgba(0,0,0,.9)");g2.addColorStop(.5,"rgba(0,0,0,.4)");g2.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=g2;g.fillRect(bx-r,by-r,r*2,r*2)}
 g.globalCompositeOperation="source-over";
}
function drawBeach(t){
 const u=pu(),y=Math.round(rowY(0)),n=nightAmt(),xs=Math.round(colX(SURF_R+.5));
 if(colX(BEACH_C0)>W+T*8||colX(BOAT_C)<-T*8)return;
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
  PX(p0,y+T*.55,len,T*.6,"rgba(50,125,190,.35)");
  PX(p0,y,len,2.5*u,"#8a5a2b");PX(p0,y,len,.8*u,"#b27a3a");PX(p0,y+1.7*u,len,.8*u,"#3a2410");
  for(let x=p0+3*u,ix=0;x<p1-u;x+=Math.round((4.5+hash(ix,57)*3)*u),ix++)PX(x,y+.8*u,.6*u,1.7*u,TB);
  PX(p0,y+2.5*u,len,1.4*u,TB);
  PX(p1-3*u,y-5*u,2.2*u,5*u,"#6b4423");PX(p1-3*u,y-5*u,.8*u,5*u,"#8a5a2b");PX(p1-3.4*u,y-5.6*u,3*u,u,TB);PX(p1-3.2*u,y-3.4*u,2.6*u,.8*u,"#c9b27a");   // poste e corda enrolada
 }
 // barco parado, preso ao poste do trapiche (balança de leve na água)
 {const bc=forgeFx(BOAT_C),bob=Math.sin(t*1.3)*u*.5,tilt=Math.sin(t*.9)*.025,pole=Math.round(colX(PIER_END_C))-3*u+1.1*u;
  ctx.strokeStyle="#c9b27a";ctx.lineWidth=Math.max(1,u*.7);ctx.beginPath();ctx.moveTo(pole,y-3*u);ctx.quadraticCurveTo((pole+bc-15*u)/2,y+3*u,bc-15*u,y-3*u+bob);ctx.stroke();   // corda
  ctx.save();ctx.translate(bc,y+bob);ctx.rotate(tilt);
  ctx.fillStyle="#7a4f27";ctx.beginPath();ctx.moveTo(-17*u,-5*u);ctx.lineTo(19*u,-7*u);ctx.lineTo(13*u,3.5*u);ctx.lineTo(-12*u,3.5*u);ctx.closePath();ctx.fill();   // casco
  ctx.fillStyle="#c8452f";ctx.beginPath();ctx.moveTo(-17*u,-5*u);ctx.lineTo(19*u,-7*u);ctx.lineTo(18.4*u,-4.8*u);ctx.lineTo(-16.4*u,-2.8*u);ctx.closePath();ctx.fill();   // faixa vermelha
  ctx.fillStyle="#b27a3a";ctx.fillRect(-17*u,-5.4*u,35*u,.6*u);
  ctx.fillStyle="rgba(0,0,0,.28)";ctx.fillRect(-13*u,0,26*u,.7*u);ctx.fillRect(-14*u,-1.4*u,31*u,.5*u);   // tábuas do casco
  ctx.fillStyle="#8a5a2b";ctx.fillRect(-9*u,-12*u,10*u,7*u);ctx.fillStyle="#b27a3a";ctx.fillRect(-9*u,-12*u,10*u,u);ctx.fillStyle="#4a2f16";ctx.fillRect(-10*u,-13*u,12*u,1.4*u);   // cabine
  ctx.fillStyle=n>.03?"#ffd98a":"#2f3a4a";ctx.fillRect(-6.5*u,-10.5*u,3*u,3*u);ctx.fillStyle="#4a2f16";ctx.fillRect(-5.2*u,-10.5*u,.6*u,3*u);
  ctx.fillStyle="#6b4423";ctx.fillRect(8*u,-25*u,1.4*u,20*u);ctx.fillRect(2*u,-14*u,14*u,1.2*u);   // mastro e retranca
  ctx.fillStyle="#e8dfc6";ctx.fillRect(2.5*u,-14*u,13*u,-3.6*u);ctx.fillStyle="rgba(0,0,0,.2)";ctx.fillRect(2.5*u,-15.5*u,13*u,u);   // vela enrolada
  ctx.fillStyle="#2f3238";ctx.fillRect(7.2*u,-27*u,3*u,2*u);ctx.fillStyle=n>.03?"#ffd98a":"#e8d7a0";ctx.fillRect(7.8*u,-26.6*u,1.8*u,1.2*u);   // lanterninha do mastro
  ctx.restore();
  PX(bc-20*u,y,40*u,6*u,"rgba(50,125,190,.55)");PX(bc-20*u,y,40*u,u*.6,"rgba(255,255,255,.6)");   // casco afundado na água
  if(n>.03){const gx=bc+8.7*u,gy=y-26*u,r=T*1.6,gr=ctx.createRadialGradient(gx,gy,0,gx,gy,r);gr.addColorStop(0,"rgba(255,210,120,"+(.4*n).toFixed(3)+")");gr.addColorStop(1,"rgba(255,200,100,0)");ctx.fillStyle=gr;ctx.fillRect(gx-r,gy-r,r*2,r*2)}
 }
}

// ---------- bichinhos de pixel (1 a 3 pixels cada), só enfeite ----------
// De dia: borboletas, passarinhos, gaivotas, coelhos, sapos, caranguejos e peixes saltando. De noite: vaga-lumes (drawFireflies, por cima da escuridão).
const CR_L=SURF_L+3,CR_R=SURF_R-3;
function critterQ(){return Math.max(2,Math.round(pu()*.8))}
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
 // coelhos: ficam sentados e dão um pulinho de vez em quando
 for(let i=0;i<4;i++){
  const home=[-23,-12.2,13,34][i],cyc=3.4+i*.5,ph=(t+i*1.3)%cyc,hop=ph>cyc-.8?(ph-(cyc-.8))/.8:-1,cnt=Math.floor((t+i*1.3)/cyc),dir=hash(cnt,i+130)>.5?1:-1;
  const x=colX(home)+Math.round((hash(cnt,i+131)-.5)*4*u)+(hop>=0?dir*hop*3*u:0);if(x<-T||x>W+T)continue;
  const by=y-(hop>=0?Math.sin(hop*Math.PI)*3*u:0);
  PX(x,by-2*q,3*q,2*q,"#d8d0bc");PX(x+(dir>0?2:0)*q,by-3*q,q,q,"#e8e0cc");PX(x+(dir>0?2:0)*q,by-4*q,q,q,"#d8d0bc");PX(x+(dir>0?0:2)*q,by-3*q,q,q,"#d8d0bc");PX(x+(dir>0?-1:3)*q,by-2*q,q,q,"#ffffff");PX(x+(dir>0?2:0)*q,by-3*q,q*.6,q*.6,"#2f1c0e");
 }
 // sapos nas margens do riacho
 for(let i=0;i<4;i++){
  const home=[22.9,23.4,31.1,31.6][i],cyc=3+i*.7,ph=(t+i*.9)%cyc,hop=ph>cyc-.6?(ph-(cyc-.6))/.6:-1,x=colX(home)+(hop>=0?(i%2?-1:1)*hop*2.5*u:0);if(x<-T||x>W+T)continue;
  const by=y-(hop>=0?Math.sin(hop*Math.PI)*3*u:0);PX(x,by-2*q,3*q,2*q,"#4da64d");PX(x,by-3*q,q,q,"#7ad07a");PX(x+2*q,by-3*q,q,q,"#7ad07a");PX(x,by-3*q,q*.5,q*.5,"#1c120c");PX(x+2.5*q,by-3*q,q*.5,q*.5,"#1c120c");
 }
 // caranguejos na areia (andam de lado)
 for(let i=0;i<4;i++){const x=colX(45+i*2.2+Math.sin(t*.6+i*2)*.7);if(x<-T||x>W+T)continue;const m=Math.sin(t*6+i)>0;
  PX(x,y-q,3*q,q,"#e0553a");PX(x-q,y-2*q,q,q,"#e0553a");PX(x+3*q,y-2*q,q,q,"#e0553a");PX(x,y-2*q,q*.6,q*.6,"#1c120c");PX(x+2*q,y-2*q,q*.6,q*.6,"#1c120c");PX(x+(m?-1:3)*q,y,q,q*.6,"#e0553a")}
 // peixes que saltam no riacho e no mar
 for(let i=0;i<6;i++){
  const sea=i>=3,per=5+hash(i,141)*5,ph=(t+hash(i,143)*per)%per;if(ph>.8)continue;
  const f=ph/.8,home=sea?54+hash(i,145)*5:24.8+hash(i,145)*4.4,x=colX(home)+f*6*u,by=y-Math.sin(f*Math.PI)*9*u,fl=f<.5?-1:1;
  if(x<-T||x>W+T)continue;
  PX(x,by-q,3*q,q,"#dfeaf2");PX(x+q,by-2*q,q,q,"#b7c8d8");PX(x-q,by-(fl>0?0:2)*q,q,q,"#b7c8d8");PX(x+2*q,by-q,q*.6,q*.6,"#1c120c");
  if(f<.18||f>.82){ctx.globalAlpha=.7;PX(x-q,y-.6*q,5*q,.6*q,"#ffffff");ctx.globalAlpha=1}   // respingo ao entrar/sair da água
 }
}
const FIREFLIES=Array.from({length:90},(_,i)=>({c:SURF_L+3+hash(i,151)*(SURF_R-SURF_L-6),h:2.5+hash(i,153)*12,ph:hash(i,155)*6.28,sp:.6+hash(i,157)*1.2}));
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
function drawLandscape(t){
 if(rowY(0)<=8)return;
 drawWindmill(t);drawGarden(t);drawRiver(t);drawCampfire(t);drawBeach(t);drawCritters(t);
}

// ===== 5-desenho/14-cenoura-dourada.js — A cenoura dourada brotando da Rocha-mãe, no fundo do abismo =====
// Cenoura dourada: só o ombro aparece, brotando da rocha-mãe; raízes de cristal azuis e roxas descem pela pedra. Desenhada antes do jogador e da escuridão.
function drawGoldenCarrot(t){
 if(carrotC===null)return;
 const u=Math.max(2,Math.round(T/14)),cx=Math.round(colX(carrotC)),y0=Math.round(rowY(FINAL_DEPTH)),pulse=.5+.5*Math.sin(t*2.2);
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

// ===== 6-jogo/01-laco-inicio.js — Laço principal, eventos, salvar/exportar/importar e inicialização =====
let last=performance.now(),acc=0,sv=0,autoMsgT=0;
function loop(now){
 const dt=modal==="pause"||modal==="lv"||modal==="chest"?0:Math.min(.1,(now-last)/1000);last=now;   // pausa, escolha de melhoria ao subir de nível e animação de abrir baú congelam o jogo (tempo, habilidades, energia, combo, clima, fornalha...)
 if(modal!=="title")S.play+=dt;dayTick(dt);seasonTick(dt);weatherTick(dt);starTick(dt);cmbT-=dt;if(cmbT<=0){if(cmb>0)comboEnd();cmb=0}
 for(let i=0;i<2;i++){if(skT[i]>0)skT[i]-=dt;if(skCD[i]>0)skCD[i]-=dt}
 ambSpawn(dt);
 if(!Number.isFinite(S.gold)&&!S.debug)S.gold=0;
 ambT-=dt;if(musOn&&!mute&&S.vol.a>0&&ambT<=0){ambT=3+Math.random()*4;drip()}
 musT-=dt;if(musOn&&!mute&&S.vol.m>0&&musT<=0){musT=2+Math.random();note()}
 if(jetT>0)jetT-=dt;if(jetT>0||(!modal&&airborne())){const jx=colX(mX),jy=rowY(mY);if(Math.random()<dt*(jetT>0?60:14))parts.push({x:jx-9*worldZoom+(Math.random()-.5)*4,y:jy-6*worldZoom,vx:(Math.random()-.5)*(jetT>0?50:25),vy:(jetT>0?90+Math.random()*110:40+Math.random()*50),l:.3,c:Math.random()<.5?"#ffb43a":"#ff6a2a"})}
 dynCD=Math.max(0,dynCD-dt);tpCD=Math.max(0,tpCD-dt);toastT-=dt;autoMsgT-=dt;
 if(ev>0)ev-=dt;else{evNext-=dt;if(evNext<=0){ev=BAL.events.len;evT=Math.random()<.5?0:1;evNext=BAL.events.gapMin+Math.random()*BAL.events.gapRand;say(evT?__("Frenesi mineral! Minérios x3 por 20s"):__("Corrida do ouro! Ouro x3 por 20s"))}}
 // superfície: recupera energia rápido e entrega a mochila ao chegar perto do baú
 if(atSurface()){const m=maxEn();if(S.en<m)S.en=Math.min(m,S.en+60*dt);}
 furTick(dt);ctTick(dt);chestTick();memCheck();
 // escavação automática (pausa sozinha quando a energia só dá para voltar)
 const ad=autoDps();
 if(ad>0&&!modal){if(autoOK())hit(ad*dt,false,true);else if(autoMsgT<=0&&S.depth>0&&canBreak(...tgt())){autoMsgT=6;say(__("Escavação automática pausada: energia só para voltar"))}}
 if(!modal&&holdS&&now-lastH>(skT[1]>0?150/frenzyMult():150)/attackSpeedMult()){lastH=now;clickDig()}
 // queda livre: segurando ↓ sobre buraco já cavado, desce de graça e acelera aos poucos; soltar a tecla para na hora
 const falling=!modal&&held==="down"&&S.depth<FINAL_DEPTH&&isDug(S.mc,S.depth);fallR=falling?fallR+dt:0;
 let mvMs=(shiftOn?60:130)/(1+.1*pk("mov"))/(held==="up"?jetSpdMult():1);
 if(falling){
  // queda livre: vários blocos por quadro se preciso; começa em t0 e acelera até tMin; Shift multiplica o intervalo por F.shift
  const F=BAL.fall,iv=(shiftOn?F.shift:1)*(F.t0-(F.t0-F.tMin)*Math.min(1,fallR/F.ramp));
  fallAcc=Math.min(fallAcc+dt,iv*F.maxSteps);
  for(let n=0;n<F.maxSteps&&fallAcc>=iv&&held==="down";n++){fallAcc-=iv;const d0=S.depth;move("down");if(S.depth===d0)break}
  lastMv=now;
 }else{
  fallAcc=0;
  if(!modal&&held&&now-lastMv>mvMs){lastMv=now;move(held)}
 }
 const k=Math.min(1,dt*(falling?(shiftOn?60:40):shiftOn?26:14)),kc=Math.min(1,dt*(falling?(shiftOn?30:20):shiftOn?12:7));
 mX+=(S.mc-mX)*k;mY+=(S.depth-mY)*k;camX+=(mX-camX)*kc;camY+=(mY-camY)*kc;clampCam();
 draw(dt);
 acc+=dt;if(acc>.15){acc=0;checkAch();checkUnlocks();autoTab();refresh();buffsUI()}
 sv+=dt;if(sv>5){sv=0;save()}
 requestAnimationFrame(loop);
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});
addEventListener("pagehide",save);
document.addEventListener("click",e=>{if(e.target.tagName==="BUTTON")e.target.blur()});
$("exp").onclick=()=>{try{$("sv").value=btoa(unescape(encodeURIComponent(JSON.stringify(Object.assign({},S,{dug:[...dug]})))));$("sv").select();say(__("Save exportado: copie o texto"))}catch(e){say(__("Falha ao exportar"))}};
$("imp").onclick=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob($("sv").value.trim()))));S=clean(o);SEED=S.seed;chQ.length=0;carrotC=null;dug=new Set(S.dug.filter(k=>/^-?\d+,\d+$/.test(k)));if(S.en<0)S.en=maxEn();if(S.debug)S.gold=Infinity;camX=mX=S.mc;camY=mY=S.depth;layerSeen=layerOf(S.depth);build();save();say(__("Save importado!"))}catch(e){say(__("Save inválido"))}};
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
if(typeof window.__TESTE__==="function")window.__TESTE__({get skT(){return skT},get skCD(){return skCD},get modal(){return modal},SURF_L,SURF_R,clampCam,get camX(){return camX},set camX(v){camX=v},wx,WX,WX_KEYS,weatherSet,weatherTick,weatherPick,onCombo,comboEnd,get cmb(){return cmb},set cmb(v){cmb=v},get cmbBanner(){return cmbBanner},get cmbLastT(){return cmbLastT},lavaRes,furLoad,furTick,furRate,furEta,nearFurnace,FURN_C,airborne,lava,lavaDmg,teleCD,get S(){return S},isUnl,checkUnlocks,nextUnlockText,unlockNames,openMemoria,carrotSpot,get carrotC(){return carrotC},reachBottom,get dug(){return dug},hit,move,step,die,sellBag,teleport,spend,maxEn,isDug,canBreak,tgt,buy,buyTier,clickPow,hardness,setDir,goTo,digCost,returnCost,autoOK,tierCost,upCost,UPS,FINAL_DEPTH,HALF,CHEST_C,BED_C,SLOT_C,BOARD_C,WELL_C,LAMPS,nearBed,nearSlot,nearBoard,ctGen,ctProg,ctTick,ctClaim,ctDrop,openBoard,openSlot,slotSpin,chestAt,chestFound,chestTick,chestKey,chestRoll,get chQ(){return chQ},slotRtp,slotMult,slotBetAmt,slotKey,get slotBusy(){return slotBusy},get SEED(){return SEED},atSurface,closeModal,BENCH_C,blockGold,gainXp,nearBench,basePow,autoDps,TIERS,BIO,SK,prestGain,get held(){return held},get jetT(){return jetT},boom,dynNext,dynPick,DYN_IDS,BAL,furyMult,frenzyMult,useSk,fmtN,skillDescription,get skT(){return skT},useItem,buyItem,isVein,canBlast,have,ITEMS,SHOP_C,nearShop,itemCost,collect,wipeAll,save,clean,get dynCD(){return dynCD},oreVeinAt,starFall,starTick,nightAmt,nightDive,xpGainMult,gmult,oreChance,get star(){return star},get starT(){return starT},get shoot(){return shoot},get dayT(){return dayT},set dayT(v){dayT=v},RV_W,RV_H,ORES,SEASONS,seasonMix,seasonTick,blockKind,breakSfx,hitSfx,get SEA(){return SEA},get shake(){return shake},set shake(v){shake=v}});
})();
