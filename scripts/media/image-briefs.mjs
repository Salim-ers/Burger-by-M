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
    refs: ["public/images/food/smash-le-special.webp", "public/images/food/plateau-burgers-frites.webp"],
    prompt: `Reference 1 is a real photo of the restaurant's burger. Reference 2 shows its real paper and table. Create a wide cinematic campaign photograph of this same kind of burger, in a true scene.

${BURGER}

Scene: late evening, the burger rests on slightly crumpled greaseproof paper on a worn black steel counter at the pass of a small working restaurant kitchen. Composition: a wide shot, the camera far back. The burger sits at the right third of the frame, low in the image, and is only about 20% of the frame width: the place matters as much as the product. Much of the counter and the kitchen is visible around it. The whole left half of the frame falls into almost pure black shadow, with only faint warm reflections on the steel and a few very soft out-of-focus kitchen lights far behind, leaving calm space for a headline. A single warm lamp from the upper right rakes across the bun and the cheese. A thin wisp of steam rises from the burger. Palette: deep blacks, warm brown and amber.

${CRAFT}`,
  },
  "hero-mobile": {
    usage: "Hero de l'accueil — cadrage portrait (vrai recadrage, pas une découpe)",
    size: "2160x3840",
    draftSize: "864x1536",
    refs: [{ asset: "hero-desktop" }, "public/images/food/smash-le-special.webp"],
    prompt: `Reference 1 is the campaign scene. Recompose the same scene as a true vertical photograph, as if the photographer had walked closer and turned the camera: same counter, same light, same burger, same mood, nothing new.

${BURGER}

Composition: the camera stays back. The burger is horizontally centred, its centre about 36% from the top of the frame, and only about 58% of the frame width. Above and around it, dark kitchen depth with soft distant warm lights. The lower 48% of the frame is the dark steel counter falling smoothly to near black, calm enough for a large headline. Warm lamp from the upper right, a thin wisp of steam.

${CRAFT}`,
  },

  // ---------------- « Votre burger commence quand vous commandez. » ----------------
  plancha: {
    usage: "Séquence éditoriale : le moment où le burger commence",
    size: "2160x2688",
    draftSize: "1024x1280",
    refs: ["public/images/food/smash-le-special.webp"],
    prompt: `Reference 1 shows the real finished burger: match its cheese, its beef crust and its warm colour.

Create a close-up action photograph on a black steel flat-top griddle in a working restaurant kitchen: two thin smashed beef patties, just pressed, with craggy, lacy, deeply browned edges, each with a slice of cheddar that has only just begun to soften and slump over the meat. Tiny beads of sizzling fat around the edges, a real wisp of steam backlit by a warm lamp. The worn, scratched edge of a metal spatula enters the frame from the upper right. Very shallow depth of field. The griddle surface is seasoned, dark, with honest traces of use. The lower-left part of the frame falls into darkness.

${CRAFT}`,
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
