import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import VariantAttribute from "@/lib/models/VariantAttribute";
import { requireAdmin } from "@/lib/auth/auth";

const createSlug = (value) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

function calculateDiscountPercent(originalPrice, salePrice) {
  if (
    originalPrice === undefined ||
    originalPrice === null ||
    salePrice === undefined ||
    salePrice === null ||
    originalPrice <= 0
  ) {
    return 0;
  }

  if (salePrice >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export async function POST(request) {
  try {
    await requireAdmin();

    const data = await request.json();

    const {
      name,
      slug: requestedSlug,
      description,
      category,
      images,
      rating,
      reviewCount,
      isFeatured,
      isActive,
      originalPrice,
      salePrice,
      stock,
      variants,
    } = data;

    // -------------------------
    // Basic validation
    // -------------------------

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 },
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 },
      );
    }

    if (rating !== undefined && rating !== null && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 0 and 5",
        },
        { status: 400 },
      );
    }

    if (
      reviewCount !== undefined &&
      reviewCount !== null &&
      (!Number.isInteger(reviewCount) || reviewCount < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Review count must be a non-negative integer",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // -------------------------
    // Validate category
    // -------------------------

    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found or inactive",
        },
        { status: 400 },
      );
    }

    // -------------------------
    // Create product slug
    // -------------------------

    const baseSlug = requestedSlug?.trim()
      ? createSlug(requestedSlug)
      : createSlug(name);

    if (!baseSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid slug is required",
        },
        { status: 400 },
      );
    }

    let slug = baseSlug;
    let slugCounter = 1;

    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // -------------------------
    // Determine product type
    // -------------------------

    const hasVariants = Array.isArray(variants) && variants.length > 0;

    // -------------------------
    // Simple product validation
    // -------------------------

    if (!hasVariants) {
      if (
        originalPrice === undefined ||
        originalPrice === null ||
        originalPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Original price is required for a simple product",
          },
          { status: 400 },
        );
      }

      if (salePrice === undefined || salePrice === null || salePrice < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Sale price is required for a simple product",
          },
          { status: 400 },
        );
      }

      if (salePrice > originalPrice) {
        return NextResponse.json(
          {
            success: false,
            message: "Sale price cannot be greater than original price",
          },
          { status: 400 },
        );
      }

      if (stock === undefined || stock === null || stock < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Stock is required for a simple product",
          },
          { status: 400 },
        );
      }
    }

    // -------------------------
    // Variant validation
    // -------------------------

    if (hasVariants) {
      const usedSkus = new Set();

      for (const variant of variants) {
        if (!variant.sku || !variant.sku.trim()) {
          return NextResponse.json(
            {
              success: false,
              message: "Every variant must have a SKU",
            },
            { status: 400 },
          );
        }

        const normalizedSku = variant.sku.trim().toLowerCase();

        if (usedSkus.has(normalizedSku)) {
          return NextResponse.json(
            {
              success: false,
              message: `Duplicate SKU in variants: ${variant.sku}`,
            },
            { status: 400 },
          );
        }

        usedSkus.add(normalizedSku);

        // Original price
        if (
          variant.originalPrice === undefined ||
          variant.originalPrice === null ||
          variant.originalPrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid original price for SKU: ${variant.sku}`,
            },
            { status: 400 },
          );
        }

        // Sale price
        if (
          variant.salePrice === undefined ||
          variant.salePrice === null ||
          variant.salePrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid sale price for SKU: ${variant.sku}`,
            },
            { status: 400 },
          );
        }

        if (variant.salePrice > variant.originalPrice) {
          return NextResponse.json(
            {
              success: false,
              message: `Sale price cannot be greater than original price for SKU: ${variant.sku}`,
            },
            { status: 400 },
          );
        }

        // Stock
        if (
          variant.stock === undefined ||
          variant.stock === null ||
          variant.stock < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid stock for SKU: ${variant.sku}`,
            },
            { status: 400 },
          );
        }

        // Attributes
        if (
          !Array.isArray(variant.attributes) ||
          variant.attributes.length === 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Variant ${variant.sku} must have attributes`,
            },
            { status: 400 },
          );
        }
      }

      // -------------------------
      // Check SKU conflicts
      // -------------------------

      const skus = variants.map((variant) => variant.sku.trim().toLowerCase());

      const existingProduct = await Product.findOne({
        "variants.sku": {
          $in: skus.map(
            (sku) => new RegExp(`^${escapeRegex(sku)}$`, "i"),
          ),
        },
      });

      if (existingProduct) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more SKUs already exist",
          },
          { status: 409 },
        );
      }

      // -------------------------
      // Validate attributes
      // -------------------------

      const attributeIds = [
        ...new Set(
          variants.flatMap((variant) =>
            variant.attributes.map((item) => item.attributeId),
          ),
        ),
      ];

      const attributes = await VariantAttribute.find({
        _id: { $in: attributeIds },
        isActive: true,
      });

      if (attributes.length !== attributeIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more variant attributes are invalid",
          },
          { status: 400 },
        );
      }

      const attributeMap = new Map(
        attributes.map((attribute) => [attribute._id.toString(), attribute]),
      );

      // -------------------------
      // Validate attribute values
      // -------------------------

      const finalVariants = variants.map((variant) => {
        const finalAttributes = variant.attributes.map((item) => {
          const attribute = attributeMap.get(item.attributeId.toString());

          if (!attribute) {
            throw new Error("INVALID_ATTRIBUTE");
          }

          const value = attribute.values.id(item.valueId);

          if (!value) {
            throw new Error("INVALID_ATTRIBUTE_VALUE");
          }

          return {
            attributeId: attribute._id,
            valueId: value._id,
            attributeName: attribute.name,
            valueName: value.name,
          };
        });

        return {
          attributes: finalAttributes,

          sku: variant.sku.trim(),

          originalPrice: variant.originalPrice,

          salePrice: variant.salePrice,

          /*
           * This is calculated again by the Product
           * model during validation.
           */
          discountPercent: calculateDiscountPercent(
            variant.originalPrice,
            variant.salePrice,
          ),

          stock: variant.stock,

          images: variant.images || [],

          isActive: variant.isActive === undefined ? true : variant.isActive,
        };
      });

      // -------------------------
      // Check duplicate combinations
      // -------------------------

      const combinationKeys = new Set();

      for (const variant of finalVariants) {
        const key = variant.attributes
          .map((attribute) => `${attribute.attributeId}-${attribute.valueId}`)
          .sort()
          .join("|");

        if (combinationKeys.has(key)) {
          return NextResponse.json(
            {
              success: false,
              message: "Duplicate variant combination detected",
            },
            { status: 400 },
          );
        }

        combinationKeys.add(key);
      }

      // -------------------------
      // Create variable product
      // -------------------------

      const product = await Product.create({
        name: name.trim(),

        slug,

        description: description?.trim() || "",

        category,

        images: images || [],

        rating: rating ?? 0,

        reviewCount: reviewCount ?? 0,

        isFeatured: isFeatured ?? false,

        isActive: isActive ?? true,

        variants: finalVariants,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Product created successfully",
          product,
        },
        { status: 201 },
      );
    }

    // -------------------------
    // Create simple product
    // -------------------------

    const product = await Product.create({
      name: name.trim(),

      slug,

      description: description?.trim() || "",

      category,

      images: images || [],

      rating: rating ?? 0,

      reviewCount: reviewCount ?? 0,

      originalPrice,

      salePrice,

      /*
       * Product model calculates this automatically.
       */
      discountPercent: calculateDiscountPercent(originalPrice, salePrice),

      stock,

      isFeatured: isFeatured ?? false,

      isActive: isActive ?? true,

      variants: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    if (
      error.message === "INVALID_ATTRIBUTE" ||
      error.message === "INVALID_ATTRIBUTE_VALUE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more variant attributes or values are invalid",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseNumber(value, name) {
  if (value === null || value === "") return null;

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`${name} must be a valid number`);
  }

  return number;
}

function parseBoolean(value, name) {
  if (value === null) return null;

  if (value === "true") return true;

  if (value === "false") return false;

  throw new Error(`${name} must be true or false`);
}

function addPriceFilter(andConditions, minPrice, maxPrice) {
  if (minPrice === null && maxPrice === null) {
    return;
  }

  const simpleSalePrice = {};

  if (minPrice !== null) {
    simpleSalePrice.$gte = minPrice;
  }

  if (maxPrice !== null) {
    simpleSalePrice.$lte = maxPrice;
  }

  const variantSalePrice = {};

  if (minPrice !== null) {
    variantSalePrice.$gte = minPrice;
  }

  if (maxPrice !== null) {
    variantSalePrice.$lte = maxPrice;
  }

  andConditions.push({
    $or: [
      // Simple product
      {
        variants: { $size: 0 },

        salePrice: simpleSalePrice,
      },

      // Variable product
      {
        variants: {
          $elemMatch: {
            isActive: true,

            salePrice: variantSalePrice,
          },
        },
      },
    ],
  });
}

function addStockFilter(andConditions, inStock) {
  if (inStock === null) {
    return;
  }

  if (inStock) {
    andConditions.push({
      $or: [
        // Simple product
        {
          variants: { $size: 0 },

          stock: { $gt: 0 },
        },

        // Variable product
        {
          variants: {
            $elemMatch: {
              isActive: true,

              stock: { $gt: 0 },
            },
          },
        },
      ],
    });

    return;
  }

  andConditions.push({
    $or: [
      {
        variants: { $size: 0 },

        stock: { $lte: 0 },
      },

      {
        variants: {
          $not: {
            $elemMatch: {
              isActive: true,

              stock: { $gt: 0 },
            },
          },
        },
      },
    ],
  });
}

function parseAttributeFilters(searchParams) {
  const rawAttributes = searchParams.getAll("attribute");

  const filters = [];

  for (const item of rawAttributes) {
    const [attributeName, ...valueParts] = item.split(":");

    const valueName = valueParts.join(":");

    if (!attributeName || !valueName) {
      throw new Error("Invalid attribute filter. Use attribute=name:value");
    }

    filters.push({
      attributeName: attributeName.trim(),

      valueName: valueName.trim(),
    });
  }

  // Also support:
  // ?attribute=size:m,color:black

  if (rawAttributes.length === 1 && rawAttributes[0].includes(",")) {
    return rawAttributes[0].split(",").map((item) => {
      const [attributeName, ...valueParts] = item.split(":");

      const valueName = valueParts.join(":");

      if (!attributeName || !valueName) {
        throw new Error("Invalid attribute filter. Use attribute=name:value");
      }

      return {
        attributeName: attributeName.trim(),

        valueName: valueName.trim(),
      };
    });
  }

  return filters;
}

export async function GET(request) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";

    const categorySlug = searchParams.get("category")?.trim() || "";

    const minPrice = parseNumber(searchParams.get("minPrice"), "minPrice");

    const maxPrice = parseNumber(searchParams.get("maxPrice"), "maxPrice");

    const rating = parseNumber(searchParams.get("rating"), "rating");

    const minRating = parseNumber(searchParams.get("minRating"), "minRating");

    const maxRating = parseNumber(searchParams.get("maxRating"), "maxRating");

    const page = parseNumber(searchParams.get("page"), "page") ?? 1;

    const requestedLimit =
      parseNumber(searchParams.get("limit"), "limit") ?? 20;

    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const inStock = parseBoolean(searchParams.get("inStock"), "inStock");

    const featured = parseBoolean(searchParams.get("featured"), "featured");

    const sku = searchParams.get("sku")?.trim() || "";

    const sort = searchParams.get("sort")?.trim() || "newest";

    const attributeFilters = parseAttributeFilters(searchParams);

    if (page < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "page must be at least 1",
        },
        { status: 400 },
      );
    }

    if (minPrice !== null && minPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "minPrice cannot be negative",
        },
        { status: 400 },
      );
    }

    if (maxPrice !== null && maxPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "maxPrice cannot be negative",
        },
        { status: 400 },
      );
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return NextResponse.json(
        {
          success: false,
          message: "minPrice cannot be greater than maxPrice",
        },
        { status: 400 },
      );
    }

    if (rating !== null && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        {
          success: false,
          message: "rating must be between 0 and 5",
        },
        { status: 400 },
      );
    }

    if (minRating !== null && (minRating < 0 || minRating > 5)) {
      return NextResponse.json(
        {
          success: false,
          message: "minRating must be between 0 and 5",
        },
        { status: 400 },
      );
    }

    if (maxRating !== null && (maxRating < 0 || maxRating > 5)) {
      return NextResponse.json(
        {
          success: false,
          message: "maxRating must be between 0 and 5",
        },
        { status: 400 },
      );
    }

    if (minRating !== null && maxRating !== null && minRating > maxRating) {
      return NextResponse.json(
        {
          success: false,
          message: "minRating cannot be greater than maxRating",
        },
        { status: 400 },
      );
    }

    const allowedSorts = [
      "price-low",
      "price-high",
      "rating-high",
      "rating-low",
      "reviews-high",
      "newest",
      "oldest",
      "name-asc",
      "name-desc",
    ];

    if (!allowedSorts.includes(sort)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid sort. Allowed values: ${allowedSorts.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const andConditions = [];

    const isActiveParam = searchParams.get("isActive");
    if (isActiveParam === "true" || isActiveParam === "false") {
      andConditions.push({
        isActive: isActiveParam === "true",
      });
    }

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      const searchConditions = [
        {
          name: regex,
        },

        {
          description: regex,
        },

        {
          "variants.sku": regex,
        },

        {
          "variants.attributes.attributeName": regex,
        },

        {
          "variants.attributes.valueName": regex,
        },
      ];

      const matchingCategories = await Category.find({
        isActive: true,

        name: regex,
      })
        .select("_id")
        .lean();

      if (matchingCategories.length > 0) {
        searchConditions.push({
          category: {
            $in: matchingCategories.map((category) => category._id),
          },
        });
      }

      andConditions.push({
        $or: searchConditions,
      });
    }

    // ----------------------------------------
    // CATEGORY
    // ----------------------------------------

    if (categorySlug) {
      const category = await Category.findOne({
        slug: categorySlug,

        isActive: true,
      })
        .select("_id")
        .lean();

      if (!category) {
        return NextResponse.json({
          success: true,

          products: [],

          pagination: {
            page,

            limit,

            total: 0,

            totalPages: 0,

            hasNextPage: false,

            hasPreviousPage: page > 1,
          },
        });
      }

      andConditions.push({
        category: category._id,
      });
    }

    // ----------------------------------------
    // RATING
    // ----------------------------------------

    if (rating !== null) {
      andConditions.push({
        rating,
      });
    }

    if (minRating !== null || maxRating !== null) {
      const ratingFilter = {};

      if (minRating !== null) {
        ratingFilter.$gte = minRating;
      }

      if (maxRating !== null) {
        ratingFilter.$lte = maxRating;
      }

      andConditions.push({
        rating: ratingFilter,
      });
    }

    // ----------------------------------------
    // PRICE
    // ----------------------------------------

    addPriceFilter(andConditions, minPrice, maxPrice);

    // ----------------------------------------
    // STOCK
    // ----------------------------------------

    addStockFilter(andConditions, inStock);

    // ----------------------------------------
    // FEATURED
    // ----------------------------------------

    if (featured !== null) {
      andConditions.push({
        isFeatured: featured,
      });
    }

    // ----------------------------------------
    // SKU
    // ----------------------------------------

    if (sku) {
      andConditions.push({
        variants: {
          $elemMatch: {
            isActive: true,

            sku: new RegExp(escapeRegex(sku), "i"),
          },
        },
      });
    }

    // ----------------------------------------
    // DYNAMIC VARIANT ATTRIBUTES
    // ----------------------------------------

    if (attributeFilters.length > 0) {
      const attributeConditions = attributeFilters.map(
        ({ attributeName, valueName }) => ({
          $elemMatch: {
            attributeName: new RegExp(`^${escapeRegex(attributeName)}$`, "i"),

            valueName: new RegExp(`^${escapeRegex(valueName)}$`, "i"),
          },
        }),
      );

      andConditions.push({
        variants: {
          $elemMatch: {
            isActive: true,

            attributes: {
              $all: attributeConditions,
            },
          },
        },
      });
    }

    const matchStage =
      andConditions.length > 0
        ? {
            $and: andConditions,
          }
        : {};

    // ----------------------------------------
    // ACTIVE VARIANTS
    // ----------------------------------------

    const activeVariantsExpression = {
      $filter: {
        input: {
          $ifNull: ["$variants", []],
        },

        as: "variant",

        cond: {
          $eq: ["$$variant.isActive", true],
        },
      },
    };

    // ----------------------------------------
    // AGGREGATION
    // ----------------------------------------

    const pipeline = [
      {
        $match: matchStage,
      },

      {
        $set: {
          activeVariants: activeVariantsExpression,
        },
      },

      {
        $set: {
          sortPrice: {
            $cond: [
              {
                $gt: [
                  {
                    $size: "$activeVariants",
                  },

                  0,
                ],
              },

              {
                $min: {
                  $map: {
                    input: "$activeVariants",

                    as: "variant",

                    in: "$$variant.salePrice",
                  },
                },
              },

              {
                $ifNull: ["$salePrice", 0],
              },
            ],
          },
        },
      },

      // --------------------------------------
      // CATEGORY DATA
      // --------------------------------------

      {
        $lookup: {
          from: Category.collection.name,

          localField: "category",

          foreignField: "_id",

          as: "categoryData",
        },
      },

      {
        $unwind: {
          path: "$categoryData",

          preserveNullAndEmptyArrays: true,
        },
      },

      // --------------------------------------
      // COUNT + PRODUCTS
      // --------------------------------------

      {
        $facet: {
          products: [
            {
              $sort: (() => {
                switch (sort) {
                  case "price-low":
                    return {
                      sortPrice: 1,
                      _id: 1,
                    };

                  case "price-high":
                    return {
                      sortPrice: -1,
                      _id: 1,
                    };

                  case "rating-high":
                    return {
                      rating: -1,
                      _id: 1,
                    };

                  case "rating-low":
                    return {
                      rating: 1,
                      _id: 1,
                    };

                  case "reviews-high":
                    return {
                      reviewCount: -1,
                      _id: 1,
                    };

                  case "oldest":
                    return {
                      createdAt: 1,
                      _id: 1,
                    };

                  case "name-asc":
                    return {
                      name: 1,
                      _id: 1,
                    };

                  case "name-desc":
                    return {
                      name: -1,
                      _id: 1,
                    };

                  case "newest":
                  default:
                    return {
                      createdAt: -1,
                      _id: 1,
                    };
                }
              })(),
            },

            {
              $skip: (page - 1) * limit,
            },

            {
              $limit: limit,
            },

            {
              $project: {
                activeVariants: 0,

                sortPrice: 0,

                "categoryData.createdAt": 0,

                "categoryData.updatedAt": 0,
              },
            },
          ],

          total: [
            {
              $count: "count",
            },
          ],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);

    const products = result?.products || [];

    const total = result?.total?.[0]?.count || 0;

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return NextResponse.json({
      success: true,

      products,

      pagination: {
        page,

        limit,

        total,

        totalPages,

        hasNextPage: page < totalPages,

        hasPreviousPage: page > 1,
      },

      filters: {
        search: search || null,

        category: categorySlug || null,

        minPrice,

        maxPrice,

        rating,

        minRating,

        maxRating,

        inStock,

        featured,

        sku: sku || null,

        attributes: attributeFilters,

        sort,
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        success: false,

        message: error.message || "Failed to fetch products",
      },
      {
        status: 500,
      },
    );
  }
}
