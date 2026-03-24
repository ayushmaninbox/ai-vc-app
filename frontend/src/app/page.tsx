"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Hand, Mic, Video, Shield, Zap, Globe,
  ArrowRight, MessageSquare, Activity
} from "lucide-react";

/* ── Data ── */
const features = [
  {
    icon: Hand,
    title: "Sign Language Recognition",
    desc: "Our neural network watches your hands and translates every gesture into text — instantly and accurately.",
  },
  {
    icon: Mic,
    title: "Live Speech Captions",
    desc: "Spoken words become on-screen captions in real time. No delay, no confusion.",
  },
  {
    icon: Video,
    title: "Crystal-Clear Video",
    desc: "WebRTC peer-to-peer streaming delivers HD quality with virtually no latency.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "Every call is end-to-end encrypted. Your conversations stay between you and the person you're talking to.",
  },
  {
    icon: Zap,
    title: "Built for Speed",
    desc: "Sub-50ms latency means your words arrive as fast as you can sign or speak them.",
  },
  {
    icon: Globe,
    title: "For Everyone",
    desc: "Deaf, hard of hearing, or hearing — SignBridge is designed so nobody gets left out.",
  },
];

const numbers = [
  { value: "<50ms", label: "Latency" },
  { value: "99%", label: "Recognition Accuracy" },
  { value: "HD", label: "Video Quality" },
  { value: "E2E", label: "Encrypted" },
];

/* ── Component ── */
export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
    setMounted(true);
  }, [user, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] overflow-x-hidden">

      {/* ──── Navbar ──── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fbf9f5]/95" style={{ backdropFilter: 'blur(4px)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Hand size={22} className="text-[#9a442d]" />
            <span className="font-serif text-xl font-semibold text-[#1b1c1a]">SignBridge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-[#55423e] hover:text-[#1b1c1a] transition-colors font-body">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ──── Hero ──── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-12 md:gap-8 items-center">
            {/* Left — Text */}
            <div className="md:col-span-6 lg:col-span-5">
              <p className="font-label text-xs text-[#9a442d] mb-6 animate-fade-up"
                style={{ animationDelay: '0.1s' }}>
                Communication reimagined
              </p>
              <h1
                className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-normal mb-8 animate-fade-up"
                style={{ animationDelay: '0.2s' }}
              >
                Every hand
                <br />
                has a{" "}
                <em className="text-[#e07a5f]">voice.</em>
              </h1>
              <p
                className="font-body text-lg text-[#55423e] leading-relaxed mb-10 max-w-md animate-fade-up"
                style={{ animationDelay: '0.35s' }}
              >
                SignBridge uses AI to translate sign language in real&nbsp;time during
                video calls. Deaf and hearing users finally communicate without barriers.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <Link href="/signup" className="btn-primary flex items-center gap-2">
                  Start for free <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="btn-secondary">
                  Sign in →
                </Link>
              </div>
            </div>

            {/* Right — Image */}
            <div className="md:col-span-6 lg:col-span-7 animate-slide-right" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <Image
                  src="/hero.png"
                  alt="Two people communicating through sign language on a video call"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Numbers ──── */}
      <section className="py-16 px-6 md:px-12 bg-[#f5f3ef]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {numbers.map((n, i) => (
            <div key={n.label} className="text-center animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="font-serif text-4xl md:text-5xl font-normal text-[#9a442d] mb-2">{n.value}</div>
              <div className="font-label text-[10px] text-[#55423e] tracking-[0.15em]">{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Demo Preview ──── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left — Description */}
            <div className="md:col-span-5">
              <p className="font-label text-xs text-[#9a442d] mb-5">How it looks</p>
              <h2 className="font-serif text-4xl md:text-5xl leading-[1.15] font-normal mb-6">
                A call that <em className="text-[#e07a5f]">understands</em> you.
              </h2>
              <p className="font-body text-[#55423e] leading-relaxed mb-8">
                One user signs, the other speaks. AI translates both — in real time. Captions
                appear instantly, and every gesture is recognized with precision.
              </p>
              <Link href="/signup" className="btn-secondary inline-flex items-center gap-2">
                Try it yourself <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right — Mock UI */}
            <div className="md:col-span-7">
              <div className="bg-[#1b1c1a] tuscan-shadow-lg overflow-hidden">
                {/* Browser bar */}
                <div className="bg-[#2a2b29] px-5 py-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e07a5f]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#dbc1ba]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#88726d]" />
                  <div className="ml-3 flex-1 bg-[#3a3b39] px-4 py-1 text-xs text-[#88726d] font-body">
                    signbridge.io/call
                  </div>
                </div>

                {/* Video tiles */}
                <div className="p-3 grid grid-cols-2 gap-3" style={{ height: 260 }}>
                  <div className="bg-[#2a2b29] flex flex-col items-center justify-center relative">
                    <div className="w-14 h-14 bg-[#9a442d] flex items-center justify-center text-white text-xl font-serif mb-2">
                      A
                    </div>
                    <span className="text-xs text-[#88726d] font-body">Alex · Signing</span>
                    <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] text-[#e07a5f] font-label tracking-widest">
                      <Hand size={10} />
                      ASL
                    </div>
                  </div>
                  <div className="bg-[#2a2b29] flex flex-col items-center justify-center relative">
                    <div className="w-14 h-14 bg-[#55423e] flex items-center justify-center text-white text-xl font-serif mb-2">
                      S
                    </div>
                    <span className="text-xs text-[#88726d] font-body">Sam · Speaking</span>
                    <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] text-[#dbc1ba] font-label tracking-widest">
                      <Mic size={10} />
                      MIC
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="bg-[#2a2b29] px-5 py-3 flex items-center gap-3">
                  <MessageSquare size={14} className="text-[#e07a5f] shrink-0" />
                  <p className="text-sm text-[#dbc1ba] font-body">
                    <span className="text-[#e07a5f] font-semibold">AI: </span>
                    &quot;Hello, how are you today?&quot;
                  </p>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#e07a5f] rounded-full animate-pulse" />
                    <span className="text-[10px] text-[#88726d] font-label tracking-widest">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Features ──── */}
      <section className="py-24 px-6 md:px-12 bg-[#f5f3ef]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-lg mb-16">
            <p className="font-label text-xs text-[#9a442d] mb-5">What we built</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.15] font-normal">
              Simple tools for <em className="text-[#e07a5f]">meaningful</em> connection.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group animate-fade-up"
                style={{ animationDelay: `${0.08 * i}s` }}
              >
                <f.icon
                  size={24}
                  className="text-[#9a442d] mb-4 group-hover:text-[#e07a5f] transition-colors duration-300"
                />
                <h3 className="font-serif text-xl font-normal mb-2">{f.title}</h3>
                <p className="font-body text-sm text-[#55423e] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Pull Quote ──── */}
      <section className="py-28 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="md:ml-24">
            <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.25] font-normal text-[#9a442d] mb-8 animate-fade-up">
              &ldquo;Everyone deserves to be heard — even when they don&apos;t use their voice.&rdquo;
            </blockquote>
            <p className="font-label text-[10px] text-[#88726d] tracking-[0.2em] animate-fade-up" style={{ animationDelay: '0.2s' }}>
              THE SIGNBRIDGE MISSION
            </p>
          </div>
        </div>
      </section>

      {/* ──── How It Works ──── */}
      <section className="py-24 px-6 md:px-12 bg-[#1b1c1a] text-[#f5f3ef]">
        <div className="max-w-5xl mx-auto">
          <p className="font-label text-xs text-[#e07a5f] mb-5">Getting started</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.15] font-normal mb-16 text-[#f5f3ef]">
            Three steps. That&apos;s it.
          </h2>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { num: "01", title: "Create your account", desc: "Sign up in seconds. No credit card, no commitments." },
              { num: "02", title: "Start a call", desc: "Invite anyone with a link. Works in any modern browser." },
              { num: "03", title: "Just talk", desc: "Sign or speak. The AI handles translation in real time." },
            ].map((s, i) => (
              <div key={s.num} className="animate-fade-up" style={{ animationDelay: `${0.15 * i}s` }}>
                <div className="font-serif text-7xl text-[#55423e] mb-6">{s.num}</div>
                <h3 className="font-serif text-2xl font-normal mb-3 text-[#f5f3ef]">{s.title}</h3>
                <p className="font-body text-sm text-[#88726d] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA ──── */}
      <section className="py-28 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.1] font-normal mb-6 animate-fade-up">
            Ready to bridge
            <br />
            <em className="text-[#e07a5f]">the gap?</em>
          </h2>
          <p className="font-body text-lg text-[#55423e] mb-10 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            Join thousands of people communicating without barriers.
          </p>
          <div className="flex justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/signup" className="btn-primary flex items-center gap-2">
              Create free account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="py-10 px-6 md:px-12 bg-[#f5f3ef]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hand size={18} className="text-[#9a442d]" />
            <span className="font-serif text-lg text-[#1b1c1a]">SignBridge</span>
          </div>
          <p className="font-body text-sm text-[#88726d]">© 2026 SignBridge. Built for accessible communication.</p>
          <div className="flex items-center gap-6 font-label text-[10px] tracking-[0.15em] text-[#55423e]">
            <Link href="/login" className="hover:text-[#9a442d] transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-[#9a442d] transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
