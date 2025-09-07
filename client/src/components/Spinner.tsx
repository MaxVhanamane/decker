import React from "react";

type SpinnerSize = "small" | "medium" | "large" | "extraSmall";

interface SpinnerProps {
  size?: SpinnerSize;
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "medium", message }) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    small: "w-8 h-8", // 32px
    medium: "w-14 h-14", // 56px
    large: "w-20 h-20", // 80px
    extraSmall: "w-5 h-5",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative rounded-[10px] ${sizeClasses[size]}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`
              absolute left-1/2 top-[30%] w-[8%] h-[24%] 
              rounded-full bg-gray-500 opacity-0 shadow-sm 
              animate-spinner-bar
            `}
            style={{
              transform: `rotate(${i * 30}deg) translate(0, -130%)`,
              animationDelay: `${-1.2 + i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {message && (
        <p className="text-sm dark:text-gray-600 text-gray-400">{message}</p>
      )}
    </div>
  );
};

export default Spinner;
