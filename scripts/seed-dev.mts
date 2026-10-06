/**
 * Seed del ambiente de DESARROLLO: usuarios, artesanos, productos, horarios,
 * reseñas y solicitudes de verificación de prueba.
 *
 *   npm run seed:dev
 *
 * Lee .env.local y SOLO corre si NEXT_PUBLIC_SUPABASE_URL apunta al proyecto
 * SUPABASE_DEV_PROJECT_REF (o a un Supabase local). Es re-ejecutable: primero
 * borra todo lo que creó la vez anterior (usuarios @SEED_DOMAIN y sus archivos).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SEED_DOMAIN = "example.com";
const PASSWORD = "demo1234";

// ============ GUARDIA: nunca contra producción ============
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const devRef = process.env.SUPABASE_DEV_PROJECT_REF;
if (!url || !serviceKey) abort("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.");
const host = new URL(url).hostname;
const isLocal = host === "localhost" || host === "127.0.0.1";
if (!isLocal && (!devRef || host !== `${devRef}.supabase.co`)) {
  abort(
    `La URL de Supabase (${host}) no es la del proyecto DEV.\n` +
      "Define SUPABASE_DEV_PROJECT_REF en .env.local con el ref del proyecto de desarrollo. " +
      "Este script jamás debe correr contra producción."
  );
}

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

// ============ DATOS ============
type Category =
  | "carteras_bolsos" | "zapatos_cuero" | "quesos_alimentos" | "ceramica"
  | "tejidos" | "joyeria" | "madera" | "otros";
type Verification = "verificado" | "pendiente" | "rechazado" | "no_verificado";

interface SeedArtisan {
  email: string;
  name: string;
  shop: string;
  slug: string;
  comuna: string;
  category: Category;
  verification: Verification;
  story: string;
  instagram?: string;
  whatsapp?: string;
  products: { name: string; description: string; price: number | null; category?: Category; available?: boolean }[];
  schedules: { day: number; place: string; comuna: string; time: string; notes?: string }[];
}

const ARTISANS: SeedArtisan[] = [
  {
    email: "artesano1", name: "Jorge Muñoz", shop: "Cueros del Maule", slug: "cueros-del-maule",
    comuna: "Talca", category: "zapatos_cuero", verification: "verificado",
    story: "Trabajo el cuero hace 25 años en el mismo taller que me dejó mi padre. Cada par de zapatos lleva dos semanas de costura a mano.",
    instagram: "https://instagram.com/cuerosdelmaule", whatsapp: "+56 9 1111 1111",
    products: [
      { name: "Botín chelsea café", description: "Cuero curtido vegetal, suela de goma cosida.", price: 89990 },
      { name: "Mocasín de cuero negro", description: "Forro de cabritilla, horma ancha.", price: 64990 },
      { name: "Cinturón trenzado", description: "Hebilla de bronce, a medida.", price: 24990 },
      { name: "Sandalia de verano", description: "Tiras de cuero natural.", price: 39990, available: false },
    ],
    schedules: [
      { day: 6, place: "Feria Persa Talca", comuna: "Talca", time: "10:00 - 18:00" },
      { day: 7, place: "Mercado Central", comuna: "Talca", time: "09:00 - 14:00", notes: "Puesto 14" },
    ],
  },
  {
    email: "artesano2", name: "Rosa Catalán", shop: "Telar de la Abuela Rosa", slug: "telar-de-la-abuela-rosa",
    comuna: "Ñuñoa", category: "tejidos", verification: "verificado",
    story: "Tejo a telar mapuche con lana de oveja que hilo y tiño con plantas del sur.",
    instagram: "https://instagram.com/telarrosa", whatsapp: "+56 9 2222 2222",
    products: [
      { name: "Manta de lana natural", description: "Teñida con nalca y maqui. 1,5 x 2 m.", price: 120000 },
      { name: "Bufanda tejida a palillo", description: "Lana merino, colores a elección.", price: 22000 },
      { name: "Gorro con pompón", description: "Talla única.", price: 15000 },
      { name: "Tapiz decorativo", description: "Diseño trarilonko, 60 x 90 cm.", price: null },
    ],
    schedules: [{ day: 6, place: "Feria Plaza Ñuñoa", comuna: "Ñuñoa", time: "11:00 - 19:00" }],
  },
  {
    email: "artesano3", name: "Luis Soto", shop: "Greda de Pomaire", slug: "greda-de-pomaire",
    comuna: "Melipilla", category: "ceramica", verification: "verificado",
    story: "Tercera generación de alfareros en Pomaire. Torno, horno a leña y mucha paciencia.",
    whatsapp: "+56 9 3333 3333",
    products: [
      { name: "Paila de greda", description: "Ideal para pastel de choclo. Apta para horno.", price: 12000 },
      { name: "Set de 4 tazones", description: "Esmaltados en azul.", price: 28000 },
      { name: "Chanchito de la suerte", description: "El clásico de Pomaire.", price: 5000, category: "otros" },
      { name: "Fuente ovalada grande", description: "40 cm de largo.", price: 18000 },
    ],
    schedules: [
      { day: 6, place: "Calle Roberto Bravo", comuna: "Pomaire", time: "10:00 - 20:00" },
      { day: 7, place: "Calle Roberto Bravo", comuna: "Pomaire", time: "10:00 - 20:00" },
    ],
  },
  {
    email: "artesano4", name: "Carmen Fuentes", shop: "Quesería Los Robles", slug: "queseria-los-robles",
    comuna: "Paine", category: "quesos_alimentos", verification: "pendiente",
    story: "Quesos de cabra madurados en bodega de adobe. Mermeladas con fruta de nuestro huerto.",
    instagram: "https://instagram.com/queserialosrobles",
    products: [
      { name: "Queso de cabra madurado", description: "500 g, 3 meses de maduración.", price: 9500 },
      { name: "Queso fresco con merkén", description: "250 g.", price: 4500 },
      { name: "Mermelada de murta", description: "Frasco de 300 g.", price: 4000 },
    ],
    schedules: [{ day: 3, place: "Feria Libre Paine", comuna: "Paine", time: "08:00 - 14:00" }],
  },
  {
    email: "artesano5", name: "Andrés Vidal", shop: "Plata Viva", slug: "plata-viva",
    comuna: "Valparaíso", category: "joyeria", verification: "rechazado",
    story: "Orfebrería en plata 950 y lapislázuli chileno, hecha en un taller en el Cerro Alegre.",
    products: [
      { name: "Aros de plata y lapislázuli", description: "Plata 950.", price: 32000 },
      { name: "Anillo martillado", description: "Talla a pedido.", price: 27000 },
      { name: "Collar trapelacucha", description: "Inspirado en la joyería mapuche.", price: 58000 },
    ],
    schedules: [{ day: 7, place: "Feria de Antigüedades Av. Argentina", comuna: "Valparaíso", time: "10:00 - 17:00" }],
  },
  {
    email: "artesano6", name: "Pedro Hernández", shop: "Taller Raulí", slug: "taller-rauli",
    comuna: "Puerto Varas", category: "madera", verification: "no_verificado",
    story: "Muebles y utensilios de cocina en raulí y lenga recuperados.",
    whatsapp: "+56 9 6666 6666",
    products: [
      { name: "Tabla de picar de raulí", description: "40 x 25 cm, terminación con aceite de linaza.", price: 19990 },
      { name: "Set de cucharas de palo", description: "3 tamaños.", price: 12990 },
      { name: "Piso de lenga", description: "Hecho sin clavos.", price: 75000 },
    ],
    schedules: [],
  },
  {
    email: "artesano7", name: "Valentina Rojas", shop: "Bolsos Mapocho", slug: "bolsos-mapocho",
    comuna: "Providencia", category: "carteras_bolsos", verification: "no_verificado",
    story: "Carteras y mochilas de lona encerada y cuero reciclado.",
    instagram: "https://instagram.com/bolsosmapocho",
    products: [
      { name: "Mochila de lona encerada", description: "Impermeable, 20 L.", price: 54990 },
      { name: "Banano de cuero", description: "Cierre YKK.", price: 22990 },
      { name: "Tote bag estampada", description: "Algodón grueso.", price: 14990 },
    ],
    schedules: [{ day: 5, place: "Feria Bellavista", comuna: "Providencia", time: "17:00 - 22:00" }],
  },
];

const BUYERS = [
  "Camila Pérez", "Matías González", "Javiera Díaz", "Benjamín Silva", "Fernanda Morales",
  "Tomás Araya", "Catalina Reyes", "Diego Castillo", "Antonia Flores", "Sebastián Torres",
];

const REVIEW_COMMENTS = [
  "Excelente calidad, se nota el trabajo a mano.",
  "Muy buena atención en la feria, volveré.",
  "Llegó tal como en las fotos.",
  "Lindo producto, pero demoró un poco.",
  "Precio justo para lo que es.",
  "",
];

// ============ HELPERS ============
function abort(msg: string): never {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

/** PRNG determinista para que el seed genere siempre lo mismo. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(42);

const emailFor = (local: string) => `${local}@${SEED_DOMAIN}`;

type Result = { data: unknown; error: { message: string } | null };
function check<R extends Result>(res: R, what: string): Extract<R, { error: null }>["data"] {
  if (res.error) abort(`${what}: ${res.error.message}`);
  return res.data;
}

/** Descarga una foto de prueba y la sube al bucket. Devuelve el path, o null si falla la descarga. */
async function uploadPhoto(bucket: "images" | "verification", path: string, seed: string, w = 800, h = 800) {
  try {
    const res = await fetch(`https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.arrayBuffer();
    const { error } = await db.storage.from(bucket).upload(path, body, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(error.message);
    return path;
  } catch (e) {
    console.warn(`  ⚠ sin foto para ${path} (${(e as Error).message})`);
    return null;
  }
}

async function publicPhoto(path: string, seed: string, w?: number, h?: number) {
  const ok = await uploadPhoto("images", path, seed, w, h);
  return ok ? db.storage.from("images").getPublicUrl(ok).data.publicUrl : null;
}

/** Lista recursivamente todos los archivos bajo un prefijo. */
async function listFiles(client: SupabaseClient, bucket: string, prefix: string): Promise<string[]> {
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error || !data) return [];
  const out: string[] = [];
  for (const item of data) {
    const full = `${prefix}/${item.name}`;
    if (item.id === null) out.push(...(await listFiles(client, bucket, full)));
    else out.push(full);
  }
  return out;
}

async function createUser(local: string, fullName: string) {
  const { user } = check(
    await db.auth.admin.createUser({
      email: emailFor(local),
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
    `crear usuario ${local}`
  );
  return user.id;
}

// ============ LIMPIEZA ============
async function cleanup() {
  console.log("→ Borrando datos de un seed anterior…");
  const ids: string[] = [];
  for (let page = 1; ; page++) {
    const { users } = check(await db.auth.admin.listUsers({ page, perPage: 1000 }), "listar usuarios");
    ids.push(...users.filter((u) => u.email?.endsWith(`@${SEED_DOMAIN}`)).map((u) => u.id));
    if (users.length < 1000) break;
  }
  for (const id of ids) {
    for (const bucket of ["images", "verification"]) {
      const files = await listFiles(db, bucket, id);
      if (files.length) await db.storage.from(bucket).remove(files);
    }
    // on delete cascade limpia profiles, artisans, products, horarios, reseñas y solicitudes
    check(await db.auth.admin.deleteUser(id), `borrar usuario ${id}`);
  }
  console.log(`  ${ids.length} usuarios borrados`);
}

// ============ SEED ============
async function seed() {
  console.log(`\nSeed de desarrollo contra ${host}\n`);
  await cleanup();

  console.log("→ Admin");
  const adminId = await createUser("admin", "Admin Demo");
  check(await db.from("profiles").update({ role: "admin" }).eq("id", adminId), "marcar admin");

  console.log("→ Compradores");
  const buyerIds: string[] = [];
  for (const [i, name] of BUYERS.entries()) buyerIds.push(await createUser(`comprador${i + 1}`, name));

  console.log("→ Artesanos, productos y horarios");
  const artisanIds: string[] = [];
  for (const a of ARTISANS) {
    const ownerId = await createUser(a.email, a.name);
    const [profilePhoto, coverPhoto] = await Promise.all([
      publicPhoto(`${ownerId}/perfil/seed.jpg`, `${a.slug}-perfil`, 400, 400),
      publicPhoto(`${ownerId}/portada/seed.jpg`, `${a.slug}-portada`, 1200, 300),
    ]);

    const artisan = check(
      await db.from("artisans").insert({
        owner_id: ownerId,
        slug: a.slug,
        shop_name: a.shop,
        story: a.story,
        comuna: a.comuna,
        main_category: a.category,
        profile_photo_url: profilePhoto,
        cover_photo_url: coverPhoto,
        instagram_url: a.instagram ?? null,
        whatsapp_phone: a.whatsapp ?? null,
        contact_email: emailFor(a.email),
      }).select("id").single(),
      `crear artesano ${a.slug}`
    );
    artisanIds.push(artisan.id);

    const products = await Promise.all(
      a.products.map(async (p, i) => {
        const photos = await Promise.all(
          [0, 1].slice(0, 1 + (i % 2)).map((n) => publicPhoto(`${ownerId}/productos/seed-${i}-${n}.jpg`, `${a.slug}-${i}-${n}`))
        );
        return {
          artisan_id: artisan.id,
          name: p.name,
          description: p.description,
          price_clp: p.price,
          category: p.category ?? a.category,
          photo_urls: photos.filter((u): u is string => !!u),
          available: p.available ?? true,
        };
      })
    );
    check(await db.from("products").insert(products), `productos de ${a.slug}`);

    if (a.schedules.length) {
      check(
        await db.from("market_schedules").insert(
          a.schedules.map((s) => ({
            artisan_id: artisan.id, day_of_week: s.day, place_name: s.place,
            comuna: s.comuna, time_range: s.time, notes: s.notes ?? "",
          }))
        ),
        `horarios de ${a.slug}`
      );
    }

    // El trigger sync_artisan_verification deja el verification_status del artesano según la solicitud.
    if (a.verification !== "no_verificado") {
      const [stall, making] = await Promise.all([
        uploadPhoto("verification", `${ownerId}/puesto-seed.jpg`, `${a.slug}-puesto`, 1200, 900),
        uploadPhoto("verification", `${ownerId}/haciendo-seed.jpg`, `${a.slug}-haciendo`, 1200, 900),
      ]);
      const status = { verificado: "aprobada", pendiente: "pendiente", rechazado: "rechazada" }[a.verification];
      check(
        await db.from("verification_requests").insert({
          artisan_id: artisan.id,
          stall_photo_path: stall ?? `${ownerId}/puesto-seed.jpg`,
          making_photo_path: making ?? `${ownerId}/haciendo-seed.jpg`,
          message: "Hola, adjunto fotos de mi puesto y de mi taller.",
          status,
          admin_comment: a.verification === "rechazado" ? "Las fotos no muestran el proceso de fabricación." : "",
          reviewed_at: status === "pendiente" ? null : new Date().toISOString(),
        }),
        `solicitud de ${a.slug}`
      );
    }
    console.log(`  ✓ ${a.shop} (${a.verification})`);
  }

  console.log("→ Reseñas");
  const reviews: { artisan_id: string; author_id: string; stars: number; comment: string; hidden: boolean }[] = [];
  for (const authorId of buyerIds) {
    const picked = [...artisanIds].sort(() => rand() - 0.5).slice(0, 3);
    for (const artisanId of picked) {
      reviews.push({
        artisan_id: artisanId,
        author_id: authorId,
        stars: 3 + Math.floor(rand() * 3),
        comment: REVIEW_COMMENTS[Math.floor(rand() * REVIEW_COMMENTS.length)],
        hidden: false,
      });
    }
  }
  // Una reseña ofensiva ya moderada y una mala visible, para probar el panel de admin.
  reviews[0] = { ...reviews[0], stars: 1, comment: "Comentario ofensivo de prueba (moderado).", hidden: true };
  reviews[1] = { ...reviews[1], stars: 1, comment: "No me respondieron nunca por WhatsApp." };
  check(await db.from("reviews").insert(reviews), "reseñas");
  console.log(`  ${reviews.length} reseñas`);

  console.log(`
✔ Listo. Todas las cuentas usan la contraseña "${PASSWORD}":
  admin@${SEED_DOMAIN}                          (admin)
  artesano1..${ARTISANS.length}@${SEED_DOMAIN}                 (artesanos)
  comprador1..${BUYERS.length}@${SEED_DOMAIN}               (compradores)
`);
}

await seed();
