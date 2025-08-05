import React from "react";
import { AvatarProps } from "./Type/AvatarProps";

export default function Avatar({
  name,
  size = 96,
  imgUrl,
}: AvatarProps) {
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
  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt="Avatar"
        className="w-full h-full object-cover rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  return <div style={style}>{name?.charAt(0)?.toUpperCase() || "U"}</div>;
}