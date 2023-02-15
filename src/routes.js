import Assets from "./containers/Assets";
import Airdrop from "./containers/More/Airdrop";

const routes = [
  {
    path: "/assets",
    element: <Assets />,
  },
  {
    path: "/ibc",
    element: <Airdrop />,
  },
];

export default routes;
