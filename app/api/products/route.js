import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

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

  if (inStock === true) {
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

  // Out of stock
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

  if (rawAttributes.length === 0) {
    return [];
  }

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

  return filters;
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // ----------------------------------------
    // BASIC QUERY PARAMETERS
    // ----------------------------------------

    const search = searchParams.get("search")?.trim() || "";

    const categorySlug = searchParams.get("category")?.trim() || "";

    const sku = searchParams.get("sku")?.trim() || "";

    // ----------------------------------------
    // PRICE
    // ----------------------------------------

    const minPrice = parseNumber(searchParams.get("minPrice"), "minPrice");

    const maxPrice = parseNumber(searchParams.get("maxPrice"), "maxPrice");

    // ----------------------------------------
    // RATING
    // ----------------------------------------

    const rating = parseNumber(searchParams.get("rating"), "rating");

    const minRating = parseNumber(searchParams.get("minRating"), "minRating");

    const maxRating = parseNumber(searchParams.get("maxRating"), "maxRating");

    // ----------------------------------------
    // PAGINATION
    // ----------------------------------------

    const page = parseNumber(searchParams.get("page"), "page") ?? 1;

    const requestedLimit =
      parseNumber(searchParams.get("limit"), "limit") ?? 20;

    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    // ----------------------------------------
    // OTHER FILTERS
    // ----------------------------------------

    const inStock = parseBoolean(searchParams.get("inStock"), "inStock");

    const featured = parseBoolean(searchParams.get("featured"), "featured");

    const attributeFilters = parseAttributeFilters(searchParams);

    const sort = searchParams.get("sort")?.trim() || "newest";

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

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

    // ----------------------------------------
    // BUILD FILTER
    // ----------------------------------------

    const andConditions = [
      {
        isActive: true,
      },
    ];

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      const searchConditions = [
        // Product name
        {
          name: regex,
        },

        // Product description
        {
          description: regex,
        },

        // Variant SKU
        {
          "variants.sku": regex,
        },

        // Variant attribute name
        {
          "variants.attributes.attributeName": regex,
        },

        // Variant attribute value
        {
          "variants.attributes.valueName": regex,
        },
      ];

      // Search category names too
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
    // DYNAMIC ATTRIBUTES
    // ----------------------------------------

    /*
     * Example:
     *
     * ?attribute=size:m
     *
     * Multiple:
     *
     * ?attribute=size:m&attribute=color:black
     *
     * Both conditions must exist on the
     * same variant.
     */

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

    const matchStage = {
      $and: andConditions,
    };

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

    /*
     * Price sorting uses the actual customer
     * selling price: salePrice.
     *
     * For variable products, the lowest active
     * variant salePrice is used as the product's
     * sorting price.
     *
     * For simple products, the product salePrice
     * is used.
     */

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
