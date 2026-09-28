import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
  SimpleGrid,
} from "@chakra-ui/react";
import { toaster } from "./components/ui/toaster";
import { api, post, type Col, type Img } from "./api";
import { useAuth } from "./auth";
import {
  LuSearch,
  LuEye,
  LuCalendar,
  LuMaximize,
  LuTrash2,
  LuPlus,
  LuUpload,
  LuFolder,
  LuX,
} from "react-icons/lu";
import { FaGoogle, FaGithub } from "react-icons/fa";

const fail = (e: Error) => toaster.create({ title: e.message, type: "error" });

function ImageGrid({ images }: { images: Img[] }) {
  if (!images.length)
    return <Text color="fg.muted">Todavía no hay imágenes.</Text>;
  return (
    <SimpleGrid
      columns={{ base: 2, md: 3, lg: 4, xl: 5 }}
      gap={{ base: 2, md: 4 }}
    >
      {images.map((i) => (
        <Box
          key={i._id}
          asChild
          role="group"
          position="relative"
          aspectRatio={1}
          overflow="hidden"
          rounded="md"
          bg="bg.muted"
        >
          <Link to={`/images/${i._id}`}>
            <Image
              src={i.url}
              alt={i.title}
              w="full"
              h="full"
              objectFit="cover"
              loading="lazy"
              transition="transform .3s"
              _groupHover={{ transform: "scale(1.06)" }}
            />
            <Flex
              position="absolute"
              inset={0}
              align="flex-end"
              p={3}
              color="white"
              opacity={0}
              transition="opacity .2s"
              bg="linear-gradient(transparent 50%, rgba(0,0,0,.7))"
              _groupHover={{ opacity: 1 }}
              _groupFocusVisible={{ opacity: 1 }}
            >
              <Text fontSize="sm" fontWeight="medium" lineClamp={2}>
                {i.title}
              </Text>
            </Flex>
          </Link>
        </Box>
      ))}
    </SimpleGrid>
  );
}

export function Home() {
  const [images, setImages] = useState<Img[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const load = (p: number, query = q) =>
    api(`/api/images?page=${p}&q=${encodeURIComponent(query)}`)
      .then((d) => {
        setImages((prev) => (p === 1 ? d.items : [...prev, ...d.items]));
        setMore(d.hasMore);
        setPage(p);
      })
      .catch(fail);
  useEffect(() => {
    load(1);
  }, []);
  return (
    <Stack gap={6}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          load(1);
        }}
      >
        <Box position="relative">
          <Box
            position="absolute"
            left={4}
            top="50%"
            transform="translateY(-50%)"
            color="fg.muted"
            pointerEvents="none"
          >
            <LuSearch />
          </Box>
          <Input
            ps={11}
            size="lg"
            placeholder="Buscar por título, etiqueta o descripción"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Box>
      </form>
      <ImageGrid images={images} />
      {more && (
        <Button
          alignSelf="center"
          variant="outline"
          onClick={() => load(page + 1)}
        >
          Cargar más
        </Button>
      )}
    </Stack>
  );
}

export function ImageDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [img, setImg] = useState<Img | null>(null);
  const [cols, setCols] = useState<Col[]>([]);
  useEffect(() => {
    api(`/api/images/${id}`).then(setImg).catch(fail);
  }, [id]);
  useEffect(() => {
    if (user)
      api(`/api/collections?user=${user._id}`).then(setCols).catch(fail);
  }, [user]);
  if (!img) return null;
  const mine = user?._id === img.user._id;
  const add = (c: Col) =>
    post(`/api/collections/${c._id}/images`, { imageId: img._id })
      .then(() =>
        toaster.create({ title: `Añadida a ${c.name}`, type: "success" }),
      )
      .catch(fail);
  const remove = () =>
    api(`/api/images/${img._id}`, { method: "DELETE" })
      .then(() => {
        toaster.create({ title: "Imagen eliminada", type: "success" });
        nav("/");
      })
      .catch(fail);
  return (
    <Flex gap={{ base: 4, lg: 8 }} direction={{ base: "column", lg: "row" }}>
      <Image
        src={img.url}
        alt={img.title}
        flex={2}
        maxH="80vh"
        objectFit="contain"
        minW={0}
      />
      <Stack flex={1} gap={4}>
        <Heading>{img.title}</Heading>
        <Link to={`/?user=${img.user._id}`}>
          <Flex align="center" gap={2}>
            <Avatar.Root size="sm">
              <Avatar.Fallback name={img.user.name} />
              <Avatar.Image src={img.user.avatar} />
            </Avatar.Root>
            <Text>{img.user.name}</Text>
          </Flex>
        </Link>
        {img.description && <Text>{img.description}</Text>}
        <Flex wrap="wrap" gap={4} color="fg.muted" fontSize="sm">
          <Flex align="center" gap={1}>
            <LuMaximize /> {img.width}×{img.height}px
          </Flex>
          <Flex align="center" gap={1}>
            <LuEye /> {img.views} vistas
          </Flex>
          <Flex align="center" gap={1}>
            <LuCalendar /> {new Date(img.createdAt).toLocaleDateString()}
          </Flex>
        </Flex>
        <Flex wrap="wrap" gap={2}>
          {img.tags.map((t) => (
            <Text key={t} px={2} bg="bg.muted" rounded="full" fontSize="sm">
              {t}
            </Text>
          ))}
        </Flex>
        {user && (
          <Stack>
            <Text fontWeight="medium">Añadir a una colección</Text>
            <Flex wrap="wrap" gap={2}>
              {cols.map((c) => (
                <Button
                  key={c._id}
                  size="sm"
                  variant="outline"
                  onClick={() => add(c)}
                >
                  <LuPlus /> {c.name}
                </Button>
              ))}
              {!cols.length && (
                <Button size="sm" asChild>
                  <Link to="/collections">Crear colección</Link>
                </Button>
              )}
            </Flex>
          </Stack>
        )}
        {mine && (
          <Button colorPalette="red" variant="subtle" onClick={remove}>
            <LuTrash2 /> Eliminar imagen
          </Button>
        )}
      </Stack>
    </Flex>
  );
}

export function Upload() {
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState({ title: "", description: "", tags: "" });
  const [busy, setBusy] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!file)
      return toaster.create({ title: "Selecciona una imagen", type: "error" });
    const body = new FormData();
    body.append("file", file);
    Object.entries(f).forEach(([k, v]) => body.append(k, v));
    setBusy(true);
    api("/api/images", { method: "POST", body })
      .then((i) => {
        toaster.create({ title: "Imagen publicada", type: "success" });
        nav(`/images/${i._id}`);
      })
      .catch(fail)
      .finally(() => setBusy(false));
  };
  return (
    <form onSubmit={submit}>
      <Stack maxW="lg" mx="auto" gap={4}>
        <Heading>Subir imagen</Heading>
        <Input
          type="file"
          accept="image/*"
          pt={1}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <Image
            src={URL.createObjectURL(file)}
            maxH="300px"
            objectFit="contain"
          />
        )}
        <Input
          placeholder="Título"
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
        />
        <Textarea
          placeholder="Descripción"
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
        />
        <Input
          placeholder="Etiquetas separadas por coma"
          value={f.tags}
          onChange={(e) => setF({ ...f, tags: e.target.value })}
        />
        <Button type="submit" loading={busy}>
          <LuUpload /> Publicar
        </Button>
      </Stack>
    </form>
  );
}

export function Collections() {
  const { user } = useAuth();
  const [cols, setCols] = useState<Col[]>([]);
  const [name, setName] = useState("");
  const load = () => api("/api/collections").then(setCols).catch(fail);
  useEffect(() => {
    load();
  }, []);
  const create = (e: FormEvent) => {
    e.preventDefault();
    post("/api/collections", { name })
      .then(() => {
        setName("");
        load();
        toaster.create({ title: "Colección creada", type: "success" });
      })
      .catch(fail);
  };
  return (
    <Stack gap={6}>
      <Heading>Colecciones</Heading>
      {user && (
        <form onSubmit={create}>
          <Flex gap={2} maxW="md">
            <Input
              placeholder="Nombre de la nueva colección"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit">
              <LuPlus /> Crear
            </Button>
          </Flex>
        </form>
      )}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
        {cols.map((c) => (
          <Link key={c._id} to={`/collections/${c._id}`}>
            <Flex
              h="48"
              bg="bg.muted"
              rounded="md"
              overflow="hidden"
              align="center"
              justify="center"
              color="fg.subtle"
            >
              {c.images[0] ? (
                <Image
                  src={c.images[0].url}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              ) : (
                <LuFolder size={40} />
              )}
            </Flex>
            <Text fontWeight="medium" mt={2}>
              {c.name}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              por {c.user.name}
            </Text>
          </Link>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export function CollectionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [c, setC] = useState<Col | null>(null);
  useEffect(() => {
    api(`/api/collections/${id}`).then(setC).catch(fail);
  }, [id]);
  if (!c) return null;
  const mine = user?._id === c.user._id;
  const del = () =>
    api(`/api/collections/${c._id}`, { method: "DELETE" })
      .then(() => nav("/collections"))
      .catch(fail);
  const take = (imageId: string) =>
    api(`/api/collections/${c._id}/images/${imageId}`, { method: "DELETE" })
      .then(() =>
        setC({ ...c, images: c.images.filter((i) => i._id !== imageId) }),
      )
      .catch(fail);
  return (
    <Stack gap={6}>
      <Flex
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box flex={1}>
          <Heading>{c.name}</Heading>
          <Text color="fg.muted">
            por {c.user.name} · {c.images.length} imágenes
          </Text>
        </Box>
        {mine && (
          <Button colorPalette="red" variant="subtle" onClick={del}>
            <LuTrash2 /> Eliminar colección
          </Button>
        )}
      </Flex>
      <ImageGrid images={c.images} />
      {mine && c.images.length > 0 && (
        <Flex wrap="wrap" gap={2}>
          {c.images.map((i) => (
            <Button
              key={i._id}
              size="xs"
              variant="outline"
              onClick={() => take(i._id)}
            >
              <LuX /> Quitar “{i.title}”
            </Button>
          ))}
        </Flex>
      )}
    </Stack>
  );
}

export function Login() {
  return (
    <Stack maxW="sm" mx="auto" gap={4} pt={12}>
      <Heading>Entrar a Unsplash Col</Heading>
      <Text color="fg.muted">
        Sube tus imágenes y organízalas en colecciones.
      </Text>
      <Button asChild>
        <a href="/auth/google">
          <FaGoogle /> Continuar con Google
        </a>
      </Button>
      <Button variant="outline" asChild>
        <a href="/auth/github">
          <FaGithub /> Continuar con GitHub
        </a>
      </Button>
    </Stack>
  );
}
