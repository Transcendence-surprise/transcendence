// SVG strings for canvas rendering
type TileType = 'I' | 'L' | 'T' | 'X';
export const TILE_SVGS: Record<TileType, string> = {
  I: `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#fb85f3"/>
        <path d="M63 68C62.4477 68 62 67.5523 62 67L62 1C62 0.447716 62.4477 0 63 0H67C67.5523 0 68 0.447715 68 1V67C68 67.5523 67.5523 68 67 68H63Z" fill="#fb85f3"/>
      </svg>`,
  L: `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 0C0.447715 0 0 0.447716 0 1V67C0 67.5523 0.447715 68 1 68H5C5.55228 68 6 67.5523 6 67V1C6 0.447715 5.55228 0 5 0H1Z" fill="#5c90f6"/>
        <path d="M0 62C0 62.5523 0.447716 63 1 63H67C67.5523 63 68 62.5523 68 62V68H0V62Z" fill="#5c90f6"/>
        <path d="M62 0C62 3.31371 64.6863 6 68 6H68V0H62Z" fill="#D9D9D9"/>
      </svg>`,
  T: `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#21e6c5"/>
        <path d="M62 68C62 64.6863 64.6863 62 68 62V62V68H62V68Z" fill="#D9D9D9"/><path d="M62 0H68V6V6C64.6863 6 62 3.31371 62 0V0Z" fill="#D9D9D9"/>
      </svg>`,
  X: `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M62 68C62 64.6863 64.6863 62 68 62V62V68H62V68Z" fill="#D9D9D9"/><path d="M62 0H68V6V6C64.6863 6 62 3.31371 62 0V0Z" fill="#D9D9D9"/>
        <path d="M0.0175781 6.01779L0.0175781 0.017786H6.01758V0.017786C6.01758 3.33149 3.33129 6.01779 0.0175781 6.01779V6.01779Z" fill="#D9D9D9"/>
        <path d="M6 68H3.57628e-07L3.57628e-07 62V62C3.31371 62 6 64.6863 6 68V68Z" fill="#D9D9D9"/>
      </svg>`,
};
