import React from "react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center text-white animate-fadeIn z-[9999] overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full animate-pulse delay-1000"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-ping-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full animate-ping-slow delay-1500"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-shimmer"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-shimmer delay-500"></div>
      </div>
      
      {/* Main content container with glass effect */}
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl shadow-blue-900/30 animate-fadeInUp">
        
        {/* Logo with shine effect */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 rounded-full blur-xl animate-pulse-slow"></div>
          <img
            src="https://snopitechstore.online/public-images/Mylogo.png"
            alt="SnopitechBank Logo"
            className="relative h-16 mx-auto drop-shadow-lg"
          />
        </div>

        {/* Bank name with gradient */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent animate-gradient">
            SnopitechBank
          </span>
        </h1>
        
        {/* Tagline */}
        <p className="text-blue-100 text-center text-sm md:text-base tracking-wide mb-6">
          Secure • Simple • Smart
        </p>
        
        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-200 font-medium">
            🔒 Secure Connection Established
          </span>
        </div>

        {/* Modern loader */}
        <div className="relative">
          <div className="w-48 h-2 bg-blue-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-full animate-loading-bar"></div>
          </div>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>

        {/* Loading text with typing effect */}
        <p className="text-center text-blue-100 text-sm mt-6">
          <span className="inline-block animate-typing overflow-hidden whitespace-nowrap border-r-2 border-blue-400 pr-1">
            Initializing your secure banking experience...
          </span>
        </p>
        
        {/* Progress percentage */}
        <div className="text-center mt-4">
          <span className="text-xs text-blue-200 font-mono">
            Loading: <span className="font-bold">85%</span>
          </span>
        </div>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-blue-300/70">
          Member FDIC • Your security is our priority
        </p>
      </div>

      {/* Add these animations to your global CSS/tailwind config */}
      <style jsx="true">{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        .animate-typing {
          animation: typing 3.5s steps(40, end);
        }
      `}</style>
    </div>
  );
}