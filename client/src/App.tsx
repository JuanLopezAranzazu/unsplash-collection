import { Link, Route, Routes, Navigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { useTheme } from "next-themes";
import {
  LuSun,
  LuMoon,
  LuUpload,
  LuFolder,
  LuLogOut,
  LuLogIn,
  LuUser,
} from "react-icons/lu";

import { useAuth } from "./auth";
import {
  Home,
  ImageDetail,
  Upload,
  Collections,
  CollectionDetail,
  Login,
} from "./pages";

export default function App() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Box colorPalette="brand" minH="100vh">
      <Flex
        as="header"
        px={{ base: 3, sm: 4, md: 6 }}
        py={3}
        align="center"
        gap={{ base: 1, sm: 2, md: 3 }}
        borderBottomWidth="1px"
        position="sticky"
        top={0}
        bg="bg/90"
        backdropFilter="blur(8px)"
        zIndex={10}
      >
        <Heading
          size={{ base: "md", sm: "lg", md: "xl" }}
          color="colorPalette.fg"
          asChild
          truncate
          flexShrink={1}
        >
          <Link to="/">Unsplash Col</Link>
        </Heading>

        <Button
          variant="ghost"
          display={{ base: "none", md: "inline-flex" }}
          asChild
        >
          <Link to="/collections">
            <LuFolder />
            Colecciones
          </Link>
        </Button>

        <Box flex={1} />

        <IconButton
          variant="ghost"
          aria-label="Cambiar tema"
          onClick={() => setTheme(dark ? "light" : "dark")}
          flexShrink={0}
        >
          {dark ? <LuSun /> : <LuMoon />}
        </IconButton>

        {user ? (
          <>
            <Button
              display={{ base: "none", md: "inline-flex" }}
              colorPalette="brand"
              asChild
            >
              <Link to="/upload">
                <LuUpload />
                Subir imagen
              </Link>
            </Button>

            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <Button
                  variant="plain"
                  p={0}
                  minW={0}
                  rounded="full"
                  aria-label="Menú de usuario"
                  flexShrink={0}
                >
                  <Avatar.Root size={{ base: "xs", sm: "sm" }}>
                    <Avatar.Fallback name={user.name} />
                    <Avatar.Image src={user.avatar} />
                  </Avatar.Root>
                </Button>
              </Menu.Trigger>

              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="52">
                    <Menu.Item value="name" disabled fontWeight="medium">
                      <LuUser />
                      {user.name}
                    </Menu.Item>

                    <Menu.Item
                      value="upload"
                      display={{ base: "flex", md: "none" }}
                      asChild
                    >
                      <Link to="/upload">
                        <LuUpload />
                        Subir imagen
                      </Link>
                    </Menu.Item>

                    <Menu.Item
                      value="collections"
                      display={{ base: "flex", md: "none" }}
                      asChild
                    >
                      <Link to="/collections">
                        <LuFolder />
                        Colecciones
                      </Link>
                    </Menu.Item>

                    <Menu.Separator />

                    <Menu.Item value="logout" color="fg.error" onClick={logout}>
                      <LuLogOut />
                      Cerrar sesión
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              display={{ base: "inline-flex", md: "none" }}
              asChild
              px={2}
            >
              <Link to="/collections">
                <LuFolder />
              </Link>
            </Button>

            <Button asChild size={{ base: "sm", sm: "md" }} flexShrink={0}>
              <Link to="/login">
                <LuLogIn />
                <Box display={{ base: "none", sm: "block" }}>Entrar</Box>
              </Link>
            </Button>
          </>
        )}
      </Flex>

      <Container
        maxW="7xl"
        px={{ base: 3, sm: 4, md: 6 }}
        py={{ base: 4, md: 8 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/images/:id" element={<ImageDetail />} />
          <Route
            path="/upload"
            element={user ? <Upload /> : <Navigate to="/login" />}
          />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Container>
    </Box>
  );
}
