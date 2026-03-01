interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "emerald" | "gray";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
};

const colorMap = {
  white: "text-white",
  emerald: "text-emerald-600",
  gray: "text-gray-400",
};

export default function Spinner({ size = "md", color = "white", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${colorMap[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function LoadingScreen({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <Spinner size="lg" color="emerald" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

export function ButtonSpinner({ label, spinnerColor = "white" }: { label: string; spinnerColor?: "white" | "emerald" | "gray" }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Spinner size="sm" color={spinnerColor} />
      <span>{label}</span>
    </span>
  );
}
