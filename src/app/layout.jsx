export const metadata = {
  title: 'スライド動画メーカー',
  description: 'BGM・ロゴ・縦書き・テンプレート対応のスライド動画作成ツール',
}
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{margin:0,padding:0}}>{children}</body>
    </html>
  )
}
