import { Heart } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
// import { motion, AnimatePresence } from "framer-motion"; // for later improvement

interface HeartButtonProps{
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}


export function HeartButton(props: HeartButtonProps) {
  return (
    <div  >
      <Heart
        size={props.size}
        onClick={props.onToggle}
        className={clsx(
          "cursor-pointer transition-colors select-none inline-flex",
          props.isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
        )}
      />
    </div>
  );
}