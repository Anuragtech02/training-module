import PropTypes from 'prop-types';

import 'src/global.css';

// ----------------------------------------------------------------------

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import ThemeProvider from 'src/theme';
import { primaryFont } from 'src/theme/typography';
import { LocalizationProvider } from 'src/locales';
import ProgressBar from 'src/components/progress-bar';
import MotionLazy from 'src/components/animate/motion-lazy';
import { ReactQueryProvider } from 'src/utils/ReactQueryProvider';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';
import { ChatWidget } from 'src/components/chat-widget';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Ryzolve Training Module',
  description:
    'We facilitate the licensing and training processes for home care businesses. Embark on our Administrator/Manager Training programs in Texas, offering flexible durations of 8, 12, or 16 hours.',
  keywords:
    'ryzolve training module, ryzolve, training module,administrator/manager training programs in Texas ',
  themeColor: '#000000',
  manifest: '/manifest.json',
  icons: [
    {
      rel: 'icon',
      url: '/favicon/favicon.png',
    },
    // {
    //   rel: 'icon',
    //   type: 'image/png',
    //   sizes: '16x16',
    //   url: '/favicon/favicon-16x16.png',
    // },
    // {
    //   rel: 'icon',
    //   type: 'image/png',
    //   sizes: '32x32',
    //   url: '/favicon/favicon-32x32.png',
    // },
    // {
    //   rel: 'apple-touch-icon',
    //   sizes: '180x180',
    //   url: '/favicon/apple-touch-icon.png',
    // },
  ],
};

export default function RootLayout({ children }) {
  return (
    <ReactQueryProvider>
      <html lang="en" className={primaryFont.className}>
        <body>
          <LocalizationProvider>
            <SettingsProvider
              defaultSettings={{
                themeMode: 'light', // 'light' | 'dark'
                themeDirection: 'ltr', //  'rtl' | 'ltr'
                themeColorPresets: 'blue', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
              }}
            >
              <ThemeProvider>
                <MotionLazy>
                  <ProgressBar />
                  <SettingsDrawer />
                  {children}
                  <ToastContainer />
                  <ChatWidget />
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node,
};
