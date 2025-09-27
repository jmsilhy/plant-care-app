import React from 'react';
import { Camera, Calendar, Smartphone, Leaf } from 'lucide-react';

const LandingPage = ({ onGetStarted, onSignIn }) => {
  const features = [
    {
      icon: <Camera className="w-8 h-8 text-green-600" />,
      title: "Photo Timeline",
      description: "Document your trees' growth journey with high-quality photos and track their progress over time.",
      screenshot: "/images/screenshot-edit.png",
      alt: "Edit plant interface showing photo management"
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Care Scheduling",
      description: "Never miss watering, fertilizing, or pruning with intelligent care reminders and activity logging.",
      screenshot: "/images/screenshot-timeline.png",
      alt: "Care activities timeline showing recent plant care"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
      title: "Mobile Optimized",
      description: "Perfect for greenhouse or outdoor use with responsive design that works on all devices.",
      screenshot: "/images/screenshot-mobile.png",
      alt: "Mobile view of plant card interface"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-xl font-semibold text-gray-900">Portulacaria Afra Care App</span>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={onSignIn}
                className="px-4 py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onGetStarted}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
              Nurture Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                {" "}P. Afra Bonsai Collection
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              The comprehensive app for tracking, caring for, and growing your Portulacaria afra collection. 
              Never miss a watering again, or forget when you last fertilized your tree!
            </p>
            <div className="flex justify-center">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg hover:shadow-xl"
              >
                Start Tracking Your Trees
              </button>
            </div>
          </div>

          {/* Main App Screenshot */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="aspect-video">
                <img 
                  src="/images/screenshot-collection.png" 
                  alt="Plant collection dashboard showing multiple Portulacaria Afra trees"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <p className="text-gray-600 font-medium">Manage your trees, add new ones you purchase or make from cuttings, document their growth!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-4 tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From beginner to expert, our app provides the tools and insights to help your Portulacaria afra collection thrive.
            </p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl font-medium text-gray-900 mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <img 
                      src={feature.screenshot} 
                      alt={feature.alt}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            Ready to Elevate Your Tree Care?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join our community of dedicated Portulacaria afra enthusiasts and take your bonsai collection to the next level. 
            Start tracking, start growing, start thriving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              Create Your Free Account
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-green-600 transition-all font-medium text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="w-8 h-8 text-green-400" />
                <span className="text-xl font-medium">Portulacaria Afra Care App</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The comprehensive plant care tracking app designed for Portulacaria afra enthusiasts and bonsai lovers everywhere.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tree Tracking</li>
                <li>Photo Timeline</li>
                <li>Care Scheduling</li>
                <li>Mobile Optimized</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Portulacaria Afra Care App. Made with ❤️ for plant enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;