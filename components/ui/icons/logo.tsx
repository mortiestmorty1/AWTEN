export default function Logo({ className = '', ...props }) {
  return (
    <div
      className={`text-2xl font-bold text-awten-600 ${className}`}
      {...props}
    >
      AWTEN
    </div>
  );
}
