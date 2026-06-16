import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export default function DiscordCallback() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [status, setStatus] = useState<'linking' | 'success' | 'error'>('linking');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        async function handleCallback() {
            const code = params.get('code');
            const state = params.get('state');
            const storedState = sessionStorage.getItem('discord_oauth_state');

            if (!code) {
                setStatus('error');
                setErrorMsg('No authorisation code received from Discord.');
                return;
            }
            if (!state || state !== storedState) {
                setStatus('error');
                setErrorMsg('Security check failed. Please go back to your profile and try again.');
                return;
            }
            sessionStorage.removeItem('discord_oauth_state');

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setStatus('error');
                setErrorMsg('You must be logged in to link Discord. Please log in and try again.');
                return;
            }

            const redirectUri = `${window.location.origin}/auth/discord/callback`;
            const resp = await fetch(`${SUPABASE_URL}/functions/v1/discord-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ code, redirect_uri: redirectUri }),
            });

            if (resp.ok) {
                setStatus('success');
                setTimeout(() => navigate('/profile'), 1500);
            } else {
                const err = await resp.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
                setStatus('error');
                setErrorMsg(err.error ?? 'Failed to link Discord. Please try again.');
            }
        }
        void handleCallback();
    }, [navigate, params]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0A0E1A',
                color: '#E2E8F0',
                fontFamily: 'Inter, system-ui, sans-serif',
                gap: 12,
            }}
        >
            {status === 'linking' && (
                <>
                    <div style={{ fontSize: 36 }}>🔗</div>
                    <p style={{ margin: 0, fontSize: 16, color: '#94a3b8' }}>
                        Linking your Discord account…
                    </p>
                </>
            )}
            {status === 'success' && (
                <>
                    <div style={{ fontSize: 36 }}>✅</div>
                    <p style={{ margin: 0, fontSize: 16, color: '#4ade80' }}>
                        Discord linked! Taking you back…
                    </p>
                </>
            )}
            {status === 'error' && (
                <>
                    <div style={{ fontSize: 36 }}>❌</div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 16,
                            color: '#f87171',
                            textAlign: 'center',
                            maxWidth: 360,
                        }}
                    >
                        {errorMsg}
                    </p>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            marginTop: 8,
                            padding: '8px 20px',
                            background: 'rgba(168,85,247,0.15)',
                            border: '1px solid rgba(168,85,247,0.35)',
                            borderRadius: 8,
                            color: '#c084fc',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                    >
                        ← Back to profile
                    </button>
                </>
            )}
        </div>
    );
}
