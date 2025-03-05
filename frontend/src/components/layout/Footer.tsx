/**
 * Footer component with responsive design and proper accessibility
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 flex items-center justify-center">
      <p>&copy; {currentYear} My Application. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
