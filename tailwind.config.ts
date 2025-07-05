import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'],
				'serif': ['Crimson Text', 'serif'],
			},
			colors: {
				// Sistema de cores iOS/Apple
				ios: {
					blue: '#007AFF',
					green: '#34C759',
					indigo: '#5856D6',
					orange: '#FF9500',
					pink: '#FF2D92',
					purple: '#AF52DE',
					red: '#FF3B30',
					teal: '#5AC8FA',
					yellow: '#FFCC00',
					gray: '#8E8E93',
					gray2: '#AEAEB2',
					gray3: '#C7C7CC',
					gray4: '#D1D1D6',
					gray5: '#E5E5EA',
					gray6: '#F2F2F7',
				},
				// Modo escuro iOS
				'ios-dark': {
					bg: '#000000',
					bg2: '#1C1C1E',
					bg3: '#2C2C2E',
					bg4: '#3A3A3C',
					text: '#FFFFFF',
					text2: '#EBEBF5',
					text3: '#EBEBF599',
				},
				// Cores originais do sistema (manter compatibilidade)
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				celestial: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
				},
				divine: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// iOS specific radius
				'ios-sm': '8px',
				'ios-md': '12px',
				'ios-lg': '16px',
				'ios-xl': '20px',
				'ios-2xl': '24px',
			},
			backdropBlur: {
				'ios': '20px',
				'ios-heavy': '40px',
			},
			boxShadow: {
				// iOS shadows
				'ios-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
				'ios-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
				'ios-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
				'ios-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
				'ios-2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
				'ios-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'divine-pulse': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.02)' }
				},
				'celestial-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				// iOS animations
				'ios-bounce': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(0.95)' }
				},
				'ios-slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'ios-slide-down': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'ios-slide-right': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'ios-fade-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'ios-shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'divine-pulse': 'divine-pulse 3s ease-in-out infinite',
				'celestial-flow': 'celestial-flow 8s ease-in-out infinite',
				// iOS animations
				'ios-bounce': 'ios-bounce 0.3s ease-out',
				'ios-slide-up': 'ios-slide-up 0.3s ease-out',
				'ios-slide-down': 'ios-slide-down 0.3s ease-out',
				'ios-slide-right': 'ios-slide-right 0.3s ease-out',
				'ios-fade-in': 'ios-fade-in 0.3s ease-out',
				'ios-shimmer': 'ios-shimmer 2s ease-in-out infinite',
			},
			backgroundImage: {
				'celestial-gradient': 'linear-gradient(-45deg, #0ea5e9, #3b82f6, #8b5cf6, #f59e0b)',
				'divine-radial': 'radial-gradient(circle at center, rgba(251, 191, 36, 0.3) 0%, rgba(14, 165, 233, 0.1) 70%)',
				// iOS gradients
				'ios-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
				'ios-card': 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
				'ios-button': 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
			},
			transitionTimingFunction: {
				'ios': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
				'ios-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
