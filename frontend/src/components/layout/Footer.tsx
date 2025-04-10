/**
 * Footer component with responsive design and proper accessibility
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-4 flex items-center justify-center">
      <p>&copy; {currentYear} SystemFlow. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
