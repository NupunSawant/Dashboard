import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function NonAuthLayout() {
  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Outlet />
    </Container>
  );
}
