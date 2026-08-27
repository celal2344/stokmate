import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/products",
      search: { q: "", sort: "name", dir: "asc", page: 1, pageSize: 20 },
    });
  },
});
