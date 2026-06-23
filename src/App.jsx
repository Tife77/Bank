import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";
import banner1 from "./assets/banner-1.jpg";
import banner2 from "./assets/banner-2.jpg";
import banner3 from "./assets/banner-3.jpg";
import nevada from "./assets/nevada.jpg";
import simplify from "./assets/simplify.jpg";
import save from "./assets/save.jpg";
import dreams from "./assets/dreams.jpg";
import community from "./assets/community.jpg";
import digital from "./assets/digital.jpg";
import careers from "./assets/careers.jpg";
import fraud from "./assets/fraud.png";
import ChequeSection from "./ChequeSection.jsx";
import CardForm from "./card.jsx";
import ChaseDashboard from "./dashboard.jsx";
import SignupPage from "./signup.jsx";
import SignInPage from "./signin.jsx";
import ForgotPasswordPage from "./forgotpassword.jsx";
import ResetPasswordPage from "./resetpassword.jsx";
import logo from "./assets/onenevada.svg";
import ReportPage from "./report.jsx";
import TransactionsPage from "./transaction.jsx";
import SettingsPage from "./settings.jsx";
import TransferPage from "./transfer.jsx";
import AchPage from "./ach.jsx";
import DepositPage from "./deposit.jsx";
import StatementsPage from "./statements.jsx";
import WireMoneyPage from "./wiremoney.jsx";
import AdminPage from "./admin.jsx";
import { ProtectedRoute } from "./AuthContext.jsx";
import MobileNav from "./MobileNav.jsx";



function CarouselSlider() {
  const slides = [
    {
      id: 1,
      title: "WE'RE ALL IN",
      subtitle: "WITH OUR MEMBERS",
      description:
        "Put more chips back in your stack with 90 day no pay on your auto loan.",
      buttonText: "Apply today",
      buttonClass:
        "bg-red-600 hover:bg-transparent text-white border border-transparent hover:border-white",
      bgStyle: { backgroundImage: `url(${banner1})` },
    },
    {
      id: 2,
      title: "Hot Rates",
      subtitle: "COOL PAYMENTS",
      description: "Find your best loan rate without affecting your credit.",
      subtext: "Instant pre-qualification.",
      buttonText: "Get pre qualified",
      buttonClass:
        "bg-red-600 hover:bg-transparent text-white border border-transparent hover:border-white",
      bgStyle: { backgroundImage: `url(${banner2})` },
    },
    {
      id: 3,
      title: "SMARTER",
      subtitle: "INSURANCE",
      secondtitle: "MADE EASY",
      description:
        "Compare rates, manage policies, and stay on top of your auto and home insurance — all from one simple, free dashboard.",
      bgStyle: { backgroundImage: `url(${banner3})` },
    },
  ];

  

  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const duration = 6000;

  useEffect(() => {
    const start = Date.now();
    const timer = setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, duration);
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / duration) * 100));
    }, 50);
    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [activeIndex, slides.length]);

  return (
    <div className="relative overflow-hidden">
      <div className="relative h-[620px] w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === activeIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 ${slide.bgClass ?? ""} bg-cover bg-center`}
              style={slide.bgStyle}
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative mx-auto flex h-full max-w-7xl items-center justify-center px-6 py-24 sm:px-8">
              <div className="text-center text-white">
                <h1 className="text-5xl font-extrabold tracking-[-0.04em] sm:text-8xl lg:text-9xl">
                  {slide.title}
                </h1>
                <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl lg:text-9xl">
                  {slide.subtitle}
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-100 font-semibold sm:text-sm">
                  {slide.description}
                </p>
                {slide.subtext && (
                  <p className="mx-auto mt-0 max-w-4xl text-sm text-slate-100 font-semibold">
                    {slide.subtext}
                  </p>
                )}
                {slide.buttonText && (
                  <div className="mt-10 flex justify-center">
                    <a
                      href="#"
                      className={`inline-flex items-center font-bold justify-center rounded-full px-6 py-2 text-base shadow-lg shadow-red-700/25 transition ${slide.buttonClass}`}
                    >
                      {slide.buttonText}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
        <div className="h-1 w-[70%] mx-auto overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Rates Data ─────────────────────────────────────────────────
const ratesData = [
  {
    label: "ONCU 30 Yr Fixed",
    value: "6.285%",
    note: "APR*",
    icon: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <circle cx="19" cy="15" r="9" stroke="#60a5fa" strokeWidth="2" />
        <path d="M14 22c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
        <circle cx="19" cy="11" r="2" fill="#60a5fa" />
        <text x="16" y="16" fontSize="7" fill="#60a5fa" fontWeight="700">%</text>
      </svg>
    ),
  },
  {
    label: "15 Year Fixed",
    value: "6.057%",
    note: "APR*",
    icon: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <circle cx="19" cy="15" r="9" stroke="#60a5fa" strokeWidth="2" />
        <text x="14.5" y="20" fontSize="11" fill="#60a5fa" fontWeight="800">%</text>
      </svg>
    ),
  },
  {
    label: "Auto Loans (New & Used)",
    value: "5.49%",
    note: "APR*",
    icon: (
      <svg width="46" height="30" viewBox="0 0 46 30" fill="none">
        <rect x="2" y="6" width="42" height="16" rx="3" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="11" cy="23" r="4.5" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="35" cy="23" r="4.5" stroke="#60a5fa" strokeWidth="2" />
        <path d="M15.5 23h15" stroke="#60a5fa" strokeWidth="2" />
        <path d="M9 6V4a2 2 0 012-2h9l5 4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
        <text x="19" y="17" fontSize="7" fill="#60a5fa" fontWeight="700">$</text>
      </svg>
    ),
  },
  {
    label: "VISA Platinum Credit Card",
    value: "11.75%",
    note: "APR*",
    icon: (
      <svg width="44" height="30" viewBox="0 0 44 30" fill="none">
        <rect x="2" y="2" width="40" height="26" rx="4" stroke="#60a5fa" strokeWidth="2" />
        <rect x="2" y="9" width="40" height="5" fill="#1e3a6e" />
        <rect x="6" y="19" width="12" height="4" rx="1.5" fill="#60a5fa" />
        <circle cx="34" cy="21" r="5" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="31" y="24" fontSize="6.5" fill="#60a5fa" fontWeight="700">$</text>
      </svg>
    ),
  },
];

const checks = ["Competitive rates", "Low down payment options", "Apply online or in-person"];
const digitalChecks = ["Get on-demand account alerts", "Deposit checks with your mobile", "Set credit card spending limits"];
const careersChecks = ["A diverse and dedicated team", "An extremely generous benefits package", "A relaxed, upbeat company culture"];

// ── Rates Section ──────────────────────────────────────────────
function RatesSection() {
  const [hovered, setHovered] = useState(null);
  return (
    <section className="w-full bg-[#003865] relative overflow-hidden mt-24">
      <div className="flex flex-col lg:flex-row w-full relative z-10">
        <div className="flex flex-col justify-center px-32 py-8 lg:w-[52%]">
          <p className="text-xl font-semibold text-white mb-3">Rates</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">
            Get the best rate for you
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8 max-w-xs">
            One Nevada rates are lower than the national banks and have flexible terms to serve our members better.
          </p>
          <ul className="space-y-4 mb-10">
            {checks.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-blue-100 text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
          <button className="w-fit bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold text-sm px-9 py-3.5 rounded-full shadow-lg">
            Learn More
          </button>
        </div>
        <div className="lg:w-[40%] bg-[#003865] grid grid-cols-2 gap-5 p-8">
          {ratesData.map(({ label, value, note, icon }, i) => (
            <div
              key={label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`flex flex-col items-center justify-start px-6 py-10 rounded-2xl bg-white shadow-lg transition-transform duration-200 cursor-pointer ${hovered === i ? "-translate-y-1 shadow-xl" : ""}`}
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5 border border-blue-100">
                {icon}
              </div>
              <p className="text-center text-sm font-bold text-[#1a5fa8] leading-snug mb-1.5 max-w-[160px]">{label}</p>
              <p className="text-xs text-[#1a5fa8] mb-4">as low as:</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-[#0b2550] tracking-tight">{value}</span>
                <span className="text-lg font-bold text-[#1a5fa8] ml-1">{note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="w-full h-10 relative z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='22'%3E%3Cpath d='M0 11 Q15 3 30 11 Q45 19 60 11 Q75 3 90 11 Q105 19 120 11' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "bottom",
        }}
      />
    </section>
  );
}

// ── Blog Section ───────────────────────────────────────────────
function BlogSection() {
  return (
    <section className="w-full bg-gray-100 py-16 px-6 shadow-2xl">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-[45%] flex-shrink-0 overflow-hidden shadow-xl flex items-center justify-center bg-black min-h-[260px]">
            <img src={fraud} alt="Account Takeover Fraud" className="w-full h-auto object-contain" />
          </div>
          <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <rect x="1" y="2" width="14" height="13" rx="2" stroke="#6b7280" strokeWidth="1.5" />
                <path d="M1 6h14" stroke="#6b7280" strokeWidth="1.5" />
                <path d="M5 1v2M11 1v2" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="4" y="9" width="2" height="2" rx="0.5" fill="#6b7280" />
                <rect x="7" y="9" width="2" height="2" rx="0.5" fill="#6b7280" />
              </svg>
              <span className="font-medium">24 Feb</span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-[#003865] leading-snug mb-6">
              Account Takeover Fraud: How It Happens and How to Protect Yourself
            </h3>
            <a href="#" className="inline-flex items-center gap-2 text-[#0070b8] font-bold text-sm tracking-widest uppercase hover:gap-3 transition-all group">
              Continue Reading
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:translate-x-1 transition-transform">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="#0070b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Shared Nav Dropdowns ───────────────────────────────────────
function NavDropdowns() {
  return (
    <nav className="relative hidden items-center justify-center gap-8 text-base font-semibold lg:flex">
      {[
        {
          label: "Personal Banking",
          cols: [
            { title: "CHECKING", items: ["One Checking Rewards","One Checking","MyChecking","Essential Checking","Services","Payments"] },
            { title: "CREDIT CARDS", items: ["Visa® Platinum Rewards Credit Card","Visa® Signature Rewards Credit Card","Visa® Platinum Share Secured Credit Card","CURewards"] },
            { title: "SAVINGS", items: ["Primary Savings","Secondary Savings","Money Market Accounts","Certificates Of Deposits (CDs)"] },
            { title: "DIGITAL BANKING", items: ["Free Digital App","Mobile Check Deposit","CashBack+","KeepTrack®"] },
          ],
        },
        {
          label: "Loans",
          cols: [
            { title: "PERSONAL LOANS", items: ["Credit Cards","Lines Of Credit","Savings Secured Loans","Signature Loans","Credit Builder Loans","Advance Pay","Buy Now Pay Later","Get My Rate"] },
            { title: "VEHICLE LOANS", items: ["New Or Used Auto Loans","Refinance Your Auto Loan","Motorcycle / ATV Loans","RV Loans","Watercraft Loans","Auto Loan Pre-Approval"] },
            { title: "MORTGAGE", items: ["Mortgage Rates","Purchase Loans","Refinance Loans","Reverse Mortgage","Home Equity Loans","Home Equity Lines Of Credit"] },
            { title: "COMMERCIAL REAL ESTATE", items: ["Commercial Real Estate Loan Requirements","Commercial Loan Officer Michael Zufelt"] },
          ],
        },
        {
          label: "Insurance",
          cols: [
            { title: "INSURANCE OVERVIEW", items: ["Auto Insurance","Homeowners Insurance","Renters Insurance","Life Insurance","Umbrella Insurance","Pet Insurance","Medicare"] },
            { title: "ACCIDENTAL DEATH & DISMEMBERMENT", items: ["Major Mechanical Protection","GAP Insurance","Payment Protection","Recuperative Care","Hospital Accident Plan"] },
            { title: "SERVICES", items: ["Make a Payment","Local Agents","Insurance Claims"] },
          ],
        },
        {
          label: "Investment",
          cols: [
            { title: "FINANCIAL PLANNING SERVICES", items: [] },
            { title: "RETIREMENT INCOME PLANNING SERVICES", items: [] },
            { title: "EDUCATION PLANNING", items: [] },
            { title: "FINANCIAL ADVISORS", items: ["Chris Wible","Jeffery W Zemp"] },
          ],
        },
        {
          label: "Resources",
          cols: [
            { title: "CALCULATORS", items: ["401(k) Savings Calculator","Auto Lease Vs. Purchase Calculator","Auto Loan Payment Calculator","Roth IRA Calculator","How Much Car Can I Afford Calculator","Retirement Savings Calculator","Savings Goal Calculator","Income Required For A Mortgage","Mortgage Calculator","Home Refinance Calculator"] },
            { title: "DISCLOSURES", items: ["Copyright Policy","Social Media Use Policy","Unlawful Internet Gambling Enforcement Act","USA Patriot Act","Online Privacy Policy And Website Terms Of Use"] },
            { title: "ABOUT", items: ["Our Leadership","Annual Report","Scholarships","Blog","FAQs","Fraud Center","Holiday Hours","Help Center"] },
            { title: "CAREERS", items: ["Company Culture","Job Benefits","Job Openings"] },
          ],
        },
      ].map((menu) => (
        <div key={menu.label} className="group">
          <a href="#" className="text-blue-900 pb-1 border-b-2 border-transparent group-hover:border-blue-900 transition">
            {menu.label}
          </a>
          <div className="absolute left-1/2 top-full hidden w-screen -translate-x-1/2 group-hover:grid bg-blue-900 p-8 shadow-xl gap-8 z-50 mt-1" style={{ backgroundColor: "#003865" }}>
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 col-span-4">
              <div className="grid grid-cols-4 gap-8">
                {menu.cols.map((col) => (
                  <div key={col.title}>
                    <p className="text-xs font-bold text-white mb-3">{col.title}</p>
                    <ul className="space-y-2 text-xs text-blue-100">
                      {col.items.map((l) => (
                        <li key={l}><a href="#" className="hover:text-white">{l}</a></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
}

// ── Header ─────────────────────────────────────────────────────
function Header() {
  return (
    <>
      {/* Utility bar */}
      <div className="w-full fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: "#003865" }}>
        <div className="mx-auto max-w-full px-6 py-3 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-3 px-4 py-2 text-xs tracking-[0.15em] text-white sm:flex-row sm:items-center sm:justify-between">
            <a href="#" className="font-bold text-yellow-400 hover:text-white hover:border-b-2 hover:border-white pb-1 transition">
              FRAUD DON'T FALL FOR IT: We will never call, email, or text for personal info.
            </a>
            <div className="flex flex-wrap items-center gap-6 text-white whitespace-nowrap">
              <span className="text-[12px] font-bold">Routing Number: 322484401</span>
              <span className="w-px h-4 bg-slate-400" />
              <a href="#" className="text-sm font-bold hover:text-slate-200 transition">Contact</a>
              <span className="w-px h-4 bg-slate-400" />
              <a href="#" className="inline-flex font-bold items-center gap-2 text-sm hover:text-slate-200 transition">ATMs/Branches</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="w-full bg-white shadow-md fixed left-0 right-0 z-40" style={{ top: "48px" }}>
        <div className="mx-auto flex max-w-full items-center justify-between gap-6 px-6 py-4 sm:px-8 lg:px-12">

          {/* ── LOGO — SVG image (replaces text) ── */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="One Nevada Credit Union"
              className="h-12 w-auto object-contain"
            />
          </div>

          <NavDropdowns />

          <div className="flex items-center gap-4">
            <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors duration-200 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="w-5 h-5" 
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z"
          />
        </svg>
      </button>
            <span className="h-6 w-px bg-slate-300" />
             <Link to="/signup" className="text-blue-900 font-semibold hover:text-red-600 transition bg-transparent border-none">
              Open an Account
            </Link>
    
            <Link to="/signin" className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-700 transition">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Home Page ──────────────────────────────────────────────────
function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-100">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-[112px]" />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <CarouselSlider />
        <div className="relative z-20 w-full -mt-1">
          <div className="w-full">
            <div className="flex w-full items-center justify-center bg-[#c7d7e3] py-3 px-6 shadow-md">
              {[{ label: "Apply for Loan", icon: "✓" }, { label: "Join", icon: "👤" }].map((item, index) => (
                <div key={item.label} className={`flex items-center gap-4 ${index === 0 ? "mr-40" : ""}`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-[#0070b8] shadow-sm transition-all duration-300 hover:bg-[#0070b8] hover:text-white cursor-pointer">
                    {item.icon}
                  </div>
                  <p className="text-xl font-bold text-[#003865]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nevada section */}
      <div className="flex flex-col lg:flex-row w-full bg-white mt-14">
        <div className="w-full lg:w-1/2">
          <div style={{ backgroundImage: `url(${nevada})` }} className="h-[500px] w-full bg-cover bg-center" />
        </div>
        <div className="flex w-full lg:w-1/2 items-center px-8 py-16 lg:px-20">
          <div className="max-w-xl">
            <h2 className="text-5xl font-bold leading-tight text-[#003865]">The Nevada credit union you trust</h2>
            <p className="mt-8 text-lg leading-8 text-gray-700">
              At One Nevada Credit Union, we do more than offer basic banking. Our commitment to building a stronger Nevada starts with making financially savvy Nevadans—One at a time.
            </p>
            <button className="mt-10 rounded-full bg-red-700 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-800">Join today</button>
          </div>
        </div>
      </div>

      <RatesSection />

      {/* Spend Wisely */}
      <div className="flex flex-col lg:flex-row w-full bg-white mt-14">
        <div className="w-full lg:w-1/2">
          <div style={{ backgroundImage: `url(${simplify})` }} className="h-[450px] w-[80%] mx-auto lg:ml-28 bg-cover bg-center" />
        </div>
        <div className="flex w-full lg:w-1/2 items-center px-0 py-16 lg:px-0 lg:pl-28">
          <div className="max-w-full w-[80%] mx-auto lg:w-full lg:mx-0">
            <p className="text-sm font-semibold leading-tight text-[#003865]">Spend Wisely</p>
            <h2 className="text-5xl font-semibold leading-tight text-[#003865]">Simplify Your Life</h2>
            <p className="mt-8 text-lg leading-8 text-gray-700">Get a One Nevada Credit Union checking account that fits your budget and lifestyle. We can help you spend wisely now, so you'll have more to spend later.</p>
            <button className="mt-10 rounded-full bg-red-700 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-800">Learn more</button>
          </div>
        </div>
      </div>

      {/* Save Diligently */}
      <div className="flex flex-col-reverse lg:flex-row w-full bg-white mt-14">
        <div className="flex w-full lg:w-1/2 items-center py-16 px-6 sm:px-12 md:px-20 lg:px-20 lg:pl-28">
          <div className="max-w-xl">
            <p className="text-sm font-semibold leading-tight text-[#003865]">Save Diligently</p>
            <h2 className="text-4xl font-semibold leading-tight text-[#003865]">Start Building Your Future</h2>
            <p className="mt-8 text-lg leading-8 text-gray-700">Building savings can mean starting slow and doing more over time. The more you save, the bigger your future can be. One Nevada Credit Union accounts are designed for you.</p>
            <button className="mt-10 rounded-full bg-red-700 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-800">Learn more</button>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div style={{ backgroundImage: `url(${save})` }} className="h-[450px] w-[80%] bg-cover bg-center" />
        </div>
      </div>

      {/* Borrow Smartly */}
      <div className="flex flex-col lg:flex-row w-full bg-white mt-14">
        <div className="w-full lg:w-1/2">
          <div style={{ backgroundImage: `url(${dreams})` }} className="h-[450px] w-[80%] mx-auto lg:ml-28 bg-cover bg-center" />
        </div>
        <div className="flex w-full lg:w-1/2 items-center px-0 py-16 lg:px-0 lg:pl-28">
          <div className="max-w-full w-[80%] mx-auto lg:w-full lg:mx-0">
            <p className="text-xl font-semibold leading-tight text-[#003865]">Borrow Smartly</p>
            <h2 className="text-4xl font-semibold leading-tight text-[#003865] mt-2">Dreams can (and do) come true</h2>
            <p className="mt-8 text-lg leading-8 text-gray-700 tracking-tighter">A little help never hurt anyone. One Nevada Credit Union has loans for those buying a house, wanting a new car, or just needing to get to the next payday.</p>
            <button className="mt-10 rounded-full bg-red-700 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-800">Learn more</button>
          </div>
        </div>
      </div>

      {/* Community */}
      <div className="flex flex-col-reverse lg:flex-row w-full bg-white mt-14">
        <div className="flex w-full lg:w-1/2 items-center py-16 px-6 sm:px-12 md:px-20 lg:px-20 lg:pl-28">
          <div className="max-w-xl">
            <p className="text-xl font-semibold leading-tight text-[#003865]">Community</p>
            <h2 className="text-4xl font-semibold leading-tight text-[#003865] mt-2">We're building a stronger Nevada—together</h2>
            <p className="mt-8 text-lg leading-8 text-gray-700 tracking-tighter">One Nevada Credit Union believes in the power of Nevadans helping Nevadans, whether we're supporting a popular community event or offering scholarships to the bright young leaders of tomorrow.</p>
            <button className="mt-10 rounded-full bg-red-700 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-800">Learn more</button>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div style={{ backgroundImage: `url(${community})` }} className="h-[450px] w-[80%] bg-cover bg-center" />
        </div>
      </div>

      <div className="bg-[#dbe9f4]">
        {/* Digital Banking */}
        <div className="flex flex-col-reverse lg:flex-row w-full bg-[#dbe9f4] mt-14">
          <div className="flex w-full lg:w-1/2 items-center py-16 px-6 sm:px-12 md:px-20 lg:px-20 lg:pl-28">
            <div className="max-w-xl">
              <p className="text-xl font-semibold leading-tight text-[#003865]">Digital Banking</p>
              <h2 className="text-4xl font-semibold leading-tight text-[#003865] mt-2">Say goodbye to waiting in line</h2>
              <p className="mt-8 text-lg leading-8 text-gray-700 tracking-tighter">With digital banking, you don't have to schedule constant trips to your local branch. You only need a desktop or phone app to get started with One Nevada remote banking.</p>
              <ul className="space-y-4 mb-10 mt-8">
                {digitalChecks.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#003865] flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="text-gray-700 text-base font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-6 rounded-full bg-red-700 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-800">Learn more</button>
              <div className="flex flex-wrap items-center gap-4 mt-10">
                <a href="#" className="transition hover:scale-105">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-14 w-auto" />
                </a>
                <a href="#" className="transition hover:scale-105">
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="h-14 w-auto" />
                </a>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div style={{ backgroundImage: `url(${digital})` }} className="h-[650px] w-[100%] bg-cover bg-center" />
          </div>
        </div>

        {/* Careers */}
        <div className="flex flex-col lg:flex-row w-full bg-[#dbe9f4] mt-14">
          <div className="w-full lg:w-1/2">
            <div style={{ backgroundImage: `url(${careers})` }} className="h-[650px] w-[100%] mx-auto lg:ml-18 bg-cover bg-center" />
          </div>
          <div className="flex w-full lg:w-1/2 items-center px-0 py-16 lg:px-0 lg:pl-16">
            <div className="max-w-full w-[80%] mx-auto lg:w-full lg:mx-0">
              <p className="text-xl font-semibold leading-tight text-[#003865]">Careers</p>
              <h2 className="text-4xl font-semibold leading-tight text-[#003865] mt-2">Join the One Nevada team</h2>
              <p className="mt-8 text-lg leading-8 text-gray-700 tracking-tighter">Looking for a career in banking? At One Nevada, employees matter, and we could have the perfect opportunity for you. If you join us, you'll enjoy a range of benefits:</p>
              <ul className="space-y-4 mb-10 mt-8">
                {careersChecks.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#003865] flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="text-gray-700 text-base font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-10 rounded-full bg-red-700 px-10 py-4 text-lg font-bold text-white transition hover:bg-red-800">Learn more</button>
            </div>
          </div>
        </div>
      </div>

      <BlogSection />

      {/* FAQ Section */}
      <div className="w-full bg-[#f3f3f3] py-16 flex flex-col items-center justify-center text-center">
        <div className="px-8 py-2 w-[60%] mb-8">
          <p className="text-[#0070b8] text-sm font-semibold">Our local experts can answer all your credit union queries.</p>
        </div>
        <h2 className="text-4xl font-semibold text-[#003865] tracking-wide">One Nevada Credit Union FAQs</h2>
        <button className="mt-12 rounded-full bg-red-700 px-8 py-2 text-xl font-bold text-white transition hover:bg-red-800">View All FAQs</button>
      </div>

      {/* Footer */}
      <div className="w-full bg-[#002d5c] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[minmax(280px,320px)_1fr]">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="text-2xl font-bold tracking-tight">OneNevada</div>
                <div className="text-sm uppercase tracking-[0.35em] text-sky-300">CREDIT UNION</div>
              </div>
              <p className="text-sky-500 font-semibold">Routing Number: 322484401</p>
              <div className="flex items-center gap-3 text-slate-100">
                {[
                  <path key="fb" d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.09 5.66 21.18 10.44 22v-6.99H7.9v-2.88h2.54V9.34c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.88h-2.34V22C18.34 21.18 22 17.09 22 12.07z" />,
                  <path key="tw" d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />,
                  <path key="yt" d="M23.5 6.2a3 3 0 00-2.12-2.12C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.38.58A3 3 0 00.5 6.2 31.08 31.08 0 000 12a31.08 31.08 0 00.5 5.8 3 3 0 002.12 2.12C4.4 20.5 12 20.5 12 20.5s7.6 0 9.38-.58a3 3 0 002.12-2.12A31.08 31.08 0 0024 12a31.08 31.08 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />,
                ].map((path, i) => (
                  <a key={i} href="#" className="rounded-full border border-white/20 p-3 text-sm transition hover:bg-white/10">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">{path}</svg>
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="rounded-full border border-white/20 px-4 py-3 text-sm transition hover:bg-white/10">App Store</a>
                <a href="#" className="rounded-full border border-white/20 px-4 py-3 text-sm transition hover:bg-white/10">Google Play</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { title: "Personal Banking", items: ["Checking","Credit Cards","Savings","Digital Banking","Contact & Location","Careers"] },
                { title: "Loans", items: ["Rates","Personal","Vehicle","Mortgage","Mortgage Loans Originators","Commercial Real Estate"] },
                { title: "Insurance", items: ["Auto","Home","Renters","Life","Accidental","Pet"] },
                { title: "Investments", items: ["Financial Planning","Retirement Planning","Financial Advisors"] },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-sm font-semibold tracking-[0.24em] text-sky-300 mb-5">{col.title}</p>
                  <ul className="space-y-3 text-sm text-slate-100 font-bold">
                    {col.items.map((item) => <li key={item}><a href="#" className="hover:text-white">{item}</a></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300 font-bold">
              {["About Us","Careers","Contact Us","Disclosures","Locations","Refer Friends","Privacy Policy","ADA","Security","Sitemap"].map((item, index, array) => (
                <span key={item} className="flex items-center gap-2">
                  <a href="#" className="hover:text-white">{item}</a>
                  {index < array.length - 1 && <span className="text-slate-500">·</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-300 text-center font-bold">
            Copyright © 2026 One Nevada Credit Union. All Rights Reserved. <br /> Federally Insured by NCUA. Equal Housing Opportunity. Milestone Inc.
          </div>
        </div>
      </div>
    </div>
  );
}

function ChequePage() {
  return (
    <div className="min-h-screen bg-[#08172f] text-slate-100">
      <div className="pt-[128px]" />
      <ChequeSection />
    </div>
  );
}

function CardPage() {
  return (
    <div className="min-h-screen bg-[#08172f] text-slate-100">
      <div className="pt-[128px]" />
      <CardForm />
    </div>
  );
}

// ── Per-page document title + meta description ─────────────────
const PAGE_META = {
  "/": { title: "One Nevada Credit Union | Personal Banking, Loans & Insurance", desc: "One Nevada Credit Union — secure online banking, loans, and insurance for Nevadans." },
  "/signin": { title: "Sign In | One Nevada Credit Union", desc: "Sign in to your One Nevada Credit Union online banking account." },
  "/forgot-password": { title: "Forgot Password | One Nevada Credit Union", desc: "Request password reset instructions for your One Nevada Credit Union online banking account." },
  "/reset-password": { title: "Reset Password | One Nevada Credit Union", desc: "Choose a new password for your One Nevada Credit Union online banking account." },
  "/signup": { title: "Open an Account | One Nevada Credit Union", desc: "Open a checking account with One Nevada Credit Union in minutes." },
  "/dashboard": { title: "Account Overview | One Nevada Credit Union", desc: "View your balances, accounts, and recent activity." },
  "/transfer": { title: "Transfer Money | One Nevada Credit Union", desc: "Move money between your accounts or send to external banks." },
  "/ach": { title: "ACH Payments | One Nevada Credit Union", desc: "Send and collect ACH payments." },
  "/pay-bills": { title: "Pay Bills | One Nevada Credit Union", desc: "Pay bills with ACH." },
  "/deposit": { title: "Deposit a Cheque | One Nevada Credit Union", desc: "Deposit a cheque using mobile deposit." },
  "/wire-money": { title: "Wire Transfer | One Nevada Credit Union", desc: "Send domestic and international wire transfers." },
  "/cheque": { title: "Cash a Cheque | One Nevada Credit Union", desc: "Cash out a cheque to your account." },
  "/transaction": { title: "Transactions | One Nevada Credit Union", desc: "Review your transaction history and status." },
  "/statements": { title: "Statements | One Nevada Credit Union", desc: "View and download your account statements." },
  "/card": { title: "Apply for a Card | One Nevada Credit Union", desc: "Apply for a One Nevada credit or debit card." },
  "/report": { title: "Report an Issue | One Nevada Credit Union", desc: "Report a problem with your account or a transaction." },
  "/settings": { title: "Settings | One Nevada Credit Union", desc: "Manage your profile, security, and notification preferences." },
  "/admin": { title: "Admin Console | One Nevada Credit Union", desc: "Administrative dashboard." },
};

function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = PAGE_META[pathname] || { title: "One Nevada Credit Union", desc: "Secure online banking with One Nevada Credit Union." };
    document.title = meta.title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", meta.desc);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TitleManager />
      <div className="min-h-screen bg-white text-slate-100">
        <Routes>
          <Route path="/cheque" element={<ProtectedRoute><ChequePage /></ProtectedRoute>} />
          <Route path="/card" element={<ProtectedRoute><CardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><ChaseDashboard /></ProtectedRoute>} />
          <Route path="/ach" element={<ProtectedRoute><AchPage /></ProtectedRoute>} />
          <Route path="/pay-bills" element={<ProtectedRoute><AchPage /></ProtectedRoute>} />
          <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
          <Route path="/statements" element={<ProtectedRoute><StatementsPage /></ProtectedRoute>} />
          <Route path="/wire-money" element={<ProtectedRoute><WireMoneyPage /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
          <Route path="/transaction" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;

// ── Chat Widget ────────────────────────────────────────────────

