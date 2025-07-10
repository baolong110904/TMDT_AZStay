import { Globe, Facebook, Instagram, X } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-10">
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Help Center</a></li>
              <li><a href="#" className="hover:underline">AirCover</a></li>
              <li><a href="#" className="hover:underline">Anti-discrimination</a></li>
              <li><a href="#" className="hover:underline">Disability support</a></li>
              <li><a href="#" className="hover:underline">Cancellation options</a></li>
              <li><a href="#" className="hover:underline">Report neighborhood concern</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Hosting</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Upload your home</a></li>
              <li><a href="#" className="hover:underline">Share your experience</a></li>
              <li><a href="#" className="hover:underline">AZStay for Hosts</a></li>
              <li><a href="#" className="hover:underline">Hosting resources</a></li>
              <li><a href="#" className="hover:underline">Hosting responsibly</a></li>
              <li><a href="#" className="hover:underline">AZStay-friendly apartments</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">AZStay</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">2025 Summer Release</a></li>
              <li><a href="#" className="hover:underline">Newsroom</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Investors</a></li>
              <li><a href="#" className="hover:underline">Gift cards</a></li>
      
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t pt-6 text-xs space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center space-x-2 text-gray-500">
            <span>© 2025 AZStay, Inc.</span>
            <span>·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>·</span>
            <a href="#" className="hover:underline">Sitemap</a>
            <span>·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Your Privacy Choices</a>
          </div>

          <div className="flex items-center space-x-4 text-gray-600">
            <button className="flex items-center space-x-1 hover:underline">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </button>
            <span>VND</span>
            <a href="#"><Facebook className="w-4 h-4" /></a>
            <a href="#"><X className="w-4 h-4" /></a>
            <a href="#"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
