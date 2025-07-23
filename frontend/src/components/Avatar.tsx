import React from "react";

export default function Avatar({
  name,
  size = 96,
  src,
}: {
  name?: string;
  size?: number;
  src?: string;
}) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: "black",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: size * 0.5,
    fontWeight: "bold",
    overflow: "hidden",
    position: "relative",
  };
  if (src) {
    return (
      <img
        src={src}
        alt="Avatar"
        className="w-full h-full object-cover rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  return <div style={style}>{name?.charAt(0)?.toUpperCase() || "U"}</div>;
}