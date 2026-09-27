# NEXT.JS E-COMMERCE PROJECT — MASTER CONTEXT & CONTINUATION PROMPT

You are continuing development of an existing Next.js e-commerce application.

IMPORTANT: This project is already partially implemented. Do NOT restart the project, recreate existing files, replace working architecture, or introduce unnecessary abstractions.

The goal is to continue development from the exact state described below.

---

# 1. PROJECT DEVELOPMENT RULES

Follow these rules throughout the project:

1. Use JavaScript/JSX only.
   - Do NOT use TypeScript.
   - Do NOT create `.ts` or `.tsx` files unless explicitly requested.

2. Use Next.js App Router.
   - Use the `app/` directory.
   - Do NOT introduce the Pages Router.

3. Do NOT use `src/`.
   - The project structure is based directly from the root.

4. Use MongoDB with Mongoose.

5. Authentication is custom authentication.
   - Do NOT introduce Auth.js / NextAuth.
   - Authentication uses JWT.
   - JWT is stored inside an HTTP-only cookie.

6. Use TanStack Query for client-side server-state management.
   - It will be integrated later.
   - Do not introduce Redux unless explicitly requested.

7. Use Tailwind CSS for styling.

8. Use ImageKit for image storage/upload handling.
   - The project uses `@imagekit/next`.
   - Do NOT use `@imagekit/nodejs`.
   - Never expose the ImageKit private key to the client.

9. The application will eventually have:
   - Customer storefront
   - Authentication
   - Product browsing
   - Cart
   - Wishlist
   - Checkout
   - Orders
   - User account
   - Admin panel
   - Product management
   - Order management
   - Other necessary e-commerce administration

10. Build the system incrementally.

11. Work ONE logical step at a time.

12. Before making a major architectural change:

- Explain what is being added.
- Explain why it is needed.
- Explain where it belongs.
- Ask for confirmation if the change affects architecture or existing functionality.

13. Do NOT dump large amounts of code unless explicitly requested.

14. Prefer small, understandable implementations.

15. Do not create unnecessary utility files, abstractions, wrappers, or libraries prematurely.

16. Do not rewrite working code without a specific reason.

17. When adding a feature, respect the existing architecture instead of introducing a different pattern.

---

# 2. CURRENT TECHNOLOGY STACK

The project currently uses:

- Next.js
- React
- JavaScript
- JSX
- App Router
- Tailwind CSS
- MongoDB
- Mongoose
- TanStack Query
- ImageKit
- `@imagekit/next`
- bcryptjs
- jsonwebtoken

Authentication:

- Custom authentication
- JWT
- HTTP-only cookie
- 7-day JWT expiration

Database:

- MongoDB Atlas
- Mongoose

Image handling:

- ImageKit

Alias:

- `@/*` points to the project root.

---

# 3. CURRENT PROJECT STRUCTURE

The project started with this structure:

```text
.next/
app/
lib/
  database/
    dbConnect.js
node_modules/
public/

.env.local
.gitignore
HZ.md
plot.md
eslint.config.mjs
jsconfig.json
next.config.mjs
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
postcss.config.mjs
README.md
```

The project has since added authentication and model-related files.

The important application structure currently includes:

```text
app/
├── api/
│   ├── auth/
│   │   ├── register/
│   │   │   └── route.js
│   │   ├── login/
│   │   │   └── route.js
│   │   ├── logout/
│   │   │   └── route.js
│   │   └── me/
│   │       └── route.js
│   │
│   └── test-db/
│       └── route.js
│
lib/
├── auth/
│   ├── auth.js
│   └── token.js
│
├── database/
│   └── dbConnect.js
│
├── models/
│   └── User.js
│
├── utils/
│   └── password.js
│
└── config.js
```

There may also be the normal Next.js-generated files/folders such as:

```text
app/
├── favicon.ico
├── globals.css
├── layout.js
└── page.js
```

depending on the current project state.

---

# 4. ENVIRONMENT VARIABLES

The project uses `.env.local`.

The actual secret values MUST NOT be exposed in documentation, commits, prompts, or client-side code.

The required environment variables are conceptually:

```env
MONGODB_URI=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
JWT_SECRET=...
```

Important:

- `MONGODB_URI` contains the MongoDB connection string.
- `IMAGEKIT_PUBLIC_KEY` is the public ImageKit key.
- `IMAGEKIT_PRIVATE_KEY` is secret and server-only.
- `IMAGEKIT_URL_ENDPOINT` is the ImageKit URL endpoint.
- `JWT_SECRET` signs and verifies authentication tokens.
- Never use `NEXT_PUBLIC_` for `IMAGEKIT_PRIVATE_KEY`.
- `.env.local` must never be committed to Git.

The MongoDB credentials were previously exposed accidentally during development, so the database password should be considered rotated/replaced and should never be reproduced in future responses.

---

# 5. PATH ALIAS

`jsconfig.json` currently contains:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Therefore imports can use:

```js
import User from "@/lib/models/User";
```

instead of:

```js
import User from "../../lib/models/User";
```

Always prefer the `@/` alias.

---

# 6. CENTRAL CONFIGURATION

File:

```text
lib/config.js
```

Current implementation:

```js
const config = {
  mongodbUri: process.env.MONGODB_URI,
  imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
};

export default config;
```

Purpose:

- Centralizes environment configuration.
- Avoids repeatedly accessing environment variables throughout the application.
- Provides a clean place for configuration values.

Current configuration includes:

- MongoDB URI
- ImageKit public key
- ImageKit private key
- ImageKit URL endpoint

JWT currently reads `JWT_SECRET` directly in the token utility.

---

# 7. DATABASE CONNECTION

File:

```text
lib/database/dbConnect.js
```

Current implementation:

```js
import mongoose from "mongoose";
import config from "@/lib/config";

const MONGODB_URI = config.mongodbUri;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default dbConnect;
```

Purpose:

- Connects Next.js to MongoDB using Mongoose.
- Prevents unnecessary repeated connections during development/server reloads.
- Uses a global cache for the connection and connection promise.
- Uses `bufferCommands: false`.
- Reuses an existing connection if one already exists.
- Resets the cached promise if connection fails.

This connection has already been tested successfully.

---

# 8. USER MODEL

File:

```text
lib/models/User.js
```

Current model:

```js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    thana: {
      type: String,
      required: true,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      url: {
        type: String,
        default: "",
      },
      fileId: {
        type: String,
        default: "",
      },
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
```

## User fields

### name

Customer's name.

Required.

### email

Customer's email.

Required.

Unique.

Automatically converted to lowercase.

### password

Hashed password.

Required.

Configured with:

```js
select: false;
```

This means the password is not returned by normal Mongoose queries.

When authentication needs the password, the query explicitly uses:

```js
.select("+password")
```

### role

Possible values:

```text
user
admin
```

Default:

```text
user
```

Normal registration MUST NOT allow the client to choose `admin`.

### phone

Optional phone number.

### avatar

Contains:

```text
url
fileId
```

This is designed to work with ImageKit.

### addresses

An array of embedded address documents.

Each address contains:

```text
name
phone
address
city
thana
isDefault
```

Important:

The address model uses `thana`, not postal code.

### isActive

Determines whether the account is active.

Default:

```text
true
```

### timestamps

Mongoose automatically adds:

```text
createdAt
updatedAt
```

---

# 9. PASSWORD UTILITY

File:

```text
lib/utils/password.js
```

Current implementation:

```js
import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

Functions:

## `hashPassword(password)`

Purpose:

- Converts a plain password into a secure bcrypt hash.

Uses:

```text
12 salt rounds
```

## `comparePassword(password, hashedPassword)`

Purpose:

- Compares a plain password against the stored bcrypt hash.
- Used during login.

Never store plain-text passwords.

---

# 10. JWT TOKEN UTILITY

File:

```text
lib/auth/token.js
```

Current implementation:

```js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in your environment variables");
}

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
```

Functions:

## `generateToken(payload)`

Creates a JWT.

Current expiration:

```text
7 days
```

Login currently stores this payload:

```js
{
  userId: user._id.toString(),
  role: user.role
}
```

## `verifyToken(token)`

Verifies and decodes the JWT.

If the token is invalid or expired, verification throws an error.

---

# 11. AUTHENTICATION HELPERS

File:

```text
lib/auth/auth.js
```

Current implementation:

```js
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/token";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
```

## `getAuthUser()`

Reads the `token` cookie.

If there is no token:

```text
null
```

If the token exists and is valid:

```text
decoded JWT payload
```

If invalid/expired:

```text
null
```

## `requireAuth()`

Requires an authenticated user.

If no valid authentication exists:

```text
UNAUTHORIZED
```

Otherwise returns the decoded user information.

## `requireAdmin()`

First requires authentication.

Then checks:

```text
user.role === "admin"
```

If not:

```text
FORBIDDEN
```

This will eventually protect admin APIs/routes.

---

# 12. REGISTRATION API

File:

```text
app/api/auth/register/route.js
```

Endpoint:

```text
POST /api/auth/register
```

Expected request:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password",
  "phone": "..."
}
```

Required fields:

```text
name
email
password
```

Phone is optional.

Flow:

1. Read request body.
2. Validate required fields.
3. Connect to MongoDB.
4. Search for existing email.
5. If email exists, return `409`.
6. Hash password with bcrypt.
7. Create User.
8. Return safe user information.
9. Password is never returned.

Successful response contains:

```text
id
name
email
role
```

Registration defaults the user to:

```text
role: "user"
```

The client cannot assign itself the admin role.

---

# 13. LOGIN API

File:

```text
app/api/auth/login/route.js
```

Endpoint:

```text
POST /api/auth/login
```

Expected request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Flow:

1. Validate email/password.
2. Connect to MongoDB.
3. Find user by email.
4. Explicitly select the password using:

```js
.select("+password")
```

5. Check whether the account exists.
6. Check `isActive`.
7. Compare password using bcrypt.
8. Generate JWT.
9. Put JWT into HTTP-only cookie named:

```text
token
```

10. Return safe user information.

JWT payload:

```js
{
  userId: user._id.toString(),
  role: user.role
}
```

Cookie settings currently include:

```text
HttpOnly
Path=/
Max-Age=604800
SameSite=Lax
```

In production:

```text
Secure
```

is also added.

Successful response:

```text
success
message
user
```

The password and JWT are not returned in the JSON response.

---

# 14. CURRENT AUTH COOKIE

Cookie name:

```text
token
```

The cookie contains the JWT.

It is:

- HTTP-only
- 7-day lifetime
- SameSite=Lax
- Secure in production
- available across the application path

Client-side JavaScript should not directly access this cookie.

The server reads it through:

```js
cookies();
```

from:

```text
next/headers
```

---

# 15. CURRENT USER API

File:

```text
app/api/auth/me/route.js
```

Endpoint:

```text
GET /api/auth/me
```

Purpose:

- Checks the current authentication cookie.
- Returns the currently authenticated JWT user payload.

If unauthenticated:

```text
401 Unauthorized
```

If authenticated:

```json
{
  "success": true,
  "user": {
    "userId": "...",
    "role": "user"
  }
}
```

At this stage this endpoint returns the JWT payload rather than fetching the complete User document.

This can be improved later if the frontend needs complete user profile information.

---

# 16. LOGOUT API

File:

```text
app/api/auth/logout/route.js
```

Endpoint:

```text
POST /api/auth/logout
```

Purpose:

- Removes the authentication cookie.

Current implementation:

```js
export async function POST() {
  const response = Response.json({
    success: true,
    message: "Logged out successfully",
  });

  response.headers.append(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
  );

  return response;
}
```

The cookie expiration is set to zero, effectively deleting the JWT cookie.

If cookie behavior is hardened later, ensure logout cookie attributes match the login cookie attributes.

---

# 17. DATABASE TEST API

Temporary file:

```text
app/api/test-db/route.js
```

Current purpose:

- Confirms MongoDB connection works.
- Confirms the User model can be imported/registered.

Current implementation:

```js
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";

export async function GET() {
  try {
    await dbConnect();

    return Response.json({
      success: true,
      message: "Database and User model are working",
      model: User.modelName,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Database or User model failed",
      },
      { status: 500 },
    );
  }
}
```

Endpoint:

```text
GET /api/test-db
```

This route is primarily a development/health-check route.

It should eventually be removed or replaced with a proper health-check mechanism once the application is sufficiently developed.

---

# 18. IMAGEKIT

The project uses:

```text
@imagekit/next
```

ImageKit is intended for:

- Product images
- User avatars
- Potentially other uploaded media

Important architecture:

The browser/client must NOT receive:

```text
IMAGEKIT_PRIVATE_KEY
```

Secure upload authentication should eventually be generated server-side using:

```js
getUploadAuthParams;
```

from:

```text
@imagekit/next/server
```

The expected future architecture is approximately:

```text
Client
   ↓
Next.js upload-auth API
   ↓
ImageKit secure upload authentication
   ↓
Client uploads to ImageKit
```

Do NOT create a fake ImageKit server instance using an unsupported package/API.

Do NOT use:

```text
@imagekit/nodejs
```

for this project unless the architecture is deliberately changed later.

Do NOT expose the ImageKit private key through `NEXT_PUBLIC_*`.

---

# 19. CURRENT DATABASE/AUTHENTICATION ARCHITECTURE

The current authentication flow is:

```text
REGISTER

Client
  ↓
POST /api/auth/register
  ↓
Validate input
  ↓
MongoDB
  ↓
Hash password with bcrypt
  ↓
Create User
  ↓
Return safe user data
```

Login:

```text
Client
  ↓
POST /api/auth/login
  ↓
Find User
  ↓
Compare bcrypt password
  ↓
Generate JWT
  ↓
HTTP-only token cookie
  ↓
Authenticated session
```

Authenticated request:

```text
Client
  ↓
Request
  ↓
HTTP-only token cookie
  ↓
getAuthUser()
  ↓
verifyToken()
  ↓
Authenticated user payload
```

Admin authorization:

```text
Request
  ↓
requireAdmin()
  ↓
requireAuth()
  ↓
Check role
  ↓
admin?
  ├── yes → continue
  └── no → FORBIDDEN
```

---

# 20. WHAT HAS ALREADY BEEN TESTED

The following parts have been tested successfully:

- Next.js application runs.
- MongoDB Atlas connection works.
- Mongoose connection works.
- `@/*` alias works.
- User model registration works.
- `/api/test-db` works.
- User registration works.
- Password hashing works.
- Login works.
- JWT generation works.
- HTTP-only token cookie is created.
- `/api/auth/me` works.
- Authentication helper functions are implemented.
- Logout functionality has been implemented.

Therefore, do NOT repeat the database/authentication setup unless a real bug appears.

---

# 21. CURRENTLY COMPLETED ARCHITECTURE

At this point the project has:

```text
FOUNDATION
├── Next.js
├── App Router
├── JavaScript/JSX
├── Tailwind
├── Path alias
├── Environment configuration
└── Project structure

DATABASE
├── MongoDB Atlas
├── Mongoose
├── Cached DB connection
└── User model

AUTHENTICATION
├── Custom authentication
├── bcrypt password hashing
├── JWT
├── HTTP-only cookie
├── Register
├── Login
├── Logout
├── Current-auth endpoint
├── requireAuth()
└── requireAdmin()

MEDIA
└── ImageKit configuration

STATE / DATA
└── TanStack Query selected for future frontend integration
```

---

# 22. NOT YET IMPLEMENTED

The following major systems still need to be built.

## Database models

```text
Product
Category
Cart
Wishlist
Order
```

Potential later models:

```text
Payment
Shipment
Coupon
Review
Notification
```

Only add models when their actual requirements become clear.

---

# 23. PRODUCT SYSTEM — NEXT MAJOR STEP

The next major feature is the Product system.

Before writing the Product model, decide whether the store needs:

### Simple products

Example:

```text
T-Shirt
Price: ৳500
Stock: 20
```

or:

### Variant products

Example:

```text
T-Shirt

Black
  S
  M
  L
  XL

White
  S
  M
  L
  XL
```

Variant support changes the product/inventory architecture significantly.

Do not implement variants automatically without confirming the requirement.

Recommended approach if the store does not require variants:

```text
Product
├── name
├── slug
├── description
├── price
├── discountPrice
├── images
├── category
├── sku
├── stock
├── status
├── featured
└── timestamps
```

ImageKit metadata should eventually be stored for uploaded images.

---

# 24. EXPECTED FUTURE PRODUCT ARCHITECTURE

Likely product structure:

```text
Product
├── Basic information
│   ├── name
│   ├── slug
│   └── description
│
├── Pricing
│   ├── price
│   └── discountPrice
│
├── Inventory
│   ├── sku
│   └── stock
│
├── Media
│   └── ImageKit images
│
├── Classification
│   └── category
│
├── Visibility
│   ├── status
│   └── featured
│
└── timestamps
```

This is a planning structure, not yet an implemented schema.

---

# 25. FUTURE DEVELOPMENT PHASES

Continue in approximately this order.

## PHASE 1 — FOUNDATION

COMPLETED:

- Next.js
- App Router
- Tailwind
- Environment variables
- `@/*` alias
- MongoDB
- Mongoose
- ImageKit configuration
- Database testing

---

## PHASE 2 — DATABASE + AUTHENTICATION

CURRENTLY MOSTLY COMPLETED:

- User model
- Address schema
- bcrypt
- Registration
- JWT
- Login
- HTTP-only authentication cookie
- `getAuthUser`
- `requireAuth`
- `requireAdmin`
- Current-user endpoint
- Logout

---

## PHASE 3 — PRODUCT SYSTEM

NEXT:

1. Decide simple product vs variants.
2. Design Product schema.
3. Create Product model.
4. Design Category model.
5. Connect Product → Category.
6. Implement ImageKit upload authentication.
7. Product creation API.
8. Product retrieval API.
9. Product update API.
10. Product deletion/deactivation.
11. Inventory handling.
12. Product validation.

---

## PHASE 4 — STOREFRONT

Build:

```text
Home
Products
Product details
Categories
Search
Filters
Sorting
Pagination
```

---

## PHASE 5 — CART

Build:

```text
Add to cart
Update quantity
Remove item
Cart totals
Stock validation
Persistent cart
```

---

## PHASE 6 — WISHLIST

Build:

```text
Add wishlist item
Remove wishlist item
Wishlist page
Move wishlist item to cart
```

---

## PHASE 7 — CHECKOUT

Build:

```text
Address selection
Address creation
Order summary
Shipping information
Payment method
Final order creation
```

---

## PHASE 8 — ORDER SYSTEM

Build:

```text
Order model
Order creation
Order details
Order status
Order history
Admin order management
```

Potential statuses:

```text
pending
confirmed
processing
shipped
delivered
cancelled
```

Exact status architecture should be decided later.

---

## PHASE 9 — ADMIN PANEL

Admin functionality will eventually include:

```text
Dashboard
Products
Categories
Orders
Customers
Inventory
```

Admin routes/APIs must use:

```js
requireAdmin();
```

where appropriate.

---

## PHASE 10 — TANSTACK QUERY

TanStack Query should be integrated when the frontend begins consuming real APIs.

Potential query areas:

```text
Products
Categories
Current user
Cart
Wishlist
Orders
Admin data
```

Do not unnecessarily fetch server state manually with repeated `useEffect` patterns when TanStack Query is ready to be integrated.

---

# 26. SECURITY REQUIREMENTS

Always maintain these rules.

### Passwords

Never:

```text
store plain passwords
return passwords
log passwords
```

Use bcrypt.

### JWT

Never expose the JWT unnecessarily to client JavaScript.

Keep it in the HTTP-only cookie.

### ImageKit

Never expose:

```text
IMAGEKIT_PRIVATE_KEY
```

to the browser.

### Admin

Never allow registration requests to specify:

```json
{
  "role": "admin"
}
```

Normal users must always be created as:

```text
user
```

Admin creation should be handled separately.

### MongoDB

Never expose:

```text
MONGODB_URI
```

to the browser.

### Environment variables

Never commit:

```text
.env.local
```

---

# 27. CURRENT CODING STYLE

Use:

```js
import ...
```

ES modules.

Use:

```js
export default ...
```

or named exports where appropriate.

Prefer:

```js
@/lib/...
```

imports.

Use async/await.

Keep API route handlers straightforward.

Example:

```js
export async function GET(request) {
  ...
}
```

and:

```js
export async function POST(request) {
  ...
}
```

Use `Response.json()` for API responses unless there is a specific reason to use another response mechanism.

---

# 28. HOW TO CONTINUE THIS PROJECT

When continuing development from this prompt:

1. Do NOT recreate the foundation.
2. Do NOT recreate MongoDB connection.
3. Do NOT recreate User model.
4. Do NOT recreate authentication.
5. Do NOT replace JWT authentication with Auth.js.
6. Do NOT switch JavaScript to TypeScript.
7. Do NOT introduce `src/`.
8. Do NOT replace Mongoose with another ODM.
9. Do NOT replace ImageKit.
10. Do NOT create unnecessary abstractions.
11. Check the existing architecture before creating a new file.
12. Work step-by-step.
13. Explain the purpose of each new file before creating it.
14. Ask for confirmation before major architectural decisions.
15. Give only the next logical step rather than dumping the entire project.
16. Preserve working code.

---

# 29. CURRENT EXACT STOPPING POINT

The project has completed the initial:

```text
Foundation
+
MongoDB
+
User model
+
Authentication
```

The next step is:

```text
PRODUCT MODEL DESIGN
```

Before writing the Product model, first determine:

```text
Does the store need product variants such as
size/color, or are products simple products with
one price and one stock quantity?
```

Do not create the Product model until this architectural decision is clear.

---

# 30. INSTRUCTION FOR THE NEXT AI/CHATGPT SESSION

If this prompt is pasted into a new ChatGPT/Cursor session, begin by acknowledging the current state briefly.

Then say:

"The project is currently at the Product System stage. Before creating the Product model, we need to decide whether products support variants such as size/color or whether they are simple products."

Do NOT restart the setup.

Do NOT provide all remaining code.

Do NOT jump directly into building the entire e-commerce system.

Proceed one logical step at a time.

If information is missing, make a reasonable assumption and clearly state it rather than blocking the entire process.

If an architectural decision could materially affect the database design, explain the tradeoff and ask before implementing it.

The priority is:

```text
Correct architecture
→ Simple implementation
→ Test
→ Confirm
→ Next step
```

END OF PROJECT CONTEXT
