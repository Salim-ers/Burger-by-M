/**
 * BRIEFS DES VISUELS GÉNÉRÉS — direction artistique et prompts (API d'images OpenAI).
 *
 * Tout ce qui sort de ces briefs est une CRÉATION GÉNÉRÉE, jamais une photo du restaurant :
 *  - identifiée comme telle dans assets/generated/manifest.json (statut « à valider ») ;
 *  - jamais décrite dans le site comme une photo authentique ou contractuelle.
 *
 * Références : les vraies photos du restaurant servent de base (recette, barquettes, papier, table)
 * pour que les visuels restent fidèles à ce qui est réellement servi.
 *  - chemin relatif au projet : fichier de référence ;
 *  - { asset: "id" } : version retenue d'un autre brief (continuité entre cadrages ou variantes).
 */

/** Ce qui fait une vraie photo publicitaire — et non une image générée « trop parfaite ». */
const CRAFT = `Style: real editorial advertising food photography, captured on location with a medium-format digital camera and an 80mm lens around f/4. One warm practical tungsten key light and very little fill, natural falloff into deep shadow, faint film grain, believable micro-texture. Slight human imperfection everywhere: uneven crumbs, irregular cheese drips, small grease marks. It must look photographed, not rendered.
Strictly forbidden: any text, letter, number, logo, sticker, label or watermark; plastic-looking cheese; waxy or CGI surfaces; a perfectly symmetrical bun; impossibly tall stacks; floating ingredients; HDR look; oversaturated colours; oversharpening; toppings not explicitly listed.`;

/** La recette réelle visible sur la photo du restaurant « Le Spécial ». */
const BURGER = `The burger: a soft brioche bun with a lightly glazed, slightly uneven golden crown and a few natural wrinkles; two thin smashed beef patties with dark, craggy, lacy crispy edges; real melted cheddar pooling irregularly over the meat; a loose pile of crispy fried onions; a couple of pickle slices barely visible. Nothing else in the burger.`;

/**
 * Le vrai lieu (assets/sources/restaurant-comptoir-neon.png) : rien n'est inventé, y compris la lumière.
 * Le néon est le seul texte permis dans l'image.
 */
const PLACE = `The place must look exactly like the real photo, in the same natural light: bright, clean white walls; a warm white LED strip along the ceiling edge, with an ochre ceiling panel above it; a stainless steel extraction hood with its ducting and a stainless steel backsplash; a tidy working kitchen with its real equipment, and a cook in a black t-shirt with a black cap seen from behind; a counter with a smooth cream top; the counter front made of vertical natural oak slats with thin black gaps; mounted on those slats, a thin warm yellow LED neon sign in handwritten script reading exactly "Burger By M", with these letters and this spelling, same lettering style as the photo. Do not add any furniture, decoration, window or object that is not in the photo. Do not darken the room: same daylight-balanced brightness as the photo.`;

/** Rendu de vraie photographie : ni étalonnage de film, ni pénombre, ni brillance d'image générée. */
const NATURAL = `Style: a real, clean, natural photograph by a professional interiors and food photographer, on a full-frame camera with a 35mm lens at f/11, sharp and detailed everywhere. Deep depth of field: everything is in crisp focus from the foreground to the back wall, including the neon sign, the counter, the kitchen and the hood. No background blur, no bokeh. True-to-life colours, neutral white balance, soft even ambient light from the room, natural contrast, gentle realistic shadows. The food looks real and appetising, with natural colours and slight imperfections.
Strictly forbidden: orange or teal colour grading, dramatic low-key lighting, dark moody atmosphere, haze, smoke, vignette, HDR look, oversaturated colours, oversharpening, plastic-looking cheese, waxy or CGI surfaces, any text, letter, number, logo or label other than the neon sign (the paper has only an abstract grey pattern with no readable words, and the cook's clothes carry no readable text).`;

/** Les milkshakes réels : gobelet transparent, sticker du logo, tenu à la main devant un mur beige. */
const SHAKE_SET = `The set is the one of the real photos: a clear plastic cup with no lid, held up by a hand with natural skin and five natural fingers, in front of a plain warm beige wall, in soft natural daylight. A generous swirl of real whipped cream rises above the rim. On the front of the cup, a round black sticker reproducing the attached logo exactly: a thin white ring, a small burger icon, the word "BURGER" in spaced white serif capitals and "By M" in pale pink serif below, with these letters and this spelling. No other text anywhere.

Composition: camera at eye level, a little further back than the real photo. The cup, its whipped cream and the sticker are entirely visible, centred, with empty beige wall on the left and right. The top of the cream and the sticker both stay inside the central 16:9 band of the frame, because the picture is also displayed cropped to 16:9. The hand enters from the bottom edge.`;

const SHAKE_STYLE = `Style: a real, clean, natural photograph, sharp and detailed, true-to-life colours, slight natural imperfections in the cream and the drips. Strictly forbidden: plastic-looking cream, CGI surfaces, extra fingers, oversaturated colours, HDR look, ingredients not listed, any wrapper or brand lettering on food.`;

/** Une cuisine doit donner confiance : plaque et ustensiles impeccables. */
const CLEAN_GRIDDLE = `The griddle is spotless and perfectly maintained, as in a very clean professional kitchen: a smooth, even, clean dark steel surface with a soft natural sheen. Around the patties there is only a thin, small, natural line of sizzling fat. Absolutely no burnt residue, no black crust on the plate, no scraps, no crumbs, no splatter, no stains, no rust, no grime, no scratches, no scattered bits of meat anywhere on the griddle. The stainless steel splash guard behind is bright and clean. The metal spatula is a clean, new-looking brushed stainless steel blade, with no rust and no stains.`;

/** Trois vraies recettes de la carte, sans invention. */
const BURGERS = `Three different burgers from the restaurant's real menu, all in the same soft, lightly glazed golden brioche bun with a slightly uneven crown:
1. Le Spécial: double thin smashed beef patties with dark, lacy, crispy edges, melted cheddar, crispy fried onions, a few pickle slices (as in the real photo).
2. Smash Double: double smashed beef patties, melted cheddar, green lettuce, pinkish smash sauce.
3. Le Montagnard: one beef patty, crispy bacon, melted raclette cheese, soft caramelised onions, green lettuce.
Nothing else in these burgers. They look real and appetising, each one different, with natural imperfections.`;

/** Fond et lumière des visuels de la carte (burgers sur fond crème) : les frites doivent s'y intégrer. */
const MENU_SET = `Set and light, identical to the brand's menu pictures (see the burger reference): a warm cream seamless studio backdrop with a very gentle gradient, soft large frontal-top light, a soft natural contact shadow under the tray. Camera at a low three-quarter angle, slightly above the tray. Pull the camera back: the tray is centred and only about 58% of the frame width, with wide empty cream backdrop on every side. The whole tray and its contents stay inside the central 16:9 band of the frame, with clear margins above and below, because the picture is also displayed cropped to 16:9.`;

const TRAY = `The serving tray is exactly the restaurant's real one, as in the photo reference: a simple white cardboard fast-food tray lined with greaseproof paper with an abstract grey newsprint-like pattern (no readable words at all).`;

const FRIES_RULE = `Portion, tray, camera, backdrop and light must stay strictly identical to the previous picture. No herbs, no parsley, no chives, no sauce cup, no fork, no burger, no jalapeños, no extra ingredient of any kind.`;

const CHEDDAR = `A warm, liquid, real cheddar cheese sauce poured over the fries by hand: it flows unevenly, runs down between the fries, pools in places and leaves many fries uncovered. Its colour is a natural warm orange-yellow with a soft satin sheen, slightly thickened where it has started to cool — never plastic, never a uniform glossy coat.`;

export const briefs = {
  // ---------------- HERO ----------------
  "hero-desktop": {
    usage: "Hero de l'accueil — cadrage paysage",
    size: "3840x2160",
    draftSize: "1536x864",
    refs: ["assets/sources/restaurant-comptoir-neon.png", "public/images/food/smash-le-special.webp", "public/images/products/smash-double.webp", "public/images/products/le-montagnard.webp"],
    prompt: `Reference 1 is a real photo of the inside of the restaurant, the absolute reference for the place, the colours and the light. References 2, 3 and 4 show its real burgers. Create a wide 16:9 photograph taken inside this exact restaurant, as if a professional had taken the same photo with a better camera: it must immediately look like the same place.

${PLACE}

${BURGERS}

Scene: in the foreground, close to the camera, the three burgers stand side by side on slightly crumpled plain white greaseproof paper, with only a fine, small-scale, faint grey newsprint texture and no large shapes, on a dark wooden table, with natural colours. Behind them, a few metres away and just as sharp, the counter runs across the frame.

Composition: the white wall, the hood and the kitchen fill the top of the frame. The neon sign is in the right half of the frame, entirely above the burgers, never hidden by them, large and readable. The three burgers form a loose group in the right half of the frame, from about 50% to 96% of the frame width, entirely visible, the lowest point of the burgers and paper no higher than the bottom of the frame minus 18%: a clear band of empty dark wooden table stays below them, because the picture is also cropped on wide computer screens. The left half of the frame stays uncluttered, with the counter and the slats continuing, and leaves room for a headline over the slats and the table at the bottom left.

${NATURAL}`,
  },
  "hero-mobile": {
    usage: "Hero de l'accueil — cadrage portrait (vrai recadrage, pas une découpe)",
    size: "2160x3840",
    draftSize: "864x1536",
    refs: [{ asset: "hero-desktop" }, "assets/sources/restaurant-comptoir-neon.png"],
    prompt: `Reference 1 is the wide photograph of the scene. Reference 2 is a real photo of the same restaurant, the absolute reference for the place, the colours and the light. Recompose the same scene as a true vertical photograph, as if the photographer had turned the camera: same place, same natural light, same three burgers, nothing new.

${PLACE}

${BURGERS}

Composition, from top to bottom, the camera further back: a band of white wall, hood and kitchen at the top; then the neon sign, horizontally centred, whole and readable, about 66% of the frame width, its centre about 23% from the top of the frame; then the three burgers in a tight group on their paper on the dark wooden table, horizontally centred, about 86% of the frame width together, their centre about 39% from the top, and nothing of the burgers or their paper lower than 50% from the top. They must not hide the neon. Everything below 50% from the top is only the empty dark wooden table, calm enough for a large headline.

${NATURAL}`,
  },

  // ---------------- « Votre burger commence quand vous commandez. » ----------------
  "plancha-desktop": {
    usage: "Séquence éditoriale, plein cadre paysage : le moment où le burger commence",
    size: "3840x2160",
    draftSize: "1536x864",
    refs: ["public/images/food/smash-le-special.webp", "assets/sources/restaurant-comptoir-neon.png"],
    prompt: `Reference 1 shows the restaurant's real finished burger: match its cheese, its beef crust and its colours. Reference 2 shows the real kitchen: same clean stainless steel, same natural light.

Create a wide 16:9 photograph on a flat-top griddle in this clean working kitchen: several thin smashed beef patties in a row across the griddle, just pressed, with craggy, lacy, deeply browned edges, each with a slice of cheddar that has only just begun to soften and slump over the meat. A little real steam. The edge of a metal spatula enters from the upper right. The patties fill the right two thirds of the frame; the griddle continues, calm and empty, on the left and along the bottom, where a short caption will sit.

${CLEAN_GRIDDLE}

Style: a real, clean, natural photograph by a professional food photographer, razor sharp and detailed, natural daylight-balanced light from the kitchen, true-to-life colours, natural contrast. Strictly forbidden: dark moody low-key lighting, heavy blur, orange colour grading, HDR look, oversaturated colours, plastic-looking cheese, any text, logo or watermark, toppings not listed.`,
  },

  plancha: {
    usage: "Séquence éditoriale, cadrage portrait : le moment où le burger commence",
    size: "2160x3840",
    draftSize: "864x1536",
    refs: [{ asset: "plancha-desktop" }, "public/images/food/smash-le-special.webp"],
    prompt: `Reference 1 is the wide photograph of the scene: same griddle, same clean kitchen, same light, same look of the patties and cheese. Reference 2 shows the restaurant's real finished burger. Recompose the same scene as a true vertical photograph, as if the photographer had turned the camera, nothing new.

Thin smashed beef patties on the griddle, just pressed, with craggy, lacy, deeply browned edges, each with a slice of cheddar that has only just begun to soften and slump over the meat. A little real steam. Three patties stacked in depth, filling the upper two thirds of the frame. The lower third of the frame is the calm, empty griddle, where a short caption will sit.

${CLEAN_GRIDDLE}

Style: a real, clean, natural photograph by a professional food photographer, razor sharp and detailed, natural daylight-balanced light from the kitchen, true-to-life colours, natural contrast. Strictly forbidden: dark moody low-key lighting, heavy blur, orange colour grading, HDR look, oversaturated colours, plastic-looking cheese, any text, logo or watermark, toppings not listed.`,
  },
  // ---------------- « Généreux par nature. » ----------------
  "table-desktop": {
    usage: "Plein cadre : la table — cadrage paysage",
    size: "3840x2160",
    draftSize: "1536x864",
    refs: ["public/images/food/plateau-burgers-frites.webp", "public/images/food/frites-cheddar-oignons.webp", "public/images/food/frenchy-le-forestier.webp"],
    prompt: `Reference 1 is a real photo of the restaurant's table service: white cardboard trays lined with grey newsprint-patterned paper, metal sauce cups, on a dark wooden table. Reference 2 is its real loaded fries. Reference 3 is its real baguette sandwich. Create a wide, generous, lived-in photograph of the same table, late evening, as if friends are about to eat.

From a three-quarter overhead angle: several of those white trays overlap naturally across the whole width of a dark worn wooden table: burgers in soft brioche buns with melted cheddar, a long baguette sandwich, thick golden fries, one tray of fries with cheddar sauce and crispy fried onions, small metal sauce cups. Some fries have fallen on the paper. Food is arranged the way real people leave it, never styled in a line. The food stays mostly toward the left, right and bottom edges of the frame: the centre of the frame is calmer, with more bare dark wood and less detail, because large typography will sit over it. Warm pendant light from above, falling off to black at the corners. Palette: deep browns, warm amber, black.

Only food from this list may appear. No beer, no wine, no glasses, no bottles, no candle, no jalapeños, no people, no hands.

${CRAFT}`,
  },
  "table-mobile": {
    usage: "Plein cadre : la table — cadrage portrait",
    size: "2160x3840",
    draftSize: "864x1536",
    refs: [{ asset: "table-desktop" }, "public/images/food/plateau-burgers-frites.webp"],
    prompt: `Reference 1 is the campaign scene. Recompose the same table as a true vertical photograph taken from directly above and slightly closer: same trays, same food, same wood, same warm pendant light, nothing new. Trays overlap naturally toward the top and bottom of the frame. The central horizontal band of the frame is calmer, with more bare dark wood, for large typography; the corners fall off to black. No beer, no wine, no glasses, no bottles, no candle, no jalapeños, no people, no hands.

${CRAFT}`,
  },

  // ---------------- Milkshakes : les trois de la carte, une seule série ----------------
  "milkshake-dubai": {
    usage: "Carte : Dubai Shake",
    size: "3520x2352",
    draftSize: "1536x1024",
    refs: ["public/images/food/milkshake-pistache.webp", "public/images/logo/burger-by-m.png"],
    prompt: `Reference 1 is a real photo of the restaurant's Dubai Shake: match its cup, its colours and its look. Reference 2 is the logo for the sticker. Create the same milkshake, photographed better.

${SHAKE_SET}

The recipe, nothing else: a pale pistachio-green vanilla and pistachio shake; thick streaks of chocolate-hazelnut spread running down the inside of the cup; on top of the whipped cream, crushed pistachios and a thin drizzle of chocolate-hazelnut spread.

${SHAKE_STYLE}`,
  },
  "milkshake-bueno-bomb": {
    usage: "Carte : Bueno Bomb’",
    size: "3520x2352",
    draftSize: "1536x1024",
    refs: [{ asset: "milkshake-dubai" }, "public/images/food/milkshake-caramel.webp", "public/images/logo/burger-by-m.png"],
    prompt: `Reference 1 is the previous picture of this menu series: keep the same set, hand position, framing and light. Reference 2 is a real photo of another milkshake of the restaurant: same wafer bar on top. Reference 3 is the logo for the sticker. Create the "Bueno Bomb" milkshake.

${SHAKE_SET}

The recipe, nothing else: a creamy pale beige vanilla and hazelnut shake; thick streaks of chocolate-hazelnut spread running down the inside of the cup; on top of the whipped cream, a thin drizzle of chocolate-hazelnut spread and two pieces of unwrapped chocolate-coated wafer bars filled with hazelnut cream, one with white chocolate and one with milk chocolate. No text on the bars.

${SHAKE_STYLE}`,
  },
  "milkshake-a-composer": {
    usage: "Carte : Milkshake à composer (exemple : coulis caramel, topping wafer chocolat blanc)",
    size: "3520x2352",
    draftSize: "1536x1024",
    refs: ["public/images/food/milkshake-caramel.webp", { asset: "milkshake-dubai" }, "public/images/logo/burger-by-m.png"],
    prompt: `Reference 1 is a real photo of a milkshake of the restaurant: match its recipe and its look. Reference 2 is the previous picture of this menu series: keep the same set, hand position, framing and light. Reference 3 is the logo for the sticker. Create the same caramel milkshake, photographed better.

${SHAKE_SET}

The recipe, nothing else: a creamy pale vanilla shake; thick streaks of caramel sauce running down the inside of the cup; on top of the whipped cream, a drizzle of caramel sauce and one piece of unwrapped white-chocolate-coated wafer bar. No text on the bar.

${SHAKE_STYLE}`,
  },

  // ---------------- Frites : quatre recettes, quatre visuels, une seule série ----------------
  "frites-classiques": {
    usage: "Carte : Frites classiques",
    size: "2880x1920",
    draftSize: "1536x1024",
    refs: ["public/images/food/frites-classiques.webp", "public/images/products/smash-double.webp"],
    prompt: `Reference 1 is a real photo of the restaurant's fries and tray. Reference 2 is one of the brand's menu pictures: match its backdrop, light and overall finish. Create the menu picture of the "Frites classiques".

${TRAY} It is generously filled with the same golden skinless french fries as in reference 1: irregular lengths, slightly different thicknesses, crisp edges, some darker tips, a few fine salt grains, a couple of fries resting on the tray edge.

${MENU_SET}

Only the tray of plain fries: no burger, no sauce, no sauce cup, no herbs, no fork, no garnish.

${CRAFT}`,
  },
  "frites-cheddar": {
    usage: "Carte : Frites cheddar",
    size: "2880x1920",
    draftSize: "1536x1024",
    refs: [{ asset: "frites-classiques" }, "public/images/food/frites-cheddar-oignons.webp"],
    prompt: `Reference 1 is the previous picture of this menu series: keep it. Reference 2 is a real photo of the restaurant's cheddar sauce, only for its colour and texture: ignore everything else in it (jalapeños, onions, fork, cup).

Create the "Frites cheddar" picture. The only change compared with reference 1: ${CHEDDAR}

${FRIES_RULE} No onions and no bacon.

${CRAFT}`,
  },
  "frites-cheddar-oignons": {
    usage: "Carte : Frites cheddar & oignons frits",
    size: "2880x1920",
    draftSize: "1536x1024",
    refs: [{ asset: "frites-cheddar" }, "public/images/food/frites-cheddar-oignons.webp"],
    prompt: `Reference 1 is the previous picture of this menu series: keep it. Reference 2 is a real photo of the restaurant's fried onions, only for their look: ignore the jalapeños, the fork and the cup.

Create the "Frites cheddar & oignons frits" picture. The only change compared with reference 1: a generous, uneven scattering of crispy fried onions on top of the melted cheddar: thin, irregular, deep golden-brown strands, matte and dry, clearly contrasting with the soft cheese.

${FRIES_RULE} No bacon.

${CRAFT}`,
  },
  "frites-cheddar-bacon": {
    usage: "Carte : Frites cheddar & bacon",
    size: "2880x1920",
    draftSize: "1536x1024",
    refs: [{ asset: "frites-cheddar" }],
    prompt: `Reference 1 is the previous picture of this menu series: keep it.

Create the "Frites cheddar & bacon" picture. The only change compared with reference 1: small chopped pieces of real crispy smoked bacon scattered unevenly on top of the melted cheddar: irregular sizes, browned edges, visible fat and lean, a little rendered fat.

${FRIES_RULE} No onions.

${CRAFT}`,
  },
};
