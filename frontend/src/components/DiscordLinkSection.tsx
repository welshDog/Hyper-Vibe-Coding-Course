import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import { HVZButton, HVZCard } from './ui/hvz';

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;

type DiscordLink = {
    discord_id: string;
    discord_username: string | null;
};

export default function DiscordLinkSection() {
    const { user } = useAuthStore();
    const [link, setLink] = useState<DiscordLink | null>(null);
    const [loading, setLoading] = useState(true);
    const [unlinking, setUnlinking] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => {
        if (!user) return;
        async function fetchLink() {
            const { data } = await supabase
                .from('discord_links')
                .select('discord_id, discord_username')
                .eq('user_id', user!.id)
                .maybeSingle();
            setLink(data as DiscordLink | null);
            setLoading(false);
        }
        void fetchLink();
    }, [user]);

    function handleConnect() {
        if (!DISCORD_CLIENT_ID) {
            setMsg({ ok: false, text: 'Discord integration not configured yet — contact support.' });
            return;
        }
        const state = crypto.randomUUID();
        sessionStorage.setItem('discord_oauth_state', state);
        const redirectUri = `${window.location.origin}/auth/discord/callback`;
        const url = new URL('https://discord.com/oauth2/authorize');
        url.searchParams.set('client_id', DISCORD_CLIENT_ID);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', 'identify');
        url.searchParams.set('state', state);
        window.location.href = url.toString();
    }

    async function handleUnlink() {
        if (!user) return;
        setUnlinking(true);
        const { error } = await supabase
            .from('discord_links')
            .delete()
            .eq('user_id', user.id);
        if (error) {
            setMsg({ ok: false, text: 'Could not unlink — try again.' });
        } else {
            setLink(null);
            setMsg({ ok: true, text: 'Discord unlinked.' });
            setTimeout(() => setMsg(null), 3000);
        }
        setUnlinking(false);
    }

    if (loading) {
        return (
            <div className="h-16 rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight animate-pulse" />
        );
    }

    return (
        <HVZCard padding={20}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'rgba(88,101,242,0.15)',
                            border: '1px solid rgba(88,101,242,0.35)',
                        }}
                        aria-hidden="true"
                    >
                        <svg
                            width="20"
                            height="16"
                            viewBox="0 0 71 55"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M60.1 4.9A58.5 58.5 0 0 0 45.7.6a.2.2 0 0 0-.2.1c-.6 1.1-1.3 2.5-1.8 3.7a54 54 0 0 0-16.3 0C26.9 3.2 26.2 1.8 25.6.7a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 11 4.9.2.2 0 0 0 10.9 5C1.6 18.9-1 32.4.3 45.7l.1.1a58.8 58.8 0 0 0 17.8 9 .2.2 0 0 0 .2-.1c1.4-1.9 2.6-3.9 3.6-6l.1-.2a.2.2 0 0 0-.1-.2 38.7 38.7 0 0 1-5.6-2.7.2.2 0 0 1 0-.3l1.1-.9a.2.2 0 0 1 .2 0C26.5 48.8 35.5 51 44.4 49c.1 0 .2 0 .2.1l1.1.8a.2.2 0 0 1 0 .3 38 38 0 0 1-5.6 2.7.2.2 0 0 0-.1.3c1 2 2.3 4 3.7 6a.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-9l.1-.1c1.6-16.5-2.7-30-11.5-42.3a.2.2 0 0 0-.2-.1zM23.7 37.5c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"
                                fill="#5865F2"
                            />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-hfz-text-primary m-0">Discord</p>
                        {link ? (
                            <p className="text-xs text-hfz-mint m-0 mt-0.5 truncate">
                                Connected as{' '}
                                <span className="font-mono font-bold">
                                    @{link.discord_username ?? link.discord_id}
                                </span>
                            </p>
                        ) : (
                            <p className="text-xs text-hfz-text-secondary m-0 mt-0.5">
                                Link to use{' '}
                                <span className="font-mono">/balance</span>,{' '}
                                <span className="font-mono">/daily</span> and{' '}
                                <span className="font-mono">/mypets</span> in the server
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                    {msg && (
                        <p
                            role="status"
                            className={`text-xs font-medium m-0 ${
                                msg.ok ? 'text-hfz-mint' : 'text-hfz-danger'
                            }`}
                        >
                            {msg.text}
                        </p>
                    )}
                    {link ? (
                        <HVZButton
                            variant="ghost"
                            size="sm"
                            onClick={handleUnlink}
                            disabled={unlinking}
                        >
                            {unlinking ? 'Unlinking…' : 'Unlink'}
                        </HVZButton>
                    ) : (
                        <HVZButton variant="primary" size="sm" onClick={handleConnect}>
                            Connect Discord
                        </HVZButton>
                    )}
                </div>
            </div>
        </HVZCard>
    );
}
