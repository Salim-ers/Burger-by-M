-- Frites : un visuel distinct par recette (visuels d'illustration, le produit reste signalé « Photo d'illustration »).
-- Données uniquement. Seules les lignes encore sur les anciens visuels du seed sont modifiées :
-- une image choisie ou importée depuis /admin/menu n'est jamais écrasée.
UPDATE "product_images" AS i
SET "src" = v."src", "alt" = v."alt"
FROM (VALUES
  ('frites-classiques', '/images/products/frites-classiques.webp', 'Frites classiques dorées dans leur barquette (visuel d’illustration)'),
  ('frites-cheddar', '/images/products/frites-cheddar.webp', 'Frites nappées de cheddar fondu dans leur barquette (visuel d’illustration)'),
  ('frites-cheddar-oignons-frits', '/images/products/frites-cheddar-oignons.webp', 'Frites au cheddar fondu et aux oignons frits croustillants dans leur barquette (visuel d’illustration)'),
  ('frites-cheddar-bacon', '/images/products/frites-cheddar-bacon.webp', 'Frites au cheddar fondu et aux éclats de bacon croustillant dans leur barquette (visuel d’illustration)')
) AS v("slug", "src", "alt"), "products" AS p
WHERE p."slug" = v."slug"
  AND i."product_id" = p."id"
  AND i."src" IN ('/images/food/frites-classiques.webp', '/images/food/frites-cheddar-oignons.webp');
