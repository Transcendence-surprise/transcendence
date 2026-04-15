import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Layout from "../Layout";
import { AuthProvider } from "../../hooks/useAuth";

describe("Layout", () => {
  it("renders header with title", async () => {
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
