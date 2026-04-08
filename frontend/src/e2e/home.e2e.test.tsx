import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthProvider } from "../hooks/useAuth";

describe("Home e2e (smoke)", () => {
  it("renders main layout", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/MAZE IS LAVA/i).length).toBeGreaterThan(0);
  });
});
