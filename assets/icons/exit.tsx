import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
    <Path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 4.001H5v14a2 2 0 0 0 2 2h8m1-5 3-3m0 0-3-3m3 3H9"
    />
  </Svg>
);
export default SvgComponent;
