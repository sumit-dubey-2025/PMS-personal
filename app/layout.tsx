import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/utilities.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | PulsePerform',
    default: 'PulsePerform',
  },
  description: 'PulsePerform — Performance management platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward,article,cancel,check_circle,close,cloud,database,error,expand_more,grid_view,help,info,layers,list_alt,lock,logout,open_in_new,refresh,report_problem,save,schedule,schema,security,settings,settings_suggest,sync,table_rows,verified_user,visibility,visibility_off,warning,wifi_tethering"
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
