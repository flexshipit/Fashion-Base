"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUploader from "@/components/admin/ImageUploader";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";

function mapImage(image) {
  if (image?.url) return { url: image.url, fileId: image.fileId || "" };
  return null;
}

export default function AdminStoreSettingsPage() {
  const queryClient = useQueryClient();
  const [siteName, setSiteName] = useState("");
  const [description, setDescription] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [footerNote, setFooterNote] = useState("");
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [dirty, setDirty] = useState(false);

  const query = useQuery({
    queryKey: ["admin", "site"],
    queryFn: async () => {
      const res = await fetch("/api/admin/site", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load settings");
      return data.site;
    },
  });

  useEffect(() => {
    if (!query.data) return;
    setSiteName(query.data.siteName || "");
    setDescription(query.data.description || "");
    setAnnouncement(query.data.announcement || "");
    setFooterNote(query.data.footerNote || "");
    setLogo(mapImage(query.data.logo));
    setFavicon(mapImage(query.data.favicon));
    setDirty(false);
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          siteName,
          description,
          announcement,
          footerNote,
          logo: logo || { url: "", fileId: "" },
          favicon: favicon || { url: "", fileId: "" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "site"] });
      setDirty(false);
      toast.success("Store settings saved. Refresh the shop to see them.");
    },
    onError: (error) => toast.error(error.message),
  });

  if (query.isLoading) {
    return <Loading label="Loading store settings..." />;
  }

  if (query.isError) {
    return (
      <ErrorState message={query.error.message} onRetry={query.refetch} />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Store settings</h1>
          <p className="mt-1 text-sm text-base-content/80">
            Page name, logo, favicon, announcement bar, and footer copy.
          </p>
        </div>
        <Button
          loading={saveMutation.isPending}
          disabled={!dirty || !siteName.trim()}
          onClick={() => saveMutation.mutate()}
        >
          Save changes
        </Button>
      </div>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="text-lg font-semibold text-base-content">Identity</h2>
        <Input
          label="Page name"
          value={siteName}
          onChange={(event) => {
            setSiteName(event.target.value);
            setDirty(true);
          }}
          placeholder="FlexShop"
          required
        />
        <Textarea
          label="Short description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setDirty(true);
          }}
          placeholder="Shown in the browser tab description"
          rows={3}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="text-lg font-semibold text-base-content">Logo</h2>
        <p className="text-sm text-base-content/75">
          Shown beside the page name in the header and footer. A square mark works best.
        </p>
        <ImageUploader
          images={logo ? [logo] : []}
          onChange={(images) => {
            setLogo(images.at(-1) || null);
            setDirty(true);
          }}
          maxFiles={1}
          folder="/brand"
          label="Logo"
          helpText="PNG or JPG. Transparent background recommended."
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="text-lg font-semibold text-base-content">Favicon</h2>
        <p className="text-sm text-base-content/75">
          The small icon in the browser tab. Use a square image.
        </p>
        <ImageUploader
          images={favicon ? [favicon] : []}
          onChange={(images) => {
            setFavicon(images.at(-1) || null);
            setDirty(true);
          }}
          maxFiles={1}
          folder="/brand"
          label="Favicon"
          helpText="Square PNG or JPG, at least 64×64."
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="text-lg font-semibold text-base-content">Storefront copy</h2>
        <Input
          label="Announcement bar"
          value={announcement}
          onChange={(event) => {
            setAnnouncement(event.target.value);
            setDirty(true);
          }}
          placeholder="Leave empty to hide the top bar"
        />
        <Textarea
          label="Footer note"
          value={footerNote}
          onChange={(event) => {
            setFooterNote(event.target.value);
            setDirty(true);
          }}
          rows={4}
        />
      </section>
    </div>
  );
}
