import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import VariantAttribute from "@/lib/models/VariantAttribute";
import { requireAdmin } from "@/lib/auth/auth";

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function validatePricePair(originalPrice, salePrice) {
  if (
    originalPrice === undefined ||
    originalPrice === null ||
    typeof originalPrice !== "number" ||
    !Number.isFinite(originalPrice) ||
    originalPrice < 0
  ) {
    return "Original price must be a valid non-negative number";
  }

  if (
    salePrice === undefined ||
    salePrice === null ||
    typeof salePrice !== "number" ||
    !Number.isFinite(salePrice) ||
    salePrice < 0
  ) {
    return "Sale price must be a valid non-negative number";
  }

  if (salePrice > originalPrice) {
    return "Sale price cannot be greater than original price";
  }

  return null;
}

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;

    const product = await Product.findById(id)
      .populate("category", "name slug description image")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);

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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    const {
      name,
      slug: requestedSlug,
      description,
      category,
      images,
      variants,
      originalPrice,
      salePrice,
      stock,
      rating,
      reviewCount,
      isFeatured,
      isActive,
    } = body;

    /*
     * ----------------------------------------
     * BASIC FIELDS
     * ----------------------------------------
     */

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Product name cannot be empty",
          },
          { status: 400 },
        );
      }

      product.name = name.trim();
    }

    if (requestedSlug !== undefined) {
      if (typeof requestedSlug !== "string" || !requestedSlug.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug cannot be empty",
          },
          { status: 400 },
        );
      }

      const nextSlug = requestedSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      if (!nextSlug) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug is invalid",
          },
          { status: 400 },
        );
      }

      const slugTaken = await Product.exists({
        slug: nextSlug,
        _id: { $ne: product._id },
      });

      if (slugTaken) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug is already in use",
          },
          { status: 409 },
        );
      }

      product.slug = nextSlug;
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Description must be a string",
          },
          { status: 400 },
        );
      }

      product.description = description.trim();
    }

    /*
     * ----------------------------------------
     * CATEGORY
     * ----------------------------------------
     */

    if (category !== undefined) {
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

      product.category = category;
    }

    /*
     * ----------------------------------------
     * IMAGES
     * ----------------------------------------
     */

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return NextResponse.json(
          {
            success: false,
            message: "images must be an array",
          },
          { status: 400 },
        );
      }

      product.images = images;
    }

    /*
     * ----------------------------------------
     * RATING
     * ----------------------------------------
     */

    if (rating !== undefined) {
      if (
        typeof rating !== "number" ||
        !Number.isFinite(rating) ||
        rating < 0 ||
        rating > 5
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "rating must be between 0 and 5",
          },
          { status: 400 },
        );
      }

      product.rating = rating;
    }

    /*
     * ----------------------------------------
     * REVIEW COUNT
     * ----------------------------------------
     */

    if (reviewCount !== undefined) {
      if (!Number.isInteger(reviewCount) || reviewCount < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "reviewCount must be a non-negative integer",
          },
          { status: 400 },
        );
      }

      product.reviewCount = reviewCount;
    }

    /*
     * ----------------------------------------
     * DETERMINE PRODUCT TYPE
     * ----------------------------------------
     *
     * If variants are included in the PATCH,
     * the request is explicitly changing the
     * product's variant structure.
     *
     * Otherwise, preserve the current product type.
     */

    const updatingVariants = variants !== undefined;

    const currentlyVariable = product.variants && product.variants.length > 0;

    /*
     * ----------------------------------------
     * SIMPLE PRODUCT PRICE/STOCK
     * ----------------------------------------
     */

    if (!currentlyVariable && !updatingVariants) {
      const nextOriginalPrice =
        originalPrice !== undefined ? originalPrice : product.originalPrice;

      const nextSalePrice =
        salePrice !== undefined ? salePrice : product.salePrice;

      const priceError = validatePricePair(nextOriginalPrice, nextSalePrice);

      if (priceError) {
        return NextResponse.json(
          {
            success: false,
            message: priceError,
          },
          { status: 400 },
        );
      }

      product.originalPrice = nextOriginalPrice;

      product.salePrice = nextSalePrice;

      product.discountPercent = calculateDiscountPercent(
        nextOriginalPrice,
        nextSalePrice,
      );

      if (stock !== undefined) {
        if (typeof stock !== "number" || !Number.isFinite(stock) || stock < 0) {
          return NextResponse.json(
            {
              success: false,
              message: "stock must be a valid non-negative number",
            },
            { status: 400 },
          );
        }

        product.stock = stock;
      }
    }

    /*
     * ----------------------------------------
     * VARIANTS
     * ----------------------------------------
     */

    if (variants !== undefined) {
      if (!Array.isArray(variants)) {
        return NextResponse.json(
          {
            success: false,
            message: "variants must be an array",
          },
          { status: 400 },
        );
      }

      /*
       * --------------------------------------
       * CONVERT VARIABLE PRODUCT
       * --------------------------------------
       */

      if (variants.length > 0) {
        const skuSet = new Set();

        /*
         * Validate each variant
         */

        for (const variant of variants) {
          if (
            !variant.sku ||
            typeof variant.sku !== "string" ||
            !variant.sku.trim()
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "Every variant requires a SKU",
              },
              { status: 400 },
            );
          }

          const normalizedSku = variant.sku.trim().toLowerCase();

          if (skuSet.has(normalizedSku)) {
            return NextResponse.json(
              {
                success: false,
                message: `Duplicate SKU: ${variant.sku.trim()}`,
              },
              { status: 400 },
            );
          }

          skuSet.add(normalizedSku);

          /*
           * Price validation
           */

          const priceError = validatePricePair(
            variant.originalPrice,
            variant.salePrice,
          );

          if (priceError) {
            return NextResponse.json(
              {
                success: false,
                message: `${priceError} for SKU ${variant.sku.trim()}`,
              },
              { status: 400 },
            );
          }

          /*
           * Stock validation
           */

          if (
            typeof variant.stock !== "number" ||
            !Number.isFinite(variant.stock) ||
            variant.stock < 0
          ) {
            return NextResponse.json(
              {
                success: false,
                message: `Invalid stock for SKU ${variant.sku.trim()}`,
              },
              { status: 400 },
            );
          }

          /*
           * Attribute validation
           */

          if (
            !Array.isArray(variant.attributes) ||
            variant.attributes.length === 0
          ) {
            return NextResponse.json(
              {
                success: false,
                message: `Variant ${variant.sku.trim()} must have attributes`,
              },
              { status: 400 },
            );
          }
        }

        /*
         * ------------------------------------
         * CHECK SKU CONFLICTS
         * ------------------------------------
         *
         * The current product's own SKUs are
         * allowed.
         */

        const existingProducts = await Product.find({
          _id: {
            $ne: product._id,
          },

          "variants.sku": {
            $in: [...skuSet].map(
              (sku) => new RegExp(`^${escapeRegex(sku)}$`, "i"),
            ),
          },
        })
          .select("variants.sku")
          .lean();

        const conflictingSkus = [];

        for (const existingProduct of existingProducts) {
          for (const variant of existingProduct.variants || []) {
            if (skuSet.has(variant.sku.trim().toLowerCase())) {
              conflictingSkus.push(variant.sku);
            }
          }
        }

        if (conflictingSkus.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `SKU already exists: ${conflictingSkus.join(", ")}`,
            },
            { status: 409 },
          );
        }

        /*
         * ------------------------------------
         * VALIDATE ATTRIBUTE IDs
         * ------------------------------------
         */

        const attributeIds = [
          ...new Set(
            variants.flatMap((variant) =>
              variant.attributes.map((item) => item.attributeId),
            ),
          ),
        ];

        const attributes = await VariantAttribute.find({
          _id: {
            $in: attributeIds,
          },

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

        /*
         * ------------------------------------
         * BUILD FINAL VARIANTS
         * ------------------------------------
         */

        const finalVariants = [];

        for (const variant of variants) {
          const finalAttributes = [];

          for (const item of variant.attributes) {
            const attribute = attributeMap.get(item.attributeId.toString());

            if (!attribute) {
              throw new Error("INVALID_ATTRIBUTE");
            }

            const value = attribute.values.id(item.valueId);

            if (!value) {
              throw new Error("INVALID_ATTRIBUTE_VALUE");
            }

            finalAttributes.push({
              attributeId: attribute._id,

              valueId: value._id,

              attributeName: attribute.name,

              valueName: value.name,
            });
          }

          finalVariants.push({
            _id: variant._id,

            attributes: finalAttributes,

            sku: variant.sku.trim(),

            originalPrice: variant.originalPrice,

            salePrice: variant.salePrice,

            discountPercent: calculateDiscountPercent(
              variant.originalPrice,
              variant.salePrice,
            ),

            stock: variant.stock,

            images: variant.images || [],

            isActive:
              variant.isActive === undefined ? true : Boolean(variant.isActive),
          });
        }

        /*
         * ------------------------------------
         * CHECK DUPLICATE COMBINATIONS
         * ------------------------------------
         */

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

        /*
         * ------------------------------------
         * SAVE VARIABLE PRODUCT
         * ------------------------------------
         */

        product.variants = finalVariants;

        /*
         * Variable products do not use
         * product-level pricing or stock.
         * Use $unset so old values are removed.
         */

        product.set("originalPrice", undefined);
        product.set("salePrice", undefined);
        product.set("discountPercent", 0);
        product.set("stock", null);
        product.markModified("originalPrice");
        product.markModified("salePrice");
        product.markModified("stock");
      } else {
        /*
         * ------------------------------------
         * CONVERT TO SIMPLE PRODUCT
         * ------------------------------------
         *
         * When variants are removed, the request
         * MUST provide the simple product prices
         * because the old variant prices cannot be
         * safely assumed to represent the new
         * product-level price.
         */

        if (originalPrice === undefined || salePrice === undefined) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Original price and sale price are required when converting to a simple product",
            },
            { status: 400 },
          );
        }

        const priceError = validatePricePair(originalPrice, salePrice);

        if (priceError) {
          return NextResponse.json(
            {
              success: false,
              message: priceError,
            },
            { status: 400 },
          );
        }

        if (
          stock === undefined ||
          stock === null ||
          typeof stock !== "number" ||
          !Number.isFinite(stock) ||
          stock < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Stock is required when converting to a simple product",
            },
            { status: 400 },
          );
        }

        product.variants = [];

        product.originalPrice = originalPrice;

        product.salePrice = salePrice;

        product.discountPercent = calculateDiscountPercent(
          originalPrice,
          salePrice,
        );

        product.stock = stock;
      }
    }

    /*
     * ----------------------------------------
     * VARIABLE PRODUCT PRICE SAFETY
     * ----------------------------------------
     *
     * If the product was already variable and
     * variants were not included in the PATCH,
     * reject product-level pricing fields.
     */

    if (
      currentlyVariable &&
      !updatingVariants &&
      (originalPrice !== undefined ||
        salePrice !== undefined ||
        stock !== undefined)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Variable products must update price and stock through variants",
        },
        { status: 400 },
      );
    }

    /*
     * ----------------------------------------
     * STATUS
     * ----------------------------------------
     */

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
    }

    /*
     * ----------------------------------------
     * SAVE
     * ----------------------------------------
     *
     * Product's pre("validate") middleware will
     * also recalculate discountPercent.
     */

    await product.save();

    // Ensure product-level prices are removed for variable products
    if (product.variants && product.variants.length > 0) {
      await Product.updateOne(
        { _id: product._id },
        {
          $unset: {
            originalPrice: 1,
            salePrice: 1,
          },
          $set: {
            discountPercent: 0,
            stock: null,
          },
        },
      );
    }

    const updatedProduct = await Product.findById(product._id)
      .populate("category", "name slug description image")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);

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

    if (
      error.name === "ValidationError" ||
      error.message?.includes("Sale price cannot be greater")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Validation failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product permanently deleted",
    });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);

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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
