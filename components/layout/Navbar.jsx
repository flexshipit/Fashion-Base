// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Heart, Menu, PackageSearch, ShoppingBag, X } from "lucide-react";
// import { useState } from "react";
// import Container from "@/components/layout/Container";
// import ThemeToggle from "@/components/layout/ThemeToggle";
// import { useAuth } from "@/hooks/queries/useAuth";
// import { useCart } from "@/hooks/queries/useCart";
// import { useWishlist } from "@/hooks/queries/useWishlist";

// const links = [
//   { href: "/", label: "Home" },
//   { href: "/products", label: "Products" },
//   { href: "/track", label: "Track order" },
//   { href: "/orders", label: "Orders" },
// ];

// export default function Navbar() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);
//   const { user, logout, isLoading } = useAuth();
//   const { itemCount } = useCart();
//   const { count: wishlistCount } = useWishlist();

//   if (pathname?.startsWith("/admin")) {
//     return null;
//   }

//   return (
//     <header className="sticky top-0 z-40 border-b border-base-300/60 bg-base-100/80 backdrop-blur">
//       <Container className="flex h-16 items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <button
//             type="button"
//             className="btn btn-ghost btn-sm btn-square lg:hidden"
//             onClick={() => setOpen((value) => !value)}
//             aria-label="Open menu"
//           >
//             {open ? <X size={18} /> : <Menu size={18} />}
//           </button>

//           <Link href="/" className="text-xl font-bold tracking-tight">
//             Flex<span className="text-primary">Shop</span>
//           </Link>
//         </div>

//         <nav className="hidden items-center gap-1 lg:flex">
//           {links.map((link) => (
//             <Link
//               key={link.href}
//               href={link.href}
//               className={`btn btn-ghost btn-sm ${
//                 pathname === link.href ? "btn-active" : ""
//               }`}
//             >
//               {link.label}
//             </Link>
//           ))}
//         </nav>

//         <div className="flex items-center gap-1">
//           <ThemeToggle />

//           <Link
//             href="/track"
//             className="btn btn-ghost btn-sm btn-circle"
//             aria-label="Track order"
//             title="Track order"
//           >
//             <PackageSearch size={18} />
//           </Link>

//           <Link
//             href="/wishlist"
//             className="btn btn-ghost btn-sm btn-circle relative"
//             aria-label="Wishlist"
//           >
//             <Heart size={18} />
//             {wishlistCount > 0 ? (
//               <span className="badge badge-secondary badge-xs absolute -right-0.5 -top-0.5">
//                 {wishlistCount}
//               </span>
//             ) : null}
//           </Link>

//           <Link
//             href="/cart"
//             className="btn btn-ghost btn-sm btn-circle relative"
//             aria-label="Cart"
//           >
//             <ShoppingBag size={18} />
//             {itemCount > 0 ? (
//               <span className="badge badge-primary badge-xs absolute -right-0.5 -top-0.5">
//                 {itemCount}
//               </span>
//             ) : null}
//           </Link>

//           {!isLoading && user ? (
//             <div className="dropdown dropdown-end">
//               <button type="button" tabIndex={0} className="btn btn-ghost btn-sm">
//                 {user.name?.split(" ")[0] || "Account"}
//               </button>
//               <ul
//                 tabIndex={0}
//                 className="menu dropdown-content z-50 mt-2 w-48 rounded-box bg-base-100 p-2 shadow"
//               >
//                 <li>
//                   <Link href="/orders">My orders</Link>
//                 </li>
//                 <li>
//                   <Link href="/track">Track order</Link>
//                 </li>
//                 {user.role === "admin" ? (
//                   <li>
//                     <Link href="/admin">Admin panel</Link>
//                   </li>
//                 ) : null}
//                 <li>
//                   <button type="button" onClick={logout}>
//                     Logout
//                   </button>
//                 </li>
//               </ul>
//             </div>
//           ) : (
//             <Link href="/login" className="btn btn-primary btn-sm">
//               Login
//             </Link>
//           )}
//         </div>
//       </Container>

//       {open ? (
//         <div className="border-t border-base-300 lg:hidden">
//           <Container className="flex flex-col gap-1 py-3">
//             {links.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className="btn btn-ghost justify-start"
//                 onClick={() => setOpen(false)}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </Container>
//         </div>
//       ) : null}
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Menu,
  PackageSearch,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";
import Container from "@/components/layout/Container";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/queries/useAuth";
import { useCart } from "@/hooks/queries/useCart";
import { useWishlist } from "@/hooks/queries/useWishlist";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/track", label: "Track order" },
  { href: "/orders", label: "Orders" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, isLoading } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-base-300/50 bg-base-100/85 backdrop-blur-md">
      <Container className="flex h-[4.25rem] items-center justify-between gap-4">
        {/* LEFT: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            href="/"
            className="font-display text-2xl font-medium tracking-wide shrink-0"
          >
            Flex<span className="text-accent">Shop</span>
          </Link>
        </div>

        {/* MIDDLE: Search Bar (Desktop / Large Screens) */}
        <div className="hidden flex-1 max-w-md mx-4 md:flex">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search the collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm w-full pl-9 pr-4 bg-base-100/80 border-base-300 focus:outline-none focus:border-base-content/40"
            />
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            />
          </form>
        </div>

        {/* RIGHT AREA: Nav Text Links + Icons */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Navigation Text Links */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition ${
                  pathname === link.href
                    ? "text-base-content"
                    : "text-base-content/55 hover:text-base-content"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* UTMOST RIGHT: Action Icons & User Controls */}
          <div className="flex items-center gap-0.5">
            <ThemeToggle />

            <Link
              href="/track"
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Track order"
              title="Track order"
            >
              <PackageSearch size={17} />
            </Link>

            <Link
              href="/wishlist"
              className="btn btn-ghost btn-sm btn-circle relative"
              aria-label="Wishlist"
            >
              <Heart size={17} />
              {wishlistCount > 0 ? (
                <span className="badge badge-secondary badge-xs absolute -right-0.5 -top-0.5">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/cart"
              className="btn btn-ghost btn-sm btn-circle relative"
              aria-label="Cart"
            >
              <ShoppingBag size={17} />
              {itemCount > 0 ? (
                <span className="badge badge-primary badge-xs absolute -right-0.5 -top-0.5">
                  {itemCount}
                </span>
              ) : null}
            </Link>

            {!isLoading && user ? (
              <div className="dropdown dropdown-end">
                <button
                  type="button"
                  tabIndex={0}
                  className="btn btn-ghost btn-sm tracking-wide"
                >
                  {user.name?.split(" ")[0] || "Account"}
                </button>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-50 mt-2 w-48 border border-base-300 bg-base-100 p-2 shadow-lg"
                >
                  <li>
                    <Link href="/orders">My orders</Link>
                  </li>
                  <li>
                    <Link href="/track">Track order</Link>
                  </li>
                  {user.role === "admin" ? (
                    <li>
                      <Link href="/admin">Admin panel</Link>
                    </li>
                  ) : null}
                  <li>
                    <button type="button" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm ml-1">
                Login
              </Link>
            )}
          </div>
        </div>
      </Container>

      {/* MOBILE SEARCH BAR: Displayed under the navbar on smaller screens */}
      <div className="block md:hidden border-t border-base-300/40 px-4 py-2">
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            placeholder="Search the collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered input-sm w-full pl-9 pr-4 bg-base-100/80 border-base-300 focus:outline-none focus:border-base-content/40"
          />
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
          />
        </form>
      </div>

      {/* MOBILE NAVIGATION MENU DROPDOWN */}
      {open ? (
        <div className="border-t border-base-300 lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-3 text-xs font-medium uppercase tracking-[0.2em] text-base-content/70"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
