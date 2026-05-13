import { Attribution } from 'ox/erc8021'

// 🔵 Your Builder Code from base.dev > Settings > Builder Codes
const BUILDER_CODE = import.meta.env.VITE_BUILDER_CODE || 'broski123'

// Generate ERC-8021 compliant data suffix
export const ERC_8021_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE]
})

export default ERC_8021_SUFFIX
