import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import Logout from "../pages/Authentication/Logout";
import AuthProtected from "./AuthProtected";
import Layout from "../Layout";
import NonAuthLayout from "../Layout/NonAuthLayout";

import ItemsList from "../pages/Master/Items/ItemsList";
import ItemUpsertPage from "../pages/Master/Items/ItemUpsertPage";

import OrdersList from "../pages/Order/OrdersList";
import OrderCreate from "../pages/Order/OrderCreate";
import OrderUpsertPage from "../pages/Order/OrderUpsertPage";

import UsersList from "../pages/User/UsersList";
import UserUpsertPage from "../pages/User/UserUpsertPage";

export default function RoutesIndex() {
  return (
    <Routes>
      <Route element={<NonAuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        element={
          <AuthProtected>
            <Layout />
          </AuthProtected>
        }
      >
        <Route path="/items" element={<ItemsList />} />
        <Route path="/items/new" element={<ItemUpsertPage />} />
        <Route path="/items/:id/edit" element={<ItemUpsertPage />} />

        <Route path="/orders" element={<OrdersList />} />
        <Route path="/orders/new" element={<OrderCreate />} />
        <Route path="/orders/:id/edit" element={<OrderUpsertPage />} />

        <Route path="/users" element={<UsersList />} />
        <Route path="/users/new" element={<UserUpsertPage />} />
        <Route path="/users/:id/edit" element={<UserUpsertPage />} />

        <Route path="/logout" element={<Logout />} />
      </Route>

      <Route path="/" element={<Navigate to="/items" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}