import type { FC } from "react";

type Props = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const Loading: FC<Props> = ({ size = "xl", className = "" }) => {
  return (
    <div className={`flex justify-center items-center mt-10 ${className}`}>
      <span
        className={`loading loading-infinity loading-${size}`}
        aria-hidden="true"
      />
    </div>
  );
};

export default Loading;