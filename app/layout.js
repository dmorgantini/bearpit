import '@coreui/coreui/dist/css/coreui.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export const metadata = {
  title: 'Boffer Foam Tournament Simulator',
  description: 'A sophisticated tournament simulation system for boffer foam sports',
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}