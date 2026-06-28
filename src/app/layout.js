export const metadata = {
  title: 'スライド動画メーカー',
  description: 'BGM・ロゴ・縦書き・テンプレート対応のスライド動画作成ツール',
}
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Noto+Sans+JP:wght@300;400;700;900&family=Noto+Serif+JP:wght@300;400;700&family=M+PLUS+Rounded+1c:wght@300;400;700&family=Zen+Maru+Gothic:wght@300;400;500;700;900&family=Zen+Antique&family=Kaisei+Decol:wght@400;700&family=BIZ+UDPGothic:wght@400;700&family=Dela+Gothic+One&family=RocknRoll+One&family=DotGothic16&family=Rampart+One&display=swap" rel="stylesheet" />
      </head>
      <body style={{margin:0,padding:0}}>{children}</body>
    </html>
  )
}
