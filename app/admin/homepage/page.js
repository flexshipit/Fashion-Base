"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast/toast";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUploader from "@/components/admin/ImageUploader";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import OptimizedImage from "@/components/ui/OptimizedImage";

function emptyHeroSlide() {
  return {
    title: "",
    subtitle: "",
    price: "",
    buttonText: "View Details",
    link: "/products",
    image: null,
    isActive: true,
    sortOrder: 0,
  };
}

function emptyCollection() {
  return {
    title: "",
    buttonText: "Shop Now",
    link: "/products",
    image: null,
    isActive: true,
    sortOrder: 0,
  };
}

function mapImage(image) {
  if (image?.url) return { url: image.url, fileId: image.fileId || "" };
  return null;
}

export default function AdminHomepagePage() {
  const queryClient = useQueryClient();
  const [heroSlides, setHeroSlides] = useState([]);
  const [specialCollections, setSpecialCollections] = useState([]);
  const [dirty, setDirty] = useState(false);

  const query = useQuery({
    queryKey: ["admin", "homepage"],
    queryFn: async () => {
      const res = await fetch("/api/admin/homepage", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load homepage");
      return data.homepage;
    },
  });

  useEffect(() => {
    if (!query.data) return;
    setHeroSlides(
      (query.data.heroSlides || []).map((slide) => ({
        ...slide,
        image: mapImage(slide.image),
      })),
    );
    setSpecialCollections(
      (query.data.specialCollections || []).map((item) => ({
        ...item,
        image: mapImage(item.image),
      })),
    );
    setDirty(false);
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        heroSlides: heroSlides.map((slide, index) => ({
          ...(slide._id ? { _id: slide._id } : {}),
          title: slide.title,
          subtitle: slide.subtitle,
          price: slide.price,
          buttonText: slide.buttonText,
          link: slide.link,
          image: slide.image || { url: "", fileId: "" },
          isActive: slide.isActive !== false,
          sortOrder: index,
        })),
        specialCollections: specialCollections.map((item, index) => ({
          ...(item._id ? { _id: item._id } : {}),
          title: item.title,
          buttonText: item.buttonText,
          link: item.link,
          image: item.image || { url: "", fileId: "" },
          isActive: item.isActive !== false,
          sortOrder: index,
        })),
      };

      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
      setDirty(false);
      toast.success("Homepage content saved");
    },
    onError: (error) => toast.error(error.message),
  });

  function updateSlide(index, patch) {
    setHeroSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    );
    setDirty(true);
  }

  function updateCollection(index, patch) {
    setSpecialCollections((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
    setDirty(true);
  }

  function moveItem(list, setList, index, direction) {
    const next = index + direction;
    if (next < 0 || next >= list.length) return;
    const copy = [...list];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    setList(copy);
    setDirty(true);
  }

  if (query.isLoading) {
    return <Loading label="Loading homepage content..." />;
  }

  if (query.isError) {
    return (
      <ErrorState message={query.error.message} onRetry={query.refetch} />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Homepage</h1>
          <p className="text-sm opacity-70">
            Manage hero swiper slides and special collection banners.
          </p>
        </div>
        <Button
          loading={saveMutation.isPending}
          disabled={!dirty}
          onClick={() => saveMutation.mutate()}
        >
          Save changes
        </Button>
      </div>

      {/* Hero slides */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Hero swiper</h2>
            <p className="text-sm opacity-70">
              Full-bleed slides at the top of the home page.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm gap-1"
            onClick={() => {
              setHeroSlides((prev) => [...prev, emptyHeroSlide()]);
              setDirty(true);
            }}
          >
            <Plus size={16} />
            Add slide
          </button>
        </div>

        {!heroSlides.length ? (
          <p className="rounded-2xl border border-dashed border-base-300 p-6 text-sm opacity-70">
            No hero slides yet. Add one to show the homepage swiper.
          </p>
        ) : null}

        <div className="space-y-4">
          {heroSlides.map((slide, index) => (
            <div
              key={slide._id || `hero-${index}`}
              className="grid gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 lg:grid-cols-[1fr_280px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                    <GripVertical size={16} />
                    Slide {index + 1}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={index === 0}
                      onClick={() =>
                        moveItem(heroSlides, setHeroSlides, index, -1)
                      }
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={index === heroSlides.length - 1}
                      onClick={() =>
                        moveItem(heroSlides, setHeroSlides, index, 1)
                      }
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => {
                        setHeroSlides((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                        setDirty(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <Input
                  label="Title"
                  value={slide.title}
                  onChange={(e) => updateSlide(index, { title: e.target.value })}
                />
                <Input
                  label="Subtitle"
                  value={slide.subtitle}
                  onChange={(e) =>
                    updateSlide(index, { subtitle: e.target.value })
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Price text"
                    value={slide.price}
                    onChange={(e) =>
                      updateSlide(index, { price: e.target.value })
                    }
                    placeholder="৳1,250"
                  />
                  <Input
                    label="Button text"
                    value={slide.buttonText}
                    onChange={(e) =>
                      updateSlide(index, { buttonText: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="Link URL"
                  value={slide.link}
                  onChange={(e) => updateSlide(index, { link: e.target.value })}
                  placeholder="/products or /products/slug"
                />
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={slide.isActive !== false}
                    onChange={(e) =>
                      updateSlide(index, { isActive: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="space-y-3">
                <ImageUploader
                  label="Slide image"
                  helpText="Recommended wide landscape (1920×1080)."
                  folder="/homepage/hero"
                  maxFiles={1}
                  images={slide.image ? [slide.image] : []}
                  onChange={(images) =>
                    updateSlide(index, { image: images[0] || null })
                  }
                />
                {slide.image?.url ? (
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-base-300">
                    <OptimizedImage
                      src={slide.image.url}
                      alt=""
                      fill
                      className="object-cover"
                      transformation={[{ width: 640, height: 360, quality: 70 }]}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special collections */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Special collections</h2>
            <p className="text-sm opacity-70">
              Two-column banners shown after New arrivals.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm gap-1"
            onClick={() => {
              setSpecialCollections((prev) => [...prev, emptyCollection()]);
              setDirty(true);
            }}
          >
            <Plus size={16} />
            Add collection
          </button>
        </div>

        {!specialCollections.length ? (
          <p className="rounded-2xl border border-dashed border-base-300 p-6 text-sm opacity-70">
            No special collections yet. Add banners for seasonal collections.
          </p>
        ) : null}

        <div className="space-y-4">
          {specialCollections.map((item, index) => (
            <div
              key={item._id || `collection-${index}`}
              className="grid gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 lg:grid-cols-[1fr_240px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                    <GripVertical size={16} />
                    Collection {index + 1}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={index === 0}
                      onClick={() =>
                        moveItem(
                          specialCollections,
                          setSpecialCollections,
                          index,
                          -1,
                        )
                      }
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={index === specialCollections.length - 1}
                      onClick={() =>
                        moveItem(
                          specialCollections,
                          setSpecialCollections,
                          index,
                          1,
                        )
                      }
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => {
                        setSpecialCollections((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                        setDirty(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <Input
                  label="Title"
                  value={item.title}
                  onChange={(e) =>
                    updateCollection(index, { title: e.target.value })
                  }
                  placeholder="Autumn/Winter 23"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Button text"
                    value={item.buttonText}
                    onChange={(e) =>
                      updateCollection(index, { buttonText: e.target.value })
                    }
                  />
                  <Input
                    label="Link URL"
                    value={item.link}
                    onChange={(e) =>
                      updateCollection(index, { link: e.target.value })
                    }
                    placeholder="/products?category=..."
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={item.isActive !== false}
                    onChange={(e) =>
                      updateCollection(index, { isActive: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="space-y-3">
                <ImageUploader
                  label="Banner image"
                  helpText="Portrait lifestyle photo (3:4 works best)."
                  folder="/homepage/collections"
                  maxFiles={1}
                  images={item.image ? [item.image] : []}
                  onChange={(images) =>
                    updateCollection(index, { image: images[0] || null })
                  }
                />
                {item.image?.url ? (
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-base-300">
                    <OptimizedImage
                      src={item.image.url}
                      alt=""
                      fill
                      className="object-cover"
                      transformation={[{ width: 400, height: 500, quality: 70 }]}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button
          loading={saveMutation.isPending}
          disabled={!dirty}
          onClick={() => saveMutation.mutate()}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
