import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Image, Collection } from "./models";
import { requireAuth, AuthReq } from "./auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_r, f, cb) => cb(null, f.mimetype.startsWith("image/")),
});
const r = Router();
const userFields = "name avatar";

// ---- Imágenes ----
r.get("/images", async (req, res) => {
  const { q, user, page = "1" } = req.query as Record<string, string>;
  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (user) filter.user = user;
  const limit = 24,
    skip = (Number(page) - 1) * limit;
  const [items, total] = await Promise.all([
    Image.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", userFields),
    Image.countDocuments(filter),
  ]);
  res.json({ items, hasMore: skip + items.length < total });
});

r.get("/images/:id", async (req, res) => {
  const img = await Image.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true },
  ).populate("user", userFields);
  img ? res.json(img) : res.status(404).json({ error: "Imagen no encontrada" });
});

r.post(
  "/images",
  requireAuth,
  upload.single("file"),
  async (req: AuthReq, res) => {
    if (!req.file)
      return res.status(400).json({ error: "Sube un archivo de imagen" });
    if (!req.body.title?.trim())
      return res.status(400).json({ error: "El título es obligatorio" });
    const result: any = await new Promise((ok, fail) =>
      cloudinary.uploader
        .upload_stream({ folder: "unsplash_collection" }, (e, r) => (e ? fail(e) : ok(r)))
        .end(req.file!.buffer),
    );
    const img = await Image.create({
      user: req.userId,
      title: req.body.title,
      description: req.body.description,
      tags: (req.body.tags || "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
    res.status(201).json(img);
  },
);

r.delete("/images/:id", requireAuth, async (req: AuthReq, res) => {
  const img = await Image.findOne({ _id: req.params.id, user: req.userId });
  if (!img) return res.status(404).json({ error: "Imagen no encontrada" });
  await cloudinary.uploader.destroy(img.publicId);
  await Promise.all([
    img.deleteOne(),
    Collection.updateMany({}, { $pull: { images: img._id } }),
  ]);
  res.json({ ok: true });
});

// ---- Colecciones ----
r.get("/collections", async (req, res) => {
  const filter = req.query.user ? { user: req.query.user } : {};
  res.json(
    await Collection.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", userFields)
      .populate({ path: "images", options: { limit: 1 } }),
  );
});

r.get("/collections/:id", async (req, res) => {
  const c = await Collection.findById(req.params.id)
    .populate("user", userFields)
    .populate("images");
  c ? res.json(c) : res.status(404).json({ error: "Colección no encontrada" });
});

r.post("/collections", requireAuth, async (req: AuthReq, res) => {
  if (!req.body.name?.trim())
    return res.status(400).json({ error: "El nombre es obligatorio" });
  res
    .status(201)
    .json(
      await Collection.create({
        user: req.userId,
        name: req.body.name,
        description: req.body.description,
      }),
    );
});

r.post("/collections/:id/images", requireAuth, async (req: AuthReq, res) => {
  const c = await Collection.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $addToSet: { images: req.body.imageId } },
    { new: true },
  );
  c ? res.json(c) : res.status(404).json({ error: "Colección no encontrada" });
});

r.delete(
  "/collections/:id/images/:imageId",
  requireAuth,
  async (req: AuthReq, res) => {
    const c = await Collection.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $pull: { images: req.params.imageId } },
      { new: true },
    );
    c
      ? res.json(c)
      : res.status(404).json({ error: "Colección no encontrada" });
  },
);

r.delete("/collections/:id", requireAuth, async (req: AuthReq, res) => {
  const c = await Collection.findOneAndDelete({
    _id: req.params.id,
    user: req.userId,
  });
  c
    ? res.json({ ok: true })
    : res.status(404).json({ error: "Colección no encontrada" });
});

export default r;
