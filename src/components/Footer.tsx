export default function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <p>© {currentYear} SQL to TypeScript Converter, by Andrew Bell</p>
    </footer>
  )
}