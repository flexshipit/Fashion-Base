import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    fileId: { type: String, default: "" },
  },
  { _id: false },
);

const heroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    price: { type: String, trim: true, default: "" },
    buttonText: { type: String, trim: true, default: "View Details" },
    link: { type: String, trim: true, default: "/products" },
    image: { type: imageSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const specialCollectionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    buttonText: { type: String, trim: true, default: "Shop Now" },
    link: { type: String, trim: true, default: "/products" },
    image: { type: imageSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const homepageContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "homepage",
      immutable: true,
    },
    heroSlides: {
      type: [heroSlideSchema],
      default: [],
    },
    specialCollections: {
      type: [specialCollectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const HomepageContent =
  mongoose.models.HomepageContent ||
  mongoose.model("HomepageContent", homepageContentSchema);

export default HomepageContent;

export const DEFAULT_HERO_SLIDES = [
  {
    title: "Minimalist Studio Platform & Wristwear",
    subtitle: "Autumn Collection 2026",
    price: "৳1,250",
    buttonText: "View Details",
    link: "/products",
    image: {
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop",
      fileId: "",
    },
    isActive: true,
    sortOrder: 0,
  },
  {
    title: "How to Start a Clothing Line Feature",
    subtitle: "Exclusive Editorial",
    price: "৳890",
    buttonText: "View Details",
    link: "/products",
    image: {
      url: "https://ik.imagekit.io/ngkeoc1m9q/6a22c85ccd4c0435f0ff0961_How%20to%20Start%20a%20Cothing%20Line%20Feature.png",
      fileId: "",
    },
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Handcrafted Italian Leather Tote",
    subtitle: "Limited Luxury Edition",
    price: "৳2,400",
    buttonText: "View Details",
    link: "/products",
    image: {
      url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1920&auto=format&fit=crop",
      fileId: "",
    },
    isActive: true,
    sortOrder: 2,
  },
];

export const DEFAULT_SPECIAL_COLLECTIONS = [
  {
    title: "Autumn/Winter 23",
    buttonText: "Shop Now",
    link: "/products",
    image: {
      url: "https://images.unsplash.com/photo-1539109130230-f3c4708f7b5f?q=80&w=1200&auto=format&fit=crop",
      fileId: "",
    },
    isActive: true,
    sortOrder: 0,
  },
  {
    title: "Resort 24",
    buttonText: "Shop Now",
    link: "/products",
    image: {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
      fileId: "",
    },
    isActive: true,
    sortOrder: 1,
  },
];

export async function getOrCreateHomepageContent() {
  let doc = await HomepageContent.findOne({ key: "homepage" });

  if (!doc) {
    doc = await HomepageContent.create({
      key: "homepage",
      heroSlides: DEFAULT_HERO_SLIDES,
      specialCollections: DEFAULT_SPECIAL_COLLECTIONS,
    });
  }

  return doc;
}
