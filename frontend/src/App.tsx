import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./slices/store";
import { hydrateAuth } from "./slices/auth/reducer";
import { getToken, getAuthUser } from "./helpers/auth_helper";
import RoutesIndex from "./Routes/Index";
import { setAxiosDispatch } from "./api/axiosDispatch";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Inject dispatch into axios interceptor
    setAxiosDispatch(dispatch);

    // Only hydrate from local storage
    const token = getToken();
    const user = getAuthUser();

    dispatch(
      hydrateAuth({
        token: token || null,
        user: user || null,
      })
    );

    setBooting(false);
  }, [dispatch]);

  if (booting) return null;

  return <RoutesIndex />;
}