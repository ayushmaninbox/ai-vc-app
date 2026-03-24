"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
    Video, Phone, Clock, Search, LogOut, User,
    Plus, ChevronRight, Hand, Loader2, Wifi
} from "lucide-react";

interface CallRecord {
    _id: string;
    roomId: string;
    status: string;
    duration: number;
    createdAt: string;
    initiator: { name: string; email: string; avatar?: string };
}

interface UserResult {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    isOnline: boolean;
}

function formatDuration(secs: number) {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [calls, setCalls] = useState<CallRecord[]>([]);
    const [loadingCalls, setLoadingCalls] = useState(true);
    const [searchQ, setSearchQ] = useState("");
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        if (isLoading) return;
        if (!user) { router.push("/login"); return; }
        api.get("/calls/history?limit=5")
            .then((r) => setCalls(r.data.data.calls))
            .catch(() => { })
            .finally(() => setLoadingCalls(false));
    }, [user, router, isLoading]);

    useEffect(() => {
        if (searchQ.trim().length < 2) { setSearchResults([]); return; }
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const r = await api.get(`/users/search?q=${encodeURIComponent(searchQ)}`);
                setSearchResults(r.data.data.users);
            } catch { setSearchResults([]); }
            finally { setSearching(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [searchQ]);

    const startCall = async () => {
        setStarting(true);
        try {
            const r = await api.post("/calls/create");
            const { roomId } = r.data.data.call;
            router.push(`/call/${roomId}`);
        } catch {
            toast.error("Failed to create call. Please try again.");
        } finally {
            setStarting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#fbf9f5] flex text-[#1b1c1a]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#f5f3ef] border-r border-[#dbdad6] flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-[#dbdad6]">
                    <Link href="/" className="flex items-center gap-2">
                        <Hand size={18} className="text-[#9a442d]" />
                        <span className="font-serif font-semibold text-xl text-[#1b1c1a]">SignBridge</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-4">
                    {[
                        { href: "/dashboard", icon: Video, label: "Dashboard" },
                        { href: "/history", icon: Clock, label: "Call History" },
                        { href: "/profile", icon: User, label: "My Profile" },
                    ].map(({ href, icon: Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 px-4 py-3 text-[#55423e] hover:text-[#1b1c1a] hover:bg-[#eae8e4] transition-all group font-body text-sm"
                        >
                            <Icon size={18} className="group-hover:text-[#9a442d] transition-colors" />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#dbdad6]">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#eae8e4] mb-2 border border-[#dbdad6]">
                        <div className="w-8 h-8 rounded-full bg-[#9a442d] flex items-center justify-center text-sm font-serif text-white shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1b1c1a] truncate font-body">{user.name}</p>
                            <p className="text-[10px] text-[#88726d] capitalize font-label tracking-wide">{user.role} user</p>
                        </div>
                    </div>
                    <button
                        onClick={async () => { await logout(); router.push("/"); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-[#55423e] hover:text-[#ba1a1a] hover:bg-[#ffdbd2]/50 transition-all font-body text-sm rounded-none border border-transparent hover:border-[#ba1a1a]/20"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 flex-1 p-10 md:p-14">
                {/* Header */}
                <div className="mb-12">
                    <p className="font-label text-xs text-[#9a442d] mb-2 tracking-[0.1em]">Welcome back</p>
                    <h1 className="font-serif text-4xl text-[#1b1c1a] mb-2">
                        Good day, {user.name.split(" ")[0]}
                    </h1>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <button
                        onClick={startCall}
                        disabled={starting}
                        id="start-call-btn"
                        className="group bg-[#ffffff] p-8 text-left border border-[#dbdad6] hover:border-[#9a442d] transition-colors tuscan-shadow flex flex-col items-start"
                    >
                        <div className="w-12 h-12 bg-[#9a442d] flex items-center justify-center mb-6 text-white group-hover:bg-[#7c2e19] transition-colors">
                            {starting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                        </div>
                        <h3 className="font-serif text-xl border-b border-[#1b1c1a] pb-1 mb-2 inline-block">Start a Call</h3>
                        <p className="font-body text-sm text-[#55423e]">Create a new video room instantly.</p>
                    </button>

                    <Link
                        href="/history"
                        className="group bg-[#ffffff] p-8 text-left border border-[#dbdad6] hover:border-[#e07a5f] transition-colors tuscan-shadow flex flex-col items-start"
                    >
                        <div className="w-12 h-12 bg-[#f5f3ef] border border-[#dbdad6] flex items-center justify-center mb-6 text-[#9a442d] group-hover:bg-[#ffdbd2] transition-colors">
                            <Clock size={20} />
                        </div>
                        <h3 className="font-serif text-xl pb-1 mb-2">Call History</h3>
                        <p className="font-body text-sm text-[#55423e]">Review your past conversations.</p>
                    </Link>

                    <Link
                        href="/profile"
                        className="group bg-[#ffffff] p-8 text-left border border-[#dbdad6] hover:border-[#88726d] transition-colors tuscan-shadow flex flex-col items-start"
                    >
                        <div className="w-12 h-12 bg-[#f5f3ef] border border-[#dbdad6] flex items-center justify-center mb-6 text-[#1b1c1a] group-hover:bg-[#eae8e4] transition-colors">
                            <User size={20} />
                        </div>
                        <h3 className="font-serif text-xl pb-1 mb-2">My Profile</h3>
                        <p className="font-body text-sm text-[#55423e]">Manage account details and settings.</p>
                    </Link>
                </div>

                {/* Search users */}
                <div className="bg-[#ffffff] border border-[#dbdad6] p-8 mb-8 tuscan-shadow">
                    <h2 className="font-serif text-2xl text-[#1b1c1a] mb-6 flex items-center gap-3">
                        Find Users
                    </h2>
                    <div className="relative mb-2">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#88726d]" />
                        <input
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full bg-[#fbf9f5] border border-[#dbdad6] pl-12 pr-4 py-4 text-[#1b1c1a] placeholder-[#88726d] focus:outline-none focus:border-[#9a442d] transition-colors font-body text-sm"
                        />
                        {searching && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a442d] animate-spin" />}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-6 border-t border-[#dbdad6] pt-4">
                            {searchResults.map((u) => (
                                <div key={u._id} className="flex items-center gap-4 py-3 border-b border-[#f5f3ef] last:border-0 hover:bg-[#f5f3ef] transition-colors px-2 -mx-2">
                                    <div className="w-10 h-10 rounded-full bg-[#9a442d] flex items-center justify-center text-sm font-serif text-white shrink-0">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1b1c1a] font-body">{u.name}</p>
                                        <p className="text-xs text-[#55423e] font-body">{u.email} · <span className="capitalize">{u.role}</span></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {u.isOnline && <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-label text-emerald-700 bg-emerald-100 px-2 py-1"><Wifi size={10} /> Online</span>}
                                        <button
                                            onClick={startCall}
                                            className="px-4 py-2 border border-[#9a442d] text-[#9a442d] font-body text-xs uppercase tracking-wider hover:bg-[#9a442d] hover:text-white transition-colors"
                                        >
                                            Call
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Calls */}
                <div className="bg-[#ffffff] border border-[#dbdad6] p-8 tuscan-shadow">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#dbdad6]">
                        <h2 className="font-serif text-2xl text-[#1b1c1a]">
                            Recent Calls
                        </h2>
                        <Link
                            href="/history"
                            className="font-body text-sm text-[#9a442d] underline underline-offset-4 hover:text-[#e07a5f] transition-colors"
                        >
                            View all
                        </Link>
                    </div>

                    {loadingCalls ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-[#f5f3ef] animate-pulse" />
                            ))}
                        </div>
                    ) : calls.length === 0 ? (
                        <div className="text-center py-12 bg-[#f5f3ef] border border-[#dbdad6]">
                            <Video size={30} className="text-[#88726d] mx-auto mb-4 opacity-50" />
                            <p className="font-serif text-lg text-[#55423e] mb-2">No calls yet.</p>
                            <p className="font-body text-sm text-[#88726d] mb-6">Start a conversation to see your history here.</p>
                            <button
                                onClick={startCall}
                                className="btn-primary"
                            >
                                New Call
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#dbdad6]">
                            {calls.map((c) => (
                                <div key={c._id} className="flex items-center gap-4 py-4 hover:bg-[#fbf9f5] transition-colors px-2 -mx-2">
                                    <div className="w-10 h-10 bg-[#eae8e4] text-[#1b1c1a] flex items-center justify-center text-sm font-serif shrink-0 border border-[#dbdad6]">
                                        {c.initiator?.name?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1b1c1a] font-body truncate">{c.initiator?.name || "Unknown"}</p>
                                        <p className="text-xs text-[#55423e] font-body mt-0.5">{timeAgo(c.createdAt)} · {formatDuration(c.duration)}</p>
                                    </div>
                                    <span className={`font-label text-[10px] tracking-widest px-3 py-1 border ${c.status === 'ended' ? 'bg-[#f5f3ef] text-[#55423e] border-[#dbdad6]' :
                                        c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            'bg-[#ffdbd2] text-[#9a442d] border-[#e07a5f]'
                                        }`}>
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
