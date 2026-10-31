"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Utensils,
  X,
  Printer,
  LoaderCircle,
  Wifi,
  WifiOff,
  RotateCcw,
} from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
};
type CartLine = { item: MenuItem; quantity: number };
type Receipt = {
  id: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  createdAt: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:18080"
).replace(/\/$/, "");
const fallbackMenu: MenuItem[] = [
  {
    id: 1,
    name: "Truffle Mushroom Toast",
    description: "Wild mushrooms, whipped ricotta, herbs & sourdough.",
    category: "Small Plates",
    price: 690,
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=85",
    tag: "Guest favourite",
  },
  {
    id: 2,
    name: "Burrata Garden Salad",
    description: "Creamy burrata, heirloom tomatoes, basil oil.",
    category: "Small Plates",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=85",
    tag: "Fresh",
  },
  {
    id: 3,
    name: "The Maison Smash",
    description: "Double beef patty, aged cheddar, house sauce, brioche.",
    category: "Mains",
    price: 1250,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85",
    tag: "Bestseller",
  },
  {
    id: 4,
    name: "Creamy Tuscan Pasta",
    description: "Penne, parmesan cream, sun-dried tomato & spinach.",
    category: "Mains",
    price: 1100,
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=85",
  },
  {
    id: 5,
    name: "Herb Roast Chicken",
    description: "Lemon butter, rosemary jus, seasonal vegetables.",
    category: "Mains",
    price: 1450,
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900&q=85",
  },
  {
    id: 6,
    name: "Saffron Citrus Cooler",
    description: "Fresh citrus, saffron syrup, mint & sparkling water.",
    category: "Drinks",
    price: 420,
    image:
      "https://images.unsplash.com/photo-1513558161293-c1e634a6f025?w=900&q=85",
    tag: "Refreshing",
  },
  {
    id: 7,
    name: "Iced Spanish Latte",
    description: "Double espresso, silky milk, a little sweetness.",
    category: "Drinks",
    price: 480,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=85",
  },
  {
    id: 8,
    name: "Dark Chocolate Tart",
    description: "Bittersweet ganache, flaky pastry, vanilla cream.",
    category: "Desserts",
    price: 620,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85",
    tag: "A little indulgence",
  },
];

const money = (value: number) =>
  `Rs. ${Math.round(value).toLocaleString("en-PK")}`;

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>(fallbackMenu);
  const [menuSource, setMenuSource] = useState<"backend" | "demo">("demo");
  const [apiOnline, setApiOnline] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [notice, setNotice] = useState("");

  async function loadMenu() {
    try {
      const response = await fetch(`${API_URL}/api/menu`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Menu request failed");
      const data = await response.json();
      if (Array.isArray(data.items)) {
        setMenu(data.items);
        setMenuSource("backend");
        setApiOnline(true);
      }
    } catch {
      setApiOnline(false);
      setMenuSource("demo");
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((item) => item.category)))],
    [menu],
  );
  const visibleMenu = useMemo(
    () =>
      menu.filter((item) => {
        const matchesCategory =
          category === "All" || item.category === category;
        const q = search.trim().toLowerCase();
        return (
          matchesCategory &&
          (!q ||
            `${item.name} ${item.description} ${item.category}`
              .toLowerCase()
              .includes(q))
        );
      }),
    [menu, category, search],
  );

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const estimatedSubtotal = cart.reduce(
    (sum, line) => sum + line.item.price * line.quantity,
    0,
  );

  function addItem(item: MenuItem) {
    setCart((current) => {
      const found = current.find((line) => line.item.id === item.id);
      if (found)
        return current.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      return [...current, { item, quantity: 1 }];
    });
    setNotice(`${item.name} added to your order`);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function changeQuantity(id: number, delta: number) {
    setCart((current) =>
      current
        .map((line) =>
          line.item.id === id
            ? { ...line, quantity: line.quantity + delta }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  async function placeOrder() {
    if (!cart.length) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer.trim() || "Walk-in Guest",
          items: cart.map((line) => ({
            menuItemId: line.item.id,
            quantity: line.quantity,
          })),
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Could not create order");
      }
      const data = await response.json();
      setReceipt(data.receipt);
      setApiOnline(true);
      setCart([]);
      setCustomer("");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Backend is unavailable. Start the C++ server and try again.",
      );
      setApiOnline(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="bg-[#241e1a] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[.22em] text-[#e7d7bd] sm:text-[11px]">
        A little indulgence, served with intention · Karachi
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#bd965d]/60 text-[#8b6538]">
            <Utensils size={19} />
          </span>
          <span>
            <span className="display-font block text-2xl font-semibold tracking-tight">
              maison<span className="text-[#bd965d]">.</span>
            </span>
            <span className="block text-[8px] uppercase tracking-[.3em] text-[#8c8175]">
              Kitchen & dining
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-xs font-semibold text-[#6f655c] md:flex">
          <a href="#menu" className="hover:text-[#8b6538]">
            Our menu
          </a>
          <a href="#story" className="hover:text-[#8b6538]">
            Our philosophy
          </a>
          <a href="#order" className="hover:text-[#8b6538]">
            Your order
          </a>
        </nav>
        <a
          href="#order"
          className="relative flex items-center gap-2 rounded-full bg-[#572b35] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#42202a]"
        >
          <ShoppingBag size={15} />{" "}
          <span className="hidden sm:inline">Your order</span>
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#d8b982] px-1 text-[10px] text-[#2a2119]">
            {itemCount}
          </span>
        </a>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-5 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-12 lg:pb-24">
        <div className="relative z-10 py-4 lg:py-12">
          <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-[#96754c]">
            <span className="h-px w-9 bg-[#bd965d]" /> Thoughtfully made,
            beautifully served
          </div>
          <h1 className="display-font max-w-xl text-5xl leading-[1.08] tracking-[-.04em] sm:text-6xl lg:text-[76px]">
            Good food.
            <br />
            <em className="font-medium text-[#8a5b48]">Great company.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#766d63]">
            A modern neighbourhood table inspired by seasonal ingredients, slow
            moments and the joy of sharing something delicious.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#menu"
              className="inline-flex items-center gap-3 rounded-full bg-[#572b35] px-6 py-4 text-xs font-semibold text-white shadow-lg shadow-[#572b35]/15 transition hover:-translate-y-0.5"
            >
              Explore the menu <ArrowDownRight size={16} />
            </a>
            <span className="flex items-center gap-2 text-[11px] text-[#8a8177]">
              <Clock3 size={14} className="text-[#bd965d]" /> Open daily · 12 PM
              – 11 PM
            </span>
          </div>
          <div className="mt-12 flex items-center gap-6 border-t border-[#e5ddd1] pt-6">
            <div>
              <p className="display-font text-2xl">Fresh</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.18em] text-[#968b7e]">
                Every single day
              </p>
            </div>
            <div className="h-9 w-px bg-[#ded3c5]" />
            <div>
              <p className="display-font text-2xl">Local</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.18em] text-[#968b7e]">
                Thoughtful sourcing
              </p>
            </div>
            <div className="h-9 w-px bg-[#ded3c5]" />
            <div>
              <p className="display-font text-2xl">Made</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.18em] text-[#968b7e]">
                With a little love
              </p>
            </div>
          </div>
        </div>
        <div className="relative min-h-[390px] sm:min-h-[510px]">
          <div className="absolute right-0 top-0 h-[88%] w-[88%] overflow-hidden rounded-t-[48%] rounded-b-[8px] bg-[#e7ded1]">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=90"
              alt="Elegant restaurant table with beautifully plated food"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 max-w-[230px] rounded-sm bg-white p-5 shadow-soft sm:p-6">
            <Sparkles size={17} className="text-[#bd965d]" />
            <p className="display-font mt-3 text-xl leading-snug">
              Made for the moments that matter.
            </p>
            <p className="mt-2 text-[10px] leading-5 text-[#8c8175]">
              Come hungry. Leave a little happier.
            </p>
          </div>
          <div className="absolute right-0 top-8 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#654c36] backdrop-blur">
            Est. with love · 2025
          </div>
        </div>
      </section>

      <section
        id="story"
        className="border-y border-[#e9e0d5] bg-[#f1ece4] px-5 py-10 sm:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.28em] text-[#a17b4c]">
              The maison experience
            </p>
            <p className="display-font mt-2 text-2xl sm:text-3xl">
              Simple ingredients. Unforgettable plates.
            </p>
          </div>
          <p className="max-w-md text-xs leading-6 text-[#7e7469]">
            From the first sip to the last bite, every detail is considered.
            Explore our kitchen favourites and make your order below.
          </p>
        </div>
      </section>

{/* Menu Section */}
      <section
        id="menu"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#a17b4c]">
              A taste of maison
            </p>
            <h2 className="display-font mt-3 text-4xl sm:text-5xl">
              The menu<span className="text-[#bd965d]">.</span>
            </h2>
            <p className="mt-3 text-sm text-[#82776b]">
              A few good things, made exceptionally well.
            </p>
          </div>
          <div className="flex w-full items-center gap-3 rounded-full border border-[#e5dbcf] bg-white px-4 py-3 md:max-w-xs">
            <Search size={16} className="shrink-0 text-[#a58b6a]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find something delicious..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-[#b4aaa0]"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="menu-scroll mt-8 flex gap-2 overflow-x-auto pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-[11px] font-semibold transition ${category === cat ? "bg-[#572b35] text-white" : "border border-[#e6ddd1] bg-white text-[#766b60] hover:border-[#bd965d]"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between text-[10px] text-[#9a8e81]">
          <span>{visibleMenu.length} thoughtful picks</span>
          <span className="flex items-center gap-1.5">
            {apiOnline ? (
              <>
                <Wifi size={12} className="text-[#5f8058]" /> Live C++ menu
              </>
            ) : (
              <>
                <WifiOff size={12} /> Preview menu · start backend for live data
              </>
            )}
          </span>
        </div>

        {visibleMenu.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleMenu.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-sm border border-[#eae2d8] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative h-52 overflow-hidden bg-[#e8e0d5]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  {item.tag && (
                    <span className="absolute left-3 top-3 bg-[#f8f5ef]/95 px-3 py-2 text-[8px] font-bold uppercase tracking-[.16em] text-[#76573a]">
                      {item.tag}
                    </span>
                  )}
                  <button
                    onClick={() => addItem(item)}
                    aria-label={`Add ${item.name}`}
                    className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#572b35] text-white shadow-lg transition hover:scale-105"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[8px] font-bold uppercase tracking-[.2em] text-[#a17b4c]">
                    {item.category}
                  </p>
                  <h3 className="display-font mt-2 text-xl">{item.name}</h3>
                  <p className="mt-2 min-h-[40px] text-[10px] leading-5 text-[#8a8177]">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#f0ebe5] pt-3">
                    <span className="text-xs font-bold">
                      {money(item.price)}
                    </span>
                    <button
                      onClick={() => addItem(item)}
                      className="text-[9px] font-bold uppercase tracking-[.15em] text-[#8a5b48] hover:text-[#572b35]"
                    >
                      Add to order +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-[#d9cbbb] py-16 text-center">
            <Search className="mx-auto text-[#bd965d]" />
            <p className="display-font mt-3 text-xl">
              Nothing on the menu matches.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-3 text-xs font-semibold text-[#8a5b48]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section id="order" className="bg-[#eee8df] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#a17b4c]">
              Almost there
            </p>
            <h2 className="display-font mt-3 text-4xl sm:text-5xl">
              Your table,
              <br />
              <em className="text-[#8a5b48]">your order.</em>
            </h2>
            <p className="mt-5 max-w-sm text-xs leading-6 text-[#82776b]">
              Choose your favourites, review your order and let our kitchen take
              it from here.
            </p>
            <div className="mt-8 flex items-center gap-3 text-[10px] text-[#8a8177]">
              <ChefHat size={17} className="text-[#a17b4c]" /> Prepared fresh,
              just for you.
            </div>
          </div>

          <div className="rounded-sm bg-white p-5 shadow-soft sm:p-8">
            <div className="flex items-center justify-between border-b border-[#eee8df] pb-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#a17b4c]">
                  Order summary
                </p>
                <h3 className="display-font mt-1 text-2xl">Your selection</h3>
              </div>
              <span className="rounded-full bg-[#f5f0e8] px-3 py-2 text-[10px] font-semibold text-[#795d40]">
                {itemCount} items
              </span>
            </div>
            <label className="mt-5 block text-[9px] font-bold uppercase tracking-[.16em] text-[#918477]">
              Name for the order
            </label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Ayesha"
              className="mt-2 w-full border-b border-[#e8dfd4] bg-transparent py-3 text-sm outline-none placeholder:text-[#c0b6aa] focus:border-[#bd965d]"
            />
            {cart.length ? (
              <div className="mt-5 space-y-4">
                {cart.map((line) => (
                  <div
                    key={line.item.id}
                    className="flex items-center gap-3 border-b border-[#f1ece6] pb-4"
                  >
                    <img
                      src={line.item.image}
                      alt=""
                      className="h-14 w-14 rounded-sm object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="display-font truncate text-base">
                        {line.item.name}
                      </p>
                      <p className="mt-1 text-[10px] text-[#978b7e]">
                        {money(line.item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQuantity(line.item.id, -1)}
                        aria-label="Decrease quantity"
                        className="grid h-7 w-7 place-items-center rounded-full border border-[#e7ded2]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-4 text-center text-xs">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => changeQuantity(line.item.id, 1)}
                        aria-label="Increase quantity"
                        className="grid h-7 w-7 place-items-center rounded-full border border-[#e7ded2]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="w-20 text-right text-xs font-semibold">
                      {money(line.item.price * line.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="my-8 rounded-sm bg-[#faf8f4] py-10 text-center">
                <ShoppingBag className="mx-auto text-[#c4ad8e]" size={23} />
                <p className="display-font mt-3 text-lg">
                  Your order is waiting.
                </p>
                <p className="mt-1 text-[10px] text-[#9b9084]">
                  Add something lovely from the menu.
                </p>
                <a
                  href="#menu"
                  className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#8a5b48]"
                >
                  Explore menu <ArrowRight size={13} />
                </a>
              </div>
            )}
            <div className="mt-6 space-y-3 border-t border-[#eee8df] pt-5 text-xs">
              <div className="flex justify-between text-[#897f74]">
                <span>Subtotal (estimate)</span>
                <span>{money(estimatedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#897f74]">
                <span>Tax (5%, calculated by backend)</span>
                <span>{money(estimatedSubtotal * 0.05)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span>Total estimate</span>
                <span>{money(estimatedSubtotal * 1.05)}</span>
              </div>
            </div>
            <button
              disabled={!cart.length || busy}
              onClick={placeOrder}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#572b35] px-5 py-4 text-xs font-bold text-white transition hover:bg-[#42202a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" /> Creating
                  receipt...
                </>
              ) : (
                <>
                  Confirm order & generate receipt <ArrowRight size={15} />
                </>
              )}
            </button>
            {!apiOnline && (
              <p className="mt-3 text-center text-[9px] leading-4 text-[#a18c76]">
                Preview mode: menu browsing works, but order submission needs
                the C++ backend running.
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="mt-3 text-center text-[10px] text-[#8a5b48]"
              >
                {notice}
              </p>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[#241e1a] px-5 py-8 text-center text-[#d7c8b5]">
        <p className="display-font text-2xl">
          maison<span className="text-[#bd965d]">.</span>
        </p>
        <p className="mt-2 text-[8px] uppercase tracking-[.25em] text-[#a99a87]">
          Good food · Good company · Made with care
        </p>
        <p className="mt-5 text-[9px] text-[#817466]">
          © 2026 Maison Restaurant · Student project demonstration
        </p>
      </footer>

      {receipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17120f]/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Order receipt"
        >
          <div className="my-8 w-full max-w-md bg-[#fffdfa] p-6 shadow-2xl sm:p-9">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.24em] text-[#a17b4c]">
                  Maison · Kitchen & dining
                </p>
                <h2 className="display-font mt-2 text-3xl">Thank you.</h2>
                <p className="mt-1 text-[10px] text-[#8c8175]">
                  Your order has been received.
                </p>
              </div>
              <button
                onClick={() => setReceipt(null)}
                aria-label="Close receipt"
                className="rounded-full p-2 hover:bg-[#f2ece4]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="my-6 border-y border-dashed border-[#d9cbbb] py-4 text-[10px] text-[#82776b]">
              <div className="flex justify-between">
                <span>Receipt</span>
                <strong className="text-[#302821]">{receipt.id}</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Customer</span>
                <strong className="text-[#302821]">
                  {receipt.customerName}
                </strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Date</span>
                <strong className="text-[#302821]">
                  {new Date(receipt.createdAt).toLocaleString()}
                </strong>
              </div>
            </div>
            <div className="space-y-3">
              {receipt.items.map((line, index) => (
                <div key={index} className="flex justify-between gap-3 text-xs">
                  <span className="text-[#6f655c]">
                    {line.name}{" "}
                    <span className="text-[#a99a87]">× {line.quantity}</span>
                  </span>
                  <strong>{money(line.lineTotal)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-[#e9e0d5] pt-4 text-xs">
              <div className="flex justify-between text-[#82776b]">
                <span>Subtotal</span>
                <span>{money(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#82776b]">
                <span>Tax ({(receipt.taxRate * 100).toFixed(0)}%)</span>
                <span>{money(receipt.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold">
                <span>Total paid</span>
                <span>{money(receipt.total)}</span>
              </div>
            </div>
            <div className="mt-7 text-center">
              <p className="display-font text-lg italic text-[#8a5b48]">
                Made with love. Enjoy every bite.
              </p>
              <p className="mt-1 text-[8px] uppercase tracking-[.2em] text-[#a99a87]">
                This is your order receipt
              </p>
            </div>
            <div className="mt-6 flex gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#572b35] py-3 text-xs font-semibold text-white"
              >
                <Printer size={14} /> Print receipt
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="rounded-full border border-[#e5dbcf] px-5 py-3 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          [role="dialog"],
          [role="dialog"] * {
            visibility: visible !important;
          }
          [role="dialog"] {
            position: absolute !important;
            inset: 0 !important;
            background: white !important;
          }
          [role="dialog"] button {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
