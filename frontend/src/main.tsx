import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import App from "./App";
import { store } from "./slices/store";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "remixicon/fonts/remixicon.css"; //   Add this

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<QueryClientProvider client={queryClient}>
					<App />
					<ToastContainer position='top-right' autoClose={2500} />
				</QueryClientProvider>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>,
);
