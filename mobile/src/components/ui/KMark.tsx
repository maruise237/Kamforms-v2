import React from "react";
import Svg, { Rect, Path, G } from "react-native-svg";

/**
 * Logo officiel Kamforms — fourni par la marque.
 * Utilisé partout dans l'app (splash, auth, notifications, barre de chat).
 * Ne jamais remplacer par un PNG ou une autre icône.
 */
interface Props {
  size?: number;
  color?: string;
}

export default function KMark({ size = 40, color }: Props) {
  const fill = color ?? "#F7F7F5"; // bone par défaut
  return (
    <Svg width={size} height={size} viewBox="0 0 510 510" fill={fill}>
      <Rect x="28" y="33" width="130" height="447" rx="22" />
      <Path d="M 240,48 L 390,48 Q 415,48 411,73 L 395,160 Q 390,185 365,185 L 215,185 Q 190,185 195,160 L 211,73 Q 215,48 240,48 Z" />
      <G transform="translate(302, 342) rotate(28)">
        <Rect x="-140" y="-82" width="280" height="164" rx="80" />
      </G>
    </Svg>
  );
}
