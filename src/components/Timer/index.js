import { useTimer } from "react-timer-hook";

const Timer = ({ expiryTimestamp }) => {
  const { seconds, minutes, hours } = useTimer({ expiryTimestamp });

  return (
    <div>
      <span>{hours}</span> H <span>{minutes}</span> m <span>{seconds}</span> s
    </div>
  );
};

export default Timer;
