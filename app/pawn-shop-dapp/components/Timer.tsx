import { useEffect, useState } from "react";

export const Timer = ({ finishTime }: { finishTime: number }) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      const remainingTime = finishTime - new Date().getTime();
      setRemainingTime(remainingTime < 0 ? 0 : Math.floor(remainingTime / 1000));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <>
      {remainingTime ?
        <div>
          {Math.floor(remainingTime / 3600 / 24)}d {" "}
          {Math.floor((remainingTime % (3600 * 24)) / 3600)}h {" "}
          {Math.floor((remainingTime % 3600) / 60)}m {" "}
          {remainingTime % 60}s {" "}
        </div> :
        <div>Finished</div>
      }
    </>
  );
}