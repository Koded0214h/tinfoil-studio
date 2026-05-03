import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { IntroVideo } from "@/components/intro-video";
import { CollisionFlash } from "@/components/collision-flash";

export default function IntroPage() {
  const navigate = useNavigate();
  const [ready, setReady] = React.useState(false);
  const [colliding, setColliding] = React.useState(false);

  const onTap = React.useCallback(() => {
    if (!ready || colliding) return;
    setColliding(true);
  }, [ready, colliding]);

  // Navigate at the white peak so the home page paints behind the flash and
  // the cut feels seamless, not abrupt.
  const onPeak = React.useCallback(() => {
    navigate("/home");
  }, [navigate]);

  // Once the overlay finishes fading, unmount it.
  const onComplete = React.useCallback(() => {
    setColliding(false);
  }, []);

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-black">
      <IntroVideo
        canTap={ready && !colliding}
        onReady={() => setReady(true)}
        onTap={onTap}
      />

      <AnimatePresence>
        {colliding && (
          <CollisionFlash onPeak={onPeak} onComplete={onComplete} />
        )}
      </AnimatePresence>
    </main>
  );
}
