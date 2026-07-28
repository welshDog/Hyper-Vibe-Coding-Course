export const REFERRAL_LINK_LOAD_ERROR = 'Referral link unavailable right now.';
export const REFERRAL_LINK_COPY_ERROR = 'Copy failed. Select the referral link and copy it manually.';

type RpcErrorLike = {
  message?: string;
};

export type ReferralRpcClient = {
  rpc(
    fn: 'get_or_create_referral_code',
  ): Promise<{
    data: unknown;
    error: RpcErrorLike | null;
  }>;
};

export async function fetchReferralCode(client: ReferralRpcClient): Promise<string | null> {
  const { data, error } = await client.rpc('get_or_create_referral_code');

  if (error) {
    throw new Error(error.message ?? REFERRAL_LINK_LOAD_ERROR);
  }

  return typeof data === 'string' ? data : null;
}

export function buildReferralLink(code: string | null, origin = getCurrentOrigin()): string | null {
  return code ? `${origin}/register?ref=${code}` : null;
}

function getCurrentOrigin(): string {
  return typeof window === 'undefined' ? '' : window.location.origin;
}

export function fallbackCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}
