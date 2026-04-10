import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { HyperVibeIntro } from "./Composition";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HyperVibeIntro"
        component={HyperVibeIntro}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
      />
      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
    </>
  );
};
