import type { Metadata } from 'next'
import { Poppins, Roboto,Inter,Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { RegistrationProvider } from '@/contexts/RegistrationContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import AccessibilityProvider from '@/components/accessibility-provider'
import './globals.css'

// Load Poppins for general text
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

// Load Roboto for monospace/code
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
})

// Load Inter (secondary sans option)
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})
// Load Bebas Neue (display headings, bold titles, etc.)
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400', // Bebas Neue only has one weight
  variable: '--font-bebas',
})
export const metadata: Metadata = {
  title: 'Martial Arts Academy - Student Portal',
  description: 'Student dashboard for martial arts training, progress tracking, and course management',
  keywords: 'martial arts, karate, training, student portal, academy',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable} ${bebasNeue.variable}`}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f59e0b" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={`font-sans ${poppins.variable}`}>
        <AccessibilityProvider>
          <AuthProvider>
            <RegistrationProvider>
              {children}
            </RegistrationProvider>
          </AuthProvider>
          <Toaster />
        </AccessibilityProvider>
        <Analytics />
      </body>
    </html>
  )
}
