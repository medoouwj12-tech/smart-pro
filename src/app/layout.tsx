import type { Metadata } from 'next'; import './globals.css'; import './theme.css';
export const metadata:Metadata={title:'SMARTGUARD PRO | مركز التحكم الذكي',description:'منصة إدارة الأمن والموارد البشرية'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
