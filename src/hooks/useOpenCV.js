import { useEffect, useState } from "react";

export function useOpenCV() {
  const [cvReady, setCvReady] = useState(false);

  useEffect(() => {
    const check = setInterval(() => {
      if (window.cv && window.cv.Mat) {
        clearInterval(check);
        setCvReady(true);
      }
    }, 100);
  }, []);

  return cvReady;
}
