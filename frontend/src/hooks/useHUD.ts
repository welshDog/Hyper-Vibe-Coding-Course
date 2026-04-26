import { useContext } from 'react';
import { HUDContext } from '../context/HUDContext';

export function useHUD() {
  const ctx = useContext(HUDContext);
  if (!ctx) throw new Error('useHUD must be used inside HUDProvider');
  return ctx;
}
