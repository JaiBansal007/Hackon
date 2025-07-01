import React from "react";
import { Play, Users, MessageCircle, BarChart3, Sparkles } from "lucide-react";

export function BeautifulLoader({ 
  title = "FireTV", 
  subtitle = "Loading your experience...", 
  showFeatures = false,
  size = "large" 
}) {
  const features = [
    { icon: Users, text: "Preparing your room...", delay: "0s", color: "text-blue-400" },
    { icon: MessageCircle, text: "Loading chat system...", delay: "0.5s", color: "text-green-400" },
    { icon: BarChart3, text: "Setting up polls...", delay: "1s", color: "text-purple-400" },
    { icon: Sparkles, text: "Activating AI assistant...", delay: "1.5s", color: "text-emerald-400" }
  ];

  const logoSize = size === "large" ? "w-20 h-20" : "w-16 h-16";
  const iconSize = size === "large" ? "w-10 h-10" : "w-8 h-8";
  const titleSize = size === "large" ? "text-4xl" : "text-3xl";
  const spinnerSize = size === "large" ? "w-24 h-24" : "w-16 h-16";
  const innerSpinnerSize = size === "large" ? "inset-2 w-16 h-16" : "inset-2 w-8 h-8";

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-teal-600/20 animate-pulse" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Central loading content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Logo section */}
        <div className="mb-8 text-center">
          <img 
            src="/logo.jpg" 
            alt="FireTV" 
            className={`${logoSize} rounded-3xl shadow-2xl mb-6 mx-auto animate-pulse object-cover`}
          />
          <h1 className={`${titleSize} font-black text-white mb-2 tracking-tight`}>
            {title.includes("Fire") ? (
              <>
                Fire<span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text">TV</span>
              </>
            ) : (
              title
            )}
          </h1>
          <p className="text-white/60 text-lg font-light">{subtitle}</p>
        </div>

        {/* Advanced loading spinner */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className={`${spinnerSize} border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin`}></div>
          
          {/* Inner rotating ring - counter rotation */}
          <div 
            className={`absolute ${innerSpinnerSize} border-4 border-cyan-500/30 border-b-cyan-500 rounded-full animate-spin`} 
            style={{animationDirection: 'reverse', animationDuration: '1.5s'}}
          ></div>
          
          {/* Center dot */}
          <div className="absolute inset-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        </div>

        {/* Loading features preview */}
        {showFeatures && (
          <div className="max-w-md w-full mb-8">
            <div className="space-y-4">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-white/70 animate-fade-in"
                  style={{ animationDelay: item.delay }}
                >
                  <div className={`w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {showFeatures && (
          <div className="w-full max-w-xs">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-xs text-white/50 text-center mt-2 font-medium">Setting up your experience...</p>
          </div>
        )}

        {/* Bottom floating elements */}
        {!showFeatures && (
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
