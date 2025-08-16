"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  TrendingUp,
  Globe,
  Shield,
  Menu,
  X,
  ChevronDown,
  Coins,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const menuItems = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "D-Corp", href: "#d-corp" },
    { label: "Get Started", href: "#get-started" },
  ];

  return (
    <div className="bg-background flex min-h-screen flex-col overflow-x-hidden font-sans">
      <header
        className={`fixed top-0 z-40 w-full transition-all duration-500 ${
          scrolled
            ? "bg-background/80 border-border border-b backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="container flex h-20 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-2">
              <Building2 className="text-primary h-8 w-8" />
              <span className="text-xl font-bold tracking-wider">D-CORP</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground group relative text-sm font-medium transition-colors"
              >
                <span className="tracking-wider">{item.label}</span>
                <span className="from-primary/30 via-primary to-primary/30 absolute -bottom-1 left-0 h-[1px] w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden h-auto px-6 py-2 text-sm sm:flex"
            >
              Sign In
            </Button>
            <Button className="hidden h-auto px-6 py-2 text-sm sm:flex">
              Launch D-Corp
            </Button>

            {/* Mobile menu button */}
            <button
              className="text-primary focus:outline-none md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`overflow-hidden transition-all duration-500 md:hidden ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-background/90 border-border container flex flex-col space-y-4 border-t py-4 backdrop-blur-md">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground py-2 text-base font-medium tracking-wider transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-border flex flex-col space-y-3 border-t pt-3">
              <Button variant="outline" className="text-sm">
                Sign In
              </Button>
              <Button className="text-sm">Launch D-Corp</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-8 flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm">
              <Coins className="h-4 w-4" />
              Distributed Superconsumerism
            </div>

            <h1 className="text-foreground relative inline-block text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="relative z-10">The Future of</span>
              <br />
              <span className="text-primary relative z-10">
                Corporate Structure
              </span>
              <div className="via-primary/50 absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>
            </h1>

            <p className="text-muted-foreground mt-8 text-xl md:text-2xl">
              Eliminate fiduciary duty. Distribute profits to capital, labor,
              and consumers.
            </p>

            <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg leading-relaxed">
              D-Corporations represent the next evolution of business
              entities—removing the legal requirement to prioritize shareholders
              above all else and creating a more equitable distribution of
              profits among all stakeholders.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-auto px-8 py-4 text-base">
                Launch Your D-Corp
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto px-8 py-4 text-base"
              >
                See How It Works
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="from-background absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t to-transparent"></div>
        </section>

        {/* Stakeholder Benefits Section */}
        <section className="bg-muted/30 relative py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Value Distribution for All Stakeholders
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
                Unlike traditional corporations, D-Corps ensure every
                contributor receives their fair share of the value they help
                create.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-card border-border rounded-xl border p-8 text-center shadow-sm transition-all hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <Building2 className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  Capital Providers
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Founders and investors receive returns proportional to their
                  financial contribution and ongoing risk.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Equity-based distributions
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Transparent profit sharing
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Long-term value alignment
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card border-border rounded-xl border p-8 text-center shadow-sm transition-all hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  Labor Contributors
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Workers, contractors, and contributors earn based on the
                  actual value they create, not just hours worked.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Value-based compensation
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Profit sharing rewards
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Skill development incentives
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card border-border rounded-xl border p-8 text-center shadow-sm transition-all hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <Globe className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-semibold">
                  Consumer Network
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Users and customers receive tangible rewards for their
                  engagement, loyalty, and network effects.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Engagement rewards
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Loyalty program benefits
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Referral incentives
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="bg-muted/50 relative overflow-hidden py-20 md:py-32"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>

          <div className="relative container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                Rethinking Corporate Structure
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed">
                Traditional corporations are legally required to prioritize
                shareholder profits above all else. D-Corporations break this
                constraint, enabling truly equitable value distribution.
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-red-500/10 p-2">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-foreground mb-2 text-xl font-semibold">
                      No More Fiduciary Duty
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Traditional corporations must legally prioritize
                      shareholder returns above employee welfare or customer
                      satisfaction. D-Corps eliminate this requirement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-blue-500/10 p-2">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-foreground mb-2 text-xl font-semibold">
                      Programmatic Distribution
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Profits are automatically distributed according to
                      predefined percentages among capital providers, labor
                      contributors, and consumers—creating alignment across all
                      stakeholders.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-green-500/10 p-2">
                    <Globe className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-foreground mb-2 text-xl font-semibold">
                      Transparent Governance
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      All financial flows and governance decisions are recorded
                      on-chain, providing unprecedented transparency and
                      accountability to all stakeholders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-primary/5 absolute -inset-4 rounded-lg blur-md"></div>
                <div className="bg-card border-border relative rounded-lg border p-8">
                  <h3 className="text-foreground mb-6 text-2xl font-bold">
                    Example Distribution
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Capital (Founders/Investors)
                        </span>
                        <span className="text-foreground font-semibold">
                          30%
                        </span>
                      </div>
                      <div className="bg-muted relative h-2 overflow-hidden rounded-lg border">
                        <div className="absolute top-0 left-0 h-full w-[30%] rounded-lg bg-red-500"></div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Labor (Contributors)
                        </span>
                        <span className="text-foreground font-semibold">
                          40%
                        </span>
                      </div>
                      <div className="bg-muted relative h-2 overflow-hidden rounded-lg border">
                        <div className="absolute top-0 left-0 h-full w-[40%] rounded-lg bg-blue-500"></div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Consumers (Users)
                        </span>
                        <span className="text-foreground font-semibold">
                          30%
                        </span>
                      </div>
                      <div className="bg-muted relative h-2 overflow-hidden rounded-lg border">
                        <div className="absolute top-0 left-0 h-full w-[30%] rounded-lg bg-green-500"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 mt-6 rounded-lg p-4">
                    <p className="text-muted-foreground text-sm italic">
                      Distribution percentages are set at D-Corp creation and
                      encoded in smart contracts, ensuring automatic and
                      transparent profit sharing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* D-Corp Features Section */}
        <section
          id="d-corp"
          className="bg-background relative overflow-hidden py-20 md:py-32"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>

          <div className="relative container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                Built for the Future of Work
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed">
                D-Corps are designed for an economy where traditional employment
                is changing. Create sustainable value loops that benefit
                everyone in your ecosystem.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card border-border rounded-lg border p-6">
                <div className="mb-4 w-fit rounded-full bg-blue-500/10 p-3">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Labor Opportunities
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Create bounties and opportunities for contributors. Track work
                  submissions, approve contributions, and automatically
                  distribute LaborPoints.
                </p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Define work requirements & point values</li>
                  <li>• Review & approve submissions</li>
                  <li>• Automatic point distribution</li>
                </ul>
              </div>

              <div className="bg-card border-border rounded-lg border p-6">
                <div className="mb-4 w-fit rounded-full bg-green-500/10 p-3">
                  <Globe className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Consumer Rewards
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Reward your users for engagement, purchases, reviews, and
                  referrals. Build loyalty through UsePoints that convert to
                  real value.
                </p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Customizable reward campaigns</li>
                  <li>• Social proof integration</li>
                  <li>• Gamified engagement</li>
                </ul>
              </div>

              <div className="bg-card border-border rounded-lg border p-6">
                <div className="bg-primary/10 mb-4 w-fit rounded-full p-3">
                  <TrendingUp className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Profit Distribution
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Automatically distribute profits quarterly based on
                  predetermined percentages. Complete transparency with on-chain
                  execution.
                </p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Programmable distribution rules</li>
                  <li>• Quarterly automatic payouts</li>
                  <li>• Full transparency & auditability</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section
          id="get-started"
          className="bg-muted/50 relative overflow-hidden py-20 md:py-32"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>

          <div className="relative container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                Ready to Launch Your D-Corp?
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed">
                Join the movement toward more equitable business structures.
                Launch your D-Corp in minutes and start distributing value to
                all your stakeholders.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-primary text-2xl font-bold">1</span>
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Configure Distribution
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Set your profit sharing percentages between capital, labor,
                  and consumers. These rules are locked in at creation.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-primary text-2xl font-bold">2</span>
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Launch & Operate
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Start creating value with your team. Set up work opportunities
                  and reward systems to engage all stakeholders.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-primary text-2xl font-bold">3</span>
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  Distribute Profits
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quarterly distributions happen automatically. Everyone who
                  contributed value gets their fair share of the profits.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="h-auto px-8 py-4 text-base">
                  Launch Your D-Corp Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto px-8 py-4 text-base"
                >
                  View Documentation
                </Button>
              </div>

              <p className="text-muted-foreground mt-6 text-sm">
                No coding required • Launch in under 10 minutes • Built on Web3
                infrastructure
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-border relative overflow-hidden border-t py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-4">
              <div>
                <div className="mb-6 flex items-center gap-2">
                  <Building2 className="text-primary h-8 w-8" />
                  <span className="text-primary text-xl font-bold tracking-wider">
                    D-CORP
                  </span>
                </div>

                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  The next evolution of corporate structure. Distribute value
                  equitably among capital, labor, and consumers.
                </p>

                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">
                    Documentation
                  </Button>
                  <Button variant="outline" size="sm">
                    GitHub
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-foreground mb-6 text-lg font-semibold">
                  Platform
                </h3>
                <ul className="space-y-4">
                  {["Launch D-Corp", "Features", "Pricing", "Docs"].map(
                    (item, index) => (
                      <li key={index}>
                        <Link
                          href="#"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-foreground mb-6 text-lg font-semibold">
                  Resources
                </h3>
                <ul className="space-y-4">
                  {["Whitepaper", "Blog", "Community", "Support"].map(
                    (item, index) => (
                      <li key={index}>
                        <Link
                          href="#"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-foreground mb-6 text-lg font-semibold">
                  Company
                </h3>
                <ul className="space-y-4">
                  {["About", "Careers", "Press", "Legal"].map((item, index) => (
                    <li key={index}>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-border mt-12 border-t pt-8 text-center">
              <p className="text-muted-foreground">
                &copy; {new Date().getFullYear()} D-Corp Platform. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
