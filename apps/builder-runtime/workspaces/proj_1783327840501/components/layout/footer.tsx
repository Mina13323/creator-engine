export default function Footer() {
  return (
    <footer className="bg-surface-variant py-8 mt-16">
      <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-title-medium text-on-surface mb-4">Company</h3>
          <ul className="space-y-2 text-body-medium text-on-surface-variant">
            <li>About</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="text-title-medium text-on-surface mb-4">Product</h3>
          <ul className="space-y-2 text-body-medium text-on-surface-variant">
            <li>Features</li>
            <li>Pricing</li>
            <li>FAQ</li>
          </ul>
        </div>
        <div>
          <h3 className="text-title-medium text-on-surface mb-4">Legal</h3>
          <ul className="space-y-2 text-body-medium text-on-surface-variant">
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="container-custom mt-8 pt-6 border-t border-outline/20 text-center text-body-small text-on-surface-variant">
        &copy; {new Date().getFullYear()} Your Business. All rights reserved.
      </div>
    </footer>
  );
}
