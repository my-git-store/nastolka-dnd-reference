import type { GlobalThemeOverrides } from 'naive-ui/es/config-provider'

// Control sizes, radii and primary colours follow the character sheet's Naive UI theme.
export const sheetTheme: GlobalThemeOverrides = {
  common: {
    fontFamily: 'var(--font-base)',
    primaryColor: '#5a4430',
    primaryColorHover: '#8b7355',
    primaryColorPressed: '#3e2c1c',
    primaryColorSuppl: '#8b7355',
  },
  Button: {
    heightMedium: '44px',
    fontSizeMedium: '15px',
    borderRadiusMedium: '16px',
  },
  Card: { borderRadius: '16px' },
  Input: {
    heightMedium: '44px',
    fontSizeMedium: '15px',
    borderRadius: '12px',
    paddingMedium: '0 14px',
  },
  Select: {
    peers: {
      InternalSelection: {
        heightMedium: '44px',
        fontSizeMedium: '15px',
        borderRadius: '12px',
      },
    },
  },
  Form: { labelFontWeight: '600' },
}
