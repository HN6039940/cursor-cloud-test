import type { FC } from "react";
import "./index.css";
import { Composition } from "remotion";
import { JS_ARRAY_METHODS, JsArrayMethods } from "./JsArrayMethods";

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="JsArrayMethods"
      component={JsArrayMethods}
      durationInFrames={JS_ARRAY_METHODS.durationInFrames}
      fps={JS_ARRAY_METHODS.fps}
      width={JS_ARRAY_METHODS.width}
      height={JS_ARRAY_METHODS.height}
    />
  );
};
